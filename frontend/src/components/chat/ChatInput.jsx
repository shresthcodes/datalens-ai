import React, { useState } from 'react';

const ChatInput = ({ onSubmit, isLoading }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value || !value.trim() || isLoading) return;
    onSubmit(value);
    setValue('');
  };

  const suggestions = [
    "What is the total revenue?",
    "Show top 5 products by revenue",
    "Show monthly sales trends",
    "What is our average profit?"
  ];

  return (
    <div className="space-y-4 pt-2">
      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (!isLoading) {
                setValue(s);
              }
            }}
            disabled={isLoading}
            className="px-3 py-1.5 text-[10px] md:text-xs rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition duration-150 text-left font-medium disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isLoading}
          placeholder="Ask a question about your dataset (e.g. 'What is the total profit by region?')..."
          className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:focus:ring-brand-500/20 text-slate-800 dark:text-slate-100 placeholder-slate-400 disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="px-4 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 text-white border border-brand-600 disabled:opacity-50 shadow-md shadow-indigo-500/10 hover:scale-105 active:scale-95 transition duration-150 shrink-0"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
