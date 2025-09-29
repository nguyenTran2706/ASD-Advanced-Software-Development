// app.js
const express = require("express");
const path = require("path");
const app = express();

// Import routes
const propertiesRoute = require("./backend/properties");
const listingsRoute = require("./backend/listings");
const enquiriesRoute = require("./backend/enquiries");

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve static frontend and css
app.use(express.static(path.join(__dirname, "frontend")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use(express.static("public"));

// Add this line to serve Assets folder
app.use("/Assets", express.static(path.join(__dirname, "Assets")));

// API routes
app.use("/api/properties", propertiesRoute);
app.use("/api/listings", listingsRoute);
app.use("/api/enquires", enquiriesRoute)

// Serve frontend index.html on root
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.use("/api/listings", require("./backend/listings"));

// Start server
const PORT = 3000;
app.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}`)
);