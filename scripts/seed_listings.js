// // backend/seed_listings.js
// const db = require("../database");

// const rows = [
//   // Example rows — edit/duplicate to reach 11
//   [
//     "rent",
//     "101 Bridge St",
//     "Ultimo",
//     "2007",
//     "NSW",
//     700,
//     2,
//     1,
//     1,
//     "Apartment",
//     "/Assets/blue/blue1.png",
//     [
//       "/Assets/blue/blue2.png",
//       "/Assets/blue/blue3.png",
//       "/Assets/blue/blue4.png",
//     ],
//   ],
//   [
//     "rent",
//     "12 Ebsworth St",
//     "Zetland",
//     "2011",
//     "NSW",
//     820,
//     2,
//     2,
//     1,
//     "Apartment",
//     "/Assets/brown/brown1.png",
//     [
//       "/Assets/brown/brown2.png",
//       "/Assets/brown/brown2.png",
//       "/Assets/brown/brown3.png",
//     ],
//   ],
//   [
//     "buy",
//     "16 Charlotte Street",
//     "Chippendale",
//     "2000",
//     "NSW",
//     960000,
//     4,
//     2,
//     2,
//     "Apartment",
//     "/Assets/cream/cream1.png",
//     [
//       "/Assets/cream/cream2.png",
//       "/Assets/cream/cream3.png",
//       "/Assets/cream/cream4.png",
//     ],
//   ],
//   [
//     "rent",
//     "13 James Street",
//     "Kingsford",
//     "2018",
//     "NSW",
//     420,
//     1,
//     1,
//     0,
//     "House",
//     "/Assets/cube/cube1.png",
//     ["/Assets/cube/cube2.png", "/Assets/cube/cube3.png"],
//   ],
//   [
//     "rent",
//     "7 Harris Street",
//     "Ultimo",
//     "2000",
//     "NSW",
//     370,
//     4,
//     2,
//     2,
//     "Apartment",
//     "/Assets/grey/grey1.png",
//     ["/Assets/grey/grey2.png", "/Assets/grey/grey3.png"],
//   ],
//   [
//     "rent",
//     "15 viet Street",
//     "Bankstown",
//     "2045",
//     "NSW",
//     330,
//     1,
//     1,
//     1,
//     "House",
//     "/Assets/red/red1.png",
//     ["/Assets/red/red2.png", "/Assets/red/red3.png", "/Assets/red/red4.png"],
//   ],
//   [
//     "rent",
//     "22 Charles Street",
//     "Chippendale",
//     "2045",
//     "NSW",
//     800,
//     1,
//     1,
//     1,
//     "Apartment",
//     "/Assets/square/square1.png",
//     ["/Assets/square/square2.png", "/Assets/square/square3.png"],
//   ],
//   [
//     "buy",
//     "13 Pitt Street",
//     "Pitts Point",
//     "2045",
//     "NSW",
//     873000,
//     4,
//     2,
//     1,
//     "House",
//     "/Assets/regular/regular1.png",
//     ["/Assets/regular/regular2.png", "/Assets/regular/regular3.png"],
//   ],
//   [
//     "rent",
//     "1 Harris Street",
//     "Ultimo",
//     "2017",
//     "NSW",
//     540,
//     1,
//     1,
//     1,
//     "Apartment",
//     "/Assets/white/white1.png",
//     [
//       "/Assets/white/white2.png",
//       "/Assets/white/white2.png",
//       "/Assets/white/white3.png",
//     ],
//   ],
//   [
//     "buy",
//     "45 Quay Street",
//     "Pyrmont",
//     "2045",
//     "NSW",
//     930000,
//     3,
//     1,
//     1,
//     "House",
//     "/Assets/modern/modern1.jpg",
//     [
//       "/Assets/modern/modern2.jpg",
//       "/Assets/modern/modern3.jpg",
//       "/Assets/modern/modern4.jpg",
//     ],
//   ],
//   [
//     "rent",
//     "21 Ebsworth Street",
//     "Zetland",
//     "2017",
//     "NSW",
//     930,
//     3,
//     1,
//     1,
//     "House",
//     "/Assets/knife/knife1.jpg",
//     [
//       "/Assets/knife/knife2.jpg",
//       "/Assets/knife/knife23.jpg",
//       "/Assets/knife/modern4.jpg",
//     ],
//   ],
// ];

