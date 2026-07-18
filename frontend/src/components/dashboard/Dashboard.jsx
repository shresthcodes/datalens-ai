import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { api } from '../../services/api';
import KPIRow from './KPIRow';
import ChartCard from './ChartCard';
import DataHealthCard from '../profiling/DataHealthCard';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl shadow-lg text-xs font-mono text-slate-200">
        <p className="font-semibold text-slate-400 mb-0.5">{label}</p>
        <p className="text-indigo-400">
          Value: <span className="text-white font-bold">{payload[0].value.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { sessionId, uploadedFile } = useContext(AppContext);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!sessionId) return;
      setIsLoading(true);
      setError(null);
      try {
        const dashboardData = await api.getDashboard(sessionId);
        setData(dashboardData);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to retrieve dashboard analytics.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, [sessionId]);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!sessionId) return;
      setInsightsLoading(true);
      setInsightsError(null);
      try {
        const res = await api.getInsights(sessionId);
        setInsights(res.insights);
      } catch (err) {
        setInsightsError('Failed to load AI data insights.');
      } finally {
        setInsightsLoading(false);
      }
    };
    fetchInsights();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-850 border-t-brand-500 animate-spin"></div>
        <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">
          Analyzing metrics and generating charts...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-950/20 border border-rose-900/60 p-5 rounded-2xl text-rose-300 text-sm flex items-start space-x-3">
        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  if (!data) return null;

  // Chart color palette
  const CHART_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#a855f7'];

  // Heatmap helper for cell background color grading
  const getHeatmapColor = (val) => {
    // Pearson correlation lies between -1.0 and +1.0
    // Positive values: Blue/Indigo scale. Negative values: Rose/Red scale.
    if (val >= 0) {
      return `rgba(99, 102, 241, ${val * 0.8})`; // indigo-500 alpha based
    } else {
      return `rgba(244, 63, 94, ${Math.abs(val) * 0.8})`; // rose-500 alpha based
    }
  };

  return (
    <div className="space-y-6">
      {/* Profiling and Cleaning Summary (Collapsible) */}
      {uploadedFile && uploadedFile.cleaningReport && (
        <DataHealthCard report={uploadedFile.cleaningReport} />
      )}

      {/* AI Business Insights Panel */}
      {insightsLoading ? (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4 animate-pulse">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/5"></div>
          </div>
        </div>
      ) : insightsError ? (
        <div className="bg-rose-950/10 border border-rose-900/30 p-4 rounded-xl text-rose-450 text-xs flex items-center space-x-2">
          <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{insightsError}</span>
        </div>
      ) : insights && insights.length > 0 ? (
        <div className="bg-gradient-to-r from-indigo-500/10 via-brand-500/5 to-transparent border border-brand-500/30 dark:border-brand-500/20 p-5 md:p-6 rounded-3xl shadow-sm relative overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-4 relative z-10">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-brand-600 dark:text-indigo-300">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-sm md:text-base text-brand-700 dark:text-indigo-300">AI-Powered Automated Insights</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Automatic statistical observations and business metrics analysis.</p>
            </div>
          </div>
          {/* List of Insights */}
          <ul className="space-y-3 relative z-10">
            {insights.map((insight, idx) => (
              <li key={idx} className="text-xs md:text-sm font-semibold flex items-start space-x-3 text-slate-700 dark:text-slate-300">
                <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center mt-0.5 shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="leading-relaxed leading-normal">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Metric Tiles */}
      <KPIRow cards={data.kpi_cards} />

      {/* Dashboard Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Categorical Bar Chart */}
        {data.bar_chart.data.length > 0 && (
          <ChartCard title={`Top Categories by ${data.bar_chart.y_axis.replace('_', ' ').toUpperCase()}`} chartId="bar-chart-card">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.bar_chart.data} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis
                  dataKey={data.bar_chart.x_axis}
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dx={-5}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey={data.bar_chart.y_axis} radius={[6, 6, 0, 0]}>
                  {data.bar_chart.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Time-Series / Sequential Line Chart */}
        {data.line_chart.data.length > 0 && (
          <ChartCard title={`Revenue Trends over time (${data.line_chart.y_axis.replace('_', ' ').toUpperCase()})`} chartId="line-chart-card">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.line_chart.data} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis
                  dataKey={data.line_chart.x_axis}
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dx={-5}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={data.line_chart.y_axis}
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorLine)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Category Share Pie Chart */}
        {data.pie_chart.data.length > 0 && (
          <ChartCard title="Category Distribution Shares" chartId="pie-chart-card">
            <div className="flex flex-col sm:flex-row items-center justify-center h-[300px]">
              <div className="w-full sm:w-1/2 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.pie_chart.data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey={data.pie_chart.value_key}
                      nameKey={data.pie_chart.name_key}
                    >
                      {data.pie_chart.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 px-4 max-h-[220px] overflow-y-auto">
                <ul className="space-y-2">
                  {data.pie_chart.data.map((entry, idx) => {
                    const label = entry[data.pie_chart.name_key];
                    const val = entry[data.pie_chart.value_key];
                    return (
                      <li key={idx} className="flex items-center space-x-2.5 text-xs font-semibold">
                        <span className="w-3.5 h-3.5 rounded-md shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></span>
                        <span className="text-slate-600 dark:text-slate-300 truncate max-w-[120px]" title={label}>{label}</span>
                        <span className="font-mono text-slate-500 font-bold ml-auto">{val.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </ChartCard>
        )}

        {/* Numeric Features Pearson Correlation Heatmap */}
        {data.heatmap.columns.length > 0 && (
          <ChartCard title="Pearson Correlation Heatmap (Numeric Columns)" chartId="correlation-heatmap-card">
            <div className="flex flex-col justify-between h-full py-2">
              <div className="overflow-x-auto">
                <div className="min-w-[320px] flex flex-col">
                  {/* Heatmap column headers */}
                  <div className="flex items-center">
                    {/* Padding cell for row names */}
                    <div className="w-20 md:w-24 shrink-0"></div>
                    <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${data.heatmap.columns.length}, minmax(0, 1fr))` }}>
                      {data.heatmap.columns.map((col) => (
                        <span key={col} className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight text-center py-2 truncate" title={col}>
                          {col.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Heatmap matrix rows */}
                  <div className="space-y-1">
                    {data.heatmap.columns.map((rowLabel, rIdx) => (
                      <div key={rowLabel} className="flex items-center">
                        {/* Row header label */}
                        <span className="w-20 md:w-24 text-[9px] md:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight truncate pr-2 text-right">
                          {rowLabel.replace('_', ' ')}
                        </span>
                        
                        {/* Grid cells */}
                        <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${data.heatmap.columns.length}, minmax(0, 1fr))` }}>
                          {data.heatmap.matrix[rIdx].map((cellValue, cIdx) => (
                            <div
                              key={cIdx}
                              className="aspect-square rounded-lg flex items-center justify-center text-[10px] md:text-xs font-mono font-bold select-none border border-slate-200/20 dark:border-slate-800/10 hover:scale-105 hover:z-10 transition duration-150"
                              style={{
                                backgroundColor: getHeatmapColor(cellValue),
                                color: Math.abs(cellValue) > 0.4 ? '#ffffff' : '#94a3b8'
                              }}
                              title={`Correlation between ${rowLabel} and ${data.heatmap.columns[cIdx]}: ${cellValue.toFixed(2)}`}
                            >
                              {cellValue >= 0 ? '+' : ''}{cellValue.toFixed(2)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center justify-center space-x-6 pt-4 text-[10px] font-semibold text-slate-500">
                <span className="flex items-center space-x-1">
                  <span className="w-3.5 h-3.5 rounded bg-rose-500"></span>
                  <span>Negative (-1.0)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850"></span>
                  <span>Neutral (0.0)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-3.5 h-3.5 rounded bg-indigo-500"></span>
                  <span>Positive (+1.0)</span>
                </span>
              </div>
            </div>
          </ChartCard>
        )}
        
      </div>
    </div>
  );
};

export default Dashboard;
