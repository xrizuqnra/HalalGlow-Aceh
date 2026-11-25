// Beauty Routine Planner & Shopping Budget Calculator

import { state, persistActiveRoutine, persistSavedRoutines } from '../state/store.js';
import { escapeHtml, formatRupiah, showToast } from '../utils/format.js';

export function addProductToRoutine(prodId, explicitSlot = null) {
  const p = state.appData.products.find((item) => item.id === prodId);
  if (!p) return;

  let slot = explicitSlot || 'AM';
  if (!explicitSlot) {
    if (p.kategori === 'Micellar & Remover') slot = 'WUDHU';
    else if (p.kategori === 'Complexion' || p.kategori === 'Lip' || p.kategori === 'Eye & Brow') slot = 'MAKEUP';
    else if (p.subKategori === 'Serum') slot = 'PM';
  }

  state.activeRoutine.daftarItem.push({
    uid: 'item-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
    slot,
    prodId: p.id,
    note: 'Urutan pemakaian harian'
  });
  persistActiveRoutine();
  showToast(`"${p.nama}" ditambahkan ke Routine Planner (${slot}).`);
}

export function loadBundleIntoRoutine(bndId) {
  const b = state.appData.bundles.find((item) => item.id === bndId);
  if (!b) return;

  state.activeRoutine.namaRutinitas = b.nama;
  state.activeRoutine.profilKulit = b.jenisKulit === 'Semua Jenis Kulit' ? 'Kombinasi' : b.jenisKulit;
  state.activeRoutine.daftarItem = (b.daftarProduk || []).map((prodId, idx) => {
    const prod = state.appData.products.find((p) => p.id === prodId);
    let slot = 'AM';
    if (prod) {
      if (prod.kategori === 'Micellar & Remover') slot = 'WUDHU';
      else if (prod.kategori === 'Complexion' || prod.kategori === 'Lip' || prod.kategori === 'Eye & Brow') slot = 'MAKEUP';
      else if (prod.subKategori === 'Serum') slot = 'PM';
    }
    return {
      uid: 'item-' + Date.now() + '-' + idx,
      slot,
      prodId,
      note: 'Langkah dari paket rekomendasi'
    };
  });

  persistActiveRoutine();
  showToast(`Paket "${b.nama}" diterapkan ke Routine Planner.`);
}

export function updateRoutineMetaFromInputs() {
  const nameEl = document.getElementById('rtn-name');
  const skinEl = document.getElementById('rtn-skin');
  const capEl = document.getElementById('rtn-budget-cap');
  if (!nameEl || !skinEl || !capEl) return;

  state.activeRoutine.namaRutinitas = nameEl.value || 'Daily Halal Glow Routine';
  state.activeRoutine.profilKulit = skinEl.value;
  state.activeRoutine.targetAnggaran = Math.max(50000, parseInt(capEl.value || '550000', 10));
  persistActiveRoutine();
  recalculateRoutineBudget();
}

export function recalculateRoutineBudget() {
  let sumAM = 0;
  let sumPM = 0;
  let sumMakeup = 0;
  let sumWudhu = 0;

  state.activeRoutine.daftarItem.forEach((item) => {
    const p = state.appData.products.find((x) => x.id === item.prodId);
    if (!p) return;
    const price = Number(p.harga) || 0;
    if (item.slot === 'AM') sumAM += price;
    else if (item.slot === 'PM') sumPM += price;
    else if (item.slot === 'MAKEUP') sumMakeup += price;
    else sumWudhu += price;
  });

  const grandTotal = sumAM + sumPM + sumMakeup + sumWudhu;
  const cap = state.activeRoutine.targetAnggaran || 550000;
  const pct = Math.min(100, Math.round((grandTotal / cap) * 100));

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setText('calc-am', formatRupiah(sumAM));
  setText('calc-pm', formatRupiah(sumPM));
  setText('calc-makeup', formatRupiah(sumMakeup));
  setText('calc-wudhu', formatRupiah(sumWudhu));
  setText('calc-total', formatRupiah(grandTotal));
  setText('calc-count', `${state.activeRoutine.daftarItem.length} item`);
  setText('calc-budget-pct', `${pct}% dari ${formatRupiah(cap)}`);

  const bar = document.getElementById('calc-budget-bar');
  if (bar) {
    bar.style.width = `${pct}%`;
    bar.classList.toggle('is-over', grandTotal > cap);
  }

  setText('display-rtn-title', state.activeRoutine.namaRutinitas);
  setText('display-rtn-meta', `Profil Kulit: ${state.activeRoutine.profilKulit} · Target Budget: ${formatRupiah(cap)}`);

  return grandTotal;
}

