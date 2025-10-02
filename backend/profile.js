const express = require('express');
const router = express.Router();
const db = require('../database.js');
const crypto = require('crypto'); // We need crypto for the password change

const isAuthenticated = (req, res, next) => {
  // ... (this middleware remains the same)
  if (req.session && req.session.userId) {
    return next();
  } else {
    res.status(401).json({ error: "Unauthorized. You must be logged in." });
  }
};

// --- Your GET route remains the same ---
router.get('/', isAuthenticated, (req, res) => {
  // We'll add 'phone' to the fields we retrieve
  const sql = "SELECT id, first_name, last_name, email, phone FROM users WHERE id = ?";
  db.get(sql, [req.session.userId], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error." });
    if (!row) return res.status(404).json({ error: "User not found." });
    res.json(row);
  });
});


// --- UPDATED 'Update Profile' Route ---
router.put('/', isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  // Get the new fields from the request body
  const { firstName, lastName, phone, email } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: "First name, last name, and email are required." });
  }

  const sql = `UPDATE users SET first_name = ?, last_name = ?, phone = ?, email = ? WHERE id = ?`;
  
  db.run(sql, [firstName, lastName, phone, email, userId], function(err) {
    if (err) {
      // Gracefully handle the case where the new email is already taken
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(409).json({ error: "This email address is already registered." });
      }
      console.error("Database error on PUT /api/profile:", err.message);
      return res.status(500).json({ error: "Failed to update profile." });
    }
    res.json({ message: "Profile updated successfully!" });
  });
});


// --- NEW 'Change Password' Route ---
router.put('/change-password', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'All password fields are required.' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    // Step 1: Get the current user's salt and hash from the DB
    const sqlSelect = "SELECT password_salt, password_hash FROM users WHERE id = ?";
    db.get(sqlSelect, [userId], (err, user) => {
        if (err) return res.status(500).json({ error: "Server error." });

        // Step 2: Verify the 'currentPassword' is correct
        const candidateHash = crypto.scryptSync(currentPassword, user.password_salt, 64);
        const storedHash = Buffer.from(user.password_hash, "hex");
        if (!crypto.timingSafeEqual(storedHash, candidateHash)) {
            return res.status(401).json({ error: "Incorrect current password." });
        }

        // Step 3: If correct, create a new salt and hash for the 'newPassword'
        const newSalt = crypto.randomBytes(16).toString("hex");
        const newHash = crypto.scryptSync(newPassword, newSalt, 64).toString("hex");

        // Step 4: Update the database with the new salt and hash
        const sqlUpdate = "UPDATE users SET password_salt = ?, password_hash = ? WHERE id = ?";
        db.run(sqlUpdate, [newSalt, newHash, userId], (err) => {
            if (err) return res.status(500).json({ error: "Failed to update password." });
            res.json({ message: "Password changed successfully!" });
        });
    });
});

module.exports = router;