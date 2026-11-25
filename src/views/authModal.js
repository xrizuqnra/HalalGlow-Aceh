// Server-Verified Authentication Modal (Customer Registration/Login, Creator Guard & Profile Editor)

import {
  state,
  isAuthenticated,
  isCreatorUser,
  setSessionAuth,
  clearSessionAuth
} from '../state/store.js';
import { I18N } from '../data/i18n.js';
import { escapeHtml, showToast } from '../utils/format.js';
import { apiRequest } from '../utils/api.js';

function notifyAuthStateChanged(options = {}) {
  document.dispatchEvent(new CustomEvent('halalglow:auth-changed', { detail: options }));
}

function renderUserAvatarHtml(user, sizePx = 24) {
  const initial = escapeHtml((user?.name || 'U').trim().charAt(0).toUpperCase());
  if (user?.avatarUrl) {
    return `<img src="${escapeHtml(user.avatarUrl)}" alt="${escapeHtml(user.name)}" class="avatar-img" style="width:${sizePx}px;height:${sizePx}px;" referrerpolicy="no-referrer" />`;
  }
  return `<span style="width:${sizePx}px;height:${sizePx}px;border-radius:9999px;background:var(--accent-primary);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:${Math.round(sizePx * 0.45)}px;font-weight:700;flex-shrink:0;">${initial}</span>`;
}

export function renderHeaderAuth() {
  const desktopSlot = document.getElementById('header-auth-slot');
  const mobileSlot = document.getElementById('mobile-auth-slot');
  const navAdminDesktop = document.getElementById('nav-admin-desktop');
  const navAdminMobile = document.getElementById('nav-admin-mobile');

  const creatorActive = isCreatorUser();
  if (navAdminDesktop) navAdminDesktop.classList.toggle('is-hidden', !creatorActive);
  if (navAdminMobile) navAdminMobile.classList.toggle('is-hidden', !creatorActive);

  if (!desktopSlot) return;

  if (!isAuthenticated()) {
    const loginLabel = I18N[state.currentLang]?.navLogin || 'Masuk';
    desktopSlot.innerHTML = `
      <button type="button" class="btn btn-dark" style="min-height:38px;padding:0.4rem 0.9rem;" data-action="open-auth" data-mode="register">
        ${escapeHtml(loginLabel)} / Daftar
      </button>
    `;
    if (mobileSlot) {
      mobileSlot.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:0.45rem;">
          <button type="button" class="btn btn-dark btn-block" data-action="open-auth-mobile" data-mode="register">
            Daftar / Masuk Pelanggan
          </button>
          <button type="button" class="btn btn-outline btn-block" data-action="open-auth-mobile" data-mode="creator">
            Akses Creator
          </button>
        </div>
      `;
    }
  } else {
    const u = state.currentUser;
    const firstName = u.name.split(' ')[0];
    const roleLabel = u.role === 'admin' ? 'Creator' : 'Pelanggan';
    desktopSlot.innerHTML = `
      <button type="button" class="btn btn-subtle" style="min-height:38px;padding:0.35rem 0.8rem;" data-action="open-auth" data-mode="profile">
        ${renderUserAvatarHtml(u, 24)}
        <span>${escapeHtml(firstName)}</span>
        <span style="font-size:0.65rem;color:var(--text-muted);">(${escapeHtml(roleLabel)})</span>
      </button>
    `;
    if (mobileSlot) {
      mobileSlot.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;padding:0.65rem;border-radius:var(--radius-md);background:var(--bg-subtle);border:1px solid var(--border-hairline);">
          <div style="display:flex;align-items:center;gap:0.55rem;font-size:0.78rem;min-width:0;">
            ${renderUserAvatarHtml(u, 30)}
            <div style="min-width:0;">
              <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(u.name)}</div>
              <div style="font-size:0.7rem;color:var(--accent-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(u.email)}</div>
            </div>
          </div>
          <div style="display:flex;gap:0.35rem;flex-shrink:0;">
            <button type="button" class="btn btn-outline" style="min-height:34px;padding:0.3rem 0.6rem;" data-action="open-auth-mobile" data-mode="edit-profile">Edit</button>
            <button type="button" class="btn btn-dark" style="min-height:34px;padding:0.3rem 0.6rem;" data-action="logout-mobile">Keluar</button>
          </div>
        </div>
      `;
    }
  }
}

