from fastapi import APIRouter, HTTPException
from services.sqlite_service import get_session, execute_query
from services.chart_service import generate_dashboard_data
from services.insights_service import generate_ai_insights
from models.dashboard_models import DashboardResponse, KPICard, ChartConfig, PieChartConfig, HeatmapConfig

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/{session_id}", response_model=DashboardResponse)
async def get_dashboard(session_id: str):
    """
    Retrieves visual configurations (KPIs, Charts, Heatmaps) for a session.
    Retrieves data from SQLite, triggers aggregation and builds dashboard charts.
    """
    # 1. Fetch session info
    session_info = get_session(session_id)
    if not session_info:
        raise HTTPException(
            status_code=404,
            detail="Session not found. Please upload a file first."
        )
        
    table_name = session_info["table_name"]
    
    # 2. Retrieve entire dataset from SQLite for aggregation
    try:
        df = execute_query(session_id, f"SELECT * FROM {table_name}")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read data from database: {str(e)}"
        )
        
    # 3. Retrieve verified date columns from session info
    try:
        date_cols = session_info.get("date_columns", [])
        cleaning_report = {"date_columns_detected": date_cols}
        dashboard_data = generate_dashboard_data(df, cleaning_report)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate dashboard configurations: {str(e)}"
        )
        
    # 4. Form models and return response
    return DashboardResponse(
        session_id=session_id,
        kpi_cards=[
            KPICard(
                label=kpi["label"],
                value=kpi["value"],
                unit=kpi["unit"],
                icon=kpi["icon"]
            ) for kpi in dashboard_data["kpi_cards"]
        ],
        bar_chart=ChartConfig(
            x_axis=dashboard_data["bar_chart"]["x_axis"],
            y_axis=dashboard_data["bar_chart"]["y_axis"],
            data=dashboard_data["bar_chart"]["data"]
        ),
        line_chart=ChartConfig(
            x_axis=dashboard_data["line_chart"]["x_axis"],
            y_axis=dashboard_data["line_chart"]["y_axis"],
            data=dashboard_data["line_chart"]["data"]
        ),
        pie_chart=PieChartConfig(
            name_key=dashboard_data["pie_chart"]["name_key"],
            value_key=dashboard_data["pie_chart"]["value_key"],
            data=dashboard_data["pie_chart"]["data"]
        ),
        heatmap=HeatmapConfig(
            columns=dashboard_data["heatmap"]["columns"],
            matrix=dashboard_data["heatmap"]["matrix"]
        )
    )

@router.get("/insights/{session_id}")
async def get_insights(session_id: str):
    """
    Computes statistical profiling and prompts Gemini for business insights.
    """
    session_info = get_session(session_id)
    if not session_info:
        raise HTTPException(
            status_code=404,
            detail="Session not found. Please upload a file first."
        )
        
    table_name = session_info["table_name"]
    try:
        df = execute_query(session_id, f"SELECT * FROM {table_name}")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read data from database: {str(e)}"
        )
        
    try:
        insights = generate_ai_insights(df)
        return {"session_id": session_id, "insights": insights}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate AI insights: {str(e)}"
        )
