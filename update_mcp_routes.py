import sys

with open('server/src/mcp_routes.ts', 'r') as f:
    content = f.read()

if "import { ROLE_PROMPTS } from './prompt_library';" not in content:
    content = "import { ROLE_PROMPTS } from './prompt_library';\n" + content

if "router.get('/prompts'" not in content:
    prompts_route = """
// Get role system prompts
router.get('/prompts', (req, res) => {
  res.json({ success: true, prompts: ROLE_PROMPTS });
});
"""
    # Insert before the last export
    content = content.replace("export default router;", prompts_route + "\nexport default router;")

with open('server/src/mcp_routes.ts', 'w') as f:
    f.write(content)
