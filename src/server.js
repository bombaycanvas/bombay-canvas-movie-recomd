require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 8080;

// Connect database and start server
const startServer = async () => {
  try {
    console.log("Connecting to database...");

    await connectDB();

    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running successfully`);
      console.log(`📡 Listening on port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server");
    console.error(error);
    process.exit(1);
  }
};

startServer();
