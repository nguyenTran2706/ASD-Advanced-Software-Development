# 🏠 MyHome — Real Estate Web App
A full-stack web app for browsing properties to **Buy**, **Rent**, and view **Sold** results, with a simple **enquiry** flow to contact agents. Built with **Node.js + Express**, **SQLite**, and **vanilla HTML/CSS/JS**.

## 🔗 Repository
https://github.com/<your-org>/<your-repo-name>  
*(replace with your actual GitHub URL)*

## 🚀 How to Run (Step-by-Step)

1) **Clone & install**
```bash
git clone https://github.com/<your-org>/<your-repo-name>.git
cd <your-repo-name>
npm install

2) Start the server (choose one)
nodemon app.js or node app.js

3) Open: http://localhost:3000

🧭 What’s in the App (Main Functions)
🛒 Buy
- Page: frontend/buy.html
- Lists properties with filters (search by suburb/postcode, type, beds, price).
- Each card links to a Property Details page (property.html?id=...&status=buy).

🏡 Rent
- Page: frontend/rent.html
- Same experience as Buy, but shows rental properties.

🧾 Sold
- Page: frontend/sold.html
- Shows recently sold properties for research and comps.

🏷️ Property Details
- Page: frontend/property.html
- Full photo gallery, specs (beds/baths/car spaces), price label (buy/rent/sold aware). Enquire button passes the property id to the enquiry page.

✉️ Enquire (Saves to DB)
- Page: frontend/enquire.html
- Submits to POST /api/enquiries and stores the enquiry in SQLite.
- Auto-fills the property_id from the URL.

👤 Find Agent
- Page: frontend/findAgent.html
- Basic agent lookup/placeholder to demonstrate navigation and flow.

📰 News
- Page: frontend/news.html
- Static news/resources section (placeholder for future integrations).

📦 Project Structure
.
├── app.js                  # Express server + static hosting
├── database.js             # SQLite connection & schema (tables incl. enquiries)
├── database.db             # SQLite database file
├── backend/
│   ├── listings.js         # /api/listings (GET filters, GET by id, POST create)
│   ├── properties.js       # /api/properties (demo/aux routes)
│   ├── enquiries.js        # /api/enquiries (POST saves enquiries)
│   └── auth.js             # (optional) auth endpoints
├── backend/seed_listings.js# Seeds 50+ properties (rent/buy/sold)
├── frontend/
│   ├── index.html          # Home
│   ├── buy.html            # Buy listings
│   ├── rent.html           # Rent listings
│   ├── sold.html           # Sold listings
│   ├── property.html       # Property details
│   ├── enquire.html        # Enquiry form
│   ├── login.html          # Login
│   ├── signUp.html         # Sign Up
│   ├── wishlist.html       # Wishlist (optional)
│   ├── findAgent.html      # Find Agent
│   ├── news.html           # News
│   └── css/style.css       # Styles
├── Assets/                 # Images + logos
├── package.json
└── README.md

🔌 Key API Endpoints
- GET /api/listings?status=buy|rent|sold&q=&type=&minBeds=&limit=&offset=
- GET /api/listings/:id
- POST /api/listings
- Body: { status, address, suburb, postcode, state, price, bedrooms, bathrooms, carspaces, type, image, images[] }
- POST /api/enquiries
- Body: { property_id, name, email, phone, message }

## 👥 Team & Responsibilities

| Member              | Responsibilities                                                                 |
|---------------------|---------------------------------------------------------------------------------|
| **Dicky Evaldo**    | Implemented **Property Search** (filters by suburb, postcode, budget, amenities) and **Wishlist** features (save/remove properties, view saved properties). |
| **Ron Tran**        | Developed **User Login/Signup** and **User Management** (profile details, authentication, wishlist integration, bookings management). |
| **Khoi Nguyen Tran**| Built **Book Inspections** (schedule, manage, cancel inspections) and **Get in Touch with Agent / Enquiries** (contact forms, enquiry DB integration). |
| **Tran Bao Khoi Le**| Implemented **Property Listings** (Buy, Rent, Sold tabs, grid view, filters, pagination) and **Map View** (map integration, pins sync with listings). |

🛠 Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: SQLite
- Dev Tools: Nodemon, Azure Pipelines (optional)

✅ Notes / Tips
- If you reseed often, run: node backend/seed_listings.js to refresh 50+ listings.
- Default server: http://localhost:3000
- Images use /Assets/...; ensure the Assets folder is served in app.js.

Happy hacking! 🎉
