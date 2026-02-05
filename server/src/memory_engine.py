import asyncio
import os
import sys
import json
from memu.app import MemoryService

# Initialize the Memory Service
# We'll use the same LLM configuration as other engines
api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("NVIDIA_API_KEY")
model = os.environ.get("LLM_MODEL", "z-ai/glm-4-9b-chat")

service = MemoryService(
    llm_profiles={
        "default": {
            "api_key": api_key,
            "chat_model": model,
        },
    },
)

async def memorize_task(task_id: str, goal: str, result: str):
    """
    Store the result of a completed task into the long-term memory.
    """
    if not api_key:
        return {"status": "error", "message": "API key not found"}

    # Create a temporary resource for the task
    resource_content = {
        "task_id": task_id,
        "goal": goal,
        "result": result
    }
    
    # In a real scenario, we might write this to a file and pass the URL
    # For now, we simulate a conversation modality
    try:
        # memu-py's memorize usually takes a URL or local path
        # We'll create a temporary file
        temp_file = f"/tmp/task_{task_id}.json"
        with open(temp_file, "w") as f:
            json.dump(resource_content, f)
            
        res = await service.memorize(resource_url=temp_file, modality="document")
        return {"status": "success", "data": res}
    except Exception as e:
        return {"status": "error", "message": str(e)}

async def retrieve_memories(query: str):
    """
    Retrieve relevant memories for a given query.
    """
    if not api_key:
        return []

    try:
        # Search for relevant items
        res = await service.retrieve(query=query)
        return res.get("items", [])
    except Exception as e:
        print(f"Retrieval error: {e}", file=sys.stderr)
        return []

if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else "retrieve"
    query_or_data = sys.argv[2] if len(sys.argv) > 2 else ""
    
    if action == "memorize":
        # Expecting JSON string for data
        data = json.loads(query_or_data)
        result = asyncio.run(memorize_task(data['id'], data['goal'], data['result']))
        print(json.dumps(result))
    else:
        memories = asyncio.run(retrieve_memories(query_or_data))
        print(json.dumps(memories))
