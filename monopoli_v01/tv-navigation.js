/* tv-navigation.js - navigasi remote / keyboard (D-pad, OK, Back, Spasi) dengan fokus spasial */
window.MD = window.MD || {};
(function (MD) {
  'use strict';
  const SEL = 'button:not([disabled]),[data-nav],input:not([disabled]),select:not([disabled]),a[href]';
  const BACK_KEYS = ['Escape', 'GoBack', 'BrowserBack', 'XF86Back'];
  const BACK_CODES = [27, 4, 10009, 461, 166];
  const root = document.documentElement;

  function visible(el) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  }
  function scope() {
    const m = MD.UI && MD.UI.topModal && MD.UI.topModal();
    return m ? m.el : (document.querySelector('.screen.active') || document.body);
  }
  function list(sc) { return Array.prototype.filter.call(sc.querySelectorAll(SEL), visible); }
  function primary(sc) {
    const p = Array.prototype.filter.call(sc.querySelectorAll('[data-primary]:not([disabled])'), visible);
    return p[0] || null;
  }
  function focusEl(el) { if (!el) return false; try { el.focus({ preventScroll: false }); } catch (e) { el.focus(); } return document.activeElement === el; }

  function ensureFocus(sc) {
    sc = sc || scope();
    const a = document.activeElement;
    if (a && a !== document.body && sc.contains(a) && visible(a) && !a.disabled) return;
    const first = primary(sc) || sc.querySelector('[data-autofocus]') || list(sc)[0];
    focusEl(first);
  }

  function move(dir) {
    const sc = scope(), items = list(sc);
    const a = document.activeElement;
    if (!a || !sc.contains(a) || items.indexOf(a) < 0) { ensureFocus(sc); return; }
    const r = a.getBoundingClientRect();
    const ax = r.left + r.width / 2, ay = r.top + r.height / 2;
    let best = null, bs = Infinity;
    items.forEach((c) => {
      if (c === a) return;
      const q = c.getBoundingClientRect();
      const cx = q.left + q.width / 2, cy = q.top + q.height / 2;
      const dx = cx - ax, dy = cy - ay;
      let main, cross;
      if (dir === 'left') { main = -dx; cross = Math.abs(dy); }
      else if (dir === 'right') { main = dx; cross = Math.abs(dy); }
      else if (dir === 'up') { main = -dy; cross = Math.abs(dx); }
      else { main = dy; cross = Math.abs(dx); }
      if (main <= 3) return;
      const score = main + cross * 2.2;
      if (score < bs) { bs = score; best = c; }
    });
    if (best) focusEl(best);
  }

  function onKey(ev) {
    const t = ev.target;
    const typing = t && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && /text|number|search/.test(t.type)));
    const key = ev.key, code = ev.keyCode;
    if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown') {
      if (typing && (key === 'ArrowLeft' || key === 'ArrowRight')) return;
      ev.preventDefault();
      root.classList.add('kbd');
      move(key.replace('Arrow', '').toLowerCase());
      return;
    }
    if (key === 'Enter') {
      if (t && t.matches && t.matches('[data-nav]') && !t.matches('button,input,a')) { ev.preventDefault(); t.click(); }
      root.classList.add('kbd');
      return;
    }
    if (BACK_KEYS.indexOf(key) >= 0 || BACK_CODES.indexOf(code) >= 0 || (key === 'Backspace' && !typing)) {
      if (MD.UI && MD.UI.back && MD.UI.back()) { ev.preventDefault(); }
      return;
    }
    if ((key === ' ' || key === 'Spacebar') && !typing) {
      const p = primary(scope());
      ev.preventDefault();
      if (p) { root.classList.add('kbd'); p.click(); }
    }
  }
  function onKeyUp(ev) {
    const typing = ev.target && ev.target.tagName === 'INPUT' && /text|number/.test(ev.target.type);
    if ((ev.key === ' ' || ev.key === 'Spacebar') && !typing) ev.preventDefault(); // cegah klik ganda tombol fokus
  }

  document.addEventListener('keydown', onKey);
  document.addEventListener('keyup', onKeyUp);
  document.addEventListener('pointerdown', () => root.classList.remove('kbd'), true);
  /* fokus tidak boleh lepas dari modal */
  document.addEventListener('focusout', () => {
    setTimeout(() => {
      const m = MD.UI && MD.UI.topModal && MD.UI.topModal();
      if (m && (!document.activeElement || !m.el.contains(document.activeElement))) ensureFocus(m.el);
    }, 0);
  });

  MD.TV = {
    ensureFocus,
    focusScreen() { setTimeout(() => { if (MD.tvMode || root.classList.contains('kbd')) ensureFocus(document.querySelector('.screen.active')); }, 60); },
    focusModal(wrap) { requestAnimationFrame(() => { const f = wrap.querySelector('[data-autofocus]') || list(wrap)[0]; focusEl(f); }); },
    restore(prev) {
      setTimeout(() => {
        const m = MD.UI && MD.UI.topModal && MD.UI.topModal();
        if (m) { ensureFocus(m.el); return; }
        if (prev && document.body.contains(prev) && visible(prev) && !prev.disabled) focusEl(prev);
        else ensureFocus(scope());
      }, 30);
    }
  };
})(window.MD);
