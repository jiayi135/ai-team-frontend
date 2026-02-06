import sys

with open('server/src/mcp_discovery.ts', 'r') as f:
    content = f.read()

# Fix the broken line if it exists
content = content.replace("this.toolCatalog.set(, tool);", "this.toolCatalog.set(`${tool.server}:${tool.name}`, tool);")

# Also fix the missing call to loadMockTools if it was missed
discovery_loop_end = "logger.error(`Failed to discover tools for server ${server}`, { error: error.message });\n      }\n    }"
if "if (this.toolCatalog.size === 0) { this.loadMockTools(); }" not in content:
    content = content.replace(discovery_loop_end, discovery_loop_end + "\n\n    if (this.toolCatalog.size === 0) { this.loadMockTools(); }")

with open('server/src/mcp_discovery.ts', 'w') as f:
    f.write(content)
