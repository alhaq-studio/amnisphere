import React, { useState } from 'react';
import { X, Puzzle, Code, Play, CheckCircle, AlertCircle, Plus, FileCode, Trash2, Sliders } from 'lucide-react';
import { InstalledExtension } from '../types';
import { extensionEngineInstance } from '../services/extensionEngine';

interface ExtensionsManagerModalProps {
  extensions: InstalledExtension[];
  onRefreshExtensions: () => void;
  onClose: () => void;
}

export const ExtensionsManagerModal: React.FC<ExtensionsManagerModalProps> = ({
  extensions,
  onRefreshExtensions,
  onClose,
}) => {
  const [tab, setTab] = useState<'catalog' | 'create_ts' | 'import_json'>('catalog');
  
  // Custom TS Creator State
  const [extName, setExtName] = useState('My Custom Filter');
  const [extDesc, setExtDesc] = useState('Custom DOM modifications and safe element manipulation.');
  const [tsCode, setTsCode] = useState(`// AmniSphere TypeScript UserScript
// Access standard chrome.* APIs or standard DOM methods

console.log("[UserScript] Initialized on page:", document.title);

// Example: Add a subtle privacy badge to document
const badge = document.createElement("div");
badge.style.position = "fixed";
badge.style.bottom = "12px";
badge.style.right = "12px";
badge.style.background = "#064e3b";
badge.style.color = "#34d399";
badge.style.fontSize = "11px";
badge.style.padding = "4px 8px";
badge.style.borderRadius = "4px";
badge.style.zIndex = "999999";
badge.style.fontFamily = "sans-serif";
badge.innerText = "🛡️ Al-Haq Shield Protected";
document.body.appendChild(badge);
`);
  const [cssCode, setCssCode] = useState(`/* Custom styles injected by extension */\nbody { line-height: 1.6; }\n`);
  
  // Import JSON State
  const [jsonManifest, setJsonManifest] = useState(JSON.stringify({
    "manifest_version": 3,
    "name": "Custom Manifest V3 Extension",
    "version": "1.0.0",
    "description": "User imported extension module.",
    "permissions": ["storage", "tabs", "scripting"]
  }, null, 2));
  const [importCode, setImportCode] = useState(`console.log("[Imported Extension] Running.");`);
  
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreateTs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extName.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter an extension name.' });
      return;
    }
    extensionEngineInstance.createTypeScriptExtension(extName.trim(), extDesc.trim(), tsCode, cssCode);
    setStatusMessage({ type: 'success', text: `Extension "${extName}" installed and activated.` });
    onRefreshExtensions();
    setTimeout(() => {
      setTab('catalog');
      setStatusMessage(null);
    }, 1200);
  };

  const handleImportJson = (e: React.FormEvent) => {
    e.preventDefault();
    const result = extensionEngineInstance.installFromManifestJson(jsonManifest, importCode);
    if (result.success && result.extension) {
      setStatusMessage({ type: 'success', text: `Extension "${result.extension.name}" imported successfully.` });
      onRefreshExtensions();
      setTimeout(() => {
        setTab('catalog');
        setStatusMessage(null);
      }, 1200);
    } else {
      setStatusMessage({ type: 'error', text: result.error || 'Failed to parse manifest.' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-3xl h-[600px] flex flex-col shadow-2xl overflow-hidden text-gray-100 font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-900/60 border border-sky-600/60 flex items-center justify-center text-sky-400">
              <Puzzle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Extension Engine &amp; UserScript Sandbox</h2>
              <p className="text-xs text-gray-400">Manifest V2 / V3 WebExtensions &amp; Modern TypeScript</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-gray-800 bg-gray-950/40 flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setTab('catalog')}
            className={`pb-2.5 border-b-2 transition ${tab === 'catalog' ? 'border-sky-500 text-sky-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
          >
            Active Catalog ({extensions.length})
          </button>
          <button
            onClick={() => setTab('create_ts')}
            className={`pb-2.5 border-b-2 transition ${tab === 'create_ts' ? 'border-sky-500 text-sky-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
          >
            Create TypeScript Extension
          </button>
          <button
            onClick={() => setTab('import_json')}
            className={`pb-2.5 border-b-2 transition ${tab === 'import_json' ? 'border-sky-500 text-sky-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
          >
            Import Manifest JSON (MV2/MV3)
          </button>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className={`px-6 py-2 text-xs flex items-center gap-2 ${statusMessage.type === 'success' ? 'bg-emerald-950 text-emerald-300 border-b border-emerald-800' : 'bg-rose-950 text-rose-300 border-b border-rose-800'}`}>
            {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {statusMessage.text}
          </div>
        )}

        {/* Tab Contents */}
        <div className="flex-1 p-6 overflow-y-auto">
          
          {tab === 'catalog' && (
            <div className="space-y-3">
              {extensions.map((ext) => (
                <div key={ext.id} className="p-3.5 bg-gray-950/60 border border-gray-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 flex-shrink-0">
                      <Puzzle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{ext.name}</span>
                        <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-mono">v{ext.version}</span>
                        <span className="text-[10px] bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded">MV{ext.manifestVersion}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">{ext.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={ext.enabled}
                      onChange={() => {
                        extensionEngineInstance.toggleExtension(ext.id);
                        onRefreshExtensions();
                      }}
                      className="w-4 h-4 accent-sky-500 cursor-pointer"
                    />
                    {!ext.isBuiltIn && (
                      <button
                        onClick={() => {
                          extensionEngineInstance.removeExtension(ext.id);
                          onRefreshExtensions();
                        }}
                        className="text-gray-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'create_ts' && (
            <form onSubmit={handleCreateTs} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Extension Name</label>
                  <input
                    type="text"
                    value={extName}
                    onChange={(e) => setExtName(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    placeholder="e.g. Arabic Typographer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Description</label>
                  <input
                    type="text"
                    value={extDesc}
                    onChange={(e) => setExtDesc(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    placeholder="Brief description"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center justify-between">
                  <span>TypeScript / JavaScript Execution Script</span>
                  <span className="text-[10px] text-gray-500 font-mono">Runs with chrome.* polyfills</span>
                </label>
                <textarea
                  value={tsCode}
                  onChange={(e) => setTsCode(e.target.value)}
                  rows={8}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Injected CSS Rules (Optional)</label>
                <textarea
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-xs font-mono text-sky-300 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  Compile &amp; Install Extension
                </button>
              </div>
            </form>
          )}

          {tab === 'import_json' && (
            <form onSubmit={handleImportJson} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">manifest.json (V2 or V3)</label>
                <textarea
                  value={jsonManifest}
                  onChange={(e) => setJsonManifest(e.target.value)}
                  rows={8}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-xs font-mono text-amber-300 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">content_script.js Bundle</label>
                <textarea
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-xs font-mono text-gray-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Load Manifest Package
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
