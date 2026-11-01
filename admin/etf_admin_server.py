import os
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
        print("\n서버가 안전하게 종료되었습니다.")