export async function refreshCreatorStatus() {
  try {
    const status = await apiRequest('/api/auth/creator-status');
    state.creatorStatus = status;
  } catch {
    // Keep existing status fallback
  }
  return state.creatorStatus;
}

function renderAuthModeSwitcher(activeMode) {
  return `
    <div class="segmented-control" style="grid-template-columns:repeat(3,1fr);" role="tablist" aria-label="Pilih tipe akses akun">
      <button type="button" class="${activeMode === 'register' ? 'is-active' : ''}" data-action="open-auth" data-mode="register">
        Daftar Pelanggan
      </button>
      <button type="button" class="${activeMode === 'login' ? 'is-active' : ''}" data-action="open-auth" data-mode="login">
        Masuk Pelanggan
      </button>
      <button type="button" class="${activeMode === 'creator' ? 'is-active' : ''}" data-action="open-auth" data-mode="creator">
        Akses Creator
      </button>
    </div>
  `;
}

export async function openAuthModal(mode = 'register') {
  const modal = document.getElementById('auth-modal');
  const body = document.getElementById('auth-modal-body');
  if (!modal || !body) return;

  if ((mode === 'profile' || mode === 'edit-profile') && !isAuthenticated()) {
    mode = 'register';
  }

  if (mode === 'creator') {
    await refreshCreatorStatus();
  }

  if (mode === 'edit-profile' && state.currentUser) {
    const u = state.currentUser;
    const isCurator = u.role === 'admin';
    const cityOpts = ['Banda Aceh', 'Aceh Besar', 'Lhokseumawe', 'Takengon', 'Meulaboh']
      .map((c) => `<option value="${c}" ${u.city === c ? 'selected' : ''}>${c}</option>`)
      .join('');
    const skinOpts = ['Semua Jenis Kulit', 'Kombinasi', 'Berminyak', 'Kering', 'Sensitif']
      .map((s) => `<option value="${s}" ${u.skinType === s ? 'selected' : ''}>${s}</option>`)
      .join('');

    body.innerHTML = `
      <div class="modal-banner">
        <div>
          <span style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.9;">
            ${isCurator ? 'Edit Akun Creator' : 'Edit Profil Pelanggan'}
          </span>
          <h2>Perbarui Data Profil</h2>
        </div>
        <button type="button" class="close-circle-btn" data-action="close-auth-modal" aria-label="Tutup edit profil">✕</button>
      </div>

      <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1.1rem;font-size:0.8rem;">
        <form id="edit-profile-form" style="display:flex;flex-direction:column;gap:0.85rem;">
          <div class="photo-uploader">
            <div class="photo-uploader__row">
              <div class="photo-preview-box photo-preview-box--round" id="auth-avatar-preview-wrap">
                ${
                  u.avatarUrl
                    ? `<img id="auth-avatar-preview" src="${escapeHtml(u.avatarUrl)}" alt="${escapeHtml(u.name)}" referrerpolicy="no-referrer" />`
                    : `<span id="auth-avatar-initial" style="font-family:var(--font-serif);font-size:1.75rem;font-weight:700;color:var(--accent-primary);">
                        ${escapeHtml(u.name.charAt(0).toUpperCase())}
                      </span>`
                }
              </div>
              <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:0.4rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:0.4rem;">
                  <label class="field-label" for="auth-avatar-url" style="margin:0;">Link Foto Profil (URL)</label>
                  <button type="button" class="btn btn-subtle" style="min-height:28px;padding:0.2rem 0.55rem;font-size:0.7rem;" data-action="auth-clear-avatar">
                    Hapus
                  </button>
                </div>
                <input
                  class="input"
                  id="auth-avatar-url"
                  type="url"
                  name="avatarUrl"
                  value="${escapeHtml(u.avatarUrl || '')}"
                  placeholder="https://contoh.com/foto-profil.jpg"
                  style="font-size:0.76rem;padding:0.45rem 0.65rem;"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="field-label">${isCurator ? 'Nama Creator / Toko *' : 'Nama Lengkap *'}</label>
            <input class="input" required name="name" value="${escapeHtml(u.name)}" />
          </div>

          <div class="grid-2" style="gap:0.75rem;">
            <div>
              <label class="field-label">Nomor WhatsApp</label>
              <input class="input" name="phone" value="${escapeHtml(u.phone || '')}" placeholder="0812..." />
            </div>
            <div>
              <label class="field-label">Kota / Wilayah</label>
              <select class="select" name="city">${cityOpts}</select>
            </div>
          </div>

          <div>
            <label class="field-label">${isCurator ? 'Fokus Kurasi / Jenis Kulit' : 'Profil Jenis Kulit'}</label>
            <select class="select" name="skinType">${skinOpts}</select>
          </div>

          <div>
            <label class="field-label">${isCurator ? 'Catatan Creator / Cabang Gerai' : 'Bio Singkat (Opsional)'}</label>
            <textarea class="textarea" name="bio" rows="2" placeholder="${isCurator ? 'Contoh: Kurator produk halal area Banda Aceh & Aceh Besar' : 'Catatan preferensi skincare Anda...'}">${escapeHtml(u.bio || '')}</textarea>
          </div>

          <div style="display:flex;gap:0.5rem;padding-top:0.25rem;">
            <button type="button" class="btn btn-outline" data-action="open-auth" data-mode="profile">Batal</button>
            <button type="submit" class="btn btn-primary" style="flex:1;">Simpan Perubahan Profil</button>
          </div>
        </form>

        ${
          isCurator && state.creatorStatus.source !== 'env'
            ? `<form id="creator-change-password-form" class="surface-card surface-card--subtle" style="padding:1rem;display:flex;flex-direction:column;gap:0.65rem;">
                <div style="font-weight:700;color:var(--accent-primary-hover);">Keamanan Password Creator</div>
                <div>
                  <label class="field-label">Password Saat Ini *</label>
                  <input class="input" required type="password" name="currentPassword" autocomplete="current-password" />
                </div>
                <div>
                  <label class="field-label">Password Baru (min. 8 karakter) *</label>
                  <input class="input" required type="password" minlength="8" name="newPassword" autocomplete="new-password" />
                </div>
                <button type="submit" class="btn btn-dark">Perbarui Password Creator</button>
              </form>`
            : ''
        }
      </div>
    `;
  } else if (mode === 'profile' && state.currentUser) {
    const u = state.currentUser;
    body.innerHTML = `
      <div class="modal-banner">
        <div style="display:flex;align-items:center;gap:0.85rem;">
          ${renderUserAvatarHtml(u, 46)}
          <div>
            <span style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.9;">
              ${u.role === 'admin' ? 'Akun Creator Terverifikasi' : 'Pelanggan Terdaftar HalalGlow Aceh'}
            </span>
            <h2>${escapeHtml(u.name)}</h2>
          </div>
        </div>
        <button type="button" class="close-circle-btn" data-action="close-auth-modal" aria-label="Tutup profil">✕</button>
      </div>

      <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1rem;font-size:0.82rem;">
        <div class="surface-card surface-card--subtle" style="padding:1rem;display:flex;flex-direction:column;gap:0.4rem;">
          <div class="budget-row"><span style="color:var(--text-secondary);">Email Akun</span><strong>${escapeHtml(u.email)}</strong></div>
          <div class="budget-row"><span style="color:var(--text-secondary);">Nomor WhatsApp</span><strong>${escapeHtml(u.phone || '-')}</strong></div>
          <div class="budget-row"><span style="color:var(--text-secondary);">Kota Domisili</span><strong>${escapeHtml(u.city || 'Banda Aceh')}</strong></div>
          <div class="budget-row"><span style="color:var(--text-secondary);">Profil Jenis Kulit</span><strong style="color:var(--accent-primary);">${escapeHtml(u.skinType || 'Kombinasi')}</strong></div>
          ${u.bio ? `<div style="padding-top:0.35rem;border-top:1px solid var(--border-hairline);font-size:0.76rem;color:var(--text-secondary);">${escapeHtml(u.bio)}</div>` : ''}
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.6rem;text-align:center;">
          <div class="surface-card" style="padding:0.75rem;">
            <div class="tabular-nums" style="font-size:1.25rem;font-weight:700;color:var(--accent-primary);">${state.wishlist.length}</div>
            <div style="font-size:0.7rem;color:var(--text-secondary);">Beauty Bag</div>
          </div>
          <div class="surface-card" style="padding:0.75rem;">
            <div class="tabular-nums" style="font-size:1.25rem;font-weight:700;color:var(--accent-primary);">${state.activeRoutine.daftarItem.length}</div>
            <div style="font-size:0.7rem;color:var(--text-secondary);">Routine Item</div>
          </div>
          <div class="surface-card" style="padding:0.75rem;">
            <div class="tabular-nums" style="font-size:1.25rem;font-weight:700;color:var(--accent-primary);">${state.orderHistory.length}</div>
            <div style="font-size:0.7rem;color:var(--text-secondary);">Pesanan</div>
          </div>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
          <button type="button" class="btn btn-primary" style="flex:1;" data-action="open-auth" data-mode="edit-profile">
            Edit Profil &amp; Foto
          </button>
          <button type="button" class="btn btn-subtle" style="flex:1;" data-action="auth-go-orders">Riwayat Pesanan</button>
          ${
            u.role === 'admin'
              ? `<button type="button" class="btn btn-dark btn-block" data-action="auth-go-admin">Kelola Katalog &amp; Foto Produk</button>`
              : ''
          }
          <button type="button" class="btn btn-outline btn-block" data-action="logout">Keluar dari Akun</button>
        </div>
      </div>
    `;
  } else if (mode === 'creator') {
    const isClaimed = Boolean(state.creatorStatus.configured);
    const creatorEmail = state.creatorStatus.creatorEmail || 'admin@halalglow.id';

    body.innerHTML = `
      <div class="modal-banner">
        <div>
          <span style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.9;">
            Keamanan Akun Creator
          </span>
          <h2>${isClaimed ? 'Masuk ke Akun Creator' : 'Aktivasi Password Creator'}</h2>
        </div>
        <button type="button" class="close-circle-btn" data-action="close-auth-modal" aria-label="Tutup akses creator">✕</button>
      </div>

      <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1rem;font-size:0.8rem;">
        ${renderAuthModeSwitcher('creator')}

        ${
          isClaimed
            ? `<form id="creator-login-form" style="display:flex;flex-direction:column;gap:0.8rem;">
                <div class="surface-card surface-card--subtle" style="padding:0.85rem;font-size:0.75rem;color:var(--text-secondary);">
                  Akses dasbor <strong>Kelola Toko</strong> dilindungi verifikasi password server agar tidak dapat dibuka pihak luar.
                </div>
                <div>
                  <label class="field-label">Email Creator *</label>
                  <input class="input" required type="email" name="email" value="${escapeHtml(creatorEmail)}" autocomplete="username" />
                </div>
                <div>
                  <label class="field-label">Password Creator *</label>
                  <input class="input" required type="password" name="password" placeholder="Masukkan password Creator" autocomplete="current-password" />
                </div>
                <button type="submit" class="btn btn-primary btn-block">Verifikasi &amp; Buka Kelola Toko</button>
              </form>`
            : `<form id="creator-claim-form" style="display:flex;flex-direction:column;gap:0.8rem;">
                <div class="surface-card surface-card--subtle" style="padding:0.9rem;font-size:0.75rem;color:var(--text-primary);border-color:var(--border-strong);">
                  <strong>Pengaturan Keamanan Awal:</strong> Tetapkan password Creator (minimal 8 karakter) untuk mengunci akses Kelola Toko secara permanen di server.
                </div>
                <div>
                  <label class="field-label">Email Creator</label>
                  <input class="input" readonly type="email" name="email" value="${escapeHtml(creatorEmail)}" />
                </div>
                <div>
                  <label class="field-label">Password Baru Creator (Min. 8 Karakter) *</label>
                  <input class="input" required type="password" minlength="8" name="password" placeholder="Contoh: 12345678" autocomplete="new-password" />
                </div>
                <div>
                  <label class="field-label">Konfirmasi Password Creator *</label>
                  <input class="input" required type="password" minlength="8" name="confirmPassword" placeholder="Ulangi password Creator" autocomplete="new-password" />
                </div>
                <button type="submit" class="btn btn-primary btn-block">Aktifkan &amp; Kunci Akun Creator</button>
              </form>`
        }
      </div>
    `;
  } else if (mode === 'login') {
    body.innerHTML = `
      <div class="modal-banner">
        <div>
          <span style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.9;">HalalGlow Aceh Customer</span>
          <h2>Masuk Akun Pelanggan</h2>
        </div>
        <button type="button" class="close-circle-btn" data-action="close-auth-modal" aria-label="Tutup login">✕</button>
      </div>

      <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1rem;font-size:0.8rem;">
        ${renderAuthModeSwitcher('login')}

        <form id="login-form" style="display:flex;flex-direction:column;gap:0.75rem;">
          <div>
            <label class="field-label">Email Pelanggan *</label>
            <input class="input" required type="email" name="email" placeholder="nama@email.com" autocomplete="email" />
          </div>
          <div>
            <label class="field-label">Kata Sandi *</label>
            <input class="input" required type="password" name="password" placeholder="Masukkan kata sandi" autocomplete="current-password" />
          </div>
          <button type="submit" class="btn btn-primary btn-block">Masuk Sekarang</button>
        </form>

        <p style="text-align:center;color:var(--text-secondary);">
          Belum memiliki akun pelanggan?
          <button type="button" style="border:none;background:transparent;color:var(--accent-primary);font-weight:700;text-decoration:underline;" data-action="open-auth" data-mode="register">
            Daftar Akun Dulu
          </button>
        </p>
      </div>
    `;
  } else {
    body.innerHTML = `
      <div class="modal-banner">
        <div>
          <span style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.9;">Wajib Akun untuk Keranjang &amp; Checkout</span>
          <h2>Daftar Akun Pelanggan</h2>
        </div>
        <button type="button" class="close-circle-btn" data-action="close-auth-modal" aria-label="Tutup pendaftaran">✕</button>
      </div>

      <div style="padding:1.5rem;display:flex;flex-direction:column;gap:0.95rem;font-size:0.8rem;">
        ${renderAuthModeSwitcher('register')}

        <div class="surface-card surface-card--subtle" style="padding:0.75rem 0.9rem;font-size:0.75rem;color:var(--text-secondary);">
          Buat akun pelanggan terlebih dahulu untuk dapat mengecek isi keranjang, memasukkan produk, dan melakukan checkout.
        </div>

        <form id="register-form" style="display:flex;flex-direction:column;gap:0.8rem;">
          <div>
            <label class="field-label">Nama Lengkap *</label>
            <input class="input" required name="name" placeholder="Contoh: Cut Zahra Safira" autocomplete="name" />
          </div>
          <div>
            <label class="field-label">Email *</label>
            <input class="input" required type="email" name="email" placeholder="nama@email.com" autocomplete="email" />
          </div>
          <div class="grid-2" style="gap:0.75rem;">
            <div>
              <label class="field-label">Kata Sandi (min. 6 karakter) *</label>
              <input class="input" required type="password" minlength="6" name="password" placeholder="Min. 6 karakter" autocomplete="new-password" />
            </div>
            <div>
              <label class="field-label">Nomor WhatsApp</label>
              <input class="input" name="phone" placeholder="0812..." autocomplete="tel" />
            </div>
          </div>
          <div class="grid-2" style="gap:0.75rem;">
            <div>
              <label class="field-label">Kota di Aceh</label>
              <select class="select" name="city">
                <option value="Banda Aceh">Banda Aceh</option>
                <option value="Aceh Besar">Aceh Besar</option>
                <option value="Lhokseumawe">Lhokseumawe</option>
                <option value="Takengon">Takengon</option>
                <option value="Meulaboh">Meulaboh</option>
              </select>
            </div>
            <div>
              <label class="field-label">Jenis Kulit</label>
              <select class="select" name="skinType">
                <option value="Kombinasi">Kombinasi</option>
                <option value="Berminyak">Berminyak</option>
                <option value="Kering">Kering</option>
                <option value="Sensitif">Sensitif</option>
              </select>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block">Buat Akun &amp; Masuk</button>
        </form>
      </div>
    `;
  }

  modal.classList.remove('is-hidden');
}

