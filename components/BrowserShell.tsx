import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  Plus, X, Pin, Volume2, VolumeX, Maximize, Minimize, ShieldCheck,
  Sparkles, Terminal, Bookmark, History, Sliders, ExternalLink
} from 'lucide-react';
import { AddressBar } from './AddressBar';
import { Sandbox } from './Sandbox';
import { NewTab } from './NewTab';
import { DevToolsPanel } from './DevToolsPanel';
import { BookmarksHistoryDrawer } from './BookmarksHistoryDrawer';
import { AiAssistantDrawer } from './AiAssistantDrawer';
import { SettingsModal } from './SettingsModal';
import { ExtensionsManagerModal } from './ExtensionsManagerModal';
import {
  AmnBrowserSettings, BookmarkItem, Breadcrumb, ConsoleLog, FormFieldState,
  GroundingSource, HistoryItem, InstalledExtension, NetworkRequestLog, ShieldStats, SiteShieldConfig, Tab
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
  const shellRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState<'bookmarks' | 'history' | null>(null);
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);

  const activeTab = tabs[activeTabIndex] || tabs[0];
  const currentUrl = activeTab?.currentUrl || 'amn://newtab';
  const isNewTab = currentUrl.startsWith('amn://newtab') && !activeTab.generatedContent;
  const currentPage = activeTab.currentIndex >= 0 ? activeTab.history[activeTab.currentIndex] : null;

  const siteShieldStats = {
    trackers: currentPage?.blockedTrackersCount || 0,
    ads: currentPage?.blockedAdsCount || 0,
    ethics: currentPage?.blockedEthicsCount || 0,
    cosmetic: currentPage?.cosmeticHidesCount || 0,
  };

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+T or Cmd+T for New Tab
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
        e.preventDefault();
        onNewTab();
      }
      // Ctrl+W or Cmd+W to close active tab
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        onCloseTab(activeTabIndex);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNewTab, onCloseTab, activeTabIndex]);

  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      shellRef.current?.requestFullscreen?.();
    }
  }, []);

  const getTabTitle = (tab: Tab) => {
    if (tab.loading) return 'Loading...';
    if (tab.currentUrl.startsWith('amn://newtab') && !tab.generatedContent) return 'New Tab';
    return tab.breadcrumb.page || tab.breadcrumb.sitename || 'Untitled';
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-950 text-gray-100 overflow-hidden relative font-sans" ref={shellRef}>
      
      {/* 1. TOP TAB BAR */}
      <div className="bg-gray-950 border-b border-gray-800/80 px-2 pt-1.5 flex items-center justify-between select-none">
        
        {/* Tab strip */}
        <div className="flex items-center gap-1 overflow-x-auto min-w-0 flex-1 scrollbar-none">
          {tabs.map((tab, idx) => {
            const isActive = idx === activeTabIndex;
            return (
              <div
                key={tab.id}
                onClick={() => onSwitchTab(idx)}
                className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-t-xl text-xs font-medium cursor-pointer transition max-w-[200px] min-w-[120px] ${isActive ? 'bg-gray-900 text-white border-t border-x border-gray-700/80' : 'bg-gray-950/60 text-gray-400 hover:bg-gray-900/60 hover:text-gray-200'}`}
                title={tab.currentUrl}
              >
                {tab.loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                ) : (
                  <span className="text-xs flex-shrink-0">
                    {tab.currentUrl.startsWith('amn://newtab') ? '🛡️' : '🌐'}
                  </span>
                )}

                <span className="truncate flex-1">
                  {getTabTitle(tab)}
                </span>

                {tab.isPinned && (
                  <Pin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                )}

                {/* Tab Close Button */}
                {tabs.length > 1 && !tab.isPinned && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(idx);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:bg-gray-700 p-0.5 rounded-full text-gray-400 hover:text-white transition"
                    title="Close Tab"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* New Tab Button */}
          <button
            onClick={() => onNewTab()}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition flex-shrink-0"
            title="New Tab (Ctrl+T)"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar Controls */}
        <div className="flex items-center gap-1 pl-2">
          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. ADDRESS BAR & TOOLBAR */}
      <AddressBar
        currentUrl={currentUrl}
        breadcrumb={activeTab.breadcrumb}
        isLoading={activeTab.loading}
        loadingMessage={activeTab.loadingMessage}
        settings={settings}
        shieldStats={shieldStats}
        siteShieldStats={siteShieldStats}
        extensions={extensions}
        canGoBack={activeTab.currentIndex > 0}
        canGoForward={activeTab.currentIndex < activeTab.history.length - 1}
        onNavigate={onNavigate}
        onBack={onBack}
        onForward={onForward}
        onRefresh={onRefresh}
        onStop={onStop}
        onHome={onHome}
        onToggleShieldSite={onToggleShieldSite}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenDevTools={() => setShowDevTools(!showDevTools)}
        onOpenBookmarks={() => setShowBookmarksDrawer('bookmarks')}
        onOpenHistory={() => setShowBookmarksDrawer('history')}
        onOpenAiDrawer={() => setShowAiDrawer(!showAiDrawer)}
        onOpenExtensionManager={() => setShowExtensionModal(true)}
      />

      {/* 3. BROWSER VIEWPORT */}
      <div className="flex-1 min-h-0 bg-gray-950 relative overflow-hidden flex flex-col">
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

      {/* 4. DOCKABLE DEVELOPER TOOLS */}
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

      {/* 5. SIDE DRAWERS */}
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

      {/* 6. MODALS */}
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
