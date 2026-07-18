import os
import uuid

# Base directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
DATABASES_DIR = os.path.join(DATA_DIR, "databases")
CHROMA_DIR = os.path.join(DATA_DIR, "chroma_db")

# Ensure all directories exist
for directory in [UPLOADS_DIR, DATABASES_DIR, CHROMA_DIR]:
    os.makedirs(directory, exist_ok=True)

def generate_session_id() -> str:
    """Generates a unique UUID4 string for the session."""
    return str(uuid.uuid4())

def get_db_path(session_id: str) -> str:
    """Returns the absolute path to the SQLite database for a session."""
    return os.path.join(DATABASES_DIR, f"{session_id}.db")

def get_upload_path(session_id: str, filename: str) -> str:
    """Returns the path where the raw uploaded file will be stored temporarily."""
    # Normalize filename to avoid directory traversal
    safe_filename = os.path.basename(filename)
    return os.path.join(UPLOADS_DIR, f"{session_id}_{safe_filename}")

def session_exists(session_id: str) -> bool:
    """Checks if a session is valid by verifying if its SQLite database file exists."""
    if not session_id:
        return False
    # Validate UUID format to prevent file system traversal injection
    try:
        uuid.UUID(session_id)
    except ValueError:
        return False
    return os.path.exists(get_db_path(session_id))
