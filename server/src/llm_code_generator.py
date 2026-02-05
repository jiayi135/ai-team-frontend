import sys
import os
import json
from llm_client import call_llm

def generate_code(role: str, goal: str, context: str, attempt: int = 1, prev_error: str = "", suggested_fix: str = "", available_tools: str = "[]", memories: str = "[]") -> str:
    """
    Generate code or MCP workflow based on feedback loop and available tools.
    """
    tools_list = json.loads(available_tools)
    tools_context = ""
    if tools_list:
        tools_context = "\n### AVAILABLE MCP TOOLS\n"
        for t in tools_list:
            tools_context += f"- {t['server']}:{t['name']}: {t['description']}\n"

    memory_context = ""
    mem_list = json.loads(memories)
    if mem_list:
        memory_context = "\n### RELEVANT PAST MEMORIES\n"
        for m in mem_list:
            content = m.get('content', '') or m.get('summary', '')
            memory_context += f"- {content}\n"

    system_prompt = f"""You are a professional {role} in an AI Team. 
Your task is to generate either a single executable shell command OR a structured MCP Workflow JSON to achieve the goal.

{tools_context}
{memory_context}

RULES for Output:
1. If using standard shell: Output ONLY the command.
2. If using MCP Tools: Output a JSON object with this structure:
   {{
     "type": "workflow",
     "plan": {{
       "taskId": "dynamic-id",
       "steps": [
         {{ "id": "s1", "server": "server_name", "tool": "tool_name", "arguments": {{...}} }}
       ]
     }}
   }}
3. NO markdown code blocks (```).
4. NO explanations.
"""

    if attempt > 1:
        user_prompt = f"""
### REPAIR MISSION (Attempt {attempt})
Goal: {goal}
Previous Error: {prev_error}
Diagnosis & Suggested Fix: {suggested_fix}
Context: {context}
Please generate a NEW command or workflow that fixes the previous error.
"""
    else:
        user_prompt = f"Goal: {goal}\nContext: {context}"
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    model = os.environ.get("LLM_MODEL", "z-ai/glm-4-9b-chat")
    result = call_llm(messages, model=model)
    return result.strip()

if __name__ == "__main__":
    # Extended arguments for tools
    role_arg = sys.argv[1] if len(sys.argv) > 1 else "Developer"
    goal_arg = sys.argv[2] if len(sys.argv) > 2 else ""
    context_arg = sys.argv[3] if len(sys.argv) > 3 else ""
    attempt_arg = int(sys.argv[4]) if len(sys.argv) > 4 and sys.argv[4] else 1
    error_arg = sys.argv[5] if len(sys.argv) > 5 else ""
    fix_arg = sys.argv[6] if len(sys.argv) > 6 else ""
    tools_arg = sys.argv[7] if len(sys.argv) > 7 else "[]"
    mem_arg = sys.argv[8] if len(sys.argv) > 8 else "[]"
    
    print(generate_code(role_arg, goal_arg, context_arg, attempt_arg, error_arg, fix_arg, tools_arg, mem_arg))
