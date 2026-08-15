import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, ArrowRight, RotateCw, X, Home, Shield, ShieldCheck, ShieldAlert,
  Search, Lock, Bookmark, History, Sparkles, Terminal, Sliders, Puzzle, ExternalLink,
  ChevronDown
} from 'lucide-react';
import { AmnBrowserSettings, Breadcrumb, InstalledExtension, SearchEngine, ShieldStats, SiteShieldConfig } from '../types';
import { SEARCH_ENGINES, breadcrumbToDisplay, parseBreadcrumb, resolveOmnibarInput } from '../utils/urlHelpers';
import { EthicsShieldPopover } from './EthicsShieldPopover';

interface AddressBarProps {
  currentUrl: string;
  breadcrumb: Breadcrumb;
  isLoading: boolean;
  loadingMessage: string;
  settings: AmnBrowserSettings;
  shieldStats: ShieldStats;
  siteShieldStats: { trackers: number; ads: number; ethics: number; cosmetic: number };
  extensions: InstalledExtension[];
  canGoBack: boolean;
  canGoForward: boolean;
  onNavigate: (type: 'url' | 'create' | 'edit', target: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onStop: () => void;
  onHome: () => void;
  onToggleShieldSite: (domain: string, config: Partial<SiteShieldConfig>) => void;
  onOpenSettings: () => void;
  onOpenDevTools: () => void;
  onOpenBookmarks: () => void;
  onOpenHistory: () => void;
  onOpenAiDrawer: () => void;
  onOpenExtensionManager: () => void;
}

export const AddressBar: React.FC<AddressBarProps> = ({
  currentUrl,
  breadcrumb,
  isLoading,
  loadingMessage,
  settings,
  shieldStats,
  siteShieldStats,
  extensions,
  canGoBack,
  canGoForward,
  onNavigate,
  onBack,
  onForward,
  onRefresh,
  onStop,
  onHome,
  onToggleShieldSite,
  onOpenSettings,
  onOpenDevTools,
  onOpenBookmarks,
  onOpenHistory,
  onOpenAiDrawer,
  onOpenExtensionManager,
}) => {
  const displayText = currentUrl.startsWith('amn://newtab')
    ? ''
    : currentUrl.startsWith('http') || currentUrl.startsWith('amn://')
      ? currentUrl
      : breadcrumbToDisplay(breadcrumb);

  const [inputVal, setInputVal] = useState(displayText);
  const [isFocused, setIsFocused] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);
  const [shieldOpen, setShieldOpen] = useState(false);
  const [engineMenuOpen, setEngineMenuOpen] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(settings.defaultSearchEngine);
  const [extensionPopupId, setExtensionPopupId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<HTMLDivElement>(null);

  const currentDomain = breadcrumb.sitename || (currentUrl.includes('://') ? currentUrl.split('://')[1].split('/')[0] : 'Web');
  const isInternal = currentUrl.startsWith('amn://');
  const isSiteShieldActive = (settings?.shield?.globalShieldEnabled ?? true) && (!settings?.shield?.siteExceptions?.[currentDomain] || settings?.shield?.siteExceptions?.[currentDomain]?.shieldEnabled);
  const totalBlockedOnSite = siteShieldStats.trackers + siteShieldStats.ads + siteShieldStats.ethics + siteShieldStats.cosmetic;

  useEffect(() => {
    if (!isFocused && !hasEdited) {
      setInputVal(displayText);
    }
  }, [displayText, isFocused, hasEdited]);

  useEffect(() => {
    if (isLoading) setHasEdited(false);
  }, [isLoading]);

  // Click outside listener for shield popover & search engine dropdown
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (shieldRef.current && !shieldRef.current.contains(e.target as Node)) {
        setShieldOpen(false);
      }
      if (engineRef.current && !engineRef.current.contains(e.target as Node)) {
        setEngineMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    const resolved = resolveOmnibarInput(trimmed, selectedEngine);
    onNavigate('url', resolved.url);
    setHasEdited(false);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (!hasEdited) {
      setInputVal(currentUrl.startsWith('amn://newtab') ? '' : currentUrl || displayText);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!hasEdited) {
      setInputVal(displayText);
    }
  };

  const currentEngine = SEARCH_ENGINES[selectedEngine] || SEARCH_ENGINES.duckduckgo;
  const enabledExtensionsWithPopups = extensions.filter(e => e.enabled && e.hasPopup);

  return (
    <div className="bg-gray-900 border-b border-gray-800 px-3 py-1.5 flex items-center gap-2 select-none font-sans text-gray-200">
      
      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className={`p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition ${!canGoBack ? 'opacity-30 cursor-not-allowed' : ''}`}
          title="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          onClick={onForward}
          disabled={!canGoForward}
          className={`p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition ${!canGoForward ? 'opacity-30 cursor-not-allowed' : ''}`}
          title="Forward"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={isLoading ? onStop : onRefresh}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          title={isLoading ? "Stop" : "Refresh"}
        >
          {isLoading ? <X className="w-4 h-4 text-rose-400" /> : <RotateCw className="w-4 h-4" />}
        </button>

        <button
          onClick={onHome}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          title="Home"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Omnibar & Shield Component */}
      <div className="flex-1 flex items-center relative min-w-0">
        <form onSubmit={handleSubmit} className="w-full flex items-center bg-gray-950/80 border border-gray-700/80 focus-within:border-emerald-500 rounded-xl px-2.5 py-1.5 transition shadow-inner">
          
          {/* Shield Status Button (Omnibar Left) */}
          <div className="relative" ref={shieldRef}>
            <button
              type="button"
              onClick={() => setShieldOpen(!shieldOpen)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold mr-2 transition ${isSiteShieldActive ? 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-700/40' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              title="Al-Haq Ethics Shield Status"
            >
              {isSiteShieldActive ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              )}
              {totalBlockedOnSite > 0 && (
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 px-1 rounded text-emerald-300">
                  {totalBlockedOnSite}
                </span>
              )}
            </button>

            {/* Ethics Shield Popover */}
            {shieldOpen && (
              <EthicsShieldPopover
                currentUrl={currentUrl}
                domain={currentDomain}
                settings={settings}
                shieldStats={shieldStats}
                siteStats={siteShieldStats}
                onUpdateSiteConfig={onToggleShieldSite}
                onOpenShieldSettings={onOpenSettings}
                onClose={() => setShieldOpen(false)}
              />
            )}
          </div>

          {/* HTTPS / Internal URL Indicator */}
          <div className="flex items-center text-gray-500 mr-2 flex-shrink-0">
            {isInternal ? (
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/50 px-1.5 py-0.5 rounded">amn://</span>
            ) : (
              <Lock className="w-3.5 h-3.5 text-emerald-400" title="Secure & Encrypted" />
            )}
          </div>

          {/* Address & Prompt Input */}
          <input
            ref={inputRef}
            type="text"
            value={isLoading && !isFocused && !inputVal ? loadingMessage : inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              setHasEdited(true);
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={`Search with ${currentEngine.name} or enter URL / prompt...`}
            className="flex-1 bg-transparent text-xs text-gray-100 placeholder-gray-500 focus:outline-none min-w-0"
            autoComplete="off"
            spellCheck={false}
          />

          {/* Search Engine Quick Selector (Omnibar Right) */}
          <div className="relative flex-shrink-0" ref={engineRef}>
            <button
              type="button"
              onClick={() => setEngineMenuOpen(!engineMenuOpen)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-gray-800 text-xs text-gray-400 hover:text-gray-200 transition"
              title={`Active Search Engine: ${currentEngine.name}`}
            >
              <span className="text-sm">{currentEngine.icon}</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </button>

            {engineMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 p-1.5 space-y-1">
                <div className="text-[10px] font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">
                  Private Search Engines
                </div>
                {(Object.keys(SEARCH_ENGINES) as SearchEngine[]).map((key) => {
                  const eng = SEARCH_ENGINES[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedEngine(key);
                        setEngineMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition ${selectedEngine === key ? 'bg-emerald-950 text-emerald-300 font-bold' : 'text-gray-300 hover:bg-gray-800'}`}
                    >
                      <span>{eng.icon}</span>
                      <span className="truncate">{eng.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Browser Tool Actions */}
      <div className="flex items-center gap-1">
        
        {/* Installed Extensions Popups */}
        {enabledExtensionsWithPopups.map((ext) => (
          <div key={ext.id} className="relative">
            <button
              onClick={() => setExtensionPopupId(extensionPopupId === ext.id ? null : ext.id)}
              className={`p-1.5 rounded-lg transition ${extensionPopupId === ext.id ? 'bg-sky-900/60 text-sky-300' : 'text-gray-400 hover:text-sky-300 hover:bg-gray-800'}`}
              title={ext.name}
            >
              <Puzzle className="w-4 h-4" />
            </button>

            {extensionPopupId === ext.id && ext.popupHtml && (
              <div className="absolute right-0 top-full mt-2 z-50 shadow-2xl border border-gray-700 rounded-xl overflow-hidden">
                <div dangerouslySetInnerHTML={{ __html: ext.popupHtml }} />
              </div>
            )}
          </div>
        ))}

        {/* AI Drawer Button */}
        <button
          onClick={onOpenAiDrawer}
          className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-950/40 hover:text-amber-300 transition"
          title="AI Assistant (BYOK)"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Bookmarks Drawer */}
        <button
          onClick={onOpenBookmarks}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          title="Bookmarks & History"
        >
          <Bookmark className="w-4 h-4" />
        </button>

        {/* DevTools */}
        <button
          onClick={onOpenDevTools}
          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-gray-800 transition"
          title="Developer Tools & Console"
        >
          <Terminal className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          title="Browser Settings & Al-Haq Shield"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
