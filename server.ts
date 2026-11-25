import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { DEFAULT_DATA } from './src/data/defaults.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const CREATOR_EMAIL = 'admin@halalglow.id';
const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'server-store.json');

// Session signing key from env or ephemeral random 32-byte key (never hardcoded)
const SESSION_SECRET =
  (process.env.SESSION_SECRET || '').trim() || crypto.randomBytes(32).toString('hex');
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

interface AuthPayload {
  uid: string;
  role: 'member' | 'admin';
  email: string;
  jti: string;
  exp: number;
}

interface AuthenticatedRequest extends Request {
  auth?: AuthPayload;
}

interface StoredCustomer {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  city: string;
  skinType: string;
  role: 'member';
  bio: string;
  avatarUrl: string;
  createdAt: string;
}

interface CartItem {
  uid: string;
  prodId: string;
  variant: string;
  qty: number;
}

interface UserCart {
  items: CartItem[];
  shippingMethod: 'pickup' | 'instant' | 'regular';
  pickupStore: string;
  voucherCode: string;
}

interface OrderRecord {
  invoiceId: string;
  userId: string;
  tanggal: string;
  status: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  paymentMethod: string;
  shippingMethod: string;
  pickupStore: string;
  voucherCode: string;
  items: Array<{
    prodId: string;
    nama: string;
    brand: string;
    variant: string;
    harga: number;
    qty: number;
  }>;
  subtotal: number;
  discount: number;
  shippingCost: number;
  grandTotal: number;
}

interface ServerStore {
  appData: {
    products: Array<Record<string, unknown>>;
    stores: Array<Record<string, unknown>>;
    bundles: Array<Record<string, unknown>>;
  };
  creatorAuth: {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    skinType: string;
    bio: string;
    avatarUrl: string;
    role: 'admin';
    passwordHash: string | null;
    claimedAt: string | null;
  };
  customers: StoredCustomer[];
  cartsByUserId: Record<string, UserCart>;
  orders: OrderRecord[];
}

const revokedTokenJtis = new Set<string>();
const rateLimitBuckets = new Map<string, number[]>();

function createInitialStore(): ServerStore {
  return {
    appData: structuredClone(DEFAULT_DATA),
    creatorAuth: {
      id: 'usr-creator-1',
      name: 'Kurator Gerai Aceh',
      email: CREATOR_EMAIL,
      phone: '081200005501',
      city: 'Banda Aceh',
      skinType: 'Semua Jenis Kulit',
      bio: '',
      avatarUrl: '',
      role: 'admin',
      passwordHash: null,
      claimedAt: null
    },
    customers: [],
    cartsByUserId: {},
    orders: []
  };
}

function loadStore(): ServerStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      const parsed = JSON.parse(raw) as Partial<ServerStore>;
      const base = createInitialStore();
      return {
        appData: parsed.appData?.products ? parsed.appData : base.appData,
        creatorAuth: parsed.creatorAuth ? { ...base.creatorAuth, ...parsed.creatorAuth } : base.creatorAuth,
        customers: Array.isArray(parsed.customers) ? parsed.customers : [],
        cartsByUserId: parsed.cartsByUserId && typeof parsed.cartsByUserId === 'object' ? parsed.cartsByUserId : {},
        orders: Array.isArray(parsed.orders) ? parsed.orders : []
      };
    }
  } catch {
    // Fall back to fresh store
  }
  const initial = createInitialStore();
  saveStore(initial);
  return initial;
}

function saveStore(data: ServerStore): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${STORE_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpFile, STORE_FILE);
}

const store = loadStore();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPasswordHash(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const storedBuf = Buffer.from(keyHex, 'hex');
    if (derived.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(derived, storedBuf);
  } catch {
    return false;
  }
}

function verifyConstantTimeText(candidate: string, expected: string): boolean {
  const h1 = crypto.createHash('sha256').update(candidate).digest();
  const h2 = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(h1, h2);
}

