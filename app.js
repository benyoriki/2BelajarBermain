(()=>{
'use strict';
/* Daftar game. href diisi untuk game yang sudah ada; kosong = "Segera Hadir". Sesuaikan path di sini. */
const GAMES=[
 {n:'Ular Tangga Dino',img:'ular-tangga',cat:'papan',tag:'Papan',pl:'2–4 pemain',d:'Naik tangga, hindari ular, jadi yang pertama sampai finis.',href:'Ular_tangga_v01/index.html'},
 {n:'Monopoli Dino',img:'monopoli',cat:'papan',tag:'Papan',pl:'2–4 pemain',d:'Beli properti dan bangun dunia Dino bersama keluarga.',href:'monopoli_v01/index.html'},
 {n:'Ludo Dino',img:'ludo',cat:'papan',tag:'Papan',pl:'2–4 pemain',d:'Kocok dadu dan antar semua pion ke rumah.',href:''},
 {n:'Adu Memori',img:'memory',cat:'otak',tag:'Adu Otak',pl:'2 pemain',d:'Cari pasangan kartu Dino paling cepat.',href:''},
 {n:'Tebak Gambar',img:'tebak-gambar',cat:'otak',tag:'Adu Otak',pl:'2–6 pemain',d:'Tebak gambar misterius sebelum waktu habis.',href:''},
 {n:'Kuis Keluarga',img:'kuis',cat:'otak',tag:'Adu Otak',pl:'2–6 pemain',d:'Seberapa kenal kamu dengan keluargamu?',href:''},
 {n:'Petualangan Dino',img:'petualangan',cat:'papan',tag:'Petualangan',pl:'2–4 pemain',d:'Jelajahi pulau Dino dan kumpulkan harta bersama.',href:''},
 {n:'Halma Dino',img:'halma',cat:'papan',tag:'Papan',pl:'2–4 pemain',d:'Lompati pion lawan dan sampai ke seberang papan.',href:''}];
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* daftar game */
const grid=$('#games');
function card(g,i){
 const play=!!g.href;
 return `<article class="game${play?' ready':' soon'}" style="--i:${i}">
 <div class="th"><img src="assets/${g.img}.webp" alt="${play?'Thumbnail '+esc(g.n):''}" ${play?'':'aria-hidden="true" '}loading="lazy" width="720" height="480"><span class="badge">${g.tag}</span><span class="status">${play?'<i></i>Siap main':'Segera'}</span></div>
 <div class="bd"><h3>${esc(g.n)}</h3><small><svg class="ic" aria-hidden="true"><use href="#i-users"/></svg>${g.pl}</small><p>${esc(g.d)}</p>
 ${play?`<a class="go" data-play href="${g.href}"><svg class="ic" aria-hidden="true"><use href="#i-play"/></svg>Mainkan</a>`:''}</div></article>`;
}
function render(f='all'){
 const list=GAMES.filter(g=>f==='all'||(f==='ready'?g.href:g.cat===f)).sort((a,b)=>!!b.href-!!a.href);
 grid.innerHTML=list.map(card).join('');
}
function setFilter(f){$$('.chip').forEach(x=>{const on=x.dataset.f===f;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on)});render(f)}
render();
$$('.chip').forEach(c=>c.onclick=()=>setFilter(c.dataset.f));
$$('[data-filter]').forEach(a=>a.addEventListener('click',()=>setFilter(a.dataset.filter)));

/* tombol main di hero: ambil tautan dari daftar GAMES */
$$('[data-g]').forEach(a=>{const g=GAMES[+a.dataset.g];if(g&&g.href)a.href=g.href});

/* tema terang / gelap: pilihan tersimpan; tanpa pilihan mengikuti sistem */
const html=document.documentElement,themeBtn=$('#theme'),metaTC=$('meta[name=theme-color]');
function paintTheme(t){html.setAttribute('data-theme',t);if(metaTC)metaTC.content=t==='light'?'#F6F3FF':'#080C24';
 themeBtn.setAttribute('aria-label',t==='light'?'Ganti ke tema gelap':'Ganti ke tema terang');themeBtn.setAttribute('aria-pressed',t==='light')}
paintTheme(html.getAttribute('data-theme')||'dark');
themeBtn.onclick=()=>{const t=html.getAttribute('data-theme')==='light'?'dark':'light';paintTheme(t);store.set('dfp-theme',t)};
try{matchMedia('(prefers-color-scheme: light)').addEventListener('change',e=>{if(!store.get('dfp-theme'))paintTheme(e.matches?'light':'dark')})}catch(e){}

/* muncul halus saat di-scroll */
const rvs=$$('.rv');
if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -6% 0px',threshold:.06});rvs.forEach(el=>io.observe(el))}
else rvs.forEach(el=>el.classList.add('in'));

/* daftar perangkat menyorot perangkat yang sesuai di panggung */
const stage=$('#stage');
$$('.dev-list li').forEach(li=>{const on=()=>{stage.dataset.hl=li.dataset.d},off=()=>{delete stage.dataset.hl};
 li.addEventListener('mouseenter',on);li.addEventListener('mouseleave',off);
 li.addEventListener('click',()=>{stage.dataset.hl===li.dataset.d?off():on()})});

/* garis progres scroll */
const spb=$('#sp');
function prog(){const m=document.documentElement.scrollHeight-innerHeight;spb.style.transform='scaleX('+(m>0?Math.min(1,scrollY/m):0)+')'}
addEventListener('scroll',()=>requestAnimationFrame(prog),{passive:true});prog();

/* modal */
const modal=$('#modal');let last;
function open(t){last=document.activeElement;$('#mt').textContent=t;modal.hidden=false;$('#mx').focus()}
function close(){modal.hidden=true;last&&last.focus&&last.focus()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-modal]');if(b){e.preventDefault();open(b.dataset.modal)}});
$('#mx').onclick=close;modal.addEventListener('click',e=>{if(e.target===modal)close()});

/* dukungan / donasi */
const dn=$('#donate'),sheet=$('.sheet',dn),toast=$('#toast');let dnLast,tt;
const tabs=$$('.tabs [role=tab]',dn);
function pick(t,focus){tabs.forEach(b=>{const on=b===t;b.setAttribute('aria-selected',on);b.classList.toggle('on',on);b.tabIndex=on?0:-1;$('#'+b.getAttribute('aria-controls')).hidden=!on});if(focus)t.focus()}
tabs.forEach((b,i)=>{b.onclick=()=>pick(b);b.onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.stopPropagation();pick(tabs[(i+1)%tabs.length],true)}}});
function openDonate(){dnLast=document.activeElement;dn.hidden=false;document.body.classList.add('lock');sheet.scrollTop=0;$('.sh-body',dn).scrollTop=0;$('#dn-x').focus({preventScroll:true})}
function closeDonate(){dn.hidden=true;document.body.classList.remove('lock');dnLast&&dnLast.focus&&dnLast.focus({preventScroll:true})}
$$('[data-donate]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();openDonate()}));
$('#dn-x').onclick=closeDonate;$('#dn-close').onclick=closeDonate;dn.addEventListener('click',e=>{if(e.target===dn)closeDonate()});
dn.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const f=$$('button:not([disabled]),a[href]',dn).filter(x=>!x.closest('[hidden]')&&x.offsetParent);if(!f.length)return;const a=f[0],z=f[f.length-1];
 if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}});
