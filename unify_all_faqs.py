import os
import re

ko_tools_dir = r"D:\Gemini_Files\ToolLab.org\ko\tools"

def clean_text(text):
    text = re.sub(r'<span[^>]*class="[^"]*group-open:[^"]*"[^>]*>.*?</span>', '', text)
    text = re.sub(r'▼', '', text)
    text = re.sub(r'<span[^>]*>', '', text)
    text = re.sub(r'</span>', '', text)
    return text.strip()

def convert_faq_section(html):
    # 1. <details> 블록들에서 질문(Q)과 답변(A) 추출
    details_pattern = re.compile(r'<details[\s\S]*?</details>', re.IGNORECASE)
    matches = list(details_pattern.finditer(html))
    if not matches:
        return html, False

    qa_list = []
    for m in matches:
        block = m.group(0)
        # summary에서 질문 추출
        sum_match = re.search(r'<summary[\s\S]*?>([\s\S]*?)</summary>', block, re.IGNORECASE)
        q_raw = sum_match.group(1) if sum_match else "질문"
        q_clean = clean_text(q_raw)
        
        # p 태그에서 답변 추출
        p_match = re.search(r'<p[\s\S]*?>([\s\S]*?)</p>', block, re.IGNORECASE)
        a_raw = p_match.group(1).strip() if p_match else ""
        
        qa_list.append((q_clean, a_raw))

    if not qa_list:
        return html, False

    # 2. 통일된 오픈형 FAQ 내부 항목 생성
    items_html = []
    for idx, (q, a) in enumerate(qa_list):
        if idx == 0:
            item = f"""        <div>
          <h3 class="font-bold text-slate-200 mb-1">{q}</h3>
          <p class="text-slate-400 leading-relaxed">{a}</p>
        </div>"""
        else:
            item = f"""        <div class="border-t border-slate-800 pt-3">
          <h3 class="font-bold text-slate-200 mb-1">{q}</h3>
          <p class="text-slate-400 leading-relaxed">{a}</p>
        </div>"""
        items_html.append(item)

    replacement_content = "\n" + "\n".join(items_html) + "\n      "

    # 3. <details>들을 감싸고 있던 컨테이너 교체
    # 패턴 A: <div class="space-y-... text-xs"> <details>...</details> ... </div>
    container_pattern = re.compile(
        r'(<div class="space-y-[^"]*text-xs">)[\s\S]*?(<details[\s\S]*?</details>[\s\S]*?)(</div>)',
        re.IGNORECASE
    )

    if container_pattern.search(html):
        def repl(match):
            return f'<div class="space-y-4 text-xs">{replacement_content}</div>'
        new_html = container_pattern.sub(repl, html, count=1)
    else:
        # 패턴 B: 개별 details를 연속 치환
        # 연속된 details들을 하나로 묶어 교체
        first_span = matches[0].span()
        last_span = matches[-1].span()
        new_html = (
            html[:first_span[0]] +
            f'<div class="space-y-4 text-xs">{replacement_content}</div>' +
            html[last_span[1]:]
        )

    # 잔여 <details> 태그가 혹시 더 있는지 확인 제거
    if "<details" in new_html:
        new_html = re.sub(r'<details[\s\S]*?</details>', '', new_html)

    return new_html, True

# 디렉터리 내 모든 HTML 검사 및 변환
modified_files = []

for fname in sorted(os.listdir(ko_tools_dir)):
    if not fname.endswith(".html"):
        continue

    fpath = os.path.join(ko_tools_dir, fname)
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    if "<details" in content:
        updated, changed = convert_faq_section(content)
        if changed:
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(updated)
            modified_files.append(fname)
            print(f"✔ 오픈형 FAQ 통일 완료: {fname}")

print("\n" + "=" * 50)
if modified_files:
    print(f"✅ 총 {len(modified_files)}개 도구의 FAQ 드롭다운을 오픈형 레이아웃으로 일괄 정돈했습니다:")
    for f in modified_files:
        print(f"  - {f}")
else:
    print("✅ 이미 모든 도구의 FAQ가 오픈형 레이아웃으로 완벽히 통일되어 있습니다!")
print("=" * 50)