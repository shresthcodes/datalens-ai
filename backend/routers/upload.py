import os
import re
from fastapi import APIRouter, File, UploadFile, HTTPException
from utils.validators import validate_file_extension, validate_file_size
from utils.session import generate_session_id, get_upload_path
from services.file_service import read_file_to_df
from services.cleaning_service import clean_data
from services.profiling_service import profile_dataset
from services.sqlite_service import save_df_to_sqlite, register_session
from services.chroma_service import index_dataset
from models.upload_models import UploadResponse, ColumnInfo, CleaningReport

router = APIRouter(prefix="/api/upload", tags=["upload"])

@router.post("", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Handles CSV and Excel file uploads.
    Validates file type and size, auto-cleans content, indexes in ChromaDB,
    stores in SQLite database, and returns preview and profiling results.
    """
    # 1. Validate file extension
    if not validate_file_extension(file.filename):
        raise HTTPException(
            status_code=422,
            detail="Only .csv and .xlsx files are supported."
        )
        
    # 2. Validate file size
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read uploaded file: {str(e)}"
        )
        
    if not validate_file_size(len(contents)):
        raise HTTPException(
            status_code=413,
            detail="File size exceeds 10MB limit."
        )
        
    # 3. Generate session and save raw upload file temporarily
    session_id = generate_session_id()
    temp_path = get_upload_path(session_id, file.filename)
    
    try:
        with open(temp_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save temp file on backend: {str(e)}"
        )
        
    # 4. Parse file to DataFrame
    try:
        df = read_file_to_df(temp_path)
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse file: {str(e)}. Ensure the layout is a valid table format."
        )
        
    # 5. Row and column validation
    if df.empty or len(df.columns) == 0:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(
            status_code=400,
            detail="Uploaded file contains no data rows or columns."
        )
        
    # 6. Run auto data cleaning and profiling pipeline
    try:
        cleaned_df, cleaning_report = clean_data(df)
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(
            status_code=500,
            detail=f"Auto data cleaning failed: {str(e)}"
        )
        
    # 7. Create SQL-safe table name
    base_name = os.path.splitext(file.filename)[0].lower()
    table_name = re.sub(r"[^a-z0-9_]", "", base_name.replace(" ", "_").replace("-", "_"))
    if not table_name or table_name[0].isdigit():
        table_name = f"table_{table_name}"
        
    # 8. Save cleaned DataFrame to session-specific SQLite DB
    try:
        save_df_to_sqlite(cleaned_df, session_id, table_name)
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save dataset in SQLite: {str(e)}"
        )
        
    # 9. Index rows in ChromaDB for search Q&A (RAG)
    try:
        index_dataset(session_id, cleaned_df)
    except Exception as e:
        # Since RAG is key but we don't want to crash if vector search fails to embed, we log it.
        # But for reliability, we raise warning or exception. Here we raise exception to ensure healthy setups.
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to index dataset into vector DB (ChromaDB/Gemini): {str(e)}"
        )
        
    # 10. Register session in sessions.db
    try:
        register_session(
            session_id=session_id,
            filename=file.filename,
            table_name=table_name,
            row_count=len(cleaned_df),
            column_count=len(cleaned_df.columns),
            date_columns=cleaning_report.get("date_columns_detected", [])
        )
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to register session metadata: {str(e)}"
        )
        
    # 11. Profile the clean dataset
    profile_info = profile_dataset(cleaned_df)
    
    # 12. Format Preview (limit to first 10 rows)
    preview_data = cleaned_df.head(10).to_dict(orient="records")
    # Clean float NaNs/Infs to JSON-safe None if any slipped through
    for row in preview_data:
        for k, v in row.items():
            if isinstance(v, float) and (v != v or v == float("inf") or v == float("-inf")):
                row[k] = None
                
    # Build typed column info objects
    columns_list = [
        ColumnInfo(
            name=col["name"],
            dtype=col["dtype"],
            null_count=col["null_count"],
            unique_count=col["unique_count"]
        ) for col in profile_info
    ]
    
    # Build clean report model
    report_model = CleaningReport(
        original_rows=cleaning_report["original_rows"],
        cleaned_rows=cleaning_report["cleaned_rows"],
        duplicates_removed=cleaning_report["duplicates_removed"],
        nulls_filled=cleaning_report["nulls_filled"],
        columns_dropped=cleaning_report["columns_dropped"],
        date_columns_detected=cleaning_report["date_columns_detected"],
        column_types=cleaning_report["column_types"]
    )
    
    # Clean up raw temp file (no longer needed once in SQLite)
    try:
        if os.path.exists(temp_path):
            os.remove(temp_path)
    except Exception:
        pass
        
    return UploadResponse(
        session_id=session_id,
        filename=file.filename,
        table_name=table_name,
        row_count=len(cleaned_df),
        column_count=len(cleaned_df.columns),
        columns=columns_list,
        preview=preview_data,
        cleaning_report=report_model
    )
