import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { getNegotiationStatusColor } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ChevronRight, Search, GitBranch } from 'lucide-react';
import NegotiationDetail from '@/components/negotiation/NegotiationDetail';

interface Negotiation {
  id: string;
  title: string;
  status: string;
  consensusScore: number;
  round: number;
  maxRounds: number;
  conflicts: any[];
  participants: string[];
  startTime: Date;
  debateHistory: any[];
  scoreHistory: { round: number; score: number }[];
}

const mockNegotiations: Negotiation[] = [
  {
    id: 'NEG-2026-001',
    title: '技术栈选型 - 数据库层',
    status: '协商中',
    consensusScore: 0.72,
    round: 2,
    maxRounds: 5,
    conflicts: [
      { dimension: '技术栈 (Tech Stack)', severity: 'moderate', description: '开发者提议使用 NoSQL 以提高扩展性，但架构师坚持使用 PostgreSQL 以保证强一致性。' },
      { dimension: '性能指标 (Performance Metrics)', severity: 'minor', description: '关于写入延迟的基准测试标准存在轻微分歧。' },
    ],
    participants: ['Architect', 'Developer', 'Algorithm Expert'],
    startTime: new Date(Date.now() - 3600000),
    scoreHistory: [
      { round: 1, score: 0.45 },
      { round: 2, score: 0.72 },
    ],
    debateHistory: [
      {
        round: 1,
        agent: 'Architect',
        argument: '基于宪法第 5 条强一致性要求，PostgreSQL 是唯一符合治理标准的选型。',
        evidence: 'Constitution_Article_V_Section_2',
        timestamp: '10:05:22'
      },
      {
        round: 2,
        agent: 'Developer',
        argument: '虽然一致性重要，但当前业务负载预测显示单机 RDBMS 将在 6 个月内达到瓶颈。',
        evidence: 'Load_Projection_Report_Q1',
        timestamp: '10:12:45'
      }
    ]
  },
  {
    id: 'NEG-2026-002',
    title: 'API 设计模式规范',
    status: '达成共识',
    consensusScore: 0.95,
    round: 3,
    maxRounds: 5,
    conflicts: [],
    participants: ['Architect', 'Developer', 'Tester'],
    startTime: new Date(Date.now() - 7200000),
    scoreHistory: [
      { round: 1, score: 0.60 },
      { round: 2, score: 0.82 },
      { round: 3, score: 0.95 },
    ],
    debateHistory: [
      {
        round: 3,
        agent: 'Tester',
        argument: '已验证 RESTful 规范符合自动化测试套件的接入标准。',
        evidence: 'Test_Suite_Compatibility_Matrix',
        timestamp: '09:15:00'
      }
    ]
  },
];

export default function Negotiations() {
  const [selectedId, setSelectedId] = useState<string | null>(mockNegotiations[0].id);
  const [search, setSearch] = useState('');

  const selectedNegotiation = mockNegotiations.find(n => n.id === selectedId);

  return (
    <MainLayout
      title="协商可视化"
      subtitle="多智能体共识构建与冲突解决追踪 (自主协商引擎)"
    >
      <div className="flex flex-col xl:flex-row gap-8">
        {/* Left: List */}
        <div className="xl:w-1/3 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="搜索协商事件..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {mockNegotiations.map((n) => (
              <div
                key={n.id}
                onClick={() => setSelectedId(n.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedId === n.id
                    ? 'border-blue-500 bg-blue-50/30 shadow-md'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <Badge 
                    variant="outline" 
                    className="text-[10px] font-mono"
                    style={{ color: getNegotiationStatusColor(n.status), borderColor: getNegotiationStatusColor(n.status) }}
                  >
                    {n.id}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {n.round} 轮辩论
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 mb-3 line-clamp-1">{n.title}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">共识度</span>
                    <span className="font-bold text-slate-900">{(n.consensusScore * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={n.consensusScore * 100} className="h-1.5" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {n.participants.map((p, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-600">
                        {p[0]}
                      </div>
                    ))}
                  </div>
                  <ChevronRight size={16} className={selectedId === n.id ? 'text-blue-500' : 'text-slate-300'} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
            <h5 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
              <AlertCircle size={16} />
              协商协议提醒
            </h5>
            <p className="text-xs text-purple-800 leading-relaxed">
              系统当前运行于<strong>自主协商模式</strong>。单次协商事件硬性限制为 5 轮，超时阈值 300s。
            </p>
          </div>
        </div>

        {/* Right: Detail */}
        <div className="xl:flex-1">
          {selectedNegotiation ? (
            <NegotiationDetail negotiation={selectedNegotiation} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <GitBranch size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">未选择协商事件</h3>
              <p className="text-slate-500 max-w-xs">请从左侧列表中选择一个协商事件以查看深度元认知追踪详情。</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
