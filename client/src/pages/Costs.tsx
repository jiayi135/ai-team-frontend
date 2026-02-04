import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MetricsChart from '@/components/dashboard/MetricsChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CostData {
  provider: string;
  cost: number;
  percentage: number;
  trend: number;
}

const costByProvider: CostData[] = [
  { provider: 'Provider A', cost: 4850, percentage: 40, trend: 5.2 },
  { provider: 'Provider B', cost: 3640, percentage: 30, trend: -2.1 },
  { provider: 'Provider C', cost: 2430, percentage: 20, trend: 8.5 },
  { provider: 'Provider D', cost: 1210, percentage: 10, trend: -1.3 },
];

const costByCategory = [
  { name: 'Compute', value: 5000, color: '#3b82f6' },
  { name: 'Storage', value: 2500, color: '#8b5cf6' },
  { name: 'Network', value: 2000, color: '#ec4899' },
  { name: 'API Calls', value: 1500, color: '#f59e0b' },
  { name: 'Tokens', value: 1130, color: '#10b981' },
];

export default function Costs() {
  const totalCost = costByCategory.reduce((sum, item) => sum + item.value, 0);
  const monthlyBudget = 15000;
  const budgetUtilization = (totalCost / monthlyBudget) * 100;

  return (
    <MainLayout
      title="Cost Management"
      subtitle="Budget tracking and cost optimization"
    >
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Total Cost (Month)</p>
          <p className="text-4xl font-bold text-slate-900 mb-2">
            {formatCurrency(totalCost)}
          </p>
          <p className="text-sm text-slate-600">
            {costByCategory.length} cost categories
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Monthly Budget</p>
          <p className="text-4xl font-bold text-slate-900 mb-2">
            {formatCurrency(monthlyBudget)}
          </p>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-slate-600 mt-2">
            {budgetUtilization.toFixed(1)}% utilized
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Remaining Budget</p>
          <p
            className={`text-4xl font-bold mb-2 ${
              monthlyBudget - totalCost > 0
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {formatCurrency(monthlyBudget - totalCost)}
          </p>
          <p className="text-sm text-slate-600">
            {Math.round((monthlyBudget - totalCost) / (monthlyBudget / 30))} days left
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Cost by Category */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Cost by Category
          </h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
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
        </div>

        {/* Cost by Provider */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Cost by Provider
          </h3>
          <div className="space-y-4">
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
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {item.trend > 0 ? (
                      <>
                        <TrendingUp size={14} className="text-red-600" />
                        <span className="text-red-600 font-medium">
                          +{item.trend}%
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown size={14} className="text-green-600" />
                        <span className="text-green-600 font-medium">
                          {item.trend}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 gap-6">
        <MetricsChart
          title="Daily Cost Trend"
          baseValue={300}
          variance={100}
          color="#ef4444"
          type="line"
        />
      </div>

      {/* Cost Alerts */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">
          Cost Alerts
        </h3>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-yellow-600 rounded-full mt-1.5"></div>
            <div>
              <p className="font-medium text-yellow-900">Budget Warning</p>
              <p className="text-sm text-yellow-800">
                Current spending is at {budgetUtilization.toFixed(1)}% of monthly budget
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-yellow-600 rounded-full mt-1.5"></div>
            <div>
              <p className="font-medium text-yellow-900">Provider A Spike</p>
              <p className="text-sm text-yellow-800">
                Provider A costs increased by 5.2% this week
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
