import React from 'react';
import { Volume2 } from 'lucide-react';
import { RunningTextConfig } from '../types';

interface RunningTextBarProps {
  config: RunningTextConfig;
}

export const RunningTextBar: React.FC<RunningTextBarProps> = ({ config }) => {
  if (!config.isEnabled || !config.text.trim()) {
    return null;
  }

  const themeClasses = {
    emerald: 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-emerald-100 border-b border-emerald-800',
    dark: 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-slate-100 border-b border-slate-800',
    gold: 'bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-100 border-b border-amber-800',
  }[config.theme];

  const badgeThemeClasses = {
    emerald: 'bg-emerald-800 text-emerald-200 border-emerald-700',
    dark: 'bg-slate-800 text-slate-200 border-slate-700',
    gold: 'bg-amber-800 text-amber-200 border-amber-700',
  }[config.theme];

  return (
    <div
      className={`w-full overflow-hidden text-xs py-1.5 px-3 flex items-center shadow-sm select-none no-print ${themeClasses}`}
      style={{ '--marquee-duration': `${Math.max(5, config.speedSeconds)}s`, backgroundColor: '#1b7652' } as React.CSSProperties}
    >
      <div className="flex items-center gap-1.5 shrink-0 z-10 pr-3 border-r border-white/10 font-semibold">
        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${badgeThemeClasses} flex items-center gap-1`}>
          <Volume2 className="w-3 h-3 animate-pulse" />
          Info
        </span>
      </div>

      <div className="relative overflow-hidden w-full flex items-center pl-3">
        <div className="animate-marquee whitespace-nowrap font-medium tracking-wide">
          <span className="inline-block px-4">{config.text}</span>
          <span className="inline-block px-4">{config.text}</span>
        </div>
      </div>
    </div>
  );
};
