#!/usr/bin/env python3
"""
Tiny server for the Firefox WASM standalone bundle.

A plain static server gets two things wrong that this build cares about:

  1. MIME type    -- .wasm must be served as "application/wasm" or
                     WebAssembly.instantiateStreaming() refuses to run.
  2. Cross-Origin Isolation -- this is a pthreads build. It needs
                     SharedArrayBuffer, which browsers only expose on pages
                     served with COOP/COEP headers. This script adds them
                     to every response.

Usage:
    python3 serve.py [port]        # default port: 8000

Then open http://localhost:8000  (the bundle folder MUST be the web root)
"""
import http.server
import os
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".wasm": "application/wasm",
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".zst": "application/zstd",
        ".json": "application/json",
    }

    def end_headers(self):
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        self.send_header("Cross-Origin-Resource-Policy", "cross-origin")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stdout.write("[serve.py] " + (fmt % args) + "\n")


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    os.chdir(ROOT)  # bundle folder = web root (the page uses root-relative paths)
    with Server(("0.0.0.0", PORT), Handler) as httpd:
        print(f"Serving {ROOT}")
        print(f"Open http://localhost:{PORT}  (COOP/COEP headers on, wasm MIME fixed)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nBye")