function getEnvCreatorPasscode(): string {
  return (process.env.CREATOR_PASSCODE || '').trim();
}

function signSessionToken(uid: string, role: 'member' | 'admin', email: string): string {
  const payload: AuthPayload = {
    uid,
    role,
    email,
    jti: crypto.randomBytes(16).toString('hex'),
    exp: Date.now() + TOKEN_TTL_MS
  };
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifySessionToken(token: string): AuthPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;

  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as AuthPayload;
    if (!parsed.uid || !parsed.role || !parsed.jti || typeof parsed.exp !== 'number') {
      return null;
    }
    if (Date.now() > parsed.exp || revokedTokenJtis.has(parsed.jti)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function sanitizeHttpUrl(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return '';
  } catch {
    return '';
  }
}

function sanitizeString(raw: unknown, maxLen = 400): string {
  if (typeof raw !== 'string') return '';
  return raw.trim().slice(0, maxLen);
}

function sanitizeUserResponse(user: StoredCustomer | ServerStore['creatorAuth']) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    city: user.city,
    skinType: user.skinType,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    role: user.role
  };
}

function getDefaultCart(): UserCart {
  return {
    items: [],
    shippingMethod: 'pickup',
    pickupStore: 'HalalGlow Suzuya Mall Banda Aceh',
    voucherCode: ''
  };
}

function getOrCreateUserCart(userId: string): UserCart {
  if (!store.cartsByUserId[userId]) {
    store.cartsByUserId[userId] = getDefaultCart();
  }
  return store.cartsByUserId[userId];
}

function computeCartTotals(cart: UserCart) {
  let subtotal = 0;
  let totalQty = 0;

  for (const item of cart.items) {
    const prod = store.appData.products.find((p) => p.id === item.prodId);
    if (!prod) continue;
    const price = Number(prod.harga) || 0;
    const qty = Math.max(1, Math.min(99, Math.floor(Number(item.qty) || 1)));
    subtotal += price * qty;
    totalQty += qty;
  }

  let discount = 0;
  const code = (cart.voucherCode || '').toUpperCase();
  if (subtotal > 0) {
    if (code === 'HALALGLOW10') {
      discount = Math.round(subtotal * 0.1);
    } else if (code === 'ACEHCANTIK') {
      discount = Math.min(subtotal, 15000);
    }
  }

  let shippingCost = 0;
  if (subtotal > 0) {
    if (cart.shippingMethod === 'instant') shippingCost = 12000;
    else if (cart.shippingMethod === 'regular') shippingCost = 20000;
  }

  const grandTotal = Math.max(0, subtotal - discount + shippingCost);
  return { subtotal, discount, shippingCost, grandTotal, totalQty };
}

function checkAuthRateLimit(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  const recent = (rateLimitBuckets.get(key) || []).filter((ts) => now - ts < windowMs);
  if (recent.length >= 25) {
    res.status(429).json({ error: 'Terlalu banyak percobaan login. Silakan tunggu beberapa menit.' });
    return;
  }
  recent.push(now);
  rateLimitBuckets.set(key, recent);
  next();
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) {
    res.status(401).json({ error: 'Silakan buat akun atau masuk terlebih dahulu.' });
    return;
  }
  const payload = verifySessionToken(match[1].trim());
  if (!payload) {
    res.status(401).json({ error: 'Sesi Anda telah berakhir. Silakan masuk kembali.' });
    return;
  }
  req.auth = payload;
  next();
}

function requireCreator(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.auth || req.auth.role !== 'admin') {
    res.status(403).json({ error: 'Akses ditolak. Fitur ini khusus untuk akun Creator.' });
    return;
  }
  next();
}

