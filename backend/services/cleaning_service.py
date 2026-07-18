import pandas as pd
import numpy as np
import re

def clean_data(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """
    Cleans the input DataFrame and generates a cleaning/health profiling report.
    Steps:
    1. Strip whitespace from column names.
    2. Drop fully empty columns (all NaN).
    3. Drop fully duplicate rows.
    4. Fill numeric NaN with column median.
    5. Fill string NaN with "Unknown".
    6. Strip leading/trailing whitespace from string columns.
    7. Auto-detect and parse date columns.
    8. Normalize column names (lowercase, alphanumeric + underscores).
    """
    cleaned_df = df.copy()
    original_rows = len(cleaned_df)
    
    # 1. Strip whitespace from column names FIRST
    cleaned_df.columns = [str(col).strip() for col in cleaned_df.columns]
    
    # Capture original columns after stripping to prevent false "dropped" flags from whitespace changes
    original_cols = list(cleaned_df.columns)
    
    # 2. Drop fully empty columns (all NaN)
    cleaned_df.dropna(how="all", axis=1, inplace=True)
    columns_dropped = list(set(original_cols) - set(cleaned_df.columns))
    
    # 3. Drop fully duplicate rows
    cleaned_df.drop_duplicates(inplace=True)
    duplicates_removed = original_rows - len(cleaned_df)
    
    nulls_filled = {}
    date_columns_detected = []
    
    # 7. Identify potential date columns before parsing strings (based on names)
    date_indicators = ["date", "time", "timestamp", "created_at", "updated_at", "month", "year"]
    
    for col in cleaned_df.columns:
        # Check if we should attempt date parsing
        is_date_col = any(indicator in col.lower() for indicator in date_indicators)
        
        # Count null values
        null_count = int(cleaned_df[col].isnull().sum())
        
        if is_date_col:
            try:
                # Try parsing as datetime
                parsed_dates = pd.to_datetime(cleaned_df[col], errors="coerce")
                # If we successfully parsed at least 50% of the non-null rows, mark as date column
                non_null_count = cleaned_df[col].dropna().count()
                if non_null_count > 0 and (parsed_dates.notnull().sum() / non_null_count) >= 0.5:
                    cleaned_df[col] = parsed_dates
                    date_columns_detected.append(col)
                    if null_count > 0:
                        min_date = parsed_dates.min()
                        if pd.isnull(min_date):
                            min_date = pd.Timestamp("2000-01-01")
                        cleaned_df[col] = cleaned_df[col].fillna(min_date)
                        nulls_filled[col] = null_count
                    continue
            except Exception:
                pass
                
        # Coerce numeric values if it contains mostly numbers but got parsed as object
        # (e.g. because of 'unknown' or currency symbols)
        if not pd.api.types.is_numeric_dtype(cleaned_df[col]) and not is_date_col:
            non_null_series = cleaned_df[col].dropna()
            if non_null_series.count() > 0:
                # Clean spaces, commas, and currency symbols
                cleaned_series = non_null_series.astype(str).str.strip().str.replace(r"[$,₹€£¥\s]", "", regex=True)
                # Ignore common string placeholders when computing numeric ratios
                placeholders = ["unknown", "n/a", "na", "nil", "none", "null", "nan", "-"]
                filtered_series = cleaned_series[~cleaned_series.str.lower().isin(placeholders)]
                
                if filtered_series.count() > 0:
                    coerced = pd.to_numeric(filtered_series, errors="coerce")
                    valid_num_count = coerced.notnull().sum()
                    # If at least 80% of non-placeholder values are numeric, coerce it
                    if (valid_num_count / filtered_series.count()) >= 0.8:
                        cleaned_df[col] = pd.to_numeric(cleaned_df[col].astype(str).str.strip().str.replace(r"[$,₹€£¥\s]", "", regex=True), errors="coerce")
                        # Re-calculate null count since invalid texts/placeholders are now NaN
                        null_count = int(cleaned_df[col].isnull().sum())

        # 4 & 5 & 6. Handle standard numeric vs object columns
        if pd.api.types.is_numeric_dtype(cleaned_df[col]):
            if null_count > 0:
                median_val = cleaned_df[col].median()
                # If median is NaN (all values were NaN), use 0
                if pd.isnull(median_val):
                    median_val = 0
                # Cast median to the columns original type if it was integer
                if pd.api.types.is_integer_dtype(cleaned_df[col]):
                    median_val = int(round(median_val))
                cleaned_df[col] = cleaned_df[col].fillna(median_val)
                nulls_filled[col] = null_count
        else:
            # Object or other stringy columns
            if null_count > 0:
                cleaned_df[col] = cleaned_df[col].fillna("Unknown")
                nulls_filled[col] = null_count
            # Strip string columns
            cleaned_df[col] = cleaned_df[col].astype(str).str.strip()

    # 8. Normalize column names: lowercase, alphanumeric + underscores
    original_cleaned_cols = list(cleaned_df.columns)
    normalized_cols = []
    for col in cleaned_df.columns:
        normalized = col.lower()
        normalized = normalized.replace(" ", "_").replace("-", "_")
        normalized = re.sub(r"[^a-z0-9_]", "", normalized)
        # Ensure name doesn't start with numbers (SQL safe)
        if normalized and normalized[0].isdigit():
            normalized = f"col_{normalized}"
        # Ensure column name isn't empty after stripping
        if not normalized:
            normalized = f"col_{len(normalized_cols)}"
        normalized_cols.append(normalized)
        
    cleaned_df.columns = normalized_cols
    
    # Map the detected date columns and null filled keys using ONLY surviving columns
    # This prevents indexing shifts from dropna columns!
    col_mapping = dict(zip(original_cleaned_cols, normalized_cols))
    normalized_date_cols = [col_mapping[col] for col in date_columns_detected if col in col_mapping]
    normalized_nulls_filled = {col_mapping[col]: val for col, val in nulls_filled.items() if col in col_mapping}
    
    # Normalize dropped columns individually since they are not in the mapping dictionary
    normalized_dropped_cols = []
    for col in columns_dropped:
        normalized = col.lower().replace(" ", "_").replace("-", "_")
        normalized = re.sub(r"[^a-z0-9_]", "", normalized)
        normalized_dropped_cols.append(normalized)

    # Convert Datetime fields back to string ISO-8859 formatting for easy SQLite insertion
    for col in normalized_date_cols:
        cleaned_df[col] = cleaned_df[col].dt.strftime("%Y-%m-%d")

    cleaning_report = {
        "original_rows": original_rows,
        "cleaned_rows": len(cleaned_df),
        "duplicates_removed": duplicates_removed,
        "nulls_filled": normalized_nulls_filled,
        "columns_dropped": normalized_dropped_cols,
        "date_columns_detected": normalized_date_cols,
        "column_types": {col: str(dtype) for col, dtype in zip(cleaned_df.columns, cleaned_df.dtypes)}
    }
    
    return cleaned_df, cleaning_report
