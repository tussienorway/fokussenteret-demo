import os, sys
from playwright.sync_api import sync_playwright
B = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8001"
SK = "/workspace/fokussenteret-screenshots"
ok, feil = [], []
def sjekk(n, v): (ok if v else feil).append(n); print(("PASS " if v else "FAIL ") + n)
with sync_playwright() as p:
    br = p.chromium.launch(executable_path=os.environ.get("CHROME", "/usr/bin/google-chrome"))
    pg = br.new_page(viewport={"width": 1440, "height": 900}); k = []
    pg.on("console", lambda m: m.type == "error" and k.append(m.text)); pg.on("pageerror", lambda e: k.append(str(e)))
    pg.goto(B + "/index.html"); pg.wait_for_selector(".kort")
    n = pg.locator(".kort").count(); sjekk(f"katalog viser {n} oppføringer", n == 24)
    sjekk("banner uavhengig konsept", "Uavhengig konsept" in pg.inner_text(".demo-banner"))
    sjekk("noindex", pg.get_attribute("meta[name=robots]", "content").startswith("noindex"))
    sjekk("status åpent/stengt", "Senteret er" in pg.inner_text("#status-topp"))
    pg.screenshot(path=f"{SK}/1-forside.png")
    pg.click("#chips button[data-kat=Mat]"); pg.wait_for_timeout(150); sjekk("kategorifilter Mat (3)", pg.locator(".kort").count() == 3)
    pg.click("#chips button[data-kat='']"); pg.fill("#sok", "veterinær"); pg.wait_for_timeout(150); sjekk("søk veterinær", pg.locator(".kort").count() == 1)
    pg.fill("#sok", ""); pg.locator("#butikker").scroll_into_view_if_needed(); pg.wait_for_timeout(200); pg.screenshot(path=f"{SK}/2-katalog.png")
    pg.locator(".kort", has_text="Fokus Apotek").click(); pg.wait_for_selector("#modal[open]")
    sjekk("detaljmodal", "370 35 000" in pg.inner_text("#modal")); pg.screenshot(path=f"{SK}/3-detalj.png"); pg.click("#m-lukk")
    pg.fill("#chat-felt", "hunden min trenger vaksine"); pg.press("#chat-felt", "Enter"); pg.wait_for_timeout(300)
    t = pg.inner_text("#chat"); sjekk("veiviser finner dyreklinikk (ikke Sporty)", "Fokus Dyreklinikk" in t and "Sporty" not in t)
    pg.click("#forslag button:has-text('Hvor kan jeg spise?')"); pg.wait_for_timeout(300)
    sjekk("veiviser mat", "The Shack" in pg.inner_text("#chat"))
    pg.locator("#veiviser").scroll_into_view_if_needed(); pg.screenshot(path=f"{SK}/4-veiviser.png")
    m = br.new_page(viewport={"width": 390, "height": 844}); m.goto(B + "/index.html"); m.wait_for_selector(".kort"); m.screenshot(path=f"{SK}/5-mobil.png")
    sjekk("ingen horisontal scroll mobil", m.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    pg.goto(B + "/om-demoen.html"); sjekk("om-demoen", "Uavhengig konsept" in pg.content())
    sjekk(f"ingen konsollfeil {k}", not k); br.close()
print(f"{len(ok)} bestått, {len(feil)} feilet"); sys.exit(1 if feil else 0)
