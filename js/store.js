/* ============================================================
   SHAMA — shared store, money helpers, toast
   Contract used by every section module.
   ============================================================ */
(function () {
  'use strict';

  const FA = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const fa = (s) => String(s).replace(/\d/g, (d) => FA[+d]);
  const fmt = (n) => fa(Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '٬'));
  const money = (n) => fmt(n) + ' تومان';

  const Fa = {
    // keep numbers LTR-safe inside RTL text
    toEn: (s) => String(s).replace(/[۰-۹]/g, (d) => String(FA.indexOf(d))),
  };

  /* ------------------------------------------------------------ config */
  const CONFIG = {
    deliveryFee: 45000,
    freeDeliveryFrom: 1500000,
    taxRate: 0.09,
    packaging: 15000,
    walletBalance: 240000,
    pointsPerToman: 1 / 10000,
    coupons: {
      SHAMA10: { kind: 'percent', value: 10, max: 300000, min: 0, label: '۱۰٪ تخفیف سفارش' },
      GOLD20: { kind: 'percent', value: 20, max: 450000, min: 800000, label: '۲۰٪ تخفیف طلایی' },
      FIRST: { kind: 'amount', value: 80000, min: 500000, label: '۸۰ هزار تومان تخفیف اولین سفارش' },
      LATTE: { kind: 'ship', value: 0, min: 0, label: 'ارسال رایگان' },
    },
  };

  /* ------------------------------------------------------------- state */
  const KEY = 'shama.cart.v1';
  const state = {
    lines: [],           // {key, id, name, price, qty, img, note}
    coupon: null,        // code
    useWallet: false,
    mode: 'delivery',    // delivery | pickup | table
    table: null,
    points: 1240,
    wallet: CONFIG.walletBalance,
    lastOrder: null,
  };

  const listeners = new Set();
  const on = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
  const emit = (reason) => {
    persist();
    listeners.forEach((fn) => { try { fn(reason); } catch (e) { console.warn(e); } });
    document.dispatchEvent(new CustomEvent('shama:change', { detail: { reason } }));
  };

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        lines: state.lines, coupon: state.coupon, useWallet: state.useWallet,
        mode: state.mode, points: state.points, wallet: state.wallet,
      }));
    } catch (e) { /* private mode */ }
  }
  function restore() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (Array.isArray(d.lines)) state.lines = d.lines;
      if (d.coupon) state.coupon = d.coupon;
      if (typeof d.useWallet === 'boolean') state.useWallet = d.useWallet;
      if (d.mode) state.mode = d.mode;
      if (typeof d.points === 'number') state.points = d.points;
      if (typeof d.wallet === 'number') state.wallet = d.wallet;
    } catch (e) { /* ignore */ }
  }

  /* -------------------------------------------------------------- lines */
  function add(item, qty) {
    const q = Math.max(1, qty || 1);
    const key = item.key || item.id;
    const line = state.lines.find((l) => l.key === key);
    if (line) line.qty = Math.min(20, line.qty + q);
    else state.lines.push({
      key,
      id: item.id,
      name: item.name,
      price: item.price,
      img: item.img || null,
      note: item.note || '',
      qty: q,
    });
    emit('add');
    return state.lines.find((l) => l.key === key);
  }
  const setQty = (key, qty) => {
    const line = state.lines.find((l) => l.key === key);
    if (!line) return;
    if (qty <= 0) state.lines = state.lines.filter((l) => l.key !== key);
    else line.qty = Math.min(20, qty);
    if (!state.lines.length) state.coupon = null;
    emit('qty');
  };
  const remove = (key) => setQty(key, 0);
  const clear = () => { state.lines = []; state.coupon = null; state.useWallet = false; emit('clear'); };
  const count = () => state.lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = () => state.lines.reduce((s, l) => s + l.price * l.qty, 0);

  /* ------------------------------------------------------------ coupons */
  function couponInfo(code) {
    const c = CONFIG.coupons[String(code || '').trim().toUpperCase()];
    return c ? { code: String(code).trim().toUpperCase(), ...c } : null;
  }
  function discountValue() {
    const c = couponInfo(state.coupon);
    if (!c) return 0;
    const sub = subtotal();
    if (sub < (c.min || 0)) return 0;
    if (c.kind === 'percent') return Math.min(Math.round(sub * c.value / 100), c.max || Infinity);
    if (c.kind === 'amount') return Math.min(c.value, sub);
    return 0;
  }
  function applyCoupon(code) {
    const c = couponInfo(code);
    if (!c) return { ok: false, msg: 'این کد تخفیف معتبر نیست.' };
    if (subtotal() < (c.min || 0)) return { ok: false, msg: 'حداقل مبلغ سفارش برای این کد ' + money(c.min) + ' است.' };
    state.coupon = c.code;
    emit('coupon');
    return { ok: true, msg: c.label + ' اعمال شد.' };
  }
  const removeCoupon = () => { state.coupon = null; emit('coupon'); };

  /* ------------------------------------------------------------ totals */
  function totals() {
    const sub = subtotal();
    const c = couponInfo(state.coupon);
    const discount = discountValue();
    let delivery = 0;
    let packaging = 0;
    if (state.mode !== 'pickup') {
      delivery = sub >= CONFIG.freeDeliveryFrom || (c && c.kind === 'ship') ? 0 : CONFIG.deliveryFee;
      packaging = CONFIG.packaging;
    }
    if (state.mode === 'table') { delivery = 0; packaging = 0; }
    const base = Math.max(0, sub - discount);
    const tax = Math.round(base * CONFIG.taxRate);
    let wallet = state.useWallet && sub > 0 ? Math.min(state.wallet, base + tax + delivery + packaging) : 0;
    const total = Math.max(0, base + tax + delivery + packaging - wallet);
    return {
      subtotal: sub, discount, delivery, packaging, tax, wallet, total,
      savings: discount + (delivery === 0 && sub > 0 && c && c.kind === 'ship' ? CONFIG.deliveryFee : 0),
      freeShipGap: Math.max(0, CONFIG.freeDeliveryFrom - sub),
      points: Math.floor(total * CONFIG.pointsPerToman),
    };
  }

  /* ------------------------------------------------------------- wallet */
  const setWalletUse = (v) => { state.useWallet = !!v; emit('wallet'); };
  const setMode = (m) => { state.mode = m; emit('mode'); };
  const setTable = (t) => { state.table = t; emit('table'); };

  /* -------------------------------------------------------------- order */
  function placeOrder(payload) {
    const t = totals();
    const id = 'SH-' + String(Math.floor(1000 + Math.random() * 8999));
    state.lastOrder = {
      id, at: Date.now(), ...payload,
      lines: state.lines.map((l) => ({ ...l })),
      totals: t, mode: state.mode,
    };
    state.points += t.points;
    if (t.wallet) state.wallet = Math.max(0, state.wallet - t.wallet);
    emit('order');
    return state.lastOrder;
  }
  function resetAfterOrder() {
    state.lines = []; state.coupon = null; state.useWallet = false;
    persist();
    listeners.forEach((fn) => { try { fn('reset'); } catch (e) {} });
    document.dispatchEvent(new CustomEvent('shama:change', { detail: { reason: 'reset' } }));
  }

  /* -------------------------------------------------------------- toast */
  let toastHost = null;
  function toast(msg, opts) {
    opts = opts || {};
    if (!toastHost) {
      toastHost = document.getElementById('toasts');
      if (!toastHost) {
        toastHost = document.createElement('div');
        toastHost.id = 'toasts';
        document.body.appendChild(toastHost);
      }
    }
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span></span>';
    el.querySelector('span').textContent = msg;
    if (opts.icon === 'bag') {
      el.querySelector('svg').outerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
    }
    toastHost.appendChild(el);
    while (toastHost.children.length > 3) toastHost.firstElementChild.remove();
    setTimeout(() => {
      el.classList.add('is-out');
      setTimeout(() => el.remove(), 420);
    }, opts.duration || 2600);
  }

  /* --------------------------------------------------------------- init */
  restore();

  window.Shama = {
    vendor: (window.SHAMA && window.SHAMA.vendor) || {},
    data: (window.SHAMA && window.SHAMA.categories) || [],
    CONFIG,
    util: { fmt, money, fa, Fa },
    basket: {
      state: () => state,
      lines: () => state.lines,
      add, setQty, remove, clear, count, subtotal,
      applyCoupon, removeCoupon, couponInfo,
      totals, setWalletUse, setMode, setTable,
      placeOrder, resetAfterOrder,
    },
    on, emit, toast,
  };
})();
