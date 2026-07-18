import os
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import routers
from routers import upload, dashboard, chat, export

# Initialize FastAPI application
app = FastAPI(
    title="DataLens AI — Intelligent Business Analytics API",
    description="Backend API powering dataset profiling, auto KPI dashboards, and semantic SQL search Q&A.",
    version="1.0.0"
)

# Configure CORS Middleware
# Allows React Vite client running on localhost:5173 or deployed instances to reach endpoints
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(upload.router)
app.include_router(dashboard.router)
app.include_router(chat.router)
app.include_router(export.router)

@app.get("/api/health", tags=["system"])
async def health_check():
    """System health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