function say(m){toast.textContent=m;toast.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove('on'),2200)}
$('#copyrek').onclick=async()=>{const n=$('#rek').textContent.replace(/\s/g,'');let ok=false;
 try{await navigator.clipboard.writeText(n);ok=true}catch(e){try{const t=document.createElement('textarea');t.value=n;t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();ok=document.execCommand('copy');t.remove()}catch(_){}}
 say(ok?'Nomor rekening tersalin. Terima kasih!':'Salin manual: '+n)};

/* menu HP */
const nav=$('#nav'),bg=$('#burger');
const shut=()=>{nav.classList.remove('open');bg.setAttribute('aria-expanded',false)};
bg.onclick=()=>{const o=nav.classList.toggle('open');bg.setAttribute('aria-expanded',o)};
nav.addEventListener('click',e=>{if(e.target.closest('a'))shut()});
document.addEventListener('click',e=>{if(nav.classList.contains('open')&&!e.target.closest('#nav,#burger'))shut()});

/* scrollspy menu atas + tab bar */
const links=$$('#nav a,.tabbar a[href^="#"]:not([href="#"])');
const secs=['beranda','game','misi','perangkat','segera','faq','dukung'].map(id=>document.getElementById(id)).filter(Boolean);
function spy(){
 const y=scrollY+innerHeight*.35;let cur=secs[0].id;
 for(const s of secs)if(s.offsetParent&&s.offsetTop<=y)cur=s.id;
 links.forEach(a=>{const h=a.getAttribute('href').slice(1);a.classList.toggle('on',h===cur)});
}
let tk;addEventListener('scroll',()=>{if(!tk){tk=requestAnimationFrame(()=>{tk=0;spy()})}},{passive:true});spy();

