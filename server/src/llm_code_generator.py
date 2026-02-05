import sys
import os
import json
from llm_client import call_llm

def generate_code(role: str, goal: str, context: str) -> str:
    """
    Generate code or shell commands using NVIDIA hosted LLM.
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

    user_prompt = f"Goal: {goal}\nContext: {context}"
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    # Using GLM-4 or MiniMax as requested via NVIDIA API
    model = os.environ.get("LLM_MODEL", "z-ai/glm-4-9b-chat")
    result = call_llm(messages, model=model)
    return result.strip()

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3 llm_code_generator.py <role> <goal> <context>")
        sys.exit(1)
        
    role_arg = sys.argv[1]
    goal_arg = sys.argv[2]
    context_arg = sys.argv[3]
    
    print(generate_code(role_arg, goal_arg, context_arg))
