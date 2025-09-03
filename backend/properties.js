// backend/properties.js
const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const db = require("../database"); // reusable SQLite connection

// GET all properties
router.get("/", (_req, res) => {
  db.all("SELECT * FROM properties ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST create a property
router.post("/", (req, res) => {
  const { title, price, description, image } = req.body || {};
  if (!title || price == null) {
    return res.status(400).json({ error: "title and price are required" });
  }

  db.run(
    `INSERT INTO properties (title, price, description, image)
     VALUES (?, ?, ?, ?)`,
    [title, price, description || null, image || null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        id: this.lastID,
        title,
        price,
        description: description || null,
        image: image || null,
      });
    }
  );
});


function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

// POST /api/properties/auth/signup
router.post("/auth/signup", (req, res) => {
  const { firstName, lastName, phone, email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ error: "invalid email" });
  }
  if (String(password).length < 6) {
    return res
      .status(400)
      .json({ error: "password must be at least 6 characters" });
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");

  db.run(
    `INSERT INTO users (first_name, last_name, phone, email, password_salt, password_hash)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      firstName || null,
      lastName || null,
      phone || null,
      String(email).toLowerCase(),
      salt,
      hash,
    ],
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

// POST /api/properties/auth/login
router.post("/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const normalized = String(email).toLowerCase();

  db.get(
    `SELECT id, first_name, last_name, email, password_salt, password_hash
     FROM users WHERE email = ?`,
    [normalized],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user)
        return res.status(401).json({ error: "invalid email or password" });

      const candidateHash = crypto.scryptSync(
        String(password),
        user.password_salt,
        64
      );
      const storedHash = Buffer.from(user.password_hash, "hex");

      if (
        storedHash.length !== candidateHash.length ||
        !crypto.timingSafeEqual(storedHash, candidateHash)
      ) {
        return res.status(401).json({ error: "invalid email or password" });
      }

      // OK — in a real app you'd set a session/JWT
      res.json({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        message: "login successful",
      });
    }
  );
});

module.exports = router;