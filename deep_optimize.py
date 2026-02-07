import os
import re

def optimize_chat_service():
    path = 'server/src/chat_service.ts'
    if not os.path.exists(path):
        return
    
    with open(path, 'r') as f:
        content = f.read()

    # 1. 增强系统提示词，注入 P.R.O.M.P.T. 框架意识
    system_prompt_upgrade = """
      const systemPrompt = `You are the Neuraxis AI Orchestrator, operating under the P.R.O.M.P.T. Meta-Cognitive Framework.
Your goal is to coordinate a team of specialized agents (Architect, Developer, Algorithm Expert, Tester, Arbitrator) to solve complex problems.

P.R.O.M.P.T. Principles:
- Purpose: Deeply analyze the user's intent before acting.
- Role: Maintain strict professional boundaries between agent roles.
- Operation: Use structured outputs and clear workflows.
- Media: Leverage context and explore deep information.
- Planned: Anticipate future needs and plan iterative paths.
- Tracing: Provide evidence-based reasoning and audit trails.

When responding, always maintain a professional, analytical, and proactive tone. Avoid generic or "stiff" AI responses. If in Mock mode, explain the technical value of the framework while guiding the user to enable full LLM capabilities.`;
"""
    
    if "Neuraxis AI Orchestrator" not in content:
        content = content.replace(
            "const systemPrompt = 'You are a helpful assistant for the AI Team Governance Dashboard.';",
            system_prompt_upgrade
        )

    # 2. 优化 Mock 响应逻辑，使其更具“框架感”而非简单的关键词匹配
    mock_logic_upgrade = """
  /**
   * 获取增强型 Mock 响应 (体现 P.R.O.M.P.T. 框架思维)
   */
  private getMockResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    const frameworkIntro = `> **Neuraxis 框架提示**：当前处于系统演示模式。在完整模式下，我将启动 P.R.O.M.P.T. 治理流程。\\n\\n`;
    
    if (lowerMessage.includes('代码') || lowerMessage.includes('code')) {
      return frameworkIntro + `### [P.R.O.M.P.T. 任务分析]
**Purpose**: 代码生成与结构化实现。
**Role**: 激活 Developer 角色进行高保真输出。

\`\`\`python
# 示例：自愈式错误处理模式
def robust_executor(task_fn):
    try:
        return task_fn()
    except Exception as e:
        print(f"Tracing Error: {e}")
        # 触发自我修复逻辑
        return "Self-healing initiated"
\`\`\`
**Planned**: 下一步建议集成自动化测试 (Tester) 以验证边界条件。`;
    }
    
    if (lowerMessage.includes('你好') || lowerMessage.includes('hello')) {
      return frameworkIntro + `您好！我是 Neuraxis 编排器。我已准备好基于 P.R.O.M.P.T. 框架为您管理 AI 团队。
      
目前系统运行在**受限模式**。为了释放完整的元认知协作能力（包括多 Agent 辩论、自主代码演进和实时成本审计），请在环境配置中激活 \`OPENAI_API_KEY\`。

我可以为您演示：
1. **架构拆解** (Architect)
2. **逻辑实现** (Developer)
3. **共识仲裁** (Arbitrator)`;
    }

    return frameworkIntro + `收到指令："${message}"。
    
在 P.R.O.M.P.T. 框架下，此任务需要 **Media (上下文探索)** 阶段的深度介入。
由于当前未连接远程 LLM 脑核，我无法进行深层语义推理。

**建议操作**：
1. 检查 \`server/.env\` 中的 API 密钥配置。
2. 查看 \`docs/AI_TEAM_CONSTITUTION.md\` 了解治理协议。`;
  }
"""
    # 替换旧的 getMockResponse
    content = re.sub(r'private getMockResponse\(message: string\): string \{.*?\}', mock_logic_upgrade, content, flags=re.DOTALL)

    with open(path, 'w') as f:
        f.write(content)
    print("Optimized chat_service.ts with P.R.O.M.P.T. awareness.")

def optimize_prompt_library():
    path = 'server/src/prompt_library.ts'
    if not os.path.exists(path):
        return
    
    with open(path, 'r') as f:
        content = f.read()

    # 注入更具“Agent 性格”的提示词
    if "Zero-trust mindset" in content:
        content = content.replace(
            "You are the Architect.",
            "You are the Chief Architect of Neuraxis. You view systems as living organisms that must evolve."
        )
        content = content.replace(
            "You are the Developer.",
            "You are the Lead Developer. You value clean, self-documenting code and structural integrity."
        )

    with open(path, 'w') as f:
        f.write(content)
    print("Refined prompt_library.ts for better agent personas.")

if __name__ == "__main__":
    optimize_chat_service()
    optimize_prompt_library()
