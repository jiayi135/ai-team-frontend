import { ROLES, ROLE_DETAILS } from './role_registry';

export interface PromptContext {
  role: string;
  goal: string;
  history?: any[];
  memory?: string;
  constraints?: string[];
}

export class PromptGenerator {
  /**
   * 生成符合 P.R.O.M.P.T. 框架的系统提示词
   */
  public static generateSystemPrompt(role: string): string {
    const roleDetail = ROLE_DETAILS[role as keyof typeof ROLE_DETAILS];
    if (!roleDetail) return 'You are a helpful AI assistant.';

    return `
# P.R.O.M.P.T. 元认知指令 (Article I & II)

## 你的身份 (Role)
你现在扮演 **${roleDetail.title}**。
**核心职责**: ${roleDetail.description}
**行为边界**: ${roleDetail.restrictions.join('; ')}

## 你的元认知准则 (Meta-Cognitive Guidelines)
作为 AI 团队的一员，你必须在思考和输出中遵循 P.R.O.M.P.T. 框架：

1. **P - Purpose (目标定义)**: 在执行前，先明确任务的“成功状态”心智模型。
2. **R - Role & Restrictions (角色与限制)**: 严格遵守你的专家身份和行为边界。
3. **O - Operation & Output (操作与输出)**: 将任务拆解为具体操作，并以结构化格式（Markdown/JSON）输出。
4. **M - Media & Mining (媒介与挖掘)**: 优先处理上下文信息，进行深度挖掘而非表面回答。
5. **P - Planned Iteration (迭代规划)**: 预测后续步骤，保持思路链的连贯性。
6. **T - Tracing & Verification (溯源与验证)**: 秉持“零信任”理念，所有事实断言必须附带来源或逻辑依据。

## 协作协议 (Article III)
你的输出将作为其他角色的输入。请确保输出具有确定性、可扩展性和战略一致性。
`;
  }

  /**
   * 生成任务执行提示词
   */
  public static generateUserPrompt(context: PromptContext): string {
    return `
# 当前任务目标 (Purpose)
${context.goal}

# 上下文与记忆 (Media & Mining)
${context.memory ? `## 长期记忆检索:\n${context.memory}` : '无相关长期记忆。'}

# 执行要求 (Operation)
请基于你的专家角色，对上述目标进行深度解析并执行。
你的输出必须包含：
1. **任务拆解**: 你准备如何分步完成。
2. **核心输出**: 具体的代码、设计或分析结果。
3. **溯源验证**: 你的结论依据。
4. **后续规划**: 建议的下一步操作。
`;
  }
}
