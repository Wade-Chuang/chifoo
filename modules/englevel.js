/* 啟賦小學堂 小工具：英文分級闖關（englevel）
 * Level 1～6 × 7 關＝42 關，每關 10 題（聽音選圖／選字、看中文選英文、句子重組、填空、短文閱讀）＋「學一學」卡。
 * 內容全部自編，對照國小英語課綱與國小常用字彙程度；不連外部服務、不用外部圖片。
 * 與 engtest（英文程度檢測）的約定：localStorage 'chifoo.englevel.suggest' = {"lv":3,"d":"2026-10-29","fresh":true}
 * 作業模式：api.hw = {level:N}（N＝關卡編號 1..42，見 ORDER），N>0 時直接打開那一關。
 * 關卡編號只能往後加，不能改順序。
 */
(function () {
  'use strict';

  var SUGGEST_KEY = 'chifoo.englevel.suggest';

  /* ================= 關卡資料 =================
   * 每關一段文字：
   *  L 字母（字母關）  c 缺字選項（拼讀關）
   *  w 單字：英文|中文|emoji|（拼讀關：易混字,逗號分隔|遮字形 c_t）以 ; 分隔
   *  s 句子：英文|中文|要挖空的字|干擾1,干擾2,干擾3   （填空／重組／選意思）
   *  r 對話：問句|中文|正確回答|干擾1|干擾2|干擾3
   *  p 短文（// 代表換行），後面的 q 都屬於這篇：問題|中文|正解|干擾1|干擾2|干擾3
   */
  var LEVELS = [
    { n: 1, name: '字母與發音', icon: '🔤', c: '#F2994A', desc: '26 個字母、短母音、sh ch th' },
    { n: 2, name: '基礎單字', icon: '🐶', c: '#2E9E5B', desc: '顏色數字動物家人＋This is / I am' },
    { n: 3, name: '單字和句型', icon: '🍎', c: '#1A86A8', desc: "I like、Do you…?、What's this?" },
    { n: 4, name: '句型和對話', icon: '💬', c: '#7B61FF', desc: '年齡、時間、星期、職業、正在做' },
    { n: 5, name: '短文和時態', icon: '📖', c: '#E0567A', desc: '作息、頻率、過去式、未來式' },
    { n: 6, name: '進階閱讀', icon: '🏆', c: '#B07A00', desc: '比較、旅行、健康、問路、信件公告' }
  ];

  var RAW = [
    ['1-1', 'A～G', 'Letters A-G', '🅰️', `
L ABCDEFG
w apple|蘋果|🍎; ball|球|⚽; cat|貓|🐱; dog|狗|🐶; egg|蛋|🥚; fish|魚|🐟; goat|山羊|🐐`],
    ['1-2', 'H～N', 'Letters H-N', '🎩', `
L HIJKLMN
w hat|帽子|🎩; insect|昆蟲|🐜; juice|果汁|🧃; kite|風箏|🪁; lion|獅子|🦁; monkey|猴子|🐵; nose|鼻子|👃`],
    ['1-3', 'O～U', 'Letters O-U', '🐙', `
L OPQRSTU
w octopus|章魚|🐙; pig|豬|🐷; queen|女王|👸; rabbit|兔子|🐰; sun|太陽|☀️; tiger|老虎|🐯; umbrella|雨傘|☂️`],
    ['1-4', 'V～Z', 'Letters V-Z', '🦓', `
L VWXYZ
w van|廂型車|🚐; watch|手錶|⌚; box|箱子|📦; yo-yo|溜溜球|🪀; zebra|斑馬|🦓`],
    ['1-5', '短母音 a e i', 'Short a, e, i', '🐱', `
c a,e,i,o,u
w cat|貓|🐱|cut,cot,kit|c_t; hat|帽子|🎩|hot,hit,hut|h_t; bag|袋子|👜|bug,big,beg|b_g; bed|床|🛏️|bad,bid,bud|b_d; pen|筆|🖊️|pan,pin,pig|p_n; ten|十|🔟|tan,tin,tub|t_n; pig|豬|🐷|peg,bug,big|p_g; lip|嘴唇|👄|lap,lot,leg|l_p`],
    ['1-6', '短母音 o u', 'Short o, u', '🐶', `
c a,e,i,o,u
w dog|狗|🐶|dig,dug,log|d_g; box|箱子|📦|bus,fox,six|b_x; fox|狐狸|🦊|fix,box,six|f_x; pot|鍋子|🍲|pet,pit,put|p_t; sun|太陽|☀️|six,sat,set|s_n; bus|公車|🚌|bat,boss,box|b_s; cup|杯子|🥤|cap,cop,cut|c_p; bug|蟲|🐛|bag,big,beg|b_g`],
    ['1-7', 'sh ch th', 'sh, ch, th', '🚢', `
c sh,ch,th
w ship|船|🚢|chip,sip,shop|_ip; shell|貝殼|🐚|sell,chill,shelf|_ell; fish|魚|🐟|fist,fit,dish|fi_; chick|小雞|🐥|check,thick,stick|_ick; cheese|起司|🧀|chess,these,shoes|_eese; lunch|午餐|🍱|lung,punch,lump|lun_; thumb|大拇指|👍|some,sum,tub|_umb; bath|洗澡|🛁|bat,bad,path|ba_; three|三|3️⃣|tree,free,throw|_ree`],

    ['2-1', '顏色', 'Colors', '🎨', `
w red|紅色|🔴; blue|藍色|🔵; yellow|黃色|🟡; green|綠色|🟢; black|黑色|⚫; white|白色|⚪; orange|橘色|🟠; purple|紫色|🟣; brown|咖啡色|🟤
s It is red.|它是紅色的。|red|blue,green,black
s This is a yellow bag.|這是一個黃色的包包。|yellow|purple,white,brown
s I like green.|我喜歡綠色。|green|red,orange,black
s It is a black cat.|它是一隻黑色的貓。|black|white,blue,yellow
s This is my blue pen.|這是我的藍色筆。|blue|green,brown,purple`],
    ['2-2', '數字', 'Numbers', '🔢', `
w one|一|1️⃣; two|二|2️⃣; three|三|3️⃣; four|四|4️⃣; five|五|5️⃣; six|六|6️⃣; seven|七|7️⃣; eight|八|8️⃣; nine|九|9️⃣; ten|十|🔟
s I am ten.|我十歲。|ten|two,five,one
s I am seven.|我七歲。|seven|nine,six,three
s I have two eyes.|我有兩隻眼睛。|two|three,six,eight
s This is number eight.|這是數字八。|eight|four,nine,five
s I see five dogs.|我看到五隻狗。|five|ten,four,seven`],
    ['2-3', '動物', 'Animals', '🐾', `
w dog|狗|🐶; cat|貓|🐱; bird|鳥|🐦; fish|魚|🐟; pig|豬|🐷; duck|鴨子|🦆; rabbit|兔子|🐰; frog|青蛙|🐸; bear|熊|🐻; monkey|猴子|🐵
s This is a dog.|這是一隻狗。|dog|cat,bird,pig
s It is a bird.|牠是一隻鳥。|bird|fish,frog,bear
s I am a rabbit.|我是一隻兔子。|rabbit|monkey,duck,cat
s This is my cat.|這是我的貓。|cat|dog,pig,frog
s It is a big bear.|牠是一隻大熊。|bear|duck,fish,bird`],
    ['2-4', '家人', 'Family', '👪', `
w father|爸爸|👨; mother|媽媽|👩; brother|哥哥；弟弟|👦; sister|姊姊；妹妹|👧; grandpa|爺爺；外公|👴; grandma|奶奶；外婆|👵; baby|嬰兒|👶; family|家人|👪
s This is my mother.|這是我的媽媽。|mother|father,sister,baby
s This is my father.|這是我的爸爸。|father|grandma,mother,brother
s She is my sister.|她是我的姊姊。|sister|brother,father,grandpa
s He is my grandpa.|他是我的爺爺。|grandpa|grandma,mother,sister
s This is my family.|這是我的家人。|family|baby,father,brother`],
    ['2-5', '身體', 'My Body', '🖐️', `
w eye|眼睛|👁️; ear|耳朵|👂; nose|鼻子|👃; mouth|嘴巴|👄; hand|手|✋; foot|腳|🦶; leg|腿|🦵; hair|頭髮|💇
s This is my nose.|這是我的鼻子。|nose|ear,mouth,hand
s I have two ears.|我有兩隻耳朵。|ears|eyes,hands,legs
s This is my mouth.|這是我的嘴巴。|mouth|nose,foot,eye
s It is my hand.|它是我的手。|hand|leg,hair,ear
s I have big eyes.|我有大大的眼睛。|eyes|ears,hands,feet`],
    ['2-6', '文具', 'School Things', '✏️', `
w book|書|📖; pen|原子筆|🖊️; pencil|鉛筆|✏️; ruler|尺|📏; bag|書包|🎒; crayon|蠟筆|🖍️; chair|椅子|🪑; eraser|橡皮擦|; desk|書桌|
s This is a pencil.|這是一枝鉛筆。|pencil|pen,ruler,book
s It is my ruler.|它是我的尺。|ruler|eraser,crayon,bag
s This is a red pen.|這是一枝紅色的原子筆。|pen|book,chair,desk
s It is a new bag.|它是一個新書包。|bag|desk,pencil,crayon
s This is my desk.|這是我的書桌。|desk|chair,book,ruler`],
    ['2-7', '我是…', 'I am…', '🙋', `
w boy|男生|👦; girl|女生|👧; student|學生|🧑‍🎓; teacher|老師|🧑‍🏫; happy|開心的|😀; sad|難過的|😢; tired|累的|😴; hungry|餓的|🤤
s I am a boy.|我是男生。|boy|girl,teacher,student
s I am happy.|我很開心。|happy|sad,tired,hungry
s I am a student.|我是學生。|student|teacher,boy,girl
s I am hungry.|我肚子餓了。|hungry|happy,sad,tired
s You are my teacher.|你是我的老師。|teacher|student,girl,boy`],

    ['3-1', '食物', 'I like…', '🍎', `
w apple|蘋果|🍎; banana|香蕉|🍌; egg|蛋|🥚; milk|牛奶|🥛; cake|蛋糕|🍰; rice|飯|🍚; noodles|麵|🍜; bread|麵包|🍞; juice|果汁|🧃; water|水|💧
s I like apples.|我喜歡蘋果。|apples|bananas,eggs,noodles
s I like milk.|我喜歡牛奶。|milk|juice,water,rice
s I don't like eggs.|我不喜歡蛋。|don't|do,am,is
s I like cake and juice.|我喜歡蛋糕和果汁。|cake|bread,rice,water
s We like noodles.|我們喜歡吃麵。|noodles|apples,milk,cake`],
    ['3-2', '你喜歡嗎', 'Do you like…?', '🍕', `
w pizza|披薩|🍕; hamburger|漢堡|🍔; hot dog|熱狗|🌭; ice cream|冰淇淋|🍦; candy|糖果|🍬; chicken|雞肉|🍗; fries|薯條|🍟; salad|沙拉|🥗
s Do you like pizza?|你喜歡披薩嗎？|like|likes,liking,are
s Yes, I do.|是的，我喜歡。|do|am,like,does
s No, I don't.|不，我不喜歡。|don't|do,am,not
s Do you like salad?|你喜歡沙拉嗎？|Do|Are,Is,Am
s I like hamburgers and fries.|我喜歡漢堡和薯條。|hamburgers|salads,candies,pizzas`],
    ['3-3', '這是什麼', "What's this?", '🧸', `
w ball|球|⚽; doll|娃娃|🪆; kite|風箏|🪁; robot|機器人|🤖; car|車子|🚗; yo-yo|溜溜球|🪀; balloon|氣球|🎈; puzzle|拼圖|🧩
s What's this?|這是什麼？|What's|Who's,Where's,How's
s It's a kite.|它是一個風箏。|kite|ball,robot,car
s Is this a robot?|這是機器人嗎？|robot|doll,kite,balloon
s Yes, it is.|是的，它是。|is|am,are,do
s It's a red balloon.|它是一顆紅色的氣球。|balloon|puzzle,yo-yo,doll
s This is my new doll.|這是我的新娃娃。|doll|car,ball,robot`],
    ['3-4', '我會…', 'I can…', '🏃', `
w run|跑步|🏃; swim|游泳|🏊; sing|唱歌|🎤; dance|跳舞|💃; jump|跳|🦘; read|讀|📚; write|寫|✍️; cook|煮飯|🍳; ride a bike|騎腳踏車|🚲
s I can swim.|我會游泳。|swim|sing,cook,read
s Can you dance?|你會跳舞嗎？|Can|Do,Are,Is
s Yes, I can.|是的，我會。|can|do,am,is
s I can't fly.|我不會飛。|can't|can,am,don't
s I can ride a bike.|我會騎腳踏車。|ride|run,swim,read
s She can sing and dance.|她會唱歌和跳舞。|sing|swim,cook,write`],
    ['3-5', '天氣', 'Weather', '⛅', `
w sunny|晴朗的|☀️; rainy|下雨的|🌧️; cloudy|多雲的|☁️; windy|颳風的|🌬️; snowy|下雪的|❄️; hot|熱的|🥵; cold|冷的|🥶; weather|天氣|🌦️
s How's the weather?|天氣怎麼樣？|How's|Who's,Where's,When's
s It's sunny today.|今天天氣晴朗。|sunny|rainy,windy,snowy
s It's cold and windy.|天氣又冷又颳風。|cold|hot,sunny,cloudy
s Is it rainy?|在下雨嗎？|rainy|sunny,cloudy,snowy
s Take your umbrella.|帶你的雨傘。|umbrella|kite,ball,hat`],
    ['3-6', '衣服', 'I have…', '👕', `
w cap|棒球帽|🧢; shirt|襯衫|👕; dress|洋裝|👗; pants|褲子|👖; shoes|鞋子|👟; socks|襪子|🧦; coat|外套|🧥; gloves|手套|🧤
s I have a red cap.|我有一頂紅色的棒球帽。|cap|coat,dress,shirt
s I have new shoes.|我有新鞋子。|shoes|socks,pants,gloves
s Put on your coat.|穿上你的外套。|coat|cap,socks,dress
s She has a pink dress.|她有一件粉紅色的洋裝。|has|have,is,are
s These are my pants.|這是我的褲子。|are|is,am,be`],
    ['3-7', '在哪裡', 'Where is…?', '📍', `
w in|在…裡面|; on|在…上面|; under|在…下面|; box|箱子|📦; bed|床|🛏️; sofa|沙發|🛋️; door|門|🚪; window|窗戶|🪟; table|桌子|
s Where is the cat?|貓在哪裡？|Where|What,Who,How
s It's under the bed.|牠在床底下。|under|on,in,at
s The ball is in the box.|球在箱子裡。|in|on,under,at
s My book is on the table.|我的書在桌子上。|on|in,under,at
s The dog is under the sofa.|狗在沙發下面。|sofa|door,window,box`],

    ['4-1', '打招呼', 'Hello!', '👋', `
w morning|早上|🌅; afternoon|下午|🌇; night|晚上|🌙; name|名字|🏷️; friend|朋友|🧑‍🤝‍🧑; nice|很好的|😊; meet|見面|🤝; years old|…歲|🎂
s My name is Kevin.|我的名字是凱文。|name|friend,old,nice
s How old are you?|你幾歲？|old|name,nice,fine
s I'm nine years old.|我九歲。|years|name,morning,friend
s Nice to meet you.|很高興認識你。|meet|meets,meeting,met
s This is my friend, Amy.|這是我的朋友艾咪。|friend|name,teacher,family
r How are you?|你好嗎？|I'm fine, thank you.|I'm nine.|My name is Ben.|It's a dog.
r What's your name?|你叫什麼名字？|My name is Lily.|I'm fine.|I'm eleven.|Yes, it is.
r How old are you?|你幾歲？|I'm ten years old.|I'm fine, thanks.|My name is Tom.|It's blue.
r Nice to meet you.|很高興認識你。|Nice to meet you, too.|I'm ten.|Good night.|Yes, I can.
r Good morning, Mr. Lin.|林老師早安。|Good morning.|Good night.|I'm ten.|No, I don't.
p Amy: Hi, I'm Amy. What's your name?//Ben: My name is Ben.//Amy: How old are you, Ben?//Ben: I'm ten years old.
q How old is Ben?|班幾歲？|He is ten.|He is nine.|He is eight.|He is eleven.`],
    ['4-2', '幾點了', 'What time is it?', '⏰', `
w clock|時鐘|⏰; watch|手錶|⌚; breakfast|早餐|🥞; lunch|午餐|🍱; dinner|晚餐|🍽️; school|學校|🏫; o'clock|…點鐘|🕖; eleven|十一|🕚; twelve|十二|🕛
s What time is it?|現在幾點？|time|day,name,color
s It's seven o'clock.|現在七點。|seven|six,eight,eleven
s It's time for lunch.|午餐時間到了。|lunch|dinner,breakfast,school
s I go to school at eight.|我八點去上學。|at|in,on,for
r What time is it?|現在幾點？|It's nine o'clock.|It's Monday.|It's sunny.|It's my watch.
r Is it time for dinner?|晚餐時間到了嗎？|Yes, it is.|Yes, I do.|No, I'm not.|I'm ten.
r Let's go to school.|我們去上學吧。|OK, let's go.|I'm fine.|It's a clock.|Yes, I am.
p Mom: Wake up, Tom! It's seven o'clock.//Tom: Oh no! Is it time for school?//Mom: Yes. Eat your breakfast, please.
q What time is it?|現在幾點？|Seven o'clock.|Eight o'clock.|Six o'clock.|Twelve o'clock.`],
    ['4-3', '星期和科目', 'Days & Subjects', '📅', `
w Monday|星期一|; Friday|星期五|; Sunday|星期日|; math|數學|➗; English|英文|🔤; music|音樂|🎵; art|美術|🎨; science|自然科學|🔬; PE|體育|⚽
s What day is it today?|今天星期幾？|day|time,name,weather
s It's Friday.|今天星期五。|Friday|Monday,Sunday,Tuesday
s We have music on Monday.|我們星期一有音樂課。|on|in,at,for
s I like art. It's fun.|我喜歡美術，很好玩。|art|math,science,music
s Do you have PE today?|你今天有體育課嗎？|have|has,is,are
r What day is it today?|今天星期幾？|It's Wednesday.|It's ten o'clock.|It's rainy.|It's my book.
r Do you like math?|你喜歡數學嗎？|Yes, I do. It's fun.|Yes, I am.|It's Friday.|No, it isn't.
r What do you have on Monday?|你星期一有什麼課？|We have English and art.|I'm fine, thank you.|It's under the desk.|Yes, I can.
p Today is Monday. I have English, math and music. I like music. I can sing many songs. On Friday, I have PE. I play ball with my friends.
q What class is on Friday?|星期五有什麼課？|PE.|Music.|Art.|Science.`],
    ['4-4', '職業', 'Jobs', '🩺', `
w doctor|醫生|🩺; nurse|護理師|💉; cook|廚師|🧑‍🍳; farmer|農夫|🧑‍🌾; police officer|警察|👮; singer|歌手|🎤; driver|司機|🚕; firefighter|消防員|🧑‍🚒
s He is a doctor.|他是醫生。|He|She,It,They
s She is a nurse.|她是護理師。|She|He,It,We
s My father is a farmer.|我爸爸是農夫。|is|am,are,be
s Is she a singer?|她是歌手嗎？|singer|driver,cook,farmer
s They are police officers.|他們是警察。|are|is,am,be
r What does your mother do?|你媽媽是做什麼的？|She is a cook.|She is fine.|She is ten.|Yes, she is.
r Is he a driver?|他是司機嗎？|Yes, he is.|Yes, I am.|No, I don't.|He is happy.
r Who is she?|她是誰？|She is my teacher.|She is under the desk.|She is ten o'clock.|Yes, she can.
p This is my family. My father is a police officer. He is tall and strong. My mother is a nurse. She works with doctors. I want to be a doctor, too.
q What is the mother's job?|媽媽的工作是什麼？|A nurse.|A doctor.|A police officer.|A cook.`],
    ['4-5', '正在做什麼', 'What are you doing?', '🎬', `
w reading|正在閱讀|📖; singing|正在唱歌|🎤; sleeping|正在睡覺|😴; swimming|正在游泳|🏊; drawing|正在畫畫|🎨; cooking|正在煮飯|🍳; playing|正在玩|🎮; watching TV|正在看電視|📺
s I'm reading a book.|我正在看書。|reading|read,reads,to read
s What are you doing?|你正在做什麼？|doing|do,does,did
s She is sleeping now.|她現在正在睡覺。|is|are,am,do
s They are playing basketball.|他們正在打籃球。|are|is,am,does
s My dad is cooking dinner.|我爸爸正在煮晚餐。|cooking|cook,cooks,cooked
r What are you doing?|你在做什麼？|I'm drawing a picture.|I'm ten years old.|Yes, I am.|It's a picture.
r Is your brother sleeping?|你弟弟在睡覺嗎？|No, he's watching TV.|No, I'm not.|Yes, I do.|He is a doctor.
r What is Mom doing?|媽媽在做什麼？|She is cooking.|She is a cook.|She is my mom.|Yes, she is.
p It is Sunday afternoon. Dad is reading a book. Mom is cooking in the kitchen. My sister and I are playing a game. Our dog is sleeping on the sofa.
q What is the dog doing?|狗在做什麼？|It is sleeping.|It is reading.|It is cooking.|It is playing.`],
    ['4-6', '想要和多少', 'I want…', '🛒', `
w cookie|餅乾|🍪; toy|玩具|🧸; sticker|貼紙|⭐; notebook|筆記本|📓; money|錢|💰; dollars|元|💵; store|商店|🏪; want|想要|🙋
s I want a cookie.|我想要一塊餅乾。|want|wants,wanting,am
s How many stickers do you have?|你有幾張貼紙？|many|much,old,time
s How much is the notebook?|這本筆記本多少錢？|much|many,old,about
s It's thirty dollars.|三十元。|dollars|cookies,toys,stores
s I have twelve stickers.|我有十二張貼紙。|twelve|twenty,two,eleven
r How much is this toy?|這個玩具多少錢？|It's fifty dollars.|I have five.|It's red.|Yes, please.
r How many cookies do you want?|你想要幾塊餅乾？|Two, please.|It's ten dollars.|I'm fine.|Yes, I am.
r Can I help you?|需要幫忙嗎？|Yes, I want a notebook.|No, I'm nine.|It's Monday.|I can swim.
p Lily is at the store. She wants a notebook and a pencil. The notebook is forty dollars. The pencil is ten dollars. She has one hundred dollars.
q How much is the notebook?|筆記本多少錢？|Forty dollars.|Ten dollars.|Fifty dollars.|One hundred dollars.`],
    ['4-7', '家裡有什麼', 'There is / are', '🏠', `
w bedroom|臥室|🛏️; bathroom|浴室|🛁; kitchen|廚房|🍳; living room|客廳|🛋️; lamp|檯燈|💡; picture|圖畫|🖼️; TV|電視|📺; clock|時鐘|⏰
s There is a lamp in my bedroom.|我的臥室裡有一盞檯燈。|is|are,am,be
s There are two cats on the sofa.|沙發上有兩隻貓。|are|is,am,be
s There is a TV in the living room.|客廳裡有一台電視。|TV|lamp,bed,clock
s Is there a clock in the kitchen?|廚房裡有時鐘嗎？|there|they,their,this
s There are three pictures on the wall.|牆上有三幅畫。|pictures|picture,lamps,clocks
r Is there a bathroom here?|這裡有浴室嗎？|Yes, there is.|Yes, I am.|No, I don't.|It's five o'clock.
r How many beds are there?|有幾張床？|There are two.|There is a lamp.|It's my bed.|Yes, there are.
r Where is the TV?|電視在哪裡？|It's in the living room.|It's a TV.|It's ten dollars.|Yes, it is.
p My house is small but nice. There are two bedrooms and one bathroom. There is a big TV in the living room. There are many pictures on the wall.
q How many bedrooms are there?|有幾間臥室？|Two.|One.|Three.|Four.`],

    ['5-1', '一天的作息', 'My Day', '🌞', `
w get up|起床|⏰; brush my teeth|刷牙|🪥; eat breakfast|吃早餐|🥞; go to school|上學|🏫; do homework|寫功課|📝; take a bath|洗澡|🛁; go to bed|上床睡覺|🛏️; every day|每天|📅
s I get up at six thirty.|我六點半起床。|get|gets,getting,got
s She goes to school by bus.|她搭公車上學。|goes|go,going,gone
s He does his homework after dinner.|他晚餐後寫功課。|does|do,doing,done
s Tom takes a bath every night.|湯姆每晚洗澡。|takes|take,taking,took
r What time do you get up?|你幾點起床？|I get up at six.|I'm six years old.|It's Monday.|Yes, I do.
r How do you go to school?|你怎麼去上學？|I go by bike.|I go at seven.|I like school.|It's a bike.
p Hi, I'm Mia. I get up at six thirty every day. I brush my teeth and eat breakfast with my family. Then I go to school by bus. After school, I do my homework. I go to bed at nine.
q What time does Mia get up?|米亞幾點起床？|At six thirty.|At nine.|At seven thirty.|At eight.
q How does Mia go to school?|米亞怎麼上學？|By bus.|By bike.|On foot.|By car.
p Ken is a busy boy. He gets up at six. He walks to school with his sister. He has lunch at school. In the evening, he plays the piano for thirty minutes. Then he takes a bath and goes to bed.
q How does Ken go to school?|阿肯怎麼上學？|He walks.|He goes by bus.|He goes by car.|He rides a bike.
q What does Ken do in the evening?|阿肯晚上做什麼？|He plays the piano.|He plays basketball.|He watches TV.|He cooks dinner.`],
    ['5-2', '多常做', 'How Often', '🔁', `
w always|總是|💯; usually|通常|👍; sometimes|有時候|🤔; never|從不|🚫; weekend|週末|🗓️; park|公園|🏞️; basketball|籃球|🏀; piano|鋼琴|🎹
s I always eat breakfast.|我總是吃早餐。|always|never,sometimes,usually
s He never eats candy.|他從來不吃糖果。|never|always,usually,sometimes
s We sometimes go to the park on weekends.|我們週末有時候會去公園。|sometimes|always,never,usually
s She usually plays the piano after school.|她放學後通常會彈鋼琴。|plays|play,playing,played
s How often do you play basketball?|你多久打一次籃球？|often|many,much,old
r How often do you read books?|你多久看一次書？|I read every day.|I read a book.|I'm reading.|Yes, I do.
r What do you usually do on weekends?|你週末通常做什麼？|I usually go to the park.|I go to school by bus.|I'm fine, thanks.|It's on Sunday.
p Ben loves sports. He always plays basketball on Saturday. He usually swims on Sunday morning. He sometimes rides his bike in the park. He never watches TV on weekends.
q What does Ben do on Saturday?|班星期六做什麼？|He plays basketball.|He swims.|He watches TV.|He rides his bike.
q How often does Ben watch TV on weekends?|班週末多常看電視？|Never.|Always.|Usually.|Sometimes.
p Amy usually gets up at seven. She always drinks a glass of milk. She sometimes eats bread, and sometimes she eats rice. She never eats breakfast in the car.
q What does Amy always drink?|艾咪總是喝什麼？|Milk.|Juice.|Water.|Tea.
q Where does Amy never eat breakfast?|艾咪從不在哪裡吃早餐？|In the car.|At home.|At school.|In the park.`],
    ['5-3', '昨天在哪', 'was / were', '📸', `
w yesterday|昨天|📅; last night|昨晚|🌙; last week|上週|🗓️; zoo|動物園|🦁; museum|博物館|🏛️; beach|海灘|🏖️; excited|興奮的|🤩; sick|生病的|🤒
s I was at home yesterday.|我昨天在家。|was|am,were,is
s They were at the zoo last Sunday.|他們上週日在動物園。|were|was,are,is
s Were you sick last week?|你上週生病了嗎？|Were|Was,Are,Do
s She was excited last night.|她昨晚很興奮。|was|were,is,are
s We were not at school yesterday.|我們昨天不在學校。|were|was,are,did
r Where were you yesterday?|你昨天在哪裡？|I was at the museum.|I am at the museum.|I go to the museum.|Yes, I was.
r Was it hot yesterday?|昨天很熱嗎？|Yes, it was.|Yes, it is.|Yes, I was.|No, it doesn't.
p Yesterday was Saturday. I was at the beach with my family. The weather was sunny and hot. My brother and I were very happy. In the evening, we were tired.
q Where was the writer yesterday?|作者昨天在哪裡？|At the beach.|At the zoo.|At school.|At the museum.
q How was the weather?|天氣怎麼樣？|Sunny and hot.|Rainy and cold.|Cloudy and windy.|Snowy.
p Last week, Lucy was sick. She was not at school on Monday and Tuesday. Her friends were worried. On Wednesday, she was fine again.
q When was Lucy sick?|露西什麼時候生病？|Last week.|Yesterday.|Last night.|Last year.
q How was Lucy on Wednesday?|露西星期三怎麼樣？|She was fine.|She was sick.|She was worried.|She was at the zoo.`],
    ['5-4', '過去式 -ed', 'played, watched', '✅', `
w played|玩了；打了|⚽; watched|看了|📺; cooked|煮了|🍳; cleaned|打掃了|🧹; visited|拜訪了|🏠; walked|走了路|🚶; listened|聽了|🎧; washed|洗了|🧼
s I watched TV last night.|我昨晚看了電視。|watched|watch,watches,watching
s We played soccer yesterday.|我們昨天踢了足球。|played|play,plays,playing
s She cleaned her room last Sunday.|她上週日打掃了房間。|cleaned|cleans,clean,cleaning
s Did you visit your grandma last weekend?|你上週末有去看奶奶嗎？|Did|Do,Were,Are
s My dad washed the car this morning.|我爸爸今天早上洗了車。|washed|wash,washes,washing
r What did you do last night?|你昨晚做了什麼？|I listened to music.|I listen to music every day.|I'm listening to music.|Yes, I did.
r Did you cook dinner?|你有煮晚餐嗎？|Yes, I did.|Yes, I do.|Yes, I am.|Yes, I was.
p Last Sunday, Kevin visited his grandparents. He helped his grandma in the garden. They watered the flowers together. In the afternoon, Kevin and his grandpa played chess. Kevin had a great day.
q Who did Kevin visit?|凱文拜訪了誰？|His grandparents.|His teacher.|His friends.|His sister.
q What did Kevin and his grandpa do?|凱文和爺爺做了什麼？|They played chess.|They watched TV.|They cooked lunch.|They cleaned the car.
p Yesterday it rained all day, so Nina stayed at home. In the morning, she cleaned her room. In the afternoon, she watched a movie and cooked noodles with her mom.
q Why did Nina stay at home?|妮娜為什麼待在家？|It rained all day.|She was sick.|It was Sunday.|She had homework.
q What did Nina cook?|妮娜煮了什麼？|Noodles.|Rice.|Eggs.|Soup.`],
    ['5-5', '不規則過去式', 'went, ate, saw', '🌀', `
w went|去了|🚌; ate|吃了|🍽️; saw|看見了|👀; had|有過；度過了|🎉; bought|買了|🛍️; drank|喝了|🥤; swam|游了泳|🏊; made|做了|🧁
s We went to the night market last night.|我們昨晚去了夜市。|went|go,goes,going
s I ate a big hamburger for lunch.|我午餐吃了一個大漢堡。|ate|eat,eats,eating
s She saw a rainbow after the rain.|雨後她看見了一道彩虹。|saw|see,sees,seeing
s They bought some fruit at the market.|他們在市場買了一些水果。|bought|buy,buys,buying
s Did you have fun?|你玩得開心嗎？|have|had,has,having
r Where did you go last weekend?|你上週末去了哪裡？|I went to Taipei.|I go to Taipei.|I'm going to Taipei.|Yes, I went.
r What did you eat for breakfast?|你早餐吃了什麼？|I ate bread and eggs.|I eat bread every day.|I'm eating bread.|Yes, I ate.
p Last summer, my family went to Hualien. We swam in the sea and saw many fish. At night, we ate seafood. I bought a postcard for my best friend. It was a wonderful trip.
q Where did the family go?|這家人去了哪裡？|Hualien.|Taipei.|Yilan.|Tainan.
q What did the writer buy?|作者買了什麼？|A postcard.|A fish.|A book.|A hat.
p This morning, Leo got up late. He ran to the bus stop, but the bus went away. He walked to school. He was late for class, and he felt sad. Tomorrow he will get up early.
q Why did Leo walk to school?|阿力為什麼走路上學？|He missed the bus.|He likes walking.|His bike was broken.|It was sunny.
q How did Leo feel?|阿力覺得怎麼樣？|Sad.|Happy.|Excited.|Hungry.`],
    ['5-6', '明天要做', 'will / going to', '🔮', `
w tomorrow|明天|📆; next week|下週|🗓️; picnic|野餐|🧺; birthday party|生日派對|🎂; visit|拜訪|🏡; will|將會|🔮; plan|計畫|📝; summer vacation|暑假|🏖️
s I will visit my grandma tomorrow.|我明天會去看奶奶。|will|was,did,am
s We are going to have a picnic.|我們打算去野餐。|going|go,goes,went
s It will rain this afternoon.|今天下午會下雨。|rain|rains,rained,raining
s Are you going to swim next week?|你下週要去游泳嗎？|swim|swims,swam,swimming
s She will be ten next month.|她下個月就十歲了。|be|is,was,being
r What are you going to do tomorrow?|你明天要做什麼？|I'm going to see a movie.|I saw a movie.|I see movies every day.|Yes, I am.
r Will it be sunny tomorrow?|明天會是晴天嗎？|Yes, it will.|Yes, it was.|Yes, it does.|Yes, I will.
p Next Saturday is Jack's birthday. He is going to have a party at home. His mom will make a big chocolate cake. His friends will bring games. They are going to play in the yard.
q When is Jack's birthday?|傑克的生日是什麼時候？|Next Saturday.|Next Sunday.|Today.|Last Saturday.
q Who will make the cake?|誰會做蛋糕？|His mom.|His friends.|Jack.|His dad.
p Summer vacation is coming. Emma has a plan. She is going to read ten books. She will swim every Tuesday. In August, she will visit her uncle in Tainan.
q How many books is Emma going to read?|艾瑪打算讀幾本書？|Ten.|Two.|Five.|Twelve.
q Where is Emma going to visit her uncle?|艾瑪要去哪裡看叔叔？|In Tainan.|In Taipei.|In Yilan.|In Hualien.`],
    ['5-7', '小故事', 'Mini Stories', '📚', `
w favorite|最喜歡的|⭐; because|因為|💡; diary|日記|📔; story|故事|📚; animal|動物|🐾; learn|學習|🧠; together|一起|🤝; help|幫忙|🙌
s My favorite food is noodles.|我最喜歡的食物是麵。|favorite|happy,many,every
s I like dogs because they are friendly.|我喜歡狗，因為牠們很友善。|because|but,so,or
s We cleaned the classroom together.|我們一起打掃了教室。|together|tomorrow,yesterday,never
s Can you help me, please?|可以請你幫我嗎？|help|helps,helped,helping
s I wrote a story about my cat.|我寫了一篇關於我的貓的故事。|wrote|write,writes,writing
r Why do you like summer?|你為什麼喜歡夏天？|Because I can swim.|Yes, I like summer.|It's in July.|I'm ten.
p Dear Diary,//Today was a good day. In art class, I drew a picture of my dog, Lucky. My teacher liked it very much. After school, I played with Lucky in the park. I love him because he is always happy.
q What did the writer draw?|作者畫了什麼？|A dog.|A cat.|A park.|A teacher.
q Why does the writer love Lucky?|作者為什麼愛 Lucky？|He is always happy.|He is big.|He can sing.|He likes art.
p Sam has a little garden. He grows tomatoes and carrots. Every morning, he waters the plants. Last week, he picked ten tomatoes. His mom made tomato soup, and the family ate it together.
q What does Sam grow?|山姆種了什麼？|Tomatoes and carrots.|Apples and bananas.|Flowers.|Rice.
q What did Sam's mom make?|山姆的媽媽做了什麼？|Tomato soup.|A cake.|Carrot juice.|Noodles.`],

    ['6-1', '比一比', 'Bigger & Faster', '📏', `
w taller|比較高的|🦒; bigger|比較大的|🐘; smaller|比較小的|🐭; faster|比較快的|🐆; slower|比較慢的|🐢; heavier|比較重的|🏋️; longer|比較長的|🐍; older|年紀比較大的|👴
s An elephant is bigger than a mouse.|大象比老鼠大。|bigger|big,biggest,more big
s A turtle is slower than a rabbit.|烏龜比兔子慢。|than|then,that,to
s My brother is taller than me.|我哥哥比我高。|taller|tall,tallest,more tall
s Which is longer, the snake or the pencil?|蛇和鉛筆，哪一個比較長？|Which|What,Who,Where
s Is your bag heavier than mine?|你的書包比我的重嗎？|heavier|heavy,heaviest,more heavy
p Andy and Leo are brothers. Andy is twelve, and Leo is nine. Andy is taller than Leo, but Leo is faster. Leo can run faster than everyone in his class. Andy is better at math.
q Who is older?|誰的年紀比較大？|Andy.|Leo.|They are the same age.|Their dad.
q Who is taller?|誰比較高？|Andy.|Leo.|Everyone in Leo's class.|They are the same.
q What is Leo good at?|阿力擅長什麼？|Running.|Math.|Singing.|Swimming.
p Look at the three animals. The elephant is the biggest. The horse is smaller than the elephant, but it is bigger than the dog. The dog is the smallest, but it is very smart.
q Which animal is the smallest?|哪一種動物最小？|The dog.|The horse.|The elephant.|The cat.
q Which sentence is true?|哪一句是對的？|The horse is bigger than the dog.|The dog is bigger than the horse.|The horse is bigger than the elephant.|The elephant is the smallest.`],
    ['6-2', '季節與旅行', 'Seasons & Trips', '🧳', `
w spring|春天|🌸; summer|夏天|🍉; fall|秋天|🍂; winter|冬天|⛄; trip|旅行|🧳; mountain|山|⛰️; river|河|🏞️; hot spring|溫泉|♨️
s Summer is the hottest season in Taiwan.|夏天是臺灣最熱的季節。|hottest|hot,hotter,more hot
s We went to Jiaoxi to enjoy the hot spring.|我們去礁溪泡溫泉。|enjoy|enjoys,enjoyed,enjoying
s In fall, the leaves turn red and yellow.|秋天時，樹葉變成紅色和黃色。|turn|turns,turned,turning
s It often rains in Yilan in winter.|宜蘭冬天常常下雨。|often|never,much,many
s Which season do you like best?|你最喜歡哪個季節？|best|better,good,most
p Yilan is a beautiful place. In spring, the rice fields are green. In summer, people swim in the Dongshan River and fly kites on the beach. Winter in Yilan is cool and rainy, so many people visit the hot springs in Jiaoxi.
q What can people do in summer in Yilan?|在宜蘭夏天可以做什麼？|Swim and fly kites.|Play in the snow.|Pick apples.|Visit hot springs only.
q What is winter in Yilan like?|宜蘭的冬天怎麼樣？|Cool and rainy.|Hot and sunny.|Snowy and windy.|Warm and dry.
q Where do people go for hot springs?|人們去哪裡泡溫泉？|Jiaoxi.|Dongshan River.|The beach.|The rice fields.
p Last winter, Grace took a trip to Japan with her parents. It was very cold, and it snowed for two days. She made a snowman for the first time. She also tried hot noodle soup. She wants to go back next year.
q What did Grace do for the first time?|葛蕾絲第一次做了什麼？|She made a snowman.|She rode a bike.|She went to Taiwan.|She swam in the sea.
q How long did it snow?|下了幾天雪？|Two days.|One day.|One week.|Three days.`],
    ['6-3', '生病了', 'Feeling Sick', '🤒', `
w headache|頭痛|🤕; fever|發燒|🤒; cold|感冒|🤧; toothache|牙痛|🦷; stomachache|肚子痛|🤢; medicine|藥|💊; rest|休息|🛌; should|應該|☝️
s What's wrong with you?|你怎麼了？|wrong|right,sick,bad
s I have a headache.|我頭痛。|have|has,am,is
s You should drink more water.|你應該多喝水。|should|shouldn't,can't,won't
s She has a fever, so she stays home.|她發燒了，所以待在家。|so|but,because,or
s Don't eat too much candy.|不要吃太多糖果。|much|many,more,lot
p Peter didn't feel well this morning. He had a fever and a headache. His mother took him to see a doctor. The doctor said, "You have a cold. Take this medicine and get some rest. Drink lots of warm water." Peter stayed in bed all day.
q What was wrong with Peter?|彼得怎麼了？|He had a fever and a headache.|He had a toothache.|He hurt his leg.|He was hungry.
q What did the doctor tell him to do?|醫生要他做什麼？|Take medicine and rest.|Go to school.|Eat more candy.|Play outside.
q Where did Peter stay all day?|彼得整天待在哪裡？|In bed.|At school.|In the park.|At the hospital.
p Healthy Tips for Kids//1. Wash your hands before you eat.//2. Sleep for nine to ten hours every night.//3. Eat fruit and vegetables every day.//4. Don't play phone games for too long.
q How many hours should kids sleep?|小朋友應該睡幾個小時？|Nine to ten hours.|Five hours.|Seven hours.|Twelve hours.
q When should you wash your hands?|什麼時候應該洗手？|Before you eat.|After you sleep.|When you play games.|Before you run.`],
    ['6-4', '問路', 'Finding the Way', '🗺️', `
w left|左邊|⬅️; right|右邊|➡️; straight|直直地|⬆️; library|圖書館|📚; hospital|醫院|🏥; post office|郵局|🏤; station|車站|🚉; corner|轉角|
s Go straight and turn left.|直走然後左轉。|left|right,up,down
s The library is next to the park.|圖書館在公園旁邊。|next|front,between,behind
s The bank is between the school and the hospital.|銀行在學校和醫院中間。|between|next,behind,under
s How can I get to the station?|我要怎麼去車站？|get|got,gets,getting
s The post office is on the corner.|郵局在轉角。|corner|left,straight,right
p A: Excuse me. Where is the library?//B: Go straight on Main Street. Turn right at the second corner. The library is next to the post office. It is across from the park.
q Where should you turn right?|要在哪裡右轉？|At the second corner.|At the first corner.|At the park.|At the post office.
q What is next to the library?|圖書館旁邊是什麼？|The post office.|The park.|The hospital.|The station.
q What is across from the library?|圖書館對面是什麼？|The park.|The post office.|Main Street.|The bank.
p Luodong Station is a busy place. Walk out of the station and go straight for five minutes. You will see a big night market on your left. Many people eat snacks there in the evening.
q Where is the night market?|夜市在哪邊？|On the left.|On the right.|Inside the station.|Next to the river.
q How long do you walk?|要走多久？|Five minutes.|Fifteen minutes.|One hour.|Two minutes.`],
    ['6-5', '信件和日記', 'Letters & Emails', '✉️', `
w email|電子郵件|📧; letter|信|✉️; dear|親愛的|💌; pen pal|筆友|🧑‍🤝‍🧑; country|國家|🌏; hobby|嗜好|🎯; hope|希望|🌈; reply|回覆|
s Thank you for your email.|謝謝你的電子郵件。|for|to,with,at
s I hope to see you soon.|我希望很快能見到你。|hope|hopes,hoped,hoping
s My hobby is collecting stamps.|我的嗜好是收集郵票。|collecting|collect,collects,collected
s Please write back to me.|請回信給我。|back|front,up,out
s What is your country like?|你的國家是什麼樣子？|like|likes,look,liked
p Dear Ken,//Thank you for your email. My name is Sofia, and I live in Spain. I am eleven years old. My hobby is playing soccer. I also like to cook with my dad. What is your favorite sport? Please write back soon.//Your pen pal,//Sofia
q Where does Sofia live?|蘇菲亞住在哪裡？|In Spain.|In Taiwan.|In Japan.|In America.
q What is Sofia's hobby?|蘇菲亞的嗜好是什麼？|Playing soccer.|Drawing.|Reading.|Swimming.
q What does Sofia want Ken to do?|蘇菲亞希望阿肯做什麼？|Write back soon.|Visit Spain.|Play soccer.|Cook dinner.
p Saturday, May 10//Today I went to the library with my cousin. We borrowed six books about space. After that, we had bubble tea. I learned that the sun is a star. I want to be a scientist in the future.
q How many books did they borrow?|他們借了幾本書？|Six.|Two.|Ten.|Sixteen.
q What does the writer want to be?|作者以後想當什麼？|A scientist.|A teacher.|A doctor.|A singer.`],
    ['6-6', '公告和海報', 'Signs & Posters', '🪧', `
w poster|海報|🪧; ticket|票|🎫; open|開放的|🔓; closed|關閉的|🔒; price|價格|🏷️; lost|遺失的|❓; rule|規則|📋; free|免費的|🆓
s The museum is closed on Monday.|博物館星期一休館。|closed|close,closing,closes
s Children under six can get in for free.|六歲以下兒童免費入場。|free|price,ticket,open
s Please be quiet in the library.|在圖書館請保持安靜。|quiet|quietly,loud,noise
s Don't run in the hallway.|不要在走廊奔跑。|run|runs,running,ran
s The ticket is one hundred dollars.|門票是一百元。|ticket|poster,rule,price
p LOST CAT!//Name: Mimi//She is small and white with a black tail.//She was lost near Luodong Park on Sunday.//If you see her, please call Mrs. Wang.
q What color is Mimi?|咪咪是什麼顏色？|White with a black tail.|Black with a white tail.|Brown.|Orange and white.
q Where was Mimi lost?|咪咪在哪裡走失？|Near Luodong Park.|At school.|At the station.|In the library.
q When was Mimi lost?|咪咪什麼時候走失的？|On Sunday.|On Monday.|Yesterday morning.|Last month.
p Blue Ocean Aquarium//Open: 9:00 a.m. to 5:00 p.m.//Closed on Mondays//Tickets: Adults $300, Children $150//Kids under 3: free
q When is the aquarium closed?|水族館哪天休館？|On Mondays.|On Sundays.|At 9:00 a.m.|Every day.
q How much is a child ticket?|兒童票多少錢？|$150.|$300.|Free.|$450.`],
    ['6-7', '綜合挑戰', 'Final Challenge', '🐉', `
w festival|節日|🏮; moon|月亮|🌕; mooncake|月餅|🥮; dragon boat|龍舟|🐉; delicious|美味的|😋; famous|有名的|🌟; culture|文化|🎎; celebrate|慶祝|🎉
s People eat mooncakes at the Moon Festival.|人們在中秋節吃月餅。|eat|eats,eating,to eat
s The dragon boat race is very exciting.|龍舟比賽非常刺激。|exciting|excited,excite,excites
s This mooncake is more delicious than that one.|這個月餅比那個更好吃。|more|most,much,very
s We celebrate the festival with our family.|我們和家人一起慶祝這個節日。|celebrate|celebrates,celebrating,to celebrate
s Taipei 101 is one of the most famous buildings in Taiwan.|台北101是臺灣最有名的建築之一。|most|more,much,best
p The Dragon Boat Festival is in early summer. On this day, people watch dragon boat races on the river. Each boat has a drummer. The drummer hits the drum, and the team rows together. Families also eat rice dumplings, called zongzi.
q When is the Dragon Boat Festival?|端午節在什麼時候？|In early summer.|In winter.|In fall.|In late spring.
q What does the drummer do?|鼓手做什麼？|Hits the drum.|Rows the boat.|Makes zongzi.|Sells tickets.
q What do families eat?|家人們吃什麼？|Rice dumplings.|Mooncakes.|Ice cream.|Pizza.
p One night, a little fox was hungry. He saw some grapes on a high branch. He jumped and jumped, but he could not reach them. At last, he walked away and said, "Those grapes are sour anyway." Sometimes people say bad things about what they cannot get.
q Why did the fox jump?|狐狸為什麼跳？|He wanted the grapes.|He was playing.|He saw a dog.|He was cold.
q What is the story about?|這個故事想說什麼？|People sometimes say bad things about what they cannot get.|Foxes love grapes.|Grapes are always sour.|Jumping is good exercise.`]
  ];

  /* 關卡編號表（作業碼用）：1～42 依 RAW 順序；只能往後加 */
  var ORDER = RAW.map(function (r) { return r[0]; });

  /* 題型配方（每關 10 題） */
  var RECIPE = {
    abc: ['up2low', 'low2up', 'listenLetter', 'listenLetter', 'first', 'order', 'up2low', 'first', 'low2up', 'listenLetter'],
    phon: ['listenWord', 'listenPic', 'missing', 'pic2en', 'listenWord', 'missing', 'listenPic', 'pic2en', 'missing', 'listenWord'],
    2: ['listenPic', 'listenPic', 'pic2en', 'zh2en', 'listenPic', 'pic2en', 'zh2en', 'fill', 'fill', 'order'],
    3: ['listenPic', 'zh2en', 'listenPic', 'listenWord', 'fill', 'fill', 'order', 'meaning', 'order', 'fill'],
    4: ['listenPic', 'zh2en', 'fill', 'reply', 'fill', 'order', 'reply', 'order', 'reply', 'read'],
    5: ['zh2en', 'fill', 'fill', 'order', 'reply', 'order', 'read', 'read', 'read', 'read'],
    6: ['zh2en', 'fill', 'order', 'fill', 'order', 'read', 'read', 'read', 'read', 'read']
  };
  var FALLBACK = ['zh2en', 'listenWord', 'fill', 'meaning', 'pic2en', 'order'];
  var TYPE_ZH = {
    up2low: '字母', low2up: '字母', listenLetter: '聽字母', first: '開頭字母', order: '句子重組', missing: '拼讀',
    listenWord: '聽音選字', listenPic: '聽音選圖', pic2en: '看圖選字', zh2en: '看中文選英文', fill: '填空', meaning: '句子意思',
    reply: '對話', read: '閱讀理解', abcOrder: '字母順序'
  };

  var ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var CONF = {
    b: 'dpqh', d: 'bpqa', p: 'qbdg', q: 'pgdb', m: 'nwuh', n: 'mhuv', u: 'nvwy', w: 'vmuy', i: 'jlt', j: 'ilg', l: 'itj',
    h: 'nbk', a: 'oed', e: 'cao', o: 'aec', c: 'eos', g: 'qyj', y: 'vgj', v: 'wyu', s: 'zcx', z: 'sxn', f: 'tlk', t: 'fli', k: 'xhy', x: 'kzy', r: 'nvf'
  };
  var CONF_U = {
    B: 'DPRE', D: 'BOPQ', P: 'RBDF', Q: 'OGPD', M: 'NWHV', N: 'MHZV', U: 'VWJO', W: 'VMNU', I: 'JLT', J: 'ILG', L: 'ITJ',
    H: 'NAK', A: 'HRV', E: 'FBP', O: 'QCD', C: 'GOE', G: 'CQO', Y: 'VXT', V: 'WYU', S: 'ZCX', Z: 'SNX', F: 'EPT', T: 'FIL', K: 'XHR', X: 'KYZ', R: 'PBK'
  };

  /* ================= 解析 ================= */
  function parseStage(r, idx) {
    var st = { id: r[0], name: r[1], en: r[2], icon: r[3], no: idx + 1, lv: +r[0].charAt(0), words: [], sents: [], replies: [], pass: [] };
    r[4].split('\n').forEach(function (line) {
      line = line.trim(); if (!line) return;
      var k = line.charAt(0), v = line.slice(2);
      if (k === 'L') st.letters = v.trim().split('');
      else if (k === 'c') st.chunks = v.split(',');
      else if (k === 'w') v.split(';').forEach(function (x) {
        var a = x.split('|').map(function (s) { return s.trim(); });
        if (!a[0]) return;
        st.words.push({ en: a[0], zh: a[1], emo: a[2] || '', conf: a[3] ? a[3].split(',') : null, mask: a[4] || '' });
      });
      else if (k === 's') { var b = v.split('|'); st.sents.push({ en: b[0], zh: b[1], ans: b[2], ds: b[3].split(',') }); }
      else if (k === 'r') { var c = v.split('|'); st.replies.push({ q: c[0], zh: c[1], ans: c[2], ds: c.slice(3) }); }
      else if (k === 'p') st.pass.push({ t: v.replace(/\/\//g, '\n'), qs: [] });
      else if (k === 'q') { var d = v.split('|'); st.pass[st.pass.length - 1].qs.push({ q: d[0], zh: d[1], ans: d[2], ds: d.slice(3) }); }
    });
    st.kind = st.letters ? 'abc' : st.chunks ? 'phon' : 'lv' + st.lv;
    return st;
  }
  var STAGES = RAW.map(parseStage);
  var BYID = {}; STAGES.forEach(function (s) { BYID[s.id] = s; });
  function stagesOf(n) { return STAGES.filter(function (s) { return s.lv === n; }); }

  /* ================= 小工具 ================= */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function uniq(a) { var o = [], seen = {}; a.forEach(function (x) { if (!seen[x]) { seen[x] = 1; o.push(x); } }); return o; }
  function stripP(w) { return w.replace(/[.,!?"]+$/g, '').replace(/^["]+/, ''); }
  function letterSay(L) { return L + '.'; }

  // 選項：ans + ds（取前 3 個不重複）→ 打亂
  function mkOpts(ans, ds, n) {
    n = n || 4;
    var pool = uniq(ds.filter(function (d) { return d !== ans; }));
    var o = [ans].concat(pool.slice(0, n - 1));
    if (o.length < 2) return null;
    o = shuffle(o);
    return { opts: o, a: o.indexOf(ans) };
  }

  /* ================= 出題 ================= */
  function makeQuiz(st) {
    var recipe = st.kind === 'abc' ? RECIPE.abc : st.kind === 'phon' ? RECIPE.phon : RECIPE[st.lv];
    var bags = {};
    function bag(name, src) { if (!bags[name]) bags[name] = shuffle(src); return bags[name]; }
    var readQ = [];
    shuffle(st.pass).forEach(function (p) { p.qs.forEach(function (q) { readQ.push({ p: p, q: q }); }); });
    var emoW = st.words.filter(function (w) { return w.emo; });

    var G = {
      up2low: function () {
        var L = bag('up', st.letters).pop(); if (!L) return null;
        var lo = L.toLowerCase();
        var ds = (CONF[lo] || '').split('').concat(shuffle(ABC.toLowerCase().split('')));
        var o = mkOpts(lo, ds); return o && { type: 'up2low', prompt: '大寫 ' + L + ' 的小寫是哪一個？', big: L, opts: o.opts, a: o.a, say: null, exp: L + ' 的小寫是 ' + lo + '。', key: 'u' + L, sayAns: letterSay(L) };
      },
      low2up: function () {
        var L = bag('low', st.letters).pop(); if (!L) return null;
        var lo = L.toLowerCase();
        var ds = (CONF_U[L] || '').split('').concat(shuffle(ABC.split('')));
        var o = mkOpts(L, ds); return o && { type: 'low2up', prompt: '小寫 ' + lo + ' 的大寫是哪一個？', big: lo, opts: o.opts, a: o.a, exp: lo + ' 的大寫是 ' + L + '。', key: 'l' + L, sayAns: letterSay(L) };
      },
      listenLetter: function () {
        var L = bag('ll', st.letters).pop(); if (!L) return null;
        var ds = shuffle(st.letters).concat((CONF_U[L] || '').split(''), shuffle(ABC.split('')));
        var o = mkOpts(L, ds); return o && { type: 'listenLetter', prompt: '聽一聽，是哪個字母？', say: letterSay(L), opts: o.opts, a: o.a, exp: '唸的是字母 ' + L + '（小寫 ' + L.toLowerCase() + '）。', key: 'h' + L };
      },
      first: function () {
        var src = st.words.filter(function (w, i) { return st.letters[i] && w.en.charAt(0).toUpperCase() === st.letters[i]; });
        var w = bag('first', src).pop(); if (!w) return null;
        var f = w.en.charAt(0);
        var ds = shuffle(st.letters.map(function (x) { return x.toLowerCase(); })).concat((CONF[f] || '').split(''));
        var o = mkOpts(f, ds); return o && { type: 'first', prompt: '聽一聽，' + w.zh + '的英文是哪個字母開頭？', emo: w.emo, big: '_' + w.en.slice(1), say: w.en, opts: o.opts, a: o.a, exp: w.en + '（' + w.zh + '）是 ' + f + ' 開頭。', key: 'f' + w.en };
      },
      order: function () {
        if (st.kind === 'abc') {
          var L = bag('ord', st.letters.filter(function (x) { var i = ABC.indexOf(x); return i > 0 && i < 25; })).pop(); if (!L) return null;
          var i = ABC.indexOf(L);
          var ds = [ABC[i + 2] || ABC[i - 2], ABC[i - 1 - 1] || 'A', (CONF_U[L] || 'XYZ').charAt(0), ABC[(i + 5) % 26]];
          var o = mkOpts(L, ds); return o && { type: 'abcOrder', prompt: '字母順序：中間缺哪一個？', big: ABC[i - 1] + '　＿　' + ABC[i + 1], opts: o.opts, a: o.a, exp: ABC[i - 1] + '、' + L + '、' + ABC[i + 1] + '。', key: 'o' + L, sayAns: letterSay(L) };
        }
        var s = bag('order', st.sents).pop(); if (!s) return null;
        var toks = s.en.split(' ');
        if (toks.length < 2) return null;
        var sh = toks.map(function (t, i) { return { t: t, i: i }; }), k = 0;
        do { sh = shuffle(sh); k++; } while (k < 20 && sh.map(function (x) { return x.t; }).join(' ') === s.en);
        return { type: 'order', prompt: '把句子排好：' + s.zh, zh: s.zh, tokens: sh, answer: s.en, exp: s.en + '　' + s.zh, sayAns: s.en, key: 's' + s.en };
      },
      missing: function () {
        var w = bag('miss', st.words.filter(function (x) { return x.mask; })).pop(); if (!w) return null;
        var i = w.mask.indexOf('_'), len = w.en.length - w.mask.length + 1, ch = w.en.substr(i, len);
        var o = mkOpts(ch, shuffle(st.chunks)); return o && { type: 'missing', prompt: '看圖聽一聽，空格要填哪個？', emo: w.emo, big: w.mask.replace('_', '＿'), say: w.en, opts: o.opts, a: o.a, exp: w.en + '（' + w.zh + '）：' + w.mask.replace('_', ch) + '。', key: 'm' + w.en };
      },
      listenWord: function () {
        var w = bag('lw', st.words).pop(); if (!w) return null;
        var ds = (w.conf || []).concat(shuffle(st.words).map(function (x) { return x.en; }));
        var o = mkOpts(w.en, ds); return o && { type: 'listenWord', prompt: '聽一聽，是哪一個字？', say: w.en, opts: o.opts, a: o.a, exp: w.en + '＝' + w.zh, key: 'w' + w.en };
      },
      listenPic: function () {
        if (emoW.length < 4) return null;
        var w = bag('lp', emoW).pop(); if (!w) return null;
        var o = mkOpts(w.emo, shuffle(emoW).map(function (x) { return x.emo; })); return o && { type: 'listenPic', prompt: '聽一聽，選出正確的圖。', say: w.en, opts: o.opts, a: o.a, emoOpts: true, exp: w.en + '＝' + w.zh + ' ' + w.emo, key: 'p' + w.en };
      },
      pic2en: function () {
        if (emoW.length < 4) return null;
        var w = bag('pe', emoW).pop(); if (!w) return null;
        var o = mkOpts(w.en, shuffle(emoW).map(function (x) { return x.en; })); return o && { type: 'pic2en', prompt: '這張圖的英文是？', emo: w.emo, opts: o.opts, a: o.a, exp: w.emo + ' ' + w.en + '＝' + w.zh, sayAns: w.en, key: 'e' + w.en };
      },
      zh2en: function () {
        var w = bag('ze', st.words).pop(); if (!w) return null;
        var o = mkOpts(w.en, shuffle(st.words).map(function (x) { return x.en; })); return o && { type: 'zh2en', prompt: '「' + w.zh + '」的英文是？', opts: o.opts, a: o.a, exp: w.zh + '＝' + w.en, sayAns: w.en, key: 'z' + w.en };
      },
      fill: function () {
        var s = bag('fill', st.sents).pop(); if (!s) return null;
        var toks = s.en.split(' '), hit = -1;
        for (var i = 0; i < toks.length; i++) if (stripP(toks[i]) === s.ans) { hit = i; break; }
        if (hit < 0) return null;
        var tail = toks[hit].slice(s.ans.length);
        toks[hit] = '＿＿' + tail;
        var o = mkOpts(s.ans, s.ds); return o && { type: 'fill', prompt: '選出空格的字：' + s.zh, zh: s.zh, big: toks.join(' '), bigEn: true, opts: o.opts, a: o.a, exp: s.en + '　' + s.zh, sayAns: s.en, key: 'f' + s.en };
      },
      meaning: function () {
        if (st.sents.length < 4) return null;
        var s = bag('mean', st.sents).pop(); if (!s) return null;
        var o = mkOpts(s.zh, shuffle(st.sents).map(function (x) { return x.zh; })); return o && { type: 'meaning', prompt: '這句英文是什麼意思？', big: s.en, bigEn: true, say: s.en, noAuto: true, opts: o.opts, a: o.a, zhOpts: true, exp: s.en + '＝' + s.zh, key: 'n' + s.en };
      },
      reply: function () {
        var r = bag('reply', st.replies).pop(); if (!r) return null;
        var o = mkOpts(r.ans, r.ds); return o && { type: 'reply', prompt: '最好的回答是哪一個？（' + r.zh + '）', big: r.q, bigEn: true, say: r.q, noAuto: true, opts: o.opts, a: o.a, exp: r.q + ' → ' + r.ans, sayAns: r.ans, key: 'r' + r.q };
      },
      read: function () {
        var x = readQ.shift(); if (!x) return null;
        var o = mkOpts(x.q.ans, x.q.ds); return o && { type: 'read', prompt: x.q.zh, passage: x.p.t, big: x.q.q, bigEn: true, say: null, opts: o.opts, a: o.a, exp: x.q.q + ' → ' + x.q.ans, sayAns: x.q.ans, key: 'd' + x.q.q };
      }
    };

    var out = [], keys = {};
    recipe.forEach(function (t) {
      var q = G[t](), tries = 0;
      while ((!q || keys[q.key]) && tries < 12) {
        var alt = FALLBACK[tries % FALLBACK.length];
        if (st.kind === 'abc') alt = ['up2low', 'low2up', 'listenLetter', 'first'][tries % 4];
        q = G[alt](); tries++;
      }
      if (q && !keys[q.key]) { keys[q.key] = 1; out.push(q); }
    });
    return out;
  }

  /* ================= CSS ================= */
  var CSS = '' +
    '.cfx-el{max-width:1100px;margin:0 auto;color:var(--ink);-webkit-tap-highlight-color:transparent}' +
    '.cfx-el *{box-sizing:border-box}' +
    '.cfx-el .el-card{background:var(--paper,#fff);border:2px solid var(--line);border-radius:var(--r-l,22px);padding:14px;box-shadow:var(--shadow,0 4px 14px rgba(0,0,0,.08));margin-bottom:14px}' +
    '.cfx-el .el-sub{color:var(--muted);font-size:14px;font-weight:700;margin:0 0 6px}' +
    '.cfx-el .btn{min-height:46px}' +
    '.cfx-el .el-top{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between}' +
    '.cfx-el .el-top .tot{font-weight:900;font-size:16px}' +
    '.cfx-el .el-banner{display:flex;flex-wrap:wrap;gap:10px;align-items:center;border-radius:18px;padding:12px 14px;margin-bottom:14px;background:color-mix(in srgb,var(--gold,#FFB703) 18%,var(--paper,#fff));border:2px solid color-mix(in srgb,var(--gold,#FFB703) 55%,transparent)}' +
    '.cfx-el .el-banner .t{flex:1 1 220px;font-weight:800;line-height:1.5}' +
    '.cfx-el .el-banner .t small{display:block;color:var(--muted);font-weight:700}' +
    '.cfx-el .el-banner .btn{flex:0 0 auto}' +
    '.cfx-el .el-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,330px),1fr));gap:14px}' +
    '.cfx-el .el-lv{background:var(--paper,#fff);border:2px solid var(--line);border-radius:var(--r-l,22px);padding:12px 12px 6px;box-shadow:var(--shadow,0 4px 14px rgba(0,0,0,.08));position:relative;overflow:hidden}' +
    '.cfx-el .el-lv:before{content:"";position:absolute;left:0;top:0;right:0;height:6px;background:var(--c)}' +
    '.cfx-el .el-lv.sug{border-color:var(--c);box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 30%,transparent),var(--shadow,0 4px 14px rgba(0,0,0,.08))}' +
    '.cfx-el .el-lvh{display:flex;align-items:center;gap:10px;margin-top:4px}' +
    '.cfx-el .el-lvh .ic{width:44px;height:44px;flex:0 0 44px;border-radius:14px;background:color-mix(in srgb,var(--c) 18%,var(--paper,#fff));display:flex;align-items:center;justify-content:center;font-size:24px}' +
    '.cfx-el .el-lvh b{display:block;font-size:17px;line-height:1.25}' +
    '.cfx-el .el-lvh small{display:block;color:var(--muted);font-weight:700;font-size:12.5px;line-height:1.35}' +
    '.cfx-el .el-lvh .cnt{margin-left:auto;font-weight:900;font-size:13px;white-space:nowrap;color:var(--muted)}' +
    '.cfx-el .el-path{position:relative;height:216px;margin-top:6px}.cfx-el .el-lv.sug .el-path{margin-top:26px}' +
    '.cfx-el .el-path svg{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible}' +
    '.cfx-el .el-path path{fill:none;stroke:color-mix(in srgb,var(--c) 45%,var(--line));stroke-width:6;stroke-linecap:round;stroke-dasharray:2 12}' +
    '.cfx-el .el-node{position:absolute;width:80px;margin-left:-40px;display:flex;flex-direction:column;align-items:center;gap:1px;background:none;border:0;padding:0;font:inherit;color:var(--ink);cursor:pointer;touch-action:manipulation}' +
    '.cfx-el .el-node .o{width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;background:var(--paper,#fff);border:3px solid color-mix(in srgb,var(--c) 55%,var(--line));box-shadow:0 4px 0 color-mix(in srgb,var(--c) 35%,var(--line));position:relative}' +
    '.cfx-el .el-node.done .o{background:color-mix(in srgb,var(--c) 22%,var(--paper,#fff));border-color:var(--c)}' +
    '.cfx-el .el-node .o i{position:absolute;right:-6px;top:-6px;font-style:normal;font-size:11px;font-weight:900;background:var(--c);color:#fff;border-radius:999px;padding:1px 6px;line-height:1.5}' +
    '.cfx-el .el-node .nm{font-size:12px;font-weight:800;line-height:1.2;max-width:80px;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.cfx-el .el-node .st{font-size:12px;letter-spacing:1px;color:var(--gold,#FFB703);line-height:1}' +
    '.cfx-el .el-node .st .off{color:var(--line)}' +
    '.cfx-el .el-node:focus-visible .o{outline:3px solid var(--ink);outline-offset:3px}' +
    '.cfx-el .el-pin{position:absolute;top:-30px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:11.5px;font-weight:900;background:#D9483B;color:#fff;border-radius:999px;padding:2px 8px;z-index:2}' +
    '.cfx-el .el-pin:after{content:"";position:absolute;left:50%;bottom:-5px;margin-left:-5px;border:5px solid transparent;border-bottom:0;border-top-color:#D9483B}' +
    '.cfx-el.anim .el-pin{animation:elBob 1.6s ease-in-out infinite}' +
    '@keyframes elBob{50%{transform:translate(-50%,-4px)}}' +
    /* 學一學 */
    '.cfx-el .el-hd{display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap}' +
    '.cfx-el .el-hd .ttl{flex:1 1 180px;font-weight:900;font-size:18px;line-height:1.3}' +
    '.cfx-el .el-hd .ttl small{display:block;font-size:13px;color:var(--muted)}' +
    '.cfx-el .el-words{display:grid;grid-template-columns:repeat(auto-fill,minmax(98px,1fr));gap:8px}' +
    '.cfx-el .el-w{min-height:88px;border-radius:16px;border:2px solid var(--line);background:var(--paper2,#f6fbf9);font:inherit;color:var(--ink);cursor:pointer;padding:6px 4px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;touch-action:manipulation}' +
    '.cfx-el .el-w .e{font-size:28px;line-height:1.1}' +
    '.cfx-el .el-w b{font-size:16px;line-height:1.2;word-break:break-word;text-align:center}' +
    '.cfx-el .el-w small{font-size:12px;color:var(--muted);font-weight:700;text-align:center;line-height:1.25}' +
    '.cfx-el .el-w .hl{color:#D9483B}' +
    '.cfx-el .el-pats{margin-top:12px;display:grid;gap:8px}' +
    '.cfx-el .el-pat{display:flex;align-items:center;gap:10px;border-radius:14px;border:2px dashed var(--line);padding:6px 6px 6px 12px;min-height:52px}' +
    '.cfx-el .el-pat div{flex:1;min-width:0}' +
    '.cfx-el .el-pat b{display:block;font-size:16.5px;line-height:1.3;overflow-wrap:anywhere}' +
    '.cfx-el .el-pat small{color:var(--muted);font-weight:700;font-size:13px}' +
    '.cfx-el .el-say{flex:0 0 46px;width:46px;height:46px;min-height:46px;border-radius:50%;border:2px solid var(--line);background:var(--paper,#fff);font-size:20px;cursor:pointer;padding:0;touch-action:manipulation}' +
    '.cfx-el .el-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}' +
    '.cfx-el .el-row .btn{flex:1 1 150px}' +
    /* 答題 */
    '.cfx-el .el-qtop{display:flex;align-items:center;gap:10px;margin-bottom:10px}' +
    '.cfx-el .el-qtop .btn{flex:0 0 46px;width:46px;padding:0}' +
    '.cfx-el .el-dots{flex:1;display:flex;gap:4px}' +
    '.cfx-el .el-dots i{flex:1;height:10px;border-radius:999px;background:var(--line)}' +
    '.cfx-el .el-dots i.ok{background:#2E9E5B}.cfx-el .el-dots i.bad{background:#D9483B}.cfx-el .el-dots i.cur{background:var(--c,#1A86A8)}' +
    '.cfx-el .el-qn{font-weight:900;font-size:14px;white-space:nowrap;color:var(--muted)}' +
    '.cfx-el .el-qbox{text-align:center}' +
    '.cfx-el .el-tag{display:inline-block;font-size:12px;font-weight:900;border-radius:999px;padding:2px 10px;background:color-mix(in srgb,var(--c,#1A86A8) 16%,var(--paper,#fff));color:var(--ink);margin-bottom:6px}' +
    '.cfx-el .el-prompt{font-weight:800;font-size:17px;line-height:1.45;margin:0 0 8px}' +
    '.cfx-el .el-emo{font-size:64px;line-height:1.15}' +
    '.cfx-el .el-big{font-size:clamp(22px,6.4vw,34px);font-weight:900;line-height:1.3;margin:4px 0 8px;overflow-wrap:anywhere}' +
    '.cfx-el .el-big.en{font-size:clamp(20px,5.4vw,28px)}' +
    '.cfx-el .el-passage{text-align:left;white-space:pre-line;background:var(--paper2,#f6fbf9);border:2px solid var(--line);border-radius:16px;padding:10px 12px;font-size:16.5px;line-height:1.65;margin:0 0 10px;position:relative;overflow-wrap:anywhere}' +
    '.cfx-el .el-passage .el-say{float:right;margin:0 0 4px 8px}' +
    '.cfx-el .el-bigsay{width:76px;height:76px;min-height:76px;border-radius:50%;border:3px solid var(--c,#1A86A8);background:color-mix(in srgb,var(--c,#1A86A8) 12%,var(--paper,#fff));font-size:34px;cursor:pointer;margin:2px auto 10px;display:flex;align-items:center;justify-content:center;touch-action:manipulation}' +
    '.cfx-el .el-opts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:6px}' +
    '.cfx-el .el-opts.long{grid-template-columns:1fr}' +
    '@media (min-width:760px){.cfx-el .el-opts.emo{grid-template-columns:repeat(4,1fr)}.cfx-el .el-opts.long{grid-template-columns:1fr 1fr}}' +
    '.cfx-el .el-opt{min-height:58px;border-radius:16px;border:2px solid var(--line);background:var(--paper,#fff);font:inherit;font-weight:900;font-size:19px;color:var(--ink);cursor:pointer;padding:8px 10px;box-shadow:0 3px 0 var(--line);touch-action:manipulation;overflow-wrap:anywhere;line-height:1.3}' +
    '.cfx-el .el-opts.emo .el-opt{font-size:44px;min-height:84px}' +
    '.cfx-el .el-opts.long .el-opt{font-size:16.5px;text-align:left}' +
    '.cfx-el .el-opt:active{transform:translateY(2px);box-shadow:0 1px 0 var(--line)}' +
    '.cfx-el .el-opt.ok{background:#2E9E5B;border-color:#2E9E5B;color:#fff;box-shadow:0 3px 0 #1E6E3F}' +
    '.cfx-el .el-opt.bad{background:#D9483B;border-color:#D9483B;color:#fff;box-shadow:0 3px 0 #9B2C22}' +
    '.cfx-el .el-opt[disabled]{cursor:default}' +
    '.cfx-el .el-ans{min-height:64px;border:3px dashed var(--line);border-radius:16px;padding:8px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;margin-bottom:10px}' +
    '.cfx-el .el-ans.ok{border-color:#2E9E5B;border-style:solid}.cfx-el .el-ans.bad{border-color:#D9483B;border-style:solid}' +
    '.cfx-el .el-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;min-height:50px}' +
    '.cfx-el .el-chip{min-height:46px;min-width:46px;border-radius:12px;border:2px solid var(--line);background:var(--paper,#fff);font:inherit;font-weight:900;font-size:18px;color:var(--ink);padding:6px 12px;cursor:pointer;box-shadow:0 3px 0 var(--line);touch-action:manipulation}' +
    '.cfx-el .el-chip.in{background:color-mix(in srgb,var(--c,#1A86A8) 16%,var(--paper,#fff));border-color:var(--c,#1A86A8)}' +
    '.cfx-el .el-chip.used{visibility:hidden}' +
    '.cfx-el .el-fb{margin-top:12px;border-radius:16px;padding:10px 12px;font-weight:800;text-align:left;display:flex;gap:10px;align-items:center}' +
    '.cfx-el .el-fb.ok{background:color-mix(in srgb,#2E9E5B 14%,var(--paper,#fff));border:2px solid #2E9E5B}' +
    '.cfx-el .el-fb.bad{background:color-mix(in srgb,#D9483B 12%,var(--paper,#fff));border:2px solid #D9483B}' +
    '.cfx-el .el-fb div{flex:1;min-width:0;overflow-wrap:anywhere;line-height:1.45}' +
    '.cfx-el .el-fb small{display:block;font-weight:700;color:var(--muted)}' +
    '.cfx-el .el-next{width:100%;margin-top:10px;font-size:18px}' +
    '.cfx-el.anim .el-qbox.pop{animation:elPop .25s ease}' +
    '.cfx-el.anim .el-qbox.shake{animation:elShake .3s ease}' +
    '@keyframes elPop{50%{transform:scale(1.03)}}' +
    '@keyframes elShake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}' +
    '@media (min-width:900px){.cfx-el .el-quiz{max-width:760px;margin:0 auto}}' +
    /* 結果 */
    '.cfx-el .el-res{text-align:center}' +
    '.cfx-el .el-res .big{font-size:54px;font-weight:900;line-height:1}' +
    '.cfx-el .el-res .stars{font-size:40px;letter-spacing:6px;color:var(--gold,#FFB703);margin:6px 0}' +
    '.cfx-el .el-res .stars .off{color:var(--line)}' +
    '.cfx-el .el-miss{text-align:left;margin:10px 0 0;padding:0;list-style:none}' +
    '.cfx-el .el-miss li{border-top:1px dashed var(--line);padding:8px 0;font-weight:700;line-height:1.45;overflow-wrap:anywhere}' +
    '.cfx-el .el-miss small{color:var(--muted)}' +
    '.cfx-el.rm *{animation:none!important;transition:none!important}';

  /* ================= 畫面 ================= */
  function render(el, api) {
    api = api || {};
    var rm = !!api.reducedMotion;
    var store = function (k) { try { return api.store ? api.store(k) : null; } catch (e) { return null; } };
    var storeSet = function (k, v) { try { if (api.storeSet) api.storeSet(k, v); } catch (e) {} };
    var speak = function (t) { try { if (api.speak && t) api.speak(t, 'en'); } catch (e) {} };
    var stopSpeak = function () { try { if (api.stopSpeak) api.stopSpeak(); } catch (e) {} };
    var beep = function (ok) { try { if (api.beep) api.beep(ok); } catch (e) {} };
    var Z = function (t) { try { return api.Z ? api.Z(t) : esc(t); } catch (e) { return esc(t); } };

    var style = document.createElement('style'); style.textContent = CSS;
    var root = document.createElement('div'); root.className = 'cfx-el' + (rm ? ' rm' : ' anim');
    el.appendChild(style); el.appendChild(root);

    var keyHandler = null, timers = [];
    function later(f, ms) { timers.push(setTimeout(f, ms)); }
    function clearAll() {
      timers.forEach(clearTimeout); timers = [];
      if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
      stopSpeak();
    }
    function prog() { return store('p') || {}; }
    function readSuggest() {
      try { var s = JSON.parse(localStorage.getItem(SUGGEST_KEY) || 'null'); if (s && s.lv >= 1 && s.lv <= 6) return s; } catch (e) {}
      return null;
    }
    function suggestStage(lv) {
      var p = prog(), list = stagesOf(lv);
      for (var i = 0; i < list.length; i++) if (!p[list[i].id]) return list[i];
      return list[0];
    }
    function starHTML(n) { var h = ''; for (var i = 0; i < 3; i++) h += i < n ? '★' : '<span class="off">★</span>'; return h; }
    function scrollTop() { try { root.scrollIntoView({ block: 'start', behavior: 'auto' }); } catch (e) {} }

    /* ---------- 地圖 ---------- */
    function map(focusLv) {
      clearAll();
      var p = prog(), sug = readSuggest(), fresh = false;
      if (sug && sug.fresh) { fresh = true; try { sug.fresh = false; localStorage.setItem(SUGGEST_KEY, JSON.stringify(sug)); } catch (e) {} }
      var sugSt = sug ? suggestStage(sug.lv) : null;
      var total = 0; STAGES.forEach(function (s) { total += p[s.id] || 0; });
      var h = '';
      if (sug) {
        var dd = (sug.d || '').split('-');
        h += '<div class="el-banner"><div class="t">📍 ' + Z('程度檢測建議：從 Level ' + sug.lv + ' 開始') +
          '<small>' + Z((dd.length === 3 ? dd[1] + '/' + dd[2] + ' 的檢測結果・' : '') + '每一關都可以自由選，不用照順序') + '</small></div>' +
          '<button class="btn primary" data-go="' + sugSt.id + '">▶ ' + Z('從這裡開始') + '</button>' +
          '<button class="btn" data-test>🔄 ' + Z('重新檢測') + '</button></div>';
      } else {
        h += '<div class="el-banner"><div class="t">🧭 ' + Z('不知道從哪一級開始？') +
          '<small>' + Z('先做 10 分鐘「英文程度檢測」，會幫你標出建議起點。所有關卡都可以直接玩。') + '</small></div>' +
          '<button class="btn primary" data-test>📝 ' + Z('去做程度檢測') + '</button></div>';
      }
      h += '<div class="el-top" style="margin-bottom:10px"><span class="tot">⭐ ' + total + ' / ' + (STAGES.length * 3) + '</span><span class="el-sub" style="margin:0">' + Z('6 級 × 7 關，每關 10 題，點一關就能開始') + '</span></div>';
      h += '<div class="el-grid">';
      LEVELS.forEach(function (L) {
        var list = stagesOf(L.n), got = 0;
        list.forEach(function (s) { got += p[s.id] || 0; });
        var isSug = sug && sug.lv === L.n;
        h += '<section class="el-lv' + (isSug ? ' sug' : '') + '" data-lv="' + L.n + '" style="--c:' + L.c + '">';
        h += '<div class="el-lvh"><span class="ic" aria-hidden="true">' + L.icon + '</span><div><b>Level ' + L.n + '　' + Z(L.name) + '</b><small>' + Z(L.desc) + '</small></div><span class="cnt">⭐ ' + got + '/' + (list.length * 3) + '</span></div>';
        // 路線：上排左→右、下排右→左
        var n = list.length, top = Math.ceil(n / 2), pos = [];
        for (var i = 0; i < n; i++) {
          if (i < top) pos.push([(i + 0.5) / top * 100, 44]);
          else { var j = i - top, bot = n - top; pos.push([(1 - (j + 0.5) / top) * 100 - (top - bot) * 0 , 150]); }
        }
        var d = 'M' + pos[0][0] + ' ' + pos[0][1];
        for (var k = 1; k < n; k++) {
          if (k === top) d += ' C' + (pos[k - 1][0] + 14) + ' ' + pos[k - 1][1] + ' ' + (pos[k][0] + 14) + ' ' + pos[k][1] + ' ' + pos[k][0] + ' ' + pos[k][1];
          else d += ' L' + pos[k][0] + ' ' + pos[k][1];
        }
        h += '<div class="el-path"><svg viewBox="0 0 100 216" preserveAspectRatio="none" aria-hidden="true"><path d="' + d + '" vector-effect="non-scaling-stroke"/></svg>';
        list.forEach(function (s, i2) {
          var stars = p[s.id] || 0;
          h += '<button class="el-node' + (stars ? ' done' : '') + '" data-go="' + s.id + '" style="left:' + pos[i2][0] + '%;top:' + (pos[i2][1] - 31) + 'px" aria-label="Level ' + s.id + ' ' + esc(s.name) + '，' + stars + ' 顆星">';
          h += '<span class="o">' + (sugSt && sugSt.id === s.id ? '<span class="el-pin">' + Z('建議從這裡開始') + '</span>' : '') + s.icon + '<i>' + s.id + '</i></span>';
          h += '<span class="nm">' + Z(s.name) + '</span><span class="st" aria-hidden="true">' + starHTML(stars) + '</span></button>';
        });
        h += '</div></section>';
      });
      h += '</div>';
      root.innerHTML = h;
      root.querySelectorAll('[data-go]').forEach(function (b) { b.onclick = function () { learn(BYID[b.dataset.go]); }; });
      root.querySelectorAll('[data-test]').forEach(function (b) { b.onclick = function () { location.hash = '#/tools/engtest'; }; });
      var f = focusLv || (fresh && sug ? sug.lv : 0);
      if (f) {
        var sec = root.querySelector('[data-lv="' + f + '"]');
        if (sec) later(function () { try { sec.scrollIntoView({ block: 'center', behavior: rm ? 'auto' : 'smooth' }); } catch (e) {} }, 60);
      }
    }

    /* ---------- 學一學 ---------- */
    function learn(st) {
      clearAll();
      var L = LEVELS[st.lv - 1];
      root.style.setProperty('--c', L.c);
      storeSet('last', st.id);
      var best = prog()[st.id] || 0;
      var h = '<div class="el-card" style="--c:' + L.c + '">';
      h += '<div class="el-hd"><button class="btn" data-map aria-label="回地圖">← ' + Z('地圖') + '</button><div class="ttl">' + st.icon + ' Level ' + st.id + '　' + Z(st.name) + '<small>' + esc(st.en) + '・' + Z('第 ' + st.no + ' 關') + (best ? '・' + starHTML(best) : '') + '</small></div></div>';
      h += '<p class="el-sub">📘 ' + Z('學一學：點卡片聽發音，看完再開始挑戰 10 題！') + '</p>';
      h += '<div class="el-words">';
      if (st.kind === 'abc') {
        st.letters.forEach(function (Lt, i) {
          var w = st.words[i];
          h += '<button class="el-w" data-say="' + esc(letterSay(Lt) + (w ? ' ' + w.en : '')) + '"><b style="font-size:24px">' + Lt + ' ' + Lt.toLowerCase() + '</b>' + (w ? '<span class="e">' + w.emo + '</span><small>' + esc(w.en) + '・' + Z(w.zh) + '</small>' : '') + '</button>';
        });
      } else {
        st.words.forEach(function (w) {
          var en = esc(w.en);
          if (w.mask) { var i = w.mask.indexOf('_'), len = w.en.length - w.mask.length + 1; en = esc(w.en.slice(0, i)) + '<span class="hl">' + esc(w.en.substr(i, len)) + '</span>' + esc(w.en.slice(i + len)); }
          h += '<button class="el-w" data-say="' + esc(w.en) + '">' + (w.emo ? '<span class="e">' + w.emo + '</span>' : '') + '<b>' + en + '</b><small>' + Z(w.zh) + '</small></button>';
        });
      }
      h += '</div>';
      var pats = [];
      if (st.kind === 'abc') pats.push({ en: st.letters.join(' '), zh: '字母順序唸一次' });
      else if (st.kind === 'phon') pats.push({ en: st.words.slice(0, 4).map(function (w) { return w.en; }).join(', '), zh: '紅色的部分是這一關要練的聲音' });
      st.sents.slice(0, st.lv >= 4 ? 2 : 3).forEach(function (s) { pats.push(s); });
      st.replies.slice(0, 2).forEach(function (r) { pats.push({ en: r.q + ' — ' + r.ans, zh: r.zh, say: r.q + ' ' + r.ans }); });
      if (pats.length) {
        h += '<p class="el-sub" style="margin-top:12px">💬 ' + Z('句型') + '</p><div class="el-pats">';
        pats.forEach(function (s) { h += '<div class="el-pat"><div><b>' + esc(s.en) + '</b><small>' + Z(s.zh) + '</small></div><button class="el-say" data-say="' + esc(s.say || s.en) + '" aria-label="唸出來">🔊</button></div>'; });
        h += '</div>';
      }
      if (st.pass.length) h += '<p class="el-sub" style="margin-top:12px">📖 ' + Z('這一關有短文閱讀，慢慢讀、可以按 🔊 聽') + '</p>';
      h += '<div class="el-row"><button class="btn" data-all>🔊 ' + Z('全部唸一次') + '</button><button class="btn primary" data-start>▶ ' + Z('開始挑戰') + '</button></div>';
      h += '</div>';
      root.innerHTML = h;
      scrollTop();
      root.querySelectorAll('[data-say]').forEach(function (b) { b.onclick = function () { speak(b.dataset.say); }; });
      root.querySelector('[data-map]').onclick = function () { map(st.lv); };
      root.querySelector('[data-all]').onclick = function () {
        var t = st.kind === 'abc' ? st.letters.map(letterSay).join(' ') : st.words.map(function (w) { return w.en; }).join(', ');
        speak(t);
      };
      root.querySelector('[data-start]').onclick = function () { quiz(st); };
    }

    /* ---------- 答題 ---------- */
    function quiz(st) {
      clearAll();
      var L = LEVELS[st.lv - 1];
      var qs = makeQuiz(st), idx = 0, res = [];
      root._el = { st: st, qs: qs };

      function show() {
        clearAll();
        var q = qs[idx];
        var h = '<div class="el-quiz" style="--c:' + L.c + '"><div class="el-qtop"><button class="btn" data-x aria-label="離開這關">✕</button><div class="el-dots" aria-hidden="true">';
        qs.forEach(function (_, i) { h += '<i class="' + (i < idx ? (res[i] ? 'ok' : 'bad') : i === idx ? 'cur' : '') + '"></i>'; });
        h += '</div><span class="el-qn">' + (idx + 1) + ' / ' + qs.length + '</span></div>';
        h += '<div class="el-card el-qbox" data-qbox><span class="el-tag">' + Z(TYPE_ZH[q.type] || '') + '</span>';
        if (q.passage) h += '<div class="el-passage"><button class="el-say" data-say="' + esc(q.passage) + '" aria-label="唸短文">🔊</button>' + esc(q.passage) + '</div>';
        h += '<p class="el-prompt">' + Z(q.prompt) + '</p>';
        if (q.emo) h += '<div class="el-emo" aria-hidden="true">' + q.emo + '</div>';
        if (q.say && !q.big) h += '<button class="el-bigsay" data-say="' + esc(q.say) + '" aria-label="再聽一次">🔊</button>';
        if (q.big) h += '<div class="el-big' + (q.bigEn ? ' en' : '') + '">' + esc(q.big) + (q.say ? ' <button class="el-say" data-say="' + esc(q.say) + '" aria-label="唸出來" style="vertical-align:middle">🔊</button>' : '') + '</div>';
        if (q.type === 'order') {
          h += '<div class="el-ans" data-ans aria-live="polite"></div><div class="el-chips" data-chips>';
          q.tokens.forEach(function (t, i) { h += '<button class="el-chip" data-tk="' + i + '">' + esc(t.t) + '</button>'; });
          h += '</div><div class="el-row"><button class="btn" data-clear>↺ ' + Z('重排') + '</button><button class="btn primary" data-check disabled>✔ ' + Z('確定') + '</button></div>';
        } else {
          var longOpt = q.opts.some(function (o) { return String(o).length > 14; }) || q.zhOpts;
          h += '<div class="el-opts' + (q.emoOpts ? ' emo' : '') + (longOpt ? ' long' : '') + '">';
          q.opts.forEach(function (o, i) { h += '<button class="el-opt" data-o="' + i + '">' + (q.zhOpts ? Z(o) : esc(o)) + '</button>'; });
          h += '</div>';
        }
        h += '<div data-fb></div></div></div>';
        root.innerHTML = h;
        scrollTop();
        var $ = function (s) { return root.querySelector(s); };
        root.querySelectorAll('[data-say]').forEach(function (b) { b.onclick = function () { speak(b.dataset.say); }; });
        $('[data-x]').onclick = function () { learn(st); };
        if (q.say && !q.noAuto) later(function () { speak(q.say); }, 250);
        var done = false;
        function finish(ok, picked) {
          if (done) return; done = true;
          res[idx] = ok; beep(ok);
          var box = $('[data-qbox]'); box.classList.remove('pop', 'shake'); void box.offsetWidth; box.classList.add(ok ? 'pop' : 'shake');
          if (q.type !== 'order') {
            root.querySelectorAll('.el-opt').forEach(function (b, i) { b.disabled = true; if (i === q.a) b.classList.add('ok'); else if (i === picked) b.classList.add('bad'); });
          }
          var fb = '<div class="el-fb ' + (ok ? 'ok' : 'bad') + '"><span style="font-size:26px">' + (ok ? '🎉' : '💡') + '</span><div>' + Z(ok ? '答對了！' : '再看一次正確答案：') + '<small>' + esc(q.exp) + '</small></div>' +
            (q.sayAns || q.say ? '<button class="el-say" data-say2 aria-label="唸出來">🔊</button>' : '') + '</div>' +
            '<button class="btn primary el-next" data-next>' + (idx + 1 < qs.length ? Z('下一題') + ' ▶' : Z('看結果') + ' 🏁') + '</button>';
          $('[data-fb]').innerHTML = fb;
          var s2 = $('[data-say2]'); if (s2) s2.onclick = function () { speak(q.sayAns || q.say); };
          if (!ok && q.sayAns) later(function () { speak(q.sayAns); }, 300);
          $('[data-next]').onclick = next;
          try { $('[data-next]').focus({ preventScroll: true }); } catch (e) {}
          try { $('[data-fb]').scrollIntoView({ block: 'nearest', behavior: rm ? 'auto' : 'smooth' }); } catch (e) {}
        }
        function next() { idx++; if (idx < qs.length) show(); else result(); }
        if (q.type === 'order') {
          var seq = [], ans = $('[data-ans]'), chk = $('[data-check]');
          var drawAns = function () {
            ans.innerHTML = seq.map(function (i, k) { return '<button class="el-chip in" data-rm="' + k + '">' + esc(q.tokens[i].t) + '</button>'; }).join('');
            root.querySelectorAll('[data-tk]').forEach(function (b) { b.classList.toggle('used', seq.indexOf(+b.dataset.tk) >= 0); });
            ans.querySelectorAll('[data-rm]').forEach(function (b) { b.onclick = function () { if (done) return; seq.splice(+b.dataset.rm, 1); drawAns(); }; });
            chk.disabled = seq.length !== q.tokens.length;
          };
          root.querySelectorAll('[data-tk]').forEach(function (b) { b.onclick = function () { if (done) return; var i = +b.dataset.tk; if (seq.indexOf(i) < 0) { seq.push(i); drawAns(); } }; });
          $('[data-clear]').onclick = function () { if (done) return; seq = []; drawAns(); };
          chk.onclick = function () {
            if (done) return;
            var said = seq.map(function (i) { return q.tokens[i].t; }).join(' ');
            var ok = said === q.answer;
            ans.classList.add(ok ? 'ok' : 'bad');
            chk.disabled = true; $('[data-clear]').disabled = true;
            root.querySelectorAll('.el-chip').forEach(function (b) { b.disabled = true; });
            finish(ok);
          };
        } else {
          root.querySelectorAll('[data-o]').forEach(function (b) { b.onclick = function () { var i = +b.dataset.o; finish(i === q.a, i); }; });
        }
        keyHandler = function (e) {
          if (e.ctrlKey || e.metaKey || e.altKey) return;
          if (done && (e.key === 'Enter' || e.key === ' ')) { var nb = $('[data-next]'); if (nb && document.activeElement !== nb) { e.preventDefault(); nb.click(); } return; }
          if (!done && q.type !== 'order' && /^[1-4]$/.test(e.key)) { var b = root.querySelector('[data-o="' + (+e.key - 1) + '"]'); if (b) b.click(); }
        };
        document.addEventListener('keydown', keyHandler);
      }

      function result() {
        clearAll();
        var ok = res.filter(Boolean).length, n = qs.length;
        var stars = ok >= 9 ? 3 : ok >= 7 ? 2 : ok >= 5 ? 1 : 0;
        var p = prog(), old = p[st.id] || 0;
        if (stars > old) { p[st.id] = stars; storeSet('p', p); }
        var rd = store('rd') || {};
        if (rd.day !== today()) rd = { day: today(), ids: [] };
        var first = stars > 0 && rd.ids.indexOf(st.id) < 0;
        if (first) { rd.ids.push(st.id); storeSet('rd', rd); }
        var got = null;
        // 作業模式要「玩完就呼叫 reward」才算完成；今天已拿過星的關卡送 0 星
        try { if (api.reward) got = api.reward({ stars: first ? stars : 0, xp: ok, reason: '英文闖關 ' + st.id + ' 答對 ' + ok + ' 題' }); } catch (e) {}
        if (stars === 3) { try { if (api.confetti && !rm) api.confetti(); } catch (e) {} }
        var nextSt = STAGES[STAGES.indexOf(st) + 1];
        var msg = ok === n ? '全對！太厲害了！' : stars === 3 ? '好棒！快要全對了！' : stars >= 1 ? '不錯喔！再挑戰一次可以拿更多星星。' : '先回去「學一學」，再試一次一定更好！';
        var h = '<div class="el-card el-res" style="--c:' + L.c + '"><p class="el-sub">Level ' + st.id + '　' + Z(st.name) + '</p>';
        h += '<div class="big">' + ok + ' / ' + n + '</div><div class="stars" aria-label="' + stars + ' 顆星">' + starHTML(stars) + '</div>';
        h += '<p style="font-weight:900;font-size:18px;margin:4px 0">' + Z(msg) + '</p>';
        if (first && stars) h += '<p class="el-sub">⭐ ' + Z('今天這關得到 ' + stars + ' 顆星') + '</p>';
        else if (stars) h += '<p class="el-sub">' + Z('這關今天已經拿過星星了，明天再來可以再拿！') + '</p>';
        if (old && stars > old) h += '<p class="el-sub">🎉 ' + Z('刷新這關的最佳紀錄！') + '</p>';
        var miss = qs.filter(function (_, i) { return !res[i]; });
        if (miss.length) {
          h += '<ul class="el-miss"><li style="border:0;padding-bottom:0"><b>❗ ' + Z('錯的題目再看一次') + '</b></li>';
          miss.forEach(function (q) { h += '<li>' + esc(q.exp) + '</li>'; });
          h += '</ul>';
        }
        h += '<div class="el-row"><button class="btn" data-again>🔄 ' + Z('再玩一次') + '</button>' + (nextSt ? '<button class="btn primary" data-nx>' + Z('下一關') + ' ▶</button>' : '') + '<button class="btn" data-map>🗺️ ' + Z('回地圖') + '</button></div></div>';
        root.innerHTML = h;
        scrollTop();
        root.querySelector('[data-again]').onclick = function () { quiz(st); };
        root.querySelector('[data-map]').onclick = function () { map(st.lv); };
        if (nextSt) root.querySelector('[data-nx]').onclick = function () { learn(nextSt); };
      }
      show();
    }

    // 進入點：作業模式直接開關卡
    var hw = null; try { hw = api.hw; } catch (e) {}
    var hwN = hw && +hw.level > 0 ? +hw.level : 0;
    if (hwN && STAGES[hwN - 1]) learn(STAGES[hwN - 1]);
    else map();
    return function () { clearAll(); };
  }

  (window.CFX = window.CFX || []).push({
    id: 'englevel',
    title: '英文分級闖關',
    icon: '🗺️',
    grades: [1, 2, 3, 4, 5, 6],
    subject: '英語',
    desc: '字母到短文 6 級 42 關，聽說讀一起練',
    render: render,
    _t: { LEVELS: LEVELS, STAGES: STAGES, ORDER: ORDER, makeQuiz: makeQuiz, SUGGEST_KEY: SUGGEST_KEY }
  });
})();
