// HalalGlow Aceh — Main Vanilla JS Entry Point

import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';

import { translatePage } from './data/i18n.js';
import {
  state,
  persistCart,
  persistLanguage,
  updateCounters
} from './state/store.js';
import { showToast } from './utils/format.js';
import {
  renderProducts,
  setQuickBrand,
  setQuickCategory,
  openProductModal,
  closeProductModal
} from './views/catalogView.js';
import {
  selectStoreCity,
  renderStores,
  openStoreQrModal,
  closeStoreQrModal,
  downloadStoreQr,
  copyStoreQrLink
} from './views/storesView.js';
import { resetBundleFilters, renderBundles } from './views/bundlesView.js';
import {
  addProductToRoutine,
  loadBundleIntoRoutine,
  updateRoutineMetaFromInputs,
  renderRoutinePlanner,
  saveCurrentRoutine,
  loadSavedRoutine,
  deleteSavedRoutine,
  clearCurrentRoutine,
  removeRoutineItem,
  updateRoutineItemField
} from './views/routineView.js';
import { renderWishlist, clearAllWishlist, handleWishlistToggle } from './views/wishlistView.js';
import {
  openCartDrawer,
  closeCartDrawer,
  addToCart,
  addBundleToCart,
  updateCartItemQty,
  removeCartItem,
  clearCart,
  applyCartVoucher,
  renderCartDrawer,
  openCheckoutModal,
  closeCheckoutModal,
  submitSimulatedCheckout,
  openInvoiceModal,
  copyInvoiceText,
  renderCustomerOrders
} from './views/cartCheckout.js';
import {
  switchAdminEntity,
  resetAdminForm,
  renderAdminDashboard,
  handleAdminFormSubmit,
  editAdminItem,
  deleteAdminItem,
  updateOrderStatus,
  handleResetDefaultData,
  addProductPhotoUrlRow,
  removeProductPhotoUrlRow,
  promoteProductPhotoUrlRow,
  handleProductPhotoUrlInput,
  clearProductPhotoInput
} from './views/adminView.js';
import {
  renderHeaderAuth,
  openAuthModal,
  closeAuthModal,
  quickDemoLogin,
  handleLoginSubmit,
  handleRegisterSubmit,
  handleEditProfileSubmit,
  handleAvatarUrlInput,
  clearAvatarPreview,
  openCuratorProfileEditor,
  logoutUser
} from './views/authModal.js';

function switchTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('.view-section').forEach((el) => el.classList.add('is-hidden'));
  const target = document.getElementById(`view-${tabName}`);
  if (target) target.classList.remove('is-hidden');

  document.querySelectorAll('.nav-link[data-tab]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.getAttribute('data-tab') === tabName);
  });

  if (tabName === 'stores') renderStores();
  else if (tabName === 'bundles') renderBundles();
  else if (tabName === 'routine') renderRoutinePlanner();
  else if (tabName === 'wishlist') renderWishlist();
  else if (tabName === 'orders') renderCustomerOrders();
  else if (tabName === 'admin') renderAdminDashboard();
  else renderProducts();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu(forceClose = null) {
  const menu = document.getElementById('mobile-menu');
  const toggleBtn = document.querySelector('[data-action="toggle-mobile-menu"]');
  if (!menu) return;
  const shouldHide = forceClose === true ? true : !menu.classList.contains('is-hidden');
  menu.classList.toggle('is-hidden', shouldHide);
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-expanded', String(!shouldHide));
  }
}

function setLanguage(lang) {
  persistLanguage(lang);

  document.querySelectorAll('[data-action="set-lang"]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
  });

  translatePage(lang);
  renderHeaderAuth();
  renderProducts();
  renderStores();
  renderBundles();
  renderRoutinePlanner();
  renderWishlist();
  renderCartDrawer();
  renderCustomerOrders();
}

