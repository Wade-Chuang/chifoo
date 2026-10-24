/* 啟賦全站累計瀏覽次數：開隱藏的 count.html（整站共用一個計數），把數字填進 #brandTotal。
   OFFSET＝2026-10-24 開始合計前，各頁已累積的瀏覽次數總和（小學堂44、英文小學堂4）。 */
(function(){var OFFSET=48,me=document.currentScript,src=me.src.replace(/total\.js(\?.*)?$/,'count.html');
  function go(){var f=document.createElement('iframe');f.src=src;f.hidden=true;f.setAttribute('aria-hidden','true');f.tabIndex=-1;f.title='';document.body.appendChild(f)}
  addEventListener('message',function(e){if(e.origin!==location.origin||!e.data||typeof e.data.brandTotal!=='number')return;
    var el=document.getElementById('brandTotal');if(!el)return;el.querySelector('b').textContent=(e.data.brandTotal+OFFSET).toLocaleString('en-US');el.hidden=false});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go()})();
