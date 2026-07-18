import React, { useContext } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import UploadZone from './components/upload/UploadZone';
import Dashboard from './components/dashboard/Dashboard';
import DataPreview from './components/upload/DataPreview';
import ChatPanel from './components/chat/ChatPanel';

const AppContent = () => {
  const { sessionId, activeTab } = useContext(AppContext);

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-slate-900 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col font-sans">
        {/* Simple Header */}
        <header className="p-6 flex justify-between items-center border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-50 to-indigo-200 bg-clip-text text-transparent">DataLens AI</h1>
              <p className="text-xs text-slate-400">Intelligent Business Analytics</p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs rounded-full bg-slate-800 text-slate-300 border border-slate-700/80">v1.0.0</span>
        </header>

        {/* Upload workspace */}
        <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
          {/* Visual Grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60"></div>
          
          <div className="max-w-4xl w-full relative z-10">
            <UploadZone />
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-800/80">
          DataLens AI — Created for portfolio and analytical data inspection.
        </footer>
      </div>
    );
  }

  // Deployed layout
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 font-sans transition-colors duration-200 flex flex-col h-screen overflow-hidden">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto bg-slate-100/50 dark:bg-slate-900/30 p-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'data' && <DataPreview />}
          {activeTab === 'chat' && <ChatPanel />}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
