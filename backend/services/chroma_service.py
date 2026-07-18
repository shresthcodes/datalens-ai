import os
import time
import pandas as pd
import numpy as np
import google.generativeai as genai

# In-memory vector store registry
# Key: session_id -> Value: {"embeddings": np.ndarray, "documents": list[str]}
SESSION_VECTORS = {}

def get_gemini_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Fetches embeddings for a list of text strings using Gemini's embedding model.
    Sends them in batches to prevent hitting rate limits or payload caps.
    Includes an automatic retry mechanism with exponential backoff for rate limits.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise ValueError("GEMINI_API_KEY is not configured. Please set the environment variable.")
        
    genai.configure(api_key=api_key)
    
    embeddings = []
    batch_size = 50  # process in batches of 50
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        
        # Retry logic for 429
        max_retries = 6
        retry_delay = 2
        for attempt in range(max_retries):
            try:
                response = genai.embed_content(
                    model="models/gemini-embedding-001",
                    content=batch,
                    task_type="retrieval_document"
                )
                embeddings.extend(response["embedding"])
                break
            except Exception as e:
                # Catch 429 quota/rate limit error
                if "429" in str(e) and attempt < max_retries - 1:
                    print(f"Rate limit (429) hit during batch embedding. Retrying in {retry_delay}s... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                else:
                    raise e
        
    return embeddings

def index_dataset(session_id: str, df: pd.DataFrame):
    """
    Converts DataFrame rows to text descriptions, embeds them via Gemini,
    and stores them in the in-memory numpy registry.
    """
    documents = []
    
    for idx, row in df.iterrows():
        # Exclude index col if it's there
        row_items = [f"{col}: {val}" for col, val in row.items() if col != "index"]
        row_str = " | ".join(row_items)
        documents.append(row_str)
        
    # Get embeddings for all row documents
    embeddings = get_gemini_embeddings(documents)
    
    # Store in global dictionary as numpy arrays
    SESSION_VECTORS[session_id] = {
        "embeddings": np.array(embeddings),
        "documents": documents
    }

def query_context(session_id: str, query: str, n_results: int = 5) -> list[str]:
    """
    Computes cosine similarity between query embedding and stored row embeddings
    in pure Python / NumPy, returning the top N matches.
    Includes rate limit retry logic.
    """
    if session_id not in SESSION_VECTORS:
        return []
        
    session_data = SESSION_VECTORS[session_id]
    embeddings = session_data["embeddings"] # shape: (num_rows, embedding_dim)
    documents = session_data["documents"]
    
    if len(documents) == 0 or embeddings.size == 0:
        return []
        
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise ValueError("GEMINI_API_KEY is not configured.")
        
    genai.configure(api_key=api_key)
    
    # Embed the search query with retry logic
    query_embedding = None
    max_retries = 6
    retry_delay = 2
    for attempt in range(max_retries):
        try:
            response = genai.embed_content(
                model="models/gemini-embedding-001",
                content=query,
                task_type="retrieval_query"
            )
            query_embedding = np.array(response["embedding"]) # shape: (embedding_dim,)
            break
        except Exception as e:
            if "429" in str(e) and attempt < max_retries - 1:
                print(f"Rate limit (429) hit during query embedding. Retrying in {retry_delay}s... (Attempt {attempt+1}/{max_retries})")
                time.sleep(retry_delay)
                retry_delay *= 2
            else:
                raise e
                
    if query_embedding is None:
        return []
        
    # Compute dot products
    dot_products = np.dot(embeddings, query_embedding)
    
    # Compute norms
    row_norms = np.linalg.norm(embeddings, axis=1)
    query_norm = np.linalg.norm(query_embedding)
    
    # Compute cosine similarities: dot(A, B) / (||A|| * ||B||)
    # Add a small epsilon to avoid divide by zero if any row has all zeros
    norms = row_norms * query_norm
    norms[norms == 0] = 1e-9
    
    similarities = dot_products / norms
    
    # Get top N indices sorted descending by similarity score
    top_indices = np.argsort(similarities)[::-1][:n_results]
    
    # Return matched document strings
    return [documents[idx] for idx in top_indices]