/* profil pemain (tersimpan di perangkat) */
const PK='dfp-profile',HK='dfp-hist',dkey=(d=new Date())=>d.toISOString().slice(0,10);
const readJ=(k,d)=>{try{return Object.assign(d,JSON.parse(store.get(k)||'{}'))}catch(e){return d}};
let prof=readJ(PK,{name:'',av:'dino-blue',plays:0}),hist=readJ(HK,{});
const AVS=['dino-blue','dino-pink','dino-green','dino-red','dino-yellow','dino-pterodactyl'];
const AVC={'dino-blue':['#3b82f6','#22d3ee'],'dino-pink':['#f0489a','#ff9ac8'],'dino-green':['#16a34a','#86efac'],'dino-red':['#e11d48','#fb923c'],'dino-yellow':['#f59e0b','#fde047'],'dino-pterodactyl':['#ea580c','#fbbf24']};
if(!AVS.includes(prof.av))prof.av='dino-blue';
const RANKS=['Telur Dino','Dino Kecil','Penjelajah Rimba','Pemburu Bintang','Juara Keluarga','Legenda Dino'];
const DAYS=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
const pf=$('#profile');let pfLast,pfT,pfAv;
const sum=()=>Object.values(hist).reduce((a,b)=>a+(+b||0),0);
function streak(){let n=0;const d=new Date();if(!(hist[dkey(d)]>0))d.setUTCDate(d.getUTCDate()-1);
 while(hist[dkey(d)]>0){n++;d.setUTCDate(d.getUTCDate()-1)}return n}
const BADGES=[
 {i:'star',c:['#FFE066','#F5A300'],n:'Bintang Pertama',d:'Kumpulkan 1 bintang',v:t=>t.total,m:1},
 {i:'board',c:['#9B7BFF','#5B2EE6'],n:'Pemain Baru',d:'Buka 1 game',v:t=>prof.plays,m:1},
 {i:'users',c:['#3EE0A8','#0FA36B'],n:'Tim Kompak',d:'Selesaikan semua misi dalam sehari',v:t=>t.best,m:6},
 {i:'bolt',c:['#FFB84A','#F26A10'],n:'Rajin 3 Hari',d:'Main 3 hari beruntun',v:t=>t.streak,m:3},
 {i:'trophy',c:['#59A8FF','#2563EB'],n:'Kolektor Bintang',d:'Kumpulkan 20 bintang',v:t=>t.total,m:20},
 {i:'palette',c:['#FF7FB0','#E6307F'],n:'Gaya Sendiri',d:'Isi nama pemain',v:t=>prof.name?1:0,m:1}];
