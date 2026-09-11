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
        'border-3 border-dashed border-black p-8 sm:p-12 text-center flex flex-col items-center justify-center bg-white shadow-neo',
        className
      )}
    >
      {icon && (
        <div className="w-14 h-14 bg-[#FFDE59] border-2 border-black flex items-center justify-center text-black mb-4 shadow-neo-sm">
          {icon}
        </div>
      )}
      <h4 className="font-mono text-base font-black uppercase text-black tracking-wide">{title}</h4>
      <p className="text-xs text-zinc-600 mt-1 max-w-md font-sans font-medium">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
