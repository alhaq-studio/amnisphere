import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, CheckCircle2, Sliders, ExternalLink } from 'lucide-react';
import { AmnBrowserSettings, ShieldStats, SiteShieldConfig } from '../types';

interface EthicsShieldPopoverProps {
  currentUrl: string;
  domain: string;
  settings: AmnBrowserSettings;
  shieldStats: ShieldStats;
  siteStats: {
    trackers: number;
    ads: number;
    ethics: number;
    cosmetic: number;
  };
  onUpdateSiteConfig: (domain: string, config: Partial<SiteShieldConfig>) => void;
  onOpenShieldSettings: () => void;
  onClose: () => void;
}

export const EthicsShieldPopover: React.FC<EthicsShieldPopoverProps> = ({
  currentUrl,
  domain,
  settings,
  shieldStats,
  siteStats,
  onUpdateSiteConfig,
  onOpenShieldSettings,
  onClose,
}) => {
  const isGlobalEnabled = settings?.shield?.globalShieldEnabled ?? true;
  const siteConfig = settings?.shield?.siteExceptions?.[domain] || {
    domain,
    shieldEnabled: true,
    allowScripts: true,
    blockAdult: settings?.shield?.blockAdultAndNsfw ?? true,
    blockGambling: settings?.shield?.blockGamblingAndBetting ?? true,
    blockTrackers: settings?.shield?.blockTrackersAndTelemetry ?? true,
    blockAds: settings?.shield?.blockInvasiveAds ?? true,
  };

  const isSiteShieldActive = isGlobalEnabled && siteConfig.shieldEnabled;
  const totalSiteBlocked = siteStats.trackers + siteStats.ads + siteStats.ethics + siteStats.cosmetic;

  const handleToggleSiteShield = () => {
    onUpdateSiteConfig(domain, { shieldEnabled: !siteConfig.shieldEnabled });
  };

  return (
    <div className="absolute top-full left-0 mt-2 w-80 bg-gray-900 border border-gray-700/80 rounded-xl shadow-2xl z-50 overflow-hidden text-gray-100 font-sans">
      {/* Header Banner */}
      <div className={`p-4 ${isSiteShieldActive ? 'bg-emerald-950/80 border-b border-emerald-800/60' : 'bg-gray-800 border-b border-gray-700'}`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {isSiteShieldActive ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            )}
            <span className="font-semibold text-sm tracking-tight">
              Al-Haq Ethics Shield
            </span>
          </div>
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isSiteShieldActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
            {isSiteShieldActive ? 'Protected' : 'Paused'}
          </span>
        </div>
        <p className="text-xs text-gray-400 truncate">
          {domain || 'AmniSphere Internal Environment'}
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between p-2.5 bg-gray-950/70 border border-gray-800 rounded-lg">
          <div>
            <div className="text-xs text-gray-400">Shields for this site</div>
            <div className="text-xs font-semibold text-gray-200">
              {isSiteShieldActive ? 'Full Ethical Protection Active' : 'Shields disabled for domain'}
            </div>
          </div>
          <button
            onClick={handleToggleSiteShield}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${isSiteShieldActive ? 'bg-emerald-600 justify-end' : 'bg-gray-700 justify-start'}`}
            title="Toggle shield for this site"
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-md transform" />
          </button>
        </div>

        {/* Breakdown for Current Page */}
        <div className="bg-gray-950/40 border border-gray-800/80 rounded-lg p-3 space-y-2">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            Blocked on this page ({totalSiteBlocked})
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-1.5 bg-gray-900/90 rounded border border-gray-800">
              <span className="text-gray-400">Trackers</span>
              <span className="font-semibold text-emerald-400">{siteStats.trackers}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-gray-900/90 rounded border border-gray-800">
              <span className="text-gray-400">Invasive Ads</span>
              <span className="font-semibold text-emerald-400">{siteStats.ads}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-gray-900/90 rounded border border-gray-800">
              <span className="text-gray-400">Ethical Violations</span>
              <span className="font-semibold text-emerald-400">{siteStats.ethics}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-gray-900/90 rounded border border-gray-800">
              <span className="text-gray-400">Cosmetic Hides</span>
              <span className="font-semibold text-emerald-400">{siteStats.cosmetic}</span>
            </div>
          </div>
        </div>

        {/* Global Lifetime Metrics */}
        <div className="text-[11px] text-gray-400 bg-gray-950/30 p-2 rounded border border-gray-800/50 flex justify-between">
          <span>Total Threats Blocked:</span>
          <span className="font-mono font-medium text-gray-300">{shieldStats.totalBlocked.toLocaleString()} items</span>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="px-4 py-2.5 bg-gray-950/90 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
        <button
          onClick={() => {
            onClose();
            onOpenShieldSettings();
          }}
          className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition"
        >
          <Sliders className="w-3.5 h-3.5" />
          Shield Settings
        </button>
        <a
          href="https://alhaq.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-gray-300 transition"
        >
          Al-Haq Studio
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
