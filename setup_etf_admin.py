import os
import json

base_dir = r"D:\Gemini_Files\ToolLab.org"
config_dir = os.path.join(base_dir, "config")
admin_dir = os.path.join(base_dir, "admin")

os.makedirs(config_dir, exist_ok=True)
os.makedirs(admin_dir, exist_ok=True)

# 1. config/etf_rates.json 생성 (2026년 기준 표준 세법)
rates_json_path = os.path.join(config_dir, "etf_rates.json")
initial_rates = {
    "baseYear": 2026,
    "lastUpdated": "2026-11-01",
    "dividendTax": {
        "generalRate": 0.154,
        "incomeThreshold": 20000000
    },
    "isa": {
        "annualLimit": 20000000,
        "totalLimit": 100000000,
        "taxFreeGeneral": 2000000,
        "taxFreeRural": 4000000,
        "overTaxRate": 0.099
    },
    "pension": {
        "annualLimit": 9000000,
        "pensionSavingsSubLimit": 6000000,
        "deductionRateLowIncome": 0.165,
        "deductionRateHighIncome": 0.132,
        "incomeStandard": 55000000,
        "pensionIncomeTax": {
            "under70": 0.055,
            "under80": 0.044,
            "over80": 0.033
        }
    },
    "overseasEtf": {
        "capitalGainsDeduction": 2500000,
        "capitalGainsTaxRate": 0.22
    }
}

with open(rates_json_path, "w", encoding="utf-8") as f:
    json.dump(initial_rates, f, ensure_ascii=False, indent=2)

print("✔ config/etf_rates.json 생성 완료")

