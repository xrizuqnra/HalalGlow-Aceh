// Demo Authentication Modal (Login, Register, 1-Click Demo Login, Profile & Edit Profile)

import { state, persistAuth } from '../state/store.js';
import { I18N } from '../data/i18n.js';
import { escapeHtml, showToast } from '../utils/format.js';

function renderUserAvatarHtml(user, sizePx = 24) {
  const initial = escapeHtml((user?.name || 'U').trim().charAt(0).toUpperCase());
  if (user?.avatarUrl) {
    return `<img src="${escapeHtml(user.avatarUrl)}" alt="${escapeHtml(user.name)}" class="avatar-img" style="width:${sizePx}px;height:${sizePx}px;" />`;
  }
  return `<span style="width:${sizePx}px;height:${sizePx}px;border-radius:9999px;background:var(--accent-primary);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:${Math.round(sizePx * 0.45)}px;font-weight:700;flex-shrink:0;">${initial}</span>`;
}

export function renderHeaderAuth() {
  const desktopSlot = document.getElementById('header-auth-slot');
  const mobileSlot = document.getElementById('mobile-auth-slot');
  if (!desktopSlot) return;

  if (!state.currentUser) {
    const loginLabel = I18N[state.currentLang]?.navLogin || 'Masuk';
    desktopSlot.innerHTML = `
      <button type="button" class="btn btn-dark" style="min-height:38px;padding:0.4rem 0.9rem;" data-action="open-auth" data-mode="login">
        ${escapeHtml(loginLabel)}
      </button>
    `;
    if (mobileSlot) {
      mobileSlot.innerHTML = `
        <button type="button" class="btn btn-dark btn-block" data-action="open-auth-mobile" data-mode="login">
          Masuk / Daftar Akun
        </button>
      `;
    }
  } else {
    const firstName = state.currentUser.name.split(' ')[0];
    const roleLabel = state.currentUser.role === 'admin' ? 'Curator' : 'Member';
    desktopSlot.innerHTML = `
      <button type="button" class="btn btn-subtle" style="min-height:38px;padding:0.35rem 0.8rem;" data-action="open-auth" data-mode="profile">
        ${renderUserAvatarHtml(state.currentUser, 24)}
        <span>${escapeHtml(firstName)}</span>
        <span style="font-size:0.65rem;color:var(--text-muted);">(${escapeHtml(roleLabel)})</span>
      </button>
    `;
    if (mobileSlot) {
      mobileSlot.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;padding:0.65rem;border-radius:var(--radius-md);background:var(--bg-subtle);border:1px solid var(--border-hairline);">
          <div style="display:flex;align-items:center;gap:0.55rem;font-size:0.78rem;min-width:0;">
            ${renderUserAvatarHtml(state.currentUser, 30)}
            <div style="min-width:0;">
              <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(state.currentUser.name)}</div>
              <div style="font-size:0.7rem;color:var(--accent-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(state.currentUser.email)}</div>
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

export function openAuthModal(mode = 'login') {
  const modal = document.getElementById('auth-modal');
  const body = document.getElementById('auth-modal-body');
  if (!modal || !body) return;

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
            ${isCurator ? 'Edit Akun Kurator' : 'Edit Profil Member'}
          </span>
          <h2>Perbarui Data Profil</h2>
        </div>
        <button type="button" class="close-circle-btn" data-action="close-auth-modal" aria-label="Tutup edit profil">✕</button>
      </div>

      <form id="edit-profile-form" style="padding:1.5rem;display:flex;flex-direction:column;gap:0.85rem;font-size:0.8rem;">
        <!-- Avatar Photo URL Input -->
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
          <label class="field-label">${isCurator ? 'Nama Kurator / Toko *' : 'Nama Lengkap *'}</label>
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
          <label class="field-label">${isCurator ? 'Catatan Kurator / Cabang Gerai' : 'Bio Singkat (Opsional)'}</label>
          <textarea class="textarea" name="bio" rows="2" placeholder="${isCurator ? 'Contoh: Kurator produk halal area Banda Aceh & Aceh Besar' : 'Catatan preferensi skincare Anda...'}">${escapeHtml(u.bio || '')}</textarea>
        </div>

        <div style="display:flex;gap:0.5rem;padding-top:0.25rem;">
          <button type="button" class="btn btn-outline" data-action="open-auth" data-mode="profile">Batal</button>
          <button type="submit" class="btn btn-primary" style="flex:1;">Simpan Perubahan Profil</button>
        </div>
      </form>
    `;
  } else if (mode === 'profile' && state.currentUser) {
    const u = state.currentUser;
    body.innerHTML = `
      <div class="modal-banner">
        <div style="display:flex;align-items:center;gap:0.85rem;">
          ${renderUserAvatarHtml(u, 46)}
          <div>
            <span style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.9;">
              ${u.role === 'admin' ? 'Store Curator Aceh' : 'HalalGlow Beauty Member'}
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
  } else if (mode === 'register') {
    body.innerHTML = `
      <div class="modal-banner">
        <div>
          <span style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.9;">New Beauty Member</span>
          <h2>Daftar Akun HalalGlow Aceh</h2>
        </div>
        <button type="button" class="close-circle-btn" data-action="close-auth-modal" aria-label="Tutup pendaftaran">✕</button>
      </div>

      <form id="register-form" style="padding:1.5rem;display:flex;flex-direction:column;gap:0.85rem;font-size:0.8rem;">
        <div>
          <label class="field-label">Nama Lengkap *</label>
          <input class="input" required name="name" placeholder="Contoh: Cut Zahra Safira" />
        </div>
        <div>
          <label class="field-label">Email *</label>
          <input class="input" required type="email" name="email" placeholder="nama@email.com" />
        </div>
        <div class="grid-2" style="gap:0.75rem;">
          <div>
            <label class="field-label">Kata Sandi *</label>
            <input class="input" required type="password" name="password" placeholder="Min. 3 karakter" />
          </div>
          <div>
            <label class="field-label">Nomor WhatsApp</label>
            <input class="input" name="phone" placeholder="0812..." />
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

        <p style="text-align:center;color:var(--text-secondary);">
          Sudah punya akun?
          <button type="button" style="border:none;background:transparent;color:var(--accent-primary);font-weight:700;text-decoration:underline;" data-action="open-auth" data-mode="login">
            Masuk di sini
          </button>
        </p>
      </form>
    `;
  } else {
    body.innerHTML = `
      <div class="modal-banner">
        <div>
          <span style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;opacity:0.9;">HalalGlow Aceh Account</span>
          <h2>Masuk ke Akun Anda</h2>
        </div>
        <button type="button" class="close-circle-btn" data-action="close-auth-modal" aria-label="Tutup login">✕</button>
      </div>

      <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1rem;font-size:0.8rem;">
        <div class="surface-card surface-card--subtle" style="padding:0.9rem;">
          <div style="font-weight:700;margin-bottom:0.5rem;">Masuk Cepat Akun Demo (1-Klik):</div>
          <div class="grid-2" style="gap:0.5rem;">
            <button type="button" class="btn btn-outline" style="justify-content:flex-start;text-align:left;padding:0.55rem 0.75rem;" data-action="quick-login" data-role="member">
              <span>Pelanggan · Cut Nyak Meutia</span>
            </button>
            <button type="button" class="btn btn-subtle" style="justify-content:flex-start;text-align:left;padding:0.55rem 0.75rem;" data-action="quick-login" data-role="admin">
              <span>Pengelola · Kurator Aceh</span>
            </button>
          </div>
        </div>

        <form id="login-form" style="display:flex;flex-direction:column;gap:0.75rem;">
          <div>
            <label class="field-label">Email</label>
            <input class="input" required type="email" name="email" value="meutia@halalglow.id" />
          </div>
          <div>
            <label class="field-label">Kata Sandi</label>
            <input class="input" required type="password" name="password" value="123" />
          </div>
          <button type="submit" class="btn btn-primary btn-block">Masuk Sekarang</button>
        </form>

        <p style="text-align:center;color:var(--text-secondary);">
          Belum memiliki akun member?
          <button type="button" style="border:none;background:transparent;color:var(--accent-primary);font-weight:700;text-decoration:underline;" data-action="open-auth" data-mode="register">
            Daftar Gratis
          </button>
        </p>
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

  if (trimmed) {
    wrap.innerHTML = `<img id="auth-avatar-preview" src="${escapeHtml(trimmed)}" alt="Preview Foto Profil" referrerpolicy="no-referrer" />`;
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

export function handleEditProfileSubmit(formElement) {
  if (!state.currentUser) return;
  const fd = new FormData(formElement);
  const updated = {
    ...state.currentUser,
    name: String(fd.get('name') || state.currentUser.name).trim(),
    phone: String(fd.get('phone') || '').trim(),
    city: String(fd.get('city') || 'Banda Aceh'),
    skinType: String(fd.get('skinType') || 'Kombinasi'),
    bio: String(fd.get('bio') || '').trim(),
    avatarUrl: String(fd.get('avatarUrl') || '').trim()
  };

  state.currentUser = updated;
  const idx = state.registeredUsers.findIndex((u) => u.id === updated.id);
  if (idx >= 0) {
    state.registeredUsers[idx] = updated;
  }

  persistAuth();
  renderHeaderAuth();
  openAuthModal('profile');
  showToast('Profil akun berhasil diperbarui.');
}

export function openCuratorProfileEditor() {
  if (!state.currentUser || state.currentUser.role !== 'admin') {
    const curatorUser = state.registeredUsers.find((u) => u.role === 'admin');
    if (curatorUser) {
      state.currentUser = curatorUser;
      persistAuth();
      renderHeaderAuth();
    }
  }
  openAuthModal('edit-profile');
}

export function quickDemoLogin(role) {
  const target = state.registeredUsers.find((u) => u.role === role) || state.registeredUsers[0];
  state.currentUser = target;
  persistAuth();
  renderHeaderAuth();
  closeAuthModal();
  showToast(`Selamat datang kembali, ${state.currentUser.name}.`);
  return role;
}

export function handleLoginSubmit(formElement) {
  const fd = new FormData(formElement);
  const email = String(fd.get('email') || '').trim().toLowerCase();
  const password = String(fd.get('password') || '');

  const matched = state.registeredUsers.find(
    (u) => u.email.toLowerCase() === email && u.password === password
  );

  if (!matched) {
    showToast('Email atau kata sandi tidak cocok. Coba tombol Masuk Cepat Demo.', 'warn');
    return;
  }

  state.currentUser = matched;
  persistAuth();
  renderHeaderAuth();
  closeAuthModal();
  showToast(`Berhasil masuk sebagai ${state.currentUser.name}.`);
}

export function handleRegisterSubmit(formElement) {
  const fd = new FormData(formElement);
  const email = String(fd.get('email') || '').trim().toLowerCase();

  if (state.registeredUsers.some((u) => u.email.toLowerCase() === email)) {
    showToast('Email sudah terdaftar. Silakan masuk melalui tab Login.', 'warn');
    return;
  }

  const newUser = {
    id: 'usr-' + Date.now(),
    name: String(fd.get('name') || '').trim(),
    email,
    password: String(fd.get('password') || '123'),
    phone: String(fd.get('phone') || '').trim(),
    city: String(fd.get('city') || 'Banda Aceh'),
    skinType: String(fd.get('skinType') || 'Kombinasi'),
    role: 'member',
    avatarUrl: '',
    bio: ''
  };

  state.registeredUsers.push(newUser);
  state.currentUser = newUser;
  persistAuth();
  renderHeaderAuth();
  closeAuthModal();
  showToast(`Akun berhasil dibuat. Selamat datang, ${state.currentUser.name}.`);
}

export function logoutUser() {
  state.currentUser = null;
  persistAuth();
  renderHeaderAuth();
  closeAuthModal();
  showToast('Anda telah keluar dari akun.', 'warn');
}
