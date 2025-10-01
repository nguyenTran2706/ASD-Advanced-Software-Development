// backend/enquiries.js
const express = require("express");
const db = require("../database");

const router = express.Router();

// POST /api/enquiries
router.post("/", (req, res) => {
    const { property_id, name, email, phone, message } = req.body || {};
    if (!property_id || !name || !email || !message) {
        return res.status(400).json({ error: "property_id, name, email, and message are required" });
    }

    db.run(
        `INSERT INTO enquiries (property_id, name, email, phone, message)
     VALUES (?, ?, ?, ?, ?)`,
        [property_id, name, email, phone || null, message],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: this.lastID,
                property_id,
                name,
                email,
                phone: phone || null,
                message,
                created_at: new Date().toISOString(),
            });
        }
    );
});

// (optional) GET all enquiries
router.get("/", (req, res) => {
    db.all(`SELECT * FROM enquiries ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;
