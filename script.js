'use strict';

/* ════════════════════════════════════════
   STATE
════════════════════════════════════════ */
let currentLang = CONFIG.defaultLanguage;

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  applyColors();
  buildLangDropdown();
  setLanguage(currentLang);
  buildScreenshots();
  populateContact();
  setupNavScroll();
  setupReveal();
  setupCursor();
  setupParticles();
  setupHeroBlocks();
  setupCounters();
  setupSmoothLinks();

  if (CONFIG.video.url) {
    embedVideo(CONFIG.video.url, 'heroVideoFrame');
    embedVideo(CONFIG.video.url, 'videoPlayer');
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllModals();
  });
});

/* ════════════════════════════════════════
   COLORS → CSS Variables
════════════════════════════════════════ */
function applyColors() {
  // Keep theme from config but map to new variable names
  const c = CONFIG.colors;
  const s = document.documentElement.style;
  // Map config colors to our new variables
  if (c.primary)      s.setProperty('--primary',      c.primary);
  if (c.primaryLight) s.setProperty('--primary-dim',  hexToRgba(c.primaryLight, 0.12));
  if (c.primaryDark)  s.setProperty('--primary-glow', hexToRgba(c.primary, 0.35));
  if (c.success)      s.setProperty('--success',      c.success);
  if (c.bg)           s.setProperty('--bg',           c.bg);
  if (c.bgCard)       s.setProperty('--bg-card',      c.bgCard);
  if (c.bgCardHover)  s.setProperty('--bg-card-h',    c.bgCardHover);
  if (c.text)         s.setProperty('--text',         c.text);
  if (c.textMuted)    s.setProperty('--text-muted',   c.textMuted);
  if (c.border)       s.setProperty('--border',       c.border);
}

function hexToRgba(hex, alpha) {
  if (!hex || !hex.startsWith('#')) return hex;
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ════════════════════════════════════════
   CURSOR
════════════════════════════════════════ */
function setupCursor() {
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursorTrail');
  if (!cursor || !trail || window.matchMedia('(hover:none)').matches) {
    if (cursor) cursor.style.display = 'none';
    if (trail)  trail.style.display  = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  let mx = -999, my = -999;
  let tx = -999, ty = -999;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function tickTrail() {
    tx += (mx - tx) * 0.1;
    ty += (my - ty) * 0.1;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(tickTrail);
  })();

  // Cursor scale on interactive elements
  document.querySelectorAll('a, button, [onclick]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(2)';
      trail.style.opacity = '0.1';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      trail.style.opacity = '0.4';
    });
  });
}

/* ════════════════════════════════════════
   PARTICLES
════════════════════════════════════════ */
function setupParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  const resize = () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  // Parse primary color for particles
  const style = getComputedStyle(document.documentElement);
  const primary = style.getPropertyValue('--primary').trim() || '#00D4FF';

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.size = Math.random() * 1.5 + 0.5;
      this.speedY = -(Math.random() * 0.4 + 0.1);
      this.speedX = (Math.random() - 0.5) * 0.2;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.life = 0;
      this.maxLife = Math.random() * 200 + 100;
      // Some particles are Minecraft squares
      this.isSquare = Math.random() < 0.15;
      this.rotation = 0;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      this.rotation += this.rotSpeed;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      const fade = Math.sin(Math.PI * this.life / this.maxLife);
      ctx.globalAlpha = this.opacity * fade;
      ctx.fillStyle = primary;
      if (this.isSquare) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillRect(-this.size * 2, -this.size * 2, this.size * 4, this.size * 4);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
}

