/**
 * site-romantico / main.js
 * Organizado em módulos por funcionalidade.
 * Todos os dados são lidos dos arquivos JSON em /data/
 */

/* ============================================================
   UTILITÁRIOS
============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Trava o scroll da página de forma compatível com iOS Safari.
 * O pattern `position:fixed + top:-scrollY` evita o scroll-to-top
 * que o simples `overflow:hidden` causa no iOS.
 */
function lockBodyScroll() {
  const scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top      = `-${scrollY}px`;
  document.body.style.left     = '0';
  document.body.style.right    = '0';
  document.body.style.overflow = 'hidden';
}

function unlockBodyScroll() {
  const scrollY = Math.abs(parseInt(document.body.style.top || '0'));
  document.body.style.position = '';
  document.body.style.top      = '';
  document.body.style.left     = '';
  document.body.style.right    = '';
  document.body.style.overflow = '';
  window.scrollTo(0, scrollY);
}

/** Busca JSON local com tratamento de erro */
async function fetchJSON(path) {
  try {
    const r = await fetch(path);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    console.warn(`[fetchJSON] Falha ao carregar ${path}:`, e);
    return null;
  }
}

/** Formata data ISO para português */
function formatDatePT(str) {
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

/* ============================================================
   LOADER
============================================================ */
function initLoader() {
  window.addEventListener('load', () => {
    setTimeout(() => $('#loader').classList.add('hide'), 900);
  });
}

/* ============================================================
   SCROLL PROGRESS BAR
============================================================ */
function initScrollProgress() {
  const bar = $('#scroll-progress');
  window.addEventListener('scroll', () => {
    const max = document.body.scrollHeight - window.innerHeight;
    bar.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : '0%';
  }, { passive: true });
}

/* ============================================================
   CURSOR PERSONALIZADO
============================================================ */
function initCursor() {
  // Só ativa em dispositivos com mouse
  if (!window.matchMedia('(hover: hover)').matches) return;

  const dot  = $('#cursor-dot');
  const ring = $('#cursor-ring');
  if (!dot || !ring) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;
  let raf;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = `${mx}px`;
    dot.style.top  = `${my}px`;
  }, { passive: true });

  // Ring com lag suave
  function animateRing() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = `${rx}px`;
    ring.style.top  = `${ry}px`;
    raf = requestAnimationFrame(animateRing);
  }
  raf = requestAnimationFrame(animateRing);

  // Hover em interativos
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, [data-cursor]')) {
      ring.classList.add('hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, [data-cursor]')) {
      ring.classList.remove('hover');
    }
  });

  // Feedback de clique
  document.addEventListener('mousedown', () => ring.classList.add('down'));
  document.addEventListener('mouseup',   () => ring.classList.remove('down'));

  // Esconde ao sair
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
}

/* ============================================================
   PARTÍCULAS — TELA DE LOGIN
============================================================ */
function initParticles() {
  const canvas = $('#particles-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function spawn() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(Math.random() * 0.45 + 0.1),
      a: Math.random() * 0.55 + 0.08,
      hue: Math.random() < 0.55 ? 'gold' : 'rose',
    };
  }

  function createParticles(n = 100) {
    particles = Array.from({ length: n }, spawn);
  }

  function draw() {
    // Encerra o loop quando a tela de login é removida (display: none)
    if (canvas.offsetParent === null) return;
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.hue === 'gold'
        ? `rgba(201,168,76,${p.a})`
        : `rgba(212,119,138,${p.a})`;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -4) { Object.assign(p, spawn(), { y: H + 4 }); }
      if (p.x < -4) p.x = W + 4;
      if (p.x > W + 4) p.x = -4;
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); createParticles(); }, { passive: true });
  resize();
  createParticles();
  draw();
}

