import React, { useState } from 'react';
import {
  Rocket,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  Zap,
  ShieldCheck,
  Wrench,
  ChevronRight,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import KPICard from '@/components/dashboard/KPICard';
import MetricsChart from '@/components/dashboard/MetricsChart';
import TaskComposer from '@/components/tasks/TaskComposer';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function Home() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleTaskSubmit = async (role: string, goal: string, useMemory: boolean) => {
    try {
      setIsSubmitting(true);
      
      // 从本地存储获取 LLM 配置
      const savedConfig = localStorage.getItem('ai_team_llm_config');
      const config = savedConfig ? JSON.parse(savedConfig) : null;

      if (!config || !config.apiKey) {
        toast.error('未检测到 API 配置', {
          description: '请先前往“系统设置”配置您的模型 API Key。',
          action: {
            label: '去设置',
            onClick: () => setLocation('/settings')
          }
        });
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/execute/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role, 
          goal, 
          context: useMemory ? 'with_memory' : 'no_memory',
          config: config // 传递配置到后端
        }),
      });
      
      if (response.ok) {
        toast.success('任务已启动', {
          description: 'AI 团队已开始处理您的请求。'
        });
        setLocation('/tasks');
      } else {
        const errorData = await response.json();
        toast.error('任务启动失败', {
          description: errorData.error || '未知错误'
        });
      }
    } catch (error) {
      console.error('Failed to submit task:', error);
      toast.error('网络错误', {
        description: '无法连接到治理后端。'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [metrics] = useState({
    activeTasks: 12,
    completedTasks: 847,
    totalCost: 12450.75,
    avgIterations: 3.4,
    successRate: 98.5,
    avgResponseTime: 450,
  });

  return (
    <MainLayout
      title="仪表盘"
      subtitle="AI 团队治理系统实时监控 (P.R.O.M.P.T. 框架)"
    >

      {/* Quick Access to Tools */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
            <Wrench size={30} />
          </div>
          <div>
            <h3 className="text-xl font-bold">MCP 工具管理中心</h3>
            <p className="text-blue-100 text-sm">即时调用与调试 20+ 外部治理插件</p>
          </div>
        </div>
        <button
          onClick={() => setLocation('/tools')}
          className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2"
        >
          进入管理后台
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Task Composer Section */}
      <div className="mb-12">
        <TaskComposer onSubmit={handleTaskSubmit} isLoading={isSubmitting} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <KPICard
          title="活跃任务"
          value={metrics.activeTasks}
          change={12}
          trend="up"
          icon={<Rocket size={24} />}
          color="blue"
        />
        <KPICard
          title="治理总成本"
          value={formatCurrency(metrics.totalCost)}
          change={8.4}
          trend="up"
          icon={<DollarSign size={24} />}
          color="red"
        />
        <KPICard
          title="平均审计轮次"
          value={metrics.avgIterations}
          change={5.2}
          trend="up"
          icon={<TrendingUp size={24} />}
          color="purple"
        />
        <KPICard
          title="治理成功率"
          value={`${metrics.successRate}%`}
          change={2.1}
          trend="up"
          icon={<CheckCircle size={24} />}
          color="green"
        />
        <KPICard
          title="平均响应延迟"
          value={metrics.avgResponseTime}
          unit="ms"
          change={-15}
          trend="down"
          icon={<Clock size={24} />}
          color="orange"
        />
        <KPICard
          title="系统认知负载"
          value="65%"
          change={3}
          trend="up"
          icon={<Zap size={24} />}
          color="blue"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <MetricsChart
          title="Token 消耗速率 (TPM)"
          baseValue={1200}
          variance={300}
          color="#3b82f6"
          type="area"
        />
        <MetricsChart
          title="API 调用频率 (CPM)"
          baseValue={45}
          variance={15}
          color="#8b5cf6"
          type="area"
        />
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            已完成治理任务
          </h3>
          <p className="text-4xl font-bold text-green-600">
            {formatNumber(metrics.completedTasks)}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            过去 30 天
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            系统健康度
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="font-bold text-green-600">运行正常</p>
              <p className="text-sm text-slate-500">所有治理模块均在线</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            活跃模型供应商
          </h3>
          <p className="text-4xl font-bold text-blue-600">4</p>
          <p className="text-sm text-slate-500 mt-2">
            已实现跨区域分布式部署
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
