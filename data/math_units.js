/* 由 數學快速出題/index.html 抽出的出題程式（只保留國小單元），不要手改：
   重跑 啟賦小學堂/build.py 會重新抽並重新裁切（見 trim_elem.py）。 */
/* ================= 亂數與數學小工具 ================= */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let R=Math.random;
const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
const rnz=(a,b)=>{let v;do v=ri(a,b);while(v===0);return v};
const pick=a=>a[Math.floor(R()*a.length)];
const sgn=()=>R()<.5?-1:1;
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b]}return a};
const lcm=(a,b)=>a/gcd(a,b)*b;
const P=x=>x<0?`(${x})`:`${x}`;
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

function F(n,d=1){if(d<0){n=-n;d=-d}const g=gcd(n,d)||1;return{n:n/g,d:d/g}}
const fadd=(a,b)=>F(a.n*b.d+b.n*a.d,a.d*b.d), fsub=(a,b)=>F(a.n*b.d-b.n*a.d,a.d*b.d),
      fmul=(a,b)=>F(a.n*b.n,a.d*b.d), fdiv=(a,b)=>F(a.n*b.d,a.d*b.n);
const ftex=f=>f.d===1?`${f.n}`:(f.n<0?`-\\frac{${-f.n}}{${f.d}}`:`\\frac{${f.n}}{${f.d}}`);
const fP=f=>f.n<0?`\\left(${ftex(f)}\\right)`:ftex(f);
function mixtex(f){const s=f.n<0?'-':'',N=Math.abs(f.n),w=Math.floor(N/f.d),r=N%f.d;return r?`${s}${w}\\frac{${r}}{${f.d}}`:`${s}${w}`}
/* 依序印出多項式各項：[[係數,'x^2'],[係數,'x'],[係數,'']] */
function poly(terms){let s='';for(const [c,v] of terms){if(c===0)continue;const ab=Math.abs(c);const body=v?(ab===1?v:ab+v):String(ab);s+=s===''?(c<0?'-':'')+body:(c<0?' - ':' + ')+body}return s||'0'}
const lin=(a,b,v='x')=>poly([[a,v],[b,'']]);
const quad=(a,b,c)=>poly([[a,'x^2'],[b,'x'],[c,'']]);
const dec1=p=>p%10===0?String(p/10):`${Math.floor(p/10)}.${p%10}`;
const commas=s=>s.replace(/\B(?=(\d{3})+(?!\d))/g,'{,}');
function sqrtSimp(n){for(let i=Math.floor(Math.sqrt(n));i>=2;i--)if(n%(i*i)===0)return[i,n/(i*i)];return[1,n]}
function rad(k,m){if(m===1)return`${k}`;if(k===1)return`\\sqrt{${m}}`;if(k===-1)return`-\\sqrt{${m}}`;return`${k}\\sqrt{${m}}`}
const isSq=n=>Number.isInteger(Math.sqrt(n));
const roots2=(a,b)=>a===b?`$x = ${a}$（重根）`:`$x = ${a}$ 或 $x = ${b}$`;

/* ================= 題型產生器 =================
   每個單元的 gen(難度) 回傳 {q:題目, a:答案}，字串裡 $…$ 為數學式；回傳 null 代表重抽。 */
const U=[];
const unit=o=>U.push(o);

function powTerm(maxB,maxE){const b=ri(2,maxB),e=ri(2,maxE),t=ri(0,2);
  if(t===0)return{t:`(-${b})^{${e}}`,v:(-b)**e,lead:false};
  if(t===1)return{t:`-${b}^{${e}}`,v:-(b**e),lead:true};
  return{t:`${b}^{${e}}`,v:b**e,lead:false}}
function factorTex(n){const ps=[];let m=n;for(let p=2;p*p<=m;p++){let e=0;while(m%p===0){m/=p;e++}if(e)ps.push(e>1?`${p}^{${e}}`:`${p}`)}if(m>1)ps.push(`${m}`);return ps}
function rf(){const d=pick([2,3,4,5,6,8,9,10,12]);let n;do n=rnz(-2*d+1,2*d-1);while(n%d===0);return F(n,d)}
const sys=(e1,e2)=>`\\begin{cases} ${e1} \\\\ ${e2} \\end{cases}`;
const eqxy=(a,b,c)=>`${poly([[a,'x'],[b,'y']])} = ${c}`;
const OPS=['>','<','\\geqq','\\leqq'],FLIP={'>':'<','<':'>','\\geqq':'\\leqq','\\leqq':'\\geqq'};
const fac=(a,b)=>`(${lin(a,b)})`;
function facPair(a,b,c,dd){const f1=fac(a,b),f2=fac(c,dd);return f1===f2?`${f1}^2`:f1+f2}
const deg=x=>`${x}^{\\circ}`, seg=s=>`\\overline{${s}}`;
const TRI=[[3,4,5],[5,12,13],[8,15,17],[7,24,25]];
const triple=(maxK=3)=>{const [a,b,c]=pick(TRI),k=ri(1,maxK);return[a*k,b*k,c*k]};
const half=x2=>x2%2?(x2/2).toFixed(1):String(x2/2);
const pt=(x,y)=>`(${x}, ${y})`;

function vform(a,h,k){const base=h===0?'x^2':`(${lin(1,-h)})^2`,pre=a===1?'':a===-1?'-':String(a);return`y = ${pre}${base}${k===0?'':k>0?` + ${k}`:` - ${-k}`}`}
function twoDice(test){let c=0;for(let i=1;i<=6;i++)for(let j=1;j<=6;j++)if(test(i,j))c++;return F(c,36)}
/* ---------- 幾何附圖題：依題目的真實角度與長度畫 SVG ---------- */
const V=(x,y)=>({x,y});
const vadd=(p,q)=>V(p.x+q.x,p.y+q.y), vsub=(p,q)=>V(p.x-q.x,p.y-q.y), vmul=(p,k)=>V(p.x*k,p.y*k);
const vlen=p=>Math.hypot(p.x,p.y), vunit=p=>vmul(p,1/vlen(p)), vlerp=(p,q,t)=>V(p.x+(q.x-p.x)*t,p.y+(q.y-p.y)*t);
const f1=n=>Math.round(n*10)/10, RAD=Math.PI/180;
const polar=(c,r,a)=>V(c.x+r*Math.cos(a*RAD),c.y-r*Math.sin(a*RAD));       // 數學角度，螢幕 y 向下
const centroid=ps=>vmul(ps.reduce((s,p)=>vadd(s,p),V(0,0)),1/ps.length);
/* 把以數學座標（y 向上）建好的點等比縮放進 w×h 的畫框 */
function fitPts(ps,w,h,pad=16){const xs=ps.map(p=>p.x),ys=ps.map(p=>p.y),x0=Math.min(...xs),y0=Math.min(...ys),dx=Math.max(...xs)-x0||1,dy=Math.max(...ys)-y0||1;
  const s=Math.min((w-2*pad)/dx,(h-2*pad)/dy),ox=(w-dx*s)/2,oy=(h-dy*s)/2;return ps.map(p=>V(ox+(p.x-x0)*s,h-oy-(p.y-y0)*s))}
function Fig(w,h,cls=''){const parts=[];const api={
  line(p,q,o=''){parts.push(`<line x1="${f1(p.x)}" y1="${f1(p.y)}" x2="${f1(q.x)}" y2="${f1(q.y)}" ${o}/>`);return api},
  poly(ps,o=''){parts.push(`<polygon points="${ps.map(p=>f1(p.x)+','+f1(p.y)).join(' ')}" fill="none" ${o}/>`);return api},
  circle(c,r,o=''){parts.push(`<circle cx="${f1(c.x)}" cy="${f1(c.y)}" r="${f1(r)}" fill="none" ${o}/>`);return api},
  dot(p,r=1.6){parts.push(`<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${r}" fill="currentColor" stroke="none"/>`);return api},
  text(p,s,it=false,size){parts.push(`<text x="${f1(p.x)}" y="${f1(p.y)}" text-anchor="middle" dominant-baseline="central"${it?' class="it"':''}${size?` font-size="${size}"`:''}>${s}</text>`);return api},
  label(p,from,s,d=8){return api.text(vadd(p,vmul(vunit(vsub(p,from)),d)),s,true)},
  angle(X,A,B,s,r=11,gap=9){const u1=vunit(vsub(A,X)),u2=vunit(vsub(B,X)),cr=u1.x*u2.y-u1.y*u2.x,p1=vadd(X,vmul(u1,r)),p2=vadd(X,vmul(u2,r));
    parts.push(`<path d="M${f1(p1.x)} ${f1(p1.y)} A${r} ${r} 0 0 ${cr>0?1:0} ${f1(p2.x)} ${f1(p2.y)}" fill="none" stroke-width=".8"/>`);
    if(s!=null)api.text(vadd(X,vmul(vunit(vadd(u1,u2)),r+gap)),s,s==='x');return api},
  right(X,A,B,s=6){const u1=vmul(vunit(vsub(A,X)),s),u2=vmul(vunit(vsub(B,X)),s),ps=[vadd(X,u1),vadd(vadd(X,u1),u2),vadd(X,u2)];
    parts.push(`<polyline points="${ps.map(p=>f1(p.x)+','+f1(p.y)).join(' ')}" fill="none" stroke-width=".8"/>`);return api},
  tick(p,q,n=1){const m=vlerp(p,q,.5),u=vunit(vsub(q,p)),nv=V(-u.y,u.x);for(let i=0;i<n;i++){const c=vadd(m,vmul(u,(i-(n-1)/2)*3));api.line(vadd(c,vmul(nv,3.5)),vadd(c,vmul(nv,-3.5)),'stroke-width=".9"')}return api},
  seg(p,q,s,center,d=8){const m=vlerp(p,q,.5),u=vunit(vsub(q,p));let nv=V(-u.y,u.x);if((m.x-center.x)*nv.x+(m.y-center.y)*nv.y<0)nv=vmul(nv,-1);return api.text(vadd(m,vmul(nv,d)),s,s==='x')},
  sub(p,base,idx){parts.push(`<text x="${f1(p.x)}" y="${f1(p.y)}" text-anchor="middle" dominant-baseline="central" class="it">${base}<tspan font-size="7" dy="2.5" font-style="normal">${idx}</tspan></text>`);return api},
  raw(s){parts.push(s);return api},
  svg(){return`<svg class="fig ${cls}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">${parts.join('')}</svg>`}
};return api}
const radOf=n=>rad(...sqrtSimp(n));
const ang=v=>`${v}°`;

function shoelace2(P){let s=0;for(let i=0;i<P.length;i++){const [x1,y1]=P[i],[x2,y2]=P[(i+1)%P.length];s+=x1*y2-x2*y1}return Math.abs(s)}
/* ---------- 國小一、二年級 ---------- */
// 畫時鐘：h 點 m 分（時針會依分鐘偏移）
function e12_clock(h,m){const f=Fig(130,130),O=V(65,65),r=56;f.circle(O,r,'stroke-width="2"');
  for(let i=0;i<60;i++){const a=90-i*6;f.line(polar(O,r,a),polar(O,r-(i%5?3:6),a),i%5?'stroke-width=".6"':'stroke-width="1.4"')}
  for(let n=1;n<=12;n++)f.text(polar(O,r-14,90-n*30),String(n),false,11);
  f.line(O,polar(O,29,90-((h%12)+m/60)*30),'stroke-width="4"').line(O,polar(O,44,90-m*6),'stroke-width="2.2"').dot(O,3);
  return f.svg()}
const e12_hm=(h,m)=>m?`${h} 點 ${m} 分`:`${h} 點`;
const e12_h12=h=>((h-1)%12+12)%12+1;
function e12_two(v){const a=Math.floor(v/100),b=v%100;return a&&b?`$${a}$ 公尺 $${b}$ 公分`:a?`$${a}$ 公尺`:`$${b}$ 公分`}

/* ===== 一年級 ===== */
unit({id:'e1-add',g:'小一',name:'20 以內的加法',instr:'算算看。',h:[12,14,20],gen(d){
  if(d===1){const a=ri(1,9),b=ri(1,10-a);if(b<1)return null;return{q:`$${a} + ${b} =$`,a:`$${a+b}$`}}
  if(d===2){if(R()<.6){const a=ri(2,9),b=ri(11-a,9);if(b<2)return null;return{q:`$${a} + ${b} =$`,a:`$${a+b}$`}}
    const a=ri(11,18),b=ri(1,19-a);if(a%10+b>9)return null;return{q:`$${a} + ${b} =$`,a:`$${a+b}$`}}
  const a=ri(3,12),b=ri(2,20-a);if(a+b>20||b<2)return null;
  return pick([{q:`小明有 $${a}$ 顆彈珠，哥哥又給他 $${b}$ 顆，小明現在有幾顆？`,a:`$${a+b}$ 顆`},
               {q:`樹上有 $${a}$ 隻小鳥，又飛來 $${b}$ 隻，樹上現在有幾隻？`,a:`$${a+b}$ 隻`},
               {q:`妹妹摺了 $${a}$ 隻紙鶴，姐姐摺了 $${b}$ 隻，兩人一共摺了幾隻？`,a:`$${a+b}$ 隻`}]);
}});

unit({id:'e1-sub',g:'小一',name:'20 以內的減法',instr:'算算看。',h:[12,14,20],gen(d){
  if(d===1){const a=ri(2,10),b=ri(1,a-1);return{q:`$${a} - ${b} =$`,a:`$${a-b}$`}}
  if(d===2){const a=ri(11,18),b=ri(a%10+1,9);if(a-b>9||a-b<1)return null;return{q:`$${a} - ${b} =$`,a:`$${a-b}$`}}
  const a=ri(8,20),b=ri(2,a-1);
  return pick([{q:`盤子裡有 $${a}$ 個蘋果，吃掉 $${b}$ 個，還剩幾個？`,a:`$${a-b}$ 個`},
               {q:`哥哥有 $${a}$ 張貼紙，弟弟有 $${b}$ 張，哥哥比弟弟多幾張？`,a:`$${a-b}$ 張`},
               {q:`公車上有 $${a}$ 個人，到站下車 $${b}$ 個人，車上還有幾個人？`,a:`$${a-b}$ 人`}]);
}});

