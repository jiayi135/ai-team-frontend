import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { CONFLICT_DIMENSIONS, NEGOTIATION_STATUS } from '@/lib/constants';
import { getNegotiationStatusColor } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface Negotiation {
  id: string;
  title: string;
  status: string;
  consensusScore: number;
  round: number;
  maxRounds: number;
  conflicts: Array<{ dimension: string; severity: 'minor' | 'moderate' | 'severe' }>;
  participants: string[];
  startTime: Date;
}

const mockNegotiations: Negotiation[] = [
  {
    id: '1',
    title: 'Tech Stack Selection - Database',
    status: NEGOTIATION_STATUS.IN_PROGRESS,
    consensusScore: 0.72,
    round: 2,
    maxRounds: 5,
    conflicts: [
      { dimension: 'Tech Stack', severity: 'moderate' },
      { dimension: 'Performance Metrics', severity: 'minor' },
    ],
    participants: ['Architect', 'Developer', 'Algorithm Expert'],
    startTime: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    title: 'API Design Patterns',
    status: NEGOTIATION_STATUS.CONSENSUS_REACHED,
    consensusScore: 0.95,
    round: 3,
    maxRounds: 5,
    conflicts: [],
    participants: ['Architect', 'Developer', 'Tester'],
    startTime: new Date(Date.now() - 7200000),
  },
  {
    id: '3',
    title: 'Security Implementation Strategy',
    status: NEGOTIATION_STATUS.EXPERT_ARBITRATION,
    consensusScore: 0.45,
    round: 4,
    maxRounds: 5,
    conflicts: [
      { dimension: 'Security', severity: 'severe' },
      { dimension: 'Performance Metrics', severity: 'severe' },
    ],
    participants: ['Developer', 'Algorithm Expert', 'Arbitration Expert'],
    startTime: new Date(Date.now() - 10800000),
  },
];

export default function Negotiations() {
  const [selectedNegotiation, setSelectedNegotiation] = useState<Negotiation | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case NEGOTIATION_STATUS.CONSENSUS_REACHED:
        return <CheckCircle className="text-green-600" size={20} />;
      case NEGOTIATION_STATUS.EXPERT_ARBITRATION:
        return <AlertCircle className="text-orange-600" size={20} />;
      case NEGOTIATION_STATUS.IN_PROGRESS:
        return <Clock className="text-blue-600" size={20} />;
      default:
        return null;
    }
  };

  const getConflictColor = (severity: string) => {
    switch (severity) {
      case 'minor':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderate':
        return 'bg-orange-100 text-orange-800';
      case 'severe':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout
      title="Negotiations"
      subtitle="Multi-agent consensus building and conflict resolution"
    >
      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-purple-900 mb-2">
          Autonomous Negotiation Protocol
        </h2>
        <p className="text-purple-800">
          The system uses a four-layer negotiation protocol to resolve technical disagreements:
          Data Representation, Conflict Detection, Debate Arbitration, and Consensus Execution.
          Negotiations are limited to 3-5 rounds with a 300-second timeout per cycle.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Negotiations List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {mockNegotiations.map((negotiation) => (
              <div
                key={negotiation.id}
                onClick={() => setSelectedNegotiation(negotiation)}
                className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedNegotiation?.id === negotiation.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(negotiation.status)}
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {negotiation.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Round {negotiation.round} of {negotiation.maxRounds}
                      </p>
                    </div>
                  </div>
                  <Badge
                    style={{
                      backgroundColor: getNegotiationStatusColor(negotiation.status),
                      color: 'white',
                    }}
                  >
                    {negotiation.status.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Consensus Score */}
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      Consensus Score
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {(negotiation.consensusScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={negotiation.consensusScore * 100} />
                </div>

                {/* Conflicts */}
                {negotiation.conflicts.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      Detected Conflicts
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {negotiation.conflicts.map((conflict, idx) => (
                        <Badge
                          key={idx}
                          className={getConflictColor(conflict.severity)}
                        >
                          {conflict.dimension}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Participants */}
                <div className="flex flex-wrap gap-2">
                  {negotiation.participants.map((participant, idx) => (
                    <Badge key={idx} variant="outline">
                      {participant}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          {selectedNegotiation ? (
            <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Negotiation Details
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Title</p>
                  <p className="font-semibold text-slate-900">
                    {selectedNegotiation.title}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <Badge
                    style={{
                      backgroundColor: getNegotiationStatusColor(
                        selectedNegotiation.status
                      ),
                      color: 'white',
                    }}
                  >
                    {selectedNegotiation.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-2">Consensus Score</p>
                  <div className="text-3xl font-bold text-blue-600">
                    {(selectedNegotiation.consensusScore * 100).toFixed(0)}%
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Round Progress</p>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={
                        (selectedNegotiation.round / selectedNegotiation.maxRounds) *
                        100
                      }
                    />
                    <span className="text-sm font-medium text-slate-900">
                      {selectedNegotiation.round}/{selectedNegotiation.maxRounds}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-2">Participants</p>
                  <div className="space-y-1">
                    {selectedNegotiation.participants.map((participant, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-slate-700 flex items-center gap-2"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {participant}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 text-center">
              <p className="text-slate-600">
                Select a negotiation to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
