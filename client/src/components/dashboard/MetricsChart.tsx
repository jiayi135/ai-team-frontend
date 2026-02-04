import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { generateTimeSeriesData } from '@/lib/utils';

interface MetricsChartProps {
  title: string;
  data?: Array<{ timestamp: string; value: number }>;
  baseValue?: number;
  variance?: number;
  color?: string;
  type?: 'line' | 'area';
}

export default function MetricsChart({
  title,
  data,
  baseValue = 1000,
  variance = 200,
  color = '#3b82f6',
  type = 'area',
}: MetricsChartProps) {
  const [chartData, setChartData] = useState(data || generateTimeSeriesData(20, baseValue, variance));

  useEffect(() => {
    if (!data) {
      const interval = setInterval(() => {
        setChartData((prev) => {
          const newData = generateTimeSeriesData(20, baseValue, variance);
          return newData;
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [data, baseValue, variance]);

  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  const DataComponent = type === 'area' ? Area : Line;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>

      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={chartData}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="timestamp" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            {type === 'area' ? (
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                fill={`url(#gradient-${title})`}
                strokeWidth={2}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
