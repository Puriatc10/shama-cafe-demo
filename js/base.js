/* ============================================================
   SHAMA — global behaviour: nav, reveal, halo, parallax
   ============================================================ */
(function () {
  'use strict';
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------- nav state */
  const nav = $('#nav');
  const burger = $('#nav-burger');
  const mobile = $('#nav-mobile');
  let lastY = window.scrollY;

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 40);
    nav.classList.toggle('is-hidden', y > 520 && y > lastY && !mobile.classList.contains('is-open'));
    lastY = y;
    const doc = document.documentElement;
    const p = y / Math.max(1, doc.scrollHeight - doc.clientHeight);
    const bar = $('#scroll-progress');
    if (bar) bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    mobile.hidden = false;
    mobile.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
    if (!open) setTimeout(() => { if (!mobile.classList.contains('is-open')) mobile.hidden = true; }, 420);
  }
  burger.addEventListener('click', () => setMenu(!mobile.classList.contains('is-open')));
  $$('#nav-mobile a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* --------------------------------------------------------- cart badge */
  function paintCart() {
    const el = $('#cart-count');
    if (!el) return;
    const n = window.Shama.basket.count();
    el.textContent = window.Shama.util.fa(n);
    el.dataset.empty = n === 0 ? 'true' : 'false';
    document.body.classList.toggle('has-cartbar', n > 0 && innerWidth < 720);
    const btn = $('#nav-cart');
    if (btn) {
      btn.classList.toggle('has-items', n > 0);
      btn.classList.remove('pop');
      void btn.offsetWidth;
      if (n > 0) btn.classList.add('pop');
    }
  }
  window.Shama.on(paintCart);
  paintCart();

  $('#nav-cart').addEventListener('click', () => {
    if (window.Shama.cartUI) window.Shama.cartUI.open();
    else window.Shama.toast('سبد خرید در حال آماده‌سازی است');
  });
  $$('[data-open-cart]').forEach((b) => b.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.Shama.cartUI) window.Shama.cartUI.open();
  }));

  /* ------------------------------------------------------------ reveals */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

  function observeReveals(scope) {
    const limit = innerHeight * 0.94;
    $$('.reveal:not(.in)', scope || document).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < limit) el.classList.add('in');
      else io.observe(el);
    });
  }
  observeReveals();
  window.Shama.observeReveals = observeReveals;

  /* sections render their markup after this script runs — pick up any
     .reveal node that appears later so nothing stays at opacity 0 */
  let mo;
  const mo2 = new MutationObserver(() => {
    clearTimeout(mo);
    mo = setTimeout(observeReveals, 60);
  });
  mo2.observe(document.body, { childList: true, subtree: true });

  /* fast jumps (anchor links, restored scroll) can skip past elements the
     observer never saw — sweep anything already at or above the fold */
  let sweepQueued = false;
  function sweep() {
    sweepQueued = false;
    const limit = innerHeight * 0.94;
    $$('.reveal:not(.in)').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < limit) el.classList.add('in');
    });
  }
  window.addEventListener('scroll', () => {
    if (sweepQueued) return;
    sweepQueued = true;
    requestAnimationFrame(sweep);
  }, { passive: true });
  setTimeout(sweep, 400);

  /* --------------------------------------------------------- cursor halo */
  const halo = $('#cursor-halo');
  if (halo && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    document.body.classList.add('has-halo');
    let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty;
    window.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.075;
      cy += (ty - cy) * 0.075;
      halo.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      requestAnimationFrame(loop);
    })();
  } else if (halo) {
    halo.remove();
  }

  /* ------------------------------------------------------- hero parallax */
  const cards = $$('.hero__card');
  const hero = $('#hero');
  if (cards.length && hero && !reduce) {
    let mx = 0, my = 0, px = 0, py = 0;
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
    });
    (function loop() {
      px += (mx - px) * 0.06;
      py += (my - py) * 0.06;
      cards.forEach((c) => {
        const d = +(c.dataset.depth || 20);
        c.style.transform = 'translate3d(' + (-px * d) + 'px,' + (-py * d) + 'px,0)';
      });
      requestAnimationFrame(loop);
    })();
  }

  /* -------------------------------------------------- smooth anchor jump */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    const top = t.getBoundingClientRect().top + window.scrollY - 66;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  });

  window.Shama.util.$ = $;
  window.Shama.util.$$ = $$;
})();
