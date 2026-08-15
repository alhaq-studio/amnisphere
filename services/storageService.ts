import { AmnBrowserSettings, BookmarkItem, HistoryItem, InstalledExtension, ShieldStats } from '../types';

const SETTINGS_KEY = 'amn_browser_settings_v1';
const BOOKMARKS_KEY = 'amn_browser_bookmarks_v1';
const HISTORY_KEY = 'amn_browser_history_v1';
const EXTENSIONS_KEY = 'amn_browser_extensions_v1';
const SHIELD_STATS_KEY = 'amn_browser_shield_stats_v1';

export const DEFAULT_SETTINGS: AmnBrowserSettings = {
  theme: 'dark',
  defaultSearchEngine: 'duckduckgo',
  homePageUrl: 'amn://newtab',
  newTabPageLayout: 'alhaq_modern',
  shield: {
    globalShieldEnabled: true,
    blockAdultAndNsfw: true,
    blockGamblingAndBetting: true,
    blockPredatoryUsury: true,
    blockTrackersAndTelemetry: true,
    blockInvasiveAds: true,
    blockMalwareAndPhishing: true,
    enableCosmeticFiltering: true,
    strictHttpsMode: true,
    siteExceptions: {},
    customBlockPatterns: [],
    customCosmeticSelectors: [
      '.ad-banner', '.adsbygoogle', '[id^="google_ads"]', '.sponsored-post',
      '.cookie-banner', '.tracking-pixel', '#cookie-consent-modal', '.popup-newsletter-overlay'
    ],
  },
  ai: {
    enabled: false, // Default to FALSE as required
    provider: 'none',
    geminiApiKey: '',
    geminiModel: 'gemini-2.5-flash',
    openaiApiKey: '',
    openaiEndpoint: 'https://api.openai.com/v1',
    openaiModel: 'gpt-4o-mini',
    customEndpointUrl: 'http://localhost:11434/v1',
    customAuthHeader: '',
    enablePageSummarizer: true,
    enableEthicsAdvisor: true,
    enableTranslateAssistant: true,
    enablePromptWebGenerator: false,
    isGroundedByDefault: false,
  },
  enablePrayerTimesWidget: true,
  enableDailyQuranVerse: true,
  autoClearHistoryOnClose: false,
  hardwareAccelerationSimulation: true,
  showDevToolsShortcut: true,
};

export const INITIAL_BOOKMARKS: BookmarkItem[] = [
  {
    id: 'bm-1',
    title: 'Al-Haq Studio (Official)',
    url: 'https://alhaq.uk',
    icon: '✨',
    category: 'Al-Haq',
    createdAt: Date.now() - 100000,
  },
  {
    id: 'bm-2',
    title: 'Quran.com — The Noble Quran',
    url: 'https://quran.com',
    icon: '📖',
    category: 'Islamic Resources',
    createdAt: Date.now() - 90000,
  },
  {
    id: 'bm-3',
    title: 'Sunnah.com — Hadith Collections',
    url: 'https://sunnah.com',
    icon: '📜',
    category: 'Islamic Resources',
    createdAt: Date.now() - 80000,
  },
  {
    id: 'bm-4',
    title: 'DuckDuckGo Privacy Search',
    url: 'https://duckduckgo.com',
    icon: '🦆',
    category: 'Search & Tools',
    createdAt: Date.now() - 70000,
  },
  {
    id: 'bm-5',
    title: 'Electronic Frontier Foundation (EFF)',
    url: 'https://eff.org',
    icon: '🛡️',
    category: 'Privacy & Tech',
    createdAt: Date.now() - 60000,
  },
  {
    id: 'bm-6',
    title: 'Wikipedia — Free Encyclopedia',
    url: 'https://wikipedia.org',
    icon: '🌐',
    category: 'Knowledge',
    createdAt: Date.now() - 50000,
  },
  {
    id: 'bm-7',
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    icon: '💻',
    category: 'Development',
    createdAt: Date.now() - 40000,
  },
];

export const INITIAL_SHIELD_STATS: ShieldStats = {
  totalBlocked: 42,
  trackersBlocked: 28,
  adsBlocked: 11,
  ethicalViolationsBlocked: 3,
  cosmeticElementsHidden: 14,
  bandwidthSavedKb: 840,
};

