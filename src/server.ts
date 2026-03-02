import dotenv from "dotenv";
import mongoose from "mongoose";
import type { Server } from "http";
import app from "./app.ts";
import { connectDB } from "./config/db.ts";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
let server: Server | null = null;
let isShuttingDown = false;

async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`${signal} received. Starting graceful shutdown...`);

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server?.close((error?: Error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
      console.log("HTTP server closed");
    }

    await mongoose.disconnect();
    console.log("MongoDB disconnected");
    process.exit(0);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown shutdown error";
    console.error("Graceful shutdown failed:", message);
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});

(async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown startup error";
    console.error("Failed to start server:", message);
    process.exit(1);
  }
})();
