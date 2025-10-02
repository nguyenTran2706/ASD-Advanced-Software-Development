// scripts/distribute_covers.js
const db = require("../database");

// Define your sets and how many files each one has
const SETS = [
  { name: "blue",    count: 4 },
  { name: "brown",   count: 3 },
  { name: "cream",   count: 4 },
  { name: "cube",    count: 3 },
  { name: "grey",    count: 3 },
  { name: "knife",   count: 3 },
  { name: "modern",  count: 4 },
  { name: "red",     count: 4 },
  { name: "regular", count: 3 },
  { name: "square",  count: 3 },
  { name: "white",   count: 4 },
];

// Helper: build a PNG asset path
function assetPath(setName, idx) {
  return `/Assets/${setName}/${setName}${idx}.png`;
}

// For a given set & a seed, pick a cover and build the full images array
function buildImagesFor(set, seed) {
  const { name, count } = set;
  // rotate the cover number so we don't always use 1
  // seed is a non-negative integer; % count yields [0..count-1], +1 -> [1..count]
  const coverNum = (seed % count) + 1;

  const images = [];
  for (let i = 1; i <= count; i++) {
    images.push(assetPath(name, i));
  }

  const cover = assetPath(name, coverNum);
  return { cover, images };
}

db.serialize(() => {
  console.log("🔧 Distributing covers & images for listings id 26–76...");

  // Only touch rows that exist in this id range
  db.all(`SELECT id FROM listings WHERE id BETWEEN 26 AND 76 ORDER BY id ASC`, (err, rows) => {
    if (err) {
      console.error("❌ Failed to fetch listing ids:", err);
      process.exit(1);
    }

    if (!rows || rows.length === 0) {
      console.log("ℹ️ No listings found between id 26 and 76.");
      return;
    }

    console.log(`➡️  Found ${rows.length} listing(s) to update.`);

    rows.forEach((row, idx) => {
      // Choose set round-robin, vary the cover number with a second rotation
      const set = SETS[idx % SETS.length];
      const seedForCover = Math.floor(idx / SETS.length); // increments after each full pass through SETS

      const { cover, images } = buildImagesFor(set, seedForCover);

      db.run(
        `UPDATE listings SET image = ?, images = ? WHERE id = ?`,
        [cover, JSON.stringify(images), row.id],
        (updateErr) => {
          if (updateErr) {
            console.error(`❌ Update failed for id ${row.id}:`, updateErr);
          } else {
            console.log(`✅ id ${row.id} → cover: ${cover} | images[${images.length}] from "${set.name}"`);
          }
        }
      );
    });
  });
});

// Graceful shutdown
process.on("SIGINT", () => db.close(() => process.exit(0)));
process.on("exit",   () => db.close(() => {}));
