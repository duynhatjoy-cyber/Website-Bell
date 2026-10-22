"""Merge the eight exported design pages into one shared runtime directory."""

from pathlib import Path
import hashlib
import re
import shutil


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "design"
PAGES = {
    "Main": "Trang chủ-html (1)",
    "BookingEngine": "SP – Booking Engine-html",
    "CMS": "SP – Bellhop CMS-html",
    "Website": "SP – Bellhop Website-html",
    "Message": "SP – Bellhop Message-html",
    "AIConcierge": "SP – AI Concierge-html",
    "Payment": "SP – Bellhop Payment-html",
    "Finance": "SP – Bellhop Finance-html",
}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def brand_logo(match):
    brand = match.group(1).lower()
    size = " brand-logo--large" if "height: 72px" in match.group(0) else ""
    return (
        f'<span class="brand-logo brand-logo--{brand}{size}">'
        f'<img src="./brand/{brand}.svg" alt="{brand.upper()}">'
        f'<b>{brand.upper()}</b></span>'
    )


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    (OUTPUT / "assets").mkdir(exist_ok=True)
    (OUTPUT / "vendor").mkdir(exist_ok=True)
    copied = {}

    for page, folder in PAGES.items():
        source = ROOT / folder
        component_names = {
            file.stem.removesuffix(".dc"): f"{page}{file.stem.removesuffix('.dc')}"
            for file in source.glob("*.dc.html")
            if file.name != f"{page}.dc.html"
        }

        for file in source.glob("*.dc.html"):
            name = file.stem.removesuffix(".dc")
            dest_name = page if name == page else component_names[name]
            content = file.read_text(encoding="utf-8")
            content = re.sub(
                r'(<dc-import\b[^>]*\bname=")[^"]+',
                lambda match: match.group(1) + component_names.get(
                    re.search(r'name="([^"]+)', match.group()).group(1),
                    re.search(r'name="([^"]+)', match.group()).group(1),
                ),
                content,
            )
            # These two destinations have no supplied design page.
            content = content.replace("PMS.dc.html", "Main.dc.html#san-pham")
            content = content.replace("About.dc.html", "Main.dc.html#form")
            # Trial calls scroll to the booking form on the current page.
            content = content.replace('href="#dang-ky"', 'href="#form"')
            content = content.replace(
                'href="#">Đăng nhập</a>',
                'href="https://app.bellhop.biz/" target="_top" rel="noopener">Đăng nhập</a>',
            )
            content = re.sub(
                r'<span class="logo-ph"[^>]*>\s*(MISA|Kovena|KOVENA)(?:\s*<i class="tbc">Logo</i>)?\s*</span>',
                brand_logo,
                content,
            )
            if file.name == f"{page}.dc.html":
                content = re.sub(
                    r'(<dc-import name="[^"]*Header"[^>]*></dc-import>)',
                    r'<div class="site-header-sticky">\1</div>',
                    content,
                    count=1,
                )
                content = content.replace(
                    "</head>",
                    '<link rel="stylesheet" href="./design-overrides.css">'
                    '<script src="./scroll-spy.js" defer></script></head>',
                    1,
                )
            (OUTPUT / f"{dest_name}.dc.html").write_text(content, encoding="utf-8")

        for file in (source / "assets").iterdir():
            destination = OUTPUT / "assets" / file.name
            if file.name in copied:
                if digest(file) != digest(destination):
                    raise ValueError(f"Asset name collision with different contents: {file.name}")
            else:
                shutil.copy2(file, destination)
                copied[file.name] = file

    home = ROOT / PAGES["Main"]
    shutil.copy2(ROOT / "scripts" / "design-overrides.css", OUTPUT / "design-overrides.css")
    shutil.copy2(ROOT / "scripts" / "scroll-spy.js", OUTPUT / "scroll-spy.js")
    (OUTPUT / "brand").mkdir(exist_ok=True)
    for file in (ROOT / "public" / "brand").glob("*.svg"):
        shutil.copy2(file, OUTPUT / "brand" / file.name)
    shutil.copy2(home / "support.js", OUTPUT / "support.js")
    for file in (home / "vendor").iterdir():
        shutil.copy2(file, OUTPUT / "vendor" / file.name)

    print(f"Merged {len(PAGES)} pages and {len(copied)} shared assets into {OUTPUT}")


if __name__ == "__main__":
    main()
