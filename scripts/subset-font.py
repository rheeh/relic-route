#!/usr/bin/env python3
"""按项目 HTML/CSS/JS 文本生成可变 WOFF2 字体子集。

运行：python3 scripts/subset-font.py /path/to/NotoSansSC-wght.ttf
依赖：fonttools、brotli。源字库来自 Google Fonts 官方仓库：
https://github.com/google/fonts/tree/main/ofl/notosanssc
源文件：NotoSansSC[wght].ttf。许可证位于 demo/assets/fonts/NotoSansSC-OFL.txt。
无论从哪个工作目录运行，输出均在本实验内；不修改或删除源字库。
"""

import argparse
import html
from pathlib import Path
import re
import sys

try:
    from fontTools import subset
    from fontTools.ttLib import TTFont
except ImportError:
    sys.exit("需要 fonttools 和 brotli；请在临时或项目 Python 环境安装后运行。")

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "demo/assets/fonts/RelicSansSC.woff2"
PUNCTUATION = "，。；：？！、（）【】《》〈〉「」『』〔〕［］｛｝“”‘’…—–·・　"
FAMILY = "Relic Sans SC"
POSTSCRIPT = "RelicSansSC"


def source_characters():
    files = sorted(p for p in ROOT.rglob("*") if p.suffix.lower() in {".html", ".css", ".js"})
    chars = set(chr(n) for n in range(32, 127)) | set(PUNCTUATION)
    for path in files:
        text = html.unescape(path.read_text(encoding="utf-8"))
        chars.update(text)
        # 同时纳入 JS 的显式 Unicode 字符，避免只保留转义符本身。
        for match in re.finditer(r"\\u(?:\{([0-9a-fA-F]{1,6})\}|([0-9a-fA-F]{4}))", text):
            codepoint = int(match.group(1) or match.group(2), 16)
            if codepoint <= 0x10FFFF:
                chars.add(chr(codepoint))
    return files, {ord(char) for char in chars if ord(char) >= 32 and not char.isspace()} | {32, 0x3000}


def rename(font):
    # 子集属于修改版本；保留版权/OFL，使用独立家族名。
    for record in font["name"].names:
        if record.nameID in {0, 13, 14}:
            continue
        value = record.toUnicode()
        if record.nameID in {1, 4, 16}:
            value = FAMILY
        elif record.nameID in {6, 25}:
            value = POSTSCRIPT
        elif record.nameID == 3:
            value = "2.004;ADBO;RelicSansSC;SUBSET"
        else:
            value = value.replace("NotoSansSC", POSTSCRIPT).replace("Noto Sans SC", FAMILY)
        record.string = value.encode(record.getEncoding())


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("font", type=Path, help="原始 Noto Sans SC 可变 TTF 路径")
    args = parser.parse_args()
    original = args.font.expanduser().resolve()
    if not original.is_file():
        parser.error(f"源字体不存在：{original}")
    files, required = source_characters()
    font = TTFont(original)
    cmap = font.getBestCmap()
    supported = required & set(cmap)
    unavailable = required - set(cmap)
    weights = next((a for a in font["fvar"].axes if a.axisTag == "wght"), None)
    if weights is None or weights.minValue != 100 or weights.maxValue != 900:
        sys.exit("源字体需保留 wght 100–900 可变轴；当前源文件不符。")
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_languages = ["*"]
    options.notdef_outline = True
    worker = subset.Subsetter(options=options)
    worker.populate(unicodes=supported)
    worker.subset(font)
    rename(font)
    font.flavor = "woff2"
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    font.save(OUTPUT)
    result = TTFont(OUTPUT)
    missing = supported - set(result.getBestCmap())
    if missing:
        sys.exit(f"子集遗漏源字体可支持的字符：{sorted(missing)}")
    axes = [(a.axisTag, a.minValue, a.maxValue) for a in result["fvar"].axes]
    assert ("wght", 100.0, 900.0) in axes, "子集可变字重轴未保留"
    print(f"已生成：{OUTPUT}")
    print(f"扫描 {len(files)} 个源码文件；保留 {len(supported)} 个字符；wght 100–900")
    print(f"体积 {OUTPUT.stat().st_size / 1024:.1f} KiB；内部家族 {FAMILY}")
    if unavailable:
        labels = ", ".join(f"{chr(n)} U+{n:04X}" for n in sorted(unavailable))
        print(f"原字库自身不含：{labels}；子集不增加这些符号，页面继续使用既有系统字体回退。")


if __name__ == "__main__":
    main()
