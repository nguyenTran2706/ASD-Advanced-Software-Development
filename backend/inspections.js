// backend/inspections.js
const express = require("express");
const router = express.Router();
const db = require("../database"); // adjust only if your db module is elsewhere

// Ensure table exists
db.run(`
  CREATE TABLE IF NOT EXISTS inspections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    notes TEXT,
    start_time TEXT NOT NULL,   -- ISO string
    end_time   TEXT NOT NULL,   -- ISO string
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// GET /api/inspections/slots?propertyId=123&date=YYYY-MM-DD
router.get("/slots", (req, res) => {
    const { propertyId, date } = req.query;
    if (!propertyId || !date) {
        return res.status(400).json({ error: "propertyId and date are required (YYYY-MM-DD)." });
    }

    const startOfDay = new Date(`${date}T00:00:00`);
    if (Number.isNaN(startOfDay.getTime())) {
        return res.status(400).json({ error: "Invalid date format." });
    }

    // Generate 1-hour slots: 09:00 → 17:00
    const hours = Array.from({ length: 8 }, (_, i) => 9 + i); // 9..16
    const slots = hours.map(h => {
        const start = new Date(startOfDay);
        start.setHours(h, 0, 0, 0);
        const end = new Date(start);
        end.setHours(h + 1);
        return { start: start.toISOString(), end: end.toISOString() };
    });

    // Find booked slots for that property & date
    db.all(
        `SELECT start_time FROM inspections
       WHERE property_id = ?
         AND date(start_time) = date(?)`,
        [propertyId, `${date}T00:00:00`],
        (err, rows) => {
            if (err) return res.status(500).json({ error: "DB error." });
            const booked = new Set((rows || []).map(r => r.start_time));
            res.json(slots.map(s => ({ ...s, booked: booked.has(s.start) })));
        }
    );
});

// GET /api/inspections/user/:email - Fetch all inspections for a user
router.get("/user/:email", (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ error: "Email is required." });
    }

    db.all(
        `SELECT i.*, p.address, p.suburb, p.state, p.price, p.type, p.bedrooms, p.bathrooms, p.carspaces
         FROM inspections i
         LEFT JOIN listings p ON i.property_id = p.id
         WHERE i.email = ?
         ORDER BY i.start_time DESC`,
        [email],
        (err, rows) => {
            if (err) return res.status(500).json({ error: "Database error." });
            res.json(rows || []);
        }
    );
});

// POST /api/inspections  (JSON: { propertyId, fullName, email, phone?, notes?, date, time })
router.post("/", (req, res) => {
    const { propertyId, fullName, email, phone, notes, date, time } = req.body || {};
    if (!propertyId || !fullName || !email || !date || !time) {
        return res.status(400).json({ error: "propertyId, fullName, email, date and time are required." });
    }

    const [HH, MM] = String(time).split(":").map(v => parseInt(v, 10));
    const start = new Date(`${date}T${String(HH).padStart(2, "0")}:${String(MM || 0).padStart(2, "0")}:00`);
    if (Number.isNaN(start.getTime())) {
        return res.status(400).json({ error: "Invalid date/time." });
    }
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    // Insert only if the same slot for this property isn't already taken
    db.run(
        `INSERT INTO inspections (property_id, full_name, email, phone, notes, start_time, end_time)
     SELECT ?,?,?,?,?,?,?
     WHERE NOT EXISTS (
       SELECT 1 FROM inspections WHERE property_id = ? AND start_time = ?
     )`,
        [
            propertyId, fullName, email, phone || null, notes || null,
            start.toISOString(), end.toISOString(),
            propertyId, start.toISOString()
        ],
        function (err) {
            if (err) return res.status(500).json({ error: "DB insert error." });
            if (this.changes === 0) {
                return res.status(409).json({ error: "That time slot has just been booked. Please pick another." });
            }
            res.status(201).json({
                id: this.lastID,
                propertyId,
                fullName,
                email,
                phone: phone || null,
                notes: notes || null,
                start_time: start.toISOString(),
                end_time: end.toISOString(),
            });
        }
    );
});

module.exports = router;
