import pandas as pd
import numpy as np

def is_currency_column(col_name: str) -> bool:
    """
    Heuristic to check if a column name represents monetary value/currency.
    """
    currency_keywords = ["price", "revenue", "sales", "profit", "cost", "fee", "amount", "inr", "usd", "val", "money"]
    return any(kw in col_name.lower() for kw in currency_keywords)

def get_best_grouping_column(df: pd.DataFrame, categorical_cols: list[str]) -> str | None:
    """
    Heuristic to select the most meaningful categorical column for charts.
    Avoids high-cardinality primary keys/IDs (like item_id, names) and prefers
    columns with 2 to 25 unique category classes.
    """
    if not categorical_cols:
        return None
        
    # Priority 1: Priority keywords (category, region, location, supplier, group, type)
    # matching moderate cardinality (2 to 25 unique values)
    priority_keywords = ["category", "region", "location", "supplier", "group", "type", "department", "class", "genre"]
    for kw in priority_keywords:
        for col in categorical_cols:
            if kw in col.lower():
                u_count = df[col].nunique()
                if 1 < u_count <= 25:
                    return col
                    
    # Priority 2: Categorical columns with 2 to 25 unique values, preferring closest to 5 values
    candidates = []
    for col in categorical_cols:
        u_count = df[col].nunique()
        if 1 < u_count <= 25:
            candidates.append((col, u_count))
            
    if candidates:
        # Sort by distance from 5 unique values (optimal categories count for visual charts)
        candidates.sort(key=lambda x: abs(x[1] - 5))
        return candidates[0][0]
        
    # Fallback to the first categorical column
    return categorical_cols[0]

