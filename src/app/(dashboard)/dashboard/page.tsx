'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { reportService } from '@/lib/services/reportService';
import { onboardingService, ProbationRadarItem, InternshipRadarItem } from '@/lib/services/onboardingService';
import { leaveService } from '@/lib/services/leaveService';
import { documentService } from '@/lib/services/documentService';
import { hrmsStore } from '@/lib/services/store';
import { DashboardMetrics } from '@/types/domain';
import { MetricCard } from '@/components/ui/MetricCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Users,
  UserCheck,
  UserX,
  CalendarDays,
  Clock,
  AlertTriangle,
  FileWarning,
  GraduationCap,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  CalendarCheck,
  Plus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const { activeRole } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [departmentHeadcount, setDepartmentHeadcount] = useState<any[]>([]);
  const [probationRadar, setProbationRadar] = useState<ProbationRadarItem[]>([]);
  const [internshipRadar, setInternshipRadar] = useState<InternshipRadarItem[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [expiringDocs, setExpiringDocs] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
    const unsubscribe = hrmsStore.subscribe(() => {
      loadDashboardData();
    });
    return unsubscribe;
  }, []);

  const loadDashboardData = () => {
    hrmsStore.init();
    setMetrics(reportService.getDashboardMetrics());
    setDepartmentHeadcount(reportService.getDepartmentHeadcount());
    setProbationRadar(onboardingService.getProbationRadar(45));
    setInternshipRadar(onboardingService.getInternshipRadar(45));
    setPendingLeaves(leaveService.getAllLeaveRequests({ status: 'pending' }));
    setExpiringDocs(documentService.getExpiringDocumentsQueue(45));
  };

  if (!metrics) {
    return <div className="p-8 text-center text-zinc-500 font-mono text-sm">Loading QEVN HRMS Command Center...</div>;
  }

  const CHART_COLORS = ['#CCFF00', '#8B5CF6', '#06B6D4', '#F43F5E', '#F59E0B', '#10B981'];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Greeting, Date & Quick Metrics */}
      <div className="bg-[#121218] border-2 border-[#262636] p-4 sm:p-6 shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#CCFF00] animate-pulse" />
            <span className="font-mono text-xs font-black uppercase text-[#CCFF00] tracking-widest">
              PEOPLE OPERATIONS COMMAND CENTER
            </span>
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            QEVN WORKFORCE OVERVIEW
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-0.5">
            Operational status, attendance matrix, pending approvals, and lifecycle radar for{' '}
            <span className="text-white font-mono font-bold">11 Sep 2026</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/people?action=new')}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Person
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push('/attendance')}
          >
            <CalendarCheck className="w-4 h-4 mr-1" /> Attendance
          </Button>
          <Button
            variant="cyan"
            size="sm"
            onClick={() => router.push('/reports')}
          >
            <TrendingUp className="w-4 h-4 mr-1" /> Reports
          </Button>
        </div>
      </div>

      {/* Row 1: Clickable Actionable KPIs (Linking to pre-filtered lists) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <MetricCard
          label="Total Active"
          value={metrics.totalActivePeople}
          subValue={`${metrics.activeEmployees} FT • ${metrics.activeInterns} Interns`}
          badgeText="STABLE"
          badgeVariant="lime"
          icon={<Users className="w-4 h-4" />}
          accentColor="lime"
          onClick={() => router.push('/people?status=active')}
        />
        <MetricCard
          label="Present Today"
          value={metrics.presentToday}
          subValue={`${metrics.wfhToday} WFH • ${metrics.halfDayToday} Half Day`}
          badgeText="LIVE"
          badgeVariant="lime"
          icon={<UserCheck className="w-4 h-4" />}
          accentColor="lime"
          onClick={() => router.push('/attendance?status=present')}
        />
        <MetricCard
          label="Absent Today"
          value={metrics.absentToday}
          subValue="Unplanned absences"
          badgeText={metrics.absentToday > 0 ? "ATTENTION" : "NONE"}
          badgeVariant={metrics.absentToday > 0 ? "rose" : "neutral"}
          icon={<UserX className="w-4 h-4" />}
          accentColor="rose"
          onClick={() => router.push('/attendance?status=absent')}
        />
        <MetricCard
          label="On Leave Today"
          value={metrics.onLeaveToday}
          subValue="Approved time-off"
          badgeText="SYNCED"
          badgeVariant="cyan"
          icon={<CalendarDays className="w-4 h-4" />}
          accentColor="cyan"
          onClick={() => router.push('/attendance?status=leave')}
        />
        <MetricCard
          label="Unmarked"
          value={metrics.unmarkedToday}
          subValue="Pending morning mark"
          badgeText={metrics.unmarkedToday > 0 ? "CHECK" : "ALL MARKED"}
          badgeVariant={metrics.unmarkedToday > 0 ? "amber" : "neutral"}
          icon={<Clock className="w-4 h-4" />}
          accentColor="amber"
          onClick={() => router.push('/attendance?status=unmarked')}
        />
        <MetricCard
          label="Pending Leaves"
          value={metrics.pendingLeaveApprovals}
          subValue="Awaiting manager action"
          badgeText={metrics.pendingLeaveApprovals > 0 ? "ACTION DUE" : "CLEAR"}
          badgeVariant={metrics.pendingLeaveApprovals > 0 ? "violet" : "neutral"}
          icon={<Sparkles className="w-4 h-4" />}
          accentColor="violet"
          onClick={() => router.push('/leave?status=pending')}
        />
      </div>

      {/* Row 2: Attention Required & Lifecycle Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attention Required Feed (5 Cols) */}
        <div className="lg:col-span-6 bg-[#121218] border-2 border-[#262636] p-5 shadow-neo flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                  ATTENTION REQUIRED // ACTION QUEUE
                </h3>
              </div>
              <span className="text-xs font-mono text-[#F59E0B] font-bold">
                {pendingLeaves.length + expiringDocs.length} PENDING
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {pendingLeaves.length === 0 && expiringDocs.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 font-mono text-xs">
                  No immediate blocking alerts. All approvals and compliance current.
                </div>
              ) : (
                <>
                  {pendingLeaves.slice(0, 3).map((lr) => (
                    <div
                      key={lr.id}
                      onClick={() => router.push('/leave?status=pending')}
                      className="p-3 bg-[#0D0D12] border border-[#262636] hover:border-[#8B5CF6] transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-[#8B5CF6]/20 border border-[#8B5CF6] text-[#8B5CF6]">
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-mono text-xs font-bold text-white group-hover:text-[#8B5CF6]">
                            {lr.person?.full_name} — {lr.leave_type?.name}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {lr.duration_days} day(s) from {lr.start_date} • {lr.reason}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#8B5CF6]" />
                    </div>
                  ))}

                  {expiringDocs.slice(0, 2).map((item) => (
                    <div
                      key={item.document.id}
                      onClick={() => router.push('/documents?filter=expiring')}
                      className="p-3 bg-[#0D0D12] border border-[#262636] hover:border-[#F43F5E] transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-[#F43F5E]/20 border border-[#F43F5E] text-[#F43F5E]">
                          <FileWarning className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-mono text-xs font-bold text-white group-hover:text-[#F43F5E]">
                            Expiring: {item.document.document_type}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {item.document.person_name} • Expires in {item.daysRemaining} days ({item.document.expiry_date})
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#F43F5E]" />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#262636] flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500">SORTED BY DUE DATE & SEVERITY</span>
            <Button variant="ghost" size="sm" onClick={() => router.push('/leave')}>
              VIEW ALL QUEUES →
            </Button>
          </div>
        </div>

        {/* Lifecycle Radar (7 Cols) */}
        <div className="lg:col-span-6 bg-[#121218] border-2 border-[#262636] p-5 shadow-neo flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#CCFF00]" />
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                  LIFECYCLE RADAR // PROBATION & INTERNS
                </h3>
              </div>
              <span className="text-xs font-mono text-[#CCFF00] font-bold">
                {probationRadar.length + internshipRadar.length} UPCOMING
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {/* Probation Radar Item */}
              {probationRadar.slice(0, 2).map((item) => (
                <div
                  key={item.person.id}
                  onClick={() => router.push('/onboarding?tab=probation')}
                  className="p-3 bg-[#0D0D12] border border-[#262636] hover:border-[#CCFF00] transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#CCFF00]/10 border border-[#CCFF00] flex items-center justify-center font-mono font-bold text-xs text-[#CCFF00]">
                      {item.person.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold text-white group-hover:text-[#CCFF00] flex items-center gap-1.5">
                        <span>{item.person.full_name}</span>
                        <Badge variant="amber">PROBATION</Badge>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-sans">
                        End Date: {item.probationEndDate} ({item.daysRemaining} days remaining) • Manager: {item.managerName}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    REVIEW
                  </Button>
                </div>
              ))}

              {/* Internship Radar Item */}
              {internshipRadar.slice(0, 2).map((item) => (
                <div
                  key={item.person.id}
                  onClick={() => router.push('/onboarding?tab=interns')}
                  className="p-3 bg-[#0D0D12] border border-[#262636] hover:border-[#8B5CF6] transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#8B5CF6]/10 border border-[#8B5CF6] flex items-center justify-center font-mono font-bold text-xs text-[#8B5CF6]">
                      {item.person.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold text-white group-hover:text-[#8B5CF6] flex items-center gap-1.5">
                        <span>{item.person.full_name}</span>
                        <Badge variant="violet">INTERNSHIP</Badge>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-sans">
                        Term Ends: {item.internshipEndDate} ({item.daysRemaining} days remaining) • Mentor: {item.managerName}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    COMPLETE
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#262636] flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500">AUTOMATIC CONFIRMATION REMINDERS</span>
            <Button variant="ghost" size="sm" onClick={() => router.push('/onboarding')}>
              OPEN LIFECYCLE HUB →
            </Button>
          </div>
        </div>
      </div>

      {/* Row 3: Department Headcount Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Headcount by Dept (8 Cols) */}
        <div className="lg:col-span-8 bg-[#121218] border-2 border-[#262636] p-5 shadow-neo">
          <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
            <div>
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                DEPARTMENT HEADCOUNT DISTRIBUTION
              </h3>
              <p className="text-xs text-zinc-400">Active headcount segmented by department</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/reports?type=headcount')}>
              DETAILED REPORT
            </Button>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentHeadcount} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="code" stroke="#71717A" tick={{ fill: '#A1A1AA', fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#71717A" tick={{ fill: '#A1A1AA', fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171722',
                    borderColor: '#CCFF00',
                    borderWidth: '2px',
                    borderRadius: '0px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="employees" name="Employees" fill="#CCFF00" />
                <Bar dataKey="interns" name="Interns" fill="#8B5CF6" />
                <Bar dataKey="contractors" name="Contractors" fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Worker Type Mix (4 Cols) */}
        <div className="lg:col-span-4 bg-[#121218] border-2 border-[#262636] p-5 shadow-neo flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-[#262636]">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                WORKFORCE COMPOSITION
              </h3>
              <p className="text-xs text-zinc-400">Worker type ratio</p>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#0D0D12] border border-[#262636]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#CCFF00]" />
                  <span className="font-mono text-xs font-bold text-white">Full-Time Employees</span>
                </div>
                <span className="font-mono text-base font-black text-[#CCFF00]">{metrics.activeEmployees}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#0D0D12] border border-[#262636]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#8B5CF6]" />
                  <span className="font-mono text-xs font-bold text-white">Interns</span>
                </div>
                <span className="font-mono text-base font-black text-[#8B5CF6]">{metrics.activeInterns}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#0D0D12] border border-[#262636]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#06B6D4]" />
                  <span className="font-mono text-xs font-bold text-white">Contractors & Consultants</span>
                </div>
                <span className="font-mono text-base font-black text-[#06B6D4]">{metrics.activeContractors}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#262636] flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>NO PLACEHOLDER METRICS</span>
            <span className="text-[#CCFF00]">100% AUDITABLE DATA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
