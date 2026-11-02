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
const grid=$('#games'),COL={papan:'#39D9FF',otak:'#FF70B8'};
function render(f='all'){
 grid.innerHTML=GAMES.filter(g=>f==='all'||g.cat===f).map(g=>`<article class="game${g.href?"":" soon"}" style="--c:${COL[g.cat]||"#39D9FF"}">
 <div class="th"><img src="assets/${g.img}.webp" alt="Thumbnail ${g.n}" loading="lazy" width="720" height="480"><span class="badge">${g.tag}</span></div>
 <div class="bd"><h3>${g.n}</h3><small>${g.pl}</small><p>${g.d}</p>
 ${g.href?`<a class="btn" href="${g.href}">Mainkan</a>`:`<button class="btn" data-modal="${g.n}">Segera Hadir</button>`}</div></article>`).join('');
}
render();
$$('.chip').forEach(c=>c.onclick=()=>{$$('.chip').forEach(x=>x.classList.toggle('on',x===c));render(c.dataset.f)});
$$('[data-filter]').forEach(a=>a.addEventListener('click',()=>{const f=a.dataset.filter;$$('.chip').forEach(x=>x.classList.toggle('on',x.dataset.f===f));render(f)}));
/* modal */
const modal=$('#modal');let last;
function open(t){last=document.activeElement;$('#mt').textContent=t;modal.hidden=false;$('#mx').focus()}
function close(){modal.hidden=true;last&&last.focus()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-modal]');if(b)open(b.dataset.modal)});
$('#mx').onclick=close;modal.addEventListener('click',e=>{if(e.target===modal)close()});
/* mobile menu */
const nav=$('#nav'),bg=$('#burger');
bg.onclick=()=>{const o=nav.classList.toggle('open');bg.setAttribute('aria-expanded',o)};
nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('open');bg.setAttribute('aria-expanded',false)}});
$$('#nav a').forEach(a=>a.addEventListener('click',()=>{$$('#nav a').forEach(x=>x.classList.toggle('on',x===a))}));
/* Smart TV mode: otomatis (UA TV) atau paksa dengan ?tv=1 */
const ua=navigator.userAgent;
if(/SMART-TV|SmartTV|Android TV|AndroidTV|GoogleTV|BRAVIA|Tizen|Web0S|WebOS|HbbTV|AFT|CrKey/i.test(ua)||/[?&]tv=1/.test(location.search)){
 document.documentElement.classList.add('tv');
 addEventListener('load',()=>$('.btn.big').focus());
}
/* D-pad: panah memindahkan fokus ke elemen terdekat pada arah tersebut; OK = Enter; Back = tutup modal */
const sel='a[href],button:not([disabled])';
document.addEventListener('keydown',e=>{
 const k=e.key;
 if(k==='Escape'||k==='Backspace'||k==='BrowserBack'||k==='GoBack'){if(!modal.hidden){e.preventDefault();close()}else if(document.documentElement.classList.contains('tv')){e.preventDefault();scrollTo(0,0);$('.btn.big').focus()}return}
 if(!/^Arrow(Left|Right|Up|Down)$/.test(k))return;
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
