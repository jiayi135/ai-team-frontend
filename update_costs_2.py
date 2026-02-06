import sys

with open('client/src/pages/Costs.tsx', 'r') as f:
    content = f.read()

# Update variable declarations to use quota state
content = content.replace(
    "const totalCost = summary?.totalCost || 0;",
    "const totalCost = quota.spending || summary?.totalCost || 0;"
)
content = content.replace(
    "const monthlyBudget = summary?.monthlyBudget || 20000;",
    "const monthlyBudget = quota.totalBudget || summary?.monthlyBudget || 20000;"
)
content = content.replace(
    "const remainingBudget = summary?.remainingBudget || 0;",
    "const remainingBudget = quota.remainingBudget || summary?.remainingBudget || 0;"
)

with open('client/src/pages/Costs.tsx', 'w') as f:
    f.write(content)
