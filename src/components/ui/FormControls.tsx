import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="block font-mono text-xs font-bold uppercase tracking-wider text-zinc-300">
            {label}
            {props.required && <span className="text-[#F43F5E] ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-[#0A0A0E] border-2 border-[#262636] text-white px-3.5 py-2 font-mono text-sm placeholder:text-zinc-600 focus:outline-hidden focus:border-[#CCFF00] focus:shadow-neo-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-[#F43F5E] focus:border-[#F43F5E]' : '',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#F43F5E] font-mono">{error}</p>}
        {helperText && !error && <p className="text-xs text-zinc-500 font-sans">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 3, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="block font-mono text-xs font-bold uppercase tracking-wider text-zinc-300">
            {label}
            {props.required && <span className="text-[#F43F5E] ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          className={cn(
            'w-full bg-[#0A0A0E] border-2 border-[#262636] text-white p-3 font-mono text-sm placeholder:text-zinc-600 focus:outline-hidden focus:border-[#CCFF00] focus:shadow-neo-sm transition-all disabled:opacity-50',
            error ? 'border-[#F43F5E] focus:border-[#F43F5E]' : '',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#F43F5E] font-mono">{error}</p>}
        {helperText && !error && <p className="text-xs text-zinc-500 font-sans">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, options, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="block font-mono text-xs font-bold uppercase tracking-wider text-zinc-300">
            {label}
            {props.required && <span className="text-[#F43F5E] ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-[#0A0A0E] border-2 border-[#262636] text-white px-3.5 py-2 font-mono text-sm focus:outline-hidden focus:border-[#CCFF00] focus:shadow-neo-sm transition-all cursor-pointer',
            error ? 'border-[#F43F5E] focus:border-[#F43F5E]' : '',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#121218] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[#F43F5E] font-mono">{error}</p>}
        {helperText && !error && <p className="text-xs text-zinc-500 font-sans">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
