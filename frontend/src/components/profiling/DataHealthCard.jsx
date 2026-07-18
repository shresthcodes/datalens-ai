import React, { useState } from 'react';

const DataHealthCard = ({ report }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!report) return null;

  const {
    original_rows,
    cleaned_rows,
    duplicates_removed,
    nulls_filled = {},
    columns_dropped = [],
    date_columns_detected = [],
  } = report;

  const totalNullsFilled = Object.values(nulls_filled).reduce((a, b) => a + b, 0);
  
  // Decide health tier status
  let statusColor = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400';
  let badgeColor = 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300';
  let statusText = 'Excellent Health';
  
  if (columns_dropped.length > 0) {
    statusColor = 'border-rose-500 bg-rose-50 dark:bg-rose-950/10 text-rose-700 dark:text-rose-400';
    badgeColor = 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300';
    statusText = 'Attention Required';
  } else if (duplicates_removed > 0 || totalNullsFilled > 0) {
    statusColor = 'border-amber-500 bg-amber-50 dark:bg-amber-950/10 text-amber-700 dark:text-amber-400';
    badgeColor = 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300';
    statusText = 'Auto-Cleaned & Synced';
  }

  return (
    <div className={`border rounded-2xl overflow-hidden shadow-sm transition-all duration-200 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800`}>
      {/* Header section toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-900/40 transition duration-150"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-bold text-sm md:text-base">Data Health & Profiling Report</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Pandas profiling results and cleaning operations performed.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className={`px-2.5 py-1 text-[10px] md:text-xs rounded-full font-bold tracking-tight border ${statusColor}`}>
            {statusText}
          </span>
          <svg
            className={`w-5 h-5 text-slate-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.0" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Report details */}
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-900 divide-y divide-slate-100">
          {/* Row comparison stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Original Rows</span>
              <span className="text-lg font-bold font-mono text-slate-700 dark:text-slate-200">{original_rows.toLocaleString()}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cleaned Rows</span>
              <span className="text-lg font-bold font-mono text-indigo-500 dark:text-indigo-400">{cleaned_rows.toLocaleString()}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Duplicates Deleted</span>
              <span className={`text-lg font-bold font-mono ${duplicates_removed > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                {duplicates_removed.toLocaleString()}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Null Values Filled</span>
              <span className={`text-lg font-bold font-mono ${totalNullsFilled > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                {totalNullsFilled.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Detailed changes list */}
          <div className="py-4 space-y-4">
            {/* Null fields filled list */}
            {Object.keys(nulls_filled).length > 0 ? (
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Null Values Filled By Feature</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(nulls_filled).map(([field, count]) => (
                    <span key={field} className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      {field}: <span className="font-mono font-bold text-amber-500">{count}</span> filled with median/unknown
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 py-1">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>No missing null values detected in column cells.</span>
              </p>
            )}

            {/* Dropped columns check */}
            {columns_dropped.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block text-rose-500">Columns Dropped (Empty)</span>
                <div className="flex flex-wrap gap-2">
                  {columns_dropped.map((col) => (
                    <span key={col} className="px-2.5 py-1 text-xs rounded-lg bg-rose-950/20 border border-rose-900/60 text-rose-300 font-medium">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Date parsing check */}
            {date_columns_detected.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block text-indigo-500">Date-Time Columns Parsed</span>
                <div className="flex flex-wrap gap-2">
                  {date_columns_detected.map((col) => (
                    <span key={col} className="px-2.5 py-1 text-xs rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 text-brand-600 dark:text-indigo-300 font-medium flex items-center space-x-1">
                      <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{col}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataHealthCard;
