const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const DB_PATH = path.join(__dirname, "database.db");
console.log("[DB PATH]", DB_PATH);

const db = new sqlite3.Database(DB_PATH);

// All DB setup in a single serialize block
db.serialize(() => {
  // 1. Create tables
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    email TEXT UNIQUE NOT NULL,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

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
    image TEXT,
    images TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    name TEXT,
    email TEXT,
    phone TEXT,
    message TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(property_id) REFERENCES listings(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS inspections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    notes TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, start_time)
  )`);

  // 2. Create indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_inspections_property ON inspections(property_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_inspections_date ON inspections(start_time)`);

  // 3. Seed data if empty
  db.get("SELECT COUNT(*) AS c FROM listings", [], (err, row) => {
    if (err) return console.error("Seed check failed:", err);
    if (row.c > 0) return console.log("Database already seeded ✅");

    const seed = db.prepare(`INSERT INTO listings
      (status,address,suburb,postcode,state,price,bedrooms,bathrooms,carspaces,type,image)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`);

    // Demo data
    const rows = [
      ["rent", "5/15-17 Third Avenue", "Campsie", "2194", "NSW", 400, 2, 1, 1, "Home-Stay", 
       "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1600&auto=format&fit=crop"],
      // ...add more rows as needed...
    ];

    rows.forEach(r => seed.run(r));
    seed.finalize(() => console.log("Seeded demo listings ✅"));
  });
});

// Graceful shutdown
process.on("SIGINT", () => db.close(() => process.exit(0)));

module.exports = db;