// backend/listings.js
const express = require("express");
const db = require("../database");

const router = express.Router();

/**
 * GET /api/listings
 * Query params (all optional):
 *   status=rent|buy|sold
 *   q=search text
 *      - numeric -> price within ±10% OR postcode starts with q
 *      - text    -> address/suburb/state contains q (also postcode contains)
 *   minBeds=number
 *   type=string
 *   limit=number (default 12)
 *   offset=number (default 0)
 */
router.get("/", (req, res) => {
  let {
    status = "",
    q = "",
    minBeds = "",
    type = "",
    limit = "12",
    offset = "0",
  } = req.query || {};

  const where = [];
  const params = [];

  // Normalize
  const statusNorm = String(status).toLowerCase().trim();
  const qRaw = String(q).trim();
  const typeNorm = String(type).toLowerCase().trim();
  const minBedsNum = parseInt(minBeds, 10) || 0;
  const limitNum = Math.max(1, parseInt(limit, 10) || 12);
  const offsetNum = Math.max(0, parseInt(offset, 10) || 0);

  // Filters
  if (statusNorm && ["buy", "rent", "sold"].includes(statusNorm)) {
    where.push("LOWER(status) = ?");
    params.push(statusNorm);
  }

  if (typeNorm) {
    where.push("LOWER(type) = ?");
    params.push(typeNorm);
  }

  if (minBeds) {
    where.push("bedrooms >= ?");
    params.push(minBedsNum);
  }

  // Flexible search logic
  if (qRaw) {
    // Numeric query (price or postcode)
    if (/^\d+(\.\d+)?$/.test(qRaw)) {
      const num = Number(qRaw);
      const minPrice = Math.floor(num * 0.9);
      const maxPrice = Math.ceil(num * 1.1);
      where.push(
        "(CAST(price AS INTEGER) BETWEEN ? AND ? OR CAST(postcode AS TEXT) LIKE ?)"
      );
      params.push(minPrice, maxPrice, `${qRaw}%`);
    } else {
      // Text query (address, suburb, state, or postcode)
      const qLike = `%${qRaw.toLowerCase()}%`;
      where.push(
        "(LOWER(address) LIKE ? OR LOWER(suburb) LIKE ? OR LOWER(state) LIKE ? OR CAST(postcode AS TEXT) LIKE ?)"
      );
      params.push(qLike, qLike, qLike, qLike);
    }
  }

  //changed so on index.html we will shwo rent/buy sinetad of sold first

  const sql = `
    SELECT id, status, address, suburb, postcode, state, price,
           bedrooms, bathrooms, carspaces, type, image, images, createdAt
    FROM listings
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY
      CASE
        WHEN LOWER(status) = 'buy'  THEN 0  -- Buy first
        WHEN LOWER(status) = 'rent' THEN 1  -- Rent next
        WHEN LOWER(status) = 'sold' THEN 2  -- Sold last
        ELSE 3
      END,
      CASE WHEN createdAt IS NOT NULL THEN datetime(createdAt) END DESC,
      id DESC
    LIMIT ? OFFSET ?
  `;
  params.push(limitNum, offsetNum);

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error("List query failed:", err);
      return res.status(500).json({ error: err.message });
    }

    const out = rows.map((r) => {
      let images = [];
      try {
        images = r.images ? JSON.parse(r.images) : [];
      } catch (_) {}
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

/**
 * GET /api/listings/:id
 * Return a single listing by id
 */
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: "invalid id" });

  db.get(`SELECT * FROM listings WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "listing not found" });

    let images = [];
    try {
      images = row.images ? JSON.parse(row.images) : [];
    } catch (_) {}

    res.json({
      ...row,
      images,
      cover: row.image || images[0] || "/Assets/placeholder.png",
    });
  });
});

module.exports = router;
