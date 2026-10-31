import os
import re

TOOLS_CONFIG = {
    # Finance & Math
    "unit-converter.html": ("Universal Unit Converter | ToolLab", "Convert area, length, mass, volume, and temperature between Metric and Imperial units in your browser with zero server latency."),
    "percentage-calc.html": ("Percentage & Margin Calculator | ToolLab", "Calculate percentages, proportion share, percentage changes, and retail gross margins instantly."),
    "loan-compound-calc.html": ("Loan & Compound Engine | ToolLab", "Simulate fixed monthly mortgage schedules and multi-year compound interest growth with zero login."),
    "dday-calculator.html": ("D-Day & Countdown Tracker | ToolLab", "Track remaining calendar days, working business days, and time intervals to your milestones."),
    # Developer & Text
    "word-counter.html": ("Word & Character Counter | ToolLab", "Real-time character, word, byte, and reading duration counter with social media limits."),
    "json-formatter.html": ("JSON Formatter & Validator | ToolLab", "Validate, beautify, inspect keys, and minify JSON payloads with instant client-side syntax error detection."),
    "regex-tester.html": ("Regex Tester & Debugger | ToolLab", "Interactive regular expression matcher with real-time highlights and capture group analysis."),
    "text-formatter.html": ("Text Formatter & Slugifier | ToolLab", "Transform text casing, generate clean URL slugs, remove duplicate lines, and sort text in browser memory."),
    "base64-tool.html": ("Base64 Tool & Data URI | ToolLab", "UTF-8 safe Base64 encoder and decoder with URL-safe standard and file Data URI generator."),
    "url-parser.html": ("URL Parser & Query Inspector | ToolLab", "Deconstruct URLs into protocol, host, and path, and interactively manage query parameters."),
    "markdown-previewer.html": ("Markdown Previewer | ToolLab", "Live side-by-side CommonMark markdown editor with instant client-side HTML preview and export."),
    "lorem-generator.html": ("Lorem Ipsum Generator | ToolLab", "Generate customizable placeholder dummy text by words, sentences, or paragraphs without server requests."),
    # Image & Media
    "image-compressor.html": ("Image Compressor & WebP | ToolLab", "Compress JPG, PNG, and WebP locally via HTML5 Canvas with 100% data privacy and zero server transfer."),
    "image-resizer.html": ("Bulk Image Resizer | ToolLab", "Batch resize photos by exact pixel bounds or scale factor with aspect ratio locking in browser memory."),
    "qr-generator.html": ("Vector QR Code Generator | ToolLab", "Generate permanent static QR codes for links, Wi-Fi, and contacts with SVG and HD PNG downloads."),
    "favicon-generator.html": ("Favicon Package Generator | ToolLab", "Generate complete multi-size icon bundles (16x16, 32x32, 180x180, PWA) inside a single client-side ZIP."),
    "background-remover.html": ("AI Background Remover | ToolLab", "100% on-device AI background cutout using in-browser WebAssembly neural inference."),
    # Casual Games
    "2048.html": ("2048 Classic Web Puzzle | ToolLab", "Slide identical numbers, merge powers of two, and reach the 2048 milestone in dark mode.")
}

def fix_all_heads():
    base_dir = r"D:\Gemini_Files\ToolLab.org"
    base_url = "https://toollab.org"
    og_image = "https://toollab.org/og-image.png"

    fixed_count = 0

    for filename, (title, desc) in TOOLS_CONFIG.items():
        sub_dir = "games" if filename == "2048.html" else "tools"
        file_path = os.path.join(base_dir, sub_dir, filename)

        if not os.path.exists(file_path):
            continue

        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        page_url = f"{base_url}/{sub_dir}/{filename}"

        clean_meta_block = f"""  <!-- Tailwind CDN & Config -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {{
      darkMode: 'class'
    }}
  </script>

  <!-- Open Graph & Rich Snippets -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="ToolLab" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{desc}" />
  <meta property="og:url" content="{page_url}" />
  <meta property="og:image" content="{og_image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title}" />
  <meta name="twitter:description" content="{desc}" />
  <meta name="twitter:image" content="{og_image}" />
  <link rel="canonical" href="{page_url}" />
</head>"""

        # 1. 엉킨 Open Graph 블록 및 중복 canonical/meta 제거
        content = re.sub(r"<!--\s*Open Graph.*?-->.*?(?=</head>)", "", content, flags=re.DOTALL)
        content = re.sub(r"<meta property=\"og:[^\"]*\"[^\n]*\n?", "", content)
        content = re.sub(r"<meta name=\"twitter:[^\"]*\"[^\n]*\n?", "", content)
        content = re.sub(r"<link rel=\"canonical\"[^\n]*\n?", "", content)

        # 2. 혹시 남아있는 중복 tailwind script 제거 후 깔끔하게 재주입
        content = re.sub(r"<script src=\"https://cdn\.tailwindcss\.com\"></script>\s*", "", content)
        content = re.sub(r"<script>\s*tailwind\.config\s*=[^<]*</script>\s*", "", content)

        # 3. </head> 직전에 완벽한 블록 주입
        content = re.sub(r"</head>", clean_meta_block, content)

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"[복구 완료] {sub_dir}/{filename}")
        fixed_count += 1

    print(f"\n총 {fixed_count}개 파일 Tailwind 및 메타 규격 복구 완료!")

if __name__ == "__main__":
    fix_all_heads()