# Fokussenteret – demo (uavhengig konsept)

Uavhengig demo/konsept av Majere/tussie. **Ikke offisiell Fokussenteret-side.** `noindex` + `robots.txt Disallow`.

    cd /workspace/fokussenteret-demo && python3 -m http.server 8001   # http://localhost:8001

- `data/senteret.json`: fakta fra fokussenteret.no og undersider, med kilde-URL per oppføring og hentedato. `null` betyr ikke oppgitt.
- `js/veiviser.js`: regelbasert veiviser (behov → kategori/bedrift, «åpent nå»).
- `js/tider.js`: beregner åpent/stengt fra åpningstidene i dataene.
- `server/rad_server.py`: valgfri lokal backend (OpenAI-kompatibel, f.eks. Ollama). Konfig via `FS_LLM_URL`, `FS_LLM_MODEL`, `FS_LLM_KEY` og `FS_PORT=8788`. Ingen nøkler i repoet. Aktiver i nettleseren med `localStorage.setItem('fs-ai-url','http://localhost:8788/api/rad')`.
- `tests/royktest.py`: Playwright-røyktest.
- Ingen bilder eller logo er kopiert; illustrasjonene er laget i SVG.
