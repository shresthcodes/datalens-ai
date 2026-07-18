import axios from 'axios';

// Base API config (Vite proxies /api to backend port in development)
const API_BASE = '';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  /**
   * Uploads a CSV or Excel file.
   * Handles multipart/form-data.
   */
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Fetches the dashboard KPIs and chart configuration series.
   */
  getDashboard: async (sessionId) => {
    const response = await apiClient.get(`/api/dashboard/${sessionId}`);
    return response.data;
  },

  /**
   * Fetches the automated AI business insights.
   */
  getInsights: async (sessionId) => {
    const response = await apiClient.get(`/api/dashboard/insights/${sessionId}`);
    return response.data;
  },

  /**
   * Submits a question to the AI, running RAG query processing.
   */
  sendChatMessage: async (sessionId, question) => {
    const response = await apiClient.post('/api/chat', {
      session_id: sessionId,
      question: question,
    });
    return response.data;
  },

  /**
   * Returns export download link.
   */
  getExportUrl: (sessionId, format = 'csv') => {
    return `/api/export/${sessionId}?format=${format}`;
  },
};
