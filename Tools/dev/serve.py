"""Локальный статический сервер для тестов: отдаёт корень репо под префиксом /rbbp/
(сайт использует абсолютные пути /rbbp/...), без симлинков - работает на Linux/Windows/macOS.

    python Tools/dev/serve.py [порт]      # по умолчанию 8811

Страница: http://localhost:8811/rbbp/HTML/RBBP.html
"""
import http.server
import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8811


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def translate_path(self, path):
        if path == "/rbbp":
            path = "/"
        elif path.startswith("/rbbp/"):
            path = path[len("/rbbp"):]
        return super().translate_path(path)

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler) as srv:
        print(f"serving {ROOT} on http://localhost:{PORT}/rbbp/", flush=True)
        srv.serve_forever()
