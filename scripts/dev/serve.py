#!/usr/bin/env python3
"""Local preview server that never lets the browser cache anything.

`python3 -m http.server` sends only Last-Modified and no Cache-Control, so
browsers may reuse a stale copy without revalidating. That bites hardest on
works-data/*.json: a cached pre-WebP copy points at image paths that no longer
exist, and the page shows broken images while the code itself is current.

Usage:  python3 scripts/dev/serve.py [port]     (default 8000)
"""
import functools
import http.server
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        # SimpleHTTPRequestHandler answers 304 from If-Modified-Since before any
        # header customization runs, so a browser holding a stale copy would keep
        # it. Drop the validators off the request and every reply is a full 200.
        for header in ("If-Modified-Since", "If-None-Match"):
            if header in self.headers:
                del self.headers[header]
        return super().send_head()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_header(self, keyword, value):
        # Drop validators entirely so no conditional request can 304.
        if keyword.lower() in ("last-modified", "etag"):
            return
        super().send_header(keyword, value)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = functools.partial(NoCacheHandler, directory=str(ROOT))
    # Threading is not optional: a single-threaded server stalls as soon as the
    # browser opens parallel connections for the page's images.
    http.server.ThreadingHTTPServer.allow_reuse_address = True
    with http.server.ThreadingHTTPServer(("", port), handler) as httpd:
        print(f"Serving {ROOT} at http://localhost:{port}  (caching disabled)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nstopped")


if __name__ == "__main__":
    main()