export function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.add('is-hidden');
}

export function handleAvatarUrlInput(urlValue) {
  const trimmed = (urlValue || '').trim();
  const wrap = document.getElementById('auth-avatar-preview-wrap');
  const initial = state.currentUser ? state.currentUser.name.charAt(0).toUpperCase() : 'U';
  if (!wrap) return;

  let safeUrl = '';
  if (trimmed) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        safeUrl = parsed.toString();
      }
    } catch {
      // Ignore invalid URL while typing
    }
  }

  if (safeUrl) {
    wrap.innerHTML = `<img id="auth-avatar-preview" src="${escapeHtml(safeUrl)}" alt="Preview Foto Profil" referrerpolicy="no-referrer" />`;
    const img = document.getElementById('auth-avatar-preview');
    if (img instanceof HTMLImageElement) {
      img.addEventListener(
        'error',
        () => {
          wrap.innerHTML = `<span style="font-family:var(--font-serif);font-size:1.75rem;font-weight:700;color:var(--accent-primary);">${escapeHtml(initial)}</span>`;
        },
        { once: true }
      );
    }
  } else {
    wrap.innerHTML = `<span style="font-family:var(--font-serif);font-size:1.75rem;font-weight:700;color:var(--accent-primary);">${escapeHtml(initial)}</span>`;
  }
}

