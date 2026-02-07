import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  Send,
  Bot,
  User,
  Wrench,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Terminal,
  Cpu,
  Link2,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

interface ToolCall {
  id: string;
  toolName: string;
  args: any;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: any;
}

export default function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '您好！我是 Neuraxis 智能代理。我可以帮您调用 MCP 技能、管理系统角色或执行复杂任务。请问有什么我可以帮您的？',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // 模拟 AI 响应和工具调用过程
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '正在分析您的需求并连接 MCP 端口...',
        timestamp: new Date(),
        toolCalls: [
          {
            id: 'tc-1',
            toolName: 'mcp_search_models',
            args: { query: input, limit: 5 },
            status: 'running',
          },
        ],
      };
      setMessages(prev => [...prev, assistantMessage]);

      // 模拟工具执行成功
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  content: '我已经通过 MCP 端口连接并为您找到了相关信息。',
                  toolCalls: msg.toolCalls?.map(tc =>
                    tc.id === 'tc-1'
                      ? { ...tc, status: 'success', result: 'Found 5 matching models on Hugging Face.' }
                      : tc
                  ),
                }
              : msg
          )
        );
        setIsTyping(false);
      }, 3000);
    }, 1500);
  };

  return (
    <MainLayout
      title="Agent 对话"
      subtitle="Manus 风格的交互式对话框 - 集成 MCP 技能 Linker"
    >
      <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Neuraxis Linker</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-500 font-medium">MCP 端口已连接 (8330)</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Link2 size={12} className="mr-1" />
              Article II 协议
            </Badge>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white shadow-md'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={18} />}
                </div>
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Tool Call Linker (Manus Style) */}
                  {msg.toolCalls && msg.toolCalls.map(tc => (
                    <div key={tc.id} className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-xl animate-in fade-in slide-in-from-bottom-2">
                      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
                        <div className="flex items-center gap-2">
                          <Wrench size={14} className="text-blue-400" />
                          <span className="text-xs font-mono text-slate-300">调用技能: {tc.toolName}</span>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${
                          tc.status === 'success' ? 'text-green-400 border-green-900' : 
                          tc.status === 'running' ? 'text-blue-400 border-blue-900' : 'text-slate-400 border-slate-700'
                        }`}>
                          {tc.status === 'running' && <Loader2 size={10} className="mr-1 animate-spin" />}
                          {tc.status === 'success' && <CheckCircle2 size={10} className="mr-1" />}
                          {tc.status === 'error' && <AlertCircle size={10} className="mr-1" />}
                          {tc.status === 'running' ? '执行中' : tc.status === 'success' ? '完成' : '待命'}
                        </Badge>
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <Terminal size={12} className="text-slate-500 mt-0.5" />
                          <pre className="text-[11px] text-slate-400 font-mono">
                            {JSON.stringify(tc.args, null, 2)}
                          </pre>
                        </div>
                        {tc.result && (
                          <div className="mt-2 pt-2 border-t border-slate-800">
                            <div className="flex items-center gap-2 mb-1">
                              <ChevronRight size={12} className="text-green-500" />
                              <span className="text-[10px] text-slate-500 uppercase font-bold">输出结果</span>
                            </div>
                            <p className="text-xs text-slate-300 font-mono bg-black/30 p-2 rounded">
                              {tc.result}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Bot size={18} />
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="向 Agent 发送指令，或请求调用 MCP 技能..."
              className="border-none bg-transparent shadow-none focus-visible:ring-0 placeholder:text-slate-400"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
            >
              <Send size={18} />
            </Button>
          </div>
          <div className="mt-2 flex items-center justify-center gap-4">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Powered by Neuraxis Agentic Framework
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
