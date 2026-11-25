// Client-Side ISO QR Code Generator for Aceh Partner Stores

import QRCode from 'qrcode';
import { buildDemoWhatsAppUrl } from './format.js';

export function buildStoreDeepLink(storeId) {
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  return `${baseUrl}?store=${encodeURIComponent(storeId)}#stores`;
}

export function buildStoreQrPayload(store, mode = 'details') {
  if (!store) return '';
  if (mode === 'whatsapp') {
    return buildDemoWhatsAppUrl(store.nama, store.kontak);
  }
  return buildStoreDeepLink(store.id);
}

export async function renderQrToCanvas(canvasEl, payload, size = 180) {
  if (!canvasEl || !payload) return;
  try {
    await QRCode.toCanvas(canvasEl, payload, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#2D1824',
        light: '#FFFFFF'
      }
    });
  } catch (err) {
    console.error('QR generation failed:', err);
  }
}

export function downloadCanvasAsPng(canvasEl, filename = 'halalglow-gerai-qr.png') {
  if (!canvasEl) return false;
  const dataUrl = canvasEl.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}
