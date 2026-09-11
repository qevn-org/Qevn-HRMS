import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'cyan' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-mono font-bold tracking-tight uppercase transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:translate-x-0 disabled:active:translate-y-0';

    const variants = {
      primary:
        'bg-[#CCFF00] text-black border-2 border-black shadow-neo hover:bg-[#b8e600] active:shadow-none hover:translate-x-[-1px] hover:translate-y-[-1px]',
      secondary:
        'bg-[#8B5CF6] text-white border-2 border-black shadow-neo hover:bg-[#7c3aed] active:shadow-none hover:translate-x-[-1px] hover:translate-y-[-1px]',
      cyan:
        'bg-[#06B6D4] text-black border-2 border-black shadow-neo hover:bg-[#0891b2] active:shadow-none hover:translate-x-[-1px] hover:translate-y-[-1px]',
      danger:
        'bg-[#F43F5E] text-white border-2 border-black shadow-neo hover:bg-[#e11d48] active:shadow-none hover:translate-x-[-1px] hover:translate-y-[-1px]',
      outline:
        'bg-transparent text-white border-2 border-zinc-700 hover:border-[#CCFF00] hover:text-[#CCFF00] active:border-white',
      ghost:
        'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/60 active:bg-zinc-800',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
      md: 'text-xs px-4 py-2 gap-2 h-10',
      lg: 'text-sm px-6 py-3 gap-2.5 h-12',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
