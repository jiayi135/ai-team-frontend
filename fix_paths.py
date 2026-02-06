import sys
import os

# Fix checkpoint.ts
with open('server/src/checkpoint.ts', 'r') as f:
    content = f.read()

if "'/home/ubuntu/ai-team-frontend/server'" in content:
    content = content.replace("'/home/ubuntu/ai-team-frontend/server'", "path.resolve(__dirname, '..')")

with open('server/src/checkpoint.ts', 'w') as f:
    f.write(content)

# Fix task_orchestrator.ts
with open('server/src/task_orchestrator.ts', 'r') as f:
    content = f.read()

if "cwd: '/home/ubuntu/ai-team-frontend/server'" in content:
    content = content.replace("cwd: '/home/ubuntu/ai-team-frontend/server'", "cwd: path.resolve(__dirname, '..')")

with open('server/src/task_orchestrator.ts', 'w') as f:
    f.write(content)

# Fix Tools.tsx JSX error
with open('client/src/pages/Tools.tsx', 'r') as f:
    content = f.read()

content = content.replace("<span>> Sending command to", "<span>{'>'} Sending command to")

with open('client/src/pages/Tools.tsx', 'w') as f:
    f.write(content)