export const StorageService = {
  loadSettings(): AmnBrowserSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          shield: {
            ...DEFAULT_SETTINGS.shield,
            ...(parsed.shield || {}),
            siteExceptions: {
              ...DEFAULT_SETTINGS.shield.siteExceptions,
              ...(parsed.shield?.siteExceptions || {}),
            },
            customBlockPatterns: parsed.shield?.customBlockPatterns || DEFAULT_SETTINGS.shield.customBlockPatterns,
            customCosmeticSelectors: parsed.shield?.customCosmeticSelectors || DEFAULT_SETTINGS.shield.customCosmeticSelectors,
          },
          ai: {
            ...DEFAULT_SETTINGS.ai,
            ...(parsed.ai || {}),
          },
        };
      }
    } catch (e) {
      console.warn('Failed to load settings, using defaults', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: AmnBrowserSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  },

  loadBookmarks(): BookmarkItem[] {
    try {
      const data = localStorage.getItem(BOOKMARKS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load bookmarks', e);
    }
    return INITIAL_BOOKMARKS;
  },

  saveBookmarks(bookmarks: BookmarkItem[]): void {
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to save bookmarks', e);
    }
  },

  saveBookmark(item: BookmarkItem): BookmarkItem[] {
    const list = this.loadBookmarks();
    const updated = [item, ...list.filter(b => b.url !== item.url)];
    this.saveBookmarks(updated);
    return updated;
  },

  removeBookmark(id: string): BookmarkItem[] {
    const list = this.loadBookmarks();
    const updated = list.filter(b => b.id !== id);
    this.saveBookmarks(updated);
    return updated;
  },

  loadHistory(): HistoryItem[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load history', e);
    }
    return [];
  },

  saveHistory(history: HistoryItem[]): void {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 500))); // Keep last 500
    } catch (e) {
      console.error('Failed to save history', e);
    }
  },

  saveHistoryItem(item: HistoryItem): HistoryItem[] {
    const history = this.loadHistory();
    const existingIndex = history.findIndex(h => h.url === item.url);
    if (existingIndex >= 0) {
      history[existingIndex].timestamp = Date.now();
      history[existingIndex].visitCount = (history[existingIndex].visitCount || 1) + 1;
      if (item.title && item.title !== 'Untitled') history[existingIndex].title = item.title;
    } else {
      history.unshift(item);
    }
    const trimmed = history.slice(0, 500);
    this.saveHistory(trimmed);
    return trimmed;
  },

  addHistoryItem(title: string, url: string): void {
    if (!url || url.startsWith('amn://newtab')) return;
    this.saveHistoryItem({
      id: `h-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title || url,
      url,
      timestamp: Date.now(),
      visitCount: 1,
    });
  },

  clearHistory(): void {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch { }
  },

  loadShieldStats(): ShieldStats {
    try {
      const data = localStorage.getItem(SHIELD_STATS_KEY);
      if (data) return { ...INITIAL_SHIELD_STATS, ...JSON.parse(data) };
    } catch { }
    return INITIAL_SHIELD_STATS;
  },

  saveShieldStats(stats: ShieldStats): void {
    try {
      localStorage.setItem(SHIELD_STATS_KEY, JSON.stringify(stats));
    } catch { }
  },

  recordShieldBlock(category: string): ShieldStats {
    const current = this.loadShieldStats();
    let categoryKey: 'tracker' | 'ad' | 'ethics' | 'cosmetic' = 'ethics';
    if (category.includes('tracker')) categoryKey = 'tracker';
    else if (category.includes('ad')) categoryKey = 'ad';
    else if (category.includes('cosmetic')) categoryKey = 'cosmetic';
    return this.incrementShieldStats(categoryKey, 32);
  },

  incrementShieldStats(category: 'tracker' | 'ad' | 'ethics' | 'cosmetic', bytes = 24): ShieldStats {
    const current = this.loadShieldStats();
    const updated: ShieldStats = {
      ...current,
      totalBlocked: current.totalBlocked + 1,
      trackersBlocked: category === 'tracker' ? current.trackersBlocked + 1 : current.trackersBlocked,
      adsBlocked: category === 'ad' ? current.adsBlocked + 1 : current.adsBlocked,
      ethicalViolationsBlocked: category === 'ethics' ? current.ethicalViolationsBlocked + 1 : current.ethicalViolationsBlocked,
      cosmeticElementsHidden: category === 'cosmetic' ? current.cosmeticElementsHidden + 1 : current.cosmeticElementsHidden,
      bandwidthSavedKb: current.bandwidthSavedKb + Math.round(bytes / 1024),
    };
    this.saveShieldStats(updated);
    return updated;
  },

  loadInstalledExtensions(): InstalledExtension[] | null {
    try {
      const data = localStorage.getItem(EXTENSIONS_KEY);
      if (data) return JSON.parse(data);
    } catch { }
    return null;
  },

  saveInstalledExtensions(extensions: InstalledExtension[]): void {
    try {
      localStorage.setItem(EXTENSIONS_KEY, JSON.stringify(extensions));
    } catch (e) {
      console.error('Failed to save extensions', e);
    }
  },

  exportAllUserData(): string {
    return JSON.stringify({
      version: 'AmniSphere-2.4-Export',
      exportedAt: new Date().toISOString(),
      source: 'Al-Haq Studio (alhaq.uk)',
      settings: this.loadSettings(),
      bookmarks: this.loadBookmarks(),
      history: this.loadHistory(),
      extensions: this.loadInstalledExtensions(),
      shieldStats: this.loadShieldStats(),
    }, null, 2);
  },

  clearAllData(): void {
    try {
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.removeItem(BOOKMARKS_KEY);
      localStorage.removeItem(HISTORY_KEY);
      localStorage.removeItem(EXTENSIONS_KEY);
      localStorage.removeItem(SHIELD_STATS_KEY);
    } catch { }
  }
};
