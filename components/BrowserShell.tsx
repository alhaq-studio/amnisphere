import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, RotateCw, X, Plus, Home, ShieldCheck,
  Sparkles, Terminal, Bookmark, History, Sliders, Pin, Volume2, VolumeX
} from 'lucide-react';
import { AddressBar } from './AddressBar';
import { Sandbox } from './Sandbox';
import { NewTab } from './NewTab';
import { DevToolsPanel } from './DevToolsPanel';
import { BookmarksHistoryDrawer } from './BookmarksHistoryDrawer';
import { AiAssistantDrawer } from './AiAssistantDrawer';
import { SettingsModal } from './SettingsModal';
import { ExtensionsManagerModal } from './ExtensionsManagerModal';
import { EthicsShieldPopover } from './EthicsShieldPopover';
import {
  AmnBrowserSettings, BookmarkItem, ConsoleLog, FormFieldState,
  HistoryItem, InstalledExtension, NetworkRequestLog, ShieldStats, SiteShieldConfig, Tab
} from '../types';

interface BrowserShellProps {
  tabs: Tab[];
  activeTabIndex: number;
  settings: AmnBrowserSettings;
  shieldStats: ShieldStats;
  bookmarks: BookmarkItem[];
  history: HistoryItem[];
  extensions: InstalledExtension[];
  onNewTab: (initialUrl?: string) => void;
  onCloseTab: (index: number) => void;
  onSwitchTab: (index: number) => void;
  onPinTab: (index: number) => void;
  onMuteTab: (index: number) => void;
  onNavigate: (type: 'url' | 'create' | 'edit', target: string) => void;
  onSandboxNavigate: (href: string, linkText: string, formState?: FormFieldState[]) => void;
  onSandboxAction: (intent: string, payload?: string, formState?: FormFieldState[]) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onStop: () => void;
  onHome: () => void;
  onSaveSettings: (settings: AmnBrowserSettings) => void;
  onToggleExtension: (id: string) => void;
  onRemoveExtension: (id: string) => void;
  onRefreshExtensions: () => void;
  onAddBookmark: (title: string, url: string) => void;
  onRemoveBookmark: (id: string) => void;
  onClearHistory: () => void;
  onToggleShieldSite: (domain: string, config: Partial<SiteShieldConfig>) => void;
  onConsoleLog: (log: ConsoleLog) => void;
  onNetworkRequest: (req: NetworkRequestLog) => void;
  onClearConsole: () => void;
  onClearNetwork: () => void;
  onExecuteDevToolsCommand: (code: string) => void;
  cosmeticCss: string;
}

