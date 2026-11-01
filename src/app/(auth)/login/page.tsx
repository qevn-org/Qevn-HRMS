'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/FormControls';
import { toast } from 'sonner';
import { KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Enter your work email and password');
      return;
    }

    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      router.replace('/dashboard');
      router.refresh();
    } else {
      setPassword('');
      toast.error(res.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] bg-notebook-grid flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md space-y-6">
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
              PEOPLE OPERATIONS
            </div>
          </div>
        </div>

        <div className="bg-white border-3 border-black shadow-neo-lg overflow-hidden">
          <div className="bg-[#FAF7EE] border-b-2 border-black px-4 py-2">
            <h1 className="font-mono text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              SIGN IN
            </h1>
          </div>

          <form onSubmit={handleLogin} className="p-5 space-y-4 font-mono text-xs" autoComplete="on">
            <Input
              label="Work Email"
              type="email"
              name="email"
              autoComplete="username"
              placeholder="name@qevn.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="green"
              size="md"
              isLoading={isSubmitting}
              className="w-full mt-2 font-black py-3 text-sm"
            >
              SIGN IN →
            </Button>
          </form>
        </div>

        <p className="text-center font-mono text-[11px] text-neutral-500">
          Access is by invitation only. Contact an administrator if you need an account.
        </p>
      </div>
    </div>
  );
}
