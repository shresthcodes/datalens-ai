import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const Sidebar = () => {
  const { uploadedFile, activeTab, setActiveTab } = useContext(AppContext);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      id: 'data',
      label: 'Dataset Preview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'chat',
      label: 'AI Data Chat',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col h-full shrink-0 z-20">
      {/* Navigation tabs */}
      <div className="flex-1 py-6 px-4 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 group relative ${
                isActive
                  ? 'bg-brand-500 text-white shadow-lg shadow-indigo-500/10'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span className={`${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dataset stats card */}
      {uploadedFile && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
          <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 p-3.5 rounded-2xl text-xs space-y-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
              Active Schema
            </span>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Rows</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{uploadedFile.rowCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Columns</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{uploadedFile.columnCount}</span>
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-800 my-1"></div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
              Fields
            </span>
            <div className="max-h-[140px] overflow-y-auto pr-1 space-y-1.5 text-[11px]">
              {uploadedFile.columns.map((col, idx) => (
                <div key={idx} className="flex justify-between items-center py-0.5">
                  <span className="text-slate-600 dark:text-slate-300 truncate max-w-[110px]" title={col.name}>
                    {col.name}
                  </span>
                  <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md font-mono text-[9px]">
                    {col.dtype.replace('64', '').replace('ns]', '').replace('[', '')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
