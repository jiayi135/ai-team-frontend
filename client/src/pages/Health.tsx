import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MetricsChart from '@/components/dashboard/MetricsChart';
import { HEALTH_STATUS } from '@/lib/constants';
import { getHealthStatusColor } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, XCircle, Clock, Shield, Activity, RefreshCw, Loader2 } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

interface ServiceHealth {
  name: string;
  status: string;
  uptime: number;
  responseTime: number;
  lastCheck: string;
  description?: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  status: 'success' | 'warning' | 'error';
  details: string;
  constitutionalClause?: string;
}

interface HealthSummary {
  overallStatus: string;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  totalServices: number;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getStatusIcon = (status: string) => {
  switch (status) {
    case '正常':
    case HEALTH_STATUS.HEALTHY:
      return <CheckCircle className="text-green-600" size={20} />;
    case '警告':
    case HEALTH_STATUS.WARNING:
      return <AlertCircle className="text-yellow-600" size={20} />;
    case '严重':
    case HEALTH_STATUS.CRITICAL:
      return <XCircle className="text-red-600" size={20} />;
    default:
      return <Clock className="text-slate-600" size={20} />;
  }
};

export default function Health() {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isConnected } = useSocket();

  // 获取所有健康数据
  const fetchHealthData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [servicesRes, summaryRes, metricsRes, logsRes] = await Promise.all([
        fetch(`${API_BASE}/api/health/services`),
        fetch(`${API_BASE}/api/health/summary`),
        fetch(`${API_BASE}/api/health/metrics`),
        fetch(`${API_BASE}/api/health/audit-logs?limit=20`)
      ]);

      const servicesData = await servicesRes.json();
      const summaryData = await summaryRes.json();
      const metricsData = await metricsRes.json();
      const logsData = await logsRes.json();

      if (servicesData.success) {
        setServices(servicesData.services);
      }

      if (summaryData.success) {
        setSummary({
          overallStatus: summaryData.overallStatus,
          healthyCount: summaryData.healthyCount,
          warningCount: summaryData.warningCount,
          criticalCount: summaryData.criticalCount,
          totalServices: summaryData.totalServices
        });
      }

      if (metricsData.success) {
        setMetrics(metricsData.metrics);
      }

      if (logsData.success) {
        setAuditLogs(logsData.logs);
      }

    } catch (err: any) {
      setError(err.message || '获取健康数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    // 每30秒自动刷新
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const healthyCount = summary?.healthyCount || 0;
  const totalServices = summary?.totalServices || services.length;
  const warningCount = summary?.warningCount || 0;

  if (isLoading && services.length === 0) {
    return (
      <MainLayout title="系统健康" subtitle="加载中...">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="系统健康"
      subtitle={`AI 团队治理系统的实时观测与元认知监控 (Article IV) | 实时: ${isConnected ? '在线' : '离线'}`}
    >
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 text-sm mb-6">
          {error}
          <button onClick={fetchHealthData} className="ml-4 underline">重试</button>
        </div>
      )}

      {/* Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            summary?.overallStatus === '正常' ? 'bg-green-100' : 
            summary?.overallStatus === '警告' ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <Shield className={
              summary?.overallStatus === '正常' ? 'text-green-600' : 
              summary?.overallStatus === '警告' ? 'text-yellow-600' : 'text-red-600'
            } size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">整体治理状态</p>
            <p className={`text-2xl font-bold ${
              summary?.overallStatus === '正常' ? 'text-green-600' : 
              summary?.overallStatus === '警告' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {summary?.overallStatus || '运行正常'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Activity className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">活跃服务</p>
            <p className="text-2xl font-bold text-slate-900">{healthyCount} / {totalServices}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="text-yellow-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">待处理警报</p>
            <p className="text-2xl font-bold text-slate-900">{warningCount} 条</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Services Status */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              服务可用性
            </h3>
            <button
              onClick={fetchHealthData}
              disabled={isLoading}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="刷新状态"
            >
              <RefreshCw size={16} className={`text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-6">
            {services.map((service, idx) => (
              <div key={idx} className="group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <p className="font-bold text-slate-900">{service.name}</p>
                      <p className="text-xs text-slate-500">
                        最后检查: {new Date(service.lastCheck).toLocaleTimeString()}
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
                      <span>{service.uptime.toFixed(2)}%</span>
                    </div>
                    <Progress value={service.uptime} className="h-1.5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">响应延迟</span>
                    <span className={`text-sm font-semibold ${
                      service.responseTime > 500 ? 'text-red-600' : 
                      service.responseTime > 200 ? 'text-yellow-600' : 'text-slate-900'
                    }`}>
                      {service.responseTime}ms
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-700 mb-4">系统认知负载 (CPU)</h4>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {metrics?.cpuUsage.toFixed(1) || '0'}%
            </div>
            <Progress value={metrics?.cpuUsage || 0} className="h-2" />
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-700 mb-4">记忆检索压力 (Memory)</h4>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {metrics?.memoryUsage.toFixed(1) || '0'}%
            </div>
            <Progress value={metrics?.memoryUsage || 0} className="h-2" />
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-700 mb-4">活跃连接数</h4>
            <div className="text-3xl font-bold text-green-600">
              {metrics?.activeConnections || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              请求速率: {metrics?.requestsPerMinute || 0}/min
            </p>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">
          治理审计日志 (Article I: 溯源与验证)
        </h3>
        <div className="space-y-4">
          {auditLogs.map((log) => (
            <div
              key={log.id}
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
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{log.details}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px] py-0 h-4">
                    执行者: {log.actor}
                  </Badge>
                  {log.constitutionalClause && (
                    <Badge variant="secondary" className="text-[10px] py-0 h-4">
                      {log.constitutionalClause}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {auditLogs.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            暂无审计日志
          </div>
        )}
        <button className="w-full mt-6 py-2 text-sm font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
          查看完整审计报告
        </button>
      </div>
    </MainLayout>
  );
}
