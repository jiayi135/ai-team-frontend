import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { TASK_STATUS, ROLES } from '@/lib/constants';
import { getTaskStatusColor, formatTime, formatDuration } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, XCircle, Search, Filter, Play, Terminal, Bug, Rocket, Scale, Loader2, ShieldAlert } from 'lucide-react';
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
  const outputRef = useRef<HTMLPreElement>(null);
  
  const { socket, isConnected } = useSocket();

  // Use relative path for API calls to work in both dev and production (Vercel)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

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
            
            // Highlight Constitutional Interceptions
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
    
    try {
      const response = await fetch(`${API_BASE}/execute/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: executionRole,
          goal: executionGoal,
          context: "Active P.R.O.M.P.T. Session."
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

  return (
    <MainLayout title="Task Monitoring" subtitle={`P.R.O.M.P.T. Governance Live | WebSocket: ${isConnected ? 'Online' : 'Offline'}`}>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Terminal size={24} className="text-blue-600" />
          Autonomous Execution Console
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
            placeholder="Describe your goal (e.g., 'Deploy app to Vercel')..."
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
          {isExecuting ? 'Processing...' : 'Run Task'}
        </button>
        <div className="mt-4 bg-slate-900 rounded-lg p-4 font-mono text-sm border-l-4 border-blue-500 shadow-inner">
          <pre ref={outputRef} className="max-h-64 overflow-y-auto whitespace-pre-wrap text-blue-300">
            {executionOutput || 'Ready for input...'}
          </pre>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
          <ShieldAlert size={20} className="text-slate-500" />
          Governance Audit Trail
        </h3>
        {allTasks.map(task => (
          <div key={task.id} className="bg-white border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              {getStatusIcon(task.currentStatus)}
              <div>
                <div className="font-bold text-slate-800">{task.goal}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">
                  {task.assignedRole} • Attempt: {task.currentAttempt || 1} • {task.id}
                </div>
              </div>
            </div>
            <Badge className={`${getTaskStatusColor(task.currentStatus)} px-3 py-1`}>
              {task.currentStatus.toUpperCase()}
            </Badge>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
