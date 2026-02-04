import os
import json
from openai import OpenAI

client = OpenAI()

def arbitrate_conflict(conflict_description: str, context: str) -> str:
    """
    根据冲突描述和上下文，使用 LLM 进行仲裁决策。
    """
    prompt = f"""
    你是一个AI团队的Arbitration Expert角色，你的任务是根据“AI法点”宪法对冲突进行评估，并生成具有约束力的“仲裁令”。

    以下是冲突描述：
    ---
    {conflict_description}
    ---

    以下是冲突的上下文信息：
    ---
    {context}
    ---

    请分析冲突描述和上下文，根据“AI法点”宪法（假设宪法条款在上下文中已提供或你已了解），提供一个清晰的仲裁决策、决策依据、决策影响，并尽可能引用相关的宪法条款。

    请以 JSON 格式返回结果，例如：
    {{
      "decision": "任务优先级调整为高，并分配额外资源。",
      "reasoning": "根据宪法第 X 条，涉及核心治理模块的冲突应优先解决。",
      "impact": "部署任务将暂停，直到资源冲突解决。",
      "constitutionalClause": "宪法第 X 条：核心治理模块优先原则"
    }}

    请确保 JSON 格式正确，不要包含任何额外的文字。
    """

    try:
        response = client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[
                {"role": "system", "content": "你是一个能够根据宪法对冲突进行评估并生成仲裁令的AI Arbitration Expert。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500,
            response_format={"type": "json_object"},
        )
        decision_json = response.choices[0].message.content.strip()
        return decision_json
    except Exception as e:
        return json.dumps({
            "decision": "无法获取仲裁决策",
            "reasoning": f"无法从LLM获取决策：{{e}}",
            "impact": "冲突未能解决，需要手动介入。"
        })

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 3:
        print("Usage: python3 llm_arbitrator.py <conflict_description> <context>")
        sys.exit(1)

    conflict_description_arg = sys.argv[1]
    context_arg = sys.argv[2]

    decision_result = arbitrate_conflict(conflict_description_arg, context_arg)
    print(decision_result)
