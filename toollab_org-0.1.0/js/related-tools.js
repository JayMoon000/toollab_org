/**
 * ToolLab.org Dynamic Cross-Linking & Recommendation Engine
 * Zero-Server execution: Computes relevant mesh links in-browser
 */
(function() {
  const ALL_TOOLS = [
    // Finance & Math
    { id: "unit-converter", title: "Universal Unit Converter", desc: "Convert Metric and Imperial units instantly.", category: "finance", path: "/tools/unit-converter.html", badge: "NIST / SI" },
    { id: "percentage-calc", title: "Percentage & Margin Calculator", desc: "Calculate margins, discounts, and percentage deltas.", category: "finance", path: "/tools/percentage-calc.html", badge: "Financial" },
    { id: "loan-compound-calc", title: "Loan & Compound Engine", desc: "Simulate amortization schedules and compound interest.", category: "finance", path: "/tools/loan-compound-calc.html", badge: "Amortization" },
    { id: "dday-calculator", title: "D-Day & Countdown Tracker", desc: "Track remaining business days and milestone countdowns.", category: "finance", path: "/tools/dday-calculator.html", badge: "Duration" },

    // Developer & Text
    { id: "word-counter", title: "Word & Character Counter", desc: "Analyze characters, words, reading duration, and limits.", category: "developer", path: "/tools/word-counter.html", badge: "Real-Time" },
    { id: "json-formatter", title: "JSON Formatter & Validator", desc: "Beautify, inspect keys, and minify JSON payloads.", category: "developer", path: "/tools/json-formatter.html", badge: "Validator" },
    { id: "regex-tester", title: "Regex Tester & Debugger", desc: "Interactive regular expression matcher with highlight.", category: "developer", path: "/tools/regex-tester.html", badge: "RegExp" },
    { id: "text-formatter", title: "Text Formatter & Slugifier", desc: "Transform casing, sort lines, and generate clean slugs.", category: "developer", path: "/tools/text-formatter.html", badge: "Utility" },
    { id: "base64-tool", title: "Base64 Tool & Data URI", desc: "Encode/decode UTF-8 and convert files to Data URIs.", category: "developer", path: "/tools/base64-tool.html", badge: "RFC 4648" },
    { id: "url-parser", title: "URL Parser & Query Inspector", desc: "Deconstruct URLs and interactively manage query params.", category: "developer", path: "/tools/url-parser.html", badge: "RFC 3986" },
    { id: "markdown-previewer", title: "Markdown Previewer", desc: "Live CommonMark editor with direct HTML export.", category: "developer", path: "/tools/markdown-previewer.html", badge: "CommonMark" },
    { id: "lorem-generator", title: "Lorem Ipsum Generator", desc: "Generate customizable dummy text for typography layout.", category: "developer", path: "/tools/lorem-generator.html", badge: "Typesetter" },

    // Image & Media
    { id: "image-compressor", title: "Image Compressor & WebP", desc: "Compress JPG/PNG/WebP locally via Canvas engine.", category: "media", path: "/tools/image-compressor.html", badge: "Canvas Engine" },
    { id: "image-resizer", title: "Bulk Image Resizer", desc: "Batch resize photos by exact dimensions or scale factor.", category: "media", path: "/tools/image-resizer.html", badge: "Batch Scale" },
    { id: "qr-generator", title: "Vector QR Code Generator", desc: "Generate permanent static QR codes with SVG and PNG.", category: "media", path: "/tools/qr-generator.html", badge: "SVG & HD" },
    { id: "favicon-generator", title: "Favicon Package Generator", desc: "Create complete icon bundles (PWA/iOS) in a single ZIP.", category: "media", path: "/tools/favicon-generator.html", badge: "PWA & iOS" },
    { id: "background-remover", title: "AI Background Remover", desc: "100% on-device AI cutout using WebAssembly neural model.", category: "media", path: "/tools/background-remover.html", badge: "Wasm AI" },

    // Casual Brain Games
    { id: "2048", title: "2048 Classic Web Puzzle", desc: "Merge tiles and reach the 2048 milestone with zero ads lag.", category: "games", path: "/games/2048.html", badge: "Casual Brain" }
  ];

  function initRecommendations() {
    const currentPath = window.location.pathname;
    const currentTool = ALL_TOOLS.find(t => currentPath.includes(t.id));
    
    let currentCat = currentTool ? currentTool.category : "developer";
    let currentId = currentTool ? currentTool.id : "";

    // 1. 같은 카테고리 후보군 추출 (현재 페이지 제외)
    let sameCatTools = ALL_TOOLS.filter(t => t.category === currentCat && t.id !== currentId);
    // 2. 다른 카테고리 후보군 추출 (체류시간용 게임/미디어 우선 노출)
    let diffCatTools = ALL_TOOLS.filter(t => t.category !== currentCat && t.id !== currentId);

    // 셔플 함수
    const shuffle = arr => [...arr].sort(() => 0.5 - Math.random());

    // 같은 카테고리에서 최대 2개, 다른 카테고리에서 1개 선택
    let selected = [];
    selected.push(...shuffle(sameCatTools).slice(0, 2));
    
    // 타 카테고리에서 1개 보충 (모자라면 전체에서 보충)
    const needed = 3 - selected.length;
    selected.push(...shuffle(diffCatTools).slice(0, needed));

    if (selected.length === 0) return;

    // 렌더링 컨테이너 생성
    const section = document.createElement("section");
    section.className = "w-full max-w-4xl mx-auto mt-12 pt-8 border-t border-slate-800 text-left";
    section.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          Related Utilities You Might Need
        </h3>
        <a href="/" class="text-xs text-slate-500 hover:text-emerald-400 transition-colors">Explore All 18 Tools &rarr;</a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        ${selected.map(tool => `
          <a href="${tool.path}" class="group p-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all flex flex-col justify-between shadow-sm">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 group-hover:text-emerald-400 transition-colors">
                  ${tool.badge}
                </span>
                <span class="text-slate-600 group-hover:text-emerald-400 transition-colors text-xs">&rarr;</span>
              </div>
              <div class="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                ${tool.title}
              </div>
              <p class="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                ${tool.desc}
              </p>
            </div>
          </a>
        `).join("")}
      </div>
    `;

    // 본문 컨테이너(main 또는 footer 직전)에 자동 삽입
    const mainTarget = document.querySelector("main") || document.querySelector(".max-w-4xl") || document.body;
    const footerTarget = document.querySelector("footer");
    
    if (footerTarget && footerTarget.parentNode) {
      footerTarget.parentNode.insertBefore(section, footerTarget);
    } else {
      mainTarget.appendChild(section);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRecommendations);
  } else {
    initRecommendations();
  }
})();