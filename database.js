// database.js
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const DB_PATH = path.join(__dirname, "database.db");
console.log("[DB PATH]", DB_PATH);

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT,
      last_name TEXT,
      phone TEXT,
      email TEXT UNIQUE NOT NULL,
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
  CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    name TEXT,
    email TEXT,
    phone TEXT,
    message TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(property_id) REFERENCES listings(id)
  )
`);
});

process.on("SIGINT", () => db.close(() => process.exit(0)));

module.exports = db;

// LISTINGS (your properties for buy/rent/sold)
db.run(`CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  status TEXT CHECK(status IN ('buy','rent','sold')) NOT NULL,
  address TEXT,
  suburb TEXT,
  postcode TEXT,
  state TEXT,
  price INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  carspaces INTEGER,
  type TEXT,
  image TEXT,          -- cover image
  images TEXT,         -- JSON array of extra images
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
)`);

// ✅ Migration: add 'images' column if it doesn't exist
db.run(`ALTER TABLE listings ADD COLUMN images TEXT`, (err) => {
  if (err) {
    if (err.message.includes("duplicate column name")) {
      console.log("Column 'images' already exists ✅");
    } else {
      console.error("Failed to add column:", err);
    }
  } else {
    console.log("Added 'images' column ✅");
  }
});


// ----- Seed a few rows if empty (Release 0 demo) -----
db.get("SELECT COUNT(*) AS c FROM listings", [], (err, row) => {
  if (err) return console.error("Seed check failed:", err);
  if (row.c > 0) return; // already seeded

  const seed = db.prepare(`INSERT INTO listings
    (status,address,suburb,postcode,state,price,bedrooms,bathrooms,carspaces,type,image)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`);

  const rows = [
    [
      "rent",
      "5/15-17 Third Avenue",
      "Campsie",
      "2194",
      "NSW",
      400,
      2,
      1,
      1,
      "Home-Stay",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1600&auto=format&fit=crop",
    ],
    [
      "rent",
      "12 Marrick St",
      "Marrickville",
      "2204",
      "NSW",
      970,
      3,
      2,
      1,
      "Apartment",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1600&auto=format&fit=crop",
    ],
    [
      "rent",
      "8/46-48 Clissold Parade",
      "Chippendale",
      "2194",
      "NSW",
      720,
      2,
      1,
      1,
      "Apartment",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop",
    ],
    [
      "buy",
      "16 Charlotte Street",
      "Zetland",
      "2017",
      "NSW",
      960000,
      4,
      2,
      2,
      "House",
      "",
    ],
  ];

  // === Inspections table (property inspection bookings) ===
  db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS inspections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      notes TEXT,
      start_time TEXT NOT NULL,  -- ISO string (UTC or local), e.g. 2025-10-02T10:00:00
      end_time   TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(property_id, start_time) -- prevent double-booking same slot
    )
  `);

    db.run(`CREATE INDEX IF NOT EXISTS idx_inspections_property ON inspections(property_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_inspections_date ON inspections(start_time)`);
  });

  rows.forEach((r) => seed.run(r));
  seed.finalize(() => console.log("Seeded demo listings ✅"));
});
