const express = require("express");
const crypto = require("crypto");
const db = require("../database");

// 1. Import our new validator
const { validateSignupData } = require('./validation.js');

const router = express.Router();

router.post("/signup", (req, res) => {
  // 2. Run the validation logic first
  const validationError = validateSignupData(req.body || {});
  if (validationError) {
    // If there's an error, send a 400 Bad Request response and stop.
    return res.status(400).json({ error: validationError });
  }

  // The rest of your signup logic only runs if validation passes.
  const { firstName, lastName, phone, email, password } = req.body;
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");

  db.run(
    `INSERT INTO users (first_name, last_name, phone, email, password_salt, password_hash)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [firstName, lastName, phone, email.toLowerCase(), salt, hash],
    function (err) {
      // ... (the rest of your database logic remains the same) ...
      if (err) {
        if (String(err.message).includes("UNIQUE constraint failed")) {
          return res.status(409).json({ error: "email already registered" });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, /* ... */ });
    }
  );
});

// Login Route (with logging to confirm it runs)
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password are required" });

  const normalized = String(email).toLowerCase();
  db.get(`SELECT * FROM users WHERE email = ?`, [normalized], (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(401).json({ error: "invalid email or password" });

      const candidateHash = crypto.scryptSync(String(password), user.password_salt, 64);
      const storedHash = Buffer.from(user.password_hash, "hex");

      if (storedHash.length !== candidateHash.length || !crypto.timingSafeEqual(storedHash, candidateHash)) {
        return res.status(401).json({ error: "invalid email or password" });
      }

      console.log(`[AUTH.JS] Login successful for user ID: ${user.id}`);
      req.session.userId = user.id;
      console.log(`[AUTH.JS] Session userId SET to: ${req.session.userId}`);
      
      req.session.save(err => {
        if (err) {
          console.error("[AUTH.JS] Session SAVE FAILED:", err);
          return res.status(500).json({ error: "Failed to save session." });
        }
        console.log("[AUTH.JS] Session saved successfully. Sending response.");
        res.json({ message: "login successful", user: { id: user.id, first_name: user.first_name, email: user.email } });
      });
    }
  );
});

module.exports = router;