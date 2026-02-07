import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  Play,
  Pause,
  StopCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Code,
  Search,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface TaskPhase {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  details?: string;
}

interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  actor: string;
  status: 'success' | 'error' | 'info';
  details: string;
  article?: string;
}

export default function AgentConsole() {
  const [taskId, setTaskId] = useState('');
  const [taskInput, setTaskInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [taskStatus, setTaskStatus] = useState<'idle' | 'running' | 'paused' | 'completed' | 'failed'>('idle');
  const [phases, setPhases] = useState<TaskPhase[]>([
    { id: 'analyze', name: '分析需求', status: 'pending' },
    { id: 'plan', name: '制定计划', status: 'pending' },
    { id: 'execute', name: '执行任务', status: 'pending' },
    { id: 'observe', name: '观察结果', status: 'pending' },
    { id: 'deliver', name: '交付结果', status: 'pending' },
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [taskOutput, setTaskOutput] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [auditLogs]);

  const handleStartTask = async () => {
    if (!taskInput.trim()) {
      toast.error('请输入任务描述');
      return;
    }

    setIsExecuting(true);
    setTaskStatus('running');
    setPhases(phases.map(p => ({ ...p, status: 'pending' })));
    setAuditLogs([]);
    setTaskOutput('');

    try {
      const response = await fetch('/api/execute/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'Developer',
          goal: taskInput,
          context: 'User-initiated task through Agent Console',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTaskId(data.taskId);
        toast.success('任务已启动，ID: ' + data.taskId);
        // Simulate phase progression
        simulatePhaseProgression();
        // Fetch audit logs
        fetchAuditLogs();
      } else {
        toast.error('任务启动失败');
        setTaskStatus('failed');
      }
    } catch (error) {
      console.error('Task execution error:', error);
      toast.error('网络请求失败');
      setTaskStatus('failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const simulatePhaseProgression = () => {
    const phaseSequence = ['analyze', 'plan', 'execute', 'observe', 'deliver'];
    let currentPhaseIndex = 0;

    const progressInterval = setInterval(() => {
      if (currentPhaseIndex < phaseSequence.length) {
        setPhases(prev =>
          prev.map((p, idx) => {
            if (p.id === phaseSequence[currentPhaseIndex]) {
              return { ...p, status: 'active', startTime: new Date() };
            }
            if (idx < currentPhaseIndex) {
              return { ...p, status: 'completed', endTime: new Date() };
            }
            return p;
          })
        );
        currentPhaseIndex++;
      } else {
        clearInterval(progressInterval);
        setTaskStatus('completed');
        setPhases(prev => prev.map(p => ({ ...p, status: 'completed' })));
      }
    }, 2000);
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch('/api/health/audit-logs');
      const data = await response.json();
      if (data.success) {
        const logs = data.logs.map((log: any) => ({
          id: Math.random().toString(),
          timestamp: new Date(log.timestamp),
          action: log.action,
          actor: log.actor,
          status: log.status,
          details: log.details,
          article: log.article,
        }));
        setAuditLogs(logs);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  };

  const handlePauseTask = () => {
    setTaskStatus('paused');
    toast.info('任务已暂停');
  };

  const handleResumeTask = () => {
    setTaskStatus('running');
    toast.info('任务已恢复');
  };

  const handleCancelTask = () => {
    setTaskStatus('failed');
    setIsExecuting(false);
    toast.warning('任务已取消');
  };

  const toggleLogExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const getPhaseIcon = (status: TaskPhase['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="text-green-500" size={20} />;
      case 'active':
        return <Loader2 className="text-blue-500 animate-spin" size={20} />;
      case 'failed':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-slate-300" size={20} />;
    }
  };

  const getStatusBadge = () => {
    switch (taskStatus) {
      case 'running':
        return <Badge className="bg-blue-600">运行中</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-600">已暂停</Badge>;
      case 'completed':
        return <Badge className="bg-green-600">已完成</Badge>;
      case 'failed':
        return <Badge className="bg-red-600">已失败</Badge>;
      default:
        return <Badge className="bg-slate-600">待执行</Badge>;
    }
  };

  return (
    <MainLayout
      title="Agent 控制台"
      subtitle="模仿 Manus AI 的通用代理执行监控与交互平台"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Task Input Section */}
        <Card className="border-2 border-blue-100 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap size={24} className="text-blue-600" />
              启动新任务
            </CardTitle>
            <CardDescription>
              描述您的需求，AI 代理将自动分析、规划、执行并交付结果
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="例如：创建一个 Python 脚本来分析 GitHub 上的热门仓库..."
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                disabled={isExecuting}
                className="flex-1"
              />
              <Button
                onClick={handleStartTask}
                disabled={isExecuting || taskStatus === 'running'}
                className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    启动中...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    启动任务
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Task Status & Controls */}
        {taskId && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">任务 ID: {taskId}</CardTitle>
                  <CardDescription>状态: {getStatusBadge()}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {taskStatus === 'running' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePauseTask}
                      className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                    >
                      <Pause size={16} className="mr-1" />
                      暂停
                    </Button>
                  )}
                  {taskStatus === 'paused' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResumeTask}
                      className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      <Play size={16} className="mr-1" />
                      继续
                    </Button>
                  )}
                  {(taskStatus === 'running' || taskStatus === 'paused') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelTask}
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      <StopCircle size={16} className="mr-1" />
                      取消
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Execution Timeline */}
        {taskId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock size={20} />
                执行时间线
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {phases.map((phase, idx) => (
                  <div key={phase.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      {getPhaseIcon(phase.status)}
                      {idx < phases.length - 1 && (
                        <div className={`w-1 h-12 mt-2 ${
                          phase.status === 'completed' ? 'bg-green-500' : 'bg-slate-200'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 py-2">
                      <p className="font-semibold text-slate-900">{phase.name}</p>
                      {phase.details && (
                        <p className="text-sm text-slate-600 mt-1">{phase.details}</p>
                      )}
                      {phase.startTime && (
                        <p className="text-xs text-slate-500 mt-1">
                          {phase.startTime.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audit Logs & Real-time Thinking */}
        {taskId && (
          <Tabs defaultValue="logs" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <MessageSquare size={16} />
                实时思考动态
              </TabsTrigger>
              <TabsTrigger value="output" className="flex items-center gap-2">
                <Code size={16} />
                执行结果
              </TabsTrigger>
            </TabsList>

            <TabsContent value="logs" className="mt-4">
              <Card>
                <CardContent className="p-4 max-h-[500px] overflow-y-auto space-y-3">
                  {auditLogs.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                      <p>暂无日志记录</p>
                    </div>
                  ) : (
                    auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-3 rounded-lg border ${
                          log.status === 'success'
                            ? 'bg-green-50 border-green-200'
                            : log.status === 'error'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {log.status === 'success' && <CheckCircle2 size={16} className="text-green-600" />}
                              {log.status === 'error' && <AlertCircle size={16} className="text-red-600" />}
                              {log.status === 'info' && <MessageSquare size={16} className="text-blue-600" />}
                              <span className="font-semibold text-sm">{log.action}</span>
                              <span className="text-xs text-slate-500">by {log.actor}</span>
                            </div>
                            <p className="text-sm text-slate-700 mt-1">{log.details}</p>
                            {log.article && (
                              <p className="text-xs text-slate-500 mt-1">
                                {log.article}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => toggleLogExpanded(log.id)}
                            className="ml-2 text-slate-400 hover:text-slate-600"
                          >
                            {expandedLogs.has(log.id) ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        </div>
                        {expandedLogs.has(log.id) && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <pre className="text-xs bg-slate-900 text-slate-100 p-2 rounded overflow-auto max-h-[200px]">
                              {JSON.stringify({ timestamp: log.timestamp, ...log }, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={logsEndRef} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="output" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  {taskOutput ? (
                    <div className="space-y-3">
                      <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto max-h-[500px] font-mono text-sm">
                        {taskOutput}
                      </pre>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(taskOutput);
                            toast.success('已复制到剪贴板');
                          }}
                        >
                          <Copy size={14} className="mr-1" />
                          复制
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const blob = new Blob([taskOutput], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `task_output_${taskId}.txt`;
                            a.click();
                          }}
                        >
                          <Download size={14} className="mr-1" />
                          下载
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <Code size={32} className="mx-auto mb-2 opacity-50" />
                      <p>任务执行结果将在此显示</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
}
