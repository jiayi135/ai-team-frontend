import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MetricsChart from '@/components/dashboard/MetricsChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertTriangle, Shield, RefreshCw, Loader2 } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

interface ProviderCost {
  provider: string;
  cost: number;
  percentage: number;
  trend: number;
}

interface CategoryCost {
  name: string;
  value: number;
  color: string;
}

interface CostSummary {
  totalCost: number;
  monthlyBudget: number;
  budgetUtilization: number;
  remainingBudget: number;
  costChange: number;
}

interface CostAlert {
  severity: 'error' | 'warning';
  title: string;
  description: string;
}

interface CostHistory {
  date: string;
  cost: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Costs() {
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [providerCosts, setProviderCosts] = useState<ProviderCost[]>([]);
  const [categoryCosts, setCategoryCosts] = useState<CategoryCost[]>([]);
  const [costHistory, setCostHistory] = useState<CostHistory[]>([]);
  const [alerts, setAlerts] = useState<CostAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isConnected } = useSocket();

  // 获取所有成本数据
  const fetchCostData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [summaryRes, providerRes, categoryRes, historyRes, alertsRes] = await Promise.all([
        fetch(`${API_BASE}/api/costs/summary`),
        fetch(`${API_BASE}/api/costs/by-provider`),
        fetch(`${API_BASE}/api/costs/by-category`),
        fetch(`${API_BASE}/api/costs/history?days=30`),
        fetch(`${API_BASE}/api/costs/alerts`)
      ]);

      const summaryData = await summaryRes.json();
      const providerData = await providerRes.json();
      const categoryData = await categoryRes.json();
      const historyData = await historyRes.json();
      const alertsData = await alertsRes.json();

      if (summaryData.success) {
        setSummary({
          totalCost: summaryData.totalCost,
          monthlyBudget: summaryData.monthlyBudget,
          budgetUtilization: summaryData.budgetUtilization,
          remainingBudget: summaryData.remainingBudget,
          costChange: summaryData.costChange
        });
      }

      if (providerData.success) {
        setProviderCosts(providerData.data);
      }

      if (categoryData.success) {
        setCategoryCosts(categoryData.data);
      }

      if (historyData.success) {
        setCostHistory(historyData.data);
      }

      if (alertsData.success) {
        setAlerts(alertsData.alerts);
      }

    } catch (err: any) {
      setError(err.message || '获取成本数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCostData();
  }, []);

  if (isLoading && !summary) {
    return (
      <MainLayout title="成本管理" subtitle="加载中...">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
      </MainLayout>
    );
  }

  const totalCost = summary?.totalCost || 0;
  const monthlyBudget = summary?.monthlyBudget || 20000;
  const budgetUtilization = summary?.budgetUtilization || 0;
  const remainingBudget = summary?.remainingBudget || 0;
  const costChange = summary?.costChange || 0;

  return (
    <MainLayout
      title="成本管理"
      subtitle={`基于 P.R.O.M.P.T. 框架的预算追踪与成本优化 (Article III) | 实时: ${isConnected ? '在线' : '离线'}`}
    >
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 text-sm mb-6">
          {error}
          <button onClick={fetchCostData} className="ml-4 underline">重试</button>
        </div>
      )}

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-slate-600">本月总支出</p>
            <button onClick={fetchCostData} className="p-1 hover:bg-slate-100 rounded">
              <RefreshCw size={14} className={`text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-4xl font-bold text-slate-900 mb-2">
            {formatCurrency(totalCost)}
          </p>
          <div className={`flex items-center gap-2 text-sm ${costChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {costChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>较上月{costChange > 0 ? '增长' : '下降'} {Math.abs(costChange)}%</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <p className="text-sm text-slate-600 mb-2">月度预算额度</p>
          <p className="text-4xl font-bold text-slate-900 mb-2">
            {formatCurrency(monthlyBudget)}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
            <div
              className={`h-2 rounded-full transition-all ${
                budgetUtilization > 90 ? 'bg-red-500' : budgetUtilization > 75 ? 'bg-yellow-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-slate-600 mt-2">
            已使用 {budgetUtilization.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <p className="text-sm text-slate-600 mb-2">剩余可用预算</p>
          <p
            className={`text-4xl font-bold mb-2 ${
              remainingBudget > monthlyBudget * 0.1 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(remainingBudget)}
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Shield size={16} className="text-blue-500" />
            <span>{remainingBudget > 0 ? '预计可支撑至本月底' : '预算已耗尽'}</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Cost by Category */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            按治理维度划分
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryCosts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryCosts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryCosts.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-slate-600">{item.name}</span>
                <span className="text-slate-400 text-xs ml-auto">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost by Provider */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            按模型供应商划分
          </h3>
          <div className="space-y-5">
            {providerCosts.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">
                    {item.provider}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(item.cost)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-1 text-xs w-16 justify-end">
                    {item.trend > 0 ? (
                      <>
                        <TrendingUp size={12} className="text-red-500" />
                        <span className="text-red-500">+{item.trend}%</span>
                      </>
                    ) : item.trend < 0 ? (
                      <>
                        <TrendingDown size={12} className="text-green-500" />
                        <span className="text-green-500">{item.trend}%</span>
                      </>
                    ) : (
                      <span className="text-slate-400">持平</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cost History Trend */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          每日成本趋势 (过去30天)
        </h3>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={costHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.slice(5)} // 只显示月-日
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value as number), '成本']}
                labelFormatter={(label) => `日期: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="cost" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Governance Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-600" size={20} />
            <h3 className="text-lg font-semibold text-red-900">
              治理警报 (Article III: 经济保障)
            </h3>
          </div>
          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded border border-red-100">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${
                  alert.severity === 'error' ? 'bg-red-600' : 'bg-orange-500'
                }`}></div>
                <div>
                  <p className="font-medium text-slate-900">{alert.title}</p>
                  <p className="text-sm text-slate-600">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Alerts */}
      {alerts.length === 0 && (
        <div className="bg-green-50 border border-green-100 rounded-lg p-6">
          <div className="flex items-center gap-2">
            <Shield className="text-green-600" size={20} />
            <h3 className="text-lg font-semibold text-green-900">
              成本状态正常
            </h3>
          </div>
          <p className="text-sm text-green-700 mt-2">
            当前预算使用情况在健康范围内，无需采取紧急措施。
          </p>
        </div>
      )}
    </MainLayout>
  );
}
