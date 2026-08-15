import React, { useState } from 'react';
import {
  ShieldCheck, Search, Sparkles, ExternalLink, Bookmark,
  Clock, Compass, Moon, Sun, Lock, ChevronRight, CheckCircle2
} from 'lucide-react';
import { AmnBrowserSettings, BookmarkItem, SearchEngine, ShieldStats } from '../types';
import { SEARCH_ENGINES } from '../utils/urlHelpers';

interface NewTabProps {
  settings: AmnBrowserSettings;
  shieldStats: ShieldStats;
  bookmarks: BookmarkItem[];
  onNavigate: (type: 'url' | 'create', target: string) => void;
  onOpenSettings: () => void;
}

const ISLAMIC_REFLECTIONS = [
  {
    surah: 'Surah Al-Baqarah (2:286)',
    arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    translation: 'Allah does not burden a soul beyond that it can bear.',
  },
  {
    surah: 'Surah Ash-Sharh (94:6)',
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'Indeed, with hardship comes ease.',
  },
  {
    surah: 'Surah Al-Isra (17:81)',
    arabic: 'وَقُلْ جَاءَ الْحَقُّ وَزَهَقَ الْبَاطِلُ',
    translation: 'And say, "Truth has come, and falsehood has departed."',
  },
  {
    surah: 'Hadith — Sahih al-Bukhari',
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
    translation: 'Actions are judged strictly by intentions.',
  },
];

const PRESET_TOPICS = [
  "Islamic Golden Age science and astronomy advances",
  "Zero-knowledge cryptography and privacy-preserving protocols",
  "Open source operating systems architecture roadmap",
  "Clean typography reader for Quranic commentary and reflection",
  "Ethical financial ledger with zero-interest profit sharing models",
  "Global environmental restoration and water conservation dashboard",
];

export const NewTab: React.FC<NewTabProps> = ({
  settings,
  shieldStats,
  bookmarks,
  onNavigate,
  onOpenSettings,
}) => {
  const [query, setQuery] = useState('');
  const [activeEngine, setActiveEngine] = useState<SearchEngine>(settings.defaultSearchEngine);
  const [reflectionIndex] = useState(() => Math.floor(Math.random() * ISLAMIC_REFLECTIONS.length));

  const reflection = ISLAMIC_REFLECTIONS[reflectionIndex] || ISLAMIC_REFLECTIONS[0];
  const engine = SEARCH_ENGINES[activeEngine] || SEARCH_ENGINES.duckduckgo;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onNavigate('url', query.trim());
  };

  const handleTopicClick = (topic: string) => {
    onNavigate('create', topic);
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100 flex flex-col items-center justify-between p-6 sm:p-10 font-sans overflow-y-auto select-none">
      
      {/* Top Bar Status */}
      <div className="w-full max-w-4xl flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/40 rounded-full text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-semibold">Al-Haq Ethics Shield: Active</span>
          </div>
          <span className="hidden sm:inline text-gray-500 font-mono">
            {shieldStats.totalBlocked.toLocaleString()} threats filtered
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('url', 'https://alhaq.uk')}
            className="flex items-center gap-1 text-gray-400 hover:text-emerald-400 transition"
          >
            Al-Haq Studio
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Center Stage */}
      <div className="w-full max-w-2xl my-auto py-8 space-y-8 text-center">
        
        {/* Brand Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-600/60 shadow-xl text-2xl mb-1">
            🛡️
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            AmniSphere
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
            Privacy-First · Islamic Ethics-Aligned · 100% Zero-Telemetry
          </p>
        </div>

        {/* Omnibar / Search Box */}
        <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto">
          <div className="flex items-center bg-gray-900/90 border border-gray-700/90 hover:border-gray-600 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-2xl p-2 shadow-2xl transition">
            <span className="text-xl pl-2 pr-1 select-none">{engine.icon}</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search privately with ${engine.name} or type a URL...`}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1"
            >
              Search
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Engine Selector Pill List */}
          <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-gray-400">
            <span className="text-gray-500">Private Search:</span>
            {(['duckduckgo', 'searxng', 'brave', 'startpage'] as SearchEngine[]).map((eKey) => (
              <button
                key={eKey}
                type="button"
                onClick={() => setActiveEngine(eKey)}
                className={`px-2 py-0.5 rounded-full transition ${activeEngine === eKey ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800' : 'hover:text-gray-200'}`}
              >
                {SEARCH_ENGINES[eKey].name.split(' ')[0]}
              </button>
            ))}
          </div>
        </form>

        {/* Quick Bookmarks Shortcuts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto pt-2">
          {bookmarks.slice(0, 4).map((bm) => (
            <div
              key={bm.id}
              onClick={() => onNavigate('url', bm.url)}
              className="p-3 bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800/80 hover:border-gray-700 rounded-xl cursor-pointer transition flex flex-col items-center gap-1.5 shadow"
            >
              <span className="text-xl">{bm.icon || '📌'}</span>
              <span className="text-xs font-semibold text-gray-200 truncate w-full">{bm.title}</span>
            </div>
          ))}
        </div>

        {/* Daily Spiritual Wisdom & Ethical Reminder */}
        {settings.enableDailyQuranVerse && (
          <div className="max-w-xl mx-auto p-4 bg-emerald-950/20 border border-emerald-800/30 rounded-2xl text-left space-y-1.5 shadow">
            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
              <span>{reflection.surah}</span>
              <span className="text-emerald-500/80">Al-Haq Reflection</span>
            </div>
            <div className="text-right text-base text-emerald-200 font-serif" style={{ fontFamily: 'Amiri, serif' }}>
              {reflection.arabic}
            </div>
            <p className="text-xs text-gray-300 italic">
              "{reflection.translation}"
            </p>
          </div>
        )}

        {/* Explore Ethical Generative Web Prompts */}
        <div className="max-w-xl mx-auto text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Explore Topics &amp; Web Apps
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TOPICS.map((topic, i) => (
              <button
                key={i}
                onClick={() => handleTopicClick(topic)}
                className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-emerald-700/60 text-gray-300 hover:text-white rounded-lg text-xs transition text-left"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Footer */}
      <div className="w-full max-w-4xl pt-4 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
        <div>
          AmniSphere v2.4.0 · Built with integrity by{' '}
          <button
            onClick={() => onNavigate('url', 'https://alhaq.uk')}
            className="text-emerald-400 hover:underline inline font-medium"
          >
            Al-Haq Studio (alhaq.uk)
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onOpenSettings} className="hover:text-gray-300 transition">Shield Controls</button>
          <span>·</span>
          <span>100% Free and Open Source (FOSS)</span>
        </div>
      </div>

    </div>
  );
};
