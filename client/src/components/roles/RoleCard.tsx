import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronDown, Terminal } from 'lucide-react';
import RoleCapabilitiesPanel from './RoleCapabilitiesPanel';

interface RoleCardProps {
  title: string;
  description: string;
  responsibilities: readonly string[];
  restrictions: string;
  color: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  roleId?: string;
  systemPrompt?: string;
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
  roleId,
  systemPrompt
}: RoleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const colorClass = colorMap[color as keyof typeof colorMap] || colorMap.blue;
  const badgeColor = badgeColorMap[color as keyof typeof badgeColorMap] || badgeColorMap.blue;

  return (
    <div
      className={cn(
        'rounded-xl border-2 p-6 transition-all hover:shadow-lg h-full flex flex-col',
        colorClass,
        isActive && 'ring-2 ring-offset-2 ring-blue-500'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {icon && <div className="text-3xl flex-shrink-0">{icon}</div>}
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
        </div>
        {isActive && <Badge className={`${badgeColor} ml-2`}>Active</Badge>}
      </div>

      {/* Responsibilities */}
      <div className="mb-4 flex-grow">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">职责范围</h4>
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
      <div className="bg-white/60 rounded p-3 border border-slate-200 mb-4">
        <p className="text-xs font-semibold text-slate-900 mb-1">边界限制</p>
        <p className="text-xs text-slate-600">{restrictions}</p>
      </div>

      {/* System Prompt Section */}
      {systemPrompt && (
        <div className="mb-4">
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
          >
            <Terminal size={12} />
            {showPrompt ? '隐藏系统提示词' : '显示系统提示词 (宪法原文)'}
          </button>
          {showPrompt && (
            <div className="mt-2 p-3 bg-slate-900 rounded-lg border border-slate-800 shadow-inner">
              <pre className="text-[10px] font-mono text-blue-300 whitespace-pre-wrap leading-relaxed">
                {systemPrompt}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Capabilities Toggle */}
      {roleId && (
        <div className="mt-auto">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between p-3 bg-white/40 hover:bg-white/60 rounded-lg border border-slate-200/50 transition-all text-sm font-medium text-slate-900"
          >
            <span>查看绑定的工具与技能</span>
            <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>

          {expanded && (
            <div className="mt-4 pt-4 border-t border-slate-200/50">
              <RoleCapabilitiesPanel roleName={roleId} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