export function renderRoutinePlanner() {
  const nameEl = document.getElementById('rtn-name');
  const skinEl = document.getElementById('rtn-skin');
  const capEl = document.getElementById('rtn-budget-cap');
  const quickSelect = document.getElementById('quick-add-prod');
  const container = document.getElementById('routine-slots-container');
  if (!nameEl || !skinEl || !capEl || !quickSelect || !container) return;

  nameEl.value = state.activeRoutine.namaRutinitas;
  skinEl.value = state.activeRoutine.profilKulit;
  capEl.value = state.activeRoutine.targetAnggaran;

  quickSelect.innerHTML = state.appData.products
    .map((p) => `<option value="${escapeHtml(p.id)}">[${escapeHtml(p.brand)}] ${escapeHtml(p.nama)} (${formatRupiah(p.harga)})</option>`)
    .join('');

  const SLOTS = [
    { key: 'AM', title: '01. AM Skincare (Pagi Hari)', desc: 'Persiapan kulit bersih, lembap, dan terlindung tabir surya sebelum beraktivitas.' },
    { key: 'MAKEUP', title: '02. Daily Halal Makeup', desc: 'Riasan wajah breathable & natural untuk kuliah, kerja, atau acara.' },
    { key: 'WUDHU', title: '03. Wudhu Touch-Up Kit', desc: 'Pembersih micellar praktis sebelum wudhu dan penyegar riasan pasca shalat.' },
    { key: 'PM', title: '04. PM Skincare (Malam Hari)', desc: 'Perawatan regenerasi kulit dan perbaikan skin barrier saat istirahat malam.' }
  ];

  container.innerHTML = SLOTS.map((slot) => {
    const items = state.activeRoutine.daftarItem.filter((i) => i.slot === slot.key);
    return `
      <div class="surface-card" style="display:flex;flex-direction:column;gap:0.9rem;">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:0.5rem;padding-bottom:0.75rem;border-bottom:1px solid var(--border-hairline);">
          <div>
            <h3 style="font-size:1.05rem;">${escapeHtml(slot.title)}</h3>
            <p style="font-size:0.76rem;color:var(--text-secondary);">${escapeHtml(slot.desc)}</p>
          </div>
          <span class="meta-line tabular-nums">${items.length} Produk</span>
        </div>

        ${
          items.length === 0
            ? `<p style="font-size:0.8rem;color:var(--text-muted);font-style:italic;padding:1rem 0;text-align:center;">
                Belum ada produk di sesi ini. Tambahkan dari katalog atau menu di atas.
              </p>`
            : `<div style="display:flex;flex-direction:column;gap:0.65rem;">
                ${items
                  .map((item, idx) => {
                    const p = state.appData.products.find((x) => x.id === item.prodId);
                    if (!p) return '';
                    return `
                      <div class="routine-item-row">
                        <div style="flex:1;min-width:210px;display:flex;flex-direction:column;gap:0.25rem;">
                          <div class="meta-line">
                            <span>Step ${idx + 1}</span>
                            <span aria-hidden="true">·</span>
                            <span>${escapeHtml(p.brand)}</span>
                          </div>
                          <div style="font-weight:700;font-size:0.9rem;color:var(--text-primary);">${escapeHtml(p.nama)}</div>
                          <input
                            type="text"
                            class="inline-note-input"
                            value="${escapeHtml(item.note)}"
                            data-action="routine-note"
                            data-uid="${escapeHtml(item.uid)}"
                            placeholder="Catatan pemakaian..."
                            aria-label="Catatan pemakaian ${escapeHtml(p.nama)}"
                          />
                          <div style="font-size:0.72rem;color:var(--accent-primary-hover);">${escapeHtml(p.infoWudhu)}</div>
                        </div>

                        <div style="display:flex;align-items:center;gap:0.5rem;flex-shrink:0;">
                          <span class="tabular-nums" style="font-size:0.82rem;font-weight:700;">${formatRupiah(p.harga)}</span>
                          <select
                            class="select"
                            style="width:auto;padding:0.35rem 0.6rem;font-size:0.75rem;"
                            data-action="routine-slot"
                            data-uid="${escapeHtml(item.uid)}"
                            aria-label="Pindah sesi untuk ${escapeHtml(p.nama)}"
                          >
                            <option value="AM" ${slot.key === 'AM' ? 'selected' : ''}>AM</option>
                            <option value="MAKEUP" ${slot.key === 'MAKEUP' ? 'selected' : ''}>Makeup</option>
                            <option value="WUDHU" ${slot.key === 'WUDHU' ? 'selected' : ''}>Wudhu</option>
                            <option value="PM" ${slot.key === 'PM' ? 'selected' : ''}>PM</option>
                          </select>
                          <button
                            type="button"
                            class="btn btn-subtle"
                            style="min-height:32px;padding:0.25rem 0.6rem;"
                            data-action="remove-routine-item"
                            data-uid="${escapeHtml(item.uid)}"
                            aria-label="Hapus ${escapeHtml(p.nama)} dari routine"
                          >✕</button>
                        </div>
                      </div>
                    `;
                  })
                  .join('')}
              </div>`
        }
      </div>
    `;
  }).join('');

  recalculateRoutineBudget();
  renderSavedRoutinesList();
}

