import React, { useState } from 'react';
import {
  Rocket,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import KPICard from '@/components/dashboard/KPICard';
import MetricsChart from '@/components/dashboard/MetricsChart';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function Home() {
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
      title="Dashboard"
      subtitle="Real-time monitoring of AI Team Governance System"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <KPICard
          title="Active Tasks"
          value={metrics.activeTasks}
          change={12}
          trend="up"
          icon={<Rocket size={24} />}
          color="blue"
        />
        <KPICard
          title="Total Cost"
          value={formatCurrency(metrics.totalCost)}
          change={8.4}
          trend="up"
          icon={<DollarSign size={24} />}
          color="red"
        />
        <KPICard
          title="Avg Iterations"
          value={metrics.avgIterations}
          change={5.2}
          trend="up"
          icon={<TrendingUp size={24} />}
          color="purple"
        />
        <KPICard
          title="Success Rate"
          value={`${metrics.successRate}%`}
          change={2.1}
          trend="up"
          icon={<CheckCircle size={24} />}
          color="green"
        />
        <KPICard
          title="Avg Response Time"
          value={metrics.avgResponseTime}
          unit="ms"
          change={-15}
          trend="down"
          icon={<Clock size={24} />}
          color="orange"
        />
        <KPICard
          title="System Load"
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
          title="Tokens Per Minute"
          baseValue={1200}
          variance={300}
          color="#3b82f6"
          type="area"
        />
        <MetricsChart
          title="API Calls Per Minute"
          baseValue={45}
          variance={15}
          color="#8b5cf6"
          type="area"
        />
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Completed Tasks
          </h3>
          <p className="text-4xl font-bold text-green-600">
            {formatNumber(metrics.completedTasks)}
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Last 30 days
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            System Health
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <div>
              <p className="font-semibold text-green-600">Operational</p>
              <p className="text-sm text-slate-600">All systems nominal</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Active Providers
          </h3>
          <p className="text-4xl font-bold text-blue-600">4</p>
          <p className="text-sm text-slate-600 mt-2">
            Distributed across regions
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
