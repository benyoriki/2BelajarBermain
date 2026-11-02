(()=>{
'use strict';
/* Daftar game. href diisi untuk game yang sudah ada; kosong = "Segera Hadir". Sesuaikan path di sini. */
const GAMES=[
 {n:'Ular Tangga Dino',img:'ular-tangga',cat:'papan',tag:'Papan',pl:'2–4 pemain',d:'Naik tangga, hindari ular, jadi yang pertama sampai finis.',href:'ular-tangga/index.html'},
 {n:'Monopoli Dino',img:'monopoli',cat:'papan',tag:'Papan',pl:'2–4 pemain',d:'Beli properti dan bangun dunia Dino bersama keluarga.',href:'monopoli/index.html'},
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
function render(f='all'){
 const list=GAMES.filter(g=>f==='all'||(f==='ready'?g.href:g.cat===f)).sort((a,b)=>!!b.href-!!a.href);
 grid.innerHTML=list.map((g,i)=>`<article class="game${g.href?'':' soon'}" style="animation-delay:${i*60}ms">
 <div class="th"><img src="assets/${g.img}.webp" alt="Thumbnail ${esc(g.n)}" loading="lazy" width="720" height="480"><span class="badge">${g.tag}</span><span class="status">${g.href?'Siap main':'Segera'}</span></div>
 <div class="bd"><h3>${esc(g.n)}</h3><small>${g.pl}</small><p>${esc(g.d)}</p>
 ${g.href?`<a class="btn" href="${g.href}"><img src="assets/button-play.svg" alt="" width="22" height="22">Mainkan</a>`:`<button class="btn" data-modal="${esc(g.n)}">Segera Hadir</button>`}</div></article>`).join('');
}
function setFilter(f){$$('.chip').forEach(x=>{const on=x.dataset.f===f;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on)});render(f)}
render();
$$('.chip').forEach(c=>c.onclick=()=>setFilter(c.dataset.f));
$$('[data-filter]').forEach(a=>a.addEventListener('click',()=>setFilter(a.dataset.filter)));

/* modal */
const modal=$('#modal');let last;
function open(t){last=document.activeElement;$('#mt').textContent=t;modal.hidden=false;$('#mx').focus()}
function close(){modal.hidden=true;last&&last.focus&&last.focus()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-modal]');if(b){e.preventDefault();open(b.dataset.modal)}});
$('#mx').onclick=close;modal.addEventListener('click',e=>{if(e.target===modal)close()});

/* menu HP */
const nav=$('#nav'),bg=$('#burger');
const shut=()=>{nav.classList.remove('open');bg.setAttribute('aria-expanded',false)};
bg.onclick=()=>{const o=nav.classList.toggle('open');bg.setAttribute('aria-expanded',o)};
nav.addEventListener('click',e=>{if(e.target.closest('a'))shut()});
document.addEventListener('click',e=>{if(nav.classList.contains('open')&&!e.target.closest('#nav,#burger'))shut()});

/* scrollspy menu atas + tab bar */
const links=$$('#nav a,.tabbar a[href^="#"]:not([href="#"])');
const secs=['beranda','game','misi','perangkat','segera','faq'].map(id=>document.getElementById(id)).filter(Boolean);
function spy(){
 const y=scrollY+innerHeight*.35;let cur=secs[0].id;
 for(const s of secs)if(s.offsetTop<=y)cur=s.id;
 links.forEach(a=>{const h=a.getAttribute('href').slice(1);a.classList.toggle('on',h===cur)});
}
let tk;addEventListener('scroll',()=>{if(!tk){tk=requestAnimationFrame(()=>{tk=0;spy()})}},{passive:true});spy();

/* animasi muncul saat scroll */
const rvEls=$$('.sec .head,.stats li,.cat,.steps li,.mission,.dev,.feat,.faq details,.final-in');
rvEls.forEach((el,i)=>{el.classList.add('rv');el.style.transitionDelay=(i%4)*70+'ms'});
if('IntersectionObserver' in window){
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px',threshold:.08});
 rvEls.forEach(el=>io.observe(el));
}else rvEls.forEach(el=>el.classList.add('in'));

/* misi keluarga (tersimpan per hari di perangkat) */
const MK='dfp-missions',today=new Date().toISOString().slice(0,10);
let done=[];try{const s=JSON.parse(store.get(MK)||'{}');if(s.d===today)done=s.done||[]}catch(e){}
const ms=$$('#missions .m'),GOAL=6;
function paint(){
 let pts=0;ms.forEach((b,i)=>{const on=done.includes(i);b.setAttribute('aria-pressed',on);if(on)pts+=+b.dataset.s});
 $('#pval').textContent=pts+' / '+GOAL;$('#pfill').style.width=pts/GOAL*100+'%';
 const bar=$('#pbar');bar.setAttribute('aria-valuenow',pts);
 const r=$('#reward');r.classList.toggle('win',pts===GOAL);
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

/* D-pad: panah memindahkan fokus ke elemen terdekat; OK = Enter; Back = tutup modal / ke atas */
const sel='a[href],button:not([disabled]),summary';
document.addEventListener('keydown',e=>{
 const k=e.key,tv=root.classList.contains('tv');
 if(k==='Escape'||k==='Backspace'||k==='BrowserBack'||k==='GoBack'){
  if(!modal.hidden){e.preventDefault();close()}
  else if(nav.classList.contains('open')){shut()}
  else if(tv&&k!=='Backspace'){e.preventDefault();scrollTo(0,0);$('.btn.big').focus()}
  return}
 if(!/^Arrow(Left|Right|Up|Down)$/.test(k))return;
 if(!tv)return;
 if(!modal.hidden){e.preventDefault();return}
 const cur=document.activeElement,els=$$(sel).filter(el=>el.offsetParent&&!el.closest('[hidden]'));
 if(!cur||cur===document.body){e.preventDefault();(els.find(x=>x.classList.contains('big'))||els[0]).focus();return}
 const r=cur.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let best,bs=1e9;
 for(const el of els){if(el===cur)continue;const q=el.getBoundingClientRect(),x=q.left+q.width/2-cx,y=q.top+q.height/2-cy;
  const ok=k==='ArrowRight'?x>8&&Math.abs(y)<=Math.abs(x)*1.2+r.height:k==='ArrowLeft'?x<-8&&Math.abs(y)<=Math.abs(x)*1.2+r.height:k==='ArrowDown'?y>8&&Math.abs(x)<=Math.abs(y)*1.2+r.width:y<-8&&Math.abs(x)<=Math.abs(y)*1.2+r.width;
  if(!ok)continue;const s=(k==='ArrowLeft'||k==='ArrowRight')?Math.abs(x)+Math.abs(y)*2.5:Math.abs(y)+Math.abs(x)*2.5;if(s<bs){bs=s;best=el}}
 if(best){e.preventDefault();best.focus();best.scrollIntoView({block:'center',inline:'center',behavior:'auto'})}
});
})();
