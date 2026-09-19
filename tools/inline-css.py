#!/usr/bin/env python3
"""Incrusta assets/css/styles.css en todas las páginas públicas del site.

El CSS inline elimina la petición que bloquea el renderizado (auditoría de
PageSpeed). `assets/css/styles.css` sigue siendo la FUENTE DE LA VERDAD:
tras editarlo, ejecuta este script para propagar el cambio a todas las
páginas y haz commit. Es idempotente: sustituye tanto el <link> externo
como cualquier bloque inline anterior.

    python3 tools/inline-css.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSS = (ROOT / "assets" / "css" / "styles.css").read_text(encoding="utf-8").strip()
BLOCK = f'<style data-inline="styles.css">\n{CSS}\n</style>'
SKIP = {"landingaduanamuebles.html", "admin.html"}

changed = 0
for f in sorted(ROOT.rglob("*.html")):
    if f.name in SKIP or "node_modules" in f.parts:
        continue
    h = f.read_text(encoding="utf-8")
    new = re.sub(
        r'<style data-inline="styles\.css">.*?</style>',
        lambda m: BLOCK, h, flags=re.S,
    )
    new = re.sub(
        r'<link rel="stylesheet" href="[^"]*assets/css/styles\.css">',
        lambda m: BLOCK, new,
    )
    if new != h:
        f.write_text(new, encoding="utf-8")
        changed += 1
        print("ok:", f.relative_to(ROOT))
print(f"{changed} páginas actualizadas")
