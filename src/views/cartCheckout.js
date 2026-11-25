// Shopping Cart Drawer, Vouchers, Checkout Modal, Digital Invoice & Order History

import { state, persistCart, persistOrders, calculateCartTotals } from '../state/store.js';
import { escapeHtml, formatRupiah, showToast, copyTextToClipboard, buildDemoWhatsAppUrl } from '../utils/format.js';
import { getProductVisualSrc, getProductFallbackSrc } from '../utils/productArt.js';
import { attachImageFallbacks } from './catalogView.js';

export function openCartDrawer() {
  renderCartDrawer();
  const drawer = document.getElementById('cart-drawer');
  if (drawer) drawer.classList.remove('is-hidden');
}

export function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (drawer) drawer.classList.add('is-hidden');
}

export function addToCart(prodId, selectedVariant = '') {
  const p = state.appData.products.find((item) => item.id === prodId);
  if (!p) return;

  const defaultVariant =
    selectedVariant || (p.shades && p.shades.length > 0 ? p.shades[0].name : 'Standard Size');
  const existing = state.cartState.items.find((i) => i.prodId === prodId && i.variant === defaultVariant);

  if (existing) {
    existing.qty += 1;
  } else {
    state.cartState.items.push({
      uid: 'cart-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      prodId: p.id,
      variant: defaultVariant,
      qty: 1
    });
  }

  persistCart();
  renderCartDrawer();
  showToast(`"${p.nama}" (${defaultVariant}) masuk ke Keranjang.`);
}

export function addBundleToCart(bndId) {
  const b = state.appData.bundles.find((item) => item.id === bndId);
  if (!b) return;

  (b.daftarProduk || []).forEach((prodId, idx) => {
    const p = state.appData.products.find((item) => item.id === prodId);
    if (!p) return;
    const defaultVariant = p.shades && p.shades.length > 0 ? p.shades[0].name : 'Standard Size';
    const existing = state.cartState.items.find((i) => i.prodId === prodId && i.variant === defaultVariant);
    if (existing) {
      existing.qty += 1;
    } else {
      state.cartState.items.push({
        uid: 'cart-' + Date.now() + '-' + idx,
        prodId: p.id,
        variant: defaultVariant,
        qty: 1
      });
    }
  });

  persistCart();
  renderCartDrawer();
  openCartDrawer();
  showToast(`Seluruh produk dari "${b.nama}" ditambahkan ke Keranjang.`);
}

export function updateCartItemQty(uid, delta) {
  const idx = state.cartState.items.findIndex((i) => i.uid === uid);
  if (idx === -1) return;
  state.cartState.items[idx].qty += delta;
  if (state.cartState.items[idx].qty <= 0) {
    state.cartState.items.splice(idx, 1);
  }
  persistCart();
  renderCartDrawer();
}

export function removeCartItem(uid) {
  state.cartState.items = state.cartState.items.filter((i) => i.uid !== uid);
  persistCart();
  renderCartDrawer();
  showToast('Item dihapus dari keranjang.', 'warn');
}

export function clearCart() {
  state.cartState.items = [];
  state.cartState.voucherCode = '';
  persistCart();
  renderCartDrawer();
  showToast('Keranjang belanja dikosongkan.', 'warn');
}

export function applyCartVoucher(overrideCode = null) {
  const inputEl = document.getElementById('cart-voucher-input');
  const raw = overrideCode !== null ? overrideCode : inputEl ? inputEl.value : '';
  const code = (raw || '').trim().toUpperCase();

  if (!code) {
    state.cartState.voucherCode = '';
    persistCart();
    renderCartDrawer();
    return;
  }

  if (code === 'HALALGLOW10' || code === 'ACEHCANTIK') {
    state.cartState.voucherCode = code;
    persistCart();
    renderCartDrawer();
    showToast(`Voucher ${code} berhasil diterapkan.`);
  } else {
    showToast('Kode voucher tidak valid. Gunakan HALALGLOW10 atau ACEHCANTIK.', 'warn');
  }
}