unit({id:'e1-num',g:'小一',name:'100 以內的數',instr:'依題意作答。',h:[12,14,18],gen(d){
  if(d===1){const t=ri(1,9),o=ri(0,9);
    return R()<.5?{q:`$${t}$ 個十和 $${o}$ 個一是多少？`,a:`$${10*t+o}$`}:{q:`$${10*t+o}$ 是幾個十和幾個一？`,a:`$${t}$ 個十和 $${o}$ 個一`}}
  if(d===2){const f=ri(0,2);
    if(f===0){const a=ri(10,99),b=ri(10,99);if(a===b)return null;return{q:`在 ○ 裡填入 $>$ 或 $<$：$${a}$ ○ $${b}$`,a:`$${a} ${a>b?'>':'<'} ${b}$`}}
    if(f===1){const a=ri(11,98);return R()<.5?{q:`比 $${a}$ 多 $1$ 的數是多少？`,a:`$${a+1}$`}:{q:`比 $${a}$ 少 $1$ 的數是多少？`,a:`$${a-1}$`}}
    const a=ri(10,97);return{q:`$${a}$ 和 $${a+2}$ 中間的數是多少？`,a:`$${a+1}$`}}
  const f=ri(0,1);
  if(f===0){const x=ri(1,9),y=ri(1,9);if(x===y)return null;const hi=Math.max(x,y),lo=Math.min(x,y);
    return{q:`用 $${x}$、$${y}$ 兩張數字卡排成二位數，最大是多少？最小是多少？`,a:`最大 $${hi}${lo}$，最小 $${lo}${hi}$`}}
  const s=new Set();while(s.size<4)s.add(ri(10,99));const arr=[...s];
  return{q:`由小到大排排看：$${arr.join('、')}$`,a:`$${[...arr].sort((p,q)=>p-q).join(' < ')}$`};
}});

unit({id:'e1-clock',g:'小一',name:'認識時鐘（整點、半點）（附圖）',instr:'看時鐘回答。',h:[40,40,42],gen(d){
  const h=ri(1,12),half=d===1?false:(d===2?true:R()<.5),m=half?30:0;
  const say=(hh)=>half?`${hh} 點半`:`${hh} 點`;
  if(d<=2)return{q:'如圖，現在是幾點？',a:say(h),fig:e12_clock(h,m),k:`${h}:${m}`};
  const n=ri(1,5);return{q:`如圖，再過 $${n}$ 小時是幾點？`,a:say(e12_h12(h+n)),fig:e12_clock(h,m),k:`${h}:${m}+${n}`};
}});

unit({id:'e1-money',g:'小一',name:'認識錢幣',instr:'依題意作答。',h:[14,16,22],gen(d){
  if(d===1){const c=[[50,ri(0,1)],[10,ri(0,4)],[5,ri(0,1)],[1,ri(0,4)]].filter(x=>x[1]>0);if(c.length<2)return null;
    return{q:`${c.map(([v,n])=>`$${n}$ 個 $${v}$ 元`).join('、')}，一共是多少元？`,a:`$${c.reduce((s,[v,n])=>s+v*n,0)}$ 元`}}
  if(d===2){const pay=pick([10,50,100]),p=ri(Math.ceil(pay*0.2),pay-1);
    const it=pick([['個','橡皮擦'],['枝','鉛筆'],['張','貼紙'],['個','麵包']]);return{q:`一${it[0]}${it[1]} $${p}$ 元，付了 $${pay}$ 元，要找回多少元？`,a:`$${pay-p}$ 元`}}
  const x=ri(12,99);let r=x;const parts=[];let cnt=0;
  for(const v of [50,10,5,1]){const n=Math.floor(r/v);r-=n*v;if(n){parts.push(`$${n}$ 個 $${v}$ 元`);cnt+=n}}
  return{q:`要付 $${x}$ 元，最少要用幾個錢幣？（有 $1$ 元、$5$ 元、$10$ 元、$50$ 元）`,a:`${parts.join('、')}，共 $${cnt}$ 個`};
}});

/* ===== 二年級 ===== */
unit({id:'e2-addsub2',g:'小二',name:'二位數的加減',instr:'算算看。',h:[14,16,22],gen(d){
  if(d===1){if(R()<.5){const a=ri(10,88),b=ri(10,99-a);if(a%10+b%10>9)return null;return{q:`$${a} + ${b}$`,a:`$${a+b}$`}}
    const a=ri(20,99),b=ri(10,a-1);if(a%10<b%10)return null;return{q:`$${a} - ${b}$`,a:`$${a-b}$`}}
  if(d===2){if(R()<.5){const a=ri(15,89),b=ri(15,89);if(a%10+b%10<10)return null;return{q:`$${a} + ${b}$`,a:`$${a+b}$`}}
    const a=ri(30,99),b=ri(11,a-5);if(a%10>=b%10)return null;return{q:`$${a} - ${b}$`,a:`$${a-b}$`}}
  const a=ri(20,60),b=ri(5,a-3),c=ri(5,30);
  return pick([{q:`公車上有 $${a}$ 人，到站下車 $${b}$ 人，又上車 $${c}$ 人，車上現在有幾人？`,a:`$${a-b+c}$ 人`},
               {q:`$${a} - ${b} + ${c}$`,a:`$${a-b+c}$`},
               {q:`小美有 $${a}$ 元，買文具花了 $${b}$ 元，媽媽又給她 $${c}$ 元，小美現在有多少元？`,a:`$${a-b+c}$ 元`}]);
}});

unit({id:'e2-table',g:'小二',name:'九九乘法',instr:'算算看。',h:[12,14,20],gen(d){
  const a=ri(2,9),b=ri(2,9);
  if(d===1)return{q:`$${a} \\times ${b} =$`,a:`$${a*b}$`};
  if(d===2)return R()<.5?{q:`$${a} \\times (\\quad) = ${a*b}$`,a:`$${b}$`}:{q:`$(\\quad) \\times ${b} = ${a*b}$`,a:`$${a}$`};
  if(R()<.5)return pick([{q:`一盒雞蛋有 $${a}$ 顆，$${b}$ 盒一共有幾顆？`,a:`$${a*b}$ 顆`},{q:`一輛車有 $${a}$ 個座位，$${b}$ 輛車一共有幾個座位？`,a:`$${a*b}$ 個`}]);
  const c=ri(1,a-1)||1;return{q:`每排坐 $${a}$ 人，坐滿了 $${b}$ 排，還有 $${c}$ 人沒有位子，一共有幾人？`,a:`$${a*b+c}$ 人`};
}});

unit({id:'e2-addsub3',g:'小二',name:'三位數的加減',instr:'算算看。',h:[14,16,22],gen(d){
  if(d===1){if(R()<.5){const a=ri(100,888),b=ri(100,999-a);if(b<100||a%10+b%10>9||Math.floor(a/10)%10+Math.floor(b/10)%10>9)return null;return{q:`$${a} + ${b}$`,a:`$${a+b}$`}}
    const a=ri(300,999),b=ri(100,a-100);if(a%10<b%10||Math.floor(a/10)%10<Math.floor(b/10)%10)return null;return{q:`$${a} - ${b}$`,a:`$${a-b}$`}}
  if(d===2){if(R()<.5){const a=ri(150,800),b=ri(150,999-a);if(b<150||a%10+b%10<10)return null;return{q:`$${a} + ${b}$`,a:`$${a+b}$`}}
    const a=ri(300,999),b=ri(120,a-50);if(a%10>=b%10)return null;return{q:`$${a} - ${b}$`,a:`$${a-b}$`}}
  const a=ri(250,600),b=ri(150,450);if(a===b)return null;
  return pick([{q:`學校有男生 $${a}$ 人、女生 $${b}$ 人，全校一共有幾人？`,a:`$${a+b}$ 人`},
               {q:`紅色珠子有 $${a}$ 顆，藍色珠子有 $${b}$ 顆，${a>b?'紅色':'藍色'}珠子比較多，多幾顆？`,a:`$${Math.abs(a-b)}$ 顆`},
               {q:`一本故事書有 $${a+b}$ 頁，小華已經看了 $${a}$ 頁，還有幾頁沒看？`,a:`$${b}$ 頁`}]);
}});

unit({id:'e2-length',g:'小二',name:'長度（公分、公尺）',instr:'依題意作答（$1$ 公尺 $= 100$ 公分）。',h:[14,16,22],gen(d){
  if(d===1){const f=ri(0,2);
    if(f===0){const m=ri(1,9);return{q:`$${m}$ 公尺 = 幾公分？`,a:`$${100*m}$ 公分`}}
    const v=ri(1,9)*100+ri(1,99);return f===1?{q:`${e12_two(v)} = 幾公分？`,a:`$${v}$ 公分`}:{q:`$${v}$ 公分 = 幾公尺幾公分？`,a:e12_two(v)}}
  if(d===2){if(R()<.5){const a=ri(15,85),b=ri(10,95-a);if(b<10)return null;return{q:`$${a}$ 公分 $+$ $${b}$ 公分 = 幾公分？`,a:`$${a+b}$ 公分`}}
    const b=ri(15,85);return{q:`$1$ 公尺 $-$ $${b}$ 公分 = 幾公分？`,a:`$${100-b}$ 公分`}}
  if(R()<.5){const L=ri(2,5),c=ri(25,95);return{q:`一條繩子長 $${L}$ 公尺，剪下 $${c}$ 公分，還剩幾公尺幾公分？`,a:e12_two(L*100-c)}}
  const a=ri(105,180),b=ri(95,170);if(a===b)return null;
  return{q:`哥哥身高 $${a}$ 公分，弟弟身高 $${b}$ 公分，${a>b?'哥哥':'弟弟'}比較高，高幾公分？`,a:`$${Math.abs(a-b)}$ 公分`};
}});

unit({id:'e2-time',g:'小二',name:'時間（幾點幾分）（附圖）',instr:'依題意作答。',h:[40,18,22],gen(d){
  if(d===1){const h=ri(1,12),m=ri(0,11)*5;return{q:'如圖，現在是幾點幾分？',a:e12_hm(h,m),fig:e12_clock(h,m),k:`${h}:${m}`}}
  if(d===2){const h=ri(1,11),m1=ri(0,8)*5,m2=ri(m1/5+2,11)*5;
    if(R()<.6)return{q:`從 ${e12_hm(h,m1)} 到 ${e12_hm(h,m2)}，經過了幾分鐘？`,a:`$${m2-m1}$ 分鐘`};
    const s0=ri(1,8),n=ri(2,4);return{q:`從 ${s0} 點到 ${s0+n} 點，經過了幾小時？`,a:`$${n}$ 小時`}}
  const h=ri(1,11),m1=ri(6,11)*5,dur=ri(4,9)*5,end=m1+dur;if(end<60)return null;
  return R()<.5?{q:`電視節目 ${e12_hm(h,m1)} 開始，演了 $${dur}$ 分鐘，幾點幾分結束？`,a:e12_hm(h+1,end-60)}
               :{q:`從 ${e12_hm(h,m1)} 到 ${e12_hm(h+1,end-60)}，經過了幾分鐘？`,a:`$${dur}$ 分鐘`};
}});

/* ---------- 國小三年級 ---------- */
const e3_t=t=>t%10===0?String(t/10):`${Math.floor(t/10)}.${t%10}`;            // 以「十分位整數」表示的一位小數
function e3_clock(min){const h=Math.floor(min/60)%24,m=min%60;const pre=h<12?'上午':(h===12?'中午':'下午'),hh=h>12?h-12:h;return`${pre} ${hh} 點${m?` ${m} 分`:''}`}
function e3_hm(min){const h=Math.floor(min/60),m=min%60;return h&&m?`$${h}$ 小時 $${m}$ 分`:h?`$${h}$ 小時`:`$${m}$ 分`}
function e3_two(v,base,big,small){const a=Math.floor(v/base),b=v%base;return a&&b?`$${a}$ ${big} $${b}$ ${small}`:a?`$${a}$ ${big}`:`$${b}$ ${small}`}

unit({id:'e3-addsub',g:'小三',name:'四位數的加減',instr:'計算下列各題。',h:[16,18,24],gen(d){
  if(d===1){const a=ri(100,999),b=ri(100,999);if(R()<.5)return{q:`$${a} + ${b}$`,a:`$${a+b}$`};const x=Math.max(a,b),y=Math.min(a,b);if(x===y)return null;return{q:`$${x} - ${y}$`,a:`$${x-y}$`}}
  if(d===2){const a=ri(1000,9999),b=ri(100,9999);
    if(R()<.5){if(a+b>9999)return null;return{q:`$${a} + ${b}$`,a:`$${a+b}$`}}
    const x=Math.max(a,b),y=Math.min(a,b);if(x===y)return null;return{q:`$${x} - ${y}$`,a:`$${x-y}$`}}
  const f=ri(0,2);
  if(f===0){const a=ri(1200,4800),b=ri(300,a-200);return{q:`圖書館原有 $${a}$ 本書，借出 $${b}$ 本，還剩幾本？`,a:`$${a-b}$ 本`}}
  if(f===1){const a=ri(1500,4500),b=ri(800,4000);if(a+b>9999)return null;return{q:`遊樂園上午有 $${a}$ 人入園，下午有 $${b}$ 人入園，這一天共有幾人入園？`,a:`$${a+b}$ 人`}}
  const a=ri(20,90)*100,b=ri(300,1500),c=ri(300,1500);if(b+c>=a)return null;
  return{q:`小華有 $${a}$ 元，買書花了 $${b}$ 元，買文具花了 $${c}$ 元，還剩多少元？`,a:`$${a-b-c}$ 元`};
}});

unit({id:'e3-mul',g:'小三',name:'乘法',instr:'計算下列各題。',h:[16,18,24],gen(d){
  if(d===1){const a=ri(11,99),b=ri(2,9);return{q:`$${a} \\times ${b}$`,a:`$${a*b}$`}}
  if(d===2){const a=ri(100,999),b=ri(2,9);return{q:`$${a} \\times ${b}$`,a:`$${a*b}$`}}
  if(R()<.5){const p=ri(15,95),n=ri(3,9);return{q:`一枝筆 $${p}$ 元，買 $${n}$ 枝要付多少元？`,a:`$${p*n}$ 元`}}
  const box=ri(12,48),k=ri(4,9),extra=ri(2,box-1);
  return{q:`一盒餅乾有 $${box}$ 片，媽媽買了 $${k}$ 盒，又多買了 $${extra}$ 片，一共有幾片？`,a:`$${box*k+extra}$ 片`};
}});

