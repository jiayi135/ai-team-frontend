import sys

with open('client/src/pages/Home.tsx', 'r') as f:
    content = f.read()

if "Wrench" not in content:
    content = content.replace("ShieldCheck,", "ShieldCheck,\n  Wrench,\n  ChevronRight,")

quick_access_code = """
      {/* Quick Access to Tools */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
            <Wrench size={30} />
          </div>
          <div>
            <h3 className="text-xl font-bold">MCP 工具管理中心</h3>
            <p className="text-blue-100 text-sm">即时调用与调试 20+ 外部治理插件</p>
          </div>
        </div>
        <button
          onClick={() => setLocation('/tools')}
          className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2"
        >
          进入管理后台
          <ChevronRight size={18} />
        </button>
      </div>
"""

if "Quick Access to Tools" not in content:
    content = content.replace(
        "{/* Task Composer Section */}",
        quick_access_code + "\n      {/* Task Composer Section */}"
    )

with open('client/src/pages/Home.tsx', 'w') as f:
    f.write(content)
