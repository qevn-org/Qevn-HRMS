'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { onboardingService, ProbationRadarItem, InternshipRadarItem } from '@/lib/services/onboardingService';
import { peopleService } from '@/lib/services/peopleService';
import { hrmsStore } from '@/lib/services/store';
import { Person, OnboardingTask } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { Input, Select, Textarea } from '@/components/ui/FormControls';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import {
  UserPlus,
  CheckSquare,
  GraduationCap,
  Clock,
  Award,
  AlertTriangle,
  LogOut,
  Sparkles,
} from 'lucide-react';

function OnboardingLifecycleContent() {
  const searchParams = useSearchParams();
  const { canManagePeople, user } = useAuth();

  const [activeTab, setActiveTab] = useState('pipeline');
  const [newJoiners, setNewJoiners] = useState<Person[]>([]);
  const [allTasks, setAllTasks] = useState<OnboardingTask[]>([]);
  const [probationRadar, setProbationRadar] = useState<ProbationRadarItem[]>([]);
  const [internshipRadar, setInternshipRadar] = useState<InternshipRadarItem[]>([]);
  const [exitedPersons, setExitedPersons] = useState<Person[]>([]);

  // Modals
  const [isProbationModalOpen, setIsProbationModalOpen] = useState(false);
  const [probationTarget, setProbationTarget] = useState<ProbationRadarItem | null>(null);
  const [probationDecision, setProbationDecision] = useState<'confirm' | 'extend' | 'end_employment'>('confirm');
  const [probationNotes, setProbationNotes] = useState('');
  const [probationNewEndDate, setProbationNewEndDate] = useState('2026-11-01');

  // Internship Decision Modal
  const [isInternshipModalOpen, setIsInternshipModalOpen] = useState(false);
  const [internshipTarget, setInternshipTarget] = useState<InternshipRadarItem | null>(null);
  const [internshipDecision, setInternshipDecision] = useState<'completed' | 'extended' | 'discontinued'>('completed');
  const [internshipNotes, setInternshipNotes] = useState('');

  useEffect(() => {
    loadOnboardingData();
    const unsubscribe = hrmsStore.subscribe(() => {
      loadOnboardingData();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'probation' || tabParam === 'interns' || tabParam === 'pipeline' || tabParam === 'exits') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const loadOnboardingData = () => {
    hrmsStore.init();
    const joiners = onboardingService.getNewJoiners(90);
    const tasks = onboardingService.getAllTasks();
    const probation = onboardingService.getProbationRadar(60);
    const interns = onboardingService.getInternshipRadar(60);
    const exits = peopleService.getAllPersons().filter((p) => !p.is_active || p.current_status === 'resigned' || p.current_status === 'exited');

    setNewJoiners(joiners);
    setAllTasks(tasks);
    setProbationRadar(probation);
    setInternshipRadar(interns);
    setExitedPersons(exits);
  };

  // Toggle Task Status
  const handleToggleTask = (taskId: string, currentStatus: OnboardingTask['status']) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    onboardingService.updateTaskStatus(taskId, nextStatus, user.display_name);

    if (nextStatus === 'completed') {
      toast.success('Task marked as completed');
    } else {
      toast.info('Task reopened');
    }
  };

  // Submit Probation Decision
  const handleProbationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!probationTarget) return;

    onboardingService.recordProbationDecision(
      probationTarget.person.id,
      probationDecision,
      probationNotes,
      probationDecision === 'extend' ? probationNewEndDate : undefined,
      user.display_name
    );

    if (probationDecision === 'confirm') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      toast.success(`🎉 ${probationTarget.person.full_name} confirmed as full-time employee!`);
    } else if (probationDecision === 'extend') {
      toast.info(`Probation extended until ${probationNewEndDate}`);
    } else {
      toast.error(`Probation ended. Transitioning to offboarding.`);
    }

    setIsProbationModalOpen(false);
    setProbationTarget(null);
    setProbationNotes('');
  };

  // Submit Internship Decision
  const handleInternshipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internshipTarget) return;

    onboardingService.recordInternshipCompletion(
      internshipTarget.person.id,
      internshipDecision,
      internshipNotes,
      user.display_name
    );

    if (internshipDecision === 'completed') {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      toast.success(`🎓 ${internshipTarget.person.full_name} completed internship with honors!`);
    } else {
      toast.info(`Internship milestone recorded: ${internshipDecision.toUpperCase()}`);
    }

    setIsInternshipModalOpen(false);
    setInternshipTarget(null);
    setInternshipNotes('');
  };

  const tabs = [
    { id: 'pipeline', label: 'Joiners & Task Checklists', icon: <UserPlus className="w-3.5 h-3.5" />, count: newJoiners.length },
    { id: 'probation', label: 'Probation Radar & Confirmations', icon: <Clock className="w-3.5 h-3.5" />, count: probationRadar.length },
    { id: 'interns', label: 'Internship Term Milestones', icon: <GraduationCap className="w-3.5 h-3.5" />, count: internshipRadar.length },
    { id: 'exits', label: 'Offboarding & Exit History', icon: <LogOut className="w-3.5 h-3.5" />, count: exitedPersons.length },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border-3 border-black p-5 sm:p-6 shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="sticker-tag bg-[#FFDE59] text-black">
              LIFECYCLE PIPELINE
            </span>
            <span className="sticker-tag bg-[#00D06C] text-black">
              ONBOARDING RADAR
            </span>
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-black text-black tracking-tight mt-1 uppercase">
            ONBOARDING & LIFECYCLE RADAR
          </h1>
          <p className="text-xs sm:text-sm text-zinc-700 font-sans font-medium">
            Track joiner orientation, probation reviews, internship completions, and offboarding.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: JOINERS PIPELINE & TASK CHECKLISTS */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {newJoiners.map((joiner) => {
              const joinerTasks = allTasks.filter((t) => t.person_id === joiner.id);
              const completedCount = joinerTasks.filter((t) => t.status === 'completed').length;
              const totalCount = joinerTasks.length;
              const percent = totalCount === 0 ? 100 : Math.round((completedCount / totalCount) * 100);

              return (
                <div
                  key={joiner.id}
                  className="bg-white border-3 border-black hover:shadow-neo-lg p-5 shadow-neo flex flex-col justify-between transition-all"
                >
                  <div>
                    {/* Joiner Header */}
                    <div className="flex items-start justify-between gap-2 border-b-2 border-black/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-mono text-sm font-black text-black">{joiner.full_name}</h3>
                          <span className="text-[10px] font-mono font-bold text-zinc-600">[{joiner.person_code}]</span>
                        </div>
                        <div className="text-xs text-zinc-600 font-sans mt-0.5 font-medium">
                          {joiner.designation?.name} • {joiner.department?.name} • Joined {formatDate(joiner.joining_date)}
                        </div>
                      </div>
                      <Badge variant={percent === 100 ? 'green' : 'amber'}>
                        {percent}% DONE ({completedCount}/{totalCount})
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 w-full bg-white h-2.5 border-2 border-black">
                      <div
                        className={`h-full ${percent === 100 ? 'bg-[#00D06C]' : 'bg-[#FFDE59]'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    {/* Task Checklist Items */}
                    <div className="mt-4 space-y-2 font-mono text-xs">
                      {joinerTasks.length === 0 ? (
                        <div className="text-zinc-500 text-[11px] italic py-2">
                          No specific onboarding tasks assigned.
                        </div>
                      ) : (
                        joinerTasks.map((t) => (
                          <div
                            key={t.id}
                            className={`p-2.5 border-2 border-black flex items-center justify-between gap-3 shadow-neo-sm ${
                              t.status === 'completed'
                                ? 'bg-[#E8FBF0] text-zinc-600'
                                : 'bg-[#FAF7EE] text-black'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <button
                                onClick={() => handleToggleTask(t.id, t.status)}
                                className={`w-4 h-4 mt-0.5 border-2 border-black flex items-center justify-center cursor-pointer ${
                                  t.status === 'completed'
                                    ? 'bg-[#00D06C] text-black'
                                    : 'bg-white hover:bg-[#FFDE59]'
                                }`}
                              >
                                {t.status === 'completed' && <CheckSquare className="w-3 h-3" />}
                              </button>
                              <div>
                                <span className={t.status === 'completed' ? 'line-through text-zinc-500 font-medium' : 'font-black'}>
                                  {t.title}
                                </span>
                                <div className="text-[10px] text-zinc-600 font-sans font-medium">
                                  Category: {t.category} • Due: {formatDate(t.due_date)}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] uppercase font-black bg-black text-white px-1.5 py-0.2">
                              {t.status === 'completed' ? 'DONE' : 'PENDING'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t-2 border-black/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-zinc-600">
                      MANAGER: {joiner.manager?.full_name || 'HR Team'}
                    </span>
                    <Link href={`/people/${joiner.id}`}>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        VIEW PROFILE →
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PROBATION RADAR */}
      {activeTab === 'probation' && (
        <div className="bg-white border-3 border-black shadow-neo p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <div>
              <h3 className="font-mono text-sm font-black uppercase tracking-wider text-black">
                PROBATION EVALUATION & CONFIRMATION RADAR
              </h3>
              <p className="text-xs text-zinc-600 font-sans font-medium">
                Actionable milestones before conversion to permanent full-time employment status
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {probationRadar.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 font-mono text-xs font-bold bg-[#FAF7EE] border-2 border-black">
                No active employees currently approaching probation deadlines.
              </div>
            ) : (
              probationRadar.map((item) => (
                <div
                  key={item.person.id}
                  className={`p-4 border-3 border-black transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-neo-sm ${
                    item.isOverdue
                      ? 'bg-[#FFF0F3]'
                      : 'bg-[#FAF7EE]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 bg-[#FFDE59] border-2 border-black flex items-center justify-center font-mono font-black text-sm text-black shrink-0">
                      {item.person.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-mono text-xs font-black text-black flex items-center gap-2">
                        <span>{item.person.full_name}</span>
                        <span className="text-[10px] text-zinc-600 font-bold">[{item.person.person_code}]</span>
                        <Badge variant={item.isOverdue ? 'rose' : 'amber'}>
                          {item.isOverdue ? 'OVERDUE' : `${item.daysRemaining} DAYS REMAINING`}
                        </Badge>
                      </div>
                      <div className="text-xs text-zinc-600 font-sans mt-0.5 font-medium">
                        {item.person.designation?.name} • {item.person.department?.name} • Manager: {item.managerName}
                      </div>
                      <div className="text-[11px] font-mono text-black font-black mt-1 bg-white px-1.5 py-0.5 border border-black inline-block">
                        Probation End Date: {formatDate(item.probationEndDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="green"
                      size="sm"
                      onClick={() => {
                        setProbationTarget(item);
                        setProbationDecision('confirm');
                        setIsProbationModalOpen(true);
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" /> CONFIRM / DECIDE
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: INTERNSHIP RADAR */}
      {activeTab === 'interns' && (
        <div className="bg-white border-3 border-black shadow-neo p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <div>
              <h3 className="font-mono text-sm font-black uppercase tracking-wider text-black">
                INTERNSHIP TERM & COMPLETION RADAR
              </h3>
              <p className="text-xs text-zinc-600 font-sans font-medium">
                Milestones, appraisal checkpoints, and certificate issuance for intern cohort
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {internshipRadar.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 font-mono text-xs font-bold bg-[#FAF7EE] border-2 border-black">
                No active interns currently on term.
              </div>
            ) : (
              internshipRadar.map((item) => (
                <div
                  key={item.person.id}
                  className="p-4 bg-[#FAF7EE] border-3 border-black shadow-neo-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 bg-[#8B5CF6] border-2 border-black flex items-center justify-center font-mono font-black text-sm text-white shrink-0">
                      {item.person.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-mono text-xs font-black text-black flex items-center gap-2">
                        <span>{item.person.full_name}</span>
                        <Badge variant="purple">INTERNSHIP</Badge>
                        <span className="text-xs font-mono text-black font-black bg-[#FFDE59] px-1.5 border border-black">
                          {item.daysRemaining} days left
                        </span>
                      </div>
                      <div className="text-xs text-zinc-600 font-sans mt-0.5 font-medium">
                        {item.person.designation?.name} • {item.person.department?.name} • Mentor: {item.managerName}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-700 font-bold mt-1">
                        Term: {formatDate(item.internshipStartDate)} to {formatDate(item.internshipEndDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="purple"
                      size="sm"
                      onClick={() => {
                        setInternshipTarget(item);
                        setInternshipDecision('completed');
                        setIsInternshipModalOpen(true);
                      }}
                    >
                      <Award className="w-3.5 h-3.5 mr-1" /> COMPLETE TERM
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: OFFBOARDING & EXITS */}
      {activeTab === 'exits' && (
        <div className="bg-white border-3 border-black shadow-neo p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <div>
              <h3 className="font-mono text-sm font-black uppercase tracking-wider text-black">
                HISTORICAL OFFBOARDING & EXIT ARCHIVE
              </h3>
              <p className="text-xs text-zinc-600 font-sans font-medium">Soft-deactivated personnel with immutable historical records</p>
            </div>
          </div>

          <div className="divide-y-2 divide-black/10">
            {exitedPersons.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 font-mono text-xs font-bold bg-[#FAF7EE] border-2 border-black">No historical exits recorded.</div>
            ) : (
              exitedPersons.map((p) => (
                <div key={p.id} className="py-3.5 flex items-center justify-between gap-4 font-mono text-xs">
                  <div>
                    <div className="text-black font-black flex items-center gap-2">
                      <span>{p.full_name}</span>
                      <Badge variant="rose">EXITED</Badge>
                    </div>
                    <div className="text-zinc-600 text-[11px] font-bold mt-0.5">
                      Role: {p.designation?.name} • Last Working Date: {formatDate(p.last_working_date)}
                    </div>
                    {p.archive_reason && (
                      <div className="text-zinc-500 text-[11px] mt-0.5">
                        Archived By {p.archived_by}: {p.archive_reason}
                      </div>
                    )}
                  </div>
                  <Link href={`/people/${p.id}`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      VIEW HISTORICAL RECORD →
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: PROBATION DECISION */}
      <Modal
        isOpen={isProbationModalOpen}
        onClose={() => setIsProbationModalOpen(false)}
        title="RECORD PROBATION DECISION"
        subtitle="Confirmation converts person to active status and logs permanent milestone"
        headerColor="green"
        maxWidth="md"
        footer={
          <>
            <Button variant="white" size="sm" onClick={() => setIsProbationModalOpen(false)}>
              CANCEL
            </Button>
            <Button
              variant={probationDecision === 'confirm' ? 'green' : probationDecision === 'extend' ? 'purple' : 'danger'}
              size="sm"
              onClick={handleProbationSubmit}
            >
              SAVE DECISION
            </Button>
          </>
        }
      >
        <form onSubmit={handleProbationSubmit} className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-[#FAF7EE] border-2 border-black space-y-1">
            <div className="text-zinc-600 font-bold">
              EMPLOYEE: <span className="text-black font-black">{probationTarget?.person.full_name}</span>
            </div>
            <div className="text-zinc-600 font-bold">
              CURRENT PROBATION END: <span className="text-black font-black bg-[#FFDE59] px-1 border border-black">{probationTarget?.probationEndDate}</span>
            </div>
          </div>

          <Select
            label="Decision Outcome"
            value={probationDecision}
            onChange={(e) => setProbationDecision(e.target.value as any)}
            options={[
              { value: 'confirm', label: 'CONFIRM (Promote to Full-Time Permanent Status)' },
              { value: 'extend', label: 'EXTEND (Provide additional evaluation period)' },
              { value: 'end_employment', label: 'END EMPLOYMENT (Initiate offboarding)' },
            ]}
          />

          {probationDecision === 'extend' && (
            <Input
              label="New Extended Probation End Date"
              type="date"
              required
              value={probationNewEndDate}
              onChange={(e) => setProbationNewEndDate(e.target.value)}
            />
          )}

          <Textarea
            label="Evaluation Notes / Manager Feedback"
            required
            placeholder="Record evaluation summary, achievements, and confirmation notes..."
            value={probationNotes}
            onChange={(e) => setProbationNotes(e.target.value)}
          />
        </form>
      </Modal>

      {/* MODAL 2: INTERNSHIP MILESTONE */}
      <Modal
        isOpen={isInternshipModalOpen}
        onClose={() => setIsInternshipModalOpen(false)}
        title="RECORD INTERNSHIP MILESTONE"
        subtitle="Logs completion certificate readiness and performance notes"
        headerColor="purple"
        maxWidth="md"
        footer={
          <>
            <Button variant="white" size="sm" onClick={() => setIsInternshipModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="purple" size="sm" onClick={handleInternshipSubmit}>
              COMMIT MILESTONE
            </Button>
          </>
        }
      >
        <form onSubmit={handleInternshipSubmit} className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-[#FAF7EE] border-2 border-black space-y-1">
            <div className="text-zinc-600 font-bold">
              INTERN: <span className="text-black font-black">{internshipTarget?.person.full_name}</span>
            </div>
            <div className="text-zinc-600 font-bold">
              SCHEDULED TERM END: <span className="text-white bg-[#8B5CF6] px-1.5 py-0.5 border border-black font-black">{internshipTarget?.internshipEndDate}</span>
            </div>
          </div>

          <Select
            label="Internship Term Outcome"
            value={internshipDecision}
            onChange={(e) => setInternshipDecision(e.target.value as any)}
            options={[
              { value: 'completed', label: 'COMPLETED (Issue Certificate & Letter)' },
              { value: 'extended', label: 'EXTENDED (Extend project duration)' },
              { value: 'discontinued', label: 'DISCONTINUED (Early termination)' },
            ]}
          />

          <Textarea
            label="Mentor Appraisal & Final Project Notes"
            required
            placeholder="Feedback on project deliverable quality, technical skills, and recommendations..."
            value={internshipNotes}
            onChange={(e) => setInternshipNotes(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}

export default function OnboardingLifecyclePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-black font-mono text-sm font-bold">Loading Lifecycle Radar...</div>}>
      <OnboardingLifecycleContent />
    </Suspense>
  );
}
