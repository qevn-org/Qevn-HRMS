import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  badgeText?: string;
  badgeVariant?: 'lime' | 'green' | 'violet' | 'purple' | 'cyan' | 'rose' | 'pink' | 'amber' | 'yellow' | 'neutral' | 'black' | 'white';
  icon?: React.ReactNode;
  accentColor?: 'lime' | 'green' | 'violet' | 'purple' | 'cyan' | 'rose' | 'pink' | 'amber' | 'yellow';
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
  accentColor = 'green',
  onClick,
  className,
}: MetricCardProps) {
  const headerColors = {
    lime: 'bg-[#00D06C] text-black',
    green: 'bg-[#00D06C] text-black',
    violet: 'bg-[#8B5CF6] text-white',
    purple: 'bg-[#8B5CF6] text-white',
    cyan: 'bg-[#38BDF8] text-black',
    rose: 'bg-[#FF4365] text-white',
    pink: 'bg-[#FF6B9D] text-black',
    amber: 'bg-[#FFDE59] text-black',
    yellow: 'bg-[#FFDE59] text-black',
  };

  const badgeColors = {
    lime: 'bg-[#00D06C] text-black border-black',
    green: 'bg-[#00D06C] text-black border-black',
    violet: 'bg-[#8B5CF6] text-white border-black',
    purple: 'bg-[#8B5CF6] text-white border-black',
    cyan: 'bg-[#38BDF8] text-black border-black',
    rose: 'bg-[#FF4365] text-white border-black',
    pink: 'bg-[#FF6B9D] text-black border-black',
    amber: 'bg-[#FFDE59] text-black border-black',
    yellow: 'bg-[#FFDE59] text-black border-black',
    neutral: 'bg-[#F2EBDC] text-black border-black',
    black: 'bg-black text-white border-black',
    white: 'bg-white text-black border-black',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative bg-white border-3 border-black shadow-neo transition-all duration-150 flex flex-col justify-between select-none overflow-hidden',
        onClick && 'cursor-pointer hover:shadow-neo-lg hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
        className
      )}
    >
      {/* Retro Window Titlebar */}
      <div className={cn('px-2.5 py-1.5 border-b-2 border-black flex items-center justify-between font-mono text-[11px] font-black uppercase tracking-wider', headerColors[accentColor])}>
        <div className="flex items-center gap-1.5 truncate">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="truncate">{label}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold">_</span>
          <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold">□</span>
          <span className="w-2.5 h-2.5 bg-white border border-black inline-block text-[7px] leading-none text-center font-bold">✕</span>
        </div>
      </div>

      {/* Main Metric Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between bg-[#FCFAF5]">
        <div className="flex items-start justify-between gap-2">
          {/* Big Punchy Number */}
          <div className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-black group-hover:text-[#00D06C] transition-colors">
            {value}
          </div>

          <div className="flex flex-col items-end gap-1">
            {badgeText && (
              <span className={cn('text-[10px] font-mono font-black uppercase px-1.5 py-0.5 border-2', badgeColors[badgeVariant])}>
                {badgeText}
              </span>
            )}
            {onClick && <ArrowUpRight className="w-4 h-4 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
          </div>
        </div>

        {/* Subtitle / Context */}
        {subValue && (
          <div className="mt-2.5 pt-2 border-t-2 border-black/10 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-zinc-700">{subValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}
