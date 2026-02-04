import os
import json
from openai import OpenAI

client = OpenAI()

def generate_code(role: str, goal: str, context: str) -> str:
    """
    根据角色、目标和上下文，使用 LLM 生成代码或 shell 命令。
    """
    prompt = f"""
    你是一个AI团队的{role}角色，你的目标是：{goal}。
    当前上下文：{context}

    请根据以上信息，生成一个可以直接在 Linux shell 中执行的命令或代码片段，以完成你的目标。
    如果需要创建文件，请使用 `echo \"内容\" > 文件名` 或 `mkdir -p 目录 && echo \"内容\" > 文件名`。
    如果需要执行 Python 代码，请先将代码写入文件，然后用 `python3 文件名` 执行。
    如果需要使用 GitHub CLI (gh)，请直接使用 `gh` 命令。
    如果需要使用 Vercel CLI (vercel)，请直接使用 `vercel` 命令。
    如果需要部署到 Vercel，请生成 `manus-mcp-cli tool call deploy --server vercel --input '{{\"project_id\": \"<YOUR_VERCEL_PROJECT_ID>\", \"alias\": \"<YOUR_DEPLOYMENT_ALIAS>\"}}'` 这样的命令，其中 `<YOUR_VERCEL_PROJECT_ID>` 和 `<YOUR_DEPLOYMENT_ALIAS>` 需要根据上下文替换。
    如果目标是创建一个新的 React 组件，请生成一个 TypeScript React 组件文件的内容，并使用 `mkdir -p 目录 && echo \"内容\" > 文件名` 的形式输出。

    请直接输出命令或代码片段，不要包含任何解释性文字，不要使用 Markdown 代码块。
    """

    try:
        response = client.chat.completions.create(
            model="gemini-2.5-flash", # 使用预配置的 Gemini 模型
            messages=[
                {"role": "system", "content": "你是一个能够根据指令生成可执行代码或 shell 命令的 AI 助手。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500,
        )
        generated_content = response.choices[0].message.content.strip()
        return generated_content
    except Exception as e:
        return f"Error generating code: {e}"

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 4:
        print("Usage: python3 llm_code_generator.py <role> <goal> <context>")
        sys.exit(1)

    role_arg = sys.argv[1]
    goal_arg = sys.argv[2]
    context_arg = sys.argv[3]

    generated_code = generate_code(role_arg, goal_arg, context_arg)
    print(generated_code)
