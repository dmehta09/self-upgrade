#!/usr/bin/env python3
"""Inject Document ingest nav link after Embedding models in all genai-guide sidebars."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NEW_LINE_TEMPLATE = '        <a class="nav-link" href="{href}">Document ingest</a>\n'

EMBED_PATTERN = re.compile(
    r'^(\s*<a class="nav-link" href="([^"]*embedding-models\.html)">Embedding models</a>\s*\n)',
    re.MULTILINE,
)


def has_document_ingest_link(content: str) -> bool:
    return "document-ingest.html" in content and ">Document ingest</a>" in content


def inject_link(content: str) -> tuple[str, bool]:
    if has_document_ingest_link(content):
        return content, False

    def replacer(match: re.Match[str]) -> str:
        embed_href = match.group(2)
        ingest_href = embed_href.replace("embedding-models.html", "document-ingest.html")
        indent = re.match(r"^(\s*)", match.group(1)).group(1)
        new_line = f'{indent}<a class="nav-link" href="{ingest_href}">Document ingest</a>\n'
        return match.group(1) + new_line

    new_content, count = EMBED_PATTERN.subn(replacer, content, count=1)
    return new_content, count > 0


def main() -> int:
    updated: list[str] = []
    skipped: list[str] = []
    missing: list[str] = []

    for html_path in sorted(ROOT.rglob("*.html")):
        rel = html_path.relative_to(ROOT)
        content = html_path.read_text(encoding="utf-8")

        if "embedding-models.html" not in content or ">Embedding models</a>" not in content:
            continue

        if has_document_ingest_link(content):
            skipped.append(str(rel))
            continue

        new_content, changed = inject_link(content)
        if changed:
            html_path.write_text(new_content, encoding="utf-8")
            updated.append(str(rel))
        else:
            missing.append(str(rel))

    print(f"Updated {len(updated)} files")
    for path in updated:
        print(f"  + {path}")
    print(f"Skipped {len(skipped)} (already had link)")
    if missing:
        print(f"Failed {len(missing)} (pattern not matched)")
        for path in missing:
            print(f"  ! {path}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
