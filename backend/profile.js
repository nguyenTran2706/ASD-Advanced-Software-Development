const express = require('express');
const router = express.Router();
const db = require('../database.js');
const crypto = require('crypto');

// 1. Import our new validation functions
const { validateProfileUpdateData, validatePasswordChangeData } = require('./validation.js');

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    res.status(401).json({ error: "Unauthorized. You must be logged in." });
  }
};

// GET route remains the same, it doesn't need validation
router.get('/', isAuthenticated, (req, res) => {
  const sql = "SELECT id, first_name, last_name, email, phone FROM users WHERE id = ?";
  db.get(sql, [req.session.userId], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error." });
    if (!row) return res.status(404).json({ error: "User not found." });
    res.json(row);
  });
});

// UPDATED 'Update Profile' Route with Validation
router.put('/', isAuthenticated, (req, res) => {
  // 2. Run validation on the incoming data first
  const validationError = validateProfileUpdateData(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError }); // 400 Bad Request
  }

  const userId = req.session.userId;
  const { firstName, lastName, phone, email } = req.body;
  const sql = `UPDATE users SET first_name = ?, last_name = ?, phone = ?, email = ? WHERE id = ?`;
  
  db.run(sql, [firstName, lastName, phone, email, userId], function(err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(409).json({ error: "This email address is already registered." });
      }
      return res.status(500).json({ error: "Failed to update profile." });
    }
    res.json({ message: "Profile updated successfully!" });
  });
});

// UPDATED 'Change Password' Route with Validation
router.put('/change-password', isAuthenticated, (req, res) => {
    // 3. Run validation on the incoming password data first
    const validationError = validatePasswordChangeData(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const userId = req.session.userId;
    const { currentPassword, newPassword } = req.body;
    const sqlSelect = "SELECT password_salt, password_hash FROM users WHERE id = ?";

    db.get(sqlSelect, [userId], (err, user) => {
        if (err) return res.status(500).json({ error: "Server error." });

        // 4. ADDED: This new check prevents a server crash if the user is not found
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const candidateHash = crypto.scryptSync(currentPassword, user.password_salt, 64);
        const storedHash = Buffer.from(user.password_hash, "hex");
        if (!crypto.timingSafeEqual(storedHash, candidateHash)) {
            return res.status(401).json({ error: "Incorrect current password." });
        }

        const newSalt = crypto.randomBytes(16).toString("hex");
        const newHash = crypto.scryptSync(newPassword, newSalt, 64).toString("hex");
        const sqlUpdate = "UPDATE users SET password_salt = ?, password_hash = ? WHERE id = ?";
        
        db.run(sqlUpdate, [newSalt, newHash, userId], (err) => {
            if (err) return res.status(500).json({ error: "Failed to update password." });
            res.json({ message: "Password changed successfully!" });
        });
    });
});

module.exports = router;