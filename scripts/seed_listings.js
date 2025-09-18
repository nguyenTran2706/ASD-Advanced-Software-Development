// backend/seed_listings.js
const db = require("../database");

const rows = [
  // Example rows — edit/duplicate to reach 11
  [
    "rent",
    "101 Bridge St",
    "Ultimo",
    "2007",
    "NSW",
    700,
    2,
    1,
    1,
    "Apartment",
    "/Assets/blue/blue1.png",
    [
      "/Assets/blue/blue2.png",
      "/Assets/blue/blue3.png",
      "/Assets/blue/blue4.png",
    ],
  ],
  [
    "rent",
    "12 Ebsworth St",
    "Zetland",
    "2011",
    "NSW",
    820,
    2,
    2,
    1,
    "Apartment",
    "/Assets/brown/brown1.png",
    [
      "/Assets/brown/brown2.png",
      "/Assets/brown/brown2.png",
      "/Assets/brown/brown3.png",
    ],
  ],
  [
    "buy",
    "16 Charlotte Street",
    "Chippendale",
    "2000",
    "NSW",
    960000,
    4,
    2,
    2,
    "Apartment",
    "/Assets/cream/cream1.png",
    [
      "/Assets/cream/cream2.png",
      "/Assets/cream/cream3.png",
      "/Assets/cream/cream4.png",
    ],
  ],
  [
    "rent",
    "13 James Street",
    "Kingsford",
    "2018",
    "NSW",
    420,
    1,
    1,
    0,
    "House",
    "/Assets/cube/cube1.png",
    ["/Assets/cube/cube2.png", "/Assets/cube/cube3.png"],
  ],
  [
    "rent",
    "7 Harris Street",
    "Ultimo",
    "2000",
    "NSW",
    370,
    4,
    2,
    2,
    "Apartment",
    "/Assets/grey/grey1.png",
    ["/Assets/grey/grey2.png", "/Assets/grey/grey3.png"],
  ],
  [
    "rent",
    "15 viet Street",
    "Bankstown",
    "2045",
    "NSW",
    330,
    1,
    1,
    1,
    "House",
    "/Assets/red/red1.png",
    ["/Assets/red/red2.png", "/Assets/red/red3.png", "/Assets/red/red4.png"],
  ],
  [
    "rent",
    "22 Charles Street",
    "Chippendale",
    "2045",
    "NSW",
    800,
    1,
    1,
    1,
    "Apartment",
    "/Assets/square/square1.png",
    ["/Assets/square/square2.png", "/Assets/square/square3.png"],
  ],
  [
    "buy",
    "13 Pitt Street",
    "Pitts Point",
    "2045",
    "NSW",
    873000,
    4,
    2,
    1,
    "House",
    "/Assets/regular/regular1.png",
    ["/Assets/regular/regular2.png", "/Assets/regular/regular3.png"],
  ],
  [
    "rent",
    "1 Harris Street",
    "Ultimo",
    "2017",
    "NSW",
    540,
    1,
    1,
    1,
    "Apartment",
    "/Assets/white/white1.png",
    [
      "/Assets/white/white2.png",
      "/Assets/white/white2.png",
      "/Assets/white/white3.png",
    ],
  ],
  [
    "buy",
    "45 Quay Street",
    "Pyrmont",
    "2045",
    "NSW",
    930000,
    3,
    1,
    1,
    "House",
    "/Assets/modern/modern1.jpg",
    [
      "/Assets/modern/modern2.jpg",
      "/Assets/modern/modern3.jpg",
      "/Assets/modern/modern4.jpg",
    ],
  ],
  [
    "rent",
    "21 Ebsworth Street",
    "Zetland",
    "2017",
    "NSW",
    930,
    3,
    1,
    1,
    "House",
    "/Assets/knife/knife1.jpg",
    [
      "/Assets/knife/knife2.jpg",
      "/Assets/knife/knife23.jpg",
      "/Assets/knife/modern4.jpg",
    ],
  ],
];

db.serialize(() => {
  const stmt = db.prepare(`
    INSERT INTO listings
      (status,address,suburb,postcode,state,price,bedrooms,bathrooms,carspaces,type,image,images)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `);

  rows.forEach((r) => {
    r[0] = r[0].toLocaleLowerCase();
    const imagesJson = JSON.stringify(r[11] || []);
    const base = r.slice(0, 11);
    stmt.run([...base, imagesJson]);
  });

  stmt.finalize((err) => {
    if (err) console.error("Seed insert failed:", err);
    else console.log("✅ Inserted extra listings");
    process.exit(0);
  });
});
