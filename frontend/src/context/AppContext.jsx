import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Session details
  const [sessionId, setSessionIdState] = useState(() => {
    return localStorage.getItem('datalens_session_id') || null;
  });
  
  const [uploadedFile, setUploadedFileState] = useState(() => {
    const saved = localStorage.getItem('datalens_uploaded_file');
    return saved ? JSON.parse(saved) : null;
  });

  // Theme settings (defaults to 'dark' for premium analytics visual styling)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // Current sub-navigation page tab
  const [activeTab, setActiveTab] = useState('dashboard');

  const setSessionId = (id) => {
    if (id) {
      localStorage.setItem('datalens_session_id', id);
    } else {
      localStorage.removeItem('datalens_session_id');
    }
    setSessionIdState(id);
  };

  const setUploadedFile = (fileData) => {
    if (fileData) {
      localStorage.setItem('datalens_uploaded_file', JSON.stringify(fileData));
    } else {
      localStorage.removeItem('datalens_uploaded_file');
    }
    setUploadedFileState(fileData);
  };

  // Sync theme classes on change
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Clear session to upload new data files
  const resetSession = () => {
    setSessionId(null);
    setUploadedFile(null);
    setActiveTab('dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        sessionId,
        setSessionId,
        uploadedFile,
        setUploadedFile,
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        resetSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
