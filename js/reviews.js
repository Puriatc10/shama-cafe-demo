/* ============================================================
   SHAMA — guest reviews (demo: writes to localStorage)
   ============================================================ */
(function () {
  'use strict';

  const mount = document.getElementById('mount-reviews');
  if (!mount) return;

  const S = window.Shama;
  const fmt = S.util.fmt;
  const fa = S.util.fa;
  const KEY = 'shama.reviews.v1';

  const SEED = [
    { id: 's1', name: 'نگار موسوی', rating: 5, at: '2026-11-18', visit: 'تراس',
      text: 'پیتزا سیر و استیک را با کاپوچینو عسل و سینامون سفارش دادیم؛ خمیر واقعاً تازه بود و لته‌آرت فنجان هم دست‌نخورده به میز رسید. تراس شب حال خوبی داشت.' },
    { id: 's2', name: 'امیرحسین رستگار', rating: 5, at: '2026-11-11', visit: 'سالن اصلی',
      text: 'برای تولد همسرم رزرو کردم. میز کنج را آماده نگه داشته بودند، موسیقی زنده هم آن‌قدر بلند نبود که نتوانیم حرف بزنیم. حتماً برمی‌گردیم.' },
    { id: 's3', name: 'سارا ک.', rating: 4, at: '2026-11-02', visit: 'تراس',
      text: 'شیک لوتوس عالی بود و برگرها هم آب‌دار. تنها نکته این بود که سفارش با پیک ده دقیقه دیرتر از زمان اعلام‌شده رسید، ولی بسته‌بندی و گرمای غذا خوب بود.' },
    { id: 's4', name: 'محمد شفیعی', rating: 5, at: '2026-10-26', visit: 'سالن اصلی',
      text: 'دمنوش مراکشی و ماچا لته وانیل را امتحان کردم؛ هر دو با دقت درست شده بودند. منوی QR سر میز هم واقعاً کار می‌کند و لازم نیست کسی را صدا بزنید.' },
    { id: 's5', name: 'الهام ن.', rating: 4, at: '2026-10-19', visit: 'ارسال با پیک',
      text: 'پاستا پستو و فرنچ‌فرایز با سس آلفردو برای دفتر سفارش دادیم. غذا گرم رسید و سس‌ها جدا بسته‌بندی شده بود. کیف پول و امتیاز باشگاه هم همان‌جا اعمال شد.' },
    { id: 's6', name: 'رضا بهرامی', rating: 5, at: '2026-10-07', visit: 'سالن اصلی',
      text: 'از آن کافه‌هایی که بعد از ساعت ۱۱ شب هم نفس می‌کشی. قهوه تازه‌رست‌شان مشخص است و پرسنل بدون عجله راهنمایی می‌کنند.' },
  ];

  const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

  function faDate(iso) {
    try {
      const parts = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric', month: 'numeric', day: 'numeric',
      }).formatToParts(new Date(iso));
      const get = (t) => (parts.find((p) => p.type === t) || {}).value || '';
      const m = parseInt(get('month'), 10) - 1;
      return fa(get('day')) + ' ' + (MONTHS[m] || '') + ' ' + fa(get('year'));
    } catch (e) {
      return '';
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const mine = raw ? JSON.parse(raw) : [];
      return Array.isArray(mine) ? mine : [];
    } catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }

  let mine = load();
  let filter = 'all';
  let formRating = 0;

  const stars = (n, cls) => {
    let out = '';
    for (let i = 1; i <= 5; i++) {
      out += '<svg class="rv-star' + (i <= n ? ' is-on' : '') + (cls ? ' ' + cls : '') +
        '" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.6 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9Z"/></svg>';
    }
    return out;
  };

  mount.innerHTML = `
  <section class="section rv" id="reviews">
    <div class="rv__inner shell">
      <header class="sec-head rv__head">
        <p class="eyebrow">نظر مهمانان</p>
        <h2 class="sec-title">شب‌های شاما،<br><span class="gold-text">به روایت شما</span></h2>
        <p class="sec-sub">هر نظری که این‌جا ثبت می‌شود، مستقیم به دفتر رستوران می‌رود. چند نظر از مهمانان اخیر:</p>
      </header>

      <div class="rv__grid">
        <aside class="rv__score panel reveal" aria-label="خلاصه امتیازها">
          <div class="rv__score-top">
            <b class="rv__avg num" id="rv-avg">۰٫۰</b>
            <div class="rv__score-meta">
              <span class="rv__stars" id="rv-avg-stars" aria-hidden="true"></span>
              <span class="rv__count" id="rv-count">۰ نظر</span>
            </div>
          </div>
          <div class="rv__bars" id="rv-bars"></div>
          <button class="btn btn--gold btn--sm rv__write" type="button" id="rv-open">ثبت نظر شما</button>
        </aside>

        <div class="rv__list-wrap">
          <div class="rv__filters" role="group" aria-label="فیلتر نظرها">
            <button class="chip rv__filter is-active" data-filter="all" aria-pressed="true">همه</button>
            <button class="chip rv__filter" data-filter="5" aria-pressed="false">۵ ستاره</button>
            <button class="chip rv__filter" data-filter="4" aria-pressed="false">۴ ستاره</button>
            <button class="chip rv__filter" data-filter="low" aria-pressed="false">۳ ستاره و کمتر</button>
            <span class="rv__hint small">تازه‌ترین‌ها اول</span>
          </div>
          <ul class="rv__list" id="rv-list"></ul>
          <p class="rv__empty" id="rv-empty" hidden>هنوز نظری با این فیلتر ثبت نشده.</p>
        </div>
      </div>

      <form class="rv__form panel" id="rv-form" novalidate hidden>
        <div class="rv__form-head">
          <h3>نظر شما</h3>
          <button class="rv__close" type="button" id="rv-close" aria-label="بستن فرم">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
          </button>
        </div>

        <div class="rv__field">
          <span class="rv__label" id="rv-rating-label">امتیاز شما</span>
          <div class="rv__rate" role="radiogroup" aria-labelledby="rv-rating-label" id="rv-rate">
            ${[1, 2, 3, 4, 5].map((i) =>
              `<button class="rv__rate-btn" type="button" role="radio" aria-checked="false" data-v="${i}" aria-label="${fa(i)} ستاره">
                 <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.6 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9Z"/></svg>
               </button>`).join('')}
          </div>
          <small class="rv__err" id="rv-err-rating" hidden></small>
        </div>

        <div class="rv__row">
          <div class="rv__field">
            <label class="rv__label" for="rv-name">نام شما</label>
            <input class="input" id="rv-name" type="text" autocomplete="name" placeholder="مثلاً سارا محمدی" maxlength="40">
            <small class="rv__err" id="rv-err-name" hidden></small>
          </div>
          <div class="rv__field">
            <label class="rv__label" for="rv-visit">نوع مراجعه <span class="rv__opt">اختیاری</span></label>
            <select class="select" id="rv-visit">
              <option value="سالن اصلی">سالن اصلی</option>
              <option value="تراس">تراس</option>
              <option value="ارسال با پیک">ارسال با پیک</option>
              <option value="تحویل حضوری">تحویل حضوری</option>
            </select>
          </div>
        </div>

        <div class="rv__field">
          <label class="rv__label" for="rv-text">تجربه‌تان</label>
          <textarea class="textarea" id="rv-text" rows="4" maxlength="480"
            placeholder="چه سفارش دادید؟ سرویس چطور بود؟ چه چیزی را بهتر می‌شد انجام داد؟"></textarea>
          <div class="rv__counter small"><span id="rv-count-chars">۰</span>/۴۸۰</div>
          <small class="rv__err" id="rv-err-text" hidden></small>
        </div>

        <div class="rv__form-foot">
          <p class="rv__note small">این فرم دمو است؛ نظر شما فقط در همین مرورگر ذخیره می‌شود.</p>
          <button class="btn btn--gold" type="submit" id="rv-submit">ثبت نظر</button>
        </div>
      </form>
    </div>
  </section>`;

  const els = {
    list: mount.querySelector('#rv-list'),
    empty: mount.querySelector('#rv-empty'),
    avg: mount.querySelector('#rv-avg'),
    avgStars: mount.querySelector('#rv-avg-stars'),
    count: mount.querySelector('#rv-count'),
    bars: mount.querySelector('#rv-bars'),
    form: mount.querySelector('#rv-form'),
    open: mount.querySelector('#rv-open'),
    close: mount.querySelector('#rv-close'),
    rate: mount.querySelector('#rv-rate'),
    name: mount.querySelector('#rv-name'),
    text: mount.querySelector('#rv-text'),
    visit: mount.querySelector('#rv-visit'),
    chars: mount.querySelector('#rv-count-chars'),
    submit: mount.querySelector('#rv-submit'),
  };

  const all = () => mine.concat(SEED).sort((a, b) => (a.at < b.at ? 1 : -1));

  function paintScore() {
    const list = all();
    const avg = list.reduce((s, r) => s + r.rating, 0) / (list.length || 1);
    els.avg.textContent = fa(avg.toFixed(1).replace('.', '٫'));
    els.avgStars.innerHTML = stars(Math.round(avg));
    els.count.textContent = fmt(list.length) + ' نظر';

    const dist = [5, 4, 3, 2, 1].map((n) => ({
      n, c: list.filter((r) => r.rating === n).length,
    }));
    els.bars.innerHTML = dist.map((d) => `
      <div class="rv__bar-row">
        <span class="rv__bar-n num">${fa(d.n)}</span>
        <span class="rv__bar"><i style="width:${list.length ? (d.c / list.length) * 100 : 0}%"></i></span>
        <span class="rv__bar-c num">${fmt(d.c)}</span>
      </div>`).join('');
  }

  function paintList() {
    let list = all();
    if (filter === '5') list = list.filter((r) => r.rating === 5);
    else if (filter === '4') list = list.filter((r) => r.rating === 4);
    else if (filter === 'low') list = list.filter((r) => r.rating <= 3);

    els.empty.hidden = list.length > 0;
    els.list.innerHTML = list.map((r) => `
      <li class="rv__card reveal" data-id="${r.id}">
        <div class="rv__card-top">
          <span class="rv__avatar" aria-hidden="true">${(r.name || '؟').trim().charAt(0)}</span>
          <div class="rv__who">
            <b>${r.name}</b>
            <span class="rv__date small">${faDate(r.at)}${r.visit ? ' · ' + r.visit : ''}</span>
          </div>
          <span class="rv__card-stars" aria-label="${fa(r.rating)} از ۵">${stars(r.rating)}</span>
        </div>
        <p class="rv__text">${r.text}</p>
        ${r.id.startsWith('m') ? '<span class="rv__badge">نظر شما</span>' : '<span class="rv__badge rv__badge--soft">مهمان تأییدشده</span>'}
      </li>`).join('');

    if (S.observeReveals) S.observeReveals(els.list);
  }

  function render() {
    paintScore();
    paintList();
  }

  /* --------------------------------------------------------- filtering */
  mount.querySelectorAll('.rv__filter').forEach((b) => {
    b.addEventListener('click', () => {
      filter = b.dataset.filter;
      mount.querySelectorAll('.rv__filter').forEach((x) => {
        const on = x === b;
        x.classList.toggle('is-active', on);
        x.setAttribute('aria-pressed', String(on));
      });
      paintList();
    });
  });

  /* ------------------------------------------------------------- form */
  function openForm() {
    els.form.hidden = false;
    requestAnimationFrame(() => els.form.classList.add('is-open'));
    const top = els.form.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: 'smooth' });
    setTimeout(() => els.name.focus({ preventScroll: true }), 380);
  }
  function closeForm() {
    els.form.classList.remove('is-open');
    setTimeout(() => { els.form.hidden = true; }, 260);
  }
  els.open.addEventListener('click', openForm);
  els.close.addEventListener('click', closeForm);

  function setRating(v) {
    formRating = v;
    els.rate.querySelectorAll('.rv__rate-btn').forEach((b) => {
      const on = +b.dataset.v <= v;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', String(+b.dataset.v === v));
    });
  }
  els.rate.addEventListener('click', (e) => {
    const b = e.target.closest('.rv__rate-btn');
    if (!b) return;
    setRating(+b.dataset.v);
    err('rating', '');
  });
  els.rate.addEventListener('pointerover', (e) => {
    const b = e.target.closest('.rv__rate-btn');
    if (!b) return;
    els.rate.querySelectorAll('.rv__rate-btn').forEach((x) => {
      x.classList.toggle('is-on', +x.dataset.v <= +b.dataset.v);
    });
  });
  els.rate.addEventListener('pointerleave', () => setRating(formRating));
  els.rate.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const next = e.key === 'ArrowRight' ? Math.max(1, formRating - 1) : Math.min(5, formRating + 1);
    setRating(next);
  });

  els.text.addEventListener('input', () => {
    els.chars.textContent = fa(els.text.value.length);
    err('text', '');
  });
  els.name.addEventListener('input', () => err('name', ''));

  function err(field, msg) {
    const el = mount.querySelector('#rv-err-' + field);
    if (!el) return;
    el.hidden = !msg;
    el.textContent = msg || '';
  }

  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    let bad = false;
    if (!formRating) { err('rating', 'یک امتیاز انتخاب کنید.'); bad = true; } else err('rating', '');
    const name = els.name.value.trim();
    if (name.length < 2) { err('name', 'نامتان را بنویسید (حداقل ۲ حرف).'); bad = true; } else err('name', '');
    const text = els.text.value.trim();
    if (text.length < 10) { err('text', 'کمی بیشتر بنویسید — حداقل ۱۰ حرف.'); bad = true; } else err('text', '');
    if (bad) {
      const first = mount.querySelector('.rv__err:not([hidden])');
      if (first) first.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    const review = {
      id: 'm' + Date.now(),
      name: name,
      rating: formRating,
      visit: els.visit.value,
      text: text,
      at: new Date().toISOString().slice(0, 10),
    };
    mine.push(review);
    save(mine);
    filter = 'all';
    mount.querySelectorAll('.rv__filter').forEach((x) => {
      const on = x.dataset.filter === 'all';
      x.classList.toggle('is-active', on);
      x.setAttribute('aria-pressed', String(on));
    });
    render();
    els.form.reset();
    setRating(0);
    els.chars.textContent = '۰';
    closeForm();
    S.toast('نظر شما ثبت شد — ممنون که نوشتید');
    const first = els.list.firstElementChild;
    if (first) first.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });

  render();
})();
