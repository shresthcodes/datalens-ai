# DataLens AI — Intelligent Business Analytics Platform

DataLens AI is a self-cleaning business analytics dashboard and AI-powered natural language chat interface. It enables non-technical business users to drag and drop CSV or Excel files and instantly receive data profiles, automated metric KPIs, distribution charts, and answer conversational questions.

It generates safe SQL SELECT statements using Gemini 1.5 Flash, queries in-memory RAG context rows using ChromaDB, and displays text answers alongside interactive tables and charts.

## Core Features
1. **Auto Data Cleaning & Profiling**: Normalizes headers, drops empty columns, fills null values with column medians/unknown indicators, removes duplicates, and parses datetimes.
2. **Auto KPI Dashboard**: Generates cards for metrics (averages, counts, sums) and renders Bar, Area Line, Pie, and Correlation Heatmap charts using Recharts and Tailwind CSS.
3. **AI Data Chat Panel**: Converses with datasets in plain English. Translates questions to SQLite queries, performs database execution, and summarizes outputs.
4. **Safety Verification Guards**: Inspects generated queries for SQL injection attempts, blocks stacked operations, and enforces SELECT-only execution.
5. **PNG Chart Exporting**: Captures dashboard charts directly to PNG images using `html2canvas` for reports.

---

## Getting Started

### 1. Add Gemini API Key
Rename `backend/.env.example` to `backend/.env` and paste your key:
```env
PORT=8000
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Run Backend API Server
```powershell
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API Documentation: `http://localhost:8000/docs`

### 3. Run React Frontend
```powershell
cd frontend
npm install
npm run dev
```
Client URL: `http://localhost:5173`

---

## Running Verification Tests
To run the automated data processing and safety tests:
```powershell
python backend/scratch/test_pipeline.py
```
This tests parsing, SQL safety guards, and SQLite insertion with the provided mock dataset `retail_sales.csv`.
