import os
import re
import time
import json
import pandas as pd
import numpy as np
from services.gemini_service import get_model

def generate_insights_summary(df: pd.DataFrame) -> str:
    """
    Computes statistical profiling summaries of the DataFrame to feed into Gemini.
    """
    num_cols = []
    cat_cols = []
    
    for col in df.columns:
        if col == "index":
            continue
        if pd.api.types.is_numeric_dtype(df[col]):
            num_cols.append(col)
        else:
            cat_cols.append(col)
            
    summary_parts = []
    summary_parts.append(f"Dataset Size: {len(df)} rows, {len(df.columns)} columns.")
    
    # 1. Descriptive stats for numeric columns
    if num_cols:
        summary_parts.append("\nNumeric Column Summaries:")
        for col in num_cols:
            mean_val = float(df[col].mean())
            min_val = float(df[col].min())
            max_val = float(df[col].max())
            std_val = float(df[col].std()) if len(df) > 1 else 0.0
            summary_parts.append(f"- {col}: Average={mean_val:.2f}, Range=[{min_val:.2f} to {max_val:.2f}], StdDev={std_val:.2f}")
            
    # 2. Descriptive stats for categorical columns
    if cat_cols:
        summary_parts.append("\nCategorical Column Cardinatlity & Top Frequencies:")
        for col in cat_cols:
            unique_cnt = df[col].nunique()
            # Get top 3 frequent values as a dictionary
            top_vals = df[col].value_counts().head(3).to_dict()
            summary_parts.append(f"- {col}: UniqueValuesCount={unique_cnt}, TopValues={top_vals}")
            
    # 3. Correlation alerts
    if len(num_cols) >= 2:
        corr_df = df[num_cols].corr().fillna(0.0)
        high_corrs = []
        for i in range(len(num_cols)):
            for j in range(i + 1, len(num_cols)):
                col1 = num_cols[i]
                col2 = num_cols[j]
                val = corr_df.loc[col1, col2]
                if abs(val) > 0.6:
                    high_corrs.append(f"{col1} vs {col2} ({val:.2f})")
        if high_corrs:
            summary_parts.append(f"\nStrong Correlation Coefficients: {', '.join(high_corrs)}")
            
    # 4. Grouped aggregation example
    if cat_cols and num_cols:
        cat_col = cat_cols[0]
        num_col = num_cols[0]
        grouped = df.groupby(cat_col)[num_col].sum().sort_values(ascending=False).head(5).to_dict()
        summary_parts.append(f"\nTop 5 {cat_col} by sum of {num_col}: {grouped}")
        
    return "\n".join(summary_parts)

def generate_ai_insights(df: pd.DataFrame) -> list[str]:
    """
    Passes Pandas profile summary data to Gemini to produce 3-4 high-value
    business insights. Handles JSON output parsing and API 429 rate limit retries.
    """
    summary_data = generate_insights_summary(df)
    model = get_model()
    
    prompt = f"""You are a professional business intelligence advisor.
Here is a statistical data profile summary of a dataset uploaded by a business user:
{summary_data}

Analyze this statistical profile and write 3 to 4 high-value business insights, trends, or data anomalies.
Rules:
1. Explain each insight in 1 to 2 clear, concise sentences in plain English.
2. Focus on business value (outlying regions, key profit/revenue drivers, strong correlations, or unusual spreads).
3. Do NOT use technical terminology (like "Pandas", "dataframe", "standard deviation", "mean", "correlation coefficient"). Speak as a consultant.
4. Output the result ONLY as a JSON list of strings. Do not include markdown code block styling (like ```json). Just start the output with [ and end with ].

Example output format:
[
  "The Apparel category is the leading driver of sales, generating more than double the revenue of any other segment.",
  "The East region shows a strong correlation between discounts and profit margins, suggesting promotions are driving profitable volume.",
  "An average transaction size of $501 shows a highly healthy shopping cart size across all regions."
]
"""
    
    response_text = ""
    max_retries = 5
    retry_delay = 2
    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt)
            response_text = response.text.strip()
            break
        except Exception as e:
            if "429" in str(e) and attempt < max_retries - 1:
                print(f"Rate limit (429) hit during insights generation. Retrying in {retry_delay}s... (Attempt {attempt+1}/{max_retries})")
                time.sleep(retry_delay)
                retry_delay *= 2
            else:
                raise e
                
    # Parse JSON list safely
    try:
        clean_json = re.sub(r"^```json\s*", "", response_text, flags=re.IGNORECASE)
        clean_json = re.sub(r"^```\s*", "", clean_json)
        clean_json = re.sub(r"\s*```$", "", clean_json)
        clean_json = clean_json.strip()
        
        insights_list = json.loads(clean_json)
        if isinstance(insights_list, list):
            return [str(item) for item in insights_list]
    except Exception as err:
        print(f"Failed parsing Gemini insights JSON: {str(err)}. Raw: {response_text}")
        
    # Fallback line-by-line parsing if JSON structure was not returned
    lines = [line.strip().lstrip("-*\"' ").rstrip("\",' ") for line in response_text.split("\n") if line.strip()]
    lines = [line for line in lines if len(line) > 12 and not line.startswith("[") and not line.endswith("]")]
    return lines[:4]
