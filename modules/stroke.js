/* 啟賦小學堂 小工具：國字筆順（stroke）
 * 依 modules/MODULE_SPEC.md：只使用 api 提供的功能，不連外部服務、不用外部圖片。
 *
 * 【資料說明（重要）】
 * 1. 字表（每年級 70 字，共 420 字）、總筆畫數、部首：本模組編者自行整理，
 *    依臺灣教育部標準字體的寫法計算筆畫（例如「艹」4 畫、「辶」4 畫：花 8 畫、道 13 畫），
 *    部首依教育部辭典採用的 214 部首。原創整理，非抄錄任何網站資料檔。
 * 2. 筆順動畫（STROKES）：只收「基本獨體字」46 字，筆畫線條為編者原創手繪座標（0～100 方格），
 *    筆順依教育部《常用國字標準字體筆順手冊》的基本規則排列，且只挑選兩岸筆順一致、
 *    沒有爭議的字；其餘字不提供動畫（不拿中國大陸筆順資料冒充）。
 *    上線前建議老師對照「教育部國字標準字體筆順學習網」逐字核對一次。
 * 3. 沒有動畫的字改成「看字形＋自由描寫（數筆畫）＋筆畫數／部首小測驗」。
 */
(function () {
  'use strict';

  /* ---------- 字表：字＋總筆畫＋部首 ---------- */
  var RAW = {
    1: '一1一 二2二 三3一 十2十 七2一 八2八 九2乙 六4八 四5口 五4二 人2人 入2入 大3大 天4大 小3小 ' +
       '上3一 下3一 中4丨 口3口 日4日 月4月 目5目 田5田 山3山 川3巛 土3土 王4玉 工3工 木4木 本5木 ' +
       '林8木 森12木 千3十 子3子 女3女 力2力 立5立 正5止 白5白 生5生 手4手 牛4牛 又2又 刀2刀 文4文 ' +
       '心4心 火4火 方4方 石5石 米6米 水4水 耳6耳 毛4毛 羊6羊 魚11魚 鳥11鳥 馬10馬 雨8雨 雲12雨 花8艸 ' +
       '草10艸 我7戈 你7人 他5人 的8白 是9日 有6月 好6女 家10宀 爸8父 媽13女',
    2: '哥10口 姊7女 弟7弓 妹8女 去5厶 來8人 走7走 看9目 見7見 吃6口 早6日 年6干 今4人 明8日 光6儿 ' +
       '衣6衣 學16子 校10木 老6老 師10巾 同6口 朋8月 友4又 書10曰 字6子 冬5冫 春9日 夏10夊 秋9禾 風9風 ' +
       '雪11雨 星9日 晚11日 午4十 多6夕 少4小 百6白 兩8入 半5十 個10人 們10人 她6女 說14言 話13言 喝12口 ' +
       '跑12足 開12門 間12門 門8門 車7車 東8木 西6襾 南9十 北5匕 高10高 長8長 青8青 美9羊 黑12黑 黃12黃 ' +
       '紅9糸 綠14糸 色6色 果8木 樹16木 竹6竹 葉13艸 瓜5瓜 豆7豆 皮5皮',
    3: '足7足 頭16頁 眼11目 鼻14鼻 身7身 體23骨 洗9水 河8水 海10水 江6水 公4八 園13口 玩8玉 球11玉 拍8手 ' +
       '打5手 叫5口 唱11口 歌14欠 笑10竹 哭10口 快7心 樂15木 運13辵 動11力 這11辵 那7邑 哪10口 什4人 麼14麻 ' +
       '會13曰 想13心 要9襾 能10肉 可5口 以5人 把7手 被10衣 讓24言 給12糸 送10辵 過13辵 還17辵 進12辵 近8辵 ' +
       '遠14辵 道13辵 作7人 用5用 寫15宀 讀22言 問11口 答12竹 題18頁 錯16金 對14寸 氣10气 電13雨 燈16火 桌10木 ' +
       '椅12木 床7广 房8戶 菜12艸 肉6肉 雞18隹 鴨16鳥 豬15豕 狗8犬 貓16豸',
    4: '蟲18虫 蝴15虫 蝶15虫 種14禾 根10木 紙10糸 筆12竹 畫12田 圖14口 跳13足 舞14舛 認14言 識19言 練15糸 習11羽 ' +
       '課15言 考6老 試13言 成7戈 績17糸 努7力 興16臼 趣15走 歷16止 史5口 地6土 理11玉 科9禾 數15攴 算14竹 ' +
       '加5力 減12水 乘10丿 除10阜 等12竹 於8方 分4刀 角7角 形7彡 線15糸 點17黑 面9面 積16禾 圓13口 尺4尸 ' +
       '斤4斤 克7儿 時10日 鐘20金 秒9禾 週12辵 期12月 季8子 節15竹 假11人 旅10方 遊13辵 爬8爪 島10山 灣25水 ' +
       '臺14至 宜8宀 蘭21艸 城10土 市5巾 鄉13邑 鎮18金 村7木 路13足 橋16木',
    5: '環17玉 境14土 保9人 護21言 愛13心 情11心 感13心 謝17言 歡22欠 迎8辵 慶15心 經13糸 驗23馬 發12癶 現11玉 ' +
       '研11石 究7穴 實14宀 際14阜 觀25見 察14宀 記10言 錄16金 資13貝 料10斗 報12土 告7口 論15言 討10言 議20言 ' +
       '決7水 定8宀 計9言 劃14刀 選16辵 擇16手 責11貝 任6人 團14口 隊12阜 合6口 精14米 勇9力 堅11土 持9手 ' +
       '希7巾 望11月 夢14夕 未5木 世5一 界9田 國11口 民5氏 族11方 化4匕 術11行 音9音 景12日 植12木 物8牛 ' +
       '營17火 養15食 健11人 康11广 畢11田 段9殳 落13艸 例8人 句5口 詞12言 語14言 章11立 短12矢 解13角',
    6: '業13木 典8八 恩10心 憶16心 思9心 創12刀 造11辵 技7手 網14糸 訊10言 媒12女 傳13人 統12糸 古5口 代5人 ' +
       '朝12月 戰16戈 爭8爪 平5干 政9攴 府8广 法8水 律9彳 權22木 利7刀 義13羊 務11力 濟17水 貿12貝 易8日 ' +
       '污6水 染9木 源13水 宇6宀 宙8宀 銀14金 陽12阜 溫13水 度9广 候10人 颱14風 震15雨 災7火 害10宀 避17辵 ' +
       '難19隹 救11攴 援12手 誠14言 信9人 尊12寸 重9里 謙17言 虛12虍 勤13力 儉15人 和8口 太4大 承8手 擔16手 獨16犬 探11手 索10糸 價15人 值10人 珍9玉 惜11心'
  };
  // 字表若有重複，只保留第一次出現的年級
  var GRADES = {}, INFO = {};
  (function () {
    var seen = {};
    for (var g = 1; g <= 6; g++) {
      GRADES[g] = [];
      RAW[g].split(/\s+/).forEach(function (t) {
        var m = /^(.)(\d+)(.)$/.exec(t);
        if (!m || seen[m[1]]) return;
        seen[m[1]] = 1;
        INFO[m[1]] = { n: +m[2], rad: m[3], g: g };
        GRADES[g].push(m[1]);
      });
    }
  })();

  /* ---------- 筆順動畫資料（原創座標，0～100；每一筆是一條折線，依書寫方向） ---------- */
  var S = {
    '一': [[[15,52],[85,50]]],
    '二': [[[28,34],[72,33]], [[14,70],[86,69]]],
    '三': [[[24,24],[76,23]], [[30,50],[70,49]], [[14,78],[86,77]]],
    '十': [[[14,46],[86,45]], [[50,12],[50,90]]],
    '七': [[[12,50],[84,38]], [[40,12],[40,76],[46,84],[84,84],[86,70]]],
    '八': [[[40,22],[34,58],[14,82]], [[58,24],[70,58],[88,82]]],
    '九': [[[42,12],[40,50],[16,88]], [[16,36],[62,36],[60,80],[68,86],[86,86],[88,72]]],
    '六': [[[48,10],[56,22]], [[12,38],[88,37]], [[38,56],[20,82]], [[62,56],[82,80]]],
    '四': [[[16,20],[16,84]], [[16,20],[84,20],[84,84]], [[40,22],[38,48],[28,62]], [[58,22],[58,56],[70,56]], [[16,82],[84,82]]],
    '五': [[[18,16],[82,16]], [[46,16],[38,80]], [[26,46],[70,46],[68,82]], [[12,82],[88,82]]],
    '人': [[[52,14],[46,46],[16,86]], [[50,40],[66,66],[88,86]]],
    '入': [[[38,16],[50,26],[42,58],[16,86]], [[44,44],[64,68],[88,86]]],
    '大': [[[14,40],[86,39]], [[50,12],[46,52],[16,88]], [[50,46],[66,68],[88,88]]],
    '天': [[[24,22],[76,21]], [[12,48],[88,47]], [[50,10],[46,56],[16,88]], [[50,50],[66,70],[88,88]]],
    '太': [[[12,38],[88,37]], [[50,10],[46,52],[16,88]], [[50,46],[66,68],[88,88]], [[42,70],[52,80]]],
    '小': [[[50,10],[50,84],[42,78]], [[34,38],[20,64]], [[64,38],[80,62]]],
    '上': [[[48,14],[48,80]], [[48,46],[76,45]], [[12,82],[88,81]]],
    '下': [[[12,20],[88,19]], [[46,20],[46,90]], [[54,44],[70,58]]],
    '中': [[[24,30],[24,64]], [[24,30],[76,30],[76,64]], [[24,62],[76,62]], [[50,10],[50,92]]],
    '口': [[[22,24],[22,80]], [[22,24],[78,24],[78,80]], [[22,78],[78,78]]],
    '日': [[[28,14],[28,88]], [[28,14],[72,14],[72,88]], [[28,50],[72,50]], [[28,86],[72,86]]],
    '月': [[[30,12],[30,64],[24,80],[14,90]], [[30,12],[72,12],[72,84],[64,90]], [[30,38],[72,38]], [[30,60],[72,60]]],
    '目': [[[30,10],[30,90]], [[30,10],[70,10],[70,90]], [[30,36],[70,36]], [[30,62],[70,62]], [[30,88],[70,88]]],
    '田': [[[18,18],[18,84]], [[18,18],[82,18],[82,84]], [[18,50],[82,50]], [[50,18],[50,82]], [[18,82],[82,82]]],
    '山': [[[50,12],[50,82]], [[20,36],[20,82],[80,82]], [[80,36],[80,88]]],
    '川': [[[28,14],[28,60],[14,88]], [[52,20],[52,80]], [[78,12],[78,90]]],
    '土': [[[24,44],[76,43]], [[50,14],[50,82]], [[12,82],[88,81]]],
    '王': [[[18,18],[82,18]], [[24,50],[76,50]], [[50,18],[50,82]], [[12,84],[88,83]]],
    '工': [[[20,20],[80,20]], [[50,20],[50,80]], [[12,80],[88,80]]],
    '木': [[[12,36],[88,35]], [[50,10],[50,92]], [[48,38],[32,62],[12,80]], [[52,38],[68,60],[88,78]]],
    '本': [[[12,34],[88,33]], [[50,10],[50,92]], [[48,36],[32,60],[12,78]], [[52,36],[68,58],[88,76]], [[34,72],[66,72]]],
    '千': [[[68,10],[46,18],[28,22]], [[12,46],[88,45]], [[50,18],[50,92]]],
    '子': [[[24,16],[74,16],[50,40]], [[50,40],[50,86],[40,82]], [[12,56],[88,55]]],
    '女': [[[46,10],[28,56],[78,86]], [[66,30],[56,64],[20,88]], [[12,48],[88,47]]],
    '力': [[[18,32],[80,32],[78,82],[66,90]], [[50,10],[44,60],[16,90]]],
    '立': [[[50,10],[56,22]], [[20,30],[80,30]], [[32,44],[42,70]], [[70,42],[58,72]], [[12,82],[88,82]]],
    '正': [[[20,16],[80,16]], [[50,16],[50,84]], [[50,48],[76,48]], [[26,44],[26,84]], [[12,84],[88,84]]],
    '白': [[[54,6],[46,20]], [[24,22],[24,90]], [[24,22],[76,22],[76,90]], [[24,54],[76,54]], [[24,88],[76,88]]],
    '生': [[[34,12],[22,40]], [[24,34],[80,34]], [[20,58],[80,58]], [[50,14],[50,84]], [[12,86],[88,86]]],
    '手': [[[74,10],[50,18],[22,22]], [[20,40],[80,40]], [[14,62],[86,62]], [[50,20],[50,86],[40,82]]],
    '牛': [[[36,12],[22,40]], [[22,36],[80,36]], [[12,62],[88,62]], [[50,12],[50,92]]],
    '又': [[[18,20],[78,20],[60,54],[16,88]], [[34,40],[56,68],[88,88]]],
    '刀': [[[20,24],[80,24],[78,84],[66,92]], [[48,26],[42,62],[14,90]]],
    '文': [[[50,8],[56,20]], [[12,32],[88,32]], [[68,34],[50,64],[14,90]], [[30,34],[56,66],[88,90]]],
    '心': [[[20,46],[12,64]], [[34,30],[36,80],[78,82],[78,66]], [[52,28],[60,40]], [[76,40],[88,56]]],
    '火': [[[26,34],[16,54]], [[78,30],[66,52]], [[50,10],[48,52],[14,90]], [[50,52],[66,72],[88,90]]],
    '方': [[[50,6],[56,18]], [[12,28],[88,28]], [[40,48],[76,48],[74,84],[64,90]], [[40,28],[36,64],[14,90]]],
    '石': [[[12,18],[88,18]], [[52,18],[36,52],[14,72]], [[36,50],[36,88]], [[36,50],[78,50],[78,88]], [[36,86],[78,86]]],
    '米': [[[30,18],[38,36]], [[72,16],[62,36]], [[12,46],[88,46]], [[50,8],[50,92]], [[48,50],[30,72],[12,86]], [[52,50],[70,70],[88,84]]]
  };
  // 筆畫名稱（顯示用）
  var SN = {
    '一':'橫', '二':'橫 橫', '三':'橫 橫 橫', '十':'橫 豎', '七':'橫 豎曲鉤', '八':'撇 捺', '九':'撇 橫折曲鉤',
    '六':'點 橫 點 點', '四':'豎 橫折 撇 豎曲 橫', '五':'橫 豎 橫折 橫', '人':'撇 捺', '入':'撇 捺', '大':'橫 撇 捺',
    '天':'橫 橫 撇 捺', '太':'橫 撇 捺 點', '小':'豎鉤 點 點', '上':'豎 橫 橫', '下':'橫 豎 點', '中':'豎 橫折 橫 豎',
    '口':'豎 橫折 橫', '日':'豎 橫折 橫 橫', '月':'撇 橫折鉤 橫 橫', '目':'豎 橫折 橫 橫 橫', '田':'豎 橫折 橫 豎 橫',
    '山':'豎 豎折 豎', '川':'撇 豎 豎', '土':'橫 豎 橫', '王':'橫 橫 豎 橫', '工':'橫 豎 橫', '木':'橫 豎 撇 捺',
    '本':'橫 豎 撇 捺 橫', '千':'撇 橫 豎', '子':'橫撇 豎鉤 橫', '女':'撇點 撇 橫', '力':'橫折鉤 撇',
    '立':'點 橫 點 撇 橫', '正':'橫 豎 橫 豎 橫', '白':'撇 豎 橫折 橫 橫', '生':'撇 橫 橫 豎 橫',
    '手':'撇 橫 橫 豎鉤', '牛':'撇 橫 橫 豎', '又':'橫撇 捺', '刀':'橫折鉤 撇', '文':'點 橫 撇 捺',
    '心':'點 臥鉤 點 點', '火':'點 撇 撇 捺', '方':'點 橫 橫折鉤 撇', '石':'橫 撇 豎 橫折 橫', '米':'點 撇 橫 豎 撇 捺'
  };
  // 資料自檢：動畫筆數必須等於字表筆畫數，不一致就不提供動畫
  Object.keys(S).forEach(function (c) {
    if (!INFO[c] || INFO[c].n !== S[c].length) { delete S[c]; }
  });

  var KAI = '"TW-Kai","BiauKai","DFKai-SB","標楷體","TW-Kai-98_1","Kaiti TC","STKaiti",serif';
  var CN_NUM = ['一','二','三','四','五','六'];

  /* ---------- 小工具 ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function plen(p) { var L = 0; for (var i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i-1][0], p[i][1] - p[i-1][1]); return L; }
  function resample(p, n) {
    if (p.length === 1) { var r = []; for (var k = 0; k < n; k++) r.push(p[0]); return r; }
    var L = plen(p) || 1e-6, step = L / (n - 1), out = [p[0]], acc = 0, i = 1, prev = p[0];
    while (i < p.length && out.length < n) {
      var d = Math.hypot(p[i][0] - prev[0], p[i][1] - prev[1]);
      if (acc + d >= step && d > 0) {
        var t = (step - acc) / d;
        var q = [prev[0] + t * (p[i][0] - prev[0]), prev[1] + t * (p[i][1] - prev[1])];
        out.push(q); prev = q; acc = 0;
      } else { acc += d; prev = p[i]; i++; }
    }
    while (out.length < n) out.push(p[p.length - 1]);
    return out;
  }
  function avgDist(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += Math.hypot(a[i][0] - b[i][0], a[i][1] - b[i][1]); return s / a.length; }
  // 判斷手寫的一筆像不像標準的一筆：回傳 {ok, rev, d}
  function matchStroke(user, std) {
    var N = 24, u = resample(user, N), s = resample(std, N);
    var d = avgDist(u, s), rd = avgDist(u, s.slice().reverse());
    var sl = plen(std), ul = plen(user);
    var tol = sl < 25 ? 15 : 13;                      // 點、短筆畫放寬一點
    var lenOk = sl < 25 ? ul < 45 : (ul > sl * 0.45 && ul < sl * 1.8);
    var u0 = user[0], s0 = std[0], s1 = std[std.length - 1];
    var dirOk = Math.hypot(u0[0] - s0[0], u0[1] - s0[1]) <= Math.hypot(u0[0] - s1[0], u0[1] - s1[1]);  // 起筆要靠近標準起點
    return { ok: d < tol && lenOk && dirOk, rev: (rd < tol || (!dirOk && d < tol)) && lenOk, d: d };
  }

  /* ---------- 樣式 ---------- */
  var CSS = '' +
    '.cfx-sk{--sk-red:#D9483B;--sk-good:var(--good,#2E9E5B);--sk-grid:#E9A9A1;max-width:900px;margin:0 auto;color:var(--ink);-webkit-tap-highlight-color:transparent}' +
    '.cfx-sk *{box-sizing:border-box}' +
    '.cfx-sk h3{margin:4px 0 6px;font-size:22px;font-weight:900}' +
    '.cfx-sk .sk-card{background:var(--paper,#fff);border:2px solid var(--line);border-radius:var(--r-l,22px);padding:14px;box-shadow:var(--shadow,0 4px 14px rgba(0,0,0,.08));margin-bottom:14px}' +
    '.cfx-sk .sk-sub{color:var(--muted);font-size:14px;font-weight:700;margin:0 0 8px}' +
    '.cfx-sk .sk-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px}' +
    '.cfx-sk .sk-tab{min-height:44px;min-width:56px;padding:6px 14px;border-radius:999px;border:2px solid var(--line);background:var(--paper2,#f6fbf9);font:inherit;font-weight:900;color:var(--ink);cursor:pointer}' +
    '.cfx-sk .sk-tab[aria-pressed="true"]{background:var(--c-zh,#E2483A);border-color:var(--c-zh,#E2483A);color:#fff}' +
    '.cfx-sk .sk-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:var(--muted);font-weight:700;margin-bottom:10px}' +
    '.cfx-sk .sk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(58px,1fr));gap:8px}' +
    '.cfx-sk .sk-ch{position:relative;min-height:58px;border-radius:14px;border:2px solid var(--line);background:var(--paper2,#f6fbf9);font-family:' + KAI + ';font-size:32px;line-height:1;color:var(--ink);cursor:pointer;padding:0}' +
    '.cfx-sk .sk-ch:hover{border-color:var(--c-zh,#E2483A)}' +
    '.cfx-sk .sk-ch.anim{background:var(--t-zh,#FDE1DF)}' +
    '.cfx-sk .sk-ch .b{position:absolute;right:3px;top:2px;font-family:inherit;font-size:10px;color:var(--c-zh,#E2483A)}' +
    '.cfx-sk .sk-ch .ok{position:absolute;left:3px;bottom:2px;font-size:12px;color:var(--sk-good);font-family:system-ui}' +
    '.cfx-sk .sk-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}' +
    '.cfx-sk .sk-main{display:grid;grid-template-columns:minmax(0,1fr);gap:14px}' +
    '@media (min-width:760px){.cfx-sk .sk-main{grid-template-columns:auto minmax(0,1fr);align-items:start}}' +
    '.cfx-sk .sk-board{position:relative;margin:0 auto;touch-action:none;user-select:none;-webkit-user-select:none}' +
    '.cfx-sk canvas{display:block;border-radius:16px;background:#FFFDF7;border:3px solid #E7B9A8;touch-action:none}' +
    '.cfx-sk .sk-info{display:flex;flex-direction:column;gap:10px}' +
    '.cfx-sk .sk-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}' +
    '.cfx-sk .sk-fact{background:var(--paper2,#f6fbf9);border:2px solid var(--line);border-radius:14px;padding:6px 8px;text-align:center}' +
    '.cfx-sk .sk-fact small{display:block;color:var(--muted);font-weight:700;font-size:12px}' +
    '.cfx-sk .sk-fact b{font-size:22px;font-weight:900}' +
    '.cfx-sk .sk-fact b.kai{font-family:' + KAI + ';font-size:26px}' +
    '.cfx-sk .sk-ctrl{display:flex;gap:8px;flex-wrap:wrap}' +
    '.cfx-sk .sk-ctrl .btn{min-height:46px;padding:8px 12px;flex:1 1 auto}' +
    '.cfx-sk .sk-speed{display:flex;gap:6px;align-items:center;font-weight:800;font-size:14px;flex-wrap:wrap}' +
    '.cfx-sk .sk-speed .sk-tab{min-height:44px;padding:4px 12px}' +
    '.cfx-sk .sk-msg{min-height:48px;border-radius:14px;padding:10px 12px;font-weight:900;background:var(--paper2,#f6fbf9);border:2px dashed var(--line)}' +
    '.cfx-sk .sk-msg.good{border-color:var(--sk-good);color:var(--sk-good);border-style:solid}' +
    '.cfx-sk .sk-msg.bad{border-color:var(--sk-red);color:var(--sk-red);border-style:solid}' +
    '.cfx-sk .sk-names{display:flex;flex-wrap:wrap;gap:6px}' +
    '.cfx-sk .sk-names span{padding:2px 9px;border-radius:999px;border:2px solid var(--line);font-size:14px;font-weight:800;color:var(--muted)}' +
    '.cfx-sk .sk-names span.done{border-color:var(--sk-good);color:var(--sk-good)}' +
    '.cfx-sk .sk-names span.cur{border-color:var(--c-zh,#E2483A);color:#fff;background:var(--c-zh,#E2483A)}' +
    '.cfx-sk .sk-q{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}' +
    '.cfx-sk .sk-q button{min-height:52px;border-radius:14px;border:2px solid var(--line);background:var(--paper2,#f6fbf9);font:inherit;font-weight:900;font-size:20px;color:var(--ink);cursor:pointer}' +
    '.cfx-sk .sk-q button.kai{font-family:' + KAI + ';font-size:28px}' +
    '.cfx-sk .sk-q button.right{background:var(--sk-good);border-color:var(--sk-good);color:#fff}' +
    '.cfx-sk .sk-q button.wrong{background:var(--sk-red);border-color:var(--sk-red);color:#fff}' +
    '.cfx-sk .sk-note{font-size:12px;color:var(--muted);line-height:1.5;margin-top:6px}' +
    '.cfx-sk .sk-nav{display:flex;gap:8px;justify-content:space-between}' +
    '.cfx-sk .sk-nav .btn{flex:1}';

  /* ---------- 主程式 ---------- */
  function render(el, api) {
    var st = document.createElement('style'); st.textContent = CSS; el.appendChild(st);
    var root = document.createElement('div'); root.className = 'cfx-sk'; el.appendChild(root);

    var grade = Math.min(6, Math.max(1, +api.grade || 1));
    var learned = api.store('learned') || {};          // {字: 1}
    var timers = [], raf = 0, alive = true;
    var cur = null;                                     // 目前字的狀態

    function clearTimers() { timers.forEach(clearTimeout); timers = []; if (raf) cancelAnimationFrame(raf); raf = 0; }
    function later(fn, ms) { var t = setTimeout(function () { if (alive) fn(); }, ms); timers.push(t); return t; }

    function rewardOnce(ch) {
      var log = api.store('rewardLog') || {};
      if (log.day !== today()) log = { day: today(), chars: [] };
      learned[ch] = 1; api.storeSet('learned', learned);
      if (log.chars.indexOf(ch) >= 0) { api.toast('「' + ch + '」今天已經拿過星星囉，繼續練習更厲害！'); return false; }
      log.chars.push(ch); api.storeSet('rewardLog', log);
      api.reward({ stars: 1, reason: '國字筆順：' + ch });
      return true;
    }

    /* ===== 字表畫面 ===== */
    function showList() {
      clearTimers(); cur = null;
      var chars = GRADES[grade];
      var nAnim = chars.filter(function (c) { return S[c]; }).length;
      var h = '<div class="sk-card">' +
        '<p class="sk-sub">選年級，點一個字：看筆順動畫、照順序描寫、考考筆畫數和部首。</p>' +
        '<div class="sk-tabs" role="group" aria-label="選年級">';
      for (var g = 1; g <= 6; g++) h += '<button class="sk-tab" data-g="' + g + '" aria-pressed="' + (g === grade) + '">' + CN_NUM[g-1] + '年級</button>';
      h += '</div><div class="sk-legend"><span>共 ' + chars.length + ' 字</span>' + (nAnim ? '<span>🔴▶ 有筆順動畫（' + nAnim + ' 字）</span>' : '') + '<span>✓ 已練過</span></div>' +
        '<div class="sk-grid">';
      chars.forEach(function (c) {
        h += '<button class="sk-ch' + (S[c] ? ' anim' : '') + '" data-c="' + esc(c) + '" aria-label="' + esc(c) + '，' + INFO[c].n + '畫' + (S[c] ? '，有筆順動畫' : '') + '">' + esc(c) +
          (S[c] ? '<span class="b">▶</span>' : '') + (learned[c] ? '<span class="ok">✓</span>' : '') + '</button>';
      });
      h += '</div><p class="sk-note">筆順動畫目前只收基本字（依教育部標準字體筆順規則繪製）；其他字可看標準楷書字形、自由描寫數筆畫，並練習筆畫數與部首。</p></div>';
      root.innerHTML = h;
      root.querySelectorAll('[data-g]').forEach(function (b) {
        b.onclick = function () { grade = +b.dataset.g; showList(); };
      });
      root.querySelectorAll('[data-c]').forEach(function (b) {
        b.onclick = function () { showChar(b.dataset.c); };
      });
    }

    /* ===== 單字畫面 ===== */
    function showChar(ch, mode) {
      clearTimers();
      var info = INFO[ch], strokes = S[ch];
      mode = mode || (strokes ? 'watch' : 'look');
      cur = { ch: ch, info: info, strokes: strokes, mode: mode, k: 0, prog: 0, playing: false, speed: cur && cur.speed || 1,
              done: [], user: [], drawing: null, fails: 0, hint: -1, free: [] };
      var list = GRADES[info.g], idx = list.indexOf(ch);
      var modes = strokes ? [['watch', '▶ 看筆順'], ['trace', '✏️ 描寫練習'], ['quiz', '❓ 考考你']]
                          : [['look', '👀 看字形'], ['free', '✏️ 描寫數筆畫'], ['quiz', '❓ 考考你']];
      var h = '<div class="sk-card">' +
        '<div class="sk-top"><button class="btn" data-act="list">← 字表</button>' +
        '<b style="font-size:18px">' + CN_NUM[info.g-1] + '年級・第 ' + (idx + 1) + ' / ' + list.length + ' 字</b>' +
        '<button class="btn" data-act="say" aria-label="唸這個字">🔊 唸一唸</button></div>' +
        '<div class="sk-tabs" role="group" aria-label="模式">';
      modes.forEach(function (m) { h += '<button class="sk-tab" data-mode="' + m[0] + '" aria-pressed="' + (m[0] === mode) + '">' + m[1] + '</button>'; });
      h += '</div><div class="sk-main"><div class="sk-board"><canvas aria-label="' + esc(ch) + ' 的書寫格"></canvas></div><div class="sk-info">' +
        '<div class="sk-facts"><div class="sk-fact"><small>國字</small><b class="kai">' + esc(ch) + '</b></div>' +
        '<div class="sk-fact"><small>總筆畫</small><b data-fact="n">' + (mode === 'quiz' ? '？' : info.n + ' 畫') + '</b></div>' +
        '<div class="sk-fact"><small>部首</small><b class="kai" data-fact="r">' + (mode === 'quiz' ? '？' : esc(info.rad)) + '</b></div></div>' +
        '<div class="sk-panel"></div></div></div>' +
        '<div class="sk-nav" style="margin-top:12px"><button class="btn" data-act="prevc"' + (idx ? '' : ' disabled') + '>← 上一個字</button>' +
        '<button class="btn" data-act="nextc"' + (idx < list.length - 1 ? '' : ' disabled') + '>下一個字 →</button></div></div>';
      root.innerHTML = h;
      root.querySelector('[data-act="list"]').onclick = showList;
      root.querySelector('[data-act="say"]').onclick = function () { api.speak(ch, 'zh'); };
      root.querySelector('[data-act="prevc"]').onclick = function () { if (idx) showChar(list[idx - 1], cur.mode === 'quiz' ? 'quiz' : null); };
      root.querySelector('[data-act="nextc"]').onclick = function () { if (idx < list.length - 1) showChar(list[idx + 1], cur.mode === 'quiz' ? 'quiz' : null); };
      root.querySelectorAll('[data-mode]').forEach(function (b) { b.onclick = function () { showChar(ch, b.dataset.mode); }; });
      setupCanvas();
      buildPanel();
      if (mode === 'watch' && !api.reducedMotion) { later(function () { play(); }, 300); }
      draw();
    }

    /* ----- 畫布 ----- */
    var cv, ctx, SZ = 300;
    function setupCanvas() {
      cv = root.querySelector('canvas');
      var w = Math.min(root.clientWidth - 32, 380);
      SZ = Math.max(240, Math.floor(w));
      var dpr = window.devicePixelRatio || 1;
      cv.width = SZ * dpr; cv.height = SZ * dpr;
      cv.style.width = SZ + 'px'; cv.style.height = SZ + 'px';
      ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cv.addEventListener('pointerdown', onDown);
      cv.addEventListener('pointermove', onMove);
      cv.addEventListener('pointerup', onUp);
      cv.addEventListener('pointercancel', onUp);
    }
    function P(p) { return [p[0] / 100 * SZ, p[1] / 100 * SZ]; }
    function linePath(pts, frac) {
      // 依比例畫出折線的前 frac 段
      var L = plen(pts) * (frac === undefined ? 1 : frac), a = P(pts[0]);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]);
      var acc = 0;
      for (var i = 1; i < pts.length; i++) {
        var d = Math.hypot(pts[i][0] - pts[i-1][0], pts[i][1] - pts[i-1][1]);
        if (acc + d >= L) {
          var t = d ? (L - acc) / d : 0, q = P([pts[i-1][0] + t * (pts[i][0] - pts[i-1][0]), pts[i-1][1] + t * (pts[i][1] - pts[i-1][1])]);
          ctx.lineTo(q[0], q[1]); break;
        }
        acc += d; var b = P(pts[i]); ctx.lineTo(b[0], b[1]);
      }
      ctx.stroke();
    }
    function stroke(pts, color, w, frac) {
      ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      linePath(pts, frac);
    }
    function grid() {
      ctx.clearRect(0, 0, SZ, SZ);
      ctx.save(); ctx.strokeStyle = '#EDB8AE'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(SZ / 2, 0); ctx.lineTo(SZ / 2, SZ); ctx.moveTo(0, SZ / 2); ctx.lineTo(SZ, SZ / 2);
      ctx.moveTo(0, 0); ctx.lineTo(SZ, SZ); ctx.moveTo(SZ, 0); ctx.lineTo(0, SZ); ctx.stroke(); ctx.restore();
    }
    function glyph(alpha) {
      ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = '#16324A';
      ctx.font = Math.floor(SZ * 0.82) + 'px ' + KAI; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(cur.ch, SZ / 2, SZ * 0.53); ctx.restore();
    }
    function startDot(pts, num, color) {
      var a = P(pts[0]), r = Math.max(11, SZ * 0.042);
      ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(a[0], a[1], r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '900 ' + Math.floor(r * 1.2) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(num), a[0], a[1] + 1); ctx.restore();
    }
    function arrowAt(pts, color) {
      var n = pts.length, a = P(pts[n - 2]), b = P(pts[n - 1]), ang = Math.atan2(b[1] - a[1], b[0] - a[0]), r = SZ * 0.04;
      ctx.save(); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(b[0], b[1]);
      ctx.lineTo(b[0] - r * Math.cos(ang - 0.5), b[1] - r * Math.sin(ang - 0.5));
      ctx.lineTo(b[0] - r * Math.cos(ang + 0.5), b[1] - r * Math.sin(ang + 0.5)); ctx.fill(); ctx.restore();
    }
    var W = function () { return SZ * 0.075; };
    function draw() {
      if (!ctx || !cur) return;
      grid();
      var s = cur.strokes, i;
      if (cur.mode === 'watch') {
        for (i = 0; i < s.length; i++) stroke(s[i], '#E6DCD6', W());
        for (i = 0; i < cur.k && i < s.length; i++) stroke(s[i], '#16324A', W());
        if (cur.k < s.length && cur.prog > 0) {
          stroke(s[cur.k], '#D9483B', W(), cur.prog);
        }
        if (cur.k < s.length && !cur.playing) startDot(s[cur.k], cur.k + 1, '#D9483B');
      } else if (cur.mode === 'trace') {
        for (i = 0; i < s.length; i++) stroke(s[i], '#E6DCD6', W());
        for (i = 0; i < cur.k; i++) stroke(s[i], '#2E9E5B', W());
        if (cur.hint >= 0) stroke(s[cur.k], 'rgba(217,72,59,.85)', W() * 0.6, cur.hint);
        if (cur.k < s.length) { startDot(s[cur.k], cur.k + 1, '#D9483B'); if (cur.fails >= 2) arrowAt(s[cur.k], '#D9483B'); }
        if (cur.drawing) drawUser(cur.drawing, '#1A86A8');
      } else if (cur.mode === 'look' || cur.mode === 'quiz') {
        glyph(1);
      } else if (cur.mode === 'free') {
        glyph(0.18);
        cur.free.forEach(function (u) { drawUser(u, '#2E9E5B'); });
        if (cur.drawing) drawUser(cur.drawing, '#1A86A8');
      }
    }
    function drawUser(u, color) {
      if (!u.length) return;
      ctx.strokeStyle = color; ctx.lineWidth = SZ * 0.05; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); var a = P(u[0]); ctx.moveTo(a[0], a[1]);
      if (u.length === 1) ctx.lineTo(a[0] + 0.1, a[1]);
      for (var i = 1; i < u.length; i++) { var b = P(u[i]); ctx.lineTo(b[0], b[1]); }
      ctx.stroke();
    }

    /* ----- 播放筆順 ----- */
    function strokeMs(pts) { return (350 + plen(pts) * 9) / cur.speed; }
    function play() {
      if (!cur || !cur.strokes) return;
      if (cur.k >= cur.strokes.length) { cur.k = 0; cur.prog = 0; }
      cur.playing = true; updatePanel(); step();
    }
    function step() {
      if (!cur || !cur.playing) return;
      var s = cur.strokes;
      if (cur.k >= s.length) { cur.playing = false; updatePanel(); draw(); return; }
      if (api.reducedMotion) {          // 減少動態：一筆一筆直接出現
        cur.prog = 0; cur.k++; updatePanel(); draw();
        later(step, 900 / cur.speed); return;
      }
      var dur = strokeMs(s[cur.k]), t0 = performance.now() - cur.prog * dur;
      (function frame(now) {
        if (!alive || !cur || !cur.playing) return;
        cur.prog = Math.min(1, (now - t0) / dur); draw();
        if (cur.prog >= 1) { cur.k++; cur.prog = 0; updatePanel(); draw(); later(step, 260 / cur.speed); return; }
        raf = requestAnimationFrame(frame);
      })(performance.now());
    }
    function pause() { if (!cur) return; cur.playing = false; clearTimers(); updatePanel(); draw(); }

    /* ----- 手寫（描寫） ----- */
    function pt(e) {
      var r = cv.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100];
    }
    function onDown(e) {
      if (!cur || (cur.mode !== 'trace' && cur.mode !== 'free')) return;
      if (cur.mode === 'trace' && cur.k >= cur.strokes.length) return;
      e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      cur.drawing = [pt(e)]; draw();
    }
    function onMove(e) {
      if (!cur || !cur.drawing) return;
      e.preventDefault();
      var p = pt(e), last = cur.drawing[cur.drawing.length - 1];
      if (Math.hypot(p[0] - last[0], p[1] - last[1]) > 0.8) { cur.drawing.push(p); draw(); }
    }
    function onUp() {
      if (!cur || !cur.drawing) return;
      var u = cur.drawing; cur.drawing = null;
      if (cur.mode === 'trace') judge(u); else { cur.free.push(u); draw(); updatePanel(); }
    }
    function say(msg, cls) {
      var m = root.querySelector('.sk-msg'); if (!m) return;
      m.className = 'sk-msg' + (cls ? ' ' + cls : ''); m.textContent = msg;
    }
    function judge(u) {
      var s = cur.strokes, k = cur.k;
      if (plen(u) < 1.5 && plen(s[k]) > 25) { draw(); return; }      // 只是點一下
      var r = matchStroke(u, s[k]);
      if (r.ok) {
        cur.k++; cur.fails = 0; cur.hint = -1; api.beep(true);
        if (cur.k >= s.length) { finishTrace(); return; }
        say('✅ 第 ' + (k + 1) + ' 筆寫對了！接著寫第 ' + (cur.k + 1) + ' 筆（' + nameOf(cur.k) + '）', 'good');
        draw(); updatePanel(); return;
      }
      cur.fails++; api.beep(false);
      var other = -1;
      for (var j = 0; j < s.length; j++) { if (j !== k && matchStroke(u, s[j]).ok) { other = j; break; } }
      if (other >= 0 && other < k) say('這一筆已經寫過了喔！現在要寫第 ' + (k + 1) + ' 筆（' + nameOf(k) + '），從紅點開始。', 'bad');
      else if (other > k) say('順序不對！你寫的是第 ' + (other + 1) + ' 筆，要先寫第 ' + (k + 1) + ' 筆（' + nameOf(k) + '）。', 'bad');
      else if (r.rev) say('方向反了！第 ' + (k + 1) + ' 筆要從紅點開始寫。', 'bad');
      else say('再試一次：第 ' + (k + 1) + ' 筆是「' + nameOf(k) + '」，從紅點開始，照著灰色的線寫。', 'bad');
      if (cur.fails >= 2) showHint();
      draw();
    }
    function showHint() {
      if (api.reducedMotion) { cur.hint = 1; draw(); later(function () { cur.hint = -1; draw(); }, 1200); return; }
      var t0 = performance.now(), dur = 900;
      (function f(now) {
        if (!alive || !cur || cur.mode !== 'trace') return;
        cur.hint = Math.min(1, (now - t0) / dur); draw();
        if (cur.hint < 1) raf = requestAnimationFrame(f); else later(function () { cur.hint = -1; draw(); }, 400);
      })(t0);
    }
    function finishTrace() {
      draw(); updatePanel();
      api.confetti();
      var got = rewardOnce(cur.ch);
      say('🎉 太棒了！「' + cur.ch + '」' + cur.strokes.length + ' 筆全部照順序寫對！' + (got ? '得到 1 顆星⭐' : ''), 'good');
      var p = root.querySelector('[data-act="again"]'); if (p) p.hidden = false;
    }
    function nameOf(k) { var n = (SN[cur.ch] || '').split(' '); return n[k] || ('第' + (k + 1) + '筆'); }

    /* ----- 右側面板 ----- */
    function buildPanel() {
      var pn = root.querySelector('.sk-panel'), h = '';
      if (cur.mode === 'watch') {
        h = '<div class="sk-ctrl">' +
          '<button class="btn primary" data-act="play">▶ 播放</button>' +
          '<button class="btn" data-act="prev">⏮ 上一筆</button>' +
          '<button class="btn" data-act="next">下一筆 ⏭</button>' +
          '<button class="btn" data-act="replay">🔁 重播</button></div>' +
          '<div class="sk-speed">速度：<button class="sk-tab" data-sp="0.5">🐢 慢</button><button class="sk-tab" data-sp="1">中</button><button class="sk-tab" data-sp="2">🐇 快</button></div>' +
          '<div class="sk-msg" aria-live="polite"></div><div class="sk-names"></div>';
      } else if (cur.mode === 'trace') {
        h = '<div class="sk-msg" aria-live="polite">用手指或滑鼠，從紅點 ① 開始，照順序描第 1 筆（' + nameOf(0) + '）。</div>' +
          '<div class="sk-names"></div>' +
          '<div class="sk-ctrl"><button class="btn" data-act="restart">🔁 重新描寫</button><button class="btn" data-act="towatch">▶ 先看筆順</button></div>';
      } else if (cur.mode === 'look') {
        h = '<div class="sk-msg">這個字還沒有筆順動畫。先看清楚標準楷書字形，數一數有幾筆，再到「描寫數筆畫」寫寫看。</div>' +
          '<div class="sk-ctrl"><button class="btn primary" data-act="tofree">✏️ 描寫數筆畫</button><button class="btn" data-act="toquiz">❓ 考考你</button></div>';
      } else if (cur.mode === 'free') {
        h = '<div class="sk-msg" aria-live="polite">照著淡淡的字描寫，每寫一筆就會計數。寫完按「寫好了」。</div>' +
          '<div class="sk-ctrl"><button class="btn" data-act="undo">↩ 擦掉一筆</button><button class="btn" data-act="clear">🧽 全部擦掉</button><button class="btn primary" data-act="check">寫好了</button></div>';
      } else if (cur.mode === 'quiz') {
        h = quizHtml();
      }
      pn.innerHTML = h;
      bindPanel(pn);
      updatePanel();
    }
    function bindPanel(pn) {
      function on(a, fn) { var b = pn.querySelector('[data-act="' + a + '"]'); if (b) b.onclick = fn; }
      on('play', function () { if (cur.playing) pause(); else play(); });
      on('prev', function () { pause(); cur.k = Math.max(0, cur.k - (cur.prog > 0 ? 0 : 1)); cur.prog = 0; updatePanel(); draw(); });
      on('next', function () { pause(); cur.prog = 0; cur.k = Math.min(cur.strokes.length, cur.k + 1); updatePanel(); draw(); });
      on('replay', function () { pause(); cur.k = 0; cur.prog = 0; play(); });
      pn.querySelectorAll('[data-sp]').forEach(function (b) { b.onclick = function () { cur.speed = +b.dataset.sp; updatePanel(); }; });
      on('restart', function () { cur.k = 0; cur.fails = 0; cur.hint = -1; buildPanel(); draw(); });
      on('towatch', function () { showChar(cur.ch, 'watch'); });
      on('tofree', function () { showChar(cur.ch, 'free'); });
      on('toquiz', function () { showChar(cur.ch, 'quiz'); });
      on('undo', function () { cur.free.pop(); draw(); updatePanel(); });
      on('clear', function () { cur.free = []; draw(); updatePanel(); });
      on('check', function () {
        var n = cur.free.length, need = cur.info.n;
        if (n === need) {
          api.beep(true); api.confetti();
          var got = rewardOnce(cur.ch);
          say('🎉 答對了！「' + cur.ch + '」一共 ' + need + ' 畫，你寫了 ' + n + ' 筆。' + (got ? '得到 1 顆星⭐' : ''), 'good');
        } else {
          api.beep(false);
          say('你寫了 ' + n + ' 筆，「' + cur.ch + '」' + (n < need ? '還少了 ' + (need - n) : '多了 ' + (n - need)) + ' 筆喔！擦掉再寫一次。提示：「' + cur.info.rad + '」部。', 'bad');
        }
      });
      pn.querySelectorAll('[data-qa]').forEach(function (b) { b.onclick = function () { answer(b); }; });
    }
    function updatePanel() {
      if (!cur) return;
      var pn = root.querySelector('.sk-panel'); if (!pn) return;
      var s = cur.strokes;
      var pb = pn.querySelector('[data-act="play"]');
      if (pb) pb.textContent = cur.playing ? '⏸ 暫停' : '▶ 播放';
      pn.querySelectorAll('[data-sp]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.sp === cur.speed)); });
      var names = pn.querySelector('.sk-names');
      if (names && s) {
        var nm = (SN[cur.ch] || '').split(' '), h = '';
        for (var i = 0; i < s.length; i++) {
          var cls = i < cur.k ? 'done' : (i === cur.k ? 'cur' : '');
          h += '<span class="' + cls + '">' + (i + 1) + ' ' + esc(nm[i] || '') + '</span>';
        }
        names.innerHTML = h;
      }
      if (cur.mode === 'watch') {
        var m = pn.querySelector('.sk-msg');
        if (m) m.textContent = cur.k >= s.length ? '寫完了！「' + cur.ch + '」共 ' + s.length + ' 筆。去「描寫練習」試試看！'
          : '第 ' + (cur.k + 1) + ' / ' + s.length + ' 筆：' + nameOf(cur.k);
      }
      if (cur.mode === 'free') {
        var mm = pn.querySelector('.sk-msg');
        if (mm && !/good|bad/.test(mm.className)) mm.textContent = '已經寫了 ' + cur.free.length + ' 筆。照著淡淡的字描寫，寫完按「寫好了」。';
      }
    }

    /* ----- 考考你：筆畫數＋部首 ----- */
    function quizHtml() {
      var n = cur.info.n, opts = [n], d;
      while (opts.length < 4) { d = n + [-2, -1, 1, 2, 3][Math.floor(Math.random() * 5)]; if (d > 0 && opts.indexOf(d) < 0) opts.push(d); }
      shuffle(opts);
      var rad = cur.info.rad, pool = Object.keys(INFO).map(function (c) { return INFO[c].rad; }), ro = [rad];
      var guard = 0;
      while (ro.length < 4 && guard++ < 500) { var r = pool[Math.floor(Math.random() * pool.length)]; if (ro.indexOf(r) < 0 && r !== cur.ch) ro.push(r); }
      shuffle(ro);
      cur.quiz = { a: false, b: false, tries: 0 };
      return '<div class="sk-msg" aria-live="polite">兩題都答對就能得到星星！</div>' +
        '<b>1.「' + esc(cur.ch) + '」一共幾畫？</b><div class="sk-q">' +
        opts.map(function (o) { return '<button data-qa="n" data-v="' + o + '">' + o + '</button>'; }).join('') + '</div>' +
        '<b>2.「' + esc(cur.ch) + '」的部首是哪一個？</b><div class="sk-q">' +
        ro.map(function (o) { return '<button class="kai" data-qa="r" data-v="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div>' +
        '';
    }
    function answer(b) {
      var q = cur.quiz, kind = b.dataset.qa, v = b.dataset.v;
      if ((kind === 'n' && q.a) || (kind === 'r' && q.b)) return;
      var right = kind === 'n' ? (+v === cur.info.n) : (v === cur.info.rad);
      api.beep(right);
      if (right) {
        b.classList.add('right');
        if (kind === 'n') q.a = true; else q.b = true;
        var fc = root.querySelector('[data-fact="' + kind + '"]');
        if (fc) fc.textContent = kind === 'n' ? cur.info.n + ' 畫' : cur.info.rad;
        root.querySelectorAll('[data-qa="' + kind + '"]').forEach(function (x) { x.disabled = true; });
      } else { b.classList.add('wrong'); b.disabled = true; q.tries++; }
      if (q.a && q.b) {
        api.confetti();
        var got = rewardOnce(cur.ch);
        say('🎉 全對！「' + cur.ch + '」' + cur.info.n + ' 畫，部首是「' + cur.info.rad + '」。' + (got ? '得到 1 顆星⭐' : ''), 'good');
      } else if (!right) {
        say(kind === 'n' ? '不對喔，再數一數筆畫。' : '不對喔，想一想這個字跟什麼有關？', 'bad');
      }
    }

    // 視窗大小改變：重算畫布
    var rz = 0, lastW = window.innerWidth;
    function onResize() {
      clearTimeout(rz);
      rz = setTimeout(function () {
        if (Math.abs(window.innerWidth - lastW) < 40) return;   // 手機網址列伸縮不重畫，免得描寫進度消失
        lastW = window.innerWidth;
        if (cur && cv && !cur.k && !cur.free.length) { var c = cur; showChar(c.ch, c.mode); }
      }, 250);
    }
    window.addEventListener('resize', onResize);

    showList();
    return function cleanup() {
      alive = false; clearTimers(); clearTimeout(rz);
      window.removeEventListener('resize', onResize);
      try { api.stopSpeak(); } catch (e) {}
    };
  }

  // 給測試頁用的資料（不影響 app）
  var EXPORT = { GRADES: GRADES, INFO: INFO, STROKES: S, matchStroke: matchStroke };

  (window.CFX = window.CFX || []).push({
    id: 'stroke',
    title: '國字筆順',
    icon: '✍️',
    grades: [1, 2, 3, 4, 5, 6],
    subject: '國語',
    desc: '看筆順動畫、照順序描寫，練筆畫和部首',
    render: render,
    _data: EXPORT
  });
})();
