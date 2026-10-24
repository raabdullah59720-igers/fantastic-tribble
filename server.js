const express = require("express");

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

// Set APP_ORIGIN in Render to your exact GitHub Pages origin,
// for example: https://YOUR-USERNAME.github.io
const allowedOrigin = process.env.APP_ORIGIN;

app.use((req, res, next) => {
  const origin = req.get("origin");

  if (origin && allowedOrigin && origin === allowedOrigin) {
    res.set("Access-Control-Allow-Origin", allowedOrigin);
    res.set("Vary", "Origin");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
  }

  if (req.method === "OPTIONS") {
    if (origin && (!allowedOrigin || origin !== allowedOrigin)) {
      return res.status(403).end();
    }
    return res.status(204).end();
  }

  next();
});

app.get("/health", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.set("X-Content-Type-Options", "nosniff");

  const forwardedProto = req.get("x-forwarded-proto");
  if (forwardedProto && forwardedProto.split(",")[0].trim() !== "https") {
    return res.status(426).json({
      status: "error",
      message: "HTTPS required"
    });
  }

  return res.status(200).json({
    status: "ok",
    service: "new-app-health-api",
    https: req.secure || forwardedProto === "https",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (_req, res) => {
  res.status(200).type("text").send("Health API is running. Check GET /health");
});

const port = Number(process.env.PORT || 10000);
app.listen(port, "0.0.0.0", () => {
  console.log(`Health API listening on port ${port}`);
});
