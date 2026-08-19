/**
 * HIMAFI UNAIR — Main Script
 * - Admin Auth (SHA-256, CAPTCHA, Brute Force Lock, Session Token, Auto-logout)
 * - Pengumuman CRUD (localStorage)
 * - Bagan Kepengurusan (Org Chart) dengan admin edit
 * - Ministry / Proker Platform
 */

// ============================================================
// CONSTANTS & DEFAULTS
// ============================================================

const ADMIN_USER_KEY        = 'himafi_admin_user';
const ADMIN_DEFAULT_USER    = 'admin';
const ADMIN_PASS_HASH_KEY   = 'himafi_admin_hash';
const ADMIN_DEFAULT_PASS    = 'himafi1983';
const SESSION_TOKEN_KEY     = 'himafi_session_token';
const SESSION_TS_KEY        = 'himafi_session_ts';
const SESSION_TTL           = 2 * 60 * 60 * 1000;      // 2 jam
const LOCKOUT_KEY           = 'himafi_lockout_until';
const ATTEMPT_KEY           = 'himafi_login_attempts';
const MAX_ATTEMPTS          = 5;
const LOCKOUT_DURATION      = 15 * 60 * 1000;           // 15 menit

function getAdminUsername() {
  return localStorage.getItem(ADMIN_USER_KEY) || ADMIN_DEFAULT_USER;
}

const ORG_DATA_KEY          = 'himafi_org_data';
const MINISTRY_DATA_KEY     = 'himafi_ministries_data';
const PENGUMUMAN_DATA_KEY   = 'himafi_pengumuman';
const HERO_BG_KEY           = 'himafi_hero_bg';

// ============================================================
// DEFAULT DATA
// ============================================================

const DEFAULT_ORG = [
  { id: 'presiden',    role: 'Presiden HIMAFI',        tier: 1, name: 'Presiden HIMAFI',   image: '' },
  { id: 'sekjen1',     role: 'Sekretaris Jenderal 1',  tier: 2, name: 'Sekjen 1',          image: '' },
  { id: 'sekjen2',     role: 'Sekretaris Jenderal 2',  tier: 2, name: 'Sekjen 2',          image: '' },
  { id: 'sekretaris1', role: 'Sekretaris 1',           tier: 3, name: 'Sekretaris 1',      image: '' },
  { id: 'sekretaris2', role: 'Sekretaris 2',           tier: 3, name: 'Sekretaris 2',      image: '' },
  { id: 'bendahara1',  role: 'Bendahara 1',            tier: 3, name: 'Bendahara 1',       image: '' },
  { id: 'bendahara2',  role: 'Bendahara 2',            tier: 3, name: 'Bendahara 2',       image: '' },
  { id: 'm_psdm',      role: 'Menteri PSDM',           tier: 4, name: 'Menteri PSDM',      image: '' },
  { id: 'm_hublu',     role: 'Menteri HUBLU',          tier: 4, name: 'Menteri HUBLU',     image: '' },
  { id: 'm_ristek',    role: 'Menteri RISTEK',         tier: 4, name: 'Menteri RISTEK',    image: '' },
  { id: 'm_medinfo',   role: 'Menteri MEDINFO',        tier: 4, name: 'Menteri MEDINFO',   image: '' },
  { id: 'm_pengmas',   role: 'Menteri PENGMAS',        tier: 4, name: 'Menteri PENGMAS',   image: '' },
  { id: 'm_ekraf',     role: 'Menteri EKRAF',          tier: 4, name: 'Menteri EKRAF',     image: '' },
];