/* ============================================================
   HERO CANVAS — ESTRELAS
============================================================ */
function initHeroCanvas() {
  const canvas = $('#hero-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function initStars() {
    stars = Array.from({ length: 130 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.1 + 0.1,
      a: Math.random(),
      da: (Math.random() - 0.5) * 0.007,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.a = Math.max(0, Math.min(1, s.a + s.da));
      if (s.a <= 0.02 || s.a >= 0.98) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,237,224,${s.a * 0.45})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(() => { resize(); initStars(); });
  ro.observe(canvas.parentElement);
  resize();
  initStars();
  draw();
}

/* ============================================================
   LOGIN
============================================================ */
function initLogin(config) {
  const input    = $('#password-input');
  const btn      = $('#login-btn');
  const errEl    = $('#login-error');
  const card     = $('#login-card');
  const togglePw = $('#toggle-pw');

  togglePw.addEventListener('click', () => {
    const isText = input.type === 'text';
    input.type    = isText ? 'password' : 'text';
    togglePw.textContent = isText ? '👁' : '🙈';
  });

  function tryLogin() {
    const val = input.value.trim().toLowerCase().replace(/\s+/g, '');
    const pwd = (config.password || 'euteamo').toLowerCase().replace(/\s+/g, '');

    if (val === pwd) {
      const loginScreen = $('#login-screen');
      const mainSite    = $('#main-site');

      loginScreen.classList.add('exit');
      mainSite.style.pointerEvents = 'all';

      setTimeout(() => mainSite.classList.add('visible'), 350);
      setTimeout(() => {
        loginScreen.style.display = 'none';
      }, 1100);
    } else {
      showLoginError();
    }
  }

  function showLoginError() {
    errEl.classList.add('show');
    card.classList.add('login-shake');
    input.value = '';
    input.focus();
    setTimeout(() => card.classList.remove('login-shake'), 500);
    setTimeout(() => errEl.classList.remove('show'), 3800);
  }

  btn.addEventListener('click', tryLogin);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') tryLogin();
    if (errEl.classList.contains('show')) errEl.classList.remove('show');
  });
}

/* ============================================================
   MENSAGEM DINÂMICA
============================================================ */
function initMensagem(mensagens) {
  if (!mensagens?.length) return;

  const textEl    = $('#msg-text');
  const dateEl    = $('#msg-date');
  const dotsEl    = $('#msg-dots');
  const hintEl    = $('#msg-unlock-hint');

  // Calcula o limite de mensagens desbloqueadas (date <= hoje)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let lastUnlocked = 0;
  for (let i = mensagens.length - 1; i >= 0; i--) {
    const d = new Date(mensagens[i].date + 'T00:00:00');
    if (d <= today) { lastUnlocked = i; break; }
  }

  // Dias até a próxima mensagem
  let daysUntilNext = null;
  if (lastUnlocked < mensagens.length - 1) {
    const nextDate = new Date(mensagens[lastUnlocked + 1].date + 'T00:00:00');
    daysUntilNext = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
  }

  // Começa na mensagem mais recente desbloqueada
  let idx = lastUnlocked;

  // Com 52 mensagens, dots viram contador compacto
  const useCounter = mensagens.length > 14;
  let counterEl = null;

  if (useCounter) {
    counterEl = document.createElement('span');
    counterEl.className = 'msg-counter';
    dotsEl.appendChild(counterEl);
  } else {
    mensagens.slice(0, lastUnlocked + 1).forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'msg-dot' + (i === idx ? ' active' : '');
      dot.setAttribute('aria-label', `Mensagem ${i + 1}`);
      dot.addEventListener('click', () => setMsg(i, true));
      dotsEl.appendChild(dot);
    });
  }

  // Setas — respeitam o limite de desbloqueio
  const prevBtn = $('#msg-prev');
  const nextBtn = $('#msg-next');
  if (prevBtn) prevBtn.addEventListener('click', () => { if (idx > 0) setMsg(idx - 1, true); });
  if (nextBtn) nextBtn.addEventListener('click', () => { if (idx < lastUnlocked) setMsg(idx + 1, true); });

  function updateArrows() {
    if (prevBtn) prevBtn.disabled = idx <= 0;
    if (nextBtn) nextBtn.disabled = idx >= lastUnlocked;
  }

  function updateHint() {
    if (!hintEl) return;
    if (lastUnlocked >= mensagens.length - 1) {
      hintEl.innerHTML = `todas as <em>${mensagens.length} mensagens</em> desbloqueadas`;
      return;
    }
    if (idx < lastUnlocked) {
      hintEl.innerHTML = `semana <em>${idx + 1}</em> de <em>${lastUnlocked + 1}</em> disponíveis`;
      return;
    }
    if (daysUntilNext === 1) {
      hintEl.innerHTML = `próxima mensagem: <em>amanhã</em>`;
    } else {
      hintEl.innerHTML = `próxima mensagem em <em>${daysUntilNext} dias</em>`;
    }
  }

  function applyMsg(i) {
    textEl.textContent = mensagens[i].message;
    dateEl.textContent = formatDatePT(mensagens[i].date);
    if (useCounter) {
      counterEl.innerHTML = `semana <em>${i + 1}</em> · ${lastUnlocked + 1} disponíveis`;
    } else {
      $$('.msg-dot', dotsEl).forEach((d, di) => d.classList.toggle('active', di === i));
    }
    updateArrows();
    updateHint();
  }

  let fadeT = null, enterT = null;
  function setMsg(i, animate = false) {
    idx = i;
    if (!animate) { applyMsg(i); return; }

    // Cancela qualquer transição em andamento antes de iniciar nova
    clearTimeout(fadeT);
    clearTimeout(enterT);
    textEl.classList.remove('entering');
    textEl.classList.add('fading');
    dateEl.classList.add('fading');

    fadeT = setTimeout(() => {
      applyMsg(i);
      textEl.classList.remove('fading');
      dateEl.classList.remove('fading');
      textEl.classList.add('entering');
      enterT = setTimeout(() => textEl.classList.remove('entering'), 500);
    }, 300);
  }

  setMsg(idx);
}

