import pandas as pd

def profile_dataset(df: pd.DataFrame) -> list[dict]:
    """
    Analyzes DataFrame columns to extract profiling info:
    - name: Normalized column name
    - dtype: Data type of the column
    - null_count: Number of null or missing values
    - unique_count: Number of unique values
    """
    profile_info = []
    
    for col in df.columns:
        # Get count of nulls in this column
        null_count = int(df[col].isnull().sum())
        
        # Get unique count
        try:
            unique_count = int(df[col].nunique())
        except Exception:
            unique_count = 0
            
        dtype_str = str(df[col].dtype)
        
        profile_info.append({
            "name": col,
            "dtype": dtype_str,
            "null_count": null_count,
            "unique_count": unique_count
        })
        
    return profile_info