export function clearAvatarPreview() {
  const urlInput = document.getElementById('auth-avatar-url');
  const wrap = document.getElementById('auth-avatar-preview-wrap');
  const initial = state.currentUser ? state.currentUser.name.charAt(0).toUpperCase() : 'U';

  if (urlInput instanceof HTMLInputElement) urlInput.value = '';
  if (wrap) {
    wrap.innerHTML = `<span style="font-family:var(--font-serif);font-size:1.75rem;font-weight:700;color:var(--accent-primary);">${escapeHtml(initial)}</span>`;
  }
}

export async function handleEditProfileSubmit(formElement) {
  if (!isAuthenticated()) return;
  const fd = new FormData(formElement);
  try {
    const res = await apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: {
        name: String(fd.get('name') || '').trim(),
        phone: String(fd.get('phone') || '').trim(),
        city: String(fd.get('city') || 'Banda Aceh'),
        skinType: String(fd.get('skinType') || 'Kombinasi'),
        bio: String(fd.get('bio') || '').trim(),
        avatarUrl: String(fd.get('avatarUrl') || '').trim()
      }
    });
    state.currentUser = res.user;
    renderHeaderAuth();
    openAuthModal('profile');
    showToast('Profil akun berhasil diperbarui.');
  } catch (err) {
    showToast(err instanceof Error ? err.message : 'Gagal memperbarui profil.', 'warn');
  }
}

