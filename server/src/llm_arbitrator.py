import sys
import os
import json
from llm_client import call_llm

def arbitrate_conflict(conflict_description: str, context: str) -> str:
    """
    Arbitrate technical conflicts based on the AI Team Constitution using NVIDIA hosted LLM.
    """
    system_prompt = """You are the Arbitration Expert. 
Your task is to resolve technical deadlocks within the AI team using the P.R.O.M.P.T. framework.
Evaluate conflicts across 7 dimensions: Tech Stack, Architectural Patterns, Requirements Alignment, Data Flow, Internal Logic, Performance Metrics, and Security.

You must output a JSON object with the following fields:
- decision: The final technical decision.
- reasoning: Detailed reasoning referencing the Constitution if applicable.
- impact: The impact of this decision on the system.
- constitutionalClause: The specific clause from the Constitution being applied.

Output format: ONLY a JSON object."""

    user_prompt = f"Conflict: {conflict_description}\nContext: {context}"
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    model = os.environ.get("LLM_MODEL", "z-ai/glm-4-9b-chat")
    result = call_llm(messages, model=model)
    
    try:
        # Try to find JSON block if LLM included extra text
        start = result.find('{')
        end = result.rfind('}') + 1
        if start != -1 and end != -1:
            return result[start:end]
        return result
    except Exception as e:
        return json.dumps({
            "decision": "Error during arbitration",
            "reasoning": str(e),
            "impact": "Manual intervention required"
        })

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 llm_arbitrator.py <conflict_description> <context>")
        sys.exit(1)
        
    conflict_arg = sys.argv[1]
    context_arg = sys.argv[2]
    
    print(arbitrate_conflict(conflict_arg, context_arg))
