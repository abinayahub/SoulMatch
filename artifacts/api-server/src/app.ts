import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(
  cors({
    origin: true, // Reflect the request origin — allows any origin including Android WebView
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Bypass-Tunnel-Reminder",
      "x-timezone-offset",
      "x-request-id",
    ],
    exposedHeaders: ["Authorization"],
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// Render & Load Balancer Health Check Endpoints
app.get(["/", "/health", "/api/health"], (_req, res) => {
  res.status(200).json({ status: "ok", service: "soulmatch-api" });
});
app.head(["/", "/health", "/api/health"], (_req, res) => {
  res.status(200).end();
});

app.use("/api", router);

export default app;
