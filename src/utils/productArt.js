// Self-Contained Editorial Cosmetic Packaging SVG Studio Renderer (Zero External Broken URLs)

function buildEditorialProductArt(brand, subCat, accentHex = '#E11D74', bgHex = '#FCE7F3') {
  const safeBrand = encodeURIComponent((brand || 'HALALGLOW').toUpperCase());
  const safeSub = encodeURIComponent(subCat || 'Beauty');
  const subLower = (subCat || '').toLowerCase();
  const safeAccent = encodeURIComponent(accentHex);
  const safeBg = encodeURIComponent(bgHex);

  let vesselSvg = '';
  if (subLower.includes('cushion') || subLower.includes('powder')) {
    vesselSvg = `
      %3Cellipse cx='320' cy='240' rx='98' ry='64' fill='%23FFFFFF' stroke='${safeAccent}' stroke-width='3'/%3E
      %3Cellipse cx='320' cy='224' rx='98' ry='64' fill='url(%23cap)' stroke='${safeAccent}' stroke-width='2.5'/%3E
      %3Cellipse cx='320' cy='220' rx='76' ry='46' fill='none' stroke='%23FFFFFF' stroke-opacity='0.35' stroke-width='1.5'/%3E
      %3Ctext x='320' y='218' font-family='Georgia, serif' font-size='17' font-weight='700' fill='%23FFFFFF' text-anchor='middle'%3E${safeBrand}%3C/text%3E
      %3Ctext x='320' y='238' font-family='sans-serif' font-size='10' font-weight='700' letter-spacing='1.5' fill='%23FCE7F3' text-anchor='middle'%3E${safeSub}%3C/text%3E
    `;
  } else if (subLower.includes('lip') || subLower.includes('liner') || subLower.includes('brow')) {
    vesselSvg = `
      %3Crect x='294' y='74' width='52' height='94' rx='10' fill='url(%23cap)'/%3E
      %3Crect x='298' y='168' width='44' height='166' rx='12' fill='%23FFFFFF' stroke='${safeAccent}' stroke-width='2.5'/%3E
      %3Crect x='304' y='180' width='32' height='140' rx='8' fill='${safeAccent}' fill-opacity='0.85'/%3E
      %3Crect x='308' y='192' width='7' height='116' rx='3.5' fill='%23FFFFFF' fill-opacity='0.28'/%3E
      %3Ctext x='320' y='128' font-family='Georgia, serif' font-size='11' font-weight='700' fill='%23FFFFFF' text-anchor='middle'%3E${safeBrand}%3C/text%3E
    `;
  } else if (subLower.includes('moisturizer') || subLower.includes('cream')) {
    vesselSvg = `
      %3Crect x='244' y='136' width='152' height='36' rx='12' fill='url(%23cap)'/%3E
      %3Crect x='250' y='172' width='140' height='134' rx='24' fill='%23FFFFFF' stroke='${safeAccent}' stroke-width='2.5'/%3E
      %3Crect x='262' y='184' width='116' height='110' rx='16' fill='${safeBg}' fill-opacity='0.55'/%3E
      %3Ctext x='320' y='232' font-family='Georgia, serif' font-size='17' font-weight='700' fill='%232D1824' text-anchor='middle'%3E${safeBrand}%3C/text%3E
      %3Ctext x='320' y='254' font-family='sans-serif' font-size='11' font-weight='700' letter-spacing='1.2' fill='${safeAccent}' text-anchor='middle'%3E${safeSub}%3C/text%3E
    `;
  } else if (subLower.includes('sunscreen')) {
    vesselSvg = `
      %3Cpath d='M266,104 L374,104 L356,294 L284,294 Z' fill='%23FFFFFF' stroke='${safeAccent}' stroke-width='2.5' stroke-linejoin='round'/%3E
      %3Crect x='294' y='294' width='52' height='34' rx='8' fill='url(%23cap)'/%3E
      %3Ctext x='320' y='192' font-family='Georgia, serif' font-size='16' font-weight='700' fill='%232D1824' text-anchor='middle'%3E${safeBrand}%3C/text%3E
      %3Cline x1='292' y1='206' x2='348' y2='206' stroke='${safeAccent}' stroke-width='1.5'/%3E
      %3Ctext x='320' y='226' font-family='sans-serif' font-size='11' font-weight='700' fill='${safeAccent}' text-anchor='middle'%3E${safeSub}%3C/text%3E
      %3Ctext x='320' y='246' font-family='sans-serif' font-size='9' font-weight='600' fill='%235B2C42' text-anchor='middle'%3ESPF 45 PA++++%3C/text%3E
    `;
  } else if (subLower.includes('serum')) {
    vesselSvg = `
      %3Crect x='308' y='66' width='24' height='40' rx='10' fill='url(%23cap)'/%3E
      %3Crect x='294' y='104' width='52' height='22' rx='6' fill='%23D9778B'/%3E
      %3Crect x='276' y='126' width='88' height='196' rx='22' fill='%23FFFFFF' stroke='${safeAccent}' stroke-width='2.5'/%3E
      %3Crect x='286' y='152' width='68' height='158' rx='14' fill='${safeBg}'/%3E
      %3Ctext x='320' y='220' font-family='Georgia, serif' font-size='15' font-weight='700' fill='%232D1824' text-anchor='middle'%3E${safeBrand}%3C/text%3E
      %3Ctext x='320' y='240' font-family='sans-serif' font-size='10' font-weight='700' fill='${safeAccent}' text-anchor='middle'%3E${safeSub}%3C/text%3E
    `;
  } else {
    vesselSvg = `
      %3Crect x='296' y='74' width='48' height='34' rx='8' fill='url(%23cap)'/%3E
      %3Crect x='272' y='108' width='96' height='214' rx='22' fill='%23FFFFFF' stroke='${safeAccent}' stroke-width='2.5'/%3E
      %3Crect x='282' y='136' width='76' height='174' rx='14' fill='${safeBg}' fill-opacity='0.65'/%3E
      %3Ctext x='320' y='204' font-family='Georgia, serif' font-size='16' font-weight='700' fill='%232D1824' text-anchor='middle'%3E${safeBrand}%3C/text%3E
      %3Cline x1='290' y1='218' x2='350' y2='218' stroke='${safeAccent}' stroke-width='1.5'/%3E
      %3Ctext x='320' y='238' font-family='sans-serif' font-size='11' font-weight='700' fill='%235B2C42' text-anchor='middle'%3E${safeSub}%3C/text%3E
    `;
  }

  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='480' viewBox='0 0 640 420'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='${safeBg}'/%3E%3Cstop offset='100%25' stop-color='%23FFFFFF'/%3E%3C/linearGradient%3E%3ClinearGradient id='cap' x1='0' y1='0' x2='1' y2='0'%3E%3Cstop offset='0%25' stop-color='${safeAccent}'/%3E%3Cstop offset='100%25' stop-color='%232D1824'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='420' fill='url(%23g)'/%3E%3Ccircle cx='320' cy='210' r='155' fill='${safeAccent}' fill-opacity='0.07'/%3E%3Cellipse cx='320' cy='342' rx='112' ry='14' fill='%232D1824' fill-opacity='0.09'/%3E${vesselSvg.trim()}%3C/svg%3E`;
}

export function getProductGallerySrcs(product) {
  if (!product) return [];
  const rawList = [];

  if (Array.isArray(product.imageUrls)) {
    product.imageUrls.forEach((url) => {
      if (typeof url === 'string' && url.trim()) {
        rawList.push(url.trim());
      }
    });
  }

  if (typeof product.imageUrl === 'string' && product.imageUrl.trim()) {
    const primary = product.imageUrl.trim();
    if (!rawList.includes(primary)) {
      rawList.unshift(primary);
    }
  }

  if (rawList.length > 0) {
    return rawList;
  }

  return [
    buildEditorialProductArt(
      product.brand,
      product.subKategori || product.kategori,
      product.artAccent || '#E11D74',
      product.artBg || '#FCE7F3'
    )
  ];
}

export function getProductVisualSrc(product) {
  const gallery = getProductGallerySrcs(product);
  return gallery[0];
}

export function getProductFallbackSrc(product) {
  return buildEditorialProductArt(
    product.brand,
    product.subKategori || product.kategori,
    product.artAccent || '#E11D74',
    product.artBg || '#FCE7F3'
  );
}
