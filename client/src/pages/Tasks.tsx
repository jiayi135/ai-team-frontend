import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { TASK_STATUS, ROLES } from '@/lib/constants';
import { getTaskStatusColor, formatTime, formatDuration } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  Play,
  Terminal,
  Bug,
  Rocket,
  Scale,
  Loader2,
  ShieldAlert,
  History,
  ChevronDown,
  ChevronUp,
  MapPin
} from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Task {
  id: string;
  goal: string;
  currentStatus: string;
  history: ExecutionResult[];
  createdAt: string;
  updatedAt: string;
  assignedRole: string;
  context: string;
  currentAttempt?: number;
}

interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  diagnosis?: ErrorDiagnosis;
  arbitrationDecision?: ArbitrationDecision;
  governanceValidation?: GovernanceValidationResult;
  attempt?: number;
}

interface ErrorDiagnosis {
  isSyntaxError: boolean;
  isPermissionError: boolean;
  isLogicError: boolean;
  diagnosis: string;
  suggestedFix: string;
}

interface ArbitrationDecision {
  decision: string;
  reasoning: string;
  impact: string;
  constitutionalClause?: string;
}

interface GovernanceValidationResult {
  isValid: boolean;
  reason?: string;
  constitutionalClause?: string;
}

interface Checkpoint {
  phase: string;
  data: {
    timestamp: string;
    state: any;
  };
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="text-green-600" size={20} />;
    case 'executing':
    case 'planning':
    case 'testing':
    case 'repairing':
      return <Loader2 className="text-blue-600 animate-spin" size={20} />;
    case 'arbitrating':
      return <Scale className="text-purple-600 animate-pulse" size={20} />;
    case 'failed':
      return <XCircle className="text-red-600" size={20} />;
    case 'pending':
      return <AlertCircle className="text-yellow-600" size={20} />;
    default:
      return null;
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
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [checkpoints, setCheckpoints] = useState<Record<string, Checkpoint[]>>({});
  const outputRef = useRef<HTMLPreElement>(null);
  
  const { socket, isConnected } = useSocket();

