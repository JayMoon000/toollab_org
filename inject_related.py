import os
import re

BASE_DIR = r"D:\Gemini_Files\ToolLab.org"
TARGET_FOLDERS = ["tools", "games"]
SNIPPET = '  <script src="../js/related-tools.js"></script>\n</body>'

def inject_related():
    processed_count = 0
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

                if "js/related-tools.js" in content:
                    print(f"[SKIP] 이미 삽입됨: {folder}/{file}")
                    skipped_count += 1
                    continue

                if re.search(r'</body>', content, flags=re.IGNORECASE):
                    new_content = re.sub(
                        r'</body>',
                        SNIPPET,
                        content,
                        count=1,
                        flags=re.IGNORECASE
                    )
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"[SUCCESS] 삽입 완료: {folder}/{file}")
                    processed_count += 1
                else:
                    print(f"[WARN] </body> 태그 없음: {folder}/{file}")

    print(f"\n작업 완료: {processed_count}개 파일 처리됨, {skipped_count}개 건너뜀.")

if __name__ == "__main__":
    inject_related()