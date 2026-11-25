// Store Curator & Manager CRUD Dashboard (Products with Photo Upload, Aceh Stores, Bundles & Orders)

import { state, persistAppData, persistOrders, resetAppDataToDefault } from '../state/store.js';
import { escapeHtml, formatRupiah, showToast } from '../utils/format.js';
import { getProductVisualSrc, getProductFallbackSrc, getProductGallerySrcs } from '../utils/productArt.js';
import { attachImageFallbacks } from './catalogView.js';
import { renderCustomerOrders } from './cartCheckout.js';

export function switchAdminEntity(entity) {
  state.activeAdminEntity = entity;
  state.editingEntityId = null;

  document.querySelectorAll('[data-action="admin-entity"]').forEach((btn) => {
    const isMatch = btn.getAttribute('data-entity') === entity;
    btn.className = isMatch ? 'btn btn-primary' : 'btn btn-subtle';
  });

  renderAdminDashboard();
}

export function resetAdminForm() {
  state.editingEntityId = null;
  renderAdminForm();
}

export function renderAdminDashboard() {
  const formCol = document.getElementById('admin-form-col');
  const listCol = document.getElementById('admin-list-col');
  if (!formCol || !listCol) return;

  if (state.activeAdminEntity === 'orders') {
    formCol.classList.add('is-hidden');
    listCol.className = 'col-12';
    renderAdminOrdersList();
    return;
  }

  formCol.classList.remove('is-hidden');
  listCol.className = 'col-7';
  renderAdminForm();
  renderAdminList();
}

function formatShadesForInput(shades = []) {
  if (!Array.isArray(shades) || shades.length === 0) return '';
  return shades.map((s) => `${s.name}:${s.hex}`).join(', ');
}

function parseShadesInput(raw) {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(',')
    .map((part) => {
      const [namePart, hexPart] = part.split(':').map((s) => (s || '').trim());
      if (!namePart) return null;
      const validHex = /^#[0-9A-Fa-f]{3,6}$/.test(hexPart) ? hexPart : '#E11D74';
      return { name: namePart, hex: validHex };
    })
    .filter(Boolean);
}

