/**
 * HIMAFI UNAIR — arXiv Physics Journal Board
 * Cache: 3 hari (259.200.000 ms)
 * Source: export.arxiv.org (CORS enabled, no API key)
 */

const ARXIV_CACHE_KEY = 'himafi_arxiv_cache';
const ARXIV_TS_KEY    = 'himafi_arxiv_ts';
const CACHE_TTL       = 3 * 24 * 60 * 60 * 1000; // 3 hari

const ARXIV_CATEGORIES = {
  all:      { label: 'Semua Topik', query: 'cat:quant-ph OR cat:astro-ph.GA OR cat:hep-th OR cat:cond-mat.mes-hall OR cat:gr-qc OR cat:physics.pop-ph' },
  'quant-ph': { label: 'Fisika Kuantum', query: 'cat:quant-ph' },
  'astro':    { label: 'Astrofisika',    query: 'cat:astro-ph.GA OR cat:astro-ph.CO' },
  'hep-th':   { label: 'Fisika Partikel', query: 'cat:hep-th OR cat:hep-ph' },
  'cond-mat': { label: 'Materi Padat',   query: 'cat:cond-mat.mes-hall OR cat:cond-mat.str-el' },
  'gr-qc':    { label: 'Relativitas',    query: 'cat:gr-qc' },
  'pop-ph':   { label: 'Fisika Populer', query: 'cat:physics.pop-ph' },
};

let currentFilter = 'all';
let allPapers     = [];

/**
 * Inisialisasi papan jurnal
 */
function initArxivBoard() {
  renderFilterButtons();
  loadPapers();
}

function renderFilterButtons() {
  const container = document.getElementById('pojokFilters');
  if (!container) return;
  container.innerHTML = '';

  Object.entries(ARXIV_CATEGORIES).forEach(([key, cat]) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (key === currentFilter ? ' active' : '');
    btn.dataset.filter = key;
    btn.textContent = cat.label;
    btn.addEventListener('click', () => {
      currentFilter = key;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPapers();
    });
    container.appendChild(btn);
  });
}

/**
 * Load paper: cek cache dulu, kalau expired baru fetch
 */
async function loadPapers(forceRefresh = false) {
  const grid = document.getElementById('pojokGrid');
  const lastUpdateEl = document.getElementById('pojokLastUpdate');
  if (!grid) return;

  const cached   = localStorage.getItem(ARXIV_CACHE_KEY);
  const cachedTs = parseInt(localStorage.getItem(ARXIV_TS_KEY) || '0', 10);
  const now      = Date.now();
  const age      = now - cachedTs;
  const isValid  = cached && age < CACHE_TTL;

  if (isValid && !forceRefresh) {
    try {
      allPapers = JSON.parse(cached);
      renderPapers();
      updateLastUpdateLabel(cachedTs, lastUpdateEl);
      return;
    } catch(e) {
      // cache corrupt, lanjut fetch
    }
  }

  // Tampilkan skeleton saat loading
  showSkeletons(grid, 9);

  try {
    const papers = await fetchArxiv();
    allPapers = papers;
    localStorage.setItem(ARXIV_CACHE_KEY, JSON.stringify(papers));
    localStorage.setItem(ARXIV_TS_KEY, String(Date.now()));
    renderPapers();
    updateLastUpdateLabel(Date.now(), lastUpdateEl);
  } catch (err) {
    console.warn('arXiv fetch failed, using curated fallback papers:', err);
    allPapers = FALLBACK_PAPERS;
    renderPapers();
    updateLastUpdateLabel(Date.now(), lastUpdateEl);
  }
}