function drawProfile(){
 const total=sum(),today=+hist[dkey()]||0,st=streak(),best=Math.max(0,...Object.values(hist).map(Number));
 const lvN=Math.floor(total/5)+1,rank=RANKS[Math.min(lvN,RANKS.length)-1],into=total%5;
 const name=prof.name||'Pemain Dino',src='assets/'+prof.av+'.webp',c=AVC[prof.av];
 pf.style.setProperty('--a',c[0]);pf.style.setProperty('--a2',c[1]);
 $('#pf-t').textContent=name;$('#pf-rank').textContent=rank;$('#pf-lvn').textContent=lvN;
 $('#pf-ring').style.setProperty('--p',into/5*100);$('#pf-fill').style.width=into/5*100+'%';
 $('#pf-bar').setAttribute('aria-valuenow',into);
 $('#pf-l1').textContent='Lv '+lvN;$('#pf-l2').textContent='Lv '+(lvN+1);$('#pf-xv').textContent=into+' / 5 ★';
 $('#pf-next').textContent=(5-into)+' bintang lagi menuju Lv '+(lvN+1);
 $('#st-total').textContent=total;$('#st-today').textContent=today+'/6';$('#st-streak').textContent=st;$('#st-plays').textContent=prof.plays;
 $$('.pf-av').forEach(i=>i.src=src);
 const big=$('#pf-big');if(pfAv!==prof.av){big.src=src;big.classList.remove('pop');void big.offsetWidth;big.classList.add('pop');pfAv=prof.av}
 $$('.pf-avs [data-av]').forEach(b=>{const on=b.dataset.av===prof.av;b.setAttribute('aria-checked',on);b.tabIndex=on?0:-1});
 const wk=[];for(let k=6;k>=0;k--){const d=new Date();d.setUTCDate(d.getUTCDate()-k);const key=dkey(d);wk.push(`<li class="${hist[key]>0?'on':''}${k?'':' now'}"><i>${hist[key]>0?'★':''}</i>${k?DAYS[d.getUTCDay()]:'Hari ini'}</li>`)}
 $('#pf-week').innerHTML=wk.join('');
 const t={total,streak:st,best};let got=0;
 $('#pf-badges').innerHTML=BADGES.map(b=>{const v=Math.min(b.v(t),b.m),ok=v>=b.m;if(ok)got++;
  return `<li class="${ok?'':'lock'}"><span class="tile" style="--c1:${b.c[0]};--c2:${b.c[1]}"><svg class="ic" aria-hidden="true"><use href="#i-${b.i}"/></svg></span><b>${b.n}</b><small>${ok?'Terbuka! 🎉':b.d+' · '+v+'/'+b.m}</small>${ok?'':`<span class="pg"><i style="width:${v/b.m*100}%"></i></span>`}</li>`}).join('');
 $('#bd-count').textContent=got+'/'+BADGES.length;
}
const saveP=()=>store.set(PK,JSON.stringify(prof));
function hist_(pts){hist[dkey()]=pts;const k=Object.keys(hist).sort();while(k.length>90)delete hist[k.shift()];store.set(HK,JSON.stringify(hist));if(!pf.hidden)drawProfile()}
function openProfile(){pfLast=document.activeElement;pfAv=null;$('#pf-confirm').hidden=true;$('#pf-reset').hidden=false;drawProfile();$('#pf-input').value=prof.name;pf.hidden=false;document.body.classList.add('lock');$('.sh-body',pf).scrollTop=0;$('#pf-x').focus({preventScroll:true})}
function closeProfile(){pf.hidden=true;document.body.classList.remove('lock');pfLast&&pfLast.focus&&pfLast.focus({preventScroll:true})}
function pfSay(m){const t=$('#pf-toast');t.textContent=m;t.classList.add('on');clearTimeout(pfT);pfT=setTimeout(()=>t.classList.remove('on'),2200)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-profile]');if(b){e.preventDefault();openProfile()}});
$('#pf-x').onclick=closeProfile;pf.addEventListener('click',e=>{if(e.target===pf)closeProfile()});
$('#pf-go').onclick=()=>closeProfile();
let nameT;$('#pf-input').addEventListener('input',e=>{prof.name=e.target.value.trim().slice(0,16);saveP();drawProfile();const m=$('#pf-saved');m.classList.add('on');clearTimeout(nameT);nameT=setTimeout(()=>m.classList.remove('on'),1200)});
$('.pf-avs').addEventListener('click',e=>{const b=e.target.closest('[data-av]');if(b){prof.av=b.dataset.av;saveP();drawProfile()}});
$('.pf-avs').addEventListener('keydown',e=>{if(!/^Arrow(Left|Right)$/.test(e.key))return;e.preventDefault();e.stopPropagation();const i=AVS.indexOf(prof.av),n=AVS[(i+(e.key==='ArrowRight'?1:AVS.length-1))%AVS.length];prof.av=n;saveP();drawProfile();$('.pf-avs [data-av="'+n+'"]').focus()});
/* atur ulang: konfirmasi di dalam desain (bukan dialog bawaan browser) */
$('#pf-reset').onclick=()=>{$('#pf-reset').hidden=true;$('#pf-confirm').hidden=false;$('#pf-yes').scrollIntoView({block:'center',behavior:'smooth'})};
$('#pf-no').onclick=()=>{$('#pf-confirm').hidden=true;$('#pf-reset').hidden=false};
$('#pf-yes').onclick=()=>{prof={name:'',av:'dino-blue',plays:0};hist={};saveP();store.set(HK,'{}');store.set(MK,'{}');done=[];paint();$('#pf-input').value='';pfAv=null;$('#pf-confirm').hidden=true;$('#pf-reset').hidden=false;drawProfile();pfSay('Profil sudah diatur ulang')};
$('#pf-share').onclick=async()=>{const total=sum(),lv=Math.floor(total/5)+1,txt=(prof.name||'Aku')+' sudah Lv '+lv+' ('+RANKS[Math.min(lv,RANKS.length)-1]+') dengan '+total+' bintang di Dino Family Play! Yuk main bareng keluarga.';
 try{if(navigator.share){await navigator.share({title:'Dino Family Play',text:txt,url:location.href.split('#')[0]});return}}catch(e){if(e&&e.name==='AbortError')return}
 try{await navigator.clipboard.writeText(txt+' '+location.href.split('#')[0]);pfSay('Teks profil tersalin')}catch(e){pfSay('Bagikan: '+txt)}};
