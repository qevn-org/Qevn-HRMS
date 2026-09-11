'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
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
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, availableProfiles, switchProfile } = useAuth();
  const [email, setEmail] = useState('dhruv@qevn.in');
  const [password, setPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your work email');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      toast.success(`Authenticated successfully as ${email}`);
      router.push('/dashboard');
    } else {
      toast.error(res.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleQuickMemberLogin = async (memberEmail: string, profileId: string) => {
    setIsSubmitting(true);
    switchProfile(profileId);
    const res = await login(memberEmail);
    setIsSubmitting(false);
    if (res.success) {
      toast.success(`Authenticated as ${memberEmail}`);
      router.push('/dashboard');
    }
  };

  const realTeamMembers = [
    {
      name: 'Dhruv Pathak',
      email: 'dhruv@qevn.in',
      role: 'Super Admin',
      desc: 'Full system control, settings, audit logs & org data',
      icon: <ShieldCheck className="w-5 h-5 text-black" />,
      color: 'bg-[#00D06C]',
      profileId: 'user-1',
    },
    {
      name: 'Sofi',
      email: 'sofi@qevn.in',
      role: 'HR Admin',
      desc: 'People directory, attendance audit, documents & onboarding',
      icon: <UserCheck className="w-5 h-5 text-white" />,
      color: 'bg-[#8B5CF6]',
      profileId: 'user-2',
    },
    {
      name: 'Naman',
      email: 'naman@qevn.in',
      role: 'Manager',
      desc: 'Direct reports team, leave approvals & milestone reviews',
      icon: <Briefcase className="w-5 h-5 text-black" />,
      color: 'bg-[#38BDF8]',
      profileId: 'user-3',
    },
    {
      name: 'Archana',
      email: 'archana@qevn.in',
      role: 'Employee',
      desc: 'Self-service profile, personal attendance & leave requests',
      icon: <User className="w-5 h-5 text-black" />,
      color: 'bg-[#FF6B9D]',
      profileId: 'user-5',
    },
    {
      name: 'Arbaaz',
      email: 'arbaaz@qevn.in',
      role: 'Executive Board',
      desc: 'Aggregated company reports, headcount & compliance radar',
      icon: <Eye className="w-5 h-5 text-black" />,
      color: 'bg-[#FFDE59]',
      profileId: 'user-4',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7EE] bg-notebook-grid flex flex-col justify-center items-center p-4 sm:p-6 select-none font-sans relative overflow-hidden">
      {/* Decorative Floating Stickers */}
      <div className="hidden lg:block absolute top-10 left-12 sticker-tag bg-[#8B5CF6] text-white border-3 border-black font-mono text-xs font-black px-4 py-2 shadow-neo -rotate-6">
        ★ ENTERPRISE HRMS
      </div>
      <div className="hidden lg:block absolute bottom-12 left-16 sticker-tag bg-[#00D06C] text-black border-3 border-black font-mono text-xs font-black px-4 py-2 shadow-neo rotate-3">
        ⚡ 100% SUPABASE RLS
      </div>
      <div className="hidden lg:block absolute top-16 right-16 sticker-tag bg-[#FFDE59] text-black border-3 border-black font-mono text-xs font-black px-4 py-2 shadow-neo rotate-6">
        MAXIMALIST EDITORIAL OS
      </div>
      <div className="hidden lg:block absolute bottom-16 right-12 sticker-tag bg-[#FF6B9D] text-black border-3 border-black font-mono text-xs font-black px-4 py-2 shadow-neo -rotate-3">
        IMMUTABLE AUDIT LOGS
      </div>

      <div className="w-full max-w-xl space-y-6 relative z-10">
        {/* Brand Header with Exact Black QEVN Logo on Neutral/Transparent Container */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-white border-3 border-black shadow-neo-lg rotate-[-1deg]">
            <Image
              src="/qevn-logo-black.png"
              alt="Qevn"
              width={160}
              height={45}
              priority
              className="h-10 w-auto object-contain"
            />
          </div>
          <div>
            <div className="inline-block bg-[#FFDE59] border-2 border-black px-3 py-0.5 font-mono text-xs font-black uppercase text-black tracking-wider shadow-neo-sm">
              PEOPLE OPERATIONS OPERATING SYSTEM
            </div>
          </div>
        </div>

        {/* 1-Click Authenticated Team Member Access */}
        <div className="bg-white border-3 border-black shadow-neo-xl overflow-hidden">
          <div className="bg-[#8B5CF6] text-white border-b-3 border-black px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF6B9D] border border-black inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#FFDE59] border border-black inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#00D06C] border border-black inline-block" />
              <h2 className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-white ml-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FFDE59]" />
                SELECT VERIFIED TEAM ACCOUNT
              </h2>
            </div>
            <span className="text-[10px] font-mono bg-[#FFDE59] text-black font-black px-2 py-0.5 border border-black shadow-neo-sm">
              1-CLICK LOGIN
            </span>
          </div>

          <div className="p-4 sm:p-5 space-y-2.5 bg-[#FAF7EE]/40">
            {realTeamMembers.map((item) => (
              <button
                key={item.email}
                type="button"
                onClick={() => handleQuickMemberLogin(item.email, item.profileId)}
                className="w-full flex items-center justify-between p-3 bg-white border-2 border-black hover:bg-[#FAF7EE] hover:shadow-neo transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 border-2 border-black ${item.color} shadow-neo-sm shrink-0`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-mono text-xs sm:text-sm font-black text-black group-hover:text-[#8B5CF6] flex items-center gap-2">
                      <span>{item.name}</span>
                      <span className="text-[10px] font-mono bg-black text-white px-1.5 py-0.2 border border-black">
                        {item.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-600 font-mono">{item.email}</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Standard Email / Password Form via Supabase */}
        <div className="bg-white border-3 border-black shadow-neo-lg overflow-hidden">
          <div className="bg-[#FAF7EE] border-b-2 border-black px-4 py-2 flex items-center justify-between">
            <h3 className="font-mono text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-black" />
              OR SIGN IN WITH SUPABASE CREDENTIALS
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
              placeholder="user@qevn.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="green"
              size="md"
              isLoading={isSubmitting}
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
            Session tokens persist securely with cryptographic JWT verification
          </div>
        </div>
      </div>
    </div>
  );
}
