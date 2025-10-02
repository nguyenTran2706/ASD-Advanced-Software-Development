// --- wishlist helpers (global functions) ---
function getUser() {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
}
function wishlistKey() {
  const u = getUser();
  return u ? `wishlist:${u.email || u.id || "user"}` : null;
}
function getWishlist() {
  const k = wishlistKey(); if (!k) return [];
  try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; }
}
function saveWishlist(arr) {
  const k = wishlistKey(); if (!k) return;
  localStorage.setItem(k, JSON.stringify(arr));
}
function listingKey(l) {
  if (l && (l.id || l.ID)) return `id:${l.id || l.ID}`;
  return `addr:${(l.address||"")}|${(l.suburb||"")}|${(l.state||"")}`.toLowerCase();
}
function inWishlist(l) {
  const ws = getWishlist(); const key = listingKey(l);
  return ws.some(x => listingKey(x) === key);
}
function addToWishlist(l) {
  const ws = getWishlist();
  if (!inWishlist(l)) { ws.push(l); saveWishlist(ws); }
}
function removeFromWishlist(l) {
  const ws = getWishlist(); const key = listingKey(l);
  saveWishlist(ws.filter(x => listingKey(x) !== key));
}
function toggleWishlist(l) {
  if (!getUser()) { alert("Please login/sign up to add to wishlist."); return { added:false, gated:true }; }
  if (inWishlist(l)) { removeFromWishlist(l); return { added:false }; }
  addToWishlist(l); return { added:true };
}
function setHeart(el, filled) {
  if (!el) return;
  el.src = filled ? "/Assets/ri_heart-fill.png" : "/Assets/love-icon.png";
}

if (typeof module !== "undefined") {
  module.exports = {
    getUser,
    wishlistKey,
    getWishlist,
    saveWishlist,
    listingKey,
    inWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    setHeart,
  };
}

