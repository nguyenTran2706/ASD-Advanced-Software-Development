const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image TEXT
    )`);

    db.run(`INSERT INTO properties (title, price, description, image)
            VALUES ('Cozy Apartment', 250000, '2 bed, 1 bath, near city center', 'apartment.jpg')`);
});

db.close();
console.log("Database created and seeded!");