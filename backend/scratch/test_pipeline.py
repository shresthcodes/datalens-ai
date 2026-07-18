import os
import sys
import pandas as pd
from dotenv import load_dotenv

# Add backend directory to path so imports work
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.session import get_db_path
from services.file_service import read_file_to_df
from services.cleaning_service import clean_data
from services.profiling_service import profile_dataset
from services.sqlite_service import save_df_to_sqlite, execute_query, register_session, get_session
from utils.validators import validate_sql_query

def run_test_pipeline():
    load_dotenv()
    
    print("==================================================")
    print("      DATALENS AI AUTOMATED TEST PIPELINE")
    print("==================================================")
    
    # 1. Check Mock Data exists
    csv_path = "d:/project/retail_sales.csv"
    if not os.path.exists(csv_path):
        print("[FAIL] Mock dataset retail_sales.csv not found at d:/project/")
        return False
    print(f"[PASS] Found mock data CSV at {csv_path}")
    
    # 2. Test File Service
    try:
        raw_df = read_file_to_df(csv_path)
        print(f"[PASS] File parser read dataset successfully. Shape: {raw_df.shape}")
    except Exception as e:
        print(f"[FAIL] File parser failed: {str(e)}")
        return False
        
    # 3. Test Cleaning Pipeline
    try:
        cleaned_df, report = clean_data(raw_df)
        print(f"[PASS] Cleaning service processed dataset.")
        print(f"       - Original Rows: {report['original_rows']}")
        print(f"       - Cleaned Rows: {report['cleaned_rows']}")
        print(f"       - Duplicates Removed: {report['duplicates_removed']}")
        print(f"       - Date Columns: {report['date_columns_detected']}")
    except Exception as e:
        print(f"[FAIL] Data cleaning service failed: {str(e)}")
        return False
        
    # 4. Test Profiling Service
    try:
        profile = profile_dataset(cleaned_df)
        print(f"[PASS] Profiler scanned dataset. Found {len(profile)} column metric blocks.")
    except Exception as e:
        print(f"[FAIL] Profiler service failed: {str(e)}")
        return False
        
    # 5. Test SQLite Service and Session Registry
    session_id = "test_session_12345"
    table_name = "retail_sales"
    try:
        # Save table
        db_path = save_df_to_sqlite(cleaned_df, session_id, table_name)
        print(f"[PASS] Saved cleaned DataFrame to SQLite at {db_path}")
        
        # Register session
        register_session(session_id, "retail_sales.csv", table_name, len(cleaned_df), len(cleaned_df.columns), ["order_date"])
        print("[PASS] Session metadata registered in SQLite sessions.db registry")
        
        # Verify session retrieval
        sess = get_session(session_id)
        if sess and sess["table_name"] == table_name:
            print("[PASS] Successfully fetched session metadata from registry")
        else:
            print("[FAIL] Failed to retrieve matching session metadata")
            return False
            
        # Run test aggregate query
        query = f"SELECT region, ROUND(SUM(revenue), 2) as total_sales, COUNT(*) as txn_count FROM {table_name} GROUP BY region ORDER BY total_sales DESC"
        result_df = execute_query(session_id, query)
        print(f"[PASS] Executed custom aggregation query successfully. Results shape: {result_df.shape}")
        print("------- Test Query Results -------")
        print(result_df.to_string(index=False))
        print("----------------------------------")
    except Exception as e:
        print(f"[FAIL] SQLite database test failed: {str(e)}")
        return False
        
    # 6. Check SQL query validator
    print("Testing SQL Safety checks...")
    valid_sql = f"SELECT product_name, profit FROM {table_name} WHERE profit > 100 LIMIT 10"
    invalid_sql_1 = f"DROP TABLE {table_name}"
    invalid_sql_2 = f"SELECT * FROM {table_name}; DELETE FROM {table_name}"
    
    val1, err1 = validate_sql_query(valid_sql)
    val2, err2 = validate_sql_query(invalid_sql_1)
    val3, err3 = validate_sql_query(invalid_sql_2)
    
    if val1 and not val2 and not val3:
        print("[PASS] SQL injection checks succeeded (blocked DROP and stacked queries)")
    else:
        print(f"[FAIL] SQL validation failed. val1: {val1}, val2: {val2} ({err2}), val3: {val3} ({err3})")
        return False
        
    # 7. Test AI Integration (ChromaDB + Gemini) if key is set
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key or gemini_key == "your_gemini_api_key_here":
        print("\n[WARNING] GEMINI_API_KEY is not configured in backend/.env.")
        print("          Skipping ChromaDB indexing and Gemini AI synthesis tests.")
        print("          To verify Gemini, add your key to backend/.env and re-run this script.")
    else:
        try:
            from services.chroma_service import index_dataset, query_context
            from services.gemini_service import generate_sql, summarize_answer
            
            print("\nTesting ChromaDB indexing...")
            index_dataset(session_id, cleaned_df.head(20)) # index first 20 for quick test
            print("[PASS] ChromaDB indexed rows successfully")
            
            print("Testing RAG search query context...")
            context = query_context(session_id, "What is the sales for office chairs?", n_results=3)
            print(f"[PASS] ChromaDB returned RAG context rows: {len(context)} rows found")
            
            print("Testing Gemini SQL synthesis...")
            schema_str = "order_date: TEXT\nproduct_category: TEXT\nproduct_name: TEXT\nrevenue: REAL\nquantity: INTEGER\nregion: TEXT\ndiscount: REAL\nprofit: REAL"
            rag_context_str = "\n".join(context)
            sql_out = generate_sql(schema_str, rag_context_str, "What is the total profit of apparel in the East region?", table_name)
            print(f"[PASS] Gemini SQL Generated: {sql_out}")
            
            # Execute Gemini query
            gemini_result_df = execute_query(session_id, sql_out)
            print(f"[PASS] Executed generated query. Results count: {len(gemini_result_df)}")
            
            print("Testing Gemini Answer Summarization...")
            summary = summarize_answer("What is the total profit of apparel in the East region?", gemini_result_df)
            print(f"[PASS] Gemini Answer Summary: {summary}")
            
        except Exception as e:
            print(f"[FAIL] Gemini AI / Vector search test failed: {str(e)}")
            return False
            
    # Clean up test database file
    test_db = get_db_path(session_id)
    try:
        if os.path.exists(test_db):
            os.remove(test_db)
            print("[PASS] Test database file cleaned up successfully.")
    except Exception:
        pass
        
    print("\n==================================================")
    print("      ALL LOCAL SERVICE PIPELINE TESTS PASSED!")
    print("==================================================")
    return True

if __name__ == "__main__":
    success = run_test_pipeline()
    sys.exit(0 if success else 1)
