import sys

with open('server/src/index.ts', 'r') as f:
    content = f.read()

# Add import
if "import mcpRoutes from './mcp_routes';" not in content:
    content = content.replace(
        "import { PromptGenerator } from './prompt_generator';",
        "import { PromptGenerator } from './prompt_generator';\nimport mcpRoutes from './mcp_routes';"
    )

# Add routes
if "app.use('/api/mcp', mcpRoutes);" not in content:
    search_str = "// ============================================\n// Web Search API Routes (Article V)\n// ============================================"
    replace_str = "// ============================================\n// MCP & Governance Routes\n// ============================================\napp.use('/api/mcp', mcpRoutes);\napp.use('/api/governance', mcpRoutes);\n\n" + search_str
    content = content.replace(search_str, replace_str)

with open('server/src/index.ts', 'w') as f:
    f.write(content)
