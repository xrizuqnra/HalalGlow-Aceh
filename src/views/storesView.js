// Aceh Beauty Stores Directory, Illustrative SVG Map & Unique Store QR Code Generator

import { state, isWishlisted } from '../state/store.js';
import { I18N } from '../data/i18n.js';
import { escapeHtml, buildDemoWhatsAppUrl, copyTextToClipboard, showToast } from '../utils/format.js';
import { buildStoreQrPayload, renderQrToCanvas, downloadCanvasAsPng } from '../utils/qrCode.js';

export function selectStoreCity(city) {
  const citySelect = document.getElementById('store-city-filter');
  if (citySelect) citySelect.value = city;

  document.querySelectorAll('.svg-pin').forEach((el) => el.classList.remove('is-active'));
  if (city !== 'Semua') {
    const pin = document.getElementById(`pin-${city}`);
    if (pin) pin.classList.add('is-active');
  }
  renderStores();
}

export function renderStores() {
  const citySelect = document.getElementById('store-city-filter');
  const grid = document.getElementById('stores-grid');
  if (!grid || !citySelect) return;

  const dict = I18N[state.currentLang] || I18N.id;
  const cityFilter = citySelect.value;
  const items = state.appData.stores.filter((s) => cityFilter === 'Semua' || s.wilayah === cityFilter);

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3 style="font-size:1.1rem;">Belum ada gerai tercatat untuk wilayah ini.</h3>
      </div>
    `;
    return;
  }

  grid.innerHTML = items
    .map((s) => {
      const wished = isWishlisted(s.id, 'gerai');
      const waUrl = buildDemoWhatsAppUrl(s.nama, s.kontak);
      return `
        <article class="surface-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:1rem;">
          <div style="display:flex;flex-direction:column;gap:0.75rem;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
              <span class="meta-line">${escapeHtml(s.wilayah)} · Gerai Mitra</span>
              <button
                type="button"
                class="icon-btn"
                style="min-width:34px;min-height:34px;"
                data-action="toggle-wish"
                data-type="gerai"
                data-id="${escapeHtml(s.id)}"
                aria-label="Simpan ${escapeHtml(s.nama)} ke Beauty Bag"
              >${wished ? '💖' : '🤍'}</button>
            </div>

            <h3 style="font-size:1.12rem;line-height:1.3;">${escapeHtml(s.nama)}</h3>
            <p style="font-size:0.8rem;color:var(--text-secondary);">${escapeHtml(s.alamat)}</p>

            <div>
              <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:0.25rem;">Brand Tersedia</div>
              <p style="font-size:0.8rem;font-weight:600;color:var(--text-primary);">${escapeHtml((s.brandTersedia || []).join(' · '))}</p>
            </div>

            <div>
              <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:0.25rem;">Fasilitas Gerai</div>
              <p style="font-size:0.78rem;color:var(--accent-primary-hover);">${escapeHtml((s.layanan || []).join(' · '))}</p>
            </div>

            <!-- Unique Store QR Code Strip -->
            <div class="store-qr-strip">
              <div class="store-qr-thumb">
                <canvas
                  class="store-card-qr"
                  data-store-id="${escapeHtml(s.id)}"
                  aria-label="QR Code untuk ${escapeHtml(s.nama)}"
                ></canvas>
              </div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:0.74rem;font-weight:700;color:var(--text-primary);">QR Detail &amp; Kontak WA</div>
                <div style="font-size:0.7rem;color:var(--text-secondary);line-height:1.35;">
                  Pindai untuk detail gerai, lokasi &amp; kontak Beauty Advisor.
                </div>
              </div>
              <button
                type="button"
                class="btn btn-outline"
                style="min-height:34px;padding:0.35rem 0.7rem;"
                data-action="open-store-qr"
                data-id="${escapeHtml(s.id)}"
              >
                ${escapeHtml(dict.qrBtnLabel || 'QR Gerai')}
              </button>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;padding-top:0.85rem;border-top:1px solid var(--border-hairline);">
            <a href="${escapeHtml(s.mapsUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
              Google Maps
            </a>
            <a href="${escapeHtml(waUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-dark">
              WA Advisor (Demo)
            </a>
          </div>
        </article>
      `;
    })
    .join('');

  // Render each store's unique QR code onto its thumbnail canvas
  grid.querySelectorAll('.store-card-qr').forEach((canvasEl) => {
    const storeId = canvasEl.getAttribute('data-store-id');
    const store = state.appData.stores.find((st) => st.id === storeId);
    if (!store) return;
    const payload = buildStoreQrPayload(store, 'details');
    renderQrToCanvas(canvasEl, payload, 128);
  });
}

export function openStoreQrModal(storeId, mode = 'details') {
  const store = state.appData.stores.find((s) => s.id === storeId);
  const modal = document.getElementById('store-qr-modal');
  const body = document.getElementById('store-qr-modal-body');
  if (!store || !modal || !body) return;

  const dict = I18N[state.currentLang] || I18N.id;
  const payload = buildStoreQrPayload(store, mode);
  const waUrl = buildDemoWhatsAppUrl(store.nama, store.kontak);
  const hintText =
    mode === 'whatsapp'
      ? state.currentLang === 'en'
        ? 'Scan to open WhatsApp Beauty Advisor chat directly.'
        : 'Pindai QR ini untuk langsung membuka chat WhatsApp Beauty Advisor.'
      : state.currentLang === 'en'
      ? 'Scan to open this store profile with address, brands, and WhatsApp link.'
      : 'Pindai QR ini untuk membuka detail gerai, daftar brand, dan kontak WhatsApp.';

  body.innerHTML = `
    <div class="modal-banner">
      <div>
        <span style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.9;">
          ${escapeHtml(dict.qrModalKicker || 'QR Code Gerai Aceh')} · ${escapeHtml(store.wilayah)}
        </span>
        <h2>${escapeHtml(store.nama)}</h2>
      </div>
      <button type="button" class="close-circle-btn" data-action="close-store-qr" aria-label="Tutup QR Code">✕</button>
    </div>

    <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1rem;font-size:0.82rem;">
      <!-- Mode Toggle -->
      <div class="segmented-control" role="tablist" aria-label="Mode QR Code">
        <button
          type="button"
          class="${mode === 'details' ? 'is-active' : ''}"
          data-action="switch-qr-mode"
          data-id="${escapeHtml(store.id)}"
          data-mode="details"
        >
          ${escapeHtml(dict.qrModeDetails || 'Detail & Kontak Gerai')}
        </button>
        <button
          type="button"
          class="${mode === 'whatsapp' ? 'is-active' : ''}"
          data-action="switch-qr-mode"
          data-id="${escapeHtml(store.id)}"
          data-mode="whatsapp"
        >
          ${escapeHtml(dict.qrModeWhatsapp || 'Langsung WhatsApp')}
        </button>
      </div>

      <!-- Large High-Contrast QR Stage -->
      <div class="store-qr-stage">
        <div class="store-qr-canvas-frame">
          <canvas id="store-qr-modal-canvas" aria-label="QR Code ${escapeHtml(store.nama)}"></canvas>
        </div>
        <p style="font-size:0.75rem;color:var(--text-secondary);text-align:center;max-width:34ch;">
          ${escapeHtml(hintText)}
        </p>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;justify-content:center;width:100%;">
          <button
            type="button"
            class="btn btn-primary"
            data-action="download-store-qr"
            data-id="${escapeHtml(store.id)}"
            data-mode="${escapeHtml(mode)}"
          >
            ${escapeHtml(dict.qrDownloadBtn || 'Unduh QR (.PNG)')}
          </button>
          <button
            type="button"
            class="btn btn-outline"
            data-action="copy-store-qr"
            data-id="${escapeHtml(store.id)}"
            data-mode="${escapeHtml(mode)}"
          >
            ${escapeHtml(dict.qrCopyLinkBtn || 'Salin Tautan')}
          </button>
        </div>
      </div>

      <!-- Store Details & Contact Summary -->
      <div class="surface-card surface-card--subtle" style="padding:0.95rem 1rem;display:flex;flex-direction:column;gap:0.45rem;">
        <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);">
          Detail Lokasi &amp; Kontak
        </div>
        <p style="font-size:0.8rem;color:var(--text-primary);">${escapeHtml(store.alamat)}</p>
        <p style="font-size:0.76rem;color:var(--text-secondary);">
          <strong>Brand:</strong> ${escapeHtml((store.brandTersedia || []).join(' · '))}
        </p>
        <p style="font-size:0.76rem;color:var(--text-secondary);">
          <strong>WhatsApp:</strong> <span class="font-mono-num">+${escapeHtml(store.kontak)}</span>
        </p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
        <a href="${escapeHtml(store.mapsUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-subtle">
          Buka Google Maps
        </a>
        <a href="${escapeHtml(waUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-dark">
          Chat WA Advisor
        </a>
      </div>
    </div>
  `;

  modal.classList.remove('is-hidden');

  const modalCanvas = document.getElementById('store-qr-modal-canvas');
  if (modalCanvas) {
    renderQrToCanvas(modalCanvas, payload, 210);
  }
}

export function closeStoreQrModal() {
  const modal = document.getElementById('store-qr-modal');
  if (modal) modal.classList.add('is-hidden');
}

export function downloadStoreQr(storeId, mode = 'details') {
  const store = state.appData.stores.find((s) => s.id === storeId);
  const canvasEl = document.getElementById('store-qr-modal-canvas');
  if (!store || !canvasEl) return;

  const slug = store.wilayah.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const filename = `qr-${slug}-${store.id}-${mode}.png`;
  downloadCanvasAsPng(canvasEl, filename);
  showToast(`QR Code ${store.nama} berhasil diunduh.`);
}

export async function copyStoreQrLink(storeId, mode = 'details') {
  const store = state.appData.stores.find((s) => s.id === storeId);
  if (!store) return;

  const payload = buildStoreQrPayload(store, mode);
  await copyTextToClipboard(payload);
  showToast('Tautan QR gerai berhasil disalin.');
}
