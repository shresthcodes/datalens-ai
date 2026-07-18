import React, { useEffect, useRef, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useChat } from '../../hooks/useChat';
import { api } from '../../services/api';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const ChatPanel = () => {
  const { sessionId } = useContext(AppContext);
  const { messages, sendMessage, clearHistory, isLoading, error } = useChat();
  const chatEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Header Actions */}
      <div className="flex justify-between items-center mb-4 shrink-0 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight">AI Data Chat Panel</h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Ask analytical questions about your sales data. Gemini generates SQLite queries for you.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Download Cleaned CSV */}
          <a
            href={api.getExportUrl(sessionId, 'csv')}
            download
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/60 transition duration-150"
            title="Download the full auto-cleaned dataset as CSV"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download Cleaned CSV</span>
          </a>

          {/* Clear Logs */}
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-850 transition duration-150"
              title="Clear discussion log"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Message History Scroller */}
      <div className="flex-1 overflow-y-auto px-1 py-2 space-y-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/30 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500 shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-350">
                Start Conversing with your Dataset
              </p>
              <p className="text-xs text-slate-400 max-w-sm font-light leading-relaxed">
                Type questions like: "Which region has the lowest average discount?" or "What was our highest revenue product in Electronics?".
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white mr-2.5 shrink-0 select-none">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="px-4.5 py-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-400 rounded-tl-sm flex items-center space-x-2">
              <div className="flex space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-xs font-medium">Gemini is thinking...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input container */}
      <div className="shrink-0 pt-4 bg-white dark:bg-slate-950">
        <ChatInput onSubmit={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatPanel;
