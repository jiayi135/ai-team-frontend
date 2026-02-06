import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, Key, Shield, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface LLMConfig {
  provider: string;
  apiKey: string;
  baseUrl: string;
  modelName: string;
}

export default function Settings() {
  const [config, setConfig] = useState<LLMConfig>({
    provider: 'openai',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-4o',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem('ai_team_llm_config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Failed to parse saved config');
      }
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    // 模拟保存过程
    setTimeout(() => {
      localStorage.setItem('ai_team_llm_config', JSON.stringify(config));
      setIsSaving(false);
      toast.success('配置已保存', {
        description: '您的 API 设置已成功存储在本地。',
      });
    }, 800);
  };

  const providers = [
    { id: 'openai', name: 'OpenAI', defaultUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o' },
    { id: 'deepseek', name: 'DeepSeek', defaultUrl: 'https://api.deepseek.com', defaultModel: 'deepseek-chat' },
    { id: 'anthropic', name: 'Anthropic (via Proxy)', defaultUrl: '', defaultModel: 'claude-3-5-sonnet-latest' },
    { id: 'google', name: 'Google Gemini', defaultUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', defaultModel: 'gemini-1.5-pro' },
    { id: 'z-ai', name: 'Zhipu AI (GLM)', defaultUrl: 'https://open.bigmodel.cn/api/paas/v4', defaultModel: 'glm-4.7' },
    { id: 'minimax', name: 'MiniMax', defaultUrl: 'https://api.minimax.chat/v1', defaultModel: 'MiniMax-M2.1' },
    { id: 'nvidia', name: 'NVIDIA', defaultUrl: 'https://integrate.api.nvidia.com/v1', defaultModel: 'nvidia/llama-3.1-405b-instruct' },
    { id: 'local', name: 'Local / Ollama', defaultUrl: 'http://localhost:11434/v1', defaultModel: 'llama3' },
  ];

  const handleProviderChange = (value: string) => {
    const provider = providers.find(p => p.id === value);
    if (provider) {
      // Use functional update to ensure state consistency
      setConfig(prev => ({
        ...prev,
        provider: value,
        baseUrl: provider.defaultUrl,
        modelName: provider.defaultModel,
      }));
    }
  };

  return (
    <MainLayout
      title="系统设置"
      subtitle="配置通用模型 API 与治理参数 (Article III: 经济保障)"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* API Configuration Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Key className="text-blue-600" size={20} />
                </div>
                <div>
                  <CardTitle>模型 API 配置</CardTitle>
                  <CardDescription>输入您的通用模型 API 密钥以激活 AI 团队能力</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Shield size={12} className="mr-1" /> 本地加密存储
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">模型供应商</label>
                {/* Add key to Select to force re-render on provider change, preventing DOM sync issues */}
                <Select 
                  key={`provider-${config.provider}`}
                  value={config.provider} 
                  onValueChange={handleProviderChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择供应商" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">模型名称</label>
                <Input 
                  value={config.modelName} 
                  onChange={(e) => setConfig({...config, modelName: e.target.value})}
                  placeholder="例如: gpt-4o" 
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-slate-700">API Base URL</label>
                <Input 
                  value={config.baseUrl} 
                  onChange={(e) => setConfig({...config, baseUrl: e.target.value})}
                  placeholder="https://api.openai.com/v1" 
                />
                <p className="text-xs text-slate-500">留空则使用供应商默认地址</p>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-slate-700">API Key</label>
                <div className="relative">
                  <Input 
                    type="password"
                    value={config.apiKey} 
                    onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                    placeholder="sk-..." 
                    className="pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Shield size={16} />
                  </div>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Info size={12} /> 密钥仅存储在您的浏览器本地缓存中，不会上传到我们的服务器。
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={isSaving || !config.apiKey}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    保存中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save size={18} /> 保存配置
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Governance Parameters Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="text-purple-600" size={20} />
              </div>
              <div>
                <CardTitle>治理参数 (P.R.O.M.P.T. 宪法)</CardTitle>
                <CardDescription>调整 AI 团队的协作行为与限制</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">最大协商轮数</span>
                  <Badge variant="secondary">5 轮</Badge>
                </div>
                <p className="text-xs text-slate-500">Article III 规定，防止无限循环辩论。</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">单次任务预算上限</span>
                  <Badge variant="secondary">$10.00</Badge>
                </div>
                <p className="text-xs text-slate-500">Article III 经济保障，超出将强制熔断。</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">元认知审计强度</span>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">高 (Strict)</Badge>
                </div>
                <p className="text-xs text-slate-500">Article I 要求，每步操作必须经过自我审计。</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">溯源验证要求</span>
                  <Badge className="bg-green-100 text-green-700 border-green-200">强制 (Mandatory)</Badge>
                </div>
                <p className="text-xs text-slate-500">Article V 要求，所有事实断言必须附带来源。</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Check */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
          <div className="text-sm text-amber-800">
            <p className="font-bold mb-1">上架准备提示</p>
            <p>在发布到生产环境前，请确保您已在 Vercel 或其他平台设置了 <code>NODE_ENV=production</code>。系统将自动启用宪法护栏与成本熔断机制。</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
