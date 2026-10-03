import os

def integrate_cf_analytics():
    base_dir = r"D:\Gemini_Files\ToolLab.org"
    analytics_path = os.path.join(base_dir, "js", "analytics.js")

    if not os.path.exists(analytics_path):
        print(f"[오류] 파일 없음: {analytics_path}")
        return

    with open(analytics_path, "r", encoding="utf-8") as f:
        content = f.read()

    cf_token = "0ce5c65756114975810c265cb2b9c02a"

    # Cloudflare Web Analytics 동적 주입 스니펫
    cf_injection_code = f"""
  // 5. Cloudflare Web Analytics Beacon Injection ($0 Serverless)
  const cfScript = document.createElement('script');
  cfScript.type = 'module';
  cfScript.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  cfScript.setAttribute('data-cf-beacon', '{{"token": "{cf_token}"}}');
  document.head.appendChild(cfScript);
"""

    if cf_token in content:
        print("[확인] 이미 Cloudflare 토큰이 analytics.js에 포함되어 있습니다.")
        return

    # })(); 바로 앞에 깔끔하게 삽입
    if "})();" in content:
        idx = content.rfind("})();")
        new_content = content[:idx] + cf_injection_code + "\n})();"
    else:
        new_content = content + "\n" + cf_injection_code

    with open(analytics_path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print("[완료] analytics.js에 Cloudflare Web Analytics 토큰 연동 완료!")

if __name__ == "__main__":
    integrate_cf_analytics()