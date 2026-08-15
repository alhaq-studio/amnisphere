import React, { useState } from 'react';
import {
  X, Shield, Puzzle, Sparkles, Search, Lock, Info, Download, Trash2, CheckCircle2,
  ExternalLink, Moon, Sun, Monitor, Key, Plus, RefreshCw
} from 'lucide-react';
import { AmnBrowserSettings, SearchEngine, InstalledExtension, ShieldStats } from '../types';
import { SEARCH_ENGINES } from '../utils/urlHelpers';
import { StorageService } from '../services/storageService';

interface SettingsModalProps {
  settings: AmnBrowserSettings;
  shieldStats: ShieldStats;
  extensions: InstalledExtension[];
  onSaveSettings: (newSettings: AmnBrowserSettings) => void;
  onToggleExtension: (id: string) => void;
  onRemoveExtension: (id: string) => void;
  onOpenExtensionManager: () => void;
  onClose: () => void;
}

type SettingsTab = 'shield' | 'extensions' | 'ai' | 'search' | 'privacy' | 'about';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  shieldStats,
  extensions,
  onSaveSettings,
  onToggleExtension,
  onRemoveExtension,
  onOpenExtensionManager,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('shield');
  const [localSettings, setLocalSettings] = useState<AmnBrowserSettings>({ ...settings });
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [newCustomRule, setNewCustomRule] = useState('');

  const updateSetting = <K extends keyof AmnBrowserSettings>(key: K, value: AmnBrowserSettings[K]) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const updateShieldSetting = <K extends keyof AmnBrowserSettings['shield']>(key: K, value: AmnBrowserSettings['shield'][K]) => {
    const updatedShield = { ...localSettings.shield, [key]: value };
    updateSetting('shield', updatedShield);
  };

  const updateAiSetting = <K extends keyof AmnBrowserSettings['ai']>(key: K, value: AmnBrowserSettings['ai'][K]) => {
    const updatedAi = { ...localSettings.ai, [key]: value };
    updateSetting('ai', updatedAi);
  };

  const handleExportData = () => {
    const data = StorageService.exportAllUserData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amnisphere-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('Browser configuration, bookmarks, and shield rules exported.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleAddCustomBlock = () => {
    if (!newCustomRule.trim()) return;
    const rule = {
      id: `custom-${Date.now()}`,
      pattern: newCustomRule.trim(),
      category: 'trackers_telemetry' as const,
      description: 'User-defined custom block filter',
      enabled: true,
      isCustom: true,
    };
    const updatedRules = [...(localSettings.shield.customBlockPatterns || []), rule];
    updateShieldSetting('customBlockPatterns', updatedRules);
    setNewCustomRule('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700/80 rounded-2xl w-full max-w-4xl h-[650px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-gray-100 font-sans">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-600/60 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">AmniSphere Settings</h2>
              <p className="text-xs text-gray-400">Al-Haq Studio · Open Source &amp; Privacy-First</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Navigation Sidebar */}
          <div className="w-56 bg-gray-950/40 border-r border-gray-800 p-3 space-y-1 overflow-y-auto">
            <button
              onClick={() => setActiveTab('shield')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${activeTab === 'shield' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'text-gray-300 hover:bg-gray-800/60'}`}
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              Al-Haq Ethics Shield
            </button>
            <button
              onClick={() => setActiveTab('extensions')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${activeTab === 'extensions' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'text-gray-300 hover:bg-gray-800/60'}`}
            >
              <Puzzle className="w-4 h-4 text-sky-400" />
              Extensions Engine
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${activeTab === 'ai' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'text-gray-300 hover:bg-gray-800/60'}`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Utilities (BYOK)
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${activeTab === 'search' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'text-gray-300 hover:bg-gray-800/60'}`}
            >
              <Search className="w-4 h-4 text-indigo-400" />
              Search &amp; Appearance
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${activeTab === 'privacy' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'text-gray-300 hover:bg-gray-800/60'}`}
            >
              <Lock className="w-4 h-4 text-rose-400" />
              Zero-Telemetry &amp; Data
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${activeTab === 'about' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'text-gray-300 hover:bg-gray-800/60'}`}
            >
              <Info className="w-4 h-4 text-teal-400" />
              About Al-Haq Studio
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">

            {/* TAB: SHIELD */}
            {activeTab === 'shield' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Al-Haq Ethics Shield Filtering</h3>
                  <p className="text-xs text-gray-400">
                    Proactively safeguards your browsing against harmful, predatory, or tracking content based on Islamic ethics.
                  </p>
                </div>

                {/* Master Switch */}
                <div className="flex items-center justify-between p-4 bg-gray-950/60 border border-gray-800 rounded-xl">
                  <div>
                    <div className="text-sm font-semibold text-white">Master Shield Protection</div>
                    <div className="text-xs text-gray-400">Enable real-time DNS, network, and cosmetic filtering</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.shield.globalShieldEnabled}
                    onChange={(e) => updateShieldSetting('globalShieldEnabled', e.target.checked)}
                    className="w-5 h-5 accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Filter Categories */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Ethical Safeguards</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-start gap-3 p-3 bg-gray-950/40 border border-gray-800 rounded-lg cursor-pointer hover:bg-gray-950/80">
                      <input
                        type="checkbox"
                        checked={localSettings.shield.blockAdultAndNsfw}
                        onChange={(e) => updateShieldSetting('blockAdultAndNsfw', e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-emerald-500"
                      />
                      <div>
                        <div className="text-xs font-semibold text-gray-200">Block Adult &amp; NSFW Content</div>
                        <div className="text-[11px] text-gray-400">Restricts explicit, pornographic, and provocative portals.</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-gray-950/40 border border-gray-800 rounded-lg cursor-pointer hover:bg-gray-950/80">
                      <input
                        type="checkbox"
                        checked={localSettings.shield.blockGamblingAndBetting}
                        onChange={(e) => updateShieldSetting('blockGamblingAndBetting', e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-emerald-500"
                      />
                      <div>
                        <div className="text-xs font-semibold text-gray-200">Block Gambling &amp; Betting</div>
                        <div className="text-[11px] text-gray-400">Blocks online casinos, sports betting (Maysir), and lotteries.</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-gray-950/40 border border-gray-800 rounded-lg cursor-pointer hover:bg-gray-950/80">
                      <input
                        type="checkbox"
                        checked={localSettings.shield.blockPredatoryUsury}
                        onChange={(e) => updateShieldSetting('blockPredatoryUsury', e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-emerald-500"
                      />
                      <div>
                        <div className="text-xs font-semibold text-gray-200">Block Predatory Usury &amp; Scams</div>
                        <div className="text-[11px] text-gray-400">Protects against payday loan sharks (Riba) and pump-and-dump schemes.</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-gray-950/40 border border-gray-800 rounded-lg cursor-pointer hover:bg-gray-950/80">
                      <input
                        type="checkbox"
                        checked={localSettings.shield.blockTrackersAndTelemetry}
                        onChange={(e) => updateShieldSetting('blockTrackersAndTelemetry', e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-emerald-500"
                      />
                      <div>
                        <div className="text-xs font-semibold text-gray-200">Block Trackers &amp; Telemetry</div>
                        <div className="text-[11px] text-gray-400">Stops fingerprinting, session recorders, and analytics beacons.</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-gray-950/40 border border-gray-800 rounded-lg cursor-pointer hover:bg-gray-950/80">
                      <input
                        type="checkbox"
                        checked={localSettings.shield.blockInvasiveAds}
                        onChange={(e) => updateShieldSetting('blockInvasiveAds', e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-emerald-500"
                      />
                      <div>
                        <div className="text-xs font-semibold text-gray-200">Block Invasive Advertising</div>
                        <div className="text-[11px] text-gray-400">Filters behavioral banners, popups, and clickbait widgets.</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-gray-950/40 border border-gray-800 rounded-lg cursor-pointer hover:bg-gray-950/80">
                      <input
                        type="checkbox"
                        checked={localSettings.shield.enableCosmeticFiltering}
                        onChange={(e) => updateShieldSetting('enableCosmeticFiltering', e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-emerald-500"
                      />
                      <div>
                        <div className="text-xs font-semibold text-gray-200">Cosmetic DOM Filtering</div>
                        <div className="text-[11px] text-gray-400">Hides cookie consent popups, overlay banners, and empty ad slots.</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Custom Block Rule Input */}
                <div className="p-4 bg-gray-950/50 border border-gray-800 rounded-xl space-y-3">
                  <div className="text-xs font-semibold text-gray-200">Add Custom Block Pattern</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCustomRule}
                      onChange={(e) => setNewCustomRule(e.target.value)}
                      placeholder="e.g. adserver.example.com or badtracker"
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleAddCustomBlock}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Rule
                    </button>
                  </div>
                  {localSettings.shield.customBlockPatterns && localSettings.shield.customBlockPatterns.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <div className="text-[11px] text-gray-400">Custom user rules:</div>
                      {localSettings.shield.customBlockPatterns.map((r, i) => (
                        <div key={r.id || i} className="flex items-center justify-between text-xs bg-gray-900 p-2 rounded border border-gray-800">
                          <span className="font-mono text-emerald-400">{r.pattern}</span>
                          <button
                            onClick={() => {
                              const updated = localSettings.shield.customBlockPatterns.filter((_, idx) => idx !== i);
                              updateShieldSetting('customBlockPatterns', updated);
                            }}
                            className="text-gray-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: EXTENSIONS */}
            {activeTab === 'extensions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">Extension &amp; UserScript Sandbox</h3>
                    <p className="text-xs text-gray-400">
                      Standard Manifest V2/V3 WebExtensions running in isolated environments with safe runtime polyfills.
                    </p>
                  </div>
                  <button
                    onClick={onOpenExtensionManager}
                    className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Load / Create Extension
                  </button>
                </div>

                <div className="space-y-3">
                  {extensions.map((ext) => (
                    <div
                      key={ext.id}
                      className="p-4 bg-gray-950/50 border border-gray-800 rounded-xl flex items-center justify-between hover:border-gray-700 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-700/60 flex items-center justify-center text-sky-400 flex-shrink-0 mt-0.5">
                          <Puzzle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{ext.name}</span>
                            <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-mono">
                              v{ext.version}
                            </span>
                            <span className="text-[10px] bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded border border-sky-800/60">
                              MV{ext.manifestVersion}
                            </span>
                            {ext.isBuiltIn && (
                              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/60">
                                Built-in
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{ext.description}</p>
                          <div className="flex gap-2 mt-2 text-[10px] text-gray-500">
                            <span>Author: {ext.author}</span>
                            <span>·</span>
                            <span>Permissions: {ext.permissions.join(', ') || 'None'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={ext.enabled}
                          onChange={() => onToggleExtension(ext.id)}
                          className="w-5 h-5 accent-sky-500 cursor-pointer"
                        />
                        {!ext.isBuiltIn && (
                          <button
                            onClick={() => onRemoveExtension(ext.id)}
                            className="p-1.5 text-gray-500 hover:text-rose-400 rounded hover:bg-gray-800 transition"
                            title="Remove Extension"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: AI UTILITIES (BYOK) */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Modular AI Utilities (BYOK / Local Optional)</h3>
                  <p className="text-xs text-gray-400">
                    AmniSphere strictly disables all AI by default. You may optionally connect your own API key or self-hosted endpoint.
                  </p>
                </div>

                {/* Privacy & Zero-Telemetry Banner */}
                <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-200 leading-relaxed">
                    <strong>Zero-Telemetry Privacy Policy:</strong> AmniSphere will NEVER send your browsing history, active tabs, or URLs to any AI endpoint in the background. AI calls are executed <strong>only</strong> when you explicitly click an assistant action. Keys are stored locally on your device.
                  </div>
                </div>

                {/* Master AI Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-950/60 border border-gray-800 rounded-xl">
                  <div>
                    <div className="text-sm font-semibold text-white">Enable AI Utilities</div>
                    <div className="text-xs text-gray-400">Turn on page summarization, ethics advisor, and translation tools</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.ai.enabled}
                    onChange={(e) => updateAiSetting('enabled', e.target.checked)}
                    className="w-5 h-5 accent-emerald-500 cursor-pointer"
                  />
                </div>

                {localSettings.ai.enabled && (
                  <div className="space-y-4 p-4 bg-gray-950/40 border border-gray-800 rounded-xl">
                    <div>
                      <label className="block text-xs font-semibold text-gray-200 mb-1.5">AI Provider / Model Source</label>
                      <select
                        value={localSettings.ai.provider}
                        onChange={(e) => updateAiSetting('provider', e.target.value as any)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="none">Disabled / Offline Mode (No AI queries)</option>
                        <option value="gemini">Google Gemini (Bring Your Own Key)</option>
                        <option value="openai">OpenAI (Bring Your Own Key)</option>
                        <option value="custom_endpoint">Self-Hosted / Local LLM (Ollama, LM Studio, vLLM)</option>
                      </select>
                    </div>

                    {localSettings.ai.provider === 'gemini' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Gemini API Key (BYOK)</label>
                          <div className="relative">
                            <input
                              type="password"
                              value={localSettings.ai.geminiApiKey}
                              onChange={(e) => updateAiSetting('geminiApiKey', e.target.value)}
                              placeholder="Enter your Gemini API key (stored in local storage only)"
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 font-mono"
                            />
                            <Key className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Model Alias</label>
                          <input
                            type="text"
                            value={localSettings.ai.geminiModel}
                            onChange={(e) => updateAiSetting('geminiModel', e.target.value)}
                            placeholder="gemini-2.5-flash"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {localSettings.ai.provider === 'openai' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">OpenAI API Key (BYOK)</label>
                          <div className="relative">
                            <input
                              type="password"
                              value={localSettings.ai.openaiApiKey}
                              onChange={(e) => updateAiSetting('openaiApiKey', e.target.value)}
                              placeholder="sk-..."
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 font-mono"
                            />
                            <Key className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                          </div>
                        </div>
                      </div>
                    )}

                    {localSettings.ai.provider === 'custom_endpoint' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Local / Private API Endpoint</label>
                          <input
                            type="text"
                            value={localSettings.ai.customEndpointUrl}
                            onChange={(e) => updateAiSetting('customEndpointUrl', e.target.value)}
                            placeholder="http://localhost:11434/v1"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                          />
                          <p className="text-[11px] text-gray-500 mt-1">Compatible with Ollama, LM Studio, or private OpenAI-compatible proxy.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB: SEARCH & APPEARANCE */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Search &amp; Appearance</h3>
                  <p className="text-xs text-gray-400">Configure private search engines and visual preferences.</p>
                </div>

                {/* Search Engine Preset */}
                <div>
                  <label className="block text-xs font-semibold text-gray-200 mb-2">Default Private Search Engine</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(Object.keys(SEARCH_ENGINES) as SearchEngine[]).map((engineKey) => {
                      const engine = SEARCH_ENGINES[engineKey];
                      const isSelected = localSettings.defaultSearchEngine === engineKey;
                      return (
                        <div
                          key={engineKey}
                          onClick={() => updateSetting('defaultSearchEngine', engineKey)}
                          className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition ${isSelected ? 'bg-emerald-950/60 border-emerald-500 text-white' : 'bg-gray-950/40 border-gray-800 text-gray-300 hover:bg-gray-950/80'}`}
                        >
                          <span className="text-2xl">{engine.icon}</span>
                          <div>
                            <div className="text-xs font-bold">{engine.name}</div>
                            <div className="text-[10px] text-gray-400">Tracker-free search query resolver</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Theme & Extras */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Islamic Lifestyle &amp; Visuals</h4>
                  
                  <label className="flex items-center justify-between p-3.5 bg-gray-950/50 border border-gray-800 rounded-xl cursor-pointer">
                    <div>
                      <div className="text-xs font-semibold text-gray-200">Prayer Times Widget</div>
                      <div className="text-[11px] text-gray-400">Show localized Islamic prayer schedule on new tab</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.enablePrayerTimesWidget}
                      onChange={(e) => updateSetting('enablePrayerTimesWidget', e.target.checked)}
                      className="w-5 h-5 accent-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-gray-950/50 border border-gray-800 rounded-xl cursor-pointer">
                    <div>
                      <div className="text-xs font-semibold text-gray-200">Daily Quran &amp; Hadith Reflection</div>
                      <div className="text-[11px] text-gray-400">Display inspirational ethical wisdom on new tab</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.enableDailyQuranVerse}
                      onChange={(e) => updateSetting('enableDailyQuranVerse', e.target.checked)}
                      className="w-5 h-5 accent-emerald-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB: PRIVACY & DATA */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Zero-Telemetry &amp; Local Storage</h3>
                  <p className="text-xs text-gray-400">Your digital sovereignty is protected. All data resides exclusively on your local device.</p>
                </div>

                <div className="p-4 bg-gray-950/60 border border-gray-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">Full Browser Data Backup (JSON)</div>
                      <div className="text-[11px] text-gray-400">Export bookmarks, history, extensions, and shield rules</div>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-gray-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export Data
                    </button>
                  </div>
                  {exportNotice && (
                    <div className="text-xs text-emerald-400 bg-emerald-950/50 p-2 rounded border border-emerald-800/50">
                      {exportNotice}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-xl space-y-3">
                  <div className="text-xs font-semibold text-rose-300">Clear All Browsing Data</div>
                  <p className="text-[11px] text-gray-400">Permanently clears your browsing history, cached tokens, and local extension storage.</p>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear your local history and cache?')) {
                        StorageService.clearHistory();
                        alert('Browsing history cleared.');
                      }
                    }}
                    className="px-3.5 py-1.5 bg-rose-700/80 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear History &amp; Cache
                  </button>
                </div>
              </div>
            )}

            {/* TAB: ABOUT AL-HAQ STUDIO */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="p-6 bg-emerald-950/30 border border-emerald-800/50 rounded-2xl text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-900/80 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-2xl shadow-lg">
                    🛡️
                  </div>
                  <div className="font-serif text-xl text-emerald-400" style={{ fontFamily: 'Amiri, serif' }}>
                    الحَقُّ يَعْلُو وَلَا يُعْلَى عَلَيْهِ
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">AmniSphere v2.4.0 (Open Source FOSS)</h3>
                  <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
                    Designed and maintained by <strong>Al-Haq Studio</strong>. An open-source, privacy-first, Islamic ethics-aligned web browser crafted in modern TypeScript.
                  </p>
                  <div className="pt-2">
                    <a
                      href="https://alhaq.uk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition"
                    >
                      Visit Al-Haq Studio (alhaq.uk)
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-gray-950/50 border border-gray-800 rounded-xl">
                    <div className="font-bold text-emerald-400 mb-1">100% Free &amp; Open Source</div>
                    <div className="text-gray-400 text-[11px]">Free Software licensed for global dignity and open inspection.</div>
                  </div>
                  <div className="p-3 bg-gray-950/50 border border-gray-800 rounded-xl">
                    <div className="font-bold text-emerald-400 mb-1">Zero Telemetry Standard</div>
                    <div className="text-gray-400 text-[11px]">No analytics, no pingbacks, no surveillance backdoors.</div>
                  </div>
                  <div className="p-3 bg-gray-950/50 border border-gray-800 rounded-xl">
                    <div className="font-bold text-emerald-400 mb-1">Islamic Ethics Core</div>
                    <div className="text-gray-400 text-[11px]">Proactive filtering of adult content, gambling, and usurious predatory ads.</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-gray-800 bg-gray-950/80 flex items-center justify-between text-xs text-gray-400">
          <span>Official website: <a href="https://alhaq.uk" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">alhaq.uk</a></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
