import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#262636]', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all select-none border-b-2 whitespace-nowrap',
              isActive
                ? 'text-[#CCFF00] border-[#CCFF00] bg-[#CCFF00]/10 font-black'
                : 'text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900/50'
            )}
          >
            {tab.icon && <span className={cn(isActive ? 'text-[#CCFF00]' : 'text-zinc-500')}>{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-[10px] font-mono px-1.5 py-0.2 border',
                  isActive
                    ? 'bg-[#CCFF00] text-black border-black font-black'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
