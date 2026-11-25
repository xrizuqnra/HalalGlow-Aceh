// Default Dataset for HalalGlow Aceh (Products, Aceh Stores, Bundles, Demo Users)

export const DEFAULT_DEMO_USERS = [
  {
    id: 'usr-member-1',
    name: 'Cut Nyak Meutia',
    email: 'meutia@halalglow.id',
    password: '123',
    phone: '081269001234',
    city: 'Banda Aceh',
    skinType: 'Kombinasi',
    role: 'member'
  },
  {
    id: 'usr-admin-1',
    name: 'Kurator Gerai Aceh',
    email: 'admin@halalglow.id',
    password: '123',
    phone: '081200005501',
    city: 'Banda Aceh',
    skinType: 'Semua Jenis Kulit',
    role: 'admin'
  }
];

export const DEFAULT_DATA = {
  products: [
    {
      id: 'prod-1',
      brand: 'Wardah',
      nama: 'Wardah Colorfit Perfect Glow Cushion SPF 33 PA++',
      kategori: 'Complexion',
      subKategori: 'Cushion',
      harga: 118000,
      artAccent: '#E11D74',
      artBg: '#FCE7F3',
      statusHalal: 'Tersertifikasi Halal BPJPH/MUI',
      nomorHalal: 'ID00410000084920321 (Simulasi)',
      nomorBpom: 'NA18230300412 (Simulasi)',
      jenisKulit: ['Semua Jenis Kulit', 'Kering', 'Kombinasi'],
      infoWudhu:
        'Tekstur ringan SkinMatch Technology yang menyatu dengan kulit dan mudah dibersihkan menggunakan micellar water sebelum berwudhu.',
      kandunganUtama: ['Centella Asiatica', 'Niacinamide', 'Glow-Perfecting Pigment', 'SPF 33 PA++'],
      shades: [
        { name: '11C Pink Fair', hex: '#F5D0C5' },
        { name: '22N Light Ivory', hex: '#ECC3A8' },
        { name: '32N Neutral Beige', hex: '#DBA57D' },
        { name: '43W Golden Sand', hex: '#C28658' }
      ],
      geraiTersedia: ['Wardah Beauty House Banda Aceh', 'Suzuya Mall Banda Aceh', 'Lhokseumawe Beauty Center'],
      deskripsi:
        'Cushion dengan hasil healthy glow alami yang menutup noda kemerahan tanpa terasa berat maupun menyumbat pori.',
      deskripsiEn:
        'Healthy-glow cushion concealing redness and uneven tone seamlessly without feeling heavy on skin.',
      unggulan: true
    },
    {
      id: 'prod-2',
      brand: 'Skintific',
      nama: 'Skintific 5X Ceramide Barrier Moisture Gel',
      kategori: 'Skincare',
      subKategori: 'Moisturizer',
      harga: 139000,
      artAccent: '#EC4899',
      artBg: '#FFF1F5',
      statusHalal: 'Tersertifikasi Halal BPJPH/MUI',
      nomorHalal: 'ID00410000491020923 (Simulasi)',
      nomorBpom: 'NA11210100167 (Simulasi)',
      jenisKulit: ['Semua Jenis Kulit', 'Sensitif', 'Kering', 'Berminyak'],
      infoWudhu:
        'Gel berbasis air yang cepat meresap tanpa residu berminyak sehingga nyaman dipakai sebelum maupun sesudah berwudhu.',
      kandunganUtama: ['5X Ceramide', 'Hyaluronic Acid', 'Centella Asiatica', 'Marine Collagen'],
      shades: [],
      geraiTersedia: ['Sociolla Pop-Up Hermes Palace', 'Suzuya Mall Banda Aceh', 'Apotek Kimia Farma Lhokseumawe'],
      deskripsi:
        'Pelembap gel ringan untuk memperbaiki dan memperkuat skin barrier, menenangkan kemerahan, serta menjaga hidrasi kulit.',
      deskripsiEn:
        'Lightweight water-gel moisturizer designed to repair and fortify the skin barrier while calming redness.',
      unggulan: true
    },
    {
      id: 'prod-3',
      brand: 'Azarine',
      nama: 'Azarine Hydrasoothe Sunscreen Gel SPF 45 PA++++',
      kategori: 'Skincare',
      subKategori: 'Sunscreen',
      harga: 65000,
      artAccent: '#DB2777',
      artBg: '#FCE7F3',
      statusHalal: 'Tersertifikasi Halal BPJPH/MUI',
      nomorHalal: 'ID00410000182730522 (Simulasi)',
      nomorBpom: 'NA18201700868 (Simulasi)',
      jenisKulit: ['Berminyak', 'Kombinasi', 'Sensitif', 'Semua Jenis Kulit'],
      infoWudhu:
        'Formula gel dingin bebas alkohol dan bebas silikon berat; praktis dibilas bersih dan diaplikasikan ulang setelah wudhu Dzuhur.',
      kandunganUtama: ['Royal Jelly', 'Aloe Vera', 'Green Tea Extract', 'Resveratrol'],
      shades: [],
      geraiTersedia: [
        'Gerai Kosmetik Peunayong',
        'Suzuya Mall Banda Aceh',
        'Takengon Beauty & Pharmacy',
        'Meulaboh Halal Cosmetics'
      ],
      deskripsi:
        'Tabir surya tekstur gel sejuk tanpa whitecast dan bebas alkohol yang sangat cocok untuk cuaca tropis pesisir Aceh.',
      deskripsiEn: 'Cooling, alcohol-free, zero-whitecast sunscreen gel ideal for Aceh tropical coastal weather.',
      unggulan: true
    },
    {
      id: 'prod-4',
      brand: 'Make Over',
      nama: 'Make Over Powerstay Transferproof Matte Lip Cream',
      kategori: 'Lip',
      subKategori: 'Lip Cream',
      harga: 132000,
      artAccent: '#BE185D',
      artBg: '#FDF2F4',
      statusHalal: 'Tersertifikasi Halal BPJPH/MUI',
      nomorHalal: 'ID00410000084950421 (Simulasi)',
      nomorBpom: 'NA18221301105 (Simulasi)',
      jenisKulit: ['Semua Jenis Kulit'],
      infoWudhu:
        'Pigmen tahan lama hingga 14 jam namun tetap mudah dihapus tuntas menggunakan lip & eye remover sebelum berwudhu.',
      kandunganUtama: ['3D-PigmentLock Technology', 'Vitamin E', 'Flexible Film Former'],
      shades: [
        { name: 'B01 No. 01', hex: '#B85A6E' },
        { name: 'B04 Fearless', hex: '#9D174D' },
        { name: 'B08 Curious', hex: '#C26D65' },
        { name: 'B11 Ambitious', hex: '#8B2635' }
      ],
      geraiTersedia: ['Hermes Palace Mall Banda Aceh', 'Suzuya Mall Banda Aceh', 'Lhokseumawe Beauty Center'],
      deskripsi:
        'Lip cream transferproof dengan hasil matte lembut yang tidak lengket dan tetap nyaman di bibir sepanjang acara.',
      deskripsiEn: 'Transferproof matte lip cream with a weightless, non-sticky finish lasting through long events.',
      unggulan: true
    },
    {
      id: 'prod-5',
      brand: 'ESQA',
      nama: 'ESQA Flawless Micro Setting Powder',
      kategori: 'Complexion',
      subKategori: 'Loose Powder',
      harga: 145000,
      artAccent: '#D9778B',
      artBg: '#FFF8FA',
      statusHalal: 'Tersertifikasi Halal BPJPH/MUI',
      nomorHalal: 'ID00410000371820822 (Simulasi)',
      nomorBpom: 'NA18220400289 (Simulasi)',
      jenisKulit: ['Berminyak', 'Kombinasi', 'Semua Jenis Kulit'],
      infoWudhu:
        'Bedak tabur partikel mikro vegan & halal yang mengunci riasan tanpa menyumbat pori dan mudah dibersihkan saat pembersihan wajah.',
      kandunganUtama: ['Micro-Blurring Silica', 'Squalane', 'Vitamin E'],
      shades: [
        { name: 'Translucent', hex: '#F7EAE3' },
        { name: 'Custard', hex: '#E6C19C' },
        { name: 'Caramel', hex: '#C49164' }
      ],
      geraiTersedia: ['Sociolla Pop-Up Hermes Palace', 'Suzuya Mall Banda Aceh'],
      deskripsi:
        'Bedak tabur berpartikel halus dengan efek soft-focus untuk menyamarkan pori dan menahan kilap minyak berlebih.',
      deskripsiEn: 'Finely milled loose setting powder with soft-focus blurring power to control shine all day.',
      unggulan: false
    },
    {
      id: 'prod-6',
      brand: 'Somethinc',
      nama: 'Somethinc Calm Down! Skinpair R-Cover Cream',
      kategori: 'Skincare',
      subKategori: 'Moisturizer',
      harga: 129000,
      artAccent: '#EC4899',
      artBg: '#FCE7F3',
      statusHalal: 'Tersertifikasi Halal BPJPH/MUI',
      nomorHalal: 'ID00410000512901123 (Simulasi)',
      nomorBpom: 'NA18220110921 (Simulasi)',
      jenisKulit: ['Sensitif', 'Kering', 'Kombinasi'],
      infoWudhu:
        'Krim pelembap hypoallergenic yang mudah meresap dan menenangkan kulit setelah terpapar panas matahari.',
      kandunganUtama: ['Madagascar Centella', 'Murumuru Butter', 'Panthenol', 'CalmDown Complex'],
      shades: [],
      geraiTersedia: ['Suzuya Mall Banda Aceh', 'Gerai Kosmetik Peunayong', 'Lhokseumawe Beauty Center'],
      deskripsi:
        'Pelembap penenang kulit sensitif dan kemerahan yang membantu menjaga elastisitas serta kelembapan alami kulit.',
      deskripsiEn: 'Soothing barrier cream formulated to calm sensitive, irritated skin and lock in lasting hydration.',
      unggulan: false
    },
    {
      id: 'prod-7',
      brand: 'NPURE',
      nama: 'NPURE Centella Asiatica Face Toner',
      kategori: 'Skincare',
      subKategori: 'Toner',
      harga: 95000,
      artAccent: '#E11D74',
      artBg: '#FFF1F5',
      statusHalal: 'Tersertifikasi Halal BPJPH/MUI',
      nomorHalal: 'ID00410000283910622 (Simulasi)',
      nomorBpom: 'NA18211203940 (Simulasi)',
      jenisKulit: ['Berminyak', 'Sensitif', 'Kombinasi'],
      infoWudhu:
        'Toner cair dengan daun Centella asli yang menyegarkan wajah segera setelah membasuh muka saat berwudhu.',
      kandunganUtama: ['Real Centella Asiatica Leaves', 'Niacinamide', 'Tranexamic Acid', 'Mix Fruit Extract'],
      shades: [],
      geraiTersedia: ['Gerai Kosmetik Peunayong', 'Lambaro Beauty & Pharmacy Hub', 'Takengon Beauty & Pharmacy'],
      deskripsi:
        'Toner penyegar bebas alkohol, bebas paraben, dan bebas SLS untuk merawat kulit berjerawat serta menenangkan kemerahan.',
      deskripsiEn: 'Alcohol-free, paraben-free hydrating toner with real Centella leaves to soothe acne-prone skin.',
      unggulan: true
    },
    {
      id: 'prod-8',
      brand: 'Rose All Day',
      nama: 'Rose All Day Plush Lip Tint',
      kategori: 'Lip',
      subKategori: 'Lip Tint',
      harga: 129000,
      artAccent: '#F43F5E',
      artBg: '#FFE4E6',
      statusHalal: 'Muslim-Friendly (Klaim Bebas Alkohol & Hewani)',
      nomorHalal: 'Klaim Muslim-Friendly / Vegan (Belum Tersertifikasi BPJPH)',
      nomorBpom: 'NA18221300811 (Simulasi)',
      jenisKulit: ['Semua Jenis Kulit', 'Kering'],
      infoWudhu:
        'Klaim produsen: tekstur gel ringan berbasis air yang melembapkan bibir dan praktis dibersihkan sebelum wudhu.',
      kandunganUtama: ['Squalane', 'Vitamin E', 'Hydrolyzed Hyaluronic Acid'],
      shades: [
        { name: 'Creme Brulee', hex: '#C87D75' },
        { name: 'Rose', hex: '#D96B84' },
        { name: 'Marooned', hex: '#8E2942' }
      ],
      geraiTersedia: ['Sociolla Pop-Up Hermes Palace', 'Suzuya Mall Banda Aceh'],
      deskripsi: 'Lip tint bertekstur plush lembut yang memberikan kilau sehat alami tanpa membuat bibir kering.',
      deskripsiEn: 'Plush-textured moisturizing lip tint giving a healthy natural stain without drying out lips.',
      unggulan: false
    },
    {
      id: 'prod-9',
      brand: 'Luxcrime',
      nama: 'Luxcrime Ultra Stay Eyeliner',
      kategori: 'Eye & Brow',
      subKategori: 'Eyeliner',
      harga: 99000,
      artAccent: '#9D174D',
      artBg: '#FCE7F3',
      statusHalal: 'Tersertifikasi Halal BPJPH/MUI',
      nomorHalal: 'ID00410000401920722 (Simulasi)',
      nomorBpom: 'NA11211200455 (Simulasi)',
      jenisKulit: ['Semua Jenis Kulit', 'Berminyak'],
      infoWudhu:
        'Eyeliner spidol smudgeproof yang tidak mudah luntur oleh keringat namun terangkat bersih saat diusap micellar water.',
      kandunganUtama: ['Carbon Black Pigment', 'Chamomile Extract', 'Panthenol'],
      shades: [
        { name: 'Midnight Black', hex: '#1F1219' },
        { name: 'Espresso Brown', hex: '#5A382D' }
      ],
      geraiTersedia: ['Suzuya Mall Banda Aceh', 'Hermes Palace Mall Banda Aceh', 'Lhokseumawe Beauty Center'],
      deskripsi: 'Eyeliner dengan ujung kuas presisi untuk garis mata tajam maupun natural sehari-hari.',
      deskripsiEn: 'Precision brush-tip liquid eyeliner delivering crisp definition from subtle daily wings to bold looks.',
      unggulan: false
    },
    {
      id: 'prod-10',
      brand: 'Wardah',
      nama: 'Wardah Nature Daily Seaweed Cleansing Micellar Water',
      kategori: 'Micellar & Remover',
      subKategori: 'Micellar Water',
      harga: 38000,
      artAccent: '#E11D74',
      artBg: '#FFF8FA',
      statusHalal: 'Tersertifikasi Halal BPJPH/MUI',
      nomorHalal: 'ID00410000084900121 (Simulasi)',
      nomorBpom: 'NA18181203112 (Simulasi)',
      jenisKulit: ['Semua Jenis Kulit', 'Sensitif', 'Berminyak'],
      infoWudhu:
        'Pembersih wajib di tas mukena untuk menghapus cushion, sunscreen, dan lip cream secara tuntas sebelum berwudhu.',
      kandunganUtama: ['Balancing Seaweed Extract', 'Cucumber Extract', 'Multi-Action Micelles'],
      shades: [],
      geraiTersedia: ['Semua Gerai & Apotek Mitra Aceh (5 Kota)'],
      deskripsi:
        'Micellar water bebas alkohol dan bebas minyak yang mengangkat sisa makeup serta debu dalam satu usapan lembut.',
      deskripsiEn: 'Alcohol-free, oil-free micellar water lifting makeup and impurities gently in one swipe before wudhu.',
      unggulan: true
    },
    {
      id: 'prod-11',
      brand: 'Emina',
      nama: 'Emina Glossy Stain Lip Tint',
      kategori: 'Lip',
      subKategori: 'Lip Tint',
      harga: 52000,
      artAccent: '#EC4899',
      artBg: '#FCE7F3',
      statusHalal: 'Tersertifikasi Halal BPJPH/MUI',
      nomorHalal: 'ID00410000084980621 (Simulasi)',
      nomorBpom: 'NA18201300419 (Simulasi)',
      jenisKulit: ['Semua Jenis Kulit'],
      infoWudhu: 'Formula ringan nyaman dipakai remaja maupun mahasiswi dan mudah diaplikasikan ulang setelah shalat.',
      kandunganUtama: ['Apricot Seed Oil', 'Avocado Oil', 'Vitamin E'],
      shades: [
        { name: '01 Autumn Bell', hex: '#C84B59' },
        { name: '02 Apple Shower', hex: '#D6335C' },
        { name: '04 Peach Sprinkles', hex: '#E07A6B' }
      ],
      geraiTersedia: ['Gerai Kosmetik Peunayong', 'Lambaro Beauty & Pharmacy Hub', 'Meulaboh Halal Cosmetics'],
      deskripsi: 'Lip tint bertekstur gel dengan hasil kilau lembut yang menjaga bibir tetap lembap tanpa rasa lengket.',
      deskripsiEn: 'Gel-based glossy lip stain keeping lips hydrated with a fresh, non-sticky sheen.',
      unggulan: false
    },
    {
      id: 'prod-12',
      brand: 'Avoskin',
      nama: 'Avoskin Your Skin Bae Niacinamide 12% + Centella',
      kategori: 'Skincare',
      subKategori: 'Serum',
      harga: 139000,
      artAccent: '#BE185D',
      artBg: '#FFF1F5',
      statusHalal: 'Tersertifikasi Halal BPJPH/MUI',
      nomorHalal: 'ID00410000249100922 (Simulasi)',
      nomorBpom: 'NA18200106232 (Simulasi)',
      jenisKulit: ['Berminyak', 'Kombinasi', 'Semua Jenis Kulit'],
      infoWudhu: 'Serum cair cepat meresap tanpa lapisan oklusif sehingga aman digunakan pada rutinitas pagi maupun malam.',
      kandunganUtama: ['Niacinamide 12%', 'Centella Asiatica Extract', 'Hyaluronic Acid'],
      shades: [],
      geraiTersedia: ['Sociolla Pop-Up Hermes Palace', 'Suzuya Mall Banda Aceh', 'Lhokseumawe Beauty Center'],
      deskripsi:
        'Serum pencerah optimal untuk menyamarkan noda hitam bekas jerawat, mengontrol sebum, dan meratakan tekstur kulit.',
      deskripsiEn:
        'High-potency brightening serum fading post-acne marks, regulating sebum, and refining skin texture.',
      unggulan: false
    },
    {
      id: 'prod-13',
      brand: 'Carasun',
      nama: 'Carasun Solar Smart UV Protector SPF 45 PA++++',
      kategori: 'Skincare',
      subKategori: 'Sunscreen',
      harga: 79000,
      artAccent: '#D9778B',
      artBg: '#FFF8FA',
      statusHalal: 'Tersertifikasi Halal BPJPH/MUI',
      nomorHalal: 'ID00410000319020422 (Simulasi)',
      nomorBpom: 'NA18211700315 (Simulasi)',
      jenisKulit: ['Kering', 'Kombinasi', 'Sensitif'],
      infoWudhu:
        'Teknologi CloudLike ringan seperti awan yang tidak menyumbat pori dan mudah diaplikasikan ulang setelah wudhu.',
      kandunganUtama: ['Rice Extract', 'CityStem', 'Niacinamide', 'SPF 45 PA++++'],
      shades: [],
      geraiTersedia: ['Suzuya Mall Banda Aceh', 'Takengon Beauty & Pharmacy', 'Meulaboh Halal Cosmetics'],
      deskripsi:
        'Tabir surya bertekstur ringan seperti awan yang melindungi kulit dari sinar UV dan polusi kota tanpa rasa lengket.',
      deskripsiEn: 'Cloud-light daily sunscreen shielding skin from UV rays and urban pollution without greasiness.',
      unggulan: false
    },
    {
      id: 'prod-14',
      brand: 'Make Over',
      nama: 'Make Over Hydrastay Lite Glow Cushion',
      kategori: 'Complexion',
      subKategori: 'Cushion',
      harga: 215000,
      artAccent: '#9D174D',
      artBg: '#FCE7F3',
      statusHalal: 'Tersertifikasi Halal BPJPH/MUI',
      nomorHalal: 'ID00410000084960521 (Simulasi)',
      nomorBpom: 'NA18210300540 (Simulasi)',
      jenisKulit: ['Kering', 'Kombinasi', 'Sensitif'],
      infoWudhu:
        'Mengandung Deep-Hydrating Actives yang menjaga kelembapan hingga 24 jam dan dapat dibersihkan lembut sebelum shalat.',
      kandunganUtama: ['Deep-Hydrating Actives', 'Soft-Focus Agent', 'SPF 50 PA+++'],
      shades: [
        { name: 'N10 Marble', hex: '#F2CEB8' },
        { name: 'W22 Warm Ivory', hex: '#E4B894' },
        { name: 'N30 Natural Beige', hex: '#D4A078' },
        { name: 'W42 Warm Sand', hex: '#BA8156' }
      ],
      geraiTersedia: ['Hermes Palace Mall Banda Aceh', 'Suzuya Mall Banda Aceh'],
      deskripsi:
        'Cushion khusus kulit kering hingga normal dengan hasil akhir sehat bercahaya dan daya tutup medium-to-full.',
      deskripsiEn:
        'Hydrating cushion tailored for dry to normal skin with a radiant finish and buildable medium-to-full coverage.',
      unggulan: false
    },
    {
      id: 'prod-15',
      brand: 'Somethinc',
      nama: 'Somethinc Brow Emblem Microcara Brow Gel',
      kategori: 'Eye & Brow',
      subKategori: 'Brow Gel',
      harga: 79000,
      artAccent: '#B85A6E',
      artBg: '#FDF2F4',
      statusHalal: 'Muslim-Friendly (Klaim Cruelty-Free & No Alcohol)',
      nomorHalal: 'Klaim Muslim-Friendly (Dalam Proses Verifikasi Halal)',
      nomorBpom: 'NA18211206122 (Simulasi)',
      jenisKulit: ['Semua Jenis Kulit'],
      infoWudhu:
        'Klaim produsen: maskara alis dengan sikat mikro presisi yang merapikan bulu alis alami tanpa menggumpal.',
      kandunganUtama: ['Panthenol', 'Carnauba Wax Nabati', 'Iron Oxides'],
      shades: [
        { name: 'Dark Brown', hex: '#4E3529' },
        { name: 'Ebony', hex: '#23191D' }
      ],
      geraiTersedia: ['Suzuya Mall Banda Aceh', 'Lhokseumawe Beauty Center'],
      deskripsi: 'Brow gel dengan aplikator mikro untuk merapikan sekaligus memberi volume alami pada alis sepanjang hari.',
      deskripsiEn: 'Micro-spoolie brow gel that grooms, tints, and adds natural fullness to brows all day.',
      unggulan: false
    }
  ],

  stores: [
    {
      id: 'str-1',
      nama: 'Sociolla Pop-Up & Halal Beauty Corner — Hermes Palace',
      wilayah: 'Banda Aceh',
      alamat: 'Hermes Palace Mall Lt. Dasar, Jl. T. Panglima Nyak Makam, Banda Aceh (Simulasi)',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hermes+Palace+Mall+Banda+Aceh',
      brandTersedia: ['Skintific', 'ESQA', 'Rose All Day', 'Avoskin', 'Make Over', 'Wardah'],
      layanan: ['Tester Semua Shade', 'Beauty Advisor', 'Mushalla Mall Nyaman'],
      kontak: '6281200005501'
    },
    {
      id: 'str-2',
      nama: 'Suzuya Mall Beauty Hall & Wardah Beauty House',
      wilayah: 'Banda Aceh',
      alamat: 'Suzuya Mall Banda Aceh, Jl. Teuku Umar, Setui, Kota Banda Aceh (Simulasi)',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Suzuya+Mall+Banda+Aceh',
      brandTersedia: ['Wardah', 'Make Over', 'Emina', 'Luxcrime', 'Somethinc', 'Azarine', 'Carasun'],
      layanan: ['Skin Check Gratis', 'Konsultasi Undertone', 'Ruang Ibadah Terdekat'],
      kontak: '6281200005502'
    },
    {
      id: 'str-3',
      nama: 'Gerai Kosmetik Peunayong & Lambaro Beauty Hub',
      wilayah: 'Aceh Besar',
      alamat: 'Jl. Banda Aceh - Medan Km. 9, Lambaro, Kec. Ingin Jaya, Aceh Besar (Simulasi)',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Lambaro+Aceh+Besar',
      brandTersedia: ['Wardah', 'NPURE', 'Azarine', 'Emina', 'Somethinc'],
      layanan: ['Harga Grosir & Eceran', 'Pesan Antar Banda Aceh & Aceh Besar'],
      kontak: '6281200005503'
    },
    {
      id: 'str-4',
      nama: 'Lhokseumawe Beauty Center & Apotek Kimia Farma',
      wilayah: 'Lhokseumawe',
      alamat: 'Jl. Merdeka No. 28, Simpang Empat, Kota Lhokseumawe (Simulasi)',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Jalan+Merdeka+Lhokseumawe',
      brandTersedia: ['Skintific', 'Wardah', 'Make Over', 'Avoskin', 'Luxcrime'],
      layanan: ['Konsultasi Apoteker & Skincare', 'Tester Produk Resmi', 'Mushalla Pengunjung'],
      kontak: '6281200005504'
    },
    {
      id: 'str-5',
      nama: 'Takengon Skincare & Halal Cosmetics Gallery',
      wilayah: 'Takengon',
      alamat: 'Jl. Lebe Kader No. 14, Takengon, Kabupaten Aceh Tengah (Simulasi)',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Takengon+Aceh+Tengah',
      brandTersedia: ['Wardah', 'Azarine', 'NPURE', 'Carasun', 'Skintific'],
      layanan: ['Kurasi Pelembap Cuaca Sejuk Gayo', 'Layanan Tanya Stok WA'],
      kontak: '6281200005505'
    },
    {
      id: 'str-6',
      nama: 'Meulaboh Halal Cosmetics & Pharmacy Store',
      wilayah: 'Meulaboh',
      alamat: 'Jl. Nasional No. 55, Johan Pahlawan, Meulaboh, Aceh Barat (Simulasi)',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Meulaboh+Aceh+Barat',
      brandTersedia: ['Wardah', 'Emina', 'Azarine', 'Carasun', 'Make Over'],
      layanan: ['Koleksi Sunscreen Pesisir', 'Pembayaran Non-Tunai'],
      kontak: '6281200005506'
    }
  ],

  bundles: [
    {
      id: 'bnd-1',
      nama: 'Paket Daily Natural Halal & Wudhu-Friendly Kit',
      jenisKulit: 'Kombinasi',
      fokus: 'Daily Natural Makeup',
      daftarProduk: ['prod-10', 'prod-1', 'prod-8', 'prod-9'],
      estimasiBiaya: 384000,
      deskripsi:
        'Rangkaian riasan harian praktis dengan Wardah Micellar Water untuk pembersihan sebelum wudhu, Wardah Cushion, Rose All Day Lip Tint, dan Luxcrime Eyeliner.'
    },
    {
      id: 'bnd-2',
      nama: 'Paket Acne & Oil Control Tropis Aceh',
      jenisKulit: 'Berminyak',
      fokus: 'Acne & Oil Control',
      daftarProduk: ['prod-7', 'prod-12', 'prod-3'],
      estimasiBiaya: 299000,
      deskripsi:
        'Kombinasi NPURE Centella Toner, Avoskin Niacinamide 12% Serum, dan Azarine Hydrasoothe Sunscreen Gel yang ringan tanpa menyumbat pori.'
    },
    {
      id: 'bnd-3',
      nama: 'Paket 5X Ceramide Barrier & Hydration Rescue',
      jenisKulit: 'Kering',
      fokus: 'Brightening & Hydration',
      daftarProduk: ['prod-6', 'prod-2', 'prod-13'],
      estimasiBiaya: 337000,
      deskripsi:
        'Mengembalikan kelembapan kulit kering dan sensitif dengan kombinasi Somethinc Calm Down, Skintific 5X Ceramide Gel, dan Carasun UV Protector.'
    },
    {
      id: 'bnd-4',
      nama: 'Paket Flawless Acara Spesial & Resepsi Aceh',
      jenisKulit: 'Semua Jenis Kulit',
      fokus: 'Bridal & Acara Adat',
      daftarProduk: ['prod-14', 'prod-5', 'prod-4', 'prod-9', 'prod-15'],
      estimasiBiaya: 670000,
      deskripsi:
        'Set riasan tahan lama kelas profesional dari Make Over, ESQA, Luxcrime, dan Somethinc untuk menghadiri pesta maupun acara adat.'
    },
    {
      id: 'bnd-5',
      nama: 'Paket Pelajar & Mahasiswi Hemat Halal Glow',
      jenisKulit: 'Sensitif',
      fokus: 'Daily Natural Makeup',
      daftarProduk: ['prod-10', 'prod-3', 'prod-11'],
      estimasiBiaya: 155000,
      deskripsi:
        'Tiga produk esensial ramah kantong dari Wardah, Azarine, dan Emina untuk perlindungan sinar matahari dan rona bibir segar.'
    }
  ]
};

