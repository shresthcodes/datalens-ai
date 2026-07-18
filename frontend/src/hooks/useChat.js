import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { api } from '../services/api';

export const useChat = () => {
  const { sessionId } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load chat history from localStorage on mount/session change
  useEffect(() => {
    if (sessionId) {
      const saved = localStorage.getItem(`datalens_chat_history_${sessionId}`);
      setMessages(saved ? JSON.parse(saved) : []);
    } else {
      setMessages([]);
    }
    setError(null);
  }, [sessionId]);

  // Sync messages to localStorage
  const saveMessages = (updatedMessages) => {
    setMessages(updatedMessages);
    if (sessionId) {
      localStorage.setItem(`datalens_chat_history_${sessionId}`, JSON.stringify(updatedMessages));
    }
  };

  const sendMessage = async (question) => {
    if (!question || !question.trim()) return;
    if (!sessionId) {
      setError("No active session found. Please upload a file first.");
      return;
    }

    const cleanQuestion = question.trim();
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: { text: cleanQuestion }
    };

    const newMessages = [...messages, userMessage];
    saveMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.sendChatMessage(sessionId, cleanQuestion);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: {
          answer: response.answer,
          sql_query: response.sql_query,
          result_table: response.result_table,
          chart_data: response.chart_data,
        }
      };

      saveMessages([...newMessages, aiMessage]);
      setIsLoading(false);
    } catch (err) {
      const msg = err.response?.data?.detail || "Something went wrong while querying the model. Please check the SQL query safety rules.";
      setError(msg);
      setIsLoading(false);
      
      // Append error message to chat to let user know it failed
      const systemErrorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: { error: msg }
      };
      saveMessages([...newMessages, systemErrorMessage]);
    }
  };

  const clearHistory = () => {
    saveMessages([]);
    if (sessionId) {
      localStorage.removeItem(`datalens_chat_history_${sessionId}`);
    }
  };

  return {
    messages,
    sendMessage,
    clearHistory,
    isLoading,
    error,
    setError,
  };
};
