#!/usr/bin/env python3
"""生成包含展示页、原型、媒体和制作脚本的独立作品包。"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / 'showcase/relic-route.zip'
EXCLUDE = {'.git', 'output', '__pycache__'}
with ZipFile(DEST, 'w', ZIP_DEFLATED, compresslevel=6) as archive:
    for path in sorted(ROOT.rglob('*')):
        if not path.is_file() or path == DEST or any(p in EXCLUDE for p in path.relative_to(ROOT).parts):
            continue
        if path.name in {'.DS_Store', '.gitignore'}:
            continue
        archive.write(path, Path('relic-route') / path.relative_to(ROOT))
print(f'已生成独立作品包：{DEST} ({DEST.stat().st_size / 1024 / 1024:.1f} MB)')
