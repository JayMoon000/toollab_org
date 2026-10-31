# ToolLab.org 폴더에서 실행 (quick_fix.py)
import os

target = r"D:\Gemini_Files\ToolLab.org\etf\index.html"
with open(target, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('좌판', '시뮬레이터')

with open(target, 'w', encoding='utf-8') as f:
    f.write(text)

print("치환 완료!")