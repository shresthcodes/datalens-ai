from pydantic import BaseModel
from typing import Optional, Any

class ChatRequest(BaseModel):
    session_id: str
    question: str

class ResultTable(BaseModel):
    columns: list[str]
    rows: list[list[Any]]

class ChartData(BaseModel):
    type: str # 'bar' | 'line' | 'pie'
    x_axis: str
    y_axis: str
    data: list[dict[str, Any]]

class ChatResponse(BaseModel):
    question: str
    answer: str
    sql_query: str
    result_table: Optional[ResultTable] = None
    chart_data: Optional[ChartData] = None
    context_used: int