pf.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const f=$$('button:not([disabled]),a[href],input',pf).filter(x=>x.offsetParent&&!x.closest('[hidden]'));if(!f.length)return;const a=f[0],z=f[f.length-1];
 if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}});
/* hitung game yang dibuka */
document.addEventListener('click',e=>{if(e.target.closest('a[data-play]')){prof.plays=(+prof.plays||0)+1;saveP()}},true);
$$('.pf-av').forEach(i=>i.src='assets/'+prof.av+'.webp');

/* misi keluarga (tersimpan per hari di perangkat) */
const MK='dfp-missions',today=new Date().toISOString().slice(0,10);
let done=[];try{const s=JSON.parse(store.get(MK)||'{}');if(s.d===today)done=s.done||[]}catch(e){}
const ms=$$('#missions .m'),GOAL=6;
function paint(){
 let pts=0;ms.forEach((b,i)=>{const on=done.includes(i);b.setAttribute('aria-pressed',on);if(on)pts+=+b.dataset.s});
 $('#pval').textContent=pts+' / '+GOAL;$('#pfill').style.width=pts/GOAL*100+'%';
 const bar=$('#pbar');bar.setAttribute('aria-valuenow',pts);
 const r=$('#reward');r.classList.toggle('win',pts===GOAL);
 hist_(pts);
 $('#rtxt').textContent=pts===GOAL?'Hebat! Semua misi selesai — tim keluarga juara hari ini!':pts?'Bagus! Lanjutkan misi berikutnya.':'Selesaikan misi pertama untuk membuka bintang!';
}
ms.forEach((b,i)=>b.onclick=()=>{done=done.includes(i)?done.filter(x=>x!==i):[...done,i];store.set(MK,JSON.stringify({d:today,done}));paint()});
paint();

