import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'green' | 'purple' | 'pink' | 'yellow' | 'cyan' | 'black' | 'white' | 'danger' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-mono font-black tracking-wider uppercase transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none';

    const variants = {
      primary:
        'bg-[#00D06C] text-black border-2 border-black shadow-neo hover:bg-[#05DF72] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000]',
      green:
        'bg-[#00D06C] text-black border-2 border-black shadow-neo hover:bg-[#05DF72] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000]',
      secondary:
        'bg-[#8B5CF6] text-white border-2 border-black shadow-neo hover:bg-[#7C3AED] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000]',
      purple:
        'bg-[#8B5CF6] text-white border-2 border-black shadow-neo hover:bg-[#7C3AED] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000]',
      pink:
        'bg-[#FF6B9D] text-black border-2 border-black shadow-neo hover:bg-[#FF4D8D] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000]',
      yellow:
        'bg-[#FFDE59] text-black border-2 border-black shadow-neo hover:bg-[#FFD026] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000]',
      cyan:
        'bg-[#38BDF8] text-black border-2 border-black shadow-neo hover:bg-[#0284C7] hover:text-white hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000]',
      black:
        'bg-black text-white border-2 border-black shadow-[4px_4px_0px_#00D06C] hover:bg-zinc-900 hover:translate-x-[-1px] hover:translate-y-[-1px]',
      white:
        'bg-white text-black border-2 border-black shadow-neo hover:bg-[#F5F0E1] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000]',
      danger:
        'bg-[#FF4365] text-white border-2 border-black shadow-neo hover:bg-[#E02447] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000]',
      outline:
        'bg-white text-black border-2 border-black hover:bg-[#00D06C] hover:text-black shadow-neo-sm',
      ghost:
        'bg-transparent text-black hover:bg-black/10 active:bg-black/20 border-2 border-transparent hover:border-black',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
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
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
