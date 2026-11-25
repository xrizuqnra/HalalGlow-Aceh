// Centralized State Management & localStorage Persistence

import { DEFAULT_DATA, DEFAULT_DEMO_USERS, DEFAULT_ROUTINE } from '../data/defaults.js';

export const STORAGE_KEYS = {
  DATA: 'halalglow_sociolla_data_v1',
  WISHLIST: 'halalglow_sociolla_wish_v1',
  ROUTINE_ACTIVE: 'halalglow_sociolla_rtn_active_v1',
  ROUTINE_SAVED: 'halalglow_sociolla_rtn_saved_v1',
  CART: 'halalglow_sociolla_cart_v1',
  ORDERS: 'halalglow_sociolla_orders_v1',
  AUTH: 'halalglow_sociolla_auth_v1',
  USERS: 'halalglow_sociolla_users_v1',
  LANG: 'halalglow_sociolla_lang_v1'
};

function safeReadJson(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return structuredClone(fallbackValue);
    return JSON.parse(raw);
  } catch {
    return structuredClone(fallbackValue);
  }
}

function loadAppData() {
  const parsed = safeReadJson(STORAGE_KEYS.DATA, null);
  if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.stores) && Array.isArray(parsed.bundles)) {
    return parsed;
  }
  const cloned = structuredClone(DEFAULT_DATA);
  localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(cloned));
  return cloned;
}

export const state = {
  appData: loadAppData(),
  registeredUsers: safeReadJson(STORAGE_KEYS.USERS, DEFAULT_DEMO_USERS),
  currentUser: safeReadJson(STORAGE_KEYS.AUTH, null),
  wishlist: safeReadJson(STORAGE_KEYS.WISHLIST, []),
  savedRoutines: safeReadJson(STORAGE_KEYS.ROUTINE_SAVED, []),
  orderHistory: safeReadJson(STORAGE_KEYS.ORDERS, []),
  cartState: safeReadJson(STORAGE_KEYS.CART, {
    items: [],
    shippingMethod: 'pickup',
    pickupStore: 'HalalGlow Suzuya Mall Banda Aceh',
    voucherCode: ''
  }),
  activeRoutine: safeReadJson(STORAGE_KEYS.ROUTINE_ACTIVE, DEFAULT_ROUTINE),
  currentLang: localStorage.getItem(STORAGE_KEYS.LANG) || 'id',
  activeTab: 'catalog',
  activeAdminEntity: 'products',
  editingEntityId: null
};

export function persistAppData() {
  localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(state.appData));
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

export function persistCart() {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(state.cartState));
  updateCounters();
}

export function persistOrders() {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(state.orderHistory));
  updateCounters();
}

export function persistAuth() {
  if (state.currentUser) {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(state.currentUser));
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(state.registeredUsers));
}

export function persistLanguage(lang) {
  state.currentLang = lang;
  localStorage.setItem(STORAGE_KEYS.LANG, lang);
}

export function resetAppDataToDefault() {
  state.appData = structuredClone(DEFAULT_DATA);
  persistAppData();
}

export function updateCounters() {
  const statBadge = document.getElementById('stat-prod-badge');
  if (statBadge) {
    statBadge.textContent = `${state.appData.products.length} Produk`;
  }

  const wishCount = state.wishlist.length;
  const rtnCount = state.activeRoutine.daftarItem.length;
  const cartQtyTotal = (state.cartState.items || []).reduce((acc, item) => acc + (Number(item.qty) || 0), 0);
  const ordersCount = state.orderHistory.length;

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
