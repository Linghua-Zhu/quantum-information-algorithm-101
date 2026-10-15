#!/usr/bin/env python3
"""Builds docs/index.html from the files in src/."""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT / "docs" / "index.html"
TITLE = "Quantum Information and Programming 101"
DESCRIPTION = ("A course tool for a first course in quantum information and quantum programming. "
               "From vectors to qubits to algorithms. Predict first, then observe.")
SCRIPTS = ["core.js", "items.js", "paulis.js", "sphere.js", "plane.js", "unit0.js", "content.js", "content0.js", "codegen.js", "app.js"]
ICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E"
        "%3Ccircle cx='16' cy='16' r='14' fill='none' stroke='%233c5488' stroke-width='2.5'/%3E"
        "%3Cellipse cx='16' cy='16' rx='14' ry='5' fill='none' stroke='%238491b4' stroke-width='1.5'/%3E"
        "%3Cline x1='16' y1='16' x2='24' y2='7' stroke='%233c5488' stroke-width='2.5' stroke-linecap='round'/%3E"
        "%3Ccircle cx='24' cy='7' r='2.6' fill='%233c5488'/%3E%3C/svg%3E")


def read(name):
    return (SRC / name).read_text(encoding="utf8")


def parts():
    css = read("style.css").strip()
    shell = read("shell.html").strip()
    js = "\n".join(read(n).strip() for n in SCRIPTS)
    if "</script" in js.lower():
        sys.exit("a script contains a closing script tag")
    ids = re.findall(r'\bid="([^"]+)"', shell)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        sys.exit("duplicate ids: " + ", ".join(dup))
    return css, shell, f"<script>\n'use strict';\n{js}\n</script>\n"


def page():
    css, shell, script = parts()
    return (
        '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        f"<title>{TITLE}</title>\n"
        f'<meta name="description" content="{DESCRIPTION}">\n'
        f'<link rel="icon" href="{ICON}">\n'
        "<style>\n:root{padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}\n"
        f"{css}\n</style>\n</head>\n<body>\n{shell}\n{script}</body>\n</html>\n"
    )


if __name__ == "__main__":
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(page(), encoding="utf8")
    print(f"wrote {OUT.relative_to(ROOT)}, {OUT.stat().st_size:,} bytes")
