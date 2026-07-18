import pandas as pd
import os

def read_file_to_df(file_path: str) -> pd.DataFrame:
    """
    Reads a CSV or Excel file into a Pandas DataFrame.
    Tries different encodings for CSV to avoid decode failures.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
        
    lower_path = file_path.lower()
    
    if lower_path.endswith(".csv"):
        # List of encodings to try for CSV
        encodings = ["utf-8", "latin-1", "iso-8859-1", "cp1252"]
        for encoding in encodings:
            try:
                # read CSV, strip whitespace from headers
                df = pd.read_csv(file_path, encoding=encoding)
                return df
            except UnicodeDecodeError:
                continue
            except Exception as e:
                raise ValueError(f"Failed to parse CSV file: {str(e)}")
        raise ValueError("Failed to parse CSV file: unable to decode file. Ensure it is encoded in UTF-8 or standard Western encoding.")
        
    elif lower_path.endswith(".xlsx") or lower_path.endswith(".xls"):
        try:
            df = pd.read_excel(file_path)
            return df
        except Exception as e:
            raise ValueError(f"Failed to parse Excel file: {str(e)}")
            
    else:
        raise ValueError("Unsupported file format. Only CSV and Excel (.xlsx, .xls) files are supported.")
