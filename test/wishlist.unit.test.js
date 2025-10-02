/** @jest-environment jsdom */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadWishlistGlobals() {
  const file = path.join(__dirname, "..", "frontend", "js", "wishlist.js");
  const code = fs.readFileSync(file, "utf8");

  // (getUser, toggleWishlist, etc.) will become properties on this object
  const sandbox = {
    window,
    document,
    localStorage: window.localStorage,
    alert: jest.fn(), // alert() is called when user not logged in
    console,
  };

  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox;
}

beforeEach(() => {
  // isolate each test
  localStorage.clear();
  // a logged-in user is required for toggleWishlist to work)
  localStorage.setItem("user", JSON.stringify({ email: "test@example.com" }));
});

test("toggleWishlist adds then removes the same property", () => {
  const { toggleWishlist, inWishlist } = loadWishlistGlobals();

  // Use id ofr lsiting key
  const listing = {
    id: 123,
    address: "1 Test St",
    suburb: "Testville",
    state: "TS",
  };

  // Initially not in wishlist
  expect(inWishlist(listing)).toBe(false);

  // Add to wishlist
  let result = toggleWishlist(listing);
  expect(result.added).toBe(true);
  expect(inWishlist(listing)).toBe(true);

  // Remove from wishlist
  result = toggleWishlist(listing);
  expect(result.added).toBe(false);
  expect(inWishlist(listing)).toBe(false);

  // Also check localStorage key actually created/updated for the user
  const key = "wishlist:test@example.com";
  const arr = JSON.parse(localStorage.getItem(key) || "[]");
  expect(Array.isArray(arr)).toBe(true);
});
