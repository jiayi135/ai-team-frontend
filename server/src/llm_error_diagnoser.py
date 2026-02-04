import os
import json
from openai import OpenAI

client = OpenAI()

def diagnose_error(error_output: str, context: str) -> str:
    """
    根据错误输出和上下文，使用 LLM 诊断错误并提供修复建议。
    """
    prompt = f"""
    你是一个AI团队的Tester角色，你的任务是诊断一个AI生成的代码或shell命令执行失败的原因，并提供修复建议。

    以下是执行失败的错误输出：
    ---
    {error_output}
    ---

    以下是任务的上下文信息：
    ---
    {context}
    ---

    请分析错误输出和上下文，判断错误类型（语法错误、权限错误、逻辑错误或其他），并提供一个清晰的诊断和具体的修复建议。

    请以 JSON 格式返回结果，例如：
    {{
      "isSyntaxError": true,
      "isPermissionError": false,
      "isLogicError": false,
      "diagnosis": "这是一个语法错误，可能缺少分号或括号不匹配。",
      "suggestedFix": "检查代码中的语法错误，特别是第 X 行的 Y 字符。"
    }}

    请确保 JSON 格式正确，不要包含任何额外的文字。
    """

    try:
        response = client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[
                {"role": "system", "content": "你是一个能够根据指令生成可执行代码或 shell 命令的 AI 助手。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500,
            response_format={"type": "json_object"},
        )
        diagnosis_json = response.choices[0].message.content.strip()
        return diagnosis_json
    except Exception as e:
        return json.dumps({
            "isSyntaxError": False,
            "isPermissionError": False,
            "isLogicError": True,
            "diagnosis": f"无法从LLM获取诊断：{{e}}",
            "suggestedFix": "请手动检查错误输出并尝试修复。"
        })

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 3:
        print("Usage: python3 llm_error_diagnoser.py <error_output> <context>")
        sys.exit(1)

    error_output_arg = sys.argv[1]
    context_arg = sys.argv[2]

    diagnosis_result = diagnose_error(error_output_arg, context_arg)
    print(diagnosis_result)
