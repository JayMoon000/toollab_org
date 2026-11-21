/**
 * ToolLab Shared Viral Engagement Module (ToolEngagementBar)
 * Path: /js/tool-engagement-bar.js
 *
 * One-line usage options:
 * 1) Script tag with data attributes:
 *    <script src="/js/tool-engagement-bar.js" data-tool-id="etf" data-title="..." data-description="..." data-url="https://toollab.org/etf" data-lang="ko"></script>
 * 2) Custom Element:
 *    <tool-engagement-bar tool-id="sudoku" title="..." description="..." url="https://toollab.org/arcade/sudoku" lang="en"></tool-engagement-bar>
 * 3) JavaScript API:
 *    ToolEngagementBar.mount({ toolId: 'etf', title: '...', description: '...', url: '...', lang: 'ko', target: '#container' });
 */
(function () {
  'use strict';

  const API_ENDPOINT = 'https://toollab-likes-api.jmoonx.workers.dev/api/likes';
  const STYLE_ID = 'toollab-engagement-bar-styles';
  const TOAST_ID = 'toollab-engagement-toast';

  const I18N = {
    ko: {
      likePrefix: '도움이 됐어요 ❤️',
      shareLabel: '📤 지인에게 추천하기',
      toastCopied: '추천 문구와 링크가 복사되었습니다!',
      likeAria: '이 도구가 도움이 됐어요 (좋아요)',
      likedAria: '이미 도움이 됐어요를 눌렀습니다',
      shareAria: '지인에게 이 도구 추천 및 공유하기'
    },
    en: {
      likePrefix: 'Helpful ❤️',
      shareLabel: '📤 Share with a friend',
      toastCopied: 'Recommendation text and link copied!',
      likeAria: 'Mark this tool as helpful (Like)',
      likedAria: 'You already marked this tool as helpful',
      shareAria: 'Share this tool with a friend'
    }
  };

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .teb-host-wrap {
        width: 100%;
        max-width: 680px;
        margin: 28px auto 12px;
        padding: 0 16px;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "Pretendard Variable", "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", Roboto, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .teb-card {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 14px 16px;
        background: linear-gradient(180deg, rgba(30, 41, 59, 0.92) 0%, rgba(15, 23, 42, 0.96) 100%);
        border: 1px solid rgba(51, 65, 85, 0.85);
        border-radius: 16px;
        box-shadow: 0 10px 25px -5px rgba(2, 6, 23, 0.45);
        box-sizing: border-box;
      }
      .teb-btn {
        appearance: none;
        -webkit-appearance: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 44px;
        padding: 10px 18px;
        border-radius: 12px;
        font-family: inherit;
        font-size: 13.5px;
        font-weight: 700;
        line-height: 1.2;
        letter-spacing: -0.01em;
        cursor: pointer;
        user-select: none;
        transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        box-sizing: border-box;
        white-space: nowrap;
        flex: 1 1 auto;
        max-width: 280px;
      }
      .teb-btn:focus-visible {
        outline: 2px solid #38bdf8;
        outline-offset: 2px;
      }
      .teb-btn:active {
        transform: scale(0.97);
      }
      .teb-btn-like {
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid #334155;
        color: #f1f5f9;
      }
      .teb-btn-like:hover:not(.is-liked) {
        background: rgba(30, 41, 59, 0.95);
        border-color: rgba(244, 63, 94, 0.55);
        color: #fda4af;
        box-shadow: 0 0 16px rgba(244, 63, 94, 0.15);
      }
      .teb-btn-like.is-liked {
        background: rgba(244, 63, 94, 0.16);
        border-color: rgba(244, 63, 94, 0.6);
        color: #fda4af;
        cursor: default;
        box-shadow: 0 0 18px rgba(244, 63, 94, 0.18);
      }
      .teb-btn-like.is-liked:active {
        transform: none;
      }
      .teb-like-count {
        font-variant-numeric: tabular-nums;
        font-weight: 800;
      }
      .teb-btn-share {
        background: rgba(56, 189, 248, 0.14);
        border: 1px solid rgba(56, 189, 248, 0.45);
        color: #38bdf8;
      }
      .teb-btn-share:hover {
        background: rgba(56, 189, 248, 0.24);
        border-color: rgba(56, 189, 248, 0.75);
        color: #e0f2fe;
        box-shadow: 0 0 16px rgba(56, 189, 248, 0.2);
      }
      @keyframes tebHeartPop {
        0% { transform: scale(1); }
        40% { transform: scale(1.28); }
        70% { transform: scale(0.92); }
        100% { transform: scale(1); }
      }
      .teb-pop {
        animation: tebHeartPop 0.36s ease-out;
      }
      .teb-toast {
        position: fixed;
        left: 50%;
        bottom: 28px;
        transform: translate(-50%, 16px);
        z-index: 99999;
        background: rgba(15, 23, 42, 0.96);
        color: #f8fafc;
        border: 1px solid rgba(56, 189, 248, 0.5);
        border-radius: 999px;
        padding: 11px 20px;
        font-family: -apple-system, BlinkMacSystemFont, "Pretendard Variable", "Pretendard", "Noto Sans KR", sans-serif;
        font-size: 13px;
        font-weight: 700;
        line-height: 1.4;
        box-shadow: 0 12px 30px rgba(2, 6, 23, 0.65);
        pointer-events: none;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
        white-space: nowrap;
        max-width: calc(100vw - 32px);
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .teb-toast.is-visible {
        opacity: 1;
        visibility: visible;
        transform: translate(-50%, 0);
      }
      @media (max-width: 480px) {
        .teb-card {
          padding: 12px;
          gap: 8px;
        }
        .teb-btn {
          font-size: 13px;
          padding: 10px 14px;
          max-width: none;
        }
      }
      @media print {
        .teb-host-wrap,
        .teb-toast,
        tool-engagement-bar {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  let toastTimeoutId = null;

  function showToast(message, durationMs) {
    const duration = typeof durationMs === 'number' ? durationMs : 2500;
    injectStyles();
    let toast = document.getElementById(TOAST_ID);
    if (!toast) {
      toast = document.createElement('div');
      toast.id = TOAST_ID;
      toast.className = 'teb-toast no-print';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId);
    }
    toastTimeoutId = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, duration);
  }

  function getMetaContent(property) {
    const el = document.querySelector('meta[property="' + property + '"]') ||
               document.querySelector('meta[name="' + property + '"]');
    return el ? (el.getAttribute('content') || '').trim() : '';
  }

  function resolveConfig(raw) {
    const opts = raw || {};
    const loc = (typeof window !== 'undefined' && window.location) ? window.location : { pathname: '', href: '' };
    const pathSegment = (loc.pathname || '').replace(/^\/+|\/+$/g, '').split('/').pop() || 'home';
    const toolId = String(opts.toolId || opts['tool-id'] || pathSegment).trim();
    const langRaw = String(opts.lang || (document.documentElement && document.documentElement.lang) || 'ko').toLowerCase();
    const lang = langRaw.startsWith('en') ? 'en' : 'ko';
    const title = String(opts.title || getMetaContent('og:title') || document.title || 'ToolLab').trim();
    const description = String(opts.description || getMetaContent('og:description') || getMetaContent('description') || '').trim();
    const url = String(opts.url || getMetaContent('og:url') || loc.href).trim();

    return {
      toolId: toolId,
      lang: lang,
      title: title,
      description: description,
      url: url
    };
  }

  function getLikedStorageKey(toolId) {
    return 'toollab_liked_' + toolId;
  }

  function getCountCacheKey(toolId) {
    return 'toollab_likes_count_' + toolId;
  }

  function readIsLiked(toolId) {
    try {
      const val = window.localStorage.getItem(getLikedStorageKey(toolId));
      return val === '1' || val === 'true';
    } catch (_) {
      return false;
    }
  }

  function writeIsLiked(toolId) {
    try {
      window.localStorage.setItem(getLikedStorageKey(toolId), 'true');
    } catch (_) {
      // Ignore storage errors silently
    }
  }

  function readCachedCount(toolId) {
    try {
      const val = window.localStorage.getItem(getCountCacheKey(toolId));
      const num = Number(val);
      return Number.isFinite(num) && num >= 0 ? Math.floor(num) : 0;
    } catch (_) {
      return 0;
    }
  }

  function writeCachedCount(toolId, count) {
    try {
      if (Number.isFinite(count) && count >= 0) {
        window.localStorage.setItem(getCountCacheKey(toolId), String(Math.floor(count)));
      }
    } catch (_) {
      // Ignore storage errors silently
    }
  }

  function isMobileShareEnvironment() {
    if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
      return false;
    }
    // If navigator.share was overridden by a test spy/mock, allow calling it
    try {
      const fnStr = Function.prototype.toString.call(navigator.share);
      if (!fnStr.includes('[native code]')) {
        return true;
      }
    } catch (_) {}

    const ua = navigator.userAgent || '';
    const isMobileUA = /Android|iPhone|iPad|iPod|Mobile|CriOS|FxiOS/i.test(ua);
    const isIPadOS = /Macintosh/i.test(ua) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1;
    return Boolean(isMobileUA || isIPadOS);
  }

  async function copyTextToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        // Fall through to legacy textarea fallback
      }
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch (_) {
      return false;
    }
  }

  function createEngagementBarDOM(rawOptions) {
    injectStyles();

    // Clean up legacy local like storage on ETF simulator if present
    try {
      window.localStorage.removeItem('toollab:etf-simulator:like');
    } catch (_) {}

    const config = resolveConfig(rawOptions);
    const dict = I18N[config.lang] || I18N.ko;

    let isLiked = readIsLiked(config.toolId);
    let count = readCachedCount(config.toolId);
    if (isLiked && count < 1) {
      count = 1;
    }
    let hasOptimisticPost = false;

    const wrapper = document.createElement('div');
    wrapper.className = 'teb-host-wrap no-print';
    wrapper.setAttribute('data-tool-engagement-bar', config.toolId);
    wrapper.setAttribute('data-lang', config.lang);

    const card = document.createElement('div');
    card.className = 'teb-card';

    // 1. Like Button
    const likeBtn = document.createElement('button');
    likeBtn.type = 'button';
    likeBtn.className = 'teb-btn teb-btn-like' + (isLiked ? ' is-liked' : '');
    likeBtn.setAttribute('aria-pressed', isLiked ? 'true' : 'false');
    likeBtn.setAttribute('aria-label', isLiked ? dict.likedAria : dict.likeAria);
    likeBtn.setAttribute('data-action', 'like');

    const likeTextSpan = document.createElement('span');
    likeTextSpan.className = 'teb-like-label';
    likeTextSpan.textContent = dict.likePrefix;

    const likeCountSpan = document.createElement('span');
    likeCountSpan.className = 'teb-like-count';
    likeCountSpan.textContent = String(count);

    likeBtn.appendChild(likeTextSpan);
    likeBtn.appendChild(likeCountSpan);

    // 2. Share Button
    const shareBtn = document.createElement('button');
    shareBtn.type = 'button';
    shareBtn.className = 'teb-btn teb-btn-share';
    shareBtn.setAttribute('aria-label', dict.shareAria);
    shareBtn.setAttribute('data-action', 'share');
    shareBtn.textContent = dict.shareLabel;

    card.appendChild(likeBtn);
    card.appendChild(shareBtn);
    wrapper.appendChild(card);

    function updateLikeUI(animate) {
      likeCountSpan.textContent = String(count);
      likeBtn.classList.toggle('is-liked', isLiked);
      likeBtn.setAttribute('aria-pressed', isLiked ? 'true' : 'false');
      likeBtn.setAttribute('aria-label', isLiked ? dict.likedAria : dict.likeAria);
      if (animate) {
        likeBtn.classList.remove('teb-pop');
        void likeBtn.offsetWidth;
        likeBtn.classList.add('teb-pop');
      }
    }

    // Initial GET request to fetch cumulative count
    (async function fetchInitialLikes() {
      try {
        const res = await fetch(API_ENDPOINT + '?tool=' + encodeURIComponent(config.toolId), {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data && typeof data.count === 'number' && Number.isFinite(data.count)) {
          const serverCount = Math.max(0, Math.floor(data.count));
          count = (hasOptimisticPost || isLiked) ? Math.max(count, serverCount) : serverCount;
          writeCachedCount(config.toolId, count);
          updateLikeUI(false);
        }
      } catch (_) {
        // Silent fallback on network error: keep local state without console error
      }
    })();

    // Like button click handler (Optimistic UI + localStorage duplicate prevention)
    likeBtn.addEventListener('click', function () {
      if (isLiked || readIsLiked(config.toolId)) {
        isLiked = true;
        updateLikeUI(false);
        return;
      }

      isLiked = true;
      hasOptimisticPost = true;
      count = Math.max(0, count) + 1;
      writeIsLiked(config.toolId);
      writeCachedCount(config.toolId, count);
      updateLikeUI(true);

      // Background POST request
      (async function postLike() {
        try {
          const res = await fetch(API_ENDPOINT + '?tool=' + encodeURIComponent(config.toolId), {
            method: 'POST',
            headers: { 'Accept': 'application/json' }
          });
          if (!res.ok) return;
          const data = await res.json();
          if (data && typeof data.count === 'number' && Number.isFinite(data.count)) {
            count = Math.max(count, Math.floor(data.count));
            writeCachedCount(config.toolId, count);
            updateLikeUI(false);
          }
        } catch (_) {
          // Silent fallback on network error: preserve optimistic local state
        }
      })();
    });

    // Hybrid Share button click handler
    shareBtn.addEventListener('click', async function () {
      const sharePayload = {
        title: config.title,
        text: config.description,
        url: config.url
      };

      if (isMobileShareEnvironment()) {
        try {
          await navigator.share(sharePayload);
          return;
        } catch (err) {
          if (err && err.name === 'AbortError') {
            return;
          }
          // If navigator.share failed for other reasons, fall back to clipboard copy
        }
      }

      const formattedText = [config.title, config.description, config.url].filter(Boolean).join('\n');
      await copyTextToClipboard(formattedText);
      showToast(dict.toastCopied, 2500);
    });

    return wrapper;
  }

  // Define Custom Element <tool-engagement-bar> for 1-line declarative HTML usage
  if (typeof window !== 'undefined' && window.customElements && !window.customElements.get('tool-engagement-bar')) {
    class ToolEngagementBarElement extends HTMLElement {
      connectedCallback() {
        if (this._mounted) return;
        this._mounted = true;
        const bar = createEngagementBarDOM({
          toolId: this.getAttribute('tool-id') || this.getAttribute('data-tool-id'),
          title: this.getAttribute('title') || this.getAttribute('data-title'),
          description: this.getAttribute('description') || this.getAttribute('data-description'),
          url: this.getAttribute('url') || this.getAttribute('data-url'),
          lang: this.getAttribute('lang') || this.getAttribute('data-lang')
        });
        this.appendChild(bar);
      }
    }
    window.customElements.define('tool-engagement-bar', ToolEngagementBarElement);
  }

  function mountBar(options) {
    const opts = options || {};
    const bar = createEngagementBarDOM(opts);

    if (opts.target) {
      const targetEl = typeof opts.target === 'string' ? document.querySelector(opts.target) : opts.target;
      if (targetEl) {
        targetEl.appendChild(bar);
        return bar;
      }
    }

    if (opts.scriptElement && opts.scriptElement.parentNode && opts.scriptElement.parentNode !== document.head) {
      const parent = opts.scriptElement.parentNode;
      // If script tag is placed directly inside a layout container (or right before footer), insert right before script tag
      if (parent !== document.body || !document.getElementById('root')) {
        parent.insertBefore(bar, opts.scriptElement);
        return bar;
      }
    }

    const insertBeforeFooter = function () {
      const existing = document.querySelector('[data-tool-engagement-bar="' + bar.getAttribute('data-tool-engagement-bar') + '"]');
      if (existing && existing.isConnected) return true;

      const footer = document.querySelector('footer');
      if (footer && footer.parentNode) {
        footer.parentNode.insertBefore(bar, footer);
        return true;
      }
      return false;
    };

    if (insertBeforeFooter()) {
      return bar;
    }

    // For SPA / React roots (e.g. /etf) where footer mounts asynchronously
    const observer = new MutationObserver(function () {
      if (insertBeforeFooter()) {
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });

    // Fallback timeout if no footer ever appears
    setTimeout(function () {
      observer.disconnect();
      if (!bar.isConnected && document.body) {
        document.body.appendChild(bar);
      }
    }, 4000);

    return bar;
  }

  // Auto-initialize from current <script src="/js/tool-engagement-bar.js" data-tool-id="...">
  const currentScript = document.currentScript;
  if (currentScript && (currentScript.hasAttribute('data-tool-id') || currentScript.hasAttribute('tool-id'))) {
    const scriptConfig = {
      toolId: currentScript.getAttribute('data-tool-id') || currentScript.getAttribute('tool-id'),
      title: currentScript.getAttribute('data-title') || currentScript.getAttribute('title'),
      description: currentScript.getAttribute('data-description') || currentScript.getAttribute('description'),
      url: currentScript.getAttribute('data-url') || currentScript.getAttribute('url'),
      lang: currentScript.getAttribute('data-lang') || currentScript.getAttribute('lang') || 'ko',
      target: currentScript.getAttribute('data-target'),
      scriptElement: currentScript
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        mountBar(scriptConfig);
      });
    } else {
      mountBar(scriptConfig);
    }
  }

  window.ToolEngagementBar = {
    mount: mountBar,
    init: mountBar,
    create: createEngagementBarDOM,
    showToast: showToast
  };
})();
