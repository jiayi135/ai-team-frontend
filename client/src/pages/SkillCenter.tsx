import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Zap,
  Search,
  RefreshCw,
  Toggle2,
  Code,
  Settings,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

interface MCPServer {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  tools: number;
  lastUpdated: string;
  enabled: boolean;
  description?: string;
  port?: number;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  server: string;
  enabled: boolean;
  usage: number;
  lastUsed?: string;
  parameters?: string[];
}

export default function SkillCenter() {
  const [servers, setServers] = useState<MCPServer[]>([
    {
      id: 'mcp-1',
      name: 'Hugging Face MCP',
      type: 'hugging-face',
      status: 'connected',
      tools: 12,
      lastUpdated: '2 分钟前',
      enabled: true,
      description: 'Access Hugging Face models and datasets',
      port: 3001,
    },
    {
      id: 'mcp-2',
      name: 'Cloudflare MCP',
      type: 'cloudflare',
      status: 'connected',
      tools: 8,
      lastUpdated: '5 分钟前',
      enabled: true,
      description: 'Cloudflare Workers and storage integration',
      port: 3002,
    },
  ]);

  const [skills, setSkills] = useState<Skill[]>([
    {
      id: 'skill-1',
      name: '模型搜索',
      description: '在 Hugging Face 上搜索和发现 AI 模型',
      category: 'Search',
      server: 'mcp-1',
      enabled: true,
      usage: 45,
      lastUsed: '1 小时前',
      parameters: ['query', 'limit', 'filter'],
    },
    {
      id: 'skill-2',
      name: '数据集管理',
      description: '浏览和管理 Hugging Face 数据集',
      category: 'Data',
      server: 'mcp-1',
      enabled: true,
      usage: 23,
      lastUsed: '3 小时前',
      parameters: ['dataset_id', 'split', 'limit'],
    },
    {
      id: 'skill-3',
      name: 'Workers 部署',
      description: '部署和管理 Cloudflare Workers',
      category: 'Deployment',
      server: 'mcp-2',
      enabled: true,
      usage: 12,
      lastUsed: '昨天',
      parameters: ['script', 'route', 'environment'],
    },
    {
      id: 'skill-4',
      name: 'R2 存储',
      description: 'Cloudflare R2 对象存储管理',
      category: 'Storage',
      server: 'mcp-2',
      enabled: false,
      usage: 5,
      parameters: ['bucket', 'key', 'action'],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [...new Set(skills.map(s => s.category))];

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleSkill = (skillId: string) => {
    setSkills(prev =>
      prev.map(s => s.id === skillId ? { ...s, enabled: !s.enabled } : s)
    );
    toast.success('技能状态已更新');
  };

  const handleToggleServer = (serverId: string) => {
    setServers(prev =>
      prev.map(s => s.id === serverId ? { ...s, enabled: !s.enabled } : s)
    );
    toast.success('服务器状态已更新');
  };

  const handleRefreshServers = async () => {
    setIsLoading(true);
    try {
      // 模拟刷新服务器列表
      await new Promise(resolve => setTimeout(resolve, 1500));
      setServers(prev =>
        prev.map(s => ({
          ...s,
          lastUpdated: '刚刚',
          status: Math.random() > 0.2 ? 'connected' : 'error',
        }))
      );
      toast.success('服务器列表已刷新');
    } catch (error) {
      toast.error('刷新失败');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: MCPServer['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="text-green-500" size={16} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={16} />;
      default:
        return <AlertCircle className="text-yellow-500" size={16} />;
    }
  };

  const getStatusColor = (status: MCPServer['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <MainLayout
      title="技能中心"
      subtitle="MCP 服务器与技能管理 - 类似 Manus 的卡片式交互平台"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* MCP Servers Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">MCP 服务器</h2>
              <p className="text-slate-500 mt-1">已连接的 Model Context Protocol 服务器</p>
            </div>
            <Button
              onClick={handleRefreshServers}
              disabled={isLoading}
              variant="outline"
              className="border-slate-200"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              刷新
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {servers.map(server => (
              <Card key={server.id} className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{server.name}</CardTitle>
                        <Badge className={`text-xs ${getStatusColor(server.status)}`}>
                          {getStatusIcon(server.status)}
                          <span className="ml-1">{server.status === 'connected' ? '已连接' : server.status === 'error' ? '错误' : '未连接'}</span>
                        </Badge>
                      </div>
                      <CardDescription>{server.description}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleServer(server.id)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {server.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">技能数量</p>
                      <p className="text-2xl font-bold text-slate-900">{server.tools}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">端口</p>
                      <p className="text-2xl font-bold text-slate-900">{server.port}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>最后更新: {server.lastUpdated}</span>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      <Settings size={14} className="mr-1" />
                      配置
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">可用技能</h2>
            
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  placeholder="搜索技能..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-200"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                    className="border-slate-200"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map(skill => {
              const server = servers.find(s => s.id === skill.server);
              return (
                <Card
                  key={skill.id}
                  className={`border-2 transition-all cursor-pointer hover:shadow-lg ${
                    skill.enabled
                      ? 'border-blue-200 bg-blue-50/30'
                      : 'border-slate-100 bg-slate-50/30 opacity-60'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-base">{skill.name}</CardTitle>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {skill.category}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleSkill(skill.id)}
                        className={`${skill.enabled ? 'text-blue-600' : 'text-slate-400'}`}
                      >
                        <Toggle2 size={18} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600">{skill.description}</p>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-700">参数</p>
                      <div className="flex flex-wrap gap-1">
                        {skill.parameters?.map(param => (
                          <Badge key={param} variant="outline" className="text-xs">
                            {param}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                      <span>使用次数: {skill.usage}</span>
                      {skill.lastUsed && <span>{skill.lastUsed}</span>}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-600">服务器:</span>
                      <Badge variant="outline" className="text-xs">
                        {server?.name || '未知'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredSkills.length === 0 && (
            <div className="text-center py-12">
              <Zap className="mx-auto mb-3 text-slate-300" size={32} />
              <p className="text-slate-500">未找到匹配的技能</p>
            </div>
          )}
        </section>

        {/* Add New Skill Button */}
        <div className="flex justify-center">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
            <Plus className="mr-2 h-4 w-4" />
            添加新技能
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
