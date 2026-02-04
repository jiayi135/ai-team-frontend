import React from 'react';
import { 
  GitBranch, 
  AlertTriangle, 
  MessageSquare, 
  TrendingUp, 
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  Scale
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface Conflict {
  dimension: string;
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
}

interface DebateRound {
  round: number;
  agent: string;
  argument: string;
  evidence: string;
  timestamp: string;
}

interface NegotiationDetailProps {
  negotiation: {
    id: string;
    title: string;
    status: string;
    consensusScore: number;
    round: number;
    maxRounds: number;
    conflicts: Conflict[];
    debateHistory: DebateRound[];
    scoreHistory: { round: number; score: number }[];
  };
}

export default function NegotiationDetail({ negotiation }: NegotiationDetailProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'text-red-600 bg-red-50 border-red-100';
      case 'moderate': return 'text-orange-600 bg-orange-50 border-orange-100';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <GitBranch size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{negotiation.title}</h2>
              <p className="text-sm text-slate-500">协商 ID: {negotiation.id}</p>
            </div>
          </div>
          <Badge className="bg-blue-600 text-white px-3 py-1">
            {negotiation.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">当前共识评分</span>
              <span className="font-bold text-blue-600">{(negotiation.consensusScore * 100).toFixed(0)}%</span>
            </div>
            <Progress value={negotiation.consensusScore * 100} className="h-2" />
          </div>
          <div className="flex flex-col justify-center border-l border-slate-100 pl-6">
            <span className="text-xs text-slate-500 uppercase tracking-wider">当前轮次</span>
            <span className="text-lg font-bold text-slate-900">{negotiation.round} / {negotiation.maxRounds}</span>
          </div>
          <div className="flex flex-col justify-center border-l border-slate-100 pl-6">
            <span className="text-xs text-slate-500 uppercase tracking-wider">治理状态</span>
            <div className="flex items-center gap-2 text-green-600 font-bold">
              <CheckCircle2 size={18} />
              <span>符合宪法 P.R.O.M.P.T.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Conflicts & Score Trend */}
        <div className="lg:col-span-1 space-y-8">
          {/* Conflict Detection */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldAlert size={20} className="text-red-500" />
              七维冲突检测
            </h3>
            <div className="space-y-4">
              {negotiation.conflicts.map((conflict, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${getSeverityColor(conflict.severity)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">{conflict.dimension}</span>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {conflict.severity}
                    </Badge>
                  </div>
                  <p className="text-xs opacity-80 leading-relaxed">
                    {conflict.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Consensus Score Trend */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-500" />
              共识评分趋势
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={negotiation.scoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="round" hide />
                  <YAxis domain={[0, 1]} hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`${(Number(value) * 100).toFixed(0)}%`, '共识度']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#3b82f6' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-slate-50 rounded-lg flex items-center gap-3">
              <Scale size={18} className="text-slate-400" />
              <p className="text-xs text-slate-600">
                若连续两轮评分提升低于 <span className="font-bold text-blue-600">0.05</span>，将触发专家强制仲裁。
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Debate Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MessageSquare size={20} className="text-purple-500" />
              多轮辩论追踪 (Debate Tracing)
            </h3>
            <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {negotiation.debateHistory.map((item, idx) => (
                <div key={idx} className="relative pl-12">
                  <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center z-10 shadow-sm">
                    <span className="text-blue-600 font-bold text-sm">{item.round}</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-slate-900">{item.agent}</span>
                      <span className="text-xs text-slate-400">{item.timestamp}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed mb-4 italic">
                      "{item.argument}"
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                      <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                        <ExternalLink size={14} />
                        <span>证据锚定: {item.evidence}</span>
                      </div>
                      <button className="text-[10px] text-slate-400 hover:text-blue-600 uppercase tracking-widest font-bold">
                        查看原始 Trace
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {negotiation.status === '协商中' && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2 text-sm text-slate-400 animate-pulse">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>智能体正在生成下一轮辩论内容...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
