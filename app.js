// app.js
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

// Import routes
const propertiesRoute = require("./backend/properties");

const app = express();

// Middleware
app.use(bodyParser.json());

// Serve static frontend and css
app.use(express.static(path.join(__dirname, "frontend")));
app.use("/css", express.static(path.join(__dirname, "css")));

// API routes
app.use("/api/properties", propertiesRoute);

// Serve frontend index.html on root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Start server
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
