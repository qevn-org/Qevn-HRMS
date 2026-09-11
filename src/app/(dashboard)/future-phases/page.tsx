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
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Compass,
  Radio,
  Cpu,
  Workflow,
  LineChart,
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
    <div className="space-y-6 pb-12 max-w-7xl mx-auto font-sans">
      {/* Editorial Header Banner */}
      <div className="bg-white border-3 border-black shadow-neo-lg p-6 relative overflow-hidden">
        <div className="absolute -top-3 right-6 sticker-tag bg-[#8B5CF6] text-white border-2 border-black font-mono text-xs font-black px-3 py-1 shadow-neo rotate-2">
          ★ ROADMAP BLUEPRINT
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block w-3 h-3 bg-[#00D06C] border-2 border-black" />
          <span className="font-mono text-xs font-black uppercase text-black tracking-widest bg-[#FFDE59] px-2 py-0.5 border-2 border-black">
            SCALABILITY & EXTENSION HUB
          </span>
        </div>
        <h1 className="font-mono text-2xl sm:text-4xl font-black text-black tracking-tight uppercase">
          PHASES 2–4 ARCHITECTURAL ROADMAP
        </h1>
        <p className="text-sm text-neutral-800 font-medium max-w-3xl mt-1">
          The core Phase 1 person & employment model is engineered to plug directly into future ATS pipelines, asset registries, KPI reviews, automated payroll handoffs, and AI intelligence engines without any schema rewrites or breaking migrations.
        </p>
      </div>

      {/* Feature Flags Control Matrix */}
      <div className="bg-white border-3 border-black shadow-neo-lg overflow-hidden">
        <div className="bg-[#FFDE59] border-b-3 border-black px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF6B9D] border border-black inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#38BDF8] border border-black inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#00D06C] border border-black inline-block" />
            <h3 className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-black ml-2">
              MODULE FEATURE GATEWAYS & ENVIRONMENT TOGGLES
            </h3>
          </div>
          <span className="text-xs font-mono bg-black text-white font-black px-2 py-0.5 border border-black">
            CONFIG-DRIVEN
          </span>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-neutral-700 font-medium">
            Toggle modules below to simulate feature gating across the organization. Core Phase 1 is locked in active production status.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
            {Object.entries(featureFlags).map(([key, enabled]) => (
              <div
                key={key}
                onClick={() => toggleFlag(key as any)}
                className={`p-4 border-2 border-black flex items-center justify-between transition-all cursor-pointer select-none ${
                  enabled
                    ? 'bg-[#00D06C] text-black shadow-neo font-bold'
                    : 'bg-[#FAF7EE] text-neutral-600 hover:bg-white hover:border-black'
                }`}
              >
                <div>
                  <span className="font-black text-xs block text-black">{key}</span>
                  <span className="text-[10px] text-neutral-800 font-medium">
                    {enabled ? 'Active / In Production' : 'Staged / Schema Ready'}
                  </span>
                </div>
                <Badge variant={enabled ? 'green' : 'neutral'}>
                  {enabled ? 'ENABLED' : 'DISABLED'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Roadmap Modules Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Phase 2 */}
        <div className="bg-white border-3 border-black shadow-neo-lg overflow-hidden flex flex-col">
          <div className="bg-[#8B5CF6] text-white border-b-3 border-black p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#FFDE59] font-black uppercase tracking-widest block">
                PHASE 2
              </span>
              <h3 className="font-mono text-lg font-black uppercase">STRUCTURED HR OPERATIONS</h3>
            </div>
            <div className="font-mono text-[10px] bg-white text-black font-black px-2 py-1 border-2 border-black shadow-neo-sm">
              STAGED
            </div>
          </div>

          <div className="p-5 space-y-4 flex-1 bg-[#FAF7EE]/50">
            <div className="p-3.5 bg-white border-2 border-black shadow-neo-sm space-y-1.5">
              <div className="flex items-center gap-1.5 text-black font-mono font-black text-xs">
                <UserCheck className="w-4 h-4 text-[#8B5CF6]" />
                <span>1. Recruitment & ATS</span>
              </div>
              <p className="text-neutral-700 text-xs leading-relaxed">
                Job openings, candidates pipeline, resume parsing, interviewer scorecards, offer approvals, and zero-loss candidate-to-person conversion.
              </p>
            </div>

            <div className="p-3.5 bg-white border-2 border-black shadow-neo-sm space-y-1.5">
              <div className="flex items-center gap-1.5 text-black font-mono font-black text-xs">
                <Laptop className="w-4 h-4 text-[#8B5CF6]" />
                <span>2. Asset Management</span>
              </div>
              <p className="text-neutral-700 text-xs leading-relaxed">
                Hardware inventory, serial tracking, assignment records, condition logging, and exit recovery checklists.
              </p>
            </div>

            <div className="p-3.5 bg-white border-2 border-black shadow-neo-sm space-y-1.5">
              <div className="flex items-center gap-1.5 text-black font-mono font-black text-xs">
                <Award className="w-4 h-4 text-[#8B5CF6]" />
                <span>3. Performance & KPIs</span>
              </div>
              <p className="text-neutral-700 text-xs leading-relaxed">
                Department KPI templates, quarterly review cycles, goals vs actuals tracking, and employee acknowledgement.
              </p>
            </div>
          </div>
        </div>

        {/* Phase 3 */}
        <div className="bg-white border-3 border-black shadow-neo-lg overflow-hidden flex flex-col">
          <div className="bg-[#38BDF8] text-black border-b-3 border-black p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-black font-black uppercase tracking-widest block">
                PHASE 3
              </span>
              <h3 className="font-mono text-lg font-black uppercase">EMPLOYEE LIFECYCLE AUTOMATION</h3>
            </div>
            <div className="font-mono text-[10px] bg-white text-black font-black px-2 py-1 border-2 border-black shadow-neo-sm">
              STAGED
            </div>
          </div>

          <div className="p-5 space-y-4 flex-1 bg-[#FAF7EE]/50">
            <div className="p-3.5 bg-white border-2 border-black shadow-neo-sm space-y-1.5">
              <div className="flex items-center gap-1.5 text-black font-mono font-black text-xs">
                <Compass className="w-4 h-4 text-[#0284C7]" />
                <span>1. Employee Self-Service</span>
              </div>
              <p className="text-neutral-700 text-xs leading-relaxed">
                Dedicated employee portal for profile updates, document downloads, leave tracking, and task acknowledgements.
              </p>
            </div>

            <div className="p-3.5 bg-white border-2 border-black shadow-neo-sm space-y-1.5">
              <div className="flex items-center gap-1.5 text-black font-mono font-black text-xs">
                <Zap className="w-4 h-4 text-[#0284C7]" />
                <span>2. Payroll & Finance Handoff</span>
              </div>
              <p className="text-neutral-700 text-xs leading-relaxed">
                Salary profile history, approved attendance/leave inputs handoff, reimbursements, and payslip reference tracking.
              </p>
            </div>

            <div className="p-3.5 bg-white border-2 border-black shadow-neo-sm space-y-1.5">
              <div className="flex items-center gap-1.5 text-black font-mono font-black text-xs">
                <Workflow className="w-4 h-4 text-[#0284C7]" />
                <span>3. Workflow Automation</span>
              </div>
              <p className="text-neutral-700 text-xs leading-relaxed">
                Automated probation reminders, document expiry notifications, and dynamic onboarding template triggers.
              </p>
            </div>
          </div>
        </div>

        {/* Phase 4 */}
        <div className="bg-white border-3 border-black shadow-neo-lg overflow-hidden flex flex-col">
          <div className="bg-[#FF6B9D] text-black border-b-3 border-black p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-black font-black uppercase tracking-widest block">
                PHASE 4
              </span>
              <h3 className="font-mono text-lg font-black uppercase">AI & WORKFORCE INTELLIGENCE</h3>
            </div>
            <div className="font-mono text-[10px] bg-white text-black font-black px-2 py-1 border-2 border-black shadow-neo-sm">
              STAGED
            </div>
          </div>

          <div className="p-5 space-y-4 flex-1 bg-[#FAF7EE]/50">
            <div className="p-3.5 bg-white border-2 border-black shadow-neo-sm space-y-1.5">
              <div className="flex items-center gap-1.5 text-black font-mono font-black text-xs">
                <Bot className="w-4 h-4 text-[#DB2777]" />
                <span>1. AI HR Assistant</span>
              </div>
              <p className="text-neutral-700 text-xs leading-relaxed">
                Natural language question answering over authorized HR data with verified data citations (strict RLS-governed).
              </p>
            </div>

            <div className="p-3.5 bg-white border-2 border-black shadow-neo-sm space-y-1.5">
              <div className="flex items-center gap-1.5 text-black font-mono font-black text-xs">
                <Sparkles className="w-4 h-4 text-[#DB2777]" />
                <span>2. AI Letter Drafting</span>
              </div>
              <p className="text-neutral-700 text-xs leading-relaxed">
                Template-based offer, appraisal, and certificate generation with mandatory human HR review before issuing.
              </p>
            </div>

            <div className="p-3.5 bg-white border-2 border-black shadow-neo-sm space-y-1.5">
              <div className="flex items-center gap-1.5 text-black font-mono font-black text-xs">
                <BarChart3 className="w-4 h-4 text-[#DB2777]" />
                <span>3. Workforce Analytics</span>
              </div>
              <p className="text-neutral-700 text-xs leading-relaxed">
                Headcount growth trends, attrition radar, hiring conversion funnels, and capacity planning intelligence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
