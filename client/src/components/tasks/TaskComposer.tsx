import React, { useState, useEffect } from 'react';
import { 
  Send, 
  User, 
  Brain, 
  History, 
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ROLES, ROLE_DETAILS } from '@/lib/constants';

interface TaskComposerProps {
  onSubmit: (role: string, goal: string, useMemory: boolean) => void;
  isLoading?: boolean;
}

const ROLE_KEYWORDS: Record<string, string[]> = {
  [ROLES.ARCHITECT]: ['架构', '设计', '规范', '流程', '定义', '规划', '模式'],
  [ROLES.DEVELOPER]: ['代码', '开发', '实现', '功能', '编写', '构建', '部署', 'git', 'github'],
  [ROLES.ALGORITHM_EXPERT]: ['性能', '优化', '算法', '分析', '调优', '速度', '资源'],
  [ROLES.TESTER]: ['测试', '验证', '检查', '自动化', '用例', 'bug', '错误'],
};

export default function TaskComposer({ onSubmit, isLoading }: TaskComposerProps) {
  const [goal, setGoal] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.DEVELOPER);
  const [useMemory, setUseMemory] = useState(true);
  const [suggestedRole, setSuggestedRole] = useState<string | null>(null);

  useEffect(() => {
    if (!goal.trim()) {
      setSuggestedRole(null);
      return;
    }

    const lowercaseGoal = goal.toLowerCase();
    let bestRole = null;
    let maxMatches = 0;

    for (const [role, keywords] of Object.entries(ROLE_KEYWORDS)) {
      const matches = keywords.filter(k => lowercaseGoal.includes(k)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestRole = role;
      }
    }

    if (bestRole) {
      setSuggestedRole(bestRole);
    }
  }, [goal]);

  const handleSubmit = () => {
    if (!goal.trim()) return;
    onSubmit(selectedRole, goal, useMemory);
    setGoal('');
  };

  return (
    <Card className="border-2 shadow-lg overflow-hidden">
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="text-blue-500" size={20} />
            任务编排交互中心
          </CardTitle>
          <Badge variant="outline" className="bg-white">
            P.R.O.M.P.T. 模式
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Goal Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            任务目标描述
            {suggestedRole && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 animate-pulse border-blue-100">
                AI 建议角色: {ROLE_DETAILS[suggestedRole as keyof typeof ROLE_DETAILS]?.title}
              </Badge>
            )}
          </label>
          <Textarea
            placeholder="例如：为项目增加一个 GitHub Action 自动部署到 Vercel 的功能..."
            className="min-h-[120px] text-base resize-none border-slate-200 focus:border-blue-400 focus:ring-blue-400"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700">执行角色委派</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(ROLE_DETAILS).filter(([key]) => key !== ROLES.ARBITRATION_EXPERT).map(([key, detail]) => (
              <button
                key={key}
                onClick={() => setSelectedRole(key)}
                className={cn(
                  "flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                  selectedRole === key 
                    ? "border-blue-500 bg-blue-50 shadow-sm" 
                    : "border-slate-100 bg-white hover:border-slate-200",
                  suggestedRole === key && selectedRole !== key && "ring-2 ring-blue-200"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg mb-2",
                  selectedRole === key ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"
                )}>
                  <User size={20} />
                </div>
                <span className="text-xs font-bold text-slate-900">{detail.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Memory & Context */}
        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={() => setUseMemory(!useMemory)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all",
              useMemory 
                ? "bg-purple-50 border-purple-200 text-purple-700" 
                : "bg-slate-50 border-slate-200 text-slate-500"
            )}
          >
            <Brain size={16} />
            {useMemory ? "已关联 memU 长期记忆" : "禁用长期记忆"}
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium">
            <History size={16} />
            自动上下文继承已开启
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-slate-50 border-t p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <AlertCircle size={14} />
          任务将受法典宪法实时审计
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={!goal.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 gap-2 shadow-md"
        >
          {isLoading ? "处理中..." : "启动任务流"}
          <Send size={18} />
        </Button>
      </CardFooter>
    </Card>
  );
}
