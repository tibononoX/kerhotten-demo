/* Private redesign proposal, photos © Gîtes de Kerhotten, not for publication without owners' consent. */
(function () {
  'use strict';
  var root = document.documentElement;
  var EMAIL = 'kerhotten@outlook.fr';

  /* ---------- FR / EN ---------- */
  var textNodes = Array.prototype.slice.call(document.querySelectorAll('[data-en]'));
  var ariaNodes = Array.prototype.slice.call(document.querySelectorAll('[data-en-aria]'));
  var altNodes = Array.prototype.slice.call(document.querySelectorAll('img[data-en-alt]'));
  /* French originals are kept lazily in JS (not as attributes) to avoid style invalidation on load */
  var frText = null, frAria = null, frAlt = null;
  function snapshot() {
    if (frText) return;
    frText = textNodes.map(function (el) { return el.innerHTML; });
    frAria = ariaNodes.map(function (el) { return el.getAttribute('aria-label') || ''; });
    frAlt = altNodes.map(function (el) { return el.getAttribute('alt') || ''; });
  }
  var meta = {
    fr: { title: document.title, desc: document.querySelector('meta[name="description"]').content },
    en: { title: 'Gîtes de Kerhotten – 3 character cottages facing Lac du Dordu, Brittany',
          desc: 'A Breton hamlet from 1697 in Langoëlan (Morbihan), Scorff Valley: 3 cottages for 5 to 10 guests, heated pool, 7,000 m² of gardens facing Lac du Dordu, Natura 2000 area. Whole hamlet for up to 20 guests.' }
  };
  var lang = 'fr';
  function setLang(l) {
    lang = l === 'en' ? 'en' : 'fr';
    snapshot();
    root.lang = lang;
    var en = lang === 'en';
    textNodes.forEach(function (el, i) { el.innerHTML = en ? el.getAttribute('data-en') : frText[i]; });
    ariaNodes.forEach(function (el, i) { el.setAttribute('aria-label', en ? el.getAttribute('data-en-aria') : frAria[i]); });
    altNodes.forEach(function (el, i) { el.alt = en ? el.getAttribute('data-en-alt') : frAlt[i]; });
    document.title = meta[lang].title;
    document.querySelector('meta[name="description"]').content = meta[lang].desc;
    document.querySelectorAll('.lang-btn').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
    try { localStorage.setItem('kh-lang', lang); } catch (e) {}
  }
  document.querySelectorAll('.lang-btn').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang); });
  });

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('nav');
  function closeMenu() { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); toggle.focus(); } });

  /* ---------- Reveal on scroll (motion-safe) ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = document.querySelectorAll('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Group request (DEMO: no network call) ---------- */
  var gf = document.getElementById('group-form');
  var gErr = document.getElementById('g-error');
  var gOk = document.getElementById('g-ok');
  var gIds = ['g-nom', 'g-email', 'g-type', 'g-arrivee', 'g-depart', 'g-nb'];
  var GT = {
    fr: { req: 'Merci de remplir les champs obligatoires (*).', email: 'Adresse e-mail invalide.', order: 'La date de départ doit être après la date d’arrivée.', nb: 'Nombre de personnes : entre 1 et 20.',
      ok: 'Démonstration : rien n’a été envoyé. Sur le site final, cette demande serait transmise directement à Cindy & Eddy, les propriétaires.' },
    en: { req: 'Please fill in the required fields (*).', email: 'Invalid email address.', order: 'Departure must be after arrival.', nb: 'Number of guests: between 1 and 20.',
      ok: 'Demo: nothing has been sent. On the live site, this request would go straight to Cindy & Eddy, the owners.' }
  };
  function gFail(m, f) { gErr.textContent = m; gOk.hidden = true; f.setAttribute('aria-invalid', 'true'); f.focus(); }
  gf.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = GT[lang]; gErr.textContent = '';
    var f = gIds.map(function (id) { var el = document.getElementById(id); el.removeAttribute('aria-invalid'); return el; });
    for (var i = 0; i < f.length; i++) if (!f[i].value.trim()) return gFail(t.req, f[i]);
    if (!f[1].checkValidity()) return gFail(t.email, f[1]);
    if (f[4].value <= f[3].value) return gFail(t.order, f[4]);
    var n = parseInt(f[5].value, 10);
    if (!(n >= 1 && n <= 20)) return gFail(t.nb, f[5]);
    gOk.textContent = t.ok; gOk.hidden = false; gOk.focus();
  });

  /* ---------- init ---------- */
  var saved = null;
  try { saved = localStorage.getItem('kh-lang'); } catch (e) {}
  if (saved === 'en' || /[?&]lang=en\b/.test(location.search)) setLang('en');
})();