unit({id:'e3-div',g:'小三',name:'除法',instr:'計算下列各題，有餘數的要寫出餘數。',h:[18,20,26],gen(d){
  const ans=(q,r)=>r?`商 $${q}$，餘 $${r}$`:`$${q}$`;
  if(d===1){const b=ri(2,9),q=ri(2,9),r=R()<.5?0:ri(1,b-1);return{q:`$${b*q+r} \\div ${b}$`,a:ans(q,r)}}
  if(d===2){const b=ri(2,9),q=ri(11,99),r=R()<.4?0:ri(1,b-1),a=b*q+r;if(a>999)return null;return{q:`$${a} \\div ${b}$`,a:ans(q,r)}}
  const b=ri(3,9),q=ri(6,40),r=ri(1,b-1),a=b*q+r;
  if(R()<.5)return{q:`有 $${a}$ 顆糖果，每 $${b}$ 顆裝一袋，可以裝滿幾袋？還剩幾顆？`,a:`$${q}$ 袋，剩 $${r}$ 顆`};
  return{q:`有 $${a}$ 位小朋友要搭車，每輛車最多坐 $${b}$ 人，至少要幾輛車？`,a:`$${q+1}$ 輛`};
}});

unit({id:'e3-frac',g:'小三',name:'認識分數與一位小數',instr:'依題意作答。',h:[16,18,22],gen(d){
  if(d===1){const f=ri(0,2);
    if(f===0){const n=ri(3,12),a=ri(1,n-1),b=ri(1,n-1);if(a===b)return null;return{q:`$\\frac{${a}}{${n}}$ 和 $\\frac{${b}}{${n}}$，哪一個比較大？`,a:`$\\frac{${Math.max(a,b)}}{${n}}$`}}
    if(f===1){const n=ri(3,12),a=ri(1,n-2),b=ri(1,n-1-a);return{q:`$\\frac{${a}}{${n}} + \\frac{${b}}{${n}}$`,a:`$\\frac{${a+b}}{${n}}$`}}
    const a=ri(1,9),b=ri(1,9);if(a+b>9)return null;return{q:`$0.${a} + 0.${b}$`,a:`$0.${a+b}$`}}
  if(d===2){const f=ri(0,2);
    if(f===0){const n=ri(3,12),a=ri(1,n-1);return{q:`$1 - \\frac{${a}}{${n}}$`,a:`$\\frac{${n-a}}{${n}}$`}}
    const x=ri(11,99),y=ri(11,99);if(x%10===0||y%10===0)return null;
    if(f===1)return{q:`$${e3_t(x)} + ${e3_t(y)}$`,a:`$${e3_t(x+y)}$`};
    const p=Math.max(x,y),q=Math.min(x,y);if(p===q)return null;return{q:`$${e3_t(p)} - ${e3_t(q)}$`,a:`$${e3_t(p-q)}$`}}
  const f=ri(0,2);
  if(f===0){const n=pick([6,8,10,12]),a=ri(2,n-2);return{q:`一個披薩平分成 $${n}$ 片，哥哥吃了 $${a}$ 片，哥哥吃了這個披薩的幾分之幾？`,a:`$\\frac{${a}}{${n}}$`}}
  if(f===1){const L=ri(25,60),u=ri(11,L-5);if(u%10===0||L%10===0)return null;return{q:`一條緞帶長 $${e3_t(L)}$ 公尺，用掉 $${e3_t(u)}$ 公尺，還剩幾公尺？`,a:`$${e3_t(L-u)}$ 公尺`}}
  const n=ri(5,10),a=ri(1,n-3),b=ri(1,n-1-a);return{q:`一條繩子平分成 $${n}$ 段，弟弟拿走 $${a}$ 段，妹妹拿走 $${b}$ 段，兩人共拿走全部的幾分之幾？`,a:`$\\frac{${a+b}}{${n}}$`};
}});

unit({id:'e3-time',g:'小三',name:'時間的計算',instr:'依題意作答。',h:[16,20,24],gen(d){
  if(d===1){const f=ri(0,2);
    if(f===0){const h=ri(1,5),m=ri(1,59);return{q:`$${h}$ 小時 $${m}$ 分 = 幾分？`,a:`$${h*60+m}$ 分`}}
    if(f===1){const t=ri(61,299);if(t%60===0)return null;return{q:`$${t}$ 分 = 幾小時幾分？`,a:e3_hm(t)}}
    const m=ri(1,9),s=ri(1,59);return{q:`$${m}$ 分 $${s}$ 秒 = 幾秒？`,a:`$${m*60+s}$ 秒`}}
  if(d===2){const st=ri(7,16)*60+ri(0,11)*5,dur=ri(5,34)*5;
    if(R()<.5)return{q:`從${e3_clock(st)}到${e3_clock(st+dur)}，經過了多久？`,a:e3_hm(dur)};
    const a=ri(1,3)*60+ri(1,11)*5,b=ri(1,3)*60+ri(1,11)*5;return{q:`${e3_hm(a)} + ${e3_hm(b)} = 幾小時幾分？`,a:e3_hm(a+b)}}
  const st=ri(8,19)*60+ri(0,11)*5,dur=ri(70,150);
  if(R()<.5)return{q:`一部電影長 ${e3_hm(dur)}，從${e3_clock(st)}開始播放，幾點幾分結束？`,a:e3_clock(st+dur)};
  return{q:`哥哥寫作業從${e3_clock(st)}寫到${e3_clock(st+dur)}，一共寫了多久？`,a:e3_hm(dur)};
}});

const E3_UNITS=[[100,'公尺','公分'],[10,'公分','毫米'],[1000,'公斤','公克'],[1000,'公升','毫升']];
unit({id:'e3-units',g:'小三',name:'長度、重量與容量的換算',instr:'依題意作答。',h:[16,18,24],gen(d){
  const [base,big,small]=pick(E3_UNITS),mk=()=>ri(1,9)*base+ri(1,base-1);
  if(d===1){const v=mk();return R()<.5?{q:`${e3_two(v,base,big,small)} = 幾${small}？`,a:`$${v}$ ${small}`}:{q:`$${v}$ ${small} = 幾${big}幾${small}？`,a:e3_two(v,base,big,small)}}
  if(d===2){const a=mk(),b=mk();
    if(R()<.5)return{q:`${e3_two(a,base,big,small)} + ${e3_two(b,base,big,small)}`,a:e3_two(a+b,base,big,small)};
    const x=Math.max(a,b),y=Math.min(a,b);if(x===y)return null;return{q:`${e3_two(x,base,big,small)} - ${e3_two(y,base,big,small)}`,a:e3_two(x-y,base,big,small)}}
  if(R()<.5){const L=ri(2,3)*1000,cup=ri(2,5)*50,n=ri(2,5);if(cup*n>=L)return null;
    return{q:`一壺水有 $${L/1000}$ 公升，倒出 $${n}$ 杯，每杯 $${cup}$ 毫升，壺裡還剩幾毫升？`,a:`$${L-cup*n}$ 毫升`}}
  const w=ri(2,9)*100+ri(1,9)*10,n=ri(3,6),box=ri(200,600);
  return{q:`一顆蘋果重 $${w}$ 公克，$${n}$ 顆蘋果裝在重 $${box}$ 公克的盒子裡，全部重幾公斤幾公克？`,a:e3_two(w*n+box,1000,'公斤','公克')};
}});

unit({id:'e3-perim',g:'小三',name:'正方形和長方形的周長',instr:'依題意作答。',h:[16,18,22],gen(d){
  if(d===1){if(R()<.5){const s=ri(3,25);return{q:`正方形的邊長是 $${s}$ 公分，周長是幾公分？`,a:`$${4*s}$ 公分`}}
    const L=ri(5,30),W=ri(2,L-1);return{q:`長方形的長是 $${L}$ 公分、寬是 $${W}$ 公分，周長是幾公分？`,a:`$${2*(L+W)}$ 公分`}}
  if(d===2){if(R()<.5){const s=ri(3,30);return{q:`正方形的周長是 $${4*s}$ 公分，邊長是幾公分？`,a:`$${s}$ 公分`}}
    const L=ri(6,30),W=ri(2,L-1);return{q:`長方形的周長是 $${2*(L+W)}$ 公分，長是 $${L}$ 公分，寬是幾公分？`,a:`$${W}$ 公分`}}
  if(R()<.5){const L=ri(8,40),W=ri(3,L-1),n=ri(2,4);return{q:`一塊長方形花圃長 $${L}$ 公尺、寬 $${W}$ 公尺，沿著外圍繞 $${n}$ 圈籬笆，一共要幾公尺的籬笆？`,a:`$${2*(L+W)*n}$ 公尺`}}
  const s=ri(4,20);return{q:`用一條鐵絲圍成邊長 $${s}$ 公分的正方形，剛好用完。如果改圍成寬 $${s-2}$ 公分的長方形，長是幾公分？`,a:`$${s+2}$ 公分`};
}});

/* ---------- 國小 ---------- */
/* ================= 國小數學（小四・小五・小六）=================
   單元一覽與手算驗證範例（基礎 / 標準 / 挑戰）：
   e-muldiv  小四 多位數的乘法與除法：379×7→2653 / 1781÷29→商61餘12 / 一箱41瓶，215箱→8815瓶
   e-approx  小四 概數與估算：7592四捨五入到十位→7590 / 394922到千位→395000 / 電扇102元買28臺，取最高位估算→約3000元
   e-frac4   小四 同分母分數加減・帶分數與假分數：14/5→2又4/5 / 2又4/5+1/5→3 / 緞帶7又5/7−2又4/7−6/7→4又2/7公尺
   e-ops     小五 整數四則混合計算：11−3×2→5 / 53+54÷9×3→71 / 20×24−36÷9+88→564
   e-factor  小五 因數與倍數：1到50中13的倍數→3個 / 8和72→最大公因數8、最小公倍數72 / 蘋果26橘子117平分→13位，每人2顆、9顆
   e-frac5   小五 擴分、約分與異分母分數加減：48/56→6/7 / 3/5−2/11→23/55 / 2/5+5/12+1又5/12→2又7/30
   e-fracmul 小五 分數的乘法：2/3×13→8又2/3 / 1又1/2×11→16又1/2 / 2又1/4×2又5/6→6又3/8
   e-decmul  小五 小數的乘法：6.2×7→43.4 / 4.65×0.7→3.255 / 長3.1寬1.7公尺→5.27平方公尺
   e-area    小五 三角形・平行四邊形・梯形的面積（附圖）：平行四邊形底8高5→40 / 平行四邊形面積77、底11，求高→7 / 直角三角形兩股8、6，斜邊10，斜邊上的高→4.8公分
   e-fracdiv 小六 分數的除法：1/5÷3/4→4/15 / 7÷2又2/9→3又3/20 / 鐵條3又1/5公尺重2又1/3公斤，1公尺→35/48公斤
   e-decdiv  小六 小數的除法：7÷2→3.5 / 0.44÷0.2→2.2 / 2.9公斤糖每0.2公斤一包→14包剩0.1公斤
   e-ratio   小六 比與比值・速率：23:25的比值→23/25 / 16分鐘騎3.68公里→分速230公尺 / 時速120公里行駛2小時20分→280公里
   e-circle  小六 圓周長與圓面積：半徑18→1017.36平方公分 / 直徑40的半圓周長→102.8公分 / 圓環外半徑7內半徑4→103.62平方公分
   e-percent 小六 百分率與折扣：360元打9折→324元 / 460元便宜46元→打9折 / 原價860特價516→打6折
*/
/* ---------- 國小 helper（e_ 前綴） ---------- */
const E_P10=[1,10,100,1000,10000,100000,1000000,10000000];
/* 整數 n 代表 n ÷ 10^k，輸出去掉尾端 0 的小數字串 */
const e_dec=(n,k=0)=>{const neg=n<0;let s=String(Math.abs(n));if(k>0){s=s.padStart(k+1,'0');s=(s.slice(0,-k)+'.'+s.slice(-k)).replace(/0+$/,'').replace(/\.$/,'')}return(neg?'-':'')+s};
/* 同上，整數部分加千分位（TeX 用） */
const e_num=(n,k=0)=>{const [i,f]=e_dec(n,k).split('.');return commas(i)+(f?'.'+f:'')};
/* 固定 k 位小數（取概數用，保留尾端 0） */
const e_fix=(n,k)=>{let s=String(n).padStart(k+1,'0');return commas(s.slice(0,-k))+'.'+s.slice(-k)};
/* 小數物件 {n,k} = n ÷ 10^k */
const e_rdec=(lo,hi,k)=>{let n;do n=ri(lo,hi);while(n%10===0);return{n,k}};
const e_ds=x=>e_num(x.n,x.k);
/* 分數答案：整數、真分數或帶分數 */
const e_mix=f=>f.d===1?String(f.n):Math.abs(f.n)<f.d?ftex(f):mixtex(f);
/* 最簡真分數、最簡帶分數 */
const e_proper=dd=>{let n;do n=ri(1,dd-1);while(gcd(n,dd)!==1);return F(n,dd)};
const e_mixed=(dd,wmax=4)=>{const r=e_proper(dd);return F(ri(1,wmax)*dd+r.n,dd)};
/* 正整數 num ÷ den 四捨五入到整數 */
const e_rdiv=(num,den)=>Math.floor((2*num+den)/(2*den));
const e_rnd=(N,p)=>Math.floor((2*N+p)/(2*p))*p;
const e_divs=n=>{const r=[];for(let i=1;i<=n;i++)if(n%i===0)r.push(i);return r};
const E_PLACE={10:'十位',100:'百位',1000:'千位',10000:'萬位'};

