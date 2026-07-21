const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const apiRoutes = require("./routes");

const app = express();
const PORT = process.env.PORT || 5000;

const setupAndStartServer = async () => {
  try {
    // Connect Database
    await connectDB();

    // Middlewares
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    const allowedOrigins = [
      process.env.CLIENT_URL,
      "http://localhost:5173",
      "http://localhost:8080",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:8080",
      "http://127.0.0.1:3000",
    ].filter(Boolean);

    app.use(
      cors({
        origin: (origin, callback) => {
          // Allow requests with no origin (e.g. mobile apps, Postman) or matching dev origins
          if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            callback(null, true);
          } else {
            callback(null, true);
          }
        },
        credentials: true,
      })
    );


    // Health Check & Root Route
    app.get("/", (req, res) => {
      res.status(200).json({
        success: true,
        message: "MIDIS Backend API is running successfully!",
      });
    });

    app.get("/api/health", (req, res) => {
      res.status(200).json({
        success: true,
        message: "MIDIS CMS API Running",
      });
    });

    // API Routes
    app.use("/api", apiRoutes);

    // Static Uploads
    app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

    // Start Server
    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Server setup updated with fresh env
setupAndStartServer();