export function openCuratorProfileEditor() {
  if (!isCreatorUser()) {
    showToast('Masuk sebagai akun Creator terlebih dahulu.', 'warn');
    openAuthModal('creator');
    return;
  }
  openAuthModal('edit-profile');
}

export async function handleLoginSubmit(formElement) {
  const fd = new FormData(formElement);
  const email = String(fd.get('email') || '').trim().toLowerCase();
  const password = String(fd.get('password') || '');

  try {
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    setSessionAuth(res.token, res.user, res.cart, res.orders);
    renderHeaderAuth();
    closeAuthModal();
    notifyAuthStateChanged({ role: res.user.role });
    showToast(`Berhasil masuk sebagai ${res.user.name}.`);
  } catch (err) {
    showToast(err instanceof Error ? err.message : 'Gagal masuk ke akun.', 'warn');
  }
}

export async function handleRegisterSubmit(formElement) {
  const fd = new FormData(formElement);
  try {
    const res = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: String(fd.get('name') || '').trim(),
        email: String(fd.get('email') || '').trim().toLowerCase(),
        password: String(fd.get('password') || ''),
        phone: String(fd.get('phone') || '').trim(),
        city: String(fd.get('city') || 'Banda Aceh'),
        skinType: String(fd.get('skinType') || 'Kombinasi')
      }
    });
    setSessionAuth(res.token, res.user, res.cart, res.orders);
    renderHeaderAuth();
    closeAuthModal();
    notifyAuthStateChanged({ role: res.user.role });
    showToast(`Akun berhasil dibuat! Selamat datang, ${res.user.name}.`);
  } catch (err) {
    showToast(err instanceof Error ? err.message : 'Pendaftaran akun gagal.', 'warn');
  }
}