/* ════════════════════════════════════════
   HERO MINECRAFT BLOCKS
════════════════════════════════════════ */
function setupHeroBlocks() {
  const container = document.getElementById('heroBlocks');
  if (!container) return;
  const sizes = [20, 28, 36, 44, 60];
  for (let i = 0; i < 18; i++) {
    const block = document.createElement('div');
    block.className = 'hero-block';
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    block.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      --dur: ${8 + Math.random() * 10}s;
      --delay: -${Math.random() * 10}s;
      opacity: ${0.2 + Math.random() * 0.5};
    `;
    container.appendChild(block);
  }
}

/* ════════════════════════════════════════
   COUNTER ANIMATION
════════════════════════════════════════ */
function setupCounters() {
  const nums = document.querySelectorAll('[data-count]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      const duration = 1500;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(ease * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(el => obs.observe(el));
}

/* ════════════════════════════════════════
   NAVBAR
════════════════════════════════════════ */
function setupNavScroll() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  let last = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 20);
    last = y;
  }, { passive: true });
}

/* ════════════════════════════════════════
   LANG DROPDOWN
════════════════════════════════════════ */
function buildLangDropdown() {
  const container = document.getElementById('langDropdown');
  if (!container) return;
  CONFIG.languages.forEach(lang => {
    const item = document.createElement('div');
    item.className = 'lang-item' + (lang.code === currentLang ? ' active' : '');
    item.innerHTML = `<span>${lang.flag}</span><span>${lang.full}</span>`;
    item.onclick = () => { setLanguage(lang.code); toggleLangDropdown(); };
    container.appendChild(item);
  });
}

function toggleLangDropdown() {
  const sel = document.getElementById('langSelector');
  if (sel) sel.classList.toggle('open');
}

function closeLangDropdown() {
  const sel = document.getElementById('langSelector');
  if (sel) sel.classList.remove('open');
}
document.addEventListener('click', e => {
  const sel = document.getElementById('langSelector');
  if (sel && !sel.contains(e.target)) closeLangDropdown();
});

/* ════════════════════════════════════════
   I18N
════════════════════════════════════════ */
function setLanguage(code) {
  currentLang = code;
  const lang = CONFIG.languages.find(l => l.code === code) || CONFIG.languages[0];
  const flag  = document.getElementById('langFlag');
  const label = document.getElementById('langLabel');
  if (flag)  flag.textContent  = lang.flag;
  if (label) label.textContent = lang.label;

  // Update active in dropdown
  document.querySelectorAll('.lang-item').forEach((item, i) => {
    item.classList.toggle('active', CONFIG.languages[i].code === code);
  });

  // Translations
  const t = CONFIG.i18n[code] || CONFIG.i18n['ru'];
  if (!t) return;

  // Tagline
  const tagline = CONFIG.clientTagline[code] || CONFIG.clientTagline['ru'];
  ['heroTagline', 'footerTagline'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = tagline;
  });

  // Hero quote
  const quote = CONFIG.heroQuote[code] || CONFIG.heroQuote['ru'];
  const heroQuote = document.getElementById('heroQuote');
  if (heroQuote) heroQuote.textContent = quote;

  // i18n data attributes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key]) el.textContent = t[key];
    else if (key.startsWith('nav') && !isNaN(key.slice(3))) {
      const idx = parseInt(key.slice(3));
      const links = CONFIG.nav.links[code] || CONFIG.nav.links['ru'];
      if (links && links[idx]) el.textContent = links[idx];
    }
  });
  document.querySelectorAll('[data-mob-i18n]').forEach(el => {
    const key = el.dataset.mobI18n;
    if (key.startsWith('nav') && !isNaN(key.slice(3))) {
      const idx = parseInt(key.slice(3));
      const links = CONFIG.nav.links[code] || CONFIG.nav.links['ru'];
      if (links && links[idx]) el.textContent = links[idx];
    } else if (t[key]) el.textContent = t[key];
  });

  // Buttons
  const heroBtnBuy   = document.getElementById('heroBtnBuy');
  const heroBtnLearn = document.getElementById('heroBtnLearn');
  if (heroBtnBuy)   heroBtnBuy.querySelector('span:last-of-type').textContent = t.buyNowHero || 'Купить сейчас';
  if (heroBtnLearn) heroBtnLearn.querySelector('span').textContent = t.learnMore || 'Узнать больше';

  // Video hint
  const hint = document.getElementById('heroVideoHint');
  if (hint) {
    const vidHints = CONFIG.video.placeholder;
    hint.textContent = (vidHints && vidHints[code]) || 'Видео скоро появится';
  }

  // Footer copy
  const footerCopy = document.getElementById('footerCopy');
  if (footerCopy) footerCopy.textContent = t.footerCopy || `© ${new Date().getFullYear()} ${CONFIG.clientName}`;

  buildFeatures();
  buildPricing();
}

/* ════════════════════════════════════════
   FEATURES
════════════════════════════════════════ */
const FEAT_ICONS = [
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>`,
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>`,
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
];

function buildFeatures() {
  const grid = document.getElementById('featuresGrid');
  if (!grid) return;
  const features = (CONFIG.features[currentLang] || CONFIG.features['ru'] || []);
  grid.innerHTML = '';
  features.forEach((f, i) => {
    const card = document.createElement('div');
    card.className = 'feat-card reveal' + (i > 0 ? ` reveal-d${Math.min(i,4)}` : '');
    card.innerHTML = `
      <div class="feat-num">0${i + 1}</div>
      <div class="feat-icon">${FEAT_ICONS[i % FEAT_ICONS.length]}</div>
      <div class="feat-title">${f.title}</div>
      <div class="feat-desc">${f.desc}</div>
    `;
    grid.appendChild(card);
  });
  setupReveal();
}

/* ════════════════════════════════════════
   SCREENSHOTS
════════════════════════════════════════ */
function buildScreenshots() {
  const track = document.getElementById('marqueeTrack');
  if (!track || !CONFIG.screenshots || CONFIG.screenshots.length === 0) return;

  // Duplicate for infinite scroll
  const items = [...CONFIG.screenshots, ...CONFIG.screenshots, ...CONFIG.screenshots, ...CONFIG.screenshots];
  track.innerHTML = '';
  items.forEach(s => {
    const item = document.createElement('div');
    item.className = 'marquee-item';
    item.innerHTML = `<img src="${s.url}" alt="${s.alt || ''}" loading="lazy"/>`;
    track.appendChild(item);
  });
}

/* ════════════════════════════════════════
   PRICING
════════════════════════════════════════ */
function buildPricing() {
  const grid = document.getElementById('pricingGrid');
  if (!grid) return;
  const t = CONFIG.i18n[currentLang] || CONFIG.i18n['ru'];
  const currency = CONFIG.pricing.currency || '$';
  const badgeLabel = CONFIG.pricing.badge[currentLang] || CONFIG.pricing.badge['ru'];
  grid.innerHTML = '';

  CONFIG.pricing.plans.forEach((plan, idx) => {
    const features = plan.features[currentLang] || plan.features['ru'] || [];
    const duration  = plan.duration[currentLang]  || plan.duration['ru'];
    const isFree    = plan.price === 0;

    const card = document.createElement('div');
    card.className = 'plan-card reveal' + (idx > 0 ? ` reveal-d${idx}` : '') + (plan.popular ? ' popular' : '');

    let priceHTML;
    if (isFree) {
      priceHTML = `<div class="plan-price-free">FREE</div>`;
    } else {
      priceHTML = `<div class="plan-price"><span class="plan-price-sym">${currency}</span>${plan.price}</div>`;
    }

    card.innerHTML = `
      ${plan.popular ? `<div class="plan-badge">${badgeLabel}</div>` : ''}
      <div class="plan-duration">${duration}</div>
      ${priceHTML}
      <div class="plan-period">${t?.perPeriod || 'за период'}</div>
      <ul class="plan-features">
        ${features.map(f => `<li>${f}</li>`).join('')}
      </ul>
      <button class="plan-btn ${plan.popular ? 'plan-btn-primary' : 'plan-btn-outline'}"
        onclick="handleBuy('${plan.id}','${plan.duration[currentLang] || plan.duration.ru}')">
        ${t?.btnBuy || 'Купить сейчас'}
      </button>
    `;
    grid.appendChild(card);
  });
  setupReveal();
}

/* ════════════════════════════════════════
   BUY HANDLER
════════════════════════════════════════ */
function handleBuy(planId, planLabel) {
  const payment = CONFIG.payment;
  if (!payment) { showToast('Покупка скоро будет доступна!'); return; }

  if (payment.usePopup) {
    const t = CONFIG.i18n[currentLang] || CONFIG.i18n['ru'];
    const title = document.getElementById('paymentPopupTitle');
    const body  = document.getElementById('paymentPopupBody');
    const link  = document.getElementById('paymentPopupLink');
    if (title) title.textContent = t?.paymentPopupTitle || 'Оформление покупки';
    if (body)  body.textContent  = t?.paymentPopupText  || 'Для оформления покупки свяжитесь с нами:';
    if (link && payment.link) {
      link.href = payment.link;
      link.textContent = payment.linkLabel || 'Написать нам';
    }
    openModal('payment');
  } else if (payment.url) {
    window.open(payment.url + (payment.appendPlan ? `?plan=${planId}` : ''), '_blank');
  } else {
    showToast('Покупка скоро будет доступна!');
  }
}

/* ════════════════════════════════════════
   CONTACT
════════════════════════════════════════ */
function populateContact() {
  const c = CONFIG.contact;
  if (!c) return;

  const emailCard = document.getElementById('supportEmailCard');
  const emailVal  = document.getElementById('supportEmailVal');
  if (emailCard && c.email) emailCard.href = `mailto:${c.email}`;
  if (emailVal  && c.email) emailVal.textContent = c.email;

  const discordCard = document.getElementById('supportDiscordCard');
  if (discordCard && c.discord) discordCard.href = c.discord;

  const telegramCard = document.getElementById('supportTelegramCard');
  if (telegramCard && c.telegram) telegramCard.href = c.telegram;

  const footerDiscord  = document.getElementById('footerDiscord');
  const footerTelegram = document.getElementById('footerTelegram');
  if (footerDiscord  && c.discord)  footerDiscord.href  = c.discord;
  if (footerTelegram && c.telegram) footerTelegram.href = c.telegram;
}

/* ════════════════════════════════════════
   VIDEO EMBED
════════════════════════════════════════ */
function embedVideo(url, containerId) {
  const container = document.getElementById(containerId);
  if (!container || !url) return;

  let videoId = '';
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) { videoId = m[1]; break; }
  }

  if (!videoId) return;

  const placeholder = container.querySelector('.video-placeholder, .video-placeholder-s');
  if (placeholder) placeholder.remove();

  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.loading = 'lazy';
  container.appendChild(iframe);
}

/* ════════════════════════════════════════
   SCROLL REVEAL
════════════════════════════════════════ */
function setupReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
}

/* ════════════════════════════════════════
   MOBILE MENU
════════════════════════════════════════ */
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const ham  = document.getElementById('hamburger');
  if (!menu) return;
  menu.classList.toggle('open');
  if (ham) ham.classList.toggle('open');
}

function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const ham  = document.getElementById('hamburger');
  if (menu) menu.classList.remove('open');
  if (ham)  ham.classList.remove('open');
}

/* ════════════════════════════════════════
   SMOOTH LINKS
════════════════════════════════════════ */
function setupSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ════════════════════════════════════════
   MODALS
════════════════════════════════════════ */
function openModal(name) {
  const id = 'modal' + name.charAt(0).toUpperCase() + name.slice(1);
  const overlay = document.getElementById(id);
  if (!overlay) return;

  // Fill legal content if available
  if (name === 'privacy' && CONFIG.legal?.privacy) {
    const body = document.getElementById('privacyBody');
    if (body && CONFIG.legal.privacy.trim()) body.innerHTML = `<p style="white-space:pre-wrap;color:var(--text-muted);font-size:0.9rem;line-height:1.8;">${CONFIG.legal.privacy}</p>`;
  }
  if (name === 'terms' && CONFIG.legal?.terms) {
    const body = document.getElementById('termsBody');
    if (body && CONFIG.legal.terms.trim()) body.innerHTML = `<p style="white-space:pre-wrap;color:var(--text-muted);font-size:0.9rem;line-height:1.8;">${CONFIG.legal.terms}</p>`;
  }
  if (name === 'rules' && CONFIG.legal?.rules) {
    const body = document.getElementById('rulesBody');
    if (body && CONFIG.legal.rules.trim()) body.innerHTML = `<p style="white-space:pre-wrap;color:var(--text-muted);font-size:0.9rem;line-height:1.8;">${CONFIG.legal.rules}</p>`;
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(name) {
  const id = 'modal' + name.charAt(0).toUpperCase() + name.slice(1);
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOutside(e, id) {
  if (e.target.id === id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay.open').forEach(el => {
    el.classList.remove('open');
  });
  document.body.style.overflow = '';
}

/* ════════════════════════════════════════
   TOAST
════════════════════════════════════════ */
function showToast(msg, duration = 2800) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}
/* ════════════════════════════════════════
   АВТОМАТИЧЕСКОЕ КОПИРОВАНИЕ IP ИЗ CONFIG
   ════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const copyBtn = document.getElementById('copyServerIpBtn');
  const copyBtnText = document.getElementById('copyBtnText');

  if (copyBtn && copyBtnText) {
    copyBtn.addEventListener('click', async (e) => {
      // Отменяем стандартный переход по ссылке-заглушке
      e.preventDefault();

      // Автоматически берем IP из вашего файла config.js. 
      // Если у вас там структура CONFIG.servers, код возьмет первый доступный IP.
      // Если вы хотите жестко прописать текст, просто замените строку ниже на: const ipAddress = "rerrhdsmp.duckdns.org:4444";
      const ipAddress = (typeof CONFIG !== 'undefined' && CONFIG.servers && CONFIG.servers[0]) 
                        ? CONFIG.servers[0].ip 
                        : "rerrhdsmp.duckdns.org:4444";

      try {
        // Копируем адрес в буфер обмена устройства
        await navigator.clipboard.writeText(ipAddress);

        // Информируем пользователя внутри кнопки
        const originalText = copyBtnText.textContent;
        copyBtnText.textContent = "Успешно скопировано!";
        copyBtn.style.pointerEvents = "none"; // Защита от спам-кликов во время анимации

        // Вызываем штатное всплывающее уведомление вашего сайта (Toast)
        if (typeof showToast === 'function') {
          showToast(`IP сервера (${ipAddress}) скопирован!`);
        }

        // Через 2 секунды возвращаем исходное состояние кнопки
        setTimeout(() => {
          copyBtnText.textContent = originalText;
          copyBtn.style.pointerEvents = "auto";
        }, 2000);

      } catch (err) {
        console.error('Критическая ошибка копирования: ', err);
        // Резервный вариант, если браузер заблокировал автоматический доступ к буферу
        alert(`Не удалось скопировать автоматически. Адрес сервера: ${ipAddress}`);
      }
    });
  }
});