/* ---------- 小四 ---------- */
unit({id:'e-muldiv',g:'小四',name:'多位數的乘法與除法',instr:'計算下列各題（可用直式），除法要寫出商和餘數。',h:[24,30,30],gen(d){
  const qr=(a,b)=>{const q=Math.floor(a/b),r=a%b;return r?`商 $${e_num(q)}$，餘 $${r}$`:`$${e_num(q)}$`};
  if(d===1){
    if(R()<.5){const a=ri(102,999),b=ri(3,9);if(a%100===0)return null;return{q:`$${a} \\times ${b}$`,a:`$${e_num(a*b)}$`}}
    const a=ri(105,999),b=ri(3,9);if(a%b===0&&R()<.7)return null;return{q:`$${a} \\div ${b}$`,a:qr(a,b)};
  }
  if(d===2){const f=ri(0,2);
    if(f===0){const a=ri(102,999),b=ri(12,98);if(b%10===0)return null;return{q:`$${a} \\times ${b}$`,a:`$${e_num(a*b)}$`}}
    if(f===1){const a=ri(305,9999),b=ri(12,89);if(b%10===0||a<b*10)return null;return{q:`$${e_num(a)} \\div ${b}$`,a:qr(a,b)}}
    const a=ri(101,999),b=ri(101,999);if(a%10===0||b%10===0)return null;return{q:`$${a} \\times ${b}$`,a:`$${e_num(a*b)}$`};
  }
  const f=ri(0,4);
  if(f===0){const p=ri(12,58),n=ri(6,25),pay=pick([500,1000]),t=p*n;if(pay-t<10)return null;return{q:`一枝筆 $${p}$ 元，買 $${n}$ 枝付 $${e_num(pay)}$ 元，可以找回多少元？`,a:`$${pay-t}$ 元`}}
  if(f===1){const N=ri(300,999),b=ri(12,36),r=N%b;if(!r)return null;return{q:`有 $${N}$ 顆糖果，每 $${b}$ 顆裝成一袋，可以裝成幾袋？剩下幾顆？`,a:`$${Math.floor(N/b)}$ 袋，剩下 $${r}$ 顆`}}
  if(f===2){const N=ri(200,900),b=ri(35,48);if(N%b===0)return null;return{q:`全校 $${N}$ 人去校外教學，每輛遊覽車最多坐 $${b}$ 人，至少要租幾輛車？`,a:`$${Math.ceil(N/b)}$ 輛`}}
  if(f===3){const a=ri(12,48),n=ri(105,480);return{q:`一箱飲料有 $${a}$ 瓶，$${n}$ 箱共有幾瓶？`,a:`$${e_num(a*n)}$ 瓶`}}
  const x=ri(15,95),w=ri(12,52);return{q:`小明每天存 $${x}$ 元，連續存了 $${w}$ 個星期，共存了多少元？`,a:`$${e_num(x*7*w)}$ 元`};
}});

unit({id:'e-approx',g:'小四',name:'概數與估算',instr:'依題意作答。',h:[16,20,26],gen(d){
  if(d<=2){
    const p=pick(d===1?[10,100,1000]:[100,1000,10000]),N=d===1?ri(1000,99999):ri(10000,999999);
    if(N%p===0||N<p*10)return null;
    const m=d===1?0:ri(0,2),name=['四捨五入法','無條件進入法','無條件捨去法'][m];
    const v=m===0?e_rnd(N,p):m===1?Math.ceil(N/p)*p:Math.floor(N/p)*p;
    return{q:`用${name}把 $${e_num(N)}$ 取概數到${E_PLACE[p]}`,a:`$${e_num(v)}$`};
  }
  const f=ri(0,2);
  if(f===0){const a=ri(1050,9949),b=ri(1050,9949),op=R()<.5?'+':'-';if(a%100===0||b%100===0||op==='-'&&a-b<500)return null;
    const ra=e_rnd(a,100),rb=e_rnd(b,100);
    return{q:`先用四捨五入法把各數取概數到百位，再估算 $${e_num(a)} ${op} ${e_num(b)}$ 大約是多少`,a:`約 $${e_num(op==='+'?ra+rb:ra-rb)}$`}}
  if(f===1){const p=ri(101,989),n=ri(11,95);if(p%100===0||n%10===0)return null;const rp=e_rnd(p,100),rn=e_rnd(n,10);
    return{q:`一臺電風扇 $${p}$ 元，學校要買 $${n}$ 臺。用四捨五入法把單價和數量都取概數到最高位，估算總價大約是多少元`,a:`約 $${e_num(rp*rn)}$ 元`}}
  const p=pick([10,100,1000]),X=ri(11,99)*p;
  return{q:`一個整數用四捨五入法取概數到${E_PLACE[p]}是 $${e_num(X)}$，這個數最大是多少？最小是多少？`,a:`最大 $${e_num(X+p/2-1)}$，最小 $${e_num(X-p/2)}$`};
}});

unit({id:'e-frac4',g:'小四',name:'同分母分數加減・帶分數與假分數',instr:'依題意作答（答案大於 1 時用帶分數表示）。',h:[16,20,26],gen(d){
  const dd=ri(3,12),cp=n=>gcd(n,dd)===1;
  /* N 代表 N/dd，題目用原分母顯示 */
  const qf=N=>N<dd?`\\frac{${N}}{${dd}}`:N%dd?`${Math.floor(N/dd)}\\frac{${N%dd}}{${dd}}`:`${N/dd}`;
  /* 答案不需約分（小四未學約分）：只接受整數或分子與分母互質 */
  const ans=N=>(N>0&&(N%dd===0||cp(N)))?`$${e_mix(F(N,dd))}$`:null;
  const prop=()=>{const r=ri(1,dd-1);return cp(r)?r:0};
  const mixd=wmax=>{const r=prop();return r?ri(1,wmax)*dd+r:0};
  if(d===1){const f=ri(0,2);
    if(f===0){const n=ri(dd+1,5*dd);if(!cp(n))return null;return{q:`把 $\\frac{${n}}{${dd}}$ 化成帶分數`,a:`$${mixtex(F(n,dd))}$`}}
    if(f===1){const N=mixd(5);if(!N)return null;return{q:`把 $${qf(N)}$ 化成假分數`,a:`$\\frac{${N}}{${dd}}$`}}
    const x=prop(),y=prop();if(!x||!y)return null;const op=R()<.5?'+':'-';if(op==='-'&&x<=y)return null;const A=ans(op==='+'?x+y:x-y);if(!A)return null;
    return{q:`$${qf(x)} ${op} ${qf(y)}$`,a:A};
  }
  if(d===2){
    if(R()<.7){const x=mixd(5),y=R()<.5?mixd(4):prop();if(!x||!y)return null;const op=R()<.5?'+':'-';if(op==='-'&&x<=y)return null;const A=ans(op==='+'?x+y:x-y);if(!A)return null;
      return{q:`$${qf(x)} ${op} ${qf(y)}$`,a:A}}
    const W=ri(1,6),y=R()<.5?prop():mixd(2);if(!y||y>=W*dd)return null;const A=ans(W*dd-y);if(!A)return null;
    return{q:`$${W} - ${qf(y)}$`,a:A};
  }
  if(R()<.5){const x=mixd(6),y=R()<.5?mixd(3):prop(),z=R()<.5?mixd(2):prop();if(!x||!y||!z)return null;const o1=R()<.5?'+':'-',o2=R()<.5?'+':'-';
    const v1=o1==='+'?x+y:x-y;if(v1<=0)return null;const A=ans(o2==='+'?v1+z:v1-z);if(!A)return null;
    return{q:`$${qf(x)} ${o1} ${qf(y)} ${o2} ${qf(z)}$`,a:A}}
  const x=mixd(8),y=mixd(2),z=prop();if(!x||!y||!z)return null;const A=ans(x-y-z);if(!A)return null;
  return{q:`一條緞帶長 $${qf(x)}$ 公尺，第一次用去 $${qf(y)}$ 公尺，第二次用去 $${qf(z)}$ 公尺，還剩下幾公尺？`,a:`${A} 公尺`};
}});

/* ---------- 小五 ---------- */
unit({id:'e-ops',g:'小五',name:'整數四則混合計算',instr:'計算下列各式（先乘除、後加減，有括號先算括號）。',h:[16,20,26],gen(d){
  if(d===1){const f=ri(0,4),a=ri(10,99),b=ri(2,12),c=ri(2,12);
    if(f===0)return{q:`$${a} + ${b} \\times ${c}$`,a:`$${a+b*c}$`};
    if(f===1){if(a<b*c)return null;return{q:`$${a} - ${b} \\times ${c}$`,a:`$${a-b*c}$`}}
    if(f===2)return{q:`$(${a} + ${b}) \\times ${c}$`,a:`$${(a+b)*c}$`};
    if(f===3){const q=ri(2,15);return{q:`$${b*q} \\div ${b} + ${a}$`,a:`$${q+a}$`}}
    if(a<=b)return null;return{q:`$(${a} - ${b}) \\times ${c}$`,a:`$${(a-b)*c}$`};
  }
  if(d===2){const f=ri(0,3);
    if(f===0){const a=ri(20,200),b=ri(3,25),c=ri(3,15),e=ri(5,60),v=a+b*c-e;if(v<0)return null;return{q:`$${a} + ${b} \\times ${c} - ${e}$`,a:`$${v}$`}}
    if(f===1){const c=ri(2,9),q=ri(3,25),b=ri(5,90),a=b+c*q;return{q:`$(${a} - ${b}) \\div ${c}$`,a:`$${q}$`}}
    if(f===2){const a=ri(3,25),b=ri(5,40),c=ri(5,40),e=ri(10,99),v=a*(b+c)-e;if(v<0)return null;return{q:`$${a} \\times (${b} + ${c}) - ${e}$`,a:`$${v}$`}}
    const b=ri(2,9),q=ri(3,20),c=ri(2,12),e=ri(10,99);return{q:`$${e} + ${b*q} \\div ${b} \\times ${c}$`,a:`$${e+q*c}$`};
  }
  const f=ri(0,3);
  if(f===0){const dd=ri(3,9),q=ri(5,30),b=ri(2,12),c=ri(2,12),a=dd*q-b*c;if(a<=0)return null;return{q:`$(${a} + ${b} \\times ${c}) \\div ${dd}$`,a:`$${q}$`}}
  if(f===1){const a=ri(100,500),b=ri(20,60),c=ri(5,b-3),dd=ri(2,9),v=a-(b-c)*dd;if(v<0)return null;return{q:`$${a} - (${b} - ${c}) \\times ${dd}$`,a:`$${v}$`}}
  if(f===2){const a=ri(12,40),b=ri(5,25),dd=ri(3,9),q=ri(4,20),e=ri(10,90);if(a*b-q<0)return null;return{q:`$${a} \\times ${b} - ${dd*q} \\div ${dd} + ${e}$`,a:`$${a*b-q+e}$`}}
  const p=ri(12,58),n=ri(3,9),p2=ri(8,30),n2=ri(2,6),pay=pick([500,1000]),t=p*n+p2*n2;if(t>=pay)return null;
  return{q:`買 $${n}$ 本筆記本，每本 $${p}$ 元，又買 $${n2}$ 枝筆，每枝 $${p2}$ 元，付了 $${pay}$ 元，應找回多少元？（列成一個算式）`,a:`$${pay} - (${p} \\times ${n} + ${p2} \\times ${n2}) = ${pay-t}$，找回 $${pay-t}$ 元`};
}});

unit({id:'e-factor',g:'小五',name:'因數與倍數',instr:'依題意作答。',h:[16,20,26],gen(d){
  const L=arr=>arr.map(x=>`$${x}$`).join('、');
  if(d===1){const f=ri(0,2);
    if(f===0){const n=ri(12,72),ds=e_divs(n);if(ds.length<5)return null;return{q:`寫出 $${n}$ 的所有因數`,a:L(ds)}}
    if(f===1){if(R()<.5){const k=ri(3,19);return{q:`由小到大寫出 $${k}$ 的前 $5$ 個倍數`,a:L([1,2,3,4,5].map(i=>k*i))}}
      const N=pick([50,60,100]),k=ri(3,19);return{q:`$1$ 到 $${N}$ 的整數中，$${k}$ 的倍數有幾個？`,a:`$${Math.floor(N/k)}$ 個`}}
    const g=pick([4,6,8,9,10,12,15,18]),x=ri(1,5),y=ri(2,6);if(x>=y||gcd(x,y)!==1||g*y>72)return null;
    return{q:`寫出 $${g*x}$ 和 $${g*y}$ 的所有公因數`,a:L(e_divs(g))};
  }
  if(d===2){const g=ri(2,12),x=ri(1,9),y=ri(2,9);if(x>=y||gcd(x,y)!==1)return null;const a=g*x,b=g*y;if(b>100||a<4)return null;
    const m=ri(0,2);
    if(m===0)return{q:`求 $${a}$ 和 $${b}$ 的最大公因數`,a:`$${g}$`};
    if(m===1)return{q:`求 $${a}$ 和 $${b}$ 的最小公倍數`,a:`$${g*x*y}$`};
    return{q:`求 $${a}$ 和 $${b}$ 的最大公因數和最小公倍數`,a:`最大公因數 $${g}$，最小公倍數 $${g*x*y}$`};
  }
  const f=ri(0,3);
  if(f===0){const g=ri(2,12),x=ri(2,9),y=ri(2,9);if(x===y||gcd(x,y)!==1)return null;const Lg=g*Math.max(x,y),W=g*Math.min(x,y);if(Lg>120)return null;
    return{q:`一張長 $${Lg}$ 公分、寬 $${W}$ 公分的長方形紙，要剪成大小相同的正方形而且沒有剩下，正方形的邊長最長是幾公分？可以剪成幾張？`,a:`邊長 $${g}$ 公分，$${x*y}$ 張`}}
  if(f===1){const a=ri(3,12),b=ri(3,12);if(a===b||a%b===0||b%a===0)return null;
    return{q:`哥哥每 $${a}$ 天去一次圖書館，弟弟每 $${b}$ 天去一次。今天兩人同時去，至少再過幾天兩人又會同時去圖書館？`,a:`$${lcm(a,b)}$ 天`}}
  if(f===2){const a=ri(3,12),b=ri(3,12);if(a>=b)return null;const r=ri(1,a-1);
    return{q:`一個比 $${r}$ 大的整數，除以 $${a}$ 餘 $${r}$，除以 $${b}$ 也餘 $${r}$，這個數最小是多少？`,a:`$${lcm(a,b)+r}$`}}
  const g=ri(3,15),x=ri(2,9),y=ri(2,9);if(x===y||gcd(x,y)!==1||g*Math.max(x,y)>120)return null;
  return{q:`有 $${g*x}$ 顆蘋果和 $${g*y}$ 顆橘子，平分給一些小朋友都剛好分完，最多可以分給幾位小朋友？每人分得蘋果和橘子各幾顆？`,a:`$${g}$ 位，每人蘋果 $${x}$ 顆、橘子 $${y}$ 顆`};
}});

