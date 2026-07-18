import React from 'react';
import SQLViewer from './SQLViewer';
import ResultTable from './ResultTable';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  Cell
} from 'recharts';

const ChatMessage = ({ message }) => {
  const { role, content } = message;

  if (role === 'system') {
    return (
      <div className="flex justify-center my-3">
        <div className="bg-rose-950/10 border border-rose-900/30 text-rose-400 text-xs px-4 py-2 rounded-xl max-w-lg font-light leading-normal flex items-start space-x-2">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{content.error}</span>
        </div>
      </div>
    );
  }

  const isUser = role === 'user';

  // Render mini chart if data is returned
  const renderMiniChart = (chartData) => {
    if (!chartData || !chartData.data || chartData.data.length === 0) return null;
    
    const { type, x_axis, y_axis, data } = chartData;
    const CHART_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#a855f7'];

    return (
      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl max-w-full">
        <span className="font-bold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2 font-mono">
          Visual Analysis (Mini {type} Chart)
        </span>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'line' ? (
              <AreaChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="miniColorLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey={x_axis} fontSize={8} stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis fontSize={8} stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey={y_axis} stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#miniColorLine)" />
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <XAxis dataKey={x_axis} fontSize={8} stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis fontSize={8} stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey={y_axis} radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {/* Icon logo */}
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white mr-2.5 shrink-0 select-none">
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
      )}

      {/* Bubble content */}
      <div className={`max-w-[85%] md:max-w-[70%] space-y-2`}>
        {/* User prompt vs AI response bubbles */}
        <div
          className={`px-4.5 py-3 rounded-2xl text-xs md:text-sm font-medium leading-relaxed leading-normal ${
            isUser
              ? 'bg-brand-500 text-white rounded-tr-sm shadow-md shadow-indigo-500/5'
              : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
          }`}
        >
          {isUser ? content.text : content.answer}
        </div>

        {/* AI extra components */}
        {!isUser && (
          <div className="space-y-2.5 w-full">
            <SQLViewer sql={content.sql_query} />
            <ResultTable table={content.result_table} />
            {renderMiniChart(content.chart_data)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
