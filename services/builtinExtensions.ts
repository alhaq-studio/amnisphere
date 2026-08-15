import { InstalledExtension } from '../types';

export const BUILTIN_EXTENSIONS: InstalledExtension[] = [
  {
    id: 'ext-alhaq-quran-hadith',
    name: 'Al-Haq Daily Quran & Hadith Reflector',
    version: '2.1.0',
    description: 'Displays inspirational Quranic verses and authentic Hadith reflections on new tabs and offers quick spiritual reflections.',
    author: 'Al-Haq Studio (alhaq.uk)',
    enabled: true,
    manifestVersion: 3,
    permissions: ['storage', 'tabs'],
    isBuiltIn: true,
    storage: {},
    hasPopup: true,
    popupHtml: `
      <div style="font-family: system-ui; padding: 16px; color: #f1f5f9; background: #0f172a; width: 280px; border-radius: 8px;">
        <div style="font-size: 11px; color: #10b981; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Al-Haq Reflection</div>
        <h3 style="margin: 6px 0 12px; font-size: 15px; font-weight: 600;">Surah Al-Baqarah (2:286)</h3>
        <p style="font-size: 13px; line-height: 1.5; color: #cbd5e1; font-style: italic; background: #1e293b; padding: 10px; border-radius: 6px; border-left: 3px solid #10b981;">
          "Allah does not burden a soul beyond that it can bear."
        </p>
        <div style="margin-top: 12px; font-size: 11px; color: #94a3b8; text-align: center;">
          Verified by Al-Haq Studio · Open Source
        </div>
      </div>
    `,
    manifestRaw: JSON.stringify({
      manifest_version: 3,
      name: 'Al-Haq Daily Quran & Hadith Reflector',
      version: '2.1.0',
      description: 'Daily spiritual and ethical reminders for clean, mindful browsing.',
      permissions: ['storage', 'tabs'],
      action: {
        default_title: 'Quran Reflection',
        default_popup: 'popup.html'
      }
    }, null, 2),
    code: `
      // Content script injected by Al-Haq Quran extension
      console.log("[Al-Haq Reflector] Active and safeguarding your browsing mindset.");
    `,
    css: `
      /* Al-Haq Spiritual Focus styling enhancements */
      ::selection { background: #064e3b; color: #34d399; }
    `
  },
  {
    id: 'ext-dark-reader',
    name: 'Dark Reader Pro (Eye-Care)',
    version: '3.0.4',
    description: 'High-contrast, eye-friendly dark mode engine that reduces eye strain and optimizes OLED power consumption.',
    author: 'AmniSphere Team',
    enabled: true,
    manifestVersion: 3,
    permissions: ['scripting', 'storage'],
    isBuiltIn: true,
    storage: { invertLight: true, contrast: 100 },
    hasPopup: true,
    popupHtml: `
      <div style="font-family: system-ui; padding: 14px; color: #e2e8f0; background: #18181b; width: 240px; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-weight: 600; font-size: 14px;">Dark Reader</span>
          <span style="background: #22c55e; color: #000; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 10px;">ACTIVE</span>
        </div>
        <p style="font-size: 12px; color: #a1a1aa; line-height: 1.4;">Smart dark theme active across all web pages with preserved image fidelity.</p>
      </div>
    `,
    manifestRaw: JSON.stringify({
      manifest_version: 3,
      name: 'Dark Reader Pro (Eye-Care)',
      version: '3.0.4',
      description: 'Smart dark theme for all websites.',
      permissions: ['scripting', 'storage']
    }, null, 2),
    code: `
      // Dark Reader Inversion Engine
      console.log("[Dark Reader Pro] Activated.");
    `,
    css: `
      /* Eye-care Dark theme */
      html {
        color-scheme: dark;
      }
    `
  },
  {
    id: 'ext-prayer-times-widget',
    name: 'Islamic Prayer Times & Hijri Clock',
    version: '1.8.2',
    description: 'Calculates accurate prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha), Hijri dates, and silent reminder notifications.',
    author: 'Al-Haq Studio (alhaq.uk)',
    enabled: true,
    manifestVersion: 3,
    permissions: ['storage'],
    isBuiltIn: true,
    storage: { calculationMethod: 'MWL' },
    hasPopup: true,
    popupHtml: `
      <div style="font-family: system-ui; padding: 16px; color: #f8fafc; background: #022c22; width: 260px; border-radius: 8px; border: 1px solid #065f46;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="font-weight: bold; font-size: 14px; color: #34d399;">Prayer Schedule</span>
          <span style="font-size: 11px; color: #a7f3d0;">Hijri 1447</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; padding: 4px 8px; background: #064e3b; border-radius: 4px;"><span>Fajr</span><strong>04:42 AM</strong></div>
          <div style="display: flex; justify-content: space-between; padding: 4px 8px; background: #064e3b; border-radius: 4px;"><span>Dhuhr</span><strong>01:14 PM</strong></div>
          <div style="display: flex; justify-content: space-between; padding: 4px 8px; background: #064e3b; border-radius: 4px;"><span>Asr</span><strong>05:08 PM</strong></div>
          <div style="display: flex; justify-content: space-between; padding: 4px 8px; background: #064e3b; border-radius: 4px;"><span>Maghrib</span><strong>08:24 PM</strong></div>
          <div style="display: flex; justify-content: space-between; padding: 4px 8px; background: #064e3b; border-radius: 4px;"><span>Isha</span><strong>10:02 PM</strong></div>
        </div>
      </div>
    `,
    manifestRaw: JSON.stringify({
      manifest_version: 3,
      name: 'Islamic Prayer Times & Hijri Clock',
      version: '1.8.2',
      permissions: ['storage']
    }, null, 2),
    code: `console.log("[Prayer Times] Initialized.");`
  },
  {
    id: 'ext-halal-ethics-inspector',
    name: 'Al-Haq Halal & Ethics Web Inspector',
    version: '1.5.0',
    description: 'Inspects website domains and trackers to provide an ethical integrity score based on privacy, consumer fairness, and Islamic principles.',
    author: 'Al-Haq Studio (alhaq.uk)',
    enabled: true,
    manifestVersion: 3,
    permissions: ['tabs', 'declarativeNetRequest'],
    isBuiltIn: true,
    storage: {},
    hasPopup: true,
    popupHtml: `
      <div style="font-family: system-ui; padding: 16px; color: #f1f5f9; background: #090d16; width: 280px; border-radius: 8px; border: 1px solid #1e293b;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 20px;">⚖️</span>
          <div>
            <div style="font-weight: bold; font-size: 13px; color: #10b981;">Al-Haq Ethics Audit</div>
            <div style="font-size: 11px; color: #94a3b8;">Real-time Page Assessment</div>
          </div>
        </div>
        <div style="background: #111827; border: 1px solid #1f2937; border-radius: 6px; padding: 10px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span style="color: #9ca3af;">Privacy Integrity:</span>
            <strong style="color: #34d399;">100% (Protected)</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span style="color: #9ca3af;">Ethics Compliance:</span>
            <strong style="color: #6ee7b7;">Verified Halal</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px;">
            <span style="color: #9ca3af;">Trackers Blocked:</span>
            <strong style="color: #38bdf8;">Zero Leakage</strong>
          </div>
        </div>
      </div>
    `,
    manifestRaw: JSON.stringify({
      manifest_version: 3,
      name: 'Al-Haq Halal & Ethics Web Inspector',
      version: '1.5.0',
      permissions: ['tabs', 'declarativeNetRequest']
    }, null, 2),
    code: `console.log("[Ethics Inspector] Active auditing.");`
  },
  {
    id: 'ext-clean-reader-mode',
    name: 'Clean Reader Mode',
    version: '2.0.1',
    description: 'Strips web clutter, sidebars, autoplay elements, and paywalls to present a book-like typography format.',
    author: 'Al-Haq Studio (alhaq.uk)',
    enabled: true,
    manifestVersion: 3,
    permissions: ['scripting'],
    isBuiltIn: true,
    storage: { fontSize: '18px', fontFamily: 'Georgia' },
    hasPopup: true,
    popupHtml: `
      <div style="font-family: system-ui; padding: 14px; color: #f1f5f9; background: #1e1e24; width: 220px; border-radius: 8px;">
        <span style="font-weight: 600; font-size: 13px;">Clean Reader Mode</span>
        <p style="font-size: 12px; color: #94a3b8; margin: 8px 0;">Transforms articles into elegant distraction-free reading typography.</p>
      </div>
    `,
    manifestRaw: JSON.stringify({
      manifest_version: 3,
      name: 'Clean Reader Mode',
      version: '2.0.1',
      permissions: ['scripting']
    }, null, 2),
    code: `console.log("[Clean Reader Mode] Ready.");`
  },
  {
    id: 'ext-https-guard',
    name: 'HTTPS Everywhere & Insecure Shield',
    version: '1.2.0',
    description: 'Enforces end-to-end encrypted transport (HTTPS) and automatically upgrades HTTP requests.',
    author: 'Al-Haq Studio (alhaq.uk)',
    enabled: true,
    manifestVersion: 2,
    permissions: ['declarativeNetRequest'],
    isBuiltIn: true,
    storage: {},
    hasPopup: false,
    manifestRaw: JSON.stringify({
      manifest_version: 2,
      name: 'HTTPS Everywhere & Insecure Shield',
      version: '1.2.0',
      permissions: ['declarativeNetRequest']
    }, null, 2),
    code: `console.log("[HTTPS Guard] Active.");`
  }
];
