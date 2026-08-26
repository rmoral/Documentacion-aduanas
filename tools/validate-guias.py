#!/usr/bin/env python3
"""Validador del blog/guías de AduanaFácil Andorra.

Comprueba que cada guía de /guias/ está bien formada e integrada antes de
publicar. Lo usa la sesión automática del blog (BLOG-AUTOMATICO.md) y puede
ejecutarse a mano en cualquier momento:

    python3 tools/validate-guias.py

Sale con código 0 si todo está correcto y 1 si hay errores.
"""
import json
import re
import sys
import xml.dom.minidom
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
errors = []
warnings = []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def visible_words(html):
    body = html.split("<body>", 1)[-1]
    body = re.sub(r"<script.*?</script>", "", body, flags=re.S)
    return len(re.sub(r"<[^>]+>", " ", body).split())


guide_dirs = sorted(
    p for p in (ROOT / "guias").iterdir() if p.is_dir() and (p / "index.html").exists()
)
guide_pages = [ROOT / "guias" / "index.html"] + [d / "index.html" for d in guide_dirs]

sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
llms = (ROOT / "llms.txt").read_text(encoding="utf-8")

# La base de URLs debe ser única en todo el proyecto (marcador o dominio real)
bases = set(re.findall(r'rel="canonical" href="(https://[^/"]+)', sitemap + "".join(
    p.read_text(encoding="utf-8") for p in guide_pages)))
bases |= set(re.findall(r"<loc>(https://[^/<]+)", sitemap))
if len(bases) > 1:
    err(f"Mezcla de bases de URL en canonical/sitemap: {sorted(bases)}")

for page in guide_pages:
    rel = page.relative_to(ROOT)
    html = page.read_text(encoding="utf-8")
    is_hub = page.parent.name == "guias"

    if 'rel="canonical"' not in html:
        err(f"{rel}: falta <link rel=canonical>")
    if html.count("<h1") != 1:
        err(f"{rel}: debe tener exactamente un <h1> (tiene {html.count('<h1')})")
    if "Actualizado" not in html and "Actualitzat" not in html:
        warn(f"{rel}: no se encuentra la fecha visible 'Actualizado'")
    if "analytics.js" not in html:
        warn(f"{rel}: falta el script de analítica (assets/js/analytics.js)")

    # JSON-LD válido y coherente con la FAQ visible
    blocks = re.findall(
        r'<script type="application/ld\+json">\s*(.*?)\s*</script>', html, re.S
    )
    if not blocks:
        err(f"{rel}: no tiene JSON-LD")
    for b in blocks:
        try:
            data = json.loads(b)
        except json.JSONDecodeError as e:
            err(f"{rel}: JSON-LD inválido ({e})")
            continue
        nodes = data.get("@graph", [data])
        for node in nodes:
            if node.get("@type") == "FAQPage":
                n_schema = len(node.get("mainEntity", []))
                n_visible = len(re.findall(r"<summary>", html))
                if n_schema != n_visible:
                    err(
                        f"{rel}: FAQPage tiene {n_schema} preguntas pero hay "
                        f"{n_visible} <summary> visibles"
                    )

    if not is_hub:
        words = visible_words(html)
        if words < 900:
            err(f"{rel}: solo {words} palabras visibles (mínimo razonable 900)")
        elif words > 2500:
            warn(f"{rel}: {words} palabras visibles (revisar longitud)")
        slug = page.parent.name
        if f"/guias/{slug}/" not in sitemap:
            err(f"{rel}: la URL /guias/{slug}/ no está en sitemap.xml")
        if f"/guias/{slug}/" not in llms:
            err(f"{rel}: la URL /guias/{slug}/ no está en llms.txt")
        hub = (ROOT / "guias" / "index.html").read_text(encoding="utf-8")
        if f'href="/guias/{slug}/"' not in hub and f'href="{slug}/"' not in hub:
            err(f"guias/index.html: falta la tarjeta de la guía '{slug}'")

    # Enlaces internos resueltos
    for href in re.findall(r'href="([^"#]+?)(?:#[^"]*)?"', html):
        if href.startswith(("http", "data:", "mailto:", "tel:")):
            continue
        if href.startswith("/"):
            target = (ROOT / href.lstrip("/")).resolve()
        else:
            target = (page.parent / href).resolve()
        if target.is_dir():
            target = target / "index.html"
        if not target.exists():
            err(f"{rel}: enlace roto -> {href}")

# Sitemap bien formado
try:
    xml.dom.minidom.parseString(sitemap)
except Exception as e:
    err(f"sitemap.xml: XML inválido ({e})")

for w in warnings:
    print("AVISO:", w)
if errors:
    for e in errors:
        print("ERROR:", e)
    print(f"\nValidación FALLIDA: {len(errors)} error(es).")
    sys.exit(1)

print(f"Validación OK: {len(guide_dirs)} guías + hub, sitemap y llms.txt coherentes.")
