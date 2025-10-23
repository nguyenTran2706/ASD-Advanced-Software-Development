const db = require('../database');

console.log('🌱 Seeding database...');

// Wait for DB operations to complete
setTimeout(() => {
  db.get("SELECT COUNT(*) as count FROM listings", (err, row) => {
    if (err) {
      console.error('❌ Seed failed:', err);
      process.exit(1);
    }
    console.log(`✅ Database seeded with ${row.count} listings`);
    db.close(() => process.exit(0));
  });
}, 1000);