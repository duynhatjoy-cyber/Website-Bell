"""Merge the eight exported design pages into one shared runtime directory."""

from pathlib import Path
import hashlib
import re
import shutil


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "design"
PAGES = {
    "Main": "Trang chủ-html (1)",
    "PMS": "SP – Bellhop PMS-html",
    "BookingEngine": "SP – Booking Engine-html",
    "CMS": "SP – Bellhop CMS-html",
    "Website": "SP – Bellhop Website-html",
    "Message": "SP – Bellhop Message-html",
    "AIConcierge": "SP – AI Concierge-html",
    "Payment": "SP – Bellhop Payment-html",
    "Finance": "SP – Bellhop Finance-html",
    "Pricing": "Trang bảng giá-html",
    "News": "Trang tin tức-html",
    "About": "Trang giới thiệu-html",
}
FLAG_VI = '<svg viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#da251d"/><path d="m10 2 1.35 3.8 4-.05-3.2 2.35 1.25 3.8L10 9.6l-3.4 2.3 1.25-3.8-3.2-2.35 4 .05z" fill="#ffde00"/></svg>'
FLAG_US = '<svg viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#b22234"/><path d="M0 1.08h20v1.08H0zm0 2.16h20v1.08H0zm0 2.16h20v1.08H0zm0 2.16h20v1.08H0zm0 2.16h20v1.08H0zm0 2.16h20v1.08H0z" fill="#fff"/><rect width="8.5" height="7.56" fill="#3c3b6e"/><g fill="#fff"><circle cx="1.4" cy="1.2" r=".35"/><circle cx="3.3" cy="1.2" r=".35"/><circle cx="5.2" cy="1.2" r=".35"/><circle cx="7.1" cy="1.2" r=".35"/><circle cx="2.35" cy="2.6" r=".35"/><circle cx="4.25" cy="2.6" r=".35"/><circle cx="6.15" cy="2.6" r=".35"/><circle cx="1.4" cy="4" r=".35"/><circle cx="3.3" cy="4" r=".35"/><circle cx="5.2" cy="4" r=".35"/><circle cx="7.1" cy="4" r=".35"/><circle cx="2.35" cy="5.4" r=".35"/><circle cx="4.25" cy="5.4" r=".35"/><circle cx="6.15" cy="5.4" r=".35"/></g></svg>'
LANGUAGE_DROPDOWN = f'<details class="language-dropdown"><summary aria-label="Choose language"><span class="current-language-flag" data-current-flag><span data-flag="vi">{FLAG_VI}</span><span data-flag="en" hidden>{FLAG_US}</span></span><span data-current-language>VI</span><span class="language-chevron" aria-hidden="true">▾</span></summary><div class="language-options"><button type="button" data-language="vi">{FLAG_VI} Tiếng Việt</button><button type="button" data-language="en">{FLAG_US} English</button></div></details>'


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
        source_assets = list((source / "assets").iterdir())
        asset_names = {}
        for asset in source_assets:
            destination_name = asset.name
            if destination_name in copied and digest(asset) != digest(OUTPUT / "assets" / destination_name):
                destination_name = f"{page}-{asset.name}"
            asset_names[asset.name] = destination_name
        component_names = {
            file.stem.removesuffix(".dc"): f"{page}{file.stem.removesuffix('.dc')}"
            for file in source.glob("*.dc.html")
            if file.name != f"{page}.dc.html"
        }

        for file in source.glob("*.dc.html"):
            name = file.stem.removesuffix(".dc")
            dest_name = page if name == page else component_names[name]
            content = file.read_text(encoding="utf-8")
            for asset_name, destination_name in asset_names.items():
                if asset_name != destination_name:
                    content = content.replace(asset_name, destination_name)
            content = re.sub(
                r'(<dc-import\b[^>]*\bname=")[^"]+',
                lambda match: match.group(1) + component_names.get(
                    re.search(r'name="([^"]+)', match.group()).group(1),
                    re.search(r'name="([^"]+)', match.group()).group(1),
                ),
                content,
            )
            # Trial calls scroll to the booking form on the current page.
            content = content.replace('href="#dang-ky"', 'href="#form"')
            content = content.replace(
                'href="#">Đăng nhập</a>',
                'href="https://app.bellhop.biz/" target="_top" rel="noopener">Đăng nhập</a>',
            )
            if name.endswith("Header"):
                content = content.replace(
                    '<a class="hdr-login" href="https://app.bellhop.biz/" target="_top" rel="noopener">Đăng nhập</a>',
                    '<a class="hdr-login" href="https://app.bellhop.biz/" target="_top" rel="noopener">Đăng nhập</a>',
                    1,
                )
                content = content.replace(
                    '<button class="burger"',
                    LANGUAGE_DROPDOWN.replace('<details class="language-dropdown">', '<details class="language-dropdown hdr-language">') + '\n      <button class="burger"',
                    1,
                )
                content = content.replace(
                    '<a href="https://app.bellhop.biz/" target="_top" rel="noopener">Đăng nhập</a>',
                    '<a href="https://app.bellhop.biz/" target="_top" rel="noopener">Đăng nhập</a>'
                    + LANGUAGE_DROPDOWN.replace('<details class="language-dropdown">', '<details class="language-dropdown mobile-language">'),
                    1,
                )
            content = content.replace(
                'href="#" style="background: #0068ff; color: #fff">Chat Zalo</a>',
                'href="https://zalo.me/0366071468" target="_blank" rel="noopener noreferrer" style="background: #0068ff; color: #fff">Chat Zalo</a>',
            )
            if name == "Footer":
                content = content.replace(
                    '<a class="z" href="#"',
                    '<a class="z" href="https://zalo.me/0366071468" target="_blank" rel="noopener noreferrer"',
                ).replace(
                    '<a class="c" href="#"',
                    '<a class="c" href="tel:0366071468"',
                ).replace(
                    '<a href="#" style="background: #e8f0ff; color: #0050c8">Zalo</a>',
                    '<a class="contact-zalo" href="https://zalo.me/0366071468" target="_blank" rel="noopener noreferrer" style="background: #e8f0ff; color: #0050c8">Zalo</a>',
                ).replace(
                    '<a href="#" style="background: #eef8f9; color: #122745">Gọi</a>',
                    '<a class="contact-phone" href="tel:0366071468" style="background: #eef8f9; color: #122745">Gọi</a>',
                ).replace(
                    '<a href="#" aria-label="Zalo">',
                    '<a href="https://zalo.me/0366071468" target="_blank" rel="noopener noreferrer" aria-label="Zalo">',
                ).replace(
                    'Hotline/Zalo: <span class="ph">[ ]</span>',
                    'Hotline/Zalo: <a href="tel:0366071468">0366 071 468</a>',
                )
            if name == "Faq" or name.endswith("Faq"):
                content = content.replace(
                    '<a class="btn btn-sm btn-outline" href="#">Gọi <span class="ph">[hotline]</span></a>',
                    '<a class="btn btn-sm btn-outline" href="tel:0366071468">Gọi 0366 071 468</a>',
                )
            content = re.sub(
                r'<span class="logo-ph"[^>]*>\s*(MISA|Kovena|KOVENA)(?:\s*<i class="tbc">Logo</i>)?\s*</span>',
                brand_logo,
                content,
            )
            content = re.sub(
                r'<p\b[^>]*>\s*<i class="tbc">[\s\S]*?</i>\s*</p>',
                "",
                content,
            )
            content = re.sub(
                r'\s*<i class="tbc">[\s\S]*?</i>',
                "",
                content,
            )
            content = re.sub(
                r'(<div class="tbl-box"[^>]*>\s*<table\b[\s\S]*?</table>\s*</div>)',
                r'\1<div class="tbl-scroll-hint">'
                r'<button type="button" class="tbl-scroll-btn tbl-scroll-btn--prev" aria-label="Xem cột trước">'
                r'<span class="tbl-scroll-arrow" aria-hidden="true">←</span>'
                r'<span>Cột trước</span>'
                r'</button>'
                r'<button type="button" class="tbl-scroll-btn tbl-scroll-btn--next" aria-label="Xem cột tiếp">'
                r'<span>Cột tiếp</span>'
                r'<span class="tbl-scroll-arrow" aria-hidden="true">→</span>'
                r'</button>'
                r'</div>',
                content,
            )
            content = (
                content.replace(
                    '"reviewMarks":{"editor":"boolean","default":true',
                    '"reviewMarks":{"editor":"boolean","default":false',
                )
                .replace(
                    '"marks":{"editor":"boolean","default":true',
                    '"marks":{"editor":"boolean","default":false',
                )
                .replace(
                    "this.props.reviewMarks ?? true",
                    "this.props.reviewMarks ?? false",
                )
                .replace(
                    "this.props.marks ?? true",
                    "this.props.marks ?? false",
                )
            )
            if '<meta name="viewport"' not in content:
                content = content.replace(
                    '<meta charset="utf-8">',
                    '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">',
                    1,
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
                    '<link rel="icon" type="image/x-icon" href="/favicon.ico">'
                    '<link rel="shortcut icon" href="/favicon.ico">'
                    '<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">'
                    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">'
                    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">'
                    '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">'
                    '<link rel="stylesheet" href="./design-overrides.css">'
                    '<script src="./scroll-spy.js" defer></script>'
                    + ('<script src="./home-gallery.js" defer></script><script src="./customer-stories.js" defer></script>' if page == "Main" else '')
                    + '</head>',
                    1,
                )
            (OUTPUT / f"{dest_name}.dc.html").write_text(content, encoding="utf-8")

        for file in source_assets:
            destination_name = asset_names[file.name]
            destination = OUTPUT / "assets" / destination_name
            if destination_name in copied:
                if digest(file) != digest(destination):
                    raise ValueError(f"Asset name collision with different contents: {destination_name}")
            else:
                if file.suffix in {".css", ".svg"} and any(old != new for old, new in asset_names.items()):
                    content = file.read_text(encoding="utf-8")
                    for old_name, new_name in asset_names.items():
                        if old_name != new_name:
                            content = content.replace(old_name, new_name)
                    destination.write_text(content, encoding="utf-8")
                else:
                    shutil.copy2(file, destination)
                copied[destination_name] = file

    home = ROOT / PAGES["Main"]
    shutil.copy2(ROOT / "scripts" / "design-overrides.css", OUTPUT / "design-overrides.css")
    shutil.copy2(ROOT / "scripts" / "scroll-spy.js", OUTPUT / "scroll-spy.js")
    shutil.copy2(ROOT / "scripts" / "home-gallery.js", OUTPUT / "home-gallery.js")
    shutil.copy2(ROOT / "scripts" / "customer-stories.js", OUTPUT / "customer-stories.js")
    shutil.copy2(home / "customer-stories.json", OUTPUT / "customer-stories.json")
    (OUTPUT / "brand").mkdir(exist_ok=True)
    for file in [*(ROOT / "public" / "brand").glob("*.svg"), *(ROOT / "public" / "brand").glob("*.png")]:
        shutil.copy2(file, OUTPUT / "brand" / file.name)
    shutil.copy2(home / "support.js", OUTPUT / "support.js")
    for file in (home / "vendor").iterdir():
        shutil.copy2(file, OUTPUT / "vendor" / file.name)

    print(f"Merged {len(PAGES)} pages and {len(copied)} shared assets into {OUTPUT}")


if __name__ == "__main__":
    main()
