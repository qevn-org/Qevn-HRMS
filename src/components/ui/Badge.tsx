import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'lime' | 'green' | 'violet' | 'purple' | 'cyan' | 'rose' | 'pink' | 'amber' | 'yellow' | 'neutral' | 'outline' | 'black' | 'white';
  dot?: boolean;
}

export function Badge({ className, variant = 'neutral', dot = false, children, ...props }: BadgeProps) {
  const variants = {
    lime: 'bg-[#00D06C] text-black border-2 border-black shadow-[2px_2px_0px_#000]',
    green: 'bg-[#00D06C] text-black border-2 border-black shadow-[2px_2px_0px_#000]',
    violet: 'bg-[#8B5CF6] text-white border-2 border-black shadow-[2px_2px_0px_#000]',
    purple: 'bg-[#8B5CF6] text-white border-2 border-black shadow-[2px_2px_0px_#000]',
    cyan: 'bg-[#38BDF8] text-black border-2 border-black shadow-[2px_2px_0px_#000]',
    rose: 'bg-[#FF4365] text-white border-2 border-black shadow-[2px_2px_0px_#000]',
    pink: 'bg-[#FF6B9D] text-black border-2 border-black shadow-[2px_2px_0px_#000]',
    amber: 'bg-[#FFDE59] text-black border-2 border-black shadow-[2px_2px_0px_#000]',
    yellow: 'bg-[#FFDE59] text-black border-2 border-black shadow-[2px_2px_0px_#000]',
    black: 'bg-black text-white border-2 border-black shadow-[2px_2px_0px_#00D06C]',
    white: 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_#000]',
    neutral: 'bg-[#F2EBDC] text-black border-2 border-black shadow-[2px_2px_0px_#000]',
    outline: 'bg-transparent text-black border-2 border-black',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-[11px] font-black px-2 py-0.5 uppercase tracking-wider select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className="w-2 h-2 rounded-full bg-current inline-block" />}
      {children}
    </span>
  );
}
