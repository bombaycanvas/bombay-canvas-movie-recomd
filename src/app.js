const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/recommend", require("./routes/recommend.routes"));
app.use("/api/event", require("./routes/event.routes"));

module.exports = app;
