import { InstalledExtension, ManifestV2orV3 } from '../types';
import { BUILTIN_EXTENSIONS } from './builtinExtensions';
import { StorageService } from './storageService';

export class ExtensionEngine {
  private extensions: InstalledExtension[] = [];

  constructor() {
    this.loadExtensions();
  }

  public loadExtensions(): InstalledExtension[] {
    const saved = StorageService.loadInstalledExtensions();
    if (saved && saved.length > 0) {
      this.extensions = saved;
    } else {
      this.extensions = BUILTIN_EXTENSIONS;
      StorageService.saveInstalledExtensions(this.extensions);
    }
    return this.extensions;
  }

  public getExtensions(): InstalledExtension[] {
    return this.extensions;
  }

  public getEnabledExtensions(): InstalledExtension[] {
    return this.extensions.filter(ext => ext.enabled);
  }

  public toggleExtension(id: string, enabled?: boolean): InstalledExtension[] {
    this.extensions = this.extensions.map(ext => {
      if (ext.id === id) {
        const nextState = enabled !== undefined ? enabled : !ext.enabled;
        return { ...ext, enabled: nextState };
      }
      return ext;
    });
    StorageService.saveInstalledExtensions(this.extensions);
    return this.extensions;
  }

  public removeExtension(id: string): InstalledExtension[] {
    this.extensions = this.extensions.filter(ext => ext.id !== id);
    StorageService.saveInstalledExtensions(this.extensions);
    return this.extensions;
  }