unit({id:'e-frac5',g:'小五',name:'擴分、約分與異分母分數加減',instr:'依題意作答，答案化成最簡分數（大於 1 時用帶分數表示）。',h:[16,22,28],gen(d){
  const op2=(x,y,op)=>op==='+'?fadd(x,y):fsub(x,y);
  if(d===1){const f=ri(0,2);
    if(f===0){const a=e_proper(ri(3,12)),k=ri(2,9);if(a.d*k>99)return null;return{q:`把 $\\frac{${a.n*k}}{${a.d*k}}$ 約分成最簡分數`,a:`$${ftex(a)}$`}}
    if(f===1){const a=e_proper(ri(2,9)),k=ri(2,8);return{q:`把 $${ftex(a)}$ 擴分成分母是 $${a.d*k}$ 的分數`,a:`$\\frac{${a.n*k}}{${a.d*k}}$`}}
    const d1=ri(2,6),k=ri(2,4),a=e_proper(d1),b=e_proper(d1*k),op=R()<.5?'+':'-',[x,y]=R()<.5?[a,b]:[b,a],v=op2(x,y,op);if(v.n<=0)return null;
    return{q:`$${ftex(x)} ${op} ${ftex(y)}$`,a:`$${e_mix(v)}$`};
  }
  if(d===2){
    if(R()<.5){const a=e_proper(ri(2,12)),b=e_proper(ri(2,12));if(a.d===b.d||lcm(a.d,b.d)>60)return null;const op=R()<.5?'+':'-',v=op2(a,b,op);if(v.n<=0)return null;
      return{q:`$${ftex(a)} ${op} ${ftex(b)}$`,a:`$${e_mix(v)}$`}}
    const a=e_mixed(ri(2,9)),b=e_mixed(ri(2,9));if(a.d===b.d||lcm(a.d,b.d)>36)return null;const op=R()<.5?'+':'-',v=op2(a,b,op);if(v.n<=0)return null;
    return{q:`$${mixtex(a)} ${op} ${mixtex(b)}$`,a:`$${e_mix(v)}$`};
  }
  const ds=()=>pick([2,3,4,5,6,8,9,10,12]);
  if(R()<.6){const t=shuffle([e_mixed(ds(),3),e_proper(ds()),e_proper(ds())]),o1=R()<.5?'+':'-',o2=R()<.5?'+':'-';
    if(lcm(lcm(t[0].d,t[1].d),t[2].d)>60||t[0].d===t[1].d&&t[1].d===t[2].d)return null;
    const v1=op2(t[0],t[1],o1);if(v1.n<=0)return null;const v=op2(v1,t[2],o2);if(v.n<=0)return null;
    return{q:`$${e_mix(t[0])} ${o1} ${e_mix(t[1])} ${o2} ${e_mix(t[2])}$`,a:`$${e_mix(v)}$`}}
  const A=e_mixed(ds(),5),B=e_mixed(ds(),2),C=e_proper(ds()),m=fsub(A,B);if(m.n<=0||A.d===B.d&&B.d===C.d)return null;
  return{q:`水桶裡有 $${mixtex(A)}$ 公升的水，倒出 $${mixtex(B)}$ 公升後，又加入 $${ftex(C)}$ 公升，現在水桶裡有幾公升的水？`,a:`$${e_mix(fadd(m,C))}$ 公升`};
}});

unit({id:'e-fracmul',g:'小五',name:'分數的乘法',instr:'計算下列各題，答案化成最簡分數（大於 1 時用帶分數表示）。',h:[16,20,26],gen(d){
  if(d===1){const a=e_proper(ri(2,12));
    if(R()<.5){const n=ri(2,15),sw=R()<.5;return{q:sw?`$${n} \\times ${ftex(a)}$`:`$${ftex(a)} \\times ${n}$`,a:`$${e_mix(fmul(a,F(n)))}$`}}
    const b=e_proper(ri(2,12));return{q:`$${ftex(a)} \\times ${ftex(b)}$`,a:`$${e_mix(fmul(a,b))}$`};
  }
  if(d===2){const a=e_mixed(ri(2,9),4);
    if(R()<.5){const n=ri(2,12);return{q:`$${mixtex(a)} \\times ${n}$`,a:`$${e_mix(fmul(a,F(n)))}$`}}
    const b=e_proper(ri(2,12));return{q:`$${mixtex(a)} \\times ${ftex(b)}$`,a:`$${e_mix(fmul(a,b))}$`};
  }
  const f=ri(0,2);
  if(f===0){const a=e_mixed(ri(2,9),3),b=e_mixed(ri(2,9),3),v=fmul(a,b);if(v.d>30)return null;return{q:`$${mixtex(a)} \\times ${mixtex(b)}$`,a:`$${e_mix(v)}$`}}
  if(f===1){const a=e_proper(ri(2,10)),b=e_mixed(ri(2,8),3),c=e_proper(ri(2,10)),v=fmul(fmul(a,b),c);if(v.d>40)return null;return{q:`$${ftex(a)} \\times ${mixtex(b)} \\times ${ftex(c)}$`,a:`$${e_mix(v)}$`}}
  const W=pick([12,15,16,18,20,24,30,36]),r=e_proper(pick([3,4,5,6,8])),left=R()<.5,v=left?fmul(F(W),fsub(F(1),r)):fmul(F(W),r);
  return{q:`一袋米重 $${W}$ 公斤，吃掉了全部的 $${ftex(r)}$，${left?'還剩下幾公斤':'吃掉了幾公斤'}？`,a:`$${e_mix(v)}$ 公斤`};
}});

unit({id:'e-decmul',g:'小五',name:'小數的乘法',instr:'計算下列各題。',h:[16,20,26],gen(d){
  const mul=(x,y)=>({n:x.n*y.n,k:x.k+y.k});
  if(d===1){const x=R()<.6?e_rdec(11,99,1):e_rdec(101,999,2),b={n:ri(2,9),k:0},sw=R()<.3;
    return{q:sw?`$${b.n} \\times ${e_ds(x)}$`:`$${e_ds(x)} \\times ${b.n}$`,a:`$${e_ds(mul(x,b))}$`}}
  if(d===2){const f=ri(0,2);let x,y;
    if(f===0){x=e_rdec(11,99,1);y=e_rdec(11,99,1)}
    else if(f===1){x=e_rdec(101,999,2);y=e_rdec(2,9,1)}
    else{x={n:ri(12,60),k:0};y=e_rdec(11,99,2)}
    return{q:`$${e_ds(x)} \\times ${e_ds(y)}$`,a:`$${e_ds(mul(x,y))}$`};
  }
  const f=ri(0,3);
  if(f===0){const x=e_rdec(101,999,2),y=e_rdec(11,99,1);return{q:`$${e_ds(x)} \\times ${e_ds(y)}$`,a:`$${e_ds(mul(x,y))}$`}}
  if(f===1){const p=e_rdec(251,329,1),Lt={n:ri(12,45),k:0};return{q:`每公升汽油 $${e_ds(p)}$ 元，加了 $${Lt.n}$ 公升，要付多少元？`,a:`$${e_ds(mul(p,Lt))}$ 元`}}
  if(f===2){const a=e_rdec(21,99,1),b=e_rdec(11,a.n-1,1);return{q:`長方形菜園長 $${e_ds(a)}$ 公尺、寬 $${e_ds(b)}$ 公尺，面積是多少平方公尺？`,a:`$${e_ds(mul(a,b))}$ 平方公尺`}}
  const pr=ri(6,30)*5,w=e_rdec(12,59,1);return{q:`蘋果一公斤 $${pr}$ 元，買 $${e_ds(w)}$ 公斤要付多少元？`,a:`$${e_ds(mul({n:pr,k:0},w))}$ 元`};
}});

unit({id:'e-area',g:'小五',name:'三角形・平行四邊形・梯形的面積（附圖）',instr:'依圖作答（長度單位：公分）。',h:[40,44,48],gen(d){
  const f=Fig(160,110),dash='stroke-dasharray="3 2" stroke-width=".8"',NM={tri:'三角形',para:'平行四邊形',trap:'梯形'};
  if(d===3&&R()<.34){ /* 直角三角形斜邊上的高 */
    const k=ri(1,4),[p,q,c]=R()<.5?[3*k,4*k,5*k]:[4*k,3*k,5*k];
    const [A,B,C,H]=fitPts([V(0,0),V(c,0),V(p*p/c,p*q/c),V(p*p/c,0)],160,110,18),ctr=centroid([A,B,C]);
    f.poly([A,B,C]).right(C,A,B,5).line(C,H,dash).right(H,C,B,4);
    f.seg(A,C,String(p),ctr).seg(C,B,String(q),ctr).text(vadd(vlerp(A,B,.5),V(0,9)),String(c)).text(vadd(vlerp(C,H,.5),V(6,0)),'x',true);
    return{q:`如圖，直角三角形的兩股長 $${p}$ 公分、$${q}$ 公分，斜邊長 $${c}$ 公分，求斜邊上的高 $x$`,a:`$x = ${e_num(p*q*10/c,1)}$ 公分`,fig:f.svg(),k:`h${p},${q}`};
  }
  let kind=pick(['tri','para','trap']),mode;   /* mode：area 求面積、h 求高、b 求底 */
  if(d===1)mode='area';else if(d===2)mode=R()<.5?'area':'h';else{mode='b';kind=R()<.5?'trap':'tri'}
  const b=ri(5,18),h=ri(3,12),a=kind==='trap'?ri(2,b-2):0;
  const obt=kind==='tri'&&(d===3||d===2&&R()<.3);          /* 鈍角三角形：高在外面 */
  const s=kind==='tri'?(obt?b+ri(2,5):ri(1,b-1)):kind==='para'?ri(2,Math.floor(b/2)):ri(0,b-a);
  const A2=kind==='tri'?b*h:kind==='para'?2*b*h:(a+b)*h;   /* 面積的 2 倍 */
  if(d===1&&A2%2||h>b||3*h<b)return null;                 /* 圖形不要太瘦長或太扁 */
  const pts=kind==='tri'?[V(0,0),V(b,0),V(s,h),V(s,0)]:[V(0,0),V(b,0),V(kind==='para'?b+s:s+a,h),V(s,h),V(s,0)];
  const S=fitPts(pts,160,110,18),B=S[0],C=S[1],Hf=S[S.length-1],A=kind==='tri'?S[2]:S[3],shape=kind==='tri'?[B,C,A]:[B,C,S[2],S[3]];
  f.poly(shape);
  if(s!==0)f.line(A,Hf,dash);
  if(obt)f.line(C,Hf,dash);
  f.right(Hf,A,obt?B:C,5);
  const bL=mode==='b'?'x':String(b),hL=mode==='h'?'x':String(h);
  f.text(vadd(vlerp(B,C,.5),V(0,9)),bL,bL==='x');
  const hLeft=s===0||kind==='tri'&&!obt&&2*s>b;    /* 高的標示放在空間較大的一側 */
  f.text(vadd(vlerp(A,Hf,.5),V(hLeft?-7:6,0)),hL,hL==='x');
  if(kind==='trap')f.text(vadd(vlerp(A,S[2],.5),V(0,-8)),String(a));
  const nm=NM[kind],area=e_num(A2*5,1),key=JSON.stringify([kind,b,a,h,s,mode]);
  if(mode==='area')return{q:`如圖，求${nm}的面積`,a:`$${area}$ 平方公分`,fig:f.svg(),k:key};
  if(mode==='h')return{q:`如圖，${nm}的面積是 $${area}$ 平方公分，求高 $x$`,a:`$x = ${h}$ 公分`,fig:f.svg(),k:key};
  return{q:`如圖，${nm}的面積是 $${area}$ 平方公分，求${kind==='trap'?'下底':'底'} $x$`,a:`$x = ${b}$ 公分`,fig:f.svg(),k:key};
}});

/* ---------- 小六 ---------- */
unit({id:'e-fracdiv',g:'小六',name:'分數的除法',instr:'計算下列各題，答案化成最簡分數（大於 1 時用帶分數表示）。',h:[16,22,28],gen(d){
  const ds=()=>ri(2,12);
  if(d===1){const f=ri(0,2),a=e_proper(ds());
    if(f===0){const n=ri(2,9);return{q:`$${ftex(a)} \\div ${n}$`,a:`$${e_mix(fdiv(a,F(n)))}$`}}
    if(f===1){const n=ri(2,12);return{q:`$${n} \\div ${ftex(a)}$`,a:`$${e_mix(fdiv(F(n),a))}$`}}
    const b=e_proper(ds());if(a.n===b.n&&a.d===b.d)return null;return{q:`$${ftex(a)} \\div ${ftex(b)}$`,a:`$${e_mix(fdiv(a,b))}$`};
  }
  if(d===2){const f=ri(0,3),a=e_mixed(ri(2,9),4);
    if(f===0){const n=ri(2,9);return{q:`$${mixtex(a)} \\div ${n}$`,a:`$${e_mix(fdiv(a,F(n)))}$`}}
    if(f===1){const b=e_proper(ds());return{q:`$${mixtex(a)} \\div ${ftex(b)}$`,a:`$${e_mix(fdiv(a,b))}$`}}
    if(f===2){const b=e_proper(ds());return{q:`$${ftex(b)} \\div ${mixtex(a)}$`,a:`$${e_mix(fdiv(b,a))}$`}}
    const n=ri(2,15);return{q:`$${n} \\div ${mixtex(a)}$`,a:`$${e_mix(fdiv(F(n),a))}$`};
  }
  const f=ri(0,3);
  if(f===0){const a=e_mixed(ri(2,9),4),b=e_mixed(ri(2,9),3),v=fdiv(a,b);if(v.d>40||a.n===b.n&&a.d===b.d)return null;return{q:`$${mixtex(a)} \\div ${mixtex(b)}$`,a:`$${e_mix(v)}$`}}
  if(f===1){const a=e_mixed(ri(2,8),3),b=e_proper(ds()),c=e_proper(ds()),v=fmul(fdiv(a,b),c);if(v.d>40)return null;return{q:`$${mixtex(a)} \\div ${ftex(b)} \\times ${ftex(c)}$`,a:`$${e_mix(v)}$`}}
  if(f===2){const c=e_proper(pick([3,4,5,6,8,10])),n=ri(3,15),T=fmul(c,F(n));if(T.n<T.d||T.d===1)return null;
    return{q:`把 $${e_mix(T)}$ 公升的果汁平均倒入杯子，每杯倒 $${ftex(c)}$ 公升，可以倒滿幾杯？`,a:`$${n}$ 杯`}}
  const Lm=e_mixed(ri(2,6),3),Wt=e_mixed(ri(2,9),5),v=fdiv(Wt,Lm);if(v.d>60)return null;
  return{q:`一條長 $${mixtex(Lm)}$ 公尺的鐵條重 $${mixtex(Wt)}$ 公斤，$1$ 公尺重幾公斤？`,a:`$${e_mix(v)}$ 公斤`};
}});

