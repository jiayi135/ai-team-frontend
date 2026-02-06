import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { getNegotiationStatusColor } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ChevronRight, Search, GitBranch, RefreshCw, Loader2 } from 'lucide-react';
import NegotiationDetail from '@/components/negotiation/NegotiationDetail';
import { useSocket } from '@/hooks/useSocket';

interface Conflict {
  dimension: string;
  severity: string;
  description: string;
}

interface DebateEntry {
  round: number;
  agent: string;
  argument: string;
  evidence: string;
  timestamp: string;
}

interface ScoreHistory {
  round: number;
  score: number;
}

interface ArbitrationDecision {
  decision: string;
  reasoning: string;
  impact: string;
  constitutionalClause?: string;
}

interface Negotiation {
  id: string;
  title: string;
  description?: string;
  status: string;
  consensusScore: number;
  round: number;
  maxRounds: number;
  conflicts: Conflict[];
  participants: string[];
  startTime: string;
  endTime?: string;
  debateHistory: DebateEntry[];
  scoreHistory: ScoreHistory[];
  arbitrationDecision?: ArbitrationDecision;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Negotiations() {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { socket, isConnected } = useSocket();

  // 获取协商列表
  const fetchNegotiations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/api/negotiations`);
      const result = await response.json();
      
      if (result.success && result.negotiations) {
        setNegotiations(result.negotiations);
        // 自动选择第一个
        if (result.negotiations.length > 0 && !selectedId) {
          setSelectedId(result.negotiations[0].id);
        }
      } else {
        setError(result.error || '获取协商列表失败');
      }
    } catch (err: any) {
      setError(err.message || '网络请求失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchNegotiations();
  }, []);

  // WebSocket 实时更新
  useEffect(() => {
    if (socket) {
      socket.on('negotiation_updated', (updatedNegotiation: Negotiation) => {
        setNegotiations(prev => {
          const index = prev.findIndex(n => n.id === updatedNegotiation.id);
          if (index !== -1) {
            const newList = [...prev];
            newList[index] = updatedNegotiation;
            return newList;
          } else {
            return [updatedNegotiation, ...prev];
          }
        });
      });

      return () => {
        socket.off('negotiation_updated');
      };
    }
  }, [socket]);

  // 过滤协商
  const filteredNegotiations = negotiations.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.id.toLowerCase().includes(search.toLowerCase())
  );

  const selectedNegotiation = negotiations.find(n => n.id === selectedId);

  return (
    <MainLayout
      title="协商可视化"
      subtitle={`多智能体共识构建与冲突解决追踪 (自主协商引擎) | WebSocket: ${isConnected ? '在线' : '离线'}`}
    >
      <div className="flex flex-col xl:flex-row gap-8">
        {/* Left: List */}
        <div className="xl:w-1/3 space-y-6">
          {/* Search and Refresh */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="搜索协商事件..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={fetchNegotiations}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
              title="刷新列表"
            >
              <RefreshCw size={18} className={`text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && negotiations.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          )}

          {/* Negotiation List */}
          <div className="space-y-3">
            {filteredNegotiations.map((n) => (
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
                    {n.round} / {n.maxRounds} 轮
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
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className="text-[10px]"
                      style={{ 
                        backgroundColor: getNegotiationStatusColor(n.status) + '20',
                        color: getNegotiationStatusColor(n.status)
                      }}
                    >
                      {n.status}
                    </Badge>
                    <ChevronRight size={16} className={selectedId === n.id ? 'text-blue-500' : 'text-slate-300'} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {!isLoading && filteredNegotiations.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              {search ? '未找到匹配的协商事件' : '暂无协商事件'}
            </div>
          )}

          {/* Protocol Reminder */}
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
            <h5 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
              <AlertCircle size={16} />
              协商协议提醒 (Article III)
            </h5>
            <p className="text-xs text-purple-800 leading-relaxed">
              系统当前运行于<strong>自主协商模式</strong>。单次协商事件硬性限制为 5 轮，超时阈值 300s，单次成本上限 $10.00 USD。
            </p>
          </div>
        </div>

        {/* Right: Detail */}
        <div className="xl:flex-1">
          {selectedNegotiation ? (
            <NegotiationDetail negotiation={selectedNegotiation} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center min-h-[400px]">
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
