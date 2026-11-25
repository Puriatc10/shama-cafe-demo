/* ============================================================
   SHAMA — background cup: parallax + slow page-linked ring
   Runs only while the page scrolls; one element, no layout work.
   ============================================================ */
(function () {
  'use strict';

  const cup = document.getElementById('cup-art');
  if (!cup) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bar = cup.querySelector('.cup-art__bar');
  let queued = false;
  let lastP = -1;
  let lastO = -1;

  function paint() {
    queued = false;
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - innerHeight);
    const p = Math.min(1, Math.max(0, window.scrollY / max));

    if (Math.abs(p - lastP) > 0.001) {
      lastP = p;
      cup.style.setProperty('--p', p.toFixed(4));
    }

    if (!reduce) {
      /* drifts up a little as the page goes down, and breathes slightly */
      const y = -Math.min(90, window.scrollY * 0.05);
      cup.style.setProperty('--cup-y', y.toFixed(1) + 'px');
      cup.style.setProperty('--cup-s', (1 + p * 0.06).toFixed(3));
    }

    /* it belongs to the hero: fade it out before the menu starts, so it
       never sits behind cards or text further down the page */
    const vh = innerHeight || 1;
    const fade = 1 - Math.min(1, Math.max(0, (window.scrollY - vh * 0.35) / (vh * 0.75)));
    if (fade !== lastO) {
      lastO = fade;
      cup.style.setProperty('--cup-o', fade.toFixed(3));
    }
  }

  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(paint);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  paint();

  /* the ring is decorative; keep it out of the a11y tree */
  if (bar) bar.setAttribute('aria-hidden', 'true');
})();
