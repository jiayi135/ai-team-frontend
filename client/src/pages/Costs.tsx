import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MetricsChart from '@/components/dashboard/MetricsChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, AlertTriangle, Shield } from 'lucide-react';

interface CostData {
  provider: string;
  cost: number;
  percentage: number;
  trend: number;
}

const costByProvider: CostData[] = [
  { provider: 'OpenAI (GPT-4o)', cost: 6240, percentage: 45, trend: 12.5 },
  { provider: 'Anthropic (Claude 3.5)', cost: 4160, percentage: 30, trend: -5.2 },
  { provider: 'Google (Gemini 1.5)', cost: 2080, percentage: 15, trend: 8.5 },
  { provider: 'Local (Llama 3)', cost: 1380, percentage: 10, trend: 0 },
];

const costByCategory = [
  { name: '元认知协商', value: 5200, color: '#3b82f6' },
  { name: '上下文挖掘', value: 3500, color: '#8b5cf6' },
  { name: '任务分解', value: 2800, color: '#ec4899' },
  { name: '代码实现', value: 1500, color: '#f59e0b' },
  { name: '系统审计', value: 860, color: '#10b981' },
];

export default function Costs() {
  const totalCost = costByCategory.reduce((sum, item) => sum + item.value, 0);
  const monthlyBudget = 20000;
  const budgetUtilization = (totalCost / monthlyBudget) * 100;

  return (
    <MainLayout
      title="成本管理"
      subtitle="基于 P.R.O.M.P.T. 框架的预算追踪与成本优化"
    >
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <p className="text-sm text-slate-600 mb-2">本月总支出</p>
          <p className="text-4xl font-bold text-slate-900 mb-2">
            {formatCurrency(totalCost)}
          </p>
          <div className="flex items-center gap-2 text-sm text-red-600">
            <TrendingUp size={16} />
            <span>较上月增长 8.4%</span>
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
                budgetUtilization > 90 ? 'bg-red-500' : 'bg-blue-600'
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
              monthlyBudget - totalCost > 2000
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {formatCurrency(monthlyBudget - totalCost)}
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Shield size={16} className="text-blue-500" />
            <span>预计可支撑至本月底</span>
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
                  data={costByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {costByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {costByCategory.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-slate-600">{item.name}</span>
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
            {costByProvider.map((item, idx) => (
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

      {/* Trends */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm mb-8">
        <MetricsChart
          title="每日成本趋势 (Token 消耗)"
          baseValue={500}
          variance={150}
          color="#3b82f6"
          type="area"
        />
      </div>

      {/* Governance Alerts */}
      <div className="bg-red-50 border border-red-100 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-red-600" size={20} />
          <h3 className="text-lg font-semibold text-red-900">
            治理警报
          </h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-white rounded border border-red-100">
            <div className="w-2 h-2 bg-red-600 rounded-full mt-1.5"></div>
            <div>
              <p className="font-medium text-slate-900">协商成本异常</p>
              <p className="text-sm text-slate-600">
                "API 设计模式" 协商事件单次消耗超过 $10.00 限制，已触发自动熔断。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white rounded border border-red-100">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
            <div>
              <p className="font-medium text-slate-900">预算配额预警</p>
              <p className="text-sm text-slate-600">
                OpenAI 配额已使用 85%，建议切换至本地 Llama 3 模型处理非核心任务。
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
