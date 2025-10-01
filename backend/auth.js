// auth.js
const express = require("express");
const crypto = require("crypto");
const db = require("../database");

const router = express.Router();

// Your /signup route is perfect, no changes needed there.
// ... (keep your signup route as is)
router.post("/signup", (req, res) => {
  const { firstName, lastName, phone, email, password } = req.body || {};

  if (!email || !password) return res.status(400).json({ error: "email and password are required" });
  if (!isEmail(email)) return res.status(400).json({ error: "invalid email" });
  if (String(password).length < 6) return res.status(400).json({ error: "password must be at least 6 characters" });

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");

  db.run(
    `INSERT INTO users (first_name, last_name, phone, email, password_salt, password_hash)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [firstName || null, lastName || null, phone || null, String(email).toLowerCase(), salt, hash],
    function (err) {
      if (err) {
        if (String(err.message).includes("UNIQUE constraint failed")) {
          return res.status(409).json({ error: "email already registered" });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        first_name: firstName || null,
        last_name: lastName || null,
        phone: phone || null,
        email: String(email).toLowerCase(),
        created_at: new Date().toISOString(),
      });
    }
  );
});


// --- THIS IS THE CORRECTED LOGIN ROUTE ---
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password are required" });

  const normalized = String(email).toLowerCase();
  db.get(
    `SELECT id, first_name, last_name, email, password_salt, password_hash FROM users WHERE email = ?`,
    [normalized],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(401).json({ error: "invalid email or password" });

      const candidateHash = crypto.scryptSync(String(password), user.password_salt, 64);
      const storedHash = Buffer.from(user.password_hash, "hex");

      if (storedHash.length !== candidateHash.length || !crypto.timingSafeEqual(storedHash, candidateHash)) {
        return res.status(401).json({ error: "invalid email or password" });
      }

      // --- THIS IS THE CRITICAL FIX ---
      // When the password is correct, save the user's ID to the session.
      // This "remembers" the user for all future requests.
      req.session.userId = user.id;

      // It's best practice to save the session before sending the response
      req.session.save(err => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to save session." });
        }
        
        // Now send the success response
        res.json({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          message: "login successful"
        });
      });
    }
  );
});

module.exports = router;