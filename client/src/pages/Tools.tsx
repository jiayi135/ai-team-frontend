import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  Wrench,
  Search,
  RefreshCw,
  Play,
  Terminal,
  Settings,
  Database,
  Github,
  Cloud,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface McpTool {
  name: string;
  server: string;
  description: string;
  inputSchema: any;
}

export default function Tools() {
  const [tools, setTools] = useState<McpTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<McpTool | null>(null);
  const [toolArgs, setToolArgs] = useState<string>('{}');
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const API_BASE = '/api/mcp';

  const fetchTools = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const endpoint = refresh ? `${API_BASE}/discovery/refresh` : `${API_BASE}/tool/list`;
      const response = await fetch(endpoint, { method: refresh ? 'POST' : 'GET' });
      const data = await response.json();

      if (data.success) {
        setTools(data.tools);
        if (refresh) toast.success('工具列表已更新');
      } else {
        toast.error('获取工具列表失败');
      }
    } catch (error) {
      console.error('Failed to fetch tools:', error);
      toast.error('网络连接错误');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleCallTool = async () => {
    if (!selectedTool) return;

    setExecuting(true);
    setExecutionResult(null);

    try {
      let args = {};
      try {
        args = JSON.parse(toolArgs);
      } catch (e) {
        toast.error('参数格式错误，请确保是有效的 JSON');
        setExecuting(false);
        return;
      }

      const response = await fetch(`${API_BASE}/tool/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server: selectedTool.server,
          tool: selectedTool.name,
          args
        })
      });

      const data = await response.json();
      if (data.success) {
        setExecutionResult(data.result);
        toast.success('工具执行成功');
      } else {
        setExecutionResult({ error: data.error });
        toast.error('工具执行失败');
      }
    } catch (error: any) {
      setExecutionResult({ error: error.message });
      toast.error('工具调用过程中发生错误');
    } finally {
      setExecuting(false);
    }
  };

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.server.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getServerIcon = (server: string) => {
    switch (server.toLowerCase()) {
      case 'github': return <Github size={16} />;
      case 'vercel': return <Cloud size={16} />;
      case 'cloudflare': return <Database size={16} />;
      default: return <Wrench size={16} />;
    }
  };

  return (
    <MainLayout
      title="工具管理"
      subtitle="MCP (Model Context Protocol) 插件系统管理与即时调试"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tool List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                placeholder="搜索工具..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchTools(true)}
              disabled={refreshing}
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </Button>
          </div>

          <Card className="max-h-[calc(100vh-250px)] overflow-y-auto">
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">可用工具 ({filteredTools.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                  <p className="text-sm text-slate-500">正在检索 MCP 工具目录...</p>
                </div>
              ) : filteredTools.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {filteredTools.map((tool) => (
                    <button
                      key={`${tool.server}:${tool.name}`}
                      onClick={() => setSelectedTool(tool)}
                      className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3 ${
                        selectedTool?.name === tool.name && selectedTool?.server === tool.server
                          ? 'bg-blue-50 border-r-4 border-blue-500'
                          : ''
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        selectedTool?.name === tool.name && selectedTool?.server === tool.server
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {getServerIcon(tool.server)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{tool.name}</p>
                        <p className="text-xs text-slate-500 truncate">{tool.server}</p>
                      </div>
                      <ChevronRight size={14} className="text-slate-300" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Info className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-sm text-slate-500">未找到匹配的工具</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tool Details & Console */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTool ? (
            <>
              <Card className="border-2 border-blue-100 shadow-md">
                <CardHeader className="bg-blue-50/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
                        {selectedTool.server.toUpperCase()} SERVER
                      </Badge>
                      <CardTitle className="text-2xl font-bold text-slate-900">{selectedTool.name}</CardTitle>
                      <CardDescription className="mt-1 text-slate-600">
                        {selectedTool.description}
                      </CardDescription>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-blue-100 flex items-center justify-center text-blue-500">
                      {getServerIcon(selectedTool.server)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <Tabs defaultValue="invoke">
                    <TabsList className="mb-4">
                      <TabsTrigger value="invoke" className="gap-2">
                        <Play size={14} /> 即时调用
                      </TabsTrigger>
                      <TabsTrigger value="schema" className="gap-2">
                        <Terminal size={14} /> 参数定义
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="invoke" className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">调用参数 (JSON)</label>
                        <div className="relative">
                          <textarea
                            className="w-full min-h-[150px] p-4 font-mono text-sm bg-slate-900 text-blue-300 rounded-lg border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={toolArgs}
                            onChange={(e) => setToolArgs(e.target.value)}
                            placeholder='{ "key": "value" }'
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleCallTool}
                        className="w-full bg-blue-600 hover:bg-blue-700 gap-2 h-11"
                        disabled={executing}
                      >
                        {executing ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                        执行工具操作
                      </Button>
                    </TabsContent>

                    <TabsContent value="schema">
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <pre className="text-xs font-mono overflow-x-auto">
                          {JSON.stringify(selectedTool.inputSchema, null, 2)}
                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Execution Console */}
              {(executionResult || executing) && (
                <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
                  <CardHeader className="border-b border-slate-800 py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                        <Terminal size={16} />
                        输出控制台
                      </CardTitle>
                      {executionResult && !executionResult.error && (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">SUCCESS</Badge>
                      )}
                      {executionResult?.error && (
                        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">ERROR</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[300px] overflow-y-auto p-4 font-mono text-xs text-blue-200">
                      {executing ? (
                        <div className="flex items-center gap-2 animate-pulse">
                          <span>{'>'} Sending command to {selectedTool.server}...</span>
                        </div>
                      ) : (
                        <pre>{JSON.stringify(executionResult, null, 2)}</pre>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mb-6 text-slate-300">
                <Wrench size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">未选择工具</h3>
              <p className="text-slate-500 max-w-sm">
                从左侧列表中选择一个 MCP 工具来查看其详细信息并执行即时调用测试。
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-12 bg-blue-50 rounded-xl border border-blue-100 p-6">
        <h4 className="flex items-center gap-2 font-bold text-blue-900 mb-3">
          <Info size={18} />
          关于 MCP 插件生态系统
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <p>
            <strong>什么是 MCP？</strong> Model Context Protocol 是由 Anthropic 提出的开放标准，允许 AI 模型与外部工具和数据源进行安全交互。
          </p>
          <p>
            <strong>治理审计：</strong> 所有通过此界面执行的工具调用都会被记录在系统的审计日志中，确保 AI 团队的行为可追溯、可审计。
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
