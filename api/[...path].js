import http from "node:http";
import https from "node:https";

export const config = { api: { bodyParser: false } };

const HOP_BY_HOP = new Set([
  "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
  "te", "trailer", "transfer-encoding", "upgrade",
]);

export default function handler(req, res) {
  const origin = process.env.ODDMANCHUANG_BFF_ORIGIN;
  if (!origin) {
    res.statusCode = 503;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "ODDMANCHUANG_BFF_ORIGIN is not configured" }));
    return;
  }

  let target;
  try {
    target = new URL(req.url || "/", origin);
    if (target.protocol !== "https:" && target.protocol !== "http:") throw new Error("Unsupported protocol");
  } catch {
    res.statusCode = 500;
    res.end("Invalid ODDMANCHUANG_BFF_ORIGIN configuration");
    return;
  }

  const transport = target.protocol === "https:" ? https : http;
  const headers = { ...req.headers, host: target.host };
  delete headers.connection;
  const upstream = transport.request(target, { method: req.method, headers }, (upstreamResponse) => {
    res.statusCode = upstreamResponse.statusCode || 502;
    for (const [name, value] of Object.entries(upstreamResponse.headers)) {
      if (value !== undefined && !HOP_BY_HOP.has(name.toLowerCase())) res.setHeader(name, value);
    }
    upstreamResponse.pipe(res);
  });

  upstream.on("error", (error) => {
    if (!res.headersSent) {
      res.statusCode = 502;
      res.setHeader("content-type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: `Backend unavailable: ${error.message}` }));
    } else {
      res.destroy(error);
    }
  });
  req.on("aborted", () => upstream.destroy());
  req.pipe(upstream);
}
