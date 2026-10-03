import os
import re

def inject_clean_ads():
    base_dir = r"D:\Gemini_Files\ToolLab.org"
    
    # ToolLab 표준 청정 반응형 광고 슬롯 컴포넌트
    ad_component = """
      <!-- ToolLab Clean Ad Unit -->
      <div class="my-8 flex flex-col items-center justify-center">
        <span class="text-[10px] font-mono tracking-widest text-slate-600 uppercase mb-1.5">ADVERTISEMENT</span>
        <div class="w-full max-w-3xl min-h-[100px] sm:min-h-[250px] bg-slate-900/40 border border-slate-800/80 rounded-2xl flex items-center justify-center overflow-hidden">
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-client="ca-pub-1512367949140208"
               data-ad-slot="5185318921"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <script>
               (adsbygoogle = window.adsbygoogle || []).push({});
          </script>
        </div>
      </div>
"""

    targets = [
        # Finance & Math (4)
        "tools/unit-converter.html",
        "tools/percentage-calc.html",
        "tools/loan-compound-calc.html",
        "tools/dday-calculator.html",
        # Developer & Text (8)
        "tools/word-counter.html",
        "tools/json-formatter.html",
        "tools/regex-tester.html",
        "tools/text-formatter.html",
        "tools/base64-tool.html",
        "tools/url-parser.html",
        "tools/markdown-previewer.html",
        "tools/lorem-generator.html",
        # Image & Media (5)
        "tools/image-compressor.html",
        "tools/image-resizer.html",
        "tools/qr-generator.html",
        "tools/favicon-generator.html",
        "tools/background-remover.html",
        # Games (1)
        "games/2048.html"
    ]

    updated_count = 0

    for rel_path in targets:
        file_path = os.path.join(base_dir, rel_path.replace("/", os.sep))
        if not os.path.exists(file_path):
            print(f"[건너뜀] 파일 없음: {rel_path}")
            continue

        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # 이미 광고 슬롯이 삽입되어 있다면 중복 방지
        if "ToolLab Clean Ad Unit" in content or "5185318921" in content:
            print(f"[이미 존재] {rel_path}")
            continue

        # 최적 삽입 지점 탐색:
        # 1. 하단 크롤러 설명/FAQ 섹션 직전 (<section id="guide", <section class="faq, <!-- Guide, <!-- FAQ 등)
        # 2. 없으면 </main> 닫히는 태그 직전
        # 3. 없으면 </body> 직전
        inserted = False

        patterns = [
            r"(<section[^>]*id=[\"'](?:guide|faq|info|about)[\"'])",
            r"(<!--\s*(?:SEO|Guide|FAQ|Description)\s*-->)",
            r"(</main>)",
            r"(<footer)"
        ]

        for pat in patterns:
            match = re.search(pat, content, re.IGNORECASE)
            if match:
                idx = match.start()
                new_content = content[:idx] + ad_component + "\n      " + content[idx:]
                inserted = True
                break

        if not inserted:
            # 안전한 최후 폴백: </body> 직전
            new_content = content.replace("</body>", f"{ad_component}\n</body>")

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)

        print(f"[완료] 광고 슬롯 삽입: {rel_path}")
        updated_count += 1

    print(f"\n총 {updated_count}개 파일에 청정 광고 슬롯 삽입 완료!")

if __name__ == "__main__":
    inject_clean_ads()