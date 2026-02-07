import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Users,
  GitBranch,
  DollarSign,
  Activity,
  BarChart3,
  Menu,
  X,
  ShieldCheck,
  Globe,
  Settings,
  Wrench,
  Sparkles,
  Cpu,
  Zap,
  MessageSquare,
  ChevronDown,
  Key,
  Zap as ZapIcon,
  Scale,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size: number }>;
  badge?: string;
}

const navSections: NavSection[] = [
  {
    title: '核心协作',
    items: [
      { label: '仪表盘', href: '/', icon: LayoutDashboard },
      { label: 'Agent 对话', href: '/agent-chat', icon: MessageSquare, badge: '💬' },
      { label: 'Agent 控制台', href: '/agent-console', icon: Cpu, badge: '🧠' },
    ],
  },
  {
    title: '治理与法典',
    items: [
      { label: '协商可视化', href: '/negotiations', icon: GitBranch },
      { label: '角色管理', href: '/roles', icon: Users },
      { label: '任务监控', href: '/tasks', icon: Activity },
    ],
  },
  {
    title: '能力引擎',
    items: [
      { label: '技能中心', href: '/skill-center', icon: Zap },
      { label: '工具管理', href: '/tools', icon: Wrench },
      { label: '工具生成', href: '/tool-generator', icon: Sparkles },
    ],
  },
  {
    title: '系统底座',
    items: [
      { label: '成本管理', href: '/costs', icon: DollarSign },
      { label: '系统健康', href: '/health', icon: BarChart3 },
      { label: '互联网搜索', href: '/search', icon: Globe },
    ],
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['核心协作', '治理与法典', '能力引擎'])
  );
  const [modelStatus, setModelStatus] = useState<'configured' | 'unconfigured'>('unconfigured');

  useEffect(() => {
    // 检查模型配置状态
    const savedConfig = localStorage.getItem('ai_team_llm_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.apiKey) {
          setModelStatus('configured');
        }
      } catch (e) {
        console.error('Failed to parse config');
      }
    }
  }, []);

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white transition-transform duration-300 z-40 flex flex-col',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'border-r border-slate-800'
        )}
      >
        {/* Logo & Branding */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <span>Neuraxis</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">P.R.O.M.P.T. 治理框架</p>
        </div>

        {/* Model Configuration Quick Access */}
        <div className="px-4 pt-4 pb-2">
          <Link href="/settings">
            <a className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer',
              'hover:bg-slate-800 border border-slate-700',
              modelStatus === 'configured'
                ? 'bg-green-900/30 border-green-700/50'
                : 'bg-amber-900/20 border-amber-700/30'
            )}>
              <div className={cn(
                'p-2 rounded-lg',
                modelStatus === 'configured'
                  ? 'bg-green-900/50'
                  : 'bg-amber-900/50'
              )}>
                <Key size={16} className={modelStatus === 'configured' ? 'text-green-400' : 'text-amber-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">模型配置</p>
                <p className={cn(
                  'text-xs truncate',
                  modelStatus === 'configured' ? 'text-green-300' : 'text-amber-300'
                )}>
                  {modelStatus === 'configured' ? '✓ 已配置' : '⚠ 未配置'}
                </p>
              </div>
            </a>
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navSections.map((section) => (
            <div key={section.title} className="mb-2">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider"
              >
                <span>{section.title}</span>
                <ChevronDown
                  size={16}
                  className={cn(
                    'transition-transform duration-200',
                    expandedSections.has(section.title) ? 'rotate-0' : '-rotate-90'
                  )}
                />
              </button>

              {/* Section Items */}
              {expandedSections.has(section.title) && (
                <div className="space-y-1 mt-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                      >
                        <a
                          className={cn(
                            'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group',
                            isActive
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          )}
                        >
                          <Icon size={18} className={cn(
                            'transition-transform duration-200',
                            isActive ? 'scale-110' : 'group-hover:scale-110'
                          )} />
                          <span className="font-medium text-sm flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="text-xs opacity-70">{item.badge}</span>
                          )}
                        </a>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Settings & System Status Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm space-y-3">
          {/* Settings Link */}
          <Link href="/settings">
            <a className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200',
              location === '/settings'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            )}>
              <Settings size={18} />
              <span className="font-medium text-sm">系统设置</span>
            </a>
          </Link>

          {/* System Status */}
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">系统状态</p>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-xs text-slate-400">运行正常</p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
