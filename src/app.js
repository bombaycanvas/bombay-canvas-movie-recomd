const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check / entry point
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend is running 🚀",
    service: "Discovery API",
    time: new Date(),
  });
});

// Routes
app.use("/api/recommend", require("./routes/recommend.routes"));
app.use("/api/event", require("./routes/event.routes"));

module.exports = app;
