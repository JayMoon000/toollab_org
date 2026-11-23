/**
 * ToolLab Shared Fixed Bottom Banner Component (GlobalBottomAdBanner)
 * Path: /js/global-bottom-ad-banner.js
 *
 * - Strictly excludes /arcade routes (pathname.startsWith('/arcade')).
 * - Renders a fixed 320x50 bottom AdSense banner with z-index: 40 (below modals).
 * - Guarantees width: 100%; display: block; wrapper to prevent 0px mobile calculation.
 * - Adds safe 64px bottom padding to body only on eligible routes.
 * - Auto-hides when AdSense marks data-ad-status="unfilled" and in @media print.
 */
(function () {
  'use strict';

  const GLOBAL_BOTTOM_AD_CONFIG = Object.freeze({
    CLIENT_ID: 'ca-pub-1512367949140208',
    SLOT_ID: '5185318921',
    AD_WIDTH: 320,
    AD_HEIGHT: 50,
    SAFE_PADDING_PX: 64,
    BANNER_ID: 'global-bottom-ad-banner',
    STYLE_ID: 'global-bottom-ad-banner-fallback-styles',
    BODY_CLASS: 'has-global-bottom-ad',
    EXCLUDED_PREFIXES: ['/arcade']
  });

  const FALLBACK_CSS = `
ins.adsbygoogle[data-ad-status="unfilled"] {
  display: none !important;
}
.global-bottom-ad-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  width: 100%;
  display: block;
  box-sizing: border-box;
  background: rgba(9, 13, 22, 0.94);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-top: 1px solid rgba(51, 65, 85, 0.72);
  box-shadow: 0 -4px 16px rgba(2, 6, 23, 0.45);
  padding: 4px 0 calc(4px + env(safe-area-inset-bottom, 0px));
}
.global-bottom-ad-banner__inner {
  width: 100%;
  display: block;
  text-align: center;
  line-height: 0;
  min-height: 50px;
  max-height: 56px;
  overflow: hidden;
  box-sizing: border-box;
}
.global-bottom-ad-banner__ins {
  display: inline-block;
  width: 320px;
  height: 50px;
  max-width: 100%;
  vertical-align: middle;
}
.global-bottom-ad-banner:has(ins.adsbygoogle[data-ad-status="unfilled"]),
.global-bottom-ad-banner.is-unfilled {
  display: none !important;
}
body.has-global-bottom-ad {
  padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px)) !important;
}
body.has-global-bottom-ad .teb-toast,
body.has-global-bottom-ad .toast-banner {
  bottom: calc(76px + env(safe-area-inset-bottom, 0px)) !important;
}
@media print {
  .global-bottom-ad-banner {
    display: none !important;
  }
  body.has-global-bottom-ad {
    padding-bottom: 0 !important;
  }
}
`;

  const currentScript = document.currentScript;

  function isExcludedPath(pathname) {
    const raw = typeof pathname === 'string'
      ? pathname
      : (typeof window !== 'undefined' && window.location ? window.location.pathname : '');
    const normalized = String(raw || '').toLowerCase();
    return GLOBAL_BOTTOM_AD_CONFIG.EXCLUDED_PREFIXES.some(function (prefix) {
      return normalized.startsWith(prefix);
    });
  }

  function resolveConfig(options) {
    const opts = options || {};
    const globalOverride = (typeof window !== 'undefined' && window.TOOLLAB_AD_CONFIG) || {};
    const scriptClient = currentScript ? currentScript.getAttribute('data-ad-client') : '';
    const scriptSlot = currentScript ? currentScript.getAttribute('data-ad-slot') : '';

    return {
      clientId: String(opts.clientId || globalOverride.clientId || scriptClient || GLOBAL_BOTTOM_AD_CONFIG.CLIENT_ID).trim(),
      slotId: String(opts.slotId || globalOverride.slotId || scriptSlot || GLOBAL_BOTTOM_AD_CONFIG.SLOT_ID).trim(),
      width: Number(opts.width || globalOverride.width || GLOBAL_BOTTOM_AD_CONFIG.AD_WIDTH) || GLOBAL_BOTTOM_AD_CONFIG.AD_WIDTH,
      height: Number(opts.height || globalOverride.height || GLOBAL_BOTTOM_AD_CONFIG.AD_HEIGHT) || GLOBAL_BOTTOM_AD_CONFIG.AD_HEIGHT
    };
  }

  function ensureStyles() {
    if (document.querySelector('link[rel="stylesheet"][href*="global-bottom-ad-banner.css"]')) {
      return;
    }
    if (document.getElementById(GLOBAL_BOTTOM_AD_CONFIG.STYLE_ID)) {
      return;
    }
    const style = document.createElement('style');
    style.id = GLOBAL_BOTTOM_AD_CONFIG.STYLE_ID;
    style.textContent = FALLBACK_CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  function ensureAdSenseScript(clientId) {
    if (!clientId) return;
    if (document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
      return;
    }
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(clientId);
    (document.head || document.documentElement).appendChild(script);
  }

  function syncUnfilledState(bannerEl, insEl) {
    if (!bannerEl || !insEl) return;
    const isUnfilled = insEl.getAttribute('data-ad-status') === 'unfilled';
    bannerEl.classList.toggle('is-unfilled', isUnfilled);
    if (document.body) {
      document.body.classList.toggle(GLOBAL_BOTTOM_AD_CONFIG.BODY_CLASS, !isUnfilled);
    }
  }

  function mount(options) {
    if (typeof document === 'undefined' || !document.body) {
      return null;
    }

    // Hard route isolation: never mount or apply bottom padding on /arcade*
    if (isExcludedPath()) {
      unmount();
      return null;
    }

    const existing = document.getElementById(GLOBAL_BOTTOM_AD_CONFIG.BANNER_ID);
    if (existing) {
      const existingIns = existing.querySelector('ins.adsbygoogle');
      syncUnfilledState(existing, existingIns);
      return existing;
    }

    const config = resolveConfig(options);
    ensureStyles();
    ensureAdSenseScript(config.clientId);

    const banner = document.createElement('aside');
    banner.id = GLOBAL_BOTTOM_AD_CONFIG.BANNER_ID;
    banner.className = 'global-bottom-ad-banner no-print';
    banner.setAttribute('role', 'complementary');
    banner.setAttribute('aria-label', 'Advertisement');
    banner.setAttribute('data-component', 'GlobalBottomAdBanner');

    const inner = document.createElement('div');
    inner.className = 'global-bottom-ad-banner__inner';

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle global-bottom-ad-banner__ins';
    ins.style.display = 'inline-block';
    ins.style.width = config.width + 'px';
    ins.style.height = config.height + 'px';
    ins.setAttribute('data-ad-client', config.clientId);
    ins.setAttribute('data-ad-slot', config.slotId);

    inner.appendChild(ins);
    banner.appendChild(inner);
    document.body.appendChild(banner);
    document.body.classList.add(GLOBAL_BOTTOM_AD_CONFIG.BODY_CLASS);

    if (typeof MutationObserver === 'function') {
      const observer = new MutationObserver(function () {
        syncUnfilledState(banner, ins);
      });
      observer.observe(ins, {
        attributes: true,
        attributeFilter: ['data-ad-status']
      });
      banner._adStatusObserver = observer;
    }

    if (ins.dataset.adPushed !== 'true' && ins.getAttribute('data-adsbygoogle-status') === null) {
      ins.dataset.adPushed = 'true';
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (_) {
        // Ignore adblock / script load errors without affecting page UX
      }
    }

    return banner;
  }

  function unmount() {
    if (typeof document === 'undefined') return;
    const existing = document.getElementById(GLOBAL_BOTTOM_AD_CONFIG.BANNER_ID);
    if (existing) {
      if (existing._adStatusObserver) {
        existing._adStatusObserver.disconnect();
      }
      if (existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
    }
    if (document.body) {
      document.body.classList.remove(GLOBAL_BOTTOM_AD_CONFIG.BODY_CLASS);
    }
  }

  function autoInit() {
    if (isExcludedPath()) {
      return;
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        mount();
      }, { once: true });
    } else {
      mount();
    }
  }

  autoInit();

  if (typeof window !== 'undefined') {
    window.GlobalBottomAdBanner = {
      mount: mount,
      unmount: unmount,
      isExcludedPath: isExcludedPath,
      config: GLOBAL_BOTTOM_AD_CONFIG
    };
  }
})();
