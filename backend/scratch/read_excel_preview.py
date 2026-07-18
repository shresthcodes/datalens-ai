import pandas as pd

file_path = r"C:\Users\Shresth Pandey\Downloads\warehouse_stock_test.xlsx"

try:
    df = pd.read_excel(file_path)
    print("==================================================")
    print("      EXCEL DATA PREVIEW & PROFILE")
    print("==================================================")
    print(f"Shape: {df.shape[0]} rows, {df.shape[1]} columns")
    print("\nColumns and Data Types:")
    for col in df.columns:
        null_cnt = df[col].isnull().sum()
        print(f"- {col} ({df[col].dtype}): {null_cnt} missing values")
        
    print("\nFirst 10 rows:")
    print(df.head(10).to_string())
    print("==================================================")
except Exception as e:
    print(f"Error reading file: {str(e)}")