  const API_BASE = '/api';

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE}/tasks`);
      const result = await response.json();
      if (result.success && result.tasks) {
        setAllTasks(result.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const fetchCheckpoints = async (taskId: string) => {
    try {
      const response = await fetch(`${API_BASE}/governance/checkpoints/${taskId}`);
      const data = await response.json();
      if (data.success) {
        setCheckpoints(prev => ({ ...prev, [taskId]: data.checkpoints }));
      }
    } catch (error) {
      console.error('Failed to fetch checkpoints:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('task_updated', (updatedTask: Task) => {
        setAllTasks(prevTasks => {
          const index = prevTasks.findIndex(t => t.id === updatedTask.id);
          if (index !== -1) {
            const newTasks = [...prevTasks];
            newTasks[index] = updatedTask;
            return newTasks;
          } else {
            return [updatedTask, ...prevTasks];
          }
        });

        if (currentTask && updatedTask.id === currentTask.id) {
          setCurrentTask(updatedTask);
          const latestResult = updatedTask.history[updatedTask.history.length - 1];
          if (latestResult) {
            let output = latestResult.output || latestResult.error || '';
            
            if (latestResult.governanceValidation && !latestResult.governanceValidation.isValid) {
              output = `⚠️ CONSTITUTIONAL BREACH DETECTED ⚠️\n` +
                       `------------------------------------\n` +
                       `Reason: ${latestResult.governanceValidation.reason}\n` +
                       `Clause: ${latestResult.governanceValidation.constitutionalClause}\n` +
                       `Status: Operation Intercepted\n` +
                       `------------------------------------`;
            } else if (latestResult.diagnosis) {
              output += `\n\n[Tester Diagnosis]: ${latestResult.diagnosis.diagnosis}\n[Suggested Fix]: ${latestResult.diagnosis.suggestedFix}`;
            }
            
            if (latestResult.arbitrationDecision) {
              output += `\n\n[Arbitration Decision]: ${latestResult.arbitrationDecision.decision}\n[Reasoning]: ${latestResult.arbitrationDecision.reasoning}`;
            }
            setExecutionOutput(output);
          }
          
          if (['completed', 'failed', 'arbitrating'].includes(updatedTask.currentStatus)) {
            setIsExecuting(false);
          }

          // Auto-fetch checkpoints when updated
          fetchCheckpoints(updatedTask.id);
        }
      });

      return () => {
        socket.off('task_updated');
      };
    }
  }, [socket, currentTask]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [executionOutput]);

  const handleExecuteTask = async () => {
    setIsExecuting(true);
    setExecutionOutput('Initializing P.R.O.M.P.T. Task...\n');
    
    // Get LLM config from localStorage
    const savedConfig = localStorage.getItem('ai_team_llm_config');
    const config = savedConfig ? JSON.parse(savedConfig) : null;

    try {
      const response = await fetch(`${API_BASE}/execute/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: executionRole,
          goal: executionGoal,
          context: "Active P.R.O.M.P.T. Session.",
          config: config
        }),
      });

      const result = await response.json();
      if (result.success && result.taskId) {
        setExecutionOutput(prev => prev + `Task started. ID: ${result.taskId}\nScanning for constitutional compliance...\n`);
        setCurrentTask({ id: result.taskId } as Task);
      } else {
        setExecutionOutput(prev => prev + `Failed to start task: ${result.error}`);
        setIsExecuting(false);
      }
    } catch (error: any) {
      setExecutionOutput(prev => prev + `Request failed: ${error.message}`);
      setIsExecuting(false);
    }
  };

  const toggleTaskExpansion = (taskId: string) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(taskId);
      if (!checkpoints[taskId]) {
        fetchCheckpoints(taskId);
      }
    }
  };

  return (
    <MainLayout title="任务监控" subtitle={`P.R.O.M.P.T. 治理实时追踪 | WebSocket: ${isConnected ? '在线' : '离线'}`}>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Terminal size={24} className="text-blue-600" />
          自主执行控制台
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select
            className="p-2 border rounded-lg bg-slate-50"
            value={executionRole}
            onChange={(e) => setExecutionRole(e.target.value)}
            disabled={isExecuting}
          >
            {Object.values(ROLES).map(role => <option key={role} value={role}>{role.toUpperCase()}</option>)}
          </select>
          <input
            type="text"
            placeholder="描述您的目标 (例如：'部署应用到 Vercel')..."
            className="md:col-span-2 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={executionGoal}
            onChange={(e) => setExecutionGoal(e.target.value)}
            disabled={isExecuting}
          />
        </div>
        <button
          onClick={handleExecuteTask}
          disabled={isExecuting || !executionGoal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {isExecuting ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
          {isExecuting ? '正在处理...' : '运行任务'}
        </button>
        <div className="mt-4 bg-slate-900 rounded-lg p-4 font-mono text-sm border-l-4 border-blue-500 shadow-inner">
          <pre ref={outputRef} className="max-h-64 overflow-y-auto whitespace-pre-wrap text-blue-300">
            {executionOutput || '准备就绪...'}
          </pre>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2 px-1">
          <ShieldAlert size={20} className="text-slate-500" />
          治理审计追踪 (Audit Trail)
        </h3>
        {allTasks.length > 0 ? (
          allTasks.map(task => (
            <div key={task.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => toggleTaskExpansion(task.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(task.currentStatus)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 line-clamp-1">{task.goal}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] px-1 h-4">{task.assignedRole}</Badge>
                      <span>尝试: {task.currentAttempt || 1}</span>
                      <span>•</span>
                      <span className="font-mono">{task.id}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${getTaskStatusColor(task.currentStatus)} px-3 py-1`}>
                    {task.currentStatus.toUpperCase()}
                  </Badge>
                  {expandedTaskId === task.id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </div>
              </div>

              {expandedTaskId === task.id && (
                <div className="border-t bg-slate-50/50 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Execution History */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                        <History size={14} /> 运行历史
                      </h4>
                      {task.history.length > 0 ? (
                        <div className="space-y-3">
                          {task.history.map((entry, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-3 border text-sm">
                              <div className="flex justify-between mb-1">
                                <span className="font-semibold">Attempt {entry.attempt}</span>
                                <Badge variant={entry.success ? "default" : "destructive"} className="text-[10px] h-4">
                                  {entry.success ? "SUCCESS" : "FAILED"}
                                </Badge>
                              </div>
                              <p className="text-slate-600 line-clamp-2 italic">{entry.output || entry.error}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">暂无执行历史</p>
                      )}
                    </div>

                    {/* Checkpoints / Phases */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                        <MapPin size={14} /> 治理检查点 (Checkpoints)
                      </h4>
                      <div className="relative pl-4 border-l-2 border-slate-200 space-y-6">
                        {['planning', 'executing', 'testing', 'final'].map((phase) => {
                          const cp = checkpoints[task.id]?.find(c => c.phase === phase);
                          const isCurrent = task.currentStatus.toLowerCase() === phase;
                          const isDone = cp !== undefined;

                          return (
                            <div key={phase} className="relative">
                              <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 bg-white ${
                                isDone ? 'border-green-500 bg-green-500' : isCurrent ? 'border-blue-500 animate-pulse' : 'border-slate-200'
                              }`} />
                              <div className="flex flex-col">
                                <span className={`text-sm font-bold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                                  {phase.toUpperCase()}
                                </span>
                                {cp && (
                                  <span className="text-[10px] text-slate-500">
                                    {new Date(cp.data.timestamp).toLocaleTimeString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-slate-50 border-2 border-dashed rounded-xl py-12 text-center">
            <ShieldAlert className="mx-auto text-slate-300 mb-2" size={48} />
            <p className="text-slate-500">暂无活跃或历史治理任务</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
