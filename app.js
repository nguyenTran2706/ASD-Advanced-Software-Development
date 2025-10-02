// app.js
const express = require("express");
const path = require("path");
const app = express();
const session = require("express-session");

// Import routes
const authRoutes = require("./backend/auth.js");
const propertiesRoute = require("./backend/properties");
const listingsRoute = require("./backend/listings");
const enquiriesRoute = require("./backend/enquiries");
const profileApiRoutes = require('./backend/profile');

// Middleware
app.use(express.json());
app.use(
  session({
    secret: "a-very-strong-and-secret-key-for-my-app",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(express.static(path.join(__dirname)));

// Serve static frontend and css
app.use(express.static(path.join(__dirname, "frontend")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use(express.static("public"));

// Add this line to serve Assets folder
app.use("/Assets", express.static(path.join(__dirname, "Assets")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertiesRoute);
app.use("/api/listings", listingsRoute);
app.use("/api/enquires", enquiriesRoute)
app.use('/api/profile', profileApiRoutes);


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




module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
}
