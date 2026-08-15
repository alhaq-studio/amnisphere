import React, { useState, useCallback, useRef, useEffect } from 'react';
import { OuterFrame } from './components/OuterFrame';
import { BrowserShell } from './components/BrowserShell';
import { streamPageGeneration } from './services/geminiService';
import { EthicsShieldService } from './services/ethicsShieldService';
import { StorageService } from './services/storageService';
import { extensionEngineInstance } from './services/extensionEngine';
import {
  AmnBrowserSettings, BookmarkItem, Breadcrumb, ConsoleLog, FormFieldState,
  GroundingSource, HistoryItem, InstalledExtension, NetworkRequestLog, Page,
  ShieldStats, SiteShieldConfig, Tab, TokenCount
} from './types';
import {
  extractTitleFromHtml, parseBreadcrumb, parsePageFromHref, resolveOmnibarInput,
  siteNameFromPrompt, stripTitleTag
} from './utils/urlHelpers';

const createInitialTab = (): Tab => ({
  id: `tab-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  currentUrl: 'amn://newtab',
  breadcrumb: { sitename: 'AmniSphere', page: 'New Tab' },
  history: [],
  currentIndex: -1,
  loading: false,
  loadingMessage: '',
  tokenCount: { input: 0, output: 0 },
  generatedContent: '',
  groundingSources: [],
  searchEntryPointHtml: '',
  navigationId: 0,
  isPinned: false,
  isMuted: false,
  consoleLogs: [],
  networkLogs: [],
});

export const App: React.FC = () => {
  // 1. Core State
  const [settings, setSettings] = useState<AmnBrowserSettings>(() => StorageService.loadSettings());
  const [shieldStats, setShieldStats] = useState<ShieldStats>(() => StorageService.loadShieldStats());
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => StorageService.loadBookmarks());
  const [history, setHistory] = useState<HistoryItem[]>(() => StorageService.loadHistory());
  const [extensions, setExtensions] = useState<InstalledExtension[]>(() => extensionEngineInstance.getExtensions());
  const [tabs, setTabs] = useState<Tab[]>([createInitialTab()]);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  // References for streaming and cleanup
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cosmetic CSS generated from shield settings
  const cosmeticCss = EthicsShieldService.generateCosmeticCss(settings?.shield);

  // Sync settings changes
  const handleSaveSettings = useCallback((newSettings: AmnBrowserSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  }, []);

  // Update Shield site configuration
  const handleToggleShieldSite = useCallback((domain: string, config: Partial<SiteShieldConfig>) => {
    const existing = settings?.shield?.siteExceptions?.[domain] || {
      domain,
      shieldEnabled: true,
      allowScripts: true,
      blockAdult: settings?.shield?.blockAdultAndNsfw ?? true,
      blockGambling: settings?.shield?.blockGamblingAndBetting ?? true,
      blockTrackers: settings?.shield?.blockTrackersAndTelemetry ?? true,
      blockAds: settings?.shield?.blockInvasiveAds ?? true,
    };
    const updatedExceptions = {
      ...(settings?.shield?.siteExceptions || {}),
      [domain]: { ...existing, ...config },
    };
    const updatedShield = {
      ...settings.shield,
      siteExceptions: updatedExceptions,
    };
    handleSaveSettings({ ...settings, shield: updatedShield });
  }, [settings, handleSaveSettings]);

  // Tab Helpers
  const updateActiveTab = useCallback((updater: (tab: Tab) => Tab) => {
    setTabs(prev => prev.map((t, i) => i === activeTabIndex ? updater(t) : t));
  }, [activeTabIndex]);

  const activeTab = tabs[activeTabIndex] || tabs[0];

  // History & Bookmarks helpers
  const handleAddBookmark = useCallback((title: string, url: string) => {
    const newItem: BookmarkItem = {
      id: `bm-${Date.now()}`,
      title,
      url,
      createdAt: Date.now(),
    };
    const updated = StorageService.saveBookmark(newItem);
    setBookmarks(updated);
  }, []);

  const handleRemoveBookmark = useCallback((id: string) => {
    const updated = StorageService.removeBookmark(id);
    setBookmarks(updated);
  }, []);

  const handleClearHistory = useCallback(() => {
    StorageService.clearHistory();
    setHistory([]);
  }, []);

  // Extension management
  const handleRefreshExtensions = useCallback(() => {
    setExtensions(extensionEngineInstance.getExtensions());
  }, []);

  const handleToggleExtension = useCallback((id: string) => {
    extensionEngineInstance.toggleExtension(id);
    handleRefreshExtensions();
  }, [handleRefreshExtensions]);

  const handleRemoveExtension = useCallback((id: string) => {
    extensionEngineInstance.removeExtension(id);
    handleRefreshExtensions();
  }, [handleRefreshExtensions]);

  // DevTools logs
  const handleConsoleLog = useCallback((log: ConsoleLog) => {
    updateActiveTab(tab => ({
      ...tab,
      consoleLogs: [...(tab.consoleLogs || []).slice(-100), log],
    }));
  }, [updateActiveTab]);

  const handleNetworkRequest = useCallback((req: NetworkRequestLog) => {
    updateActiveTab(tab => ({
      ...tab,
      networkLogs: [...(tab.networkLogs || []).slice(-100), req],
    }));
  }, [updateActiveTab]);

  const handleClearConsole = useCallback(() => {
    updateActiveTab(tab => ({ ...tab, consoleLogs: [] }));
  }, [updateActiveTab]);

  const handleClearNetwork = useCallback(() => {
    updateActiveTab(tab => ({ ...tab, networkLogs: [] }));
  }, [updateActiveTab]);

  const handleExecuteDevToolsCommand = useCallback((code: string) => {
    window.postMessage({ type: 'EXEC_COMMAND', code }, '*');
    handleConsoleLog({
      id: `exec-${Date.now()}`,
      level: 'log',
      message: `> ${code}`,
      timestamp: Date.now(),
    });
  }, [handleConsoleLog]);

  // Main Page Generation & Navigation Pipeline
  const loadPage = useCallback(async (
    targetPrompt: string,
    actionType: 'navigate' | 'edit' | 'action',
    actionIntent?: string,
    actionPayload?: string,
    formState?: FormFieldState[]
  ) => {
    // Abort ongoing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const currentTab = tabs[activeTabIndex];
    const resolved = resolveOmnibarInput(targetPrompt, settings.defaultSearchEngine);

    // 1. Check Al-Haq Ethics Shield
    const shieldCheck = EthicsShieldService.checkUrl(resolved.url, settings?.shield);
    
    // Log network request
    const networkLog: NetworkRequestLog = {
      id: `net-${Date.now()}`,
      url: resolved.url,
      method: 'GET',
      type: 'document',
      status: shieldCheck.blocked ? 'BLOCKED' : 200,
      blockedBy: shieldCheck.blocked ? `Al-Haq Shield: ${shieldCheck.category}` : undefined,
      timestamp: Date.now(),
    };
    handleNetworkRequest(networkLog);

    if (shieldCheck.blocked) {
      // Record shield stats
      const updatedStats = StorageService.recordShieldBlock(shieldCheck.category || 'ethics_safeguards');
      setShieldStats(updatedStats);

      const blockedHtml = EthicsShieldService.generateBlockedPageHtml(
        resolved.url,
        shieldCheck.category || 'nsfw_adult',
        shieldCheck.reason || 'Restricted content'
      );

      const blockedPage: Page = {
        id: `page-blocked-${Date.now()}`,
        url: resolved.url,
        title: 'Al-Haq Ethics Shield - Access Blocked',
        html: blockedHtml,
        breadcrumb: { sitename: 'Al-Haq Ethics Shield', page: 'Access Blocked' },
        scrollPosition: 0,
        timestamp: Date.now(),
        tokenCount: { input: 0, output: 0 },
        groundingSources: [],
        blockedEthicsCount: 1,
      };

      updateActiveTab(tab => {
        const newHist = [...tab.history.slice(0, tab.currentIndex + 1), blockedPage];
        return {
          ...tab,
          currentUrl: resolved.url,
          breadcrumb: blockedPage.breadcrumb,
          history: newHist,
          currentIndex: newHist.length - 1,
          generatedContent: blockedHtml,
          loading: false,
          loadingMessage: '',
        };
      });
      return;
    }

    // 2. Handle internal "amn://" pages
    if (resolved.url === 'amn://newtab') {
      updateActiveTab(tab => ({
        ...tab,
        currentUrl: 'amn://newtab',
        breadcrumb: { sitename: 'AmniSphere', page: 'New Tab' },
        generatedContent: '',
        loading: false,
      }));
      return;
    }

    // 3. Setup Navigation State
    let sitename = currentTab?.breadcrumb.sitename || 'AmniSphere';
    let pageName = 'Page';

    if (actionType === 'navigate') {
      if (resolved.isSearch) {
        sitename = `${(settings?.defaultSearchEngine || 'duckduckgo').toUpperCase()} Search`;
        pageName = resolved.query || 'Query';
      } else if (!currentTab?.breadcrumb.sitename || targetPrompt.startsWith('http') || targetPrompt.startsWith('amn://')) {
        sitename = siteNameFromPrompt(targetPrompt);
        pageName = parsePageFromHref(targetPrompt);
      } else {
        pageName = parsePageFromHref(targetPrompt);
      }
    }

    const currentBreadcrumb: Breadcrumb = { sitename, page: pageName };

    updateActiveTab(tab => ({
      ...tab,
      currentUrl: resolved.url,
      breadcrumb: currentBreadcrumb,
      loading: true,
      loadingMessage: `Loading ${sitename}...`,
    }));

    let rawAccumulatedHtml = '';
    let lastSanitizedHtml = '';
    let blockedTrackers = 0;
    let blockedAds = 0;
    let blockedEthics = 0;
    let cosmeticHides = 0;
    let latestTokenCount: TokenCount = { input: 0, output: 0 };
    let latestGroundingSources: GroundingSource[] = [];
    let latestSearchEntryPointHtml = '';

    try {
      let effectivePrompt = targetPrompt;
      if (actionType === 'action' && actionIntent) {
        effectivePrompt = `Action Intent: ${actionIntent}${actionPayload ? ` | Payload: ${actionPayload}` : ''}\n${targetPrompt}`;
      }

      // Stream content via our offline-first / BYOK modular service
      for await (const chunk of streamPageGeneration(
        effectivePrompt,
        actionType === 'edit' || actionType === 'action' ? currentTab?.generatedContent || null : null,
        settings?.ai?.isGroundedByDefault ?? false,
        abortControllerRef.current?.signal,
        formState,
        false,
        settings?.ai
      )) {
        if (chunk.startsWith('__TOKEN__')) {
          try {
            const tokenData = JSON.parse(chunk.slice(9));
            latestTokenCount = tokenData;
            updateActiveTab(tab => ({
              ...tab,
              tokenCount: tokenData,
            }));
          } catch { }
        } else if (chunk.startsWith('__META__')) {
          try {
            const metaData = JSON.parse(chunk.slice(8));
            if (metaData.tokenCount) latestTokenCount = metaData.tokenCount;
            if (metaData.groundingSources) latestGroundingSources = metaData.groundingSources;
            if (metaData.searchEntryPointHtml) latestSearchEntryPointHtml = metaData.searchEntryPointHtml;
          } catch { }
        } else {
          rawAccumulatedHtml += chunk;

          // Apply Al-Haq Ethics Shield sanitization
          const sanitized = EthicsShieldService.sanitizeHtml(rawAccumulatedHtml, settings?.shield);
          lastSanitizedHtml = sanitized.sanitizedHtml;
          blockedTrackers = sanitized.blockedTrackers;
          blockedAds = sanitized.blockedAds;
          cosmeticHides = sanitized.cosmeticHides;

          updateActiveTab(tab => ({
            ...tab,
            generatedContent: lastSanitizedHtml,
          }));
        }
      }

      // Final sanitize
      const finalSanitize = EthicsShieldService.sanitizeHtml(rawAccumulatedHtml, settings?.shield);
      lastSanitizedHtml = finalSanitize.sanitizedHtml;
      blockedTrackers = finalSanitize.blockedTrackers;
      blockedAds = finalSanitize.blockedAds;
      cosmeticHides = finalSanitize.cosmeticHides;

      // Extract title if present
      const title = extractTitleFromHtml(lastSanitizedHtml);
      const finalBreadcrumb = title || currentBreadcrumb;

      const newPage: Page = {
        id: `page-${Date.now()}`,
        url: resolved.url,
        title: finalBreadcrumb.page ? `${finalBreadcrumb.sitename} - ${finalBreadcrumb.page}` : finalBreadcrumb.sitename,
        html: lastSanitizedHtml,
        breadcrumb: finalBreadcrumb,
        scrollPosition: 0,
        timestamp: Date.now(),
        tokenCount: latestTokenCount,
        groundingSources: latestGroundingSources,
        searchEntryPointHtml: latestSearchEntryPointHtml,
        blockedTrackersCount: blockedTrackers,
        blockedAdsCount: blockedAds,
        blockedEthicsCount: blockedEthics,
        cosmeticHidesCount: cosmeticHides,
      };

      // Record in zero-telemetry local history
      const updatedHist = StorageService.saveHistoryItem({
        id: `hist-${Date.now()}`,
        title: finalBreadcrumb.page ? `${finalBreadcrumb.sitename} › ${finalBreadcrumb.page}` : finalBreadcrumb.sitename,
        url: resolved.url,
        timestamp: Date.now(),
        visitCount: 1,
      });
      setHistory(updatedHist);

      updateActiveTab(tab => {
        const nextHistory = [...tab.history.slice(0, tab.currentIndex + 1), newPage];
        return {
          ...tab,
          breadcrumb: finalBreadcrumb,
          history: nextHistory,
          currentIndex: nextHistory.length - 1,
          generatedContent: lastSanitizedHtml,
          loading: false,
          loadingMessage: '',
          tokenCount: newPage.tokenCount || null,
          groundingSources: newPage.groundingSources || [],
          searchEntryPointHtml: newPage.searchEntryPointHtml || '',
        };
      });
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      console.error('Browser navigation error:', err);
      updateActiveTab(tab => ({
        ...tab,
        loading: false,
        loadingMessage: '',
      }));
    }
  }, [tabs, activeTabIndex, settings, handleNetworkRequest, updateActiveTab]);

  // Tab Actions
  const handleNewTab = useCallback((initialUrl: string = 'amn://newtab') => {
    const newTab = createInitialTab();
    newTab.currentUrl = initialUrl;
    setTabs(prev => [...prev, newTab]);
    setActiveTabIndex(tabs.length);
    if (initialUrl && !initialUrl.startsWith('amn://newtab')) {
      setTimeout(() => {
        loadPage(initialUrl, 'navigate');
      }, 50);
    }
  }, [tabs.length, loadPage]);

  const handleCloseTab = useCallback((indexToClose: number) => {
    if (tabs.length <= 1) {
      // Reset the single remaining tab
      setTabs([createInitialTab()]);
      setActiveTabIndex(0);
      return;
    }
    const newTabs = tabs.filter((_, i) => i !== indexToClose);
    setTabs(newTabs);
    if (activeTabIndex >= newTabs.length) {
      setActiveTabIndex(newTabs.length - 1);
    } else if (activeTabIndex > indexToClose) {
      setActiveTabIndex(activeTabIndex - 1);
    }
  }, [tabs, activeTabIndex]);

  const handleSwitchTab = useCallback((index: number) => {
    setActiveTabIndex(index);
  }, []);

  const handlePinTab = useCallback((index: number) => {
    setTabs(prev => prev.map((t, i) => i === index ? { ...t, isPinned: !t.isPinned } : t));
  }, []);

  const handleMuteTab = useCallback((index: number) => {
    setTabs(prev => prev.map((t, i) => i === index ? { ...t, isMuted: !t.isMuted } : t));
  }, []);

  // Back / Forward / Refresh
  const handleBack = useCallback(() => {
    if (activeTab.currentIndex > 0) {
      const prevIndex = activeTab.currentIndex - 1;
      const prevPage = activeTab.history[prevIndex];
      updateActiveTab(tab => ({
        ...tab,
        currentIndex: prevIndex,
        breadcrumb: prevPage.breadcrumb,
        generatedContent: prevPage.html,
        tokenCount: prevPage.tokenCount || null,
        groundingSources: prevPage.groundingSources || [],
        loading: false,
      }));
    }
  }, [activeTab, updateActiveTab]);

  const handleForward = useCallback(() => {
    if (activeTab.currentIndex < activeTab.history.length - 1) {
      const nextIndex = activeTab.currentIndex + 1;
      const nextPage = activeTab.history[nextIndex];
      updateActiveTab(tab => ({
        ...tab,
        currentIndex: nextIndex,
        breadcrumb: nextPage.breadcrumb,
        generatedContent: nextPage.html,
        tokenCount: nextPage.tokenCount || null,
        groundingSources: nextPage.groundingSources || [],
        loading: false,
      }));
    }
  }, [activeTab, updateActiveTab]);

  const handleRefresh = useCallback(() => {
    if (activeTab.currentUrl && !activeTab.currentUrl.startsWith('amn://newtab')) {
      loadPage(activeTab.currentUrl, 'navigate');
    }
  }, [activeTab.currentUrl, loadPage]);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    updateActiveTab(tab => ({
      ...tab,
      loading: false,
      loadingMessage: '',
    }));
  }, [updateActiveTab]);

  const handleHome = useCallback(() => {
    updateActiveTab(tab => ({
      ...tab,
      currentUrl: 'amn://newtab',
      breadcrumb: { sitename: 'AmniSphere', page: 'New Tab' },
      generatedContent: '',
      loading: false,
    }));
  }, [updateActiveTab]);

  // Sandbox callbacks
  const handleSandboxNavigate = useCallback((href: string, linkText: string, formState?: FormFieldState[]) => {
    loadPage(href, 'navigate', undefined, undefined, formState);
  }, [loadPage]);

  const handleSandboxAction = useCallback((intent: string, payload?: string, formState?: FormFieldState[]) => {
    const lower = (intent || '').toLowerCase().trim();
    if (lower === 'open new tab' || lower === 'new tab' || lower === 'newtab' || lower === 'open_new_tab') {
      handleNewTab(payload || 'amn://newtab');
      return;
    }
    loadPage(activeTab.currentUrl, 'action', intent, payload, formState);
  }, [activeTab.currentUrl, handleNewTab, loadPage]);

  return (
    <OuterFrame shieldStats={shieldStats} onOpenNewTab={handleNewTab}>
      <BrowserShell
        tabs={tabs}
        activeTabIndex={activeTabIndex}
        settings={settings}
        shieldStats={shieldStats}
        bookmarks={bookmarks}
        history={history}
        extensions={extensions}
        onNewTab={handleNewTab}
        onCloseTab={handleCloseTab}
        onSwitchTab={handleSwitchTab}
        onPinTab={handlePinTab}
        onMuteTab={handleMuteTab}
        onNavigate={(type, target) => loadPage(target, type === 'edit' ? 'edit' : 'navigate')}
        onSandboxNavigate={handleSandboxNavigate}
        onSandboxAction={handleSandboxAction}
        onBack={handleBack}
        onForward={handleForward}
        onRefresh={handleRefresh}
        onStop={handleStop}
        onHome={handleHome}
        onSaveSettings={handleSaveSettings}
        onToggleExtension={handleToggleExtension}
        onRemoveExtension={handleRemoveExtension}
        onRefreshExtensions={handleRefreshExtensions}
        onAddBookmark={handleAddBookmark}
        onRemoveBookmark={handleRemoveBookmark}
        onClearHistory={handleClearHistory}
        onToggleShieldSite={handleToggleShieldSite}
        onConsoleLog={handleConsoleLog}
        onNetworkRequest={handleNetworkRequest}
        onClearConsole={handleClearConsole}
        onClearNetwork={handleClearNetwork}
        onExecuteDevToolsCommand={handleExecuteDevToolsCommand}
        cosmeticCss={cosmeticCss}
      />
    </OuterFrame>
  );
};

export default App;
