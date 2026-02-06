import sys

with open('client/src/App.tsx', 'r') as f:
    content = f.read()

if "import Tools from \"./pages/Tools\";" not in content:
    content = content.replace(
        "import Roles from \"./pages/Roles\";",
        "import Roles from \"./pages/Roles\";\nimport Tools from \"./pages/Tools\";"
    )

if "<Route path={\"/tools\"} component={Tools} />" not in content:
    content = content.replace(
        "<Route path={\"/settings\"} component={Settings} />",
        "<Route path={\"/tools\"} component={Tools} />\n      <Route path={\"/settings\"} component={Settings} />"
    )

with open('client/src/App.tsx', 'w') as f:
    f.write(content)
