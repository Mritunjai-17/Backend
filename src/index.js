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
const { sendTestEmail } = require("./services/email-service");

const app = express();
const PORT = process.env.PORT || 5000;

const setupAndStartServer = async () => {
  // Connect Database
  await connectDB();

  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    })
  );

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      message: "MIDIS CMS API Running",
    });
  });

  // API Routes
  app.use("/api", apiRoutes);

  // Static Uploads
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  // Start Server
  app.listen(PORT, async () => {
    console.log(`🚀 Server started on port ${PORT}`);

    // Send Test Email
    await sendTestEmail();
  });
};

setupAndStartServer();