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
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      image TEXT
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
  image TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
)`);

// ----- Seed a few rows if empty (Release 0 demo) -----
db.get('SELECT COUNT(*) AS c FROM listings', [], (err, row) => {
    if (err) return console.error('Seed check failed:', err);
    if (row.c > 0) return; // already seeded

    const seed = db.prepare(`INSERT INTO listings
    (status,address,suburb,postcode,state,price,bedrooms,bathrooms,carspaces,type,image)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`);

    const rows = [
        ['buy', '5/15-17 Third Avenue', 'Campsie', '2194', 'NSW', 750000, 2, 1, 1, 'Townhouse', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1600&auto=format&fit=crop'],
        ['buy', '12 Marrick St', 'Marrickville', '2204', 'NSW', 980000, 3, 2, 1, 'House', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1600&auto=format&fit=crop'],
        ['rent', '8/46-48 Clissold Parade', 'Campsie', '2194', 'NSW', 720, 2, 1, 1, 'Apartment', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop'],
        ['sold', '16A Charlotte Street', 'Campsie', '2194', 'NSW', 960000, 4, 2, 2, 'Duplex', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop']
    ];

    rows.forEach(r => seed.run(r));
    seed.finalize(() => console.log('Seeded demo listings ✅'));
});