export async function handleCreatorClaimSubmit(formElement) {
  const fd = new FormData(formElement);
  const email = String(fd.get('email') || '').trim().toLowerCase();
  const password = String(fd.get('password') || '');
  const confirmPassword = String(fd.get('confirmPassword') || '');

  if (password !== confirmPassword) {
    showToast('Konfirmasi password Creator tidak sama.', 'warn');
    return;
  }

  try {
    const res = await apiRequest('/api/auth/creator-claim', {
      method: 'POST',
      body: { email, password }
    });
    state.creatorStatus = { configured: true, source: 'claimed', creatorEmail: email };
    setSessionAuth(res.token, res.user, res.cart, res.orders);
    renderHeaderAuth();
    closeAuthModal();
    notifyAuthStateChanged({ role: 'admin', switchToAdmin: true });
    showToast('Password Creator berhasil diaktifkan & dikunci.');
  } catch (err) {
    showToast(err instanceof Error ? err.message : 'Gagal mengaktifkan akun Creator.', 'warn');
  }
}

export async function handleCreatorLoginSubmit(formElement) {
  const fd = new FormData(formElement);
  const email = String(fd.get('email') || '').trim().toLowerCase();
  const password = String(fd.get('password') || '');

  try {
    const res = await apiRequest('/api/auth/creator-login', {
      method: 'POST',
      body: { email, password }
    });
    setSessionAuth(res.token, res.user, res.cart, res.orders);
    renderHeaderAuth();
    closeAuthModal();
    notifyAuthStateChanged({ role: 'admin', switchToAdmin: true });
    showToast(`Selamat datang di area Creator, ${res.user.name}.`);
  } catch (err) {
    showToast(err instanceof Error ? err.message : 'Password Creator tidak valid.', 'warn');
  }
}

export async function handleCreatorChangePasswordSubmit(formElement) {
  const fd = new FormData(formElement);
  try {
    await apiRequest('/api/auth/creator-change-password', {
      method: 'POST',
      body: {
        currentPassword: String(fd.get('currentPassword') || ''),
        newPassword: String(fd.get('newPassword') || '')
      }
    });
    formElement.reset();
    showToast('Password Creator berhasil diperbarui.');
  } catch (err) {
    showToast(err instanceof Error ? err.message : 'Gagal memperbarui password Creator.', 'warn');
  }
}

export async function logoutUser() {
  try {
    if (isAuthenticated()) {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    }
  } catch {
    // Ignore logout network errors and clear local memory session
  }
  clearSessionAuth();
  renderHeaderAuth();
  closeAuthModal();
  notifyAuthStateChanged({ role: null });
  showToast('Anda telah keluar dari akun.', 'warn');
}
