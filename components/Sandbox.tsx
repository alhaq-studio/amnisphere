import React, { useRef, useEffect } from 'react';
import { FormFieldState, ConsoleLog, NetworkRequestLog } from '../types';
import { extensionEngineInstance } from '../services/extensionEngine';

interface SandboxProps {
  htmlContent: string;
  cosmeticCss: string;
  onNavigate: (href: string, linkText: string, formState?: FormFieldState[]) => void;
  onAction: (intent: string, payload?: string, formState?: FormFieldState[]) => void;
  onOpenNewTab: (url?: string) => void;
  onOpenSettings: () => void;
  onConsoleLog: (log: ConsoleLog) => void;
  onNetworkRequest: (req: NetworkRequestLog) => void;
}

const SHELL_HTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Security-Policy"
      content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https:; style-src 'unsafe-inline' https: data:; font-src https: data:; img-src https: http: data: blob:; connect-src https:; frame-src 'none';">
    <base id="amnisphere-base-tag" href="/">
    <style id="amnisphere-cosmetic-shield"></style>
    <style id="amnisphere-extension-styles"></style>
    <script id="amnisphere-core-api">
      // Capture form field state
      function getFormState() {
        const fields = [];
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(el => {
          const name = el.getAttribute('name') || el.getAttribute('id') || el.getAttribute('placeholder') || '';
          const type = el.tagName.toLowerCase() === 'select' ? 'select'
            : el.tagName.toLowerCase() === 'textarea' ? 'textarea'
            : (el.getAttribute('type') || 'text');
          let value = '';
          if (el.tagName.toLowerCase() === 'select') {
            value = el.options[el.selectedIndex]?.text || el.value;
          } else if (type === 'checkbox' || type === 'radio') {
            value = el.checked ? 'checked' : 'unchecked';
          } else {
            value = el.value;
          }
          if (value && value !== 'unchecked') {
            fields.push({ name, type, value });
          }
        });
        return fields;
      }

      // Intercept and pipe console logs to parent devtools
      const origLog = console.log;
      const origWarn = console.warn;
      const origError = console.error;

      console.log = function(...args) {
        origLog.apply(console, args);
        try {
          window.parent.postMessage({
            type: 'CONSOLE_LOG',
            level: 'log',
            message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '),
            timestamp: Date.now(),
          }, '*');
        } catch {}
      };

      console.warn = function(...args) {
        origWarn.apply(console, args);
        try {
          window.parent.postMessage({
            type: 'CONSOLE_LOG',
            level: 'warn',
            message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '),
            timestamp: Date.now(),
          }, '*');
        } catch {}
      };

      console.error = function(...args) {
        origError.apply(console, args);
        try {
          window.parent.postMessage({
            type: 'CONSOLE_LOG',
            level: 'error',
            message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '),
            timestamp: Date.now(),
          }, '*');
        } catch {}
      };

      window.FlashLiteAPI = {
        navigate: (url, text, newTab) => {
          const formState = getFormState();
          if (newTab) {
            window.parent.postMessage({ type: 'OPEN_NEW_TAB', url: url || 'amn://newtab' }, '*');
          } else {
            window.parent.postMessage({ type: 'NAVIGATE', url, text, formState }, '*');
          }
        },
        openNewTab: (url) => {
          window.parent.postMessage({ type: 'OPEN_NEW_TAB', url: url || 'amn://newtab' }, '*');
        },
        performAction: (intent, payload) => {
          const formState = getFormState();
          const lower = (intent || '').toLowerCase().trim();
          if (lower === 'open new tab' || lower === 'new tab' || lower === 'newtab' || lower === 'open_new_tab') {
            window.parent.postMessage({ type: 'OPEN_NEW_TAB', url: payload || 'amn://newtab' }, '*');
            return;
          }
          if (lower === 'open settings' || lower === 'settings' || lower === 'shield controls') {
            window.parent.postMessage({ type: 'OPEN_SETTINGS' }, '*');
            return;
          }
          if (lower === 'retry_connection' || lower === 'retry') {
            window.parent.postMessage({ type: 'NAVIGATE', url: payload || window.location.href, text: 'Retry Connection' }, '*');
            return;
          }
          window.parent.postMessage({ type: 'ACTION', intent, payload, formState }, '*');
        }
      };

      // Intercept window.open
      window.open = function(url) {
        window.parent.postMessage({ type: 'OPEN_NEW_TAB', url: url || 'amn://newtab' }, '*');
        return null;
      };

      // Intercept links
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
          const href = link.getAttribute('href') || '';
          if (!href || (href === '#' && (link.onclick || link.getAttribute('onclick')))) return;
          if (href.startsWith('javascript:')) return;

          e.preventDefault();
          const text = link.innerText || href;
          const isTargetBlank = link.getAttribute('target') === '_blank' || link.target === '_blank';
          const isSpecialClick = e.ctrlKey || e.metaKey || e.button === 1;

          let targetUrl = href;
          try {
            targetUrl = new URL(href, document.baseURI || window.location.href).href;
          } catch {}

          if (isTargetBlank || isSpecialClick) {
            window.parent.postMessage({ type: 'OPEN_NEW_TAB', url: targetUrl || 'amn://newtab' }, '*');
          } else {
            window.FlashLiteAPI.navigate(targetUrl, text);
          }
        }
      });

      // Intercept form submissions
      document.addEventListener('submit', (e) => {
        const form = e.target.closest('form') || e.target;
        if (form && form.tagName === 'FORM') {
          e.preventDefault();
          const action = form.getAttribute('action') || '';
          const method = (form.getAttribute('method') || 'GET').toUpperCase();
          const formState = getFormState();
          
          let targetUrl = action;
          try {
            targetUrl = new URL(action || window.location.href, document.baseURI || window.location.href).href;
          } catch {}

          if (method === 'GET') {
            const queryParams = formState.filter(function(f) { return f.name; }).map(function(f) {
              return encodeURIComponent(f.name) + '=' + encodeURIComponent(f.value);
            }).join('&');
            if (queryParams) {
              targetUrl = targetUrl.indexOf('?') !== -1 ? targetUrl + '&' + queryParams : targetUrl + '?' + queryParams;
            }
          }

          window.parent.postMessage({
            type: 'NAVIGATE',
            url: targetUrl,
            text: 'Form Submit',
            formState
          }, '*');
        }
      });

      // Handle message events from parent browser engine
      window.addEventListener('message', (e) => {
        if (e.data?.type === 'CONTENT_UPDATE') {
          // Update base tag if provided
          if (e.data.baseHref) {
            const baseEl = document.getElementById('amnisphere-base-tag');
            if (baseEl) baseEl.setAttribute('href', e.data.baseHref);
          }

          document.body.innerHTML = e.data.html;
          document.body.className = 'min-h-screen ' + (e.data.bodyClasses || '');
          document.body.setAttribute('style', e.data.bodyStyle || '');
          document.documentElement.style.colorScheme = e.data.colorScheme || 'dark';

          // Update cosmetic filtering styles
          const shieldStyle = document.getElementById('amnisphere-cosmetic-shield');
          if (shieldStyle && e.data.cosmeticCss) {
            shieldStyle.textContent = e.data.cosmeticCss;
          }

          // Update extension custom styles
          const extStyle = document.getElementById('amnisphere-extension-styles');
          if (extStyle && e.data.extensionCss) {
            extStyle.textContent = e.data.extensionCss;
          }

          // Inject head link stylesheets
          document.head.querySelectorAll('link[data-proxy-link]').forEach(el => el.remove());
          (e.data.headLinks || []).forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.setAttribute('data-proxy-link', 'true');
            document.head.appendChild(link);
          });

          // Inject head styles
          document.head.querySelectorAll('style[data-proxy-style]').forEach(el => el.remove());
          (e.data.headStyles || []).forEach(css => {
            const style = document.createElement('style');
            style.setAttribute('data-proxy-style', 'true');
            style.textContent = css;
            document.head.appendChild(style);
          });

          // Inject fonts
          document.head.querySelectorAll('link[data-amn-font]').forEach(el => el.remove());
          (e.data.linkTags || []).forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.setAttribute('data-amn-font', 'true');
            document.head.appendChild(link);
          });

          // Inject and execute active extensions in sandboxed scope
          if (e.data.extensionScript) {
            try {
              const scriptEl = document.createElement('script');
              scriptEl.textContent = e.data.extensionScript;
              document.body.appendChild(scriptEl);
            } catch (err) {
              console.error('Extension injection error:', err);
            }
          }
        }

        if (e.data?.type === 'EXEC_COMMAND') {
          try {
            const result = eval(e.data.code);
            console.log('Eval result:', result);
          } catch (err) {
            console.error('Eval error:', err);
          }
        }
      });

      window.parent.postMessage({ type: 'SANDBOX_READY' }, '*');
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
    <style>
      html { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
      body { -webkit-font-smoothing: antialiased; }
      input, textarea, select, button { color: inherit; }
      ::placeholder { opacity: 0.5; }
    </style>
  </head>
  <body class="min-h-screen" style="background-color: #090d16; color: #f1f5f9;"></body>
</html>`;

export const Sandbox: React.FC<SandboxProps> = ({
  htmlContent,
  cosmeticCss,
  onNavigate,
  onAction,
  onOpenNewTab,
  onOpenSettings,
  onConsoleLog,
  onNetworkRequest,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeReadyRef = useRef(false);
  const pendingContentRef = useRef<any>(null);

  const sendContentUpdate = (message: any) => {
    if (iframeReadyRef.current && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(message, '*');
    } else {
      pendingContentRef.current = message;
    }
  };

  useEffect(() => {
    if (!htmlContent) return;

    let cleanContent = htmlContent;
    const isDark = !/<meta\s+name=["']color-scheme["']\s+content=["']light["']/i.test(htmlContent);

    // Extract base href
    let extractedBaseHref = '';
    const baseMatch = htmlContent.match(/<base[^>]*href=["']([^"']+)["']/i);
    if (baseMatch) {
      extractedBaseHref = baseMatch[1];
    }

    // Extract fonts & head links
    const headMatch = htmlContent.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const fontHrefs: string[] = [];
    const headLinks: string[] = [];
    const headStyles: string[] = [];

    if (headMatch) {
      const headHtml = headMatch[1];
      const linkMatches = headHtml.match(/<link[^>]*>/gi);
      if (linkMatches) {
        linkMatches.forEach(tag => {
          const hrefMatch = tag.match(/href="([^"]+)"/i) || tag.match(/href='([^']+)'/i);
          const relMatch = tag.match(/rel="([^"]+)"/i) || tag.match(/rel='([^']+)'/i);
          if (hrefMatch) {
            const href = hrefMatch[1];
            if (href.startsWith('https://fonts.googleapis.com/')) {
              fontHrefs.push(href);
            } else if (relMatch && relMatch[1].includes('stylesheet')) {
              headLinks.push(href);
            }
          }
        });
      }

      const styleMatches = headHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
      if (styleMatches) {
        styleMatches.forEach(tag => {
          const innerCss = tag.replace(/<\/?style[^>]*>/gi, '');
          if (innerCss.trim()) headStyles.push(innerCss);
        });
      }
    }

    const bodyClassMatch = htmlContent.match(/<body[^>]*class="([^"]*)"/i) || htmlContent.match(/<body[^>]*class='([^']*)'/i);
    const bodyClasses = bodyClassMatch ? bodyClassMatch[1] : '';

    const bodyStyleMatch = htmlContent.match(/<body[^>]*style="([^"]*)"/i) || htmlContent.match(/<body[^>]*style='([^']*)'/i);
    const bodyInlineStyle = bodyStyleMatch ? bodyStyleMatch[1] : '';

    const bodyMatch = cleanContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
      cleanContent = bodyMatch[1];
    } else {
      cleanContent = cleanContent
        .replace(/<\/?html[^>]*>/gi, '')
        .replace(/<head>[\s\S]*?<\/head>/gi, '')
        .replace(/<title>[^<]*<\/title>/gi, '')
        .replace(/<meta[^>]*>/gi, '')
        .replace(/<\/?body[^>]*>/gi);
    }

    // Get active extensions bundle
    const extBundle = extensionEngineInstance.generateSandboxExtensionInjection();

    sendContentUpdate({
      type: 'CONTENT_UPDATE',
      html: cleanContent,
      baseHref: extractedBaseHref,
      headLinks,
      headStyles,
      bodyClasses,
      bodyStyle: `background-color: ${isDark ? '#090d16' : '#ffffff'}; color: ${isDark ? '#f1f5f9' : '#0f172a'}; ${bodyInlineStyle}`,
      colorScheme: isDark ? 'dark' : 'light',
      linkTags: fontHrefs,
      cosmeticCss,
      extensionCss: extBundle.css,
      extensionScript: extBundle.script,
    });

    if (iframeRef.current) {
      iframeRef.current.style.background = isDark ? '#090d16' : '#ffffff';
    }
  }, [htmlContent, cosmeticCss]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;

      if (event.data?.type === 'SANDBOX_READY') {
        iframeReadyRef.current = true;
        if (pendingContentRef.current) {
          iframeRef.current?.contentWindow?.postMessage(pendingContentRef.current, '*');
          pendingContentRef.current = null;
        }
        return;
      }

      if (event.data?.type === 'OPEN_NEW_TAB') {
        onOpenNewTab(event.data.url);
        return;
      }

      if (event.data?.type === 'OPEN_SETTINGS') {
        onOpenSettings();
        return;
      }

      if (event.data?.type === 'NAVIGATE') {
        const href = event.data.url || '';
        const linkText = event.data.text || href || 'Navigate';
        const formState = event.data.formState;
        onNavigate(href, linkText, formState);
      }

      if (event.data?.type === 'ACTION') {
        onAction(event.data.intent, event.data.payload, event.data.formState);
      }

      if (event.data?.type === 'CONSOLE_LOG') {
        onConsoleLog({
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          level: event.data.level,
          message: event.data.message,
          timestamp: event.data.timestamp,
        });
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onNavigate, onAction, onOpenNewTab, onOpenSettings, onConsoleLog]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-none bg-gray-950"
      srcDoc={SHELL_HTML}
      sandbox="allow-scripts allow-forms allow-same-origin"
      title="AmniSphere Isolated Sandbox"
    />
  );
};
