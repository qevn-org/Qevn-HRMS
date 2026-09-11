import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  badgeText?: string;
  badgeVariant?: 'lime' | 'violet' | 'cyan' | 'rose' | 'amber' | 'neutral';
  icon?: React.ReactNode;
  accentColor?: 'lime' | 'violet' | 'cyan' | 'rose' | 'amber';
  onClick?: () => void;
  className?: string;
}

export function MetricCard({
  label,
  value,
  subValue,
  badgeText,
  badgeVariant = 'lime',
  icon,
  accentColor = 'lime',
  onClick,
  className,
}: MetricCardProps) {
  const accentBorders = {
    lime: 'hover:border-[#CCFF00] hover:shadow-neo-lime',
    violet: 'hover:border-[#8B5CF6] hover:shadow-neo-violet',
    cyan: 'hover:border-[#06B6D4] hover:shadow-neo-cyan',
    rose: 'hover:border-[#F43F5E] hover:shadow-neo-rose',
    amber: 'hover:border-[#F59E0B] hover:shadow-neo-amber',
  };

  const badgeColors = {
    lime: 'bg-[#CCFF00] text-black border-black',
    violet: 'bg-[#8B5CF6] text-white border-black',
    cyan: 'bg-[#06B6D4] text-black border-black',
    rose: 'bg-[#F43F5E] text-white border-black',
    amber: 'bg-[#F59E0B] text-black border-black',
    neutral: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative bg-[#121218] border-2 border-[#262636] p-4 transition-all duration-150 shadow-neo flex flex-col justify-between select-none',
        onClick && 'cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
        accentBorders[accentColor],
        className
      )}
    >
      {/* Top row: Label + Icon / Link */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          {badgeText && (
            <span className={cn('text-[10px] font-mono font-black uppercase px-1.5 py-0.5 border', badgeColors[badgeVariant])}>
              {badgeText}
            </span>
          )}
          {icon && <div className="text-zinc-400 group-hover:text-white transition-colors">{icon}</div>}
          {onClick && <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#CCFF00] transition-colors" />}
        </div>
      </div>

      {/* Big Value */}
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-3xl sm:text-4xl font-black tracking-tighter text-white group-hover:text-[#CCFF00] transition-colors">
          {value}
        </span>
      </div>

      {/* Subtitle */}
      {subValue && (
        <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between">
          <span className="text-xs text-zinc-400 font-sans">{subValue}</span>
        </div>
      )}
    </div>
  );
}