unit({id:'e-decdiv',g:'小六',name:'小數的除法',instr:'計算下列各題；題目要求取概數時，用四捨五入法。',h:[18,22,28],gen(d){
  if(d===1){const k=ri(1,2),q=k===1?e_rdec(11,199,1):e_rdec(101,999,2),b=ri(2,9);
    return{q:`$${e_num(q.n*b,k)} \\div ${b}$`,a:`$${e_ds(q)}$`}}
  if(d===2){const m=ri(0,2),y=m===0?e_rdec(2,9,1):m===1?e_rdec(11,99,1):e_rdec(11,99,2),q=R()<.4?{n:ri(2,60),k:0}:e_rdec(11,199,1);
    return{q:`$${e_num(y.n*q.n,y.k+q.k)} \\div ${e_ds(y)}$`,a:`$${e_ds(q)}$`}}
  const f=ri(0,2);
  if(f===0){const kA=ri(1,2),A=kA===1?e_rdec(101,999,1):e_rdec(1001,9999,2),B=R()<.6?{n:ri(3,9),k:0}:e_rdec(12,79,1),k=ri(1,2);
    const num=A.n*E_P10[B.k+k],den=B.n*E_P10[A.k];if(num%den===0)return null;
    return{q:`$${e_ds(A)} \\div ${e_ds(B)}$（商用四捨五入法取到小數第${k===1?'一':'二'}位）`,a:`約 $${e_fix(e_rdiv(num,den),k)}$`}}
  if(f===1){const s=e_rdec(2,9,1),bags=ri(5,30),rem=ri(1,s.n-1),N=s.n*bags+rem;
    return{q:`有 $${e_num(N,1)}$ 公斤的糖，每 $${e_ds(s)}$ 公斤裝成一包，最多可以裝成幾包？還剩下幾公斤？`,a:`$${bags}$ 包，剩下 $${e_num(rem,1)}$ 公斤`}}
  const t=pick([{n:5,k:1},{n:15,k:1},{n:25,k:1},{n:35,k:1},{n:45,k:1},{n:12,k:1},{n:24,k:1},{n:32,k:1},{n:125,k:2},{n:75,k:2}]),v=t.k===2?{n:ri(32,88),k:0}:e_rdec(301,899,1);
  return{q:`一輛汽車 $${e_ds(t)}$ 小時行駛了 $${e_num(t.n*v.n,t.k+v.k)}$ 公里，平均每小時行駛幾公里？`,a:`$${e_ds(v)}$ 公里`};
}});

unit({id:'e-ratio',g:'小六',name:'比與比值・速率',instr:'依題意作答。',h:[16,22,28],gen(d){
  if(d===1){const f=ri(0,2);
    if(f===0){const a=ri(2,30),b=ri(2,30);if(a===b)return null;return{q:`求 $${a} : ${b}$ 的比值`,a:`$${ftex(F(a,b))}$`}}
    if(f===1){const g=ri(2,12),p=ri(1,9),q=ri(1,9);if(p===q||gcd(p,q)!==1)return null;return{q:`把 $${g*p} : ${g*q}$ 化成最簡單的整數比`,a:`$${p} : ${q}$`}}
    const t=ri(2,6),v=ri(4,18)*5;return{q:`一輛機車 $${t}$ 小時行駛了 $${t*v}$ 公里，平均時速是多少公里？`,a:`時速 $${v}$ 公里`};
  }
  if(d===2){const f=ri(0,2);
    if(f===0){let qt,p,q;
      if(R()<.5){p=ri(1,9);q=ri(1,9);const g=ri(1,9);if(p===q||gcd(p,q)!==1||p*g>99||q*g>99)return null;qt=`${dec1(p*g)} : ${dec1(q*g)}`}
      else{const f1=e_proper(ri(2,9)),f2=e_proper(ri(2,9)),A=f1.n*f2.d,B=f2.n*f1.d,g=gcd(A,B);p=A/g;q=B/g;if(p===q)return null;qt=`${ftex(f1)} : ${ftex(f2)}`}
      return{q:`把 $${qt}$ 化成最簡單的整數比`,a:`$${p} : ${q}$`}}
    if(f===1){const m=ri(0,2);
      if(m===0){const x=ri(2,40)*25;return{q:`分速 $${x}$ 公尺是時速多少公里？`,a:`時速 $${e_num(x*60,3)}$ 公里`}}
      if(m===1){const v=3*ri(2,30);return{q:`時速 $${v}$ 公里是分速多少公尺？`,a:`分速 $${v*50/3}$ 公尺`}}
      const s=ri(2,30);return{q:`秒速 $${s}$ 公尺是分速多少公尺？是時速多少公里？`,a:`分速 $${e_num(s*60)}$ 公尺，時速 $${e_num(s*3600,3)}$ 公里`}}
    const v=ri(10,30)*10,m=ri(5,40);return{q:`小華騎腳踏車 $${m}$ 分鐘騎了 $${e_num(v*m,3)}$ 公里，平均分速是多少公尺？`,a:`分速 $${v}$ 公尺`};
  }
  const f=ri(0,3);
  if(f===0){const p=ri(1,9),q=ri(1,9),k=ri(2,30)*pick([1,10]);if(p===q||gcd(p,q)!==1)return null;
    return{q:`姊姊和妹妹依 $${p} : ${q}$ 的比分 $${e_num((p+q)*k)}$ 元，姊姊和妹妹各分得多少元？`,a:`姊姊 $${e_num(p*k)}$ 元，妹妹 $${e_num(q*k)}$ 元`}}
  if(f===1){const v=ri(4,18)*5,T=ri(14,60)*5,D=v*T;if(D%60||T%60===0)return null;
    return{q:`一輛汽車以時速 $${v}$ 公里行駛 $${D/60}$ 公里，需要幾小時幾分鐘？`,a:`$${Math.floor(T/60)}$ 小時 $${T%60}$ 分鐘`}}
  if(f===2){const v=ri(8,24)*5,h=ri(1,3),m=pick([10,15,20,30,40,45,50]),num=v*(60*h+m);if(num%6)return null;
    return{q:`一輛汽車的時速是 $${v}$ 公里，行駛了 $${h}$ 小時 $${m}$ 分鐘，共行駛了多少公里？`,a:`$${e_num(num/6,1)}$ 公里`}}
  const p=ri(1,9),q=ri(1,9),k=ri(2,40);if(p===q||gcd(p,q)!==1)return null;
  return{q:`甲、乙兩數的比是 $${p} : ${q}$，甲數是 $${p*k}$，乙數是多少？`,a:`$${q*k}$`};
}});

unit({id:'e-circle',g:'小六',name:'圓周長與圓面積',instr:'依題意作答（圓周率用 3.14）。',h:[18,22,28],gen(d){
  if(d===1){const f=ri(0,3),r=ri(2,20);
    if(f===0){const D=ri(2,30);return{q:`直徑 $${D}$ 公分的圓，圓周長是多少公分？`,a:`$${e_num(D*314,2)}$ 公分`}}
    if(f===1)return{q:`半徑 $${r}$ 公分的圓，圓周長是多少公分？`,a:`$${e_num(2*r*314,2)}$ 公分`};
    if(f===2)return{q:`半徑 $${r}$ 公分的圓，面積是多少平方公分？`,a:`$${e_num(r*r*314,2)}$ 平方公分`};
    return{q:`直徑 $${2*r}$ 公分的圓，面積是多少平方公分？`,a:`$${e_num(r*r*314,2)}$ 平方公分`};
  }
  if(d===2){const f=ri(0,4),r=ri(2,20);
    if(f===0)return{q:`直徑 $${2*r}$ 公分的半圓，周長是多少公分？`,a:`$${e_num(2*r*257,2)}$ 公分`};
    if(f===1)return{q:`半徑 $${r}$ 公分的半圓，面積是多少平方公分？`,a:`$${e_num(r*r*157,2)}$ 平方公分`};
    if(f===2)return{q:`半徑 $${r}$ 公分的 $\\frac{1}{4}$ 圓（扇形），面積是多少平方公分？`,a:`$${e_num(r*r*785,3)}$ 平方公分`};
    if(f===3)return{q:`半徑 $${r}$ 公分的 $\\frac{1}{4}$ 圓（扇形），周長是多少公分？`,a:`$${e_num(r*357,2)}$ 公分`};
    const D=ri(2,30);return{q:`一個圓的圓周長是 $${e_num(D*314,2)}$ 公分，它的直徑是多少公分？`,a:`$${D}$ 公分`};
  }
  const f=ri(0,3),r=ri(2,15);
  if(f===0)return{q:`一個圓的圓周長是 $${e_num(2*r*314,2)}$ 公分，它的面積是多少平方公分？`,a:`$${e_num(r*r*314,2)}$ 平方公分`};
  if(f===1)return{q:`在邊長 $${2*r}$ 公分的正方形內畫一個最大的圓，正方形剩下的面積是多少平方公分？`,a:`$${e_num(4*r*r*100-r*r*314,2)}$ 平方公分`};
  if(f===2){const r2=r+ri(1,8);return{q:`一個圓環的外圓半徑 $${r2}$ 公分、內圓半徑 $${r}$ 公分，圓環的面積是多少平方公分？`,a:`$${e_num((r2*r2-r*r)*314,2)}$ 平方公分`}}
  const L=ri(5,20)*10,D=ri(3,8)*10;
  return{q:`操場的兩端是半圓形，中間是長方形；長方形的長 $${L}$ 公尺，兩端半圓的直徑都是 $${D}$ 公尺。操場一圈的周長是多少公尺？`,a:`$${e_num(2*L*100+D*314,2)}$ 公尺`};
}});

unit({id:'e-percent',g:'小六',name:'百分率與折扣',instr:'依題意作答。',h:[16,20,26],gen(d){
  if(d===1){const f=ri(0,4);
    if(f===0){const n=R()<.8?ri(1,99):ri(101,250);if(n%10===0&&R()<.5)return null;return{q:`把 $${e_num(n,2)}$ 化成百分率`,a:`$${n}\\%$`}}
    if(f===1){const a=e_proper(pick([2,4,5,10,20,25,50]));return{q:`把 $${ftex(a)}$ 化成百分率`,a:`$${a.n*100/a.d}\\%$`}}
    if(f===2){const p=ri(1,150);return{q:`把 $${p}\\%$ 化成小數`,a:`$${e_num(p,2)}$`}}
    if(f===3){const p=ri(1,99);return{q:`把 $${p}\\%$ 化成最簡分數`,a:`$${ftex(F(p,100))}$`}}
    const p=ri(2,60)*10,k=ri(5,9);return{q:`一件衣服原價 $${p}$ 元，打 $${k}$ 折後賣多少元？`,a:`$${p*k/10}$ 元`};
  }
  if(d===2){const f=ri(0,3);
    if(f===0){const k=pick([95,85,75,65,88,78]),p=ri(2,60)*20;if(p*k%100)return null;return{q:`一雙鞋原價 $${e_num(p)}$ 元，打 $${k}$ 折後賣多少元？`,a:`$${e_num(p*k/100)}$ 元`}}
    if(f===1){const n=pick([20,25,40,50]),m=ri(1,n-1);if(m*100%n)return null;return{q:`全班 $${n}$ 人，其中男生 $${m}$ 人，男生占全班的百分之幾？`,a:`$${m*100/n}\\%$`}}
    if(f===2){const a=ri(2,60)*10,b=pick([5,10,15,20,25,30,40,60,75]);return{q:`$${a}$ 的 $${b}\\%$ 是多少？`,a:`$${e_num(a*b,2)}$`}}
    const k=ri(5,9),p=ri(2,50)*10;return{q:`原價 $${p}$ 元的書包，便宜了 $${p*(10-k)/10}$ 元出售，相當於打幾折？`,a:`打 $${k}$ 折`};
  }
  const f=ri(0,3);
  if(f===0){const k=pick([9,8,7,6,75,85,65]),p=ri(3,60)*20,div=k<10?10:100;if(p*k%div)return null;
    return{q:`一個商品打 $${k}$ 折後賣 $${e_num(p*k/div)}$ 元，原價是多少元？`,a:`$${e_num(p)}$ 元`}}
  if(f===1){const k=pick([9,8,7,6,5,95,85,75,65,55]),p=ri(3,60)*20,div=k<10?10:100;if(p*k%div)return null;
    return{q:`一件外套原價 $${e_num(p)}$ 元，特價 $${e_num(p*k/div)}$ 元，是打幾折？`,a:`打 $${k}$ 折`}}
  if(f===2){const a=ri(4,60)*20,b=pick([5,10,15,20,25,30]);if(a*b%100)return null;const up=R()<.5;
    return{q:`某校去年有學生 $${e_num(a)}$ 人，今年比去年${up?'增加':'減少'}了 $${b}\\%$，今年有學生多少人？`,a:`$${e_num(up?a+a*b/100:a-a*b/100)}$ 人`}}
  const p=ri(10,80)*10,k=ri(6,9),c=pick([20,30,50,100]),s=p*k/10-c;if(s<=0)return null;
  return{q:`一臺吹風機原價 $${e_num(p)}$ 元，先打 $${k}$ 折，再折價 $${c}$ 元，售價是多少元？`,a:`$${e_num(s)}$ 元`};
}});

