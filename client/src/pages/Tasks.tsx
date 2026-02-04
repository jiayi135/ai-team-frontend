import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { TASK_STATUS, ROLES } from '@/lib/constants';
import { getTaskStatusColor, formatTime, formatDuration } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, XCircle, Search, Filter, Play, Terminal, Bug, Rocket, Scale, Loader2 } from 'lucide-react';

interface Task {
  id: string;
  goal: string;
  currentStatus: string;
  history: ExecutionResult[];
  createdAt: string;
  updatedAt: string;
  assignedRole: string;
  context: string;
}

interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  diagnosis?: ErrorDiagnosis;
  arbitrationDecision?: ArbitrationDecision;
  governanceValidation?: GovernanceValidationResult;
}

interface ErrorDiagnosis {
  isSyntaxError: boolean;
  isPermissionError: boolean;
  isLogicError: boolean;
  diagnosis: string;
  suggestedFix: string;
}

interface ArbitrationDecision {
  decision: string; // 仲裁专家的最终决策
  reasoning: string; // 决策依据，可能引用宪法条款
  impact: string; // 决策对任务或系统的影响
  constitutionalClause?: string; // 引用的宪法条款
}

interface GovernanceValidationResult {
  isValid: boolean;
  reason?: string;
  constitutionalClause?: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case TASK_STATUS.COMPLETED:
      return <CheckCircle className="text-green-600" size={20} />;
    case TASK_STATUS.RUNNING:
    case 'executing':
    case 'planning':
    case 'testing':
    case 'arbitrating':
      return <Loader2 className="text-blue-600 animate-spin" size={20} />;
    case TASK_STATUS.FAILED:
      return <XCircle className="text-red-600" size={20} />;
    case TASK_STATUS.QUEUED:
    case 'pending':
      return <AlertCircle className="text-yellow-600" size={20} />;
    default:
      return null;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function Tasks() {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [executionRole, setExecutionRole] = useState<string>(ROLES.DEVELOPER);
  const [executionGoal, setExecutionGoal] = useState<string>('');
  const [executionOutput, setExecutionOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [vercelProjectId, setVercelProjectId] = useState<string>('');
  const [vercelAlias, setVercelAlias] = useState<string>('');
  const outputRef = useRef<HTMLPreElement>(null);

  const [allTasks, setAllTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tasks');
      const result = await response.json();
      if (result.success && result.tasks) {
        setAllTasks(result.tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt).toISOString(),
          updatedAt: new Date(task.updatedAt).toISOString(),
        })));
      }
    } catch (error) {
      console.error('Failed to fetch all tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000); // 每5秒刷新一次任务列表
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [executionOutput]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentTask && isExecuting) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/task/${currentTask.id}`);
          const result = await response.json();
          if (result.success && result.task) {
            const updatedTask: Task = result.task;
            setCurrentTask(updatedTask);
            // Update execution output based on task history
            const latestResult = updatedTask.history[updatedTask.history.length - 1];
            if (latestResult) {
              let output = latestResult.output || latestResult.error || '';
              if (latestResult.governanceValidation && !latestResult.governanceValidation.isValid) {
                output += `\n[治理验证失败]: ${latestResult.governanceValidation.reason}\n`;
                if (latestResult.governanceValidation.constitutionalClause) {
                  output += `[引用宪法条款]: ${latestResult.governanceValidation.constitutionalClause}\n`;
                }
              }
              if (latestResult.diagnosis) {
                output += `\n[Tester 诊断]: ${latestResult.diagnosis.diagnosis}\n[修复建议]: ${latestResult.diagnosis.suggestedFix}\n`;
              }
              if (latestResult.arbitrationDecision) {
                output += `\n[仲裁专家决策]: ${latestResult.arbitrationDecision.decision}\n[决策依据]: ${latestResult.arbitrationDecision.reasoning}\n[决策影响]: ${latestResult.arbitrationDecision.impact}\n`;
                if (latestResult.arbitrationDecision.constitutionalClause) {
                  output += `[引用宪法条款]: ${latestResult.arbitrationDecision.constitutionalClause}\n`;
                }
              }
              setExecutionOutput(output);
            }

            if (updatedTask.currentStatus === 'completed' || updatedTask.currentStatus === 'failed' || updatedTask.currentStatus === 'arbitrating') {
              setIsExecuting(false);
              clearInterval(interval);
              fetchTasks(); // 任务结束后刷新所有任务列表
            }
          }
        } catch (error) {
          console.error('Failed to fetch task status:', error);
          setIsExecuting(false);
          clearInterval(interval);
        }
      }, 2000); // 每2秒轮询一次
    }
    return () => clearInterval(interval);
  }, [currentTask, isExecuting]);

  const handleExecuteTask = async () => {
    setIsExecuting(true);
    setExecutionOutput('正在生成并执行代码...\n');
    setCurrentTask(null);

    let goalToSend = executionGoal;
    let contextToSend = `当前项目是一个基于 React, Vite, TailwindCSS 的前端应用。`;

    if (executionGoal.includes("部署到 Vercel")) {
      if (!vercelProjectId) {
        setExecutionOutput(prev => prev + `错误：部署到 Vercel 需要提供项目 ID。`);
        setIsExecuting(false);
        return;
      }
      goalToSend = `部署到 Vercel，项目 ID: ${vercelProjectId}`;
      if (vercelAlias) {
        goalToSend += `, 别名: ${vercelAlias}`;
      }
      contextToSend += ` Vercel 项目 ID: ${vercelProjectId}`; // 将 Vercel 项目 ID 加入上下文
    }

    try {
      const response = await fetch('http://localhost:3001/api/execute/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: executionRole,
          goal: goalToSend,
          context: contextToSend
        }),
      });

      const result = await response.json();
      if (result.success && result.taskId) {
        setExecutionOutput(prev => prev + `任务已启动，ID: ${result.taskId}\n`);
        setCurrentTask({ 
          id: result.taskId, 
          goal: goalToSend, 
          currentStatus: 'pending', 
          history: [], 
          createdAt: new Date().toISOString(), 
          updatedAt: new Date().toISOString(),
          assignedRole: executionRole,
          context: contextToSend
        });
      } else {
        setExecutionOutput(prev => prev + `任务启动失败！\n错误: ${result.error}`);
        setIsExecuting(false);
      }
    } catch (error: any) {
      setExecutionOutput(prev => prev + `请求失败！\n错误: ${error.message}`);
      setIsExecuting(false);
    }
  };

  const filteredTasks = allTasks.filter((task) => {
    const matchesFilter = filter === 'all' || task.currentStatus === filter;
    const matchesSearch = task.goal.toLowerCase().includes(search.toLowerCase()) || 
                         task.assignedRole.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: allTasks.length,
    completed: allTasks.filter((t) => t.currentStatus === 'completed').length,
    running: allTasks.filter((t) => ['executing', 'planning', 'testing', 'arbitrating'].includes(t.currentStatus)).length,
    failed: allTasks.filter((t) => t.currentStatus === 'failed').length,
  };

  return (
    <MainLayout
      title="任务监控"
      subtitle="实时追踪 P.R.O.M.P.T. 任务执行与元认知性能指标"
    >
      {/* Autonomous Execution Console */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Terminal size={24} className="text-blue-600" />
          自主执行控制台
        </h2>
        <p className="text-slate-600 mb-4">选择一个角色，输入任务目标，AI 将自动生成并执行代码。</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="executionRole" className="block text-sm font-medium text-slate-700 mb-1">执行角色</label>
            <select
              id="executionRole"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={executionRole}
              onChange={(e) => setExecutionRole(e.target.value)}
              disabled={isExecuting}
            >
              {Object.values(ROLES).map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="executionGoal" className="block text-sm font-medium text-slate-700 mb-1">任务目标</label>
            <input
              type="text"
              id="executionGoal"
              placeholder="例如：创建一个名为 MyComponent 的 React 组件 或 部署到 Vercel"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={executionGoal}
              onChange={(e) => setExecutionGoal(e.target.value)}
              disabled={isExecuting}
            />
          </div>
        </div>

        {executionGoal.includes("部署到 Vercel") && executionRole === ROLES.DEVELOPER && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center gap-2 text-blue-700 font-medium">
              <Rocket size={18} /> Vercel 部署配置
            </div>
            <div>
              <label htmlFor="vercelProjectId" className="block text-sm font-medium text-slate-700 mb-1">Vercel 项目 ID</label>
              <input
                type="text"
                id="vercelProjectId"
                placeholder="例如：prj_xxxxxxxxxxxxxxxxxxxx"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={vercelProjectId}
                onChange={(e) => setVercelProjectId(e.target.value)}
                disabled={isExecuting}
              />
            </div>
            <div>
              <label htmlFor="vercelAlias" className="block text-sm font-medium text-slate-700 mb-1">部署别名 (可选)</label>
              <input
                type="text"
                id="vercelAlias"
                placeholder="例如：my-app-staging"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={vercelAlias}
                onChange={(e) => setVercelAlias(e.target.value)}
                disabled={isExecuting}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleExecuteTask}
          disabled={isExecuting || !executionGoal || (executionGoal.includes("部署到 Vercel") && executionRole === ROLES.DEVELOPER && (!vercelProjectId))}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          {isExecuting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Play size={20} />
          )}
          {isExecuting ? `执行中 (${currentTask?.currentStatus || '...'})...` : '开始自主执行'}
        </button>

        {executionOutput && (
          <div className="mt-6 bg-slate-800 text-white p-4 rounded-lg font-mono text-sm overflow-auto max-h-60" ref={outputRef}>
            <pre>{executionOutput}</pre>
          </div>
        )}

        {currentTask?.history.length > 0 && currentTask.history[currentTask.history.length - 1].governanceValidation && !currentTask.history[currentTask.history.length - 1].governanceValidation?.isValid && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2">
              <Scale size={20} />
              治理验证失败
            </h3>
            <p className="text-sm mb-1"><strong>原因:</strong> {currentTask.history[currentTask.history.length - 1].governanceValidation?.reason}</p>
            {currentTask.history[currentTask.history.length - 1].governanceValidation?.constitutionalClause && (
              <p className="text-sm"><strong>引用宪法条款:</strong> {currentTask.history[currentTask.history.length - 1].governanceValidation?.constitutionalClause}</p>
            )}
          </div>
        )}

        {currentTask?.history.length > 0 && currentTask.history[currentTask.history.length - 1].diagnosis && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2">
              <Bug size={20} />
              Tester 诊断报告
            </h3>
            <p className="text-sm mb-1"><strong>诊断:</strong> {currentTask.history[currentTask.history.length - 1].diagnosis?.diagnosis}</p>
            <p className="text-sm"><strong>修复建议:</strong> {currentTask.history[currentTask.history.length - 1].diagnosis?.suggestedFix}</p>
          </div>
        )}

        {currentTask?.history.length > 0 && currentTask.history[currentTask.history.length - 1].arbitrationDecision && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4 text-orange-700">
            <h3 className="font-bold text-orange-800 flex items-center gap-2 mb-2">
              <Scale size={20} />
              仲裁专家决策
            </h3>
            <p className="text-sm mb-1"><strong>决策:</strong> {currentTask.history[currentTask.history.length - 1].arbitrationDecision?.decision}</p>
            <p className="text-sm mb-1"><strong>依据:</strong> {currentTask.history[currentTask.history.length - 1].arbitrationDecision?.reasoning}</p>
            <p className="text-sm mb-1"><strong>影响:</strong> {currentTask.history[currentTask.history.length - 1].arbitrationDecision?.impact}</p>
            {currentTask.history[currentTask.history.length - 1].arbitrationDecision?.constitutionalClause && (
              <p className="text-sm"><strong>引用宪法条款:</strong> {currentTask.history[currentTask.history.length - 1].arbitrationDecision?.constitutionalClause}</p>
            )}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">总任务数</p>
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">已完成</p>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">执行中</p>
          <p className="text-3xl font-bold text-blue-600">{stats.running}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">治理失败</p>
          <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="搜索任务名称或执行角色..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['all', 'pending', 'planning', 'executing', 'testing', 'arbitrating', 'completed', 'failed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                filter === s
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s === 'all' ? '全部' : s === 'pending' ? '待处理' : s === 'planning' ? '规划中' : s === 'executing' ? '执行中' : s === 'testing' ? '测试中' : s === 'arbitrating' ? '仲裁中' : s === 'completed' ? '已完成' : '失败'}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getStatusIcon(task.currentStatus)}</div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                      {task.goal}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Clock size={14} />
                        {formatTime(new Date(task.createdAt))} 启动
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end md:self-start">
                  <Badge
                    style={{
                      backgroundColor: getTaskStatusColor(task.currentStatus),
                      color: 'white',
                    }}
                  >
                    {task.currentStatus}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                <div className="space-y-2">
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">责任角色</p>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    {task.assignedRole}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">历史记录</p>
                  <p className="text-sm font-semibold text-slate-900">{task.history.length} 次尝试</p>
                </div>
                <div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-slate-50 rounded-lg border border-dashed border-slate-300 p-12 text-center">
            <p className="text-slate-500">未找到匹配的任务</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
