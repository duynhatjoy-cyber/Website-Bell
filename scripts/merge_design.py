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
            (OUTPUT / f"{dest_name}.dc.html").write_text(content, encoding="utf-8")

        for file in (source / "assets").iterdir():
            destination = OUTPUT / "assets" / file.name
            if destination.exists():
                if digest(file) != digest(destination):
                    raise ValueError(f"Asset name collision with different contents: {file.name}")
            else:
                shutil.copy2(file, destination)
                copied[file.name] = file

    home = ROOT / PAGES["Main"]
    shutil.copy2(home / "support.js", OUTPUT / "support.js")
    for file in (home / "vendor").iterdir():
        shutil.copy2(file, OUTPUT / "vendor" / file.name)

    print(f"Merged {len(PAGES)} pages and {len(copied)} shared assets into {OUTPUT}")


if __name__ == "__main__":
    main()
