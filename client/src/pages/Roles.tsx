import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import RoleCard from '@/components/roles/RoleCard';
import { ROLE_DETAILS, ROLES } from '@/lib/constants';
import {
  Layout,
  Code,
  Zap,
  CheckSquare,
  Scale,
  ShieldAlert,
} from 'lucide-react';

const roleIcons = {
  [ROLES.ARCHITECT]: <Layout size={32} />,
  [ROLES.DEVELOPER]: <Code size={32} />,
  [ROLES.ALGORITHM_EXPERT]: <Zap size={32} />,
  [ROLES.TESTER]: <CheckSquare size={32} />,
  [ROLES.ARBITRATION_EXPERT]: <Scale size={32} />,
};

export default function Roles() {
  return (
    <MainLayout
      title="角色管理"
      subtitle="P.R.O.M.P.T. 治理框架下的核心职能角色"
    >
      {/* Introduction */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 mb-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-lg text-white">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-900 mb-2">
              角色宪法与边界
            </h2>
            <p className="text-blue-800 leading-relaxed">
              P.R.O.M.P.T. 框架定义了五个核心职能角色，通过<strong>元认知审计</strong>确保高保真输出并防止职能重叠。
              每个角色都有明确的责任范围和边界限制，以维持系统的完整性与确定性。
            </p>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Object.entries(ROLE_DETAILS).map(([roleKey, roleData]) => (
          <RoleCard
            key={roleKey}
            title={roleData.title}
            description={roleData.description}
            responsibilities={roleData.responsibilities}
            restrictions={roleData.restrictions}
            color={roleData.color}
            icon={roleIcons[roleKey as keyof typeof roleIcons]}
            isActive={roleKey === ROLES.ARCHITECT}
          />
        ))}
      </div>

      {/* Collaboration Info */}
      <div className="mt-12 bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          上下文继承与协作协议 (Contextual Heritage)
        </h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          为了保持完整的协作链条，系统采用<strong>上下文继承</strong>机制。前序角色的输出自动作为后续角色的强制性输入和约束集，确保在交付过程中不丢失任何战略意图。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
          
          {[
            { id: 1, name: '架构师', color: 'bg-orange-500', desc: '定义架构与规范' },
            { id: 2, name: '开发者', color: 'bg-blue-500', desc: '代码实现与优化' },
            { id: 3, name: '算法专家', color: 'bg-purple-500', desc: '性能分析与调优' },
            { id: 4, name: '测试员', color: 'bg-green-500', desc: '自动化验证与反馈' },
            { id: 5, name: '仲裁专家', color: 'bg-slate-600', desc: '解决技术僵局' },
          ].map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full ${step.color} text-white flex items-center justify-center font-bold text-lg shadow-lg mb-3 border-4 border-white`}>
                {step.id}
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{step.name}</h3>
              <p className="text-xs text-slate-500 px-2">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