export function renderSavedRoutinesList() {
  const box = document.getElementById('saved-routines-list');
  if (!box) return;

  if (state.savedRoutines.length === 0) {
    box.innerHTML = `<p style="font-size:0.76rem;color:var(--text-muted);font-style:italic;">Belum ada rutinitas kecantikan yang disimpan.</p>`;
    return;
  }

  box.innerHTML = state.savedRoutines
    .map(
      (item) => `
      <div style="padding:0.75rem;border-radius:var(--radius-md);background:var(--bg-subtle);border:1px solid var(--border-hairline);display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
        <div style="min-width:0;">
          <div style="font-weight:700;font-size:0.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(item.namaRutinitas)}</div>
          <div class="tabular-nums" style="font-size:0.72rem;color:var(--text-secondary);">
            ${item.daftarItem.length} Produk · ${formatRupiah(item.totalAnggaran)}
          </div>
        </div>
        <div style="display:flex;gap:0.35rem;flex-shrink:0;">
          <button type="button" class="btn btn-primary" style="min-height:30px;padding:0.25rem 0.65rem;" data-action="load-saved-routine" data-id="${escapeHtml(item.id)}">Muat</button>
          <button type="button" class="btn btn-subtle" style="min-height:30px;padding:0.25rem 0.55rem;" data-action="delete-saved-routine" data-id="${escapeHtml(item.id)}">✕</button>
        </div>
      </div>
    `
    )
    .join('');
}

export function saveCurrentRoutine() {
  const total = recalculateRoutineBudget();
  const snapshot = {
    ...structuredClone(state.activeRoutine),
    id: 'saved-rtn-' + Date.now(),
    totalAnggaran: total
  };
  state.savedRoutines.unshift(snapshot);
  persistSavedRoutines();
  renderSavedRoutinesList();
  showToast(`Rutinitas "${snapshot.namaRutinitas}" berhasil disimpan.`);
}

export function loadSavedRoutine(id) {
  const found = state.savedRoutines.find((item) => item.id === id);
  if (!found) return;
  state.activeRoutine = structuredClone(found);
  persistActiveRoutine();
  renderRoutinePlanner();
  showToast(`Memuat rutinitas "${found.namaRutinitas}".`);
}

export function deleteSavedRoutine(id) {
  state.savedRoutines = state.savedRoutines.filter((item) => item.id !== id);
  persistSavedRoutines();
  renderSavedRoutinesList();
  showToast('Rutinitas tersimpan dihapus.', 'warn');
}

export function clearCurrentRoutine() {
  state.activeRoutine.daftarItem = [];
  persistActiveRoutine();
  renderRoutinePlanner();
  showToast('Daftar produk rutinitas direset.', 'warn');
}

export function removeRoutineItem(uid) {
  state.activeRoutine.daftarItem = state.activeRoutine.daftarItem.filter((i) => i.uid !== uid);
  persistActiveRoutine();
  renderRoutinePlanner();
}

export function updateRoutineItemField(uid, field, value) {
  const item = state.activeRoutine.daftarItem.find((i) => i.uid === uid);
  if (!item) return;
  item[field] = value;
  persistActiveRoutine();
  if (field === 'slot') {
    renderRoutinePlanner();
  }
}
