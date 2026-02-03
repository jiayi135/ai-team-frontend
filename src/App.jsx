import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ResponsiveLayout from './components/common/ResponsiveLayout';
import Dashboard from './pages/Dashboard';
// 占位页面
const Tasks = () => <div>任务管理页面</div>;
const Providers = () => <div>提供商管理页面</div>;
const Logs = () => <div>系统日志页面</div>;
const Config = () => <div>系统配置页面</div>;

const App = () => {
  return (
    <Router>
      <ResponsiveLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/config" element={<Config />} />
        </Routes>
      </ResponsiveLayout>
    </Router>
  );
};

export default App;
