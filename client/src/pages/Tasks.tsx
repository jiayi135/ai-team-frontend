import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { TASK_STATUS } from '@/lib/constants';
import { getTaskStatusColor, formatTime, formatDuration } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

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
}

const mockTasks: Task[] = [
  {
    id: '1',
    name: 'System Architecture Design',
    status: TASK_STATUS.COMPLETED,
    progress: 100,
    startTime: new Date(Date.now() - 7200000),
    duration: 3600,
    assignedRole: 'Architect',
    priority: 'high',
    iterations: 2,
    cost: 45.50,
  },
  {
    id: '2',
    name: 'API Implementation',
    status: TASK_STATUS.RUNNING,
    progress: 65,
    startTime: new Date(Date.now() - 3600000),
    assignedRole: 'Developer',
    priority: 'high',
    iterations: 1,
    cost: 32.75,
  },
  {
    id: '3',
    name: 'Performance Optimization',
    status: TASK_STATUS.RUNNING,
    progress: 40,
    startTime: new Date(Date.now() - 1800000),
    assignedRole: 'Algorithm Expert',
    priority: 'medium',
    iterations: 3,
    cost: 28.25,
  },
  {
    id: '4',
    name: 'Unit Testing Suite',
    status: TASK_STATUS.QUEUED,
    progress: 0,
    startTime: new Date(),
    assignedRole: 'Tester',
    priority: 'medium',
    iterations: 0,
    cost: 0,
  },
  {
    id: '5',
    name: 'Database Migration',
    status: TASK_STATUS.FAILED,
    progress: 25,
    startTime: new Date(Date.now() - 5400000),
    duration: 1800,
    assignedRole: 'Developer',
    priority: 'critical',
    iterations: 2,
    cost: 15.50,
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
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function Tasks() {
  const [filter, setFilter] = useState<string>('all');

  const filteredTasks =
    filter === 'all'
      ? mockTasks
      : mockTasks.filter((task) => task.status === filter);

  const stats = {
    total: mockTasks.length,
    completed: mockTasks.filter((t) => t.status === TASK_STATUS.COMPLETED).length,
    running: mockTasks.filter((t) => t.status === TASK_STATUS.RUNNING).length,
    failed: mockTasks.filter((t) => t.status === TASK_STATUS.FAILED).length,
  };

  return (
    <MainLayout
      title="Task Monitoring"
      subtitle="Real-time execution tracking and performance metrics"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Total Tasks</p>
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Running</p>
          <p className="text-3xl font-bold text-blue-600">{stats.running}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Failed</p>
          <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter(TASK_STATUS.RUNNING)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === TASK_STATUS.RUNNING
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Running
        </button>
        <button
          onClick={() => setFilter(TASK_STATUS.COMPLETED)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === TASK_STATUS.COMPLETED
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter(TASK_STATUS.FAILED)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === TASK_STATUS.FAILED
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Failed
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(task.status)}
                <div>
                  <h3 className="font-semibold text-slate-900">{task.name}</h3>
                  <p className="text-sm text-slate-600">
                    Started {formatTime(task.startTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-600 mb-1">Progress</p>
                <div className="flex items-center gap-2">
                  <Progress value={task.progress} />
                  <span className="text-sm font-medium text-slate-900">
                    {task.progress}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Assigned Role</p>
                <p className="text-sm font-medium text-slate-900">{task.assignedRole}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Iterations</p>
                <p className="text-sm font-medium text-slate-900">{task.iterations}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Cost</p>
                <p className="text-sm font-medium text-slate-900">${task.cost.toFixed(2)}</p>
              </div>
            </div>

            {task.duration && (
              <div className="text-xs text-slate-600">
                Duration: {formatDuration(task.duration)}
              </div>
            )}
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
