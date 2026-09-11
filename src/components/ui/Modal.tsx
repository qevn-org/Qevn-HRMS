import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  headerColor?: 'green' | 'purple' | 'pink' | 'yellow' | 'black';
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  headerColor = 'green',
  children,
  footer,
  maxWidth = 'lg',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  const headerColors = {
    green: 'bg-[#00D06C] text-black',
    purple: 'bg-[#8B5CF6] text-white',
    pink: 'bg-[#FF6B9D] text-black',
    yellow: 'bg-[#FFDE59] text-black',
    black: 'bg-black text-white',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        className={cn(
          'relative w-full bg-[#FAF7EE] border-3 border-black shadow-neo-xl z-10 my-8 overflow-hidden text-black transition-all',
          maxWidthClasses[maxWidth]
        )}
      >
        {/* Retro Window Header */}
        <div className={cn('border-b-3 border-black px-4 py-2.5 flex items-center justify-between', headerColors[headerColor])}>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-black border border-white inline-block" />
            <div>
              <h3 className="font-mono text-sm sm:text-base font-black uppercase tracking-tight">
                {title}
              </h3>
              {subtitle && <p className="text-[11px] font-sans font-bold opacity-80">{subtitle}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              className="w-6 h-6 bg-white border-2 border-black flex items-center justify-center font-mono font-black text-xs text-black hover:bg-[#FF4365] hover:text-white transition-colors cursor-pointer"
              title="Close Window"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto bg-[#FAF7EE]">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="bg-[#F2EBDC] border-t-3 border-black px-5 py-3.5 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
