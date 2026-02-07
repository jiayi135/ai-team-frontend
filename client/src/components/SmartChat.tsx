import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Trash2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function SmartChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息（流式）
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userMessage.content,
        }),
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                assistantMessage.content += parsed.chunk;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { ...assistantMessage };
                  return newMessages;
                });
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '抱歉，发送消息时出现错误。请稍后再试。',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 清除会话
  const handleClearChat = async () => {
    if (!confirm('确定要清除所有聊天记录吗？')) return;

    try {
      await fetch(`/api/chat/session/${sessionId}`, {
        method: 'DELETE',
      });
      setMessages([]);
    } catch (error) {
      console.error('清除会话失败:', error);
    }
  };

  // 处理回车发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* 头部 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">智能对话</h2>
          <p className="text-sm text-gray-500">由 GPT-4.1-mini 驱动</p>
        </div>
        <button
          onClick={handleClearChat}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="清除聊天记录"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-white">🤖</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              开始智能对话
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              我是 Neuraxis AI Team 的智能助手，可以帮你：
            </p>
            <ul className="text-sm text-gray-600 mt-3 space-y-1 text-left">
              <li>• 协调多 Agent 完成复杂任务</li>
              <li>• 生成高质量代码</li>
              <li>• 提供技术咨询和架构建议</li>
              <li>• 管理任务和优化成本</li>
            </ul>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div
                  className="prose prose-sm max-w-none"
                  style={{
                    lineHeight: '1.7',
                    ...(message.role === 'user' && {
                      color: 'white',
                    }),
                  }}
                >
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 last:mb-0">
                      {line}
                    </p>
                  ))}
                </div>
                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user'
                      ? 'text-indigo-200'
                      : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-5 py-3">
              <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-end space-x-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息... (Shift+Enter 换行)"
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none transition-colors"
            rows={1}
            style={{
              minHeight: '48px',
              maxHeight: '120px',
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>发送</span>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          按 Enter 发送，Shift+Enter 换行
        </p>
      </div>
    </div>
  );
}
