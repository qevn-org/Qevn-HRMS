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
    return (
      <div className="p-12 text-center font-mono text-sm font-bold">
        Loading QEVN HRMS Command Center...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Editorial Banner: Layered Composition with Stickers & Window Chrome */}
      <div className="relative bg-white border-3 border-black p-5 sm:p-7 shadow-neo-lg overflow-hidden">
        {/* Decorative graphic background strip */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#FFDE59] border-3 border-black rotate-12 -z-0 opacity-80 pointer-events-none" />
        <div className="absolute -bottom-8 right-24 w-28 h-28 bg-[#FF6B9D] border-3 border-black -rotate-6 -z-0 opacity-70 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="sticker-tag bg-[#00D06C] text-black">
                ● LIVE RADAR 2026
              </span>
              <span className="sticker-tag bg-[#FF6B9D] text-black -rotate-1">
                MAXIMALIST PEOPLE OS
              </span>
              <span className="sticker-tag bg-[#8B5CF6] text-white rotate-1">
                AUDIT READY
              </span>
            </div>

            <h1 className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight leading-none uppercase">
              BEYOND <span className="bg-[#00D06C] px-2 py-0.5 border-2 border-black inline-block rotate-1">MINIMALISM:</span> WORKFORCE HQ
            </h1>

            <p className="text-xs sm:text-sm text-zinc-800 font-sans font-medium">
              Real-time operational matrix, biometric check-ins, leave approvals, and talent compliance for{' '}
              <span className="text-black font-mono font-black bg-[#FFDE59] px-1 border border-black">
                11 Sep 2026
              </span>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap z-10">
            <Button
              variant="green"
              size="md"
              onClick={() => router.push('/people?action=new')}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Person
            </Button>
            <Button
              variant="purple"
              size="md"
              onClick={() => router.push('/attendance')}
            >
              <CalendarCheck className="w-4 h-4 mr-1" /> Attendance
            </Button>
            <Button
              variant="pink"
              size="md"
              onClick={() => router.push('/reports')}
            >
              <TrendingUp className="w-4 h-4 mr-1" /> Reports
            </Button>
          </div>
        </div>
      </div>

      {/* Row 1: Retro Window Actionable KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <MetricCard
          label="Total Active"
          value={metrics.totalActivePeople}
          subValue={`${metrics.activeEmployees} FT • ${metrics.activeInterns} Interns`}
          badgeText="STABLE"
          badgeVariant="green"
          icon={<Users className="w-3.5 h-3.5" />}
          accentColor="green"
          onClick={() => router.push('/people?status=active')}
        />
        <MetricCard
          label="Present Today"
          value={metrics.presentToday}
          subValue={`${metrics.wfhToday} WFH • ${metrics.halfDayToday} Half Day`}
          badgeText="LIVE"
          badgeVariant="green"
          icon={<UserCheck className="w-3.5 h-3.5" />}
          accentColor="green"
          onClick={() => router.push('/attendance?status=present')}
        />
        <MetricCard
          label="Absent Today"
          value={metrics.absentToday}
          subValue="Unplanned absences"
          badgeText={metrics.absentToday > 0 ? "ATTN" : "NONE"}
          badgeVariant={metrics.absentToday > 0 ? "rose" : "neutral"}
          icon={<UserX className="w-3.5 h-3.5" />}
          accentColor="rose"
          onClick={() => router.push('/attendance?status=absent')}
        />
        <MetricCard
          label="On Leave Today"
          value={metrics.onLeaveToday}
          subValue="Approved time-off"
          badgeText="SYNCED"
          badgeVariant="cyan"
          icon={<CalendarDays className="w-3.5 h-3.5" />}
          accentColor="cyan"
          onClick={() => router.push('/attendance?status=leave')}
        />
        <MetricCard
          label="Unmarked"
          value={metrics.unmarkedToday}
          subValue="Pending morning mark"
          badgeText={metrics.unmarkedToday > 0 ? "PENDING" : "CLEAR"}
          badgeVariant={metrics.unmarkedToday > 0 ? "amber" : "neutral"}
          icon={<Clock className="w-3.5 h-3.5" />}
          accentColor="amber"
          onClick={() => router.push('/attendance?status=unmarked')}
        />
        <MetricCard
          label="Pending Leaves"
          value={metrics.pendingLeaveApprovals}
          subValue="Awaiting manager action"
          badgeText={metrics.pendingLeaveApprovals > 0 ? "DUE" : "CLEAR"}
          badgeVariant={metrics.pendingLeaveApprovals > 0 ? "purple" : "neutral"}
          icon={<Sparkles className="w-3.5 h-3.5" />}
          accentColor="purple"
          onClick={() => router.push('/leave?status=pending')}
        />
      </div>

      {/* Row 2: Layered Retro Windows: Attention Queue & Lifecycle Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attention Required Feed (6 Cols) */}
        <div className="lg:col-span-6 bg-white border-3 border-black shadow-neo flex flex-col justify-between overflow-hidden">
          <div>
            <div className="bg-[#FFDE59] border-b-3 border-black px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-black" />
                <h3 className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-black">
                  ATTENTION REQUIRED // ACTION QUEUE
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black bg-black text-[#FFDE59] px-2 py-0.5 border border-black">
                  {pendingLeaves.length + expiringDocs.length} PENDING
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold">_</span>
                  <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold">□</span>
                  <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold">✕</span>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2.5 bg-[#FCFAF5]">
              {pendingLeaves.length === 0 && expiringDocs.length === 0 ? (
                <div className="p-6 text-center text-zinc-600 font-mono text-xs bg-white border-2 border-black">
                  No immediate blocking alerts. All approvals and compliance current.
                </div>
              ) : (
                <>
                  {pendingLeaves.slice(0, 3).map((lr) => (
                    <div
                      key={lr.id}
                      onClick={() => router.push('/leave?status=pending')}
                      className="p-3 bg-white border-2 border-black shadow-neo-sm hover:translate-x-1 transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-[#8B5CF6] border-2 border-black text-white shrink-0">
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-mono text-xs font-black text-black group-hover:text-[#8B5CF6]">
                            {lr.person?.full_name} — {lr.leave_type?.name}
                          </div>
                          <div className="text-[11px] text-zinc-600 font-medium">
                            {lr.duration_days} day(s) from {lr.start_date} • {lr.reason}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform shrink-0" />
                    </div>
                  ))}

                  {expiringDocs.slice(0, 2).map((item) => (
                    <div
                      key={item.document.id}
                      onClick={() => router.push('/documents?filter=expiring')}
                      className="p-3 bg-white border-2 border-black shadow-neo-sm hover:translate-x-1 transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-[#FF4365] border-2 border-black text-white shrink-0">
                          <FileWarning className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-mono text-xs font-black text-black group-hover:text-[#FF4365]">
                            Expiring: {item.document.document_type}
                          </div>
                          <div className="text-[11px] text-zinc-600 font-medium">
                            {item.document.person_name} • Expires in {item.daysRemaining} days ({item.document.expiry_date})
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform shrink-0" />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="p-3 border-t-3 border-black bg-[#F2EBDC] flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-zinc-600">SORTED BY DUE DATE & SEVERITY</span>
            <Button variant="white" size="sm" onClick={() => router.push('/leave')}>
              VIEW ALL QUEUES →
            </Button>
          </div>
        </div>

        {/* Lifecycle Radar (6 Cols) */}
        <div className="lg:col-span-6 bg-white border-3 border-black shadow-neo flex flex-col justify-between overflow-hidden">
          <div>
            <div className="bg-[#00D06C] border-b-3 border-black px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-black" />
                <h3 className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-black">
                  LIFECYCLE RADAR // PROBATION & INTERNS
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black bg-black text-[#00D06C] px-2 py-0.5 border border-black">
                  {probationRadar.length + internshipRadar.length} UPCOMING
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold">_</span>
                  <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold">□</span>
                  <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold">✕</span>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2.5 bg-[#FCFAF5]">
              {/* Probation Radar Item */}
              {probationRadar.slice(0, 2).map((item) => (
                <div
                  key={item.person.id}
                  onClick={() => router.push('/onboarding?tab=probation')}
                  className="p-3 bg-white border-2 border-black shadow-neo-sm hover:translate-x-1 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-[#FFDE59] border-2 border-black flex items-center justify-center font-mono font-black text-xs text-black shrink-0">
                      {item.person.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-mono text-xs font-black text-black group-hover:text-[#00D06C] flex items-center gap-1.5">
                        <span>{item.person.full_name}</span>
                        <Badge variant="amber">PROBATION</Badge>
                      </div>
                      <div className="text-[11px] text-zinc-600 font-sans font-medium">
                        Ends: {item.probationEndDate} ({item.daysRemaining}d left) • Manager: {item.managerName}
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
                  className="p-3 bg-white border-2 border-black shadow-neo-sm hover:translate-x-1 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-[#8B5CF6] border-2 border-black flex items-center justify-center font-mono font-black text-xs text-white shrink-0">
                      {item.person.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-mono text-xs font-black text-black group-hover:text-[#8B5CF6] flex items-center gap-1.5">
                        <span>{item.person.full_name}</span>
                        <Badge variant="purple">INTERNSHIP</Badge>
                      </div>
                      <div className="text-[11px] text-zinc-600 font-sans font-medium">
                        Ends: {item.internshipEndDate} ({item.daysRemaining}d left) • Mentor: {item.managerName}
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

          <div className="p-3 border-t-3 border-black bg-[#F2EBDC] flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-zinc-600">AUTOMATIC CONFIRMATION REMINDERS</span>
            <Button variant="white" size="sm" onClick={() => router.push('/onboarding')}>
              OPEN LIFECYCLE HUB →
            </Button>
          </div>
        </div>
      </div>

      {/* Row 3: Department Headcount & Workforce Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Headcount by Dept (8 Cols) */}
        <div className="lg:col-span-8 bg-white border-3 border-black shadow-neo flex flex-col justify-between overflow-hidden">
          <div>
            <div className="bg-[#38BDF8] border-b-3 border-black px-4 py-2.5 flex items-center justify-between">
              <div>
                <h3 className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-black">
                  DEPARTMENT HEADCOUNT DISTRIBUTION
                </h3>
              </div>
              <Button variant="white" size="sm" onClick={() => router.push('/reports?type=headcount')}>
                DETAILED REPORT
              </Button>
            </div>

            <div className="p-5 bg-[#FCFAF5]">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentHeadcount} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="code" stroke="#000000" tick={{ fill: '#000000', fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold' }} />
                    <YAxis stroke="#000000" tick={{ fill: '#000000', fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#000000',
                        borderWidth: '2px',
                        borderRadius: '0px',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '4px 4px 0px #000',
                      }}
                    />
                    <Bar dataKey="employees" name="Employees" fill="#00D06C" stroke="#000000" strokeWidth={1.5} />
                    <Bar dataKey="interns" name="Interns" fill="#8B5CF6" stroke="#000000" strokeWidth={1.5} />
                    <Bar dataKey="contractors" name="Contractors" fill="#FFDE59" stroke="#000000" strokeWidth={1.5} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Worker Type Mix (4 Cols) */}
        <div className="lg:col-span-4 bg-white border-3 border-black shadow-neo flex flex-col justify-between overflow-hidden">
          <div>
            <div className="bg-[#FF6B9D] border-b-3 border-black px-4 py-2.5 flex items-center justify-between">
              <h3 className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-black">
                WORKFORCE COMPOSITION
              </h3>
              <span className="text-[10px] font-mono font-black bg-black text-white px-1.5 py-0.5">
                RATIO
              </span>
            </div>

            <div className="p-4 space-y-3 bg-[#FCFAF5]">
              <div className="flex items-center justify-between p-3 bg-white border-2 border-black shadow-neo-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-[#00D06C] border border-black" />
                  <span className="font-mono text-xs font-black text-black">Full-Time Staff</span>
                </div>
                <span className="font-mono text-lg font-black text-black">{metrics.activeEmployees}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white border-2 border-black shadow-neo-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-[#8B5CF6] border border-black" />
                  <span className="font-mono text-xs font-black text-black">Interns</span>
                </div>
                <span className="font-mono text-lg font-black text-black">{metrics.activeInterns}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white border-2 border-black shadow-neo-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-[#FFDE59] border border-black" />
                  <span className="font-mono text-xs font-black text-black">Contractors</span>
                </div>
                <span className="font-mono text-lg font-black text-black">{metrics.activeContractors}</span>
              </div>
            </div>
          </div>

          <div className="p-3 border-t-3 border-black bg-[#F2EBDC] flex items-center justify-between text-[10px] font-mono font-bold text-zinc-700">
            <span>NO PLACEHOLDER METRICS</span>
            <span className="text-black font-black bg-[#00D06C] px-1 border border-black">100% AUDITABLE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
