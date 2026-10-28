/* 啟賦小學堂 小工具：英文程度檢測（engtest）
 * 約 10 分鐘、22 題適性出題（答對升一級、答錯降一級），涵蓋字母、聽力、單字、句型、閱讀。
 * 結果：建議 Level（對應 englevel 地圖）、四項能力長條、給家長的建議；保留最近 5 次（存在 api.store）。
 * 與 englevel 的約定：按「從 Level X 開始練」時寫 localStorage 'chifoo.englevel.suggest' = {"lv":X,"d":"YYYY-M-D","fresh":true}
 * 不收姓名電話等個資、不上傳任何資料。題目全部自編。
 */
(function () {
  'use strict';

  var SUGGEST_KEY = 'chifoo.englevel.suggest';
  var TOTAL = 22;
  var SKILLS = { L: '聽力', V: '單字', G: '句型', R: '閱讀' };
  var SK_IC = { L: '🎧', V: '🔤', G: '🧩', R: '📖' };
  var ROT = ['V', 'L', 'G', 'R'];
  var LV_NAME = ['', '字母與發音', '基礎單字', '單字和句型', '句型和對話', '短文和時態', '進階閱讀'];

  /* 題庫：每行  技能|等級|要唸的英文（聽力用）|中文提示|英文題幹（// 換行）|正解|干擾1|干擾2|干擾3 */
  var BANK_TXT = `
L|1|B.|聽一聽，是哪個字母？||B|D|P|E
L|1|M.|聽一聽，是哪個字母？||M|N|W|H
L|1|cat|聽一聽，是哪一個？||🐱|🐶|🐟|🐷
L|1|sun|聽一聽，是哪一個？||☀️|🌙|⭐|☁️
L|1|pig|聽一聽，是哪一個？||🐷|🐶|🐔|🐟
V|1||大寫 G 的小寫是哪一個？|G|g|q|j|y
V|1||小寫 d 的大寫是哪一個？|d|D|B|P|Q
V|1||字母順序：中間缺哪一個？|K　L　＿　N|M|O|J|W
V|1||🍎（蘋果）是哪個字母開頭？|_pple|a|e|o|u
V|1||🐶（狗）是哪個字母開頭？|_og|d|b|p|g
G|1||見面打招呼要說？||Hello!|Goodbye!|Thank you.|Sorry.
G|1||想說「謝謝」要說？||Thank you.|Hello.|Sorry.|Good night.
G|1||這句話是什麼意思？|I am Amy.|我是艾咪。|你是艾咪。|這是艾咪。|艾咪在哪裡？
G|1||要回家了，跟老師說？||Goodbye!|Hello!|Thank you!|Good morning!
R|1||讀一讀，選出對的圖|dog|🐶|🐱|🐷|🐸
R|1||讀一讀，選出對的圖|fish|🐟|🦆|🐰|🐻
R|1||讀一讀，選出對的圖|egg|🥚|🍎|🍌|🍰
R|1||讀一讀，選出對的圖|hat|🎩|👟|🧦|👕
L|2|red|聽一聽，是哪個顏色？||🔴|🔵|🟢|🟡
L|2|rabbit|聽一聽，是哪一個？||🐰|🐻|🐸|🐵
L|2|seven|聽一聽，是數字幾？||7|6|9|11
L|2|mother|聽一聽，是哪一位？||👩|👨|👴|👶
L|2|nose|聽一聽，是哪個部位？||👃|👂|👁️|👄
V|2||「藍色」的英文是？||blue|black|brown|green
V|2||「鉛筆」的英文是？||pencil|pen|ruler|eraser
V|2||「八」的英文是？||eight|three|nine|four
V|2||這個字是什麼意思？|sister|姊姊；妹妹|哥哥；弟弟|爸爸|奶奶
V|2||🐵 的英文是？||monkey|mouse|rabbit|bear
G|2||選出正確的字填進空格|This ＿＿ my father.|is|am|are|be
G|2||選出正確的字填進空格|I ＿＿ a student.|am|is|are|be
G|2||選出正確的字填進空格|It is ＿＿ apple.|an|a|two|three
G|2||「這是我的貓。」哪一句正確？||This is my cat.|This my is cat.|My this is cat.|Is my this cat.
R|2||讀一讀，選出對的圖|It is a yellow banana.|🍌|🍎|🍇|🍓
R|2||讀一讀，他的心情是？|I am happy.|😀|😢|😠|😴
R|2||這句話是什麼意思？|This is my grandma.|這是我的奶奶。|這是我的媽媽。|這是我的爺爺。|這是我的姊姊。
R|2||這句話在說什麼？|I have two eyes and one nose.|身體|顏色|食物|天氣
L|3|I like bananas.|聽一聽，他喜歡什麼？||🍌|🍎|🥛|🍞
L|3|It is rainy today.|聽一聽，今天天氣怎麼樣？||🌧️|☀️|❄️|🌬️
L|3|I can swim.|聽一聽，他會做什麼？||🏊|🎤|🚲|💃
L|3|The cat is under the bed.|聽一聽，貓在哪裡？||床底下|床上面|箱子裡|門旁邊
V|3||「冰淇淋」的英文是？||ice cream|hot dog|salad|candy
V|3||🪁 的英文是？||kite|robot|doll|ball
V|3||「颳風的」的英文是？||windy|sunny|cloudy|snowy
V|3||這個字是什麼意思？|shoes|鞋子|襪子|褲子|外套
G|3||選出正確的字填進空格|Do you like pizza? — Yes, I ＿＿.|do|am|like|is
G|3||選出正確的字填進空格|＿＿ is the ball? — It's in the box.|Where|What|Who|How
G|3||選出正確的字填進空格|She ＿＿ a red dress.|has|have|is|are
G|3||「我不會游泳。」選出正確的字|I ＿＿ swim.|can't|can|am|is
R|3||Amy 喜歡什麼？|Ben: What's this?//Amy: It's a robot. I like robots.|機器人|娃娃|風箏|氣球
R|3||要穿戴什麼？|It's cold and snowy. Put on your coat and gloves.|外套和手套|帽子和襪子|洋裝和鞋子|褲子和襯衫
R|3||他不會做什麼？|I can run, but I can't swim.|游泳|跑步|唱歌|跳舞
R|3||書在哪裡？|My bag is on the chair. My book is in my bag.|書包裡|椅子下|桌上|箱子裡
L|4|How old are you?|聽一聽，最好的回答是？||I'm ten years old.|I'm fine, thank you.|My name is Ben.|It's Monday.
L|4|What time is it? It's eight o'clock.|聽一聽，現在幾點？||8:00|6:00|9:00|10:00
L|4|She is a doctor.|聽一聽，她是做什麼的？||醫生|廚師|農夫|警察
L|4|They are playing basketball.|聽一聽，他們在做什麼？||🏀|🏊|📺|🎤
V|4||「星期五」的英文是？||Friday|Monday|Sunday|Tuesday
V|4||這個字是什麼意思？|kitchen|廚房|臥室|浴室|客廳
V|4||「護理師」的英文是？||nurse|doctor|farmer|driver
V|4||「早餐」的英文是？||breakfast|lunch|dinner|bread
G|4||選出正確的字填進空格|There ＿＿ two cats on the sofa.|are|is|am|be
G|4||選出正確的字填進空格|What are you doing? — I'm ＿＿ a book.|reading|read|reads|to read
G|4||「筆記本多少錢？」選出正確的字|How ＿＿ is the notebook?|much|many|old|time
G|4||「她是老師。」選出正確的字|＿＿ is a teacher.|She|He|It|They
R|4||作者今天有什麼課？|Today is Monday. I have English and music. I like music. I can sing many songs.|英文和音樂|數學和美術|體育和自然|英文和數學
R|4||爸爸在做什麼？|Mom is cooking in the kitchen. Dad is watching TV. I am doing my homework.|看電視|煮飯|寫功課|睡覺
R|4||機器人多少錢？|A: How much is this robot?//B: It's two hundred dollars.//A: OK. I want it.|200 元|20 元|100 元|2000 元
R|4||牆上有什麼？|There is a bed, a desk and a lamp in my bedroom. There are two pictures on the wall.|兩幅畫|一盞檯燈|一張床|一張書桌
L|5|I get up at six thirty every day.|聽一聽，他幾點起床？||6:30|7:30|6:00|7:00
L|5|Yesterday I went to the zoo.|聽一聽，他昨天去了哪裡？||動物園|學校|海邊|博物館
L|5|I usually go to school by bus.|聽一聽，他通常怎麼上學？||🚌|🚲|🚗|🚶
L|5|We will have a picnic tomorrow.|聽一聽，他們什麼時候要野餐？||明天|今天|昨天|上週
V|5||「昨天」的英文是？||yesterday|tomorrow|today|weekend
V|5||這個字是什麼意思？|never|從不|總是|通常|有時候
V|5||go 的過去式是哪一個？|go|went|goed|goes|going
V|5||「最喜歡的」的英文是？||favorite|famous|friendly|funny
G|5||選出正確的字填進空格|I ＿＿ TV last night.|watched|watch|watches|watching
G|5||選出正確的字填進空格|She ＿＿ to school every day.|goes|go|going|gone
G|5||選出正確的字填進空格|They ＿＿ at the beach yesterday.|were|was|are|is
G|5||選出正確的字填進空格|I ＿＿ visit my grandma tomorrow.|will|was|did|am
R|5||放學後阿肯先做什麼？|Ken gets up at six. He walks to school with his sister. After school, he plays the piano. Then he does his homework.|彈鋼琴|寫功課|走路上學|起床
R|5||妮娜買了什麼給弟弟？|Last Sunday, Nina went to the night market with her family. She ate a big sausage and bought a toy car for her brother.|玩具車|香腸|風箏|一本書
R|5||艾咪早餐從不吃什麼？|Amy always drinks milk in the morning. She sometimes eats bread. She never eats candy for breakfast.|糖果|麵包|牛奶|蛋
R|5||誰會做蛋糕？|Next Saturday is Leo's birthday. His mom will make a chocolate cake. His friends are going to play games at his house.|Leo 的媽媽|Leo 的朋友|Leo 自己|Leo 的爸爸
L|6|An elephant is bigger than a horse.|聽一聽，哪個說法正確？||大象比馬大|馬比大象大|大象比馬小|大象和馬一樣大
L|6|I have a headache and a fever.|聽一聽，他怎麼了？||頭痛又發燒|牙痛|肚子痛|腳受傷
L|6|Go straight and turn right at the corner.|聽一聽，到了轉角要怎麼走？||右轉|左轉|直走|往回走
L|6|The museum is closed on Mondays.|聽一聽，博物館哪天休館？||星期一|星期日|星期五|每天
V|6||「圖書館」的英文是？||library|hospital|station|museum
V|6||「秋天」的英文是？||fall|spring|summer|winter
V|6||這個字是什麼意思？|medicine|藥|醫生|休息|醫院
V|6||「美味的」的英文是？||delicious|famous|exciting|dangerous
G|6||選出正確的字填進空格|A turtle is ＿＿ than a rabbit.|slower|slow|slowest|more slow
G|6||「你應該多喝水。」選出正確的字|You ＿＿ drink more water.|should|shouldn't|are|do
G|6||選出正確的字填進空格|The race was very ＿＿.|exciting|excited|excite|excites
G|6||選出正確的字填進空格|Summer is the ＿＿ season in Taiwan.|hottest|hot|hotter|more hot
R|6||Sofia 的嗜好是什麼？|Dear Ken,//Thank you for your email. I live in Spain. My hobby is playing soccer. What is your favorite sport?//Sofia|踢足球|游泳|畫畫|煮飯
R|6||Coco 長什麼樣子？|LOST DOG//Name: Coco//Brown with white ears.//Lost near the station on Friday.|咖啡色、白耳朵|白色、咖啡色耳朵|全身黑色|黃色
R|6||哪一句正確？|Andy is twelve and Leo is nine. Andy is taller, but Leo runs faster.|Leo 跑得比較快|Leo 比較高|Andy 年紀比較小|Andy 跑得比較快
R|6||書要在多久內還？|Library Rules//1. Be quiet.//2. No food or drinks.//3. Return books in two weeks.|兩週|兩天|一個月|一週
`;
  var BANK = BANK_TXT.trim().split('\n').map(function (line, i) {
    var a = line.split('|');
    return { id: i, k: a[0], lv: +a[1], say: a[2], p: a[3], s: a[4].replace(/\/\//g, '\n'), ans: a[5], ds: a.slice(6) };
  });

  var ADVICE = {
    1: '孩子正在認識字母和字母的聲音。建議每天花 5～10 分鐘，一起唸字母、指著圖說出簡單單字（cat、dog、apple），先培養「聽得懂、敢開口」的習慣，不急著背拼字。',
    2: '孩子已經認得字母，正在累積顏色、數字、動物、家人等基礎單字。可以在生活中隨口用英文說出看到的東西，例如「This is a red car.」，讓單字和句子一起出現。',
    3: '孩子認得不少基礎單字，開始會用 I like、Do you…?、What\'s this? 這類句型。建議多練「一問一答」：家長用英文問簡單問題，讓孩子用完整句子回答。',
    4: '孩子聽得懂、也會用常見句型，開始進入短對話。建議每天朗讀一小段對話，練習問時間、星期、正在做什麼，也可以開始讀圖多字少的英文小書。',
    5: '孩子讀得懂短文，並開始接觸過去式、未來式。建議每週讀 2～3 篇短文或繪本，讀完用一句英文說說「發生了什麼事」，慢慢建立閱讀習慣。',
    6: '孩子已經具備國小階段完整的英文基礎，讀得懂信件、公告這類短文。建議挑戰稍長的讀物，練習找重點、用上下文猜生字，也可以試著用英文寫幾句日記。'
  };
  var WEAK_TIP = {
    L: '聽力相對弱一些：每天聽 5 分鐘英文兒歌或故事，先聽、再跟著唸，耳朵會越來越靈。',
    V: '單字量可以再加強：用圖卡或家裡的東西，每天複習 5 個單字，唸出聲音比默寫更有效。',
    G: '句型還不太穩：把常用句子整句記起來，像「I like…」「Can you…?」，換一個單字就能說新句子。',
    R: '閱讀可以多練習：讀短文時先看標題和圖猜內容，再找出「誰、在哪裡、做什麼」。'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function isEmo(s) { return /\p{Extended_Pictographic}/u.test(s) && !/[A-Za-z一-鿿]/.test(s); }
  function startLevel(g) { return g <= 2 ? 1 : g <= 4 ? 2 : 3; }

  /* 計分：每題貢獻 答對＝等級+0.5、答錯＝等級−0.5；整體取第 7 題以後的平均（前 6 題是暖身定位） */
  function score(items) {
    var tail = items.length > 8 ? items.slice(6) : items;
    var v = function (it) { return it.ok ? it.lv + 0.5 : it.lv - 0.5; };
    var theta = tail.reduce(function (s, it) { return s + v(it); }, 0) / Math.max(1, tail.length);
    theta = clamp(theta, 0.5, 6.5);
    var level = clamp(Math.floor(theta + 0.25), 1, 6);
    var accAll = items.filter(function (i) { return i.ok; }).length / Math.max(1, items.length);
    var sk = {};
    Object.keys(SKILLS).forEach(function (k) {
      var its = items.filter(function (i) { return i.k === k; });
      if (!its.length) { sk[k] = { n: 0, ok: 0, th: theta }; return; }
      var ok = its.filter(function (i) { return i.ok; }).length;
      var acc = ok / its.length;
      // 相對整體正確率的高低，修正整體能力值（適性測驗的整體正確率會落在 50% 左右）
      var th = clamp(theta + (acc - accAll) * 2.4, 0.5, 6.5);
      sk[k] = { n: its.length, ok: ok, th: Math.round(th * 10) / 10 };
    });
    return { theta: Math.round(theta * 10) / 10, level: level, sk: sk, ok: items.filter(function (i) { return i.ok; }).length, n: items.length };
  }

  var CSS = '' +
    '.cfx-et{max-width:820px;margin:0 auto;color:var(--ink);-webkit-tap-highlight-color:transparent}' +
    '.cfx-et *{box-sizing:border-box}' +
    '.cfx-et .et-card{background:var(--paper,#fff);border:2px solid var(--line);border-radius:var(--r-l,22px);padding:16px;box-shadow:var(--shadow,0 4px 14px rgba(0,0,0,.08));margin-bottom:14px}' +
    '.cfx-et .et-sub{color:var(--muted);font-size:14px;font-weight:700;margin:0 0 6px;line-height:1.5}' +
    '.cfx-et .btn{min-height:48px}' +
    '.cfx-et .et-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}' +
    '.cfx-et .et-row .btn{flex:1 1 160px;font-size:17px}' +
    '.cfx-et .et-feat{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:10px 0}' +
    '@media (min-width:640px){.cfx-et .et-feat{grid-template-columns:repeat(4,1fr)}}' +
    '.cfx-et .et-feat div{background:var(--paper2,#f6fbf9);border:2px solid var(--line);border-radius:14px;padding:8px;text-align:center;font-weight:800;font-size:14px}' +
    '.cfx-et .et-feat b{display:block;font-size:24px}' +
    '.cfx-et .et-tips{margin:6px 0 0;padding-left:20px;font-weight:700;line-height:1.7}' +
    '.cfx-et .et-hist{list-style:none;margin:0;padding:0}' +
    '.cfx-et .et-hist li{display:flex;gap:10px;align-items:center;border-top:1px dashed var(--line);padding:8px 0;font-weight:700}' +
    '.cfx-et .et-hist li b{font-size:17px}' +
    '.cfx-et .et-hist li span{margin-left:auto;color:var(--muted);font-size:13px}' +
    /* 題目 */
    '.cfx-et .et-qtop{display:flex;align-items:center;gap:10px;margin-bottom:10px}' +
    '.cfx-et .et-qtop .btn{flex:0 0 48px;width:48px;padding:0}' +
    '.cfx-et .et-bar{flex:1;height:12px;border-radius:999px;background:var(--line);overflow:hidden}' +
    '.cfx-et .et-bar i{display:block;height:100%;background:linear-gradient(90deg,#4FC3E8,#1A86A8);border-radius:999px;transition:width .3s}' +
    '.cfx-et .et-qn{font-weight:900;font-size:14px;color:var(--muted);white-space:nowrap}' +
    '.cfx-et .et-q{text-align:center}' +
    '.cfx-et .et-tag{display:inline-block;font-size:12.5px;font-weight:900;border-radius:999px;padding:2px 10px;background:var(--paper2,#f6fbf9);border:1px solid var(--line);margin-bottom:8px}' +
    '.cfx-et .et-p{font-weight:800;font-size:18px;margin:0 0 8px;line-height:1.45}' +
    '.cfx-et .et-s{font-size:clamp(20px,5.6vw,28px);font-weight:900;line-height:1.35;margin:4px 0 10px;white-space:pre-line;overflow-wrap:anywhere}' +
    '.cfx-et .et-s.long{font-size:16.5px;font-weight:700;text-align:left;background:var(--paper2,#f6fbf9);border:2px solid var(--line);border-radius:16px;padding:10px 12px;line-height:1.65}' +
    '.cfx-et .et-say{width:80px;height:80px;border-radius:50%;border:3px solid #1A86A8;background:color-mix(in srgb,#1A86A8 12%,var(--paper,#fff));font-size:36px;cursor:pointer;margin:0 auto 6px;display:flex;align-items:center;justify-content:center;touch-action:manipulation}' +
    '.cfx-et .et-reveal{background:none;border:0;color:var(--muted);font:inherit;font-size:13px;font-weight:700;text-decoration:underline;cursor:pointer;min-height:44px;padding:0 8px}' +
    '.cfx-et .et-rev{font-weight:800;font-size:17px;margin:0 0 6px}' +
    '.cfx-et .et-opts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}' +
    '.cfx-et .et-opts.long{grid-template-columns:1fr}' +
    '@media (min-width:700px){.cfx-et .et-opts.emo{grid-template-columns:repeat(4,1fr)}.cfx-et .et-opts.long{grid-template-columns:1fr 1fr}}' +
    '.cfx-et .et-opt{min-height:60px;border-radius:16px;border:2px solid var(--line);background:var(--paper,#fff);font:inherit;font-weight:900;font-size:19px;color:var(--ink);cursor:pointer;padding:8px 10px;box-shadow:0 3px 0 var(--line);touch-action:manipulation;overflow-wrap:anywhere;line-height:1.3}' +
    '.cfx-et .et-opts.emo .et-opt{font-size:44px;min-height:84px}' +
    '.cfx-et .et-opts.long .et-opt{font-size:16.5px;text-align:left}' +
    '.cfx-et .et-opt.pick{border-color:#1A86A8;background:color-mix(in srgb,#1A86A8 15%,var(--paper,#fff))}' +
    '.cfx-et .et-skip{display:block;margin:12px auto 0;min-height:44px}' +
    '.cfx-et.anim .et-q{animation:etIn .25s ease}' +
    '@keyframes etIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:none}}' +
    /* 結果 */
    '.cfx-et .et-rep{border:3px solid #1A86A8;background:linear-gradient(180deg,color-mix(in srgb,#1A86A8 8%,var(--paper,#fff)),var(--paper,#fff) 40%)}' +
    '.cfx-et .et-rephd{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-weight:800;color:var(--muted);font-size:13.5px}' +
    '.cfx-et .et-lvbig{text-align:center;margin:10px 0 6px}' +
    '.cfx-et .et-lvbig small{display:block;font-weight:800;color:var(--muted);font-size:14px}' +
    '.cfx-et .et-lvbig b{display:block;font-size:46px;line-height:1.1;color:#1A86A8;font-weight:900}' +
    '.cfx-et .et-lvbig span{display:block;font-size:18px;font-weight:900}' +
    '.cfx-et .et-steps{display:flex;gap:4px;margin:8px 0 14px}' +
    '.cfx-et .et-steps i{flex:1;height:26px;border-radius:8px;background:var(--line);font-style:normal;font-size:12px;font-weight:900;color:var(--muted);display:flex;align-items:center;justify-content:center}' +
    '.cfx-et .et-steps i.on{background:#1A86A8;color:#fff}' +
    '.cfx-et .et-steps i.past{background:color-mix(in srgb,#1A86A8 35%,var(--paper,#fff));color:var(--ink)}' +
    '.cfx-et .et-sk{display:grid;grid-template-columns:auto 1fr auto;gap:8px 10px;align-items:center;margin:6px 0 12px}' +
    '.cfx-et .et-sk .nm{font-weight:900;white-space:nowrap}' +
    '.cfx-et .et-sk .tr{height:16px;border-radius:999px;background:var(--line);overflow:hidden;position:relative}' +
    '.cfx-et .et-sk .tr i{display:block;height:100%;border-radius:999px}' +
    '.cfx-et .et-sk .vl{font-weight:800;font-size:13px;color:var(--muted);white-space:nowrap;text-align:right}' +
    '.cfx-et .et-adv{background:var(--paper2,#f6fbf9);border-radius:14px;padding:10px 12px;line-height:1.7;font-weight:700}' +
    '.cfx-et .et-adv p{margin:0 0 6px}.cfx-et .et-adv p:last-child{margin:0}' +
    '.cfx-et .et-note{font-size:12.5px;color:var(--muted);font-weight:700;margin:10px 0 0;line-height:1.5}' +
    '.cfx-et.rm *{animation:none!important;transition:none!important}';

  function render(el, api) {
    api = api || {};
    var rm = !!api.reducedMotion;
    var store = function (k) { try { return api.store ? api.store(k) : null; } catch (e) { return null; } };
    var storeSet = function (k, v) { try { if (api.storeSet) api.storeSet(k, v); } catch (e) {} };
    var speak = function (t) { try { if (api.speak && t) api.speak(t, 'en'); } catch (e) {} };
    var stopSpeak = function () { try { if (api.stopSpeak) api.stopSpeak(); } catch (e) {} };
    var Z = function (t) { try { return api.Z ? api.Z(t) : esc(t); } catch (e) { return esc(t); } };
    var grade = function () { var g = 3; try { g = +api.grade || 3; } catch (e) {} return clamp(g, 1, 6); };

    var style = document.createElement('style'); style.textContent = CSS;
    var root = document.createElement('div'); root.className = 'cfx-et' + (rm ? ' rm' : ' anim');
    el.appendChild(style); el.appendChild(root);
    var timers = [], keyHandler = null, hwMode = false;
    function later(f, ms) { timers.push(setTimeout(f, ms)); }
    function clearAll() { timers.forEach(clearTimeout); timers = []; if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; } stopSpeak(); }
    function hist() { var h = store('hist'); return Array.isArray(h) ? h : []; }
    function fmtDate(d) { var a = String(d || '').split('-'); return a.length === 3 ? a[0] + '/' + a[1] + '/' + a[2] : d; }
    function top() { try { root.scrollIntoView({ block: 'start', behavior: 'auto' }); } catch (e) {} }

    /* ---------- 首頁 ---------- */
    function intro() {
      clearAll();
      var H = hist();
      var h = '<div class="et-card"><p class="et-p" style="text-align:left">' + Z('看看自己的英文在哪一級！') + '</p>';
      h += '<p class="et-sub">' + Z('一共 22 題，大約 10 分鐘。答對會變難、答錯會變簡單，所以遇到不會的題目很正常，不用緊張。') + '</p>';
      h += '<div class="et-feat"><div><b>🎧</b>' + Z('聽力') + '</div><div><b>🔤</b>' + Z('字母單字') + '</div><div><b>🧩</b>' + Z('句型') + '</div><div><b>📖</b>' + Z('閱讀') + '</div></div>';
      h += '<ul class="et-tips"><li>' + Z('請打開聲音，聽力題可以按 🔊 重聽') + '</li><li>' + Z('真的不會可以按「我不會」，不要亂猜，結果比較準') + '</li><li>' + Z('不需要填姓名，結果只存在這台裝置') + '</li></ul>';
      h += '<div class="et-row"><button class="btn primary" data-go>▶ ' + Z('開始檢測') + '</button>';
      if (H.length) h += '<button class="btn" data-last>📄 ' + Z('看上次結果') + '</button>';
      h += '</div></div>';
      if (H.length) {
        h += '<div class="et-card"><p class="et-sub">🕘 ' + Z('最近的檢測紀錄（最多 5 次）') + '</p><ul class="et-hist">';
        H.slice().reverse().forEach(function (r, i) {
          h += '<li><div style="flex:1;min-width:0"><b>Level ' + r.level + '</b>　' + Z(LV_NAME[r.level]) + '<small style="display:block;color:var(--muted);font-size:13px">' + esc(fmtDate(r.d)) + '・' + Z(r.g + ' 年級') + '・' + Z('答對 ' + r.ok + '/' + r.n) + '</small></div><button class="btn" data-h="' + (H.length - 1 - i) + '" style="min-height:44px;padding:6px 14px;white-space:nowrap;flex:0 0 auto">' + Z('查看') + '</button></li>';
        });
        h += '</ul></div>';
      }
      root.innerHTML = h;
      root.querySelector('[data-go]').onclick = run;
      var l = root.querySelector('[data-last]'); if (l) l.onclick = function () { report(H[H.length - 1], false); };
      root.querySelectorAll('[data-h]').forEach(function (b) { b.onclick = function () { report(H[+b.dataset.h], false); }; });
    }

    /* ---------- 檢測 ---------- */
    function run() {
      clearAll();
      var lv = startLevel(grade()), items = [], used = {}, t0 = Date.now();
      function pickItem(k, L) {
        var tryOrder = [[k, L]];
        Object.keys(SKILLS).forEach(function (o) { if (o !== k) tryOrder.push([o, L]); });
        for (var d = 1; d <= 5; d++) { [L - d, L + d].forEach(function (x) { if (x >= 1 && x <= 6) tryOrder.push([k, x]); }); }
        for (var i = 0; i < tryOrder.length; i++) {
          var c = shuffle(BANK.filter(function (b) { return b.k === tryOrder[i][0] && b.lv === tryOrder[i][1] && !used[b.id]; }));
          if (c.length) return c[0];
        }
        return null;
      }
      function ask() {
        clearAll();
        var n = items.length;
        if (n >= TOTAL) return finish();
        var k = ROT[n % 4], it = pickItem(k, lv);
        if (!it) return finish();
        used[it.id] = 1;
        var opts = shuffle([it.ans].concat(it.ds)), emo = opts.every(isEmo), longO = !emo && opts.some(function (o) { return o.length > 13; });
        var longS = it.s.length > 40 || it.s.indexOf('\n') >= 0;
        var h = '<div class="et-qtop"><button class="btn" data-x aria-label="離開檢測">✕</button><div class="et-bar"><i style="width:' + (n / TOTAL * 100) + '%"></i></div><span class="et-qn">' + (n + 1) + ' / ' + TOTAL + '</span></div>';
        h += '<div class="et-card et-q"><span class="et-tag">' + SK_IC[it.k] + ' ' + Z(SKILLS[it.k]) + '</span>';
        h += '<p class="et-p">' + Z(it.p) + '</p>';
        if (it.say) h += '<button class="et-say" data-say aria-label="再聽一次">🔊</button><div data-revbox><button class="et-reveal" data-reveal>' + Z('聽不到聲音？按這裡看文字') + '</button></div>';
        if (it.s) h += '<div class="et-s' + (longS ? ' long' : '') + '">' + esc(it.s) + '</div>';
        h += '<div class="et-opts' + (emo ? ' emo' : '') + (longO ? ' long' : '') + '">';
        opts.forEach(function (o, i) { h += '<button class="et-opt" data-o="' + i + '">' + (/[一-鿿]/.test(o) ? Z(o) : esc(o)) + '</button>'; });
        h += '</div><button class="btn et-skip" data-skip>🤔 ' + Z('我不會') + '</button></div>';
        root.innerHTML = h;
        top();
        var sayB = root.querySelector('[data-say]');
        if (sayB) { sayB.onclick = function () { speak(it.say); }; later(function () { speak(it.say); }, 300); }
        var rv = root.querySelector('[data-reveal]');
        if (rv) rv.onclick = function () { root.querySelector('[data-revbox]').innerHTML = '<p class="et-rev">' + esc(it.say) + '</p>'; };
        root.querySelector('[data-x]').onclick = function () { intro(); };
        var done = false;
        function answer(ok, btn) {
          if (done) return; done = true;
          if (btn) btn.classList.add('pick');
          root.querySelectorAll('.et-opt,[data-skip]').forEach(function (b) { b.disabled = true; });
          items.push({ id: it.id, k: it.k, lv: it.lv, ok: ok });
          lv = ok ? Math.min(6, lv + 1) : Math.max(1, lv - 1);
          later(ask, rm ? 150 : 380);
        }
        root.querySelectorAll('[data-o]').forEach(function (b) { b.onclick = function () { answer(opts[+b.dataset.o] === it.ans, b); }; });
        root.querySelector('[data-skip]').onclick = function () { answer(false, null); };
        keyHandler = function (e) {
          if (e.ctrlKey || e.metaKey || e.altKey) return;
          if (/^[1-4]$/.test(e.key)) { var b = root.querySelector('[data-o="' + (+e.key - 1) + '"]'); if (b) b.click(); }
        };
        document.addEventListener('keydown', keyHandler);
        root._et = { it: it, items: items, lv: lv, opts: opts };
      }
      function finish() {
        var sc = score(items);
        var rec = { d: today(), g: grade(), level: sc.level, theta: sc.theta, ok: sc.ok, n: sc.n, sec: Math.round((Date.now() - t0) / 1000), sk: {} };
        Object.keys(sc.sk).forEach(function (k) { rec.sk[k] = [sc.sk[k].th, sc.sk[k].ok, sc.sk[k].n]; });
        var H = hist(); H.push(rec); while (H.length > 5) H.shift(); storeSet('hist', H);
        // 作業模式：測完一定要呼叫 reward；一天只給一次星
        var rd = store('rd'), first = rd !== today();
        if (first) storeSet('rd', today());
        try { if (api.reward) api.reward({ stars: first ? 2 : 0, xp: sc.ok, reason: '英文程度檢測完成' }); } catch (e) {}
        report(rec, true);
      }
      ask();
    }

    /* ---------- 結果報告（好截圖） ---------- */
    function report(rec, fresh) {
      clearAll();
      var L = rec.level;
      var sk = rec.sk || {};
      var keys = ['L', 'V', 'G', 'R'];
      var ths = keys.map(function (k) { return sk[k] ? sk[k][0] : rec.theta; });
      var mx = Math.max.apply(null, ths), mn = Math.min.apply(null, ths);
      var weak = keys[ths.indexOf(mn)], strong = keys[ths.indexOf(mx)];
      var COL = { L: '#1A86A8', V: '#2E9E5B', G: '#7B61FF', R: '#E0567A' };
      var h = '<div class="et-card et-rep" data-report>';
      h += '<div class="et-rephd"><span>📝 ' + Z('英文程度檢測結果') + '</span><span>' + esc(fmtDate(rec.d)) + '・' + Z(rec.g + ' 年級') + '・' + Z('答對 ' + rec.ok + '/' + rec.n) + (rec.sec ? '・' + Z(Math.max(1, Math.round(rec.sec / 60)) + ' 分鐘') : '') + '</span></div>';
      h += '<div class="et-lvbig"><small>' + Z('建議從這一級開始練') + '</small><b>Level ' + L + '</b><span>' + Z(LV_NAME[L]) + '</span></div>';
      h += '<div class="et-steps" aria-hidden="true">';
      for (var i = 1; i <= 6; i++) h += '<i class="' + (i === L ? 'on' : i < L ? 'past' : '') + '">L' + i + '</i>';
      h += '</div>';
      h += '<div class="et-sk">';
      keys.forEach(function (k) {
        var th = sk[k] ? sk[k][0] : rec.theta, w = clamp(th / 6.5 * 100, 6, 100);
        h += '<span class="nm">' + SK_IC[k] + ' ' + Z(SKILLS[k]) + '</span><span class="tr"><i style="width:' + w.toFixed(0) + '%;background:' + COL[k] + '"></i></span><span class="vl">' + Z('約 Level ' + clamp(Math.floor(th + 0.25), 1, 6)) + (sk[k] ? '（' + sk[k][1] + '/' + sk[k][2] + '）' : '') + '</span>';
      });
      h += '</div>';
      h += '<div class="et-adv"><p><b>👪 ' + Z('給家長的話') + '</b></p><p>' + Z(ADVICE[L]) + '</p>';
      if (mx - mn >= 0.6) h += '<p>' + Z('「' + SKILLS[strong] + '」是目前最強的能力，值得多鼓勵！' + WEAK_TIP[weak]) + '</p>';
      else h += '<p>' + Z('四項能力很平均，照著建議的等級一關一關往上練就可以。') + '</p>';
      h += '</div>';
      h += '<p class="et-note">' + Z('這是練習用的參考結果，會隨當天狀況變動；隔幾週再測一次，就能看到進步。') + '</p>';
      h += '</div>';
      h += '<div class="et-row"><button class="btn primary" data-start>🗺️ ' + Z('從 Level ' + L + ' 開始練') + '</button><button class="btn" data-again>🔄 ' + Z('再測一次') + '</button>' + (fresh ? '' : '<button class="btn" data-home>← ' + Z('回檢測首頁') + '</button>') + '</div>';
      if (fresh) h += '<p class="et-sub" style="text-align:center">' + Z('可以把上面的結果截圖保存或給老師看') + '</p>';
      root.innerHTML = h;
      top();
      root.querySelector('[data-start]').onclick = function () {
        try { localStorage.setItem(SUGGEST_KEY, JSON.stringify({ lv: L, d: rec.d, fresh: true })); } catch (e) {}
        location.hash = '#/tools/englevel';
      };
      root.querySelector('[data-again]').onclick = run;
      var hb = root.querySelector('[data-home]'); if (hb) hb.onclick = intro;
      if (fresh) { try { localStorage.setItem(SUGGEST_KEY, JSON.stringify({ lv: L, d: rec.d, fresh: false })); } catch (e) {} }
    }

    var hw = null; try { hw = api.hw; } catch (e) {}
    hwMode = !!hw;
    if (hwMode) run(); else intro();
    return function () { clearAll(); };
  }

  (window.CFX = window.CFX || []).push({
    id: 'engtest',
    title: '英文程度檢測',
    icon: '📝',
    grades: [1, 2, 3, 4, 5, 6],
    subject: '英語',
    desc: '10 分鐘找出適合的英文闖關等級',
    render: render,
    _t: { BANK: BANK, score: score, startLevel: startLevel, TOTAL: TOTAL, SUGGEST_KEY: SUGGEST_KEY }
  });
})();
