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

  const roleLogins: { role: RoleName; label: string; desc: string; icon: React.ReactNode; color: string; profileId: string }[] = [
    {
      role: 'super_admin',
      label: 'Super Admin',
      desc: 'Full system control, settings, audit logs & all data',
      icon: <ShieldCheck className="w-5 h-5 text-black" />,
      color: 'bg-[#CCFF00]',
      profileId: 'user-1',
    },
    {
      role: 'hr_admin',
      label: 'HR Admin (Rachel Adams)',
      desc: 'People, attendance corrections, documents & onboarding',
      icon: <UserCheck className="w-5 h-5 text-white" />,
      color: 'bg-[#8B5CF6]',
      profileId: 'user-2',
    },
    {
      role: 'manager',
      label: 'Manager (Maya Lin - VP Eng)',
      desc: 'Direct report team, leave approvals & reviews',
      icon: <Briefcase className="w-5 h-5 text-black" />,
      color: 'bg-[#06B6D4]',
      profileId: 'user-3',
    },
    {
      role: 'employee',
      label: 'Employee (Kaito Tanaka)',
      desc: 'Self-service profile, own attendance & leave requests',
      icon: <User className="w-5 h-5 text-white" />,
      color: 'bg-zinc-700',
      profileId: 'user-4',
    },
    {
      role: 'management_readonly',
      label: 'Executive Board',
      desc: 'High-level aggregated headcount and company reports',
      icon: <Eye className="w-5 h-5 text-black" />,
      color: 'bg-amber-400',
      profileId: 'user-5',
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090D] bg-grid-pattern flex flex-col justify-center items-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#CCFF00] border-2 border-black mx-auto flex items-center justify-center font-mono font-black text-black text-2xl shadow-neo">
            Q
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-black text-white tracking-tight">
            QEVN <span className="text-[#CCFF00]">//</span> HRMS
          </h1>
          <p className="text-xs text-zinc-400 font-mono tracking-wide uppercase">
            ENTERPRISE PEOPLE OPERATIONS OS
          </p>
        </div>

        {/* Quick Simulated Role Selection (Instant Demo & Testing Access) */}
        <div className="bg-[#121218] border-2 border-[#CCFF00] p-5 shadow-neo-lime space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#262636]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#CCFF00]" />
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                INSTANT DEMO ROLE LOGIN
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#CCFF00] font-bold">1-CLICK ACCESS</span>
          </div>

          <div className="space-y-2">
            {roleLogins.map((item) => (
              <button
                key={item.role}
                onClick={() => handleSimulatedRoleLogin(item.role, item.profileId)}
                className="w-full flex items-center justify-between p-3 bg-[#0D0D12] border-2 border-[#262636] hover:border-[#CCFF00] hover:shadow-neo transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 border-2 border-black ${item.color} shadow-neo-sm shrink-0`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-mono text-xs font-bold text-white group-hover:text-[#CCFF00]">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-sans">{item.desc}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#CCFF00] transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Standard Email / Password Form */}
        <div className="bg-[#121218] border-2 border-[#262636] p-5 shadow-neo space-y-4">
          <div className="pb-2 border-b border-[#262636]">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              OR SIGN IN WITH CREDENTIALS
            </h3>
          </div>

          <form onSubmit={handleStandardLogin} className="space-y-3 font-mono text-xs">
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
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              SIGN IN TO QEVN HRMS
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center font-mono text-[10px] text-zinc-500 space-y-1">
          <div>QEVN HRMS • SUPABASE POSTGRESQL + ROW LEVEL SECURITY</div>
          <div>All mutations logged to immutable compliance audit trail</div>
        </div>
      </div>
    </div>
  );
}
