require("dotenv").config();

const { validateEnv, PORT } = require("./src/config/env");
const connectDB = require("./src/config/db");
const app = require("./src/app");
const logger = require("./src/utils/logger");

// Validate env variables before anything starts
validateEnv();

// Connect to MongoDB then start server
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Sellify backend running on http://localhost:${PORT}`);
      logger.info(`📦 Environment: ${process.env.NODE_ENV}`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      logger.info(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info("HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
