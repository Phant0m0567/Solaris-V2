import http from "node:http";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";

const HOST = "127.0.0.1";
const PORT = 8012;
const ALLOWED_ORIGINS = new Set([
  "http://localhost:8011",
  "http://127.0.0.1:8011",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);

wisp.options.port_whitelist = [80, 443];
wisp.options.allow_private_ips = false;
wisp.options.allow_loopback_ips = false;

const server = http.createServer((request, response) => {
  if (request.method === "GET" && request.url?.split("?")[0] === "/healthz") {
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8"
    });
    response.end("Wisp server ready");
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not found");
});

server.on("upgrade", (request, socket, head) => {
  const path = request.url?.split("?")[0];
  const origin = request.headers.origin ?? "";
  if (path !== "/wisp/" || !ALLOWED_ORIGINS.has(origin)) {
    socket.end("HTTP/1.1 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n");
    return;
  }

  wisp.routeRequest(request, socket, head);
});

server.on("error", (error) => {
  console.error("Wisp server failed:", error);
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  console.log(`Local Wisp server listening at ws://${HOST}:${PORT}/wisp/`);
});
