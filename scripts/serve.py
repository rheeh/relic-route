#!/usr/bin/env python3
"""本地预览与 Canvas 导出：python3 scripts/serve.py。"""

import argparse
import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent
MAX_BODY = 100 * 1024 * 1024
EXPORTS = {
    "/__export/00-crew.png": ROOT / "showcase/00-crew.png",
    "/__export/01-map.png": ROOT / "showcase/01-map.png",
    "/__export/02-dossier.png": ROOT / "showcase/02-dossier.png",
    "/__export/03-confirm.png": ROOT / "showcase/03-confirm.png",
    "/__export/04-reward.png": ROOT / "showcase/04-reward.png",
    "/__export/05-armory.png": ROOT / "showcase/05-armory.png",
    "/__export/film.webm": ROOT / "output/film.webm",
}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def respond(self, status, payload):
        encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def do_POST(self):
        target = EXPORTS.get(urlsplit(self.path).path)
        if target is None:
            self.respond(404, {"error": "Unknown export path"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.respond(400, {"error": "Invalid Content-Length"})
            return
        if length <= 0:
            self.respond(400, {"error": "Empty export"})
            return
        if length > MAX_BODY:
            self.respond(413, {"error": "Export exceeds 100 MB"})
            return
        data = self.rfile.read(length)
        if len(data) != length:
            self.respond(400, {"error": "Incomplete export"})
            return
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        self.respond(200, {"path": target.relative_to(ROOT).as_posix()})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bind", default="127.0.0.1")
    parser.add_argument("--port", default=4198, type=int)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.bind, args.port), Handler)
    print(f"Relic Route: http://{args.bind}:{args.port}/demo/", flush=True)
    print("本地开发服务：导出只写入七个固定文件。", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
