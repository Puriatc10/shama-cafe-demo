/* ============================================================
   SHAMA — menu section
   Renders #mount-menu: header, signature picks, sticky category
   dock (tabs + live search + sort), category blocks and the
   item quick-view dialog. Depends on js/store.js + js/base.js.
   ============================================================ */
(function () {
  'use strict';

  const mount = document.getElementById('mount-menu');
  const S = window.Shama;
  const DATA = (window.SHAMA && window.SHAMA.categories) || [];
  if (!mount || !S || !DATA.length) return;

  const $ = (s, c) => (c || mount).querySelector(s);
  const $$ = (s, c) => Array.from((c || mount).querySelectorAll(s));
  const { fmt, money, fa } = S.util;

  const CATS = DATA;
  const ITEMS = new Map();
  CATS.forEach((cat) => cat.items.forEach((it) => ITEMS.set(it.id, { item: it, cat })));
  const TOTAL = CATS.reduce((n, c) => n + c.items.length, 0);
  const SIG_IDS = ['c0-3', 'c5-0', 'c9-4'];

  const STATE = { q: '', raw: '', sort: 'default', active: 'all', lockUntil: 0 };
  let cur = null;            // open item: { item, qty, option(index|null) }
  let lastTrigger = null;    // element to restore focus to
  let closeTimer = 0;
  let debounceId = 0;
  let navH = 76;
  let dockH = 68;
  let ticking = false;

  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (m) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]
  ));

  /* ---------------------------------------------------------- search */
  const norm = (s) => String(s || '').toLowerCase()
    .replace(/[\u064A\u0649]/g, '\u06CC')   // ي/ى → ی
    .replace(/\u0643/g, '\u06A9')           // ك → ک
    .replace(/[\u0623\u0625\u0622]/g, '\u0627') // أ إ آ → ا
    .replace(/[\u064B-\u0652\u200C\u200E\u200F\u200D]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[\u06F0-\u06F9]/g, (d) => String('\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9'.indexOf(d)))
    .replace(/\s+/g, ' ')
    .trim();

  function matchItem(it, q) {
    if (!q) return true;
    const hay = norm(it.name + ' ' + it.desc);
    if (q.split(' ').every((token) => !token || hay.indexOf(token) !== -1)) return true;
    // also match with all spaces removed (handles «پیشغذا» vs «پیش غذا»)
    return hay.replace(/ /g, '').indexOf(q.replace(/ /g, '')) !== -1;
  }

  function pickItems(cat) {
    let items = cat.items.filter((it) => matchItem(it, STATE.q));
    if (STATE.sort === 'price-asc') items = items.slice().sort((a, b) => a.price - b.price);
    else if (STATE.sort === 'price-desc') items = items.slice().sort((a, b) => b.price - a.price);
    else if (STATE.sort === 'pop') {
      items = items.slice().sort((a, b) => (b.rate || 0) - (a.rate || 0) || a.price - b.price);
    }
    return items;
  }

  /* --------------------------------------------------------- fragments */
  function noImg(name) {
    const ch = (String(name || '').trim().charAt(0)) || 'ش';
    return '<span class="menu__noimg" aria-hidden="true">' +
      '<span class="menu__noimg-mark"><span class="menu__noimg-ring"></span>' +
      '<span class="menu__noimg-mono">' + esc(ch) + '</span></span>' +
      '<span class="menu__noimg-cap latin">SHAMA</span>' +
      '</span>';
  }

  function cardMedia(it) {
    const img = it.img
      ? '<img src="' + esc(it.img) + '" alt="" width="720" height="540" loading="lazy" decoding="async">'
      : noImg(it.name);
    const badge = it.rate >= 4.5 ? '<span class="menu__card-badge">پرفروش</span>' : '';
    return '<span class="menu__card-media card-media">' + img +
      '<span class="menu__sheen" aria-hidden="true"></span>' + badge + '</span>';
  }

  function cardHTML(it, i, animate) {
    return '<article class="menu__card' + (animate ? ' reveal' : '') + '" style="--d:' + ((i % 3) * 70) + 'ms">' +
      '<button class="menu__card-open" type="button" data-open="' + esc(it.id) + '" aria-label="مشاهده و سفارش ' + esc(it.name) + '">' +
        cardMedia(it) +
        '<span class="menu__card-body">' +
          '<span class="menu__card-name">' + esc(it.name) + '</span>' +
          '<span class="menu__card-desc">' + esc(it.desc) + '</span>' +
        '</span>' +
      '</button>' +
      '<div class="menu__card-foot">' +
        '<span class="menu__price"><span class="num">' + fmt(it.price) + '</span><span class="menu__price-unit">تومان</span></span>' +
        '<button class="menu__add" type="button" data-add="' + esc(it.id) + '" aria-label="افزودن ' + esc(it.name) + ' به سبد">' +
          'افزودن' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>' +
        '</button>' +
      '</div>' +
    '</article>';
  }

  function sigHTML(it, i) {
    const cat = ITEMS.get(it.id).cat;
    const img = it.img
      ? '<img src="' + esc(it.img) + '" alt="" width="720" height="540" loading="lazy" decoding="async">'
      : noImg(it.name);
    return '<article class="menu__sig-card reveal" style="--d:' + (i * 90) + 'ms">' +
      '<button class="menu__sig-open" type="button" data-open="' + esc(it.id) + '" aria-label="مشاهده و سفارش ' + esc(it.name) + '">' +
        '<span class="menu__sig-media card-media">' + img + '<span class="menu__sheen" aria-hidden="true"></span></span>' +
        '<span class="menu__sig-body">' +
          '<span class="menu__sig-meta"><span class="menu__sig-rule" aria-hidden="true"></span>' +
            '<span class="menu__sig-tag">' + esc(cat.name) + '</span></span>' +
          '<span class="menu__sig-name">' + esc(it.name) + '</span>' +
          '<span class="menu__sig-desc">' + esc(it.desc) + '</span>' +
        '</span>' +
      '</button>' +
      '<div class="menu__sig-foot">' +
        '<span class="menu__price"><span class="num">' + fmt(it.price) + '</span><span class="menu__price-unit">تومان</span></span>' +
        '<button class="menu__sig-add" type="button" data-add="' + esc(it.id) + '" aria-label="افزودن ' + esc(it.name) + ' به سبد">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>' +
        '</button>' +
      '</div>' +
    '</article>';
  }

  /* ------------------------------------------------------------ markup */
  const sigItems = SIG_IDS.map((id) => ITEMS.get(id)).filter(Boolean).map((e) => e.item);

  const tabsHTML = '<button class="chip menu__tab is-active" type="button" data-cat="all" aria-pressed="true">' +
      'همه<span class="menu__tab-n">' + fa(TOTAL) + '</span></button>' +
    CATS.map((c) =>
      '<button class="chip menu__tab" type="button" data-cat="' + esc(c.id) + '" aria-pressed="false">' +
        esc(c.name) + '<span class="menu__tab-n">' + fa(c.items.length) + '</span></button>'
    ).join('');

  const catBlocksHTML = CATS.map((c, i) =>
    '<section class="menu__cat reveal" id="cat-' + esc(c.id) + '" data-cat="' + esc(c.id) + '" style="--d:' + (Math.min(i, 4) * 40) + 'ms">' +
      '<header class="menu__cat-head">' +
        '<span class="menu__cat-index num" aria-hidden="true">' + fa(String(i + 1).padStart(2, '0')) + '</span>' +
        '<div class="menu__cat-meta">' +
          '<div class="menu__cat-top">' +
            '<h3 class="menu__cat-title">' + esc(c.name) + '</h3>' +
            '<span class="menu__cat-count" data-count>' + fa(c.items.length) + ' آیتم</span>' +
          '</div>' +
          '<p class="menu__cat-desc">' + esc(c.desc) + '</p>' +
        '</div>' +
      '</header>' +
      '<div class="menu__grid">' + c.items.map((it, j) => cardHTML(it, j, true)).join('') + '</div>' +
    '</section>'
  ).join('');

  mount.innerHTML =
    '<section class="section menu" id="menu" aria-labelledby="menu-title">' +
      '<div class="menu__aura" aria-hidden="true"></div>' +
      '<div class="shell menu__inner">' +

        '<header class="menu__head">' +
          '<div class="menu__head-copy reveal">' +
            '<p class="eyebrow">منوی شاما</p>' +
            '<h2 class="sec-title" id="menu-title">از خمیر تازه تا <span class="gold-text">فنجان داغ</span></h2>' +
            '<p class="sec-sub">هفتاد و یک آیتم در یازده دسته؛ پیتزاهای ایتالیایی، برگرهای دست‌ساز، قهوه‌ی تازه‌رست و شیک‌های خانگی. هر آیتم را می‌توانید همین‌جا سفارش بدهید.</p>' +
          '</div>' +
          '<dl class="menu__stats reveal" style="--d:140ms">' +
            '<div class="menu__stat"><dt>آیتم منو</dt><dd><span class="gold-text num">' + fa(TOTAL) + '</span></dd></div>' +
            '<div class="menu__stat"><dt>دسته‌بندی</dt><dd><span class="gold-text num">' + fa(CATS.length) + '</span></dd></div>' +
            '<div class="menu__stat"><dt>ارسال</dt><dd><span class="gold-text num">' + fa(45) + '</span><small>دقیقه</small></dd></div>' +
          '</dl>' +
        '</header>' +

        '<section class="menu__sig" aria-labelledby="menu-sig-title">' +
          '<div class="menu__sig-head reveal">' +
            '<div class="menu__sig-intro">' +
              '<p class="menu__sig-kicker">پیشنهاد شاما</p>' +
              '<h3 class="menu__sig-title" id="menu-sig-title">سه انتخاب برای شروع</h3>' +
            '</div>' +
            '<span class="menu__sig-sep" aria-hidden="true"></span>' +
            '<p class="menu__sig-note">از آشپزخانه و بار؛ همان‌هایی که بیشتر از همه سفارش می‌شوند.</p>' +
          '</div>' +
          '<div class="menu__sig-list">' + sigItems.map(sigHTML).join('') + '</div>' +
        '</section>' +

        '<div class="menu__dock" id="menu-dock">' +
          '<div class="menu__dock-inner">' +
            '<div class="menu__tabs" id="menu-tabs" role="group" aria-label="دسته‌بندی منو">' + tabsHTML + '</div>' +
            '<div class="menu__tools">' +
              '<div class="menu__search" id="menu-search-wrap">' +
                '<svg class="menu__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.6 16.6 4.1 4.1"/></svg>' +
                '<input class="menu__search-input" id="menu-search" type="search" placeholder="جست‌وجو در منو…" autocomplete="off" spellcheck="false" aria-label="جست‌وجو در منو">' +
                '<button class="menu__search-clear" id="menu-search-clear" type="button" aria-label="پاک کردن جست‌وجو" hidden>' +
                  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
                '</button>' +
              '</div>' +
              '<label class="menu__sort">' +
                '<span class="sr-only">ترتیب نمایش</span>' +
                '<select class="select menu__sort-select" id="menu-sort">' +
                  '<option value="default">پیش‌فرض</option>' +
                  '<option value="price-asc">ارزان‌ترین</option>' +
                  '<option value="price-desc">گران‌ترین</option>' +
                  '<option value="pop">محبوب‌ترین</option>' +
                '</select>' +
              '</label>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="menu__body" id="menu-body">' +
          catBlocksHTML +
          '<div class="menu__empty" id="menu-empty" hidden>' +
            '<span class="menu__empty-icon" aria-hidden="true">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m16.6 16.6 4.1 4.1"/></svg>' +
            '</span>' +
            '<p class="menu__empty-title">چیزی با این نام پیدا نشد</p>' +
            '<p class="menu__empty-text">عبارت دیگری را امتحان کنید یا جست‌وجو را پاک کنید تا همه‌ی منو برگردد.</p>' +
            '<button class="btn btn--ghost btn--sm menu__empty-reset" id="menu-empty-reset" type="button">پاک کردن جست‌وجو</button>' +
          '</div>' +
        '</div>' +

        '<div class="menu__bar" id="menu-bar" hidden>' +
          '<span class="menu__bar-icon" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' +
          '</span>' +
          '<span class="menu__bar-txt">' +
            '<span class="menu__bar-count" id="menu-bar-count">۰ آیتم</span>' +
            '<span class="menu__bar-dot" aria-hidden="true">·</span>' +
            '<span class="menu__bar-sum num" id="menu-bar-sum">۰ تومان</span>' +
          '</span>' +
          '<button class="menu__bar-go" id="menu-bar-go" type="button">' +
            'مشاهده‌ی سبد' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 5-7 7 7 7"/></svg>' +
          '</button>' +
        '</div>' +

      '</div>' +

      '<div class="menu-modal" id="menu-modal" hidden>' +
        '<div class="menu-modal__backdrop" data-close></div>' +
        '<div class="menu-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="menu-modal-title" aria-describedby="menu-modal-desc" tabindex="-1">' +
          '<button class="menu-modal__close" type="button" data-close aria-label="بستن">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
          '</button>' +
          '<div class="menu-modal__media">' +
            '<span class="menu-modal__photo card-media" data-part="media"></span>' +
          '</div>' +
          '<div class="menu-modal__body">' +
            '<p class="menu-modal__kicker" data-part="kicker"></p>' +
            '<h3 class="menu-modal__title" id="menu-modal-title" data-part="title"></h3>' +
            '<p class="menu-modal__desc" id="menu-modal-desc" data-part="desc"></p>' +
            '<div class="menu-modal__meta" data-part="meta"></div>' +
            '<div class="menu-modal__section" data-part="opts-wrap" hidden>' +
              '<span class="menu-modal__label" data-part="opts-label">گزینه‌های سفارش</span>' +
              '<div class="menu-modal__options" data-part="opts" role="radiogroup" aria-label="گزینه‌های سفارش"></div>' +
            '</div>' +
            '<div class="menu-modal__section">' +
              '<label class="menu-modal__label" for="menu-modal-note">توضیح برای آشپز <span>اختیاری</span></label>' +
              '<textarea class="textarea menu-modal__note" id="menu-modal-note" rows="2" maxlength="160" placeholder="مثلاً بدون پیاز، سس اضافه…"></textarea>' +
            '</div>' +
            '<div class="menu-modal__foot">' +
              '<div class="menu-modal__qty" role="group" aria-label="تعداد">' +
                '<button class="menu-modal__qty-btn" type="button" data-step="-1" aria-label="کاهش تعداد">−</button>' +
                '<span class="menu-modal__qty-val" data-part="qty" aria-live="polite">۱</span>' +
                '<button class="menu-modal__qty-btn" type="button" data-step="1" aria-label="افزایش تعداد">+</button>' +
              '</div>' +
              '<div class="menu-modal__total">' +
                '<span class="menu-modal__total-label">جمع</span>' +
                '<span class="menu-modal__total-val num" data-part="total"></span>' +
              '</div>' +
              '<button class="btn btn--gold menu-modal__add" type="button" data-add-current>افزودن به سبد</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';

  /* ------------------------------------------------------------- refs */
  const section = $('#menu');
  const dock = $('#menu-dock');
  const tabs = $('#menu-tabs');
  const searchWrap = $('#menu-search-wrap');
  const searchInput = $('#menu-search');
  const searchClear = $('#menu-search-clear');
  const sortSel = $('#menu-sort');
  const bodyEl = $('#menu-body');
  const emptyEl = $('#menu-empty');
  const barEl = $('#menu-bar');
  const barCount = $('#menu-bar-count');
  const barSum = $('#menu-bar-sum');
  const modal = $('#menu-modal');
  const dialog = $('.menu-modal__dialog', modal);
  const noteEl = $('#menu-modal-note');
  const blocks = new Map();
  CATS.forEach((c) => blocks.set(c.id, document.getElementById('cat-' + c.id)));

  if (S.observeReveals) S.observeReveals(section);

  /* --------------------------------------------------------- rendering */
  function renderGrids(animate) {
    let visible = 0;
    CATS.forEach((cat) => {
      const block = blocks.get(cat.id);
      const grid = $('.menu__grid', block);
      const countEl = $('[data-count]', block);
      const items = pickItems(cat);
      grid.innerHTML = items.length
        ? items.map((it, i) => cardHTML(it, i, !!animate)).join('')
        : '';
      block.hidden = items.length === 0;
      countEl.textContent = STATE.q ? fa(items.length) + ' نتیجه' : fa(cat.items.length) + ' آیتم';
      visible += items.length;
    });
    emptyEl.hidden = visible > 0;
    if (visible > 0 && window.Shama.observeReveals) window.Shama.observeReveals(section);
  }

  function applyQuery(raw) {
    STATE.raw = String(raw || '').trim();
    STATE.q = norm(STATE.raw);
    renderGrids(false);
    if (STATE.q) setActive('all', false);
    else updateScroll();
  }

  function clearQuery(focusInput) {
    clearTimeout(debounceId);
    searchInput.value = '';
    searchClear.hidden = true;
    searchWrap.classList.remove('is-filled');
    applyQuery('');
    if (focusInput) searchInput.focus({ preventScroll: true });
  }

  /* ---------------------------------------------------------- cart bar */
  function paintBar() {
    const n = S.basket.count();
    barEl.hidden = n === 0;
    if (!n) return;
    barCount.textContent = fa(n) + ' آیتم';
    barSum.textContent = money(S.basket.subtotal());
  }

  function openCart() {
    if (window.Shama.cartUI) window.Shama.cartUI.open();
    else S.toast('سبد خرید در حال آماده‌سازی است');
  }

  function flyToCart(from) {
    if (reduce() || !from) return;
    const cart = document.getElementById('nav-cart');
    if (!cart) return;
    const a = from.getBoundingClientRect();
    const b = cart.getBoundingClientRect();
    const cx = a.left + a.width / 2;
    const cy = a.top + a.height / 2;
    const dx = b.left + b.width / 2 - cx;
    const dy = b.top + b.height / 2 - cy;
    const dot = document.createElement('span');
    dot.className = 'menu__fly';
    dot.style.left = (cx - 5) + 'px';
    dot.style.top = (cy - 5) + 'px';
    document.body.appendChild(dot);
    const anim = dot.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: 'translate(' + (dx * 0.55) + 'px,' + (dy * 0.55 - 42) + 'px) scale(.9)', opacity: 0.95, offset: 0.55 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.25)', opacity: 0 }
    ], { duration: 760, easing: 'cubic-bezier(.22,1,.36,1)' });
    anim.onfinish = () => dot.remove();
    anim.oncancel = () => dot.remove();
    setTimeout(() => dot.remove(), 1100);
  }

  function addToCart(it, qty, note, variant, from) {
    const key = variant ? it.id + '::' + variant : it.id;
    const name = variant ? it.name + ' — ' + variant : it.name;
    S.basket.add({ id: it.id, name: name, price: it.price, img: it.img || null, note: note || '', key: key }, qty);
    S.toast('«' + it.name + '» به سبد اضافه شد', { icon: 'bag' });
    const desktop = window.matchMedia('(min-width: 900px) and (pointer: fine)').matches;
    if (desktop && window.Shama.cartUI) setTimeout(() => window.Shama.cartUI.open(), 240);
    else flyToCart(from);
  }

  function quickAdd(id, from) {
    const entry = ITEMS.get(id);
    if (!entry) return;
    const it = entry.item;
    if (it.options && it.options.length > 1) {
      lastTrigger = from;
      openItem(entry);
      return;
    }
    addToCart(it, 1, '', null, from);
  }

  /* ------------------------------------------------------------- modal */
  function paintQty() {
    if (!cur) return;
    $('[data-part="qty"]', modal).textContent = fa(cur.qty);
    $('[data-step="-1"]', modal).disabled = cur.qty <= 1;
    $('[data-step="1"]', modal).disabled = cur.qty >= 20;
    $('[data-part="total"]', modal).textContent = money(cur.item.price * cur.qty);
  }

  function openItem(entry) {
    const it = entry.item;
    if (!it) return;
    cur = {
      item: it,
      qty: 1,
      option: it.options && it.options.length > 1 ? 0 : null
    };

    $('[data-part="media"]', modal).innerHTML = it.img
      ? '<img src="' + esc(it.img) + '" alt="" width="720" height="540" decoding="async">' +
        '<span class="menu__sheen" aria-hidden="true"></span>'
      : noImg(it.name);

    $('[data-part="kicker"]', modal).textContent = entry.cat.name;
    $('[data-part="title"]', modal).textContent = it.name;
    $('[data-part="desc"]', modal).textContent = it.desc;

    let meta = '<span>' + esc(entry.cat.name) + '</span>';
    if (it.options && it.options.length === 1) meta += '<span>' + esc(it.options[0]) + '</span>';
    if (it.rate > 0) meta += '<span class="menu-modal__rate">★ ' + fa(String(it.rate).replace('.', '٫')) + '</span>';
    $('[data-part="meta"]', modal).innerHTML = meta;

    const optsWrap = $('[data-part="opts-wrap"]', modal);
    if (it.options && it.options.length > 1) {
      optsWrap.hidden = false;
      $('[data-part="opts"]', modal).innerHTML = it.options.map((o, i) =>
        '<button class="menu-modal__option" type="button" role="radio" aria-checked="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-opt="' + i + '">' + esc(o) + '</button>'
      ).join('');
    } else {
      optsWrap.hidden = true;
      $('[data-part="opts"]', modal).innerHTML = '';
    }

    noteEl.value = '';
    const mbody = $('.menu-modal__body', modal);
    if (mbody) mbody.scrollTop = 0;
    paintQty();

    clearTimeout(closeTimer);
    modal.hidden = false;
    document.body.classList.add('no-scroll');
    requestAnimationFrame(() => modal.classList.add('is-open'));
    dialog.focus({ preventScroll: true });
  }

  function closeModal(skipFocus) {
    if (modal.hidden) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    cur = null;
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      modal.hidden = true;
      if (!skipFocus && lastTrigger && document.contains(lastTrigger)) {
        try { lastTrigger.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
      }
    }, 340);
  }

  function selectOption(idx) {
    if (!cur) return;
    const opts = cur.item.options || [];
    if (!opts[idx]) return;
    cur.option = idx;
    $$('[data-opt]', modal).forEach((b) => {
      const on = Number(b.dataset.opt) === idx;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
  }

  function trapFocus(e) {
    const f = $$('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])', dialog)
      .filter((el) => el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === dialog)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function addCurrent() {
    if (!cur) return;
    const it = cur.item;
    const variant = cur.option !== null ? it.options[cur.option] : null;
    const note = noteEl.value.trim();
    const qty = cur.qty;
    const from = lastTrigger;
    const desktop = window.matchMedia('(min-width: 900px) and (pointer: fine)').matches;
    const willOpenCart = desktop && !!window.Shama.cartUI;
    closeModal(willOpenCart);
    addToCart(it, qty, note, variant, from);
  }

  /* -------------------------------------------------------- navigation */
  function measure() {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--nav-h');
    navH = parseFloat(v) || 76;
    dockH = dock.offsetHeight || 68;
  }

  function setActive(id, center) {
    const apply = () => {
      $$('.menu__tab', tabs).forEach((b) => {
        const on = b.dataset.cat === id;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    };
    if (STATE.active !== id) {
      STATE.active = id;
      apply();
    }
    if (center) {
      const b = tabs.querySelector('[data-cat="' + id + '"]');
      if (!b) return;
      const tr = tabs.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      if (br.left < tr.left + 10 || br.right > tr.right - 10) {
        b.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }

  function scrollToEl(el) {
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - (navH + dockH + 18);
    window.scrollTo({ top: Math.max(0, top), behavior: reduce() ? 'auto' : 'smooth' });
  }

  function updateScroll() {
    const top = dock.getBoundingClientRect().top;
    dock.classList.toggle('is-stuck', top <= navH + 0.5);

    if (STATE.q || Date.now() < STATE.lockUntil) return;
    const line = navH + dockH + 26;
    let active = null;
    CATS.forEach((cat) => {
      const b = blocks.get(cat.id);
      if (!b || b.hidden) return;
      const r = b.getBoundingClientRect();
      if (r.top - 4 <= line && r.bottom - 40 > line) active = cat.id;
    });
    if (active) setActive(active, false);
    else {
      const first = blocks.get(CATS[0].id);
      if (first && !first.hidden && first.getBoundingClientRect().top > line) setActive('all', false);
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      updateScroll();
    });
  }

  /* ------------------------------------------------------------- wiring */
  section.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-open]');
    if (openBtn && section.contains(openBtn)) {
      const entry = ITEMS.get(openBtn.dataset.open);
      if (entry) {
        lastTrigger = openBtn;
        openItem(entry);
      }
      return;
    }
    const addBtn = e.target.closest('[data-add]');
    if (addBtn && section.contains(addBtn)) {
      quickAdd(addBtn.dataset.add, addBtn);
    }
  });

  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.menu__tab');
    if (!btn) return;
    const id = btn.dataset.cat;
    if (STATE.q || searchInput.value.trim()) {
      clearTimeout(debounceId);
      searchInput.value = '';
      searchClear.hidden = true;
      searchWrap.classList.remove('is-filled');
      STATE.q = '';
      STATE.raw = '';
      renderGrids(false);
    }
    setActive(id, true);
    STATE.lockUntil = Date.now() + 900;
    if (id === 'all') scrollToEl(bodyEl);
    else scrollToEl(document.getElementById('cat-' + id));
  });

  searchInput.addEventListener('input', () => {
    const v = searchInput.value;
    searchClear.hidden = !v;
    searchWrap.classList.toggle('is-filled', !!v);
    clearTimeout(debounceId);
    debounceId = setTimeout(() => applyQuery(v), 120);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchInput.value) {
      e.preventDefault();
      clearQuery(true);
    }
  });

  searchClear.addEventListener('click', () => clearQuery(true));
  $('#menu-empty-reset').addEventListener('click', () => clearQuery(true));

  sortSel.addEventListener('change', () => {
    STATE.sort = sortSel.value;
    renderGrids(false);
  });

  $('#menu-bar-go').addEventListener('click', openCart);

  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) { closeModal(); return; }
    const opt = e.target.closest('[data-opt]');
    if (opt) { selectOption(Number(opt.dataset.opt)); return; }
    const step = e.target.closest('[data-step]');
    if (step && cur) {
      const next = Math.min(20, Math.max(1, cur.qty + Number(step.dataset.step)));
      if (next !== cur.qty) {
        cur.qty = next;
        paintQty();
      }
      return;
    }
    if (e.target.closest('[data-add-current]')) addCurrent();
  });

  $('[data-part="opts"]', modal).addEventListener('keydown', (e) => {
    if (!cur || !cur.item.options || cur.item.options.length < 2) return;
    const dir = (e.key === 'ArrowLeft' || e.key === 'ArrowDown') ? 1
      : (e.key === 'ArrowRight' || e.key === 'ArrowUp') ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const total = cur.item.options.length;
    const next = (cur.option + dir + total) % total;
    selectOption(next);
    const btn = modal.querySelector('[data-opt="' + next + '"]');
    if (btn) btn.focus();
  });

  document.addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    } else if (e.key === 'Tab') {
      trapFocus(e);
    }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    measure();
    updateScroll();
  }, { passive: true });
  if ('ResizeObserver' in window) {
    try { new ResizeObserver(measure).observe(dock); } catch (e) { /* ignore */ }
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { measure(); }).catch(() => {});
  }

  /* --------------------------------------------------------------- init */
  S.on(paintBar);
  paintBar();
  requestAnimationFrame(() => {
    measure();
    updateScroll();
  });

  if (window.Shama) {
    window.Shama.menu = {
      open: function (id) {
        const entry = ITEMS.get(id);
        if (entry) { lastTrigger = null; openItem(entry); }
      },
      close: closeModal,
      filter: function (q) {
        searchInput.value = q || '';
        searchClear.hidden = !q;
        searchWrap.classList.toggle('is-filled', !!q);
        applyQuery(q || '');
      },
      state: STATE
    };
  }
})();
