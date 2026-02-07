import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Paperclip,
  Smile,
  MoreVertical,
  Menu,
  X,
  MessageSquare,
  Plus,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '您好！我是 AI Team 智能助手。我可以帮您生成工具、调用技能、优化代码。请问有什么我可以帮您的？',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      title: '工具生成示例',
      lastMessage: '帮我生成一个天气查询工具',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      title: '技能中心探索',
      lastMessage: '搜索 Hugging Face 上的情感分析模型',
      timestamp: new Date(Date.now() - 7200000),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      // 检查 API 配置
      const savedConfig = localStorage.getItem('ai_team_llm_config');
      const config = savedConfig ? JSON.parse(savedConfig) : null;

      if (!config || !config.apiKey) {
        toast.error('未检测到 API 配置', {
          description: '请先配置您的模型 API Key。',
        });
        setIsTyping(false);
        return;
      }

      // 调用后端 API
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          config: config,
        }),
      });

      const data = await response.json();

      if (data.success && data.message) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.message.content,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        toast.error('发送消息失败: ' + (data.error || '未知错误'));
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error('网络请求失败');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 border-r border-slate-200 bg-slate-50 flex flex-col overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all">
            <Plus size={20} />
            <span className="font-medium">新建对话</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
            最近对话
          </div>
          {conversations.map((conv) => (
            <button
              key={conv.id}
              className="w-full text-left p-3 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                  <MessageSquare size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-slate-900 truncate">{conv.title}</h4>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                    <Clock size={10} />
                    <span>{conv.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 text-center">
            AI Team v1.0
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">AI Team 助手</h2>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-slate-500">在线</span>
                </div>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <MoreVertical size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-slate-600 to-slate-700 text-white'
                      : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                  }`}
                >
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>

                {/* Message Bubble */}
                <div className="flex-1 max-w-[75%]">

                  <div
                    className={`p-5 rounded-2xl shadow-md ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-tr-md'
                        : 'bg-white border-2 border-slate-200 text-slate-900 rounded-tl-md'
                    }`}
                  >
                    {/* 增强渲染逻辑：支持 P.R.O.M.P.T. 框架的结构化展示 */}
                    <div className="space-y-3">
                      {msg.content.split('\n').map((line, i) => {
                        if (line.startsWith('###')) {
                          return <h3 key={i} className="text-lg font-bold text-indigo-600 mt-4 mb-2">{line.replace('###', '').trim()}</h3>;
                        }
                        if (line.startsWith('**')) {
                          return <p key={i} className="font-semibold text-slate-800">{line}</p>;
                        }
                        if (line.startsWith('>')) {
                          return <blockquote key={i} className="border-l-4 border-indigo-500 pl-4 py-1 my-2 bg-indigo-50 rounded text-indigo-700 italic">{line.replace('>', '').trim()}</blockquote>;
                        }
                        if (line.startsWith('```')) {
                          return null; // 简单处理代码块开始
                        }
                        return <p key={i} className="text-sm leading-relaxed" style={{ lineHeight: '1.7' }}>{line}</p>;
                      })}
                    </div>
                  </div>

                  <div
                    className={`mt-1 px-2 text-xs text-slate-400 ${
                      msg.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
                  <Bot size={20} />
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-md shadow-sm">
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                    <span className="text-[10px] text-indigo-500 font-medium animate-pulse">P.R.O.M.P.T. 框架分析中...</span>
                  </div>
                </div>

              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 bg-white p-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="和 AI Team 聊天..."
                className="w-full px-5 py-4 bg-transparent text-slate-900 placeholder-slate-400 resize-none focus:outline-none"
                rows={1}
                style={{ minHeight: '56px', maxHeight: '200px' }}
              />
              <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600">
                    <Paperclip size={18} />
                  </button>
                  <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600">
                    <Smile size={18} />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isTyping}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                >
                  {isTyping ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>发送中</span>
                    </>
                  ) : (
                    <>
                      <span>发送</span>
                      <Send size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="mt-3 text-center text-xs text-slate-400">
              AI Team 可能会出错。请核查重要信息。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
