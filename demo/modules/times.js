/* 啟賦小學堂 小工具：九九乘法速算挑戰（times）
 * 60 秒速算（指定幾的乘法／全部混合／除法）＋不計時的九九表練習
 * 依 modules/MODULE_SPEC.md：只使用 api 提供的功能，不連外部服務。
 */
(function () {
  'use strict';

  var NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  var GAME_SEC = 60;

  /* ---------- 小工具函式 ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  // 九九口訣：二三得六、三四十二、二五一十、五五二十五
  function koujue(a, b) {
    var p = a * b, s = NUM[a] + NUM[b];
    if (p < 10) return s + '得' + NUM[p];
    var t = Math.floor(p / 10), o = p % 10;
    var tens = (t === 1 ? '一十' : NUM[t] + '十');
    if (o === 0) return s + tens;
    return s + (t === 1 ? '十' : NUM[t] + '十') + NUM[o];
  }
  // 口語念法：56 → 五十六、10 → 十
  function zhNum(n) {
    if (n < 10) return NUM[n];
    var t = Math.floor(n / 10), o = n % 10;
    return (t === 1 ? '' : NUM[t]) + '十' + (o ? NUM[o] : '');
  }

  var CSS = '' +
    '.cfx-tt{--tt-hot:#F25C4B;--tt-sea:#1A86A8;--tt-sun:#FFB703;max-width:900px;margin:0 auto;color:var(--ink);font-family:inherit;-webkit-tap-highlight-color:transparent}' +
    '.cfx-tt *{box-sizing:border-box}' +
    '.cfx-tt h3{margin:4px 0 10px;font-size:22px;font-weight:900}' +
    '.cfx-tt .tt-card{background:var(--paper,#fff);border:2px solid var(--line);border-radius:var(--r-l,22px);padding:16px;box-shadow:var(--shadow,0 4px 14px rgba(0,0,0,.08));margin-bottom:14px}' +
    '.cfx-tt .tt-sub{color:var(--muted);font-size:14px;font-weight:700;margin:0 0 8px}' +
    '.cfx-tt .tt-modes{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}' +
    '@media (max-width:520px){.cfx-tt .tt-modes{grid-template-columns:1fr}}' +
    '.cfx-tt .tt-mode{min-height:72px;border-radius:18px;border:2px solid var(--line);background:var(--paper2,#f6fbf9);font:inherit;font-weight:900;font-size:17px;color:var(--ink);cursor:pointer;padding:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;box-shadow:0 3px 0 var(--line);touch-action:manipulation}' +
    '.cfx-tt .tt-mode small{font-weight:700;font-size:12.5px;color:var(--muted)}' +
    '.cfx-tt .tt-mode[aria-pressed="true"]{border-color:var(--tt-sea);background:color-mix(in srgb,var(--tt-sea) 14%,var(--paper,#fff));box-shadow:0 3px 0 var(--tt-sea)}' +
    '.cfx-tt .tt-nums{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}' +
    '.cfx-tt .tt-nums button{width:52px;height:52px;border-radius:14px;border:2px solid var(--line);background:var(--paper,#fff);font:inherit;font-weight:900;font-size:20px;color:var(--ink);cursor:pointer;touch-action:manipulation}' +
    '.cfx-tt .tt-nums button[aria-pressed="true"]{background:var(--ink);color:var(--bg,#fff);border-color:var(--ink)}' +
    '.cfx-tt .tt-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:14px}' +
    '.cfx-tt .tt-row .btn{flex:1;min-width:140px;font-size:18px;white-space:nowrap}' +
    '.cfx-tt .tt-best{display:grid;grid-template-columns:repeat(auto-fill,minmax(98px,1fr));gap:8px}' +
    '.cfx-tt .tt-best div{background:var(--paper2,#f6fbf9);border:2px solid var(--line);border-radius:14px;padding:6px 8px;text-align:center;font-size:13px;font-weight:700;color:var(--muted)}' +
    '.cfx-tt .tt-best b{display:block;font-size:22px;color:var(--ink)}' +
    /* 遊戲畫面 */
    '.cfx-tt .tt-top{display:flex;align-items:center;gap:10px;margin-bottom:8px}' +
    '.cfx-tt .tt-time{font-size:26px;font-weight:900;min-width:64px;font-variant-numeric:tabular-nums}' +
    '.cfx-tt .tt-bar{flex:1;height:14px;border-radius:999px;background:var(--line);overflow:hidden}' +
    '.cfx-tt .tt-bar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#4FC3E8,#1A86A8);border-radius:999px;transition:width .25s linear}' +
    '.cfx-tt .tt-bar.low i{background:linear-gradient(90deg,#FFC24B,#F25C4B)}' +
    '.cfx-tt .tt-score{font-weight:900;font-size:18px;white-space:nowrap}' +
    '.cfx-tt .tt-q{position:relative;overflow:hidden;text-align:center;border-radius:24px;padding:46px 10px 14px;background:var(--paper,#fff);border:3px solid var(--line);margin-bottom:12px;min-height:150px}' +
    '.cfx-tt .tt-q .eq{white-space:nowrap;font-size:clamp(38px,11.5vw,60px);font-weight:900;line-height:1.1;font-variant-numeric:tabular-nums;position:relative;z-index:1}' +
    '.cfx-tt .tt-q .ans{display:inline-block;min-width:1.6em;border-bottom:5px solid var(--tt-sea);color:var(--tt-sea)}' +
    '.cfx-tt .tt-q .msg{min-height:28px;font-weight:900;font-size:18px;margin-top:6px;position:relative;z-index:1}' +
    '.cfx-tt .tt-q.ok{border-color:#2E9E5B}.cfx-tt .tt-q.bad{border-color:#D9483B}' +
    '.cfx-tt .tt-q .msg.bad{color:#D9483B}.cfx-tt .tt-q .msg.ok{color:#2E9E5B}' +
    '.cfx-tt .tt-combo{position:absolute;top:8px;right:10px;z-index:2;font-weight:900;font-size:16px;padding:3px 10px;border-radius:999px;background:var(--tt-hot);color:#fff;opacity:0;transform:scale(.6);transition:opacity .2s,transform .2s}' +
    '.cfx-tt .tt-combo.on{opacity:1;transform:scale(1)}' +
    '.cfx-tt .tt-speed{position:absolute;inset:0;z-index:0;opacity:0;pointer-events:none;background:repeating-linear-gradient(100deg,transparent 0 22px,color-mix(in srgb,var(--tt-sun) 35%,transparent) 22px 26px);background-size:200% 100%;transition:opacity .3s}' +
    '.cfx-tt .tt-q.fast .tt-speed{opacity:.55;animation:ttRush .6s linear infinite}' +
    '.cfx-tt .tt-q.fire .tt-speed{opacity:.9;animation-duration:.3s;background:repeating-linear-gradient(100deg,transparent 0 18px,color-mix(in srgb,var(--tt-hot) 40%,transparent) 18px 24px);background-size:200% 100%}' +
    '.cfx-tt.rm .tt-q .tt-speed{animation:none!important}' +
    '@keyframes ttRush{from{background-position:0 0}to{background-position:-200px 0}}' +
    '.cfx-tt .tt-q.pop .eq{animation:ttPop .25s ease}' +
    '.cfx-tt .tt-q.shake .eq{animation:ttShake .3s ease}' +
    '.cfx-tt.rm .tt-q .eq{animation:none!important}' +
    '@keyframes ttPop{50%{transform:scale(1.12)}}' +
    '@keyframes ttShake{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}' +
    '.cfx-tt .tt-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:420px;margin:0 auto}' +
    '.cfx-tt .tt-pad button{min-height:64px;border-radius:18px;border:2px solid var(--line);background:var(--paper,#fff);font:inherit;font-weight:900;font-size:28px;color:var(--ink);cursor:pointer;box-shadow:0 4px 0 var(--line);touch-action:manipulation;user-select:none;-webkit-user-select:none}' +
    '.cfx-tt .tt-pad button:active,.cfx-tt .tt-pad button.hit{transform:translateY(3px);box-shadow:0 1px 0 var(--line)}' +
    '.cfx-tt .tt-pad .ok{background:#2E9E5B;border-color:#2E9E5B;color:#fff;box-shadow:0 4px 0 #1E6E3F}' +
    '.cfx-tt .tt-pad .del{font-size:22px}' +
    '@media (min-width:900px){.cfx-tt .tt-game{display:grid;grid-template-columns:1fr 360px;gap:18px;align-items:start}.cfx-tt .tt-pad button{min-height:58px}.cfx-tt .tt-q{min-height:288px;display:flex;flex-direction:column;justify-content:center}}' +
    '.cfx-tt .tt-kbd{text-align:center;color:var(--muted);font-size:12.5px;font-weight:700;margin-top:10px}' +
    /* 結算 */
    '.cfx-tt .tt-res{text-align:center}' +
    '.cfx-tt .tt-res .big{font-size:56px;font-weight:900;line-height:1}' +
    '.cfx-tt .tt-res .stars{font-size:34px;letter-spacing:4px;margin:6px 0;color:var(--tt-sun)}' +
    '.cfx-tt .tt-res .stars .off{color:var(--line)}' +
    '.cfx-tt .tt-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}' +
    '.cfx-tt .tt-stats div{background:var(--paper2,#f6fbf9);border-radius:14px;padding:8px;font-size:13px;color:var(--muted);font-weight:700}' +
    '.cfx-tt .tt-stats b{display:block;font-size:24px;color:var(--ink)}' +
    '.cfx-tt .tt-record{background:linear-gradient(135deg,#FFD873,#FFB703);color:#4A2E00;font-weight:900;font-size:20px;border-radius:16px;padding:10px;margin:8px 0}' +
    '.cfx-tt.anim .tt-record{animation:ttGlow 1s ease 3}' +
    '@keyframes ttGlow{50%{transform:scale(1.06)}}' +
    '.cfx-tt .tt-miss{text-align:left;margin-top:8px}' +
    '.cfx-tt .tt-miss li{margin:4px 0;font-weight:700}' +
    '.cfx-tt .tt-miss .k{color:var(--muted);font-size:13px}' +
    /* 九九表 */
    '.cfx-tt .tt-table{display:grid;grid-template-columns:repeat(10,1fr);gap:3px;user-select:none}' +
    '.cfx-tt .tt-table button,.cfx-tt .tt-table span{aspect-ratio:1/1;min-height:0;min-width:0;border-radius:8px;border:1px solid var(--line);background:var(--paper,#fff);font:inherit;font-weight:800;font-size:clamp(12px,3.6vw,18px);color:var(--ink);display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;touch-action:manipulation}' +
    '.cfx-tt .tt-table span{background:var(--ink);color:var(--bg,#fff);border-color:var(--ink);cursor:default}' +
    '.cfx-tt .tt-table span.corner{background:transparent;border:0;color:var(--muted)}' +
    '.cfx-tt .tt-table button.hl{background:color-mix(in srgb,var(--tt-sea) 14%,var(--paper,#fff))}' +
    '.cfx-tt .tt-table button.sel{background:var(--tt-hot);color:#fff;border-color:var(--tt-hot)}' +
    '.cfx-tt .tt-table button .q{color:var(--muted);font-size:.8em}' +
    '.cfx-tt .tt-info{text-align:center;min-height:118px}' +
    '.cfx-tt .tt-info .eq{font-size:40px;font-weight:900}' +
    '.cfx-tt .tt-info .kj{font-size:24px;font-weight:900;color:var(--tt-hot);letter-spacing:2px}' +
    '@media (min-width:900px){.cfx-tt .tt-tablewrap{display:grid;grid-template-columns:minmax(0,520px) 1fr;gap:20px;align-items:start}}' +
    '.cfx-tt .tt-opt{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:10px}' +
    '.cfx-tt .tt-opt .btn{min-height:46px}.cfx-tt .tt-head{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-bottom:4px}.cfx-tt .tt-head .btn{min-height:44px;padding:8px 14px}@media (max-width:420px){.cfx-tt .tt-card.tbl{padding:12px 10px}}';

  function render(el, api) {
    api = api || {};
    var grade = api.grade || 2;
    var rm = !!api.reducedMotion;
    var store = function (k) { try { return api.store ? api.store(k) : null; } catch (e) { return null; } };
    var storeSet = function (k, v) { try { if (api.storeSet) api.storeSet(k, v); } catch (e) {} };
    var speak = function (t) { try { if (api.speak) api.speak(t, 'zh'); } catch (e) {} };
    var beep = function (ok) { try { if (api.beep) api.beep(ok); } catch (e) {} };
    var Z = function (t) { return api.Z ? api.Z(t) : esc(t); };

    var style = document.createElement('style');
    style.textContent = CSS;
    var root = document.createElement('div');
    root.className = 'cfx-tt' + (rm ? ' rm' : ' anim');
    el.appendChild(style);
    el.appendChild(root);

    var timer = null, keyHandler = null, nextTimer = null;
    var sel = { mode: store('lastMode') || 'mix', n: store('lastN') || 2 };
    if (['one', 'mix', 'div'].indexOf(sel.mode) < 0) sel.mode = 'mix';

    function modeKey() { return sel.mode === 'one' ? 'n' + sel.n : sel.mode; }
    function modeName(k) {
      if (k === 'mix') return '全部混合';
      if (k === 'div') return '除法';
      return k.slice(1) + ' 的乘法';
    }
    function stopAll() {
      if (timer) { clearInterval(timer); timer = null; }
      if (nextTimer) { clearTimeout(nextTimer); nextTimer = null; }
      if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
      try { if (api.stopSpeak) api.stopSpeak(); } catch (e) {}
    }

    /* ================= 首頁 ================= */
    function home() {
      stopAll();
      var best = store('best') || {};
      var h = '';
      h += '<div class="tt-card">';
      h += '<p class="tt-sub">' + Z('60 秒內答對越多越厲害！選一種題型開始吧。') + '</p>';
      h += '<div class="tt-modes" role="group" aria-label="題型">';
      h += '<button class="tt-mode" data-mode="one">' + Z('指定幾的乘法') + '<small>' + Z('專心練一排') + '</small></button>';
      h += '<button class="tt-mode" data-mode="mix">' + Z('全部混合') + '<small>2～9 ' + Z('隨機出') + '</small></button>';
      h += '<button class="tt-mode" data-mode="div">' + Z('除法') + '<small>' + Z('用九九反推') + '</small></button>';
      h += '</div>';
      h += '<div class="tt-nums" data-nums role="group" aria-label="選幾的乘法">';
      for (var i = 1; i <= 9; i++) h += '<button data-n="' + i + '" aria-label="' + i + ' 的乘法">' + i + '</button>';
      h += '</div>';
      h += '<div class="tt-row"><button class="btn primary" data-go>▶ ' + Z('開始挑戰') + '</button>';
      h += '<button class="btn" data-table>📋 ' + Z('九九表練習') + '</button></div>';
      h += '</div>';
      // 最佳紀錄
      var keys = Object.keys(best);
      h += '<div class="tt-card"><p class="tt-sub">🏆 ' + Z('我的最佳紀錄（答對題數）') + '</p>';
      if (!keys.length) h += '<p class="tt-sub" style="font-weight:500">' + Z('還沒有紀錄，快來挑戰第一次！') + '</p>';
      else {
        var order = ['mix', 'div', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9'];
        h += '<div class="tt-best">';
        order.forEach(function (k) {
          if (best[k] != null) h += '<div>' + esc(modeName(k)) + '<b>' + best[k] + '</b></div>';
        });
        h += '</div>';
      }
      h += '</div>';
      root.innerHTML = h;

      function sync() {
        root.querySelectorAll('.tt-mode').forEach(function (b) {
          b.setAttribute('aria-pressed', b.dataset.mode === sel.mode ? 'true' : 'false');
        });
        var nums = root.querySelector('[data-nums]');
        nums.hidden = sel.mode !== 'one';
        nums.querySelectorAll('button').forEach(function (b) {
          b.setAttribute('aria-pressed', +b.dataset.n === sel.n ? 'true' : 'false');
        });
      }
      root.querySelectorAll('.tt-mode').forEach(function (b) {
        b.onclick = function () { sel.mode = b.dataset.mode; sync(); };
      });
      root.querySelectorAll('[data-n]').forEach(function (b) {
        b.onclick = function () { sel.n = +b.dataset.n; sync(); };
      });
      root.querySelector('[data-go]').onclick = function () {
        storeSet('lastMode', sel.mode); storeSet('lastN', sel.n);
        game();
      };
      root.querySelector('[data-table]').onclick = table;
      sync();
    }

    /* ================= 出題 ================= */
    function makeQ(prev) {
      var q, tries = 0;
      do {
        var a, b;
        if (sel.mode === 'one') {
          a = sel.n; b = rnd(1, 9);
          q = Math.random() < 0.5 ? { a: a, b: b, op: '×', ans: a * b } : { a: b, b: a, op: '×', ans: a * b };
          q.key = q.a + '×' + q.b;
        } else if (sel.mode === 'mix') {
          a = rnd(2, 9); b = rnd(2, 9);
          q = { a: a, b: b, op: '×', ans: a * b, key: a + '×' + b };
        } else {
          a = rnd(2, 9); b = rnd(1, 9);
          q = { a: a * b, b: a, op: '÷', ans: b, key: (a * b) + '÷' + a };
        }
        tries++;
      } while (prev && q.key === prev.key && tries < 10);
      return q;
    }

    /* ================= 計時遊戲 ================= */
    function game() {
      stopAll();
      var st = { left: GAME_SEC, ok: 0, total: 0, combo: 0, maxCombo: 0, miss: {}, q: null, input: '', busy: false, over: false, endAt: Date.now() + GAME_SEC * 1000 };
      var h = '';
      h += '<div class="tt-top"><button class="btn" data-quit aria-label="結束">✕</button>';
      h += '<span class="tt-time" data-time>60</span><div class="tt-bar" data-bar><i></i></div>';
      h += '<span class="tt-score">✅ <span data-ok>0</span></span></div>';
      h += '<div class="tt-game"><div><div class="tt-q" data-q><div class="tt-speed"></div><span class="tt-combo" data-combo></span>';
      h += '<div class="eq" data-eq></div><div class="msg" data-msg aria-live="polite"></div></div></div>';
      h += '<div><div class="tt-pad" data-pad>';
      [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function (d) { h += '<button data-d="' + d + '">' + d + '</button>'; });
      h += '<button class="del" data-del aria-label="刪除">⌫</button><button data-d="0">0</button><button class="ok" data-enter aria-label="確定">✔</button>';
      h += '</div><div class="tt-kbd">' + Z('也可以用鍵盤：數字鍵輸入、Enter 確定、Backspace 刪除') + '</div></div></div>';
      root.innerHTML = h;

      var $ = function (s) { return root.querySelector(s); };
      var qBox = $('[data-q]'), eqEl = $('[data-eq]'), msgEl = $('[data-msg]'), comboEl = $('[data-combo]');

      function show() {
        var q = st.q;
        eqEl.innerHTML = q.a + ' ' + q.op + ' ' + q.b + ' = <span class="ans" data-ans>' + (st.input ? esc(st.input) : '&nbsp;') + '</span>';
      }
      function next() {
        st.q = makeQ(st.q); st.input = ''; st.busy = false;
        qBox.classList.remove('ok', 'bad');
        msgEl.textContent = ''; msgEl.className = 'msg';
        show();
      }
      function setCombo() {
        var c = st.combo;
        comboEl.textContent = '🔥 連對 ' + c;
        comboEl.classList.toggle('on', c >= 3);
        qBox.classList.toggle('fast', c >= 5);
        qBox.classList.toggle('fire', c >= 10);
      }
      function anim(cls) {
        if (rm) return;
        qBox.classList.remove('pop', 'shake'); void qBox.offsetWidth; qBox.classList.add(cls);
      }
      function check() {
        if (st.busy || st.over || !st.input) return;
        var v = parseInt(st.input, 10), q = st.q;
        st.total++;
        if (v === q.ans) {
          st.ok++; st.combo++; st.maxCombo = Math.max(st.maxCombo, st.combo);
          beep(true); anim('pop'); qBox.classList.add('ok');
          msgEl.className = 'msg ok';
          msgEl.textContent = st.combo >= 10 ? '超級快手！' : st.combo >= 5 ? '加速中！' : '答對！';
          $('[data-ok]').textContent = st.ok;
          setCombo();
          st.busy = true;
          nextTimer = setTimeout(next, rm ? 120 : 220);
        } else {
          st.combo = 0; setCombo();
          st.miss[q.key] = (st.miss[q.key] || 0) + 1;
          beep(false); anim('shake'); qBox.classList.add('bad');
          msgEl.className = 'msg bad';
          msgEl.textContent = '答案是 ' + q.ans;
          st.busy = true;
          nextTimer = setTimeout(next, 900);
        }
      }
      function press(d) {
        if (st.busy || st.over) return;
        if (st.input.length >= 2) return;
        st.input += d; show();
        // 位數夠了就自動對答案（速算比較順）
        if (st.input.length >= String(st.q.ans).length) check();
      }
      function del() { if (st.busy || st.over) return; st.input = st.input.slice(0, -1); show(); }
      function flash(btn) { if (!btn) return; btn.classList.add('hit'); setTimeout(function () { btn.classList.remove('hit'); }, 90); }

      $('[data-pad]').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        if (b.dataset.d != null) press(b.dataset.d);
        else if (b.hasAttribute('data-del')) del();
        else if (b.hasAttribute('data-enter')) check();
      });
      keyHandler = function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var k = e.key;
        if (/^[0-9]$/.test(k)) { press(k); flash(root.querySelector('[data-d="' + k + '"]')); e.preventDefault(); }
        else if (k === 'Backspace' || k === 'Delete') { del(); flash($('[data-del]')); e.preventDefault(); }
        else if (k === 'Enter') { check(); flash($('[data-enter]')); e.preventDefault(); }
        else if (k === 'Escape') { home(); }
      };
      document.addEventListener('keydown', keyHandler);
      $('[data-quit]').onclick = home;

      var bar = $('[data-bar]');
      function tick() {
        var ms = Math.max(0, st.endAt - Date.now());
        var s = Math.ceil(ms / 1000);
        $('[data-time]').textContent = s;
        bar.firstChild.style.width = (ms / (GAME_SEC * 10)) + '%';
        bar.classList.toggle('low', s <= 10);
        if (ms <= 0) { st.over = true; stopAll(); result(st); }
      }
      next(); setCombo();
      timer = setInterval(tick, 200);
      tick();
      root._tt = st; // 給測試頁讀取
    }

    /* ================= 結算 ================= */
    function result(st) {
      var key = modeKey();
      var acc = st.total ? Math.round(st.ok / st.total * 100) : 0;
      var best = store('best') || {};
      var old = best[key];
      var isRecord = st.ok > 0 && (old == null || st.ok > old);
      if (isRecord) { best[key] = st.ok; storeSet('best', best); }

      var stars = st.ok >= 25 ? 3 : st.ok >= 15 ? 2 : st.ok >= 5 ? 1 : 0;
      var rewarded = store('rewardDay') || {};
      var gotReward = false;
      if (stars > 0 && rewarded[key] !== today()) {
        rewarded[key] = today(); storeSet('rewardDay', rewarded);
        try { if (api.reward) api.reward({ stars: stars, xp: st.ok, reason: '九九速算（' + modeName(key) + '）答對 ' + st.ok + ' 題' }); } catch (e) {}
        gotReward = true;
      }

      var misses = Object.keys(st.miss).map(function (k) { return [k, st.miss[k]]; })
        .sort(function (a, b) { return b[1] - a[1]; }).slice(0, 3);

      var h = '<div class="tt-card tt-res">';
      h += '<p class="tt-sub">' + esc(modeName(key)) + ' · 60 秒</p>';
      h += '<div class="big">' + st.ok + '</div><div class="tt-sub">' + Z('題答對') + '</div>';
      h += '<div class="stars" aria-label="' + stars + ' 顆星">';
      for (var i = 0; i < 3; i++) h += i < stars ? '★' : '<span class="off">★</span>';
      h += '</div>';
      if (isRecord) h += '<div class="tt-record">🎉 ' + Z('打破紀錄！') + (old != null ? '（' + Z('原本') + ' ' + old + '）' : '') + '</div>';
      else if (old != null) h += '<p class="tt-sub">' + Z('最佳紀錄') + ' ' + old + ' ' + Z('題，再拚一次！') + '</p>';
      h += '<div class="tt-stats"><div>' + Z('作答') + '<b>' + st.total + '</b></div><div>' + Z('正確率') + '<b>' + acc + '%</b></div><div>' + Z('最多連對') + '<b>' + st.maxCombo + '</b></div></div>';
      if (misses.length) {
        h += '<div class="tt-miss"><p class="tt-sub">❗ ' + Z('最常錯的題目') + '</p><ul>';
        misses.forEach(function (m) {
          var k = m[0], line;
          if (k.indexOf('×') > 0) {
            var p = k.split('×'), a = +p[0], b = +p[1];
            line = a + ' × ' + b + ' = ' + (a * b) + ' <span class="k">（' + koujue(a, b) + '）</span>';
          } else {
            var d = k.split('÷'), c = +d[0], e2 = +d[1], ans = c / e2;
            line = c + ' ÷ ' + e2 + ' = ' + ans + ' <span class="k">（' + koujue(e2, ans) + '）</span>';
          }
          h += '<li>' + line + (m[1] > 1 ? ' <span class="k">錯 ' + m[1] + ' 次</span>' : '') + '</li>';
        });
        h += '</ul></div>';
      } else if (st.total) {
        h += '<p class="tt-sub">👏 ' + Z('全部答對，沒有錯題！') + '</p>';
      }
      if (stars === 0) h += '<p class="tt-sub">' + Z('答對 5 題就能拿到星星喔！') + '</p>';
      else if (!gotReward) h += '<p class="tt-sub">' + Z('今天這個題型的星星已經拿過了，明天再來拿！') + '</p>';
      h += '<div class="tt-row"><button class="btn primary" data-again>🔁 ' + Z('再玩一次') + '</button><button class="btn" data-home>' + Z('換題型') + '</button></div>';
      h += '</div>';
      root.innerHTML = h;
      root.querySelector('[data-again]').onclick = game;
      root.querySelector('[data-home]').onclick = home;
      if (isRecord) { try { if (api.confetti && !rm) api.confetti(); } catch (e) {} if (api.toast) api.toast('打破紀錄！'); }
      else if (stars) beep(true);
    }

    /* ================= 九九表練習 ================= */
    function table() {
      stopAll();
      var hide = false, cur = null;
      var h = '<div class="tt-card tbl"><div class="tt-head"><h3 style="margin:0">📋 ' + Z('九九表練習') + '</h3><button class="btn" data-home>← ' + Z('返回') + '</button></div>';
      h += '<p class="tt-sub">' + Z('點一格看答案和口訣，按「唸出來」可以聽。') + '</p>';
      h += '<div class="tt-tablewrap"><div class="tt-table" data-grid>';
      h += '<span class="corner">×</span>';
      for (var c = 1; c <= 9; c++) h += '<span>' + c + '</span>';
      for (var r = 1; r <= 9; r++) {
        h += '<span>' + r + '</span>';
        for (c = 1; c <= 9; c++) h += '<button data-a="' + r + '" data-b="' + c + '" aria-label="' + r + ' 乘 ' + c + '">' + (r * c) + '</button>';
      }
      h += '</div><div><div class="tt-info" data-info aria-live="polite"><p class="tt-sub" style="margin-top:30px">' + Z('先點一格吧！') + '</p></div>';
      h += '<div class="tt-opt"><button class="btn" data-say disabled>🔊 ' + Z('唸出來') + '</button><button class="btn" data-row disabled>🔊 ' + Z('唸整排') + '</button><button class="btn" data-hide aria-pressed="false">🙈 ' + Z('蓋住答案') + '</button></div></div></div></div>';
      root.innerHTML = h;
      var grid = root.querySelector('[data-grid]'), info = root.querySelector('[data-info]');
      function paint() {
        grid.querySelectorAll('button').forEach(function (b) {
          var a = +b.dataset.a, bb = +b.dataset.b;
          var isSel = cur && cur[0] === a && cur[1] === bb;
          b.classList.toggle('sel', !!isSel);
          b.classList.toggle('hl', !!cur && !isSel && (a === cur[0] || bb === cur[1]));
          b.innerHTML = (hide && !isSel) ? '<span class="q">?</span>' : String(a * bb);
        });
      }
      function say() {
        if (!cur) return;
        var a = cur[0], b = cur[1];
        speak(zhNum(a) + '乘以' + zhNum(b) + '等於' + zhNum(a * b) + '。' + koujue(a, b));
      }
      grid.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        cur = [+b.dataset.a, +b.dataset.b];
        var a = cur[0], bb = cur[1];
        info.innerHTML = '<div class="eq">' + a + ' × ' + bb + ' = ' + (a * bb) + '</div><div class="kj">' + esc(koujue(a, bb)) + '</div>' +
          (a !== bb ? '<p class="tt-sub">' + bb + ' × ' + a + ' ' + Z('也是') + ' ' + (a * bb) + '</p>' : '<p class="tt-sub">' + Z('自己乘自己') + '</p>');
        root.querySelector('[data-say]').disabled = false;
        root.querySelector('[data-row]').disabled = false;
        paint(); say();
      });
      root.querySelector('[data-say]').onclick = say;
      root.querySelector('[data-row]').onclick = function () {
        if (!cur) return;
        var a = cur[0], s = [];
        for (var i = 1; i <= 9; i++) s.push(koujue(a, i));
        speak(s.join('，'));
      };
      root.querySelector('[data-hide]').onclick = function () {
        hide = !hide; this.setAttribute('aria-pressed', hide ? 'true' : 'false'); paint();
      };
      root.querySelector('[data-home]').onclick = home;
      paint();
    }

    home();
    root._tt_api = { koujue: koujue, game: game, table: table, home: home, sel: sel };
    return function cleanup() { stopAll(); root.remove(); style.remove(); };
  }

  (window.CFX = window.CFX || []).push({
    id: 'times',
    title: '九九乘法速算挑戰',
    icon: '✖️',
    grades: [2, 3, 4],
    subject: '數學',
    desc: '60 秒速算九九乘除，還能點九九表聽口訣',
    render: render
  });
})();