export function renderCartDrawer() {
  const container = document.getElementById('cart-items-container');
  const optionsBox = document.getElementById('cart-options-box');
  const checkoutBtn = document.getElementById('btn-proceed-checkout');
  const subtitleEl = document.getElementById('cart-drawer-subtitle');
  const shipEl = document.getElementById('cart-shipping-method');
  const storeEl = document.getElementById('cart-pickup-store');
  const voucherEl = document.getElementById('cart-voucher-input');
  const pickupBox = document.getElementById('cart-pickup-store-box');
  const voucherStatus = document.getElementById('cart-voucher-status');
  if (!container || !optionsBox || !checkoutBtn) return;

  const totals = calculateCartTotals();

  if (subtitleEl) subtitleEl.textContent = `${totals.totalQty} produk dipilih`;
  if (shipEl) shipEl.value = state.cartState.shippingMethod || 'pickup';
  if (storeEl) storeEl.value = state.cartState.pickupStore || 'HalalGlow Suzuya Mall Banda Aceh';
  if (voucherEl) voucherEl.value = state.cartState.voucherCode || '';
  if (pickupBox) pickupBox.classList.toggle('is-hidden', state.cartState.shippingMethod !== 'pickup');
  if (voucherStatus) voucherStatus.textContent = state.cartState.voucherCode ? `Aktif: ${state.cartState.voucherCode}` : '';

  if (state.cartState.items.length === 0) {
    container.innerHTML = `
      <div class="surface-card surface-card--subtle" style="text-align:center;padding:2.25rem 1rem;">
        <h3 style="font-size:1rem;margin-bottom:0.35rem;">Keranjang Belanja Masih Kosong</h3>
        <p style="font-size:0.78rem;color:var(--text-secondary);">Pilih produk makeup atau skincare halal favoritmu dari katalog untuk memulai transaksi.</p>
      </div>
    `;
    optionsBox.style.opacity = '0.5';
    optionsBox.style.pointerEvents = 'none';
    checkoutBtn.disabled = true;
  } else {
    optionsBox.style.opacity = '1';
    optionsBox.style.pointerEvents = 'auto';
    checkoutBtn.disabled = false;

    container.innerHTML = state.cartState.items
      .map((item) => {
        const p = state.appData.products.find((prod) => prod.id === item.prodId);
        if (!p) return '';
        const artSrc = getProductVisualSrc(p);
        const fallbackSrc = getProductFallbackSrc(p);

        return `
          <div class="cart-item">
            <img
              src="${escapeHtml(artSrc)}"
              data-fallback="${escapeHtml(fallbackSrc)}"
              alt="${escapeHtml(p.nama)}"
              referrerpolicy="no-referrer"
            />
            <div style="flex:1;min-width:0;">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">
                <span class="meta-line">${escapeHtml(p.brand)}</span>
                <button
                  type="button"
                  style="border:none;background:transparent;color:var(--text-muted);font-weight:700;font-size:0.78rem;"
                  data-action="cart-remove"
                  data-uid="${escapeHtml(item.uid)}"
                  aria-label="Hapus ${escapeHtml(p.nama)}"
                >✕</button>
              </div>
              <div style="font-weight:700;font-size:0.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(p.nama)}</div>
              <div style="font-size:0.72rem;color:var(--text-secondary);">Varian: <strong>${escapeHtml(item.variant)}</strong></div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.45rem;">
                <span class="tabular-nums" style="font-size:0.8rem;font-weight:700;color:var(--accent-primary);">
                  ${formatRupiah(p.harga * item.qty)}
                </span>
                <div class="qty-stepper">
                  <button type="button" data-action="cart-qty" data-uid="${escapeHtml(item.uid)}" data-delta="-1" aria-label="Kurangi jumlah">−</button>
                  <span>${item.qty}</span>
                  <button type="button" data-action="cart-qty" data-uid="${escapeHtml(item.uid)}" data-delta="1" aria-label="Tambah jumlah">+</button>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    attachImageFallbacks(container);
  }

  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };
  setTxt('cart-subtotal', formatRupiah(totals.subtotal));
  setTxt('cart-discount', `- ${formatRupiah(totals.discount)}`);
  setTxt('cart-shipping-cost', totals.shippingCost === 0 ? 'Gratis (Rp 0)' : formatRupiah(totals.shippingCost));
  setTxt('cart-grand-total', formatRupiah(totals.grandTotal));
}

export function openCheckoutModal() {
  if (state.cartState.items.length === 0) return;
  closeCartDrawer();

  const totals = calculateCartTotals();
  const shippingLabel =
    state.cartState.shippingMethod === 'pickup'
      ? `Ambil di Gerai: ${state.cartState.pickupStore}`
      : state.cartState.shippingMethod === 'instant'
      ? 'Kurir Lokal Instan Kota Tujuan'
      : 'Ekspedisi Reguler Seluruh Aceh';

  const modal = document.getElementById('checkout-modal');
  const modalBody = document.getElementById('checkout-modal-body');
  if (!modal || !modalBody) return;

  const user = state.currentUser;
  modalBody.innerHTML = `
    <div class="modal-banner">
      <div>
        <span style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.9;">Simulated Checkout</span>
        <h2>Konfirmasi Pesanan &amp; Pembayaran</h2>
      </div>
      <button type="button" class="close-circle-btn" data-action="close-checkout-modal" aria-label="Tutup checkout">✕</button>
    </div>

    <form id="checkout-form" style="padding:1.5rem;display:flex;flex-direction:column;gap:1.15rem;font-size:0.85rem;">
      <div>
        <h3 style="font-family:var(--font-sans);font-size:0.75rem;font-weight:700;text-transform:uppercase;color:var(--accent-primary);margin-bottom:0.65rem;">
          1. Data Pembeli / Penerima
        </h3>
        <div class="grid-2" style="gap:0.75rem;margin-bottom:0.75rem;">
          <div>
            <label class="field-label" for="co-name">Nama Lengkap *</label>
            <input id="co-name" class="input" required name="buyerName" value="${escapeHtml(user ? user.name : '')}" placeholder="Contoh: Cut Nyak Meutia" />
          </div>
          <div>
            <label class="field-label" for="co-phone">Nomor WhatsApp *</label>
            <input id="co-phone" class="input" required name="buyerPhone" value="${escapeHtml(user ? user.phone || '' : '')}" placeholder="Contoh: 081269001234" />
          </div>
        </div>
        <div>
          <label class="field-label" for="co-address">Alamat Lengkap / Catatan Pengambilan *</label>
          <textarea id="co-address" class="textarea" required name="buyerAddress" rows="2" placeholder="Masukkan alamat lengkap di Aceh atau jadwal jam pengambilan di gerai...">${escapeHtml(user && user.city ? `Kota ${user.city}, Aceh` : '')}</textarea>
        </div>
      </div>

      <div>
        <h3 style="font-family:var(--font-sans);font-size:0.75rem;font-weight:700;text-transform:uppercase;color:var(--accent-primary);margin-bottom:0.65rem;">
          2. Metode Pembayaran (Mode Simulasi)
        </h3>
        <div class="grid-2" style="gap:0.65rem;font-size:0.78rem;">
          <label class="surface-card surface-card--subtle" style="padding:0.75rem;display:flex;align-items:center;gap:0.6rem;cursor:pointer;">
            <input type="radio" name="paymentMethod" value="QRIS Instan (Simulasi)" checked />
            <div>
              <div style="font-weight:700;">QRIS Instan</div>
              <div style="font-size:0.7rem;color:var(--text-secondary);">Scan QR seluruh e-wallet &amp; m-banking</div>
            </div>
          </label>
          <label class="surface-card surface-card--subtle" style="padding:0.75rem;display:flex;align-items:center;gap:0.6rem;cursor:pointer;">
            <input type="radio" name="paymentMethod" value="Transfer VA Bank Syariah Indonesia (BSI)" />
            <div>
              <div style="font-weight:700;">Virtual Account BSI</div>
              <div style="font-size:0.7rem;color:var(--text-secondary);">Bank Syariah Indonesia (Simulasi)</div>
            </div>
          </label>
          <label class="surface-card surface-card--subtle" style="padding:0.75rem;display:flex;align-items:center;gap:0.6rem;cursor:pointer;">
            <input type="radio" name="paymentMethod" value="Transfer VA Bank Aceh Syariah" />
            <div>
              <div style="font-weight:700;">VA Bank Aceh Syariah</div>
              <div style="font-size:0.7rem;color:var(--text-secondary);">Pembayaran daerah Aceh (Simulasi)</div>
            </div>
          </label>
          <label class="surface-card surface-card--subtle" style="padding:0.75rem;display:flex;align-items:center;gap:0.6rem;cursor:pointer;">
            <input type="radio" name="paymentMethod" value="Bayar di Tempat / Gerai (COD / Pay at Store)" />
            <div>
              <div style="font-weight:700;">COD / Bayar di Gerai</div>
              <div style="font-size:0.7rem;color:var(--text-secondary);">Tunai atau non-tunai saat ambil</div>
            </div>
          </label>
        </div>
      </div>

      <div class="surface-card surface-card--subtle" style="padding:1rem;font-size:0.78rem;display:flex;flex-direction:column;gap:0.4rem;">
        <div style="display:flex;justify-content:space-between;font-weight:700;">
          <span>3. Ringkasan Pesanan (${totals.totalQty} Item)</span>
          <span style="color:var(--accent-primary);">${escapeHtml(shippingLabel)}</span>
        </div>
        <div style="max-height:7rem;overflow-y:auto;border-block:1px solid var(--border-hairline);padding-block:0.45rem;display:flex;flex-direction:column;gap:0.25rem;">
          ${state.cartState.items
            .map((item) => {
              const p = state.appData.products.find((prod) => prod.id === item.prodId);
              if (!p) return '';
              return `<div style="display:flex;justify-content:space-between;gap:0.5rem;">
                <span>${item.qty}x ${escapeHtml(p.nama)} (${escapeHtml(item.variant)})</span>
                <span class="tabular-nums" style="font-weight:600;">${formatRupiah(p.harga * item.qty)}</span>
              </div>`;
            })
            .join('')}
        </div>
        <div class="budget-row"><span>Subtotal</span><span class="tabular-nums">${formatRupiah(totals.subtotal)}</span></div>
        <div class="budget-row" style="color:var(--accent-primary);"><span>Diskon (${escapeHtml(state.cartState.voucherCode || '-')})</span><span class="tabular-nums">- ${formatRupiah(totals.discount)}</span></div>
        <div class="budget-row"><span>Ongkos Kirim</span><span class="tabular-nums">${formatRupiah(totals.shippingCost)}</span></div>
        <div class="budget-row" style="font-size:1rem;font-weight:700;padding-top:0.35rem;">
          <span>Total Tagihan Simulasi</span>
          <span class="tabular-nums" style="color:var(--accent-primary);">${formatRupiah(totals.grandTotal)}</span>
        </div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:0.65rem;">
        <button type="button" class="btn btn-outline" data-action="back-to-cart">← Kembali ke Keranjang</button>
        <button type="submit" class="btn btn-primary" style="flex:1;">Konfirmasi &amp; Buat Invoice Simulasi</button>
      </div>
    </form>
  `;

  modal.classList.remove('is-hidden');
}

export function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.add('is-hidden');
}

export function submitSimulatedCheckout(formElement) {
  const fd = new FormData(formElement);
  const totals = calculateCartTotals();

  const invoiceItems = state.cartState.items.map((item) => {
    const p = state.appData.products.find((prod) => prod.id === item.prodId);
    return {
      prodId: item.prodId,
      nama: p ? p.nama : 'Produk Halal',
      brand: p ? p.brand : '-',
      variant: item.variant,
      harga: p ? p.harga : 0,
      qty: item.qty
    };
  });

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const invoiceId = `INV-HGA-2026${randomDigits}`;
  const nowStr = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const orderRecord = {
    invoiceId,
    tanggal: nowStr,
    status: 'Pembayaran Simulasi Terverifikasi',
    buyerName: String(fd.get('buyerName') || ''),
    buyerPhone: String(fd.get('buyerPhone') || ''),
    buyerAddress: String(fd.get('buyerAddress') || ''),
    paymentMethod: String(fd.get('paymentMethod') || ''),
    shippingMethod: state.cartState.shippingMethod,
    pickupStore: state.cartState.pickupStore,
    voucherCode: state.cartState.voucherCode,
    items: invoiceItems,
    subtotal: totals.subtotal,
    discount: totals.discount,
    shippingCost: totals.shippingCost,
    grandTotal: totals.grandTotal
  };

  state.orderHistory.unshift(orderRecord);
  persistOrders();

  state.cartState.items = [];
  state.cartState.voucherCode = '';
  persistCart();
  renderCartDrawer();
  renderCustomerOrders();

  showToast(`Transaksi berhasil. Invoice ${invoiceId} dibuat.`);
  openInvoiceModal(invoiceId);
}

export function openInvoiceModal(invoiceId) {
  const order = state.orderHistory.find((o) => o.invoiceId === invoiceId);
  const modal = document.getElementById('checkout-modal');
  const modalBody = document.getElementById('checkout-modal-body');
  if (!order || !modal || !modalBody) return;

  const shippingText =
    order.shippingMethod === 'pickup'
      ? `Ambil di Gerai: ${order.pickupStore}`
      : order.shippingMethod === 'instant'
      ? 'Kurir Lokal Instan Kota Tujuan'
      : 'Ekspedisi Reguler Seluruh Aceh';

  const waConfirmMsg = `Assalamu'alaikum HalalGlow Aceh, saya konfirmasi pesanan simulasi:\nNo. Invoice: ${order.invoiceId}\nNama: ${order.buyerName}\nTotal: ${formatRupiah(order.grandTotal)}\nMetode: ${order.paymentMethod}`;
  const waConfirmUrl = `https://wa.me/6281200005501?text=${encodeURIComponent(waConfirmMsg)}`;

  modalBody.innerHTML = `
    <div class="modal-banner">
      <div>
        <span style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.9;">Digital Receipt · Mode Simulasi</span>
        <h2 class="font-mono-num">${escapeHtml(order.invoiceId)}</h2>
        <p style="font-size:0.75rem;opacity:0.88;">${escapeHtml(order.tanggal)}</p>
      </div>
      <button type="button" class="close-circle-btn no-print" data-action="close-checkout-modal" aria-label="Tutup invoice">✕</button>
    </div>

    <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1rem;font-size:0.8rem;">
      <div class="surface-card surface-card--subtle" style="padding:0.75rem 1rem;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.5rem;">
        <span style="font-weight:700;">Status Transaksi:</span>
        <span style="font-weight:700;color:var(--accent-primary);">${escapeHtml(order.status)}</span>
      </div>

      <div class="grid-2" style="gap:0.85rem;padding:0.85rem;border:1px solid var(--border-hairline);border-radius:var(--radius-lg);">
        <div>
          <span style="font-size:0.68rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Data Pembeli</span>
          <p style="font-weight:700;margin-top:0.2rem;">${escapeHtml(order.buyerName)} (${escapeHtml(order.buyerPhone)})</p>
          <p style="color:var(--text-secondary);margin-top:0.15rem;">${escapeHtml(order.buyerAddress)}</p>
        </div>
        <div>
          <span style="font-size:0.68rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);">Pengiriman &amp; Pembayaran</span>
          <p style="font-weight:700;margin-top:0.2rem;">${escapeHtml(shippingText)}</p>
          <p style="color:var(--accent-primary-hover);font-weight:600;margin-top:0.15rem;">${escapeHtml(order.paymentMethod)}</p>
        </div>
      </div>

      <div style="border:1px solid var(--border-hairline);border-radius:var(--radius-lg);overflow:hidden;">
        <div style="background:var(--bg-subtle);padding:0.55rem 0.9rem;font-weight:700;border-bottom:1px solid var(--border-hairline);">
          Rincian Produk Dibeli
        </div>
        <div style="padding:0.85rem;display:flex;flex-direction:column;gap:0.55rem;">
          ${order.items
            .map(
              (it) => `
              <div style="display:flex;justify-content:space-between;gap:0.75rem;padding-bottom:0.5rem;border-bottom:1px solid var(--border-hairline);">
                <div>
                  <div style="font-weight:700;">[${escapeHtml(it.brand)}] ${escapeHtml(it.nama)}</div>
                  <div style="font-size:0.72rem;color:var(--text-secondary);">Varian: ${escapeHtml(it.variant)} · ${it.qty} × ${formatRupiah(it.harga)}</div>
                </div>
                <span class="tabular-nums" style="font-weight:700;flex-shrink:0;">${formatRupiah(it.harga * it.qty)}</span>
              </div>
            `
            )
            .join('')}
        </div>
      </div>

      <div class="surface-card surface-card--subtle" style="padding:0.9rem 1rem;display:flex;flex-direction:column;gap:0.35rem;">
        <div class="budget-row"><span>Subtotal Produk</span><span class="tabular-nums">${formatRupiah(order.subtotal)}</span></div>
        <div class="budget-row" style="color:var(--accent-primary);"><span>Diskon Voucher (${escapeHtml(order.voucherCode || '-')})</span><span class="tabular-nums">- ${formatRupiah(order.discount)}</span></div>
        <div class="budget-row"><span>Ongkos Kirim</span><span class="tabular-nums">${formatRupiah(order.shippingCost)}</span></div>
        <div class="budget-row" style="font-size:1rem;font-weight:700;padding-top:0.45rem;border-top:1px solid var(--border-hairline);">
          <span>Total Dibayar (Simulasi)</span>
          <span class="tabular-nums" style="color:var(--accent-primary);">${formatRupiah(order.grandTotal)}</span>
        </div>
      </div>

      <div class="no-print" style="display:flex;flex-wrap:wrap;gap:0.5rem;">
        <button type="button" class="btn btn-subtle" data-action="copy-invoice" data-id="${escapeHtml(order.invoiceId)}">Salin Invoice</button>
        <button type="button" class="btn btn-outline" data-action="print-invoice">Cetak Struk</button>
        <a href="${escapeHtml(waConfirmUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-dark" style="flex:1;">
          Konfirmasi WA (Demo)
        </a>
      </div>
    </div>
  `;

  modal.classList.remove('is-hidden');
}

export async function copyInvoiceText(invoiceId) {
  const order = state.orderHistory.find((o) => o.invoiceId === invoiceId);
  if (!order) return;

  const summary = [
    'INVOICE HALALGLOW ACEH (SIMULASI)',
    `No. Invoice: ${order.invoiceId}`,
    `Tanggal: ${order.tanggal}`,
    `Pembeli: ${order.buyerName} (${order.buyerPhone})`,
    `Metode Bayar: ${order.paymentMethod}`,
    'Item:',
    ...order.items.map((i) => `- ${i.qty}x ${i.nama} (${i.variant}) = ${formatRupiah(i.harga * i.qty)}`),
    `Total Pembayaran: ${formatRupiah(order.grandTotal)}`
  ].join('\n');

  await copyTextToClipboard(summary);
  showToast('Teks struk invoice berhasil disalin ke clipboard.');
}

export function renderCustomerOrders() {
  const container = document.getElementById('customer-orders-list');
  if (!container) return;

  if (state.orderHistory.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3 style="font-size:1.15rem;margin-bottom:0.35rem;">Belum Ada Riwayat Transaksi</h3>
        <p style="font-size:0.82rem;color:var(--text-secondary);">Tambahkan produk ke keranjang dan selesaikan proses checkout simulasi untuk melihat invoice digital di sini.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = state.orderHistory
    .map((o) => {
      const waUrl = buildDemoWhatsAppUrl('HalalGlow Aceh', '6281200005501', o.invoiceId);
      return `
        <article class="surface-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:1rem;">
          <div style="display:flex;flex-direction:column;gap:0.65rem;">
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.5rem;">
              <span class="font-mono-num" style="font-weight:700;font-size:0.85rem;">${escapeHtml(o.invoiceId)}</span>
              <span style="font-size:0.74rem;font-weight:700;color:var(--accent-primary);">${escapeHtml(o.status)}</span>
            </div>
            <div style="font-size:0.78rem;color:var(--text-secondary);">
              ${escapeHtml(o.tanggal)} · <strong>${escapeHtml(o.buyerName)}</strong>
            </div>
            <div class="surface-card surface-card--subtle" style="padding:0.75rem;font-size:0.78rem;display:flex;flex-direction:column;gap:0.3rem;">
              ${o.items
                .slice(0, 3)
                .map(
                  (it) => `<div style="display:flex;justify-content:space-between;gap:0.5rem;">
                    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${it.qty}x ${escapeHtml(it.nama)}</span>
                    <span class="tabular-nums" style="font-weight:600;flex-shrink:0;">${formatRupiah(it.harga * it.qty)}</span>
                  </div>`
                )
                .join('')}
              ${
                o.items.length > 3
                  ? `<div style="font-size:0.72rem;color:var(--accent-primary);font-weight:600;">+ ${o.items.length - 3} produk lainnya</div>`
                  : ''
              }
            </div>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;padding-top:0.85rem;border-top:1px solid var(--border-hairline);">
            <div>
              <span style="display:block;font-size:0.7rem;color:var(--text-secondary);">Total Pembayaran</span>
              <span class="tabular-nums" style="font-size:1.1rem;font-weight:700;color:var(--accent-primary);">${formatRupiah(o.grandTotal)}</span>
            </div>
            <div style="display:flex;gap:0.45rem;">
              <button type="button" class="btn btn-primary" data-action="open-invoice" data-id="${escapeHtml(o.invoiceId)}">Lihat Invoice</button>
              <a href="${escapeHtml(waUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-dark">WA</a>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}
