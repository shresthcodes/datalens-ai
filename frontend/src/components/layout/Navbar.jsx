import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';

const Navbar = () => {
  const { uploadedFile, resetSession } = useContext(AppContext);
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 flex justify-between items-center z-30 shrink-0">
      {/* Brand logo */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 to-brand-600 dark:from-slate-50 dark:to-indigo-300 bg-clip-text text-transparent">
            DataLens AI
          </span>
        </div>
      </div>

      {/* Active dataset info */}
      {uploadedFile && (
        <div className="hidden md:flex items-center space-x-2 text-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
            {uploadedFile.filename}
          </span>
          <span className="h-4 w-px bg-slate-300 dark:bg-slate-700"></span>
          <span className="text-slate-500 dark:text-slate-400">
            {uploadedFile.rowCount.toLocaleString()} rows
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center space-x-3">
        {/* Toggle dark mode */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:scale-105 transition duration-150"
          title="Toggle color theme"
        >
          {isDark ? (
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Change dataset / Reset session */}
        <button
          onClick={resetSession}
          className="flex items-center space-x-1.5 px-3 py-2 text-sm font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-brand-600 dark:text-indigo-300 border border-brand-100 dark:border-indigo-900/60 transition duration-150"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span className="hidden sm:inline">Upload New</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
