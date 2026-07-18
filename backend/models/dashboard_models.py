from pydantic import BaseModel
from typing import Any

class KPICard(BaseModel):
    label: str
    value: float | int
    unit: str
    icon: str

class ChartConfig(BaseModel):
    x_axis: str
    y_axis: str
    data: list[dict[str, Any]]

class PieChartConfig(BaseModel):
    name_key: str
    value_key: str
    data: list[dict[str, Any]]

class HeatmapConfig(BaseModel):
    columns: list[str]
    matrix: list[list[float]]

class DashboardResponse(BaseModel):
    session_id: str
    kpi_cards: list[KPICard]
    bar_chart: ChartConfig
    line_chart: ChartConfig
    pie_chart: PieChartConfig
    heatmap: HeatmapConfig
