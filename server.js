// 초경량 정적 파일 서버 (게임 테스트용)
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname, normalize } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };

createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(req.url.split("?")[0]);
    if (path === "/") path = "/index.html";
    const safe = normalize(join(__dirname, path)).replace(/^(\.\.[/\\])+/, "");
    if (!safe.startsWith(__dirname)) { res.writeHead(403); return res.end("forbidden"); }
    const data = await readFile(safe);
    res.writeHead(200, { "Content-Type": TYPES[extname(safe)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404); res.end("not found");
  }
}).listen(PORT, "0.0.0.0", () => console.log(`shape-survivor 서버 http://0.0.0.0:${PORT}`));
