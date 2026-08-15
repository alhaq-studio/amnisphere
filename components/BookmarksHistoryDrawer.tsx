import React, { useState } from 'react';
import { X, Bookmark, History, Search, Plus, Trash2, ExternalLink } from 'lucide-react';
import { BookmarkItem, HistoryItem } from '../types';

interface BookmarksHistoryDrawerProps {
  mode: 'bookmarks' | 'history';
  bookmarks: BookmarkItem[];
  history: HistoryItem[];
  currentTitle: string;
  currentUrl: string;
  onNavigate: (url: string) => void;
  onAddBookmark: (title: string, url: string) => void;
  onRemoveBookmark: (id: string) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export const BookmarksHistoryDrawer: React.FC<BookmarksHistoryDrawerProps> = ({
  mode: initialMode,
  bookmarks,
  history,
  currentTitle,
  currentUrl,
  onNavigate,
  onAddBookmark,
  onRemoveBookmark,
  onClearHistory,
  onClose,
}) => {
  const [mode, setMode] = useState<'bookmarks' | 'history'>(initialMode);
  const [searchQuery, setSearchQuery] = useState('');

  const isCurrentBookmarked = bookmarks.some(b => b.url === currentUrl);

  const filteredBookmarks = bookmarks.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = history.filter(h =>
    h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-gray-900 border-l border-gray-800 shadow-2xl z-50 flex flex-col font-sans text-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/60">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('bookmarks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${mode === 'bookmarks' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Bookmarks
          </button>
          <button
            onClick={() => setMode('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${mode === 'history' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <History className="w-3.5 h-3.5" />
            History
          </button>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Add Bar */}
      <div className="p-3 border-b border-gray-800 bg-gray-950/30 space-y-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${mode}...`}
            className="w-full bg-gray-950 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
        </div>

        {mode === 'bookmarks' && currentUrl && !currentUrl.startsWith('amn://') && (
          <button
            onClick={() => onAddBookmark(currentTitle || currentUrl, currentUrl)}
            disabled={isCurrentBookmarked}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${isCurrentBookmarked ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'}`}
          >
            <Plus className="w-3.5 h-3.5" />
            {isCurrentBookmarked ? 'Already Bookmarked' : 'Bookmark Current Page'}
          </button>
        )}

        {mode === 'history' && history.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={onClearHistory}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear History
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {mode === 'bookmarks' && (
          filteredBookmarks.length === 0 ? (
            <div className="text-center text-xs text-gray-500 py-8">No bookmarks found.</div>
          ) : (
            filteredBookmarks.map((bm) => (
              <div
                key={bm.id}
                className="p-2.5 bg-gray-950/40 hover:bg-gray-800/80 border border-gray-800/80 rounded-xl flex items-center justify-between group transition cursor-pointer"
                onClick={() => onNavigate(bm.url)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base flex-shrink-0">{bm.icon || '📌'}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-200 truncate group-hover:text-emerald-400">{bm.title}</div>
                    <div className="text-[10px] text-gray-500 truncate font-mono">{bm.url}</div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBookmark(bm.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-rose-400 transition"
                  title="Delete Bookmark"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )
        )}

        {mode === 'history' && (
          filteredHistory.length === 0 ? (
            <div className="text-center text-xs text-gray-500 py-8">No browsing history recorded.</div>
          ) : (
            filteredHistory.map((h) => (
              <div
                key={h.id}
                className="p-2.5 bg-gray-950/40 hover:bg-gray-800/80 border border-gray-800/80 rounded-xl flex items-center justify-between group transition cursor-pointer"
                onClick={() => onNavigate(h.url)}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-gray-200 truncate group-hover:text-emerald-400">{h.title}</div>
                  <div className="text-[10px] text-gray-500 truncate font-mono">{h.url}</div>
                  <div className="text-[9px] text-gray-600 mt-0.5">{new Date(h.timestamp).toLocaleTimeString()}</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 flex-shrink-0" />
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};
