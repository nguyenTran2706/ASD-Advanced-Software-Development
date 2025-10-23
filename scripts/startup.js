const db = require('../database');

// Wait for DB operations
async function initializeDatabase() {
  try {
    await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) AS c FROM listings", [], (err, row) => {
        if (err) {
          console.error("Database check failed:", err);
          reject(err);
          return;
        }
        console.log(`Database check: ${row.c} listings found`);
        resolve(row);
      });
    });
    
    console.log("Database initialized successfully");
    return true;
  } catch (err) {
    console.error("Database initialization failed:", err);
    throw err;
  }
}

module.exports = { initializeDatabase };