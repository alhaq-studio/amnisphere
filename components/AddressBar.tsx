import React, { useState, useRef, useEffect } from 'react';
import { SEARCH_ENGINES, SearchEngineId } from '../utils/searchEngines';
import { resolveNavigationUrl } from '../utils/urlHelpers';

export interface AddressBarProps {
  currentUrl: string;
  onNavigate: (url: string) => void;
  defaultEngine?: SearchEngineId;
  shieldBadge?: React.ReactNode;
  actions?: React.ReactNode;
}

export const AddressBar: React.FC<AddressBarProps> = ({
  currentUrl,
  onNavigate,
  defaultEngine = 'duckduckgo',
  shieldBadge,
  actions,
}) => {
  const [selectedEngine, setSelectedEngine] = useState<SearchEngineId>(defaultEngine);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState(currentUrl);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUrl.startsWith('amn://newtab') || currentUrl === 'about:blank') {
      setInputValue('');
    } else {
      setInputValue(currentUrl);
    }
  }, [currentUrl]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const resolved = resolveNavigationUrl(inputValue, selectedEngine);
      onNavigate(resolved);
    }
  };

  const activeEngine = SEARCH_ENGINES[selectedEngine] || SEARCH_ENGINES.duckduckgo;

  return (
    <div className="flex-1 flex items-center h-[34px] px-2 bg-[#161B22] hover:bg-[#1C2128] focus-within:bg-[#161B22] focus-within:ring-1 focus-within:ring-emerald-500/50 border border-white/[0.08] rounded-lg transition-all relative">
      
      {/* Integrated Privacy/Shield Badge */}
      {shieldBadge}

      {/* Search Engine Selector */}
      <div className="relative mr-2" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1.5 p-1 rounded hover:bg-white/[0.08] transition-colors"
          title={`Active Engine: ${activeEngine.name}`}
        >
          <span>{activeEngine.icon}</span>
          <svg className="w-2.5 h-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-[130%] left-0 w-44 py-1 bg-[#1A1F29] border border-white/[0.1] rounded-lg shadow-2xl z-50 backdrop-blur-md">
            {Object.values(SEARCH_ENGINES).map((engine) => (
              <button
                key={engine.id}
                type="button"
                onClick={() => {
                  setSelectedEngine(engine.id);
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                  selectedEngine === engine.id
                    ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                    : 'text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                <span>{engine.icon}</span>
                <span>{engine.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Search with ${activeEngine.name} or type a URL`}
        className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none font-mono"
      />

      {/* Trailing Actions */}
      {actions}
    </div>
  );
};