export function renderAdminForm(itemToEdit = null) {
  const form = document.getElementById('admin-crud-form');
  const titleEl = document.getElementById('admin-form-title');
  if (!form || !titleEl) return;

  const isEdit = Boolean(itemToEdit);
  const cityOptions = ['Banda Aceh', 'Aceh Besar', 'Lhokseumawe', 'Takengon', 'Meulaboh']
    .map((r) => `<option value="${r}" ${itemToEdit && itemToEdit.wilayah === r ? 'selected' : ''}>${r}</option>`)
    .join('');

  if (state.activeAdminEntity === 'products') {
    titleEl.textContent = isEdit ? 'Edit Produk & Foto Brand' : 'Tambah Produk & Foto Brand Baru';
    const cats = ['Skincare', 'Complexion', 'Lip', 'Eye & Brow', 'Micellar & Remover']
      .map((c) => `<option value="${c}" ${itemToEdit && itemToEdit.kategori === c ? 'selected' : ''}>${c}</option>`)
      .join('');

    const initialUrls = (() => {
      if (!itemToEdit) return [''];
      const list = [];
      if (Array.isArray(itemToEdit.imageUrls)) {
        itemToEdit.imageUrls.forEach((u) => {
          if (typeof u === 'string' && u.trim()) list.push(u.trim());
        });
      }
      if (typeof itemToEdit.imageUrl === 'string' && itemToEdit.imageUrl.trim()) {
        const primary = itemToEdit.imageUrl.trim();
        if (!list.includes(primary)) list.unshift(primary);
      }
      return list.length > 0 ? list : [''];
    })();

    const previewProduct = itemToEdit || {
      brand: 'Wardah',
      kategori: 'Skincare',
      subKategori: 'Serum',
      artAccent: '#E11D74',
      artBg: '#FCE7F3'
    };
    const fallbackSrc = getProductFallbackSrc(previewProduct);
    const activeUrlCount = initialUrls.filter((u) => u.trim()).length;

    form.innerHTML = `
      <!-- Multi-URL Product Photo Links Block -->
      <div class="photo-uploader" data-fallback-svg="${escapeHtml(fallbackSrc)}">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:0.5rem;">
          <div>
            <div style="font-weight:700;font-size:0.8rem;">Link Foto Produk (URL)</div>
            <div id="admin-prod-photo-status" style="font-size:0.72rem;color:var(--text-secondary);">
              ${
                activeUrlCount > 0
                  ? `${activeUrlCount} tautan foto aktif (Foto #1 sebagai foto utama).`
                  : 'Tempel tautan foto produk (opsional) atau gunakan ilustrasi studio bawaan.'
              }
            </div>
          </div>
          <div style="display:flex;gap:0.35rem;">
            <button
              type="button"
              class="btn btn-primary"
              style="min-height:32px;padding:0.3rem 0.65rem;"
              data-action="admin-add-photo-url"
            >
              + Tambah Link Foto
            </button>
            <button
              type="button"
              class="btn btn-subtle"
              style="min-height:32px;padding:0.3rem 0.6rem;"
              data-action="admin-clear-photo"
            >
              Reset
            </button>
          </div>
        </div>

        <div id="admin-photo-urls-list" class="photo-url-list">
          ${initialUrls.map((url, idx) => renderPhotoUrlRowHtml(url, idx, fallbackSrc)).join('')}
        </div>
      </div>

      <div class="grid-2" style="gap:0.75rem;">
        <div>
          <label class="field-label">Brand *</label>
          <input class="input" required name="brand" value="${escapeHtml(itemToEdit ? itemToEdit.brand : 'Wardah')}" />
        </div>
        <div>
          <label class="field-label">Kategori</label>
          <select class="select" name="kategori">${cats}</select>
        </div>
      </div>

      <div>
        <label class="field-label">Nama Produk Lengkap *</label>
        <input class="input" required name="nama" value="${escapeHtml(itemToEdit ? itemToEdit.nama : '')}" />
      </div>

      <div class="grid-2" style="gap:0.75rem;">
        <div>
          <label class="field-label">Sub-Kategori</label>
          <input class="input" name="subKategori" value="${escapeHtml(itemToEdit ? itemToEdit.subKategori || '' : 'Serum')}" />
        </div>
        <div>
          <label class="field-label">Harga Simulasi (Rp)</label>
          <input class="input tabular-nums" type="number" name="harga" min="0" value="${itemToEdit ? Number(itemToEdit.harga) : 115000}" />
        </div>
      </div>

      <div>
        <label class="field-label">Status Verifikasi Halal</label>
        <select class="select" name="statusHalal">
          <option value="Tersertifikasi Halal BPJPH/MUI" ${itemToEdit && itemToEdit.statusHalal.includes('Tersertifikasi') ? 'selected' : ''}>Tersertifikasi Halal BPJPH/MUI</option>
          <option value="Muslim-Friendly (Klaim Bebas Alkohol & Hewani)" ${itemToEdit && itemToEdit.statusHalal.includes('Muslim-Friendly') ? 'selected' : ''}>Muslim-Friendly (Klaim Non-Sertifikasi)</option>
        </select>
      </div>

      <div class="grid-2" style="gap:0.75rem;">
        <div>
          <label class="field-label">Nomor Halal (Simulasi)</label>
          <input class="input" name="nomorHalal" value="${escapeHtml(itemToEdit ? itemToEdit.nomorHalal || '' : 'ID00410000999 (Simulasi)')}" />
        </div>
        <div>
          <label class="field-label">Nomor BPOM (Simulasi)</label>
          <input class="input" name="nomorBpom" value="${escapeHtml(itemToEdit ? itemToEdit.nomorBpom : 'NA18260100001 (Simulasi)')}" />
        </div>
      </div>

      <div>
        <span class="field-label">Cocok Untuk Jenis Kulit</span>
        <div class="checkbox-grid">
          ${skinOptions
            .map(
              (skin) => `
            <label class="checkbox-chip">
              <input type="checkbox" name="jenisKulit" value="${escapeHtml(skin)}" ${selectedSkins.includes(skin) ? 'checked' : ''} />
              <span>${escapeHtml(skin)}</span>
            </label>`
            )
            .join('')}
        </div>
      </div>

      <div>
        <label class="field-label">Kandungan Utama (pisahkan koma)</label>
        <input class="input" name="kandunganUtama" value="${escapeHtml(itemToEdit ? (itemToEdit.kandunganUtama || []).join(', ') : 'Niacinamide, Centella Asiatica, Vitamin E')}" />
      </div>

      <div>
        <label class="field-label">Pilihan Shade / Varian (format: Nama:#HEX, pisahkan koma)</label>
        <input class="input" name="shadesInput" value="${escapeHtml(itemToEdit ? formatShadesForInput(itemToEdit.shades) : '')}" placeholder="Contoh: 22N Light Ivory:#ECC3A8, 32N Neutral Beige:#DBA57D" />
      </div>

      <div>
        <label class="field-label">Keterangan Ramah Wudhu &amp; Pembersihan</label>
        <textarea class="textarea" name="infoWudhu" rows="2">${escapeHtml(itemToEdit ? itemToEdit.infoWudhu || '' : 'Dapat dibersihkan menggunakan micellar water atau facial wash sebelum berwudhu.')}</textarea>
      </div>

      <div>
        <label class="field-label">Gerai Aceh Tersedia (pisahkan koma)</label>
        <input class="input" name="geraiTersedia" value="${escapeHtml(itemToEdit ? (itemToEdit.geraiTersedia || []).join(', ') : 'Suzuya Mall Banda Aceh, Hermes Palace Mall')}" />
      </div>

      <div>
        <label class="field-label">Deskripsi Produk *</label>
        <textarea class="textarea" required name="deskripsi" rows="2">${escapeHtml(itemToEdit ? itemToEdit.deskripsi : '')}</textarea>
      </div>

      <button type="submit" class="btn btn-primary btn-block">
        ${isEdit ? 'Simpan Perubahan Produk' : '+ Tambahkan Produk ke Katalog'}
      </button>
    `;

    attachImageFallbacks(form);
  } else if (state.activeAdminEntity === 'stores') {
    titleEl.textContent = isEdit ? 'Edit Gerai Mitra Aceh' : 'Tambah Gerai Mitra Aceh';
    form.innerHTML = `
      <div>
        <label class="field-label">Nama Gerai / Apotek *</label>
        <input class="input" required name="nama" value="${escapeHtml(itemToEdit ? itemToEdit.nama : '')}" />
      </div>
      <div>
        <label class="field-label">Kota / Kabupaten</label>
        <select class="select" name="wilayah">${cityOptions}</select>
      </div>
      <div>
        <label class="field-label">Alamat Lengkap (Simulasi) *</label>
        <input class="input" required name="alamat" value="${escapeHtml(itemToEdit ? itemToEdit.alamat : '')}" />
      </div>
      <div>
        <label class="field-label">Brand Tersedia (pisahkan koma)</label>
        <input class="input" name="brandTersedia" value="${escapeHtml(itemToEdit ? (itemToEdit.brandTersedia || []).join(', ') : 'Wardah, Make Over, Skintific, Azarine')}" />
      </div>
      <div>
        <label class="field-label">Fasilitas Gerai (pisahkan koma)</label>
        <input class="input" name="layanan" value="${escapeHtml(itemToEdit ? (itemToEdit.layanan || []).join(', ') : 'Tester Produk, Konsultasi Beauty Advisor, Mushalla Terdekat')}" />
      </div>
      <div>
        <label class="field-label">Nomor WA Simulasi (628...)</label>
        <input class="input" name="kontak" value="${escapeHtml(itemToEdit ? itemToEdit.kontak : '6281200005599')}" />
      </div>
      <button type="submit" class="btn btn-primary btn-block">
        ${isEdit ? 'Simpan Perubahan Gerai' : '+ Tambahkan Gerai Mitra'}
      </button>
    `;
  } else if (state.activeAdminEntity === 'bundles') {
    titleEl.textContent = isEdit ? 'Edit Paket Rekomendasi' : 'Tambah Paket Rekomendasi';
    const skinOpts = ['Semua Jenis Kulit', 'Berminyak', 'Kering', 'Kombinasi', 'Sensitif']
      .map((s) => `<option value="${s}" ${itemToEdit && itemToEdit.jenisKulit === s ? 'selected' : ''}>${s}</option>`)
      .join('');
    const focusOpts = ['Daily Natural Makeup', 'Acne & Oil Control', 'Brightening & Hydration', 'Bridal & Acara Adat']
      .map((f) => `<option value="${f}" ${itemToEdit && itemToEdit.fokus === f ? 'selected' : ''}>${f}</option>`)
      .join('');

    const selectedProds = itemToEdit && Array.isArray(itemToEdit.daftarProduk)
      ? itemToEdit.daftarProduk
      : state.appData.products.slice(0, 3).map((p) => p.id);

    form.innerHTML = `
      <div>
        <label class="field-label">Nama Paket *</label>
        <input class="input" required name="nama" value="${escapeHtml(itemToEdit ? itemToEdit.nama : '')}" />
      </div>
      <div class="grid-2" style="gap:0.75rem;">
        <div>
          <label class="field-label">Jenis Kulit</label>
          <select class="select" name="jenisKulit">${skinOpts}</select>
        </div>
        <div>
          <label class="field-label">Fokus Paket</label>
          <select class="select" name="fokus">${focusOpts}</select>
        </div>
      </div>
      <div>
        <label class="field-label">Estimasi Total Harga (Rp - Simulasi)</label>
        <input class="input tabular-nums" type="number" name="estimasiBiaya" min="0" value="${itemToEdit ? Number(itemToEdit.estimasiBiaya) : 320000}" />
      </div>
      <div>
        <span class="field-label">Produk dalam Paket</span>
        <div style="max-height:140px;overflow-y:auto;padding:0.65rem;border-radius:var(--radius-md);border:1px solid var(--border-hairline);background:var(--bg-subtle);display:flex;flex-direction:column;gap:0.35rem;">
          ${state.appData.products
            .map(
              (p) => `
            <label style="display:flex;align-items:center;gap:0.45rem;font-size:0.75rem;cursor:pointer;">
              <input type="checkbox" name="daftarProduk" value="${escapeHtml(p.id)}" ${selectedProds.includes(p.id) ? 'checked' : ''} style="accent-color:var(--accent-primary);" />
              <span>[${escapeHtml(p.brand)}] ${escapeHtml(p.nama)}</span>
            </label>`
            )
            .join('')}
        </div>
      </div>
      <div>
        <label class="field-label">Deskripsi Paket *</label>
        <textarea class="textarea" required name="deskripsi" rows="2">${escapeHtml(itemToEdit ? itemToEdit.deskripsi : '')}</textarea>
      </div>
      <button type="submit" class="btn btn-primary btn-block">
        ${isEdit ? 'Simpan Perubahan Paket' : '+ Tambahkan Paket'}
      </button>
    `;
  }
}

function renderPhotoUrlRowHtml(url, idx, fallbackSrc) {
  const trimmed = (url || '').trim();
  const thumbSrc = trimmed || fallbackSrc;
  return `
    <div class="photo-url-row">
      <img
        class="photo-url-thumb"
        src="${escapeHtml(thumbSrc)}"
        data-fallback="${escapeHtml(fallbackSrc)}"
        alt="Preview Foto ${idx + 1}"
        referrerpolicy="no-referrer"
      />
      <div class="photo-url-row__input-wrap">
        <span class="photo-url-tag">${idx === 0 ? 'Foto Utama (#1)' : `Foto Galeri #${idx + 1}`}</span>
        <input
          class="input"
          type="url"
          name="imageUrls"
          value="${escapeHtml(trimmed)}"
          placeholder="https://contoh.com/foto-produk-${idx + 1}.jpg"
          data-action="admin-photo-url-input"
          style="font-size:0.76rem;padding:0.4rem 0.65rem;"
        />
      </div>
      ${
        idx > 0
          ? `<button type="button" class="photo-url-btn" data-action="admin-promote-photo-url" title="Jadikan Foto Utama" aria-label="Jadikan Foto Utama">↑</button>`
          : ''
      }
      <button type="button" class="photo-url-btn" data-action="admin-remove-photo-url" title="Hapus baris link foto" aria-label="Hapus link foto">✕</button>
    </div>
  `;
}

function getPhotoUploaderFallback() {
  const box = document.querySelector('#admin-crud-form .photo-uploader');
  return box?.getAttribute('data-fallback-svg') || '';
}

function refreshPhotoUrlRows(urls) {
  const listEl = document.getElementById('admin-photo-urls-list');
  if (!listEl) return;
  const fallbackSrc = getPhotoUploaderFallback();
  const safeList = urls.length > 0 ? urls : [''];
  listEl.innerHTML = safeList.map((u, idx) => renderPhotoUrlRowHtml(u, idx, fallbackSrc)).join('');
  attachImageFallbacks(listEl);
  updatePhotoUrlStatus();
}

function getCurrentPhotoUrlInputs() {
  return Array.from(document.querySelectorAll('#admin-photo-urls-list input[name="imageUrls"]')).map((el) =>
    el instanceof HTMLInputElement ? el.value : ''
  );
}

function updatePhotoUrlStatus() {
  const statusEl = document.getElementById('admin-prod-photo-status');
  if (!statusEl) return;
  const activeCount = getCurrentPhotoUrlInputs().filter((u) => u.trim()).length;
  statusEl.textContent =
    activeCount > 0
      ? `${activeCount} tautan foto aktif (Foto #1 sebagai foto utama).`
      : 'Tempel tautan foto produk (opsional) atau gunakan ilustrasi studio bawaan.';
}

export function addProductPhotoUrlRow() {
  const listEl = document.getElementById('admin-photo-urls-list');
  if (!listEl) return;
  const current = getCurrentPhotoUrlInputs();
  current.push('');
  refreshPhotoUrlRows(current);
  const inputs = listEl.querySelectorAll('input[name="imageUrls"]');
  const lastInput = inputs[inputs.length - 1];
  if (lastInput instanceof HTMLInputElement) {
    lastInput.focus();
  }
}

export function removeProductPhotoUrlRow(triggerEl) {
  const row = triggerEl.closest('.photo-url-row');
  const listEl = document.getElementById('admin-photo-urls-list');
  if (!row || !listEl) return;
  const rows = Array.from(listEl.querySelectorAll('.photo-url-row'));
  const idx = rows.indexOf(row);
  const current = getCurrentPhotoUrlInputs();
  if (idx >= 0) current.splice(idx, 1);
  refreshPhotoUrlRows(current);
}

export function promoteProductPhotoUrlRow(triggerEl) {
  const row = triggerEl.closest('.photo-url-row');
  const listEl = document.getElementById('admin-photo-urls-list');
  if (!row || !listEl) return;
  const rows = Array.from(listEl.querySelectorAll('.photo-url-row'));
  const idx = rows.indexOf(row);
  if (idx <= 0) return;
  const current = getCurrentPhotoUrlInputs();
  const [chosen] = current.splice(idx, 1);
  current.unshift(chosen);
  refreshPhotoUrlRows(current);
}

export function handleProductPhotoUrlInput(inputEl) {
  const row = inputEl.closest('.photo-url-row');
  const fallbackSrc = getPhotoUploaderFallback();
  const thumb = row ? row.querySelector('.photo-url-thumb') : null;
  if (thumb instanceof HTMLImageElement) {
    const val = inputEl.value.trim();
    thumb.src = val || fallbackSrc;
  }
  updatePhotoUrlStatus();
}

export function clearProductPhotoInput() {
  refreshPhotoUrlRows(['']);
  showToast('Daftar link foto direset ke ilustrasi studio.', 'warn');
}

export function handleAdminFormSubmit(formElement) {
  const fd = new FormData(formElement);

  if (state.activeAdminEntity === 'products') {
    const existing = state.editingEntityId
      ? state.appData.products.find((p) => p.id === state.editingEntityId)
      : null;

    const statusHalal = String(fd.get('statusHalal') || 'Tersertifikasi Halal BPJPH/MUI');
    const jenisKulitList = fd.getAll('jenisKulit').map((v) => String(v));
    const shadesParsed = parseShadesInput(String(fd.get('shadesInput') || ''));
    const kandunganList = String(fd.get('kandunganUtama') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const rawUrls = fd
      .getAll('imageUrls')
      .map((u) => String(u || '').trim())
      .filter(Boolean);
    const uniqueUrls = Array.from(new Set(rawUrls));

    const record = {
      id: state.editingEntityId || 'prod-' + Date.now(),
      brand: String(fd.get('brand') || ''),
      nama: String(fd.get('nama') || ''),
      kategori: String(fd.get('kategori') || 'Skincare'),
      subKategori: String(fd.get('subKategori') || fd.get('kategori') || 'Skincare'),
      harga: Number(fd.get('harga')) || 0,
      artAccent: existing?.artAccent || '#E11D74',
      artBg: existing?.artBg || '#FCE7F3',
      statusHalal,
      nomorHalal:
        String(fd.get('nomorHalal') || '').trim() ||
        (statusHalal.includes('Tersertifikasi') ? 'ID00410000999 (Simulasi)' : 'Klaim Muslim-Friendly'),
      nomorBpom: String(fd.get('nomorBpom') || 'NA18260000000 (Simulasi)'),
      imageUrl: uniqueUrls[0] || '',
      imageUrls: uniqueUrls,
      jenisKulit: jenisKulitList.length > 0 ? jenisKulitList : ['Semua Jenis Kulit'],
      infoWudhu:
        String(fd.get('infoWudhu') || '').trim() ||
        'Dapat dibersihkan menggunakan micellar water atau facial wash sebelum berwudhu.',
      kandunganUtama: kandunganList.length > 0 ? kandunganList : ['Niacinamide', 'Vitamin E'],
      shades: shadesParsed,
      geraiTersedia: String(fd.get('geraiTersedia') || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      deskripsi: String(fd.get('deskripsi') || ''),
      unggulan: existing ? existing.unggulan : true
    };
    upsertEntity('products', record);
  } else if (state.activeAdminEntity === 'stores') {
    const nama = String(fd.get('nama') || '');
    const wilayah = String(fd.get('wilayah') || 'Banda Aceh');
    const layananList = String(fd.get('layanan') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const record = {
      id: state.editingEntityId || 'str-' + Date.now(),
      nama,
      wilayah,
      alamat: String(fd.get('alamat') || ''),
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nama + ' ' + wilayah)}`,
      brandTersedia: String(fd.get('brandTersedia') || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      layanan: layananList.length > 0 ? layananList : ['Tester Produk', 'Konsultasi Beauty Advisor'],
      kontak: String(fd.get('kontak') || '6281200005599')
    };
    upsertEntity('stores', record);
  } else if (state.activeAdminEntity === 'bundles') {
    const prodIds = fd.getAll('daftarProduk').map((v) => String(v));
    const record = {
      id: state.editingEntityId || 'bnd-' + Date.now(),
      nama: String(fd.get('nama') || ''),
      jenisKulit: String(fd.get('jenisKulit') || 'Semua Jenis Kulit'),
      fokus: String(fd.get('fokus') || 'Daily Natural Makeup'),
      estimasiBiaya: Number(fd.get('estimasiBiaya')) || 0,
      deskripsi: String(fd.get('deskripsi') || ''),
      daftarProduk: prodIds.length > 0 ? prodIds : state.appData.products.slice(0, 3).map((p) => p.id)
    };
    upsertEntity('bundles', record);
  }

  state.editingEntityId = null;
  renderAdminDashboard();
}

function upsertEntity(collectionName, record) {
  const list = state.appData[collectionName];
  const idx = list.findIndex((item) => item.id === record.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...record };
    showToast('Data berhasil diperbarui.');
  } else {
    list.unshift(record);
    showToast('Data baru berhasil ditambahkan.');
  }
  persistAppData();
}

export function editAdminItem(id) {
  const item = (state.appData[state.activeAdminEntity] || []).find((x) => x.id === id);
  if (!item) return;
  state.editingEntityId = id;
  renderAdminForm(item);

  const formCol = document.getElementById('admin-form-col');
  if (formCol) {
    formCol.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

export function deleteAdminItem(id) {
  state.appData[state.activeAdminEntity] = (state.appData[state.activeAdminEntity] || []).filter((x) => x.id !== id);
  persistAppData();
  renderAdminDashboard();
  showToast('Data berhasil dihapus.', 'warn');
}

export function renderAdminList() {
  const titleEl = document.getElementById('admin-list-title');
  const countEl = document.getElementById('admin-count-label');
  const container = document.getElementById('admin-items-list');
  if (!container) return;

  if (titleEl) {
    titleEl.textContent =
      state.activeAdminEntity === 'products'
        ? 'Daftar Produk Aktif'
        : state.activeAdminEntity === 'stores'
        ? 'Daftar Gerai Mitra Aceh'
        : 'Daftar Paket Rekomendasi';
  }

  const list = state.appData[state.activeAdminEntity] || [];
  if (countEl) countEl.textContent = `${list.length} item`;

  container.innerHTML = list
    .map((item) => {
      const isProduct = state.activeAdminEntity === 'products';
      const subInfo = isProduct
        ? `${item.brand} · ${item.kategori} · ${formatRupiah(item.harga)}`
        : item.wilayah
        ? `${item.wilayah} · ${item.alamat}`
        : `${item.jenisKulit} · ${item.fokus} · ${formatRupiah(item.estimasiBiaya)}`;

      const thumbHtml = isProduct
        ? `<img
            class="admin-list-thumb"
            src="${escapeHtml(getProductVisualSrc(item))}"
            data-fallback="${escapeHtml(getProductFallbackSrc(item))}"
            alt="${escapeHtml(item.nama)}"
            referrerpolicy="no-referrer"
          />`
        : '';

      const customUrlCount = isProduct
        ? getProductGallerySrcs(item).filter((src) => !src.startsWith('data:image/svg+xml')).length
        : 0;

      const photoBadge = isProduct
        ? `<span style="font-size:0.68rem;font-weight:700;color:${customUrlCount > 0 ? 'var(--accent-primary)' : 'var(--text-muted)'};">
            ${customUrlCount > 0 ? `· ${customUrlCount} Foto URL` : '· Studio SVG'}
          </span>`
        : '';

      return `
        <div class="routine-item-row">
          <div style="display:flex;align-items:center;gap:0.75rem;flex:1;min-width:180px;">
            ${thumbHtml}
            <div style="min-width:0;">
              <div style="font-weight:700;font-size:0.88rem;">${escapeHtml(item.nama)}</div>
              <div class="tabular-nums" style="font-size:0.75rem;color:var(--text-secondary);">
                ${escapeHtml(subInfo)} ${photoBadge}
              </div>
            </div>
          </div>
          <div style="display:flex;gap:0.4rem;flex-shrink:0;">
            <button type="button" class="btn btn-outline" style="min-height:34px;padding:0.3rem 0.75rem;" data-action="admin-edit" data-id="${escapeHtml(item.id)}">Edit</button>
            <button type="button" class="btn btn-dark" style="min-height:34px;padding:0.3rem 0.75rem;" data-action="admin-delete" data-id="${escapeHtml(item.id)}">Hapus</button>
          </div>
        </div>
      `;
    })
    .join('');

  attachImageFallbacks(container);
}

export function renderAdminOrdersList() {
  const titleEl = document.getElementById('admin-list-title');
  const countEl = document.getElementById('admin-count-label');
  const container = document.getElementById('admin-items-list');
  if (!container) return;

  if (titleEl) titleEl.textContent = 'Daftar Transaksi Checkout Pelanggan (Simulasi)';
  if (countEl) countEl.textContent = `${state.orderHistory.length} transaksi`;

  if (state.orderHistory.length === 0) {
    container.innerHTML = `<p style="font-size:0.82rem;color:var(--text-muted);font-style:italic;padding:2rem 0;text-align:center;">Belum ada transaksi checkout masuk.</p>`;
    return;
  }

  container.innerHTML = state.orderHistory
    .map(
      (o) => `
      <div class="routine-item-row">
        <div style="flex:1;min-width:200px;">
          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem;">
            <span class="font-mono-num" style="font-weight:700;font-size:0.85rem;">${escapeHtml(o.invoiceId)}</span>
            <span style="font-size:0.74rem;color:var(--text-secondary);">(${escapeHtml(o.tanggal)})</span>
          </div>
          <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:0.2rem;">
            Pembeli: <strong>${escapeHtml(o.buyerName)}</strong> · ${escapeHtml(o.paymentMethod)} ·
            Total: <strong class="tabular-nums" style="color:var(--accent-primary);">${formatRupiah(o.grandTotal)}</strong>
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:0.45rem;">
          <select class="select" style="width:auto;padding:0.35rem 0.65rem;font-size:0.75rem;" data-action="admin-order-status" data-id="${escapeHtml(o.invoiceId)}">
            <option value="Pembayaran Simulasi Terverifikasi" ${o.status === 'Pembayaran Simulasi Terverifikasi' ? 'selected' : ''}>Terverifikasi</option>
            <option value="Sedang Disiapkan Gerai Aceh" ${o.status === 'Sedang Disiapkan Gerai Aceh' ? 'selected' : ''}>Disiapkan Gerai</option>
            <option value="Siap Diambil / Dalam Pengiriman" ${o.status === 'Siap Diambil / Dalam Pengiriman' ? 'selected' : ''}>Siap Diambil / Dikirim</option>
            <option value="Selesai" ${o.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
          </select>
          <button type="button" class="btn btn-primary" style="min-height:34px;padding:0.3rem 0.75rem;" data-action="open-invoice" data-id="${escapeHtml(o.invoiceId)}">Invoice</button>
        </div>
      </div>
    `
    )
    .join('');
}

export function updateOrderStatus(invoiceId, newStatus) {
  const order = state.orderHistory.find((o) => o.invoiceId === invoiceId);
  if (!order) return;
  order.status = newStatus;
  persistOrders();
  renderCustomerOrders();
  showToast(`Status ${invoiceId} diperbarui menjadi "${newStatus}".`);
}

export function handleResetDefaultData() {
  resetAppDataToDefault();
  renderAdminDashboard();
  showToast('Seluruh katalog brand & gerai dikembalikan ke data awal.');
}
