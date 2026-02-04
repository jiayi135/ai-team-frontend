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
      title="Role Management"
      subtitle="Core functional roles in the P.R.O.M.P.T. framework"
    >
      {/* Introduction */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          About Roles
        </h2>
        <p className="text-blue-800">
          The P.R.O.M.P.T. framework defines five core functional roles that work together
          to ensure high-fidelity outputs and prevent functional overlap. Each role has
          specific responsibilities and boundary restrictions to maintain system integrity.
        </p>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      <div className="mt-12 bg-white rounded-lg border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Contextual Heritage & Collaboration
        </h2>
        <p className="text-slate-700 mb-4">
          To maintain a complete chain of collaboration, the system employs
          <strong> Contextual Heritage</strong>. The output of a preceding role (e.g.,
          Architect) automatically serves as the mandatory input and constraint set for
          the subsequent role (e.g., Developer). This ensures no strategic intent is lost
          during handover.
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-orange-100">
                <span className="text-orange-600 font-bold">1</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Architect</h3>
              <p className="text-slate-600">
                Defines system architecture and technical specifications
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
                <span className="text-blue-600 font-bold">2</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Developer</h3>
              <p className="text-slate-600">
                Implements code based on architectural specifications
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-100">
                <span className="text-purple-600 font-bold">3</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Algorithm Expert</h3>
              <p className="text-slate-600">
                Optimizes algorithms and validates performance
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-100">
                <span className="text-green-600 font-bold">4</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Tester</h3>
              <p className="text-slate-600">
                Verifies functionality and maintains quality standards
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100">
                <span className="text-gray-600 font-bold">5</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Arbitration Expert</h3>
              <p className="text-slate-600">
                Resolves technical deadlocks when consensus cannot be reached
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
