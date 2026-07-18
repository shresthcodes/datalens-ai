import sqlite3
import pandas as pd
from fastapi import APIRouter, HTTPException
from utils.validators import validate_sql_query
from utils.session import get_db_path, session_exists
from services.sqlite_service import get_session, execute_query
from services.chroma_service import query_context
from services.gemini_service import generate_sql, summarize_answer
from models.chat_models import ChatRequest, ChatResponse, ResultTable, ChartData

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("", response_model=ChatResponse)
async def process_chat(request: ChatRequest):
    """
    Accepts a natural language question about the uploaded dataset.
    Performs RAG to fetch context rows, generates SQL query via Gemini,
    validates for security, executes on SQLite, summarizes, and extracts chart options.
    """
    session_id = request.session_id
    question = request.question.strip()
    
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
        
    # 1. Verify session exists
    session_info = get_session(session_id)
    if not session_info:
        raise HTTPException(
            status_code=404,
            detail="Session not found. Please upload a file first."
        )
        
    table_name = session_info["table_name"]
    db_path = get_db_path(session_id)
    
    # 2. Extract SQLite schema info via PRAGMA
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns_info = cursor.fetchall()
        conn.close()
        
        schema_lines = []
        for col in columns_info:
            col_name = col[1]
            col_type = col[2]
            schema_lines.append(f"{col_name}: {col_type}")
        schema_str = "\n".join(schema_lines)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch table schema from database: {str(e)}"
        )
        
    # 3. Retrieve row context via ChromaDB vector search (RAG)
    try:
        context_rows = query_context(session_id, question, n_results=5)
        rag_context = "\n".join(context_rows) if context_rows else "No matching rows found."
    except Exception as e:
        # Fallback to no context if ChromaDB query fails (but log/warning)
        rag_context = "No matching rows found."
        
    # 4. Generate SQL query using Gemini
    try:
        sql_query = generate_sql(
            schema_info=schema_str,
            rag_context=rag_context,
            user_question=question,
            table_name=table_name
        )
    except ValueError as ve:
        raise HTTPException(status_code=503, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini failed to generate SQL query: {str(e)}"
        )
        
    # 5. Security check on generated SQL
    is_valid, safety_error = validate_sql_query(sql_query)
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail=f"Generated query was blocked: {safety_error}"
        )
        
    # 6. Execute SQL query on SQLite
    try:
        result_df = execute_query(session_id, sql_query)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"SQL syntax or execution error: {str(e)}. Generated Query: {sql_query}"
        )
        
    # 7. Summarize query results using Gemini
    try:
        answer = summarize_answer(question, result_df)
    except Exception as e:
        answer = "I executed the SQL query successfully but failed to summarize the output text."
        
    # 8. Check if result dataset is suitable for charting
    # Renders mini chart if results have exactly 2 columns and 1-20 rows
    chart_data = None
    if len(result_df.columns) == 2 and 1 < len(result_df) <= 20:
        cols = list(result_df.columns)
        
        # Detect numeric vs categorical columns to decide x/y axes
        num_cols = []
        char_cols = []
        for col in cols:
            if pd.api.types.is_numeric_dtype(result_df[col]):
                num_cols.append(col)
            else:
                char_cols.append(col)
                
        # Determine labels and values
        if len(num_cols) == 1 and len(char_cols) == 1:
            x_axis = char_cols[0]
            y_axis = num_cols[0]
        else:
            # Fallback to order in dataframe
            x_axis = cols[0]
            y_axis = cols[1]
            
        chart_type = "bar"
        # If x_axis represents dates, use line chart
        if any(ind in x_axis.lower() for ind in ["date", "time", "month", "year", "timestamp"]):
            chart_type = "line"
            
        # Structure records
        raw_records = result_df.to_dict(orient="records")
        for record in raw_records:
            for k, v in record.items():
                if isinstance(v, float) and (v != v or v == float("inf") or v == float("-inf")):
                    record[k] = None
                    
        chart_data = ChartData(
            type=chart_type,
            x_axis=x_axis,
            y_axis=y_axis,
            data=raw_records
        )
        
    # 9. Format table results for frontend
    result_table = None
    if not result_df.empty:
        columns_list = list(result_df.columns)
        rows_list = result_df.values.tolist()
        
        # Clean infinite/NaN float values for JSON serializability
        cleaned_rows = []
        for row in rows_list:
            cleaned_row = []
            for val in row:
                if isinstance(val, float) and (val != val or val == float("inf") or val == float("-inf")):
                    cleaned_row.append(None)
                else:
                    cleaned_row.append(val)
            cleaned_rows.append(cleaned_row)
            
        result_table = ResultTable(
            columns=columns_list,
            rows=cleaned_rows
        )
        
    return ChatResponse(
        question=question,
        answer=answer,
        sql_query=sql_query,
        result_table=result_table,
        chart_data=chart_data,
        context_used=len(context_rows) if context_rows else 0
    )
