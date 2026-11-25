// Catalog Grid, Brand/Category Filters & Product Detail Modal (PDP)

import { state, isWishlisted } from '../state/store.js';
import { escapeHtml, formatRupiah, buildDemoWhatsAppUrl } from '../utils/format.js';
import { getProductVisualSrc, getProductFallbackSrc, getProductGallerySrcs } from '../utils/productArt.js';

export function renderProducts() {
  const searchEl = document.getElementById('filter-search');
  const brandEl = document.getElementById('filter-brand');
  const catEl = document.getElementById('filter-category');
  const skinEl = document.getElementById('filter-skintype');
  const halalEl = document.getElementById('filter-halal');
  const sortEl = document.getElementById('filter-sort');
  const countEl = document.getElementById('catalog-result-count');
  const grid = document.getElementById('products-grid');
  if (!grid || !searchEl) return;

  const search = (searchEl.value || '').toLowerCase().trim();
  const brand = brandEl.value;
  const category = catEl.value;
  const skinType = skinEl.value;
  const halalStatus = halalEl.value;
  const sortBy = sortEl.value;

  const filtered = state.appData.products.filter((p) => {
    const matchBrand = brand === 'Semua' || p.brand === brand;
    const matchCat = category === 'Semua' || p.kategori === category;
    const matchSkin =
      skinType === 'Semua' ||
      (p.jenisKulit || []).includes(skinType) ||
      (p.jenisKulit || []).includes('Semua Jenis Kulit');
    const matchHalal =
      halalStatus === 'Semua' ||
      (halalStatus === 'Resmi' && p.statusHalal.includes('Tersertifikasi Halal')) ||
      (halalStatus === 'Muslim-Friendly' && p.statusHalal.includes('Muslim-Friendly'));
    const matchSearch =
      !search ||
      p.nama.toLowerCase().includes(search) ||
      p.brand.toLowerCase().includes(search) ||
      (p.subKategori || '').toLowerCase().includes(search) ||
      p.deskripsi.toLowerCase().includes(search) ||
      (p.kandunganUtama || []).join(' ').toLowerCase().includes(search);

    return matchBrand && matchCat && matchSkin && matchHalal && matchSearch;
  });

  if (sortBy === 'name-asc') filtered.sort((a, b) => a.nama.localeCompare(b.nama));
  else if (sortBy === 'price-asc') filtered.sort((a, b) => a.harga - b.harga);
  else if (sortBy === 'price-desc') filtered.sort((a, b) => b.harga - a.harga);
  else filtered.sort((a, b) => (b.unggulan ? 1 : 0) - (a.unggulan ? 1 : 0));

  if (countEl) {
    countEl.textContent =
      state.currentLang === 'en'
        ? `Showing ${filtered.length} products`
        : `Menampilkan ${filtered.length} produk`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3 style="font-size:1.15rem;margin-bottom:0.35rem;">Tidak ada produk yang cocok dengan filter Anda.</h3>
        <p style="font-size:0.82rem;color:var(--text-secondary);">Coba pilih "Semua Brand" atau atur ulang filter kategori dan jenis kulit.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered
    .map((p) => {
      const wished = isWishlisted(p.id, 'produk');
      const descText = state.currentLang === 'en' && p.deskripsiEn ? p.deskripsiEn : p.deskripsi;
      const isCertified = p.statusHalal.includes('Tersertifikasi Halal');
      const artSrc = getProductVisualSrc(p);
      const fallbackSrc = getProductFallbackSrc(p);
      const primaryStore = (p.geraiTersedia && p.geraiTersedia[0]) || 'Gerai Mitra Aceh';

      return `
        <article class="product-card">
          <div>
            <div class="product-card__media">
              <img
                src="${escapeHtml(artSrc)}"
                data-fallback="${escapeHtml(fallbackSrc)}"
                alt="${escapeHtml(p.nama)}"
                loading="lazy"
                referrerpolicy="no-referrer"
              />
              <button
                type="button"
                class="wish-toggle-btn"
                data-action="toggle-wish"
                data-type="produk"
                data-id="${escapeHtml(p.id)}"
                aria-label="Simpan ${escapeHtml(p.nama)} ke Beauty Bag"
                title="Simpan ke Beauty Bag"
              >${wished ? '💖' : '🤍'}</button>
              ${
                p.shades && p.shades.length > 0
                  ? `<div class="shade-dots-bar" aria-label="Pilihan shade">
                      ${p.shades
                        .map(
                          (s) =>
                            `<span class="shade-dot" title="${escapeHtml(s.name)}" style="background-color:${escapeHtml(s.hex)}"></span>`
                        )
                        .join('')}
                    </div>`
                  : ''
              }
            </div>

            <div class="product-card__body">
              <div class="meta-line">
                <span>${escapeHtml(p.brand)}</span>
                <span aria-hidden="true">·</span>
                <span>${escapeHtml(p.subKategori || p.kategori)}</span>
              </div>

              <h3 class="product-card__title">${escapeHtml(p.nama)}</h3>

              <div class="product-card__price-row">
                <span class="product-card__price tabular-nums">${formatRupiah(p.harga)}</span>
                <span style="font-size:0.68rem;color:var(--text-muted);font-weight:600;">Estimasi Ritel</span>
              </div>

              <p class="product-card__desc">${escapeHtml(descText)}</p>

              <div class="halal-note ${isCertified ? '' : 'halal-note--friendly'}">
                <div style="font-weight:700;">${isCertified ? '✓' : '•'} ${escapeHtml(p.statusHalal)}</div>
                <div style="opacity:0.85;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  BPOM: ${escapeHtml(p.nomorBpom)}
                </div>
              </div>

              <div style="font-size:0.74rem;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                Gerai: <strong>${escapeHtml(primaryStore)}</strong>
              </div>
            </div>
          </div>

          <div class="product-card__actions">
            <button type="button" class="btn btn-primary btn-block" data-action="add-cart" data-id="${escapeHtml(p.id)}">
              + Keranjang
            </button>
            <div class="product-card__sub-actions">
              <button type="button" class="btn btn-dark" data-action="open-product" data-id="${escapeHtml(p.id)}">
                Detail &amp; Stok
              </button>
              <button type="button" class="btn btn-subtle" data-action="add-routine" data-id="${escapeHtml(p.id)}">
                + Routine
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  attachImageFallbacks(grid);
}

export function attachImageFallbacks(container) {
  container.querySelectorAll('img[data-fallback]').forEach((img) => {
    img.addEventListener(
      'error',
      () => {
        const fb = img.getAttribute('data-fallback');
        if (fb && img.src !== fb) {
          img.src = fb;
        }
      },
      { once: true }
    );
  });
}

export function setQuickBrand(brandName) {
  const brandSelect = document.getElementById('filter-brand');
  if (brandSelect) brandSelect.value = brandName;

  document.querySelectorAll('[data-action="quick-brand"]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.getAttribute('data-brand') === brandName);
  });
  renderProducts();
}

export function setQuickCategory(cat) {
  const catSelect = document.getElementById('filter-category');
  if (catSelect) catSelect.value = cat;

  document.querySelectorAll('[data-action="quick-cat"]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.getAttribute('data-cat') === cat);
  });
  renderProducts();
}

export function openProductModal(prodId, selectedShadeIdx = 0, selectedPhotoIdx = 0) {
  const p = state.appData.products.find((item) => item.id === prodId);
  const modal = document.getElementById('detail-modal');
  const modalBody = document.getElementById('modal-body');
  if (!p || !modal || !modalBody) return;

  const wished = isWishlisted(p.id, 'produk');
  const descText = state.currentLang === 'en' && p.deskripsiEn ? p.deskripsiEn : p.deskripsi;
  const isCertified = p.statusHalal.includes('Tersertifikasi Halal');
  const gallery = getProductGallerySrcs(p);
  const fallbackSrc = getProductFallbackSrc(p);
  const safePhotoIdx = selectedPhotoIdx >= 0 && selectedPhotoIdx < gallery.length ? selectedPhotoIdx : 0;
  const artSrc = gallery[safePhotoIdx] || fallbackSrc;
  const activeShade = p.shades && p.shades.length > 0 ? p.shades[selectedShadeIdx] || p.shades[0] : null;
  const waUrl = buildDemoWhatsAppUrl('Gerai Aceh', '6281200005501', p.nama);

  const thumbsHtml =
    gallery.length > 1
      ? `<div class="pdp-gallery-thumbs" aria-label="Galeri foto produk">
          ${gallery
            .map(
              (src, idx) => `
            <button
              type="button"
              class="pdp-thumb-btn ${idx === safePhotoIdx ? 'is-active' : ''}"
              data-action="select-modal-photo"
              data-id="${escapeHtml(p.id)}"
              data-shade-idx="${selectedShadeIdx}"
              data-photo-idx="${idx}"
              aria-label="Foto ${idx + 1} dari ${gallery.length}"
            >
              <img
                src="${escapeHtml(src)}"
                data-fallback="${escapeHtml(fallbackSrc)}"
                alt="${escapeHtml(p.nama)} - foto ${idx + 1}"
                referrerpolicy="no-referrer"
              />
            </button>`
            )
            .join('')}
        </div>`
      : '';

  modalBody.innerHTML = `
    <div style="position:relative;height:15rem;background:var(--bg-subtle);border-bottom:1px solid var(--border-hairline);">
      <img
        src="${escapeHtml(artSrc)}"
        data-fallback="${escapeHtml(fallbackSrc)}"
        alt="${escapeHtml(p.nama)}"
        referrerpolicy="no-referrer"
        style="width:100%;height:100%;object-fit:cover;"
      />
      <button
        type="button"
        class="close-circle-btn"
        data-action="close-detail-modal"
        aria-label="Tutup detail produk"
        style="position:absolute;top:1rem;right:1rem;background:#ffffff;color:var(--text-primary);border-color:var(--border-hairline);"
      >✕</button>
    </div>
    ${thumbsHtml}

    <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1rem;font-size:0.875rem;">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:0.75rem;padding-bottom:0.85rem;border-bottom:1px solid var(--border-hairline);">
        <div>
          <div class="meta-line" style="margin-bottom:0.25rem;">
            <span>${escapeHtml(p.brand)}</span>
            <span aria-hidden="true">·</span>
            <span>${escapeHtml(p.kategori)} / ${escapeHtml(p.subKategori || '')}</span>
          </div>
          <h2 style="font-size:1.35rem;line-height:1.25;">${escapeHtml(p.nama)}</h2>
          <div class="tabular-nums" style="font-size:1.25rem;font-weight:700;color:var(--accent-primary);margin-top:0.3rem;">
            ${formatRupiah(p.harga)}
            <span style="font-size:0.72rem;font-weight:500;color:var(--text-muted);">(Estimasi Simulasi)</span>
          </div>
        </div>
        <div style="font-size:0.75rem;color:var(--text-secondary);">
          <div style="font-weight:700;color:${isCertified ? 'var(--accent-primary)' : 'var(--status-friendly-text)'};">
            ${escapeHtml(p.statusHalal)}
          </div>
          <div style="margin-top:0.2rem;">Halal: ${escapeHtml(p.nomorHalal)}</div>
          <div>BPOM: ${escapeHtml(p.nomorBpom)}</div>
        </div>
      </div>

      <p style="color:var(--text-secondary);">${escapeHtml(descText)}</p>

      ${
        p.shades && p.shades.length > 0
          ? `<div class="surface-card surface-card--subtle" style="padding:0.9rem 1rem;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                <span style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);">Pilih Shade / Varian</span>
                <span style="font-size:0.78rem;font-weight:700;color:var(--accent-primary);">${escapeHtml(activeShade ? activeShade.name : '')}</span>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:0.45rem;">
                ${p.shades
                  .map(
                    (s, idx) => `
                  <button
                    type="button"
                    class="filter-chip ${idx === selectedShadeIdx ? 'is-active' : ''}"
                    data-action="select-modal-shade"
                    data-id="${escapeHtml(p.id)}"
                    data-shade-idx="${idx}"
                    data-photo-idx="${safePhotoIdx}"
                    style="display:inline-flex;align-items:center;gap:0.4rem;"
                  >
                    <span class="shade-dot" style="background-color:${escapeHtml(s.hex)}"></span>
                    <span>${escapeHtml(s.name)}</span>
                  </button>`
                  )
                  .join('')}
              </div>
            </div>`
          : ''
      }

      <div class="halal-note">
        <div style="font-weight:700;margin-bottom:0.2rem;">Keterangan Pembersihan &amp; Ramah Wudhu</div>
        <p style="font-size:0.78rem;color:var(--text-secondary);">${escapeHtml(p.infoWudhu)}</p>
      </div>

      <div class="grid-2" style="gap:1rem;">
        <div>
          <h4 style="font-family:var(--font-sans);font-size:0.75rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:0.4rem;">Kandungan Utama</h4>
          <p style="font-size:0.82rem;color:var(--text-primary);">${escapeHtml((p.kandunganUtama || []).join(' · '))}</p>
        </div>
        <div>
          <h4 style="font-family:var(--font-sans);font-size:0.75rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:0.4rem;">Gerai Aceh (Simulasi)</h4>
          <ul style="margin:0;padding-left:1rem;font-size:0.8rem;color:var(--text-secondary);">
            ${(p.geraiTersedia || ['Gerai Mitra Aceh']).map((g) => `<li>${escapeHtml(g)}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:0.5rem;padding-top:0.85rem;border-top:1px solid var(--border-hairline);">
        <button
          type="button"
          class="btn btn-primary"
          style="flex:1;"
          data-action="add-cart-modal"
          data-id="${escapeHtml(p.id)}"
          data-variant="${escapeHtml(activeShade ? activeShade.name : '')}"
        >
          + Tambah ke Keranjang
        </button>
        <button type="button" class="btn btn-subtle" data-action="add-routine-modal" data-id="${escapeHtml(p.id)}">
          + Routine
        </button>
        <button
          type="button"
          class="btn btn-outline"
          data-action="toggle-wish-modal"
          data-id="${escapeHtml(p.id)}"
          data-shade-idx="${selectedShadeIdx}"
          data-photo-idx="${safePhotoIdx}"
        >
          ${wished ? '💖 Tersimpan' : '🤍 Beauty Bag'}
        </button>
        <a href="${escapeHtml(waUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-dark">
          Tanya WA Demo
        </a>
      </div>
    </div>
  `;

  attachImageFallbacks(modalBody);
  modal.classList.remove('is-hidden');
}

export function closeProductModal() {
  const modal = document.getElementById('detail-modal');
  if (modal) modal.classList.add('is-hidden');
}
