import os
import re

TOOLS_META = {
    # Finance & Math
    "unit-converter.html": {
        "title": "Universal Unit Converter | ToolLab",
        "desc": "Convert area, length, mass, volume, and temperature between Metric and Imperial units in your browser with zero server latency."
    },
    "percentage-calc.html": {
        "title": "Percentage & Margin Calculator | ToolLab",
        "desc": "Calculate percentages, proportion share, percentage changes, and retail gross margins instantly."
    },
    "loan-compound-calc.html": {
        "title": "Loan & Compound Engine | ToolLab",
        "desc": "Simulate fixed monthly mortgage schedules and multi-year compound interest growth with zero login."
    },
    "dday-calculator.html": {
        "title": "D-Day & Countdown Tracker | ToolLab",
        "desc": "Track remaining calendar days, working business days, and time intervals to your milestones."
    },
    # Developer & Text
    "word-counter.html": {
        "title": "Word & Character Counter | ToolLab",
        "desc": "Real-time character, word, byte, and reading duration counter with social media limits."
    },
    "json-formatter.html": {
        "title": "JSON Formatter & Validator | ToolLab",
        "desc": "Validate, beautify, inspect keys, and minify JSON payloads with instant client-side syntax error detection."
    },
    "regex-tester.html": {
        "title": "Regex Tester & Debugger | ToolLab",
        "desc": "Interactive regular expression matcher with real-time highlights and capture group analysis."
    },
    "text-formatter.html": {
        "title": "Text Formatter & Slugifier | ToolLab",
        "desc": "Transform text casing, generate clean URL slugs, remove duplicate lines, and sort text in browser memory."
    },
    "base64-tool.html": {
        "title": "Base64 Tool & Data URI | ToolLab",
        "desc": "UTF-8 safe Base64 encoder and decoder with URL-safe standard and file Data URI generator."
    },
    "url-parser.html": {
        "title": "URL Parser & Query Inspector | ToolLab",
        "desc": "Deconstruct URLs into protocol, host, and path, and interactively manage query parameters."
    },
    "markdown-previewer.html": {
        "title": "Markdown Previewer | ToolLab",
        "desc": "Live side-by-side CommonMark markdown editor with instant client-side HTML preview and export."
    },
    "lorem-generator.html": {
        "title": "Lorem Ipsum Generator | ToolLab",
        "desc": "Generate customizable placeholder dummy text by words, sentences, or paragraphs without server requests."
    },
    # Image & Media
    "image-compressor.html": {
        "title": "Image Compressor & WebP | ToolLab",
        "desc": "Compress JPG, PNG, and WebP locally via HTML5 Canvas with 100% data privacy and zero server transfer."
    },
    "image-resizer.html": {
        "title": "Bulk Image Resizer | ToolLab",
        "desc": "Batch resize photos by exact pixel bounds or scale factor with aspect ratio locking in browser memory."
    },
    "qr-generator.html": {
        "title": "Vector QR Code Generator | ToolLab",
        "desc": "Generate permanent static QR codes for links, Wi-Fi, and contacts with SVG and HD PNG downloads."
    },
    "favicon-generator.html": {
        "title": "Favicon Package Generator | ToolLab",
        "desc": "Generate complete multi-size icon bundles (16x16, 32x32, 180x180, PWA) inside a single client-side ZIP."
    },
    "background-remover.html": {
        "title": "AI Background Remover | ToolLab",
        "desc": "100% on-device AI background cutout using in-browser WebAssembly neural inference."
    },
    # Casual Games
    "2048.html": {
        "title": "2048 Classic Web Puzzle | ToolLab",
        "desc": "Slide identical numbers, merge powers of two, and reach the 2048 milestone in dark mode."
    }
}

def inject_meta():
    base_dir = r"D:\Gemini_Files\ToolLab.org"
    base_url = "https://toollab.org"
    og_image = "https://toollab.org/og-image.png"
    
    updated_count = 0

    for filename, meta in TOOLS_META.items():
        # tools 또는 games 폴더 탐색
        sub_dir = "games" if filename == "2048.html" else "tools"
        file_path = os.path.join(base_dir, sub_dir, filename)
        
        if not os.path.exists(file_path):
            print(f"[건너뜀] 파일 없음: {file_path}")
            continue

        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        page_url = f"{base_url}/{sub_dir}/{filename}"

        # 주입할 Open Graph & Twitter 태그 블록
        meta_block = f"""  <!-- Open Graph & Rich Snippets -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="ToolLab" />
  <meta property="og:title" content="{meta['title']}" />
  <meta property="og:description" content="{meta['desc']}" />
  <meta property="og:url" content="{page_url}" />
  <meta property="og:image" content="{og_image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{meta['title']}" />
  <meta name="twitter:description" content="{meta['desc']}" />
  <meta name="twitter:image" content="{og_image}" />
  <link rel="canonical" href="{page_url}" />"""

        # 기존 og:type이나 og:title이 있으면 교체, 없으면 </head> 직전에 삽입
        if '<meta property="og:type"' in content:
            # 기존 메타 블록 교체 패턴
            pattern = re.compile(r"<!-- Open Graph.*?-->.*?<meta name=\"twitter:card\"[^\n]*\n", re.DOTALL)
            if pattern.search(content):
                new_content = pattern.sub(meta_block + "\n", content)
            else:
                new_content = content.replace("</head>", f"{meta_block}\n</head>")
        else:
            new_content = content.replace("</head>", f"{meta_block}\n</head>")

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)

        print(f"[완료] 메타 태그 주입: {sub_dir}/{filename}")
        updated_count += 1

    print(f"\n총 {updated_count}개 파일 업데이트 완료!")

if __name__ == "__main__":
    inject_meta()