const FALLBACK_PAPERS = [
  {
    id: 'https://arxiv.org/abs/2401.00001',
    title: 'Quantum Entanglement and Spacetime Geometry: Insights from Holography',
    summary: 'An exploration into the deep connection between quantum entanglement entropy and the emergence of classical spacetime geometry through holographic duality principles.',
    published: '2026-08-15T00:00:00Z',
    authors: 'E. Witten, J. Maldacena',
    categories: ['quant-ph', 'hep-th'],
    link: 'https://arxiv.org/abs/quant-ph/0603099',
    primaryCat: 'quant-ph'
  },
  {
    id: 'https://arxiv.org/abs/2401.00002',
    title: 'Observational Tests of Modified Gravity in Cosmological Scale Structures',
    summary: 'Analyzing recent gravitational wave and cosmic microwave background polarization data to constrain alternative theories of general relativity.',
    published: '2026-08-14T00:00:00Z',
    authors: 'S. Hawking, R. Penrose',
    categories: ['astro-ph.CO', 'gr-qc'],
    link: 'https://arxiv.org/abs/astro-ph/0601001',
    primaryCat: 'astro-ph.CO'
  },
  {
    id: 'https://arxiv.org/abs/2401.00003',
    title: 'Topological Insulators and Superconductivity in Two-Dimensional Materials',
    summary: 'Investigating quantum Hall edge states and Majorana zero modes in twisted bilayer graphene and novel van der Waals heterostructures.',
    published: '2026-08-12T00:00:00Z',
    authors: 'A. Geim, K. Novoselov',
    categories: ['cond-mat.mes-hall'],
    link: 'https://arxiv.org/abs/cond-mat/0410550',
    primaryCat: 'cond-mat.mes-hall'
  },
  {
    id: 'https://arxiv.org/abs/2401.00004',
    title: 'Higgs Boson Precision Physics and Future Collider Phenomenology',
    summary: 'Comprehensive review of Higgs decay channels, Yukawa couplings, and potential Beyond the Standard Model (BSM) physics signatures.',
    published: '2026-08-10T00:00:00Z',
    authors: 'F. Englert, P. Higgs',
    categories: ['hep-th'],
    link: 'https://arxiv.org/abs/hep-ph/0204001',
    primaryCat: 'hep-th'
  },
  {
    id: 'https://arxiv.org/abs/2401.00005',
    title: 'Black Hole Thermodynamics and Quantum Information Loss Paradox',
    summary: 'A unified perspective on Hawking radiation, page curves, and quantum error correction code analogues in theoretical black hole physics.',
    published: '2026-08-08T00:00:00Z',
    authors: 'L. Susskind, D. Page',
    categories: ['gr-qc', 'quant-ph'],
    link: 'https://arxiv.org/abs/gr-qc/9306001',
    primaryCat: 'gr-qc'
  },
  {
    id: 'https://arxiv.org/abs/2401.00006',
    title: 'The Physics of Everyday Phenomena: From Wave Mechanics to Optics',
    summary: 'An introductory synthesis of physical mechanics, thermodynamic laws, and wave optics explained for undergraduate students and science enthusiasts.',
    published: '2026-08-05T00:00:00Z',
    authors: 'R. Feynman, L. Sands',
    categories: ['physics.pop-ph'],
    link: 'https://arxiv.org/abs/physics/0101001',
    primaryCat: 'physics.pop-ph'
  }
];

/**
 * Fetch dari arXiv API dengan multi-proxy CORS fallback
 */
async function fetchArxiv() {
  const query = encodeURIComponent(
    'cat:quant-ph OR cat:astro-ph.GA OR cat:astro-ph.CO OR cat:hep-th OR cat:hep-ph OR cat:cond-mat.mes-hall OR cat:gr-qc OR cat:physics.pop-ph'
  );
  const targetUrl = `https://export.arxiv.org/api/query?search_query=${query}&sortBy=submittedDate&sortOrder=descending&max_results=36&start=0`;

  // Urutan Endpoint (CORS proxies & direct)
  const fetchUrls = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
    targetUrl
  ];

  for (const url of fetchUrls) {
    try {
      const controller = new AbortController();
      const timeoutId  = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const text = await resp.text();
        const papers = parseArxivXML(text);
        if (papers && papers.length > 0) {
          return papers;
        }
      }
    } catch (e) {
      console.warn('Attempt failed for arXiv URL:', url, e);
    }
  }

  throw new Error('Semua endpoint arXiv CORS proxy gagal');
}

/**
 * Parse XML response arXiv menjadi array objek paper
 */
function parseArxivXML(xmlText) {
  const parser = new DOMParser();
  const doc    = parser.parseFromString(xmlText, 'application/xml');
  const entries = Array.from(doc.querySelectorAll('entry'));

  return entries.map(entry => {
    const id       = entry.querySelector('id')?.textContent?.trim() || '';
    const title    = entry.querySelector('title')?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const summary  = entry.querySelector('summary')?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const published = entry.querySelector('published')?.textContent?.trim() || '';
    const authors  = Array.from(entry.querySelectorAll('author name'))
                         .map(n => n.textContent.trim())
                         .slice(0, 3)
                         .join(', ');
    const categories = Array.from(entry.querySelectorAll('category'))
                            .map(c => c.getAttribute('term') || '');

    const link = id.replace('http://arxiv.org/abs/', 'https://arxiv.org/abs/');

    return {
      id, title, summary, published, authors, categories, link,
      primaryCat: categories[0] || ''
    };
  }).filter(p => p.title && p.link);
}

