import sys
import os
import json
from llm_client import call_llm

def diagnose_error(error_output: str, context: str) -> str:
    """
    Diagnose execution errors and suggest fixes using NVIDIA hosted LLM.
    """
    system_prompt = """You are the Tester in an AI Team. 
Your task is to analyze execution failures and suggest concrete fixes based on the P.R.O.M.P.T. framework.
Adopt a "zero-trust" mindset and look for evidence in the context.

You must output a JSON object with the following fields:
- diagnosis: A clear explanation of what went wrong.
- isLogicError: Boolean, true if it's a logic flaw rather than a simple syntax/env error.
- suggestedFix: A concrete suggestion or piece of code to fix the issue.

Output format: ONLY a JSON object."""

    user_prompt = f"Error: {error_output}\nContext: {context}"
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    model = os.environ.get("LLM_MODEL", "z-ai/glm-4-9b-chat")
    result = call_llm(messages, model=model)
    
    try:
        start = result.find('{')
        end = result.rfind('}') + 1
        if start != -1 and end != -1:
            return result[start:end]
        return result
    except Exception as e:
        return json.dumps({
            "diagnosis": "Error during diagnosis",
            "isLogicError": False,
            "suggestedFix": "Check logs manually"
        })

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 llm_error_diagnoser.py <error_output> <context>")
        sys.exit(1)
        
    error_arg = sys.argv[1]
    context_arg = sys.argv[2]
    
    print(diagnose_error(error_arg, context_arg))
