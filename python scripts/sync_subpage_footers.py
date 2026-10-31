import os
import re

BASE_DIR = r"D:\Gemini_Files\ToolLab.org"
TARGET_FOLDERS = ["tools", "games"]

# 교체 대상: 기존 privacy, terms만 있는 푸터 링크 패턴
# 교체 결과: About, Contact, Privacy, Terms가 모두 포함된 통합 링크
NEW_FOOTER_LINKS = (
    '<a href="../about.html" class="hover:text-emerald-400 transition-colors">About</a>\n'
    '        <span>·</span>\n'
    '        <a href="../contact.html" class="hover:text-emerald-400 transition-colors">Contact</a>\n'
    '        <span>·</span>\n'
    '        <a href="../privacy.html" class="hover:text-emerald-400 transition-colors">Privacy</a>\n'
    '        <span>·</span>\n'
    '        <a href="../terms.html" class="hover:text-emerald-400 transition-colors">Terms</a>'
)

def sync_footers():
    updated_count = 0
    skipped_count = 0

    for folder in TARGET_FOLDERS:
        folder_path = os.path.join(BASE_DIR, folder)
        if not os.path.exists(folder_path):
            continue

        for root, _, files in os.walk(folder_path):
            for file in files:
                if not file.endswith(".html"):
                    continue

                file_path = os.path.join(root, file)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()

                # 이미 About 링크가 들어가 있는지 확인
                if "about.html" in content and "contact.html" in content:
                    print(f"[SKIP] 이미 반영됨: {folder}/{file}")
                    skipped_count += 1
                    continue

                # 푸터 내 privacy.html과 terms.html 링크 블록 정규식 매칭
                # <a href="...privacy.html"...</a> ~ <a href="...terms.html"...</a>
                pattern = re.compile(
                    r'<a\s+href=[\'"][^\'"]*privacy\.html[\'"][^>]*>.*?</a>\s*(?:<span>.*?</span>\s*)?<a\s+href=[\'"][^\'"]*terms\.html[\'"][^>]*>.*?</a>',
                    re.DOTALL | re.IGNORECASE
                )

                if pattern.search(content):
                    new_content = pattern.sub(NEW_FOOTER_LINKS, content, count=1)
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"[SUCCESS] 푸터 링크 일괄 동기화: {folder}/{file}")
                    updated_count += 1
                else:
                    print(f"[WARN] 푸터 링크 패턴을 찾지 못함: {folder}/{file}")

    print(f"\n작업 완료: {updated_count}개 파일 수정 완료, {skipped_count}개 파일 건너뜀.")

if __name__ == "__main__":
    sync_footers()