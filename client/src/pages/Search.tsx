import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { 
  Search as SearchIcon, 
  ExternalLink, 
  Clock, 
  Loader2, 
  Globe, 
  History,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source?: string;
}

interface SearchResponse {
  success: boolean;
  query: string;
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  error?: string;
}

interface SearchHistoryItem {
  query: string;
  timestamp: string;
  resultCount: number;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const { isConnected } = useSocket();

  // 获取搜索历史
  const fetchSearchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/search/history?limit=10`);
      const data = await response.json();
      if (data.success) {
        setSearchHistory(data.history);
      }
    } catch (err) {
      console.error('Failed to fetch search history:', err);
    }
  };

  useEffect(() => {
    fetchSearchHistory();
  }, []);

  // 执行搜索
  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setError(null);
    setShowHistory(false);

    try {
      const response = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(q)}&limit=10`);
      const data: SearchResponse = await response.json();

      if (data.success) {
        setResults(data.results);
        setSearchTime(data.searchTime);
        setTotalResults(data.totalResults);
        // 刷新搜索历史
        fetchSearchHistory();
      } else {
        setError(data.error || '搜索失败');
        setResults([]);
      }
    } catch (err: any) {
      setError(err.message || '网络请求失败');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 点击历史记录
  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    handleSearch(historyQuery);
  };

  // 获取来源颜色
  const getSourceColor = (source?: string): string => {
    if (!source) return '#6b7280';
    if (source.includes('DuckDuckGo')) return '#de5833';
    if (source.includes('Google')) return '#4285f4';
    if (source.includes('Bing')) return '#008373';
    if (source.includes('Wikipedia')) return '#000000';
    if (source.includes('GitHub')) return '#333333';
    if (source.includes('Stack Overflow')) return '#f48024';
    return '#6b7280';
  };

  return (
    <MainLayout
      title="互联网搜索"
      subtitle={`AI 团队知识获取与信息检索 (Article V: 自主进化) | 实时: ${isConnected ? '在线' : '离线'}`}
    >
      {/* Search Input */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <Loader2 className="text-blue-500 animate-spin" size={20} />
            ) : (
              <SearchIcon className="text-slate-400" size={20} />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowHistory(true)}
            placeholder="输入搜索关键词，按 Enter 搜索互联网..."
            className="w-full pl-12 pr-32 py-4 text-lg rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all shadow-sm"
          />
          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Globe size={16} />
            搜索
          </button>
        </div>

        {/* Search History Dropdown */}
        {showHistory && searchHistory.length > 0 && !isLoading && results.length === 0 && (
          <div className="mt-2 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <History size={14} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-600">最近搜索</span>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {searchHistory.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleHistoryClick(item.query)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Clock size={14} className="text-slate-300" />
                    <span className="text-slate-700 group-hover:text-blue-600">{item.query}</span>
                  </div>
                  <span className="text-xs text-slate-400">{item.resultCount} 条结果</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-3xl mx-auto mb-6">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-red-800">搜索出错</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="max-w-3xl mx-auto">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Sparkles size={14} className="text-blue-500" />
              <span>找到 {totalResults} 条结果</span>
              {searchTime && <span>({searchTime}ms)</span>}
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {results.map((result, idx) => (
              <a
                key={idx}
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="outline" 
                        className="text-[10px] py-0"
                        style={{ 
                          color: getSourceColor(result.source),
                          borderColor: getSourceColor(result.source)
                        }}
                      >
                        {result.source || 'Web'}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-blue-700 group-hover:text-blue-800 mb-1 line-clamp-1">
                      {result.title}
                    </h3>
                    <p className="text-sm text-green-700 mb-2 truncate">
                      {result.url}
                    </p>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {result.snippet}
                    </p>
                  </div>
                  <ExternalLink 
                    size={18} 
                    className="text-slate-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" 
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && results.length === 0 && !error && (
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe size={40} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">互联网搜索</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              输入关键词搜索互联网，获取实时信息。搜索结果来自 DuckDuckGo 等多个来源。
            </p>
            
            {/* Quick Search Suggestions */}
            <div className="flex flex-wrap justify-center gap-2">
              {['React 最佳实践', 'TypeScript 教程', 'Node.js API 设计', 'AI 多智能体系统'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    handleSearch(suggestion);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded-full text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="max-w-3xl mx-auto mt-8">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <h5 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
            <AlertCircle size={16} />
            搜索功能说明 (Article V: 自主进化)
          </h5>
          <p className="text-xs text-blue-800 leading-relaxed">
            互联网搜索功能使用 <strong>DuckDuckGo Instant Answer API</strong>，无需 API Key，保护用户隐私。
            搜索结果包括即时答案、相关主题和外部链接。所有搜索记录将被记录到审计日志中。
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