const DEFAULT_MINISTRIES = [
  { id:'bpi',        icon:'fa-user-tie',     name:'Badan Pengurus Inti (BPI)', shortName:'BPI',
    desc:'Pengarah kebijakan strategis, manajerial organisasi, dan transparansi administrasi HIMAFI UNAIR.',
    agendas:[
      { id:'bpi_1', category:'Proker', title:'Rapat Kerja Anggota (RAKER)', date:'15–16 Februari 2026',
        status:'completed', desc:'Penyusunan dan pengesahan seluruh program kerja kabinet.',
        fullDesc:'Rapat Kerja Anggota (RAKER) merupakan agenda strategis BPI HIMAFI UNAIR untuk memaparkan, mendiskusikan, dan mengesahkan seluruh rancangan program kerja kementerian selama satu periode kepengurusan.', image:'' },
      { id:'bpi_2', category:'Agenda', title:'Musyawarah Anggota (MUSTA)', date:'20–22 Desember 2026',
        status:'comingsoon', desc:'Evaluasi kepengurusan dan LPJ akhir tahun.',
        fullDesc:'Forum tertinggi HIMAFI UNAIR untuk mengevaluasi kinerja kepengurusan, penyampaian LPJ akhir tahun, serta perumusan rekomendasi kepengurusan mendatang.', image:'' },
    ]},
  { id:'hublu',      icon:'fa-globe-asia',   name:'Kementerian Hubungan Luar', shortName:'HUBLU',
    desc:'Membangun jejaring sinergis dengan alumni, instansi luar, universitas partner, dan IHAMAFI.',
    agendas:[
      { id:'hublu_1', category:'Proker', title:'HIMAFI Campus & Company Visit', date:'10 Mei 2026',
        status:'completed', desc:'Kunjungan studi ke industri & universitas mitra.',
        fullDesc:'Program studi banding dan kunjungan lapangan ke lembaga riset, instansi industri berbasis fisika, serta himpunan mahasiswa fisika universitas mitra untuk memperluas wawasan dan wacana kolaborasi.', image:'' },
      { id:'hublu_2', category:'Agenda', title:'Temu Alumni Fisika UNAIR', date:'18 September 2026',
        status:'comingsoon', desc:'Silaturahmi dan pemetaan jejaring karir alumni.',
        fullDesc:'Agenda silaturahmi antara mahasiswa aktif dan alumni Fisika UNAIR lintas angkatan guna berbagi informasi karir, beasiswa, serta pengalaman profesional di berbagai bidang industri dan akademisi.', image:'' },
    ]},
  { id:'psdm',       icon:'fa-users-cog',    name:'Kementerian PSDM', shortName:'PSDM',
    desc:'Wadah pengaderan, pelatihan kepemimpinan, kesejahteraan, dan pengembangan softskill anggota.',
    agendas:[
      { id:'psdm_1', category:'Proker', title:'LKMM (Latihan Kepemimpinan)', date:'24–26 Juli 2026',
        status:'ongoing', desc:'Pelatihan manajemen diri dan kepemimpinan tingkat dasar & menengah.',
        fullDesc:'Pelatihan kepemimpinan bertingkat bagi Mahasiswa Fisika UNAIR untuk melatih kemampuan manajemen organisasi, berpikir kritis, komunikasi publik, dan perancangan kegiatan secara sistematis.', image:'' },
      { id:'psdm_2', category:'Agenda', title:'Physics Bonding & Gathering', date:'14 Agustus 2026',
        status:'comingsoon', desc:'Kegiatan keakraban antar angkatan.',
        fullDesc:'Agenda keakraban dan olahraga bersama untuk mempererat rasa kekeluargaan dan soliditas antar seluruh angkatan aktif di departemen Fisika Universitas Airlangga.', image:'' },
    ]},
  { id:'medinfo',    icon:'fa-photo-video',  name:'Kementerian Media & Informasi', shortName:'MEDINFO',
    desc:'Mengelola pencitraan publik, desain, dokumentasi kegiatan, dan publikasi media sosial HIMAFI.',
    agendas:[
      { id:'medinfo_1', category:'Proker', title:'Majalah & Buletin Sains HIMAFI', date:'Setiap Triwulan',
        status:'ongoing', desc:'Publikasi berkala karya tulis dan liputan berita himpunan.',
        fullDesc:'Penerbitan majalah digital dan buletin sains HIMAFI yang memuat artikel ilmiah populer, infografis isu fisika terkini, wawancara tokoh departemen, dan ragam kegiatan himpunan.', image:'' },
      { id:'medinfo_2', category:'Agenda', title:'Medinfo Creative Workshop', date:'5 September 2026',
        status:'comingsoon', desc:'Pelatihan desain grafis, videografi, dan media sosial.',
        fullDesc:'Workshop teknis pengembangan kemampuan media digital bagi pengurus dan mahasiswa umum dalam menguasai perangkat desain, animasi sederhana, dan strategi komunikasi media sosial.', image:'' },
    ]},
  { id:'pengmas',    icon:'fa-hands-helping',name:'Kementerian Pengabdian Masyarakat', shortName:'PENGMAS',
    desc:'Menyelenggarakan bakti sosial, desa binaan, dan program sains edukatif bagi masyarakat luas.',
    agendas:[
      { id:'pengmas_1', category:'Proker', title:'Physics Teaching & Social Action', date:'12–14 Oktober 2026',
        status:'comingsoon', desc:'Pengajaran sains fisika sederhana untuk anak-anak sekolah.',
        fullDesc:'Program pengabdian berupa demo sains dan edukasi peragaan fisika interaktif untuk memacu ketertarikan anak-anak di desa binaan terhadap sains dan matematika secara menyenangkan.', image:'' },
      { id:'pengmas_2', category:'Agenda', title:'Bakti Sosial & Donor Darah', date:'3 April 2026',
        status:'completed', desc:'Aksi kepedulian sosial dan kemanusiaan berkala.',
        fullDesc:'Kegiatan donor darah bekerja sama dengan PMI serta penyaluran bantuan sosial bagi masyarakat yang membutuhkan sekitar lingkungan kampus.', image:'' },
    ]},
  { id:'ekokreatif', icon:'fa-coins',         name:'Kementerian Ekonomi Kreatif', shortName:'EKRAF',
    desc:'Pengembangan kewirausahaan mahasiswa, merchandise resmi, dan kemandirian finansial HIMAFI.',
    agendas:[
      { id:'ekraf_1', category:'Proker', title:'HIMAFI Official Store & Merchandise', date:'Sepanjang Kepengurusan',
        status:'ongoing', desc:'Penjualan jaket himpunan, PDH, kaos, dan merchandise sains.',
        fullDesc:'Layanan penyediaan atribut resmi HIMAFI UNAIR (PDH, Jaket, Lanyard, Stiker, Kaos bertema Fisika) untuk menunjang identitas warga dan menyokong pendanaan mandiri himpunan.', image:'' },
      { id:'ekraf_2', category:'Agenda', title:'Entrepreneurship Webinar & Expo', date:'28 November 2026',
        status:'comingsoon', desc:'Pelatihan kewirausahaan dan inkubasi bisnis mahasiswa.',
        fullDesc:'Webinar dan pameran bisnis kreatif mahasiswa fisika yang menghadirkan wirausahawan sukses untuk berbagi strategi memulai usaha dan komersialisasi produk sains.', image:'' },
    ]},
  { id:'ristek',     icon:'fa-flask',         name:'Kementerian Riset dan Teknologi', shortName:'RISTEK',
    desc:'Mendorong budaya riset, pendampingan kompetisi ilmiah, olimpiade fisika, dan sains terapan.',
    agendas:[
      { id:'ristek_1', category:'Proker', title:'Airlangga Physics Competition (APC)', date:'1–3 November 2026',
        status:'comingsoon', desc:'Olimpiade fisika & kompetisi karya tulis tingkat nasional.',
        fullDesc:'Airlangga Physics Competition (APC) adalah ajang kompetisi fisika tahunan tingkat SMA dan Mahasiswa se-Indonesia yang menguji teori, eksperimen, dan karya inovasi sains terapan.', image:'' },
      { id:'ristek_2', category:'Agenda', title:'Pendampingan PKM & Jurnal SINTA', date:'Sepanjang Kepengurusan',
        status:'ongoing', desc:'Pendampingan Program Kreativitas Mahasiswa (PKM).',
        fullDesc:'Pendampingan intensif bagi tim mahasiswa Fisika UNAIR yang mengikuti Program Kreativitas Mahasiswa (PKM) serta bimbingan penulisan artikel ilmiah menuju jurnal terindeks SINTA.', image:'' },
    ]},
];

