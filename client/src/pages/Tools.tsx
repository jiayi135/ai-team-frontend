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
  const [toolInputs, setToolInputs] = useState<Record<string, any>>({});
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  // Load tools on component mount
  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Use the newly created /api/mcp-tools endpoint
      const response = await fetch('/api/mcp-tools');
      const data = await response.json();

      if (data.success) {
        setTools(data.tools || []);
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

  const handleToolSelect = (tool: McpTool) => {
    setSelectedTool(tool);
    setToolInputs({});
    setExecutionResult(null);
  };

  const handleInputChange = (paramName: string, value: any) => {
    setToolInputs(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleCallTool = async () => {
    if (!selectedTool) return;

    setExecuting(true);
    setExecutionResult(null);

    try {
      const response = await fetch('/api/mcp-tools/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: selectedTool.name,
          server: selectedTool.server,
          inputArgs: toolInputs
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

  const getInputFields = () => {
    if (!selectedTool?.inputSchema) return [];
    
    const properties = selectedTool.inputSchema.properties || {};
    return Object.entries(properties).map(([key, value]: [string, any]) => ({
      name: key,
      type: value.type || 'string',
      description: value.description || '',
      required: selectedTool.inputSchema.required?.includes(key) || false
    }));
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
                      onClick={() => handleToolSelect(tool)}
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
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                  <AlertCircle size={32} />
                  <p className="text-sm">未找到匹配的工具</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tool Details & Debugger */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTool ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        {getServerIcon(selectedTool.server)}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{selectedTool.name}</CardTitle>
                        <CardDescription>来自服务器: {selectedTool.server}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      已就绪
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Info size={16} className="text-blue-500" />
                      功能描述
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {selectedTool.description}
                    </p>
                  </div>

                  <Tabs defaultValue="params">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="params">参数配置</TabsTrigger>
                      <TabsTrigger value="schema">输入架构 (JSON Schema)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="params" className="pt-4 space-y-4">
                      {getInputFields().length > 0 ? (
                        getInputFields().map((field) => (
                          <div key={field.name}>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              {field.name}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {field.description && (
                              <p className="text-xs text-slate-500 mb-2">{field.description}</p>
                            )}
                            <Input
                              type={field.type === 'number' ? 'number' : 'text'}
                              value={toolInputs[field.name] || ''}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              placeholder={`输入 ${field.name}...`}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="bg-slate-50 p-4 rounded-lg text-center text-sm text-slate-500">
                          此工具不需要任何参数。
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="schema" className="pt-4">
                      <pre className="text-xs bg-slate-900 text-slate-300 p-4 rounded-lg overflow-auto max-h-64">
                        {JSON.stringify(selectedTool.inputSchema, null, 2)}
                      </pre>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="border-t bg-slate-50/50 py-4 flex justify-between">
                  <div className="text-xs text-slate-400">
                    P.R.O.M.P.T. 治理框架 - MCP 动态调用引擎
                  </div>
                  <Button
                    onClick={handleCallTool}
                    disabled={executing}
                    className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
                  >
                    {executing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        正在执行...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        立即执行
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {executionResult && (
                <Card className={`border-2 ${executionResult.error ? 'border-red-200' : 'border-green-200'}`}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Terminal size={16} />
                      执行结果
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`p-4 rounded-lg ${executionResult.error ? 'bg-red-50' : 'bg-slate-900'}`}>
                      {executionResult.error ? (
                        <div className="flex items-start gap-2 text-red-700 text-sm">
                          <AlertCircle size={16} className="mt-0.5" />
                          <p>{executionResult.error}</p>
                        </div>
                      ) : (
                        <pre className="text-xs text-green-400 overflow-auto max-h-96">
                          {JSON.stringify(executionResult, null, 2)}
                        </pre>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 py-20 border-2 border-dashed rounded-xl">
              <div className="p-4 bg-slate-100 rounded-full">
                <Wrench size={48} />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-slate-900">未选择工具</h3>
                <p className="text-sm">从左侧列表中选择一个 MCP 工具进行管理和调试</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
