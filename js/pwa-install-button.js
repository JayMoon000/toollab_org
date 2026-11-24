/**
 * ToolLab Shared PWA Install Button & Service Worker Helper (PWAInstallButton)
 * Path: /js/pwa-install-button.js
 *
 * Eligible utilities: /etf, /rest-area, /market, /party
 * Strictly excluded:  /noise (educational/demo tool — never mounts or registers SW)
 *
 * Usage:
 *   <script
 *     src="/js/pwa-install-button.js"
 *     data-app-name="고속도로 휴게소 뷰어"
 *     data-sw-scope="/rest-area"
 *     data-target="[data-pwa-install-slot]"
 *     defer
 *   ></script>
 */
(function () {
  'use strict';

  const STYLE_ID = 'toollab-pwa-install-styles';
  const MODAL_ID = 'toollab-pwa-ios-modal';
  const BUTTON_CLASS = 'tl-pwa-install-btn';
  const EXCLUDED_PREFIXES = ['/noise', '/ko/noise'];

  const currentScript = document.currentScript;

  function isExcludedPath(pathname) {
    const raw =
      typeof pathname === 'string'
        ? pathname
        : typeof window !== 'undefined' && window.location
          ? window.location.pathname
          : '';
    const normalized = String(raw || '').toLowerCase();
    return EXCLUDED_PREFIXES.some(function (prefix) {
      return normalized === prefix || normalized.startsWith(prefix + '/');
    });
  }

  // Hard guard: never execute on /noise
  if (isExcludedPath()) {
    return;
  }

  function isStandaloneMode() {
    try {
      if (window.navigator && window.navigator.standalone === true) {
        return true;
      }
      if (typeof window.matchMedia === 'function') {
        if (window.matchMedia('(display-mode: standalone)').matches) {
          return true;
        }
      }
      if (
        typeof document !== 'undefined' &&
        document.referrer &&
        document.referrer.indexOf('android-app://') === 0
      ) {
        return true;
      }
    } catch (_) {}
    return false;
  }

  function isIosSafari() {
    try {
      const ua = (navigator && navigator.userAgent) || '';
      const platform = (navigator && navigator.platform) || '';
      const maxTouchPoints = (navigator && navigator.maxTouchPoints) || 0;
      const isIosDevice =
        /iPhone|iPad|iPod/i.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1);
      if (!isIosDevice) return false;

      const hasSafariToken = /Safari/i.test(ua);
      const isNonSafariOrInApp =
        /CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser|DuckDuckGo|GSA\/|KAKAOTALK|NAVER|Instagram|FBAN|FBAV|Line\//i.test(
          ua
        );
      return hasSafariToken && !isNonSafariOrInApp;
    } catch (_) {
      return false;
    }
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      [data-pwa-install-slot] {
        display: contents;
      }
      .${BUTTON_CLASS} {
        appearance: none;
        -webkit-appearance: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        height: 30px;
        padding: 0 10px;
        border-radius: 9999px;
        border: 1px solid rgba(56, 189, 248, 0.45);
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.96) 100%);
        color: #e0f2fe;
        font-family: -apple-system, BlinkMacSystemFont, "Pretendard Variable", "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", Roboto, sans-serif;
        font-size: 11.5px;
        font-weight: 700;
        line-height: 1;
        letter-spacing: -0.01em;
        white-space: nowrap;
        flex-shrink: 0;
        cursor: pointer;
        user-select: none;
        box-shadow: 0 2px 8px rgba(2, 6, 23, 0.35);
        transition: border-color 0.16s ease, background-color 0.16s ease, box-shadow 0.16s ease, transform 0.12s ease;
        -webkit-tap-highlight-color: transparent;
        box-sizing: border-box;
      }
      .${BUTTON_CLASS}:hover {
        border-color: rgba(56, 189, 248, 0.85);
        background: linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 58, 95, 0.98) 100%);
        color: #ffffff;
        box-shadow: 0 0 14px rgba(56, 189, 248, 0.24);
      }
      .${BUTTON_CLASS}:active {
        transform: scale(0.96);
      }
      .${BUTTON_CLASS}:focus-visible {
        outline: 2px solid #38bdf8;
        outline-offset: 2px;
      }
      .${BUTTON_CLASS}[hidden] {
        display: none !important;
      }
      .${BUTTON_CLASS}__icon {
        width: 13px;
        height: 13px;
        color: #38bdf8;
        flex-shrink: 0;
        display: inline-block;
      }

      /* iOS Safari Guide Mini Modal */
      .tl-pwa-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        background: rgba(2, 6, 23, 0.76);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        font-family: -apple-system, BlinkMacSystemFont, "Pretendard Variable", "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", Roboto, sans-serif;
        box-sizing: border-box;
      }
      .tl-pwa-modal-backdrop[hidden] {
        display: none !important;
      }
      .tl-pwa-modal-dialog {
        width: 100%;
        max-width: 360px;
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 18px;
        color: #f8fafc;
        box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.72);
        overflow: hidden;
        animation: tlPwaModalIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes tlPwaModalIn {
        from {
          opacity: 0;
          transform: translateY(10px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      .tl-pwa-modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        padding: 16px 18px 12px;
        border-bottom: 1px solid rgba(51, 65, 85, 0.7);
        background: rgba(30, 41, 59, 0.55);
      }
      .tl-pwa-modal-kicker {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 9999px;
        background: rgba(56, 189, 248, 0.14);
        border: 1px solid rgba(56, 189, 248, 0.35);
        color: #7dd3fc;
        font-size: 10.5px;
        font-weight: 700;
        margin-bottom: 6px;
      }
      .tl-pwa-modal-title {
        margin: 0;
        font-size: 15.5px;
        font-weight: 800;
        color: #f8fafc;
        letter-spacing: -0.02em;
        line-height: 1.3;
      }
      .tl-pwa-modal-close {
        appearance: none;
        -webkit-appearance: none;
        border: none;
        background: transparent;
        color: #94a3b8;
        width: 30px;
        height: 30px;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
        flex-shrink: 0;
        transition: background-color 0.15s ease, color 0.15s ease;
      }
      .tl-pwa-modal-close:hover {
        background: rgba(51, 65, 85, 0.7);
        color: #f8fafc;
      }
      .tl-pwa-modal-body {
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .tl-pwa-modal-highlight {
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(30, 41, 59, 0.85);
        border: 1px solid rgba(56, 189, 248, 0.32);
        font-size: 13px;
        line-height: 1.55;
        color: #e2e8f0;
        text-align: center;
        word-break: keep-all;
      }
      .tl-pwa-modal-highlight strong {
        color: #38bdf8;
        font-weight: 800;
      }
      .tl-pwa-share-glyph {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 22px;
        height: 22px;
        padding: 0 5px;
        margin: 0 2px;
        border-radius: 6px;
        background: rgba(56, 189, 248, 0.18);
        border: 1px solid rgba(56, 189, 248, 0.45);
        color: #7dd3fc;
        font-size: 13px;
        font-weight: 800;
        vertical-align: middle;
      }
      .tl-pwa-steps {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 12.5px;
        color: #cbd5e1;
      }
      .tl-pwa-steps li {
        display: flex;
        align-items: center;
        gap: 9px;
      }
      .tl-pwa-step-num {
        width: 20px;
        height: 20px;
        border-radius: 9999px;
        background: #1e293b;
        border: 1px solid #475569;
        color: #38bdf8;
        font-size: 11px;
        font-weight: 800;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .tl-pwa-modal-footer {
        padding: 12px 18px 16px;
        display: flex;
        justify-content: flex-end;
      }
      .tl-pwa-modal-confirm {
        appearance: none;
        -webkit-appearance: none;
        width: 100%;
        padding: 10px 14px;
        border-radius: 10px;
        border: 1px solid rgba(56, 189, 248, 0.5);
        background: #0284c7;
        color: #ffffff;
        font-family: inherit;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: background-color 0.15s ease;
      }
      .tl-pwa-modal-confirm:hover {
        background: #0369a1;
      }

      @media print {
        .${BUTTON_CLASS},
        .tl-pwa-modal-backdrop {
          display: none !important;
        }
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function createDownloadIconSvg() {
    return (
      '<svg class="' +
      BUTTON_CLASS +
      '__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 3v12"/>' +
      '<path d="m7 10 5 5 5-5"/>' +
      '<path d="M5 20h14"/>' +
      '</svg>'
    );
  }

  function createIosAddIconSvg() {
    return (
      '<svg class="' +
      BUTTON_CLASS +
      '__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="3" y="3" width="18" height="18" rx="4"/>' +
      '<path d="M12 8v8"/>' +
      '<path d="M8 12h8"/>' +
      '</svg>'
    );
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Component state
  const state = {
    appName: 'ToolLab 유틸리티',
    swUrl: '/sw.js',
    swScope: '',
    targetSelector: '[data-pwa-install-slot]',
    deferredPrompt:
      typeof window !== 'undefined' && window.__toollabDeferredInstallPrompt
        ? window.__toollabDeferredInstallPrompt
        : null,
    standalone: isStandaloneMode(),
    installed: false,
    iosSafari: isIosSafari(),
    buttonEl: null,
    modalEl: null,
    observer: null,
    swRegistered: false,
    listenersBound: false,
  };

  function resolveInitialConfig(options) {
    const opts = options || {};
    const attr = function (name) {
      return currentScript ? currentScript.getAttribute(name) || '' : '';
    };
    state.appName = String(opts.appName || attr('data-app-name') || state.appName).trim();
    state.swUrl = String(opts.swUrl || attr('data-sw-url') || '/sw.js').trim();
    state.swScope = String(opts.swScope || attr('data-sw-scope') || '').trim();
    state.targetSelector = String(
      opts.target || attr('data-target') || '[data-pwa-install-slot]'
    ).trim();
  }

  function getActiveMode() {
    if (state.standalone || state.installed) return 'hidden';
    if (state.deferredPrompt) return 'chromium';
    if (state.iosSafari) return 'ios';
    return 'hidden';
  }

  function ensureModal() {
    if (state.modalEl && document.body.contains(state.modalEl)) {
      return state.modalEl;
    }

    const existing = document.getElementById(MODAL_ID);
    if (existing) {
      state.modalEl = existing;
      return existing;
    }

    const backdrop = document.createElement('div');
    backdrop.id = MODAL_ID;
    backdrop.className = 'tl-pwa-modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-labelledby', 'tl-pwa-ios-modal-title');
    backdrop.hidden = true;

    backdrop.innerHTML =
      '<div class="tl-pwa-modal-dialog">' +
      '  <div class="tl-pwa-modal-header">' +
      '    <div>' +
      '      <span class="tl-pwa-modal-kicker">iOS Safari 홈 화면 추가</span>' +
      '      <h2 id="tl-pwa-ios-modal-title" class="tl-pwa-modal-title">' +
      escapeHtml(state.appName) +
      ' 앱처럼 설치</h2>' +
      '    </div>' +
      '    <button type="button" class="tl-pwa-modal-close" data-pwa-close aria-label="닫기">×</button>' +
      '  </div>' +
      '  <div class="tl-pwa-modal-body">' +
      '    <div class="tl-pwa-modal-highlight">' +
      '      하단 공유 아이콘(<span class="tl-pwa-share-glyph" aria-hidden="true">⍗</span>)을 누른 뒤<br/>' +
      '      <strong>\'홈 화면에 추가\'</strong>를 선택해 주세요.' +
      '    </div>' +
      '    <ol class="tl-pwa-steps">' +
      '      <li><span class="tl-pwa-step-num">1</span><span>Safari 하단 툴바의 공유 아이콘(<strong>⍗</strong>)을 탭하세요.</span></li>' +
      '      <li><span class="tl-pwa-step-num">2</span><span>메뉴에서 <strong>\'홈 화면에 추가\'</strong>를 선택하세요.</span></li>' +
      '      <li><span class="tl-pwa-step-num">3</span><span>우측 상단 <strong>\'추가\'</strong>를 누르면 홈 화면에 설치됩니다.</span></li>' +
      '    </ol>' +
      '  </div>' +
      '  <div class="tl-pwa-modal-footer">' +
      '    <button type="button" class="tl-pwa-modal-confirm" data-pwa-close>확인</button>' +
      '  </div>' +
      '</div>';

    // Close when clicking outside dialog (on backdrop)
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop || (e.target && e.target.closest('[data-pwa-close]'))) {
        closeIosModal();
      }
    });

    document.body.appendChild(backdrop);
    state.modalEl = backdrop;
    return backdrop;
  }

  function openIosModal() {
    const modal = ensureModal();
    modal.hidden = false;
    const closeBtn = modal.querySelector('.tl-pwa-modal-close');
    if (closeBtn) {
      try {
        closeBtn.focus();
      } catch (_) {}
    }
  }

  function closeIosModal() {
    if (state.modalEl) {
      state.modalEl.hidden = true;
    }
  }

  async function handleButtonClick() {
    const mode = getActiveMode();
    if (mode === 'chromium' && state.deferredPrompt) {
      const promptEvent = state.deferredPrompt;
      state.deferredPrompt = null;
      window.__toollabDeferredInstallPrompt = null;
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice && choice.outcome === 'accepted') {
          state.installed = true;
        }
      } catch (_) {
        // Ignore prompt cancellation/errors cleanly
      }
      syncButtonUI();
      return;
    }

    if (mode === 'ios') {
      openIosModal();
    }
  }

  function createButtonElement() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = BUTTON_CLASS + ' no-print';
    btn.setAttribute('data-pwa-install-btn', 'true');
    btn.hidden = true;
    btn.addEventListener('click', handleButtonClick);
    return btn;
  }

  function syncButtonUI() {
    if (!state.buttonEl) return;

    const mode = getActiveMode();
    if (mode === 'chromium') {
      state.buttonEl.innerHTML = createDownloadIconSvg() + '<span>앱 설치</span>';
      state.buttonEl.setAttribute('aria-label', state.appName + ' 앱 설치');
      state.buttonEl.title = '홈 화면에 앱으로 설치';
      state.buttonEl.hidden = false;
    } else if (mode === 'ios') {
      state.buttonEl.innerHTML = createIosAddIconSvg() + '<span>홈 화면 추가</span>';
      state.buttonEl.setAttribute('aria-label', state.appName + ' 홈 화면 추가 안내');
      state.buttonEl.title = 'Safari에서 홈 화면에 추가 방법 보기';
      state.buttonEl.hidden = false;
    } else {
      state.buttonEl.hidden = true;
    }
  }

  function findMountTarget() {
    if (!state.targetSelector) return null;
    try {
      return document.querySelector(state.targetSelector);
    } catch (_) {
      return null;
    }
  }

  function mountIntoTarget() {
    const target = findMountTarget();
    if (!target) return false;

    if (!state.buttonEl) {
      state.buttonEl = createButtonElement();
    }

    if (state.buttonEl.parentNode !== target) {
      target.appendChild(state.buttonEl);
    }

    syncButtonUI();
    return true;
  }

  function watchForDynamicMount() {
    if (state.observer || typeof MutationObserver !== 'function') return;

    const root = document.body || document.documentElement;
    if (!root) return;

    state.observer = new MutationObserver(function () {
      if (!state.buttonEl || !document.body.contains(state.buttonEl)) {
        mountIntoTarget();
      }
    });

    state.observer.observe(root, { childList: true, subtree: true });
  }

  function registerServiceWorker() {
    if (state.swRegistered) return;
    if (isExcludedPath()) return;
    if (!state.swScope) return;
    if (typeof window === 'undefined' || !window.isSecureContext) return;
    if (!('serviceWorker' in navigator)) return;

    const doRegister = function () {
      if (state.swRegistered) return;
      state.swRegistered = true;
      navigator.serviceWorker
        .register(state.swUrl, {
          scope: state.swScope,
          updateViaCache: 'none',
        })
        .catch(function (err) {
          if (typeof console !== 'undefined' && console.warn) {
            console.warn('[PWAInstallButton] Service Worker registration skipped:', err);
          }
        });
    };

    if (document.readyState === 'complete') {
      doRegister();
    } else {
      window.addEventListener('load', doRegister, { once: true });
    }
  }

  function bindGlobalListeners() {
    if (state.listenersBound) return;
    state.listenersBound = true;
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      state.deferredPrompt = e;
      window.__toollabDeferredInstallPrompt = e;
      syncButtonUI();
    });

    window.addEventListener('appinstalled', function () {
      state.deferredPrompt = null;
      window.__toollabDeferredInstallPrompt = null;
      state.installed = true;
      closeIosModal();
      syncButtonUI();
    });

    if (typeof window.matchMedia === 'function') {
      try {
        const mq = window.matchMedia('(display-mode: standalone)');
        const onDisplayModeChange = function (ev) {
          state.standalone = Boolean(ev && ev.matches) || isStandaloneMode();
          if (state.standalone) {
            closeIosModal();
          }
          syncButtonUI();
        };
        if (typeof mq.addEventListener === 'function') {
          mq.addEventListener('change', onDisplayModeChange);
        } else if (typeof mq.addListener === 'function') {
          mq.addListener(onDisplayModeChange);
        }
      } catch (_) {}
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.modalEl && !state.modalEl.hidden) {
        closeIosModal();
      }
    });
  }

  function init(options) {
    if (isExcludedPath()) return;

    resolveInitialConfig(options);
    injectStyles();
    bindGlobalListeners();
    registerServiceWorker();

    const startMount = function () {
      if (!mountIntoTarget()) {
        watchForDynamicMount();
      } else if (state.targetSelector && state.targetSelector.indexOf('#root') !== -1) {
        // Keep watching SPA mounts (e.g. /etf React header) in case of re-render
        watchForDynamicMount();
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startMount, { once: true });
    } else {
      startMount();
    }
  }

  // Expose public API
  window.PWAInstallButton = {
    mount: init,
    openIosModal: openIosModal,
    closeIosModal: closeIosModal,
    isStandalone: isStandaloneMode,
    isIosSafari: isIosSafari,
    getState: function () {
      return {
        appName: state.appName,
        swScope: state.swScope,
        mode: getActiveMode(),
        standalone: state.standalone,
        installed: state.installed,
        iosSafari: state.iosSafari,
        hasDeferredPrompt: Boolean(state.deferredPrompt),
      };
    },
  };

  init();
})();
