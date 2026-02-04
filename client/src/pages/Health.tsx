import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MetricsChart from '@/components/dashboard/MetricsChart';
import { HEALTH_STATUS } from '@/lib/constants';
import { getHealthStatusColor } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';

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
    name: 'API Server',
    status: HEALTH_STATUS.HEALTHY,
    uptime: 99.98,
    responseTime: 145,
    lastCheck: new Date(Date.now() - 30000),
  },
  {
    name: 'Database',
    status: HEALTH_STATUS.HEALTHY,
    uptime: 99.95,
    responseTime: 25,
    lastCheck: new Date(Date.now() - 45000),
  },
  {
    name: 'Cache Layer',
    status: HEALTH_STATUS.WARNING,
    uptime: 99.50,
    responseTime: 8,
    lastCheck: new Date(Date.now() - 60000),
  },
  {
    name: 'Message Queue',
    status: HEALTH_STATUS.HEALTHY,
    uptime: 99.99,
    responseTime: 12,
    lastCheck: new Date(Date.now() - 20000),
  },
];

const auditLogs: AuditLog[] = [
  {
    timestamp: new Date(Date.now() - 300000),
    action: 'Task Execution',
    actor: 'Developer',
    status: 'success',
    details: 'API Implementation task completed successfully',
  },
  {
    timestamp: new Date(Date.now() - 600000),
    action: 'Negotiation Started',
    actor: 'System',
    status: 'success',
    details: 'Tech Stack Selection negotiation initiated',
  },
  {
    timestamp: new Date(Date.now() - 900000),
    action: 'Cost Alert',
    actor: 'System',
    status: 'warning',
    details: 'Provider A costs exceeded threshold',
  },
  {
    timestamp: new Date(Date.now() - 1200000),
    action: 'Consensus Reached',
    actor: 'Arbitration Expert',
    status: 'success',
    details: 'API Design Patterns negotiation resolved',
  },
  {
    timestamp: new Date(Date.now() - 1500000),
    action: 'Task Failed',
    actor: 'Tester',
    status: 'error',
    details: 'Database Migration task failed - rollback initiated',
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

const getLogStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

export default function Health() {
  const healthyCount = services.filter((s) => s.status === HEALTH_STATUS.HEALTHY).length;
  const warningCount = services.filter((s) => s.status === HEALTH_STATUS.WARNING).length;
  const criticalCount = services.filter((s) => s.status === HEALTH_STATUS.CRITICAL).length;

  return (
    <MainLayout
      title="System Health"
      subtitle="Real-time monitoring and observability"
    >
      {/* Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Overall Status</p>
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-600" size={24} />
            <p className="text-2xl font-bold text-green-600">Operational</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Healthy Services</p>
          <p className="text-4xl font-bold text-green-600">{healthyCount}</p>
          <p className="text-sm text-slate-600">of {services.length}</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Warnings</p>
          <p className="text-4xl font-bold text-yellow-600">{warningCount}</p>
          <p className="text-sm text-slate-600">Requires attention</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-2">Critical</p>
          <p className="text-4xl font-bold text-red-600">{criticalCount}</p>
          <p className="text-sm text-slate-600">Immediate action needed</p>
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Service Status
        </h3>
        <div className="space-y-4">
          {services.map((service, idx) => (
            <div key={idx} className="border-b border-slate-200 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="font-medium text-slate-900">{service.name}</p>
                    <p className="text-xs text-slate-600">
                      Last check: {service.lastCheck.toLocaleTimeString()}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Uptime</p>
                  <div className="flex items-center gap-2">
                    <Progress value={service.uptime} />
                    <span className="text-sm font-medium text-slate-900">
                      {service.uptime}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Response Time</p>
                  <p className="text-sm font-medium text-slate-900">
                    {service.responseTime}ms
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <MetricsChart
          title="CPU Usage"
          baseValue={45}
          variance={15}
          color="#ef4444"
          type="area"
        />
        <MetricsChart
          title="Memory Usage"
          baseValue={62}
          variance={10}
          color="#f59e0b"
          type="area"
        />
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Audit Logs
        </h3>
        <div className="space-y-3">
          {auditLogs.map((log, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 pb-3 border-b border-slate-200 last:border-0"
            >
              <div className="flex-shrink-0">
                <Badge className={getLogStatusColor(log.status)}>
                  {log.status}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">{log.action}</p>
                  <p className="text-xs text-slate-600 flex-shrink-0">
                    {log.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <p className="text-sm text-slate-600 mt-1">{log.details}</p>
                <p className="text-xs text-slate-500 mt-1">by {log.actor}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
