import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'lime' | 'violet' | 'cyan' | 'rose' | 'amber' | 'neutral' | 'outline';
  dot?: boolean;
}

export function Badge({ className, variant = 'neutral', dot = false, children, ...props }: BadgeProps) {
  const variants = {
    lime: 'bg-[#CCFF00] text-black border-black shadow-neo-sm',
    violet: 'bg-[#8B5CF6] text-white border-black shadow-neo-sm',
    cyan: 'bg-[#06B6D4] text-black border-black shadow-neo-sm',
    rose: 'bg-[#F43F5E] text-white border-black shadow-neo-sm',
    amber: 'bg-[#F59E0B] text-black border-black shadow-neo-sm',
    neutral: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    outline: 'bg-transparent text-zinc-300 border-zinc-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-[11px] font-bold px-2 py-0.5 uppercase border tracking-wider select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