export const DEFAULT_ROUTINE = {
  id: 'rtn-draft',
  namaRutinitas: 'Daily Halal Glow & Wudhu Kit',
  profilKulit: 'Kombinasi',
  targetAnggaran: 550000,
  daftarItem: [
    { uid: 'item-1', slot: 'AM', prodId: 'prod-7', note: 'Toner Centella penyegar pagi hari' },
    { uid: 'item-2', slot: 'AM', prodId: 'prod-2', note: 'Pelembap ringan pengunci skin barrier' },
    { uid: 'item-3', slot: 'AM', prodId: 'prod-3', note: 'Sunscreen gel wajib sebelum keluar rumah' },
    { uid: 'item-4', slot: 'MAKEUP', prodId: 'prod-1', note: 'Cushion satin natural untuk kuliah/kerja' },
    { uid: 'item-5', slot: 'WUDHU', prodId: 'prod-10', note: 'Hapus cushion & lip tint sebelum wudhu' },
    { uid: 'item-6', slot: 'WUDHU', prodId: 'prod-8', note: 'Touch-up bibir segar setelah shalat' },
    { uid: 'item-7', slot: 'PM', prodId: 'prod-12', note: 'Serum Niacinamide pencerah malam hari' }
  ]
};

export const PICKUP_STORES = [
  'HalalGlow Suzuya Mall Banda Aceh',
  'Sociolla Pop-Up Hermes Palace Banda Aceh',
  'Lhokseumawe Beauty Center',
  'Gerai Mitra Lambaro Aceh Besar',
  'Takengon Skincare & Halal Gallery',
  'Meulaboh Halal Cosmetics'
];
