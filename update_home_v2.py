import sys

with open('client/src/pages/Home.tsx', 'r') as f:
    content = f.read()

if "import ModuleControlCenter from '@/components/dashboard/ModuleControlCenter';" not in content:
    content = content.replace(
        "import TaskComposer from '@/components/tasks/TaskComposer';",
        "import TaskComposer from '@/components/tasks/TaskComposer';\nimport ModuleControlCenter from '@/components/dashboard/ModuleControlCenter';"
    )

if "<ModuleControlCenter />" not in content:
    content = content.replace(
        "{/* KPI Cards */}",
        "{/* Module Control Center */}\n      <div className=\"mb-12\">\n        <ModuleControlCenter />\n      </div>\n\n      {/* KPI Cards */}"
    )

with open('client/src/pages/Home.tsx', 'w') as f:
    f.write(content)
