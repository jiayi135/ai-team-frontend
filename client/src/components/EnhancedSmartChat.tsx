import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Trash2, Copy, RotateCcw, Edit2, Check, Sparkles, Settings } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  id: string;
}

const EXAMPLE_PROMPTS = [
  '帮我写一个 React 组件',
  '解释一下快速排序算法',
  '设计一个微服务架构',
  '优化这段代码的性能',
];

const MODELS = [
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', description: '快速且经济' },
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', description: '超快响应' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Google 最新模型' },
];

export function EnhancedSmartChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [showSettings, setShowSettings] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // 发送消息（流式）
  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
      id: `msg-${Date.now()}`,
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
          model: selectedModel,
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
        id: `msg-${Date.now()}-assistant`,
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
          id: `msg-${Date.now()}-error`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 复制消息
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // 可以添加一个 toast 提示
  };

  // 重新生成
  const handleRegenerate = async (messageIndex: number) => {
    if (messageIndex < 1) return;
    
    const userMessage = messages[messageIndex - 1];
    if (userMessage.role !== 'user') return;

    // 删除当前 AI 回复
    setMessages(prev => prev.slice(0, messageIndex));
    
    // 重新发送
    await handleSendMessage(userMessage.content);
  };

  // 编辑消息
  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditContent(content);
  };

  // 保存编辑
  const handleSaveEdit = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // 更新消息
    setMessages(prev => {
      const newMessages = [...prev];
      newMessages[messageIndex] = {
        ...newMessages[messageIndex],
        content: editContent,
      };
      return newMessages.slice(0, messageIndex + 1);
    });

    setEditingMessageId(null);
    setEditContent('');

    // 如果是用户消息，重新生成 AI 回复
    if (messages[messageIndex].role === 'user') {
      await handleSendMessage(editContent);
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
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">智能对话</h2>
            <p className="text-sm text-gray-500">
              {MODELS.find(m => m.id === selectedModel)?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="设置"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={handleClearChat}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="清除聊天记录"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              选择模型
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MODELS.map(model => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedModel === model.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-800">
                    {model.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {model.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              开始智能对话
            </h3>
            <p className="text-sm text-gray-500 max-w-md mb-6">
              我是 Neuraxis AI Team 的智能助手，可以帮你完成各种任务
            </p>
            
            {/* 示例提示词 */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-2xl">
              {EXAMPLE_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(prompt)}
                  className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  <div className="text-sm text-gray-700">{prompt}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl px-5 py-3'
                    : 'w-full'
                }`}
              >
                {editingMessageId === message.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-indigo-500 rounded-lg focus:outline-none resize-none"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSaveEdit(message.id)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>保存</span>
                      </button>
                      <button
                        onClick={() => setEditingMessageId(null)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {message.role === 'user' ? (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-pre:bg-gray-900 prose-pre:text-gray-100">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight, rehypeRaw]}
                          components={{
                            code({ node, inline, className, children, ...props }) {
                              return inline ? (
                                <code className="px-1.5 py-0.5 bg-gray-100 text-pink-600 rounded text-sm font-mono" {...props}>
                                  {children}
                                </code>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    
                    {/* 消息操作 */}
                    <div className="flex items-center justify-between mt-2">
                      <div
                        className={`text-xs ${
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
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopyMessage(message.content)}
                          className={`p-1 rounded hover:bg-opacity-20 transition-colors ${
                            message.role === 'user'
                              ? 'hover:bg-white text-white'
                              : 'hover:bg-gray-200 text-gray-500'
                          }`}
                          title="复制"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {message.role === 'user' && (
                          <button
                            onClick={() => handleEditMessage(message.id, message.content)}
                            className="p-1 rounded hover:bg-white hover:bg-opacity-20 transition-colors text-white"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {message.role === 'assistant' && (
                          <button
                            onClick={() => handleRegenerate(index)}
                            className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-500"
                            title="重新生成"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
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
            ref={textareaRef}
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
            onClick={() => handleSendMessage()}
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
