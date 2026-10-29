/* 啟賦小學堂 小工具：自然發音 Phonics（phonics）
 * 五段課程：字母音 → 短母音 → 子音組合 → Magic e → 母音組合
 * 每課：認識（示範）→ 拼讀示範（逐音→連快→合字）→ 練習 10 題（聽音選字／聽字選音／拼字／讀讀看假字）
 * 內容全部原創。單音與單字用 make_phonics_audio.py 預先做好的音檔（phonics_audio/），字母名、假字用瀏覽器語音。
 * 依 modules/MODULE_SPEC.md：只用 api，不連外部服務、不用外部圖片。
 */
(function () {
  'use strict';

  /* ================= 課程資料 ================= */
  var SEGS = [
    { id: 's1', name: '字母音', icon: '🔤', desc: '26 個字母：字母名和字母音不一樣' },
    { id: 's2', name: '短母音', icon: '🍎', desc: 'a e i o u 短音＋字族（-at -ig -op…）' },
    { id: 's3', name: '子音組合', icon: '🚢', desc: 'sh ch th wh ck ng，和 bl tr st 等' },
    { id: 's4', name: 'Magic e 長母音', icon: '🪄', desc: 'a_e i_e o_e u_e，字尾 e 不發音' },
    { id: 's5', name: '母音組合', icon: '🐝', desc: 'ee ea ai ay oa oo ar or er…' }
  ];

  // 字母：[字母, 示範字, emoji, 發音提示]
  var LETTERS = [
    ['a', 'apple', '🍎', '嘴巴張大，介於「ㄚ」和「ㄝ」之間'],
    ['b', 'bus', '🚌', '雙唇閉緊再彈開，喉嚨有震動'],
    ['c', 'cat', '🐱', '舌根頂上去再放開，像輕輕的「ㄎ」'],
    ['d', 'dog', '🐶', '舌尖碰上排牙齦，像「ㄉ」'],
    ['e', 'egg', '🥚', '嘴巴半開，像短短的「ㄝ」'],
    ['f', 'fish', '🐟', '上排牙齒輕碰下唇，吹氣'],
    ['g', 'goat', '🐐', '像「ㄍ」，喉嚨有震動'],
    ['h', 'hat', '🎩', '輕輕哈一口氣'],
    ['i', 'insect', '🐜', '短短的「ㄧ」，嘴巴放鬆'],
    ['j', 'juice', '🧃', '像「ㄐ」再把嘴唇嘟起來'],
    ['k', 'kite', '🪁', '和 c 一樣，像輕輕的「ㄎ」'],
    ['l', 'lion', '🦁', '舌尖頂住上排牙齦'],
    ['m', 'moon', '🌙', '閉上嘴巴哼「ㄇ」'],
    ['n', 'nose', '👃', '舌尖頂住上排牙齦哼「ㄋ」'],
    ['o', 'octopus', '🐙', '嘴巴張圓，像短短的「ㄚ」'],
    ['p', 'pig', '🐷', '雙唇彈開送氣，只有氣沒有聲'],
    ['q', 'queen', '👸', '幾乎都和 u 一起：qu 像「ㄎㄨ」'],
    ['r', 'rabbit', '🐰', '嘴唇嘟起，舌頭往後捲，不碰上面'],
    ['s', 'sun', '☀️', '像蛇吐氣的「ㄙ」'],
    ['t', 'tiger', '🐯', '舌尖彈開送氣，只有氣沒有聲'],
    ['u', 'umbrella', '☂️', '短短的「ㄜ」'],
    ['v', 'van', '🚐', '上排牙齒輕碰下唇，喉嚨震動'],
    ['w', 'web', '🕸️', '嘴唇嘟圓再放開，像「ㄨ」'],
    ['x', 'fox', '🦊', '常在字尾，念起來像「ㄎㄙ」'],
    ['y', 'yo-yo', '🪀', '像「ㄧ」很快滑過去'],
    ['z', 'zebra', '🦓', '像蜜蜂嗡嗡叫，帶震動的「ㄗ」']
  ];
  var LMAP = {};
  LETTERS.forEach(function (x) { LMAP[x[0]] = x; });

  function W(s) { // 'cat🐱 hat🎩 mat' → [['cat','🐱'],['hat','🎩'],['mat','']]
    return s.split(' ').map(function (t) {
      var m = t.match(/^([a-z]+)(.*)$/);
      return [m[1], m[2] || ''];
    });
  }
  function N(s) { // 'zat:at$ lat:at$'
    return s.split(' ').map(function (t) { var p = t.split(':'); return [p[0], p[1]]; });
  }

  var LESSONS = [
    { id: 's1l1', seg: 's1', kind: 'letter', title: 'a b c d e', letters: 'abcde' },
    { id: 's1l2', seg: 's1', kind: 'letter', title: 'f g h i j', letters: 'fghij' },
    { id: 's1l3', seg: 's1', kind: 'letter', title: 'k l m n o', letters: 'klmno' },
    { id: 's1l4', seg: 's1', kind: 'letter', title: 'p q r s t', letters: 'pqrst' },
    { id: 's1l5', seg: 's1', kind: 'letter', title: 'u v w x y z', letters: 'uvwxyz' },

    { id: 's2l1', seg: 's2', kind: 'cvc', title: '短 a：-at -an', big: '-at　-an', pats: ['at', 'an'],
      hint: '短 a：嘴巴張大。字族就是「後半一樣、換開頭」，會一個就會一串！',
      words: W('cat🐱 hat🎩 bat🦇 mat rat🐀 can🥫 fan man👨 pan🍳 van🚐'), nons: N('zat:at$ jat:at$ yan:an$') },
    { id: 's2l2', seg: 's2', kind: 'cvc', title: '短 a：-ap -ag -am', big: '-ap　-ag　-am', pats: ['ap', 'ag', 'am'],
      hint: '還是短 a！換個尾巴：-ap、-ag、-am。',
      words: W('cap🧢 map🗺️ nap😴 tap🚰 bag👜 tag🏷️ wag🐕 ham🍖 jam ram🐏'), nons: N('vap:ap$ pag:ag$ kam:am$') },
    { id: 's2l3', seg: 's2', kind: 'cvc', title: '短 e：-en -et -ed', big: '-en　-et　-ed', pats: ['en', 'et', 'ed'],
      hint: '短 e：嘴巴半開，像短短的「ㄝ」。',
      words: W('hen🐔 pen🖊️ ten🔟 net🥅 jet✈️ wet💧 pet🐶 bed🛏️ red🔴'), nons: N('ven:en$ zet:et$ ked:ed$') },
    { id: 's2l4', seg: 's2', kind: 'cvc', title: '短 i：-ig -in -it', big: '-ig　-in　-it', pats: ['ig', 'in', 'it'],
      hint: '短 i：短短的「ㄧ」，嘴巴放鬆不要拉長。',
      words: W('pig🐷 wig big dig⛏️ pin📌 fin bin🗑️ win🏆 sit🪑 kit'), nons: N('vig:ig$ jin:in$ lig:ig$ rin:in$') },
    { id: 's2l5', seg: 's2', kind: 'cvc', title: '短 o：-op -ot -og', big: '-op　-ot　-og', pats: ['op', 'ot', 'og'],
      hint: '短 o：嘴巴張圓，像短短的「ㄚ」。',
      words: W('top🔝 mop hop🐸 hot🔥 dot⚫ cot dog🐶 log🪵 fog🌫️ jog🏃'), nons: N('zop:op$ vot:ot$ kog:og$') },
    { id: 's2l6', seg: 's2', kind: 'cvc', title: '短 u：-ug -un -ub', big: '-ug　-un　-ub', pats: ['ug', 'un', 'ub'],
      hint: '短 u：短短的「ㄜ」，嘴巴輕鬆張開。',
      words: W('bug🐛 hug🤗 mug☕ rug sun☀️ run🏃 bun🍞 fun🎉 tub🛁 cub🐻'), nons: N('zug:ug$ vun:un$ jub:ub$') },
    { id: 's2l7', seg: 's2', kind: 'cvc', title: '短母音大集合', big: 'a e i o u', pats: [],
      hint: '只差一個母音，意思就完全不同：bag、big、bug！仔細聽中間的音。',
      words: W('bag👜 big bug🐛 hat🎩 hot🔥 hit pen🖊️ pin📌 pan🍳 cap🧢 cup🥤 map🗺️ mop'),
      nons: N('tib:^[^aeiou]i[^aeiou]$ fep:^[^aeiou]e[^aeiou]$ lom:^[^aeiou]o[^aeiou]$ nug:^[^aeiou]u[^aeiou]$ vab:^[^aeiou]a[^aeiou]$') },

    { id: 's3l1', seg: 's3', kind: 'dig', title: 'sh', big: 'sh', pats: ['sh'],
      hint: 'sh：嘴唇嘟起來，像叫人安靜的「噓～」。',
      words: W('ship🚢 shop🏪 shell🐚 shed fish🐟 dish🍽️ wish🌠 cash💵'), nons: N('shom:sh vish:sh shib:sh') },
    { id: 's3l2', seg: 's3', kind: 'dig', title: 'ch', big: 'ch', pats: ['ch'],
      hint: 'ch：像「ㄑ」再嘟嘴，短短的、有力的。',
      words: W('chip🍟 chin chop chick🐥 chest rich much lunch🍱'), nons: N('chab:ch chog:ch poch:ch') },
    { id: 's3l3', seg: 's3', kind: 'dig', title: 'th', big: 'th', pats: ['th'],
      hint: 'th：舌尖輕放在上下牙齒中間吹氣。thin、bath 只吹氣；this、that 喉嚨會震動。',
      words: W('thin thick bath🛁 math➗ path with this that'), nons: N('thab:th thup:th thep:th') },
    { id: 's3l4', seg: 's3', kind: 'dig', title: 'wh 與 ck', big: 'wh　ck', pats: ['wh', 'ck'],
      hint: 'wh 和 w 的音差不多，嘴唇嘟圓；ck 跟在短母音後面，念 k 的音。',
      words: W('when which whip whiz duck🦆 sock🧦 rock🪨 lock🔒 kick neck'), nons: N('whab:wh whep:wh jeck:ck zock:ck') },
    { id: 's3l5', seg: 's3', kind: 'dig', title: 'ng', big: 'ng', pats: ['ng'],
      hint: 'ng：鼻子哼出來的音，像「ㄥ」的尾巴。',
      words: W('ring💍 king👑 sing🎤 wing long song🎵 bang💥 lung🫁'), nons: N('vang:ng fing:ng tung:ng') },
    { id: 's3l6', seg: 's3', kind: 'blend', title: 'bl cl fl pl sl gl', big: 'bl cl fl pl sl gl', pats: ['bl', 'cl', 'fl', 'pl', 'sl', 'gl'],
      hint: '兩個子音各念各的，但要很快黏在一起，中間不要多加「ㄜ」。',
      words: W('black⚫ block🧱 clap👏 clock🕰️ flag🚩 flip plug🔌 sled🛷 slip glad'), nons: N('blim:^bl clob:^cl plet:^pl') },
    { id: 's3l7', seg: 's3', kind: 'blend', title: 'br cr dr fr gr tr', big: 'br cr dr fr gr tr', pats: ['br', 'cr', 'dr', 'fr', 'gr', 'tr'],
      hint: '前面的子音接上 r：嘴唇嘟起、舌頭往後捲，一口氣念完。',
      words: W('brick crab🦀 drum🥁 dress👗 frog🐸 grin😁 grab trip truck🚚'), nons: N('brup:^br crim:^cr trob:^tr drep:^dr') },
    { id: 's3l8', seg: 's3', kind: 'blend', title: 'st sp sn sk sw sm', big: 'st sp sn sk sw sm', pats: ['st', 'sp', 'sn', 'sk', 'sw', 'sm'],
      hint: 's 先嘶一聲，馬上接下一個子音。st 也常在字尾，像 nest。',
      words: W('stop🛑 step spin spot snap skip swim🏊 smash sniff nest'), nons: N('spob:^sp snup:^sn stib:^st swep:^sw') },

    { id: 's4l1', seg: 's4', kind: 'magic', title: 'a_e', big: 'a_e', pats: ['a'],
      hint: '字尾的 e 不發音，但它有魔法：讓前面的 a 念字母名「A」的音。',
      words: W('cake🎂 lake🏞️ game🎮 gate name tape cave plate🍽️ snake🐍 grape🍇'), nons: N('jate:a[^aeiou]e$ pame:a[^aeiou]e$ vake:a[^aeiou]e$') },
    { id: 's4l2', seg: 's4', kind: 'magic', title: 'i_e', big: 'i_e', pats: ['i'],
      hint: 'i_e：字尾 e 不念，i 念字母名「I」的音（像「ㄞ」）。',
      words: W('kite🪁 bike🚲 five5️⃣ nine9️⃣ hide ride pine🌲 slide smile😊'), nons: N('bife:i[^aeiou]e$ zime:i[^aeiou]e$ nide:i[^aeiou]e$') },
    { id: 's4l3', seg: 's4', kind: 'magic', title: 'o_e', big: 'o_e', pats: ['o'],
      hint: 'o_e：字尾 e 不念，o 念字母名「O」的音（像「ㄡ」）。',
      words: W('rose🌹 bone🦴 home🏠 hole note📝 rope nose👃 stone🪨'), nons: N('vone:o[^aeiou]e$ zote:o[^aeiou]e$ fope:o[^aeiou]e$') },
    { id: 's4l4', seg: 's4', kind: 'magic', title: 'u_e', big: 'u_e', pats: ['u'],
      hint: 'u_e：u 念字母名「U」（cube、cute），有時念成「ㄨ」（rule、flute）。',
      words: W('cube🧊 tube cute mule flute rule tune🎵 use'), nons: N('zube:u[^aeiou]e$ vune:u[^aeiou]e$ jume:u[^aeiou]e$') },
    { id: 's4l5', seg: 's4', kind: 'magic', title: '短音 vs 長音', big: 'cap → cape', pats: [],
      hint: '加上一個 e，母音就從短音變長音：cap → cape、kit → kite。',
      words: W('cap🧢 cape tap tape kit kite🪁 pin📌 pine🌲 hop🐸 hope not note📝 cub🐻 cube🧊 tub🛁 tube'),
      nons: N('fipe:i[^aeiou]e$ mab:^[^aeiou]+a[^aeiou]$ gope:o[^aeiou]e$ nup:^[^aeiou]+u[^aeiou]$') },

    { id: 's5l1', seg: 's5', kind: 'team', title: 'ee 與 ea', big: 'ee　ea', pats: ['ee', 'ea'],
      hint: 'ee 和 ea 都念長 e，就是字母 E 的名字。兩個母音走在一起，第一個說話！',
      words: W('bee🐝 tree🌳 feet🦶 sheep🐑 green tea🍵 sea🌊 leaf🍃 eat seal🦭'), nons: N('zeet:ee|ea veam:ee|ea feep:ee|ea') },
    { id: 's5l2', seg: 's5', kind: 'team', title: 'ai 與 ay', big: 'ai　ay', pats: ['ai', 'ay'],
      hint: 'ai 和 ay 都念長 a（字母 A 的名字）。ay 通常在字尾。',
      words: W('rain🌧️ tail snail🐌 train🚆 paint🎨 day play say hay tray'), nons: N('jait:ai|ay|a[^aeiou]e$ zay:ai|ay|a[^aeiou]e$ vaip:ai|ay|a[^aeiou]e$') },
    { id: 's5l3', seg: 's5', kind: 'team', title: 'oa 與 ow', big: 'oa　ow', pats: ['oa', 'ow'],
      hint: 'oa 和 ow 念長 o（字母 O 的名字）。ow 也有 cow 的音，這課先學 snow 的音。',
      words: W('boat⛵ goat🐐 coat🧥 road🛣️ soap🧼 toast🍞 snow❄️ bowl🥣 slow🐢'), nons: N('zoat:oa|ow|o[^aeiou]e$ voap:oa|ow|o[^aeiou]e$ droam:oa|ow|o[^aeiou]e$') },
    { id: 's5l4', seg: 's5', kind: 'team', title: 'oo', big: 'oo', pats: ['oo'],
      hint: 'oo 有兩種：長的像 moon（「ㄨ～」），短的像 book（短短的「ㄨ」）。',
      words: W('moon🌙 food spoon🥄 zoo🦁 pool book📚 look👀 cook foot🦶'), nons: N('voon:oon$|une$ zook:ook$ gool:ool$|ule$') },
    { id: 's5l5', seg: 's5', kind: 'team', title: 'ar', big: 'ar', pats: ['ar'],
      hint: 'ar：先張大嘴「ㄚ」，再把舌頭捲起來，像「ㄚ兒」。',
      words: W('car🚗 star⭐ farm🚜 park jar shark🦈 arm💪 card'), nons: N('varp:ar zark:ar marb:ar') },
    { id: 's5l6', seg: 's5', kind: 'team', title: 'or', big: 'or', pats: ['or'],
      hint: 'or：嘴巴圓圓的「ㄛ」，再捲舌，像「ㄛ兒」。',
      words: W('fork🍴 corn🌽 horse🐴 storm⛈️ short sport born for'), nons: N('zorp:or vorn:or gork:or') },
    { id: 's5l7', seg: 's5', kind: 'team', title: 'er ir ur', big: 'er　ir　ur', pats: ['er', 'ir', 'ur'],
      hint: 'er、ir、ur 三種寫法，念的是同一個捲舌音，像「ㄦ」。',
      words: W('her fern🌿 tiger🐯 bird🐦 girl👧 shirt👕 turtle🐢 nurse surf🏄'), nons: N('zirp:er|ir|ur merb:er|ir|ur vurn:er|ir|ur') }
  ];
  var LBYID = {};
  // 作業編號 no = 1..N（班級作業碼用）。編號定了之後只能往後加新課，不能改順序！
  LESSONS.forEach(function (l, i) { l.idx = i; l.no = i + 1; LBYID[l.id] = l; });

  // 字母課也整理成 words 方便共用
  LESSONS.forEach(function (l) {
    if (l.kind === 'letter') l.words = l.letters.split('').map(function (c) { return [LMAP[c][1], LMAP[c][2], c]; });
  });

  var S3PATS = ['sh', 'ch', 'th', 'wh', 'ck', 'ng', 'bl', 'cl', 'fl', 'pl', 'sl', 'gl', 'br', 'cr', 'dr', 'fr', 'gr', 'tr', 'st', 'sp', 'sn', 'sk', 'sw', 'sm'];
  var S5GROUPS = [
    { k: 'e', label: 'ee / ea', re: /ee|ea/ },
    { k: 'a', label: 'ai / ay', re: /ai|ay/ },
    { k: 'o', label: 'oa / ow', re: /oa|ow/ },
    { k: 'oo', label: 'oo', re: /oo/ },
    { k: 'ar', label: 'ar', re: /ar/ },
    { k: 'or', label: 'or', re: /or/ },
    { k: 'er', label: 'er / ir / ur', re: /er|ir|ur/ }
  ];
  var CHUNKS = ['sh', 'ch', 'th', 'wh', 'ck', 'ng', 'ee', 'ea', 'ai', 'ay', 'oa', 'ow', 'oo', 'ar', 'or', 'er', 'ir', 'ur', 'll', 'ss', 'ff', 'qu'];
  var CONFUSE = { c: 'kq', k: 'cq', q: 'ck', j: 'g', g: 'j' };
  var MAGIC_RE = /^[^aeiou]*[aeiou][^aeiou]e$/;
  var SHORT_RE = /^[^aeiou]+[aeiou][^aeiou]$/;

  /* ================= 小工具 ================= */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function uniq(a) { var o = [], s = {}; a.forEach(function (x) { if (!s[x]) { s[x] = 1; o.push(x); } }); return o; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function segWords(seg) {
    var o = [];
    LESSONS.forEach(function (l) { if (l.seg === seg) l.words.forEach(function (w) { o.push(w[0]); }); });
    return uniq(o);
  }
  var EMOJI = {};
  LESSONS.forEach(function (l) { l.words.forEach(function (w) { if (w[1] && !EMOJI[w[0]]) EMOJI[w[0]] = w[1]; }); });
  var WORDSET = {}; // 有錄音檔的字（make_phonics_audio.py 會產生同一份）
  LESSONS.forEach(function (l) { l.words.forEach(function (w) { WORDSET[w[0].replace(/-/g, '')] = 1; }); });
  function vowelOf(w) { var m = w.match(/[aeiou]/); return m ? m[0] : ''; }
  function isMagic(w) { return MAGIC_RE.test(w); }
  function s3pat(w, l) {
    var list = (l && l.pats.length ? l.pats : []).concat(S3PATS);
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (l && l.kind === 'blend') { if (w.indexOf(p) === 0 || (p === 'st' && /st$/.test(w))) return p; }
      else if (w.indexOf(p) >= 0) return p;
    }
    return '';
  }
  function s5group(w) { for (var i = 0; i < S5GROUPS.length; i++) if (S5GROUPS[i].re.test(w)) return S5GROUPS[i]; return null; }

  // 把字切成發音單位（字形）：sh/ee/ar… 視為一塊；Magic e 標記
  function units(w) {
    var u = [], i = 0;
    while (i < w.length) {
      var two = w.substr(i, 2);
      if (two.length === 2 && CHUNKS.indexOf(two) >= 0) { u.push({ t: two }); i += 2; }
      else { u.push({ t: w[i] }); i++; }
    }
    var n = u.length;
    if (n >= 3 && u[n - 1].t === 'e' && /^[aeiou]$/.test(u[n - 3].t) && /^[^aeiou]$/.test(u[n - 2].t)) {
      u[n - 3].magic = 1; u[n - 1].magic = 1; u[n - 1].silent = 1;
    }
    u.forEach(function (x) {
      x.kind = x.magic ? 'magic' : (x.t.length > 1 ? 'chunk' : (/[aeiou]/.test(x.t) ? 'vowel' : 'cons'));
    });
    return u;
  }
  // 例字上把本課重點標色
  function hl(w, l) {
    function wrap(at, len) { return esc(w.slice(0, at)) + '<b class="ph-hl">' + esc(w.substr(at, len)) + '</b>' + esc(w.slice(at + len)); }
    if (l.kind === 'letter') {
      var x = LETTERS.filter(function (y) { return y[1] === w; })[0], c = x ? x[0] : w[0];
      return c === 'x' ? wrap(w.lastIndexOf('x'), 1) : wrap(0, c === 'q' ? 2 : 1);
    }
    if (l.kind === 'blend') {
      var p = s3pat(w, l);
      return wrap(w.indexOf(p) === 0 ? 0 : w.length - 2, 2);
    }
    return units(w).map(function (u) {
      var on = false;
      if (l.kind === 'cvc') on = u.kind === 'vowel';
      else if (l.kind === 'dig' || l.kind === 'team') on = l.pats.indexOf(u.t) >= 0;
      else if (l.kind === 'magic') on = !!u.magic || u.kind === 'vowel';
      return on ? '<b class="ph-hl' + (u.silent ? ' sil' : '') + '">' + esc(u.t) + '</b>' : esc(u.t);
    }).join('');
  }

  /* ================= 單音音檔（make_phonics_audio.py 產生，key 要和那邊的 PH_IPA 一致） ================= */
  var AUDIO_BASE = ((document.currentScript && document.currentScript.src) || '').replace(/[?#].*$/, '').replace(/[^\/]*$/, '') + 'phonics_audio/';
  var PH_ONE = { a: 'ae', e: 'eh', i: 'ih', o: 'ah', u: 'uh', c: 'k', q: 'kw', x: 'ks' };
  var PH_CHUNK = { sh: 'sh', ch: 'ch', th: 'th', wh: 'w', ck: 'k', ng: 'ng', ee: 'ee', ea: 'ee', ai: 'ay', ay: 'ay', oa: 'oh', ow: 'oh',
    oo: 'oo', ar: 'ar', or: 'or', er: 'er', ir: 'er', ur: 'er', ll: 'l', ss: 's', ff: 'f', qu: 'kw' };
  var PH_LONG = { a: 'ay', i: 'ie', o: 'oh', u: 'oo' };
  // 不照規則念的字（和 units() 一塊對一塊）
  var PH_OVR = {
    tiger: ['t', 'ie', 'g', 'er'], turtle: ['t', 'er', 't', 'el', ''], this: ['dh', 'ih', 's'], that: ['dh', 'ae', 't'],
    book: ['b', 'uu', 'k'], look: ['l', 'uu', 'k'], cook: ['k', 'uu', 'k'], foot: ['f', 'uu', 't'],
    cube: ['k', 'yoo', 'b', ''], cute: ['k', 'yoo', 't', ''], mule: ['m', 'yoo', 'l', ''], use: ['yoo', 'z', ''],
    rose: ['r', 'oh', 'z', ''], nose: ['n', 'oh', 'z', ''], long: ['l', 'aw', 'ng'], song: ['s', 'aw', 'ng']
  };
  var PH_KEYS = 'b k d f g h j l m n p kw r s t v w ks y z ae eh ih ah uh aw sh ch th dh ng ee ay ie oh yoo oo uu ar or er el'.split(' ');
  // 每一塊念什麼音：'' ＝不發音
  function phones(w) {
    var u = units(w);
    if (PH_OVR[w]) return PH_OVR[w];
    return u.map(function (x, i) {
      if (x.silent) return '';
      if (x.magic) return PH_LONG[x.t] || '';
      if (x.t === 'e' && i === u.length - 1 && i > 0 && u.slice(0, i).some(function (y) { return /[aeiou]/.test(y.t); })) return '';
      if (x.t.length > 1) return PH_CHUNK[x.t] || '';
      return PH_ONE[x.t] || x.t;
    });
  }
  function letterPhone(c) { return PH_ONE[c] || c; }

  /* ================= 出題 ================= */
  // 題目：{type, prompt, say, show, opts:[{v,label}], ans, word, ...}
  function optsFrom(ans, pool, n, labeler) {
    var d = shuffle(pool.filter(function (x) { return x !== ans; })).slice(0, n - 1);
    return shuffle([ans].concat(d)).map(function (v) { return { v: v, label: labeler ? labeler(v) : v }; });
  }
  function wordDistractPool(l, target) {
    var same = l.words.map(function (w) { return w[0]; }).filter(function (w) { return w !== target; });
    var seg = segWords(l.seg).filter(function (w) { return w !== target && same.indexOf(w) < 0; });
    return { same: shuffle(same), seg: shuffle(seg) };
  }
  function qListen(l, w) {
    var p = wordDistractPool(l, w);
    var d = uniq(p.same.concat(p.seg)).slice(0, 3);
    return { type: 'listen', tag: '聽音選字', prompt: '聽一聽，是哪一個字？', say: w, word: w,
      opts: shuffle([w].concat(d)).map(function (v) { return { v: v, label: v, en: 1 }; }), ans: w };
  }
  function qSound(l, w) {
    var q = { type: 'sound', tag: '聽字選音', say: w, word: w };
    if (l.kind === 'letter') {
      var c = w[0], bad = CONFUSE[c] || '';
      var pool = l.letters.split('').concat('abcdefghijklmnoprstuvwyz'.split('')).filter(function (x) { return x !== c && bad.indexOf(x) < 0 && x !== 'x'; });
      q.prompt = '聽一聽，這個字的第一個音是哪個字母？';
      q.opts = optsFrom(c, uniq(pool).slice(0, 8), 4, function (v) { return v.toUpperCase() + v; }); q.ans = c;
    } else if (l.kind === 'cvc') {
      q.prompt = '聽一聽，中間的母音是哪一個？';
      q.ans = vowelOf(w);
      q.opts = 'aeiou'.split('').map(function (v) { return { v: v, label: v, en: 1 }; });
    } else if (l.kind === 'dig' || l.kind === 'blend') {
      var p = s3pat(w, l);
      var cand = shuffle(l.pats.filter(function (x) { return x !== p; })).concat(shuffle(S3PATS));
      cand = uniq(cand).filter(function (x) { return x !== p && w.indexOf(x) < 0; });
      if (l.kind === 'blend') cand = cand.filter(function (x) { return S3PATS.indexOf(x) >= 6; }).concat(cand);
      cand = uniq(cand);
      q.prompt = '聽一聽，這個字裡有哪一個子音組合？';
      q.ans = p; q.opts = shuffle([p].concat(cand.slice(0, 3))).map(function (v) { return { v: v, label: v, en: 1 }; });
    } else if (l.kind === 'magic') {
      var v = vowelOf(w), ans = isMagic(w) ? v + '_e' : v;
      var others = shuffle(['a', 'i', 'o', 'u'].filter(function (x) { return x !== v; })).slice(0, 2).map(function (x) { return x + '_e'; });
      q.prompt = '聽一聽，母音是短音還是長音（Magic e）？';
      q.ans = ans;
      q.opts = shuffle([v, v + '_e'].concat(others)).map(function (x) {
        return { v: x, label: x.length === 1 ? x + '（短音）' : x + '（長音）', en: 1 };
      });
    } else {
      var g = s5group(w);
      var og = shuffle(S5GROUPS.filter(function (x) { return x !== g; })).slice(0, 3);
      q.prompt = '聽一聽，這個字裡是哪一組母音的音？';
      q.ans = g.k;
      q.opts = shuffle([g].concat(og)).map(function (x) { return { v: x.k, label: x.label, en: 1 }; });
    }
    return q;
  }
  function qLetterName(l, c) {
    var pool = l.letters.split('').concat(shuffle('abcdefghijklmnopqrstuvwxyz'.split('')));
    return { type: 'name', tag: '字母名', prompt: '聽字母的「名字」，點出這個字母。', say: c.toUpperCase(), word: c,
      opts: optsFrom(c, uniq(pool).filter(function (x) { return x !== c; }).slice(0, 7).concat([c]), 4, function (v) { return v.toUpperCase() + v; }), ans: c };
  }
  function qPicture(l, c) {
    var x = LMAP[c], bad = CONFUSE[c] || '';
    var pool = l.letters.split('').concat('abdefhilmnoprstuvwyz'.split('')).filter(function (y) { return y !== c && bad.indexOf(y) < 0 && y !== 'x'; });
    return { type: 'pic', tag: '看圖選字母', prompt: '看圖：這個東西的英文，開頭是哪個字母？', say: x[1], noAuto: 1, emoji: x[2], word: x[1],
      opts: optsFrom(c, uniq(pool).slice(0, 8), 4, function (v) { return v.toUpperCase() + v; }), ans: c };
  }
  var SAFE = 'bdfgjlmnprtv'.split('');
  function qSpell(l, w) {
    var u = units(w).map(function (x) { return x.t; });
    // 只有本課重點的組合保留成一塊，其餘拆成字母
    var tiles = [];
    u.forEach(function (t) {
      if (t.length > 1 && !((l.kind === 'dig' || l.kind === 'team') && l.pats.indexOf(t) >= 0)) tiles = tiles.concat(t.split(''));
      else tiles.push(t);
    });
    var extra = [];
    var cons = shuffle(SAFE.filter(function (c) { return w.indexOf(c) < 0 && !(c === 'w' && w.indexOf('wh') >= 0); }));
    if (l.kind === 'cvc' || l.kind === 'magic') {
      var v = vowelOf(w);
      extra.push(pick('aeiou'.split('').filter(function (x) { return x !== v && w.indexOf(x) < 0; })));
    } else if (l.kind === 'team') {
      var g = s5group(w);
      var other = shuffle(['ee', 'ai', 'oa', 'oo', 'ar', 'or', 'ir'].filter(function (x) { return !(g && g.re.test(x)); }));
      extra.push(other[0]);
    } else if (l.kind === 'dig') {
      extra.push(pick(['sh', 'ch', 'th', 'ng'].filter(function (x) { return w.indexOf(x) < 0 && l.pats.indexOf(x) < 0; })));
    }
    extra.push(cons[0]);
    if (tiles.length + extra.length < 6) extra.push(cons[1]);
    var all = tiles.concat(extra).map(function (t, i) { return { id: i, t: t }; });
    var sh;
    for (var k = 0; k < 6; k++) { sh = shuffle(all); if (sh.map(function (x) { return x.t; }).join('') !== w) break; }
    return { type: 'spell', tag: '拼字', prompt: '聽一聽，點字母塊拼出這個字。', say: w, word: w, emoji: EMOJI[w] || '', tiles: sh, ans: w };
  }
  var NON_LABEL = { cvc: '後半部（押韻）', dig: '子音組合', blend: '開頭的子音組合', magic: '母音', team: '母音組合' };
  function qNonsense(l, nw) {
    var re = new RegExp(nw[1]);
    var correct = shuffle(l.words.map(function (w) { return w[0]; }).filter(function (w) { return re.test(w); }));
    var pool = segWords(l.seg);
    if (l.seg === 's4') pool = pool.concat(segWords('s2'));
    pool = shuffle(uniq(pool).filter(function (w) { return !re.test(w); }));
    // 盡量挑同課、同段的對比字
    var same = pool.filter(function (w) { return l.words.some(function (x) { return x[0] === w; }); });
    var d = uniq(same.concat(pool)).slice(0, 2);
    var ans = correct[0];
    var lab = l.id === 's2l7' ? '母音' : (l.id === 's4l5' ? '母音（短音或長音）' : NON_LABEL[l.kind]);
    return { type: 'non', tag: '讀讀看', non: nw[0], re: nw[1], noAuto: 1, word: ans, say: ans,
      prompt: '讀讀看！這是「假字」，不是真的英文。它的' + lab + '和哪個字一樣？',
      opts: shuffle([ans].concat(d)).map(function (v) { return { v: v, label: v, en: 1 }; }), ans: ans };
  }
  function buildQuiz(l) {
    var qs = [];
    var ws = shuffle(l.words.map(function (w) { return w[0]; }));
    var k = 0;
    function nextW(filter) {
      for (var t = 0; t < ws.length * 2; t++) { var w = ws[k++ % ws.length]; if (!filter || filter(w)) return w; }
      return ws[0];
    }
    if (l.kind === 'letter') {
      var ls = shuffle(l.letters.split('')), noX = ls.filter(function (c) { return c !== 'x'; });
      var i = 0;
      function nl(nx) { var a = nx ? noX : ls; return a[i++ % a.length]; }
      for (var a = 0; a < 3; a++) qs.push(qListen(l, LMAP[nl()][1]));
      for (a = 0; a < 3; a++) qs.push(qSound(l, LMAP[nl(1)][1]));
      for (a = 0; a < 2; a++) qs.push(qLetterName(l, nl()));
      for (a = 0; a < 2; a++) qs.push(qPicture(l, nl(1)));
    } else {
      var nons = shuffle(l.nons).slice(0, 2);
      var nA = 3 + (2 - nons.length);
      for (var b = 0; b < nA; b++) qs.push(qListen(l, nextW()));
      for (b = 0; b < 2; b++) qs.push(qSound(l, nextW()));
      for (b = 0; b < 3; b++) qs.push(qSpell(l, nextW(function (w) { return w.length <= 6; })));
      nons.forEach(function (n) { qs.push(qNonsense(l, n)); });
    }
    // 避免同一個字連續出現：簡單打散但保留題型穿插
    return shuffle(qs);
  }

  /* ================= 自動檢查（測試頁呼叫） ================= */
  var REAL = ('zap vat yet wet gap lap tan pal pod zip zen bun jab jug nap pug dub pub lag gag gam lam fen den ken fin jig rig zig tin sin nit zit mop hog bog cog jot rot tot pun nun sub hub vape lute pube dame fame mate vane wake dine fine mine vine wipe zone tote dote mope dune teen seen beam team vain main zoom loot moot harm torn work word herb germ pork dork jet van lot mob gap fib nip cub mud web yes sip lip tip rip hip dip ' +
    'shop shot chap chat chin much than then whiz pick back rock ring sang king song bliss clap plot brag crib trap drip spot snip stab swim nest mane cane lane wine bone cone tone mule fuse beet meet meat seat wait pain ray bay boat moat road toad soon moon good hook farm park born corn bird fern turn burn surf').split(' ');
  var BADSUB = ['fuck', 'fuk', 'shit', 'cum', 'tit', 'fap', 'dick', 'cock', 'sex', 'ass', 'poo', 'pee', 'nig', 'fag', 'gay', 'jiz', 'vag', 'pube', 'bong', 'dong', 'crap', 'damn', 'hell', 'kill', 'dumb', 'weed', 'vape', 'dope', 'porn', 'slut', 'whor', 'bum', 'turd', 'gun', 'die', 'dead', 'butt', 'piss', 'wtf', 'suck'];
  function selfCheck(rounds) {
    rounds = rounds || 40;
    var err = [], stats = [];
    var allWords = {};
    LESSONS.forEach(function (l) { l.words.forEach(function (w) { allWords[w[0]] = 1; }); });
    LESSONS.forEach(function (l) {
      var ws = l.words.map(function (w) { return w[0]; });
      var seen = {};
      ws.forEach(function (w) {
        if (seen[w]) err.push(l.id + ' 重複字 ' + w); seen[w] = 1;
        if (l.kind !== 'letter') {
          var ph = phones(w);
          if (ph.length !== units(w).length) err.push(l.id + ' 單音數和字母塊對不上：' + w);
          ph.forEach(function (k) { if (k && PH_KEYS.indexOf(k) < 0) err.push(l.id + ' 沒有這個單音檔：' + w + ' / ' + k); });
          if (!ph.some(function (k) { return k; })) err.push(l.id + ' 整個字都不發音：' + w);
        }
        if (BADSUB.indexOf(w) >= 0) err.push(l.id + ' 不適合字 ' + w);
        var ok = true;
        if (l.kind === 'letter') {
          var c = (l.words.filter(function (x) { return x[0] === w; })[0] || [])[2];
          ok = c === 'x' ? /x/.test(w) : (c === 'q' ? /^qu/.test(w) : w[0] === c);
        } else if (l.kind === 'cvc') {
          ok = /^[^aeiou][aeiou][^aeiouy]$/.test(w) && (!l.pats.length || l.pats.some(function (p) { return w.slice(-2) === p; }));
        } else if (l.kind === 'dig') {
          ok = l.pats.some(function (p) { return w.indexOf(p) >= 0; });
        } else if (l.kind === 'blend') {
          ok = l.pats.some(function (p) { return w.indexOf(p) === 0 || (p === 'st' && /st$/.test(w)); });
        } else if (l.kind === 'magic') {
          if (l.pats.length) ok = isMagic(w) && vowelOf(w) === l.pats[0];
          else {
            ok = isMagic(w) ? ws.indexOf(w.slice(0, -1)) >= 0 : (SHORT_RE.test(w) && ws.indexOf(w + 'e') >= 0);
          }
        } else if (l.kind === 'team') {
          ok = l.pats.some(function (p) { return w.indexOf(p) >= 0; });
          var g = s5group(w); if (!g) ok = false;
          S5GROUPS.forEach(function (gg) { if (gg !== g && gg.re.test(w)) err.push(l.id + ' ' + w + ' 同時屬於兩組母音'); });
        }
        if (!ok) err.push(l.id + ' 例字不符合規則：' + w);
      });
      if (l.kind !== 'letter') {
        (l.nons || []).forEach(function (n) {
          var re = new RegExp(n[1]);
          if (allWords[n[0]] || REAL.indexOf(n[0]) >= 0) err.push(l.id + ' 假字其實是真字：' + n[0]);
          BADSUB.forEach(function (b) { if (n[0].indexOf(b) >= 0) err.push(l.id + ' 假字不適合：' + n[0]); });
          if (!re.test(n[0])) err.push(l.id + ' 假字不符合自己的規則：' + n[0]);
          if (!ws.some(function (w) { return re.test(w); })) err.push(l.id + ' 假字找不到對應例字：' + n[0]);
        });
        if ((l.nons || []).length < 2) err.push(l.id + ' 假字少於 2 個');
      }
      var em = l.words.filter(function (w) { return w[1]; }).length;
      stats.push({ id: l.id, seg: l.seg, title: l.title, words: ws.length, emoji: em, nons: (l.nons || []).length });
      // 出題檢查
      for (var r = 0; r < rounds; r++) {
        var qs = buildQuiz(l);
        if (qs.length < 8 || qs.length > 10) err.push(l.id + ' 題數 ' + qs.length);
        qs.forEach(function (q) {
          if (q.type === 'spell') {
            var tiles = q.tiles.map(function (t) { return t.t; });
            // 用字母塊能拼出答案
            var rest = tiles.slice(), s = q.ans, okSp = true;
            while (s.length && okSp) {
              var hit = -1;
              for (var i = 0; i < rest.length; i++) if (rest[i] && s.indexOf(rest[i]) === 0 && (hit < 0 || rest[i].length > rest[hit].length)) hit = i;
              if (hit < 0) okSp = false; else { s = s.slice(rest[hit].length); rest[hit] = null; }
            }
            if (!okSp) err.push(l.id + ' 拼字拼不出 ' + q.ans + '：' + tiles.join(','));
            if (tiles.indexOf(undefined) >= 0 || tiles.some(function (t) { return !t; })) err.push(l.id + ' 拼字有空字母塊 ' + q.ans);
            if (tiles.length > 9) err.push(l.id + ' 拼字字母塊太多 ' + q.ans);
            if (/[ck]/.test(q.ans) && tiles.filter(function (t) { return /^[ckq]$/.test(t); }).length > q.ans.replace(/[^ckq]/g, '').length) err.push(l.id + ' 拼字 c/k 混淆 ' + q.ans);
            return;
          }
          var vs = q.opts.map(function (o) { return o.v; });
          if (uniq(vs).length !== vs.length) err.push(l.id + ' ' + q.type + ' 選項重複：' + vs.join(','));
          if (vs.indexOf(q.ans) < 0) err.push(l.id + ' ' + q.type + ' 正解不在選項：' + q.ans);
          if (vs.length < 3) err.push(l.id + ' ' + q.type + ' 選項太少：' + vs.join(','));
          vs.some(function (v) { return v === undefined || v === ''; }) && err.push(l.id + ' ' + q.type + ' 空選項');
          // 唯一正解檢查
          var fits = vs.filter(function (v) {
            if (q.type === 'listen' || q.type === 'name') return v === q.ans;
            if (q.type === 'pic') return v === q.ans || (CONFUSE[q.ans] || '').indexOf(v) >= 0;
            if (q.type === 'non') return new RegExp(q.re).test(v);
            if (q.type === 'sound') {
              if (l.kind === 'letter') return v === q.word[0] || (CONFUSE[q.word[0]] || '').indexOf(v) >= 0;
              if (l.kind === 'cvc') return v === vowelOf(q.word);
              if (l.kind === 'dig' || l.kind === 'blend') return q.word.indexOf(v) >= 0 && (l.kind === 'dig' || q.word.indexOf(v) === 0 || v === 'st');
              if (l.kind === 'magic') return v === (isMagic(q.word) ? vowelOf(q.word) + '_e' : vowelOf(q.word));
              return S5GROUPS.filter(function (g) { return g.k === v; })[0].re.test(q.word);
            }
            return false;
          });
          if (fits.length !== 1) err.push(l.id + ' ' + q.type + ' 可能有 ' + fits.length + ' 個正解：' + q.word + ' / ' + vs.join(','));
        });
      }
    });
    return { errors: uniq(err), stats: stats, lessons: LESSONS.length, uniqueWords: Object.keys(allWords).length };
  }

  /* ================= 樣式 ================= */
  var CSS = '' +
    '.cfx-ph{--ph-hot:#F25C4B;--ph-sea:#1A86A8;--ph-sun:#FFB703;--ph-good:#2E9E5B;--ph-bad:#D9483B;max-width:960px;margin:0 auto;color:var(--ink);-webkit-tap-highlight-color:transparent;overflow-wrap:break-word}' +
    '.cfx-ph *{box-sizing:border-box}' +
    '.cfx-ph .en{font-family:"Segoe UI","Arial Rounded MT Bold",Arial,sans-serif;letter-spacing:.5px}' +
    '.cfx-ph .ph-card{background:var(--paper,#fff);border:2px solid var(--line);border-radius:var(--r-l,22px);padding:14px;box-shadow:var(--shadow,0 4px 14px rgba(0,0,0,.08));margin-bottom:14px}' +
    '.cfx-ph .ph-sub{color:var(--muted);font-size:14px;font-weight:700;margin:0 0 8px}' +
    '.cfx-ph .btn{min-height:46px;touch-action:manipulation}' +
    '.cfx-ph .ph-sum{display:flex;gap:12px;align-items:center;flex-wrap:wrap}' +
    '.cfx-ph .ph-sum .t{flex:1;min-width:180px;font-weight:900;font-size:17px}' +
    '.cfx-ph .ph-sum .t small{display:block;color:var(--muted);font-size:13px;font-weight:700}' +
    '.cfx-ph .ph-bar{height:12px;border-radius:999px;background:var(--line);overflow:hidden;margin-top:6px}' +
    '.cfx-ph .ph-bar i{display:block;height:100%;background:linear-gradient(90deg,#7ED6A5,var(--ph-good));border-radius:999px}' +
    '.cfx-ph .ph-seg h4{margin:0;font-size:18px;font-weight:900;display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
    '.cfx-ph .ph-seg h4 .n{margin-left:auto;font-size:13px;color:var(--muted);font-weight:800}' +
    '.cfx-ph .ph-seg p{margin:2px 0 10px;color:var(--muted);font-size:13.5px;font-weight:700}' +
    '.cfx-ph .ph-lessons{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:10px}' +
    '@media (max-width:380px){.cfx-ph .ph-lessons{grid-template-columns:1fr 1fr;gap:8px}}' +
    '.cfx-ph .ph-ls{position:relative;min-height:84px;border-radius:16px;border:2px solid var(--line);background:var(--paper2,#f6fbf9);font:inherit;color:var(--ink);cursor:pointer;padding:10px 8px 8px;text-align:center;box-shadow:0 3px 0 var(--line);touch-action:manipulation;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}' +
    '.cfx-ph .ph-ls b{font-size:19px;font-weight:900;line-height:1.2}' +
    '.cfx-ph .ph-ls small{font-size:12px;font-weight:700;color:var(--muted)}' +
    '.cfx-ph .ph-ls.done{border-color:var(--ph-good);background:color-mix(in srgb,var(--ph-good) 10%,var(--paper,#fff))}' +
    '.cfx-ph .ph-ls.next{border-color:var(--ph-hot);box-shadow:0 3px 0 var(--ph-hot)}' +
    '.cfx-ph .ph-ls .tag{position:absolute;top:-9px;right:6px;font-size:11px;font-weight:900;padding:1px 8px;border-radius:999px;background:var(--ph-hot);color:#fff}' +
    '.cfx-ph .ph-ls.done .tag{background:var(--ph-good)}' +
    '.cfx-ph .ph-ls .st{color:var(--ph-sun);font-size:13px;letter-spacing:1px}' +
    /* 課程頁 */
    '.cfx-ph .ph-head{display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap}' +
    '.cfx-ph .ph-head .nm{flex:1;min-width:150px;font-weight:900;font-size:17px}' +
    '.cfx-ph .ph-head .nm small{display:block;color:var(--muted);font-size:12.5px;font-weight:700}' +
    '.cfx-ph .ph-tabs{display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:6px;margin-bottom:12px}' +
    '.cfx-ph .ph-tabs button{min-height:48px;border-radius:14px;border:2px solid var(--line);background:var(--paper,#fff);font:inherit;font-weight:900;font-size:15.5px;color:var(--ink);cursor:pointer;touch-action:manipulation;padding:4px}' +
    '.cfx-ph .ph-tabs button[aria-selected="true"]{background:var(--ink);color:var(--bg,#fff);border-color:var(--ink)}' +
    '.cfx-ph .ph-hw{background:#FFF3C4;border:2px solid var(--ph-sun);border-radius:14px;padding:8px 12px;font-weight:800;margin-bottom:10px}' +
    '.cfx-ph .ph-hl{color:var(--ph-hot);font-weight:900}' +
    '.cfx-ph .ph-hl.sil{color:#B49BD8;text-decoration:line-through dotted}' +
    '.cfx-ph .ph-big{text-align:center}' +
    '.cfx-ph .ph-big .pat{font-size:clamp(40px,13vw,72px);font-weight:900;color:var(--ph-hot);line-height:1.1;word-spacing:6px}' +
    '.cfx-ph .ph-big .hint{font-size:16px;font-weight:700;margin:8px 0 10px}' +
    '.cfx-ph .ph-words{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}' +
    '@media (max-width:380px){.cfx-ph .ph-words{grid-template-columns:1fr 1fr}}' +
    '.cfx-ph .ph-w{min-height:58px;border-radius:14px;border:2px solid var(--line);background:var(--paper,#fff);font:inherit;color:var(--ink);cursor:pointer;display:flex;align-items:center;gap:8px;padding:6px 10px;font-size:21px;font-weight:800;touch-action:manipulation;text-align:left}' +
    '.cfx-ph .ph-w .em{font-size:26px;width:32px;text-align:center;flex:none}' +
    '.cfx-ph .ph-w .sp{margin-left:auto;font-size:14px;opacity:.6}' +
    '.cfx-ph .ph-letters{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}' +
    '.cfx-ph .ph-lt{border:2px solid var(--line);border-radius:18px;padding:10px;background:var(--paper2,#f6fbf9);text-align:center}' +
    '.cfx-ph .ph-lt .L{font-size:46px;font-weight:900;line-height:1.1}' +
    '.cfx-ph .ph-lt .wd{font-size:20px;font-weight:800;margin:2px 0}' +
    '.cfx-ph .ph-lt .tip{font-size:13px;color:var(--muted);font-weight:700;min-height:38px}' +
    '.cfx-ph .ph-lt .bt{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:6px}' +
    '.cfx-ph .ph-lt .bt .btn{padding:6px 2px;font-size:13.5px;min-height:46px}' +
    '.cfx-ph .ph-lt .bt .btn.hot{border-color:var(--ph-hot);color:var(--ph-hot);font-weight:900}' +
    '.cfx-ph .ph-chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;margin:0 0 12px}' +
    '.cfx-ph .ph-chips>span{font-size:14px;font-weight:800;color:var(--muted)}' +
    '.cfx-ph .ph-chip{min-height:44px;padding:4px 12px;border-radius:999px;border:2px solid var(--ph-hot);background:var(--paper,#fff);color:var(--ph-hot);font:inherit;font-weight:900;font-size:17px;cursor:pointer;touch-action:manipulation}' +
    '.cfx-ph .ph-note{font-size:13px;color:var(--muted);font-weight:700;margin:10px 0 0;line-height:1.5}' +
    /* 拼讀動畫 */
    '.cfx-ph .ph-pick{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}' +
    '.cfx-ph .ph-pick button{min-height:44px;min-width:44px;padding:4px 12px;border-radius:999px;border:2px solid var(--line);background:var(--paper,#fff);font:inherit;font-weight:800;font-size:17px;color:var(--ink);cursor:pointer;touch-action:manipulation}' +
    '.cfx-ph .ph-pick button[aria-pressed="true"]{border-color:var(--ph-sea);background:color-mix(in srgb,var(--ph-sea) 14%,var(--paper,#fff))}' +
    '.cfx-ph .ph-stage{min-height:210px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;border:3px dashed var(--line);border-radius:22px;padding:14px 6px;background:var(--paper2,#f6fbf9)}' +
    '.cfx-ph .ph-tiles{display:flex;gap:8px;justify-content:center;flex-wrap:nowrap;transition:gap .5s ease;max-width:100%}' +
    '.cfx-ph .ph-tiles.close{gap:3px}' +
    '.cfx-ph .ph-tiles.merge{gap:0}' +
    '.cfx-ph .ph-cap{min-height:26px;font-weight:900;font-size:17px;color:var(--ph-sea);text-align:center}' +
    '.cfx-ph .ph-tile[data-k]{cursor:pointer}' +
    '.cfx-ph .ph-tile{position:relative;min-width:44px;height:70px;padding:0 8px;border-radius:14px;border:3px solid var(--line);background:var(--paper,#fff);display:flex;align-items:center;justify-content:center;font-size:clamp(28px,9vw,46px);font-weight:900;color:var(--muted);transition:transform .25s,background .25s,color .25s,border-color .25s,border-radius .5s}' +
    '.cfx-ph .ph-tiles.merge .ph-tile{border-radius:0;border-left-width:0;border-right-width:0}' +
    '.cfx-ph .ph-tile.on{color:#fff;transform:translateY(-6px)}' +
    '.cfx-ph .ph-tile.on.cons{background:var(--ink);border-color:var(--ink)}' +
    '.cfx-ph .ph-tile.on.vowel{background:var(--ph-hot);border-color:var(--ph-hot)}' +
    '.cfx-ph .ph-tile.on.chunk{background:var(--ph-sea);border-color:var(--ph-sea)}' +
    '.cfx-ph .ph-tile.on.magic{background:#8E6BC8;border-color:#8E6BC8}' +
    '.cfx-ph .ph-tile.lit{color:var(--ink);border-color:var(--ph-sun);background:#FFF6DA;transform:none}' +
    '.cfx-ph .ph-tile .lb{position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);font-size:11px;font-weight:800;color:var(--muted);white-space:nowrap}' +
    '.cfx-ph .ph-word{font-size:clamp(34px,10vw,54px);font-weight:900;min-height:64px;display:flex;align-items:center;gap:10px}' +
    '.cfx-ph.rm .ph-tile,.cfx-ph.rm .ph-tiles{transition:none!important}' +
    '.cfx-ph.rm .ph-tile.on{transform:none}' +
    '.cfx-ph .ph-row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:12px}' +
    '.cfx-ph .ph-row .btn{flex:1;min-width:130px}' +
    /* 練習 */
    '.cfx-ph .ph-prog{display:flex;align-items:center;gap:8px;margin-bottom:10px;font-weight:900}' +
    '.cfx-ph .ph-dots{display:flex;gap:4px;flex:1;flex-wrap:wrap}' +
    '.cfx-ph .ph-dots i{width:14px;height:14px;border-radius:50%;background:var(--line)}' +
    '.cfx-ph .ph-dots i.ok{background:var(--ph-good)}.cfx-ph .ph-dots i.bad{background:var(--ph-bad)}.cfx-ph .ph-dots i.cur{outline:3px solid var(--ph-sea);outline-offset:1px}' +
    '.cfx-ph .ph-q{text-align:center}' +
    '.cfx-ph .ph-q .tg{display:inline-block;font-size:12.5px;font-weight:900;padding:2px 10px;border-radius:999px;background:color-mix(in srgb,var(--ph-sea) 15%,var(--paper,#fff));color:var(--ph-sea)}' +
    '.cfx-ph .ph-q .pr{font-size:18px;font-weight:900;margin:6px 0 10px}' +
    '.cfx-ph .ph-q .vis{display:flex;align-items:center;justify-content:center;gap:12px;min-height:84px;margin-bottom:10px;flex-wrap:wrap}' +
    '.cfx-ph .ph-q .emo{font-size:64px;line-height:1}' +
    '.cfx-ph .ph-say{width:76px;height:76px;border-radius:50%;border:3px solid var(--ph-sea);background:var(--paper,#fff);font-size:34px;cursor:pointer;touch-action:manipulation;box-shadow:0 4px 0 var(--ph-sea)}' +
    '.cfx-ph .ph-say:active{transform:translateY(3px);box-shadow:0 1px 0 var(--ph-sea)}' +
    '.cfx-ph .ph-non{font-size:clamp(40px,12vw,60px);font-weight:900;color:var(--ph-sea);padding:4px 18px;border:3px solid var(--ph-sea);border-radius:18px;background:var(--paper,#fff)}' +
    '.cfx-ph .ph-opts{display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:560px;margin:0 auto}' +
    '.cfx-ph .ph-opt{min-height:64px;border-radius:16px;border:2px solid var(--line);background:var(--paper,#fff);font:inherit;font-weight:900;font-size:24px;color:var(--ink);cursor:pointer;box-shadow:0 4px 0 var(--line);touch-action:manipulation;padding:6px}' +
    '.cfx-ph .ph-opt.sm{font-size:17px}' +
    '.cfx-ph .ph-opt.ok{background:var(--ph-good);border-color:var(--ph-good);color:#fff;box-shadow:0 4px 0 #1E6E3F}' +
    '.cfx-ph .ph-opt.bad{background:var(--ph-bad);border-color:var(--ph-bad);color:#fff;box-shadow:0 4px 0 #9E2F25}' +
    '.cfx-ph .ph-opt:disabled{cursor:default}' +
    '.cfx-ph .ph-slots{display:flex;justify-content:center;gap:6px;min-height:66px;flex-wrap:wrap;margin-bottom:12px}' +
    '.cfx-ph .ph-slot{min-width:48px;height:60px;padding:0 6px;border-bottom:4px solid var(--ph-sea);display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:900}' +
    '.cfx-ph .ph-bank{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:520px;margin:0 auto}' +
    '.cfx-ph .ph-tl{min-width:56px;min-height:56px;padding:0 10px;border-radius:14px;border:2px solid var(--line);background:#FFF6DA;font:inherit;font-weight:900;font-size:26px;color:var(--ink);cursor:pointer;box-shadow:0 4px 0 #E8D59B;touch-action:manipulation}' +
    '.cfx-ph .ph-tl.used{visibility:hidden}' +
    '.cfx-ph .ph-fb{min-height:30px;font-weight:900;font-size:17px;margin:12px 0 0;text-align:center}' +
    '.cfx-ph .ph-fb.ok{color:var(--ph-good)}.cfx-ph .ph-fb.bad{color:var(--ph-bad)}' +
    '.cfx-ph .ph-fb .en{font-size:20px}' +
    '.cfx-ph.anim .ph-opt.ok{animation:phPop .3s ease}' +
    '.cfx-ph.anim .ph-opt.bad{animation:phShake .3s ease}' +
    '@keyframes phPop{50%{transform:scale(1.07)}}@keyframes phShake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}' +
    '.cfx-ph .ph-res{text-align:center}' +
    '.cfx-ph .ph-res .big{font-size:52px;font-weight:900;line-height:1.1}' +
    '.cfx-ph .ph-res .stars{font-size:38px;letter-spacing:4px;color:var(--ph-sun)}' +
    '.cfx-ph .ph-res .stars .off{color:var(--line)}' +
    '.cfx-ph .ph-res .msg{font-weight:800;margin:6px 0}' +
    '.cfx-ph .ph-miss{text-align:left;max-width:520px;margin:10px auto 0;padding-left:20px}' +
    '.cfx-ph .ph-miss li{margin:3px 0;font-weight:700}' +
    '@media (min-width:900px){.cfx-ph .ph-lwrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:14px;align-items:start}}';

  /* ================= 介面 ================= */
  function render(el, api) {
    api = api || {};
    var rm = !!api.reducedMotion;
    var store = function (k) { try { return api.store ? api.store(k) : null; } catch (e) { return null; } };
    var storeSet = function (k, v) { try { if (api.storeSet) api.storeSet(k, v); } catch (e) {} };
    var say = function (t) { try { if (api.speak) api.speak(t, 'en'); } catch (e) {} };
    var beep = function (ok) { try { if (api.beep) api.beep(ok); } catch (e) {} };
    var Z = function (t) { try { return api.Z ? api.Z(t) : esc(t); } catch (e) { return esc(t); } };

    var style = document.createElement('style');
    style.textContent = CSS;
    var root = document.createElement('div');
    root.className = 'cfx-ph' + (rm ? ' rm' : ' anim');
    el.appendChild(style);
    el.appendChild(root);

    var timers = [], runId = 0;
    function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
    function stopAll() {
      runId++;
      timers.forEach(clearTimeout); timers = [];
      stopClip();
      try { if (api.stopSpeak) api.stopSpeak(); } catch (e) {}
    }

    /* 音檔：單音 p_<key>、單字 w_<字>；播完 resolve true，被打斷 'stop'，播不出來 'err' */
    var CLIPS = {}, playing = null;
    function clip(name) {
      if (!CLIPS[name]) { var a = new Audio(AUDIO_BASE + name + '.mp3'); a.preload = 'auto'; CLIPS[name] = a; }
      return CLIPS[name];
    }
    function stopClip() { if (playing) playing.end('stop'); }
    function playClip(name) {
      return new Promise(function (ok) {
        if (!root.isConnected) return ok('stop');
        stopClip();
        var a = clip(name), done = false, t;
        function end(r) {
          if (done) return; done = true; clearTimeout(t); a.onended = a.onerror = null;
          if (playing && playing.a === a) playing = null;
          if (r === 'stop') { try { a.pause(); } catch (e) {} }
          ok(r);
        }
        playing = { a: a, end: end };
        a.onended = function () { end(true); };
        a.onerror = function () { end('err'); };
        t = setTimeout(function () { end(true); }, 4000);
        try { a.currentTime = 0; var p = a.play(); if (p && p.catch) p.catch(function () { end('err'); }); } catch (e) { end('err'); }
      });
    }
    function playSeq(keys, gap) { // 依序念幾個單音
      var tok = runId;
      return keys.reduce(function (pr, k, i) {
        return pr.then(function () {
          if (tok !== runId) return 'stop';
          return playClip('p_' + k).then(function (r) { return i < keys.length - 1 && r !== 'stop' ? new Promise(function (ok) { later(ok, gap); }) : r; });
        });
      }, Promise.resolve());
    }
    // 課程裡的真字用錄好的音檔（同一個老師的聲音），其他（字母名、假字）用瀏覽器語音
    var sayTTS = say;
    say = function (t) {
      var w = String(t || '').replace(/-/g, '');
      try { if (api.stopSpeak) api.stopSpeak(); } catch (e) {}
      if (!WORDSET[w]) { stopClip(); sayTTS(t); return; }
      playClip('w_' + w).then(function (r) { if (r === 'err') sayTTS(t); });
    };
    function prog() { var p = store('prog'); return (p && typeof p === 'object') ? p : {}; }
    function nextLesson() {
      var p = prog();
      for (var i = 0; i < LESSONS.length; i++) if (!(p[LESSONS[i].id] && p[LESSONS[i].id].done)) return LESSONS[i];
      return null;
    }
    function starStr(n) { var s = ''; for (var i = 0; i < 3; i++) s += i < n ? '★' : '<span class="off">★</span>'; return s; }
    function starsOf(score, total) { var r = score / total; return r >= 0.9 ? 3 : r >= 0.7 ? 2 : r >= 0.5 ? 1 : 0; }
    function segOf(l) { return SEGS.filter(function (s) { return s.id === l.seg; })[0]; }

    /* ---------- 首頁：課程地圖 ---------- */
    function home() {
      stopAll();
      var p = prog(), nx = nextLesson();
      var done = LESSONS.filter(function (l) { return p[l.id] && p[l.id].done; }).length;
      var h = '<div class="ph-card"><div class="ph-sum"><div class="t">' + Z('已完成 ' + done + ' / ' + LESSONS.length + ' 課') +
        '<small>' + Z('每課每天第一次練習可以拿星星（最多 3 顆）。每一課都可以自由點，建議照順序學。') + '</small>' +
        '<div class="ph-bar"><i style="width:' + Math.round(done / LESSONS.length * 100) + '%"></i></div></div>';
      if (nx) h += '<button class="btn primary" data-open="' + nx.id + '">▶ ' + Z(done ? '繼續：' : '從第一課開始：') + '<span class="en">' + esc(nx.title) + '</span></button>';
      else h += '<b>🏆 ' + Z('全部完成，太厲害了！') + '</b>';
      h += '</div></div>';
      SEGS.forEach(function (s, si) {
        var ls = LESSONS.filter(function (l) { return l.seg === s.id; });
        var dn = ls.filter(function (l) { return p[l.id] && p[l.id].done; }).length;
        h += '<div class="ph-card ph-seg"><h4><span>' + s.icon + '</span>' + Z('第' + '一二三四五'[si] + '段　' + s.name) + '<span class="n">' + dn + ' / ' + ls.length + '</span></h4>';
        h += '<p>' + Z(s.desc) + '</p><div class="ph-lessons">';
        ls.forEach(function (l, i) {
          var pr = p[l.id], cls = pr && pr.done ? ' done' : (nx === l ? ' next' : '');
          var tag = pr && pr.done ? '完成' : (nx === l ? '建議' : '');
          h += '<button class="ph-ls' + cls + '" data-open="' + l.id + '">' + (tag ? '<span class="tag">' + tag + '</span>' : '') +
            '<small>' + Z('第 ' + (i + 1) + ' 課') + '・#' + l.no + '</small><b class="en">' + esc(l.title).replace(/-/g, '‑') + '</b>' +
            (pr ? '<span class="st">' + starStr(starsOf(pr.best, pr.total || 10)) + '</span><small>' + Z('最佳 ' + pr.best + ' / ' + (pr.total || 10)) + '</small>' : '<small>' + l.words.length + ' ' + Z('個字') + '</small>') +
            '</button>';
        });
        h += '</div></div>';
      });
      root.innerHTML = h;
      root.querySelectorAll('[data-open]').forEach(function (b) { b.onclick = function () { openLesson(b.dataset.open); }; });
    }

    /* ---------- 課程頁 ---------- */
    var cur = null, tab = 'learn';
    function openLesson(id, t) {
      stopAll();
      cur = LBYID[id] || LESSONS[0];
      storeSet('last', cur.id);
      tab = t || 'learn';
      if (cur.kind === 'letter' && tab === 'blend') tab = 'learn';
      drawLesson();
    }
    function drawLesson() {
      stopAll();
      var l = cur, s = segOf(l), i = LESSONS.filter(function (x) { return x.seg === l.seg; }).indexOf(l);
      var tabs = l.kind === 'letter' ? [['learn', '① 認識'], ['practice', '② 練習']] : [['learn', '① 認識'], ['blend', '② 拼讀'], ['practice', '③ 練習']];
      var h = '<div class="ph-head"><button class="btn" data-home aria-label="回課程列表">← ' + Z('課程') + '</button>' +
        '<div class="nm"><small>' + s.icon + ' ' + Z(s.name + '・第 ' + (i + 1) + ' 課') + '</small><span class="en">' + esc(l.title) + '</span></div></div>';
      if (hwLesson === l) h += '<div class="ph-hw">📒 ' + Z('作業：看完示範後，到「練習」做完 10 題就完成囉！') + '</div>';
      h += '<div class="ph-tabs" role="tablist" style="--n:' + tabs.length + '">';
      tabs.forEach(function (t) { h += '<button role="tab" data-tab="' + t[0] + '" aria-selected="' + (tab === t[0]) + '">' + Z(t[1]) + '</button>'; });
      h += '</div><div data-body></div>';
      root.innerHTML = h;
      root.querySelector('[data-home]').onclick = home;
      root.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { tab = b.dataset.tab; drawLesson(); }; });
      var body = root.querySelector('[data-body]');
      if (tab === 'learn') learn(body); else if (tab === 'blend') blend(body); else practice(body);
    }

    // 這課重點音的小按鈕：短 a、sh、bl（b＋l）…
    function chipsHtml(l) {
      var c = [];
      if (l.kind === 'cvc') uniq((l.pats.length ? l.pats.map(function (p) { return p[0]; }) : 'aeiou'.split(''))).forEach(function (v) { c.push(['短 ' + v, [PH_ONE[v]]]); });
      else if (l.kind === 'dig' || l.kind === 'team') l.pats.forEach(function (p) { c.push([p, [PH_CHUNK[p]]]); });
      else if (l.kind === 'blend') l.pats.forEach(function (p) { c.push([p, [letterPhone(p[0]), letterPhone(p[1])]]); });
      else if (l.kind === 'magic') l.pats.forEach(function (p) { c.push([p + '_e', [p === 'u' ? 'yoo' : PH_LONG[p]]]); });
      if (!c.length) return '';
      return '<div class="ph-chips"><span>' + Z('聽聽這課的音：') + '</span>' + c.map(function (x) {
        return '<button class="ph-chip" data-ph="' + x[1].join(',') + '">🔊 <span class="en">' + esc(x[0]) + '</span></button>';
      }).join('') + '</div>';
    }

    function learn(body) {
      var l = cur, h = '';
      if (l.kind === 'letter') {
        h += '<div class="ph-card"><p class="ph-sub">' + Z('每個字母有兩種念法：「字母名」是唱 ABC 時的念法；「字母音」是拼字時發出的音。') + '</p>';
        h += '<div class="ph-letters">';
        l.letters.split('').forEach(function (c) {
          var x = LMAP[c];
          h += '<div class="ph-lt"><div class="L en">' + c.toUpperCase() + c + '</div>' +
            '<div class="wd"><span aria-hidden="true">' + x[2] + '</span> <span class="en">' + hl(x[1], l) + '</span></div>' +
            '<div class="tip">' + Z((c === 'x' ? '字母音＝' + x[1] + ' 的最後一個音。' : '字母音＝' + x[1] + ' 的第一個音。') + x[3]) + '</div>' +
            '<div class="bt"><button class="btn" data-name="' + c + '">🔊 ' + Z('字母名') + '</button>' +
            '<button class="btn hot" data-ph="' + letterPhone(c) + '">🔊 ' + Z('字母音') + '</button>' +
            '<button class="btn" data-say="' + x[1] + '">🔊 ' + Z('聽例字') + '</button></div></div>';
        });
        h += '</div><p class="ph-note">' + Z('先聽「字母音」，再聽例字，注意紅色字母那一個音。p、t、k、h 這幾個音本來就很短、只有一點氣，要仔細聽喔！') + '</p></div>';
        h += '<div class="ph-row"><button class="btn primary" data-go="practice">' + Z('我學會了，去練習 →') + '</button></div>';
      } else {
        h += '<div class="ph-lwrap"><div class="ph-card ph-big"><div class="pat en">' + esc(l.big) + '</div>' +
          '<div class="hint">' + Z(l.hint) + '</div>' + chipsHtml(l) +
          '<button class="btn primary" data-say="' + l.words[0][0] + '">🔊 ' + Z('聽例字') + ' <span class="en">' + esc(l.words[0][0]) + '</span></button>' +
          '<p class="ph-note">' + Z('點下面的字聽聽看。紅色是這課的重點' + (l.kind === 'magic' ? '，劃線的 e 不發音' : '') + '。') + '</p></div>';
        h += '<div class="ph-card"><div class="ph-words">';
        l.words.forEach(function (w) {
          h += '<button class="ph-w" data-say="' + w[0] + '"><span class="em" aria-hidden="true">' + (w[1] || '🔤') + '</span><span class="en">' + hl(w[0], l) + '</span><span class="sp" aria-hidden="true">🔊</span></button>';
        });
        h += '</div></div></div>';
        h += '<div class="ph-row"><button class="btn primary" data-go="blend">' + Z('下一步：看拼讀示範 →') + '</button></div>';
      }
      body.innerHTML = h;
      body.querySelectorAll('[data-say]').forEach(function (b) { b.onclick = function () { say(b.dataset.say); }; });
      body.querySelectorAll('[data-name]').forEach(function (b) { b.onclick = function () { stopClip(); say(b.dataset.name.toUpperCase()); }; });
      body.querySelectorAll('[data-ph]').forEach(function (b) { b.onclick = function () { stopAll(); playSeq(b.dataset.ph.split(','), 120); }; });
      body.querySelectorAll('[data-go]').forEach(function (b) { b.onclick = function () { tab = b.dataset.go; drawLesson(); }; });
    }

    function blend(body) {
      var l = cur, sel = l.words[0][0];
      var h = '<div class="ph-card"><p class="ph-sub">' + Z('選一個字，按「示範拼讀」：先一個音、一個音念，再念快一點把音連起來，最後合成一個字。') + '</p>';
      h += '<div class="ph-pick" role="group" aria-label="選字">';
      l.words.forEach(function (w) { h += '<button class="en" data-w="' + w[0] + '">' + esc(w[0]) + '</button>'; });
      h += '</div><div class="ph-stage"><div class="ph-cap" data-cap aria-live="polite"></div><div class="ph-tiles" data-tiles></div><div class="ph-word en" data-word aria-live="polite"></div></div>';
      h += '<div class="ph-row"><button class="btn primary" data-play>▶ ' + Z('示範拼讀') + '</button><button class="btn" data-again>🔊 ' + Z('聽整個字') + '</button><button class="btn" data-nextw>' + Z('下一個字') + ' →</button></div>';
      h += '<p class="ph-note">' + Z('點任何一個字母塊，可以單獨聽那個音。顏色：紅＝母音、藍＝字母組合（念一個音）、紫＝Magic e（前面母音念長音，e 不發音）、黑＝子音。看完示範換你念：手指著字母，一個音一個音念，再越念越快！') + '</p></div>';
      h += '<div class="ph-row"><button class="btn primary" data-go="practice">' + Z('去練習 →') + '</button></div>';
      body.innerHTML = h;
      var tilesEl = body.querySelector('[data-tiles]'), wordEl = body.querySelector('[data-word]'), capEl = body.querySelector('[data-cap]');
      function cap(t) { capEl.innerHTML = t ? Z(t) : '&nbsp;'; }
      function setup() {
        stopAll();
        body.querySelectorAll('[data-w]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.w === sel); });
        tilesEl.classList.remove('merge', 'close');
        var ph = phones(sel);
        tilesEl.innerHTML = units(sel).map(function (u, i) {
          return '<span class="ph-tile en ' + u.kind + '"' + (ph[i] ? ' data-k="' + ph[i] + '" role="button" tabindex="0" aria-label="聽 ' + esc(u.t) + ' 的音"' : '') + '>' +
            esc(u.t) + (ph[i] ? '' : '<span class="lb">' + Z('不發音') + '</span>') + '</span>';
        }).join('');
        wordEl.innerHTML = '&nbsp;';
        cap('');
        ph.forEach(function (k) { if (k) clip('p_' + k); });
        clip('w_' + sel);
      }
      function play() {
        setup();
        var tok = runId, ts = [].slice.call(tilesEl.querySelectorAll('.ph-tile')), ph = phones(sel);
        function alive() { return tok === runId && root.isConnected; }
        function light(i) {
          ts.forEach(function (t, j) { t.classList.toggle('on', j === i); t.classList.toggle('lit', j < i); });
        }
        // 一塊一塊念；gap＝音和音之間停多久
        function walk(gap, silentWait, done) {
          var i = 0;
          (function go() {
            if (!alive()) return;
            if (i >= ts.length) { done(); return; }
            light(i);
            var k = ph[i]; i++;
            if (!k) { later(go, silentWait); return; }
            playClip('p_' + k).then(function (r) { if (alive() && r !== 'stop') later(go, r === 'err' ? gap + 300 : gap); });
          })();
        }
        cap('① 一個音、一個音念');
        walk(550, 700, function () {
          later(function () {
            cap('② 念快一點，把音連起來');
            tilesEl.classList.add('close');
            walk(40, 120, function () {
              later(function () {
                cap('③ 合起來就是：');
                ts.forEach(function (t) { t.classList.remove('lit'); t.classList.add('on'); });
                tilesEl.classList.add('merge');
                wordEl.innerHTML = (EMOJI[sel] ? '<span aria-hidden="true">' + EMOJI[sel] + '</span>' : '') + esc(sel);
                say(sel);
                later(function () { if (alive()) cap('換你念念看！👆'); }, 1600);
              }, 350);
            });
          }, 600);
        });
      }
      function tapTile(t) {
        if (!t || !t.dataset.k) return;
        stopAll();
        ts0().forEach(function (x) { x.classList.toggle('on', x === t); x.classList.remove('lit'); });
        playClip('p_' + t.dataset.k);
      }
      function ts0() { return [].slice.call(tilesEl.querySelectorAll('.ph-tile')); }
      tilesEl.onclick = function (e) { tapTile(e.target.closest('.ph-tile')); };
      tilesEl.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapTile(e.target.closest('.ph-tile')); } };
      body.querySelectorAll('[data-w]').forEach(function (b) { b.onclick = function () { sel = b.dataset.w; play(); }; });
      body.querySelector('[data-play]').onclick = play;
      body.querySelector('[data-again]').onclick = function () { stopAll(); say(sel); };
      body.querySelector('[data-nextw]').onclick = function () {
        var ws = l.words.map(function (w) { return w[0]; });
        sel = ws[(ws.indexOf(sel) + 1) % ws.length]; play();
      };
      body.querySelectorAll('[data-go]').forEach(function (b) { b.onclick = function () { tab = b.dataset.go; drawLesson(); }; });
      setup();
    }

    /* ---------- 練習 ---------- */
    function practice(body) {
      var l = cur, qs = buildQuiz(l), qi = 0, res = [], locked = false;
      function drawQ() {
        stopAll(); locked = false;
        var q = qs[qi];
        var h = '<div class="ph-card"><div class="ph-prog"><span>' + (qi + 1) + ' / ' + qs.length + '</span><div class="ph-dots">';
        qs.forEach(function (x, i) { h += '<i class="' + (i < res.length ? (res[i] ? 'ok' : 'bad') : (i === qi ? 'cur' : '')) + '"></i>'; });
        h += '</div></div><div class="ph-q"><span class="tg">' + Z(q.tag) + '</span><div class="pr">' + Z(q.prompt) + '</div><div class="vis">';
        if (q.type === 'non') h += '<span class="ph-non en">' + esc(q.non) + '</span>';
        else {
          if (q.type === 'pic' || (q.type === 'spell' && q.emoji)) h += '<span class="emo" aria-hidden="true">' + (q.emoji || '') + '</span>';
          h += '<button class="ph-say" data-replay aria-label="再聽一次">🔊</button>';
        }
        h += '</div>';
        if (q.type === 'spell') {
          h += '<div class="ph-slots en" data-slots></div><div class="ph-bank en" data-bank>';
          q.tiles.forEach(function (t) { h += '<button class="ph-tl" data-t="' + t.id + '">' + esc(t.t) + '</button>'; });
          h += '</div><div class="ph-row"><button class="btn" data-undo>⌫ ' + Z('退一格') + '</button><button class="btn" data-clear>' + Z('清除') + '</button></div>';
        } else {
          h += '<div class="ph-opts">';
          q.opts.forEach(function (o) {
            h += '<button class="ph-opt ' + (o.label.length > 6 ? 'sm ' : '') + 'en" data-v="' + esc(o.v) + '">' + esc(o.label) + '</button>';
          });
          h += '</div>';
        }
        h += '<div class="ph-fb" data-fb aria-live="polite"></div><div class="ph-row" data-nextrow hidden><button class="btn primary" data-next>' + Z(qi + 1 < qs.length ? '下一題 →' : '看結果 →') + '</button></div></div></div>';
        body.innerHTML = h;
        var rp = body.querySelector('[data-replay]');
        if (rp) rp.onclick = function () { say(q.type === 'name' ? q.say : q.say); };
        if (!q.noAuto) later(function () { say(q.say); }, 250);
        if (q.type === 'spell') spellUI(q); else body.querySelectorAll('[data-v]').forEach(function (b) { b.onclick = function () { answer(b.dataset.v, b); }; });
        body.querySelector('[data-next]').onclick = function () { qi++; if (qi < qs.length) drawQ(); else result(); };
      }
      function feedback(ok, q, extra) {
        locked = true; res.push(ok); beep(ok);
        var fb = body.querySelector('[data-fb]');
        fb.className = 'ph-fb ' + (ok ? 'ok' : 'bad');
        var h = ok ? '✔ ' + Z('答對了！') : '✘ ' + Z('正確答案：');
        if (!ok || q.type === 'non' || q.type === 'pic') h += ' ' + (extra || '');
        fb.innerHTML = h;
        body.querySelector('[data-nextrow]').hidden = false;
        if (q.type !== 'non') later(function () { say(q.type === 'name' ? q.say : q.word); }, 400);
      }
      function answer(v, btn) {
        if (locked) return;
        var q = qs[qi], ok = v === q.ans;
        body.querySelectorAll('[data-v]').forEach(function (b) {
          b.disabled = true;
          if (b.dataset.v === q.ans) b.classList.add('ok');
        });
        if (!ok) btn.classList.add('bad');
        var ansLabel = q.opts.filter(function (o) { return o.v === q.ans; })[0].label;
        var ex = '';
        if (q.type === 'non') {
          ex = '<span class="en">' + esc(q.non) + '</span> ' + Z('和') + ' <span class="en">' + esc(q.ans) + '</span> ' + Z('一樣。') +
            ' <button class="btn" data-sayans>🔊 <span class="en">' + esc(q.ans) + '</span></button>';
        } else if (q.type === 'pic' || q.type === 'sound' || q.type === 'name') {
          ex = '<span class="en">' + esc(ansLabel) + '</span>' + (q.type !== 'name' ? '　' + (EMOJI[q.word] || '') + ' <span class="en">' + esc(q.word) + '</span>' : '');
        } else ex = (EMOJI[q.word] || '') + ' <span class="en">' + esc(q.ans) + '</span>';
        feedback(ok, q, ex);
        var sa = body.querySelector('[data-sayans]');
        if (sa) sa.onclick = function () { say(q.ans); };
      }
      function spellUI(q) {
        var picked = [];
        var slots = body.querySelector('[data-slots]');
        function draw() {
          var s = picked.map(function (id) { return q.tiles.filter(function (t) { return t.id === id; })[0].t; });
          var str = s.join('');
          var h = s.map(function (t) { return '<span class="ph-slot">' + esc(t) + '</span>'; }).join('');
          var left = Math.max(0, q.ans.length - str.length);
          for (var i = 0; i < Math.min(left, 6); i++) h += '<span class="ph-slot">&nbsp;</span>';
          slots.innerHTML = h;
          body.querySelectorAll('[data-t]').forEach(function (b) { b.classList.toggle('used', picked.indexOf(+b.dataset.t) >= 0); });
          if (!locked && str.length >= q.ans.length) {
            var ok = str === q.ans;
            body.querySelectorAll('[data-t],[data-undo],[data-clear]').forEach(function (b) { b.disabled = true; });
            feedback(ok, q, (EMOJI[q.ans] || '') + ' <span class="en">' + hl(q.ans, cur) + '</span>');
          }
        }
        body.querySelectorAll('[data-t]').forEach(function (b) {
          b.onclick = function () { if (locked) return; var id = +b.dataset.t; if (picked.indexOf(id) < 0) { picked.push(id); draw(); } };
        });
        body.querySelector('[data-undo]').onclick = function () { if (!locked) { picked.pop(); draw(); } };
        body.querySelector('[data-clear]').onclick = function () { if (!locked) { picked = []; draw(); } };
        draw();
      }
      function result() {
        stopAll();
        var score = res.filter(Boolean).length, total = qs.length, st = starsOf(score, total);
        var p = prog(), old = p[l.id], isBest = !old || score > old.best;
        p[l.id] = { best: Math.max(score, old ? old.best : 0), total: total, done: !!(old && old.done) || score >= Math.ceil(total * 0.7), times: (old ? old.times || 0 : 0) + 1 };
        storeSet('prog', p);
        var rd = store('rewardDay') || {}, msg = '', give = 0;
        var reason = '自然發音 #' + l.no + '：' + l.title + ' 答對 ' + score + ' / ' + total + ' 題';
        if (st > 0) {
          if (rd[l.id] !== today()) {
            rd[l.id] = today(); storeSet('rewardDay', rd); give = st;
            msg = '得到 ' + st + ' 顆星星！';
            if (st === 3) { try { if (api.confetti && !rm) api.confetti(); } catch (e) {} }
          } else msg = '這課今天已經拿過星星了，明天再來拿；也可以換下一課。';
        } else msg = '答對 5 題以上就有星星，再試一次吧！';
        // 有星星才給；作業模式下的作業課，就算 0 星也要呼叫 reward，作業才會記錄完成
        var isHw = !!(hwLesson && hwLesson === l);
        if (give > 0 || isHw) {
          try { if (api.reward) api.reward({ stars: give, xp: score, reason: reason }); } catch (e) {}
          if (isHw) msg += ' 📒 作業完成！';
        }
        var miss = [];
        qs.forEach(function (q, i) { if (!res[i]) miss.push(q); });
        var nx = LESSONS[l.idx + 1];
        var h = '<div class="ph-card ph-res"><div class="big">' + score + ' / ' + total + '</div><div class="stars">' + starStr(st) + '</div>' +
          '<div class="msg">' + Z(msg) + '</div>' + (isBest && old ? '<div class="msg">🏆 ' + Z('新的最佳成績！') + '</div>' : '');
        if (miss.length) {
          h += '<ul class="ph-miss">';
          miss.forEach(function (q) {
            h += '<li>' + Z(q.tag + '：') + (q.type === 'non' ? '<span class="en">' + esc(q.non) + ' → ' + esc(q.ans) + '</span>' : (EMOJI[q.word] || '') + ' <span class="en">' + esc(q.word) + '</span>') +
              ' <button class="btn" style="min-height:44px;padding:4px 10px" data-s="' + esc(q.type === 'name' ? q.say : q.word) + '">🔊</button></li>';
          });
          h += '</ul>';
        }
        h += '<div class="ph-row"><button class="btn" data-retry>↻ ' + Z('再練一次') + '</button>' +
          (nx ? '<button class="btn primary" data-nxt>' + Z('下一課') + '：<span class="en">' + esc(nx.title) + '</span> →</button>' : '') +
          '<button class="btn" data-home2>' + Z('回課程') + '</button></div></div>';
        body.innerHTML = h;
        body.querySelectorAll('[data-s]').forEach(function (b) { b.onclick = function () { say(b.dataset.s); }; });
        body.querySelector('[data-retry]').onclick = function () { practice(body); };
        body.querySelector('[data-home2]').onclick = home;
        var n2 = body.querySelector('[data-nxt]');
        if (n2) n2.onclick = function () { openLesson(nx.id); };
      }
      drawQ();
      body.__ph = { qs: qs, answer: function (v) { var b = body.querySelector('[data-v="' + v + '"]'); if (b) b.click(); }, result: result, res: res };
    }

    // 測試用導覽
    root.__nav = { home: home, open: openLesson, body: function () { return root.querySelector('[data-body]'); } };
    var hwLevel = (api.hw && +api.hw.level > 0) ? +api.hw.level : 0;
    var hwLesson = hwLevel ? LESSONS[hwLevel - 1] : null;
    if (hwLesson) openLesson(hwLesson.id);
    else { home(); if (hwLevel) try { if (api.toast) api.toast('找不到第 ' + hwLevel + ' 課，請選一課練習'); } catch (e) {} }
    return function cleanup() { stopAll(); root.remove(); style.remove(); };
  }

  (window.CFX = window.CFX || []).push({
    id: 'phonics',
    title: '自然發音 Phonics',
    icon: '🔤',
    grades: [1, 2, 3, 4, 5, 6],
    subject: '英語',
    desc: '看字就會念：字母音、短母音、Magic e',
    render: render,
    selfCheck: selfCheck,
    _lessons: LESSONS
  });
})();
