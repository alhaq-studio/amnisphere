import { SearchEngine } from '../types';

export type SearchEngineId = SearchEngine;

export interface SearchEngineConfig {
  id: SearchEngineId;
  name: string;
  urlTemplate: string;
  icon: string;
}

export const SEARCH_ENGINES: Record<SearchEngineId, SearchEngineConfig> = {
  duckduckgo: {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    urlTemplate: 'https://duckduckgo.com/?q=',
    icon: '🦆',
  },
  searxng: {
    id: 'searxng',
    name: 'SearXNG',
    urlTemplate: 'https://searx.be/search?q=',
    icon: '🔍',
  },
  brave: {
    id: 'brave',
    name: 'Brave Search',
    urlTemplate: 'https://search.brave.com/search?q=',
    icon: '🦁',
  },
  startpage: {
    id: 'startpage',
    name: 'Startpage',
    urlTemplate: 'https://www.startpage.com/sp/search?query=',
    icon: '🔒',
  },
  qwant: {
    id: 'qwant',
    name: 'Qwant',
    urlTemplate: 'https://www.qwant.com/?q=',
    icon: '🛡️',
  },
  ecosia: {
    id: 'ecosia',
    name: 'Ecosia',
    urlTemplate: 'https://www.ecosia.org/search?q=',
    icon: '🌱',
  },
};
