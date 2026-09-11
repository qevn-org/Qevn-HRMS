import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  tag?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
  tag = 'ALL CLEAR',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-3 border-black p-8 sm:p-12 text-center flex flex-col items-center justify-center bg-white shadow-neo-lg relative overflow-hidden',
        className
      )}
    >
      {/* Decorative top corner sticker */}
      <div className="absolute top-3 right-3 bg-[#FFDE59] text-black border-2 border-black font-mono text-[10px] font-black px-2.5 py-0.5 shadow-neo-sm rotate-2">
        ★ {tag}
      </div>

      {icon ? (
        <div className="w-16 h-16 bg-[#FF6B9D] border-3 border-black flex items-center justify-center text-black mb-4 shadow-neo -rotate-2">
          {icon}
        </div>
      ) : (
        <div className="w-16 h-16 bg-[#00D06C] border-3 border-black flex items-center justify-center text-black mb-4 shadow-neo rotate-2">
          <CheckCircle2 className="w-8 h-8 text-black" />
        </div>
      )}

      <h4 className="font-mono text-base sm:text-lg font-black uppercase text-black tracking-tight">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-neutral-700 mt-1.5 max-w-md font-sans font-medium leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="green" size="sm" onClick={onAction} className="mt-5 font-black">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