// db.serialize(() => {
//   const stmt = db.prepare(`
//     INSERT INTO listings
//       (status,address,suburb,postcode,state,price,bedrooms,bathrooms,carspaces,type,image,images)
//     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
//   `);

//   rows.forEach((r) => {
//     r[0] = r[0].toLocaleLowerCase();
//     const imagesJson = JSON.stringify(r[11] || []);
//     const base = r.slice(0, 11);
//     stmt.run([...base, imagesJson]);
//   });

//   stmt.finalize((err) => {
//     if (err) console.error("Seed insert failed:", err);
//     else console.log("✅ Inserted extra listings");
//     process.exit(0);
//   });
// });

// backend/seed_listings.js
const db = require("../database");

// Clear old rows first
db.run("DELETE FROM listings", [], (err) => {
  if (err) console.error("Error clearing listings:", err.message);
  else console.log("🗑️ Cleared listings table before seeding");
});

const rows = [
  // --- Rent ---
  ["rent", "101 Bridge St", "Ultimo", "2007", "NSW", 700, 2, 1, 1, "Apartment", "/Assets/blue/blue1.png", ["/Assets/blue/blue2.png", "/Assets/blue/blue3.png"]],
  ["rent", "12 Ebsworth St", "Zetland", "2011", "NSW", 820, 2, 2, 1, "Apartment", "/Assets/brown/brown1.png", ["/Assets/brown/brown2.png", "/Assets/brown/brown3.png"]],
  ["rent", "13 James St", "Kingsford", "2018", "NSW", 420, 1, 1, 0, "House", "/Assets/cube/cube1.png", ["/Assets/cube/cube2.png", "/Assets/cube/cube3.png"]],
  ["rent", "7 Harris St", "Ultimo", "2000", "NSW", 370, 4, 2, 2, "Apartment", "/Assets/grey/grey1.png", ["/Assets/grey/grey2.png", "/Assets/grey/grey3.png"]],
  ["rent", "15 Viet St", "Bankstown", "2200", "NSW", 330, 1, 1, 1, "House", "/Assets/red/red1.png", ["/Assets/red/red2.png", "/Assets/red/red3.png"]],
  ["rent", "22 Charles St", "Chippendale", "2008", "NSW", 800, 1, 1, 1, "Apartment", "/Assets/square/square1.png", ["/Assets/square/square2.png", "/Assets/square/square3.png"]],
  ["rent", "1 Harris St", "Ultimo", "2017", "NSW", 540, 1, 1, 1, "Apartment", "/Assets/white/white1.png", ["/Assets/white/white2.png", "/Assets/white/white3.png"]],
  ["rent", "21 Ebsworth St", "Zetland", "2017", "NSW", 930, 3, 1, 1, "House", "/Assets/knife/knife1.jpg", ["/Assets/knife/knife2.jpg", "/Assets/knife/knife3.jpg"]],
  ["rent", "27 George St", "Parramatta", "2150", "NSW", 620, 2, 2, 1, "Apartment", "/Assets/modern/modern1.jpg", ["/Assets/modern/modern2.jpg", "/Assets/modern/modern3.jpg"]],
  ["rent", "67 Gardeners Rd", "Mascot", "2020", "NSW", 850, 4, 2, 2, "House", "/Assets/cream/cream1.png", ["/Assets/cream/cream2.png", "/Assets/cream/cream3.png"]],
  ["rent", "44 Regent St", "Chippendale", "2008", "NSW", 750, 3, 2, 1, "House", "/Assets/blue/blue1.png", ["/Assets/blue/blue2.png", "/Assets/blue/blue3.png"]],
  ["rent", "10 Pitt St", "Sydney", "2000", "NSW", 690, 2, 1, 1, "Unit", "/Assets/brown/brown1.png", ["/Assets/brown/brown2.png", "/Assets/brown/brown3.png"]],
  ["rent", "85 George St", "The Rocks", "2000", "NSW", 720, 1, 1, 0, "Apartment", "/Assets/red/red1.png", ["/Assets/red/red2.png", "/Assets/red/red3.png"]],
  ["rent", "18 Bay St", "Glebe", "2037", "NSW", 640, 2, 1, 0, "Townhouse", "/Assets/cube/cube1.png", ["/Assets/cube/cube2.png", "/Assets/cube/cube3.png"]],
  ["rent", "99 King St", "Newtown", "2042", "NSW", 880, 3, 2, 1, "Terrace", "/Assets/square/square1.png", ["/Assets/square/square2.png", "/Assets/square/square3.png"]],
  ["rent", "55 Oxford St", "Paddington", "2021", "NSW", 950, 3, 2, 1, "House", "/Assets/grey/grey1.png", ["/Assets/grey/grey2.png", "/Assets/grey/grey3.png"]],
  ["rent", "14 Smith St", "Parramatta", "2150", "NSW", 600, 2, 1, 1, "Apartment", "/Assets/blue/blue1.png", ["/Assets/blue/blue2.png", "/Assets/blue/blue3.png"]],
  ["rent", "3 Queen St", "Ashfield", "2131", "NSW", 520, 2, 1, 0, "Unit", "/Assets/red/red1.png", ["/Assets/red/red2.png", "/Assets/red/red3.png"]],
  ["rent", "200 Church St", "Ryde", "2112", "NSW", 770, 3, 1, 1, "House", "/Assets/brown/brown1.png", ["/Assets/brown/brown2.png", "/Assets/brown/brown3.png"]],
  ["rent", "76 Princes Hwy", "Kogarah", "2217", "NSW", 830, 3, 2, 1, "House", "/Assets/cream/cream1.png", ["/Assets/cream/cream2.png", "/Assets/cream/cream3.png"]],

  // --- Buy ---
  ["buy", "16 Charlotte St", "Chippendale", "2000", "NSW", 960000, 4, 2, 2, "Apartment", "/Assets/cream/cream1.png", ["/Assets/cream/cream2.png", "/Assets/cream/cream3.png"]],
  ["buy", "13 Pitt St", "Sydney", "2000", "NSW", 873000, 4, 2, 1, "House", "/Assets/regular/regular1.png", ["/Assets/regular/regular2.png", "/Assets/regular/regular3.png"]],
  ["buy", "45 Quay St", "Pyrmont", "2009", "NSW", 930000, 3, 1, 1, "House", "/Assets/modern/modern1.jpg", ["/Assets/modern/modern2.jpg", "/Assets/modern/modern3.jpg"]],
  ["buy", "18 Oxford St", "Paddington", "2021", "NSW", 1250000, 3, 2, 1, "House", "/Assets/brown/brown1.png", ["/Assets/brown/brown2.png", "/Assets/brown/brown3.png"]],
  ["buy", "30 Church St", "Ryde", "2112", "NSW", 1100000, 4, 2, 2, "House", "/Assets/blue/blue1.png", ["/Assets/blue/blue2.png", "/Assets/blue/blue3.png"]],
  ["buy", "61 Campbell St", "Surry Hills", "2010", "NSW", 1340000, 3, 2, 1, "Townhouse", "/Assets/cube/cube1.png", ["/Assets/cube/cube2.png", "/Assets/cube/cube3.png"]],
  ["buy", "77 Victoria Rd", "Gladesville", "2111", "NSW", 980000, 3, 2, 1, "House", "/Assets/grey/grey1.png", ["/Assets/grey/grey2.png", "/Assets/grey/grey3.png"]],
  ["buy", "8 Princes Hwy", "Kogarah", "2217", "NSW", 1050000, 4, 2, 2, "House", "/Assets/knife/knife1.jpg", ["/Assets/knife/knife2.jpg", "/Assets/knife/knife3.jpg"]],
  ["buy", "25 George St", "Burwood", "2134", "NSW", 870000, 2, 1, 1, "Apartment", "/Assets/square/square1.png", ["/Assets/square/square2.png", "/Assets/square/square3.png"]],
  ["buy", "3 Charles St", "Liverpool", "2170", "NSW", 950000, 3, 2, 1, "House", "/Assets/red/red1.png", ["/Assets/red/red2.png", "/Assets/red/red3.png"]],
  ["buy", "77 Bay St", "Glebe", "2037", "NSW", 1220000, 3, 2, 2, "House", "/Assets/blue/blue1.png", ["/Assets/blue/blue2.png", "/Assets/blue/blue3.png"]],
  ["buy", "100 Regent St", "Chippendale", "2008", "NSW", 1180000, 3, 2, 1, "Terrace", "/Assets/modern/modern1.jpg", ["/Assets/modern/modern2.jpg", "/Assets/modern/modern3.jpg"]],
  ["buy", "42 King St", "Newtown", "2042", "NSW", 890000, 2, 1, 1, "Apartment", "/Assets/grey/grey1.png", ["/Assets/grey/grey2.png", "/Assets/grey/grey3.png"]],
  ["buy", "90 Oxford St", "Bondi Junction", "2022", "NSW", 1350000, 3, 2, 1, "House", "/Assets/cream/cream1.png", ["/Assets/cream/cream2.png", "/Assets/cream/cream3.png"]],
  ["buy", "3 Marrickville Rd", "Marrickville", "2204", "NSW", 780000, 2, 1, 1, "Apartment", "/Assets/red/red1.png", ["/Assets/red/red2.png", "/Assets/red/red3.png"]],
  ["buy", "200 Illawarra Rd", "Marrickville", "2204", "NSW", 910000, 3, 2, 1, "House", "/Assets/brown/brown1.png", ["/Assets/brown/brown2.png", "/Assets/brown/brown3.png"]],
  ["buy", "11 Smith St", "Chatswood", "2067", "NSW", 1480000, 4, 2, 2, "House", "/Assets/knife/knife1.jpg", ["/Assets/knife/knife2.jpg", "/Assets/knife/knife3.jpg"]],

  // --- Sold ---
  ["sold", "20 Crown St", "Wollongong", "2500", "NSW", 650000, 2, 1, 1, "Unit", "/Assets/square/square1.png", ["/Assets/square/square2.png", "/Assets/square/square3.png"]],
  ["sold", "88 George St", "Sydney", "2000", "NSW", 1400000, 3, 2, 1, "Apartment", "/Assets/cream/cream1.png", ["/Assets/cream/cream2.png", "/Assets/cream/cream3.png"]],
  ["sold", "34 King St", "Randwick", "2031", "NSW", 1120000, 3, 2, 1, "House", "/Assets/red/red1.png", ["/Assets/red/red2.png", "/Assets/red/red3.png"]],
  ["sold", "7 Queen St", "Ashfield", "2131", "NSW", 780000, 2, 1, 0, "Terrace", "/Assets/blue/blue1.png", ["/Assets/blue/blue2.png", "/Assets/blue/blue3.png"]],
  ["sold", "55 Oxford St", "Paddington", "2021", "NSW", 1520000, 3, 2, 1, "House", "/Assets/modern/modern1.jpg", ["/Assets/modern/modern2.jpg", "/Assets/modern/modern3.jpg"]],
  ["sold", "4 Bay St", "Double Bay", "2028", "NSW", 1850000, 4, 3, 2, "House", "/Assets/blue/blue1.png", ["/Assets/blue/blue2.png", "/Assets/blue/blue3.png"]],
  ["sold", "200 High St", "North Sydney", "2060", "NSW", 1980000, 4, 2, 2, "House", "/Assets/red/red1.png", ["/Assets/red/red2.png", "/Assets/red/red3.png"]],
  ["sold", "89 George St", "The Rocks", "2000", "NSW", 2200000, 5, 3, 2, "Penthouse", "/Assets/grey/grey1.png", ["/Assets/grey/grey2.png", "/Assets/grey/grey3.png"]],
  ["sold", "15 Marrickville Rd", "Marrickville", "2204", "NSW", 870000, 3, 2, 1, "House", "/Assets/square/square1.png", ["/Assets/square/square2.png", "/Assets/square/square3.png"]],
  ["sold", "76 Regent St", "Chippendale", "2008", "NSW", 910000, 3, 2, 1, "Terrace", "/Assets/brown/brown1.png", ["/Assets/brown/brown2.png", "/Assets/brown/brown3.png"]],
];

db.serialize(() => {
  const stmt = db.prepare(`
    INSERT INTO listings
      (status,address,suburb,postcode,state,price,bedrooms,bathrooms,carspaces,type,image,images)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `);

  rows.forEach((r) => {
    const imagesJson = JSON.stringify(r[11] || []);
    stmt.run([...r.slice(0, 11), imagesJson]);
  });

  stmt.finalize((err) => {
    if (err) console.error("Seed insert failed:", err);
    else console.log(`✅ Inserted ${rows.length} listings`);
    process.exit(0);
  });
});
