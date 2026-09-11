'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Layers,
  UserCheck,
  Laptop,
  Award,
  Zap,
  Bot,
  BarChart,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Sparkles,
} from 'lucide-react';

export default function FuturePhasesHubPage() {
  const [featureFlags, setFeatureFlags] = useState({
    PHASE_1_CORE_HR: true,
    PHASE_2_ATS_RECRUITMENT: false,
    PHASE_2_ASSET_MANAGEMENT: false,
    PHASE_2_PERFORMANCE_KPIS: false,
    PHASE_3_SELF_SERVICE_PORTAL: false,
    PHASE_3_PAYROLL_FINANCE_HANDOFF: false,
    PHASE_3_WORKFLOW_AUTOMATION: false,
    PHASE_4_AI_HR_ASSISTANT: false,
    PHASE_4_WORKFORCE_INTELLIGENCE: false,
  });

  const toggleFlag = (key: keyof typeof featureFlags) => {
    if (key === 'PHASE_1_CORE_HR') return;
    setFeatureFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-[#121218] border-2 border-[#262636] p-5 shadow-neo">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#06B6D4]" />
          <span className="font-mono text-xs font-bold uppercase text-[#06B6D4] tracking-wider">
            SCALABILITY & ROADMAP BLUEPRINT
          </span>
        </div>
        <h1 className="font-mono text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
          QEVN HRMS // PHASES 2–4 ARCHITECTURE HUB
        </h1>
        <p className="text-xs text-zinc-400 font-sans">
          The Phase 1 person model connects directly into future recruitment, asset tracking, structured KPIs, payroll handoffs, and AI intelligence without schema rewrites.
        </p>
      </div>

      {/* Feature Flags Control Matrix */}
      <div className="bg-[#121218] border-2 border-[#262636] shadow-neo p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              MODULE FEATURE FLAGS & GATEWAYS
            </h3>
            <p className="text-xs text-zinc-400">Environment toggles controlling modular expansion</p>
          </div>
          <span className="text-xs font-mono text-[#CCFF00] font-bold">CONFIG-DRIVEN</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
          {Object.entries(featureFlags).map(([key, enabled]) => (
            <div
              key={key}
              onClick={() => toggleFlag(key as any)}
              className={`p-3.5 border-2 flex items-center justify-between transition-all cursor-pointer select-none ${
                enabled
                  ? 'bg-[#0D0D12] border-[#CCFF00] shadow-neo-sm text-white'
                  : 'bg-[#0D0D12] border-[#22222E] text-zinc-500 opacity-60'
              }`}
            >
              <div>
                <span className="font-bold text-[11px] block">{key}</span>
                <span className="text-[10px] text-zinc-500">{enabled ? 'Active / In Production' : 'Staged / Schema Ready'}</span>
              </div>
              <Badge variant={enabled ? 'lime' : 'neutral'}>
                {enabled ? 'ENABLED' : 'DISABLED'}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap Modules Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Phase 2 */}
        <div className="bg-[#121218] border-2 border-[#8B5CF6] p-5 shadow-neo space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
            <div>
              <span className="text-[10px] font-mono text-[#8B5CF6] font-bold block">PHASE 2</span>
              <h3 className="font-mono text-base font-black text-white">STRUCTURED HR OPERATIONS</h3>
            </div>
            <Badge variant="violet">STAGED</Badge>
          </div>

          <div className="space-y-3 text-xs font-sans text-zinc-300">
            <div className="p-3 bg-[#0D0D12] border border-zinc-800 space-y-1">
              <span className="font-mono font-bold text-white text-xs block">1. Recruitment & ATS</span>
              <p className="text-zinc-400 text-[11px]">
                Job openings, candidates pipeline, resume parsing, interviewer notes, offer approvals, and zero-loss candidate-to-person conversion.
              </p>
            </div>

            <div className="p-3 bg-[#0D0D12] border border-zinc-800 space-y-1">
              <span className="font-mono font-bold text-white text-xs block">2. Asset Management</span>
              <p className="text-zinc-400 text-[11px]">
                Hardware inventory, serial tracking, assignment records, condition logging, and exit recovery checklists.
              </p>
            </div>

            <div className="p-3 bg-[#0D0D12] border border-zinc-800 space-y-1">
              <span className="font-mono font-bold text-white text-xs block">3. Performance & KPIs</span>
              <p className="text-zinc-400 text-[11px]">
                Department KPI templates, quarterly review cycles, goals vs actuals tracking, and employee acknowledgement.
              </p>
            </div>
          </div>
        </div>

        {/* Phase 3 */}
        <div className="bg-[#121218] border-2 border-[#06B6D4] p-5 shadow-neo space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
            <div>
              <span className="text-[10px] font-mono text-[#06B6D4] font-bold block">PHASE 3</span>
              <h3 className="font-mono text-base font-black text-white">EMPLOYEE LIFECYCLE AUTOMATION</h3>
            </div>
            <Badge variant="cyan">STAGED</Badge>
          </div>

          <div className="space-y-3 text-xs font-sans text-zinc-300">
            <div className="p-3 bg-[#0D0D12] border border-zinc-800 space-y-1">
              <span className="font-mono font-bold text-white text-xs block">1. Employee Self-Service</span>
              <p className="text-zinc-400 text-[11px]">
                Dedicated employee portal for profile updates, document downloads, leave tracking, and task acknowledgements.
              </p>
            </div>

            <div className="p-3 bg-[#0D0D12] border border-zinc-800 space-y-1">
              <span className="font-mono font-bold text-white text-xs block">2. Payroll & Finance Handoff</span>
              <p className="text-zinc-400 text-[11px]">
                Salary profile history, approved attendance/leave inputs handoff, reimbursements, and payslip reference tracking.
              </p>
            </div>

            <div className="p-3 bg-[#0D0D12] border border-zinc-800 space-y-1">
              <span className="font-mono font-bold text-white text-xs block">3. Workflow Automation</span>
              <p className="text-zinc-400 text-[11px]">
                Automated probation reminders, document expiry notifications, and dynamic onboarding template triggers.
              </p>
            </div>
          </div>
        </div>

        {/* Phase 4 */}
        <div className="bg-[#121218] border-2 border-[#CCFF00] p-5 shadow-neo space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
            <div>
              <span className="text-[10px] font-mono text-[#CCFF00] font-bold block">PHASE 4</span>
              <h3 className="font-mono text-base font-black text-white">AI & WORKFORCE INTELLIGENCE</h3>
            </div>
            <Badge variant="lime">STAGED</Badge>
          </div>

          <div className="space-y-3 text-xs font-sans text-zinc-300">
            <div className="p-3 bg-[#0D0D12] border border-zinc-800 space-y-1">
              <span className="font-mono font-bold text-white text-xs block">1. AI HR Assistant</span>
              <p className="text-zinc-400 text-[11px]">
                Natural language question answering over authorized HR data with verified data citations (strict RLS-governed).
              </p>
            </div>

            <div className="p-3 bg-[#0D0D12] border border-zinc-800 space-y-1">
              <span className="font-mono font-bold text-white text-xs block">2. AI Letter Drafting</span>
              <p className="text-zinc-400 text-[11px]">
                Template-based offer, appraisal, and certificate generation with mandatory human HR review before issuing.
              </p>
            </div>

            <div className="p-3 bg-[#0D0D12] border border-zinc-800 space-y-1">
              <span className="font-mono font-bold text-white text-xs block">3. Workforce Analytics</span>
              <p className="text-zinc-400 text-[11px]">
                Headcount growth trends, attrition radar, hiring conversion funnels, and capacity planning intelligence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
