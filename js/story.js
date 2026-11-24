/* ============================================================
   SHAMA — narrative + gallery
   Mounts: #mount-story (story, values marquee, stats)
           #mount-gallery (editorial photo mosaic)
   ============================================================ */
(function () {
  'use strict';

  const S = window.Shama;
  if (!S) return;
  const U = S.util;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================================================== STORY */
  const storyMount = document.getElementById('mount-story');
  if (storyMount) {
    storyMount.innerHTML = [
      '<section class="section story" id="story" aria-labelledby="story-title">',
      '  <span class="story__glow" aria-hidden="true"></span>',
      '  <div class="shell story__shell">',

      '    <header class="story__head">',
      '      <p class="eyebrow">داستان شاما</p>',
      '      <h2 class="story__title" id="story-title">',
      '        یک کافه، برای شب‌هایی که',
      '        <span class="story__title-em gold-text">دیر تمام می‌شوند</span>',
      '      </h2>',
      '    </header>',

      '    <div class="story__body">',
      '      <div class="story__copy">',
      '        <p class="story__lead reveal"><span class="story__lead-cap">شاما</span> از یک ایده‌ی ساده شروع شد: جایی در تهران که شب دیر تمام شود و کسی عجله نداشته باشد.</p>',
      '        <div class="story__cols">',
      '          <p class="reveal" style="--d:80ms">سال ۱۳۹۸، جنب پارک بسیج، تنور روشن شد و اولین پیتزا روی سنگ نشست. از همان روز خمیر را هر روز صبح می‌بندیم، نه بیشتر و نه کمتر؛ و تا آخر شب که چراغ‌ها خاموش می‌شوند، چیزی از تازگی‌اش کم نمی‌شود.</p>',
      '          <p class="reveal" style="--d:160ms">حالا هفت سال است که چراغ‌ها تا نزدیک نیمه‌شب روشن می‌مانند: قهوه‌ی تازه‌رست، موزارلای واقعی، دسرهای خانگی و موسیقی زنده‌ای که هیچ‌وقت بلندتر از گفت‌وگوی سر میز نیست. شاما برای همان شب‌هایی ساخته شده که دلتان نمی‌خواهد زود تمام شوند.</p>',
      '        </div>',
      '        <p class="story__sign" aria-hidden="true">— تیم شاما</p>',
      '      </div>',

      '      <figure class="story__visual reveal reveal--left" style="--d:120ms">',
      '        <span class="story__est latin" aria-hidden="true">EST. 2019</span>',
      '        <div class="story__arch">',
      '          <div class="story__media card-media">',
      '            <img src="assets/img/menu/c5_0.webp" alt="کاپوچینو عسل و سینامون شاما با لته‌آرت دستی در فنجان سرامیکی" width="641" height="641" loading="lazy">',
      '          </div>',
      '          <span class="story__outline" aria-hidden="true"></span>',
      '        </div>',
      '        <figcaption class="story__cap">',
      '          <span class="story__cap-dot" aria-hidden="true"></span>',
      '          <span class="story__cap-title">لته‌آرت دستی</span>',
      '          <span class="story__cap-sub">هر فنجان یک امضا</span>',
      '        </figcaption>',
      '      </figure>',
      '    </div>',

      '    <dl class="story__stats reveal" aria-label="شاما در یک نگاه">',
      '      <div class="story__stat">',
      '        <dt class="story__stat-k">ساعتِ باز</dt>',
      '        <dd class="story__stat-v num"><span>۱۴:۰۰</span><i class="story__stat-dash" aria-hidden="true">–</i><span>۲۳:۴۵</span></dd>',
      '      </div>',
      '      <div class="story__stat">',
      '        <dt class="story__stat-k">آیتم منو</dt>',
      '        <dd class="story__stat-v"><span data-count="71">۰</span></dd>',
      '      </div>',
      '      <div class="story__stat">',
      '        <dt class="story__stat-k">امتیاز مهمانان</dt>',
      '        <dd class="story__stat-v"><span data-count="4.8" data-dec="1">۰</span><span class="story__stat-den gold-text">/۵</span></dd>',
      '      </div>',
      '      <div class="story__stat">',
      '        <dt class="story__stat-k">از سال</dt>',
      '        <dd class="story__stat-v"><span data-count="1398" data-from="1386">۰</span></dd>',
      '      </div>',
      '    </dl>',

      '    <div class="story__marquee">',
      '      <div class="story__track">',
      '        <ul class="story__vals" aria-label="ارزش‌های شاما">',
      '          <li>خمیر تازه</li><li>قهوه تازه‌رست</li><li>پنیر موزارلا</li>',
      '          <li>دسر خانگی</li><li>موسیقی زنده</li><li>تراس روباز</li>',
      '        </ul>',
      '        <ul class="story__vals" aria-hidden="true">',
      '          <li>خمیر تازه</li><li>قهوه تازه‌رست</li><li>پنیر موزارلا</li>',
      '          <li>دسر خانگی</li><li>موسیقی زنده</li><li>تراس روباز</li>',
      '        </ul>',
      '      </div>',
      '    </div>',

      '  </div>',
      '</section>',
    ].join('\n');

    /* ---------------------------------------------- count-up */
    const faNum = (v, dec) => {
      const s = dec ? v.toFixed(dec) : String(Math.round(v));
      return U.fa(s).replace('.', '٫');
    };

    function countUp(el) {
      const to = parseFloat(el.dataset.count);
      if (!isFinite(to)) return;
      const from = parseFloat(el.dataset.from || 0);
      const dec = +(el.dataset.dec || 0);
      if (reduce) { el.textContent = faNum(to, dec); return; }

      const dur = 1500;
      const t0 = performance.now();
      function step(t) {
        const p = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = faNum(from + (to - from) * e, dec);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = faNum(to, dec);
      }
      requestAnimationFrame(step);
    }

    const stats = storyMount.querySelector('.story__stats');
    if (stats && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          storyMount.querySelectorAll('[data-count]').forEach(countUp);
          obs.disconnect();
        });
      }, { threshold: 0.35 });
      io.observe(stats);
    } else {
      storyMount.querySelectorAll('[data-count]').forEach(countUp);
    }
  }

  /* =============================================== GALLERY */
  const galMount = document.getElementById('mount-gallery');
  if (galMount) {
    const TILES = [
      {
        k: 'p', img: 'c0_7', name: 'پیتزا مارگاریتا ایتالیایی', cat: 'پیتزا ایتالیایی',
        alt: 'پیتزا مارگاریتا با پنیر موزارلا، گوجه گیلاسی و ریحان تازه روی تخته چوبی',
        note: 'تازه از تنور',
      },
      {
        k: 'b', img: 'c1_5', name: 'چیز برگر کلاسیک شاما', cat: 'برگر',
        alt: 'چیز برگر دست‌ساز شاما با پنیر گودا، قارچ کاراملی و سیب‌زمینی کریسپی',
      },
      {
        k: 'd', img: 'c6_11', name: 'هات چاکلت', cat: 'نوشیدنی گرم',
        alt: 'فنجان هات چاکلت با خامه و خلال شکلات روی سینی چوبی',
      },
      {
        k: 'l', img: 'c5_3', name: 'لته', cat: 'قهوه',
        alt: 'فنجان لته با طرح لته‌آرت روی زیرفنجانی چوبی',
      },
      {
        k: 'm', img: 'c7_7', name: 'دلبر شیراز', cat: 'موکتل',
        alt: 'موکتل دلبر شیراز با لایه‌های یخی، نعنا و توت‌فرنگی در لیوان بلند',
        note: 'پرفروشِ شب',
      },
      {
        k: 's', img: 'c9_0', name: 'شیک اسنیکرز', cat: 'شیک',
        alt: 'شیک شکلاتی با خامه‌ی فرم‌گرفته و ویفر در لیوان پایه‌دار',
      },
      {
        k: 'k', img: 'c3_0', name: 'پاستا پستو', cat: 'پاستا',
        alt: 'پنه پستو با سینه‌ی مرغ گریل‌شده و پنیر پارمسان در بشقاب تیره',
      },
      {
        k: 'n', img: 'c2_2', name: 'ساندویچ مگا', cat: 'ساندویچ',
        alt: 'ساندویچ باگت مگا با ژامبون، پنیر موزارلا، کاهو و خیارشور',
      },
    ];

    const tiles = TILES.map(function (t, i) {
      return [
        '<a class="gal__tile gal__tile--' + t.k + (t.k === 'n' ? ' gal__tile--frame' : '') + '"',
        '   href="#menu" style="grid-area:' + t.k + '"',
        '   aria-label="' + t.name + ' — ' + t.cat + '، دیدن در منوی شاما">',
        '  <span class="gal__media card-media">',
        '    <img src="assets/img/menu/' + t.img + '.webp" alt="' + t.alt + '" width="641" height="641" loading="lazy" decoding="async">',
        '  </span>',
        '  <svg class="gal__frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">',
        '    <rect x="0.5" y="0.5" width="99" height="99" pathLength="1" vector-effect="non-scaling-stroke"/>',
        '  </svg>',
        t.note ? '  <span class="gal__note">' + t.note + '</span>' : '',
        '  <span class="gal__cap">',
        '    <span class="gal__name">' + t.name + '</span>',
        '    <span class="gal__cat">' + t.cat + '</span>',
        '  </span>',
        '</a>',
      ].filter(Boolean).join('\n');
    }).join('\n');

    galMount.innerHTML = [
      '<section class="section gal" id="gallery" aria-labelledby="gal-title">',
      '  <div class="shell">',
      '    <header class="gal__head">',
      '      <div class="gal__head-copy">',
      '        <p class="eyebrow">قاب‌ها</p>',
      '        <h2 class="sec-title gal__title" id="gal-title">چند شب در شاما</h2>',
      '        <p class="gal__sub">هشت قاب از شب‌های معمولی شاما؛ از تنور تا فنجان آخر. هر عکس، میزی است که شاید همین امشب مال شما باشد.</p>',
      '      </div>',
      '      <a class="btn btn--ghost btn--sm gal__more" href="#menu">',
      '        دیدن منو',
      '        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 5-7 7 7 7"/></svg>',
      '      </a>',
      '    </header>',

      '    <div class="gal__grid">',
      tiles,
      '    </div>',

      '    <div class="gal__foot">',
      '      <a class="gal__ig" href="https://www.instagram.com/shama.cafe" target="_blank" rel="noopener">',
      '        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>',
      '        <span>ما را در اینستاگرام ببینید</span>',
      '        <span class="gal__ig-handle latin" dir="ltr">@shama.cafe</span>',
      '      </a>',
      '    </div>',
      '  </div>',
      '</section>',
    ].join('\n');
  }

  if (typeof S.observeReveals === 'function') {
    S.observeReveals(storyMount || document);
    if (galMount) S.observeReveals(galMount);
  }
})();
