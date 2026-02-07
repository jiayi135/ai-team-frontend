import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Zap,
  Code,
  Brain,
  ArrowRight,
  Github,
  Book,
  Send,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function Home() {
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState('');

  const handleQuickStart = async () => {
    if (!message.trim()) {
      toast.error('请输入您的需求');
      return;
    }

    // 检查 API 配置
    const savedConfig = localStorage.getItem('ai_team_llm_config');
    const config = savedConfig ? JSON.parse(savedConfig) : null;

    if (!config || !config.apiKey) {
      toast.error('未检测到 API 配置', {
        description: '请先配置您的模型 API Key。',
        action: {
          label: '去设置',
          onClick: () => setLocation('/settings')
        }
      });
      return;
    }

    // 跳转到聊天页面
    setLocation('/chat');
    toast.success('正在启动 AI Team...');
  };

  const features = [
    {
      icon: <MessageSquare size={32} />,
      title: '智能对话',
      description: '与 AI 团队自然对话，让 AI 理解您的需求并自动执行任务。',
      color: 'from-blue-500 to-cyan-500',
      action: () => setLocation('/chat'),
    },
    {
      icon: <Code size={32} />,
      title: '工具生成器',
      description: '基于 P.R.O.M.P.T. 框架，自动生成高质量的代码工具。',
      color: 'from-purple-500 to-pink-500',
      action: () => setLocation('/tools'),
    },
    {
      icon: <Brain size={32} />,
      title: '技能中心',
      description: '集成 Hugging Face 资源，访问海量 AI 模型和数据集。',
      color: 'from-green-500 to-emerald-500',
      action: () => setLocation('/skills'),
    },
    {
      icon: <Sparkles size={32} />,
      title: '自我进化',
      description: '利用大模型实现代码自主修改，持续优化系统能力。',
      color: 'from-orange-500 to-red-500',
      action: () => setLocation('/evolution'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-70"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Logo & Badge */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap size={32} className="text-white" />
            </div>
            <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-indigo-200 shadow-sm">
              <span className="text-sm font-medium text-indigo-600">基于 P.R.O.M.P.T. 框架</span>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight animate-in fade-in slide-in-from-top duration-700">
            AI Team
          </h1>
          <p className="text-2xl md:text-3xl text-slate-600 mb-4 animate-in fade-in slide-in-from-top duration-700 delay-100">
            你的智能协作伙伴
          </p>
          <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto">
            利用大模型实现代码自我进化，集成 Hugging Face 资源，打造真正智能的 AI 团队协作系统。
          </p>

          {/* Main Input Box */}
          <div className="max-w-3xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl opacity-30 group-hover:opacity-50 blur-md transition-all duration-300"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden group-hover:border-indigo-300 transition-all duration-300">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleQuickStart();
                    }
                  }}
                  placeholder="和 AI Team 聊天... 试试：帮我生成一个天气查询工具"
                  className="w-full px-6 py-5 text-lg text-slate-900 placeholder-slate-400 resize-none focus:outline-none"
                  rows={3}
                />
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Sparkles size={16} />
                    <span>支持自然语言输入</span>
                  </div>
                  <button
                    onClick={handleQuickStart}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    开始对话
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button
              onClick={() => setLocation('/tools')}
              className="px-6 py-3 bg-white text-slate-700 rounded-xl font-medium border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
            >
              工具生成器
            </button>
            <button
              onClick={() => setLocation('/skills')}
              className="px-6 py-3 bg-white text-slate-700 rounded-xl font-medium border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
            >
              技能中心
            </button>
            <button
              onClick={() => setLocation('/evolution')}
              className="px-6 py-3 bg-white text-slate-700 rounded-xl font-medium border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
            >
              自我进化
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">核心功能</h2>
            <p className="text-lg text-slate-600">探索 AI Team 的强大能力，基于最新 UI 设计研究优化</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={feature.action}
                className="group bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-indigo-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 mb-4 leading-relaxed">{feature.description}</p>
                <div className="flex items-center text-indigo-600 font-medium group-hover:gap-2 transition-all">
                  了解更多
                  <ArrowRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative py-12 px-4 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/jiayi135/ai-team-frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Github size={20} />
                <span>GitHub</span>
              </a>
              <button
                onClick={() => setLocation('/docs')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Book size={20} />
                <span>文档</span>
              </button>
            </div>
            <div className="text-slate-500 text-sm">
              © 2024 AI Team. Powered by P.R.O.M.P.T. Framework & Hugging Face.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
