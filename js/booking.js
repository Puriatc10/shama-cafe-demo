/* ============================================================
   SHAMA — رزرو میز (#reserve) + باشگاه مشتریان (#club)
   Renders both sections into #mount-reserve / #mount-club.
   ============================================================ */
(function () {
  'use strict';

  const S = window.Shama;
  if (!S) return;

  const { fmt, fa, Fa } = S.util;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad2 = (n) => String(n).padStart(2, '0');
  const isoOf = (d) => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());

  /* ------------------------------------------------------------ utils */
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function countTo(el, from, to, dur) {
    if (!el) return;
    if (reduce || from === to) { el.textContent = fmt(to); return; }
    if (el._raf) cancelAnimationFrame(el._raf);
    const t0 = performance.now();
    const total = dur || 640;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / total);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(from + (to - from) * e));
      if (p < 1) el._raf = requestAnimationFrame(step);
      else el._raf = 0;
    };
    el._raf = requestAnimationFrame(step);
  }

  const ICONS = {
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.2 2.5 4.8 13.4h6.1L11 21.5l8.2-11h-6.1l.1-8Z"/></svg>',
    card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10.4h18M6.6 6V4.5h10.8"/><path d="m8.6 15.2 6.8-4"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.6"/><path d="M12 7.6V12l3 1.9"/></svg>',
    table: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><circle cx="16" cy="14" r="6.2"/><path d="M16 20.2V27M11.4 27h9.2"/><path d="M5.6 21.6v-4.2a2 2 0 0 1 2-2M26.4 21.6v-4.2a2 2 0 0 0-2-2"/></svg>',
    parasol: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 14a11.5 11.5 0 0 1 23 0Z"/><path d="M16 14v10.4a2.6 2.6 0 0 0 2.6 2.6"/><path d="M4.5 14h23"/></svg>',
    sofa: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 18v-5.5A2.5 2.5 0 0 1 9.5 10h13a2.5 2.5 0 0 1 2.5 2.5V18"/><path d="M5 18.6h22v5.4H5z"/><path d="M8.5 24v3M23.5 24v3"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.4A2.4 2.4 0 0 1 5.9 6h10.6a2 2 0 0 1 2 2v1"/><rect x="3.5" y="9" width="17" height="10" rx="2.6"/><path d="M15.6 14h2.1"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3.2 2.7 5.7 6.2.9-4.5 4.4 1.1 6.2-5.5-3-5.5 3 1.1-6.2L3.1 9.8l6.2-.9Z"/></svg>',
    qr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="3.2" y="3.2" width="6.6" height="6.6" rx="1.2"/><rect x="14.2" y="3.2" width="6.6" height="6.6" rx="1.2"/><rect x="3.2" y="14.2" width="6.6" height="6.6" rx="1.2"/><path d="M14.2 14.2h3v3h-3zM20.2 14.2v2.2M14.2 20.2h2.4M20.2 19.4v1.4"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.6 8.4h16.8v4.2H3.6z"/><path d="M5.2 12.6V20h13.6v-7.4M12 8.4V20"/><path d="M12 8.4S10.4 4 8.3 4a2.2 2.2 0 0 0 0 4.4Z"/><path d="M12 8.4s1.6-4.4 3.7-4.4a2.2 2.2 0 0 1 0 4.4Z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11.5" height="11.5" rx="2.4"/><path d="M15 5.5H6.5a2 2 0 0 0-2 2V16"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="15" rx="2.4"/><path d="M3.5 10.2h17M8 3.5v4M16 3.5v4"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 5-7 7 7 7"/></svg>'
  };

  /* ------------------------------------------------ Persian calendar */
  const FA_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

  function dtf(opts) {
    try { return new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-arabext', opts); }
    catch (e) {
      try { return new Intl.DateTimeFormat('fa-IR', opts); } catch (e2) { return null; }
    }
  }
  const F_WD = dtf({ weekday: 'long' });
  const F_DAY = dtf({ day: 'numeric' });
  const F_MON = dtf({ month: 'long' });
  const F_YEAR = dtf({ year: 'numeric' });

  function dfmt(f, d, fallback) {
    try { return f ? f.format(d) : fallback; } catch (e) { return fallback; }
  }

  // composed manually: combined-field patterns can reorder / add Latin punctuation
  function faMonthYear(d) {
    return [dfmt(F_MON, d, ''), dfmt(F_YEAR, d, '')].filter(Boolean).join(' ');
  }
  function faDateFull(d) {
    return [dfmt(F_WD, d, ''), dfmt(F_DAY, d, ''), dfmt(F_MON, d, ''), dfmt(F_YEAR, d, '')]
      .filter(Boolean).join(' ');
  }

  const DAY_COUNT = 10;
  function buildDays() {
    const now = new Date();
    const skipToday = now.getHours() >= 22;
    const out = [];
    for (let i = 0; i < DAY_COUNT; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (skipToday ? 1 : 0) + i);
      out.push({
        d,
        iso: isoOf(d),
        wd: dfmt(F_WD, d, ''),
        day: dfmt(F_DAY, d, fa(d.getDate())),
        mon: dfmt(F_MON, d, FA_MONTHS[(d.getMonth() + 9) % 12])
      });
    }
    return out;
  }

  /* --------------------------------------------------------- slots */
  const SLOT_FROM = 14 * 60;
  const SLOT_TO = 23 * 60;

  function slotsFor(iso) {
    const now = new Date();
    const isToday = iso === isoOf(now);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const base = [];
    for (let m = SLOT_FROM; m <= SLOT_TO; m += 30) {
      const t = pad2(Math.floor(m / 60)) + ':' + pad2(m % 60);
      base.push({ m, time: t, past: isToday && m < nowMin + 20, h: hash(iso + '#' + t) });
    }
    const open = base.filter((s) => !s.past);
    const full = new Set();
    open.filter((s) => s.h % 13 === 0).slice(0, 2).forEach((s) => full.add(s.time));
    if (!full.size && open.length > 4) full.add(open[Math.floor(open.length / 2)].time);
    const lim = open.filter((s) => !full.has(s.time) && s.h % 5 === 0).slice(0, 3).map((s) => s.time);
    if (!lim.length) {
      const c = open.find((s) => !full.has(s.time));
      if (c) lim.push(c.time);
    }
    const limSet = new Set(lim);
    return base.map((s) => ({ time: s.time, past: s.past, full: full.has(s.time), limited: limSet.has(s.time) }));
  }

  /* ---------------------------------------------------- reserve state */
  const R = {
    days: [],
    state: { day: null, guests: 2, time: null, area: 'hall', family: false },
    busy: false,
    conf: null
  };

  const AREA_NAMES = { hall: 'سالن اصلی', terrace: 'تراس', corner: 'کنج دنج (گوشه)' };

  function guestLabel(g) {
    return g === '10+' ? 'بیشتر از ' + fa(10) + ' نفر' : fa(g) + ' نفر';
  }

  /* ============================================================
     A) RESERVE — markup
     ============================================================ */
  function reserveHTML() {
    const dateBtns = R.days.map((x, i) => `
          <button type="button" class="rs__date" data-iso="${x.iso}" aria-pressed="${i === 0}">
            <span class="rs__date-wd">${x.wd}</span>
            <span class="rs__date-day num">${x.day}</span>
            <span class="rs__date-mon">${x.mon}</span>
          </button>`).join('');

    let guestBtns = '';
    for (let i = 1; i <= 10; i++) {
      guestBtns += `<button type="button" class="rs__guest" data-guests="${i}" aria-pressed="${i === 2}">${fa(i)}</button>`;
    }
    guestBtns += '<button type="button" class="rs__guest rs__guest--wide" data-guests="10+" aria-pressed="false">بیشتر از ۱۰</button>';

    const areas = [
      { id: 'hall', name: 'سالن اصلی', sub: 'روشن و سرزنده', icon: ICONS.table },
      { id: 'terrace', name: 'تراس', sub: 'رو به پارک', icon: ICONS.parasol },
      { id: 'corner', name: 'کنج دنج', sub: 'گوشه و خلوت', icon: ICONS.sofa }
    ].map((a, i) => `
          <button type="button" class="rs__area" data-area="${a.id}" aria-pressed="${i === 0}">
            <span class="rs__area-ic">${a.icon}</span>
            <span class="rs__area-name">${a.name}</span>
            <span class="rs__area-sub">${a.sub}</span>
          </button>`).join('');

    return `
  <section class="section rs" id="reserve" aria-labelledby="rs-title">
    <div class="rs__glow" aria-hidden="true"></div>
    <div class="shell rs__grid">

      <div class="rs__copy">
        <p class="eyebrow reveal">رزرو میز</p>
        <h2 class="rs__title reveal" id="rs-title" style="--d:60ms">میزی برای شما،<br><span class="gold-text">آماده و منتظر</span></h2>
        <p class="rs__lead reveal" style="--d:120ms">
          شب‌های شاما زود پر می‌شود. تاریخ و ساعت را از پیش انتخاب کنید تا میزتان — در سالن اصلی،
          تراسِ رو به پارک یا کنجِ خلوت — همان‌طور که دوست دارید آماده باشد.
        </p>

        <ul class="rs__trust reveal" style="--d:180ms">
          <li>
            <span class="rs__trust-ic">${ICONS.bolt}</span>
            <span class="rs__trust-txt"><b>تایید فوری</b><span>رزرو همان لحظه ثبت و تایید می‌شود.</span></span>
          </li>
          <li>
            <span class="rs__trust-ic">${ICONS.card}</span>
            <span class="rs__trust-txt"><b>بدون پیش‌پرداخت</b><span>هیچ مبلغی برای رزرو میز دریافت نمی‌شود.</span></span>
          </li>
          <li>
            <span class="rs__trust-ic">${ICONS.clock}</span>
            <span class="rs__trust-txt"><b>نگه‌داشتن میز تا ۲۰ دقیقه</b><span>دیر رسیدید؟ یک تماس کافی است.</span></span>
          </li>
        </ul>

        <p class="rs__quiet reveal" style="--d:240ms">
          <span class="rs__pulse" aria-hidden="true"></span>
          <span class="rs__quiet-lbl">خلوت‌ترین ساعت‌ها</span>
          <b>۱۴:۰۰ تا ۱۷:۰۰</b><span class="rs__quiet-sep" aria-hidden="true">·</span><b>بعد از ۲۲:۰۰</b>
        </p>

        <figure class="rs__media reveal" style="--d:300ms">
          <div class="card-media">
            <img src="assets/img/menu/c5_0.webp" alt="لته‌ی دست‌ساز شاما با لته‌آرت" width="700" height="700" loading="lazy">
          </div>
          <figcaption>
            <span>لته‌آرت دستی · دانه‌ی تازه‌رست</span>
            <span class="latin">SHAMA CAFÉ</span>
          </figcaption>
        </figure>

        <div class="rs__call reveal" style="--d:340ms">
          <span class="rs__call-lbl">رزرو تلفنی</span>
          <a class="rs__call-num num" href="tel:+982191005400" dir="ltr">۰۲۱ ۹۱۰۰ ۵۴۰۰</a>
          <span class="rs__call-sub">هر روز ۱۴:۰۰ تا ۲۳:۴۵ · برای گروه‌های بیش از ۱۰ نفر</span>
        </div>
      </div>

      <div class="rs__side">
        <div class="rs__card reveal" id="rs-card" style="--d:120ms">
          <div class="rs__card-head">
            <span class="rs__card-kicker latin">RESERVATION</span>
            <span class="rs__badge"><span class="rs__badge-dot" aria-hidden="true"></span>تایید فوری</span>
          </div>

          <form class="rs__form" id="rs-form" novalidate>
            <div class="rs__block" role="group" aria-labelledby="rs-lab-date">
              <div class="rs__block-head">
                <span class="rs__label" id="rs-lab-date"><i aria-hidden="true">۰۱</i>تاریخ</span>
                <span class="rs__hint" id="rs-date-hint"></span>
              </div>
              <div class="rs__dates" id="rs-dates">${dateBtns}</div>
            </div>

            <div class="rs__block" role="group" aria-labelledby="rs-lab-party">
              <div class="rs__block-head">
                <span class="rs__label" id="rs-lab-party"><i aria-hidden="true">۰۲</i>تعداد نفرات</span>
                <span class="rs__hint" id="rs-party-hint">۲ نفر</span>
              </div>
              <div class="rs__guests" id="rs-party">${guestBtns}</div>
              <div class="rs__family">
                <label class="rs__switch">
                  <input type="checkbox" id="rs-family">
                  <span class="rs__switch-track" aria-hidden="true"><span></span></span>
                  <span class="rs__switch-txt">میز خانوادگی</span>
                </label>
                <p class="rs__family-note" id="rs-family-note" hidden>میز بزرگ ۶ تا ۱۰ نفره در بخش تراس؛ مناسب دورهمی خانوادگی.</p>
              </div>
            </div>

            <div class="rs__block" role="group" aria-labelledby="rs-lab-time">
              <div class="rs__block-head">
                <span class="rs__label" id="rs-lab-time"><i aria-hidden="true">۰۳</i>ساعت</span>
                <span class="rs__hint">هر ۳۰ دقیقه</span>
              </div>
              <div class="rs__slots" id="rs-slots"></div>
              <p class="rs__legend" aria-hidden="true">
                <span class="rs__legend-key rs__legend-key--lim"></span>ظرفیت محدود
                <span class="rs__legend-key rs__legend-key--full"></span>تکمیل
              </p>
            </div>

            <div class="rs__block" role="group" aria-labelledby="rs-lab-area">
              <div class="rs__block-head">
                <span class="rs__label" id="rs-lab-area"><i aria-hidden="true">۰۴</i>فضا</span>
              </div>
              <div class="rs__areas" id="rs-areas">${areas}</div>
            </div>

            <div class="rs__block" role="group" aria-labelledby="rs-lab-info">
              <div class="rs__block-head">
                <span class="rs__label" id="rs-lab-info"><i aria-hidden="true">۰۵</i>اطلاعات تماس</span>
              </div>
              <div class="rs__fields">
                <div class="rs__field">
                  <label for="rs-name">نام و نام خانوادگی</label>
                  <input class="input rs__input" id="rs-name" name="name" type="text" autocomplete="name" placeholder="مثلاً سارا محمدی" required>
                </div>
                <div class="rs__field">
                  <label for="rs-phone">شماره موبایل</label>
                  <input class="input rs__input rs__input--phone" id="rs-phone" name="phone" type="tel" inputmode="tel" dir="ltr" autocomplete="tel" placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹" required>
                </div>
                <div class="rs__field rs__field--full">
                  <label for="rs-note">یادداشت <span class="rs__opt">اختیاری</span></label>
                  <textarea class="textarea rs__textarea" id="rs-note" name="note" rows="2" placeholder="مثلاً کنار پنجره، جشن تولد، صندلی کودک…"></textarea>
                </div>
              </div>
              <p class="rs__err" id="rs-err" role="alert" aria-live="assertive"></p>
              <button class="btn btn--gold rs__submit" id="rs-submit" type="submit">
                <span class="rs__spinner" aria-hidden="true"></span>
                <span class="rs__submit-txt">ثبت رزرو</span>
                <span class="rs__submit-ic" aria-hidden="true">${ICONS.arrow}</span>
              </button>
              <p class="rs__fine">لغو رایگان تا ۲ ساعت قبل · بدون پیش‌پرداخت</p>
            </div>
          </form>

          <div class="rs__done" id="rs-done" hidden>
            <div class="rs__check" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="rs-check-grad" x1="10" y1="10" x2="38" y2="38">
                    <stop stop-color="#F7E7BE"/><stop offset=".55" stop-color="#C9A227"/><stop offset="1" stop-color="#8A6329"/>
                  </linearGradient>
                </defs>
                <path d="M14 25.4 20.8 32.2 34.4 16.8" stroke="url(#rs-check-grad)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="eyebrow rs__done-eyebrow">رزرو تایید شد</p>
            <h3 class="rs__done-title" id="rs-done-title" tabindex="-1">رزرو شما ثبت شد</h3>
            <p class="rs__done-code">کد رزرو <span class="latin num rs__code" id="rs-conf-code">—</span></p>

            <dl class="rs__summary">
              <div><dt>تاریخ</dt><dd id="rs-conf-date">—</dd></div>
              <div><dt>ساعت</dt><dd id="rs-conf-time">—</dd></div>
              <div><dt>نفرات</dt><dd id="rs-conf-guests">—</dd></div>
              <div><dt>فضا</dt><dd id="rs-conf-area">—</dd></div>
            </dl>

            <div class="rs__done-actions">
              <button class="btn btn--gold btn--sm" id="rs-ics" type="button">${ICONS.cal}<span>افزودن به تقویم</span></button>
              <button class="rs__again" id="rs-again" type="button">رزرو جدید</button>
            </div>
            <p class="rs__done-note">پیامک تایید به <span class="num" id="rs-conf-phone">—</span> ارسال شد.</p>
          </div>
        </div>

        <div class="rs__facts reveal" style="--d:200ms" aria-label="چرا شاما">
          <span class="rs__fact">قهوه‌ی تازه‌رست هفتگی</span>
          <span class="rs__fact">آشپزخانه‌ی باز</span>
          <span class="rs__fact">تراس رو به پارک</span>
        </div>
      </div>

    </div>
  </section>`;
  }

  /* ============================================================
     A) RESERVE — behaviour
     ============================================================ */
  function paintSlots(root) {
    const host = $('#rs-slots', root);
    if (!host || !R.state.day) return;
    const list = slotsFor(R.state.day.iso);
    const keep = R.state.time && list.some((s) => s.time === R.state.time && !s.full && !s.past);
    if (!keep) {
      const first = list.find((s) => !s.full && !s.past);
      R.state.time = first ? first.time : null;
    }
    host.innerHTML = list.map((s) => `
              <button type="button" class="rs__slot${s.full ? ' is-full' : ''}" data-time="${s.time}"
                aria-pressed="${s.time === R.state.time}" ${s.full || s.past ? 'disabled' : ''}
                ${s.past ? 'title="ساعت گذشته"' : ''}>
                <span class="rs__slot-time num">${fa(s.time)}</span>
                ${s.full ? '<span class="rs__slot-tag">تکمیل</span>' : s.limited ? '<span class="rs__slot-tag">ظرفیت محدود</span>' : ''}
              </button>`).join('');
  }

  function syncGuests(root) {
    const hint = $('#rs-party-hint', root);
    if (hint) hint.textContent = guestLabel(R.state.guests);
    $$('.rs__guest', root).forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.guests === String(R.state.guests)));
    });
  }

  function selectGuests(root, v) {
    R.state.guests = v;
    if (R.state.family && (v === '10+' || Number(v) < 6)) {
      R.state.family = false;
      const cb = $('#rs-family', root);
      if (cb) cb.checked = false;
      const note = $('#rs-family-note', root);
      if (note) note.hidden = true;
    }
    syncGuests(root);
    clearErr(root);
  }

  function selectDate(root, iso) {
    const day = R.days.find((d) => d.iso === iso);
    if (!day) return;
    R.state.day = day;
    $$('.rs__date', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.iso === iso)));
    const hint = $('#rs-date-hint', root);
    if (hint) hint.textContent = faMonthYear(day.d);
    paintSlots(root);
    const btn = $('.rs__date[data-iso="' + iso + '"]', root);
    if (btn && btn.scrollIntoView) {
      try { btn.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' }); } catch (e) {}
    }
    clearErr(root);
  }

  function clearErr(root) {
    const e = $('#rs-err', root);
    if (e) e.textContent = '';
    $$('.rs__input, .rs__textarea', root).forEach((el) => el.removeAttribute('aria-invalid'));
  }

  function fail(root, msg, field) {
    const e = $('#rs-err', root);
    if (e) e.textContent = msg;
    if (field) {
      field.setAttribute('aria-invalid', 'true');
      if (typeof field.focus === 'function') field.focus();
    }
  }

  function normalizePhone(raw) {
    let v = Fa.toEn(raw)
      .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
      .replace(/[\s\-().]/g, '');
    v = v.replace(/^\+98/, '0').replace(/^0098/, '0').replace(/^98(?=9)/, '0');
    return v;
  }

  function displayPhone(v) {
    return fa(v.replace(/^(0\d{3})(\d{3})(\d{4})$/, '$1 $2 $3'));
  }

  function confirmReservation(root, name, phone) {
    const st = R.state;
    const n = 1000 + (hash(st.day.iso + st.time + phone) % 9000);
    const codeRaw = 'RS-' + n;
    const code = 'RS-' + fa(n);

    R.conf = {
      name, phone, code, codeRaw,
      iso: st.day.iso, day: st.day, time: st.time,
      guests: st.guests, area: st.area, family: st.family,
      note: ($('#rs-note', root) || {}).value || ''
    };

    $('#rs-conf-code', root).textContent = code;
    $('#rs-conf-date', root).textContent = faDateFull(st.day.d);
    $('#rs-conf-time', root).textContent = fa(st.time);
    $('#rs-conf-guests', root).textContent = guestLabel(st.guests) + (st.family ? ' · میز خانوادگی' : '');
    $('#rs-conf-area', root).textContent = AREA_NAMES[st.area];
    $('#rs-conf-phone', root).textContent = displayPhone(phone);

    $('#rs-card', root).classList.add('is-done');
    $('#rs-form', root).hidden = true;
    const done = $('#rs-done', root);
    done.hidden = false;

    const btn = $('#rs-submit', root);
    btn.disabled = false;
    btn.classList.remove('is-busy');
    const txt = $('.rs__submit-txt', btn);
    if (txt) txt.textContent = 'ثبت رزرو';
    R.busy = false;

    const title = $('#rs-done-title', root);
    if (title && title.focus) title.focus({ preventScroll: true });
    try { done.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); } catch (e) {}
    S.toast('رزرو شما ثبت شد — ' + fa(st.time));
  }

  function resetReserve(root) {
    R.state.day = R.days[0];
    R.state.guests = 2;
    R.state.time = null;
    R.state.area = 'hall';
    R.state.family = false;
    R.busy = false;
    R.conf = null;

    const card = $('#rs-card', root);
    card.classList.remove('is-done');
    const done = $('#rs-done', root);
    done.hidden = true;

    const form = $('#rs-form', root);
    form.hidden = false;
    form.reset();

    const fnote = $('#rs-family-note', root);
    if (fnote) fnote.hidden = true;

    $$('.rs__guest', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.guests === '2')));
    $$('.rs__area', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.area === 'hall')));
    $$('.rs__date', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.iso === R.days[0].iso)));

    const hint = $('#rs-date-hint', root);
    if (hint) hint.textContent = faMonthYear(R.days[0].d);

    paintSlots(root);
    syncGuests(root);
    clearErr(root);

    const btn = $('#rs-submit', root);
    btn.disabled = false;
    btn.classList.remove('is-busy');
    const txt = $('.rs__submit-txt', btn);
    if (txt) txt.textContent = 'ثبت رزرو';

    const nameEl = $('#rs-name', root);
    if (nameEl) nameEl.focus({ preventScroll: true });
    try { card.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); } catch (e) {}
  }

  /* ------------------------------------------------------------- ICS */
  const ADDRESS = 'تهران، بزرگراه محلاتی، جنب مترو بسیج، سمت پارک بسیج، کافه رستوران شاما';

  function icsEscape(s) {
    return String(s)
      .replace(/\\/g, '\\\\')
      .replace(/\r?\n/g, '\\n')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,');
  }

  function foldLine(line) {
    if (typeof TextEncoder === 'undefined') return line;
    const enc = new TextEncoder();
    const chunks = [];
    let buf = '';
    for (const ch of String(line)) {
      if (enc.encode(buf + ch).length > 73) { chunks.push(buf); buf = ch; }
      else buf += ch;
    }
    chunks.push(buf);
    return chunks.join('\r\n ');
  }

  function buildICS(c) {
    const parts = c.iso.split('-');
    const y = +parts[0], mo = +parts[1], d = +parts[2];
    const hh = +c.time.slice(0, 2), mm = +c.time.slice(3, 5);
    const start = '' + y + pad2(mo) + pad2(d) + 'T' + pad2(hh) + pad2(mm) + '00';
    const endDate = new Date(y, mo - 1, d, hh, mm + 90);
    const end = '' + endDate.getFullYear() + pad2(endDate.getMonth() + 1) + pad2(endDate.getDate()) +
      'T' + pad2(endDate.getHours()) + pad2(endDate.getMinutes()) + '00';
    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const desc = [
      'کد رزرو: ' + c.codeRaw,
      'نام: ' + c.name,
      'نفرات: ' + (c.guests === '10+' ? 'بیشتر از ۱۰' : c.guests) + (c.family ? ' (میز خانوادگی)' : ''),
      'فضا: ' + AREA_NAMES[c.area],
      'ساعت: ' + c.time,
      c.note ? 'یادداشت: ' + c.note : ''
    ].filter(Boolean).join('\n');

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Shama Cafe//Reservation//FA',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + c.codeRaw + '-shama.cafe',
      'DTSTAMP:' + stamp,
      'DTSTART:' + start,
      'DTEND:' + end,
      'SUMMARY:' + icsEscape('رزرو میز در کافه رستوران شاما'),
      'LOCATION:' + icsEscape(ADDRESS),
      'DESCRIPTION:' + icsEscape(desc),
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT60M',
      'ACTION:DISPLAY',
      'DESCRIPTION:' + icsEscape('یادآوری رزرو شاما'),
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ];
    return lines.map(foldLine).join('\r\n') + '\r\n';
  }

  function downloadICS() {
    const c = R.conf;
    if (!c) return;
    try {
      const blob = new Blob([buildICS(c)], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shama-reservation-' + c.iso + '.ics';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      S.toast('فایل تقویم آماده شد');
    } catch (e) {
      S.toast('ساخت فایل تقویم ممکن نشد');
    }
  }

  function bindReserve(root) {
    const form = $('#rs-form', root);
    if (!form) return;

    const st = R.state;
    st.day = R.days[0];
    const hint = $('#rs-date-hint', root);
    if (hint) hint.textContent = faMonthYear(R.days[0].d);
    paintSlots(root);
    syncGuests(root);

    form.addEventListener('click', (e) => {
      const dateBtn = e.target.closest('.rs__date');
      if (dateBtn) { selectDate(root, dateBtn.dataset.iso); return; }

      const guestBtn = e.target.closest('.rs__guest');
      if (guestBtn) { selectGuests(root, guestBtn.dataset.guests); return; }

      const slotBtn = e.target.closest('.rs__slot');
      if (slotBtn && !slotBtn.disabled) {
        R.state.time = slotBtn.dataset.time;
        $$('.rs__slot', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.time === R.state.time)));
        clearErr(root);
        return;
      }

      const areaBtn = e.target.closest('.rs__area');
      if (areaBtn) {
        R.state.area = areaBtn.dataset.area;
        $$('.rs__area', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.area === R.state.area)));
        clearErr(root);
      }
    });

    const family = $('#rs-family', root);
    if (family) {
      family.addEventListener('change', () => {
        R.state.family = family.checked;
        const note = $('#rs-family-note', root);
        if (note) note.hidden = !family.checked;
        if (family.checked && (R.state.guests === '10+' || Number(R.state.guests) < 6)) selectGuests(root, 6);
      });
    }

    form.addEventListener('input', (e) => {
      if (e.target && e.target.removeAttribute) e.target.removeAttribute('aria-invalid');
      const err = $('#rs-err', root);
      if (err && err.textContent) err.textContent = '';
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (R.busy) return;
      clearErr(root);

      const nameEl = $('#rs-name', root);
      const phoneEl = $('#rs-phone', root);
      const name = (nameEl.value || '').trim().replace(/\s+/g, ' ');

      if (name.length < 2) return fail(root, 'لطفاً نام خود را کامل وارد کنید.', nameEl);
      if (!/[\u0600-\u06FF]/.test(name)) return fail(root, 'نام را با حروف فارسی وارد کنید.', nameEl);

      const phone = normalizePhone(phoneEl.value || '');
      if (!/^09\d{9}$/.test(phone)) {
        return fail(root, 'شماره موبایل معتبر نیست؛ نمونه: ۰۹۱۲ ۳۴۵ ۶۷۸۹.', phoneEl);
      }

      if (!R.state.time) {
        S.toast('یک ساعت برای رزرو انتخاب کنید');
        return;
      }

      R.busy = true;
      const btn = $('#rs-submit', root);
      btn.disabled = true;
      btn.classList.add('is-busy');
      const txt = $('.rs__submit-txt', btn);
      if (txt) txt.textContent = 'در حال ثبت رزرو…';

      setTimeout(() => confirmReservation(root, name, phone), 900);
    });

    const ics = $('#rs-ics', root);
    if (ics) ics.addEventListener('click', downloadICS);

    const again = $('#rs-again', root);
    if (again) again.addEventListener('click', () => resetReserve(root));
  }

  /* ============================================================
     B) CLUB — data
     ============================================================ */
  const W_TIERS = [
    { name: 'برنزی', min: 0 },
    { name: 'نقره‌ای', min: 150000 },
    { name: 'طلایی', min: 500000 }
  ];
  const LEVELS = [
    { name: 'برنزی', min: 0 },
    { name: 'نقره‌ای', min: 1000 },
    { name: 'طلایی', min: 2000 },
    { name: 'الماسی', min: 3500 }
  ];
  const REWARDS = [
    { id: 'coffee', name: 'قهوه رایگان', cost: 800 },
    { id: 'dessert', name: 'دسر', cost: 1200 },
    { id: 'off15', name: '۱۵٪ تخفیف', cost: 1500 }
  ];
  const REF_CODE_RAW = 'SHAMA-' + 4821;

  const C = { wallet: 0, points: 0, spent: 0, claimed: new Set() };

  function walletValue() {
    const st = S.basket.state();
    return Number.isFinite(st.wallet) ? st.wallet : 240000;
  }
  function pointsValue() {
    const st = S.basket.state();
    return Number.isFinite(st.points) ? st.points : 1240;
  }

  /* ------------------------------------------------------------ QR art */
  function qrSVG(seed) {
    const N = 21;
    const isFinder = (x, y) => (x < 7 && y < 7) || (x > N - 8 && y < 7) || (x < 7 && y > N - 8);
    const inLogo = (x, y) => x >= 7 && x <= 13 && y >= 7 && y <= 13;
    let mods = '';
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (isFinder(x, y) || inLogo(x, y)) continue;
        const on = (x === 6 || y === 6)
          ? ((x + y) % 2 === 0)
          : (hash(seed + ':' + x + ':' + y) % 100) < 47;
        if (on) mods += '<rect class="club__qr-mod" x="' + x + '" y="' + y + '" width="1" height="1" rx=".18"/>';
      }
    }
    const finder = (fx, fy) =>
      '<rect class="club__qr-find" x="' + fx + '" y="' + fy + '" width="7" height="7" rx="1.7"/>' +
      '<rect class="club__qr-hole" x="' + (fx + 1) + '" y="' + (fy + 1) + '" width="5" height="5" rx="1.1"/>' +
      '<rect class="club__qr-find" x="' + (fx + 2) + '" y="' + (fy + 2) + '" width="3" height="3" rx=".7"/>';

    return `<svg class="club__qr-svg" viewBox="0 0 21 21" role="img" aria-label="کد QR نمونه‌ی منوی سر میز شاما">
              <defs>
                <linearGradient id="club-qr-gold" x1="0" y1="0" x2="21" y2="21">
                  <stop stop-color="#F7E7BE"/><stop offset=".52" stop-color="#C9A227"/><stop offset="1" stop-color="#8A6329"/>
                </linearGradient>
              </defs>
              <g>${mods}</g>
              <g>${finder(0, 0)}${finder(14, 0)}${finder(0, 14)}</g>
              <circle cx="10.5" cy="10.5" r="3.6" fill="#0C0906" stroke="url(#club-qr-gold)" stroke-width=".4"/>
              <g fill="none" stroke="url(#club-qr-gold)" stroke-width=".48" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9.2 9.1h2.6c0 1.55-.58 2.35-1.3 2.35s-1.3-.8-1.3-2.35Z"/>
                <path d="M11.8 9.6h.45a.58.58 0 0 1 0 1.16h-.45"/>
                <path d="M9.55 12.2h2"/>
              </g>
            </svg>`;
  }

  /* ============================================================
     B) CLUB — markup
     ============================================================ */
  function clubHTML() {
    const w0 = walletValue();
    const p0 = pointsValue();
    const table = 7;
    const refCode = 'SHAMA-' + fa(4821);

    const rewards = REWARDS.map((r) => `
              <li>
                <button type="button" class="club__reward" data-id="${r.id}" data-cost="${r.cost}">
                  <span class="club__reward-name">${r.name}</span>
                  <span class="club__reward-cost num">${fa(r.cost)} امتیاز</span>
                </button>
              </li>`).join('');

    return `
  <section class="section club" id="club" aria-labelledby="club-title">
    <div class="club__glow" aria-hidden="true"></div>
    <div class="shell">

      <div class="club__lead">
        <div>
          <p class="eyebrow reveal">باشگاه مشتریان شاما</p>
          <h2 class="sec-title reveal" id="club-title" style="--d:60ms">هر فنجان، <span class="gold-text">یک قدم نزدیک‌تر</span></h2>
          <p class="lead club__lead-copy reveal" style="--d:120ms">
            کیف پول، امتیاز، منوی سر میز و معرفی دوستان — همه در یک حساب.
            عضویت رایگان است و از اولین سفارش شروع می‌شود.
          </p>
        </div>
        <div class="club__stats reveal" style="--d:180ms" aria-label="آمار باشگاه">
          <div class="club__stat"><b class="num">${fmt(4200)}</b><span>عضو فعال</span></div>
          <div class="club__stat"><b class="num">${fmt(1)}</b><span>امتیاز به ازای هر ۱۰٬۰۰۰ تومان</span></div>
          <div class="club__stat"><b class="num">${fa(15)}٪</b><span>سقف پاداش سفارش</span></div>
        </div>
      </div>

      <div class="club__bento">

        <article class="club__panel club__panel--wallet reveal">
          <span class="club__idx" aria-hidden="true">۰۱</span>
          <div class="club__head">
            <span class="club__icon">${ICONS.wallet}</span>
            <div>
              <h3 class="club__title">کیف پول شاما</h3>
              <p class="club__kicker">شارژ کن، بی‌دغدغه سفارش بده</p>
            </div>
          </div>
          <p class="club__sub">موجودی کیف پول همان لحظه در سفارش آنلاین خرج می‌شود؛ بدون کارمزد و بدون تاریخ انقضا.</p>

          <div class="club__wallet-top">
            <div class="club__balance">
              <span class="club__balance-num num" id="club-wallet">${fmt(w0)}</span>
              <small>تومان</small>
            </div>
            <span class="club__tier" id="club-wallet-tier">—</span>
          </div>

          <div class="club__meter" id="club-wallet-meter" role="progressbar" aria-label="پیشرفت کیف پول" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <span class="club__meter-fill" id="club-wallet-fill"></span>
          </div>
          <p class="club__hint" id="club-wallet-note">—</p>

          <div class="club__topups" id="club-topups" role="group" aria-label="شارژ کیف پول">
            <span class="club__topup-lbl">شارژ سریع</span>
            <button type="button" class="club__topup" data-amount="100000" aria-label="شارژ ۱۰۰ هزار تومان">+۱۰۰ هزار</button>
            <button type="button" class="club__topup" data-amount="200000" aria-label="شارژ ۲۰۰ هزار تومان">+۲۰۰ هزار</button>
            <button type="button" class="club__topup" data-amount="500000" aria-label="شارژ ۵۰۰ هزار تومان">+۵۰۰ هزار</button>
          </div>
        </article>

        <article class="club__panel club__panel--points reveal" style="--d:80ms">
          <span class="club__idx" aria-hidden="true">۰۲</span>
          <div class="club__head">
            <span class="club__icon">${ICONS.star}</span>
            <div>
              <h3 class="club__title">امتیاز و سطح</h3>
              <p class="club__kicker">هر خرید، امتیاز می‌سازد</p>
            </div>
          </div>
          <p class="club__sub">با هر ۱۰٬۰۰۰ تومان خرید، یک امتیاز. امتیازها را همین‌جا به جایزه تبدیل کنید.</p>

          <div class="club__points-row">
            <div class="club__balance">
              <span class="club__balance-num num" id="club-points">${fmt(p0)}</span>
              <small>امتیاز</small>
            </div>
            <span class="club__level" id="club-level">—</span>
          </div>

          <div class="club__meter" id="club-points-meter" role="progressbar" aria-label="پیشرفت امتیاز" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <span class="club__meter-fill" id="club-points-fill"></span>
          </div>
          <p class="club__hint" id="club-points-note">—</p>

          <ul class="club__rewards" id="club-rewards" aria-label="جایزه‌های قابل دریافت">${rewards}
          </ul>
        </article>

        <article class="club__panel club__panel--qr reveal" style="--d:120ms">
          <span class="club__idx" aria-hidden="true">۰۳</span>
          <div class="club__head">
            <span class="club__icon">${ICONS.qr}</span>
            <div>
              <h3 class="club__title">منوی QR سر میز</h3>
              <p class="club__kicker">سفارش بدون تماس</p>
            </div>
          </div>

          <div class="club__qr-wrap">
            <div class="club__qr-frame">
              ${qrSVG('SHAMA-TABLE-' + table)}
              <span class="club__qr-scan" aria-hidden="true"></span>
            </div>
            <div class="club__qr-info">
              <p class="club__table">میز شماره <b class="num" id="club-table">${fa(table)}</b></p>
              <p class="club__sub">اسکن کنید و بدون تماس سفارش دهید؛ سفارش مستقیم به آشپزخانه می‌رود.</p>
              <a class="btn btn--ghost btn--sm club__qr-cta" href="#menu"><span>پیش‌نمایش منو</span>${ICONS.arrow}</a>
            </div>
          </div>
        </article>

        <article class="club__panel club__panel--ref reveal" style="--d:160ms">
          <span class="club__idx" aria-hidden="true">۰۴</span>
          <div class="club__head">
            <span class="club__icon">${ICONS.gift}</span>
            <div>
              <h3 class="club__title">معرفی دوستان</h3>
              <p class="club__kicker">با هم بیشتر کیف می‌کند</p>
            </div>
          </div>
          <p class="club__sub">کد اختصاصی‌ات را برای دوستانت بفرست؛ آن‌ها با تخفیف شروع می‌کنند و تو امتیاز می‌گیری.</p>

          <div class="club__ref">
            <span class="club__ref-code latin" id="club-ref-code" dir="ltr">${refCode}</span>
            <button type="button" class="club__copy" id="club-copy" aria-label="کپی کد معرفی">
              ${ICONS.copy}<span>کپی</span>
            </button>
          </div>

          <ul class="club__perks">
            <li>دوست شما ۱۰٪ تخفیف اولین سفارش</li>
            <li>شما ۵٬۰۰۰ امتیاز پس از اولین سفارش دوستتان</li>
          </ul>
        </article>

      </div>
    </div>
  </section>`;
  }

  /* ============================================================
     B) CLUB — behaviour
     ============================================================ */
  function paintWallet(root, from) {
    const v = C.wallet;
    countTo($('#club-wallet', root), from == null ? v : from, v);

    let idx = 0;
    W_TIERS.forEach((t, i) => { if (v >= t.min) idx = i; });
    const cur = W_TIERS[idx];
    const next = W_TIERS[idx + 1] || null;
    const pct = next ? Math.max(0, Math.min(100, ((v - cur.min) / (next.min - cur.min)) * 100)) : 100;

    const fill = $('#club-wallet-fill', root);
    if (fill) fill.style.transform = 'scaleX(' + (pct / 100) + ')';
    const meter = $('#club-wallet-meter', root);
    if (meter) meter.setAttribute('aria-valuenow', String(Math.round(pct)));
    const tier = $('#club-wallet-tier', root);
    if (tier) tier.textContent = 'سطح ' + cur.name;

    const note = $('#club-wallet-note', root);
    if (note) {
      note.textContent = next
        ? fmt(next.min - v) + ' تومان تا سطح ' + next.name
        : 'در بالاترین سطح کیف پول هستید — ' + cur.name;
    }
  }

  function paintPoints(root, from) {
    const p = C.points;
    const earned = p + C.spent; // level follows earned points, so spending never demotes
    countTo($('#club-points', root), from == null ? p : from, p);

    let idx = 0;
    LEVELS.forEach((l, i) => { if (earned >= l.min) idx = i; });
    const cur = LEVELS[idx];
    const next = LEVELS[idx + 1] || null;
    const pct = next ? Math.max(0, Math.min(100, ((earned - cur.min) / (next.min - cur.min)) * 100)) : 100;

    const fill = $('#club-points-fill', root);
    if (fill) fill.style.transform = 'scaleX(' + (pct / 100) + ')';
    const meter = $('#club-points-meter', root);
    if (meter) meter.setAttribute('aria-valuenow', String(Math.round(pct)));

    const level = $('#club-level', root);
    if (level) level.textContent = 'سطح ' + cur.name;

    const note = $('#club-points-note', root);
    if (note) {
      note.textContent = next
        ? fmt(earned) + ' امتیاز کسب‌شده · ' + fmt(next.min - earned) + ' امتیاز تا ' + next.name
        : 'به بالاترین سطح رسیده‌اید — ' + cur.name;
    }

    $$('.club__reward', root).forEach((btn) => {
      if (btn.classList.contains('is-claimed')) return;
      btn.classList.toggle('is-locked', p < Number(btn.dataset.cost));
    });
  }

  function topUp(root, amount) {
    if (!amount) return;
    const from = C.wallet;
    C.wallet = from + amount;
    S.basket.state().wallet = C.wallet;
    S.emit('wallet');
    paintWallet(root, from);
    S.toast(fmt(amount) + ' تومان به کیف پول اضافه شد');
  }

  function redeem(root, btn) {
    const cost = Number(btn.dataset.cost);
    if (C.points < cost) {
      const panel = btn.closest('.club__panel');
      if (panel) {
        panel.classList.remove('is-shake');
        void panel.offsetWidth;
        panel.classList.add('is-shake');
        setTimeout(() => panel.classList.remove('is-shake'), 560);
      }
      S.toast('امتیاز کافی نیست');
      return;
    }
    const from = C.points;
    C.points = from - cost;
    C.spent += cost;
    S.basket.state().points = C.points;
    S.emit('points');

    paintPoints(root, from);

    C.claimed.add(btn.dataset.id);
    btn.classList.add('is-claimed');
    btn.classList.remove('is-locked');
    btn.disabled = true;
    const tag = $('.club__reward-cost', btn);
    if (tag) tag.textContent = 'دریافت شد';
    S.toast('جایزه فعال شد — در سفارش بعدی اعمال می‌شود');
  }

  function legacyCopy(text) {
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-1000px;left:0;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, text.length);
        const ok = document.execCommand('copy');
        ta.remove();
        ok ? resolve() : reject(new Error('execCommand failed'));
      } catch (e) { reject(e); }
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
    }
    return legacyCopy(text);
  }

  function selectContents(el) {
    try {
      const r = document.createRange();
      r.selectNodeContents(el);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
    } catch (e) { /* ignore */ }
  }

  function bindClub(root) {
    C.wallet = walletValue();
    C.points = pointsValue();
    paintWallet(root);
    paintPoints(root);

    const topups = $('#club-topups', root);
    if (topups) {
      topups.addEventListener('click', (e) => {
        const b = e.target.closest('.club__topup');
        if (b) topUp(root, Number(b.dataset.amount));
      });
    }

    const rewards = $('#club-rewards', root);
    if (rewards) {
      rewards.addEventListener('click', (e) => {
        const b = e.target.closest('.club__reward');
        if (b && !b.disabled) redeem(root, b);
      });
    }

    const copy = $('#club-copy', root);
    if (copy) {
      copy.addEventListener('click', () => {
        const codeEl = $('#club-ref-code', root);
        const text = (codeEl ? codeEl.textContent : REF_CODE_RAW).trim();
        const label = $('span', copy);
        copyText(text).then(() => {
          copy.classList.add('is-ok');
          if (label) label.textContent = 'کپی شد';
          S.toast('کد معرفی کپی شد');
          setTimeout(() => {
            copy.classList.remove('is-ok');
            if (label) label.textContent = 'کپی';
          }, 1800);
        }).catch(() => {
          if (codeEl) selectContents(codeEl);
          S.toast('کپی خودکار ممکن نشد — کد انتخاب شد');
        });
      });
    }
  }

  /* ============================================================
     init
     ============================================================ */
  function init() {
    R.days = buildDays();

    const rm = document.getElementById('mount-reserve');
    if (rm) {
      rm.innerHTML = reserveHTML();
      bindReserve(rm);
      if (S.observeReveals) S.observeReveals(rm);
    }

    const cm = document.getElementById('mount-club');
    if (cm) {
      cm.innerHTML = clubHTML();
      bindClub(cm);
      if (S.observeReveals) S.observeReveals(cm);
    }

    // keep club balances in sync after a cart order changes wallet/points
    S.on((reason) => {
      if (reason !== 'order' && reason !== 'reset') return;
      const root = document.getElementById('club');
      if (!root) return;
      C.wallet = walletValue();
      C.points = pointsValue();
      paintWallet(root);
      paintPoints(root);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
