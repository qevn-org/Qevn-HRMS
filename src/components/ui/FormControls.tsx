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
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={id} className="block font-mono text-xs font-black uppercase tracking-wider text-black">
            {label}
            {props.required && <span className="text-[#FF4365] ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-white border-2 border-black text-black px-3.5 py-2 font-mono text-sm placeholder:text-zinc-500 focus:outline-hidden focus:bg-[#FFFDF5] focus:shadow-neo-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_#000]',
            error ? 'border-[#FF4365] bg-red-50 focus:border-[#FF4365]' : '',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#FF4365] font-mono font-bold">{error}</p>}
        {helperText && !error && <p className="text-xs text-zinc-600 font-sans font-medium">{helperText}</p>}
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
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={id} className="block font-mono text-xs font-black uppercase tracking-wider text-black">
            {label}
            {props.required && <span className="text-[#FF4365] ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          className={cn(
            'w-full bg-white border-2 border-black text-black p-3 font-mono text-sm placeholder:text-zinc-500 focus:outline-hidden focus:bg-[#FFFDF5] focus:shadow-neo-sm transition-all disabled:opacity-50 shadow-[2px_2px_0px_#000]',
            error ? 'border-[#FF4365] bg-red-50 focus:border-[#FF4365]' : '',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#FF4365] font-mono font-bold">{error}</p>}
        {helperText && !error && <p className="text-xs text-zinc-600 font-sans font-medium">{helperText}</p>}
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
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={id} className="block font-mono text-xs font-black uppercase tracking-wider text-black">
            {label}
            {props.required && <span className="text-[#FF4365] ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-white border-2 border-black text-black px-3.5 py-2 font-mono text-sm focus:outline-hidden focus:bg-[#FFFDF5] focus:shadow-neo-sm transition-all cursor-pointer shadow-[2px_2px_0px_#000]',
            error ? 'border-[#FF4365] bg-red-50 focus:border-[#FF4365]' : '',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-black">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[#FF4365] font-mono font-bold">{error}</p>}
        {helperText && !error && <p className="text-xs text-zinc-600 font-sans font-medium">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
