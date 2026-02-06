import sys

with open('client/src/components/layout/Sidebar.tsx', 'r') as f:
    content = f.read()

if "{ label: '工具管理', href: '/tools', icon: Wrench }," not in content:
    if "Wrench" not in content:
        content = content.replace("Settings,", "Settings,\n  Wrench,")

    # Insert before Settings
    content = content.replace(
        "{ label: '系统设置', href: '/settings', icon: Settings },",
        "{ label: '工具管理', href: '/tools', icon: Wrench },\n  { label: '系统设置', href: '/settings', icon: Settings },"
    )

with open('client/src/components/layout/Sidebar.tsx', 'w') as f:
    f.write(content)
