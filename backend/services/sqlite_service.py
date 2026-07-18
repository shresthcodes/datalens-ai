import sqlite3
import os
import json
import pandas as pd
from datetime import datetime
from utils.session import get_db_path, DATABASES_DIR

SESSIONS_DB_PATH = os.path.join(DATABASES_DIR, "sessions.db")

def init_sessions_db():
    """Initializes the main sessions registry database and table."""
    conn = sqlite3.connect(SESSIONS_DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_id      TEXT PRIMARY KEY,
            filename        TEXT NOT NULL,
            table_name      TEXT NOT NULL,
            created_at      TEXT NOT NULL,
            row_count       INTEGER,
            column_count    INTEGER,
            db_path         TEXT NOT NULL,
            date_columns    TEXT
        )
    """)
    conn.commit()
    
    # Run automatic database migration to add column if it was created in an older step
    try:
        cursor.execute("ALTER TABLE sessions ADD COLUMN date_columns TEXT")
        conn.commit()
    except sqlite3.OperationalError:
        # Column already exists, safe to ignore
        pass
        
    conn.close()

def register_session(session_id: str, filename: str, table_name: str, row_count: int, column_count: int, date_columns: list[str]):
    """Registers a new user upload session in the sessions database with detected date columns."""
    init_sessions_db()
    conn = sqlite3.connect(SESSIONS_DB_PATH)
    cursor = conn.cursor()
    created_at = datetime.utcnow().isoformat()
    db_path = get_db_path(session_id)
    
    # Serialize date columns list as JSON string
    date_cols_str = json.dumps(date_columns)
    
    cursor.execute("""
        INSERT OR REPLACE INTO sessions (session_id, filename, table_name, created_at, row_count, column_count, db_path, date_columns)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (session_id, filename, table_name, created_at, row_count, column_count, db_path, date_cols_str))
    
    conn.commit()
    conn.close()

def get_session(session_id: str) -> dict | None:
    """Retrieves session metadata from the main session registry, parsing serialized date columns."""
    init_sessions_db()
    conn = sqlite3.connect(SESSIONS_DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM sessions WHERE session_id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        sess_dict = dict(row)
        # Parse date_columns JSON string back to list
        if "date_columns" in sess_dict and sess_dict["date_columns"]:
            try:
                sess_dict["date_columns"] = json.loads(sess_dict["date_columns"])
            except Exception:
                sess_dict["date_columns"] = []
        else:
            sess_dict["date_columns"] = []
        return sess_dict
        
    return None

def save_df_to_sqlite(df: pd.DataFrame, session_id: str, table_name: str) -> str:
    """
    Saves a cleaned DataFrame into a session-specific SQLite database table.
    Returns the path to the database file.
    """
    db_path = get_db_path(session_id)
    
    # Save the dataframe using pandas to_sql. We include the index.
    conn = sqlite3.connect(db_path)
    df.to_sql(table_name, conn, if_exists="replace", index=True, index_label="index")
    conn.close()
    
    return db_path

def execute_query(session_id: str, query: str) -> pd.DataFrame:
    """
    Runs a SELECT query on the session's database and returns a DataFrame.
    """
    db_path = get_db_path(session_id)
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"Database for session {session_id} does not exist.")
        
    conn = sqlite3.connect(db_path)
    try:
        df = pd.read_sql_query(query, conn)
        return df
    finally:
        conn.close()
