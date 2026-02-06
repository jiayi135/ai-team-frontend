import sys

with open('client/src/pages/Costs.tsx', 'r') as f:
    content = f.read()

# Add state for quota
if "const [quota, setQuota] = useState" not in content:
    content = content.replace(
        "const [isLoading, setIsLoading] = useState(true);",
        "const [isLoading, setIsLoading] = useState(true);\n  const [quota, setQuota] = useState({ remainingBudget: 1000, totalBudget: 1000, spending: 0 });"
    )

# Update fetch function
if "const fetchQuota = async () => {" not in content:
    fetch_quota_code = """
  const fetchQuota = async () => {
    try {
      const response = await fetch('/api/governance/quota/status');
      const data = await response.json();
      if (data.success) {
        setQuota({
          remainingBudget: data.remainingBudget,
          totalBudget: data.totalBudget,
          spending: data.spending
        });
      }
    } catch (err) {
      console.error('Failed to fetch quota:', err);
    }
  };
"""
    content = content.replace("const fetchCostData = async () => {", fetch_quota_code + "\n  const fetchCostData = async () => {")
    content = content.replace("fetchCostData();", "fetchCostData();\n    fetchQuota();")

# Use quota values in JSX
content = content.replace("monthlyBudget = 1000;", "monthlyBudget = quota.totalBudget;")
content = content.replace("totalCost = 124.50;", "totalCost = quota.spending;")
content = content.replace("remainingBudget = 875.50;", "remainingBudget = quota.remainingBudget;")

with open('client/src/pages/Costs.tsx', 'w') as f:
    f.write(content)
