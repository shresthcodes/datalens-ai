from pydantic import BaseModel
from typing import Any

class ColumnInfo(BaseModel):
    name: str
    dtype: str
    null_count: int
    unique_count: int

class CleaningReport(BaseModel):
    original_rows: int
    cleaned_rows: int
    duplicates_removed: int
    nulls_filled: dict[str, int]
    columns_dropped: list[str]
    date_columns_detected: list[str]
    column_types: dict[str, str]

class UploadResponse(BaseModel):
    session_id: str
    filename: str
    table_name: str
    row_count: int
    column_count: int
    columns: list[ColumnInfo]
    preview: list[dict[str, Any]]
    cleaning_report: CleaningReport
