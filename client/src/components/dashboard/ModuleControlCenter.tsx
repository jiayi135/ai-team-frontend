import React from 'react';
import {
  Cpu,
  Brain,
  Zap,
  ShieldCheck,
  Database,
  GitMerge,
  ChevronRight,
  Activity
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useLocation } from 'wouter';

const MODULES = [
  {
    id: 'planner',
    name: '任务规划引擎',
    icon: <Brain className="text-blue-500" size={20} />,
    status: 'Active',
    desc: '元认知意图解析与任务拆解',
    link: '/tasks'
  },
  {
    id: 'executor',
    name: '自主执行模块',
    icon: <Zap className="text-yellow-500" size={20} />,
    status: 'Active',
    desc: '多智能体协作代码与指令执行',
    link: '/tasks'
  },
  {
    id: 'tester',
    name: '自动化审计系统',
    icon: <ShieldCheck className="text-green-500" size={20} />,
    status: 'Active',
    desc: '零信任原则下的结果验证与修复',
    link: '/tasks'
  },
  {
    id: 'arbitrator',
    name: '共识仲裁中心',
    icon: <GitMerge className="text-purple-500" size={20} />,
    status: 'Idle',
    desc: '解决角色冲突与最终决策判定',
    link: '/negotiations'
  },
  {
    id: 'memory',
    name: '长期记忆引擎',
    icon: <Database className="text-indigo-500" size={20} />,
    status: 'Active',
    desc: '跨会话知识沉淀与经验检索',
    link: '/search'
  },
  {
    id: 'mcp',
    name: 'MCP 插件网关',
    icon: <Cpu className="text-slate-500" size={20} />,
    status: 'Active',
    desc: '外部工具与数据源的安全访问',
    link: '/tools'
  }
];

export default function ModuleControlCenter() {
  const [, setLocation] = useLocation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Activity size={20} className="text-blue-600" />
          核心后端模块交互中心
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map((module) => (
          <Card
            key={module.id}
            className="hover:shadow-md transition-all cursor-pointer border-slate-100 hover:border-blue-200 group"
            onClick={() => setLocation(module.link)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                  {module.icon}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${module.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{module.status}</span>
                </div>
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{module.name}</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">{module.desc}</p>
              <div className="flex items-center text-xs font-bold text-blue-600 group-hover:gap-1 transition-all">
                进入监控面板 <ChevronRight size={14} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
