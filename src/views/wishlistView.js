// Beauty Bag / Wishlist Collection View

import { state, persistWishlist, toggleWishlistItem } from '../state/store.js';
import { escapeHtml, formatRupiah, showToast, buildDemoWhatsAppUrl } from '../utils/format.js';
import { getProductVisualSrc, getProductFallbackSrc } from '../utils/productArt.js';
import { attachImageFallbacks } from './catalogView.js';

export function renderWishlist() {
  const grid = document.getElementById('wishlist-grid');
  if (!grid) return;

  if (state.wishlist.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3 style="font-size:1.15rem;margin-bottom:0.35rem;">Beauty Bag Masih Kosong</h3>
        <p style="font-size:0.82rem;color:var(--text-secondary);">Klik ikon hati pada kartu produk brand ternama atau gerai Aceh untuk menyimpannya di sini.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = state.wishlist
    .map((w) => {
      if (w.tipeItem === 'produk') {
        const p = state.appData.products.find((item) => item.id === w.itemId);
        if (!p) return '';
        const artSrc = getProductVisualSrc(p);
        const fallbackSrc = getProductFallbackSrc(p);

        return `
          <article class="product-card">
            <div>
              <div class="product-card__media">
                <img
                  src="${escapeHtml(artSrc)}"
                  data-fallback="${escapeHtml(fallbackSrc)}"
                  alt="${escapeHtml(p.nama)}"
                  referrerpolicy="no-referrer"
                />
              </div>
              <div class="product-card__body">
                <div class="meta-line">
                  <span>${escapeHtml(p.brand)}</span>
                  <span aria-hidden="true">·</span>
                  <span>Disimpan ${escapeHtml(w.tanggalDitambahkan)}</span>
                </div>
                <h3 class="product-card__title">${escapeHtml(p.nama)}</h3>
                <div class="product-card__price tabular-nums">${formatRupiah(p.harga)}</div>
              </div>
            </div>
            <div class="product-card__actions">
              <div style="display:grid;grid-template-columns:1fr auto auto;gap:0.45rem;">
                <button type="button" class="btn btn-primary" data-action="open-product" data-id="${escapeHtml(p.id)}">Detail</button>
                <button type="button" class="btn btn-subtle" data-action="add-routine" data-id="${escapeHtml(p.id)}">+ Routine</button>
                <button type="button" class="btn btn-dark" data-action="toggle-wish" data-type="produk" data-id="${escapeHtml(p.id)}">Hapus</button>
              </div>
            </div>
          </article>
        `;
      }

      const s = state.appData.stores.find((item) => item.id === w.itemId);
      if (!s) return '';
      const waUrl = buildDemoWhatsAppUrl(s.nama, s.kontak);

      return `
        <article class="surface-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:1rem;">
          <div style="display:flex;flex-direction:column;gap:0.5rem;">
            <div class="meta-line">
              <span>Gerai ${escapeHtml(s.wilayah)}</span>
              <span aria-hidden="true">·</span>
              <span>${escapeHtml(w.tanggalDitambahkan)}</span>
            </div>
            <h3 style="font-size:1.15rem;">${escapeHtml(s.nama)}</h3>
            <p style="font-size:0.8rem;color:var(--text-secondary);">${escapeHtml(s.alamat)}</p>
          </div>
          <div style="display:flex;gap:0.5rem;">
            <button type="button" class="btn btn-outline" data-action="open-store-qr" data-id="${escapeHtml(s.id)}">
              QR Gerai
            </button>
            <a href="${escapeHtml(waUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="flex:1;">
              WA Demo
            </a>
            <button type="button" class="btn btn-dark" data-action="toggle-wish" data-type="gerai" data-id="${escapeHtml(s.id)}">
              Hapus
            </button>
          </div>
        </article>
      `;
    })
    .join('');

  attachImageFallbacks(grid);
}

export function clearAllWishlist() {
  state.wishlist = [];
  persistWishlist();
  renderWishlist();
  showToast('Beauty Bag dikosongkan.', 'warn');
}

export function handleWishlistToggle(itemId, tipeItem) {
  const item =
    tipeItem === 'produk'
      ? state.appData.products.find((p) => p.id === itemId)
      : state.appData.stores.find((s) => s.id === itemId);
  const label = item ? item.nama : itemId;
  const added = toggleWishlistItem(itemId, tipeItem);
  if (added) {
    showToast(`Ditambahkan ke Beauty Bag: ${label}`);
  } else {
    showToast(`Dihapus dari Beauty Bag: ${label}`, 'warn');
  }
}
