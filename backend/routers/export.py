import datetime
from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
import io
from services.sqlite_service import get_session, execute_query

router = APIRouter(prefix="/api/export", tags=["export"])

@router.get("/{session_id}")
async def export_data(
    session_id: str,
    format: str = Query("csv", regex="^(csv|json)$")
):
    """
    Exports the cleaned dataset for a session as a downloadable CSV or JSON file.
    """
    # 1. Fetch session info
    session_info = get_session(session_id)
    if not session_info:
        raise HTTPException(
            status_code=404,
            detail="Session not found."
        )
        
    table_name = session_info["table_name"]
    
    # 2. Retrieve dataset from SQLite
    try:
        df = execute_query(session_id, f"SELECT * FROM {table_name}")
        # Drop the auto-generated SQLite index column if it was saved
        if "index" in df.columns:
            df = df.drop(columns=["index"])
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load dataset for export: {str(e)}"
        )
        
    # 3. Stream data response
    timestamp = datetime.datetime.now().strftime("%Y%m%d")
    
    if format == "csv":
        # Write CSV to a string buffer
        stream = io.StringIO()
        df.to_csv(stream, index=False)
        response_content = stream.getvalue()
        
        filename = f"datalens_export_{timestamp}.csv"
        return Response(
            content=response_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    else:
        # JSON format export
        response_content = df.to_json(orient="records")
        filename = f"datalens_export_{timestamp}.json"
        return Response(
            content=response_content,
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
