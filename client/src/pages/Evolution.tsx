import { useState } from 'react';
import { toast } from 'sonner';
import { Code2, Sparkles, FileCode, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

interface EvolutionTask {
  id?: string;
  type: 'bug_fix' | 'optimization' | 'feature_add' | 'refactor';
  description: string;
  targetFiles?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  requiresApproval?: boolean;
}

interface EvolutionResult {
  taskId: string;
  status: 'success' | 'partial' | 'failed';
  changes: AppliedChange[];
  metrics: {
    filesModified: number;
    linesAdded: number;
    linesRemoved: number;
    duration: number;
  };
  learnings: string[];
  error?: string;
}

interface AppliedChange {
  file: string;
  success: boolean;
  diff?: string;
  error?: string;
}

export default function Evolution() {
  const [task, setTask] = useState<EvolutionTask>({
    type: 'optimization',
    description: '',
    priority: 'medium',
    requiresApproval: true,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<EvolutionResult | null>(null);

  const handleSubmit = async () => {
    if (!task.description.trim()) {
      toast.error('请输入任务描述');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('/api/evolution/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...task,
          // 可以从 localStorage 获取 API Key
          // apiKey: localStorage.getItem('apiKey'),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
        toast.success('进化任务完成！');
      } else {
        toast.error('任务失败: ' + data.error);
      }
    } catch (error: any) {
      console.error('Failed to create evolution task:', error);
      toast.error('网络请求失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'partial':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return '成功';
      case 'partial':
        return '部分成功';
      case 'failed':
        return '失败';
      default:
        return '处理中';
    }
  };

  return (
    <MainLayout
      title="代码进化"
      description="让 AI 自主分析、修改和优化代码"
      icon={<Sparkles className="w-6 h-6" />}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 任务创建表单 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Code2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">创建进化任务</h2>
          </div>

          <div className="space-y-4">
            {/* 任务类型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                任务类型
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'bug_fix', label: 'Bug 修复', icon: '🐛' },
                  { value: 'optimization', label: '性能优化', icon: '⚡' },
                  { value: 'feature_add', label: '功能添加', icon: '✨' },
                  { value: 'refactor', label: '代码重构', icon: '🔧' },
                ].map(type => (
                  <button
                    key={type.value}
                    onClick={() => setTask({ ...task, type: type.value as any })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      task.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 任务描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                任务描述
              </label>
              <textarea
                value={task.description}
                onChange={e => setTask({ ...task, description: e.target.value })}
                placeholder="例如：优化 API 响应速度，目标降低 50%"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>

            {/* 目标文件 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目标文件（可选）
              </label>
              <input
                type="text"
                value={task.targetFiles?.join(', ') || ''}
                onChange={e =>
                  setTask({
                    ...task,
                    targetFiles: e.target.value.split(',').map(f => f.trim()).filter(Boolean),
                  })
                }
                placeholder="例如：server/src/api/chat.ts, server/src/cache.ts"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                留空则由 AI 自动确定需要修改的文件
              </p>
            </div>

            {/* 优先级 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                优先级
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'low', label: '低', color: 'gray' },
                  { value: 'medium', label: '中', color: 'blue' },
                  { value: 'high', label: '高', color: 'orange' },
                  { value: 'critical', label: '紧急', color: 'red' },
                ].map(priority => (
                  <button
                    key={priority.value}
                    onClick={() => setTask({ ...task, priority: priority.value as any })}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      task.priority === priority.value
                        ? `border-${priority.color}-500 bg-${priority.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 需要审批 */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requiresApproval"
                checked={task.requiresApproval}
                onChange={e => setTask({ ...task, requiresApproval: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="requiresApproval" className="text-sm text-gray-700">
                需要人工审批（推荐）
              </label>
            </div>

            {/* 提交按钮 */}
            <button
              onClick={handleSubmit}
              disabled={isProcessing || !task.description.trim()}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>正在处理...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>开始进化</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 进化结果 */}
        {result && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold">进化结果</h2>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(result.status)}
                <span className="text-sm font-medium">{getStatusText(result.status)}</span>
              </div>
            </div>

            {/* 指标 */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{result.metrics.filesModified}</div>
                <div className="text-sm text-gray-600">文件修改</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">+{result.metrics.linesAdded}</div>
                <div className="text-sm text-gray-600">行新增</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">-{result.metrics.linesRemoved}</div>
                <div className="text-sm text-gray-600">行删除</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {(result.metrics.duration / 1000).toFixed(1)}s
                </div>
                <div className="text-sm text-gray-600">耗时</div>
              </div>
            </div>

            {/* 修改详情 */}
            {result.changes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">修改详情</h3>
                <div className="space-y-2">
                  {result.changes.map((change, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        change.success
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {change.success ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-sm font-medium text-gray-900">{change.file}</span>
                        </div>
                      </div>
                      {change.diff && (
                        <pre className="text-xs text-gray-600 overflow-x-auto bg-white p-2 rounded border border-gray-200">
                          {change.diff}
                        </pre>
                      )}
                      {change.error && (
                        <div className="text-xs text-red-600 mt-2">{change.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 学习经验 */}
            {result.learnings.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">学习经验</h3>
                <ul className="space-y-2">
                  {result.learnings.map((learning, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{learning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 错误信息 */}
            {result.error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-red-900 mb-1">错误</div>
                    <div className="text-sm text-red-700">{result.error}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <div className="font-semibold mb-2">关于代码进化</div>
              <ul className="space-y-1 text-blue-800">
                <li>• AI 会分析您的代码结构和依赖关系</li>
                <li>• 生成最小化、安全的修改方案</li>
                <li>• 在模拟模式下不会实际修改文件</li>
                <li>• 配置 API Key 后可以获得更智能的分析</li>
                <li>• 建议开启"需要审批"以确保安全</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
