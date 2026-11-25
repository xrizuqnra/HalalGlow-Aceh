// Centralized State Management (In-Memory Auth/Session + Server-Synced Catalog/Cart/Orders)

import { DEFAULT_DATA, DEFAULT_ROUTINE } from '../data/defaults.js';

export const STORAGE_KEYS = {
  WISHLIST: 'halalglow_sociolla_wish_v1',
  ROUTINE_ACTIVE: 'halalglow_sociolla_rtn_active_v1',
  ROUTINE_SAVED: 'halalglow_sociolla_rtn_saved_v1',
  LANG: 'halalglow_sociolla_lang_v1'
};

// Clear any legacy plaintext client auth/user storage
try {
  localStorage.removeItem('halalglow_sociolla_auth_v1');
  localStorage.removeItem('halalglow_sociolla_users_v1');
  localStorage.removeItem('halalglow_sociolla_cart_v1');
  localStorage.removeItem('halalglow_sociolla_orders_v1');
} catch {
  // Ignore storage errors
}

function safeReadJson(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return structuredClone(fallbackValue);
    return JSON.parse(raw);
  } catch {
    return structuredClone(fallbackValue);
  }
}

function createEmptyCart() {
  return {
    items: [],
    shippingMethod: 'pickup',
    pickupStore: 'HalalGlow Suzuya Mall Banda Aceh',
    voucherCode: ''
  };
}

// Session Bearer token lives ONLY in JS memory (never localStorage/sessionStorage)
let inMemoryAuthToken = null;

export const state = {
  appData: structuredClone(DEFAULT_DATA),
  currentUser: null,
  creatorStatus: {
    configured: true,
    source: 'unknown',
    creatorEmail: 'admin@halalglow.id'
  },
  wishlist: safeReadJson(STORAGE_KEYS.WISHLIST, []),
  savedRoutines: safeReadJson(STORAGE_KEYS.ROUTINE_SAVED, []),
  orderHistory: [],
  cartState: createEmptyCart(),
  activeRoutine: safeReadJson(STORAGE_KEYS.ROUTINE_ACTIVE, DEFAULT_ROUTINE),
  currentLang: localStorage.getItem(STORAGE_KEYS.LANG) || 'id',
  activeTab: 'catalog',
  activeAdminEntity: 'products',
  editingEntityId: null
};

export function getAuthToken() {
  return inMemoryAuthToken;
}

export function isAuthenticated() {
  return Boolean(inMemoryAuthToken && state.currentUser);
}

export function isCreatorUser() {
  return Boolean(isAuthenticated() && state.currentUser?.role === 'admin');
}

export function setSessionAuth(token, user, cart = null, orders = null) {
  inMemoryAuthToken = token || null;
  state.currentUser = user || null;
  state.cartState = cart || createEmptyCart();
  state.orderHistory = Array.isArray(orders) ? orders : [];
  updateCounters();
}

export function clearSessionAuth() {
  inMemoryAuthToken = null;
  state.currentUser = null;
  state.cartState = createEmptyCart();
  state.orderHistory = [];
  state.editingEntityId = null;
  updateCounters();
}

export function setAppDataFromServer(appData) {
  if (appData && Array.isArray(appData.products) && Array.isArray(appData.stores) && Array.isArray(appData.bundles)) {
    state.appData = appData;
    updateCounters();
  }
}

export function setCartFromServer(cart) {
  state.cartState = cart || createEmptyCart();
  updateCounters();
}

export function setOrdersFromServer(orders) {
  state.orderHistory = Array.isArray(orders) ? orders : [];
  updateCounters();
}

export function persistWishlist() {
  localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(state.wishlist));
  updateCounters();
}

export function persistActiveRoutine() {
  localStorage.setItem(STORAGE_KEYS.ROUTINE_ACTIVE, JSON.stringify(state.activeRoutine));
  updateCounters();
}

export function persistSavedRoutines() {
  localStorage.setItem(STORAGE_KEYS.ROUTINE_SAVED, JSON.stringify(state.savedRoutines));
}

export function persistLanguage(lang) {
  state.currentLang = lang;
  localStorage.setItem(STORAGE_KEYS.LANG, lang);
}

export function updateCounters() {
  const statBadge = document.getElementById('stat-prod-badge');
  if (statBadge) {
    statBadge.textContent = `${state.appData.products.length} Produk`;
  }

  const wishCount = state.wishlist.length;
  const rtnCount = state.activeRoutine.daftarItem.length;
  const authed = isAuthenticated();
  const cartQtyTotal = authed
    ? (state.cartState.items || []).reduce((acc, item) => acc + (Number(item.qty) || 0), 0)
    : 0;
  const ordersCount = authed ? state.orderHistory.length : 0;

  const map = {
    'wish-badge': wishCount,
    'wish-badge-mobile': wishCount,
    'routine-badge': rtnCount,
    'routine-badge-mobile': rtnCount,
    'cart-badge': cartQtyTotal,
    'orders-badge': ordersCount,
    'orders-badge-mobile': ordersCount
  };

  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(val);
  });
}

export function isWishlisted(itemId, tipeItem) {
  return state.wishlist.some((w) => w.itemId === itemId && w.tipeItem === tipeItem);
}

export function toggleWishlistItem(itemId, tipeItem) {
  const idx = state.wishlist.findIndex((w) => w.itemId === itemId && w.tipeItem === tipeItem);
  if (idx >= 0) {
    state.wishlist.splice(idx, 1);
    persistWishlist();
    return false;
  }
  state.wishlist.push({
    id: 'wish-' + Date.now(),
    itemId,
    tipeItem,
    tanggalDitambahkan: new Date().toLocaleDateString('id-ID')
  });
  persistWishlist();
  return true;
}

export function calculateCartTotals() {
  let subtotal = 0;
  let totalQty = 0;

  (state.cartState.items || []).forEach((item) => {
    const prod = state.appData.products.find((p) => p.id === item.prodId);
    if (!prod) return;
    subtotal += (Number(prod.harga) || 0) * (Number(item.qty) || 0);
    totalQty += Number(item.qty) || 0;
  });

  let discount = 0;
  const code = (state.cartState.voucherCode || '').toUpperCase();
  if (subtotal > 0) {
    if (code === 'HALALGLOW10') {
      discount = Math.round(subtotal * 0.1);
    } else if (code === 'ACEHCANTIK') {
      discount = Math.min(subtotal, 15000);
    }
  }

  let shippingCost = 0;
  if (subtotal > 0) {
    if (state.cartState.shippingMethod === 'instant') shippingCost = 12000;
    else if (state.cartState.shippingMethod === 'regular') shippingCost = 20000;
  }

  const grandTotal = Math.max(0, subtotal - discount + shippingCost);
  return { subtotal, discount, shippingCost, grandTotal, totalQty };
}