# 2. admin/etf_admin.html 생성
admin_html_path = os.path.join(admin_dir, "etf_admin.html")
admin_html_content = """<!DOCTYPE html>
<html lang="ko" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ETF & 절세계좌 요율 관리기 - ToolLab</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { darkMode: 'class' }
  </script>
</head>
<body class="bg-slate-950 text-slate-200 min-h-screen p-6 md:p-10 font-sans antialiased">
  <div class="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
    
    <!-- 상단 헤더 -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">📊</span>
          <h1 class="text-lg md:text-xl font-bold text-slate-100">ETF &amp; 절세계좌 핵심 세제 요율 관리기</h1>
        </div>
        <p class="text-xs text-slate-500 mt-1">ToolLab ETF 피커 및 복리 시뮬레이터에 적용되는 법정 기준값 관리</p>
      </div>
      <button id="save-btn" class="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer">
        <span>💾</span> 최종 저장 (etf_rates.json)
      </button>
    </div>

    <!-- 상태 알림 바 -->
    <div id="status-bar" class="hidden p-3.5 rounded-xl text-xs font-mono"></div>

    <div class="space-y-5">
      
      <!-- 1. 기본 메타 & 일반 배당소득세 -->
      <div class="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
        <h2 class="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span> 기준 연도 &amp; 배당소득세
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-slate-400 block mb-1">기준 연도 (baseYear)</label>
            <input type="number" id="baseYear" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-slate-100 outline-none focus:border-emerald-500 font-mono" />
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">일반 배당소득세율 (지방소득세 포함, 기본 0.154)</label>
            <input type="number" step="0.001" id="dividendGeneralRate" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-emerald-400 outline-none focus:border-emerald-500 font-mono" />
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs text-slate-400 block mb-1">금융소득종합과세 기준금액 (원/년, 기본 20,000,000원)</label>
            <input type="number" step="1000000" id="incomeThreshold" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-slate-100 outline-none focus:border-emerald-500 font-mono" />
          </div>
        </div>
      </div>

      <!-- 2. ISA (개인종합자산관리계좌) -->
      <div class="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
        <h2 class="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-sky-500"></span> ISA (개인종합자산관리계좌) 세제 혜택
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-slate-400 block mb-1">연간 납입한도 (원/년, 기본 2천만 원)</label>
            <input type="number" step="1000000" id="isaAnnualLimit" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-slate-100 outline-none focus:border-emerald-500 font-mono" />
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">총 납입한도 (원, 기본 1억 원)</label>
            <input type="number" step="1000000" id="isaTotalLimit" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-slate-100 outline-none focus:border-emerald-500 font-mono" />
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">일반형 비과세 한도 (원, 기본 200만 원)</label>
            <input type="number" step="100000" id="isaTaxFreeGeneral" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-sky-400 outline-none focus:border-emerald-500 font-mono" />
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">서민형 비과세 한도 (원, 기본 400만 원)</label>
            <input type="number" step="100000" id="isaTaxFreeRural" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-sky-400 outline-none focus:border-emerald-500 font-mono" />
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs text-slate-400 block mb-1">비과세 초과분 분리과세율 (지방세 포함, 기본 0.099)</label>
            <input type="number" step="0.001" id="isaOverTaxRate" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-slate-100 outline-none focus:border-emerald-500 font-mono" />
          </div>
        </div>
      </div>

      <!-- 3. 연금저축 & IRP -->
      <div class="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
        <h2 class="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-500"></span> 연금저축 &amp; IRP 세액공제
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-slate-400 block mb-1">연간 세액공제 합산한도 (연금+IRP, 기본 900만 원)</label>
            <input type="number" step="500000" id="pensionAnnualLimit" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-slate-100 outline-none focus:border-emerald-500 font-mono" />
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">연금저축 단독 한도 (기본 600만 원)</label>
            <input type="number" step="500000" id="pensionSavingsSubLimit" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-slate-100 outline-none focus:border-emerald-500 font-mono" />
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">총급여 5,500만 이하 세액공제율 (기본 0.165 = 16.5%)</label>
            <input type="number" step="0.001" id="deductionRateLowIncome" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-amber-400 outline-none focus:border-emerald-500 font-mono" />
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">총급여 5,500만 초과 세액공제율 (기본 0.132 = 13.2%)</label>
            <input type="number" step="0.001" id="deductionRateHighIncome" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-slate-100 outline-none focus:border-emerald-500 font-mono" />
          </div>
        </div>
      </div>

      <!-- 4. 해외 직투 ETF 양도소득세 -->
      <div class="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
        <h2 class="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-purple-500"></span> 해외 직투 ETF 양도소득세
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-slate-400 block mb-1">기본 양도소득 공제액 (원/년, 기본 2,500,000원)</label>
            <input type="number" step="100000" id="capitalGainsDeduction" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-slate-100 outline-none focus:border-emerald-500 font-mono" />
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">양도소득세율 (지방세 포함, 기본 0.22 = 22%)</label>
            <input type="number" step="0.001" id="capitalGainsTaxRate" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-purple-400 outline-none focus:border-emerald-500 font-mono" />
          </div>
        </div>
      </div>

    </div>
  </div>

  <script>
    let fullConfig = {};

    async function initForm() {
      try {
        const res = await fetch('/api/rates');
        fullConfig = await res.json();

        // 1. 기본 & 배당세
        document.getElementById('baseYear').value = fullConfig.baseYear || 2026;
        document.getElementById('dividendGeneralRate').value = fullConfig.dividendTax?.generalRate || 0.154;
        document.getElementById('incomeThreshold').value = fullConfig.dividendTax?.incomeThreshold || 20000000;

        // 2. ISA
        document.getElementById('isaAnnualLimit').value = fullConfig.isa?.annualLimit || 20000000;
        document.getElementById('isaTotalLimit').value = fullConfig.isa?.totalLimit || 100000000;
        document.getElementById('isaTaxFreeGeneral').value = fullConfig.isa?.taxFreeGeneral || 2000000;
        document.getElementById('isaTaxFreeRural').value = fullConfig.isa?.taxFreeRural || 4000000;
        document.getElementById('isaOverTaxRate').value = fullConfig.isa?.overTaxRate || 0.099;

        // 3. 연금
        document.getElementById('pensionAnnualLimit').value = fullConfig.pension?.annualLimit || 9000000;
        document.getElementById('pensionSavingsSubLimit').value = fullConfig.pension?.pensionSavingsSubLimit || 6000000;
        document.getElementById('deductionRateLowIncome').value = fullConfig.pension?.deductionRateLowIncome || 0.165;
        document.getElementById('deductionRateHighIncome').value = fullConfig.pension?.deductionRateHighIncome || 0.132;

        // 4. 해외 ETF
        document.getElementById('capitalGainsDeduction').value = fullConfig.overseasEtf?.capitalGainsDeduction || 2500000;
        document.getElementById('capitalGainsTaxRate').value = fullConfig.overseasEtf?.capitalGainsTaxRate || 0.22;

      } catch (err) {
        showStatus('데이터를 불러오지 못했습니다.', 'error');
      }
    }

    document.getElementById('save-btn').addEventListener('click', async () => {
      fullConfig.baseYear = Number(document.getElementById('baseYear').value);
      fullConfig.lastUpdated = new Date().toISOString().slice(0, 10);

      if (!fullConfig.dividendTax) fullConfig.dividendTax = {};
      fullConfig.dividendTax.generalRate = Number(document.getElementById('dividendGeneralRate').value);
      fullConfig.dividendTax.incomeThreshold = Number(document.getElementById('incomeThreshold').value);

      if (!fullConfig.isa) fullConfig.isa = {};
      fullConfig.isa.annualLimit = Number(document.getElementById('isaAnnualLimit').value);
      fullConfig.isa.totalLimit = Number(document.getElementById('isaTotalLimit').value);
      fullConfig.isa.taxFreeGeneral = Number(document.getElementById('isaTaxFreeGeneral').value);
      fullConfig.isa.taxFreeRural = Number(document.getElementById('isaTaxFreeRural').value);
      fullConfig.isa.overTaxRate = Number(document.getElementById('isaOverTaxRate').value);

      if (!fullConfig.pension) fullConfig.pension = {};
      fullConfig.pension.annualLimit = Number(document.getElementById('pensionAnnualLimit').value);
      fullConfig.pension.pensionSavingsSubLimit = Number(document.getElementById('pensionSavingsSubLimit').value);
      fullConfig.pension.deductionRateLowIncome = Number(document.getElementById('deductionRateLowIncome').value);
      fullConfig.pension.deductionRateHighIncome = Number(document.getElementById('deductionRateHighIncome').value);

      if (!fullConfig.overseasEtf) fullConfig.overseasEtf = {};
      fullConfig.overseasEtf.capitalGainsDeduction = Number(document.getElementById('capitalGainsDeduction').value);
      fullConfig.overseasEtf.capitalGainsTaxRate = Number(document.getElementById('capitalGainsTaxRate').value);

      try {
        const res = await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullConfig)
        });
        const result = await res.json();
        if (result.status === 'success') {
          showStatus('✅ 변경 사항이 etf_rates.json에 즉시 반영되었습니다.', 'success');
        } else {
          showStatus('❌ 저장 실패: ' + result.message, 'error');
        }
      } catch (err) {
        showStatus('❌ 서버 통신 오류', 'error');
      }
    });

    function showStatus(msg, type) {
      const bar = document.getElementById('status-bar');
      bar.innerText = msg;
      bar.className = 'p-3.5 rounded-xl text-xs font-semibold block ';
      if (type === 'success') {
        bar.className += 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60';
      } else {
        bar.className += 'bg-rose-950/60 text-rose-400 border border-rose-800/60';
      }
    }

    window.onload = initForm;
  </script>
</body>
</html>
"""

