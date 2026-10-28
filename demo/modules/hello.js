/* 範例模組：驗證小工具框架用（只放在 Demo 版）。
   示範 api：grade、Z、speak、beep、confetti、reward、drawSticker、store/storeSet、toast、back、reducedMotion */
(window.CFX = window.CFX || []).push({
  id: 'hello',
  title: '點星星暖身',
  icon: '👋',
  grades: [1, 2, 3, 4, 5, 6],
  subject: '綜合',
  desc: '小工具框架範例：點 5 顆星星就過關',
  render(el, api) {
    const best = api.store('best');            // 最快紀錄（秒）
    const plays = api.store('plays') || 0;
    let left = 5, t0 = 0, timers = [];
    el.innerHTML = `
      <div class="card" style="display:grid;gap:12px">
        <p style="margin:0;font-weight:900;font-size:18px" class="${api.zy ? 'zyon' : ''}">${api.Z(api.grade + ' 年級的小朋友你好！點一下開始，把星星全部點掉。')}</p>
        <p class="hint" style="margin:0" id="hRec">玩過 ${plays} 次${best ? '・最快 ' + best + ' 秒' : ''}</p>
        <div id="hArea" style="position:relative;height:220px;border-radius:18px;background:var(--bg);overflow:hidden;touch-action:manipulation"></div>
        <div class="btns" style="justify-content:flex-start">
          <button class="btn primary" id="hGo">▶ 開始</button>
          <button class="btn" id="hSay">🔊 唸給我聽</button>
          <button class="btn" id="hBack">← 回小工具</button>
        </div>
      </div>`;
    const area = el.querySelector('#hArea');
    const star = () => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = '⭐'; b.setAttribute('aria-label', '星星');
      b.style.cssText = `position:absolute;width:52px;height:52px;font-size:34px;left:${8 + Math.random() * 78}%;top:${8 + Math.random() * 62}%;` +
        (api.reducedMotion ? '' : 'transition:transform .15s;');
      b.onclick = () => {
        api.beep(true); b.remove(); left--;
        if (left > 0) return star();
        const sec = Math.round((Date.now() - t0) / 100) / 10;
        const nb = !best || sec < best;
        api.storeSet('plays', (api.store('plays') || 0) + 1);
        if (nb) api.storeSet('best', sec);
        api.confetti();
        const r = api.reward({ stars: 1, xp: 10, reason: '暖身完成' });
        area.innerHTML = `<div style="display:grid;place-items:center;height:100%;font-weight:900;font-size:20px;text-align:center">🎉 ${sec} 秒完成！${nb ? '<br>新紀錄！' : ''}${r.stars ? '' : '<br><small class="hint">今天的星星拿滿了</small>'}</div>`;
        el.querySelector('#hRec').textContent = `玩過 ${api.store('plays')} 次・最快 ${api.store('best')} 秒`;
      };
      area.appendChild(b);
    };
    el.querySelector('#hGo').onclick = () => { area.innerHTML = ''; left = 5; t0 = Date.now(); star(); };
    el.querySelector('#hSay').onclick = () => api.speak('把五顆星星全部點掉就過關！Ready, go!');
    el.querySelector('#hBack').onclick = () => api.back();
    return () => { timers.forEach(clearTimeout); api.stopSpeak(); };
  }
});
