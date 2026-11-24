/* ============================================================
   SHAMA — cart drawer, coupon, checkout, confirmation
   Mounts into #mount-cart. All state lives in window.Shama.basket;
   this module only renders it and collects checkout input.
   Exposes: window.Shama.cartUI = { open, close, toggle, isOpen }
   ============================================================ */
(function () {
  'use strict';

  var S = window.Shama;
  if (!S || !S.basket) { console.warn('[shama/cart] store missing'); return; }
  if (S.cartUI) return;

  var B = S.basket;
  var U = S.util;
  var CFG = S.CONFIG;
  var fmt = U.fmt;
  var fa = U.fa;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  /* money: number isolated LTR, unit kept small and quiet */
  function m(n) {
    return '<bdi class="num">' + fmt(n || 0) + '</bdi><span class="cart__cur">تومان</span>';
  }

  var ICON = {
    close: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 5-7 7 7 7"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
    trash: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    tick: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    card: '<svg viewBox="0 0 34 22" width="34" height="22" fill="none" aria-hidden="true"><rect x=".8" y=".8" width="32.4" height="20.4" rx="3.6" stroke="currentColor" stroke-opacity=".5" stroke-width="1.2"/><path d="M1 7h32" stroke="currentColor" stroke-opacity=".32" stroke-width="3"/><rect x="4.5" y="13" width="7" height="4.5" rx="1" stroke="currentColor" stroke-opacity=".55" stroke-width="1"/></svg>',
    bag: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>'
  };

  var CUP_SVG =
    '<svg viewBox="0 0 120 120" fill="none" aria-hidden="true">' +
      '<circle cx="60" cy="60" r="53" stroke="url(#shamaCupG)" stroke-width="1" opacity=".55"/>' +
      '<circle cx="60" cy="60" r="44" stroke="url(#shamaCupG)" stroke-width=".6" opacity=".22" stroke-dasharray="2 6"/>' +
      '<path d="M37 48h43c0 19.4-8.6 30.4-21.5 30.4S37 67.4 37 48Z" stroke="url(#shamaCupG)" stroke-width="1.7" stroke-linejoin="round"/>' +
      '<path d="M80 53h6.4a8.2 8.2 0 0 1 0 16.4H78.4" stroke="url(#shamaCupG)" stroke-width="1.7"/>' +
      '<path d="M46 87h27" stroke="url(#shamaCupG)" stroke-width="1.7" stroke-linecap="round"/>' +
      '<path d="M51 40c-2.2-4 .6-6.2-1.2-10M60 40c-2.2-4 .6-6.2-1.2-10M69 40c-2.2-4 .6-6.2-1.2-10" stroke="url(#shamaCupG)" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>' +
      '<ellipse cx="60" cy="99" rx="27" ry="3" fill="url(#shamaCupG)" opacity=".16"/>' +
      '<defs><linearGradient id="shamaCupG" x1="22" y1="18" x2="102" y2="104">' +
        '<stop stop-color="#F7E7BE"/><stop offset=".55" stop-color="#C9A227"/><stop offset="1" stop-color="#8A6329"/>' +
      '</linearGradient></defs>' +
    '</svg>';

  function thumbSVG() {
    return '<svg class="cart__thumb-ph" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true">' +
      '<path d="M13 18h20c0 9.4-4.2 15-10 15s-10-5.6-10-15Z"/>' +
      '<path d="M33 21h3.2a3.6 3.6 0 0 1 0 7.2H32"/>' +
      '<path d="M18 38h12" stroke-linecap="round"/>' +
      '<path d="M20 13c-.8-1.6.8-2.4 0-4M26 13c-.8-1.6.8-2.4 0-4" stroke-linecap="round" opacity=".75"/>' +
    '</svg>';
  }

  /* ---------------------------------------------------------------- mount */
  var mount = document.getElementById('mount-cart');
  if (!mount) {
    mount = document.createElement('div');
    mount.id = 'mount-cart';
    document.body.appendChild(mount);
  }

  var tableOptions = '';
  for (var ti = 1; ti <= 20; ti++) {
    tableOptions += '<option value="' + ti + '">میز ' + fa(ti) + '</option>';
  }

  mount.innerHTML = [
    '<div class="cart" id="shamaCart" aria-hidden="true">',
    '  <div class="cart__scrim" data-close></div>',

    '  <aside class="cart__drawer" id="cartDrawer" role="dialog" aria-modal="true" aria-labelledby="cartTitle" tabindex="-1">',
    '    <header class="cart__head">',
    '      <div class="cart__head-row">',
    '        <button class="cart__icon-btn cart__back" id="cartBack" type="button" aria-label="بازگشت به سبد" hidden>' + ICON.back + '</button>',
    '        <p class="cart__step latin" id="cartStep">ORDER / 01</p>',
    '        <button class="cart__icon-btn cart__close" id="cartClose" type="button" aria-label="بستن سبد">' + ICON.close + '</button>',
    '      </div>',
    '      <div class="cart__head-title">',
    '        <h2 class="cart__title" id="cartTitle" tabindex="-1">سبد شما</h2>',
    '        <span class="cart__badge" id="cartBadge" hidden><b class="num" id="cartBadgeN">۰</b> آیتم</span>',
    '      </div>',
    '      <p class="cart__sub" id="cartSub">یک سفارش کوچک، یک شب طلایی.</p>',
    '    </header>',

    '    <div class="cart__body">',

    /* ------------------------------------------------ step 1 : basket */
    '      <section class="cart__panel is-active" id="panelList" data-panel="list" aria-label="سبد خرید">',
    '        <div class="cart__scroll" id="cartScroll">',

    '          <div class="cart__empty" id="cartEmpty" hidden>',
    '            <div class="cart__empty-art">' + CUP_SVG + '</div>',
    '            <p class="cart__empty-eyebrow latin">EMPTY CUP</p>',
    '            <h3 class="cart__empty-title">سبد شما خالی است</h3>',
    '            <p class="cart__empty-text">از منوی شاما انتخاب کنید؛ قهوه‌ی تازه‌رست و خمیر دست‌ساز منتظر شماست.</p>',
    '            <button class="btn btn--ghost btn--sm" id="cartEmptyCta" type="button">دیدن منو</button>',
    '          </div>',

    '          <ul class="cart__lines" id="cartLines"></ul>',

    '          <div class="cart__coupon" id="cartCouponBox" hidden>',
    '            <div class="cart__coupon-head">',
    '              <label class="cart__label" for="cartCouponInput">کد تخفیف</label>',
    '              <span class="cart__label-sub tiny">یک کد، کمی طلایی‌تر</span>',
    '            </div>',
    '            <div class="cart__coupon-row" id="cartCouponRow">',
    '              <input class="input cart__coupon-input latin" id="cartCouponInput" type="text" dir="ltr" autocomplete="off" spellcheck="false" placeholder="SHAMA10" aria-describedby="cartCouponMsg">',
    '              <button class="btn btn--ghost btn--sm cart__coupon-btn" id="cartCouponApply" type="button">اعمال</button>',
    '            </div>',
    '            <p class="cart__hint" id="cartCouponMsg" role="status" aria-live="polite"></p>',
    '            <div class="cart__chip-row" id="cartChipWrap" hidden>',
    '              <span class="cart__chip">',
    '                <span class="cart__chip-check" aria-hidden="true">' + ICON.tick + '</span>',
    '                <span class="cart__chip-txt"><b id="cartChipCode" class="latin"></b><small id="cartChipLabel"></small></span>',
    '                <button class="cart__chip-x" id="cartChipRemove" type="button" aria-label="حذف کد تخفیف">' + ICON.x + '</button>',
    '              </span>',
    '            </div>',
    '            <div class="cart__suggest">',
    '              <span class="cart__suggest-label">کدهای پیشنهادی</span>',
    '              <div class="cart__suggest-row" id="cartSuggest">',
    '                <button class="chip chip--code" type="button" data-coupon="SHAMA10" aria-label="اعمال کد SHAMA10">SHAMA10</button>',
    '                <button class="chip chip--code" type="button" data-coupon="GOLD20" aria-label="اعمال کد GOLD20">GOLD20</button>',
    '                <button class="chip chip--code" type="button" data-coupon="FIRST" aria-label="اعمال کد FIRST">FIRST</button>',
    '                <button class="chip chip--code" type="button" data-coupon="LATTE" aria-label="اعمال کد LATTE">LATTE</button>',
    '              </div>',
    '            </div>',
    '          </div>',

    '          <div class="cart__clear-wrap" id="cartClearWrap" hidden>',
    '            <button class="cart__clear" id="cartClear" type="button">' + ICON.trash + '<span>پاک کردن سبد</span></button>',
    '          </div>',
    '        </div>',

    '        <footer class="cart__foot" id="cartFoot">',
    '          <div class="cart__ship" id="cartShipBox" hidden>',
    '            <div class="cart__ship-head">',
    '              <span id="cartShipText"></span>',
    '              <span class="cart__ship-pct num" id="cartShipPct"></span>',
    '            </div>',
    '            <div class="cart__ship-bar"><span id="cartShipFill"></span></div>',
    '          </div>',

    '          <dl class="cart__sum">',
    '            <div class="cart__sum-row"><dt>جمع سفارش</dt><dd data-sum="subtotal"></dd></div>',
    '            <div class="cart__sum-row cart__sum-row--gold" data-row="discount" hidden><dt>تخفیف <span class="cart__sum-tag latin" data-coupon-label></span></dt><dd data-sum="discount"></dd></div>',
    '            <div class="cart__sum-row" data-row="packaging"><dt>بسته‌بندی</dt><dd data-sum="packaging"></dd></div>',
    '            <div class="cart__sum-row" data-row="delivery"><dt>ارسال</dt><dd data-sum="delivery"></dd></div>',
    '            <div class="cart__sum-row"><dt>مالیات بر ارزش افزوده</dt><dd data-sum="tax"></dd></div>',
    '          </dl>',

    '          <div class="cart__wallet" id="cartWalletRow">',
    '            <label class="cart__wallet-main" for="cartWalletToggle">',
    '              <span class="cart__wallet-txt">',
    '                <b>کیف پول شاما</b>',
    '                <small>موجودی <bdi class="num" id="cartWalletBal">۰</bdi> تومان</small>',
    '              </span>',
    '              <input class="cart__switch" id="cartWalletToggle" type="checkbox">',
    '              <span class="cart__switch-ui" aria-hidden="true"><i></i></span>',
    '            </label>',
    '            <p class="cart__wallet-note" data-row="wallet" hidden>از کیف پول کسر می‌شود: <b data-sum="wallet"></b></p>',
    '          </div>',

    '          <div class="cart__total">',
    '            <span class="cart__total-label">مبلغ قابل پرداخت</span>',
    '            <span class="cart__total-val" id="cartCtaTotal" aria-live="polite" aria-atomic="true" data-sum="total"></span>',
    '          </div>',
    '          <button class="btn btn--gold btn--block cart__cta" id="cartToCheckout" type="button">',
    '            <span>ادامه سفارش</span>' + ICON.arrow,
    '          </button>',
    '          <p class="cart__foot-note tiny">حداقل سفارش <bdi class="num">۶۰٬۰۰۰</bdi> تومان · پرداخت امن · بسته‌بندی بهداشتی</p>',
    '        </footer>',
    '      </section>',

    /* ------------------------------------------------ step 2 : checkout */
    '      <section class="cart__panel" id="panelCheckout" data-panel="checkout" aria-label="تکمیل سفارش" hidden>',
    '        <div class="cart__scroll ck__scroll" id="ckScroll">',

    '          <div class="ck__block">',
    '            <div class="ck__legend"><span class="ck__legend-num latin">01</span><h3>روش تحویل</h3></div>',
    '            <div class="ck__seg" id="ckModes" role="group" aria-label="روش تحویل">',
    '              <button class="ck__seg-btn is-active" type="button" data-mode="delivery" aria-pressed="true">ارسال با پیک</button>',
    '              <button class="ck__seg-btn" type="button" data-mode="pickup" aria-pressed="false">تحویل حضوری</button>',
    '              <button class="ck__seg-btn" type="button" data-mode="table" aria-pressed="false">سفارش سر میز</button>',
    '            </div>',
    '            <div class="ck__table" id="ckTableBlock" hidden>',
    '              <div class="field">',
    '                <label for="ckTable">شماره میز</label>',
    '                <select class="select ck__input" id="ckTable"><option value="">انتخاب میز…</option>' + tableOptions + '</select>',
    '                <span class="ck__err" hidden></span>',
    '              </div>',
    '              <p class="ck__hint"><span class="ck__hint-mark latin">QR</span> کد روی میز را اسکن کنید؛ منو و سبد همین‌جا باز می‌شود و سفارش مستقیم به آشپزخانه می‌رود.</p>',
    '            </div>',
    '            <p class="ck__hint" id="ckPickupHint" hidden>تحویل حضوری در شعبه ونک — بزرگراه محلاتی، جنب مترو بسیج، سمت پارک.</p>',
    '          </div>',

    '          <div class="ck__block">',
    '            <div class="ck__legend"><span class="ck__legend-num latin">02</span><h3>مشخصات</h3></div>',
    '            <div class="ck__grid">',
    '              <div class="field">',
    '                <label for="ckName">نام و نام خانوادگی</label>',
    '                <input class="input ck__input" id="ckName" type="text" autocomplete="name" placeholder="مثلاً نیلوفر احمدی">',
    '                <span class="ck__err" hidden></span>',
    '              </div>',
    '              <div class="field">',
    '                <label for="ckPhone">شماره موبایل</label>',
    '                <input class="input ck__input ck__input--ltr num" id="ckPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="۰۹۱۲ ۱۲۳ ۴۵۶۷">',
    '                <span class="ck__err" hidden></span>',
    '              </div>',
    '            </div>',
    '            <div class="field" id="ckAddressField">',
    '              <label for="ckAddress">آدرس تحویل</label>',
    '              <textarea class="textarea ck__input" id="ckAddress" rows="3" placeholder="خیابان، کوچه، پلاک، واحد…"></textarea>',
    '              <span class="ck__err" hidden></span>',
    '            </div>',
    '            <div class="ck__grid">',
    '              <div class="field">',
    '                <label for="ckSlot">زمان</label>',
    '                <select class="select ck__input" id="ckSlot">',
    '                  <option value="asap">در اسرع وقت</option>',
    '                  <option value="30">۳۰ دقیقه دیگر</option>',
    '                  <option value="60">۱ ساعت دیگر</option>',
    '                  <option value="custom">زمان دلخواه…</option>',
    '                </select>',
    '              </div>',
    '              <div class="field" id="ckSlotCustomField" hidden>',
    '                <label for="ckSlotCustom">زمان دلخواه</label>',
    '                <input class="input ck__input num" id="ckSlotCustom" type="text" placeholder="مثلاً ۲۱:۳۰">',
    '                <span class="ck__err" hidden></span>',
    '              </div>',
    '            </div>',
    '            <div class="field">',
    '              <label for="ckNote">یادداشت برای آشپزخانه <span class="ck__opt">اختیاری</span></label>',
    '              <textarea class="textarea ck__input" id="ckNote" rows="2" placeholder="بدون پیاز، سس جدا، لته بدون شکر…"></textarea>',
    '            </div>',
    '          </div>',

    '          <div class="ck__block">',
    '            <div class="ck__legend"><span class="ck__legend-num latin">03</span><h3>پرداخت</h3></div>',
    '            <div class="ck__pay" id="ckPay">',
    '              <label class="ck__pay-card is-active">',
    '                <input class="ck__pay-radio sr-only" type="radio" name="shamaPay" value="online" checked>',
    '                <span class="ck__pay-body">',
    '                  <span class="ck__pay-head"><b>پرداخت آنلاین</b>' + ICON.card + '</span>',
    '                  <span class="ck__pay-desc">درگاه امن شتاب · رمز دوم پویا</span>',
    '                </span>',
    '                <span class="ck__pay-tick" aria-hidden="true">' + ICON.tick + '</span>',
    '              </label>',
    '              <label class="ck__pay-card" id="ckPayWalletCard">',
    '                <input class="ck__pay-radio sr-only" type="radio" name="shamaPay" value="wallet" id="ckPayWallet">',
    '                <span class="ck__pay-body">',
    '                  <span class="ck__pay-head"><b>کیف پول شاما</b><span class="ck__pay-bal">موجودی <bdi class="num" id="ckPayWalletBal"></bdi></span></span>',
    '                  <span class="ck__pay-desc">پرداخت سریع، بدون درگاه</span>',
    '                  <span class="ck__pay-warn" id="ckPayWalletWarn" hidden>موجودی کافی نیست</span>',
    '                </span>',
    '                <span class="ck__pay-tick" aria-hidden="true">' + ICON.tick + '</span>',
    '              </label>',
    '              <label class="ck__pay-card">',
    '                <input class="ck__pay-radio sr-only" type="radio" name="shamaPay" value="cod">',
    '                <span class="ck__pay-body">',
    '                  <span class="ck__pay-head"><b>پرداخت در محل</b><span class="ck__pay-bal">کارت‌خوان سیار</span></span>',
    '                  <span class="ck__pay-desc">نقدی یا کارتی، هنگام تحویل</span>',
    '                </span>',
    '                <span class="ck__pay-tick" aria-hidden="true">' + ICON.tick + '</span>',
    '              </label>',
    '            </div>',
    '          </div>',

    '          <div class="ck__block ck__recap">',
    '            <div class="ck__legend"><span class="ck__legend-num latin">04</span><h3>خلاصه سفارش</h3></div>',
    '            <dl class="cart__sum cart__sum--recap">',
    '              <div class="cart__sum-row"><dt>جمع سفارش</dt><dd data-sum="subtotal"></dd></div>',
    '              <div class="cart__sum-row cart__sum-row--gold" data-row="discount" hidden><dt>تخفیف <span class="cart__sum-tag latin" data-coupon-label></span></dt><dd data-sum="discount"></dd></div>',
    '              <div class="cart__sum-row" data-row="packaging" hidden><dt>بسته‌بندی</dt><dd data-sum="packaging"></dd></div>',
    '              <div class="cart__sum-row" data-row="delivery" hidden><dt data-delivery-label>ارسال با پیک</dt><dd data-sum="delivery"></dd></div>',
    '              <div class="cart__sum-row"><dt>مالیات بر ارزش افزوده</dt><dd data-sum="tax"></dd></div>',
    '              <div class="cart__sum-row" data-row="wallet" hidden><dt>کیف پول شاما</dt><dd data-sum="wallet"></dd></div>',
    '            </dl>',
    '            <div class="ck__grand">',
    '              <span>مبلغ قابل پرداخت</span>',
    '              <b data-sum="total" aria-live="polite" aria-atomic="true"></b>',
    '            </div>',
    '          </div>',
    '        </div>',

    '        <footer class="cart__foot ck__foot" id="ckFoot">',
    '          <div class="ck__foot-total">',
    '            <span>مبلغ قابل پرداخت</span>',
    '            <b data-sum="total"></b>',
    '          </div>',
    '          <button class="btn btn--gold btn--block ck__submit" id="ckSubmit" type="button">',
    '            <span class="ck__submit-txt">پرداخت و ثبت سفارش</span>',
    '            <span class="ck__spinner" aria-hidden="true"></span>',
    '          </button>',
    '          <p class="ck__foot-note tiny">با ثبت سفارش، قوانین شاما را می‌پذیرید.</p>',
    '          <p class="sr-only" id="ckStatus" aria-live="polite"></p>',
    '        </footer>',
    '      </section>',

    /* ------------------------------------------------ step 3 : done */
    '      <section class="cart__panel cart__panel--done" id="panelDone" data-panel="done" aria-label="سفارش ثبت شد" hidden>',
    '        <div class="cart__scroll cart__done" id="doneScroll">',
    '          <div class="cart__check" id="doneCheck" aria-hidden="true">',
    '            <svg viewBox="0 0 96 96" fill="none">',
    '              <circle class="cart__check-ring" cx="48" cy="48" r="44" stroke="url(#shamaCheckG)" stroke-width="1.6"/>',
    '              <path class="cart__check-mark" d="M30 49.5 42.5 62 67 35" stroke="url(#shamaCheckG)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>',
    '              <defs><linearGradient id="shamaCheckG" x1="8" y1="8" x2="88" y2="88"><stop stop-color="#F7E7BE"/><stop offset=".55" stop-color="#C9A227"/><stop offset="1" stop-color="#8A6329"/></linearGradient></defs>',
    '            </svg>',
    '          </div>',
    '          <p class="cart__done-eyebrow latin">ORDER CONFIRMED</p>',
    '          <h3 class="cart__done-title">سفارش شما ثبت شد</h3>',
    '          <p class="cart__done-sub" id="doneMode"></p>',
    '          <div class="cart__done-code">',
    '            <span>کد پیگیری</span>',
    '            <b class="latin" id="doneCode"></b>',
    '          </div>',
    '          <div class="cart__done-grid">',
    '            <div class="cart__done-card"><span>زمان تقریبی</span><b id="doneEta"></b></div>',
    '            <div class="cart__done-card"><span>امتیاز باشگاه</span><b class="gold-text" id="donePoints"></b></div>',
    '          </div>',
    '          <div class="cart__done-total">مبلغ پرداخت‌شده <b data-done-total></b></div>',
    '          <ol class="cart__track" id="doneTrack" aria-label="وضعیت سفارش">',
    '            <li class="is-active"><span class="cart__track-dot"></span><b>ثبت شد</b><small>همین حالا</small></li>',
    '            <li><span class="cart__track-dot"></span><b>در حال آماده‌سازی</b><small>چند دقیقه</small></li>',
    '            <li><span class="cart__track-dot"></span><b>ارسال</b><small>در راه شما</small></li>',
    '          </ol>',
    '          <div class="cart__done-actions">',
    '            <button class="btn btn--ghost btn--block" id="doneBack" type="button">بازگشت به سایت</button>',
    '            <button class="btn btn--gold btn--block" id="doneAgain" type="button">سفارش دوباره</button>',
    '          </div>',
    '        </div>',
    '      </section>',
    '    </div>',
    '  </aside>',
    '</div>',

    '<button class="cart__bar" id="cartBar" type="button" aria-label="باز کردن سبد خرید">',
    '  <span class="cart__bar-icon">' + ICON.bag + '</span>',
    '  <span class="cart__bar-txt"><b id="cartBarCount"></b><small id="cartBarTotal"></small></span>',
    '  <span class="cart__bar-go">ادامه ' + ICON.arrow + '</span>',
    '</button>'
  ].join('\n');

  /* ----------------------------------------------------------------- refs */
  var root = $('#shamaCart', mount);
  var drawer = $('#cartDrawer', mount);
  var stepEl = $('#cartStep', mount);
  var titleEl = $('#cartTitle', mount);
  var subEl = $('#cartSub', mount);
  var badge = $('#cartBadge', mount);
  var badgeN = $('#cartBadgeN', mount);
  var backBtn = $('#cartBack', mount);
  var closeBtn = $('#cartClose', mount);
  var panels = $$('[data-panel]', drawer);
  var panelList = $('#panelList', drawer);
  var panelCheckout = $('#panelCheckout', drawer);
  var panelDone = $('#panelDone', drawer);
  var listScroll = $('#cartScroll', drawer);
  var ckScroll = $('#ckScroll', drawer);

  var emptyEl = $('#cartEmpty', drawer);
  var emptyCta = $('#cartEmptyCta', drawer);
  var linesEl = $('#cartLines', drawer);
  var clearWrap = $('#cartClearWrap', drawer);
  var clearBtn = $('#cartClear', drawer);

  var couponBox = $('#cartCouponBox', drawer);
  var couponRow = $('#cartCouponRow', drawer);
  var couponInput = $('#cartCouponInput', drawer);
  var couponApply = $('#cartCouponApply', drawer);
  var couponMsg = $('#cartCouponMsg', drawer);
  var chipWrap = $('#cartChipWrap', drawer);
  var chipCode = $('#cartChipCode', drawer);
  var chipLabel = $('#cartChipLabel', drawer);
  var chipRemove = $('#cartChipRemove', drawer);
  var suggestWrap = $('#cartSuggest', drawer);

  var shipBox = $('#cartShipBox', drawer);
  var shipText = $('#cartShipText', drawer);
  var shipPct = $('#cartShipPct', drawer);
  var shipFill = $('#cartShipFill', drawer);

  var walletRow = $('#cartWalletRow', drawer);
  var walletToggle = $('#cartWalletToggle', drawer);
  var walletBal = $('#cartWalletBal', drawer);
  var toCheckout = $('#cartToCheckout', drawer);
  var ctaTotal = $('#cartCtaTotal', drawer);

  var modeBtns = $$('[data-mode]', $('#ckModes', drawer));
  var addressField = $('#ckAddressField', drawer);
  var addressEl = $('#ckAddress', drawer);
  var tableBlock = $('#ckTableBlock', drawer);
  var tableEl = $('#ckTable', drawer);
  var pickupHint = $('#ckPickupHint', drawer);
  var nameEl = $('#ckName', drawer);
  var phoneEl = $('#ckPhone', drawer);
  var slotEl = $('#ckSlot', drawer);
  var slotCustomField = $('#ckSlotCustomField', drawer);
  var slotCustomEl = $('#ckSlotCustom', drawer);
  var noteEl = $('#ckNote', drawer);
  var payRadios = $$('input[name="shamaPay"]', drawer);
  var payCards = $$('.ck__pay-card', drawer);
  var payWallet = $('#ckPayWallet', drawer);
  var payWalletCard = $('#ckPayWalletCard', drawer);
  var payWalletBal = $('#ckPayWalletBal', drawer);
  var payWalletWarn = $('#ckPayWalletWarn', drawer);
  var submitBtn = $('#ckSubmit', drawer);
  var statusEl = $('#ckStatus', drawer);

  var doneCode = $('#doneCode', drawer);
  var doneEta = $('#doneEta', drawer);
  var donePoints = $('#donePoints', drawer);
  var doneMode = $('#doneMode', drawer);
  var doneTotal = $('[data-done-total]', drawer);
  var doneBack = $('#doneBack', drawer);
  var doneAgain = $('#doneAgain', drawer);
  var doneCheck = $('#doneCheck', drawer);

  var bar = $('#cartBar', mount);
  var barCount = $('#cartBarCount', mount);
  var barTotal = $('#cartBarTotal', mount);

  /* ----------------------------------------------------------------- state */
  var view = 'list';
  var isOpen = false;
  var busy = false;
  var payMethod = 'online';
  var lockOwner = false;
  var lastFocus = null;
  var lastOrder = null;
  var couponMsgState = { type: '', text: '' };

  var SLOT_LABEL = { asap: 'در اسرع وقت', '30': '۳۰ دقیقه دیگر', '60': '۱ ساعت دیگر', custom: 'زمان دلخواه' };
  var VIEW_META = {
    list: { step: 'ORDER / 01', title: 'سبد شما', sub: 'یک سفارش کوچک، یک شب طلایی.' },
    checkout: { step: 'ORDER / 02', title: 'تکمیل سفارش', sub: 'جزئیات تحویل و پرداخت را کامل کنید.' },
    done: { step: 'ORDER / 03', title: 'سفارش ثبت شد', sub: 'رسید و پیگیری سفارش شما.' }
  };

  /* ---------------------------------------------------------------- rows */
  function rowHTML(line) {
    var img = line.img
      ? '<img src="' + esc(line.img) + '" alt="" width="72" height="72" loading="lazy" decoding="async">'
      : '';
    return '' +
      '<div class="cart__thumb">' + thumbSVG() + img + '</div>' +
      '<div class="cart__line-body">' +
        '<div class="cart__line-top">' +
          '<h3 class="cart__line-name">' + esc(line.name) + '</h3>' +
          '<button class="cart__line-del" type="button" data-act="remove" aria-label="حذف ' + esc(line.name) + ' از سبد">' + ICON.close + '</button>' +
        '</div>' +
        (line.note ? '<p class="cart__line-note">' + esc(line.note) + '</p>' : '') +
        '<div class="cart__line-foot">' +
          '<div class="cart__qty" role="group" aria-label="تعداد ' + esc(line.name) + '">' +
            '<button class="cart__qty-btn" type="button" data-act="dec" aria-label="کاهش تعداد ' + esc(line.name) + '">' + ICON.minus + '</button>' +
            '<span class="cart__qty-n num" data-qty>' + fa(line.qty) + '</span>' +
            '<button class="cart__qty-btn" type="button" data-act="inc" aria-label="افزایش تعداد ' + esc(line.name) + '">' + ICON.plus + '</button>' +
          '</div>' +
          '<div class="cart__line-price">' +
            '<span class="cart__line-total" data-total>' + m(line.price * line.qty) + '</span>' +
            '<span class="cart__line-unit">واحد ' + m(line.price) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function syncLines() {
    var lines = B.lines();
    var alive = {};
    var existing = {};
    $$('.cart__line', linesEl).forEach(function (li) { existing[li.dataset.key] = li; });

    lines.forEach(function (line, i) {
      alive[line.key] = true;
      var li = existing[line.key];
      if (!li) {
        li = document.createElement('li');
        li.className = 'cart__line';
        li.dataset.key = line.key;
        li.dataset.qty = String(line.qty);
        li.style.setProperty('--i', String(i));
        li.innerHTML = rowHTML(line);
        if (linesEl.children[i] !== li) linesEl.insertBefore(li, linesEl.children[i] || null);
        var img = li.querySelector('img');
        if (img) {
          img.addEventListener('error', function () {
            var th = li.querySelector('.cart__thumb');
            if (th) th.classList.add('is-broken');
          }, { once: true });
        }
        return;
      }
      var qn = li.querySelector('[data-qty]');
      if (li.dataset.qty !== String(line.qty)) {
        if (qn) {
          qn.textContent = fa(line.qty);
          qn.classList.remove('is-bump');
          void qn.offsetWidth;
          qn.classList.add('is-bump');
        }
        li.dataset.qty = String(line.qty);
      }
      var tot = li.querySelector('[data-total]');
      if (tot) tot.innerHTML = m(line.price * line.qty);
      if (linesEl.children[i] !== li) linesEl.insertBefore(li, linesEl.children[i] || null);
    });

    $$('.cart__line', linesEl).forEach(function (li) {
      if (!alive[li.dataset.key]) li.remove();
    });
  }

  /* --------------------------------------------------------------- totals */
  function fillSums(scope, t, st) {
    $$('[data-sum]', scope).forEach(function (el) {
      switch (el.getAttribute('data-sum')) {
        case 'subtotal': el.innerHTML = m(t.subtotal); break;
        case 'discount': el.innerHTML = '− ' + m(t.discount); break;
        case 'packaging': el.innerHTML = m(t.packaging); break;
        case 'delivery': el.innerHTML = t.delivery ? m(t.delivery) : '<span class="cart__free">رایگان</span>'; break;
        case 'tax': el.innerHTML = m(t.tax); break;
        case 'wallet': el.innerHTML = '− ' + m(t.wallet); break;
        case 'total': el.innerHTML = m(t.total); break;
        default: break;
      }
    });
    var hasDelivery = st.mode === 'delivery';
    $$('[data-row="discount"]', scope).forEach(function (r) { r.hidden = !t.discount; });
    $$('[data-row="delivery"]', scope).forEach(function (r) { r.hidden = !hasDelivery; });
    $$('[data-row="packaging"]', scope).forEach(function (r) { r.hidden = !hasDelivery; });
    $$('[data-row="wallet"]', scope).forEach(function (r) { r.hidden = !t.wallet; });
    $$('[data-coupon-label]', scope).forEach(function (el) {
      var c = B.couponInfo(st.coupon);
      el.textContent = c ? c.label : '';
      el.hidden = !c;
    });
    $$('[data-delivery-label]', scope).forEach(function (el) {
      el.textContent = st.mode === 'pickup' ? 'تحویل حضوری' : st.mode === 'table' ? 'سرو سر میز' : 'ارسال با پیک';
    });
  }

  function renderShip(st, t) {
    var active = st.mode === 'delivery' && t.subtotal > 0 && B.count() > 0;
    shipBox.hidden = !active;
    if (!active) return;
    var c = B.couponInfo(st.coupon);
    var free = t.subtotal >= CFG.freeDeliveryFrom || (c && c.kind === 'ship');
    var pct = free ? 1 : Math.min(1, t.subtotal / CFG.freeDeliveryFrom);
    shipFill.style.width = (pct * 100).toFixed(2) + '%';
    shipBox.classList.toggle('is-done', free);
    shipText.innerHTML = free
      ? '<b>ارسال رایگان فعال شد</b>'
      : m(t.freeShipGap) + ' تا ارسال رایگان';
    shipPct.textContent = fa(Math.round(pct * 100)) + '٪';
  }

  /* --------------------------------------------------------------- coupon */
  function renderCoupon(st, t) {
    var c = B.couponInfo(st.coupon);
    var has = !!c;
    var inactive = !!(c && c.kind !== 'ship' && t.subtotal < (c.min || 0));
    couponRow.hidden = has;
    chipWrap.hidden = !has;
    chipWrap.classList.toggle('is-inactive', inactive);
    if (has) {
      chipCode.textContent = st.coupon;
      chipLabel.textContent = c.label;
    }
    var type = couponMsgState.type;
    var text = couponMsgState.text;
    if (inactive) {
      type = 'err';
      text = 'مبلغ سبد کمتر از حداقل این کد است؛ تخفیف اعمال نشد.';
    }
    couponMsg.textContent = text;
    couponMsg.className = 'cart__hint' + (type ? ' is-' + type : '');
    couponMsg.hidden = !text;
    $$('[data-coupon]', suggestWrap).forEach(function (b) {
      b.classList.toggle('is-active', has && st.coupon === b.getAttribute('data-coupon'));
    });
  }

  /* ---------------------------------------------------------------- list */
  function renderList(st, t) {
    var n = B.count();
    panelList.classList.toggle('is-empty', n === 0);
    emptyEl.hidden = n > 0;
    linesEl.hidden = n === 0;
    clearWrap.hidden = n === 0;
    couponBox.hidden = n === 0;
    badge.hidden = n === 0 || view !== 'list';
    badgeN.textContent = fa(n);
    clearWrap.hidden = n === 0;
    clearBtn.disabled = n === 0;

    syncLines();
    fillSums(panelList, t, st);
    renderShip(st, t);
    renderCoupon(st, t);

    walletToggle.checked = !!st.useWallet;
    walletToggle.disabled = st.wallet <= 0 || n === 0;
    walletBal.textContent = fmt(st.wallet);
    walletRow.classList.toggle('is-on', !!st.useWallet);
    walletRow.classList.toggle('is-off', st.wallet <= 0);

    ctaTotal.innerHTML = m(t.total);
    toCheckout.disabled = n === 0;
  }

  /* ------------------------------------------------------------ checkout */
  function syncPayCards() {
    payRadios.forEach(function (r) {
      var card = r.closest('.ck__pay-card');
      if (card) card.classList.toggle('is-checked', r.checked);
    });
  }

  function renderCheckout(st, t) {
    modeBtns.forEach(function (b) {
      var on = b.getAttribute('data-mode') === st.mode;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    if (addressField) addressField.hidden = st.mode !== 'delivery';
    tableBlock.hidden = st.mode !== 'table';
    pickupHint.hidden = st.mode !== 'pickup';

    fillSums(panelCheckout, t, st);

    payWalletBal.innerHTML = m(st.wallet);
    var short = st.wallet <= 0 || t.total > st.wallet;
    payWallet.disabled = short;
    payWalletCard.classList.toggle('is-disabled', short);
    payWalletWarn.hidden = !short;
    if (short && payRadios.length > 1 && payWallet.checked) {
      payRadios[0].checked = true;
      payMethod = payRadios[0].value;
    }
    if (short && payWallet.disabled && payMethod === 'wallet') payMethod = 'online';
    syncPayCards();
  }

  /* ------------------------------------------------------------------ bar */
  function renderBar(st, t, n) {
    var on = n > 0 && !isOpen;
    bar.classList.toggle('is-on', on);
    bar.tabIndex = on ? 0 : -1;
    if (on) bar.removeAttribute('aria-hidden');
    else bar.setAttribute('aria-hidden', 'true');
    barCount.textContent = fa(n) + ' آیتم';
    barTotal.innerHTML = m(t.total);
  }

  /* --------------------------------------------------------------- render */
  function render() {
    var st = B.state();
    var t = B.totals();
    var n = B.count();
    if (view === 'done' && n > 0) setView('list');
    renderList(st, t);
    renderCheckout(st, t);
    renderBar(st, t, n);
  }

  /* ----------------------------------------------------------------- view */
  function setView(v) {
    if (!VIEW_META[v]) return;
    view = v;
    var meta = VIEW_META[v];
    stepEl.textContent = meta.step;
    titleEl.textContent = meta.title;
    subEl.textContent = meta.sub;
    panels.forEach(function (p) {
      var on = p.getAttribute('data-panel') === v;
      p.hidden = !on;
      p.classList.toggle('is-active', on);
    });
    backBtn.hidden = v !== 'checkout';
    badge.hidden = v !== 'list' || B.count() === 0;
    listScroll.scrollTop = 0;
    ckScroll.scrollTop = 0;
    render();
    if (isOpen) {
      try { titleEl.focus({ preventScroll: true }); } catch (e) { /* older browser */ }
    }
  }

  /* ----------------------------------------------------------- open/close */
  function lockScroll() {
    if (!document.body.classList.contains('no-scroll')) {
      document.body.classList.add('no-scroll');
      lockOwner = true;
    }
  }
  function unlockScroll() {
    if (lockOwner) {
      document.body.classList.remove('no-scroll');
      lockOwner = false;
    }
  }

  function focusables() {
    return $$('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])', drawer)
      .filter(function (el) {
        return el.type !== 'hidden' && el.getClientRects().length > 0;
      });
  }

  function onKey(e) {
    if (!isOpen) return;
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (busy) return;
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    var f = focusables();
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];
    var act = document.activeElement;
    if (e.shiftKey && (act === first || act === drawer)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && act === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function open() {
    if (isOpen) return;
    if (view === 'done' || (view === 'checkout' && B.count() === 0)) setView('list');
    isOpen = true;
    lastFocus = document.activeElement;
    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    lockScroll();
    document.addEventListener('keydown', onKey, true);
    render();
    try { drawer.focus({ preventScroll: true }); } catch (e) { /* noop */ }
  }

  function close() {
    if (!isOpen || busy) return;
    isOpen = false;
    document.removeEventListener('keydown', onKey, true);
    root.classList.remove('is-open');
    if (lastFocus && typeof lastFocus.focus === 'function') {
      try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* noop */ }
    }
    root.setAttribute('aria-hidden', 'true');
    unlockScroll();
    render();
  }

  /* ------------------------------------------------------------- feedback */
  function markField(input, msg) {
    var f = input.closest('.field');
    if (!f) return;
    f.classList.toggle('is-err', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    var err = f.querySelector('.ck__err');
    if (err) {
      err.hidden = !msg;
      err.textContent = msg || '';
    }
  }

  function clearErrors() {
    $$('.ck__err', panelCheckout).forEach(function (e) { e.hidden = true; e.textContent = ''; });
    $$('.field', panelCheckout).forEach(function (f) { f.classList.remove('is-err'); });
  }

  function setBusy(v) {
    busy = v;
    submitBtn.classList.toggle('is-busy', v);
    submitBtn.disabled = v;
    submitBtn.setAttribute('aria-busy', String(v));
    backBtn.disabled = v;
    closeBtn.disabled = v;
  }

  function applyCode(code) {
    var raw = String(code || '').trim();
    if (!raw) {
      couponMsgState = { type: 'err', text: 'کد تخفیف را وارد کنید.' };
      render();
      return;
    }
    var res = B.applyCoupon(raw);
    couponMsgState = { type: res.ok ? 'ok' : 'err', text: res.msg };
    if (res.ok) couponInput.value = '';
    render();
    if (!res.ok) couponInput.focus();
  }

  /* ---------------------------------------------------------------- order */
  function paintDone(order) {
    lastOrder = order;
    doneCode.textContent = order.id;
    doneEta.textContent = order.mode === 'pickup' ? '۱۵ دقیقه' : order.mode === 'table' ? '۱۰ دقیقه' : '۴۵–۶۰ دقیقه';
    donePoints.textContent = '+' + fa(order.totals.points) + ' امتیاز';
    doneMode.textContent = order.mode === 'pickup'
      ? 'تحویل حضوری · شعبه ونک'
      : order.mode === 'table'
        ? 'سرو سر میز ' + fa(order.table || '')
        : 'ارسال با پیک · تهران';
    doneTotal.innerHTML = m(order.totals.total);
    doneCheck.classList.remove('is-anim');
    void doneCheck.offsetWidth;
    doneCheck.classList.add('is-anim');
    setView('done');
    drawer.scrollTop = 0;
  }

  function submit() {
    if (busy || !B.count()) return;
    clearErrors();
    var st = B.state();
    var t = B.totals();
    var name = nameEl.value.trim();
    var phoneEn = U.Fa.toEn(phoneEl.value).replace(/[^\d]/g, '');
    var addr = addressEl.value.trim();
    var table = tableEl.value;
    var bad = null;

    if (name.length < 2) { markField(nameEl, 'نام و نام خانوادگی را وارد کنید.'); bad = bad || nameEl; }
    if (!/^09\d{9}$/.test(phoneEn)) { markField(phoneEl, 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.'); bad = bad || phoneEl; }
    if (st.mode === 'delivery' && addr.length < 8) { markField(addressEl, 'آدرس دقیق تحویل را وارد کنید.'); bad = bad || addressEl; }
    if (st.mode === 'table' && !table) { markField(tableEl, 'شماره میز را انتخاب کنید.'); bad = bad || tableEl; }
    if (slotEl.value === 'custom' && !slotCustomEl.value.trim()) { markField(slotCustomEl, 'زمان دلخواه را وارد کنید.'); bad = bad || slotCustomEl; }

    if (bad) {
      bad.focus();
      S.toast('لطفاً موارد مشخص‌شده را کامل کنید');
      return;
    }
    if (payMethod === 'wallet' && t.total > st.wallet) {
      S.toast('موجودی کیف پول کافی نیست');
      payWalletCard.classList.add('is-disabled');
      return;
    }

    var slot = slotEl.value === 'custom' ? slotCustomEl.value.trim() : (SLOT_LABEL[slotEl.value] || 'در اسرع وقت');
    var payload = {
      name: name,
      phone: phoneEn,
      address: st.mode === 'delivery' ? addr : '',
      note: noteEl.value.trim(),
      slot: slot,
      payMethod: payMethod
    };
    if (st.mode === 'table') payload.table = table;

    setBusy(true);
    statusEl.textContent = 'در حال ثبت سفارش…';

    window.setTimeout(function () {
      var order = B.placeOrder(payload);
      B.resetAfterOrder();
      setBusy(false);
      statusEl.textContent = '';
      if (phoneEn) phoneEl.value = fa(phoneEn);
      paintDone(order);
    }, 1200);
  }

  /* -------------------------------------------------------------- events */
  $$('[data-close]', mount).forEach(function (el) { el.addEventListener('click', close); });
  closeBtn.addEventListener('click', close);
  backBtn.addEventListener('click', function () { if (!busy) setView('list'); });
  emptyCta.addEventListener('click', function () {
    close();
    var menu = document.getElementById('menu');
    if (menu) menu.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    else window.location.hash = '#menu';
  });

  linesEl.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-act]');
    if (!btn) return;
    var li = btn.closest('.cart__line');
    if (!li) return;
    var key = li.dataset.key;
    var line = B.lines().filter(function (l) { return l.key === key; })[0];
    if (!line) return;
    var act = btn.getAttribute('data-act');
    if (act === 'inc') B.setQty(key, line.qty + 1);
    else if (act === 'dec') B.setQty(key, line.qty - 1);
    else if (act === 'remove') B.remove(key);
  });

  clearBtn.addEventListener('click', function () {
    B.clear();
    S.toast('سبد خرید خالی شد');
  });

  couponApply.addEventListener('click', function () { applyCode(couponInput.value); });
  couponInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); applyCode(couponInput.value); }
  });
  suggestWrap.addEventListener('click', function (e) {
    var b = e.target.closest('[data-coupon]');
    if (!b) return;
    applyCode(b.getAttribute('data-coupon'));
  });
  chipRemove.addEventListener('click', function () {
    B.removeCoupon();
    couponMsgState = { type: '', text: '' };
    couponInput.value = '';
    render();
  });

  walletToggle.addEventListener('change', function () { B.setWalletUse(walletToggle.checked); });
  toCheckout.addEventListener('click', function () {
    if (!B.count()) return;
    setView('checkout');
  });

  $('#ckModes', drawer).addEventListener('click', function (e) {
    var b = e.target.closest('[data-mode]');
    if (!b) return;
    var mode = b.getAttribute('data-mode');
    if (mode === B.state().mode) return;
    B.setMode(mode);
    if (mode === 'table') tableEl.focus();
  });

  tableEl.addEventListener('change', function () { B.setTable(tableEl.value); });

  slotEl.addEventListener('change', function () {
    var custom = slotEl.value === 'custom';
    slotCustomField.hidden = !custom;
    if (custom) slotCustomEl.focus();
  });

  payRadios.forEach(function (r) {
    r.addEventListener('change', function () {
      if (!r.checked) return;
      payMethod = r.value;
      payWalletCard.classList.remove('is-disabled');
      syncPayCards();
    });
  });

  submitBtn.addEventListener('click', submit);

  doneBack.addEventListener('click', function () { close(); });
  doneAgain.addEventListener('click', function () {
    setView('list');
    var o = lastOrder;
    if (o && o.lines && o.lines.length) {
      o.lines.forEach(function (l) {
        B.add({ id: l.id, key: l.key, name: l.name, price: l.price, img: l.img, note: l.note }, l.qty);
      });
      S.toast('سفارش قبلی دوباره به سبد اضافه شد', { icon: 'bag' });
    }
    if (isOpen) {
      try { titleEl.focus({ preventScroll: true }); } catch (e) { /* noop */ }
    }
  });

  bar.addEventListener('click', open);

  /* ------------------------------------------------------------- public API */
  S.cartUI = {
    open: open,
    close: close,
    toggle: function () { if (isOpen) close(); else open(); },
    isOpen: function () { return isOpen; },
    step: function () { return view; }
  };

  /* ------------------------------------------------------------------ init */
  S.on(render);
  render();
})();