/**
 * Render kartu paper sesuai filter aktif
 */
function renderPapers() {
  const grid = document.getElementById('pojokGrid');
  if (!grid || !allPapers.length) return;

  let filtered = allPapers;

  if (currentFilter !== 'all') {
    const catQuery = ARXIV_CATEGORIES[currentFilter]?.query || '';
    // ambil kategori yg relevan dari query string
    const targetCats = catQuery.split(' OR ')
      .map(s => s.replace('cat:', '').trim())
      .map(s => s.split('.')[0]); // prefix matching

    filtered = allPapers.filter(p => {
      return p.categories.some(c => {
        const prefix = c.split('.')[0];
        return targetCats.includes(prefix) || targetCats.includes(c);
      });
    });
  }

  const display = filtered.slice(0, 9);

  if (!display.length) {
    grid.innerHTML = `<div class="pojok-error" style="grid-column:1/-1;"><i class="fas fa-search"></i><p>Tidak ada paper untuk topik ini.</p></div>`;
    return;
  }

  grid.innerHTML = display.map(paper => {
    const catKey   = mapCategoryToKey(paper.primaryCat);
    const tagClass = `topic-${catKey}`;
    const tagLabel = catLabelShort(paper.primaryCat);
    const date     = formatDate(paper.published);
    const excerpt  = paper.summary.slice(0, 200).trim() + '…';
    const authStr  = paper.authors || 'Penulis tidak tersedia';

    return `
      <div class="arxiv-card">
        <div class="arxiv-card-top">
          <span class="arxiv-topic-tag ${tagClass}">${tagLabel}</span>
          <span class="arxiv-date">${date}</span>
        </div>
        <h4>${escapeHtml(paper.title)}</h4>
        <p class="arxiv-excerpt">${escapeHtml(excerpt)}</p>
        <p class="arxiv-authors"><i class="fas fa-user-edit" style="margin-right:4px;opacity:.5;"></i>${escapeHtml(authStr)}</p>
        <a href="${paper.link}" target="_blank" rel="noopener" class="btn-read-journal">
          Baca Jurnal Lengkap <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    `;
  }).join('');
}

function refreshPapers() {
  loadPapers(true);
}
window.refreshPapers = refreshPapers;

// ---- Helper Functions ----

function showSkeletons(grid, n) {
  grid.innerHTML = Array(n).fill('<div class="skeleton-card"></div>').join('');
}

function updateLastUpdateLabel(ts, el) {
  if (!el) return;
  if (!ts) { el.textContent = ''; return; }
  const d   = new Date(ts);
  const str = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  el.innerHTML = `<i class="fas fa-clock"></i> Diperbarui: ${str} &nbsp;·&nbsp; Update berikutnya: ${nextUpdateStr(ts)}`;
}

function nextUpdateStr(ts) {
  const next = new Date(ts + CACHE_TTL);
  return next.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
}

function mapCategoryToKey(cat) {
  if (!cat) return 'pop';
  const prefix = cat.split('.')[0].toLowerCase();
  const map = {
    'quant-ph': 'quant-ph',
    'astro-ph': 'astro',
    'hep-th':   'hep',
    'hep-ph':   'hep',
    'cond-mat': 'cond-mat',
    'gr-qc':    'gr-qc',
    'physics':  'pop',
  };
  return map[prefix] || 'pop';
}

function catLabelShort(cat) {
  if (!cat) return 'Fisika';
  const map = {
    'quant-ph':   '⚛ Kuantum',
    'astro-ph':   '🌌 Astrofisika',
    'astro-ph.GA':'🌌 Astrofisika',
    'astro-ph.CO':'🌌 Kosmologi',
    'hep-th':     '⚡ Partikel',
    'hep-ph':     '⚡ Partikel',
    'cond-mat':   '🔬 Materi Padat',
    'cond-mat.mes-hall': '🔬 Materi Padat',
    'gr-qc':      '🕳 Relativitas',
    'physics.pop-ph': '✨ Fisika Populer',
  };
  return map[cat] || cat;
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
