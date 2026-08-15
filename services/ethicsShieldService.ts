import { BlockRule, EthicsBlockCategory, ShieldSettings, SiteShieldConfig } from '../types';

export const BUILTIN_BLOCK_RULES: BlockRule[] = [
  // NSFW & Adult Content
  { id: 'nsfw-1', pattern: 'pornhub', category: 'nsfw_adult', description: 'Explicit adult domain', enabled: true },
  { id: 'nsfw-2', pattern: 'xvideos', category: 'nsfw_adult', description: 'Explicit adult domain', enabled: true },
  { id: 'nsfw-3', pattern: 'xnxx', category: 'nsfw_adult', description: 'Explicit adult domain', enabled: true },
  { id: 'nsfw-4', pattern: 'onlyfans.com', category: 'nsfw_adult', description: 'Adult content platform', enabled: true },
  { id: 'nsfw-5', pattern: 'chaturbate', category: 'nsfw_adult', description: 'Adult webcam network', enabled: true },
  { id: 'nsfw-6', pattern: 'redtube', category: 'nsfw_adult', description: 'Explicit adult domain', enabled: true },
  { id: 'nsfw-7', pattern: 'youporn', category: 'nsfw_adult', description: 'Explicit adult domain', enabled: true },
  { id: 'nsfw-8', pattern: 'adultfriendfinder', category: 'nsfw_adult', description: 'Adult dating portal', enabled: true },

  // Gambling & Betting
  { id: 'gambling-1', pattern: 'bet365.com', category: 'gambling_betting', description: 'Online sports betting platform', enabled: true },
  { id: 'gambling-2', pattern: 'stake.com', category: 'gambling_betting', description: 'Crypto casino & gambling', enabled: true },
  { id: 'gambling-3', pattern: 'draftkings.com', category: 'gambling_betting', description: 'Sports gambling operator', enabled: true },
  { id: 'gambling-4', pattern: 'fanduel.com', category: 'gambling_betting', description: 'Sports gambling operator', enabled: true },
  { id: 'gambling-5', pattern: 'pokerstars.com', category: 'gambling_betting', description: 'Online gambling & poker', enabled: true },
  { id: 'gambling-6', pattern: 'bovada.lv', category: 'gambling_betting', description: 'Online casino & sportsbook', enabled: true },
  { id: 'gambling-7', pattern: '888casino.com', category: 'gambling_betting', description: 'Online casino platform', enabled: true },
  { id: 'gambling-8', pattern: 'williamhill.com', category: 'gambling_betting', description: 'Gambling & bookmaking', enabled: true },
  { id: 'gambling-9', pattern: 'roobet.com', category: 'gambling_betting', description: 'Crypto casino gambling', enabled: true },

  // Predatory Usury & Financial Scams
  { id: 'usury-1', pattern: 'paydayloans', category: 'predatory_usury_scam', description: 'High-interest predatory loan network', enabled: true },
  { id: 'usury-2', pattern: 'speedycash.com', category: 'predatory_usury_scam', description: 'Predatory usurious lending', enabled: true },
  { id: 'usury-3', pattern: 'checkintocash.com', category: 'predatory_usury_scam', description: 'Predatory cash advance service', enabled: true },
  { id: 'usury-4', pattern: 'binaryoptions', category: 'predatory_usury_scam', description: 'Predatory high-risk financial schemes', enabled: true },
  { id: 'usury-5', pattern: 'cryptopumpanddump', category: 'predatory_usury_scam', description: 'Financial scam network', enabled: true },

  // Trackers & Telemetry
  { id: 'tracker-1', pattern: 'google-analytics.com', category: 'trackers_telemetry', description: 'Google Analytics tracking engine', enabled: true },
  { id: 'tracker-2', pattern: 'googletagmanager.com', category: 'trackers_telemetry', description: 'Tag manager telemetry loader', enabled: true },
  { id: 'tracker-3', pattern: 'connect.facebook.net', category: 'trackers_telemetry', description: 'Meta Pixel user fingerprinting', enabled: true },
  { id: 'tracker-4', pattern: 'analytics.tiktok.com', category: 'trackers_telemetry', description: 'TikTok analytics beacon', enabled: true },
  { id: 'tracker-5', pattern: 'hotjar.com', category: 'trackers_telemetry', description: 'Session recorder & keystroke logger', enabled: true },
  { id: 'tracker-6', pattern: 'clarity.ms', category: 'trackers_telemetry', description: 'Microsoft Clarity user tracking', enabled: true },
  { id: 'tracker-7', pattern: 'criteo.com', category: 'trackers_telemetry', description: 'Cross-site behavioral ad tracker', enabled: true },
  { id: 'tracker-8', pattern: 'mixpanel.com', category: 'trackers_telemetry', description: 'User event tracking telemetry', enabled: true },
  { id: 'tracker-9', pattern: 'segment.io', category: 'trackers_telemetry', description: 'Customer telemetry aggregator', enabled: true },
  { id: 'tracker-10', pattern: 'amplitude.com', category: 'trackers_telemetry', description: 'Behavioral analytics telemetry', enabled: true },

  // Invasive Ads & Popups
  { id: 'ad-1', pattern: 'doubleclick.net', category: 'invasive_ads', description: 'Targeted behavioral ad server', enabled: true },
  { id: 'ad-2', pattern: 'googlesyndication.com', category: 'invasive_ads', description: 'AdSense display network', enabled: true },
  { id: 'ad-3', pattern: 'taboola.com', category: 'invasive_ads', description: 'Clickbait & deceptive native ad widget', enabled: true },
  { id: 'ad-4', pattern: 'outbrain.com', category: 'invasive_ads', description: 'Clickbait content recommendation engine', enabled: true },
  { id: 'ad-5', pattern: 'popads.net', category: 'invasive_ads', description: 'Invasive popunder network', enabled: true },
  { id: 'ad-6', pattern: 'adroll.com', category: 'invasive_ads', description: 'Retargeting advertising tracker', enabled: true },
  { id: 'ad-7', pattern: 'adnxs.com', category: 'invasive_ads', description: 'AppNexus real-time ad bidder', enabled: true },

  // Malware & Phishing
  { id: 'malware-1', pattern: 'coinhive.com', category: 'malware_phishing', description: 'Unauthorized browser cryptominer', enabled: true },
  { id: 'malware-2', pattern: 'free-crypto-giveaway', category: 'malware_phishing', description: 'Phishing domain pattern', enabled: true },
  { id: 'malware-3', pattern: 'update-your-browser-now.com', category: 'malware_phishing', description: 'Deceptive malware dropper', enabled: true },
];