function setupEventDelegation() {
  // Click delegation
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.getAttribute('data-action');
    const id = target.getAttribute('data-id') || '';

    switch (action) {
      case 'switch-tab': {
        const tab = target.getAttribute('data-tab');
        if (tab) switchTab(tab);
        break;
      }
      case 'switch-tab-mobile': {
        const tab = target.getAttribute('data-tab');
        if (tab) switchTab(tab);
        toggleMobileMenu(true);
        break;
      }
      case 'toggle-mobile-menu':
        toggleMobileMenu();
        break;
      case 'set-lang': {
        const lang = target.getAttribute('data-lang') || 'id';
        setLanguage(lang);
        break;
      }
      case 'scroll-catalog': {
        const sec = document.getElementById('catalog-section');
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
        break;
      }
      case 'quick-brand':
        setQuickBrand(target.getAttribute('data-brand') || 'Semua');
        break;
      case 'quick-cat':
        setQuickCategory(target.getAttribute('data-cat') || 'Semua');
        break;
      case 'toggle-wish': {
        const tipe = target.getAttribute('data-type') || 'produk';
        handleWishlistToggle(id, tipe);
        renderProducts();
        renderStores();
        renderWishlist();
        break;
      }
      case 'toggle-wish-modal': {
        const shadeIdx = Number(target.getAttribute('data-shade-idx') || 0);
        const photoIdx = Number(target.getAttribute('data-photo-idx') || 0);
        handleWishlistToggle(id, 'produk');
        openProductModal(id, shadeIdx, photoIdx);
        renderProducts();
        renderWishlist();
        break;
      }
      case 'open-product':
        openProductModal(id, 0, 0);
        break;
      case 'close-detail-modal':
        closeProductModal();
        break;
      case 'select-modal-shade': {
        const shadeIdx = Number(target.getAttribute('data-shade-idx') || 0);
        const photoIdx = Number(target.getAttribute('data-photo-idx') || 0);
        openProductModal(id, shadeIdx, photoIdx);
        break;
      }
      case 'select-modal-photo': {
        const shadeIdx = Number(target.getAttribute('data-shade-idx') || 0);
        const photoIdx = Number(target.getAttribute('data-photo-idx') || 0);
        openProductModal(id, shadeIdx, photoIdx);
        break;
      }
      case 'add-cart':
        addToCart(id);
        break;
      case 'add-cart-modal': {
        const variant = target.getAttribute('data-variant') || '';
        addToCart(id, variant);
        closeProductModal();
        openCartDrawer();
        break;
      }
      case 'add-routine':
        addProductToRoutine(id);
        break;
      case 'add-routine-modal':
        addProductToRoutine(id);
        closeProductModal();
        break;
      case 'select-city':
        selectStoreCity(target.getAttribute('data-city') || 'Semua');
        break;
      case 'open-store-qr':
        openStoreQrModal(id, 'details');
        break;
      case 'close-store-qr':
        closeStoreQrModal();
        break;
      case 'switch-qr-mode':
        openStoreQrModal(id, target.getAttribute('data-mode') || 'details');
        break;
      case 'download-store-qr':
        downloadStoreQr(id, target.getAttribute('data-mode') || 'details');
        break;
      case 'copy-store-qr':
        copyStoreQrLink(id, target.getAttribute('data-mode') || 'details');
        break;
      case 'reset-bundles':
        resetBundleFilters();
        break;
      case 'add-bundle-cart':
        addBundleToCart(id);
        break;
      case 'load-bundle-routine':
        loadBundleIntoRoutine(id);
        switchTab('routine');
        break;
      case 'save-routine':
        saveCurrentRoutine();
        break;
      case 'clear-routine':
        clearCurrentRoutine();
        break;
      case 'quick-add-routine': {
        const prodSel = document.getElementById('quick-add-prod');
        const slotSel = document.getElementById('quick-add-slot');
        if (prodSel && slotSel && prodSel.value) {
          addProductToRoutine(prodSel.value, slotSel.value);
          renderRoutinePlanner();
        }
        break;
      }
      case 'remove-routine-item':
        removeRoutineItem(target.getAttribute('data-uid') || '');
        break;
      case 'load-saved-routine':
        loadSavedRoutine(id);
        break;
      case 'delete-saved-routine':
        deleteSavedRoutine(id);
        break;
      case 'clear-wishlist':
        clearAllWishlist();
        break;
      case 'open-cart':
        openCartDrawer();
        break;
      case 'close-cart':
        closeCartDrawer();
        break;
      case 'clear-cart':
        clearCart();
        break;
      case 'cart-remove':
        removeCartItem(target.getAttribute('data-uid') || '');
        break;
      case 'cart-qty': {
        const uid = target.getAttribute('data-uid') || '';
        const delta = Number(target.getAttribute('data-delta') || 0);
        updateCartItemQty(uid, delta);
        break;
      }
      case 'apply-voucher':
        applyCartVoucher();
        break;
      case 'quick-voucher':
        applyCartVoucher(target.getAttribute('data-code') || '');
        break;
      case 'open-checkout':
        openCheckoutModal();
        break;
      case 'close-checkout-modal':
        closeCheckoutModal();
        break;
      case 'back-to-cart':
        closeCheckoutModal();
        openCartDrawer();
        break;
      case 'open-invoice':
        openInvoiceModal(id);
        break;
      case 'copy-invoice':
        copyInvoiceText(id);
        break;
      case 'print-invoice':
        window.print();
        break;
      case 'admin-entity':
        switchAdminEntity(target.getAttribute('data-entity') || 'products');
        break;
      case 'admin-new-form':
        resetAdminForm();
        break;
      case 'admin-edit':
        editAdminItem(id);
        break;
      case 'admin-delete':
        deleteAdminItem(id);
        renderProducts();
        renderStores();
        renderBundles();
        break;
      case 'admin-add-photo-url':
        addProductPhotoUrlRow();
        break;
      case 'admin-remove-photo-url':
        removeProductPhotoUrlRow(target);
        break;
      case 'admin-promote-photo-url':
        promoteProductPhotoUrlRow(target);
        break;
      case 'admin-clear-photo':
        clearProductPhotoInput();
        break;
      case 'open-curator-profile-edit':
        openCuratorProfileEditor();
        break;
      case 'auth-clear-avatar':
        clearAvatarPreview();
        break;
      case 'reset-default-data':
        handleResetDefaultData();
        renderProducts();
        renderStores();
        renderBundles();
        break;
      case 'open-auth':
        openAuthModal(target.getAttribute('data-mode') || 'login');
        break;
      case 'open-auth-mobile':
        toggleMobileMenu(true);
        openAuthModal(target.getAttribute('data-mode') || 'login');
        break;
      case 'close-auth-modal':
        closeAuthModal();
        break;
      case 'quick-login': {
        const role = quickDemoLogin(target.getAttribute('data-role') || 'member');
        if (role === 'admin') switchTab('admin');
        break;
      }
      case 'logout':
        logoutUser();
        break;
      case 'logout-mobile':
        toggleMobileMenu(true);
        logoutUser();
        break;
      case 'auth-go-orders':
        closeAuthModal();
        switchTab('orders');
        break;
      case 'auth-go-admin':
        closeAuthModal();
        switchTab('admin');
        break;
      default:
        break;
    }
  });

  // Input / Filter delegation
  document.addEventListener('input', (e) => {
    const el = e.target;
    if (!(el instanceof HTMLElement)) return;

    if (el.id === 'hero-search-input') {
      const filterSearch = document.getElementById('filter-search');
      if (filterSearch) filterSearch.value = el.value;
      renderProducts();
    } else if (el.id === 'filter-search') {
      renderProducts();
    } else if (el.id === 'rtn-name' || el.id === 'rtn-budget-cap') {
      updateRoutineMetaFromInputs();
    } else if (el instanceof HTMLInputElement && el.getAttribute('data-action') === 'admin-photo-url-input') {
      handleProductPhotoUrlInput(el);
    } else if (el instanceof HTMLInputElement && el.id === 'auth-avatar-url') {
      handleAvatarUrlInput(el.value);
    }
  });

  // Change delegation for selects & routine notes
  document.addEventListener('change', (e) => {
    const el = e.target;
    if (!(el instanceof HTMLElement)) return;

    if (
      el.id === 'filter-brand' ||
      el.id === 'filter-category' ||
      el.id === 'filter-skintype' ||
      el.id === 'filter-halal' ||
      el.id === 'filter-sort'
    ) {
      renderProducts();
    } else if (el.id === 'store-city-filter') {
      selectStoreCity(el.value);
    } else if (el.id === 'bnd-skintype' || el.id === 'bnd-goal' || el.id === 'bnd-budget') {
      renderBundles();
    } else if (el.id === 'rtn-skin') {
      updateRoutineMetaFromInputs();
    } else if (el.getAttribute('data-action') === 'routine-note') {
      updateRoutineItemField(el.getAttribute('data-uid') || '', 'note', el.value);
    } else if (el.getAttribute('data-action') === 'routine-slot') {
      updateRoutineItemField(el.getAttribute('data-uid') || '', 'slot', el.value);
    } else if (el.id === 'cart-shipping-method') {
      state.cartState.shippingMethod = el.value;
      persistCart();
      renderCartDrawer();
    } else if (el.id === 'cart-pickup-store') {
      state.cartState.pickupStore = el.value;
      persistCart();
    } else if (el.getAttribute('data-action') === 'admin-order-status') {
      updateOrderStatus(el.getAttribute('data-id') || '', el.value);
    }
  });

  // Form submit delegation
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;

    if (form.id === 'checkout-form') {
      e.preventDefault();
      submitSimulatedCheckout(form);
    } else if (form.id === 'admin-crud-form') {
      e.preventDefault();
      handleAdminFormSubmit(form);
      renderProducts();
      renderStores();
      renderBundles();
    } else if (form.id === 'login-form') {
      e.preventDefault();
      handleLoginSubmit(form);
    } else if (form.id === 'register-form') {
      e.preventDefault();
      handleRegisterSubmit(form);
    } else if (form.id === 'edit-profile-form') {
      e.preventDefault();
      handleEditProfileSubmit(form);
    }
  });

  // Backdrop click to close modals
  ['detail-modal', 'checkout-modal', 'auth-modal', 'store-qr-modal'].forEach((modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('is-hidden');
      }
    });
  });

  // Escape key closes open overlays
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeCheckoutModal();
      closeAuthModal();
      closeStoreQrModal();
      closeCartDrawer();
    }
  });
}

function initApp() {
  setupEventDelegation();
  renderHeaderAuth();
  updateCounters();
  setLanguage(state.currentLang);
  renderProducts();
  renderRoutinePlanner();
  renderCartDrawer();
  renderCustomerOrders();

  // Ensure initial brand chip active state matches filter
  const brandSelect = document.getElementById('filter-brand');
  if (brandSelect && brandSelect.value) {
    setQuickBrand(brandSelect.value);
  }

  // Deep link support for scanned Store QR codes (?store=str-1)
  const params = new URLSearchParams(window.location.search);
  const storeParam = params.get('store');
  if (storeParam) {
    const matchedStore = state.appData.stores.find((s) => s.id === storeParam);
    if (matchedStore) {
      switchTab('stores');
      selectStoreCity(matchedStore.wilayah);
      openStoreQrModal(matchedStore.id, 'details');
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Expose graceful error toast on unhandled promise errors
window.addEventListener('unhandledrejection', () => {
  showToast('Terjadi kendala pada proses lokal. Silakan muat ulang halaman.', 'warn');
});
