import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, Statistic, Row, Col, Badge, Space, Select, Switch } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  ApiOutlined,
  DashboardOutlined 
} from '@ant-design/icons';
import io from 'socket.io-client';

const { Option } = Select;

const RealTimeMetrics = ({ data }) => {
  const [timeRange, setTimeRange] = useState('5m');
  const [metricsData, setMetricsData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 模拟数据更新，因为实际 WebSocket 可能连不上
    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      const newData = {
        timestamp,
        tokens: Math.floor(Math.random() * 1000) + 500,
        calls: Math.floor(Math.random() * 50) + 10,
        latency: Math.floor(Math.random() * 200) + 300,
        errors: Math.random() * 0.05,
        activeTasks: Math.floor(Math.random() * 10) + 1,
        systemLoad: Math.floor(Math.random() * 40) + 40
      };

      setMetricsData(prev => {
        const updated = [...prev, newData].slice(-20);
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="realtime-metrics">
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={metricsData}>
            <defs>
              <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1890ff" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="timestamp" hide />
            <YAxis hide />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="tokens" 
              stroke="#1890ff" 
              fillOpacity={1} 
              fill="url(#colorTokens)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <Row gutter={16} className="mt-4">
        <Col span={6}>
          <Statistic title="Tokens/s" value={data?.tokensPerMinute || 0} prefix={<ThunderboltOutlined />} />
        </Col>
        <Col span={6}>
          <Statistic title="API Calls" value={data?.apiCallsPerMinute || 0} prefix={<ApiOutlined />} />
        </Col>
        <Col span={6}>
          <Statistic title="Providers" value={data?.activeProviders || 0} prefix={<DatabaseOutlined />} />
        </Col>
        <Col span={6}>
          <Statistic title="System Load" value={`${data?.systemLoad || 0}%`} prefix={<DashboardOutlined />} />
        </Col>
      </Row>
    </div>
  );
};

export default RealTimeMetrics;
