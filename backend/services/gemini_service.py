import os
import re
import time
import pandas as pd
import google.generativeai as genai

def get_model():
    """Configures and returns the gemini model."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise ValueError("GEMINI_API_KEY is not configured. Please set the environment variable in backend/.env.")
        
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-3.5-flash")

def generate_sql(schema_info: str, rag_context: str, user_question: str, table_name: str) -> str:
    """
    Asks Gemini to generate a valid SQLite SELECT query based on
    the table schema, representative RAG context rows, and user question.
    Includes rate limit retry logic.
    """
    model = get_model()
    
    prompt = f"""You are an expert SQL analyst. You have access to a SQLite database.
The database has a single table with the following schema:
Table name: {table_name}
Column definitions (column_name: datatype):
{schema_info}

Here is a sample of actual rows retrieved from this table for context (values separated by '|'):
{rag_context}

User question: {user_question}

Generate a single SQLite SELECT statement to answer the question.
Rules:
1. ONLY return SELECT statements. Do NOT write DROP, DELETE, UPDATE, INSERT, CREATE, or ALTER queries.
2. Use valid SQLite syntax.
3. If aggregate calculation is requested (sum, average, count, max, min), use the corresponding SQL functions (SUM, AVG, COUNT, MAX, MIN) and GROUP BY columns if necessary.
4. Limit the query results to a maximum of 100 rows (e.g. LIMIT 100).
5. Return ONLY the raw SQL query. Do not wrap it in explanation, do not include markdown code block syntax (like ```sql), and do not add trailing markdown. Just start the output with SELECT.
"""
    
    # Retry logic for 429 rate limit
    response_text = ""
    max_retries = 5
    retry_delay = 2
    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt)
            response_text = response.text.strip()
            break
        except Exception as e:
            if "429" in str(e) and attempt < max_retries - 1:
                print(f"Rate limit (429) hit during SQL generation. Retrying in {retry_delay}s... (Attempt {attempt+1}/{max_retries})")
                time.sleep(retry_delay)
                retry_delay *= 2
            else:
                raise e
                
    # Strip markdown block formatting if present
    sql_match = re.search(r"```sql\s*(.*?)\s*```", response_text, re.IGNORECASE | re.DOTALL)
    if sql_match:
        sql_query = sql_match.group(1)
    else:
        sql_match_generic = re.search(r"```\s*(.*?)\s*```", response_text, re.IGNORECASE | re.DOTALL)
        if sql_match_generic:
            sql_query = sql_match_generic.group(1)
        else:
            sql_query = response_text
            
    sql_query = sql_query.strip().replace(";", "") # Strip semi-colon to allow wrapper paging limit control if needed
    return sql_query

def summarize_answer(question: str, query_results_df: pd.DataFrame) -> str:
    """
    Sends the SQL execution output to Gemini and asks it to
    generate a friendly, concise 1-2 sentence business-oriented explanation.
    Includes rate limit retry logic.
    """
    model = get_model()
    
    # Format the query results table
    if query_results_df.empty:
        results_str = "No records found."
    else:
        # Convert first 15 rows to string for context size control
        results_str = query_results_df.head(15).to_string(index=False)
        
    prompt = f"""You are a professional business intelligence advisor.
The user asked the following question about their dataset:
"{question}"

A SQL query was executed to fetch the answer. Here are the resulting data records:
{results_str}

Explain what these results show in 1 to 2 clear, helpful sentences. 
Guidelines:
- Explain in simple business terms.
- Use actual numbers/figures from the data in your summary.
- Keep it concise and professional.
- Do not mention technical terms like "SQL", "query", "database", "table", or "dataframe".
"""
    
    # Retry logic for 429 rate limit
    response_text = ""
    max_retries = 5
    retry_delay = 2
    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt)
            response_text = response.text.strip()
            break
        except Exception as e:
            if "429" in str(e) and attempt < max_retries - 1:
                print(f"Rate limit (429) hit during answer summarization. Retrying in {retry_delay}s... (Attempt {attempt+1}/{max_retries})")
                time.sleep(retry_delay)
                retry_delay *= 2
            else:
                raise e
                
    return response_text
