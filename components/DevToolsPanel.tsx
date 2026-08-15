import React, { useState } from 'react';
import { X, Terminal, Globe, Code2, Database, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { ConsoleLog, NetworkRequestLog } from '../types';

interface DevToolsPanelProps {
  consoleLogs: ConsoleLog[];
  networkLogs: NetworkRequestLog[];
  currentHtml: string;
  onClearConsole: () => void;
  onClearNetwork: () => void;
  onExecuteCommand: (code: string) => void;
  onClose: () => void;
}

export const DevToolsPanel: React.FC<DevToolsPanelProps> = ({
  consoleLogs,
  networkLogs,
  currentHtml,
  onClearConsole,
  onClearNetwork,
  onExecuteCommand,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'console' | 'network' | 'elements' | 'storage'>('console');
  const [commandInput, setCommandInput] = useState('');

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commandInput.trim()) {
      onExecuteCommand(commandInput.trim());
      setCommandInput('');
    }
  };

  return (
    <div className="h-64 bg-gray-950 border-t border-gray-800 flex flex-col font-mono text-xs text-gray-200 z-40 select-text">
      {/* DevTools Tab Bar */}
      <div className="flex items-center justify-between px-4 bg-gray-900 border-b border-gray-800 select-none">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-2 flex items-center gap-1.5 font-medium transition ${activeTab === 'console' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-gray-950/60' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Console ({consoleLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`px-3 py-2 flex items-center gap-1.5 font-medium transition ${activeTab === 'network' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-gray-950/60' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Globe className="w-3.5 h-3.5" />
            Network ({networkLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('elements')}
            className={`px-3 py-2 flex items-center gap-1.5 font-medium transition ${activeTab === 'elements' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-gray-950/60' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Elements / Source
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`px-3 py-2 flex items-center gap-1.5 font-medium transition ${activeTab === 'storage' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-gray-950/60' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Database className="w-3.5 h-3.5" />
            Storage Sandbox
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'console' && (
            <button onClick={onClearConsole} className="p-1 hover:text-rose-400 text-gray-400" title="Clear console">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {activeTab === 'network' && (
            <button onClick={onClearNetwork} className="p-1 hover:text-rose-400 text-gray-400" title="Clear network log">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:text-white text-gray-400" title="Close DevTools">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DevTools Body */}
      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'console' && (
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-1 overflow-y-auto max-h-44 font-mono">
              {consoleLogs.length === 0 ? (
                <div className="text-gray-600 italic py-2">Console empty. Ready for sandbox logs...</div>
              ) : (
                consoleLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`py-0.5 px-2 rounded flex items-start gap-2 ${log.level === 'error' ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500' : log.level === 'warn' ? 'bg-amber-950/40 text-amber-300 border-l-2 border-amber-500' : 'text-gray-300'}`}
                  >
                    <span className="text-gray-600 select-none">&gt;</span>
                    <span className="flex-1 break-all">{log.message}</span>
                  </div>
                ))
              )}
            </div>

            {/* Console Input Bar */}
            <form onSubmit={handleCommandSubmit} className="mt-2 flex items-center gap-2 border-t border-gray-800 pt-1.5">
              <span className="text-emerald-400 font-bold select-none">&gt;</span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Execute JavaScript in isolated sandbox..."
                className="flex-1 bg-transparent text-white focus:outline-none placeholder-gray-600 font-mono"
              />
            </form>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="py-1 px-2">Status</th>
                  <th className="py-1 px-2">Method</th>
                  <th className="py-1 px-2">Resource URL</th>
                  <th className="py-1 px-2">Type</th>
                  <th className="py-1 px-2">Shield Directive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900">
                {networkLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-3 text-center text-gray-600">No network activity recorded.</td>
                  </tr>
                ) : (
                  networkLogs.map((req) => (
                    <tr key={req.id} className={req.status === 'BLOCKED' ? 'bg-rose-950/20 text-rose-300' : 'hover:bg-gray-900'}>
                      <td className="py-1 px-2 font-bold">
                        {req.status === 'BLOCKED' ? (
                          <span className="text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded text-[10px]">BLOCKED</span>
                        ) : (
                          <span className="text-emerald-400">{req.status}</span>
                        )}
                      </td>
                      <td className="py-1 px-2 text-gray-400">{req.method}</td>
                      <td className="py-1 px-2 font-mono truncate max-w-xs text-gray-300" title={req.url}>{req.url}</td>
                      <td className="py-1 px-2 text-gray-400">{req.type}</td>
                      <td className="py-1 px-2 text-emerald-400">{req.blockedBy || 'Passed Safe'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'elements' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-gray-400 text-[11px] pb-1 border-b border-gray-800">
              <span>Sanitized Active DOM View</span>
              <button
                onClick={() => navigator.clipboard.writeText(currentHtml)}
                className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded"
              >
                Copy Source
              </button>
            </div>
            <pre className="text-[11px] font-mono text-emerald-300/90 whitespace-pre-wrap overflow-x-auto max-h-44 p-2 bg-gray-950 rounded">
              {currentHtml || '<!-- No active page rendered -->'}
            </pre>
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="p-2 space-y-2 text-gray-300">
            <div className="text-xs font-semibold text-emerald-400">Isolated Storage Sandbox</div>
            <p className="text-[11px] text-gray-400">
              All browser storage (IndexedDB, LocalStorage) is partitioned strictly per session and zero telemetry is gathered.
            </p>
            <div className="p-3 bg-gray-900 rounded border border-gray-800">
              <div className="text-[11px] text-gray-400">Session Storage: <span className="text-white font-mono">Clean / Partitioned</span></div>
              <div className="text-[11px] text-gray-400">Third-Party Tracking Cookies: <span className="text-emerald-400 font-bold">0 (Blocked by Default)</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
