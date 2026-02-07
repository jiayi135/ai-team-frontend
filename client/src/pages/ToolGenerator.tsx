import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Wrench, 
  Sparkles, 
  Terminal, 
  Play, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Code,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ToolGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('请输入工具需求描述');
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast.success('工具生成成功！');
      } else {
        toast.error('生成失败: ' + (data.error || '未知错误'));
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error('网络请求失败');
    } finally {
      setGenerating(false);
    }
  };

  const examples = [
    "创建一个搜索并总结 GitHub 热门仓库的工具",
    "生成一个自动检查代码规范并修复简单错误的脚本",
    "开发一个能获取当前天气并推荐穿搭的 MCP 工作流",
    "创建一个将 Markdown 转换为 PDF 的实用工具"
  ];

  return (
    <MainLayout 
      title="工具生成器" 
      subtitle="利用 AI 驱动的 P.R.O.M.P.T. 引擎，自动生成并部署自定义工具与工作流"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Input Section */}
        <Card className="border-2 border-blue-100 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 text-white rounded-lg">
                <Sparkles size={24} />
              </div>
              <div>
                <CardTitle>描述您的需求</CardTitle>
                <CardDescription>AI 将根据您的描述自动编写代码、设计参数并生成可执行的工具</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="例如：创建一个工具，可以根据输入的城市名获取天气预报，并根据气温推荐适合的衣服..."
              className="min-h-[120px] text-base"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Lightbulb size={14} className="text-yellow-500" />
                <span>试试这些例子：</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(ex)}
                    className="text-xs bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-full transition-colors border border-slate-200"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 flex justify-end py-4">
            <Button 
              onClick={handleGenerate} 
              disabled={generating || !prompt.trim()}
              className="bg-blue-600 hover:bg-blue-700 min-w-[150px]"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在生成...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  生成工具
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Result Section */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2">
              <Badge variant={result.success ? "default" : "destructive"} className="px-3 py-1">
                {result.success ? "生成成功" : "生成失败"}
              </Badge>
              {result.attempt && (
                <span className="text-xs text-slate-500">尝试次数: {result.attempt}</span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Output/Code */}
              <Card className="lg:col-span-2">
                <CardHeader className="py-3 bg-slate-900 text-slate-100 rounded-t-xl">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Terminal size={16} />
                    执行输出与生成的代码
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <pre className="p-6 bg-slate-950 text-green-400 text-sm overflow-auto max-h-[400px] font-mono leading-relaxed">
                    {result.output || result.error || "无输出内容"}
                  </pre>
                </CardContent>
              </Card>

              {/* Diagnosis if failed */}
              {result.diagnosis && (
                <Card className="border-red-200 bg-red-50/30">
                  <CardHeader>
                    <CardTitle className="text-sm text-red-700 flex items-center gap-2">
                      <AlertCircle size={16} />
                      错误诊断
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-700 space-y-2">
                    <p><strong>原因：</strong> {result.diagnosis.reason}</p>
                    <p><strong>建议修复：</strong> {result.diagnosis.suggestedFix}</p>
                  </CardContent>
                </Card>
              )}

              {/* Success Info */}
              {result.success && (
                <Card className="lg:col-span-2 border-green-200 bg-green-50/30">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      后续操作
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-slate-600">
                        工具已在沙箱环境中验证通过。您可以立即在“工具管理”页面查看并测试它，或者将其集成到您的自动化工作流中。
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-100" asChild>
                        <a href="/tools">
                          前往工具管理 <ArrowRight size={14} className="ml-2" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
