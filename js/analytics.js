/**
 * ToolLab.org - Ultra-lightweight Global Analytics Engine
 * Path: D:\Gemini_Files\ToolLab.org\js\analytics.js
 */
(function() {
  const GA_ID = 'G-MGL1YF5WFH';

  // 1. Google Analytics (gtag.js) 비동기 스크립트 인젝션
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_ID, {
    send_page_view: true,
    anonymize_ip: true
  });

  // 2. 툴킷 실행 이벤트 트래커 (Data-Driven Pivot 측정용)
  window.trackToolEvent = function(eventName, params = {}) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  };
})();