function sanitizeProductPayload(body: Record<string, unknown>, existing?: Record<string, unknown>) {
  const brand = sanitizeString(body.brand, 80);
  const nama = sanitizeString(body.nama, 160);
  if (!brand || !nama) {
    return null;
  }
  const rawUrls = Array.isArray(body.imageUrls)
    ? body.imageUrls.map((u) => sanitizeHttpUrl(u)).filter(Boolean)
    : [];
  const fallbackSingle = sanitizeHttpUrl(body.imageUrl);
  if (fallbackSingle && !rawUrls.includes(fallbackSingle)) {
    rawUrls.unshift(fallbackSingle);
  }
  const uniqueUrls = Array.from(new Set(rawUrls)).slice(0, 12);

  const shades = Array.isArray(body.shades)
    ? body.shades
        .map((s) => {
          if (!s || typeof s !== 'object') return null;
          const obj = s as Record<string, unknown>;
          const name = sanitizeString(obj.name, 60);
          const hex = typeof obj.hex === 'string' && /^#[0-9A-Fa-f]{3,6}$/.test(obj.hex.trim())
            ? obj.hex.trim()
            : '#E11D74';
          return name ? { name, hex } : null;
        })
        .filter(Boolean)
    : [];

  return {
    id: existing ? String(existing.id) : `prod-${Date.now()}`,
    brand,
    nama,
    kategori: sanitizeString(body.kategori, 60) || 'Skincare',
    subKategori: sanitizeString(body.subKategori, 60) || 'Skincare',
    harga: Math.max(0, Math.round(Number(body.harga) || 0)),
    artAccent: typeof existing?.artAccent === 'string' ? existing.artAccent : '#E11D74',
    artBg: typeof existing?.artBg === 'string' ? existing.artBg : '#FCE7F3',
    statusHalal: sanitizeString(body.statusHalal, 120) || 'Tersertifikasi Halal BPJPH/MUI',
    nomorHalal: sanitizeString(body.nomorHalal, 120) || 'ID00410000999 (Simulasi)',
    nomorBpom: sanitizeString(body.nomorBpom, 120) || 'NA18260000000 (Simulasi)',
    imageUrl: uniqueUrls[0] || '',
    imageUrls: uniqueUrls,
    jenisKulit: Array.isArray(body.jenisKulit)
      ? body.jenisKulit.map((v) => sanitizeString(v, 40)).filter(Boolean)
      : ['Semua Jenis Kulit'],
    infoWudhu: sanitizeString(body.infoWudhu, 500) || 'Dapat dibersihkan menggunakan micellar water sebelum berwudhu.',
    kandunganUtama: Array.isArray(body.kandunganUtama)
      ? body.kandunganUtama.map((v) => sanitizeString(v, 80)).filter(Boolean)
      : ['Niacinamide'],
    shades,
    geraiTersedia: Array.isArray(body.geraiTersedia)
      ? body.geraiTersedia.map((v) => sanitizeString(v, 100)).filter(Boolean)
      : ['Gerai Mitra Aceh'],
    deskripsi: sanitizeString(body.deskripsi, 800),
    unggulan: existing ? Boolean(existing.unggulan) : true
  };
}

function sanitizeStorePayload(body: Record<string, unknown>, existing?: Record<string, unknown>) {
  const nama = sanitizeString(body.nama, 140);
  const wilayah = sanitizeString(body.wilayah, 60) || 'Banda Aceh';
  const alamat = sanitizeString(body.alamat, 300);
  if (!nama || !alamat) return null;

  const kontakDigits = sanitizeString(body.kontak, 30).replace(/[^0-9]/g, '') || '6281200005599';
  return {
    id: existing ? String(existing.id) : `str-${Date.now()}`,
    nama,
    wilayah,
    alamat,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${nama} ${wilayah}`)}`,
    brandTersedia: Array.isArray(body.brandTersedia)
      ? body.brandTersedia.map((v) => sanitizeString(v, 60)).filter(Boolean)
      : ['Wardah', 'Make Over'],
    layanan: Array.isArray(body.layanan)
      ? body.layanan.map((v) => sanitizeString(v, 80)).filter(Boolean)
      : ['Tester Produk', 'Konsultasi Beauty Advisor'],
    kontak: kontakDigits
  };
}

