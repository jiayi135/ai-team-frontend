#!/usr/bin/env python3
"""
Deploy AI Team Frontend to Hugging Face Spaces
"""

from huggingface_hub import HfApi, create_repo, upload_folder
import os

# Configuration
SPACE_NAME = "ai-team-frontend"
USERNAME = "HuFelix135"
REPO_ID = f"{USERNAME}/{SPACE_NAME}"
TOKEN = os.getenv('HF_TOKEN', '')  # Set via environment variable

def main():
    print("🚀 Starting deployment to Hugging Face Spaces...")
    
    # Initialize API
    api = HfApi(token=TOKEN)
    
    # Step 1: Create Space (if not exists)
    print(f"\n📦 Creating Space: {REPO_ID}")
    try:
        create_repo(
            repo_id=REPO_ID,
            repo_type="space",
            space_sdk="docker",
            private=False,
            token=TOKEN,
            exist_ok=True
        )
        print("✅ Space created/verified successfully")
    except Exception as e:
        print(f"⚠️  Space creation: {e}")
    
    # Step 2: Upload files
    print(f"\n📤 Uploading files to {REPO_ID}...")
    
    # Files/folders to ignore
    ignore_patterns = [
        ".git/*",
        ".github/*",
        "node_modules/*",
        "dist/*",
        "*.log",
        ".env*",
        "__pycache__/*",
        "*.pyc",
        ".DS_Store",
        "tmp/*",
        "upload/*",
    ]
    
    try:
        upload_folder(
            folder_path=".",
            repo_id=REPO_ID,
            repo_type="space",
            token=TOKEN,
            ignore_patterns=ignore_patterns,
            commit_message="🎨 Deploy new design with Claude.ai style"
        )
        print("✅ Files uploaded successfully")
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        return False
    
    # Step 3: Show Space URL
    space_url = f"https://huggingface.co/spaces/{REPO_ID}"
    print(f"\n🎉 Deployment complete!")
    print(f"🌐 Space URL: {space_url}")
    print(f"⏳ Please wait 2-3 minutes for the Space to build and start...")
    
    return True

if __name__ == "__main__":
    main()
