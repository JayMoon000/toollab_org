import os

def update_analytics():
    base_dir = r"D:\Gemini_Files\ToolLab.org"
    analytics_path = os.path.join(base_dir, "js", "analytics.js")

    if not os.path.exists(analytics_path):
        print(f"[오류] 파일 없음: {analytics_path}")
        return

    with open(analytics_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 체류 시간 및 자동 클릭 트래커 코드 블록
    event_tracker_code = """
  // 3. 체류 시간(Dwell Time) 자동 추적 (30초, 60초)
  const trackDwell = (seconds) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'dwell_time', {
        event_category: 'Engagement',
        event_label: seconds + 's',
        value: seconds
      });
    }
  };
  setTimeout(() => trackDwell(30), 30000);
  setTimeout(() => trackDwell(60), 60000);

  // 4. 연산/실행 버튼 인터랙션 자동 추적
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button, input[type="file"], input[type="range"]').forEach(el => {
      el.addEventListener('click', () => {
        const actionLabel = (el.innerText || el.id || el.name || 'action').trim().substring(0, 30);
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'tool_interaction', {
            tool_title: document.title,
            element: actionLabel
          });
        }
      }, { passive: true });
    });
  });
"""

    if "dwell_time" not in content:
        # 파일 끝의 })(); 바로 앞에 삽입
        if content.strip().endswith("})();"):
            idx = content.rfind("})();")
            new_content = content[:idx] + event_tracker_code + "\n})();"
        else:
            new_content = content + "\n" + event_tracker_code

        with open(analytics_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("[완료] analytics.js에 체류시간/인터랙션 추적 로직 추가 완료")
    else:
        print("[확인] 이미 최신 트래킹 이벤트가 포함되어 있습니다.")

    # 각 HTML 파일에 스크립트 연결 여부 확인 및 주입
    targets = [
        "index.html",
        "tools/unit-converter.html", "tools/percentage-calc.html", "tools/loan-compound-calc.html", "tools/dday-calculator.html",
        "tools/word-counter.html", "tools/json-formatter.html", "tools/regex-tester.html", "tools/text-formatter.html",
        "tools/base64-tool.html", "tools/url-parser.html", "tools/markdown-previewer.html", "tools/lorem-generator.html",
        "tools/image-compressor.html", "tools/image-resizer.html", "tools/qr-generator.html", "tools/favicon-generator.html", "tools/background-remover.html",
        "games/2048.html"
    ]

    tag = '\n  <!-- ToolLab Analytics Tracker -->\n  <script src="/js/analytics.js"></script>'
    linked_count = 0

    for rel_path in targets:
        file_path = os.path.join(base_dir, rel_path.replace("/", os.sep))
        if not os.path.exists(file_path):
            continue

        with open(file_path, "r", encoding="utf-8") as f:
            html = f.read()

        if "analytics.js" in html:
            continue

        html = html.replace("</head>", f"{tag}\n</head>")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"[연결 완료] {rel_path}")
        linked_count += 1

    print(f"HTML 연결 작업: {linked_count}개 파일 추가 연결됨")

if __name__ == "__main__":
    update_analytics()