function sanitizeBundlePayload(body: Record<string, unknown>, existing?: Record<string, unknown>) {
  const nama = sanitizeString(body.nama, 160);
  const deskripsi = sanitizeString(body.deskripsi, 800);
  if (!nama || !deskripsi) return null;

  const validProdIds = new Set(store.appData.products.map((p) => String(p.id)));
  const daftarProduk = Array.isArray(body.daftarProduk)
    ? body.daftarProduk.map((id) => String(id)).filter((id) => validProdIds.has(id))
    : [];

  return {
    id: existing ? String(existing.id) : `bnd-${Date.now()}`,
    nama,
    jenisKulit: sanitizeString(body.jenisKulit, 60) || 'Semua Jenis Kulit',
    fokus: sanitizeString(body.fokus, 80) || 'Daily Natural Makeup',
    estimasiBiaya: Math.max(0, Math.round(Number(body.estimasiBiaya) || 0)),
    deskripsi,
    daftarProduk:
      daftarProduk.length > 0
        ? daftarProduk
        : store.appData.products.slice(0, 3).map((p) => String(p.id))
  };
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', true);
  app.use(express.json({ limit: '1mb' }));

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Public catalog bootstrap (no user credentials, carts, or orders)
  app.get('/api/bootstrap', (_req, res) => {
    res.json({
      appData: store.appData
    });
  });

  // Creator security status (never returns password or hash)
  app.get('/api/auth/creator-status', (_req, res) => {
    const envPasscode = getEnvCreatorPasscode();
    const configured = envPasscode.length > 0 || Boolean(store.creatorAuth.passwordHash);
    const source = envPasscode.length > 0 ? 'env' : store.creatorAuth.passwordHash ? 'claimed' : 'unclaimed';
    res.json({
      configured,
      source,
      creatorEmail: store.creatorAuth.email
    });
  });

  // First-run Creator password claim (locks immediately once claimed or if CREATOR_PASSCODE env is set)
  app.post('/api/auth/creator-claim', checkAuthRateLimit, (req, res) => {
    const envPasscode = getEnvCreatorPasscode();
    if (envPasscode.length > 0) {
      res.status(403).json({ error: 'Password Creator sudah dikunci melalui Secrets server.' });
      return;
    }
    if (store.creatorAuth.passwordHash) {
      res.status(409).json({ error: 'Password Creator sudah pernah diaktifkan. Gunakan form login Creator.' });
      return;
    }

    const email = sanitizeString(req.body?.email, 120).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (email !== store.creatorAuth.email) {
      res.status(400).json({ error: `Email Creator harus ${store.creatorAuth.email}.` });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Password Creator minimal 8 karakter.' });
      return;
    }

    store.creatorAuth.passwordHash = hashPassword(password);
    store.creatorAuth.claimedAt = new Date().toISOString();
    saveStore(store);

    const token = signSessionToken(store.creatorAuth.id, 'admin', store.creatorAuth.email);
    res.status(201).json({
      token,
      user: sanitizeUserResponse(store.creatorAuth),
      cart: getOrCreateUserCart(store.creatorAuth.id),
      orders: store.orders
    });
  });

  // Creator Login (server-verified only)
  app.post('/api/auth/creator-login', checkAuthRateLimit, (req, res) => {
    const email = sanitizeString(req.body?.email, 120).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (email !== store.creatorAuth.email || !password) {
      res.status(401).json({ error: 'Email atau password Creator tidak sesuai.' });
      return;
    }

    const envPasscode = getEnvCreatorPasscode();
    let valid = false;
    if (envPasscode.length > 0) {
      valid = verifyConstantTimeText(password, envPasscode);
    } else if (store.creatorAuth.passwordHash) {
      valid = verifyPasswordHash(password, store.creatorAuth.passwordHash);
    } else {
      res.status(403).json({ error: 'Akun Creator belum diaktifkan. Silakan atur password Creator terlebih dahulu.' });
      return;
    }

    if (!valid) {
      res.status(401).json({ error: 'Email atau password Creator tidak sesuai.' });
      return;
    }

    const token = signSessionToken(store.creatorAuth.id, 'admin', store.creatorAuth.email);
    res.json({
      token,
      user: sanitizeUserResponse(store.creatorAuth),
      cart: getOrCreateUserCart(store.creatorAuth.id),
      orders: store.orders
    });
  });

  // Creator password change (requires active Creator session)
  app.post('/api/auth/creator-change-password', requireAuth, requireCreator, (req: AuthenticatedRequest, res) => {
    if (getEnvCreatorPasscode().length > 0) {
      res.status(400).json({ error: 'Password Creator dikelola melalui environment CREATOR_PASSCODE di Secrets.' });
      return;
    }
    const currentPassword = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
    const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

    if (!store.creatorAuth.passwordHash || !verifyPasswordHash(currentPassword, store.creatorAuth.passwordHash)) {
      res.status(401).json({ error: 'Password saat ini tidak sesuai.' });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: 'Password baru minimal 8 karakter.' });
      return;
    }

    store.creatorAuth.passwordHash = hashPassword(newPassword);
    saveStore(store);
    res.json({ ok: true });
  });

  // Customer Registration (required before checking/adding to cart)
  app.post('/api/auth/register', checkAuthRateLimit, (req, res) => {
    const name = sanitizeString(req.body?.name, 80);
    const email = sanitizeString(req.body?.email, 120).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const phone = sanitizeString(req.body?.phone, 30);
    const city = sanitizeString(req.body?.city, 60) || 'Banda Aceh';
    const skinType = sanitizeString(req.body?.skinType, 60) || 'Kombinasi';

    if (!name || name.length < 2) {
      res.status(400).json({ error: 'Nama lengkap minimal 2 karakter.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Format email tidak valid.' });
      return;
    }
    if (email === store.creatorAuth.email) {
      res.status(403).json({ error: 'Email tersebut dikhususkan untuk akun Creator.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Kata sandi pelanggan minimal 6 karakter.' });
      return;
    }
    if (store.customers.some((c) => c.email === email)) {
      res.status(409).json({ error: 'Email sudah terdaftar. Silakan masuk menggunakan akun Anda.' });
      return;
    }

    const newCustomer: StoredCustomer = {
      id: `usr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      name,
      email,
      passwordHash: hashPassword(password),
      phone,
      city,
      skinType,
      role: 'member',
      bio: '',
      avatarUrl: '',
      createdAt: new Date().toISOString()
    };

    store.customers.push(newCustomer);
    const cart = getOrCreateUserCart(newCustomer.id);
    saveStore(store);

    const token = signSessionToken(newCustomer.id, 'member', newCustomer.email);
    res.status(201).json({
      token,
      user: sanitizeUserResponse(newCustomer),
      cart,
      orders: []
    });
  });

  // Customer Login
  app.post('/api/auth/login', checkAuthRateLimit, (req, res) => {
    const email = sanitizeString(req.body?.email, 120).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (email === store.creatorAuth.email) {
      res.status(401).json({ error: 'Untuk masuk sebagai Creator, gunakan tab Akses Creator.' });
      return;
    }

    const customer = store.customers.find((c) => c.email === email);
    if (!customer || !verifyPasswordHash(password, customer.passwordHash)) {
      res.status(401).json({ error: 'Email atau kata sandi tidak cocok.' });
      return;
    }

    const token = signSessionToken(customer.id, 'member', customer.email);
    const cart = getOrCreateUserCart(customer.id);
    const orders = store.orders.filter((o) => o.userId === customer.id);
    res.json({
      token,
      user: sanitizeUserResponse(customer),
      cart,
      orders
    });
  });

  app.post('/api/auth/logout', requireAuth, (req: AuthenticatedRequest, res) => {
    if (req.auth?.jti) {
      revokedTokenJtis.add(req.auth.jti);
    }
    res.json({ ok: true });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    const auth = req.auth!;
    if (auth.role === 'admin') {
      res.json({
        user: sanitizeUserResponse(store.creatorAuth),
        cart: getOrCreateUserCart(store.creatorAuth.id),
        orders: store.orders
      });
      return;
    }
    const customer = store.customers.find((c) => c.id === auth.uid);
    if (!customer) {
      res.status(401).json({ error: 'Akun tidak ditemukan.' });
      return;
    }
    res.json({
      user: sanitizeUserResponse(customer),
      cart: getOrCreateUserCart(customer.id),
      orders: store.orders.filter((o) => o.userId === customer.id)
    });
  });

  app.put('/api/auth/profile', requireAuth, (req: AuthenticatedRequest, res) => {
    const auth = req.auth!;
    const name = sanitizeString(req.body?.name, 80);
    const phone = sanitizeString(req.body?.phone, 30);
    const city = sanitizeString(req.body?.city, 60) || 'Banda Aceh';
    const skinType = sanitizeString(req.body?.skinType, 60) || 'Kombinasi';
    const bio = sanitizeString(req.body?.bio, 300);
    const avatarUrl = sanitizeHttpUrl(req.body?.avatarUrl);

    if (auth.role === 'admin') {
      if (name) store.creatorAuth.name = name;
      store.creatorAuth.phone = phone;
      store.creatorAuth.city = city;
      store.creatorAuth.skinType = skinType;
      store.creatorAuth.bio = bio;
      store.creatorAuth.avatarUrl = avatarUrl;
      saveStore(store);
      res.json({ user: sanitizeUserResponse(store.creatorAuth) });
      return;
    }

    const customer = store.customers.find((c) => c.id === auth.uid);
    if (!customer) {
      res.status(404).json({ error: 'Akun pelanggan tidak ditemukan.' });
      return;
    }
    if (name) customer.name = name;
    customer.phone = phone;
    customer.city = city;
    customer.skinType = skinType;
    customer.bio = bio;
    customer.avatarUrl = avatarUrl;
    saveStore(store);
    res.json({ user: sanitizeUserResponse(customer) });
  });

  // Protected Customer Cart Routes
  app.get('/api/cart', requireAuth, (req: AuthenticatedRequest, res) => {
    const cart = getOrCreateUserCart(req.auth!.uid);
    res.json({ cart });
  });

  app.put('/api/cart', requireAuth, (req: AuthenticatedRequest, res) => {
    const uid = req.auth!.uid;
    const body = req.body || {};
    const validProdIds = new Set(store.appData.products.map((p) => String(p.id)));

    const items: CartItem[] = Array.isArray(body.items)
      ? body.items
          .map((it: Record<string, unknown>) => {
            const prodId = sanitizeString(it.prodId, 80);
            if (!validProdIds.has(prodId)) return null;
            return {
              uid: sanitizeString(it.uid, 80) || `cart-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
              prodId,
              variant: sanitizeString(it.variant, 80) || 'Standard Size',
              qty: Math.max(1, Math.min(99, Math.floor(Number(it.qty) || 1)))
            };
          })
          .filter((v: CartItem | null): v is CartItem => v !== null)
      : [];

    const shippingMethod =
      body.shippingMethod === 'instant' || body.shippingMethod === 'regular' ? body.shippingMethod : 'pickup';
    const pickupStore = sanitizeString(body.pickupStore, 120) || 'HalalGlow Suzuya Mall Banda Aceh';
    const rawVoucher = sanitizeString(body.voucherCode, 40).toUpperCase();
    const voucherCode = rawVoucher === 'HALALGLOW10' || rawVoucher === 'ACEHCANTIK' ? rawVoucher : '';

    store.cartsByUserId[uid] = {
      items,
      shippingMethod,
      pickupStore,
      voucherCode
    };
    saveStore(store);
    res.json({ cart: store.cartsByUserId[uid] });
  });

  // Protected Customer Orders Routes
  app.get('/api/orders', requireAuth, (req: AuthenticatedRequest, res) => {
    const uid = req.auth!.uid;
    const list = req.auth!.role === 'admin' ? store.orders : store.orders.filter((o) => o.userId === uid);
    res.json({ orders: list });
  });

  app.post('/api/orders', requireAuth, (req: AuthenticatedRequest, res) => {
    const uid = req.auth!.uid;
    const cart = getOrCreateUserCart(uid);
    if (!cart.items || cart.items.length === 0) {
      res.status(400).json({ error: 'Keranjang belanja masih kosong.' });
      return;
    }

    const buyerName = sanitizeString(req.body?.buyerName, 100);
    const buyerPhone = sanitizeString(req.body?.buyerPhone, 30);
    const buyerAddress = sanitizeString(req.body?.buyerAddress, 300);
    const paymentMethod = sanitizeString(req.body?.paymentMethod, 100) || 'QRIS Instan (Simulasi)';

    if (!buyerName || !buyerPhone || !buyerAddress) {
      res.status(400).json({ error: 'Data penerima belum lengkap.' });
      return;
    }

    const totals = computeCartTotals(cart);
    const invoiceItems = cart.items
      .map((item) => {
        const p = store.appData.products.find((prod) => prod.id === item.prodId);
        if (!p) return null;
        return {
          prodId: item.prodId,
          nama: String(p.nama || 'Produk Halal'),
          brand: String(p.brand || '-'),
          variant: item.variant,
          harga: Number(p.harga) || 0,
          qty: item.qty
        };
      })
      .filter((v): v is OrderRecord['items'][number] => v !== null);

    if (invoiceItems.length === 0) {
      res.status(400).json({ error: 'Tidak ada produk valid di keranjang.' });
      return;
    }

    const randomDigits = crypto.randomInt(1000, 9999);
    const invoiceId = `INV-HGA-2026${randomDigits}`;
    const nowStr = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const orderRecord: OrderRecord = {
      invoiceId,
      userId: uid,
      tanggal: nowStr,
      status: 'Pembayaran Simulasi Terverifikasi',
      buyerName,
      buyerPhone,
      buyerAddress,
      paymentMethod,
      shippingMethod: cart.shippingMethod,
      pickupStore: cart.pickupStore,
      voucherCode: cart.voucherCode,
      items: invoiceItems,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shippingCost: totals.shippingCost,
      grandTotal: totals.grandTotal
    };

    store.orders.unshift(orderRecord);
    store.cartsByUserId[uid] = { ...getDefaultCart(), shippingMethod: cart.shippingMethod, pickupStore: cart.pickupStore };
    saveStore(store);

    res.status(201).json({
      order: orderRecord,
      cart: store.cartsByUserId[uid]
    });
  });

  // Protected Creator / Admin CRUD Routes
  app.post('/api/admin/products', requireAuth, requireCreator, (req, res) => {
    const record = sanitizeProductPayload(req.body || {});
    if (!record) {
      res.status(400).json({ error: 'Brand dan nama produk wajib diisi.' });
      return;
    }
    store.appData.products.unshift(record);
    saveStore(store);
    res.status(201).json({ item: record, appData: store.appData });
  });

  app.put('/api/admin/products/:id', requireAuth, requireCreator, (req, res) => {
    const idx = store.appData.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Produk tidak ditemukan.' });
      return;
    }
    const record = sanitizeProductPayload(req.body || {}, store.appData.products[idx]);
    if (!record) {
      res.status(400).json({ error: 'Brand dan nama produk wajib diisi.' });
      return;
    }
    store.appData.products[idx] = { ...store.appData.products[idx], ...record };
    saveStore(store);
    res.json({ item: store.appData.products[idx], appData: store.appData });
  });

  app.delete('/api/admin/products/:id', requireAuth, requireCreator, (req, res) => {
    store.appData.products = store.appData.products.filter((p) => p.id !== req.params.id);
    saveStore(store);
    res.json({ appData: store.appData });
  });

  app.post('/api/admin/stores', requireAuth, requireCreator, (req, res) => {
    const record = sanitizeStorePayload(req.body || {});
    if (!record) {
      res.status(400).json({ error: 'Nama gerai dan alamat wajib diisi.' });
      return;
    }
    store.appData.stores.unshift(record);
    saveStore(store);
    res.status(201).json({ item: record, appData: store.appData });
  });

  app.put('/api/admin/stores/:id', requireAuth, requireCreator, (req, res) => {
    const idx = store.appData.stores.findIndex((s) => s.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Gerai tidak ditemukan.' });
      return;
    }
    const record = sanitizeStorePayload(req.body || {}, store.appData.stores[idx]);
    if (!record) {
      res.status(400).json({ error: 'Nama gerai dan alamat wajib diisi.' });
      return;
    }
    store.appData.stores[idx] = { ...store.appData.stores[idx], ...record };
    saveStore(store);
    res.json({ item: store.appData.stores[idx], appData: store.appData });
  });

  app.delete('/api/admin/stores/:id', requireAuth, requireCreator, (req, res) => {
    store.appData.stores = store.appData.stores.filter((s) => s.id !== req.params.id);
    saveStore(store);
    res.json({ appData: store.appData });
  });

  app.post('/api/admin/bundles', requireAuth, requireCreator, (req, res) => {
    const record = sanitizeBundlePayload(req.body || {});
    if (!record) {
      res.status(400).json({ error: 'Nama dan deskripsi paket wajib diisi.' });
      return;
    }
    store.appData.bundles.unshift(record);
    saveStore(store);
    res.status(201).json({ item: record, appData: store.appData });
  });

  app.put('/api/admin/bundles/:id', requireAuth, requireCreator, (req, res) => {
    const idx = store.appData.bundles.findIndex((b) => b.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Paket tidak ditemukan.' });
      return;
    }
    const record = sanitizeBundlePayload(req.body || {}, store.appData.bundles[idx]);
    if (!record) {
      res.status(400).json({ error: 'Nama dan deskripsi paket wajib diisi.' });
      return;
    }
    store.appData.bundles[idx] = { ...store.appData.bundles[idx], ...record };
    saveStore(store);
    res.json({ item: store.appData.bundles[idx], appData: store.appData });
  });

  app.delete('/api/admin/bundles/:id', requireAuth, requireCreator, (req, res) => {
    store.appData.bundles = store.appData.bundles.filter((b) => b.id !== req.params.id);
    saveStore(store);
    res.json({ appData: store.appData });
  });

  app.get('/api/admin/orders', requireAuth, requireCreator, (_req, res) => {
    res.json({ orders: store.orders });
  });

  app.patch('/api/admin/orders/:invoiceId/status', requireAuth, requireCreator, (req, res) => {
    const order = store.orders.find((o) => o.invoiceId === req.params.invoiceId);
    if (!order) {
      res.status(404).json({ error: 'Invoice tidak ditemukan.' });
      return;
    }
    const allowedStatuses = new Set([
      'Pembayaran Simulasi Terverifikasi',
      'Sedang Disiapkan Gerai Aceh',
      'Siap Diambil / Dalam Pengiriman',
      'Selesai'
    ]);
    const nextStatus = sanitizeString(req.body?.status, 100);
    if (!allowedStatuses.has(nextStatus)) {
      res.status(400).json({ error: 'Status pesanan tidak valid.' });
      return;
    }
    order.status = nextStatus;
    saveStore(store);
    res.json({ order, orders: store.orders });
  });

  app.post('/api/admin/reset', requireAuth, requireCreator, (_req, res) => {
    store.appData = structuredClone(DEFAULT_DATA);
    saveStore(store);
    res.json({ appData: store.appData });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HalalGlow Aceh server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
