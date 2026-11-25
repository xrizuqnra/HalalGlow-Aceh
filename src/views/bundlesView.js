// Rule-Based Beauty Bundle Recommender

import { state } from '../state/store.js';
import { escapeHtml, formatRupiah } from '../utils/format.js';

export function resetBundleFilters() {
  const skinEl = document.getElementById('bnd-skintype');
  const goalEl = document.getElementById('bnd-goal');
  const budgetEl = document.getElementById('bnd-budget');
  if (skinEl) skinEl.value = 'Semua';
  if (goalEl) goalEl.value = 'Semua';
  if (budgetEl) budgetEl.value = '99999999';
  renderBundles();
}

export function renderBundles() {
  const skinEl = document.getElementById('bnd-skintype');
  const goalEl = document.getElementById('bnd-goal');
  const budgetEl = document.getElementById('bnd-budget');
  const grid = document.getElementById('bundles-grid');
  if (!grid || !skinEl || !goalEl || !budgetEl) return;

  const skin = skinEl.value;
  const goal = goalEl.value;
  const maxBudget = parseInt(budgetEl.value, 10) || 99999999;

  const matched = state.appData.bundles.filter((b) => {
    const matchSkin = skin === 'Semua' || b.jenisKulit === skin || b.jenisKulit === 'Semua Jenis Kulit';
    const matchGoal = goal === 'Semua' || b.fokus === goal;
    const matchBudget = Number(b.estimasiBiaya) <= maxBudget;
    return matchSkin && matchGoal && matchBudget;
  });

  if (matched.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3 style="font-size:1.15rem;margin-bottom:0.35rem;">Belum ada paket yang sesuai kombinasi kriteria Anda.</h3>
        <p style="font-size:0.82rem;color:var(--text-secondary);">Coba pilih batas anggaran yang lebih tinggi atau ubah fokus perawatan.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = matched
    .map((b) => {
      const prodObjects = (b.daftarProduk || [])
        .map((id) => state.appData.products.find((p) => p.id === id))
        .filter(Boolean);

      return `
        <article class="surface-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:1.1rem;">
          <div style="display:flex;flex-direction:column;gap:0.75rem;">
            <div class="meta-line">
              <span>Kulit ${escapeHtml(b.jenisKulit)}</span>
              <span aria-hidden="true">·</span>
              <span>${escapeHtml(b.fokus)}</span>
            </div>

            <h3 style="font-size:1.25rem;line-height:1.25;">${escapeHtml(b.nama)}</h3>
            <p style="font-size:0.84rem;color:var(--text-secondary);">${escapeHtml(b.deskripsi)}</p>

            <div class="surface-card surface-card--subtle" style="padding:0.9rem 1rem;">
              <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:0.45rem;">
                Kombinasi Produk (${prodObjects.length} Item)
              </div>
              <ul style="margin:0;padding-left:1.1rem;font-size:0.8rem;color:var(--text-primary);display:flex;flex-direction:column;gap:0.25rem;">
                ${prodObjects.map((p) => `<li>${escapeHtml(p.nama)}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:0.85rem;padding-top:1rem;border-top:1px solid var(--border-hairline);">
            <div>
              <span style="display:block;font-size:0.72rem;color:var(--text-secondary);">Estimasi Total Paket</span>
              <span class="tabular-nums" style="font-size:1.25rem;font-weight:700;color:var(--accent-primary);">
                ${formatRupiah(b.estimasiBiaya)}
              </span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
              <button type="button" class="btn btn-primary" data-action="add-bundle-cart" data-id="${escapeHtml(b.id)}">
                + Semua ke Keranjang
              </button>
              <button type="button" class="btn btn-outline" data-action="load-bundle-routine" data-id="${escapeHtml(b.id)}">
                + Routine Planner
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}
