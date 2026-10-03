import os
from datetime import datetime

BASE_URL = "https://toollab.org"
TODAY = datetime.now().strftime("%Y-%m-%d")

PAGES = [
    # Main Hub
    ("", "1.0", "daily"),
    
    # Finance & Math
    ("tools/unit-converter.html", "0.8", "weekly"),
    ("tools/percentage-calc.html", "0.8", "weekly"),
    ("tools/loan-compound-calc.html", "0.8", "weekly"),
    ("tools/dday-calculator.html", "0.8", "weekly"),
    
    # Developer & Text
    ("tools/word-counter.html", "0.8", "weekly"),
    ("tools/json-formatter.html", "0.8", "weekly"),
    ("tools/regex-tester.html", "0.8", "weekly"),
    ("tools/text-formatter.html", "0.8", "weekly"),
    ("tools/base64-tool.html", "0.8", "weekly"),
    ("tools/url-parser.html", "0.8", "weekly"),
    ("tools/markdown-previewer.html", "0.8", "weekly"),
    ("tools/lorem-generator.html", "0.8", "weekly"),
    
    # Image & Media
    ("tools/image-compressor.html", "0.9", "weekly"),
    ("tools/image-resizer.html", "0.9", "weekly"),
    ("tools/qr-generator.html", "0.8", "weekly"),
    ("tools/favicon-generator.html", "0.8", "weekly"),
    ("tools/background-remover.html", "0.9", "weekly"),
    
    # Games (체류시간 방어선)
    ("games/2048.html", "0.7", "monthly")
]

def generate_files():
    base_dir = r"D:\Gemini_Files\ToolLab.org"
    os.makedirs(base_dir, exist_ok=True)
    
    # 1. sitemap.xml 생성
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]
    for path, priority, freq in PAGES:
        loc = f"{BASE_URL}/{path}" if path else f"{BASE_URL}/"
        xml_lines.append("  <url>")
        xml_lines.append(f"    <loc>{loc}</loc>")
        xml_lines.append(f"    <lastmod>{TODAY}</lastmod>")
        xml_lines.append(f"    <changefreq>{freq}</changefreq>")
        xml_lines.append(f"    <priority>{priority}</priority>")
        xml_lines.append("  </url>")
    xml_lines.append("</urlset>")
    
    sitemap_path = os.path.join(base_dir, "sitemap.xml")
    with open(sitemap_path, "w", encoding="utf-8") as f:
        f.write("\n".join(xml_lines) + "\n")
    print(f"[생성 완료] {sitemap_path}")
    
    # 2. robots.txt 생성
    robots_content = f"""User-agent: *
Allow: /

Sitemap: {BASE_URL}/sitemap.xml
"""
    robots_path = os.path.join(base_dir, "robots.txt")
    with open(robots_path, "w", encoding="utf-8") as f:
        f.write(robots_content)
    print(f"[생성 완료] {robots_path}")

if __name__ == "__main__":
    generate_files()