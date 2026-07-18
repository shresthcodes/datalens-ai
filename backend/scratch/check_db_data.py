import sys
import os
sys.path.append(os.path.abspath("backend"))

import sqlite3
import pandas as pd
from utils.session import DATABASES_DIR

sessions_db = os.path.join(DATABASES_DIR, "sessions.db")

print("==================================================")
print("      SESSIONS IN SYSTEM")
print("==================================================")
if os.path.exists(sessions_db):
    conn = sqlite3.connect(sessions_db)
    df_sess = pd.read_sql_query("SELECT * FROM sessions", conn)
    print(df_sess)
    conn.close()
    
    if not df_sess.empty:
        # Get the latest session
        latest_sess = df_sess.iloc[-1]
        session_id = latest_sess["session_id"]
        table_name = latest_sess["table_name"]
        db_path = latest_sess["db_path"]
        print(f"\nLatest Session: {session_id}, Table: {table_name}, DB: {db_path}")
        
        if os.path.exists(db_path):
            conn = sqlite3.connect(db_path)
            # Print table schema
            cursor = conn.cursor()
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            print("\nTable Schema (PRAGMA):")
            for col in columns:
                print(col)
                
            # Print first 5 rows
            df_data = pd.read_sql_query(f"SELECT * FROM {table_name} LIMIT 5", conn)
            print("\nFirst 5 rows in Database:")
            print(df_data.to_string())
            conn.close()
else:
    print("sessions.db not found!")
print("==================================================")
