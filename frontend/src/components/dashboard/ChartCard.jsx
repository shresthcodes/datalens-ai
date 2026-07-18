import React, { useState } from 'react';
import { exportChart } from '../../utils/exportChart';

const ChartCard = ({ title, chartId, children }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    const success = await exportChart(chartId, title);
    setIsExporting(false);
  };

  return (
    <div
      id={chartId}
      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 md:p-6 rounded-3xl shadow-sm hover:shadow-md transition duration-200 flex flex-col h-full relative"
    >
      {/* Header Title & Actions */}
      <div className="flex justify-between items-center mb-6 shrink-0 relative z-10">
        <div>
          <h3 className="font-bold text-base md:text-lg tracking-tight text-slate-800 dark:text-slate-100">
            {title}
          </h3>
        </div>

        <button
          id={`btn-export-${chartId}`}
          onClick={handleExport}
          disabled={isExporting}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition duration-150 ${
            isExporting ? 'opacity-65 cursor-not-allowed' : ''
          }`}
          title="Download chart as PNG image"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export PNG</span>
            </>
          )}
        </button>
      </div>

      {/* Chart Canvas Content */}
      <div className="flex-1 w-full relative min-h-[300px]">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
