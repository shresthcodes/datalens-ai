import React from 'react';
import { formatNumber } from '../../utils/formatters';

const KPICard = ({ label, value, unit, icon }) => {
  // Render SVG icons dynamically
  const getIcon = () => {
    const defaultStyle = "w-6 h-6";
    switch (icon) {
      case 'table':
        return (
          <svg className={`${defaultStyle} text-indigo-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'dollar':
        return (
          <svg className={`${defaultStyle} text-emerald-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'trending-up':
        return (
          <svg className={`${defaultStyle} text-blue-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'map':
        return (
          <svg className={`${defaultStyle} text-amber-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        );
      default:
        return (
          <svg className={`${defaultStyle} text-slate-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Absolute gradient mesh for visual depth */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-slate-50/50 dark:from-slate-900/10 to-transparent pointer-events-none"></div>

      <div className="space-y-1 relative z-10">
        <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
          {label}
        </span>
        <span className="text-xl md:text-2xl font-extrabold font-mono tracking-tight text-slate-800 dark:text-white">
          {formatNumber(value, unit)}
        </span>
      </div>

      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 flex items-center justify-center shadow-inner relative z-10 shrink-0">
        {getIcon()}
      </div>
    </div>
  );
};

export default KPICard;
