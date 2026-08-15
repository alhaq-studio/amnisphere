import React from 'react';
import { Shield, ShieldCheck, ExternalLink, Globe, Lock, Code2 } from 'lucide-react';
import { ShieldStats } from '../types';

interface OuterFrameProps {
  children: React.ReactNode;
  shieldStats: ShieldStats;
  onOpenNewTab?: (url: string) => void;
}

export const OuterFrame: React.FC<OuterFrameProps> = ({ children, shieldStats, onOpenNewTab }) => {
  return (
    <div className="w-screen h-screen flex flex-col bg-gray-950 text-gray-200 overflow-hidden font-sans select-none">
      
      {/* Top Application Frame Header */}
      <header className="h-9 bg-gray-950 border-b border-gray-800/80 px-4 flex items-center justify-between text-xs text-gray-400">
        
        {/* Left: Window Dots & App Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 border border-rose-600/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 border border-amber-600/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 border border-emerald-600/40" />
          </div>

          <div className="flex items-center gap-2 font-medium">
            <span className="text-white font-bold tracking-tight flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              AmniSphere
            </span>
            <span className="text-[10px] text-gray-500 font-mono">v2.4.0 FOSS</span>
          </div>
        </div>

        {/* Center: Live Protection Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Al-Haq Ethics Shield Active</span>
          <span className="text-gray-500">·</span>
          <span className="font-mono">{shieldStats.totalBlocked.toLocaleString()} Filtered</span>
        </div>

        {/* Right: Al-Haq Studio Link & Zero-Telemetry Badge */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Zero Telemetry</span>
          </div>
          
          <button
            onClick={() => onOpenNewTab ? onOpenNewTab('https://alhaq.uk') : window.open('https://alhaq.uk', '_blank')}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold transition"
          >
            Al-Haq Studio
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* Main Browser Window */}
      <main className="flex-1 min-h-0 overflow-hidden relative">
        {children}
      </main>

    </div>
  );
};