/* Mode TV: otomatis (UA TV), ?tv=1, atau tombol; pilihan disimpan */
const root=document.documentElement,tvbtn=$('#tvtoggle');
const ua=/SMART-TV|SmartTV|Android TV|AndroidTV|GoogleTV|BRAVIA|Tizen|Web0S|WebOS|HbbTV|AFT|CrKey/i.test(navigator.userAgent);
function setTV(on,save){root.classList.toggle('tv',on);tvbtn.textContent=on?'Keluar Mode TV':'Coba Mode TV';if(save)store.set('dfp-tv',on?'1':'0');scrollTo(0,0)}
const pref=store.get('dfp-tv'),qs=/[?&]tv=1/.test(location.search);
const init=qs||(pref==='1')||(ua&&pref!=='0');
root.classList.toggle('tv',init);tvbtn.textContent=init?'Keluar Mode TV':'Coba Mode TV';
tvbtn.onclick=()=>{setTV(!root.classList.contains('tv'),true);if(root.classList.contains('tv'))$('.btn.big').focus({preventScroll:true})};
if(init)addEventListener('load',()=>$('.btn.big').focus({preventScroll:true}));

/* Buka game dari portal: bawa Mode TV (?tv=1) agar game langsung tampil dalam mode TV */
document.addEventListener('click',e=>{const l=e.target.closest('a[data-play]');
 if(l&&root.classList.contains('tv')&&!/[?&]tv=1/.test(l.getAttribute('href')||'')&&!(l.getAttribute('href')||'').startsWith('#')){e.preventDefault();location.href=l.getAttribute('href')+'?tv=1'}});

/* D-pad: panah memindahkan fokus ke elemen terdekat; OK = Enter; Back = tutup modal / ke atas */
const sel='a[href],button:not([disabled]),summary';
document.addEventListener('keydown',e=>{
 const k=e.key,tv=root.classList.contains('tv');
 if(k==='Escape'||k==='Backspace'||k==='BrowserBack'||k==='GoBack'){
  if(!pf.hidden){e.preventDefault();closeProfile()}
  else if(!dn.hidden){e.preventDefault();closeDonate()}
  else if(!modal.hidden){e.preventDefault();close()}
  else if(nav.classList.contains('open')){shut()}
  else if(tv&&k!=='Backspace'){e.preventDefault();scrollTo(0,0);$('.btn.big').focus()}
  return}
 if(!/^Arrow(Left|Right|Up|Down)$/.test(k))return;
 if(!tv)return;
 if(!modal.hidden){e.preventDefault();return}
 const cur=document.activeElement,els=$$(sel,!pf.hidden?pf:!dn.hidden?dn:document).filter(el=>el.offsetParent&&!el.closest('[hidden]'));
 if(!cur||cur===document.body){e.preventDefault();(els.find(x=>x.classList.contains('big'))||els[0]).focus();return}
 const r=cur.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let best,bs=1e9;
 for(const el of els){if(el===cur)continue;const q=el.getBoundingClientRect(),x=q.left+q.width/2-cx,y=q.top+q.height/2-cy;
  const ok=k==='ArrowRight'?x>8&&Math.abs(y)<=Math.abs(x)*1.2+r.height:k==='ArrowLeft'?x<-8&&Math.abs(y)<=Math.abs(x)*1.2+r.height:k==='ArrowDown'?y>8&&Math.abs(x)<=Math.abs(y)*1.2+r.width:y<-8&&Math.abs(x)<=Math.abs(y)*1.2+r.width;
  if(!ok)continue;const s=(k==='ArrowLeft'||k==='ArrowRight')?Math.abs(x)+Math.abs(y)*2.5:Math.abs(y)+Math.abs(x)*2.5;if(s<bs){bs=s;best=el}}
 if(best){e.preventDefault();best.focus();best.scrollIntoView({block:'center',inline:'center',behavior:'auto'})}
});
})();