/* ============================================================
   GALERIA
============================================================ */
function initGaleria(fotos) {
  if (!fotos?.length) return;

  const grid    = $('#gallery-grid');
  const filters = $('#gallery-filters');
  if (!grid || !filters) return;

  // Tags únicas preservando ordem de aparição
  const tags = ['todos', ...new Set(fotos.map(f => f.tag))];

  // Cria botões de filtro
  tags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (tag === 'todos' ? ' active' : '');
    btn.textContent = tag;
    btn.addEventListener('click', () => {
      $$('.filter-btn', filters).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterGallery(tag);
    });
    filters.appendChild(btn);
  });

  // Cria items da galeria
  fotos.forEach((foto, i) => {
    const item = document.createElement('div');
    item.className = 'gallery-item reveal';
    item.dataset.tag = foto.tag;
    item.style.transitionDelay = `${(i % 3) * 0.07}s`;

    const aspectRatio = foto.aspect || '4/3';

    if (foto.url) {
      item.innerHTML = `
        <img src="${foto.url}" alt="${foto.description}" loading="lazy" />
        <div class="gallery-overlay">
          <span class="gallery-overlay-tag">${foto.tag}</span>
          <span class="gallery-overlay-desc">${foto.description}</span>
        </div>`;
    } else {
      item.innerHTML = `
        <div class="gallery-placeholder" style="background:${foto.gradient}; aspect-ratio:${aspectRatio};">
          <span>${foto.emoji}</span>
        </div>
        <div class="gallery-overlay">
          <span class="gallery-overlay-tag">${foto.tag}</span>
          <span class="gallery-overlay-desc">${foto.description}</span>
        </div>`;
    }

    item.addEventListener('click', () => openLightbox(foto));
    grid.appendChild(item);
  });

  // Reconecta observer após criação dos items
  observeReveal();
}

function filterGallery(tag) {
  $$('.gallery-item').forEach(item => {
    const show = tag === 'todos' || item.dataset.tag === tag;
    item.classList.toggle('hidden', !show);
  });
}

