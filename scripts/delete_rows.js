// scripts/fix_extensions.js
const db = require("../database");

db.serialize(() => {
  // 1. Fix single 'image' field (.jpg → .png)
  db.run(
    `UPDATE listings 
     SET image = REPLACE(image, '.jpg', '.png') 
     WHERE image LIKE '%.jpg';`,
    (err) => {
      if (err) console.error("❌ Failed to update image column:", err);
      else console.log("✅ Updated .jpg → .png in image column");
    }
  );

  // 2. Fix JSON 'images' field (.jpg → .png for each item)
  db.all(`SELECT id, images FROM listings WHERE images LIKE '%.jpg%'`, (err, rows) => {
    if (err) return console.error("❌ Failed to fetch rows:", err);

    rows.forEach((row) => {
      try {
        const arr = JSON.parse(row.images);
        const fixed = arr.map((p) =>
          p.endsWith(".jpg") ? p.replace(/\.jpg$/, ".png") : p
        );

        db.run(
          `UPDATE listings SET images = ? WHERE id = ?`,
          [JSON.stringify(fixed), row.id],
          (updateErr) => {
            if (updateErr) console.error(`❌ Failed to update row ${row.id}:`, updateErr);
          }
        );
      } catch (e) {
        console.error("❌ JSON parse error for row", row.id, e);
      }
    });

    console.log("✅ Updated .jpg → .png in images arrays");
  });
});

process.on("SIGINT", () => db.close(() => process.exit(0)));
