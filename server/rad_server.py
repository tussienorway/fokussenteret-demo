"""Valgfri lokal backend for veiviseren (kun stdlib).
Videresender spørsmål til et OpenAI-kompatibelt endepunkt, f.eks. lokal Ollama.
Konfig via miljøvariabler – ingen nøkler i repoet:
  FS_LLM_URL   (standard http://localhost:11434/v1/chat/completions)
  FS_LLM_MODEL (standard qwen2.5-coder:14b)
  FS_LLM_KEY   (valgfri, settes bare i miljøet)
  FS_PORT      (standard 8788)
Kjør: python3 server/rad_server.py   og i nettleserkonsollen:
  localStorage.setItem('fs-ai-url','http://localhost:8788/api/rad')
"""
import json, os, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

URL = os.environ.get("FS_LLM_URL", "http://localhost:11434/v1/chat/completions")
MODELL = os.environ.get("FS_LLM_MODEL", "qwen2.5-coder:14b")
NOKKEL = os.environ.get("FS_LLM_KEY", "")
BILER = json.loads((Path(__file__).parent.parent / "data/senteret.json").read_text("utf-8"))["butikker"]
KORT = "\n".join(f"{b['navn']} ({b['kategori']}): {b['beskrivelse']} Tlf {b.get('telefon') or 'ikke oppgitt'}" for b in BILER)
SYSTEM = ("Du er en norsk veiviser for Fokussenteret i Grimstad i en uavhengig demo (ikke offisiell side). Svar kort på norsk. "
          "Nevn bare bedrifter fra listen og ikke dikt opp fakta. Senteret: Storgaten 90, gratis parkering, man-fre 09-17, lør 10-14.\nBedrifter:\n" + KORT)

class H(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", os.environ.get("FS_ORIGIN", "http://localhost:8000"))
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()
    def do_POST(self):
        if self.path != "/api/rad":
            self.send_error(404); return
        n = min(int(self.headers.get("Content-Length", 0)), 4000)
        sp = str(json.loads(self.rfile.read(n) or b"{}").get("sporsmal", ""))[:1000]
        body = json.dumps({"model": MODELL, "temperature": 0.3, "messages": [{"role": "system", "content": SYSTEM}, {"role": "user", "content": sp}]}).encode()
        h = {"Content-Type": "application/json"}
        if NOKKEL: h["Authorization"] = "Bearer " + NOKKEL
        try:
            with urllib.request.urlopen(urllib.request.Request(URL, body, h), timeout=60) as r:
                svar = json.load(r)["choices"][0]["message"]["content"]
            kode, ut = 200, {"svar": svar}
        except Exception as e:
            kode, ut = 502, {"feil": str(e)}
        self.send_response(kode); self._cors(); self.send_header("Content-Type", "application/json"); self.end_headers()
        self.wfile.write(json.dumps(ut, ensure_ascii=False).encode())

if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", int(os.environ.get("FS_PORT", 8788))), H).serve_forever()
