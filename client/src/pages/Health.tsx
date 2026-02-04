import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MetricsChart from '@/components/dashboard/MetricsChart';
import { HEALTH_STATUS } from '@/lib/constants';
import { getHealthStatusColor } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, XCircle, Clock, Shield, Activity } from 'lucide-react';

interface Service {
  name: string;
  status: string;
  uptime: number;
  responseTime: number;
  lastCheck: Date;
}

interface AuditLog {
  timestamp: Date;
  action: string;
  actor: string;
  status: 'success' | 'warning' | 'error';
  details: string;
}

const services: Service[] = [
  {
    name: 'P.R.O.M.P.T. 引擎',
    status: HEALTH_STATUS.HEALTHY,
    uptime: 99.99,
    responseTime: 120,
    lastCheck: new Date(Date.now() - 30000),
  },
  {
    name: '元认知协商服务器',
    status: HEALTH_STATUS.HEALTHY,
    uptime: 99.95,
    responseTime: 450,
    lastCheck: new Date(Date.now() - 45000),
  },
  {
    name: 'ChromaDB 向量检索',
    status: HEALTH_STATUS.WARNING,
    uptime: 98.50,
    responseTime: 85,
    lastCheck: new Date(Date.now() - 60000),
  },
  {
    name: 'MCP 工具链网关',
    status: HEALTH_STATUS.HEALTHY,
    uptime: 99.99,
    responseTime: 15,
    lastCheck: new Date(Date.now() - 20000),
  },
];

const auditLogs: AuditLog[] = [
  {
    timestamp: new Date(Date.now() - 300000),
    action: '元认知审计',
    actor: 'Architect',
    status: 'success',
    details: '系统架构设计通过 P.R.O.M.P.T. 六大支柱合规性检查',
  },
  {
    timestamp: new Date(Date.now() - 600000),
    action: '协商干预',
    actor: 'Arbitration Expert',
    status: 'warning',
    details: '检测到 API 设计模式存在认知漂移，已强制介入',
  },
  {
    timestamp: new Date(Date.now() - 900000),
    action: '成本熔断',
    actor: 'System',
    status: 'error',
    details: 'Provider A 消耗速率异常，已自动切换至备用模型',
  },
  {
    timestamp: new Date(Date.now() - 1200000),
    action: '知识库更新',
    actor: 'Algorithm Expert',
    status: 'success',
    details: '成功提取并存储 12 条高效协作模式至向量数据库',
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case HEALTH_STATUS.HEALTHY:
      return <CheckCircle className="text-green-600" size={20} />;
    case HEALTH_STATUS.WARNING:
      return <AlertCircle className="text-yellow-600" size={20} />;
    case HEALTH_STATUS.CRITICAL:
      return <XCircle className="text-red-600" size={20} />;
    default:
      return <Clock className="text-slate-600" size={20} />;
  }
};

export default function Health() {
  const healthyCount = services.filter((s) => s.status === HEALTH_STATUS.HEALTHY).length;

  return (
    <MainLayout
      title="系统健康"
      subtitle="AI 团队治理系统的实时观测与元认知监控"
    >
      {/* Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Shield className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">整体治理状态</p>
            <p className="text-2xl font-bold text-green-600">运行正常</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Activity className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">活跃服务</p>
            <p className="text-2xl font-bold text-slate-900">{healthyCount} / {services.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="text-yellow-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">待处理警报</p>
            <p className="text-2xl font-bold text-slate-900">2 条</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Services Status */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            服务可用性
          </h3>
          <div className="space-y-6">
            {services.map((service, idx) => (
              <div key={idx} className="group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <p className="font-bold text-slate-900">{service.name}</p>
                      <p className="text-xs text-slate-500">
                        最后检查: {service.lastCheck.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    style={{
                      backgroundColor: getHealthStatusColor(service.status),
                      color: 'white',
                    }}
                  >
                    {service.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pl-8">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>正常运行时间 (Uptime)</span>
                      <span>{service.uptime}%</span>
                    </div>
                    <Progress value={service.uptime} className="h-1.5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">响应延迟</span>
                    <span className="text-sm font-semibold text-slate-900">{service.responseTime}ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <MetricsChart
              title="系统认知负载 (CPU)"
              baseValue={45}
              variance={15}
              color="#3b82f6"
              type="area"
            />
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <MetricsChart
              title="记忆检索压力 (Memory)"
              baseValue={62}
              variance={10}
              color="#8b5cf6"
              type="area"
            />
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">治理审计日志 (Audit Traces)</h3>
        <div className="space-y-4">
          {auditLogs.map((log, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
            >
              <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                log.status === 'success' ? 'bg-green-500' : 
                log.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-bold text-slate-900">{log.action}</p>
                  <span className="text-xs text-slate-400 font-mono">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{log.details}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px] py-0 h-4">
                    执行者: {log.actor}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-6 py-2 text-sm font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
          查看完整审计报告
        </button>
      </div>
    </MainLayout>
  );
}