const DEFAULT_PENGUMUMAN = [
  { id:'ann_1', judul:'Selamat Datang di Web HIMAFI UNAIR!', isi:'Website resmi HIMAFI Universitas Airlangga telah resmi diluncurkan. Pantau terus untuk informasi kegiatan dan program kerja terbaru.', tanggal:'2026-08-01', pengirim:'BPI HIMAFI', urgensi:'event' },
];

// ============================================================
// STATE
// ============================================================

let isAdmin             = false;
let orgData             = [];
let ministriesData      = [];
let pengumumanData      = [];
let currentMinistryId   = null;
let editingAgendaId     = null;
let editingOrgId        = null;
let editingPengId       = null;
let compressedImgUrl    = '';
let captchaAnswer       = 0;
let sessionCheckTimer   = null;

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  await initAdminHash();
  checkSession();
  loadHeroBg();

  loadOrgData();
  loadMinistriesData();
  loadPengumumanData();

  setupNavbar();
  setupLoginForm();
  setupChangePassForm();
  setupHeroBgInput();
  setupOrgForm();
  setupAgendaForm();
  setupPengumumanForm();
  setupSimTabsIfAny(); // compatibility shim

  // Init arXiv board
  if (typeof initArxivBoard === 'function') initArxivBoard();
});

// ============================================================
// SECURITY: SHA-256 via Web Crypto API
// ============================================================

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function initAdminHash() {
  if (!localStorage.getItem(ADMIN_PASS_HASH_KEY)) {
    const h = await sha256(getAdminUsername() + ':' + ADMIN_DEFAULT_PASS);
    localStorage.setItem(ADMIN_PASS_HASH_KEY, h);
  }
}

// ============================================================
// SECURITY: SESSION & LOCKOUT
// ============================================================

function checkSession() {
  const token = localStorage.getItem(SESSION_TOKEN_KEY);
  const ts    = parseInt(localStorage.getItem(SESSION_TS_KEY) || '0', 10);
  if (token && token.length === 64 && Date.now() - ts < SESSION_TTL) {
    isAdmin = true;
    refreshSessionTimestamp();
    startSessionWatchdog();
  }
  applyAdminState();
}

function refreshSessionTimestamp() {
  localStorage.setItem(SESSION_TS_KEY, String(Date.now()));
}

function startSessionWatchdog() {
  if (sessionCheckTimer) clearInterval(sessionCheckTimer);
  sessionCheckTimer = setInterval(() => {
    const ts = parseInt(localStorage.getItem(SESSION_TS_KEY) || '0', 10);
    if (Date.now() - ts >= SESSION_TTL) {
      logoutAdmin();
      showToast('Sesi admin telah habis. Silakan login kembali.', 'info');
    }
  }, 60000);

  // Perbarui timestamp setiap interaksi
  ['click','keydown','scroll'].forEach(ev => {
    document.addEventListener(ev, refreshSessionTimestamp, { passive: true });
  });
}

function generateToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('');
}

function isLockedOut() {
  const lockUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || '0', 10);
  return Date.now() < lockUntil;
}

function getRemainingLockout() {
  const lockUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || '0', 10);
  return Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
}

function getAttempts() {
  return parseInt(localStorage.getItem(ATTEMPT_KEY) || '0', 10);
}

function recordFailedAttempt() {
  const attempts = getAttempts() + 1;
  localStorage.setItem(ATTEMPT_KEY, String(attempts));
  if (attempts >= MAX_ATTEMPTS) {
    localStorage.setItem(LOCKOUT_KEY, String(Date.now() + LOCKOUT_DURATION));
    localStorage.setItem(ATTEMPT_KEY, '0');
  }
}

function clearAttempts() {
  localStorage.removeItem(ATTEMPT_KEY);
  localStorage.removeItem(LOCKOUT_KEY);
}

// ============================================================
// SECURITY: MATH CAPTCHA
// ============================================================

function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const ops = [
    { sym: '+', ans: a + b },
    { sym: '×', ans: a * b },
    { sym: '−', ans: Math.abs(a - b), qa: Math.max(a,b), qb: Math.min(a,b) },
  ];
  const op = ops[Math.floor(Math.random() * ops.length)];
  captchaAnswer = op.ans;
  const qa = op.qa !== undefined ? op.qa : a;
  const qb = op.qb !== undefined ? op.qb : b;
  const el = document.getElementById('captchaQuestion');
  if (el) el.textContent = `Berapa: ${qa} ${op.sym} ${qb} = ?`;
  const input = document.getElementById('captchaInput');
  if (input) { input.value = ''; input.focus(); }
}

function sanitizeInput(str) {
  return String(str)
    .replace(/[<>"'`]/g, '')
    .trim()
    .slice(0, 128);
}

// ============================================================
// ADMIN: LOGIN / LOGOUT
// ============================================================

function setupLoginForm() {
  const navBtn = document.getElementById('navLoginBtn');
  if (navBtn) navBtn.addEventListener('click', e => { e.preventDefault(); openLoginModal(); });

  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      await handleLogin();
    });
  }
}

