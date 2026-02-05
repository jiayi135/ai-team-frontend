import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { TASK_STATUS, ROLES } from '@/lib/constants';
import { getTaskStatusColor, formatTime, formatDuration } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, XCircle, Search, Filter, Play, Terminal, Bug, Rocket, Scale, Loader2 } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="text-green-600" size={20} />;
    case 'executing':
    case 'planning':
    case 'testing':
    case 'arbitrating':
      return <Loader2 className="text-blue-600 animate-spin" size={20} />;
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
  const outputRef = useRef<HTMLPreElement>(null);
  
  const { socket, isConnected } = useSocket();

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tasks');
      const result = await response.json();
      if (result.success && result.tasks) {
        setAllTasks(result.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('task_updated', (updatedTask: Task) => {
        console.log('Task updated via socket:', updatedTask);
        
        // Update the task in the list
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

        // If this is the current active task, update the console output
        if (currentTask && updatedTask.id === currentTask.id) {
          setCurrentTask(updatedTask);
          const latestResult = updatedTask.history[updatedTask.history.length - 1];
          if (latestResult) {
            let output = latestResult.output || latestResult.error || '';
            if (latestResult.governanceValidation && !latestResult.governanceValidation.isValid) {
              output += `\n[治理验证失败]: ${latestResult.governanceValidation.reason}`;
            }
            if (latestResult.diagnosis) {
              output += `\n[Tester 诊断]: ${latestResult.diagnosis.diagnosis}\n[修复建议]: ${latestResult.diagnosis.suggestedFix}`;
            }
            if (latestResult.arbitrationDecision) {
              output += `\n[仲裁专家决策]: ${latestResult.arbitrationDecision.decision}`;
            }
            setExecutionOutput(output);
          }
          
          if (['completed', 'failed'].includes(updatedTask.currentStatus)) {
            setIsExecuting(false);
          }
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
    setExecutionOutput('正在初始化任务...\n');
    
    try {
      const response = await fetch('http://localhost:3001/api/execute/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: executionRole,
          goal: executionGoal,
          context: "Project context: React/Vite/Tailwind frontend."
        }),
      });

      const result = await response.json();
      if (result.success && result.taskId) {
        setExecutionOutput(prev => prev + `任务已启动，ID: ${result.taskId}\n`);
        setCurrentTask({ id: result.taskId } as Task);
      } else {
        setExecutionOutput(prev => prev + `任务启动失败: ${result.error}`);
        setIsExecuting(false);
      }
    } catch (error: any) {
      setExecutionOutput(prev => prev + `请求失败: ${error.message}`);
      setIsExecuting(false);
    }
  };

  return (
    <MainLayout title="任务监控" subtitle={`实时追踪 P.R.O.M.P.T. 任务执行 | WebSocket: ${isConnected ? '已连接' : '未连接'}`}>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Terminal size={24} className="text-blue-600" />
          自主执行控制台
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select
            className="p-2 border rounded-lg"
            value={executionRole}
            onChange={(e) => setExecutionRole(e.target.value)}
            disabled={isExecuting}
          >
            {Object.values(ROLES).map(role => <option key={role} value={role}>{role}</option>)}
          </select>
          <input
            type="text"
            placeholder="输入任务目标..."
            className="md:col-span-2 p-2 border rounded-lg"
            value={executionGoal}
            onChange={(e) => setExecutionGoal(e.target.value)}
            disabled={isExecuting}
          />
        </div>
        <button
          onClick={handleExecuteTask}
          disabled={isExecuting || !executionGoal}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {isExecuting ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
          开始执行
        </button>
        <div className="mt-4 bg-slate-900 rounded-lg p-4 font-mono text-sm text-blue-400">
          <pre ref={outputRef} className="max-h-60 overflow-y-auto whitespace-pre-wrap">
            {executionOutput || '等待任务启动...'}
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {allTasks.map(task => (
          <div key={task.id} className="bg-white border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getStatusIcon(task.currentStatus)}
              <div>
                <div className="font-bold">{task.goal}</div>
                <div className="text-sm text-slate-500">{task.assignedRole} | {task.id}</div>
              </div>
            </div>
            <Badge className={getTaskStatusColor(task.currentStatus)}>{task.currentStatus}</Badge>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
