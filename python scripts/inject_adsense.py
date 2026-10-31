import os
import re

# 툴랩 프로젝트 폴더 경로 (환경에 맞춰 수정 또는 현재 폴더 기준)
TARGET_DIR = r"D:\Gemini_Files\ToolLab.org\games"  # 또는 도구들이 모여있는 폴더 경로

ADSENSE_SCRIPT = """  <!-- Google AdSense Official Loader -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1512367949140208" crossorigin="anonymous"></script>"""

updated_count = 0
skipped_count = 0

# TARGET_DIR 및 하위 폴더 전체 탐색
for root, _, files in os.walk(TARGET_DIR):
    for fname in files:
        if fname.endswith(".html"):
            fpath = os.path.join(root, fname)
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()

            # 이미 애드센스 클라이언트 스크립트가 있는지 확인
            if "pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" in content:
                skipped_count += 1
                continue

            # </head> 바로 직전에 스크립트 삽입
            if "</head>" in content:
                new_content = content.replace("</head>", f"{ADSENSE_SCRIPT}\n</head>", 1)
                with open(fpath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"[애드센스 스크립트 주입 완료] {os.path.relpath(fpath, TARGET_DIR)}")
                updated_count += 1
            else:
                print(f"[경고: head 태그 없음] {os.path.relpath(fpath, TARGET_DIR)}")

print(f"\n작업 완료! 적용된 파일: {updated_count}개 / 기존 유지: {skipped_count}개")