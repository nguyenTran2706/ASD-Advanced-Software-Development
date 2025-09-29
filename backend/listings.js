// backend/listings.js
const express = require("express");
const db = require("../database");

const router = express.Router();

/**
 * GET /api/listings
 * Query params (all optional):
 *   status=rent|buy|sold
 *   q=search text (suburb or postcode)
 *   minBeds=
 *   type=
 *   limit=, offset=
 */

const listings = [
  {
    address: "123 Main St",
    suburb: "Sydney",
    state: "NSW",
    type: "Apartment",
    status: "rent",
    bedrooms: 2,
    bathrooms: 1,
    carspaces: 1,
    image: "/Assets/cream/cream1.png",
    images: [],
  },
  {
    address: "456 Park Ave",
    suburb: "Bondi",
    state: "NSW",
    type: "House",
    status: "buy",
    bedrooms: 3,
    bathrooms: 2,
    carspaces: 2,
    image: "/Assets/cream/cream2.png",
    images: [],
  },
];

router.get("/", (req, res) => {
  let {
    status = "",
    q = "",
    minBeds = "",
    type = "",
    limit = "12",
    offset = "0",
  } = req.query || {};

  status = String(status).toLowerCase().trim();
  q = String(q).trim().toLowerCase();
  type = String(type).trim();
  const params = [];
  let where = "WHERE 1=1";

  if (status && ["buy", "rent", "sold"].includes(status)) {
    where += " AND status = ?";
    params.push(status);
  }
  if (q) {
    where += " AND (LOWER(suburb) LIKE ? OR postcode LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }
  if (minBeds) {
    where += " AND bedrooms >= ?";
    params.push(parseInt(minBeds, 10) || 0);
  }
  if (type) {
    where += " AND type = ?";
    params.push(type);
  }

  const sql = `
    SELECT *
    FROM listings
    ${where}
    ORDER BY datetime(createdAt) DESC, id DESC
    LIMIT ? OFFSET ?
  `;
  params.push(parseInt(limit, 10) || 12, parseInt(offset, 10) || 0);

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Parse images JSON column into an array
    const out = rows.map((r) => {
      let images = [];
      try {
        images = r.images ? JSON.parse(r.images) : [];
      } catch (_) { }
      return {
        ...r,
        images,
        cover: r.image || images[0] || "/Assets/placeholder.png",
      };
    });

    res.json({ results: out, count: out.length });
  });
});

/**
 * POST /api/listings
 * Body:
 *  {
 *    status, address, suburb, postcode, state, price,
 *    bedrooms, bathrooms, carspaces, type,
 *    image, images:[...]   // image = cover, images = array of extra
 *  }
 */
router.post("/", (req, res) => {
  const {
    status,
    address,
    suburb,
    postcode,
    state,
    price,
    bedrooms,
    bathrooms,
    carspaces,
    type,
    image,
    images = [],
  } = req.body || {};

  if (
    !status ||
    !["buy", "rent", "sold"].includes(String(status).toLowerCase())
  ) {
    return res
      .status(400)
      .json({ error: "status must be 'buy' | 'rent' | 'sold'" });
  }

  const imagesJson =
    Array.isArray(images) && images.length ? JSON.stringify(images) : null;

  const sql = `
    INSERT INTO listings
      (status,address,suburb,postcode,state,price,bedrooms,bathrooms,carspaces,type,image,images)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `;
  const params = [
    status,
    address || null,
    suburb || null,
    postcode || null,
    state || null,
    price || null,
    bedrooms || null,
    bathrooms || null,
    carspaces || null,
    type || null,
    image || null,
    imagesJson,
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

// GET /api/listings/:id  -> return a single listing
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: "invalid id" });

  db.get(`SELECT * FROM listings WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "listing not found" });

    let images = [];
    try { images = row.images ? JSON.parse(row.images) : []; } catch (_) { }

    res.json({
      ...row,
      images,
      cover: row.image || images[0] || "/Assets/placeholder.png",
    });
  });
});


module.exports = router;