with open(admin_html_path, "w", encoding="utf-8") as f:
    f.write(admin_html_content.strip())

print("✔ admin/etf_admin.html 생성 완료")

# 3. admin/etf_admin_server.py 생성 (포트 4050)
admin_server_path = os.path.join(admin_dir, "etf_admin_server.py")
admin_server_content = """import os
import json
import webbrowser
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 4050

ADMIN_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(ADMIN_DIR)
CONFIG_PATH = os.path.join(PROJECT_ROOT, "config", "etf_rates.json")

class EtfAdminHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # admin 디렉터리 기준 파일 서빙
        clean_path = path.split("?")[0].split("#")[0]
        if clean_path in ["/", "/admin.html", "/etf_admin.html"]:
            return os.path.join(ADMIN_DIR, "etf_admin.html")
        return os.path.join(ADMIN_DIR, clean_path.lstrip("/"))

    def do_GET(self):
        if self.path == "/api/rates":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                self.wfile.write(f.read().encode("utf-8"))
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == "/api/save":
            content_length = int(self.headers["Content-Length"])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode("utf-8"))
                with open(CONFIG_PATH, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success"}).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode("utf-8"))

def open_browser():
    webbrowser.open_new(f"http://localhost:{PORT}/etf_admin.html")

if __name__ == "__main__":
    threading.Timer(0.8, open_browser).start()
    print("==================================================")
    print(f" ToolLab ETF Rates Admin Server: http://localhost:{PORT}")
    print(f" Config file: {CONFIG_PATH}")
    print(" 종료하려면 터미널에서 Ctrl + C 를 누르세요.")
    print("==================================================")
    
    server = HTTPServer(("localhost", PORT), EtfAdminHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\\n서버가 안전하게 종료되었습니다.")
"""

with open(admin_server_path, "w", encoding="utf-8") as f:
    f.write(admin_server_content.strip())

print("✔ admin/etf_admin_server.py 생성 완료")

# 4. run_etf_admin.bat 생성 (원클릭 실행용)
bat_path = os.path.join(base_dir, "run_etf_admin.bat")
bat_content = """@echo off
cd /d "%~dp0admin"
python etf_admin_server.py
pause
"""

with open(bat_path, "w", encoding="utf-8") as f:
    f.write(bat_content.strip())

print("✔ run_etf_admin.bat 생성 완료")
print("\\n✅ ToolLab ETF 세법 관리 시스템 구축 완료!")