/* Lightbox */
function openLightbox(foto) {
  const lb   = $('#lightbox');
  const img  = $('#lightbox-img');
  const desc = $('#lightbox-desc');
  const placeholder = $('#lightbox-placeholder');

  if (foto.url) {
    img.src = foto.url;
    img.alt = foto.description || '';
    img.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
  } else {
    img.style.display = 'none';
    if (placeholder) {
      placeholder.style.display = 'flex';
      placeholder.style.background = foto.gradient;
      placeholder.textContent = foto.emoji;
    }
  }

  desc.textContent = foto.description;
  lb.classList.add('open');
  lockBodyScroll();
}

function closeLightbox() {
  $('#lightbox').classList.remove('open');
  unlockBodyScroll();
}

function initLightbox() {
  $('#lightbox-close')?.addEventListener('click', closeLightbox);
  $('#lightbox')?.addEventListener('click', e => {
    if (e.target === $('#lightbox')) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });
}

/* ============================================================
   TIMELINE
============================================================ */
function initTimeline(items) {
  if (!items?.length) return;

  const list = $('#timeline-list');
  if (!list) return;

  items.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'timeline-item reveal';
    el.style.transitionDelay = `${i * 0.1}s`;

    const visualHTML = item.url
      ? `<img src="${item.url}" alt="${item.title}" class="timeline-img-real" loading="lazy" />`
      : `<div class="timeline-placeholder" style="background:${item.gradient};">${item.emoji}</div>`;

    el.innerHTML = `
      <div class="timeline-dot"></div>
      <p class="timeline-date">${item.date}</p>
      <h3 class="timeline-title">${item.title}</h3>
      <p class="timeline-text">${item.text}</p>
      <div class="timeline-visual">${visualHTML}</div>`;

    list.appendChild(el);
  });

  observeReveal();
}

/* ============================================================
   CARTA (fade por parágrafo)
============================================================ */
function initCarta(cartaData, config) {
  const container  = $('#carta-paragraphs');
  const assinatura = $('#carta-assinatura');
  if (!container || !cartaData?.paragraphs?.length) return;

  // Seta assinatura
  if (assinatura && config?.cartaAssinatura) {
    assinatura.textContent = config.cartaAssinatura;
  }

  // Cria elementos de parágrafo
  cartaData.paragraphs.forEach(text => {
    const p = document.createElement('p');
    p.className = 'carta-p';
    p.textContent = text;
    container.appendChild(p);
  });

  // Inicia animação quando a carta entra na viewport
  let started = false;
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      revealCartaParagraphs();
    }
  }, { threshold: 0.15 });

  const paper = $('#carta-paper');
  if (paper) observer.observe(paper);
}

function revealCartaParagraphs() {
  const paras = $$('.carta-p');
  const assin = $('#carta-assinatura');

  paras.forEach((p, i) => {
    setTimeout(() => p.classList.add('visible'), 200 + i * 240);
  });

  if (assin) {
    setTimeout(() => assin.classList.add('visible'), 200 + paras.length * 240 + 350);
  }
}

/* ============================================================
   MÚSICAS
============================================================ */
function initMusicas(musicas) {
  if (!musicas?.length) return;

  const grid = $('#musicas-grid');
  if (!grid) return;

  musicas.forEach((m, i) => {
    const card = document.createElement('div');
    card.className = 'music-card reveal';
    card.style.transitionDelay = `${(i % 3) * 0.1}s`;

    card.innerHTML = `
      <div class="music-thumb">
        <img src="${m.thumb}" alt="${m.title}" loading="lazy" />
        <div class="music-play-overlay">
          <button class="music-play-btn" data-yt="${m.videoId}" aria-label="Tocar ${m.title}">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="music-body">
        <p class="music-tag">${m.tag}</p>
        <h3 class="music-title">${m.title}</h3>
        <p class="music-artist">${m.artist}</p>
        <p class="music-desc">${m.desc}</p>
      </div>`;

    grid.appendChild(card);
  });

  observeReveal();
  initYTModal();
}

