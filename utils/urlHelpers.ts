import { Breadcrumb, SearchEngine } from '../types';

const SEPARATOR = ' › ';

export const SEARCH_ENGINES: Record<SearchEngine, { name: string; urlTemplate: string; icon: string }> = {
  duckduckgo: {
    name: 'DuckDuckGo',
    urlTemplate: 'https://duckduckgo.com/?q=',
    icon: '🦆',
  },
  searxng: {
    name: 'SearXNG (Private Metasearch)',
    urlTemplate: 'https://searx.be/search?q=',
    icon: '🔍',
  },
  brave: {
    name: 'Brave Search',
    urlTemplate: 'https://search.brave.com/search?q=',
    icon: '🦁',
  },
  startpage: {
    name: 'Startpage',
    urlTemplate: 'https://www.startpage.com/sp/search?query=',
    icon: '🔒',
  },
  qwant: {
    name: 'Qwant',
    urlTemplate: 'https://www.qwant.com/?q=',
    icon: '🛡️',
  },
  ecosia: {
    name: 'Ecosia (Eco Search)',
    urlTemplate: 'https://www.ecosia.org/search?q=',
    icon: '🌱',
  }
};

/**
 * Checks if input is a valid domain or standard URL
 */
export function isLikelyUrl(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('amn://') || trimmed.startsWith('about:')) {
    return true;
  }
  // Matches common TLDs or localhost / IP
  if (/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/.test(trimmed) || /^localhost(:\d+)?(\/.*)?$/.test(trimmed)) {
    return true;
  }
  return false;
}

/**
 * Resolves user omnibar input to a normalized URL or search URL
 */
export function resolveOmnibarInput(input: string, searchEngine: SearchEngine = 'duckduckgo'): {
  url: string;
  isSearch: boolean;
  isInternal: boolean;
  query?: string;
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return { url: 'amn://newtab', isSearch: false, isInternal: true };
  }

  if (trimmed.startsWith('amn://') || trimmed.startsWith('about:')) {
    return { url: trimmed, isSearch: false, isInternal: true };
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return { url: trimmed, isSearch: false, isInternal: false };
  }

  if (/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/.test(trimmed) || /^localhost(:\d+)?(\/.*)?$/.test(trimmed)) {
    return { url: `https://${trimmed}`, isSearch: false, isInternal: false };
  }

  // Treat as search query with selected private engine
  const engine = SEARCH_ENGINES[searchEngine] || SEARCH_ENGINES.duckduckgo;
  return {
    url: `${engine.urlTemplate}${encodeURIComponent(trimmed)}`,
    isSearch: true,
    isInternal: false,
    query: trimmed,
  };
}

/**
 * Resolves user input into a target navigation URL string directly
 */
export function resolveNavigationUrl(input: string, searchEngine: SearchEngine = 'duckduckgo'): string {
  return resolveOmnibarInput(input, searchEngine).url;
}

/**
 * Parses a link href into a human-readable page breadcrumb trail.
 */
export function parsePageFromHref(href: string): string {
  let path = href.replace(/^https?:\/\/[^/]+/, '');
  path = path.replace(/^\/+|\/+$/g, '').replace(/#.*$/, '').replace(/\?.*$/, '');

  if (!path) return 'Home';

  return path
    .split('/')
    .filter(Boolean)
    .map(segment =>
      segment
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
    )
    .join(SEPARATOR);
}

/**
 * Derives a short sitename from a creation prompt or URL.
 */
export function siteNameFromPrompt(prompt: string): string {
  if (prompt.startsWith('http://') || prompt.startsWith('https://')) {
    try {
      const u = new URL(prompt);
      return u.hostname.replace(/^www\./, '');
    } catch { }
  }

  if (prompt.startsWith('amn://')) {
    const page = prompt.replace('amn://', '');
    return page.charAt(0).toUpperCase() + page.slice(1);
  }

  const stopWords = new Set(['a', 'an', 'the', 'for', 'of', 'to', 'and', 'in', 'on', 'at', 'by', 'with', 'from', 'is', 'that']);
  const words = prompt
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => !stopWords.has(w.toLowerCase()))
    .slice(0, 3)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

  return words.join(' ') || 'AmniSphere';
}

export function formatBreadcrumbInput(raw: string): string {
  return raw.split('.').join(SEPARATOR);
}

export function parseBreadcrumb(display: string): Breadcrumb {
  const parts = display.split(SEPARATOR).map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) {
    return { sitename: '', page: '' };
  }
  if (parts.length === 1) {
    return { sitename: parts[0], page: '' };
  }
  return { sitename: parts[0], page: parts.slice(1).join(' › ') };
}

export function breadcrumbToDisplay(breadcrumb: Breadcrumb): string {
  if (!breadcrumb.sitename) return '';
  if (!breadcrumb.page) return breadcrumb.sitename;
  return `${breadcrumb.sitename}${SEPARATOR}${breadcrumb.page}`;
}

export function extractTitleFromHtml(html: string): Breadcrumb | null {
  const match = html.match(/<title[^>]*>(.*?)<\/title>/is);
  if (!match || !match[1].trim()) return null;

  const title = match[1].trim();

  for (const sep of [' - ', ' | ', ' — ', ' · ']) {
    const idx = title.indexOf(sep);
    if (idx > 0) {
      return {
        sitename: title.substring(0, idx).trim(),
        page: title.substring(idx + sep.length).trim(),
      };
    }
  }

  return { sitename: title, page: 'Home' };
}

export function stripTitleTag(html: string): string {
  return html.replace(/<title>[^<]*<\/title>/i, '');
}