function setupChangePassForm() {
  const btn = document.getElementById('btnChangePassNav');
  if (btn) btn.addEventListener('click', e => { e.preventDefault(); openChangePassModal(); });

  const form = document.getElementById('changePassForm');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      await handleChangePassword();
    });
  }
}

function openChangePassModal() {
  if (!isAdmin) return;
  const userInput = document.getElementById('changeUser');
  if (userInput) userInput.value = getAdminUsername();
  resetForm('changePassForm');
  if (userInput) userInput.value = getAdminUsername();
  openModal('changePassModal');
}

async function handleChangePassword() {
  if (!isAdmin) return;

  const currentPass = sanitizeInput(getVal('changeOldPass'));
  const newUser     = sanitizeInput(getVal('changeUser'));
  const newPass     = sanitizeInput(getVal('changeNewPass'));
  const confirmPass = sanitizeInput(getVal('changeConfirmPass'));

  if (!currentPass || !newUser || !newPass || !confirmPass) {
    showToast('Semua field wajib diisi!', 'error');
    return;
  }

  // Verifikasi password lama
  const currentHash  = await sha256(getAdminUsername() + ':' + currentPass);
  const storedHash   = localStorage.getItem(ADMIN_PASS_HASH_KEY);

  if (currentHash !== storedHash) {
    showToast('Password lama tidak sesuai!', 'error');
    return;
  }

  if (newPass.length < 6) {
    showToast('Password baru minimal 6 karakter!', 'error');
    return;
  }

  if (newPass !== confirmPass) {
    showToast('Konfirmasi password baru tidak cocok!', 'error');
    return;
  }

  // Update Username & Password Hash
  const newHash = await sha256(newUser + ':' + newPass);
  localStorage.setItem(ADMIN_USER_KEY, newUser);
  localStorage.setItem(ADMIN_PASS_HASH_KEY, newHash);

  closeModal('changePassModal');
  showToast('Username & Password Admin berhasil diperbarui!', 'success');
}

window.openChangePassModal = openChangePassModal;

async function handleLogin() {
  // 1. Cek lockout
  if (isLockedOut()) {
    const secs = getRemainingLockout();
    const mins = Math.ceil(secs / 60);
    showLockoutWarning(`Akun terkunci. Coba lagi dalam ${mins} menit.`);
    return;
  }

  // 2. Validasi CAPTCHA
  const captchaVal = parseInt((document.getElementById('captchaInput')?.value || ''), 10);
  if (isNaN(captchaVal) || captchaVal !== captchaAnswer) {
    showToast('Jawaban CAPTCHA salah!', 'error');
    generateCaptcha();
    return;
  }

  // 3. Sanitize & hash input
  const usernameRaw = sanitizeInput(document.getElementById('loginUser')?.value || '');
  const passwordRaw = sanitizeInput(document.getElementById('loginPass')?.value || '');

  if (!usernameRaw || !passwordRaw) {
    showToast('Username dan password wajib diisi.', 'error');
    return;
  }

  const inputHash    = await sha256(usernameRaw + ':' + passwordRaw);
  const storedHash   = localStorage.getItem(ADMIN_PASS_HASH_KEY);
  const usernameMatch = usernameRaw === getAdminUsername();

  if (!usernameMatch || inputHash !== storedHash) {
    recordFailedAttempt();
    const attemptsLeft = MAX_ATTEMPTS - getAttempts();
    if (isLockedOut()) {
      showLockoutWarning('Terlalu banyak percobaan gagal. Akun dikunci 15 menit.');
    } else {
      showToast(`Username atau password salah. Sisa percobaan: ${attemptsLeft}`, 'error');
      updateAttemptDots();
    }
    generateCaptcha();
    return;
  }

  // 4. Login berhasil
  clearAttempts();
  const token = generateToken();
  localStorage.setItem(SESSION_TOKEN_KEY, token);
  localStorage.setItem(SESSION_TS_KEY, String(Date.now()));
  isAdmin = true;
  startSessionWatchdog();
  applyAdminState();
  closeModal('loginModal');
  showToast('Login admin berhasil!', 'success');
}

function logoutAdmin() {
  isAdmin = false;
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(SESSION_TS_KEY);
  if (sessionCheckTimer) clearInterval(sessionCheckTimer);
  applyAdminState();
}

function applyAdminState() {
  const navBtn     = document.getElementById('navLoginBtn');
  const dropdown   = document.getElementById('adminDropdownWrap');
  const heroBtn    = document.getElementById('changeHeroBgBtn');
  const body       = document.body;

  if (isAdmin) {
    if (navBtn)   navBtn.style.display = 'none';
    if (dropdown) dropdown.style.display = 'inline-block';
    if (heroBtn)  heroBtn.style.display = 'inline-flex';
    body.classList.add('admin-active');
  } else {
    if (navBtn) {
      navBtn.style.display = 'inline-flex';
      navBtn.innerHTML = '<i class="fas fa-user-shield"></i> Login Admin';
      navBtn.onclick   = e => { e.preventDefault(); openLoginModal(); };
    }
    if (dropdown) dropdown.style.display = 'none';
    if (heroBtn)  heroBtn.style.display = 'none';
    body.classList.remove('admin-active');
  }

  renderOrgChart();
  renderMinistryGrid();
  renderPengumuman();
}

function toggleAdminMenu(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('adminDropdownMenu');
  if (menu) menu.classList.toggle('open');
}

function closeAdminMenu() {
  const menu = document.getElementById('adminDropdownMenu');
  if (menu) menu.classList.remove('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.admin-dropdown-wrap')) {
    closeAdminMenu();
  }
});

