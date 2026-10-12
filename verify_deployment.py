import urllib.request
import urllib.error
import ssl

def check_deployment():
    base_url = "https://toollab.org"
    
    # 점검 대상 전체 엔드포인트
    endpoints = [
        # 루트 및 핵심 자산
        ("/", "Main Hub"),
        ("/sitemap.xml", "Sitemap XML"),
        ("/robots.txt", "Robots TXT"),
        ("/og-image.png", "Official OG Image"),
        
        # 법적 고지 및 신뢰도 페이지
        ("/about.html", "About"),
        ("/contact.html", "Contact"),
        ("/privacy.html", "Privacy Policy"),
        ("/terms.html", "Terms of Service"),

        # Finance & Math (4개)
        ("/tools/unit-converter.html", "Universal Unit Converter"),
        ("/tools/percentage-calc.html", "Percentage Calculator"),
        ("/tools/loan-compound-calc.html", "Loan Compound Calc"),
        ("/tools/dday-calculator.html", "D-Day Calculator"),

        # Developer & Text (8개)
        ("/tools/word-counter.html", "Word Counter"),
        ("/tools/json-formatter.html", "JSON Formatter"),
        ("/tools/regex-tester.html", "Regex Tester"),
        ("/tools/text-formatter.html", "Text Formatter"),
        ("/tools/base64-tool.html", "Base64 Tool"),
        ("/tools/url-parser.html", "URL Parser"),
        ("/tools/markdown-previewer.html", "Markdown Previewer"),
        ("/tools/lorem-generator.html", "Lorem Generator"),

        # Image & Media (5개)
        ("/tools/image-compressor.html", "Image Compressor"),
        ("/tools/image-resizer.html", "Image Resizer"),
        ("/tools/qr-generator.html", "QR Generator"),
        ("/tools/favicon-generator.html", "Favicon Generator"),
        ("/tools/background-remover.html", "AI Background Remover"),

        # Games (1개)
        ("/games/2048.html", "2048 Puzzle")
    ]

    print("=" * 65)
    print(" [ToolLab.org] 프로덕션 라이브 배포 및 엔드포인트 전수 검증")
    print("=" * 65)

    ctx = ssl.create_default_context()
    success_count = 0
    fail_count = 0

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    for path, name in endpoints:
        url = f"{base_url}{path}"
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=8, context=ctx) as response:
                status = response.getcode()
                content_type = response.headers.get("Content-Type", "")
                content_length = response.headers.get("Content-Length", "chunked")
                
                if status == 200:
                    print(f" [OK 200] {name.ljust(26)} -> {path}")
                    success_count += 1
                else:
                    print(f" [WARN {status}] {name.ljust(26)} -> {path}")
        except urllib.error.HTTPError as e:
            print(f" [FAIL {e.code}] {name.ljust(26)} -> {path}")
            fail_count += 1
        except Exception as e:
            print(f" [ERROR]     {name.ljust(26)} -> {path} ({e})")
            fail_count += 1

    print("-" * 65)
    print(f" 점검 결과: 총 {len(endpoints)}개 중 성공 {success_count}개 / 실패 {fail_count}개")
    print("=" * 65)

if __name__ == "__main__":
    check_deployment()