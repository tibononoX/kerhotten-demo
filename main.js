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
    if (lastMail) buildMail();
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

  /* ---------- Booking request -> mailto (never auto-sent) ---------- */
  var form = document.getElementById('booking');
  var arr = document.getElementById('arrivee');
  var dep = document.getElementById('depart');
  var gite = document.getElementById('gite');
  var adults = document.getElementById('adultes');
  var kids = document.getElementById('enfants');
  var nom = document.getElementById('nom');
  var msg = document.getElementById('message');
  var err = document.getElementById('form-error');
  var preview = document.getElementById('mail-preview');
  var pre = document.getElementById('mail-text');
  var link = document.getElementById('mail-link');
  var lastMail = false;

  function iso(d) { return d.toISOString().slice(0, 10); }
  var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  arr.min = iso(today); dep.min = iso(today);
  arr.addEventListener('change', function () {
    if (arr.value) {
      var d = new Date(arr.value); d.setDate(d.getDate() + 1); dep.min = iso(d);
      if (dep.value && dep.value <= arr.value) dep.value = '';
    }
  });

  document.querySelectorAll('[data-gite]').forEach(function (a) {
    a.addEventListener('click', function () { gite.value = a.dataset.gite; });
  });

  var T = {
    fr: {
      missingDates: 'Merci d’indiquer vos dates d’arrivée et de départ.',
      order: 'La date de départ doit être après la date d’arrivée.',
      past: 'La date d’arrivée est déjà passée.',
      tooMany: function (n, cap, name) { return n + ' personnes : la capacité de ' + name + ' est de ' + cap + ' personnes maximum.'; },
      adults: 'Merci d’indiquer au moins 1 adulte.',
      subject: function (name, a, d) { return 'Demande de disponibilité – ' + name + ' – du ' + a + ' au ' + d; },
      body: function (o) {
        return 'Bonjour Cindy et Eddy,\n\n' +
          'Je souhaiterais connaître vos disponibilités et vos tarifs pour :\n\n' +
          '• Gîte : ' + o.name + '\n' +
          '• Arrivée : ' + o.a + '\n' +
          '• Départ : ' + o.d + ' (' + o.nights + ' nuit' + (o.nights > 1 ? 's' : '') + ')\n' +
          '• Voyageurs : ' + o.ad + ' adulte' + (o.ad > 1 ? 's' : '') + (o.ki ? ', ' + o.ki + ' enfant' + (o.ki > 1 ? 's' : '') : '') + '\n' +
          (o.msg ? '\n' + o.msg + '\n' : '') +
          '\nMerci d’avance,\n' + (o.nom || '');
      },
      locale: 'fr-FR'
    },
    en: {
      missingDates: 'Please enter your arrival and departure dates.',
      order: 'Departure must be after arrival.',
      past: 'The arrival date is in the past.',
      tooMany: function (n, cap, name) { return n + ' guests: ' + name + ' sleeps ' + cap + ' guests maximum.'; },
      adults: 'Please enter at least 1 adult.',
      subject: function (name, a, d) { return 'Availability request – ' + name + ' – ' + a + ' to ' + d; },
      body: function (o) {
        return 'Hello Cindy and Eddy,\n\n' +
          'I would like to know your availability and rates for:\n\n' +
          '• Cottage: ' + o.name + '\n' +
          '• Arrival: ' + o.a + '\n' +
          '• Departure: ' + o.d + ' (' + o.nights + ' night' + (o.nights > 1 ? 's' : '') + ')\n' +
          '• Guests: ' + o.ad + ' adult' + (o.ad > 1 ? 's' : '') + (o.ki ? ', ' + o.ki + ' child' + (o.ki > 1 ? 'ren' : '') : '') + '\n' +
          (o.msg ? '\n' + o.msg + '\n' : '') +
          '\nThank you,\n' + (o.nom || '');
      },
      locale: 'en-GB'
    }
  };

  function fmt(v) {
    var p = v.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString(T[lang].locale, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  }
  function fail(m, field) {
    err.textContent = m; preview.hidden = true; lastMail = false;
    if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
    return false;
  }
  function buildMail() {
    var t = T[lang];
    [arr, dep, adults].forEach(function (f) { f.removeAttribute('aria-invalid'); });
    err.textContent = '';
    if (!arr.value || !dep.value) return fail(t.missingDates, !arr.value ? arr : dep);
    if (arr.value < arr.min) return fail(t.past, arr);
    if (dep.value <= arr.value) return fail(t.order, dep);
    var ad = parseInt(adults.value, 10) || 0, ki = parseInt(kids.value, 10) || 0;
    if (ad < 1) return fail(t.adults, adults);
    var opt = gite.options[gite.selectedIndex];
    var cap = parseInt(opt.dataset.cap, 10);
    var name = opt.textContent.replace(/\s*\(.*\)\s*$/, '');
    if (ad + ki > cap) return fail(t.tooMany(ad + ki, cap, name), adults);
    var nights = Math.round((new Date(dep.value) - new Date(arr.value)) / 864e5);
    var o = { name: name, a: fmt(arr.value), d: fmt(dep.value), nights: nights, ad: ad, ki: ki, msg: msg.value.trim(), nom: nom.value.trim() };
    var subject = t.subject(name, o.a, o.d);
    var body = t.body(o);
    pre.textContent = 'À / To : ' + EMAIL + '\nObjet / Subject : ' + subject + '\n\n' + body;
    link.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    preview.hidden = false; lastMail = true;
    return true;
  }
  /* Submitting only builds a preview + link. Nothing is sent and nothing opens automatically:
     the visitor must click "Ouvrir dans ma messagerie" and then send from their own mail app. */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (buildMail()) pre.focus();
  });
  [arr, dep, gite, adults, kids, nom, msg].forEach(function (f) {
    f.addEventListener('change', function () { if (lastMail) buildMail(); });
  });

  /* ---------- init ---------- */
  var saved = null;
  try { saved = localStorage.getItem('kh-lang'); } catch (e) {}
  if (saved === 'en' || /[?&]lang=en\b/.test(location.search)) setLang('en');
})();
