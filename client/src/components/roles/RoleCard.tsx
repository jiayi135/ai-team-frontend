import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RoleCardProps {
  title: string;
  description: string;
  responsibilities: readonly string[];
  restrictions: string;
  color: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

const colorMap = {
  orange: 'border-orange-200 bg-orange-50',
  blue: 'border-blue-200 bg-blue-50',
  purple: 'border-purple-200 bg-purple-50',
  green: 'border-green-200 bg-green-50',
  gray: 'border-gray-200 bg-gray-50',
};

const badgeColorMap = {
  orange: 'bg-orange-100 text-orange-800',
  blue: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
  green: 'bg-green-100 text-green-800',
  gray: 'bg-gray-100 text-gray-800',
};

export default function RoleCard({
  title,
  description,
  responsibilities,
  restrictions,
  color,
  icon,
  isActive = false,
}: RoleCardProps) {
  const colorClass = colorMap[color as keyof typeof colorMap] || colorMap.blue;
  const badgeColor = badgeColorMap[color as keyof typeof badgeColorMap] || badgeColorMap.blue;

  return (
    <div
      className={cn(
        'rounded-lg border-2 p-6 transition-all hover:shadow-lg',
        colorClass,
        isActive && 'ring-2 ring-offset-2 ring-blue-500'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && <div className="text-3xl">{icon}</div>}
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
        </div>
        {isActive && <Badge className={badgeColor}>Active</Badge>}
      </div>

      {/* Responsibilities */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Responsibilities</h4>
        <ul className="space-y-1">
          {responsibilities.map((resp, idx) => (
            <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>{resp}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Restrictions */}
      <div className="bg-white/60 rounded p-3 border border-slate-200">
        <p className="text-xs font-semibold text-slate-900 mb-1">Boundary Restriction</p>
        <p className="text-xs text-slate-600">{restrictions}</p>
      </div>
    </div>
  );
}
