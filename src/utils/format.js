// Safe HTML Escaping, Formatting, Toast Notifications & Clipboard Helpers

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatRupiah(num) {
  const n = Number(num) || 0;
  return 'Rp ' + n.toLocaleString('id-ID');
}

export function showToast(message, variant = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = variant === 'warn' ? 'toast toast--warn' : 'toast';
  toast.setAttribute('role', 'status');

  const msgSpan = document.createElement('span');
  msgSpan.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'close-circle-btn';
  closeBtn.style.width = '24px';
  closeBtn.style.height = '24px';
  closeBtn.style.fontSize = '0.7rem';
  closeBtn.setAttribute('aria-label', 'Tutup notifikasi');
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', () => toast.remove());

  toast.appendChild(msgSpan);
  toast.appendChild(closeBtn);
  container.appendChild(toast);

  window.setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 3400);
}

export async function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.style.position = 'fixed';
  area.style.left = '-9999px';
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(area);
  return ok;
}

export function buildDemoWhatsAppUrl(entityName, phoneSim, productHint = '') {
  const msg = productHint
    ? `Assalamu'alaikum Beauty Advisor ${entityName}, saya ingin cek ketersediaan stok "${productHint}" yang tercantum di HalalGlow Aceh (Mode Demo).`
    : `Assalamu'alaikum Beauty Advisor ${entityName}, saya ingin konsultasi produk makeup & skincare halal di HalalGlow Aceh (Mode Demo).`;
  return `https://wa.me/${encodeURIComponent(phoneSim)}?text=${encodeURIComponent(msg)}`;
}
