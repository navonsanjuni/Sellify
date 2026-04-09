const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");
const logger = require("./utils/logger");

const app = express();

// ─── Security Middlewares ─────────────────────────────────────────────────────
// Allow cross-origin embedding of static assets (e.g. /uploads images served
// to the Vite dev server on a different port). Without this, helmet's default
// `Cross-Origin-Resource-Policy: same-origin` makes browsers silently drop the
// image responses even though CORS allows the request.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? process.env.ALLOWED_ORIGINS?.split(",") || []
      : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Try again in 15 minutes." },
});
app.use("/api", limiter);

// ─── Stripe Webhook (raw body needed before JSON parser) ─────────────────────
app.use("/api/checkout/webhook", express.raw({ type: "application/json" }));

// ─── Parsing Middlewares ──────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Logging ─────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(
    morgan("combined", {
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );
}

// ─── Static Files (uploaded images) ──────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ─── Swagger Docs ───────────────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use("/api", routes);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", environment: process.env.NODE_ENV, timestamp: new Date().toISOString() });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
