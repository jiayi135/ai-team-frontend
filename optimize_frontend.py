import os
import re

def optimize_chat_ui():
    path = 'client/src/pages/Chat.tsx'
    if not os.path.exists(path):
        return
    
    with open(path, 'r') as f:
        content = f.read()

    # 1. 注入样式以支持结构化显示
    style_injection = """
                  <div
                    className={`p-5 rounded-2xl shadow-md ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-tr-md'
                        : 'bg-white border-2 border-slate-200 text-slate-900 rounded-tl-md'
                    }`}
                  >
                    {/* 增强渲染逻辑：支持 P.R.O.M.P.T. 框架的结构化展示 */}
                    <div className="space-y-3">
                      {msg.content.split('\\n').map((line, i) => {
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
"""
    
    # 替换旧的消息气泡内容
    old_bubble_pattern = r'<div\s+className={`p-5 rounded-2xl shadow-md \$\{.*?msg\.role === \'user\'.*?\}`}\s+>\s+<p className="text-sm leading-relaxed whitespace-pre-wrap" style=\{\{ lineHeight: \'1.7\' \}\}>\{msg\.content\}</p>\s+</div>'
    
    # 由于正则表达式匹配复杂，我们使用更精确的字符串替换
    old_content_to_replace = """                  <div
                    className={`p-5 rounded-2xl shadow-md ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-tr-md'
                        : 'bg-white border-2 border-slate-200 text-slate-900 rounded-tl-md'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ lineHeight: '1.7' }}>{msg.content}</p>
                  </div>"""
    
    if old_content_to_replace in content:
        content = content.replace(old_content_to_replace, style_injection)
        print("Successfully injected structured rendering logic into Chat.tsx")
    else:
        print("Could not find the exact message bubble pattern in Chat.tsx")

    # 2. 增加“思考状态”的描述，体现框架感
    typing_indicator_upgrade = """
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
"""
    
    old_typing_indicator = """                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-md shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>"""
    
    if old_typing_indicator in content:
        content = content.replace(old_typing_indicator, typing_indicator_upgrade)
        print("Upgraded typing indicator with framework awareness.")

    with open(path, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    optimize_chat_ui()
