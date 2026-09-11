'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { RoleName } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/FormControls';
import { toast } from 'sonner';
import {
  ShieldCheck,
  UserCheck,
  Briefcase,
  User,
  Eye,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setActiveRole, availableProfiles, switchProfile } = useAuth();
  const [email, setEmail] = useState('admin@qevn.io');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Authenticated as Super Admin');
      router.push('/dashboard');
    }, 400);
  };

  const handleSimulatedRoleLogin = (role: RoleName, profileId: string) => {
    switchProfile(profileId);
    toast.success(`Authenticated with role: ${role.toUpperCase()}`);
    router.push('/dashboard');
  };

  const roleLogins: {
    role: RoleName;
    label: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
    profileId: string;
  }[] = [
    {
      role: 'super_admin',
      label: 'Super Admin',
      desc: 'Full system control, settings, audit logs & all org data',
      icon: <ShieldCheck className="w-5 h-5 text-black" />,
      color: 'bg-[#00D06C]',
      profileId: 'user-1',
    },
    {
      role: 'hr_admin',
      label: 'HR Admin (Rachel Adams)',
      desc: 'People directory, attendance audit, documents & onboarding',
      icon: <UserCheck className="w-5 h-5 text-white" />,
      color: 'bg-[#8B5CF6]',
      profileId: 'user-2',
    },
    {
      role: 'manager',
      label: 'Manager (Maya Lin - VP Eng)',
      desc: 'Direct reports team, leave approvals & milestone reviews',
      icon: <Briefcase className="w-5 h-5 text-black" />,
      color: 'bg-[#38BDF8]',
      profileId: 'user-3',
    },
    {
      role: 'employee',
      label: 'Employee (Kaito Tanaka)',
      desc: 'Self-service profile, personal attendance & leave requests',
      icon: <User className="w-5 h-5 text-black" />,
      color: 'bg-[#FF6B9D]',
      profileId: 'user-4',
    },
    {
      role: 'management_readonly',
      label: 'Executive Board',
      desc: 'High-level aggregated headcount & company compliance reports',
      icon: <Eye className="w-5 h-5 text-black" />,
      color: 'bg-[#FFDE59]',
      profileId: 'user-5',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7EE] bg-notebook-grid flex flex-col justify-center items-center p-4 sm:p-6 select-none font-sans relative overflow-hidden">
      {/* Decorative Floating Stickers */}
      <div className="hidden lg:block absolute top-12 left-12 sticker-tag bg-[#8B5CF6] text-white border-3 border-black font-mono text-sm font-black px-4 py-2 shadow-neo -rotate-6">
        ★ ENTERPRISE GRADE
      </div>
      <div className="hidden lg:block absolute bottom-12 left-16 sticker-tag bg-[#00D06C] text-black border-3 border-black font-mono text-sm font-black px-4 py-2 shadow-neo rotate-3">
        ⚡ 100% SUPABASE RLS
      </div>
      <div className="hidden lg:block absolute top-16 right-16 sticker-tag bg-[#FFDE59] text-black border-3 border-black font-mono text-sm font-black px-4 py-2 shadow-neo 6 rotate-6">
        BEYOND MINIMALISM
      </div>
      <div className="hidden lg:block absolute bottom-16 right-12 sticker-tag bg-[#FF6B9D] text-black border-3 border-black font-mono text-sm font-black px-4 py-2 shadow-neo -rotate-3">
        IMMUTABLE AUDIT LOGS
      </div>

      <div className="w-full max-w-xl space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00D06C] border-3 border-black font-mono font-black text-black text-3xl shadow-neo-lg rotate-[-2deg]">
            Q
          </div>
          <h1 className="font-mono text-3xl sm:text-4xl font-black text-black tracking-tight">
            QEVN <span className="text-[#8B5CF6]">//</span> HRMS
          </h1>
          <div className="inline-block bg-[#FFDE59] border-2 border-black px-3 py-0.5 font-mono text-xs font-black uppercase text-black tracking-wider shadow-neo-sm">
            PEOPLE OPERATIONS OPERATING SYSTEM
          </div>
        </div>

        {/* Quick Simulated Role Selection (Instant Demo & Testing Access) */}
        <div className="bg-white border-3 border-black shadow-neo-xl overflow-hidden">
          <div className="bg-[#8B5CF6] text-white border-b-3 border-black px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF6B9D] border border-black inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#FFDE59] border border-black inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#00D06C] border border-black inline-block" />
              <h2 className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-white ml-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FFDE59]" />
                INSTANT DEMO ROLE LOGIN
              </h2>
            </div>
            <span className="text-[10px] font-mono bg-[#FFDE59] text-black font-black px-2 py-0.5 border border-black shadow-neo-sm">
              1-CLICK ACCESS
            </span>
          </div>

          <div className="p-5 space-y-3 bg-[#FAF7EE]/40">
            {roleLogins.map((item) => (
              <button
                key={item.role}
                onClick={() => handleSimulatedRoleLogin(item.role, item.profileId)}
                className="w-full flex items-center justify-between p-3.5 bg-white border-2 border-black hover:bg-[#FAF7EE] hover:shadow-neo transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 border-2 border-black ${item.color} shadow-neo-sm shrink-0`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-mono text-xs sm:text-sm font-black text-black group-hover:text-[#8B5CF6]">
                      {item.label}
                    </div>
                    <div className="text-xs text-neutral-600 font-medium">{item.desc}</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* Standard Email / Password Form */}
        <div className="bg-white border-3 border-black shadow-neo-lg overflow-hidden">
          <div className="bg-[#FAF7EE] border-b-2 border-black px-4 py-2 flex items-center justify-between">
            <h3 className="font-mono text-xs font-black uppercase tracking-wider text-black">
              OR SIGN IN WITH CREDENTIALS
            </h3>
            <div className="flex items-center gap-1 font-mono text-xs font-black">
              <span>_</span>
              <span>□</span>
              <span>✕</span>
            </div>
          </div>

          <form onSubmit={handleStandardLogin} className="p-5 space-y-4 font-mono text-xs">
            <Input
              label="Work Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="green"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2 font-black py-3 text-sm"
            >
              SIGN IN TO QEVN HRMS →
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center font-mono text-xs font-bold text-neutral-700 space-y-1">
          <div>QEVN HRMS • SUPABASE POSTGRESQL + ROW LEVEL SECURITY</div>
          <div className="text-[11px] text-neutral-500 font-medium">
            All system mutations are logged to the immutable compliance audit trail
          </div>
        </div>
      </div>
    </div>
  );
}