window.toggleAdminMenu = toggleAdminMenu;
window.closeAdminMenu  = closeAdminMenu;

function openLoginModal() {
  if (isLockedOut()) {
    openModal('loginModal');
    showLockoutWarning(`Akun terkunci. Sisa ${Math.ceil(getRemainingLockout()/60)} menit.`);
    return;
  }
  hideLockoutWarning();
  updateAttemptDots();
  generateCaptcha();

  const form = document.getElementById('loginForm');
  if (form) form.reset();
  openModal('loginModal');
}

function showLockoutWarning(msg) {
  const el = document.getElementById('lockoutWarning');
  if (el) { el.textContent = msg; el.classList.add('show'); }
}
function hideLockoutWarning() {
  const el = document.getElementById('lockoutWarning');
  if (el) el.classList.remove('show');
}
function updateAttemptDots() {
  const attempts = getAttempts();
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const dot = document.getElementById(`aDot${i}`);
    if (dot) dot.classList.toggle('used', i < attempts);
  }
}

window.openLoginModal  = openLoginModal;
window.logoutAdmin     = logoutAdmin;

// ============================================================
// HERO BACKGROUND
// ============================================================

function loadHeroBg() {
  const saved = localStorage.getItem(HERO_BG_KEY);
  const bgImg = document.getElementById('heroBgImg');
  if (saved && saved.length > 10 && bgImg) {
    bgImg.style.backgroundImage = `url('${saved}')`;
    bgImg.classList.add('loaded');
  }
}

function setupHeroBgInput() {
  const input = document.getElementById('heroBgInput');
  if (!input) return;
  input.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await compressImage(file);
      localStorage.setItem(HERO_BG_KEY, res.dataUrl);
      loadHeroBg();
      closeModal('heroBgModal');
      showToast(`Background diperbarui! (${res.sizeMb} MB)`, 'success');
    } catch(err) {
      showToast('Gagal memproses gambar.', 'error');
    }
  });
}

window.openHeroBgModal  = () => openModal('heroBgModal');
window.closeHeroBgModal = () => closeModal('heroBgModal');

// ============================================================
// IMAGE COMPRESSION (Canvas, <3MB)
// ============================================================

function compressImage(file, maxMb = 2.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const max = 1600;
        if (width > max || height > max) {
          if (width > height) { height = Math.round(height * max / width); width = max; }
          else                { width = Math.round(width * max / height); height = max; }
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0,0,width,height);
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85, dataUrl = canvas.toDataURL('image/jpeg', quality);
        while (dataUrl.length * 0.75 > maxMb * 1024 * 1024 && quality > 0.3) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve({ dataUrl, sizeMb: (dataUrl.length * 0.75 / (1024*1024)).toFixed(2) });
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function setupImgInputField(inputId, previewId, statusId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    const status = document.getElementById(statusId);
    if (status) status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengompresi...';
    try {
      const res = await compressImage(file);
      compressedImgUrl = res.dataUrl;
      if (status) status.innerHTML = `<span style="color:var(--green);"><i class="fas fa-check-circle"></i> ${res.sizeMb} MB — OK</span>`;
      const preview = document.getElementById(previewId);
      if (preview) { preview.src = res.dataUrl; preview.style.display = 'block'; }
    } catch(err) {
      if (status) status.textContent = 'Gagal memproses foto.';
    }
  });
}

// ============================================================
// PENGUMUMAN (Announcements)
// ============================================================

function loadPengumumanData() {
  const stored = localStorage.getItem(PENGUMUMAN_DATA_KEY);
  pengumumanData = stored ? tryParse(stored, DEFAULT_PENGUMUMAN) : [...DEFAULT_PENGUMUMAN];
  renderPengumuman();
}

function savePengumumanData() {
  localStorage.setItem(PENGUMUMAN_DATA_KEY, JSON.stringify(pengumumanData));
}

