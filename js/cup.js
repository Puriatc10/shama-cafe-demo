/* ============================================================
   SHAMA — scroll-driven cup
   The cup fills as the section scrolls; when it is nearly full a
   hand-poured rosetta settles on the crema, in the surface plane.
   ============================================================ */
(function () {
  'use strict';

  const stage = document.getElementById('cup-stage');
  const section = document.getElementById('pour');
  if (!stage || !section) return;

  /* ------------------------------------------------------- geometry */
  const CX = 240;
  const RIM_Y = 150;
  const RIM_RX = 120, RIM_RY = 26;      // outer rim
  const IN_RX = 111, IN_RY = 22;        // inner rim (opening)
  const EMPTY_Y = 404;                  // surface when empty
  const FULL_Y = 160;                   // surface when full
  const HALF_TOP = 109, HALF_BOTTOM = 62;

  const halfWidthAt = (y) => HALF_TOP - ((y - RIM_Y) / (EMPTY_Y - RIM_Y)) * (HALF_TOP - HALF_BOTTOM);

  /* ----------------------------------------------------- latte art */
  /* drawn flat, then squashed into the crema plane by paint()      */
  function latteArt() {
    let leaves = '';
    const N = 13;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const y = 2 + t * 70;
      const s = 1.05 - t * 0.72;
      const xoff = 3 + t * 21;
      const rot = 18 - t * 7;
      leaves += `<path d="M0 0C-13-7-17-21 0-29C17-21 13-7 0 0Z" transform="translate(${CX - xoff} ${y.toFixed(1)}) rotate(-${rot.toFixed(1)}) scale(${s.toFixed(3)})"/>`;
      leaves += `<path d="M0 0C-13-7-17-21 0-29C17-21 13-7 0 0Z" transform="translate(${CX + xoff} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s.toFixed(3)})"/>`;
    }
    const cocoa = [
      [CX - 40, 30, 1.7], [CX + 36, 40, 1.4], [CX - 24, 68, 1.2],
      [CX + 28, 80, 1.5], [CX - 48, 58, 1.1], [CX + 50, 22, 1.2],
      [CX - 10, 96, 1.3], [CX + 14, 18, 1.0],
    ].map(([x, y, r], i) =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="#6B4522" opacity="${(0.45 + (i % 3) * 0.14).toFixed(2)}"/>`).join('');

    return `
      <g class="cup-art">
        <g fill="#F7EBD6" filter="url(#foam)">
          <path d="M${CX} -2C${CX - 6} 30 ${CX - 5} 58 ${CX} 84" fill="none" stroke="#F7EBD6" stroke-width="3" stroke-linecap="round" opacity=".5"/>
          ${leaves}
          <path d="M${CX} -34c-10-12.5-30-6-30 8.8 0 11.6 15.6 20.8 30 30.2 14.4-9.4 30-18.6 30-30.2 0-14.8-20-21.3-30-8.8Z" opacity=".97"/>
        </g>
        <g opacity=".85">${cocoa}</g>
      </g>`;
  }

  stage.innerHTML = `
  <svg viewBox="0 0 480 560" role="img" aria-label="فنجان قهوه شاما که با اسکرول پر می‌شود">
    <defs>
      <linearGradient id="ceramic" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#33291F"/>
        <stop offset=".42" stop-color="#1C1711"/>
        <stop offset="1" stop-color="#0C0906"/>
      </linearGradient>
      <linearGradient id="ceramicRim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#4A3B2B"/>
        <stop offset=".35" stop-color="#8B7150"/>
        <stop offset=".62" stop-color="#3A2E22"/>
        <stop offset="1" stop-color="#221A13"/>
      </linearGradient>
      <linearGradient id="ceramicHandle" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#3E3327"/>
        <stop offset=".55" stop-color="#1E1812"/>
        <stop offset="1" stop-color="#100C08"/>
      </linearGradient>
      <linearGradient id="goldrim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#F7E7BE"/>
        <stop offset=".38" stop-color="#C9A227"/>
        <stop offset=".7" stop-color="#7E5A24"/>
        <stop offset="1" stop-color="#E7C873"/>
      </linearGradient>
      <linearGradient id="coffee" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#7A4320"/>
        <stop offset=".28" stop-color="#54280F"/>
        <stop offset="1" stop-color="#1E0D04"/>
      </linearGradient>
      <radialGradient id="crema" cx=".46" cy=".4" r=".62">
        <stop offset="0" stop-color="#DCA872"/>
        <stop offset=".48" stop-color="#B67A42"/>
        <stop offset=".84" stop-color="#8A5127"/>
        <stop offset="1" stop-color="#5A2E14"/>
      </radialGradient>
      <radialGradient id="saucer" cx=".5" cy=".32" r=".72">
        <stop offset="0" stop-color="#221B14"/>
        <stop offset=".62" stop-color="#120E0A"/>
        <stop offset="1" stop-color="#090706"/>
      </radialGradient>
      <radialGradient id="innerDark" cx=".5" cy=".18" r=".92">
        <stop offset="0" stop-color="#1A120B"/>
        <stop offset="1" stop-color="#060403"/>
      </radialGradient>
      <linearGradient id="innerShade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#000" stop-opacity=".62"/>
        <stop offset=".18" stop-color="#000" stop-opacity=".18"/>
        <stop offset=".6" stop-color="#000" stop-opacity="0"/>
        <stop offset=".9" stop-color="#000" stop-opacity=".2"/>
        <stop offset="1" stop-color="#000" stop-opacity=".55"/>
      </linearGradient>
      <linearGradient id="bodyShade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#000" stop-opacity=".55"/>
        <stop offset=".18" stop-color="#000" stop-opacity=".05"/>
        <stop offset=".45" stop-color="#fff" stop-opacity=".07"/>
        <stop offset=".72" stop-color="#000" stop-opacity=".12"/>
        <stop offset="1" stop-color="#000" stop-opacity=".62"/>
      </linearGradient>
      <linearGradient id="steamGrad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#F2E8D8" stop-opacity=".55"/>
        <stop offset="1" stop-color="#F2E8D8" stop-opacity="0"/>
      </linearGradient>
      <filter id="foam" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="0.55"/>
      </filter>
      <filter id="blur12" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="12"/>
      </filter>
      <filter id="blur6" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="6"/>
      </filter>
      <filter id="blur3" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="3"/>
      </filter>
      <clipPath id="surfaceClip">
        <ellipse id="surface-clip" cx="240" cy="0" rx="109" ry="22"/>
      </clipPath>
      <clipPath id="cavity">
        <path d="M129 150 A${IN_RX} ${IN_RY} 0 0 1 351 150 L306 392 Q302 416 275 418 L205 418 Q178 416 174 392 Z"/>
      </clipPath>
    </defs>

    <!-- saucer -->
    <ellipse cx="240" cy="441" rx="170" ry="27" fill="url(#saucer)"/>
    <ellipse cx="240" cy="441" rx="170" ry="27" fill="none" stroke="url(#goldrim)" stroke-opacity=".16"/>
    <ellipse cx="240" cy="436" rx="118" ry="16" fill="none" stroke="#C9A227" stroke-opacity=".10"/>

    <!-- contact shadow -->
    <ellipse cx="240" cy="420" rx="96" ry="16" fill="#000" opacity=".8" filter="url(#blur12)"/>

    <!-- handle -->
    <path d="M350 200 C432 206 444 306 348 320" fill="none" stroke="url(#ceramicHandle)" stroke-width="19" stroke-linecap="round"/>
    <path d="M352 205 C420 212 430 300 352 313" fill="none" stroke="#F7E7BE" stroke-opacity=".10" stroke-width="3" stroke-linecap="round"/>

    <!-- body -->
    <path d="M120 150 L174 392 Q178 416 205 418 L275 418 Q302 416 306 392 L360 150 Z" fill="url(#ceramic)"/>
    <path d="M120 150 L174 392 Q178 416 205 418 L275 418 Q302 416 306 392 L360 150 Z" fill="url(#bodyShade)"/>

    <!-- interior + liquid -->
    <g clip-path="url(#cavity)">
      <rect x="110" y="120" width="260" height="310" fill="url(#innerDark)"/>

      <g id="liquid">
        <rect x="110" y="0" width="260" height="470" fill="url(#coffee)"/>
        <ellipse id="liq-surface" cx="240" cy="0" rx="109" ry="22" fill="url(#crema)"/>
        <ellipse id="liq-meniscus" cx="240" cy="0" rx="109" ry="22" fill="none" stroke="#2A1206" stroke-opacity=".55" stroke-width="2.4"/>
        <ellipse id="liq-sheen" cx="200" cy="-6" rx="34" ry="7" fill="#F7E7BE" opacity=".16" filter="url(#blur6)"/>
        <g clip-path="url(#surfaceClip)"><g id="art" opacity="0">${latteArt()}</g></g>
        <ellipse class="cup-ripple" cx="240" cy="0" rx="40" ry="8" fill="none" stroke="#F7E7BE" stroke-opacity=".3"/>
        <ellipse class="cup-ripple" cx="240" cy="0" rx="70" ry="13" fill="none" stroke="#F7E7BE" stroke-opacity=".16"/>
      </g>

      <rect x="110" y="120" width="260" height="310" fill="url(#innerShade)"/>
      <ellipse cx="240" cy="150" rx="104" ry="19" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="8" filter="url(#blur6)"/>
    </g>

    <!-- rim band: thickness + hides any overflow -->
    <path fill-rule="evenodd" fill="url(#ceramicRim)"
      d="M120 150 a${RIM_RX} ${RIM_RY} 0 1 0 240 0 a${RIM_RX} ${RIM_RY} 0 1 0 -240 0 Z
         M129 150 a${IN_RX} ${IN_RY} 0 1 1 222 0 a${IN_RX} ${IN_RY} 0 1 1 -222 0 Z"/>
    <ellipse cx="240" cy="150" rx="120" ry="26" fill="none" stroke="url(#goldrim)" stroke-width="1.6" stroke-opacity=".55"/>
    <ellipse cx="240" cy="150" rx="111" ry="22" fill="none" stroke="#000" stroke-width="1.4" stroke-opacity=".5"/>
    <path d="M138 140 A110 22 0 0 1 268 132" fill="none" stroke="#F7E7BE" stroke-opacity=".5" stroke-width="2.2" stroke-linecap="round" filter="url(#blur3)"/>

    <!-- glaze highlights -->
    <path class="cup-gloss" d="M148 178 C160 262 176 340 196 394" fill="none" stroke="#F7E7BE" stroke-opacity=".16" stroke-width="11" stroke-linecap="round" filter="url(#blur6)"/>
    <path class="cup-gloss" d="M334 184 C326 254 314 326 304 380" fill="none" stroke="#F7E7BE" stroke-opacity=".07" stroke-width="7" stroke-linecap="round" filter="url(#blur6)"/>
    <path d="M168 150 L214 412" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="10" filter="url(#blur6)"/>

    <!-- steam -->
    <g class="cup-steam" id="steam" opacity="0" fill="none" stroke="url(#steamGrad)" stroke-width="3" stroke-linecap="round">
      <path d="M206 116c-10-18 9-27 0-45s11-25 2-41"/>
      <path d="M240 108c-11-20 10-29 0-48s12-25 2-43"/>
      <path d="M274 116c-10-18 9-27 0-45s11-25 2-41"/>
    </g>
  </svg>`;

  const liquid = stage.querySelector('#liquid');
  const surf = stage.querySelector('#liq-surface');
  const meniscus = stage.querySelector('#liq-meniscus');
  const sheen = stage.querySelector('#liq-sheen');
  const ripples = stage.querySelectorAll('.cup-ripple');
  const art = stage.querySelector('#art');
  const artClip = stage.querySelector('#surface-clip');
  const steam = stage.querySelector('#steam');
  const pct = document.getElementById('cup-pct');
  const steps = Array.from(section.querySelectorAll('.pour__step'));

  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const smoothstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let target = 0, current = -1, running = false, lastStep = -1, lastPct = -1;

  function readScroll() {
    const r = section.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    target = clamp01(total > 0 ? -r.top / total : 0);
  }

  function paint(p) {
    section.style.setProperty('--p', p.toFixed(3));
    stage.style.setProperty('--p', p.toFixed(3));

    const S = EMPTY_Y - p * (EMPTY_Y - FULL_Y);
    const hw = halfWidthAt(S);

    liquid.setAttribute('transform', `translate(0 ${S.toFixed(2)})`);
    [surf, meniscus].forEach((el) => {
      el.setAttribute('rx', hw.toFixed(1));
      el.setAttribute('ry', (hw * 0.2).toFixed(1));
    });
    artClip.setAttribute('rx', hw.toFixed(1));
    artClip.setAttribute('ry', (hw * 0.2).toFixed(1));
    sheen.setAttribute('cx', (CX - hw * 0.34).toFixed(1));
    sheen.setAttribute('cy', (-hw * 0.055).toFixed(1));
    sheen.setAttribute('rx', (hw * 0.34).toFixed(1));
    sheen.setAttribute('ry', (hw * 0.075).toFixed(1));

    ripples.forEach((el, i) => {
      const k = 0.34 + i * 0.26;
      el.setAttribute('rx', (hw * k).toFixed(1));
      el.setAttribute('ry', (hw * k * 0.2).toFixed(1));
      el.setAttribute('opacity', ((1 - smoothstep(0.5, 0.9, p)) * 0.9).toFixed(2));
    });

    // latte art squashed into the crema plane, settling near the end
    const a = smoothstep(0.6, 0.92, p);
    art.setAttribute('opacity', a.toFixed(3));
    const s = (hw / HALF_TOP) * 1.34 * (0.86 + a * 0.14);
    art.setAttribute('transform',
      `translate(${CX} 0) scale(${s.toFixed(3)} ${(s * 0.31).toFixed(3)}) translate(${-CX} 0)`);

    steam.setAttribute('opacity', (smoothstep(0.22, 0.78, p) * 0.85).toFixed(2));

    const lift = -p * 7;
    stage.style.transform = `translate3d(0,${lift.toFixed(2)}px,0) scale(${(0.95 + p * 0.07).toFixed(4)})`;

    const step = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
    if (step !== lastStep) {
      lastStep = step;
      steps.forEach((el) => el.classList.toggle('is-active', +el.dataset.step === step));
    }

    const pv = Math.round(p * 100);
    if (pv !== lastPct) {
      lastPct = pv;
      if (pct) pct.textContent = window.Shama.util.fa(pv);
    }
    section.classList.toggle('is-full', p > 0.97);
  }

  function loop() {
    readScroll();
    current = current < 0 ? target : current + (target - current) * 0.12;
    paint(current);
    if (reduce) { running = false; return; }
    requestAnimationFrame(loop);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting && !running) { running = true; requestAnimationFrame(loop); }
      else if (!en.isIntersecting) running = false;
    });
  }, { threshold: 0 });
  io.observe(section);

  window.addEventListener('resize', readScroll, { passive: true });
  readScroll();
  paint(reduce ? 0.55 : 0);
  if (reduce) {
    current = 0.55;
    steps.forEach((el) => el.classList.toggle('is-active', +el.dataset.step === 1));
  }

  /* pointer tilt on the stage */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    const svg = stage.querySelector('svg');
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      svg.style.transform = `rotate(${(-dx * 2.6).toFixed(2)}deg) translateY(${(-dy * 6).toFixed(2)}px)`;
    });
    stage.addEventListener('pointerleave', () => { svg.style.transform = ''; });
  }
})();
