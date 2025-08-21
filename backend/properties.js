const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all properties
router.get('/', (req, res) => {
    db.all('SELECT * FROM properties', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST new property
router.post('/', (req, res) => {
    const { title, price, description, image } = req.body;
    db.run(
        `INSERT INTO properties (title, price, description, image) VALUES (?, ?, ?, ?)`,
        [title, price, description, image],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, title, price, description, image });
        }
    );
});

module.exports = router;