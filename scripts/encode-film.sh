#!/bin/sh
# 将 Canvas 原型的 40 秒录像与原创合成音轨合并为作品集视频。
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
VIDEO="$PROJECT_DIR/output/film.webm"
SCORE="$PROJECT_DIR/output/score.wav"
DEST_DIR="$PROJECT_DIR/showcase"
DEST="$DEST_DIR/film.mp4"

if ! command -v ffmpeg >/dev/null 2>&1; then
    printf '%s\n' '需要 ffmpeg 才能编码展示影片。' >&2
    exit 1
fi
if [ ! -f "$VIDEO" ]; then
    printf '%s\n' "未找到原型导出录像：$VIDEO" >&2
    exit 1
fi
if [ ! -f "$SCORE" ]; then
    printf '%s\n' "未找到合成音轨：$SCORE；请先运行 scripts/synthesize-audio.py。" >&2
    exit 1
fi

mkdir -p "$DEST_DIR" "$PROJECT_DIR/showcase"
ffmpeg -hide_banner -loglevel warning -y \
    -i "$VIDEO" -i "$SCORE" \
    -map 0:v:0 -map 1:a:0 \
    -vf 'fps=60,scale=1600:900:flags=lanczos:out_range=tv,format=yuv420p' \
    -c:v libx264 -preset slow -crf 18 -profile:v high -level:v 4.2 -g 120 \
    -color_range tv -colorspace bt709 -color_trc bt709 -color_primaries bt709 \
    -c:a aac -b:a 192k -ar 48000 \
    -t 40 -movflags +faststart "$DEST"
printf '%s\n' "已编码：$DEST"
