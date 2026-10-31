/**
 * ToolLab.org - Korean Related Tools Auto-Renderer
 * Path: /js/related-tools-ko.js
 */
(function() {
  const TOOLS_KO = [
    {
      id: 'word-counter',
      tag: '실시간 측정',
      title: '글자수 세기 & 형태소 분석기',
      desc: '공백 포함/제외 글자수, 단어수, 예상 읽기 시간을 실시간 측정합니다.',
      path: '/ko/tools/word-counter.html'
    },
    {
      id: 'unit-converter',
      tag: '생활·부동산',
      title: '만능 단위 변환기',
      desc: '아파트 평수↔㎡, 인치, 무게 등 필수 단위를 즉시 상호 환산합니다.',
      path: '/ko/tools/unit-converter.html'
    },
    {
      id: 'percentage-calc',
      tag: '금융·유통',
      title: '퍼센트 & 마진 계산기',
      desc: '스마트스토어 마진율, 할인율, 지분율 및 증감률을 정밀 계산합니다.',
      path: '/ko/tools/percentage-calc.html'
    },
    {
      id: 'image-compressor',
      tag: '브라우저 최적화',
      title: '이미지 무손실 압축기',
      desc: '서버 업로드 없이 브라우저 단독으로 이미지 용량을 최대 80% 줄입니다.',
      path: '/ko/tools/image-compressor.html'
    },
    {
      id: 'dday-calculator',
      tag: '일정 관리',
      title: 'D-Day & 영업일 계산기',
      desc: '목표일 카운트다운과 주말을 제외한 순수 근무일(영업일수)을 산출합니다.',
      path: '/ko/tools/dday-calculator.html'
    },
    {
      id: 'loan-compound-calc',
      tag: '자산 관리',
      title: '대출 상환 & 월 복리 계산기',
      desc: '원리금균등 상환 스케줄과 적립식 복리 스노우볼을 실시간 시뮬레이션합니다.',
      path: '/ko/tools/loan-compound-calc.html'
    },
    {
      id: 'json-formatter',
      tag: '개발자 도구',
      title: 'JSON 포맷터 & 문법 검증기',
      desc: '복잡한 JSON 데이터를 2스페이스 정렬하고 오류를 시각화합니다.',
      path: '/ko/tools/json-formatter.html'
    },
    {
      id: 'favicon-generator',
      tag: '웹 표준',
      title: '파비콘 올인원 생성기',
      desc: '16x16부터 512x512 PWA 앱 아이콘까지 웹 표준 패키지를 자동 생성합니다.',
      path: '/ko/tools/favicon-generator.html'
    },
    {
      id: 'background-remover',
      tag: '온디바이스 AI',
      title: 'AI 이미지 배경 제거기',
      desc: '서버 전송 없이 온디바이스 AI로 1초 만에 투명 누끼 PNG를 추출합니다.',
      path: '/ko/tools/background-remover.html'
    }
  ];

  function renderRelatedTools() {
    const currentPath = window.location.pathname;
    // 현재 열려있는 도구 제외하고 3개 추천
    const filtered = TOOLS_KO.filter(t => !currentPath.includes(t.id));
    const selected = filtered.slice(0, 3);

    const container = document.createElement('div');
    container.className = 'w-full max-w-4xl mx-auto px-4 mt-12 mb-8 space-y-4';

    container.innerHTML = `
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>함께 쓰면 유용한 추천 도구</span>
        </h3>
        <a href="/ko" class="text-xs text-slate-500 hover:text-emerald-400 font-medium transition">
          전체 도구 보기 →
        </a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        ${selected.map(tool => `
          <a href="${tool.path}" class="group block p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-emerald-400 font-mono tracking-wider bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                ${tool.tag}
              </span>
              <span class="text-xs text-slate-600 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5">→</span>
            </div>
            <h4 class="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition">
              ${tool.title}
            </h4>
            <p class="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
              ${tool.desc}
            </p>
          </a>
        `).join('')}
      </div>
    `;

    // 푸터 바로 앞에 삽입
    const footer = document.querySelector('footer');
    if (footer) {
      footer.parentNode.insertBefore(container, footer);
    } else {
      document.body.appendChild(container);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderRelatedTools);
  } else {
    renderRelatedTools();
  }
})();
