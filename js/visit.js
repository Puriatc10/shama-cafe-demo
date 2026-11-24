/* ============================================================
   SHAMA — visit block (address, hours, contact) + site footer
   Mount:  #mount-visit  →  <section.visit> + <footer.foot>
   ============================================================ */
(function () {
  'use strict';

  const S = window.Shama;
  if (!S) return;

  const mount = document.getElementById('mount-visit');
  if (!mount) return;

  const MAPS = 'https://www.google.com/maps?q=35.667442,51.489830';

  const DAYS = [
    { d: 6, label: 'شنبه' },
    { d: 0, label: 'یکشنبه' },
    { d: 1, label: 'دوشنبه' },
    { d: 2, label: 'سه‌شنبه' },
    { d: 3, label: 'چهارشنبه' },
    { d: 4, label: 'پنجشنبه' },
    { d: 5, label: 'جمعه' },
  ];

  const hourRows = DAYS.map(function (x) {
    return [
      '<div class="visit__hrow" data-day="' + x.d + '">',
      '  <dt>' + x.label + '</dt>',
      '  <dd class="num">۱۴:۰۰ – ۲۳:۴۵</dd>',
      '</div>',
    ].join('\n');
  }).join('\n');

  mount.innerHTML = [
    '<section class="section visit" id="visit" aria-labelledby="visit-title">',
    '  <div class="shell">',

    '    <header class="sec-head visit__head">',
    '      <p class="eyebrow">دیدار</p>',
    '      <h2 class="sec-title" id="visit-title">منتظرتان هستیم</h2>',
    '      <p class="sec-sub">جنب مترو بسیج، سمت پارک؛ هر روز از ۱۴:۰۰ تا ۲۳:۴۵. اگر تراس را می‌خواهید، میز را از قبل رزرو کنید.</p>',
    '    </header>',

    '    <div class="visit__grid">',

    /* ---------------------------------------------------- address */
    '      <div class="visit__col visit__col--where">',
    '        <h3 class="visit__label">آدرس</h3>',
    '        <p class="visit__addr">تهران، بزرگراه محلاتی، جنب مترو بسیج، سمت پارک بسیج</p>',
    '        <a class="btn btn--ghost btn--sm visit__route" href="' + MAPS + '" target="_blank" rel="noopener">',
    '          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11 21 3l-8 18-2-8-8-2Z"/></svg>',
    '          مسیریابی',
    '        </a>',

    '        <div class="visit__map" role="img" aria-label="نقشه‌ی شماتیک شاما؛ جنب پارک بسیج و مترو بسیج، روی بزرگراه محلاتی">',
    '          <svg viewBox="0 0 480 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">',
    '            <defs>',
    '              <linearGradient id="vm-gold" x1="60" y1="240" x2="420" y2="40" gradientUnits="userSpaceOnUse">',
    '                <stop stop-color="#8A6329"/><stop offset=".5" stop-color="#C9A227"/><stop offset="1" stop-color="#E7C873"/>',
    '              </linearGradient>',
    '              <pattern id="vm-grid" width="40" height="40" patternUnits="userSpaceOnUse">',
    '                <path d="M40 0H0V40" fill="none" stroke="#C9A227" stroke-opacity=".11" stroke-width="1"/>',
    '              </pattern>',
    '              <radialGradient id="vm-glow" cx="50%" cy="47%" r="52%">',
    '                <stop stop-color="#C9A227" stop-opacity=".18"/><stop offset="1" stop-color="#C9A227" stop-opacity="0"/>',
    '              </radialGradient>',
    '            </defs>',
    '            <rect width="480" height="300" fill="#0D0A07"/>',
    '            <rect width="480" height="300" fill="url(#vm-grid)"/>',
    '            <rect width="480" height="300" fill="url(#vm-glow)"/>',

    /* park block */
    '            <rect x="322" y="188" width="128" height="86" rx="10" fill="#C9A227" fill-opacity=".07" stroke="#C9A227" stroke-opacity=".22"/>',
    '            <text x="386" y="237" text-anchor="middle" class="visit__map-txt">پارک بسیج</text>',

    /* minor streets */
    '            <path d="M0 96H480M0 152H480M0 214H480M96 0V300M254 0V300M386 0V300" stroke="#C9A227" stroke-opacity=".16" stroke-width="1"/>',
    /* main avenue (بزرگراه محلاتی) */
    '            <path d="M-10 268 490 52" stroke="url(#vm-gold)" stroke-opacity=".55" stroke-width="6" stroke-linecap="round"/>',
    '            <path d="M-10 268 490 52" stroke="#0D0A07" stroke-opacity=".55" stroke-width="1.4" stroke-dasharray="14 12"/>',
    /* metro */
    '            <g>',
    '              <circle cx="254" cy="214" r="6.5" fill="#0D0A07" stroke="#DCCFBB" stroke-opacity=".55"/>',
    '              <circle cx="254" cy="214" r="2.4" fill="#DCCFBB" fill-opacity=".7"/>',
    '              <text x="254" y="240" text-anchor="middle" class="visit__map-txt">مترو بسیج</text>',
    '            </g>',
    '            <text x="92" y="76" text-anchor="middle" class="visit__map-txt visit__map-txt--road">بزرگراه محلاتی</text>',

    /* pin */
    '            <g transform="translate(240 166)">',
    '              <circle class="visit__ping" cy="-21.4" r="15" fill="none" stroke="#C9A227" stroke-width="1.2"/>',
    '              <circle class="visit__ping visit__ping--2" cy="-21.4" r="15" fill="none" stroke="#C9A227" stroke-width="1.2"/>',
    '              <path d="M0 0C-2.6-3.2-15-14.6-15-21.4a15 15 0 1 1 30 0C15-14.6 2.6-3.2 0 0Z" fill="url(#vm-gold)"/>',
    '              <circle cx="0" cy="-21.4" r="5.2" fill="#0A0806"/>',
    '            </g>',
    '          </svg>',
    '          <span class="visit__map-key"><span class="visit__map-key-dot" aria-hidden="true"></span>شاما</span>',
    '        </div>',
    '      </div>',

    /* ------------------------------------------------------ hours */
    '      <div class="visit__col visit__col--hours">',
    '        <h3 class="visit__label">ساعت کاری</h3>',
    '        <p class="visit__live" id="visit-live" data-state="open" aria-live="polite">',
    '          <span class="visit__live-dot" aria-hidden="true"></span>',
    '          <span class="visit__live-txt">امروز باز است</span>',
    '          <span class="visit__live-sub">تا ۲۳:۴۵ پذیرش داریم</span>',
    '        </p>',
    '        <dl class="visit__hours">',
    hourRows,
    '        </dl>',
    '        <p class="visit__note">آخر هفته‌ها تراس پر می‌شود؛ رزرو میز را به آخر شب نسپارید.</p>',
    '      </div>',

    /* ---------------------------------------------------- contact */
    '      <div class="visit__col visit__col--contact">',
    '        <h3 class="visit__label">تماس</h3>',
    '        <ul class="visit__links">',
    '          <li>',
    '            <a class="visit__link" href="tel:+982191005400">',
    '              <span class="visit__ico" aria-hidden="true">',
    '                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2Z"/></svg>',
    '              </span>',
    '              <span class="visit__link-body">',
    '                <span class="visit__link-k">تلفن رزرو</span>',
    '                <span class="visit__link-v num" dir="ltr">۰۲۱ ۹۱۰۰ ۵۴۰۰</span>',
    '              </span>',
    '            </a>',
    '          </li>',
    '          <li>',
    '            <a class="visit__link" href="https://www.instagram.com/shama.cafe" target="_blank" rel="noopener">',
    '              <span class="visit__ico" aria-hidden="true">',
    '                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>',
    '              </span>',
    '              <span class="visit__link-body">',
    '                <span class="visit__link-k">اینستاگرام</span>',
    '                <span class="visit__link-v latin" dir="ltr">@shama.cafe</span>',
    '              </span>',
    '            </a>',
    '          </li>',
    '          <li>',
    '            <a class="visit__link" href="https://wa.me/982191005400" target="_blank" rel="noopener">',
    '              <span class="visit__ico" aria-hidden="true">',
    '                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.5-4.6A8.4 8.4 0 1 1 20.5 11.6Z"/><path d="M8.8 8.2c.9 2.7 2.4 4.2 5.1 5.1l1-1.2 1.8.8v1.6c0 .5-.4.9-.9.9-3.9-.2-7.2-3.5-7.4-7.4 0-.5.4-.9.9-.9h1.5l.8 1.8-1 1Z"/></svg>',
    '              </span>',
    '              <span class="visit__link-body">',
    '                <span class="visit__link-k">واتس‌اپ</span>',
    '                <span class="visit__link-v">پیام بدهید</span>',
    '              </span>',
    '            </a>',
    '          </li>',
    '        </ul>',
    '        <a class="btn btn--gold visit__reserve" href="#reserve">رزرو میز</a>',
    '      </div>',

    '    </div>',
    '  </div>',
    '</section>',
  ].join('\n');

  /* ------------------------------------------------ live open state */
  const liveEl = mount.querySelector('#visit-live');
  const hoursEl = mount.querySelector('.visit__hours');

  function paintLive() {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const open = 14 * 60;
    const close = 23 * 60 + 45;
    const isOpen = mins >= open && mins < close;

    if (liveEl) {
      liveEl.dataset.state = isOpen ? 'open' : 'closed';
      const t = liveEl.querySelector('.visit__live-txt');
      const s = liveEl.querySelector('.visit__live-sub');
      if (isOpen) {
        t.textContent = 'امروز باز است';
        s.textContent = 'تا ۲۳:۴۵ پذیرش داریم';
      } else if (mins < open) {
        t.textContent = 'هنوز باز نشده';
        s.textContent = 'امروز از ۱۴:۰۰ باز می‌شویم';
      } else {
        t.textContent = 'الان بسته است';
        s.textContent = 'فردا از ۱۴:۰۰ باز می‌شویم';
      }
    }

    if (hoursEl) {
      const today = String(now.getDay());
      Array.prototype.forEach.call(hoursEl.children, function (row) {
        const on = row.dataset.day === today;
        row.classList.toggle('is-today', on);
        if (on) row.setAttribute('aria-current', 'true');
        else row.removeAttribute('aria-current');
      });
    }
  }
  paintLive();
  setInterval(paintLive, 60000);

  /* ============================================================
     FOOTER
     ============================================================ */
  if (document.getElementById('site-footer')) return;

  const footer = document.createElement('footer');
  footer.className = 'foot';
  footer.id = 'site-footer';

  footer.innerHTML = [
    '<div class="shell">',
    '  <div class="foot__main">',

    '    <div class="foot__brand">',
    '      <a class="foot__logo" href="#hero" aria-label="شاما — بازگشت به بالا">',
    '        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">',
    '          <defs>',
    '            <linearGradient id="fm-gold" x1="8" y1="6" x2="56" y2="60" gradientUnits="userSpaceOnUse">',
    '              <stop stop-color="#F7E7BE"/><stop offset=".5" stop-color="#C9A227"/><stop offset="1" stop-color="#8A6329"/>',
    '            </linearGradient>',
    '          </defs>',
    '          <circle cx="32" cy="32" r="30.5" stroke="url(#fm-gold)" stroke-opacity=".45"/>',
    '          <path d="M20 23.5h19.5c0 9.4-4.1 14.4-9.8 14.4S20 32.9 20 23.5Z" stroke="url(#fm-gold)" stroke-width="1.5"/>',
    '          <path d="M39.5 26h3.4a3.6 3.6 0 0 1 0 7.2h-2" stroke="url(#fm-gold)" stroke-width="1.5" stroke-linecap="round"/>',
    '          <path d="M24 44.5h12.5" stroke="url(#fm-gold)" stroke-width="1.5" stroke-linecap="round"/>',
    '          <path d="M26.5 20c-1.2-1.9 1.2-3 0-5M32 20c-1.2-1.9 1.2-3 0-5" stroke="url(#fm-gold)" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>',
    '        </svg>',
    '        <span class="foot__name">شاما</span>',
    '      </a>',
    '      <p class="foot__manifesto">قهوه‌ی تازه، آشپزخانه‌ی باز و شبی که عجله ندارد.</p>',
    '      <p class="foot__est latin" aria-hidden="true">EST. 2019 — TEHRAN</p>',
    '    </div>',

    '    <nav class="foot__col" aria-labelledby="foot-nav-title">',
    '      <h3 class="foot__col-title" id="foot-nav-title">دسترسی سریع</h3>',
    '      <ul class="foot__links">',
    '        <li><a href="#menu">منو</a></li>',
    '        <li><a href="#story">داستان ما</a></li>',
    '        <li><a href="#reserve">رزرو میز</a></li>',
    '        <li><a href="#club">باشگاه مشتریان</a></li>',
    '        <li><a href="#visit">تماس</a></li>',
    '      </ul>',
    '    </nav>',

    '    <div class="foot__col">',
    '      <h3 class="foot__col-title">ساعات</h3>',
    '      <p class="foot__hours num">هر روز ۱۴:۰۰ – ۲۳:۴۵</p>',
    '      <p class="foot__hours-note">بدون تعطیلی، حتی تعطیلات رسمی.</p>',
    '      <a class="foot__phone num" href="tel:+982191005400" dir="ltr">۰۲۱ ۹۱۰۰ ۵۴۰۰</a>',
    '    </div>',

    '    <div class="foot__col foot__col--news">',
    '      <h3 class="foot__col-title">خبرنامه</h3>',
    '      <p class="foot__news-note">ماهی یک ایمیل؛ تخفیف‌ها و شب‌های ویژه‌ی شاما.</p>',
    '      <form class="foot__news" id="foot-news" novalidate>',
    '        <label class="sr-only" for="foot-email">ایمیل شما</label>',
    '        <div class="foot__news-row">',
    '          <input class="input foot__news-input" id="foot-email" name="email" type="email" inputmode="email" dir="ltr" autocomplete="email" placeholder="you@example.com" aria-describedby="foot-news-msg">',
    '          <button class="btn btn--gold btn--sm foot__news-btn" type="submit">عضویت</button>',
    '        </div>',
    '        <p class="foot__news-msg" id="foot-news-msg" role="status" aria-live="polite"></p>',
    '      </form>',
    '    </div>',

    '  </div>',

    '  <div class="foot__bar">',
    '    <p class="foot__copy">© ۱۴۰۴ کافه رستوران شاما</p>',
    '    <p class="foot__made">طراحی و اجرا: <a href="https://eryndex.net" target="_blank" rel="noopener">Eryndex</a></p>',
    '    <nav class="foot__legal" aria-label="پیوندهای حقوقی">',
    '      <a href="#">قوانین</a>',
    '      <a href="#">حریم خصوصی</a>',
    '    </nav>',
    '  </div>',
    '</div>',

    '<div class="foot__wordmark" aria-hidden="true"><span class="latin">SHAMA</span></div>',
  ].join('\n');

  document.body.appendChild(footer);

  /* ------------------------------------------------- newsletter */
  const form = footer.querySelector('#foot-news');
  const input = footer.querySelector('#foot-email');
  const msg = footer.querySelector('#foot-news-msg');
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const value = (input.value || '').trim();

    if (!EMAIL.test(value)) {
      msg.dataset.state = 'err';
      msg.textContent = 'ایمیل را درست وارد کنید؛ مثلاً name@example.com';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      S.toast('ایمیل معتبر نیست');
      return;
    }

    input.removeAttribute('aria-invalid');
    msg.dataset.state = 'ok';
    msg.textContent = 'ثبت شد؛ اولین کد تخفیف به ایمیل شما می‌رسد.';
    S.toast('به خبرنامه‌ی شاما خوش آمدید');
    form.reset();
  });

  input.addEventListener('input', function () {
    if (input.getAttribute('aria-invalid') === 'true') {
      input.removeAttribute('aria-invalid');
      msg.dataset.state = '';
      msg.textContent = '';
    }
  });
})();