function renderPengumuman() {
  const list = document.getElementById('pengumumanList');
  const emptyEl = document.getElementById('pengumumanEmpty');
  const addBtn = document.getElementById('addPengumumanBtn');
  if (!list) return;

  if (addBtn) addBtn.style.display = isAdmin ? 'inline-flex' : 'none';

  if (!pengumumanData.length) {
    list.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  const sorted = [...pengumumanData].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  list.innerHTML = sorted.map(p => {
    const d = new Date(p.tanggal);
    const day   = d.toLocaleDateString('id-ID', { day: '2-digit' });
    const month = d.toLocaleDateString('id-ID', { month: 'short' });

    const urgMap = { penting: 'Penting 🔴', info: 'Informasi 🔵', event: 'Event 🟢' };
    const urgClass = { penting: 'urgency-penting urgency-pill-penting', info: 'urgency-info urgency-pill-info', event: 'urgency-event urgency-pill-event' }[p.urgensi] || 'urgency-info urgency-pill-info';

    const adminActions = isAdmin ? `
      <div class="pengumuman-admin-actions">
        <button class="btn-edit-item" onclick="editPengumuman('${p.id}')"><i class="fas fa-pencil-alt"></i></button>
        <button class="btn-del-item"  onclick="deletePengumuman('${p.id}')"><i class="fas fa-trash"></i></button>
      </div>` : '';

    return `
      <div class="pengumuman-card">
        <div class="pengumuman-urgency-bar ${urgClass.split(' ')[0]}"></div>
        <div class="pengumuman-body">
          <div class="pengumuman-date-col">
            <div class="day">${day}</div>
            <div class="month">${month}</div>
          </div>
          <div class="pengumuman-divider"></div>
          <div class="pengumuman-text">
            <h4>${escHtml(p.judul)}</h4>
            <p>${escHtml(p.isi)}</p>
            <div class="pengumuman-meta">
              <span class="pengumuman-sender">${escHtml(p.pengirim)}</span>
              <span class="tag status-badge ${urgClass}">${urgMap[p.urgensi] || 'Info'}</span>
            </div>
          </div>
        </div>
        ${adminActions}
      </div>
    `;
  }).join('');
}

function setupPengumumanForm() {
  setupImgInputField('pengImgInput', 'pengImgPreview', 'pengImgStatus');
  const form = document.getElementById('pengumumanForm');
  if (form) form.addEventListener('submit', savePengumuman);
}

function openAddPengumuman() {
  editingPengId = null;
  compressedImgUrl = '';
  resetForm('pengumumanForm');
  const title = document.getElementById('pengModalTitle');
  if (title) title.textContent = 'Tambah Pengumuman Baru';
  openModal('pengumumanModal');
}

function editPengumuman(id) {
  const p = pengumumanData.find(x => x.id === id);
  if (!p) return;
  editingPengId = id;
  compressedImgUrl = '';

  const title = document.getElementById('pengModalTitle');
  if (title) title.textContent = 'Edit Pengumuman';

  setVal('pengJudul',   p.judul);
  setVal('pengIsi',     p.isi);
  setVal('pengTanggal', p.tanggal);
  setVal('pengPengirim',p.pengirim);
  setVal('pengUrgensi', p.urgensi);

  openModal('pengumumanModal');
}

function savePengumuman(e) {
  e.preventDefault();
  const data = {
    judul:    sanitizeInput(getVal('pengJudul')),
    isi:      sanitizeInput(getVal('pengIsi')),
    tanggal:  getVal('pengTanggal'),
    pengirim: sanitizeInput(getVal('pengPengirim')),
    urgensi:  getVal('pengUrgensi'),
  };
  if (!data.judul || !data.isi || !data.tanggal || !data.pengirim) {
    showToast('Semua field wajib diisi!', 'error'); return;
  }

  if (editingPengId) {
    const idx = pengumumanData.findIndex(x => x.id === editingPengId);
    if (idx !== -1) pengumumanData[idx] = { ...pengumumanData[idx], ...data };
    showToast('Pengumuman diperbarui!', 'success');
  } else {
    pengumumanData.unshift({ id: 'ann_' + Date.now(), ...data });
    showToast('Pengumuman ditambahkan!', 'success');
  }

  savePengumumanData();
  renderPengumuman();
  closeModal('pengumumanModal');
}

window.deletePengumuman = function(id) {
  if (!confirm('Hapus pengumuman ini?')) return;
  pengumumanData = pengumumanData.filter(x => x.id !== id);
  savePengumumanData();
  renderPengumuman();
  showToast('Pengumuman dihapus.', 'info');
};

window.editPengumuman  = editPengumuman;
window.openAddPengumuman = openAddPengumuman;

// ============================================================
// ORG CHART (Bagan Kepengurusan)
// ============================================================

function loadOrgData() {
  const stored = localStorage.getItem(ORG_DATA_KEY);
  orgData = stored ? tryParse(stored, [...DEFAULT_ORG]) : [...DEFAULT_ORG];
  renderOrgChart();
}

function saveOrgData() { localStorage.setItem(ORG_DATA_KEY, JSON.stringify(orgData)); }

function renderOrgChart() {
  const container = document.getElementById('orgChartContainer');
  if (!container) return;
  const tier = n => orgData.filter(m => m.tier === n);

  const tierHtml = (members, cls) => `
    <div class="org-tier ${cls}">
      ${members.map(renderOrgCard).join('')}
    </div>`;

  container.innerHTML = `
    ${tierHtml(tier(1), 'org-tier-1')}
    <div class="org-connector"></div>
    ${tierHtml(tier(2), 'org-tier-2')}
    <div class="org-connector"></div>
    <div class="org-tier-label">Badan Pengurus Inti (BPI)</div>
    ${tierHtml(tier(3), 'org-tier-3')}
    <div class="org-connector"></div>
    <div class="org-tier-label">Jajaran Menteri Kabinet</div>
    ${tierHtml(tier(4), 'org-tier-4')}
  `;
}

function renderOrgCard(m) {
  const avatarHtml = m.image
    ? `<img src="${m.image}" alt="${escHtml(m.name)}" />`
    : `<i class="fas fa-user"></i>`;
  const editBtn = `<button class="btn-edit-org" onclick="openOrgModal('${m.id}')"><i class="fas fa-pencil-alt"></i> Edit</button>`;
  return `
    <div class="org-card ${m.tier === 1 ? 'tier-1' : ''}">
      <div class="org-avatar">${avatarHtml}</div>
      <span class="org-role">${escHtml(m.role)}</span>
      <span class="org-name">${escHtml(m.name)}</span>
      ${editBtn}
    </div>`;
}

function setupOrgForm() {
  setupImgInputField('orgImgInput', 'orgImgPreview', 'orgImgStatus');
  const form = document.getElementById('orgForm');
  if (form) form.addEventListener('submit', saveOrgMember);
}

function openOrgModal(id) {
  editingOrgId = id;
  compressedImgUrl = '';
  const m = orgData.find(x => x.id === id);
  if (!m) return;
  const titleEl = document.getElementById('orgModalTitle');
  if (titleEl) titleEl.textContent = `Edit Pengurus — ${m.role}`;
  setVal('orgMemberName', m.name);
  const preview = document.getElementById('orgImgPreview');
  if (preview) {
    if (m.image) { preview.src = m.image; preview.style.display = 'block'; compressedImgUrl = m.image; }
    else { preview.src = ''; preview.style.display = 'none'; }
  }
  const status = document.getElementById('orgImgStatus');
  if (status) status.textContent = '';
  openModal('orgMemberModal');
}

function saveOrgMember(e) {
  e.preventDefault();
  const m = orgData.find(x => x.id === editingOrgId);
  if (!m) return;
  const name = sanitizeInput(getVal('orgMemberName'));
  if (!name) { showToast('Nama tidak boleh kosong!', 'error'); return; }
  m.name = name;
  if (compressedImgUrl) m.image = compressedImgUrl;
  saveOrgData();
  renderOrgChart();
  closeModal('orgMemberModal');
  showToast(`Data ${m.role} diperbarui!`, 'success');
}

window.openOrgModal = openOrgModal;

// ============================================================
// MINISTRY / PROKER PLATFORM
// ============================================================

function loadMinistriesData() {
  const stored = localStorage.getItem(MINISTRY_DATA_KEY);
  ministriesData = stored ? tryParse(stored, [...DEFAULT_MINISTRIES]) : [...DEFAULT_MINISTRIES];
  renderMinistryGrid();
}

function saveMinistriesData() { localStorage.setItem(MINISTRY_DATA_KEY, JSON.stringify(ministriesData)); }

function renderMinistryGrid() {
  const grid = document.getElementById('ministryGrid');
  if (!grid) return;
  grid.innerHTML = ministriesData.map(m => {
    const count = (m.agendas || []).length;
    return `
      <div class="ministry-card" onclick="openMinistryModal('${m.id}')">
        <div class="ministry-icon"><i class="fas ${m.icon}"></i></div>
        <span class="ministry-count"><i class="fas fa-list-ul"></i> ${count} Kegiatan</span>
        <h3>${escHtml(m.name)}</h3>
        <p>${escHtml(m.desc)}</p>
        <span class="ministry-cta">Lihat Detail <i class="fas fa-arrow-right"></i></span>
      </div>`;
  }).join('');
}

function openMinistryModal(id) {
  currentMinistryId = id;
  renderMinistryModalContent();
  openModal('ministryModal');
}
function closeMinistryModal() { closeModal('ministryModal'); currentMinistryId = null; }

function renderMinistryModalContent() {
  const m = ministriesData.find(x => x.id === currentMinistryId);
  if (!m) return;
  const titleEl = document.getElementById('ministryModalTitle');
  if (titleEl) titleEl.innerHTML = `<i class="fas ${m.icon}"></i> ${escHtml(m.name)}`;
  const body = document.getElementById('ministryModalBody');
  if (!body) return;

  const agendas = m.agendas || [];
  const adminBar = isAdmin
    ? `<div style="text-align:right;margin-bottom:20px;">
         <button class="btn btn-primary btn-sm" onclick="openAgendaFormModal(null)">
           <i class="fas fa-plus"></i> Tambah Kegiatan
         </button>
       </div>` : '';

  const agendaGrid = agendas.length
    ? `<div class="agenda-grid">${agendas.map(renderAgendaCard).join('')}</div>`
    : `<p style="text-align:center;color:var(--mid-gray);padding:40px 0;">Belum ada kegiatan yang terdaftar.</p>`;

  body.innerHTML = adminBar + agendaGrid;
}

function renderAgendaCard(item) {
  const catClass = item.category === 'Proker' ? 'tag-proker' : 'tag-agenda';
  const statusMap = {
    completed:  { cls:'status-completed',  label:'Completed ✓' },
    ongoing:    { cls:'status-ongoing',    label:'On Going ⚡' },
    comingsoon: { cls:'status-comingsoon', label:'Coming Soon 📅' },
  };
  const st = statusMap[item.status] || statusMap.comingsoon;
  const imgHtml = item.image ? `<img class="agenda-card-img" src="${item.image}" alt="${escHtml(item.title)}">` : '';
  const adminActions = isAdmin ? `
    <div class="agenda-admin-row" onclick="event.stopPropagation()">
      <button class="btn btn-ghost btn-sm" onclick="openAgendaFormModal('${item.id}')"><i class="fas fa-pencil-alt"></i> Edit</button>
      <button class="btn btn-sm" style="background:var(--red-bg);color:var(--red);" onclick="deleteAgenda('${item.id}')"><i class="fas fa-trash"></i> Hapus</button>
    </div>` : '';

  return `
    <div class="agenda-card" onclick="openActivityDetail('${item.id}')">
      ${imgHtml}
      <div class="agenda-card-body">
        <div class="agenda-tags">
          <span class="tag tag-${item.category === 'Proker' ? 'proker' : 'agenda'} ${catClass}">${item.category}</span>
          <span class="status-badge ${st.cls}">${st.label}</span>
        </div>
        <h4>${escHtml(item.title)}</h4>
        <p>${escHtml(item.desc)}</p>
        <span class="agenda-date"><i class="far fa-calendar-alt"></i> ${escHtml(item.date || 'TBD')}</span>
        ${adminActions}
      </div>
    </div>`;
}

function openActivityDetail(agendaId) {
  const m    = ministriesData.find(x => x.id === currentMinistryId);
  const item = (m?.agendas || []).find(a => a.id === agendaId);
  if (!item) return;

  const statusMap = {
    completed:  { cls:'status-completed',  label:'Completed ✓' },
    ongoing:    { cls:'status-ongoing',    label:'On Going ⚡' },
    comingsoon: { cls:'status-comingsoon', label:'Coming Soon 📅' },
  };
  const st = statusMap[item.status] || statusMap.comingsoon;

  const titleEl = document.getElementById('activityDetailTitle');
  if (titleEl) titleEl.textContent = item.title;
  const body = document.getElementById('activityDetailBody');
  if (!body) return;

  const imgHtml = item.image ? `<img class="activity-hero-img" src="${item.image}" alt="${escHtml(item.title)}">` : '';
  body.innerHTML = `
    ${imgHtml}
    <div class="activity-meta-row">
      <span class="tag tag-${item.category === 'Proker' ? 'proker' : 'agenda'} ${item.category === 'Proker' ? 'tag-proker' : 'tag-agenda'}">${item.category}</span>
      <span class="status-badge ${st.cls}">${st.label}</span>
      <span class="activity-ministry-pill"><i class="fas fa-sitemap"></i> ${escHtml(m?.name || '')}</span>
    </div>
    <div class="activity-date-box"><i class="far fa-calendar-alt"></i> <strong>Tanggal:</strong> ${escHtml(item.date || 'TBD')}</div>
    <div class="activity-full-desc">
      <h4>Rincian Kegiatan</h4>
      <p>${escHtml(item.fullDesc || item.desc || '-')}</p>
    </div>`;

  openModal('activityDetailModal');
}

function setupAgendaForm() {
  setupImgInputField('agendaImgInput', 'agendaImgPreview', 'agendaImgStatus');
  const form = document.getElementById('agendaForm');
  if (form) form.addEventListener('submit', saveAgendaItem);
}

function openAgendaFormModal(id) {
  editingAgendaId = id;
  compressedImgUrl = '';
  const m = ministriesData.find(x => x.id === currentMinistryId);

  const titleEl = document.getElementById('agendaModalTitle');
  const preview = document.getElementById('agendaImgPreview');
  const status  = document.getElementById('agendaImgStatus');

  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  if (status)  status.textContent = '';

  if (id) {
    const item = (m?.agendas || []).find(a => a.id === id);
    if (!item) return;
    if (titleEl) titleEl.textContent = `Edit Kegiatan — ${m?.shortName}`;
    setVal('agendaCategory', item.category);
    setVal('agendaTitle',    item.title);
    setVal('agendaDate',     item.date);
    setVal('agendaStatus',   item.status);
    setVal('agendaDesc',     item.desc);
    setVal('agendaFullDesc', item.fullDesc || '');
    if (item.image && preview) { preview.src = item.image; preview.style.display = 'block'; compressedImgUrl = item.image; }
  } else {
    if (titleEl) titleEl.textContent = `Tambah Kegiatan — ${m?.shortName}`;
    resetForm('agendaForm');
  }
  openModal('agendaModal');
}

function saveAgendaItem(e) {
  e.preventDefault();
  const m = ministriesData.find(x => x.id === currentMinistryId);
  if (!m) return;
  if (!m.agendas) m.agendas = [];

  const data = {
    category: getVal('agendaCategory'),
    title:    sanitizeInput(getVal('agendaTitle')),
    date:     sanitizeInput(getVal('agendaDate')),
    status:   getVal('agendaStatus'),
    desc:     sanitizeInput(getVal('agendaDesc')),
    fullDesc: sanitizeInput(getVal('agendaFullDesc')),
  };
  if (!data.title || !data.desc) { showToast('Judul & deskripsi wajib diisi!', 'error'); return; }

  if (editingAgendaId) {
    const idx = m.agendas.findIndex(a => a.id === editingAgendaId);
    if (idx !== -1) m.agendas[idx] = { ...m.agendas[idx], ...data, image: compressedImgUrl || m.agendas[idx].image };
    showToast('Kegiatan diperbarui!', 'success');
  } else {
    m.agendas.unshift({ id: 'a_' + Date.now(), ...data, image: compressedImgUrl });
    showToast('Kegiatan ditambahkan!', 'success');
  }

  saveMinistriesData();
  renderMinistryGrid();
  renderMinistryModalContent();
  closeModal('agendaModal');
}

window.deleteAgenda = function(id) {
  if (!confirm('Hapus kegiatan ini?')) return;
  const m = ministriesData.find(x => x.id === currentMinistryId);
  if (!m) return;
  m.agendas = (m.agendas || []).filter(a => a.id !== id);
  saveMinistriesData();
  renderMinistryGrid();
  renderMinistryModalContent();
  showToast('Kegiatan dihapus.', 'info');
};

window.openMinistryModal    = openMinistryModal;
window.closeMinistryModal   = closeMinistryModal;
window.openAgendaFormModal  = openAgendaFormModal;
window.openActivityDetail   = openActivityDetail;

// ============================================================
// NAVBAR
// ============================================================

function setupNavbar() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
  }

  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

