import React from 'react';
import { formatNumber } from '../../utils/formatters';

const ResultTable = ({ table }) => {
  if (!table || !table.columns || table.columns.length === 0 || !table.rows || table.rows.length === 0) {
    return null;
  }

  const { columns, rows } = table;

  return (
    <div className="border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden text-xs bg-white dark:bg-slate-950 shadow-sm max-w-full my-2">
      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
        <span className="font-bold text-slate-500 dark:text-slate-400 font-mono text-[10px] tracking-wider uppercase">
          Query Results Output
        </span>
        <span className="text-[10px] font-medium text-slate-400">
          {rows.length} {rows.length === 1 ? 'record' : 'records'} returned
        </span>
      </div>
      
      <div className="overflow-x-auto max-h-[250px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-[11px] md:text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 sticky top-0">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 min-w-[80px]"
                >
                  {col.replace('_', ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
            {rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition duration-100"
              >
                {row.map((cell, cIdx) => {
                  const isNum = typeof cell === 'number';
                  const colName = columns[cIdx]?.toLowerCase() || '';
                  const isCurrency = colName.includes('revenue') || 
                                     colName.includes('profit') || 
                                     colName.includes('sales') || 
                                     colName.includes('cost') || 
                                     colName.includes('price') || 
                                     colName.includes('amount') || 
                                     colName.includes('inr') || 
                                     colName.includes('usd') ||
                                     colName.includes('sum(') || // aggregations of money
                                     colName.includes('avg(');
                                     
                  return (
                    <td
                      key={cIdx}
                      className={`px-3 py-2 font-medium ${
                        isNum
                          ? 'text-right font-mono text-indigo-500 dark:text-indigo-400'
                          : 'text-left text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isNum ? formatNumber(cell, isCurrency ? '$' : '') : String(cell ?? '-')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultTable;
