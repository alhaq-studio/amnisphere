import React from 'react';
import { ConsoleLog, FormFieldState, NetworkRequestLog } from '../types';

export interface SandboxProps {
  url?: string;
  isActive?: boolean;
  htmlContent?: string;
  cosmeticCss?: string;
  onNavigate?: (href: string, linkText: string, formState?: FormFieldState[]) => void;
  onAction?: (intent: string, payload?: string, formState?: FormFieldState[]) => void;
  onOpenNewTab?: (url?: string) => void;
  onOpenSettings?: () => void;
  onConsoleLog?: (log: ConsoleLog) => void;
  onNetworkRequest?: (req: NetworkRequestLog) => void;
}

export const Sandbox: React.FC<SandboxProps> = ({
  url = '',
  isActive = true,
  htmlContent,
}) => {
  if (!isActive) return null;

  // Internal blank/new tab handler
  if (!url || url === 'about:blank' || url === 'amn://newtab' || url === 'amni://newtab') {
    return null;
  }

  // If htmlContent is an offline error or ethics block page, render directly via srcDoc
  if (htmlContent && (htmlContent.includes('Al-Haq Ethics Shield') || htmlContent.includes('Connection Error'))) {
    return (
      <div className="w-full h-full relative bg-gray-950">
        <iframe
          srcDoc={htmlContent}
          title="AmniSphere Isolated Sandbox"
          className="w-full h-full border-none block"
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;

  return (
    <div className="w-full h-full relative bg-white">
      <iframe
        src={proxyUrl}
        title="AmniSphere Browser Viewport"
        className="w-full h-full border-none block"
        // Notice: Omitting 'allow-top-navigation' stops the page from breaking your outer React shell
        sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