export interface ShieldCheckResult {
  blocked: boolean;
  category?: EthicsBlockCategory;
  reason?: string;
  matchedPattern?: string;
}

export const EthicsShieldService = {
  checkUrl(url: string, settings?: ShieldSettings): ShieldCheckResult {
    if (!settings || !settings.globalShieldEnabled) {
      return { blocked: false };
    }

    const lowerUrl = (url || '').toLowerCase();
    const urlHostname = this.extractHostname(url).toLowerCase();

    // Check site exceptions
    const siteExceptions = settings.siteExceptions || {};
    const siteException = siteExceptions[urlHostname];
    if (siteException && !siteException.shieldEnabled) {
      return { blocked: false };
    }

    const allRules = [...BUILTIN_BLOCK_RULES, ...(settings.customBlockPatterns || [])];

    for (const rule of allRules) {
      if (!rule.enabled) continue;

      // Check category toggles
      if (rule.category === 'nsfw_adult' && !settings.blockAdultAndNsfw) continue;
      if (rule.category === 'gambling_betting' && !settings.blockGamblingAndBetting) continue;
      if (rule.category === 'predatory_usury_scam' && !settings.blockPredatoryUsury) continue;
      if (rule.category === 'trackers_telemetry' && !settings.blockTrackersAndTelemetry) continue;
      if (rule.category === 'invasive_ads' && !settings.blockInvasiveAds) continue;
      if (rule.category === 'malware_phishing' && !settings.blockMalwareAndPhishing) continue;

      if (lowerUrl.includes(rule.pattern.toLowerCase())) {
        return {
          blocked: true,
          category: rule.category,
          reason: rule.description,
          matchedPattern: rule.pattern,
        };
      }
    }

    return { blocked: false };
  },

  extractHostname(url: string): string {
    try {
      if (!url) return '';
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return (url || '').split('/')[0].replace(/^www\./, '');
    }
  },

  generateCosmeticCss(domainOrSettings?: string | ShieldSettings, possibleSettings?: ShieldSettings): string {
    const settings: ShieldSettings | undefined =
      typeof domainOrSettings === 'object' && domainOrSettings !== null
        ? domainOrSettings
        : possibleSettings;

    if (!settings || !settings.globalShieldEnabled || !settings.enableCosmeticFiltering) {
      return '';
    }

    const customSelectors = settings.customCosmeticSelectors || [];
    const selectors = [
      ...customSelectors,
      '.ad', '.ads', '.adsbygoogle', '.ad-unit', '.ad-container', '.ad-wrapper',
      '#google_ads_frame', '[id^="ad_"]', '[class*="sponsored"]', '[data-ad-client]',
      '.taboola-container', '.outbrain_widget', '.trc_rbox_div',
      '.cookie-banner', '#cookie-notice', '.consent-modal',
      '.floating-ad', '.sticky-ad', '.video-ad-overlay'
    ];

    return `
      ${selectors.join(', ')} {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
  },

  sanitizeHtml(
    html: string,
    domainOrSettings?: string | ShieldSettings,
    possibleSettings?: ShieldSettings
  ): {
    cleanHtml: string;
    sanitizedHtml: string;
    blockedTrackers: number;
    blockedAds: number;
    blockedCount: number;
    cosmeticHides: number;
    cosmeticHidesCount: number;
  } {
    let cleanHtml = html || '';
    let blockedTrackers = 0;
    let blockedAds = 0;
    let cosmeticHides = 0;

    const settings: ShieldSettings | undefined =
      typeof domainOrSettings === 'object' && domainOrSettings !== null
        ? domainOrSettings
        : possibleSettings;

    if (!settings || !settings.globalShieldEnabled) {
      return {
        cleanHtml,
        sanitizedHtml: cleanHtml,
        blockedTrackers: 0,
        blockedAds: 0,
        blockedCount: 0,
        cosmeticHides: 0,
        cosmeticHidesCount: 0,
      };
    }

    // Strip tracking scripts and analytics tags
    if (settings.blockTrackersAndTelemetry) {
      const trackerPatterns = [
        /google-analytics\.com\/analytics\.js/gi,
        /googletagmanager\.com\/gtag\/js/gi,
        /connect\.facebook\.net\/[a-z_]+\/fbevents\.js/gi,
        /static\.hotjar\.com/gi,
        /clarity\.ms\/tag/gi,
        /cdn\.segment\.com/gi,
      ];

      for (const pattern of trackerPatterns) {
        if (pattern.test(cleanHtml)) {
          blockedTrackers++;
        }
      }

      // Remove script tags containing known telemetry
      cleanHtml = cleanHtml.replace(/<script[^>]*>(.*?)(google-analytics|gtag|fbq|hotjar|clarity)(.*?)<\/script>/gis, () => {
        blockedTrackers++;
        return '<!-- [Al-Haq Ethics Shield]: Telemetry Script Intercepted & Neutralized -->';
      });
    }

    // Strip invasive ads & iframe ad tags
    if (settings.blockInvasiveAds) {
      cleanHtml = cleanHtml.replace(/<ins[^>]*class="[^"]*adsbygoogle[^"]*"[^>]*>[\s\S]*?<\/ins>/gi, () => {
        blockedAds++;
        return '';
      });
      cleanHtml = cleanHtml.replace(/<iframe[^>]*src="[^"]*(doubleclick|googlesyndication|taboola|outbrain|adnxs)[^"]*"[^>]*>[\s\S]*?<\/iframe>/gi, () => {
        blockedAds++;
        return '';
      });
    }

    if (settings.enableCosmeticFiltering) {
      cosmeticHides += 4;
    }

    const totalBlocked = blockedTrackers + blockedAds;

    return {
      cleanHtml,
      sanitizedHtml: cleanHtml,
      blockedTrackers,
      blockedAds,
      blockedCount: totalBlocked,
      cosmeticHides,
      cosmeticHidesCount: cosmeticHides,
    };
  },

  generateBlockedPageHtml(url: string, categoryOrReason: string, reasonOrCategory?: string): string {
    let category: EthicsBlockCategory = 'nsfw_adult';
    let reason = 'Restricted by Al-Haq Ethics Shield';

    if (categoryOrReason in {
      nsfw_adult: 1,
      gambling_betting: 1,
      predatory_usury_scam: 1,
      trackers_telemetry: 1,
      invasive_ads: 1,
      malware_phishing: 1,
      intrusive_popups: 1,
    }) {
      category = categoryOrReason as EthicsBlockCategory;
      reason = reasonOrCategory || reason;
    } else if (reasonOrCategory in {
      nsfw_adult: 1,
      gambling_betting: 1,
      predatory_usury_scam: 1,
      trackers_telemetry: 1,
      invasive_ads: 1,
      malware_phishing: 1,
      intrusive_popups: 1,
    }) {
      category = reasonOrCategory as EthicsBlockCategory;
      reason = categoryOrReason || reason;
    } else {
      reason = categoryOrReason;
    }
    const categoryTitles: Record<EthicsBlockCategory, string> = {
      nsfw_adult: 'Explicit / Adult Content Restricted',
      gambling_betting: 'Gambling & High-Risk Betting Restricted',
      predatory_usury_scam: 'Deceptive / Predatory Financial Site Restricted',
      trackers_telemetry: 'Aggressive Tracking Network Neutralized',
      invasive_ads: 'Invasive Advertising Server Blocked',
      malware_phishing: 'Malicious / Phishing Threat Intercepted',
      intrusive_popups: 'Intrusive Element Blocked',
    };

    const categoryIcons: Record<EthicsBlockCategory, string> = {
      nsfw_adult: '🛡️',
      gambling_betting: '🚫',
      predatory_usury_scam: '⚖️',
      trackers_telemetry: '👁️‍🗨️',
      invasive_ads: '📢',
      malware_phishing: '⚠️',
      intrusive_popups: '🪟',
    };

    const categoryEthicalPrinciples: Record<EthicsBlockCategory, string> = {
      nsfw_adult: 'Al-Haq Ethics Shield protects mental purity, modesty, and family-safe digital environments according to foundational Islamic ethics and dignity standards.',
      gambling_betting: 'Al-Haq Ethics Shield proactively prohibits games of chance, speculative betting (Maysir), and predatory financial mechanisms that induce addiction and financial harm.',
      predatory_usury_scam: 'Al-Haq Ethics Shield safeguards users from predatory interest-bearing loans (Riba), deceptive pyramid systems, and predatory financial exploitation.',
      trackers_telemetry: 'Al-Haq Studio upholds uncompromising privacy rights: your digital footprint belongs strictly to you. Zero telemetry, zero behavioral profiling.',
      invasive_ads: 'Intrusive advertising vectors, clickbait networks, and malicious popups are quarantined to ensure clean, focused reading.',
      malware_phishing: 'Dangerous deception attempts and security hazards are blocked before executing on your system.',
      intrusive_popups: 'Forced overlays and manipulative interface tricks have been filtered.',
    };

    const title = categoryTitles[category] || 'Content Filtered by Al-Haq Shield';
    const icon = categoryIcons[category] || '🛡️';
    const principle = categoryEthicalPrinciples[category] || 'Filtered in accordance with Al-Haq privacy & ethical browsing standards.';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>AmniSphere — Content Protected</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #090d16;
            color: #f1f5f9;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }
          .card {
            background: #111827;
            border: 1px solid #1e293b;
            border-radius: 16px;
            max-width: 640px;
            width: 100%;
            padding: 36px 32px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #10b981, #059669, #047857);
          }
          .shield-badge {
            width: 68px;
            height: 68px;
            background: #064e3b;
            border: 1px solid #059669;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin: 0 auto 20px;
          }
          .arabic-creed {
            font-family: 'Amiri', serif;
            font-size: 20px;
            color: #34d399;
            margin-bottom: 8px;
            direction: rtl;
          }
          h1 {
            font-size: 22px;
            font-weight: 700;
            color: #f8fafc;
            margin-bottom: 12px;
            letter-spacing: -0.02em;
          }
          .url-chip {
            display: inline-block;
            background: #1e293b;
            color: #94a3b8;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-family: monospace;
            margin-bottom: 20px;
            max-width: 90%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .reason-box {
            background: #0f172a;
            border: 1px solid #1e293b;
            border-radius: 10px;
            padding: 16px;
            text-align: left;
            margin-bottom: 24px;
          }
          .reason-title {
            font-size: 12px;
            font-weight: 600;
            color: #10b981;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 6px;
          }
          .reason-text {
            font-size: 14px;
            color: #cbd5e1;
            line-height: 1.6;
          }
          .actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
          }
          .btn {
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.15s ease;
            border: none;
          }
          .btn-primary {
            background: #059669;
            color: #ffffff;
          }
          .btn-primary:hover {
            background: #10b981;
          }
          .btn-secondary {
            background: #1e293b;
            color: #cbd5e1;
            border: 1px solid #334155;
          }
          .btn-secondary:hover {
            background: #334155;
          }
          .footer-brand {
            margin-top: 28px;
            padding-top: 20px;
            border-top: 1px solid #1e293b;
            font-size: 12px;
            color: #64748b;
          }
          .footer-brand a {
            color: #10b981;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="shield-badge">${icon}</div>
          <div class="arabic-creed">الحَقُّ يَعْلُو وَلَا يُعْلَى عَلَيْهِ</div>
          <h1>${title}</h1>
          <div class="url-chip">${url}</div>

          <div class="reason-box">
            <div class="reason-title">Al-Haq Ethics Shield Directive</div>
            <div class="reason-text">${principle}</div>
            <div style="margin-top: 10px; font-size: 13px; color: #94a3b8;">
              <strong>Trigger details:</strong> ${reason}
            </div>
          </div>

          <div class="actions">
            <button class="btn btn-primary" onclick="window.history.back();">← Return to Safety</button>
            <button class="btn btn-secondary" onclick="window.FlashLiteAPI.performAction('Open New Tab');">Go to Safe Home</button>
          </div>

          <div class="footer-brand">
            Protected by <strong>AmniSphere</strong> by <a href="https://alhaq.uk" target="_blank" rel="noopener noreferrer">Al-Haq Studio (alhaq.uk)</a> · Open Source & Privacy Guaranteed
          </div>
        </div>
      </body>
      </html>
    `;
  }
};
