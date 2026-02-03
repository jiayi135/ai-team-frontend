import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Badge, Drawer, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  RocketOutlined,
  DatabaseOutlined,
  SettingOutlined,
  BellOutlined,
  SearchOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const ResponsiveLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">仪表板</Link>,
    },
    {
      key: '/tasks',
      icon: <RocketOutlined />,
      label: <Link to="/tasks">任务管理</Link>,
    },
    {
      key: '/providers',
      icon: <DatabaseOutlined />,
      label: <Link to="/providers">提供商管理</Link>,
    },
    {
      key: '/logs',
      icon: <HistoryOutlined />,
      label: <Link to="/logs">系统日志</Link>,
    },
    {
      key: '/config',
      icon: <SettingOutlined />,
      label: <Link to="/config">系统配置</Link>,
    },
  ];

  const renderSidebar = () => (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={240}
      theme="dark"
      className="fixed left-0 top-0 bottom-0 z-20"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)'
      }}
    >
      <div className="p-4">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">AI</span>
            </div>
            <div>
              <Title level={4} className="m-0" style={{ color: 'white' }}>AI团队协作</Title>
              <div className="text-xs text-gray-400">自主迭代系统</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">AI</span>
            </div>
          </div>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        className="mt-4"
      />
    </Sider>
  );

  return (
    <Layout className="min-h-screen">
      {!isMobile && renderSidebar()}
      
      <Layout className={!isMobile ? (collapsed ? 'ml-20' : 'ml-60') : ''} style={{ transition: 'margin-left 0.2s' }}>
        <Header className="bg-white shadow-sm sticky top-0 z-10" style={{ padding: 0, background: '#fff' }}>
          <div className="flex justify-between items-center h-full px-4">
            <div className="flex items-center space-x-4">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
              />
            </div>

            <div className="flex items-center space-x-4">
              <Button
                type="text"
                icon={<BellOutlined />}
                shape="circle"
              />
              <Avatar className="bg-blue-500">U</Avatar>
            </div>
          </div>
        </Header>

        <Content className="p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ResponsiveLayout;