function h_surd(a,b,m,c=1){ /* (a + b√m)/c 化簡後的 TeX */
  if(m===0)b=0;
  if(b!==0){const s=sqrtSimp(m);b*=s[0];m=s[1];if(m===1){a+=b;b=0}}
  if(c<0){a=-a;b=-b;c=-c}
  const g=gcd(gcd(a,b),c)||1;a/=g;b/=g;c/=g;
  if(b===0)return ftex(F(a,c));
  const r=rad(Math.abs(b),m);
  if(a===0)return c===1?(b<0?'-':'')+r:`${b<0?'-':''}\\frac{${r}}{${c}}`;
  if(a<0&&b<0&&c>1)return`-\\frac{${-a} + ${r}}{${c}}`;
  const num=`${a} ${b>0?'+':'-'} ${r}`;return c===1?num:`\\frac{${num}}{${c}}`;
}
/* (x-lo)(x-hi) op 0 的解（lo<hi，皆為 TeX 字串） */
function h_q2(lo,hi,op){
  if(op==='<')return`$${lo} < x < ${hi}$`;
  if(op==='\\leqq')return`$${lo} \\leqq x \\leqq ${hi}$`;
  if(op==='>')return`$x < ${lo}$ 或 $x > ${hi}$`;
  return`$x \\leqq ${lo}$ 或 $x \\geqq ${hi}$`;
}
const h_flt=(p,q)=>p.n*q.d<q.n*p.d;
const h_ptex=(c,v='x')=>{const n=c.length-1;return poly(c.map((k,i)=>[k,n-i>1?`${v}^{${n-i}}`:n-i===1?v:'']))};
const h_pmul=(A,B)=>{const r=Array(A.length+B.length-1).fill(0);A.forEach((x,i)=>B.forEach((y,j)=>{r[i+j]+=x*y}));return r};
const h_peval=(c,x)=>c.reduce((s,k)=>s*x+k,0);
const h_pevalF=(c,x)=>c.reduce((s,k)=>fadd(fmul(s,x),F(k)),F(0));
const h_tail=t=>{const s=poly(t);return s==='0'?'':s[0]==='-'?' - '+s.slice(1):' + '+s};
const h_fx=v=>v===0?'x':`(${lin(1,-v)})`;
const h_fact=n=>{let r=1;for(let i=2;i<=n;i++)r*=i;return r};
const h_P=(n,k)=>{let r=1;for(let i=0;i<k;i++)r*=n-i;return r};
const h_C=(n,k)=>{if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return r};
const h_cm=v=>commas(String(v));
function h_norm(A,B,C){const g=gcd(gcd(A,B),C)||1;A/=g;B/=g;C/=g;if(A<0||(A===0&&B<0)){A=-A;B=-B;C=-C}return[A+0,B+0,C+0]}
const h_leq=(A,B,C)=>{const [a,b,c]=h_norm(A,B,C);return`${poly([[a,'x'],[b,'y'],[c,'']])} = 0`};
const h_sq=(v,c)=>c===0?`${v}^2`:`(${lin(1,-c,v)})^2`;
const h_cstd=(h,k,r2)=>`${h_sq('x',h)} + ${h_sq('y',k)} = ${r2}`;
const h_cgen=(h,k,r2)=>`${poly([[1,'x^2'],[1,'y^2'],[-2*h,'x'],[-2*k,'y'],[h*h+k*k-r2,'']])} = 0`;
const h_abs=s=>`\\left|${s}\\right|`;
const h_pw=(t,q)=>q>=0?F(t**q):F(1,t**(-q));          // t^q 的分數
const h_pi=f=>{if(f.n===0)return'0';const s=f.n<0?'-':'',N=Math.abs(f.n);return f.d===1?`${s}${N===1?'':N}\\pi`:`${s}\\frac{${N===1?'':N}\\pi}{${f.d}}`};
/* 特殊角三角比 [sin, cos, tan]，每個是 h_surd 參數 [a,b,m,c] */
const h_T={0:[[0,0,1,1],[1,0,1,1],[0,0,1,1]],30:[[1,0,1,2],[0,1,3,2],[0,1,3,3]],45:[[0,1,2,2],[0,1,2,2],[1,0,1,1]],
  60:[[0,1,3,2],[1,0,1,2],[0,1,3,1]],90:[[1,0,1,1],[0,0,1,1],null],120:[[0,1,3,2],[-1,0,1,2],[0,-1,3,1]],
  135:[[0,1,2,2],[0,-1,2,2],[-1,0,1,1]],150:[[1,0,1,2],[0,-1,3,2],[0,-1,3,3]],180:[[0,0,1,1],[-1,0,1,1],[0,0,1,1]]};
const h_tv=t=>h_surd(...t);
const h_FN=['\\sin','\\cos','\\tan'];
/* sin θ（θ 為 30~150 的特殊角）寫成 r√m，r 為分數 */
const h_sinRM=th=>{const [a,b,m,c]=h_T[th][0];return b===0?{r:F(a,c),m:1}:{r:F(b,c),m}};
function h_r62(a,b){if(a>0)return`\\frac{\\sqrt{6} ${b>0?'+':'-'} \\sqrt{2}}{4}`;if(b>0)return`\\frac{\\sqrt{2} - \\sqrt{6}}{4}`;return`-\\frac{\\sqrt{6} + \\sqrt{2}}{4}`}
/* 15° 的奇數倍角之 sin/cos/tan 精確值（以數值比對四種符號組合） */
function h_15(th,fn){const r=th*Math.PI/180;
  if(fn===2){const v=Math.tan(r);for(const a of[2,-2])for(const b of[1,-1])if(Math.abs(a+b*Math.sqrt(3)-v)<1e-9)return h_surd(a,b,3,1);return null}
  const v=fn===0?Math.sin(r):Math.cos(r);for(const a of[1,-1])for(const b of[1,-1])if(Math.abs((a*Math.sqrt(6)+b*Math.sqrt(2))/4-v)<1e-9)return h_r62(a,b);return null}
const h_lg=(b,arg)=>b===10?`\\log ${arg}`:`\\log_{${b}} ${arg}`;
const h_va='\\overrightarrow{a}',h_vb='\\overrightarrow{b}',h_vc='\\overrightarrow{c}';
const h_pt3=(x,y,z)=>`(${x}, ${y}, ${z})`;
const h_bm=M=>`\\begin{bmatrix} ${M[0][0]} & ${M[0][1]} \\\\ ${M[1][0]} & ${M[1][1]} \\end{bmatrix}`;
const h_vm=M=>`\\begin{vmatrix} ${M[0][0]} & ${M[0][1]} \\\\ ${M[1][0]} & ${M[1][1]} \\end{vmatrix}`;
const h_mm=(A,B)=>[[A[0][0]*B[0][0]+A[0][1]*B[1][0],A[0][0]*B[0][1]+A[0][1]*B[1][1]],[A[1][0]*B[0][0]+A[1][1]*B[1][0],A[1][0]*B[0][1]+A[1][1]*B[1][1]]];
const h_rm=(a=-6,b=6)=>[[ri(a,b),ri(a,b)],[ri(a,b),ri(a,b)]];
function h_inv(M){const [[a,b],[c,dd]]=M,D=a*dd-b*c;let N=[[dd,-b],[-c,a]],den=D;if(den<0){den=-den;N=N.map(r=>r.map(x=>-x))}
  const g=gcd(gcd(gcd(N[0][0],N[0][1]),gcd(N[1][0],N[1][1])),den)||1;den/=g;N=N.map(r=>r.map(x=>x/g+0));return den===1?h_bm(N):`\\frac{1}{${den}}${h_bm(N)}`}
/* cos θ 若為特殊值，回傳角度 */
function h_angOf(cv){for(const t of[0,30,45,60,90,120,135,150,180]){const [a,b,m,c]=h_T[t][1];if(Math.abs((a+b*Math.sqrt(m))/c-cv)<1e-9)return t}return null}
function h_expo(d){const r=pick([2,3]),n=d===2?2:3,ks=r===2?[1,2,3,4,5]:[1,2,3,4];let E=F(0),tex='';const conv=[];let es='';
  for(let i=0;i<n;i++){const k=pick(ks),e=F(rnz(-5,5),pick([2,3,4]));if(e.d===1)return null;const op=i===0?1:(R()<.6?1:-1);
    E=op>0?fadd(E,fmul(F(k),e)):fsub(E,fmul(F(k),e));
    tex+=(i===0?'':op>0?' \\times ':' \\div ')+`${r**k}^{${ftex(e)}}`;
    const ke=fmul(F(k),e);conv.push(k===1?`${r}^{${ftex(e)}}`:`${r**k}^{${ftex(e)}} = (${r}^{${k}})^{${ftex(e)}} = ${r}^{${ftex(ke)}}`);
    es+=i===0?ftex(ke):(op>0?' + ':' - ')+h_pf(ke)}
  if(E.d!==1||E.n===0||Math.abs(E.n)>(r===2?9:6))return null;
  const ans=`$${ftex(h_pw(r,E.n))}$`;
  return{q:`$${tex}$`,a:ans,e:h_ln([`把每一項都化成以 $${r}$ 為底：$${conv.join('$，$')}$。`,`同底數相乘，指數相加；相除，指數相減：指數 $= ${es} = ${E.n}$。`,
    `所以原式 $= ${r}^{${E.n}}${E.n<0?` = \\frac{1}{${r}^{${-E.n}}}`:''} = ${ftex(h_pw(r,E.n))}$。`],ans)};
}

const h_ln=(L,ans)=>[...L.filter(Boolean).map((s,i)=>'①②③④⑤⑥⑦⑧⑨⑩'[i]+' '+s),`所以答案是 ${ans}。`].join('\n');
const h_dv=(n,m)=>{if(m<0){n=-n;m=-m}if(m===1)return`${n}`;const raw=n<0?`-\\frac{${-n}}{${m}}`:`\\frac{${n}}{${m}}`,s=ftex(F(n,m));return s===raw?raw:`${raw} = ${s}`};
const h_rt=n=>{const [a,m]=sqrtSimp(n);return m===1?`\\sqrt{${n}} = ${a}`:a>1?`\\sqrt{${n}} = ${rad(a,m)}`:`\\sqrt{${n}}`};
const h_pp=x=>x<0?`(${x})`:`${x}`;
const h_pf=f=>f.n<0?`\\left(${ftex(f)}\\right)`:ftex(f);
const h_xf=f=>f.d===1?P(f.n):`\\left(${ftex(f)}\\right)`;
const h_psub=(c,xt)=>{const n=c.length-1;let s='';if(/^\d/.test(xt))xt=`(${xt})`;  // 代入正數也加括號，免得 -1^{3} 看成 -(1^3)
  c.forEach((k,i)=>{if(k===0)return;const j=n-i,ab=Math.abs(k),pw=j===0?'':j===1?xt:`${xt}^{${j}}`,body=j===0?`${ab}`:ab===1?pw:`${ab} \\times ${pw}`;s+=s===''?(k<0?'-':'')+body:(k<0?' - ':' + ')+body});return s||'0'};
const h_fsum=fs=>{let s='';fs.forEach((f,i)=>{s+=i===0?ftex(f):f.n<0?` - ${ftex(F(-f.n,f.d))}`:` + ${ftex(f)}`});return s||'0'};
const h_fpoly=ts=>{let s='';for(const [f,v] of ts){if(f.n===0)continue;const ab=F(Math.abs(f.n),f.d),body=v&&ab.n===1&&ab.d===1?v:ftex(ab)+v;s+=s===''?(f.n<0?'-':'')+body:(f.n<0?' - ':' + ')+body}return s||'0'};
const h_qexp=op=>op==='<'||op==='\\leqq'?`要「${op==='<'?'小於':'小於或等於'} $0$」，取兩根之間${op==='\\leqq'?'（含兩根）':''}`:`要「${op==='>'?'大於':'大於或等於'} $0$」，取兩根的外側${op==='\\geqq'?'（含兩根）':''}`;

const h_fk=(p,q)=>q===0?(p===1?'k':`${p}k`):`(${lin(p,q,'k')})`;
const h_s1=n=>n*(n+1)/2, h_s2=n=>n*(n+1)*(2*n+1)/6;
const h_sbody=t=>{const s=poly(t);return t.filter(x=>x[0]!==0).length>1?`\\left(${s}\\right)`:s};
const c_ptex=(cs,v='x')=>poly(cs.map((c,i)=>{const e=cs.length-1-i;return[c,e===0?'':e===1?v:`${v}^{${e}}`]}));
const c_peval=(cs,x)=>cs.reduce((s,c)=>s*x+c,0);
function c_pmul(a,b){const r=Array(a.length+b.length-1).fill(0);a.forEach((p,i)=>b.forEach((q,j)=>{r[i+j]+=p*q}));return r}
function c_pdiv(n,dv){const a=n.slice(),q=[];for(let i=0;i<=a.length-dv.length;i++){const t=a[i]/dv[0];q.push(t);for(let j=0;j<dv.length;j++)a[i+j]-=t*dv[j]}return[q,a.slice(a.length-dv.length+1)]}
const c_pder=cs=>cs.slice(0,-1).map((c,i)=>c*(cs.length-1-i));
function c_pint(cs,a,b){let s=F(0);cs.forEach((c,i)=>{const e=cs.length-1-i;s=fadd(s,F(c*(b**(e+1)-a**(e+1)),e+1))});return s}
const c_fabs=f=>F(Math.abs(f.n),f.d);
/* (a + b√m)/c，m 無平方因數 */
function c_surd(a,b,m,c=1){
  if(b===0)return ftex(F(a,c));
  if(m===1)return ftex(F(a+b,c));
  if(c<0){a=-a;b=-b;c=-c}
  const g=gcd(gcd(a,b),c);a/=g;b/=g;c/=g;
  const rt=`${Math.abs(b)===1?'':Math.abs(b)}\\sqrt{${m}}`;
  if(a===0)return c===1?`${b<0?'-':''}${rt}`:`${b<0?'-':''}\\frac{${rt}}{${c}}`;
  if(a<0&&b<0&&c>1)return`-\\frac{${-a} + ${rt}}{${c}}`;
  const num=`${a} ${b<0?'-':'+'} ${rt}`;
  return c===1?num:`\\frac{${num}}{${c}}`;
}
/* N / (D√s)，分母有理化 */
function c_divSqrt(N,s,D=1){if(N===0)return'0';const [k,m]=sqrtSimp(s);return c_surd(0,N,m,D*k*m)}
/* √(n/d) */
function c_sqrtFrac(n,d){const f=F(n,d);if(f.n===0)return'0';const [k,m]=sqrtSimp(f.n*f.d);return c_surd(0,k,m,f.d)}
const c_pi=f=>{if(f.n===0)return'0';const s=f.n<0?'-':'',N=Math.abs(f.n),num=N===1?'\\pi':`${N}\\pi`;return f.d===1?s+num:`${s}\\frac{${num}}{${f.d}}`};
const c_angTex=(t,useRad)=>{const s=useRad?c_pi(F(t,180)):deg(t);return t<0?`\\left(${s}\\right)`:` ${s}`};
function c_ineqAns(op,lo,hi){
  if(op==='>')return`$x < ${lo}$ 或 $x > ${hi}$`;
  if(op==='\\geqq')return`$x \\leqq ${lo}$ 或 $x \\geqq ${hi}$`;
  if(op==='<')return`$${lo} < x < ${hi}$`;
  return`$${lo} \\leqq x \\leqq ${hi}$`;
}
const C_S={0:'0',30:'\\frac{1}{2}',45:'\\frac{\\sqrt{2}}{2}',60:'\\frac{\\sqrt{3}}{2}',90:'1'},C_TN={0:'0',30:'\\frac{\\sqrt{3}}{3}',45:'1',60:'\\sqrt{3}',90:null};
function c_ref(t){const a=((t%360)+360)%360;if(a<=90)return[a,1,1];if(a<=180)return[180-a,1,-1];if(a<=270)return[a-180,-1,-1];return[360-a,-1,1]}
function c_trigVal(fn,t){const [r,ss,cs]=c_ref(t);const sg=(v,s)=>v==='0'||v===null?v:s<0?'-'+v:v;
  if(fn==='sin')return sg(C_S[r],ss);if(fn==='cos')return sg(C_S[90-r],cs);return sg(C_TN[r],ss*cs)}
