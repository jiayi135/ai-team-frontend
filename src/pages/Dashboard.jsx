import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, Space, Tabs, Badge } from 'antd';
import { 
  DashboardOutlined, 
  RocketOutlined, 
  DollarOutlined, 
  ClockCircleOutlined,
  LineChartOutlined 
} from '@ant-design/icons';
import RealTimeMetrics from '../components/dashboard/RealTimeMetrics';
// 假设这些组件存在或稍后创建
const CostBreakdown = () => <div>Cost Breakdown Chart</div>;
const ProviderStatus = () => <div>Provider Status List</div>;
const ActiveTasks = () => <div>Active Tasks List</div>;
const QuickActions = () => <div>Quick Actions Bar</div>;

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    activeTasks: 5,
    completedTasks: 120,
    totalCost: 45.67,
    avgIterations: 3.4,
    successRate: 98.5,
    avgResponseTime: 450
  });

  const [realtimeData, setRealtimeData] = useState({
    tokensPerMinute: 1200,
    apiCallsPerMinute: 45,
    activeProviders: 4,
    systemLoad: 65
  });

  return (
    <div className="dashboard-container">
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card className="dashboard-card">
            <Statistic
              title="活跃任务"
              value={metrics.activeTasks}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <Progress percent={30} size="small" showInfo={false} />
            <div className="text-xs text-gray-500 mt-2">5个进行中</div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card className="dashboard-card">
            <Statistic
              title="总成本"
              value={metrics.totalCost}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              suffix="USD"
            />
            <div className="text-xs text-gray-500 mt-2">今日: ${(metrics.totalCost * 0.15).toFixed(2)}</div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card className="dashboard-card">
            <Statistic
              title="平均迭代"
              value={metrics.avgIterations}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={75} size="small" status="active" showInfo={false} />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card className="dashboard-card">
            <Statistic
              title="成功率"
              value={metrics.successRate}
              suffix="%"
              prefix={<DashboardOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div className="text-xs text-gray-500 mt-2">过去24小时</div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card className="dashboard-card">
            <Statistic
              title="平均响应"
              value={metrics.avgResponseTime}
              suffix="ms"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <div className="text-xs text-gray-500 mt-2">实时监控</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <Card 
            title="实时指标监控" 
            extra={<Badge status="processing" text="实时更新" />}
            className="h-full"
          >
            <RealTimeMetrics data={realtimeData} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="成本分布" className="h-full">
            <CostBreakdown />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="提供商状态">
            <ProviderStatus />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="活跃任务">
            <ActiveTasks />
          </Card>
        </Col>
      </Row>

      <QuickActions />
    </div>
  );
};

export default Dashboard;