def generate_dashboard_data(df: pd.DataFrame, cleaning_report: dict) -> dict:
    """
    Analyzes the DataFrame and builds visual aggregation charts and stats.
    Returns:
        kpi_cards: list of 4 metric cards
        bar_chart: bar chart series grouping
        line_chart: time series or sequential line series
        pie_chart: category share series
        heatmap: correlation matrix grid configs
    """
    # 1. Classify columns
    numeric_cols = []
    categorical_cols = []
    
    # Check pandas data types
    for col in df.columns:
        if col == "index":
            continue
        if col in cleaning_report.get("date_columns_detected", []):
            continue
        if pd.api.types.is_numeric_dtype(df[col]):
            numeric_cols.append(col)
        else:
            categorical_cols.append(col)
            
    date_cols = cleaning_report.get("date_columns_detected", [])
    best_group_col = get_best_grouping_column(df, categorical_cols)
    
    # 2. Build KPI Cards
    kpi_cards = []
    
    # Card 1: Row count
    row_count = len(df)
    kpi_cards.append({
        "label": "Total Records",
        "value": row_count,
        "unit": "",
        "icon": "table"
    })
    
    # Card 2: Sum of first numeric column
    if numeric_cols:
        first_num = numeric_cols[0]
        total_val = float(df[first_num].sum())
        label_name = first_num.replace("_", " ").title()
        
        is_currency = is_currency_column(first_num)
        kpi_cards.append({
            "label": f"Total {label_name}",
            "value": round(total_val, 2),
            "unit": "$" if is_currency else "",
            "icon": "dollar" if is_currency else "trending-up"
        })
    else:
        kpi_cards.append({
            "label": "Numeric Columns",
            "value": 0,
            "unit": "",
            "icon": "trending-up"
        })
        
    # Card 3: Avg of second numeric column (or first if only one)
    if numeric_cols:
        num_col_for_avg = numeric_cols[1] if len(numeric_cols) > 1 else numeric_cols[0]
        avg_val = float(df[num_col_for_avg].mean())
        label_name = num_col_for_avg.replace("_", " ").title()
        
        is_currency = is_currency_column(num_col_for_avg)
        kpi_cards.append({
            "label": f"Avg {label_name}",
            "value": round(avg_val, 2),
            "unit": "$" if is_currency else "",
            "icon": "dollar" if is_currency else "trending-up"
        })
    else:
        kpi_cards.append({
            "label": "Average Value",
            "value": 0,
            "unit": "",
            "icon": "trending-up"
        })
        
    # Card 4: Unique count of best categorical column (or first)
    if best_group_col:
        unique_count = int(df[best_group_col].nunique())
        label_name = best_group_col.replace("_", " ").title()
        kpi_cards.append({
            "label": f"Unique {label_name}",
            "value": unique_count,
            "unit": "",
            "icon": "map"
        })
    elif categorical_cols:
        first_cat = categorical_cols[0]
        unique_count = int(df[first_cat].nunique())
        label_name = first_cat.replace("_", " ").title()
        kpi_cards.append({
            "label": f"Unique {label_name}",
            "value": unique_count,
            "unit": "",
            "icon": "map"
        })
    else:
        kpi_cards.append({
            "label": "Categories",
            "value": 0,
            "unit": "",
            "icon": "map"
        })

    # 3. Bar Chart: Top 10 categories by sum of first numeric column
    bar_chart = {"x_axis": "", "y_axis": "", "data": []}
    if best_group_col and numeric_cols:
        cat_col = best_group_col
        num_col = numeric_cols[0]
        bar_chart["x_axis"] = cat_col
        bar_chart["y_axis"] = num_col
        
        # Group by and aggregate
        grouped = df.groupby(cat_col)[num_col].sum().reset_index()
        grouped = grouped.sort_values(by=num_col, ascending=False).head(10)
        bar_chart["data"] = grouped.to_dict(orient="records")
        
    # 4. Line Chart: Timeline (monthly if dates exist, else record index order)
    line_chart = {"x_axis": "", "y_axis": "", "data": []}
    if numeric_cols:
        num_col = numeric_cols[0]
        line_chart["y_axis"] = num_col
        
        if date_cols:
            date_col = date_cols[0]
            line_chart["x_axis"] = "period"
            
            # Format dates to YYYY-MM and group by month to get clean line charts
            temp_df = df.copy()
            temp_df["period"] = pd.to_datetime(temp_df[date_col], errors="coerce").dt.strftime("%Y-%m").fillna("Unknown")
            grouped = temp_df.groupby("period")[num_col].sum().reset_index()
            grouped = grouped.sort_values(by="period")
            line_chart["data"] = grouped.to_dict(orient="records")
        else:
            # Fallback to index if no date column exists
            line_chart["x_axis"] = "row_index"
            sampled_df = df.head(50).copy()
            sampled_df["row_index"] = sampled_df["index"] if "index" in sampled_df.columns else sampled_df.index
            line_chart["data"] = sampled_df[["row_index", num_col]].to_dict(orient="records")

    # 5. Pie Chart: Top 5 categories by sum of first numeric column (or row count if no numeric)
    pie_chart = {"name_key": "", "value_key": "", "data": []}
    if best_group_col:
        cat_col = best_group_col
        pie_chart["name_key"] = cat_col
        
        if numeric_cols:
            num_col = numeric_cols[0]
            pie_chart["value_key"] = num_col
            grouped = df.groupby(cat_col)[num_col].sum().reset_index()
        else:
            pie_chart["value_key"] = "count"
            grouped = df.groupby(cat_col).size().reset_index(name="count")
            
        grouped = grouped.sort_values(by=pie_chart["value_key"], ascending=False).head(5)
        pie_chart["data"] = grouped.to_dict(orient="records")
        
    # 6. Heatmap: Pearson correlation of numeric columns
    heatmap = {"columns": [], "matrix": []}
    if len(numeric_cols) >= 2:
        corr_df = df[numeric_cols].corr()
        corr_df = corr_df.fillna(0.0)
        
        heatmap["columns"] = list(corr_df.columns)
        heatmap["matrix"] = [[float(val) for val in row] for row in corr_df.values]
    else:
        # Empty heatmap fallback
        heatmap["columns"] = numeric_cols
        heatmap["matrix"] = [[1.0]] if numeric_cols else []
        
    return {
        "kpi_cards": kpi_cards,
        "bar_chart": bar_chart,
        "line_chart": line_chart,
        "pie_chart": pie_chart,
        "heatmap": heatmap
    }
