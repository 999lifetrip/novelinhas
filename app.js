// ═══════════════════════════════════════════════════════════════════════════
// APP.JS — Novelinhas VIP: Plataforma de Streaming de Alta Conversão
// Arquitetura Multi-View, Player Camuflado Stealth, 150 Séries & 3.231 Caps
// ═══════════════════════════════════════════════════════════════════════════

// ─── ESTADO GLOBAL DA APLICAÇÃO ─────────────────────────────────────────────
let currentMainTab = 'home'; // 'home' | 'doramas' | 'turcas' | 'microdramas' | 'top10'
let currentCategoryKey = 'doramas';
let currentSubgenre = 'all';
let currentSeries = null;
let currentEpisodeIndex = 0;
let ytPlayer = null;
let ytReady = false;
let isPlaying = false;
let controlsTimeout = null;
let progressInterval = null;
let previewLimitSec = 50; // Tempo de degustação gratuita (segundos)
let currentPlaybackSpeed = 1;
const PLAYBACK_SPEEDS = [1, 1.25, 1.5, 2];

// Timer de escassez promocional do Pix
let countdownSeconds = 14 * 60 + 59;
let countdownTimer = null;

// ─── DESTAQUES PRINCIPAIS DO BANNER HERO ─────────────────────────────────────
const HERO_SLIDES = [
  {
    id: 'turca-1',
    categoryName: '🇹🇷 Novela Turca',
    badgeText: 'SUCESSO TURCO 🇹🇷',
    badgeClass: 'turca',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    title: 'Pássaro Madrugador (Erkenci Kuş) — Completa Dublada',
    desc: 'O maior fenômeno das novelas turcas! A paixão proibida e divertida entre Sanem e Can Divit em Istambul, 100% dublado em alta definição.',
    cover: 'covers/turca-1.jpg',
    fallbackCover: 'https://i.ytimg.com/vi/JHd1bRSSm-I/hqdefault.jpg',
    btnText: 'Assistir Temporada 1'
  },
  {
    id: 'dorama-1',
    categoryName: '🌸 Dorama',
    badgeText: 'DORAMA SUPREMO 🌸',
    badgeClass: 'dorama',
    glowColor: 'rgba(236, 72, 153, 0.45)',
    title: 'Pousando no Amor (Crash Landing on You)',
    desc: 'O dorama mais premiado e amado do mundo! O romance arrebatador entre Yoon Se-ri e o capitão Ri Jeong-hyeok dublado em Full HD.',
    cover: 'covers/dorama-1.jpg',
    fallbackCover: 'https://i.ytimg.com/vi/f954W8xAUhU/hqdefault.jpg',
    btnText: 'Assistir Capítulo 1 Grátis'
  },
  {
    id: 'mexicana-1',
    categoryName: '🇲🇽 Novela Mexicana',
    badgeText: 'CLÁSSICO MEXICANO 🇲🇽',
    badgeClass: 'mexicana',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    title: 'A Usurpadora — Paola Bracho e Paulina Martins',
    desc: 'A vilã mais icônica da história da teledramaturgia! A troca de identidade entre as gêmeas que parou o Brasil, com imagem remasterizada.',
    cover: 'covers/mexicana-1.jpg',
    fallbackCover: 'https://i.ytimg.com/vi/t9Zmqx6Wr7E/hqdefault.jpg',
    btnText: 'Assistir Capítulo 1 Grátis'
  },
  {
    id: 'turca-4',
    categoryName: '🇹🇷 Novela Turca',
    badgeText: 'SERÁ ISSO AMOR? 🇹🇷',
    badgeClass: 'turca',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    title: 'Será Isso Amor? (Sen Çal Kapımı) — Dublada',
    desc: 'O romance irresistível entre Eda Yildiz e Serkan Bolat que explodiu no mundo inteiro. Todos os episódios completos sem cortes.',
    cover: 'covers/turca-4.jpg',
    fallbackCover: 'https://i.ytimg.com/vi/TxVvnCRmUUs/hqdefault.jpg',
    btnText: 'Assistir Agora'
  }
];

let currentHeroIdx = 0;
let heroAutoTimer = null;

// Sub-gêneros pré-configurados para navegação refinada
const SUBGENRES_CONFIG = {
  doramas: [
    { key: 'all', label: 'Todos os 50 Doramas' },
    { key: 'romance', label: 'Romance & Comédia' },
    { key: 'ceo', label: 'CEO & Bilionário' },
    { key: 'fantasia', label: 'Fantasia & Épico' },
    { key: 'drama', label: 'Drama & Emoção' }
  ],
  turcas: [
    { key: 'all', label: 'Todas as 50 Novelas Turcas' },
    { key: 'romance', label: 'Romance & Paixão' },
    { key: 'vinganca', label: 'Vingança & Drama' },
    { key: 'familia', label: 'Família & Intriga' },
    { key: 'acao', label: 'Ação & Poder' }
  ],
  mexicanas: [
    { key: 'all', label: 'Todas as 50 Mexicanas' },
    { key: 'vilas', label: 'Vilãs & Clássicos' },
    { key: 'romance', label: 'Romance & Paixão' },
    { key: 'drama', label: 'Drama & Família' },
    { key: 'sbt', label: 'Sucessos do SBT' }
  ],
  microdramas: [
    { key: 'all', label: 'Todos os 50 Microdramas' },
    { key: 'ceo', label: 'CEO & Casamento' },
    { key: 'vinganca', label: 'Vingança Familiar' },
    { key: 'bilionario', label: 'Bilionário Oculto' },
    { key: 'romance', label: 'Romance Secreto' }
  ],
  hot: [
    { key: 'all', label: 'Todas as Hot Minisséries' },
    { key: 'ceo', label: 'CEO & Romance' },
    { key: 'vinganca', label: 'Vingança & Traição' },
    { key: 'fantasia', label: 'Fantasia & Poder' },
    { key: 'romance', label: 'Romance Ardente' }
  ]
};

function isVipMember() {
  return localStorage.getItem('novelinhas_vip') === 'true' || localStorage.getItem('storygrid_vip') === 'true';
}

function checkVipStatus() {
  const isVip = isVipMember();
  const vipText = document.getElementById('vipStatusText');
  const headerVipBtn = document.getElementById('headerVipBtn');
  if (vipText) {
    vipText.textContent = isVip ? 'VIP ATIVO' : 'SEJA VIP';
  }
  if (headerVipBtn) {
    if (isVip) {
      headerVipBtn.classList.add('is-vip');
    } else {
      headerVipBtn.classList.remove('is-vip');
    }
  }
}

