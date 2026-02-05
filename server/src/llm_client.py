import os
import json
from openai import OpenAI

def get_llm_client():
    # NVIDIA API usage typically follows OpenAI compatible format
    # Base URL for NVIDIA NIM or similar services
    base_url = os.environ.get("NVIDIA_API_BASE_URL", "https://integrate.api.nvidia.com/v1")
    api_key = os.environ.get("NVIDIA_API_KEY")
    
    if not api_key:
        # Fallback to default OPENAI_API_KEY if NVIDIA specific one isn't set
        api_key = os.environ.get("OPENAI_API_KEY")
        
    client = OpenAI(base_url=base_url, api_key=api_key)
    return client

def call_llm(messages, model="thm/glm-4-9b-chat", temperature=0.2, max_tokens=1024):
    """
    Common function to call the LLM.
    Default model is set to a common NVIDIA hosted one, but can be overridden.
    User suggested models: z-ai/glm-4 or minimaxai/minimax-m2.1
    Note: Exact model strings might vary based on NVIDIA's catalog.
    """
    client = get_llm_client()
    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format={"type": "json_object"} if "json" in str(messages).lower() else None
        )
        return response.choices[0].message.content
    except Exception as e:
        return json.dumps({"error": str(e), "success": False})
