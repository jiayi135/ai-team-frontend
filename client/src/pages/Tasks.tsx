import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { TASK_STATUS, ROLES } from '@/lib/constants';
import { getTaskStatusColor, formatTime, formatDuration } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, XCircle, Search, Filter, Play, Terminal, Bug } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  status: string;
  progress: number;
  startTime: Date;
  duration?: number;
  assignedRole: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  iterations: number;
  cost: number;
  mandate: string; // P.R.O.M.P.T. mandate
}

interface ErrorDiagnosis {
  isSyntaxError: boolean;
  isPermissionError: boolean;
  isLogicError: boolean;
  diagnosis: string;
  suggestedFix: string;
}

const mockTasks: Task[] = [
  {
    id: '1',
    name: '系统架构元认知分析',
    status: TASK_STATUS.COMPLETED,
    progress: 100,
    startTime: new Date(Date.now() - 7200000),
    duration: 3600,
    assignedRole: ROLES.ARCHITECT,
    priority: 'high',
    iterations: 2,
    cost: 12.50,
    mandate: 'Purpose',
  },
  {
    id: '2',
    name: 'API 核心逻辑实现',
    status: TASK_STATUS.RUNNING,
    progress: 65,
    startTime: new Date(Date.now() - 3600000),
    assignedRole: ROLES.DEVELOPER,
    priority: 'high',
    iterations: 1,
    cost: 8.75,
    mandate: 'Operation',
  },
  {
    id: '3',
    name: '上下文深度挖掘 (MCP)',
    status: TASK_STATUS.RUNNING,
    progress: 40,
    startTime: new Date(Date.now() - 1800000),
    assignedRole: ROLES.ALGORITHM_EXPERT,
    priority: 'medium',
    iterations: 3,
    cost: 15.25,
    mandate: 'Media',
  },
  {
    id: '4',
    name: '自动化验证套件',
    status: TASK_STATUS.QUEUED,
    progress: 0,
    startTime: new Date(),
    assignedRole: ROLES.TESTER,
    priority: 'medium',
    iterations: 0,
    cost: 0,
    mandate: 'Tracing',
  },
  {
    id: '5',
    name: '数据库迁移治理',
    status: TASK_STATUS.FAILED,
    progress: 25,
    startTime: new Date(Date.now() - 5400000),
    duration: 1800,
    assignedRole: ROLES.DEVELOPER,
    priority: 'critical',
    iterations: 2,
    cost: 5.50,
    mandate: 'Planned',
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case TASK_STATUS.COMPLETED:
      return <CheckCircle className="text-green-600" size={20} />;
    case TASK_STATUS.RUNNING:
      return <Clock className="text-blue-600 animate-spin" size={20} />;
    case TASK_STATUS.FAILED:
      return <XCircle className="text-red-600" size={20} />;
    case TASK_STATUS.QUEUED:
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
  const [lastDiagnosis, setLastDiagnosis] = useState<ErrorDiagnosis | null>(null);
  const [attemptCount, setAttemptCount] = useState<number>(0);

  const filteredTasks = mockTasks.filter((task) => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.name.toLowerCase().includes(search.toLowerCase()) || 
                         task.assignedRole.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: mockTasks.length,
    completed: mockTasks.filter((t) => t.status === TASK_STATUS.COMPLETED).length,
    running: mockTasks.filter((t) => t.status === TASK_STATUS.RUNNING).length,
    failed: mockTasks.filter((t) => t.status === TASK_STATUS.FAILED).length,
  };

  const handleExecuteTask = async () => {
    setIsExecuting(true);
    setExecutionOutput('正在生成并执行代码...\n');
    setLastDiagnosis(null);
    setAttemptCount(0);

    let currentAttempt = 0;
    const MAX_ATTEMPTS = 3;

    while (currentAttempt < MAX_ATTEMPTS) {
      currentAttempt++;
      setAttemptCount(currentAttempt);
      setExecutionOutput(prev => prev + `\n--- 尝试 ${currentAttempt} ---\n`);
      setExecutionOutput(prev => prev + `[${executionRole}] 目标: ${executionGoal}\n`);

      try {
        const response = await fetch('http://localhost:3001/api/execute/task', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: executionRole,
            goal: executionGoal,
            context: `当前项目是一个基于 React, Vite, TailwindCSS 的前端应用。这是第 ${currentAttempt} 次尝试。`
          }),
        });

        const result = await response.json();
        if (result.success) {
          setExecutionOutput(prev => prev + `执行成功！\n${result.output}`);
          setIsExecuting(false);
          return; // 任务成功，退出循环
        } else {
          setExecutionOutput(prev => prev + `执行失败！\n错误: ${result.error}`);
          if (result.diagnosis) {
            setLastDiagnosis(result.diagnosis);
            setExecutionOutput(prev => prev + `\n[Tester 诊断]: ${result.diagnosis.diagnosis}\n[修复建议]: ${result.diagnosis.suggestedFix}\n`);
            // 如果是最后一次尝试，或者没有修复建议，则不再重试
            if (currentAttempt >= MAX_ATTEMPTS || !result.diagnosis.suggestedFix) {
              setIsExecuting(false);
              return; // 达到最大尝试次数或无法修复，退出循环
            }
            // 更新 goal，让 LLM 尝试修复
            setExecutionGoal(prevGoal => `${prevGoal} (修复建议: ${result.diagnosis.suggestedFix})`);
          } else {
            setIsExecuting(false);
            return; // 没有诊断信息，直接退出
          }
        }
      } catch (error: any) {
        setExecutionOutput(prev => prev + `请求失败！\n错误: ${error.message}`);
        setIsExecuting(false);
        return; // 请求失败，退出循环
      }
    }
    setIsExecuting(false);
    setExecutionOutput(prev => prev + `\n--- 达到最大尝试次数 (${MAX_ATTEMPTS})，任务未能成功完成。 ---`);
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
              placeholder="例如：创建一个名为 MyComponent 的 React 组件"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={executionGoal}
              onChange={(e) => setExecutionGoal(e.target.value)}
              disabled={isExecuting}
            />
          </div>
        </div>
        <button
          onClick={handleExecuteTask}
          disabled={isExecuting || !executionGoal}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          {isExecuting ? (
            <Clock size={20} className="animate-spin" />
          ) : (
            <Play size={20} />
          )}
          {isExecuting ? `执行中 (尝试 ${attemptCount}/${MAX_ATTEMPTS})...` : '开始自主执行'}
        </button>

        {executionOutput && (
          <div className="mt-6 bg-slate-800 text-white p-4 rounded-lg font-mono text-sm overflow-auto max-h-60">
            <pre>{executionOutput}</pre>
          </div>
        )}

        {lastDiagnosis && !lastDiagnosis.isSyntaxError && !lastDiagnosis.isPermissionError && !lastDiagnosis.isLogicError && ( // 仅在有诊断信息且不是成功时显示
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2">
              <Bug size={20} />
              Tester 诊断报告
            </h3>
            <p className="text-sm mb-1"><strong>诊断:</strong> {lastDiagnosis.diagnosis}</p>
            <p className="text-sm"><strong>修复建议:</strong> {lastDiagnosis.suggestedFix}</p>
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
          {['all', TASK_STATUS.RUNNING, TASK_STATUS.COMPLETED, TASK_STATUS.FAILED].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                filter === s
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s === 'all' ? '全部' : s === TASK_STATUS.RUNNING ? '执行中' : s === TASK_STATUS.COMPLETED ? '已完成' : '失败'}
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
                  <div className="mt-1">{getStatusIcon(task.status)}</div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                      {task.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Clock size={14} />
                        {formatTime(task.startTime)} 启动
                      </span>
                      <Badge variant="outline" className="text-blue-600 border-blue-100 bg-blue-50">
                        {task.mandate} 维度
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end md:self-start">
                  <Badge className={`${getPriorityColor(task.priority)} border`}>
                    {task.priority.toUpperCase()}
                  </Badge>
                  <Badge
                    style={{
                      backgroundColor: getTaskStatusColor(task.status),
                      color: 'white',
                    }}
                  >
                    {task.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>执行进度</span>
                    <span>{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">责任角色</p>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    {task.assignedRole}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">迭代轮次</p>
                  <p className="text-sm font-semibold text-slate-900">{task.iterations} 次自我审计</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">治理成本</p>
                  <p className="text-sm font-semibold text-slate-900">${task.cost.toFixed(2)}</p>
                </div>
              </div>

              {task.duration && (
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-400">
                    耗时: {formatDuration(task.duration)}
                  </span>
                  <button className="text-xs font-medium text-blue-600 hover:underline">
                    查看审计追踪 (Tracing)
                  </button>
                </div>
              )}
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
