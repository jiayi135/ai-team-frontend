import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  unit?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  trend?: 'up' | 'down' | 'neutral';
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-green-50 border-green-200',
  orange: 'bg-orange-50 border-orange-200',
  red: 'bg-red-50 border-red-200',
  purple: 'bg-purple-50 border-purple-200',
};

const iconColorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  orange: 'text-orange-600',
  red: 'text-red-600',
  purple: 'text-purple-600',
};

export default function KPICard({
  title,
  value,
  change,
  unit,
  icon,
  color = 'blue',
  trend,
}: KPICardProps) {
  return (
    <div className={cn('rounded-lg border p-6', colorClasses[color])}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
        </div>
        {icon && <div className={cn('text-2xl', iconColorClasses[color])}>{icon}</div>}
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900">{value}</span>
          {unit && <span className="text-sm text-slate-600">{unit}</span>}
        </div>
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1">
          {trend === 'up' && (
            <>
              <TrendingUp size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-600">+{change}%</span>
            </>
          )}
          {trend === 'down' && (
            <>
              <TrendingDown size={16} className="text-red-600" />
              <span className="text-sm font-medium text-red-600">{change}%</span>
            </>
          )}
          {!trend && <span className="text-sm text-slate-600">{change}%</span>}
        </div>
      )}
    </div>
  );
}
