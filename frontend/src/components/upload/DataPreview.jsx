import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { formatNumber } from '../../utils/formatters';

const DataPreview = () => {
  const { uploadedFile } = useContext(AppContext);

  if (!uploadedFile || !uploadedFile.preview || uploadedFile.preview.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center text-slate-500">
        No dataset preview available. Upload a file to view data records.
      </div>
    );
  }

  const columns = uploadedFile.columns;
  const rows = uploadedFile.preview;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dataset Preview</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing first {rows.length} rows of the cleaned and normalized dataset.
          </p>
        </div>
      </div>

      {/* Preview Table Container */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[60vh]">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center w-12 bg-slate-50 dark:bg-slate-900">
                  #
                </th>
                {columns.map((col) => (
                  <th
                    key={col.name}
                    className="px-4 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 min-w-[120px]"
                  >
                    <div className="flex flex-col">
                      <span className="text-slate-700 dark:text-slate-200 truncate">{col.name}</span>
                      <span className="text-[8px] font-mono font-medium text-slate-400 mt-0.5 truncate">
                        {col.dtype.replace('64', '').replace('ns]', '').replace('[', '')}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
              {rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition duration-150"
                >
                  <td className="px-4 py-3 text-slate-400 dark:text-slate-600 font-mono text-center">
                    {rIdx + 1}
                  </td>
                  {columns.map((col) => {
                    const cellVal = row[col.name];
                    const isNum = col.dtype.includes('float') || col.dtype.includes('int');
                    
                    return (
                      <td
                        key={col.name}
                        className={`px-4 py-3 font-medium ${
                          isNum
                            ? 'text-right font-mono text-indigo-500 dark:text-indigo-400'
                            : 'text-left text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isNum && cellVal !== null && cellVal !== 'Unknown'
                          ? formatNumber(cellVal)
                          : String(cellVal ?? '-')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataPreview;
