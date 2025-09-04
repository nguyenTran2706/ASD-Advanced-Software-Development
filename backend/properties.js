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

/* -------------------------------------------------------------------------- */
/*  NEW: DEMO BROWSE ENDPOINT (mock data so Buy/Rent/Sold shows immediately)  */
/*  GET /api/properties/browse?mode=rent|buy|sold&q=Campsie&beds=2&type=House */
/* -------------------------------------------------------------------------- */
const SAMPLE_PROPS = [
    // RENT
    { id: 1, status: 'rent', priceLabel: '$620 per week', price: 620, address: '8/68 Amy Street, Campsie', suburb: 'Campsie', state: 'NSW', postcode: '2194', beds: 2, baths: 1, cars: 1, type: 'Apartment', photo: '/Assets/unit2.png' },
    { id: 2, status: 'rent', priceLabel: '$550 per week', price: 550, address: '35 Cann Street, Bass Hill', suburb: 'Bass Hill', state: 'NSW', postcode: '2197', beds: 2, baths: 1, cars: 3, type: 'House', photo: '/Assets/unit2.png' },
    { id: 3, status: 'rent', priceLabel: '$690 per week', price: 690, address: '5/12 Ninth Ave, Campsie', suburb: 'Campsie', state: 'NSW', postcode: '2194', beds: 2, baths: 1, cars: 1, type: 'Apartment', photo: '/Assets/unit2.png' },

    // BUY
    { id: 4, status: 'buy', priceLabel: '$850,000', price: 850000, address: '14 Queen St, Ashfield', suburb: 'Ashfield', state: 'NSW', postcode: '2131', beds: 3, baths: 2, cars: 1, type: 'Townhouse', photo: '/Assets/news1.png' },
    { id: 5, status: 'buy', priceLabel: '$785,000', price: 785000, address: '2/88 Amy St, Campsie', suburb: 'Campsie', state: 'NSW', postcode: '2194', beds: 3, baths: 2, cars: 1, type: 'Townhouse', photo: '/Assets/news2.png' },
    { id: 6, status: 'buy', priceLabel: '$1,390,000', price: 1390000, address: '9 Park Rd, Carlton', suburb: 'Carlton', state: 'VIC', postcode: '3053', beds: 4, baths: 2, cars: 2, type: 'House', photo: '/Assets/news3.png' },

    // SOLD
    { id: 7, status: 'sold', priceLabel: 'Sold $520,000', price: 520000, address: '8/4 Loftus, Campsie', suburb: 'Campsie', state: 'NSW', postcode: '2194', beds: 2, baths: 1, cars: 1, type: 'Apartment', photo: '/Assets/berita1.png' },
    { id: 8, status: 'sold', priceLabel: 'Sold $760,000', price: 760000, address: '3 Garden Ln, Canterbury', suburb: 'Canterbury-Bankstown', state: 'NSW', postcode: '2196', beds: 3, baths: 2, cars: 2, type: 'House', photo: '/Assets/berita2.png' },
    { id: 9, status: 'sold', priceLabel: 'Sold $1,220,000', price: 1220000, address: '101 Beach Rd, Canberra', suburb: 'Canberra', state: 'ACT', postcode: '2600', beds: 4, baths: 3, cars: 2, type: 'House', photo: '/Assets/berita4.png' }
];

router.get("/browse", (req, res) => {
    let { mode = "rent", q = "", beds = "", type = "" } = req.query || {};
    mode = String(mode).toLowerCase();
    q = String(q).trim().toLowerCase();
    const minBeds = parseInt(String(beds) || "0", 10);
    type = String(type).trim();

    const out = SAMPLE_PROPS
        .filter(p => p.status === mode)
        .filter(p => !q || p.suburb.toLowerCase().includes(q) || p.postcode.includes(q))
        .filter(p => p.beds >= minBeds)
        .filter(p => !type || p.type === type);

    res.json({ results: out, count: out.length, mode, q, beds: minBeds, type });
});
/* ------------------------------- END /browse ------------------------------- */

module.exports = router;
