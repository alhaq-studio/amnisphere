export type SearchEngine = 'duckduckgo' | 'searxng' | 'brave' | 'startpage' | 'qwant' | 'ecosia';

export interface SearchEngineInfo {
  id: SearchEngine;
  name: string;
  url: string;
  icon: string;
  privacyHighlights: string;
}

export interface Breadcrumb {
  sitename: string;
  page: string;
}

export interface TokenCount {
  input: number;
  output: number;
  isEstimate?: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ConsoleLog {
  id: string;
  level: 'log' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  source?: string;
}

export interface NetworkRequestLog {
  id: string;
  url: string;
  method: string;
  status: number | 'BLOCKED' | 'PENDING';
  type: 'document' | 'script' | 'stylesheet' | 'image' | 'fetch' | 'tracker' | 'ad' | 'other';
  size?: number;
  blockedBy?: string;
  timestamp: number;
  durationMs?: number;
}

export interface Page {
  id: string;
  url: string;
  title: string;
  html: string;
  breadcrumb: Breadcrumb;
  scrollPosition: number;
  timestamp: number;
  tokenCount?: TokenCount | null;
  prompt?: string;
  contextHtml?: string | null;
  isGrounded?: boolean;
  groundingSources?: GroundingSource[];
  searchEntryPointHtml?: string;
  isCustomPage?: boolean;
  isReaderMode?: boolean;
  blockedTrackersCount?: number;
  blockedAdsCount?: number;
  blockedEthicsCount?: number;
  cosmeticHidesCount?: number;
}

export interface FormFieldState {
  name: string;
  type: string;
  value: string;
}

export interface Tab {
  id: string;
  history: Page[];
  currentIndex: number;
  loading: boolean;
  loadingMessage: string;
  generatedContent: string;
  currentUrl: string;
  breadcrumb: Breadcrumb;
  tokenCount: TokenCount | null;
  groundingSources: GroundingSource[];
  searchEntryPointHtml: string;
  navigationId: number;
  isPinned?: boolean;
  isMuted?: boolean;
  consoleLogs: ConsoleLog[];
  networkLogs: NetworkRequestLog[];
}

// ============================================================================
// AL-HAQ ETHICS SHIELD TYPES
// ============================================================================

export type EthicsBlockCategory =
  | 'nsfw_adult'
  | 'gambling_betting'
  | 'predatory_usury_scam'
  | 'trackers_telemetry'
  | 'invasive_ads'
  | 'malware_phishing'
  | 'intrusive_popups';

export interface BlockRule {
  id: string;
  pattern: string; // Regex or domain substring
  category: EthicsBlockCategory;
  description: string;
  enabled: boolean;
  isCustom?: boolean;
}

export interface ShieldStats {
  totalBlocked: number;
  trackersBlocked: number;
  adsBlocked: number;
  ethicalViolationsBlocked: number;
  cosmeticElementsHidden: number;
  bandwidthSavedKb: number;
}

export interface SiteShieldConfig {
  domain: string;
  shieldEnabled: boolean;
  allowScripts: boolean;
  blockAdult: boolean;
  blockGambling: boolean;
  blockTrackers: boolean;
  blockAds: boolean;
  customCss?: string;
}

export interface ShieldSettings {
  globalShieldEnabled: boolean;
  blockAdultAndNsfw: boolean;
  blockGamblingAndBetting: boolean;
  blockPredatoryUsury: boolean;
  blockTrackersAndTelemetry: boolean;
  blockInvasiveAds: boolean;
  blockMalwareAndPhishing: boolean;
  enableCosmeticFiltering: boolean;
  strictHttpsMode: boolean;
  siteExceptions: Record<string, SiteShieldConfig>;
  customBlockPatterns: BlockRule[];
  customCosmeticSelectors: string[];
}

// ============================================================================
// EXTENSION ENGINE TYPES (MANIFEST V2 / V3 / TYPESCRIPT)
// ============================================================================

export interface ManifestContentScript {
  matches: string[];
  js?: string[];
  css?: string[];
  run_at?: 'document_start' | 'document_end' | 'document_idle';
}

export interface ManifestV2orV3 {
  manifest_version: 2 | 3;
  name: string;
  version: string;
  description?: string;
  author?: string;
  homepage_url?: string;
  icons?: Record<string, string>;
  permissions?: string[];
  host_permissions?: string[];
  content_scripts?: ManifestContentScript[];
  background?: {
    scripts?: string[];
    service_worker?: string;
    type?: 'module';
  };
  action?: {
    default_title?: string;
    default_popup?: string;
    default_icon?: Record<string, string>;
  };
  browser_action?: {
    default_title?: string;
    default_popup?: string;
    default_icon?: Record<string, string>;
  };
  declarative_net_request?: {
    rule_resources?: Array<{
      id: string;
      enabled: boolean;
      path: string;
    }>;
  };
}

export interface InstalledExtension {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  manifestVersion: 2 | 3;
  manifestRaw: string;
  code: string; // JavaScript or TypeScript bundle
  css?: string;
  icon?: string;
  permissions: string[];
  isBuiltIn?: boolean;
  storage: Record<string, any>;
  hasPopup?: boolean;
  popupHtml?: string;
}

// ============================================================================
// MODULAR AI (BYOK / LOCAL / OPTIONAL)
// ============================================================================

export type AiProvider = 'none' | 'gemini' | 'openai' | 'custom_endpoint' | 'builtin_preview';

export interface AiSettings {
  enabled: boolean;
  provider: AiProvider;
  geminiApiKey: string;
  geminiModel: string;
  openaiApiKey: string;
  openaiEndpoint: string;
  openaiModel: string;
  customEndpointUrl: string;
  customAuthHeader: string;
  enablePageSummarizer: boolean;
  enableEthicsAdvisor: boolean;
  enableTranslateAssistant: boolean;
  enablePromptWebGenerator: boolean;
  isGroundedByDefault: boolean;
}

// ============================================================================
// BOOKMARKS & HISTORY & USER PREFERENCES
// ============================================================================

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  category?: string;
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  timestamp: number;
  visitCount: number;
}

export interface AmnBrowserSettings {
  theme: 'dark' | 'light' | 'system';
  defaultSearchEngine: SearchEngine;
  homePageUrl: string;
  newTabPageLayout: 'alhaq_modern' | 'minimal' | 'custom';
  shield: ShieldSettings;
  ai: AiSettings;
  enablePrayerTimesWidget: boolean;
  enableDailyQuranVerse: boolean;
  autoClearHistoryOnClose: boolean;
  hardwareAccelerationSimulation: boolean;
  showDevToolsShortcut: boolean;
}

let nextTabId = 1;

export function createTab(initialUrl = 'amn://newtab', initialTitle = 'New Tab'): Tab {
  const isNewTab = initialUrl.startsWith('amn://newtab');
  const fallbackBreadcrumb: Breadcrumb = isNewTab
    ? { sitename: 'AmniSphere', page: 'New Tab' }
    : { sitename: 'Web', page: initialTitle };

  return {
    id: `tab-${nextTabId++}-${Date.now()}`,
    history: [],
    currentIndex: -1,
    loading: false,
    loadingMessage: '',
    generatedContent: '',
    currentUrl: initialUrl,
    breadcrumb: fallbackBreadcrumb,
    tokenCount: null,
    groundingSources: [],
    searchEntryPointHtml: '',
    navigationId: 0,
    isPinned: false,
    isMuted: false,
    consoleLogs: [],
    networkLogs: [],
  };
}