function c_trig2(fn,t){const [r]=c_ref(t);const S2={0:F(0),30:F(1,4),45:F(1,2),60:F(3,4),90:F(1)},T2={0:F(0),30:F(1,3),45:F(1),60:F(3)};
  return fn==='sin'?S2[r]:fn==='cos'?S2[90-r]:(r===90?null:T2[r])}
function c_tv15(fn,t){const [r,ss,cs]=c_ref(t),i=s=>s>0?0:1;
  const lo=['\\frac{\\sqrt{6} - \\sqrt{2}}{4}','\\frac{\\sqrt{2} - \\sqrt{6}}{4}'],hi=['\\frac{\\sqrt{6} + \\sqrt{2}}{4}','-\\frac{\\sqrt{6} + \\sqrt{2}}{4}'];
  if(fn==='sin')return r===15?lo[i(ss)]:hi[i(ss)];
  if(fn==='cos')return r===15?hi[i(cs)]:lo[i(cs)];
  return r===15?['2 - \\sqrt{3}','\\sqrt{3} - 2'][i(ss*cs)]:['2 + \\sqrt{3}','-2 - \\sqrt{3}'][i(ss*cs)]}
/* 以畢氏三元數給定象限角的 sin、cos、tan */
function c_qtri(Qs=[1,2,3,4]){const [x,y,r]=pick(TRI),sw=R()<.5,X=sw?x:y,Y=sw?y:x,Q=pick(Qs),ss=Q<=2?1:-1,cs=Q===1||Q===4?1:-1;
  return{Q,s:F(ss*Y,r),c:F(cs*X,r),t:F(ss*Y,cs*X),qn:`第${'一二三四'[Q-1]}象限`}}
const C_QN=q=>`第${'一二三四'[q-1]}象限`;
const c_va='\\overrightarrow{a}',c_vb='\\overrightarrow{b}',c_vc='\\overrightarrow{c}';
const c_v=v=>`(${v.join(', ')})`;
const c_dot=(u,v)=>u.reduce((s,x,i)=>s+x*v[i],0);
const c_cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const c_det3=M=>M[0][0]*(M[1][1]*M[2][2]-M[1][2]*M[2][1])-M[0][1]*(M[1][0]*M[2][2]-M[1][2]*M[2][0])+M[0][2]*(M[1][0]*M[2][1]-M[1][1]*M[2][0]);
const c_vm=rows=>`\\begin{vmatrix} ${rows.map(r=>r.join(' & ')).join(' \\\\ ')} \\end{vmatrix}`;
const c_bm=rows=>`\\begin{bmatrix} ${rows.map(r=>r.join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
const c_mm=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((s,x,k)=>s+x*B[k][j],0)));
function c_lineEq(a,b,c){if(a<0||(a===0&&b<0)){a=-a;b=-b;c=-c}const g=gcd(gcd(a,b),c)||1;return`${poly([[a/g,'x'],[b/g,'y'],[c/g,'']])} = 0`}
const c_circStd=(h,k,r2)=>`${h===0?'x^2':`(${lin(1,-h)})^2`} + ${k===0?'y^2':`(${lin(1,-k,'y')})^2`} = ${r2}`;
const c_fact=n=>{let s=1;for(let i=2;i<=n;i++)s*=i;return s};
const c_P=(n,k)=>{let s=1;for(let i=0;i<k;i++)s*=n-i;return s};
const c_C=(n,k)=>{if(k<0||k>n)return 0;let s=1;for(let i=1;i<=k;i++)s=s*(n-k+i)/i;return Math.round(s)};
const c_num=v=>commas(String(v));
function c_shift(M,e){const s=String(M);if(e>=0)return commas(s+'0'.repeat(e));const k=-e;if(s.length>k)return`${commas(s.slice(0,s.length-k))}.${s.slice(s.length-k)}`;return'0.'+'0'.repeat(k-s.length)+s}
const c_dec4=v=>{const s=v<0?'-':'',a=Math.abs(v);return`${s}${Math.floor(a/10000)}.${String(a%10000).padStart(4,'0')}`};
const C_LG={2:3010,3:4771,5:6990,6:7781,12:10791,18:12552};
const C_LGHINT='已知 $\\log 2 = 0.3010$，$\\log 3 = 0.4771$，';
const c_fac=(a,b)=>`(${lin(a,b)})`;

const C_T1=[0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330,360];
function c_fsum(p,a,s,q,b){
  const A=p+s*q,B=-(p*b+s*q*a);if(A===0&&B===0)return null;if(A!==0&&(B===-A*a||B===-A*b))return null;
  return{q:`$\\frac{${p}}{${lin(1,-a)}} ${s>0?'+':'-'} \\frac{${q}}{${lin(1,-b)}}$`,a:`$${A<0?'-':''}\\frac{${A<0?lin(-A,-B):lin(A,B)}}{(${lin(1,-a)})(${lin(1,-b)})}$`}}
const C_SQF=[2,3,5,6,7,10,11,13];
const C_A15=[15,75,105,165,195,255,285,345,-15,-75];
const C_SQ={30:1,45:2,60:3,90:4,120:3,135:2,150:1};
const hx_pt=(...a)=>`(${a.join(', ')})`;
const hx_fp=(...fs)=>`(${fs.map(ftex).join(', ')})`;
const hx_bm=M=>`\\begin{bmatrix} ${M.map(r=>r.join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
const hx_vec=s=>`\\overrightarrow{${s}}`;
const hx_plane=(a,b,c,d)=>`${poly([[a,'x'],[b,'y'],[c,'z']])} = ${d}`;
function hx_norm(a,b,c,d){let g=gcd(gcd(gcd(a,b),c),d)||1;const s=(a||b||c)<0?-1:1;return[a/g*s,b/g*s,c/g*s,d/g*s]}
const hx_mul=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((s,x,k)=>s+x*B[k][j],0)));
const hx_rand=(r,c,lo,hi)=>Array.from({length:r},()=>Array.from({length:c},()=>ri(lo,hi)));

const HX_HARM=[[30,'\\sqrt{3}','1','2'],[60,'1','\\sqrt{3}','2'],[120,'-1','\\sqrt{3}','2'],[150,'-\\sqrt{3}','1','2'],[210,'-\\sqrt{3}','-1','2'],[240,'-1','-\\sqrt{3}','2'],[300,'1','-\\sqrt{3}','2'],[330,'\\sqrt{3}','-1','2'],[45,'1','1','\\sqrt{2}'],[135,'-1','1','\\sqrt{2}'],[225,'-1','-1','\\sqrt{2}'],[315,'1','-1','\\sqrt{2}']];
function hx_sc(a,b){const ca=a==='1'?'':a==='-1'?'-':a,neg=b.startsWith('-'),bb=b.replace(/^-/,'');return`${ca}\\sin x ${neg?'-':'+'} ${bb==='1'?'':bb}\\cos x`}
const HX_N=[[1,2,2,3],[2,1,2,3],[2,2,1,3],[1,4,8,9],[4,4,7,9],[2,3,6,7],[2,6,3,7],[3,2,6,7],[6,2,3,7],[3,6,2,7]];
const hx_line=(A,v)=>`\\begin{cases} x = ${poly([[A[0],''],[v[0],'t']])} \\\\ y = ${poly([[A[1],''],[v[1],'t']])} \\\\ z = ${poly([[A[2],''],[v[2],'t']])} \\end{cases}`;
/* 高斯消去法的逐步詳解（M 為係數、X 為解） */
function hx_gauss(M,X){
  const rows=M.map(r=>[...r,r[0]*X[0]+r[1]*X[1]+r[2]*X[2]]);
  const eqT=r=>`${poly([[r[0],'x'],[r[1],'y'],[r[2],'z']])} = ${r[3]}`;
  const red=r=>{const g=r.reduce((s,x)=>gcd(s,x),0)||1,lead=r.slice(0,3).find(x=>x!==0),s=lead<0?-1:1;return r.map(x=>x/g*s+0)};
  const mul=(lab,k)=>k===1?`(${lab})`:`(${lab}) \\times ${h_pp(k)}`;
  const elim=(rj,lj,rp,lp,k,lab)=>{if(rj[k]===0)return{r:rj,t:`(${lj}) 本來就沒有 $${'xyz'[k]}$，直接記為 (${lab})：$${eqT(rj)}$`};
    const l=lcm(Math.abs(rj[k]),Math.abs(rp[k])),cj=l/rj[k],cp=l/rp[k],r=red(rj.map((x,i)=>cj*x-cp*rp[i]));
    return{r,t:`$${mul(lj,cj)} - ${mul(lp,cp)}$，整理得 (${lab})：$${eqT(r)}$`}};
  const L=[`三式依序記為 (1)、(2)、(3)，先消去 $x$，再消去 $y$，最後回代。`];
  const cx=[0,1,2].filter(i=>rows[i][0]!==0),p=cx.reduce((b,i)=>Math.abs(rows[i][0])<Math.abs(rows[b][0])?i:b,cx[0]),oth=[0,1,2].filter(i=>i!==p);
  const E4=elim(rows[oth[0]],oth[0]+1,rows[p],p+1,0,4),E5=elim(rows[oth[1]],oth[1]+1,rows[p],p+1,0,5);
  L.push(`用 (${p+1}) 消去 $x$：${E4.t}；${E5.t}。`);
  const two=[[E4.r,4],[E5.r,5]],cy=two.filter(t=>t[0][1]!==0),[ry,ly]=cy.reduce((b,t)=>Math.abs(t[0][1])<Math.abs(b[0][1])?t:b,cy[0]),[ro,lo]=two.find(t=>t[1]!==ly);
  const E6=elim(ro,lo,ry,ly,1,6);L.push(`用 (${ly}) 消去 $y$：${E6.t}。`);
  const r6=E6.r;L.push(r6[2]===1?`由 (6) 直接得到 $z = ${X[2]}$。`:`由 (6)：$${poly([[r6[2],'z']])} = ${r6[3]}$，得 $z = ${X[2]}$。`);
  L.push(`代入 (${ly})：$${poly([[ry[1],'y']])} = ${ry[3]} - ${h_pp(ry[2]*X[2])} = ${ry[1]*X[1]}$，得 $y = ${X[1]}$。`);
  const rp=rows[p];L.push(`代入 (${p+1})：$${poly([[rp[0],'x']])} = ${rp[3]} - ${h_pp(rp[1]*X[1])} - ${h_pp(rp[2]*X[2])} = ${rp[0]*X[0]}$，得 $x = ${X[0]}$。`);
  return L;
}
const HX_V={0:['0','1','0'],30:['\\frac{1}{2}','\\frac{\\sqrt{3}}{2}','\\frac{\\sqrt{3}}{3}'],45:['\\frac{\\sqrt{2}}{2}','\\frac{\\sqrt{2}}{2}','1'],60:['\\frac{\\sqrt{3}}{2}','\\frac{1}{2}','\\sqrt{3}'],90:['1','0',null]};
function hx_trig(fn,th){const t=((th%360)+360)%360;let ref=t<=90?t:t<=180?180-t:t<=270?t-180:360-t;const q=t<90?1:t<180?2:t<270?3:4;
  const i={sin:0,cos:1,tan:2}[fn],v=HX_V[ref][i];if(v===null)return null;if(v==='0')return'0';
  const pos=fn==='sin'?(q===1||q===2):fn==='cos'?(q===1||q===4):(q===1||q===3);const onAxis=t%90===0;
  const sign=onAxis?(fn==='sin'?(t===270?-1:1):(t===180?-1:1)):(pos?1:-1);return sign<0?'-'+v:v}
const hx_pi=(n,dd)=>{const f=F(n,dd);if(f.n===0)return'0';const top=Math.abs(f.n)===1?'\\pi':`${Math.abs(f.n)}\\pi`;return`${f.n<0?'-':''}${f.d===1?top:`\\frac{${top}}{${f.d}}`}`};
const HX_LOG={'1.05':0.0212,'1.08':0.0334,'1.1':0.0414,'1.2':0.0792};
const hx_fr=(n,d)=>`\\frac{${n}}{${d}}`;
const h3_pi=f=>f.n===0?'0':`${f.n<0?'-':''}${f.d===1?(Math.abs(f.n)===1?'':Math.abs(f.n)):`\\frac{${Math.abs(f.n)}}{${f.d}}`}\\pi`;
const h3_pn=(terms)=>poly(terms);           // 以 n 為變數的多項式
const h3_lim=(e)=>`\\lim_{n \\to \\infty} ${e}`;
const h3_q=ts=>{let s='';for(const [k,den] of ts){if(k===0)continue;const body=den?`\\frac{${Math.abs(k)}}{${den}}`:`${Math.abs(k)}`;s+=s===''?(k<0?'-':'')+body:(k<0?' - ':' + ')+body}return s||'0'};

/* 數列的極限與無窮等比級數 */
/* 導數與微分公式（數甲含連鎖律） */
/* 導數的應用：單調、極值、凹凸與反曲點 */
/* 定積分與面積 */
/* 旋轉體體積（數甲） */
/* 複數平面與棣美弗定理 */
const H3_POLAR=[[1,'\\sqrt{3}',60,'2'],['\\sqrt{3}',1,30,'2'],[-1,'\\sqrt{3}',120,'2'],['-\\sqrt{3}',1,150,'2'],['-\\sqrt{3}',-1,210,'2'],[-1,'-\\sqrt{3}',240,'2'],[1,'-\\sqrt{3}',300,'2'],['\\sqrt{3}',-1,330,'2'],[1,1,45,'\\sqrt{2}'],[-1,1,135,'\\sqrt{2}'],[-1,-1,225,'\\sqrt{2}'],[1,-1,315,'\\sqrt{2}']];
const h3_z=(a,b)=>{const bs=String(b),neg=bs.startsWith('-'),bb=bs.replace(/^-/,'');return`${a} ${neg?'-':'+'} ${bb==='1'?'':bb}i`};
/* 隨機變數：期望值、變異數、二項分布、幾何分布 */
/* 線性規劃（數乙） */
/* 常態分布（數乙） */
/* 數甲、數乙 共用題型 */

var MATH_UNITS=U.filter(function(u){return /^小/.test(u.g)});