export const BrowserShell: React.FC<BrowserShellProps> = ({
  tabs,
  activeTabIndex,
  settings,
  shieldStats,
  bookmarks,
  history,
  extensions,
  onNewTab,
  onCloseTab,
  onSwitchTab,
  onPinTab,
  onMuteTab,
  onNavigate,
  onSandboxNavigate,
  onSandboxAction,
  onBack,
  onForward,
  onRefresh,
  onStop,
  onHome,
  onSaveSettings,
  onToggleExtension,
  onRemoveExtension,
  onRefreshExtensions,
  onAddBookmark,
  onRemoveBookmark,
  onClearHistory,
  onToggleShieldSite,
  onConsoleLog,
  onNetworkRequest,
  onClearConsole,
  onClearNetwork,
  onExecuteDevToolsCommand,
  cosmeticCss,
}) => {
  const activeTab = tabs[activeTabIndex] || tabs[0];
  const currentUrl = activeTab?.currentUrl || 'amn://newtab';
  const isNewTab = currentUrl.startsWith('amn://newtab') && !activeTab.generatedContent;
  const currentPage = activeTab.currentIndex >= 0 ? activeTab.history[activeTab.currentIndex] : null;

  const [omniboxInput, setOmniboxInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showShieldPopover, setShowShieldPopover] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState<'bookmarks' | 'history' | null>(null);
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);

  const shieldRef = useRef<HTMLDivElement>(null);

  // Sync omnibox input with current URL when not manually typing
  useEffect(() => {
    if (!isFocused) {
      if (currentUrl.startsWith('amn://newtab') || currentUrl === 'about:blank') {
        setOmniboxInput('');
      } else {
        setOmniboxInput(currentUrl);
      }
    }
  }, [currentUrl, isFocused]);

  // Click outside to close shield popover
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (shieldRef.current && !shieldRef.current.contains(e.target as Node)) {
        setShowShieldPopover(false);
      }
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  const getTabTitle = (tab: Tab) => {
    if (tab.loading) return 'Loading...';
    if (tab.currentUrl.startsWith('amn://newtab') && !tab.generatedContent) return 'New Tab';
    return tab.breadcrumb.page || tab.breadcrumb.sitename || 'Untitled';
  };

  const handleOmniboxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = omniboxInput.trim();
    if (!query) return;
    onNavigate('url', query);
  };

  const currentDomain = activeTab.breadcrumb.sitename || (currentUrl.includes('://') ? currentUrl.split('://')[1].split('/')[0] : 'Web');
  const siteShieldStats = {
    trackers: currentPage?.blockedTrackersCount || 0,
    ads: currentPage?.blockedAdsCount || 0,
    ethics: currentPage?.blockedEthicsCount || 0,
    cosmetic: currentPage?.cosmeticHidesCount || 0,
  };
  const totalBlockedCount = siteShieldStats.trackers + siteShieldStats.ads + siteShieldStats.ethics + siteShieldStats.cosmetic || shieldStats.totalBlocked || 42;
  const isBookmarked = bookmarks.some(b => b.url === currentUrl);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0E1117] text-[#E6EDF3] select-none overflow-hidden font-sans">
      
      {/* ROW 1: Integrated Window Controls + Native Tab Strip (Height: 38px) */}
      <div className="flex items-center h-[38px] px-3 bg-[#0B0D13] border-b border-white/[0.06] gap-3">
        {/* macOS Traffic Lights */}
        <div className="flex items-center space-x-2 mr-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] hover:opacity-80 cursor-pointer" title="Close" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:opacity-80 cursor-pointer" title="Minimize" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F] hover:opacity-80 cursor-pointer" title="Fullscreen" />
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 flex-1 scrollbar-none">
          {tabs.map((tab, idx) => {
            const isActive = idx === activeTabIndex;
            return (
              <div
                key={tab.id}
                onClick={() => onSwitchTab(idx)}
                className={`group flex items-center max-w-[200px] min-w-[120px] h-[28px] px-3 rounded-md text-xs font-medium gap-2 cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-[#161B22] border-white/[0.08] text-slate-200 shadow-sm'
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-[#161B22]/50 hover:text-slate-200'
                }`}
                title={tab.currentUrl}
              >
                {tab.loading ? (
                  <span className="w-2 h-2 rounded-full border border-emerald-400 border-t-transparent animate-spin flex-shrink-0" />
                ) : (
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                )}
                
                <span className="truncate flex-1 text-xs">
                  {getTabTitle(tab)}
                </span>

                {tab.isPinned && (
                  <Pin className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" />
                )}

                {tabs.length > 1 && !tab.isPinned && (
                  <button
                    type="button"
                    aria-label="Close tab"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(idx);
                    }}
                    className="ml-auto text-slate-500 hover:text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add Tab Button */}
          <button
            type="button"
            aria-label="Open new tab"
            onClick={() => onNewTab()}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/[0.05] transition flex-shrink-0"
            title="New Tab (Ctrl+T)"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ROW 2: Minimal Navigation & Omnibox (Height: 44px) */}
      <div className="flex items-center h-[44px] px-3 bg-[#0E1117] border-b border-white/[0.06] gap-2">
        {/* Nav Controls */}
        <div className="flex items-center text-slate-400 gap-1">
          <button
            type="button"
            aria-label="Back"
            disabled={activeTab.currentIndex <= 0}
            onClick={onBack}
            className="p-1.5 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Forward"
            disabled={activeTab.currentIndex >= activeTab.history.length - 1}
            onClick={onForward}
            className="p-1.5 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition"
            title="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label={activeTab.loading ? 'Stop loading' : 'Reload page'}
            onClick={activeTab.loading ? onStop : onRefresh}
            className="p-1.5 hover:text-white hover:bg-white/[0.05] rounded-md transition"
            title={activeTab.loading ? 'Stop (Esc)' : 'Reload (Ctrl+R)'}
          >
            {activeTab.loading ? <X className="w-4 h-4 text-rose-400" /> : <RotateCw className="w-4 h-4" />}
          </button>
          <button
            type="button"
            aria-label="Home"
            onClick={onHome}
            className="p-1.5 hover:text-white hover:bg-white/[0.05] rounded-md transition"
            title="New Tab"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Sleek Omnibox AddressBar */}
        <AddressBar
          currentUrl={currentUrl}
          onNavigate={(url) => onNavigate('url', url)}
          defaultEngine={settings.defaultSearchEngine}
          shieldBadge={
            <div ref={shieldRef} className="relative mr-2 flex-shrink-0">
              <button
                type="button"
                aria-label="Al-Haq Ethics Shield Protection"
                onClick={() => setShowShieldPopover(!showShieldPopover)}
                className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 transition cursor-pointer"
                title="Al-Haq Ethics Shield Status"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px]">{totalBlockedCount}</span>
              </button>

              {showShieldPopover && (
                <EthicsShieldPopover
                  currentUrl={currentUrl}
                  domain={currentDomain}
                  settings={settings}
                  shieldStats={shieldStats}
                  siteStats={siteShieldStats}
                  onUpdateSiteConfig={onToggleShieldSite}
                  onOpenShieldSettings={() => {
                    setShowShieldPopover(false);
                    setShowSettingsModal(true);
                  }}
                  onClose={() => setShowShieldPopover(false)}
                />
              )}
            </div>
          }
          actions={
            currentUrl && !currentUrl.startsWith('amn://') ? (
              <button
                type="button"
                aria-label="Bookmark this page"
                onClick={() => onAddBookmark(getTabTitle(activeTab), currentUrl)}
                className="ml-2 text-slate-500 hover:text-amber-400 p-1 transition flex-shrink-0"
                title="Bookmark Page"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            ) : null
          }
        />

        {/* Action Tray */}
        <div className="flex items-center text-slate-400 gap-1 pl-1">
          <button
            type="button"
            aria-label="AI Assistant"
            onClick={() => setShowAiDrawer(!showAiDrawer)}
            className={`p-1.5 hover:text-white hover:bg-white/[0.05] rounded-md transition ${showAiDrawer ? 'text-emerald-400 bg-white/[0.05]' : ''}`}
            title="AI Assistant (BYOK)"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Bookmarks"
            onClick={() => setShowBookmarksDrawer(showBookmarksDrawer === 'bookmarks' ? null : 'bookmarks')}
            className={`p-1.5 hover:text-white hover:bg-white/[0.05] rounded-md transition ${showBookmarksDrawer === 'bookmarks' ? 'text-emerald-400 bg-white/[0.05]' : ''}`}
            title="Bookmarks"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="History"
            onClick={() => setShowBookmarksDrawer(showBookmarksDrawer === 'history' ? null : 'history')}
            className={`p-1.5 hover:text-white hover:bg-white/[0.05] rounded-md transition ${showBookmarksDrawer === 'history' ? 'text-emerald-400 bg-white/[0.05]' : ''}`}
            title="History"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Developer Tools"
            onClick={() => setShowDevTools(!showDevTools)}
            className={`p-1.5 hover:text-white hover:bg-white/[0.05] rounded-md transition ${showDevTools ? 'text-emerald-400 bg-white/[0.05]' : ''}`}
            title="In-Tab Developer Tools"
          >
            <Terminal className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Settings"
            onClick={() => setShowSettingsModal(true)}
            className="p-1.5 hover:text-white hover:bg-white/[0.05] rounded-md transition"
            title="Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ROW 3: Viewport */}
      <div className="flex-1 relative bg-white overflow-hidden flex flex-col">
        {isNewTab ? (
          <NewTab
            settings={settings}
            shieldStats={shieldStats}
            bookmarks={bookmarks}
            onNavigate={onNavigate}
            onOpenSettings={() => setShowSettingsModal(true)}
          />
        ) : (
          <Sandbox
            url={activeTab.currentUrl}
            isActive={!isNewTab}
            htmlContent={activeTab.generatedContent}
            cosmeticCss={cosmeticCss}
            onNavigate={onSandboxNavigate}
            onAction={onSandboxAction}
            onOpenNewTab={onNewTab}
            onOpenSettings={() => setShowSettingsModal(true)}
            onConsoleLog={onConsoleLog}
            onNetworkRequest={onNetworkRequest}
          />
        )}
      </div>

      {/* DOCKABLE DEVELOPER TOOLS */}
      {showDevTools && (
        <DevToolsPanel
          consoleLogs={activeTab.consoleLogs || []}
          networkLogs={activeTab.networkLogs || []}
          currentHtml={activeTab.generatedContent}
          onClearConsole={onClearConsole}
          onClearNetwork={onClearNetwork}
          onExecuteCommand={onExecuteDevToolsCommand}
          onClose={() => setShowDevTools(false)}
        />
      )}

      {/* SIDE DRAWERS */}
      {showBookmarksDrawer && (
        <BookmarksHistoryDrawer
          mode={showBookmarksDrawer}
          bookmarks={bookmarks}
          history={history}
          currentTitle={getTabTitle(activeTab)}
          currentUrl={currentUrl}
          onNavigate={(url) => {
            onNavigate('url', url);
            setShowBookmarksDrawer(null);
          }}
          onAddBookmark={onAddBookmark}
          onRemoveBookmark={onRemoveBookmark}
          onClearHistory={onClearHistory}
          onClose={() => setShowBookmarksDrawer(null)}
        />
      )}

      {showAiDrawer && (
        <AiAssistantDrawer
          currentTitle={getTabTitle(activeTab)}
          currentHtml={activeTab.generatedContent}
          aiSettings={settings.ai}
          onOpenSettings={() => {
            setShowAiDrawer(false);
            setShowSettingsModal(true);
          }}
          onClose={() => setShowAiDrawer(false)}
        />
      )}

      {/* MODALS */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          shieldStats={shieldStats}
          extensions={extensions}
          onSaveSettings={onSaveSettings}
          onToggleExtension={onToggleExtension}
          onRemoveExtension={onRemoveExtension}
          onOpenExtensionManager={() => {
            setShowSettingsModal(false);
            setShowExtensionModal(true);
          }}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showExtensionModal && (
        <ExtensionsManagerModal
          extensions={extensions}
          onRefreshExtensions={onRefreshExtensions}
          onClose={() => setShowExtensionModal(false)}
        />
      )}
    </div>
  );
};
