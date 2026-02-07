import React from 'react';
import {
  MessageSquare,
  Wrench,
  Target,
  Sparkles,
  Code2,
  ArrowRight,
  Zap,
  Shield,
  Users,
} from 'lucide-react';
import { useLocation } from 'wouter';

export default function NewHome() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'AI 聊天',
      description: '与智能助手对话，获取即时帮助和建议',
      path: '/agent-chat',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: '工具生成',
      description: '使用 AI 生成自定义 TypeScript 工具代码',
      path: '/tool-generator',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: '任务管理',
      description: '创建和跟踪 AI 代理执行的任务',
      path: '/tasks',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: '技能中心',
      description: '管理和调用 MCP 服务器提供的技能',
      path: '/skill-center',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      icon: <Code2 className="w-8 h-8" />,
      title: '代码进化',
      description: 'AI 自主分析和优化项目代码',
      path: '/evolution',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
  ];

  const highlights = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: '快速响应',
      description: 'API 响应时间 < 100ms',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: '安全可靠',
      description: '企业级安全保障',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: '多模型支持',
      description: '支持 6+ LLM 提供商',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI Team Frontend
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            基于 P.R.O.M.P.T. 框架的智能 AI 助手系统
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            集成多个 LLM 提供商，支持自然对话、工具生成、任务管理、技能调用和代码自我进化
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={() => setLocation(feature.path)}
              className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300 text-left"
            >
              <div className={`w-16 h-16 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <div className={feature.textColor}>
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center justify-between">
                {feature.title}
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </button>
          ))}
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {highlights.map((highlight, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <div className="text-orange-600">
                  {highlight.icon}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {highlight.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {highlight.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <button
            onClick={() => setLocation('/agent-chat')}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <MessageSquare className="w-6 h-6" />
            开始对话
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-sm text-gray-500 mt-4">
            无需注册，立即体验 AI 助手
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="mb-2">
            © 2026 AI Team Frontend. 基于 P.R.O.M.P.T. 框架构建
          </p>
          <p className="text-sm text-gray-500">
            支持 Gemini, OpenAI, DeepSeek, Z-AI, MiniMax, NVIDIA 等多个 LLM 提供商
          </p>
        </div>
      </footer>
    </div>
  );
}
