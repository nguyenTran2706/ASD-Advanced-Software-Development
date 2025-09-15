const db = require("../database"); // database.js is in project root

db.run(`DELETE FROM listings WHERE id IN (1,2,3,4)`, (err) => {
  if (err) {
    console.error("Delete failed:", err);
  } else {
    console.log("✅ Deleted rows 1-4");
  }
  process.exit(0);
});
