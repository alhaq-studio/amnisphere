import React, { useState, useCallback, useRef, useEffect } from 'react';
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

function generateConnectionErrorHtml(url: string, title: string, message: string): string {
  const safeUrl = (url || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeTitle = (title || 'Connection Error').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeMsg = (message || 'Failed to connect to target server').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<!DOCTYPE html>
<html>
<head>
  <title>${safeTitle} - AmniSphere</title>
  <meta name="color-scheme" content="dark">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #030712; color: #f1f5f9; margin: 0; padding: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { max-width: 520px; width: 90%; background: #090d16; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .icon-box { width: 44px; height: 44px; border-radius: 10px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 16px; }
    .btn-primary { background: #059669; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; transition: background 0.2s; }
    .btn-primary:hover { background: #10b981; }
    .btn-secondary { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; transition: background 0.2s; }
    .btn-secondary:hover { background: #334155; color: white; }
    .url-box { background: #030712; border: 1px solid #1e293b; border-radius: 8px; padding: 10px 14px; margin-bottom: 20px; font-family: monospace; font-size: 11px; color: #94a3b8; word-break: break-all; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-box">⚠️</div>
    <h1 style="font-size: 18px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0;">${safeTitle}</h1>
    <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0 0 16px 0;">${safeMsg}</p>
    
    <div class="url-box">Target: ${safeUrl}</div>

    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
      <button type="button" aria-label="Retry loading target website" class="btn-primary" onclick="window.FlashLiteAPI.performAction('retry_connection', '${safeUrl}')">
        🔄 Retry Connection
      </button>
      <button type="button" aria-label="Return to safe home new tab" class="btn-secondary" onclick="window.FlashLiteAPI.openNewTab('amn://newtab')">
        🏠 Return Home
      </button>
    </div>
  </div>
</body>
</html>`;
}

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
    try {
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'EXEC_COMMAND', code }, '*');
      }
    } catch {}
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

    // 4. Live Web Proxy Navigation Pipeline
    if (actionType === 'navigate' && (resolved.url.startsWith('http://') || resolved.url.startsWith('https://'))) {
      try {
        const proxyRes = await fetch(`/api/proxy?url=${encodeURIComponent(resolved.url)}`, {
          signal: abortControllerRef.current?.signal,
        });

        if (!proxyRes.ok) {
          let errorMsg = `Server returned HTTP status ${proxyRes.status}`;
          try {
            const errJson = await proxyRes.json();
            if (errJson.message) errorMsg = errJson.message;
          } catch {}
          throw new Error(errorMsg);
        }

        const liveHtml = await proxyRes.text();

        // Apply Al-Haq Ethics Shield sanitization & threat metric counts
        const sanitized = EthicsShieldService.sanitizeHtml(liveHtml, settings?.shield);
        const title = extractTitleFromHtml(sanitized.sanitizedHtml);
        const finalBreadcrumb = title || currentBreadcrumb;

        const newPage: Page = {
          id: `page-${Date.now()}`,
          url: resolved.url,
          title: finalBreadcrumb.page ? `${finalBreadcrumb.sitename} - ${finalBreadcrumb.page}` : finalBreadcrumb.sitename,
          html: sanitized.sanitizedHtml,
          breadcrumb: finalBreadcrumb,
          scrollPosition: 0,
          timestamp: Date.now(),
          tokenCount: { input: 0, output: 0 },
          groundingSources: [],
          searchEntryPointHtml: '',
          blockedTrackersCount: sanitized.blockedTrackers,
          blockedAdsCount: sanitized.blockedAds,
          blockedEthicsCount: 0,
          cosmeticHidesCount: sanitized.cosmeticHides,
        };

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
            currentUrl: resolved.url,
            breadcrumb: finalBreadcrumb,
            history: nextHistory,
            currentIndex: nextHistory.length - 1,
            generatedContent: sanitized.sanitizedHtml,
            loading: false,
            loadingMessage: '',
          };
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;

        console.error("Proxy navigation error:", err);
        const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
        const errorHtml = generateConnectionErrorHtml(
          resolved.url,
          isOffline ? 'No Internet Connection' : 'Unable to Connect to Target Server',
          isOffline
            ? 'Your device appears to be offline. Please verify your network connection and retry.'
            : `AmniSphere reverse proxy encountered an error: ${err?.message || 'The server did not respond.'}`
        );

        const errorBreadcrumb = { sitename: 'Connection Error', page: 'Error' };
        const errPage: Page = {
          id: `page-err-${Date.now()}`,
          url: resolved.url,
          title: 'Connection Error',
          html: errorHtml,
          breadcrumb: errorBreadcrumb,
          scrollPosition: 0,
          timestamp: Date.now(),
          tokenCount: { input: 0, output: 0 },
          groundingSources: [],
          blockedEthicsCount: 0,
        };

        updateActiveTab(tab => {
          const nextHistory = [...tab.history.slice(0, tab.currentIndex + 1), errPage];
          return {
            ...tab,
            currentUrl: resolved.url,
            breadcrumb: errorBreadcrumb,
            history: nextHistory,
            currentIndex: nextHistory.length - 1,
            generatedContent: errorHtml,
            loading: false,
            loadingMessage: '',
          };
        });
        return;
      }
    }

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
        currentUrl: prevPage.url,
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
        currentUrl: nextPage.url,
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
    if (lower === 'retry_connection' || lower === 'retry') {
      loadPage(payload || activeTab.currentUrl, 'navigate');
      return;
    }
    loadPage(activeTab.currentUrl, 'action', intent, payload, formState);
  }, [activeTab.currentUrl, handleNewTab, loadPage]);

  return (
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
  );
};

export default App;
