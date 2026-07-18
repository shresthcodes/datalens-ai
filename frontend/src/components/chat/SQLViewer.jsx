import React, { useState } from 'react';

const SQLViewer = ({ sql }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!sql) return null;

  // Simple token highlight formatter
  const highlightSQL = (query) => {
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'LIMIT', 'JOIN', 
      'LEFT JOIN', 'INNER JOIN', 'ON', 'AND', 'OR', 'AS', 'SUM', 'AVG', 
      'COUNT', 'MAX', 'MIN', 'DESC', 'ASC', 'IN', 'LIKE', 'HAVING'
    ];
    
    // Split query by word boundaries
    let formatted = query;
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      formatted = formatted.replace(regex, `<span class="text-indigo-400 font-bold">${keyword}</span>`);
    });
    
    return formatted;
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden text-xs bg-slate-50 dark:bg-slate-900 shadow-sm max-w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 font-semibold"
      >
        <span className="flex items-center space-x-1.5 font-mono">
          <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span>SQL Query Generated</span>
        </span>
        <span className="flex items-center space-x-1 font-sans font-medium text-[11px] text-slate-400 hover:text-slate-200">
          <span>{isOpen ? 'Hide code' : 'Show code'}</span>
          <svg
            className={`w-4 h-4 transform transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-850 overflow-x-auto bg-slate-900 text-slate-100 font-mono text-[11px] md:text-xs leading-relaxed leading-normal">
          <pre
            className="whitespace-pre-wrap break-all"
            dangerouslySetInnerHTML={{ __html: highlightSQL(sql) }}
          />
        </div>
      )}
    </div>
  );
};

export default SQLViewer;