// ─── INICIALIZAÇÃO DA PLATAFORMA ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkVipStatus();
  initHeroCarousel();
  renderHomeShelves();
  startPixCountdown();

  // Bloqueio de clique direito no player para proteção de fonte
  const playerWrapper = document.getElementById('videoStealthWrapper');
  if (playerWrapper) {
    playerWrapper.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // Tecla de atalho para atalho rápido
  document.addEventListener('keydown', handleGlobalKeyShortcuts);
});

// ─── GERENCIADOR DE VIEWS E ABAS PRINCIPAIS ─────────────────────────────────
function switchMainTab(tabKey) {
  currentMainTab = tabKey;

  // 1. Atualiza botões de navegação no Header, Pills Nav e Bottom Dock
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabKey);
  });
  document.querySelectorAll('.pill-item').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabKey);
  });
  document.querySelectorAll('.dock-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabKey);
  });

  // 2. Controla exibição das Seções de View
  const viewHome = document.getElementById('viewHome');
  const viewCategory = document.getElementById('viewCategory');
  const viewTop10 = document.getElementById('viewTop10');

  if (viewHome) viewHome.classList.remove('active');
  if (viewCategory) viewCategory.classList.remove('active');
  if (viewTop10) viewTop10.classList.remove('active');

  if (tabKey === 'home') {
    if (viewHome) viewHome.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (tabKey === 'doramas' || tabKey === 'turcas' || tabKey === 'mexicanas' || tabKey === 'microdramas' || tabKey === 'hot') {
    if (viewCategory) viewCategory.classList.add('active');
    currentCategoryKey = tabKey;
    currentSubgenre = 'all';
    renderCategoryView(tabKey, 'all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (tabKey === 'top10') {
    if (viewTop10) viewTop10.classList.add('active');
    renderTop10View();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ─── RENDERIZAÇÃO DA VIEW DE CATEGORIA (50 SÉRIES EXCLUSIVAS) ───────────────
function renderCategoryView(categoryKey, subgenreFilter = 'all') {
  currentCategoryKey = categoryKey;
  currentSubgenre = subgenreFilter;

  // Metadados dos cabeçalhos
  const categoryHeaders = {
    doramas: {
      badge: '🌸 HUB OFICIAL DE DORAMAS',
      headline: 'Doramas Dublados em Português',
      description: 'Explore 50 superproduções asiáticas dubladas e legendadas em alta definição com episódios completos e sem comerciais.',
      countText: '50 Doramas Disponíveis'
    },
    turcas: {
      badge: '🇹🇷 SUCESSOS MUNDIAIS TURCOS',
      headline: 'Novelas Turcas Completas e Dubladas',
      description: 'Assista a 50 fenômenos da teledramaturgia de Istambul com histórias intensas de paixão, vingança e tradição em qualidade Full HD.',
      countText: '50 Novelas Turcas Disponíveis'
    },
    mexicanas: {
      badge: '🇲🇽 CLÁSSICOS DA TELEVISÃO MEXICANA',
      headline: 'Novelas Mexicanas Clássicas e Dubladas',
      description: 'Reviva 50 clássicos inesquecíveis da teledramaturgia mexicana (SBT e Globoplay) com Paola Bracho, Thalía, Angelique Boyer e muito mais em Full HD.',
      countText: '50 Novelas Mexicanas Disponíveis'
    },
    microdramas: {
      badge: '🎬 MINISSÉRIES E MICRODRAMAS VIRAIS',
      headline: 'Microdramas e Minisséries Viciantes',
      description: '50 minisséries ultradinâmicas com reviravoltas chocantes, CEOs bilionários, vinganças e casamentos de conveniência.',
      countText: '50 Microdramas Disponíveis'
    },
    hot: {
      badge: '💋 HOT MINISSÉRIES +18',
      headline: 'Hot Minisséries — Romance & Drama Adulto',
      description: 'Minisséries e histórias rápidas com foco em romance intenso, drama e reviravoltas. Conteúdo +18 com dublagem profissional.',
      countText: '18 Hot Minisséries Disponíveis'
    }
  };

  const info = categoryHeaders[categoryKey] || categoryHeaders.doramas;

  // Atualiza textos do cabeçalho
  const badgeEl = document.getElementById('catBadgeTop');
  const headlineEl = document.getElementById('catHeadline');
  const descEl = document.getElementById('catDescription');
  const countEl = document.getElementById('catCountStat');

  if (badgeEl) badgeEl.textContent = info.badge;
  if (headlineEl) headlineEl.textContent = info.headline;
  if (descEl) descEl.textContent = info.description;
  if (countEl) countEl.textContent = info.countText;

  // Renderiza a barra de sub-gêneros
  renderSubgenresNav(categoryKey, subgenreFilter);

  // Filtra as séries pertencentes à categoria
  let seriesList = NOVELAS_CATALOG.filter(s => s.category === categoryKey);

  // Aplica filtro de subgênero se diferente de 'all'
  if (subgenreFilter !== 'all') {
    seriesList = seriesList.filter(s => {
      const q = subgenreFilter.toLowerCase();
      return (
        s.tags.some(t => t.toLowerCase().includes(q)) ||
        s.title.toLowerCase().includes(q) ||
        s.synopsis.toLowerCase().includes(q)
      );
    });
  }

  // Atualiza contador da barra de ferramentas
  const gridShowingText = document.getElementById('gridShowingText');
  if (gridShowingText) {
    gridShowingText.textContent = `Mostrando ${seriesList.length} de 50 produções`;
  }

  // Renderiza os cards no grid
  const grid = document.getElementById('categoryGrid');
  if (!grid) return;

  if (seriesList.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <div style="font-size: 2.5rem; margin-bottom: 12px;">🎭</div>
        <h3 style="color:#ffffff; margin-bottom: 8px;">Nenhuma produção encontrada neste subgênero</h3>
        <p style="font-size: 0.9rem;">Selecione "Todos" para ver o catálogo completo desta categoria.</p>
        <button onclick="renderCategoryView('${categoryKey}', 'all')" style="margin-top: 16px; background: rgba(255,255,255,0.1); border: 1px solid var(--border-subtle); color: #fff; padding: 8px 20px; border-radius: var(--radius-pill); cursor: pointer; font-weight: 700;">Ver Todas as 50</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = seriesList.map(item => `
    <div class="catalog-item" onclick="openSeriesPlayer('${item.id}', 0)">
      <div class="catalog-poster-box">
        <img class="catalog-poster-img" src="${item.cover}" alt="${item.title}" loading="lazy" onerror="this.src='https://i.ytimg.com/vi/${item.episodes[0]?.videoId || 'IPeKoGSaAqY'}/hqdefault.jpg'" />
        <span class="catalog-pill-badge">${item.badge}</span>
        <span class="catalog-ep-count">${item.episodesCount} Capítulos</span>
      </div>
      <div class="catalog-info">
        <h4 class="catalog-item-title">${item.title}</h4>
        <div class="catalog-channel-tag">${item.channelName}</div>
        <div class="catalog-stats-row">
          <span>★ ${item.rating}</span>
          <span>👁️ ${item.views}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ─── SUB-GÊNEROS RÁPIDOS ───────────────────────────────────────────────────
function renderSubgenresNav(categoryKey, activeSubgenre) {
  const container = document.getElementById('subgenresNav');
  if (!container) return;

  const items = SUBGENRES_CONFIG[categoryKey] || [];
  container.innerHTML = items.map(sub => `
    <button class="subgenre-btn ${sub.key === activeSubgenre ? 'active' : ''}" onclick="renderCategoryView('${categoryKey}', '${sub.key}')">
      ${sub.label}
    </button>
  `).join('');
}

// ─── CARROSSÉIS E PRATELEIRAS DA HOME ────────────────────────────────────────
function renderHomeShelves() {
  renderTop10Carousel();
  renderShelf('doramas', 'shelfDoramasCarousel');
  renderShelf('turcas', 'shelfTurcasCarousel');
  renderShelf('mexicanas', 'shelfMexicanasCarousel');
  renderShelf('microdramas', 'shelfMicrodramasCarousel');
  renderShelf('hot', 'shelfHotCarousel');
}

function renderShelf(categoryKey, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const items = NOVELAS_CATALOG.filter(s => s.category === categoryKey).slice(0, 10);

  const isPosterCover = items.some(i => i.cover && i.cover.startsWith('covers/'));
  container.innerHTML = items.map(item => `
    <div class="shelf-card ${item.category}" onclick="openSeriesPlayer('${item.id}', 0)">
      <div class="shelf-card-poster${isPosterCover ? ' poster-style' : ''}">
        <img src="${item.cover}" alt="${item.title}" loading="lazy" onerror="this.src='https://i.ytimg.com/vi/${item.episodes[0]?.videoId || 'IPeKoGSaAqY'}/hqdefault.jpg'" />
        <span class="shelf-badge-tag ${item.category}">${item.badge}</span>
        <span class="shelf-ep-count">${item.episodesCount} Caps</span>
        <div class="shelf-play-overlay">
          <div class="shelf-play-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        </div>
      </div>
      <div class="shelf-card-info">
        <h4 class="shelf-card-title">${item.title}</h4>
        <div class="shelf-card-meta">
          <span class="shelf-rating">★ ${item.rating}</span>
          <span class="shelf-channel">${item.channelName || 'Dublado'}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ─── NAVEGAÇÃO SUAVE DAS PRATELEIRAS HORIZONTAIS ─────────────────────────────
function scrollShelf(containerId, direction) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const scrollAmount = direction * Math.max(container.clientWidth * 0.75, 260);
  container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

// ─── CARROSSEL TOP 10 (ESTILO DRIBBBLE COM NÚMEROS OUTLINE WIREFRAME E TAGS) ───
function renderTop10Carousel() {
  const container = document.getElementById('top10Carousel');
  if (!container) return;

  // Curadoria equilibrada com os maiores destaques das 5 categorias
  const top10 = [
    NOVELAS_CATALOG.find(s => s.id === 'turca-1'),
    NOVELAS_CATALOG.find(s => s.id === 'dorama-1'),
    NOVELAS_CATALOG.find(s => s.id === 'mexicana-1'),
    NOVELAS_CATALOG.find(s => s.id === 'hot-1'),
    NOVELAS_CATALOG.find(s => s.id === 'turca-2') || NOVELAS_CATALOG[2],
    NOVELAS_CATALOG.find(s => s.id === 'dorama-2') || NOVELAS_CATALOG[1],
    NOVELAS_CATALOG.find(s => s.id === 'mexicana-2') || NOVELAS_CATALOG[3],
    NOVELAS_CATALOG.find(s => s.id === 'hot-11') || NOVELAS_CATALOG[4],
    NOVELAS_CATALOG.find(s => s.id === 'turca-4') || NOVELAS_CATALOG[5],
    NOVELAS_CATALOG.find(s => s.id === 'dorama-3') || NOVELAS_CATALOG[6]
  ].filter(Boolean);

  const durations = ['1:04:35', '54:20', '48:15', '2:05:33', '45:30', '58:40', '1:02:18', '2:38:28', '1:10:44', '51:22'];

  const isPosterCover = top10.some(i => i.cover && i.cover.startsWith('covers/'));
  container.innerHTML = top10.map((item, idx) => `
    <div class="top10-item" onclick="openSeriesPlayer('${item.id}', 0)">
      <div class="top10-rank-num-box">
        <span class="top10-rank-num">${idx + 1}</span>
      </div>
      <div class="top10-card-box ${item.category}${isPosterCover ? ' poster-style' : ''}">
        <img class="top10-card-img" src="${item.cover}" alt="${item.title}" loading="lazy" onerror="this.src='https://i.ytimg.com/vi/${item.episodes[0]?.videoId || 'IPeKoGSaAqY'}/hqdefault.jpg'" />
        <div class="top10-tag-temp">1ª TEMPORADA</div>
        <div class="top10-duration-tag">${durations[idx] || '48:30'}</div>
      </div>
    </div>
  `).join('');
}

// ─── VIEW 3: RANKING TOP 10 DEDICADO ────────────────────────────────────────
function renderTop10View() {
  const container = document.getElementById('top10RankingList');
  if (!container) return;

  const top10 = NOVELAS_CATALOG.slice(0, 10);

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 900px; margin: 0 auto; padding: 20px 24px 60px;">
      ${top10.map((item, idx) => `
        <div class="top10-row-card" onclick="openSeriesPlayer('${item.id}', 0)" style="display: flex; align-items: center; gap: 20px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px 20px; cursor: pointer; transition: transform 0.2s;">
          <div style="font-family: var(--font-display); font-size: 3rem; font-weight: 900; color: #ec4899; min-width: 48px; text-align: center;">
            #${idx + 1}
          </div>
          <div style="width: 140px; aspect-ratio: 16/9; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: #000;">
            <img src="${item.cover}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://i.ytimg.com/vi/${item.episodes[0]?.videoId || 'IPeKoGSaAqY'}/hqdefault.jpg'" />
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span class="tag-badge ${item.category === 'turcas' ? 'turca' : item.category === 'doramas' ? 'dorama' : item.category === 'hot' ? 'hot' : 'minidrama'}">${item.badge}</span>
              <span style="font-size: 0.75rem; color: #cbd5e1;">${item.episodesCount} Capítulos</span>
            </div>
            <h3 style="font-size: 1.05rem; font-weight: 800; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;">${item.title}</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0;">${item.synopsis}</p>
          </div>
          <button style="padding: 10px 20px; border-radius: var(--radius-pill); background: #ffffff; color: #000; font-weight: 800; font-size: 0.85rem; border: none; cursor: pointer; white-space: nowrap; flex-shrink: 0;">
            ▶ Assistir
          </button>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── BUSCA GLOBAL EM TEMPO REAL ─────────────────────────────────────────────
let globalSearchQuery = '';

function handleGlobalSearch(query) {
  globalSearchQuery = (query || '').trim();
  const clearBtn = document.getElementById('globalClearSearch');
  if (clearBtn) {
    clearBtn.style.display = globalSearchQuery ? 'block' : 'none';
  }

  if (!globalSearchQuery) {
    // Se esvaziou a busca, volta para a home
    switchMainTab('home');
    return;
  }

  // Ativa a view de categoria para exibir os resultados da busca
  const viewHome = document.getElementById('viewHome');
  const viewCategory = document.getElementById('viewCategory');
  const viewTop10 = document.getElementById('viewTop10');

  if (viewHome) viewHome.classList.remove('active');
  if (viewTop10) viewTop10.classList.remove('active');
  if (viewCategory) viewCategory.classList.add('active');

  const q = globalSearchQuery.toLowerCase();
  const results = NOVELAS_CATALOG.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.synopsis.toLowerCase().includes(q) ||
    s.channelName.toLowerCase().includes(q) ||
    s.tags.some(t => t.toLowerCase().includes(q))
  );

  // Atualiza banner da categoria para modo busca
  const badgeEl = document.getElementById('catBadgeTop');
  const headlineEl = document.getElementById('catHeadline');
  const descEl = document.getElementById('catDescription');
  const countEl = document.getElementById('catCountStat');
  const subnav = document.getElementById('subgenresNav');
  const gridShowingText = document.getElementById('gridShowingText');

  if (badgeEl) badgeEl.textContent = '🔍 RESULTADOS DA BUSCA';
  if (headlineEl) headlineEl.textContent = `Buscando por: "${globalSearchQuery}"`;
  if (descEl) descEl.textContent = `Encontramos ${results.length} produções correspondentes no catálogo geral de 200 produções.`;
  if (countEl) countEl.textContent = `${results.length} Encontradas`;
  if (subnav) subnav.innerHTML = '';
  if (gridShowingText) gridShowingText.textContent = `${results.length} produções encontradas`;

  const grid = document.getElementById('categoryGrid');
  if (!grid) return;

  if (results.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <div style="font-size: 2.8rem; margin-bottom: 12px;">🔍</div>
        <h3 style="color:#ffffff; margin-bottom: 8px;">Nenhuma produção encontrada para "${globalSearchQuery}"</h3>
        <p style="font-size: 0.9rem;">Tente buscar por outro termo, nome de ator, dorama ou novela turca.</p>
        <button onclick="clearGlobalSearch()" style="margin-top: 16px; background: rgba(255,255,255,0.1); border: 1px solid var(--border-subtle); color: #fff; padding: 9px 22px; border-radius: var(--radius-pill); cursor: pointer; font-weight: 700;">Limpar Busca</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = results.map(item => `
    <div class="catalog-item" onclick="openSeriesPlayer('${item.id}', 0)">
      <div class="catalog-poster-box">
        <img class="catalog-poster-img" src="${item.cover}" alt="${item.title}" loading="lazy" onerror="this.src='https://i.ytimg.com/vi/${item.episodes[0]?.videoId || 'IPeKoGSaAqY'}/hqdefault.jpg'" />
        <span class="catalog-pill-badge">${item.badge}</span>
        <span class="catalog-ep-count">${item.episodesCount} Capítulos</span>
      </div>
      <div class="catalog-info">
        <h4 class="catalog-item-title">${item.title}</h4>
        <div class="catalog-channel-tag">${item.channelName}</div>
        <div class="catalog-stats-row">
          <span>★ ${item.rating}</span>
          <span>👁️ ${item.views}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function clearGlobalSearch() {
  const input = document.getElementById('globalSearchInput');
  if (input) input.value = '';
  globalSearchQuery = '';
  const clearBtn = document.getElementById('globalClearSearch');
  if (clearBtn) clearBtn.style.display = 'none';
  switchMainTab('home');
}

// ─── CARROSSEL HERO ──────────────────────────────────────────────────────────
function initHeroCarousel() {
  switchHeroSlide(0);
  startHeroTimer();

  const heroCard = document.getElementById('heroCard');
  if (heroCard) {
    heroCard.addEventListener('mouseenter', stopHeroTimer);
    heroCard.addEventListener('mouseleave', startHeroTimer);
    heroCard.addEventListener('touchstart', stopHeroTimer, { passive: true });
  }
}

function startHeroTimer() {
  stopHeroTimer();
  heroAutoTimer = setInterval(() => {
    nextHeroSlide();
  }, 6500);
}

function stopHeroTimer() {
  if (heroAutoTimer) {
    clearInterval(heroAutoTimer);
    heroAutoTimer = null;
  }
}

function switchHeroSlide(idx) {
  currentHeroIdx = (idx + HERO_SLIDES.length) % HERO_SLIDES.length;
  const slide = HERO_SLIDES[currentHeroIdx];

  const heroCard = document.getElementById('heroCard');
  const heroGlow = document.getElementById('heroAmbientGlow');
  const img = document.getElementById('heroImg');
  const badge = document.getElementById('heroBadge');
  const title = document.getElementById('heroTitle');
  const desc = document.getElementById('heroDesc');
  const playBtn = document.querySelector('.btn-play-hero');

  if (heroCard) heroCard.classList.add('fading');

  setTimeout(() => {
    if (heroGlow) {
      heroGlow.style.background = `radial-gradient(circle at 60% 40%, ${slide.glowColor || 'rgba(168, 85, 247, 0.4)'} 0%, transparent 70%)`;
    }
    if (img) {
      img.src = slide.cover;
      img.onerror = () => {
        img.onerror = null;
        img.src = slide.fallbackCover || 'covers/turca-1.jpg';
      };
    }
    if (badge) {
      badge.textContent = slide.badgeText;
      badge.className = `tag-badge ${slide.badgeClass}`;
    }
    if (title) title.textContent = slide.title;
    if (desc) desc.textContent = slide.desc;
    if (playBtn) {
      playBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <span>${slide.btnText}</span>
      `;
    }

    // Atualiza tabs de categorias no Hero
    const catTabs = document.querySelectorAll('.hero-tab-btn, .hero-cat-tab');
    catTabs.forEach((tab, tIdx) => {
      tab.classList.toggle('active', tIdx === currentHeroIdx);
    });

    const dots = document.querySelectorAll('.hero-dot');
    dots.forEach((dot, dIdx) => {
      dot.classList.toggle('active', dIdx === currentHeroIdx);
    });

    if (heroCard) heroCard.classList.remove('fading');
  }, 180);
}

function nextHeroSlide() {
  switchHeroSlide(currentHeroIdx + 1);
}

function prevHeroSlide() {
  switchHeroSlide(currentHeroIdx - 1);
}

function playCurrentHero() {
  const currentSlide = HERO_SLIDES[currentHeroIdx];
  const targetItem = NOVELAS_CATALOG.find(c => c.id === currentSlide.id) || NOVELAS_CATALOG[0];
  openSeriesPlayer(targetItem.id, 0);
}

// ─── VERIFICAÇÃO DO STATUS VIP ───────────────────────────────────────────────
function isVipMember() {
  return localStorage.getItem('novelinhas_vip') === 'true' || localStorage.getItem('storygrid_vip') === 'true';
}

function checkVipStatus() {
  const vipBtn = document.getElementById('headerVipBtn');
  const vipText = document.getElementById('vipStatusText');

  if (vipText) {
    vipText.textContent = 'VIP ATIVO';
  }
  if (vipBtn && isVipMember()) {
    vipBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    vipBtn.style.boxShadow = '0 0 15px rgba(34, 197, 94, 0.4)';
  }
}

// ─── STEALTH VIDEO PLAYER (PLAYER CINEMATOGRÁFICO CAMUFLADO) ─────────────────
const FALLBACK_STREAM_IDS = [
  'IPeKoGSaAqY', // Madrugador Turca HD
  'VzZjID2XHjU', // Hercai Turca HD
  'TxVvnCRmUUs', // Kirli Sepeti HD
  'RAZwM7X9BCo', // Kizilcik Serbeti HD
  'cn3Gl6O7O1o', // Descendentes do Sol Dorama HD
  'yr3KpvWhLLg', // Pretendente Surpresa Dorama HD
  'yXlYx-UqQio', // Microdrama Bilionário HD
  'VXP1GS6bf-Y'  // Microdrama Vingança HD
];

function onPlayerError(event) {
  console.warn('YouTube Player Event Code:', event.data);
  const fallback = FALLBACK_STREAM_IDS[Math.floor(Math.random() * FALLBACK_STREAM_IDS.length)];
  showToast('Sintonizando transmissão em alta resolução...');
  if (ytPlayer && ytPlayer.loadVideoById) {
    setTimeout(() => {
      ytPlayer.loadVideoById(fallback);
      ytPlayer.playVideo();
    }, 300);
  }
}

window.onYouTubeIframeAPIReady = function() {
  ytReady = true;
};
if (typeof YT !== 'undefined' && YT.loaded) {
  ytReady = true;
}

let playerInitAttempts = 0;
function initOrUpdatePlayer(videoId) {
  const holder = document.getElementById('youtubePlayerHolder');
  if (!holder) return;

  // Se a API oficial do YouTube estiver disponível:
  if (typeof YT !== 'undefined' && YT.Player && (ytReady || YT.loaded)) {
    playerInitAttempts = 0;
    try {
      if (!ytPlayer) {
        ytPlayer = new YT.Player('youtubePlayerHolder', {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            enablejsapi: 1,
            iv_load_policy: 3,
            disablekb: 1,
            fs: 0
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError
          }
        });
      } else {
        ytPlayer.loadVideoById(videoId);
        ytPlayer.playVideo();
      }

      // Garante que o preloader suma após no máximo 3.5s
      setTimeout(() => {
        const pre = document.getElementById('playerPreloader');
        if (pre) pre.classList.add('hidden');
      }, 3500);

      return;
    } catch (e) {
      console.warn('Erro ao instanciar YT.Player, usando fallback:', e);
    }
  }

  // Se ainda estiver carregando a API, tenta mais 2 vezes (máximo 600ms):
  if (playerInitAttempts < 2 && typeof YT === 'undefined') {
    playerInitAttempts++;
    setTimeout(() => initOrUpdatePlayer(videoId), 300);
    return;
  }

  // Fallback 100% garantido: Iframe direto caso a API externa demore ou seja bloqueada
  playerInitAttempts = 0;
  holder.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=0&iv_load_policy=3" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border:none; width:100%; height:100%;"></iframe>`;
  hidePaywall();

  setTimeout(() => {
    const pre = document.getElementById('playerPreloader');
    if (pre) pre.classList.add('hidden');
  }, 2200);
}

function onPlayerReady(event) {
  event.target.playVideo();
  startProgressTracker();
  setTimeout(() => {
    const pre = document.getElementById('playerPreloader');
    if (pre) pre.classList.add('hidden');
  }, 1200);
}

function onPlayerStateChange(event) {
  const centerIcon = document.getElementById('centerPlayIcon');
  const preloader = document.getElementById('playerPreloader');

  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    hidePaywall();
    if (preloader) preloader.classList.add('hidden');
    if (centerIcon) {
      centerIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
    }
  } else {
    isPlaying = false;
    if (centerIcon) {
      centerIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    }
  }
}

// Abre o player para a série selecionada
function openSeriesPlayer(seriesId, episodeIndex = 0) {
  currentSeries = NOVELAS_CATALOG.find(s => s.id === seriesId);
  if (!currentSeries) return;
  currentEpisodeIndex = episodeIndex;

  const modal = document.getElementById('playerModal');
  const titleEl = document.getElementById('playerSeriesTitle');
  const epNameEl = document.getElementById('playerEpName');

  const currentEp = currentSeries.episodes[episodeIndex] || currentSeries.episodes[0];
  if (titleEl) titleEl.textContent = currentSeries.title;
  if (epNameEl) epNameEl.textContent = `Capítulo ${episodeIndex + 1}: ${currentEp?.title || 'Episódio ' + (episodeIndex + 1)}`;

  // Renderiza a lista rica de episódios e a ficha técnica
  renderEpisodesRichList();
  renderSeriesDetails();

  // Exibe a modal
  modal.classList.add('active');

  // Trava de Episódio VIP: Somente o Capítulo 1 é livre para não-assinantes
  const isFreeEp = currentEpisodeIndex === 0;
  if (!isFreeEp && !isVipMember()) {
    showPaywall(`O Capítulo ${episodeIndex + 1} é exclusivo para membros VIP!`);
    return;
  }

  hidePaywall();

  const preloader = document.getElementById('playerPreloader');
  if (preloader) preloader.classList.remove('hidden');

  const videoId = currentEp?.videoId || FALLBACK_STREAM_IDS[0];
  initOrUpdatePlayer(videoId);
  showControlsBriefly();
}

function closePlayerModal() {
  exitFullScreenIfActive();
  const modal = document.getElementById('playerModal');
  if (modal) modal.classList.remove('active');
  if (ytPlayer && ytPlayer.stopVideo) {
    try { ytPlayer.stopVideo(); } catch (e) {}
  }
  const preloader = document.getElementById('playerPreloader');
  if (preloader) preloader.classList.remove('hidden');
  stopProgressTracker();
}

// ─── GAVETA DO PLAYER: ABAS E LISTA RICA DE EPISÓDIOS ────────────────────────
function switchPlayerTab(tabKey) {
  const tabEpisodes = document.getElementById('tabBtnEpisodes');
  const tabDetails = document.getElementById('tabBtnDetails');
  const contentEpisodes = document.getElementById('tabContentEpisodes');
  const contentDetails = document.getElementById('tabContentDetails');

  if (tabKey === 'episodes') {
    if (tabEpisodes) tabEpisodes.classList.add('active');
    if (tabDetails) tabDetails.classList.remove('active');
    if (contentEpisodes) contentEpisodes.classList.add('active');
    if (contentDetails) contentDetails.classList.remove('active');
  } else {
    if (tabEpisodes) tabEpisodes.classList.remove('active');
    if (tabDetails) tabDetails.classList.add('active');
    if (contentEpisodes) contentEpisodes.classList.remove('active');
    if (contentDetails) contentDetails.classList.add('active');
  }
}

function renderEpisodesRichList() {
  const container = document.getElementById('episodesRichList');
  const countSpan = document.getElementById('episodesTotalCount');
  if (!container || !currentSeries) return;

  const total = currentSeries.episodes.length;
  if (countSpan) countSpan.textContent = total;

  const isVip = isVipMember();

  container.innerHTML = currentSeries.episodes.map((ep, idx) => {
    const isFree = idx === 0;
    const isLocked = !isFree && !isVip;
    const isActive = idx === currentEpisodeIndex;

    return `
      <div class="ep-card-item ${isActive ? 'active' : ''}" onclick="selectEpisode(${idx})">
        <div class="ep-thumb-box">
          <img src="https://i.ytimg.com/vi/${ep.videoId}/mqdefault.jpg" alt="${ep.title}" loading="lazy" onerror="this.src='https://i.ytimg.com/vi/${FALLBACK_STREAM_IDS[idx % FALLBACK_STREAM_IDS.length]}/mqdefault.jpg'" />
          <span class="ep-thumb-duration">${ep.duration || '42 min'}</span>
        </div>
        <div class="ep-card-info">
          <div class="ep-card-title">${ep.title}</div>
          <div class="ep-card-status ${isFree ? 'free' : isLocked ? 'locked' : 'free'}">
            ${isFree ? '✓ Capítulo Grátis' : isLocked ? '🔒 Exclusivo VIP' : '✓ VIP Liberado'}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function selectEpisode(idx) {
  if (idx > 0 && !isVipMember()) {
    showPaywall(`O Capítulo ${idx + 1} é exclusivo do Plano VIP! Libere agora todos os capítulos.`);
    return;
  }
  openSeriesPlayer(currentSeries.id, idx);
}

function renderSeriesDetails() {
  const container = document.getElementById('seriesDetailsBox');
  if (!container || !currentSeries) return;

  container.innerHTML = `
    <h3>${currentSeries.title}</h3>
    <p style="color: #e2e8f0; line-height: 1.6; margin-bottom: 16px;">${currentSeries.synopsis}</p>
    
    <div class="details-meta-grid">
      <div><strong>Canal / Distribuição:</strong> ${currentSeries.channelName}</div>
      <div><strong>Avaliação da Audiência:</strong> ★ ${currentSeries.rating} / 5.0</div>
      <div><strong>Total de Capítulos:</strong> ${currentSeries.episodesCount} Episódios Completos</div>
      <div><strong>Qualidade de Transmissão:</strong> 1080p Full HD • Sem Comerciais</div>
      <div><strong>Áudio:</strong> Dublado em Português (Brasil)</div>
      <div><strong>Gêneros:</strong> ${currentSeries.tags.join(', ')}</div>
    </div>
  `;
}

// ─── CONTROLES DE REPRODUÇÃO DO PLAYER ───────────────────────────────────────
function togglePlayerControls() {
  const overlay = document.getElementById('customControlsOverlay');
  if (!overlay) return;

  if (overlay.classList.contains('visible')) {
    overlay.classList.remove('visible');
  } else {
    showControlsBriefly();
  }
}

function showControlsBriefly() {
  const overlay = document.getElementById('customControlsOverlay');
  if (!overlay) return;
  overlay.classList.add('visible');

  clearTimeout(controlsTimeout);
  controlsTimeout = setTimeout(() => {
    if (isPlaying) {
      overlay.classList.remove('visible');
    }
  }, 3500);
}

function togglePlayPause() {
  if (!ytPlayer) return;
  if (isPlaying) {
    ytPlayer.pauseVideo();
  } else {
    ytPlayer.playVideo();
  }
  showControlsBriefly();
}

function skipTime(seconds) {
  if (!ytPlayer || !ytPlayer.getCurrentTime || !ytPlayer.getDuration) return;
  const cur = ytPlayer.getCurrentTime();
  const dur = ytPlayer.getDuration();
  let target = cur + seconds;
  if (target < 0) target = 0;
  if (target > dur) target = dur;

  // Trava de degustação para não-assinantes
  if (!isVipMember() && target > previewLimitSec) {
    showPaywall('O avanço de capítulos completos está disponível no Plano VIP!');
    return;
  }

  ytPlayer.seekTo(target, true);
  showToast(seconds > 0 ? `+${seconds}s` : `${seconds}s`);
  showControlsBriefly();
}

function togglePlaybackSpeed() {
  if (!ytPlayer || !ytPlayer.setPlaybackRate) return;
  const curIdx = PLAYBACK_SPEEDS.indexOf(currentPlaybackSpeed);
  const nextIdx = (curIdx + 1) % PLAYBACK_SPEEDS.length;
  currentPlaybackSpeed = PLAYBACK_SPEEDS[nextIdx];
  ytPlayer.setPlaybackRate(currentPlaybackSpeed);

  const speedBtn = document.getElementById('speedBtn');
  if (speedBtn) speedBtn.textContent = `${currentPlaybackSpeed}x`;
  showToast(`Velocidade: ${currentPlaybackSpeed}x`);
  showControlsBriefly();
}

function toggleMute() {
  if (!ytPlayer) return;
  const muteBtn = document.getElementById('muteBtn');
  if (ytPlayer.isMuted()) {
    ytPlayer.unMute();
    showToast('🔊 Áudio ativado');
    if (muteBtn) muteBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
  } else {
    ytPlayer.mute();
    showToast('🔇 Áudio silenciado');
    if (muteBtn) muteBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
  }
  showControlsBriefly();
}

function seekVideo(e) {
  if (!ytPlayer || !ytPlayer.getDuration) return;
  const rail = e.currentTarget;
  const rect = rail.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
  const newTime = ratio * ytPlayer.getDuration();

  // Degustação travada
  if (!isVipMember() && newTime > previewLimitSec) {
    showPaywall('O avanço de capítulos completos está disponível no Plano VIP!');
    return;
  }

  ytPlayer.seekTo(newTime, true);
  showControlsBriefly();
}

function startProgressTracker() {
  stopProgressTracker();
  progressInterval = setInterval(() => {
    if (!ytPlayer || !ytPlayer.getCurrentTime || !ytPlayer.getDuration) return;

    const current = ytPlayer.getCurrentTime();
    const duration = ytPlayer.getDuration();

    if (duration > 0) {
      const pct = (current / duration) * 100;
      const progressEl = document.getElementById('seekbarProgress');
      const curTimeEl = document.getElementById('currentTimeDisplay');
      const totalTimeEl = document.getElementById('totalTimeDisplay');

      if (progressEl) progressEl.style.width = `${pct}%`;
      if (curTimeEl) curTimeEl.textContent = formatTime(current);
      if (totalTimeEl) totalTimeEl.textContent = formatTime(duration);

      // Trava de paywall automático aos 50s de degustação gratuita
      if (!isVipMember() && current >= previewLimitSec) {
        ytPlayer.pauseVideo();
        showPaywall('Seu teaser gratuito terminou! Libere todos os 10.000 capítulos.');
      }
    }
  }, 500);
}

function stopProgressTracker() {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

// ─── TELA CHEIA HÍBRIDA (CSS TEATRO + NATIVO FULLSCREEN) ─────────────────────
function isFullscreenActive() {
  const modal = document.getElementById('playerModal');
  const wrapper = document.getElementById('videoStealthWrapper');
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    (wrapper && wrapper.classList.contains('fullscreen-mode')) ||
    (modal && modal.classList.contains('fullscreen-mode'))
  );
}

function updateFullscreenIcon(isFullscreen) {
  const btn = document.getElementById('fullscreenBtn');
  if (!btn) return;
  if (isFullscreen) {
    btn.setAttribute('title', 'Sair da Tela Cheia');
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
    </svg>`;
  } else {
    btn.setAttribute('title', 'Tela Cheia');
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
    </svg>`;
  }
}

async function toggleFullScreen(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  const wrapper = document.getElementById('videoStealthWrapper');
  const modal = document.getElementById('playerModal');
  const target = wrapper || modal;

  const inFull = isFullscreenActive();

  if (!inFull) {
    if (wrapper) wrapper.classList.add('fullscreen-mode');
    if (modal) modal.classList.add('fullscreen-mode');
    updateFullscreenIcon(true);

    try {
      if (target && target.requestFullscreen) {
        await target.requestFullscreen();
      } else if (target && target.webkitRequestFullscreen) {
        await target.webkitRequestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen nativo bloqueado, usando modo teatro:', err);
    }
    showToast('⛶ Modo Tela Cheia');
  } else {
    await exitFullScreenIfActive();
  }
  showControlsBriefly();
}

async function exitFullScreenIfActive() {
  const wrapper = document.getElementById('videoStealthWrapper');
  const modal = document.getElementById('playerModal');

  try {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
    }
  } catch (err) {
    console.warn('Erro ao sair de fullscreen:', err);
  }

  if (wrapper) wrapper.classList.remove('fullscreen-mode');
  if (modal) modal.classList.remove('fullscreen-mode');
  updateFullscreenIcon(false);
}

function handleGlobalKeyShortcuts(e) {
  const modal = document.getElementById('playerModal');
  if (!modal || !modal.classList.contains('active')) return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.key === 'f' || e.key === 'F') {
    e.preventDefault();
    toggleFullScreen();
  } else if (e.key === ' ' && !e.repeat) {
    e.preventDefault();
    togglePlayPause();
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    skipTime(10);
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    skipTime(-10);
  } else if (e.key === 'Escape' && isFullscreenActive()) {
    exitFullScreenIfActive();
  }
}

// ─── PAYWALL DE DEGUSTAÇÃO ──────────────────────────────────────────────────
function showPaywall(customMsg) {
  const overlay = document.getElementById('paywallOverlay');
  if (!overlay) return;
  if (customMsg) {
    const textEl = overlay.querySelector('.paywall-text');
    if (textEl) textEl.textContent = customMsg;
  }
  overlay.classList.add('active');
}

function hidePaywall() {
  const overlay = document.getElementById('paywallOverlay');
  if (overlay) overlay.classList.remove('active');
}

// ─── CHECKOUT PIX DE ALTA CREDIBILIDADE (R$ 19,90 VITALÍCIO) ────────────────
function openPixModal() {
  const backdrop = document.getElementById('pixModalBackdrop');
  if (backdrop) backdrop.classList.add('active');
}

function closePixModal() {
  const backdrop = document.getElementById('pixModalBackdrop');
  if (backdrop) backdrop.classList.remove('active');
}

function copyPixKey() {
  const input = document.getElementById('pixKeyInput');
  if (!input) return;
  input.select();
  navigator.clipboard.writeText(input.value).then(() => {
    showToast('📋 Chave Pix (CPF) copiada com sucesso! Abra seu banco e cole na opção Pix CPF.');
  }).catch(() => {
    showToast('Chave CPF copiada: ' + input.value);
  });
}

// ─── ANTI-FRAUDE: CÓDIGOS VIP AUTORIZADOS PELA DONA SIRLENE ─────────────────
const AUTHORIZED_VIP_CODES = [
  'VIP2026',
  'NOVELASVIP',
  'SIRLENE2026',
  'VIP1990',
  'TURCASVIP',
  'DORAMASVIP',
  'ACESSOVIP',
  'DONASIRLENE'
];

function handleUserPaidFlow() {
  // 1. Revela o card de validação do código VIP
  const card = document.getElementById('vipCodeUnlockCard');
  if (card) {
    card.style.display = 'block';
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // 2. Foca no input de código
  setTimeout(() => {
    const input = document.getElementById('vipUnlockCodeInput');
    if (input) input.focus();
  }, 300);

  // 3. Abre o WhatsApp com o texto pronto anexando o comprovante
  sendProofViaWhatsApp();
}

function toggleVipCodeCard() {
  const card = document.getElementById('vipCodeUnlockCard');
  if (!card) return;
  if (card.style.display === 'none' || !card.style.display) {
    card.style.display = 'block';
    const input = document.getElementById('vipUnlockCodeInput');
    if (input) input.focus();
  } else {
    card.style.display = 'none';
  }
}

function sendProofViaWhatsApp() {
  const currentTitle = currentSeries ? ` da novela "${currentSeries.title}"` : '';
  const msg = encodeURIComponent(`Olá Dona Sirlene! Tudo bem? Acabei de realizar o pagamento do Pix de R$ 19,90 do Novelinhas VIP${currentTitle}! 📸 Segue o meu comprovante em anexo para você conferir e me enviar meu Código VIP de Liberação:`);
  window.open(`https://wa.me/554189031232?text=${msg}`, '_blank');
}

function validateAndUnlockWithVipCode(codeOverride) {
  const inputEl = document.getElementById('vipUnlockCodeInput');
  const errorEl = document.getElementById('vipCodeErrorMsg');
  const code = (codeOverride || (inputEl ? inputEl.value : '')).trim().toUpperCase();

  if (!code) {
    if (errorEl) {
      errorEl.textContent = '⚠️ Digite o Código VIP fornecido pela Dona Sirlene.';
      errorEl.className = 'vip-code-status-msg error';
    }
    showToast('⚠️ Digite o Código VIP fornecido pela Dona Sirlene.');
    return;
  }

  // Verifica se o código está na lista autorizada
  const isValid = AUTHORIZED_VIP_CODES.includes(code);

  if (isValid) {
    if (errorEl) {
      errorEl.textContent = '✅ Código VIP confirmado! Liberando seu acesso vitalício...';
      errorEl.className = 'vip-code-status-msg success';
    }
    setTimeout(() => {
      confirmPaymentAndUnlock();
    }, 600);
  } else {
    if (errorEl) {
      errorEl.innerHTML = '❌ <strong>Código VIP incorreto ou não autorizado!</strong><br>Envie seu comprovante no WhatsApp da Dona Sirlene para receber seu código oficial.';
      errorEl.className = 'vip-code-status-msg error';
    }
    showToast('❌ Código VIP inválido! Envie seu comprovante à Dona Sirlene.');
  }
}

function confirmPaymentAndUnlock() {
  localStorage.setItem('novelinhas_vip', 'true');
  localStorage.setItem('storygrid_vip', 'true');
  checkVipStatus();
  closePixModal();
  hidePaywall();
  renderEpisodesRichList();
  showToast('🎉 ACESSO VITALÍCIO LIBERADO COM SUCESSO!');
  if (ytPlayer && ytPlayer.playVideo) {
    ytPlayer.playVideo();
  }
}

function startPixCountdown() {
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    countdownSeconds--;
    if (countdownSeconds <= 0) countdownSeconds = 15 * 60;
    const mins = Math.floor(countdownSeconds / 60);
    const secs = countdownSeconds % 60;
    const el = document.getElementById('pixCountdown');
    if (el) el.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, 1000);
}

// ─── COMPRA / SUPORTE PELO WHATSAPP ──────────────────────────────────────────
function payViaWhatsApp() {
  const currentTitle = currentSeries ? ` da novela "${currentSeries.title}"` : '';
  const msg = encodeURIComponent(`Olá Dona Sirlene! Tudo bem? Quero liberar meu Acesso VIP das Novelinhas por R$ 19,90${currentTitle}, mas prefiro fazer o pagamento direto com você por aqui pelo WhatsApp! Poderia me passar a chave Pix e me orientar?`);
  window.open(`https://wa.me/554189031232?text=${msg}`, '_blank');
}

function openSupportWhatsApp() {
  payViaWhatsApp();
}

// ─── FAQ INTERATIVO ──────────────────────────────────────────────────────────
function toggleFaq(el) {
  el.classList.toggle('open');
}

// ─── SISTEMA DE TOASTS FLUTUANTES ───────────────────────────────────────────
function showToast(msg) {
  const el = document.getElementById('toastMsg');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => {
    el.classList.remove('show');
  }, 3200);
}
window.showToast = showToast;
