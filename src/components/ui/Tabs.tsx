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
    <div className={cn('flex items-center gap-2 overflow-x-auto pb-1 border-b-3 border-black', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 font-mono text-xs font-black uppercase tracking-wider transition-all select-none border-2 border-black whitespace-nowrap cursor-pointer',
              isActive
                ? 'bg-[#00D06C] text-black shadow-neo-sm translate-y-[-2px]'
                : 'bg-white text-zinc-700 hover:bg-[#FAF7EE] hover:text-black'
            )}
          >
            {tab.icon && <span className={cn(isActive ? 'text-black' : 'text-zinc-600')}>{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-[10px] font-mono px-1.5 py-0.5 border border-black font-black',
                  isActive
                    ? 'bg-black text-white'
                    : 'bg-[#F2EBDC] text-black'
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
