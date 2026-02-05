import sys
import os
import json
from llm_client import call_llm

def generate_code(role: str, goal: str, context: str, attempt: int = 1, prev_error: str = "", suggested_fix: str = "") -> str:
    """
    Generate or repair code based on feedback loop using NVIDIA hosted LLM.
    """
    system_prompt = f"""You are a professional {role} in an AI Team. 
Your task is to generate a single executable shell command or a script to achieve the goal.
Follow the P.R.O.M.P.T. framework:
- Purpose: Focus on the success state.
- Operation: Output must be a direct command or script.
- Media: Use the provided context effectively.

Rules:
1. Output ONLY the command or script.
2. NO markdown code blocks (```).
3. NO explanations.
4. If creating files, use: echo 'content' > filename
5. If executing python, write to file then run: python3 filename
"""

    if attempt > 1:
        user_prompt = f"""
### REPAIR MISSION (Attempt {attempt})
Goal: {goal}
Previous Error: {prev_error}
Diagnosis & Suggested Fix: {suggested_fix}

Context: {context}

Please generate a NEW command or script that fixes the previous error using the suggested fix.
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
    # Supports extended arguments for feedback loop
    # Usage: python3 llm_code_generator.py <role> <goal> <context> [attempt] [prev_error] [suggested_fix]
    role_arg = sys.argv[1] if len(sys.argv) > 1 else "Developer"
    goal_arg = sys.argv[2] if len(sys.argv) > 2 else ""
    context_arg = sys.argv[3] if len(sys.argv) > 3 else ""
    attempt_arg = int(sys.argv[4]) if len(sys.argv) > 4 and sys.argv[4] else 1
    error_arg = sys.argv[5] if len(sys.argv) > 5 else ""
    fix_arg = sys.argv[6] if len(sys.argv) > 6 else ""
    
    print(generate_code(role_arg, goal_arg, context_arg, attempt_arg, error_arg, fix_arg))
