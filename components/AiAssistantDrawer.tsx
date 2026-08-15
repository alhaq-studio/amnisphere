import React, { useState } from 'react';
import { X, Sparkles, BookOpen, ShieldCheck, Languages, CheckCircle, RefreshCw, Key, ExternalLink } from 'lucide-react';
import { AiSettings } from '../types';
import { summarizeContent, ethicsAuditContent } from '../services/geminiService';

interface AiAssistantDrawerProps {
  currentTitle: string;
  currentHtml: string;
  aiSettings: AiSettings;
  onOpenSettings: () => void;
  onClose: () => void;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  currentTitle,
  currentHtml,
  aiSettings,
  onOpenSettings,
  onClose,
}) => {
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');

  const extractPlainText = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const handleSummarize = async () => {
    setLoading(true);
    setCurrentAction('Summarizing Article...');
    const plain = extractPlainText(currentHtml);
    const res = await summarizeContent(plain, aiSettings);
    setOutput(res);
    setLoading(false);
  };

  const handleEthicsAudit = async () => {
    setLoading(true);
    setCurrentAction('Analyzing Ethics & Halal Standards...');
    const plain = extractPlainText(currentHtml);
    const res = await ethicsAuditContent(plain, aiSettings);
    setOutput(res);
    setLoading(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-84 bg-gray-900 border-l border-gray-800 shadow-2xl z-50 flex flex-col font-sans text-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-600/60 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">AI Assistant (BYOK)</h3>
            <p className="text-[10px] text-gray-400">Strict on-demand processing</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="p-3 border-b border-gray-800 bg-gray-950/30 space-y-2">
        <div className="text-[11px] font-semibold text-gray-300">Choose On-Demand Action:</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSummarize}
            disabled={loading}
            className="p-2 bg-gray-950/80 hover:bg-gray-800 border border-gray-800 rounded-lg text-left transition flex flex-col gap-1 text-xs"
          >
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              Summarize
            </div>
            <span className="text-[10px] text-gray-400">Key takeaway bullets</span>
          </button>

          <button
            onClick={handleEthicsAudit}
            disabled={loading}
            className="p-2 bg-gray-950/80 hover:bg-gray-800 border border-gray-800 rounded-lg text-left transition flex flex-col gap-1 text-xs"
          >
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Ethics Audit
            </div>
            <span className="text-[10px] text-gray-400">Halal &amp; truthfulness check</span>
          </button>
        </div>

        {!aiSettings.geminiApiKey && aiSettings.provider !== 'custom_endpoint' && aiSettings.provider !== 'openai' && (
          <div className="p-2 bg-amber-950/40 border border-amber-800/50 rounded-lg flex items-center justify-between text-[11px] text-amber-300">
            <span>Add API Key to unlock full AI</span>
            <button onClick={onOpenSettings} className="underline font-bold">Configure</button>
          </div>
        )}
      </div>

      {/* Output Panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
            <div className="text-xs font-medium text-gray-300">{currentAction}</div>
          </div>
        ) : output ? (
          <div className="p-3 bg-gray-950/60 border border-gray-800 rounded-xl space-y-2">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Assistant Result
            </div>
            <div className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">
              {output}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-gray-500 space-y-2">
            <Sparkles className="w-8 h-8 mx-auto text-gray-700" />
            <p>Select an action above to analyze the current web page.</p>
            <p className="text-[10px] text-gray-600">Zero data is sent without your explicit trigger.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800 bg-gray-950/90 text-[10px] text-gray-500 text-center">
        Powered by Al-Haq Studio Privacy Principles
      </div>
    </div>
  );
};