function initYTModal() {
  const modal = $('#yt-modal');
  const frame = $('#yt-frame');

  // Delegação de evento para os botões de play
  $('#musicas-grid')?.addEventListener('click', e => {
    const btn = e.target.closest('.music-play-btn');
    if (!btn) return;
    const id = btn.dataset.yt;
    frame.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
    modal.classList.add('open');
    lockBodyScroll();
  });

  function closeModal() {
    modal.classList.remove('open');
    frame.src = '';
    unlockBodyScroll();
  }

  $('#yt-close')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

/* ============================================================
   NAV — ATIVO + MOBILE DRAWER
============================================================ */
function initNav() {
  const navLinks  = $$('#main-nav a');
  const sections  = ['hero', 'mensagem', 'galeria', 'timeline', 'carta', 'musicas'];

  // Marca link ativo com IntersectionObserver
  const navObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-35% 0px -55% 0px' });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) navObs.observe(el);
  });

  // Mobile drawer
  const toggle = $('#nav-toggle');
  const drawer = $('#nav-drawer');
  const close  = $('#nav-drawer-close');

  toggle?.addEventListener('click', () => {
    drawer.classList.add('open');
    lockBodyScroll();
  });

  function closeDrawer() {
    drawer.classList.remove('open');
    unlockBodyScroll();
  }

  close?.addEventListener('click', closeDrawer);
  $$('#nav-drawer a').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const href = a.getAttribute('href');
    closeDrawer();
    setTimeout(() => {
      const target = href ? document.querySelector(href) : null;
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }, 320);
  }));
}

/* ============================================================
   SCROLL REVEAL OBSERVER
============================================================ */
function observeReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        // Para itens com stagger não precisamos continuar observando
        if (!e.target.classList.contains('keep-observe')) {
          observer.unobserve(e.target);
        }
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal, .reveal-left').forEach(el => observer.observe(el));
}

/* ============================================================
   CONFIG DINÂMICA (hero + footer)
============================================================ */
function applyConfig(config) {
  if (!config) return;

  // Título do site
  if (config.siteTitle) document.title = config.siteTitle;

  // Hero
  const eyebrow = $('#hero-eyebrow');
  const titleEl = $('#hero-title-main');
  const subEl   = $('#hero-sub');

  if (eyebrow && config.heroEyebrow) eyebrow.textContent = config.heroEyebrow;
  if (subEl   && config.heroSubtitle) subEl.textContent  = config.heroSubtitle;

  if (titleEl && config.heroTitle) {
    const parts = config.heroTitle.split(config.heroTitleEmphasis || 'você');
    titleEl.innerHTML = parts.length === 2
      ? `${parts[0]}<em>${config.heroTitleEmphasis}</em>${parts[1]}`
      : config.heroTitle;
  }

  // Footer
  const footerText = $('#footer-text');
  const footerSub  = $('#footer-sub');
  if (footerText && config.footerText) footerText.textContent = config.footerText;
  if (footerSub  && config.footerSub)  footerSub.textContent  = config.footerSub;
}

/* ============================================================
   BOOT — carrega tudo
============================================================ */
async function boot() {
  // Inicia coisas que não dependem de dados
  initLoader();
  initScrollProgress();
  initCursor();
  initParticles();
  initHeroCanvas();
  initLightbox();
  initNav();
  observeReveal();

  // Carrega todos os JSONs em paralelo
  const [config, mensagens, fotos, timeline, carta, musicas] = await Promise.all([
    fetchJSON('./data/config.json'),
    fetchJSON('./data/mensagens.json'),
    fetchJSON('./data/galeria.json'),
    fetchJSON('./data/timeline.json'),
    fetchJSON('./data/carta.json'),
    fetchJSON('./data/musicas.json'),
  ]);

  // Aplica config global
  applyConfig(config);

  // Inicializa módulos que dependem de dados
  initLogin(config || {});
  initMensagem(mensagens);
  initGaleria(fotos);
  initTimeline(timeline);
  initCarta(carta, config);
  initMusicas(musicas);
}

// Inicia quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', boot);