// Compatibility shim: no-op if simulasi tabs not present
function setupSimTabsIfAny() {
  document.querySelectorAll('.sim-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.sim-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.sim-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById('sim-' + tab.dataset.sim);
      if (target) target.classList.add('active');
    });
  });
}

// ============================================================
// MODAL HELPERS
// ============================================================

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// expose all modals close
['loginModal','heroBgModal','orgMemberModal','ministryModal','activityDetailModal','agendaModal','pengumumanModal'].forEach(id => {
  window[`close${id.charAt(0).toUpperCase() + id.slice(1)}`] = () => closeModal(id);
});

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// ============================================================
// FORM / DOM HELPERS
// ============================================================

function getVal(id)       { return document.getElementById(id)?.value || ''; }
function setVal(id, val)  { const el = document.getElementById(id); if (el) el.value = val; }
function resetForm(id)    { document.getElementById(id)?.reset(); }
function tryParse(str, def) { try { return JSON.parse(str); } catch { return def; } }
function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

function showToast(msg, type = 'info') {
  let wrap = document.getElementById('toastWrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'toastWrap';
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  t.className = `toast t-${type}`;
  t.textContent = msg;
  wrap.appendChild(t);
  requestAnimationFrame(() => { requestAnimationFrame(() => t.classList.add('show')); });
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, 3500);
}

window.showToast = showToast;
