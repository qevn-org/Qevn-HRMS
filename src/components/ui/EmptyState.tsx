import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-2 border-dashed border-[#262636] p-8 sm:p-12 text-center flex flex-col items-center justify-center bg-[#121218]/40',
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-none bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[#CCFF00] mb-4 shadow-neo-sm">
          {icon}
        </div>
      )}
      <h4 className="font-mono text-base font-bold uppercase text-white tracking-wide">{title}</h4>
      <p className="text-xs text-zinc-400 mt-1 max-w-md">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
