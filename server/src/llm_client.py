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

def call_llm(messages, model=None, temperature=0.2, max_tokens=1024):
    """
    Common function to call the LLM.
    Priority:
    1. model parameter passed to the function
    2. LLM_MODEL environment variable
    3. Default to 'z-ai/glm-4' as requested by user
    """
    if model is None:
        model = os.environ.get("LLM_MODEL", "z-ai/glm-4")
        
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