  public installFromManifestJson(jsonString: string, userCode = '', userCss = ''): { success: boolean; extension?: InstalledExtension; error?: string } {
    try {
      const manifest: ManifestV2orV3 = JSON.parse(jsonString);
      if (!manifest.name || !manifest.version) {
        return { success: false, error: 'Manifest must contain "name" and "version".' };
      }
      if (manifest.manifest_version !== 2 && manifest.manifest_version !== 3) {
        return { success: false, error: 'Only Manifest V2 and V3 are supported.' };
      }

      const id = `ext-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newExtension: InstalledExtension = {
        id,
        name: manifest.name,
        version: manifest.version,
        description: manifest.description || 'Custom WebExtension loaded into AmniSphere.',
        author: manifest.author || 'User Defined',
        enabled: true,
        manifestVersion: manifest.manifest_version,
        manifestRaw: jsonString,
        code: userCode || `// Extension initialized\nconsole.log("[${manifest.name}] Loaded successfully.");`,
        css: userCss,
        permissions: manifest.permissions || [],
        isBuiltIn: false,
        storage: {},
        hasPopup: !!(manifest.action?.default_popup || manifest.browser_action?.default_popup),
        popupHtml: `<div style="padding: 12px; font-family: sans-serif; color: #fff; background: #111;"><h4>${manifest.name}</h4><p>Extension active</p></div>`,
      };

      this.extensions.push(newExtension);
      StorageService.saveInstalledExtensions(this.extensions);
      return { success: true, extension: newExtension };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Invalid JSON manifest.' };
    }
  }

  public createTypeScriptExtension(name: string, description: string, tsCode: string, css = ''): InstalledExtension {
    const id = `ext-ts-${Date.now()}`;
    const manifest: ManifestV2orV3 = {
      manifest_version: 3,
      name,
      version: '1.0.0',
      description,
      permissions: ['storage', 'tabs', 'scripting'],
    };

    const newExt: InstalledExtension = {
      id,
      name,
      version: '1.0.0',
      description,
      author: 'AmniSphere User',
      enabled: true,
      manifestVersion: 3,
      manifestRaw: JSON.stringify(manifest, null, 2),
      code: tsCode,
      css,
      permissions: manifest.permissions || [],
      isBuiltIn: false,
      storage: {},
      hasPopup: false,
    };

    this.extensions.push(newExt);
    StorageService.saveInstalledExtensions(this.extensions);
    return newExt;
  }

  public updateExtensionCode(id: string, code: string, css: string): InstalledExtension | null {
    let updated: InstalledExtension | null = null;
    this.extensions = this.extensions.map(ext => {
      if (ext.id === id) {
        updated = { ...ext, code, css };
        return updated;
      }
      return ext;
    });
    if (updated) {
      StorageService.saveInstalledExtensions(this.extensions);
    }
    return updated;
  }

  /**
   * Generates the client-side JavaScript bundle for all active extensions
   * along with the chrome.* / browser.* polyfill.
   */
  public generateSandboxExtensionInjection(): { script: string; css: string } {
    const active = this.getEnabledExtensions();
    if (active.length === 0) {
      return { script: '', css: '' };
    }

    const combinedCss = active
      .filter(ext => ext.css)
      .map(ext => `/* Extension: ${ext.name} */\n${ext.css}`)
      .join('\n\n');

    const extensionScripts = active.map(ext => {
      return `
        try {
          (function(extensionId, extensionName) {
            // Scoped extension execution
            ${ext.code}
          })("${ext.id}", "${ext.name.replace(/"/g, '\\"')}");
        } catch (err) {
          console.error("[Extension Error: ${ext.name}]", err);
        }
      `;
    }).join('\n\n');

    const polyfillAndRunner = `
      (function() {
        // AmniSphere WebExtension Runtime Polyfill (Manifest V2 & V3)
        const listeners = { message: [] };
        const extStorage = {};

        const polyfill = {
          runtime: {
            id: 'amnisphere-core-runtime',
            getManifest: function() { return { manifest_version: 3, name: 'AmniSphere Extension Core' }; },
            getURL: function(path) { return path; },
            sendMessage: function(msg, responseCallback) {
              window.parent.postMessage({ type: 'EXTENSION_MSG', payload: msg }, '*');
              if (responseCallback) setTimeout(() => responseCallback({ success: true }), 0);
            },
            onMessage: {
              addListener: function(fn) { listeners.message.push(fn); },
              removeListener: function(fn) {
                listeners.message = listeners.message.filter(l => l !== fn);
              }
            }
          },
          storage: {
            local: {
              get: function(keys, callback) {
                const result = typeof keys === 'string' ? { [keys]: extStorage[keys] } : extStorage;
                if (callback) callback(result);
                return Promise.resolve(result);
              },
              set: function(items, callback) {
                Object.assign(extStorage, items);
                if (callback) callback();
                return Promise.resolve();
              },
              remove: function(key, callback) {
                delete extStorage[key];
                if (callback) callback();
                return Promise.resolve();
              },
              clear: function(callback) {
                for (let k in extStorage) delete extStorage[k];
                if (callback) callback();
                return Promise.resolve();
              }
            }
          },
          tabs: {
            query: function(queryInfo, callback) {
              const tab = [{ id: 1, url: window.location.href, title: document.title, active: true }];
              if (callback) callback(tab);
              return Promise.resolve(tab);
            },
            sendMessage: function(tabId, msg, callback) {
              if (callback) callback({ status: 'ok' });
              return Promise.resolve({ status: 'ok' });
            },
            executeScript: function(tabId, details, callback) {
              if (details && details.code) {
                try { eval(details.code); } catch(e) { console.error(e); }
              }
              if (callback) callback([true]);
              return Promise.resolve([true]);
            }
          },
          scripting: {
            executeScript: function(injection, callback) {
              if (injection && injection.func) {
                try { injection.func.apply(null, injection.args || []); } catch(e) { console.error(e); }
              }
              if (callback) callback([{ result: true }]);
              return Promise.resolve([{ result: true }]);
            },
            insertCSS: function(details, callback) {
              if (details && details.css) {
                const s = document.createElement('style');
                s.textContent = details.css;
                document.head.appendChild(s);
              }
              if (callback) callback();
              return Promise.resolve();
            }
          },
          declarativeNetRequest: {
            updateDynamicRules: function(rules, callback) {
              if (callback) callback();
              return Promise.resolve();
            },
            getDynamicRules: function(callback) {
              if (callback) callback([]);
              return Promise.resolve([]);
            }
          }
        };

        window.chrome = window.chrome || polyfill;
        window.browser = window.browser || polyfill;

        // Run active extensions
        ${extensionScripts}
      })();
    `;

    return { script: polyfillAndRunner, css: combinedCss };
  }
}

export const extensionEngineInstance = new ExtensionEngine();
