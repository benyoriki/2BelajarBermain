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
const gt=$('#gtoast');let gtT;function gsay(m){gt.textContent=m;gt.classList.add('on');clearTimeout(gtT);gtT=setTimeout(()=>gt.classList.remove('on'),2800)}
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

/* Tampilan per menu (seperti sheet): satu menu = satu layar, bukan memanjang ke bawah */
const links=$$('#nav a,.tabbar a[href^="#"]'),views=$$('.view');
const viewOf=id=>{const el=document.getElementById(id);return el?el.closest('.view'):null};
let curV=null;
function route(){
 let id=decodeURIComponent(location.hash.slice(1))||'beranda',el=document.getElementById(id);
 if(!el||!el.closest('.view')){id='beranda';el=document.getElementById(id)}
 const v=el.closest('.view'),changed=v!==curV;
 if(changed){views.forEach(x=>x.classList.toggle('on',x===v));curV=v;
  links.forEach(a=>{a.classList.toggle('on',document.getElementById(a.getAttribute('href').slice(1))===v.firstElementChild)})}
 if(el===v.firstElementChild||el===v)scrollTo({top:0,behavior:'instant'});
 else requestAnimationFrame(()=>el.scrollIntoView({block:'start'}));
 const t=$('#nav');if(t)t.classList.remove('open');
}
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a||e.defaultPrevented)return;
 const id=a.getAttribute('href').slice(1);if(!id||!document.getElementById(id))return;
 e.preventDefault();if(location.hash!=='#'+id)history.pushState(null,'','#'+id);route()});
addEventListener('popstate',route);addEventListener('hashchange',route);
route();

/* profil pemain (tersimpan di perangkat) */
const PK='dfp-profile',HK='dfp-hist',dkey=(d=new Date())=>d.toISOString().slice(0,10);
const readJ=(k,d)=>{try{return Object.assign(d,JSON.parse(store.get(k)||'{}'))}catch(e){return d}};
let prof=readJ(PK,{name:'',av:'dino-blue',plays:0,photoOn:true}),hist=readJ(HK,{});
const PHK='dfp-photo';let photo=store.get(PHK)||'',photoRev=0;if(!/^data:image\//.test(photo))photo='';
const AVS=['dino-blue','dino-pink','dino-green','dino-red','dino-yellow','dino-pterodactyl'];
const AVC={'dino-blue':['#3b82f6','#22d3ee'],'dino-pink':['#f0489a','#ff9ac8'],'dino-green':['#16a34a','#86efac'],'dino-red':['#e11d48','#fb923c'],'dino-yellow':['#f59e0b','#fde047'],'dino-pterodactyl':['#ea580c','#fbbf24']};
if(!AVS.includes(prof.av))prof.av='dino-blue';
const RANKS=['Telur Dino','Dino Kecil','Penjelajah Rimba','Pemburu Bintang','Juara Keluarga','Legenda Dino'];
const DAYS=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
const pf=$('#profile');let pfAv;
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
 const usePhoto=!!photo&&prof.photoOn!==false,name=prof.name||'Pemain Dino',src=usePhoto?photo:'assets/'+prof.av+'.webp',c=AVC[prof.av];
 pf.classList.toggle('has-photo',usePhoto);
 pf.style.setProperty('--a',c[0]);pf.style.setProperty('--a2',c[1]);
 $('#pf-t').textContent=name;$('#pf-rank').textContent=rank;$('#pf-lvn').textContent=lvN;
 $('#pf-ring').style.setProperty('--p',into/5*100);$('#pf-fill').style.width=into/5*100+'%';
 $('#pf-bar').setAttribute('aria-valuenow',into);
 $('#pf-l1').textContent='Lv '+lvN;$('#pf-l2').textContent='Lv '+(lvN+1);$('#pf-xv').textContent=into+' / 5 ★';
 $('#pf-next').textContent=(5-into)+' bintang lagi menuju Lv '+(lvN+1);
 $('#st-total').textContent=total;$('#st-today').textContent=today+'/6';$('#st-streak').textContent=st;$('#st-plays').textContent=prof.plays;
 $$('.pf-av').forEach(i=>{if(i.getAttribute('src')!==src)i.src=src;i.classList.toggle('ph',usePhoto)});
 const big=$('#pf-big'),key=usePhoto?'p'+photoRev:prof.av;if(pfAv!==key){big.src=src;big.classList.remove('pop');void big.offsetWidth;big.classList.add('pop');pfAv=key}
 $$('.pf-avs [data-av]').forEach(b=>{const cur=b.dataset.av===prof.av;b.setAttribute('aria-checked',cur&&!usePhoto);b.tabIndex=cur?0:-1});
 const pi=$('#pp-img');pi.hidden=!photo;if(photo&&pi.getAttribute('src')!==photo)pi.src=photo;$('#pp-thumb').classList.toggle('has',!!photo);
 $('#pp-t').textContent=!photo?'Belum ada foto':usePhoto?'Foto kamu dipakai':'Foto tersimpan';
 $('#pp-s').textContent=!photo?'Pilih dari galeri atau kamera, lalu atur posisinya.':usePhoto?'Tampil di kartu pemain dan menu profil.':'Saat ini memakai karakter Dino.';
 $('#pp-addt').textContent=photo?'Ganti foto':'Tambah foto';$('#pp-use').hidden=!photo||usePhoto;$('#pp-del').hidden=!photo;
 const wk=[];for(let k=6;k>=0;k--){const d=new Date();d.setUTCDate(d.getUTCDate()-k);const key=dkey(d);wk.push(`<li class="${hist[key]>0?'on':''}${k?'':' now'}"><i>${hist[key]>0?'★':''}</i>${k?DAYS[d.getUTCDay()]:'Hari ini'}</li>`)}
 $('#pf-week').innerHTML=wk.join('');
 const t={total,streak:st,best};let got=0;
 $('#pf-badges').innerHTML=BADGES.map(b=>{const v=Math.min(b.v(t),b.m),ok=v>=b.m;if(ok)got++;
  return `<li class="${ok?'':'lock'}"><span class="tile" style="--c1:${b.c[0]};--c2:${b.c[1]}"><svg class="ic" aria-hidden="true"><use href="#i-${b.i}"/></svg></span><b>${b.n}</b><small>${ok?'Terbuka! 🎉':b.d+' · '+v+'/'+b.m}</small>${ok?'':`<span class="pg"><i style="width:${v/b.m*100}%"></i></span>`}</li>`}).join('');
 $('#bd-count').textContent=got+'/'+BADGES.length;
}
const saveP=()=>store.set(PK,JSON.stringify(prof));
function hist_(pts){hist[dkey()]=pts;const k=Object.keys(hist).sort();while(k.length>90)delete hist[k.shift()];store.set(HK,JSON.stringify(hist));drawProfile()}
$('#pf-input').value=prof.name;
const pfSay=gsay;
let nameT;$('#pf-input').addEventListener('input',e=>{prof.name=e.target.value.trim().slice(0,16);saveP();drawProfile();const m=$('#pf-saved');m.classList.add('on');clearTimeout(nameT);nameT=setTimeout(()=>m.classList.remove('on'),1200)});
$('.pf-avs').addEventListener('click',e=>{const b=e.target.closest('[data-av]');if(b){prof.av=b.dataset.av;prof.photoOn=false;saveP();drawProfile()}});
$('.pf-avs').addEventListener('keydown',e=>{if(!/^Arrow(Left|Right)$/.test(e.key))return;e.preventDefault();e.stopPropagation();const i=AVS.indexOf(prof.av),n=AVS[(i+(e.key==='ArrowRight'?1:AVS.length-1))%AVS.length];prof.av=n;prof.photoOn=false;saveP();drawProfile();$('.pf-avs [data-av="'+n+'"]').focus()});
/* atur ulang: konfirmasi di dalam desain (bukan dialog bawaan browser) */
$('#pf-reset').onclick=()=>{$('#pf-reset').hidden=true;$('#pf-confirm').hidden=false;$('#pf-yes').scrollIntoView({block:'center',behavior:'smooth'})};
$('#pf-no').onclick=()=>{$('#pf-confirm').hidden=true;$('#pf-reset').hidden=false};
$('#pf-yes').onclick=()=>{prof={name:'',av:'dino-blue',plays:0,photoOn:true};photo='';photoRev++;savePhoto();hist={};saveP();store.set(HK,'{}');store.set(MK,'{}');done=[];paint();$('#pf-input').value='';pfAv=null;$('#pf-confirm').hidden=true;$('#pf-reset').hidden=false;drawProfile();pfSay('Profil sudah diatur ulang')};
$('#pf-share').onclick=async()=>{const total=sum(),lv=Math.floor(total/5)+1,txt=(prof.name||'Aku')+' sudah Lv '+lv+' ('+RANKS[Math.min(lv,RANKS.length)-1]+') dengan '+total+' bintang di Dino Family Play! Yuk main bareng keluarga.';
 try{if(navigator.share){await navigator.share({title:'Dino Family Play',text:txt,url:location.href.split('#')[0]});return}}catch(e){if(e&&e.name==='AbortError')return}
 try{await navigator.clipboard.writeText(txt+' '+location.href.split('#')[0]);pfSay('Teks profil tersalin')}catch(e){pfSay('Bagikan: '+txt)}};
/* hitung game yang dibuka */
document.addEventListener('click',e=>{if(e.target.closest('a[data-play]')){prof.plays=(+prof.plays||0)+1;saveP()}},true);

/* Foto profil: pilih foto → atur (geser, cubit/zoom, putar) dalam lingkaran → simpan, seperti WhatsApp.
   Hasil dipotong persegi 512px (JPEG) dan disimpan di perangkat ini saja (localStorage). */
function savePhoto(){try{if(photo)localStorage.setItem(PHK,photo);else localStorage.removeItem(PHK);return true}catch(e){return false}}
const crop=$('#crop'),cv=$('#cr-cv'),cst=$('#cr-stage'),crR=$('#cr-range'),cmask=$('.cr-mask',crop),cctx=cv.getContext('2d'),pfFile=$('#pf-file'),CMAX=5;
let cMin=1,cK=1,cX=0,cY=0,cOpener=null;
const cC=()=>cmask.offsetWidth||260;
function cClamp(){const C=cC(),mx=Math.max(0,(cv.width*cK-C)/2),my=Math.max(0,(cv.height*cK-C)/2);cX=Math.min(mx,Math.max(-mx,cX));cY=Math.min(my,Math.max(-my,cY))}
function cDraw(){cClamp();cv.style.transform='translate(-50%,-50%) translate('+cX+'px,'+cY+'px) scale('+cK+')';crR.value=Math.round(Math.log(cK/cMin)/Math.log(CMAX)*100)}
function cSetK(k){k=Math.min(cMin*CMAX,Math.max(cMin,k));const f=k/cK;cX*=f;cY*=f;cK=k}
function cFit(){cMin=cC()/Math.min(cv.width,cv.height);cK=cMin;cX=cY=0;cDraw()}
function cLoad(img){const M=2048,r=Math.min(1,M/Math.max(img.naturalWidth,img.naturalHeight));
 cv.width=Math.max(1,Math.round(img.naturalWidth*r));cv.height=Math.max(1,Math.round(img.naturalHeight*r));
 cctx.fillStyle='#fff';cctx.fillRect(0,0,cv.width,cv.height);cctx.drawImage(img,0,0,cv.width,cv.height)}
function cOpen(img){cOpener=document.activeElement;crop.hidden=false;document.body.classList.add('lock');cLoad(img);cFit();$('.cr-sheet',crop).focus({preventScroll:true})}
function cClose(){crop.hidden=true;document.body.classList.remove('lock');cv.width=cv.height=1;cOpener&&cOpener.focus&&cOpener.focus({preventScroll:true})}
function cRotate(){const t=document.createElement('canvas');t.width=cv.height;t.height=cv.width;const x=t.getContext('2d');x.translate(t.width/2,t.height/2);x.rotate(Math.PI/2);x.drawImage(cv,-cv.width/2,-cv.height/2);
 cv.width=t.width;cv.height=t.height;cctx.drawImage(t,0,0);cFit()}
function cResult(){const C=cC(),O=512,o=document.createElement('canvas');o.width=o.height=O;const x=o.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,O,O);x.imageSmoothingQuality='high';
 x.drawImage(cv,cv.width/2+(-C/2-cX)/cK,cv.height/2+(-C/2-cY)/cK,C/cK,C/cK,0,0,O,O);return o.toDataURL('image/jpeg',.86)}
function pickPhoto(){pfFile.click()}
$('#pf-cam').onclick=pickPhoto;$('#pp-add').onclick=pickPhoto;
pfFile.addEventListener('change',()=>{const f=pfFile.files&&pfFile.files[0];pfFile.value='';if(!f)return;
 if(!/^image\//.test(f.type)&&!/\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i.test(f.name)){gsay('Pilih file gambar (JPG, PNG, atau WebP).');return}
 const u=URL.createObjectURL(f),im=new Image();
 im.onload=()=>{URL.revokeObjectURL(u);cOpen(im)};
 im.onerror=()=>{URL.revokeObjectURL(u);gsay('Foto ini tidak bisa dibuka. Coba foto lain (JPG atau PNG).')};im.src=u});
$('#pp-use').onclick=()=>{prof.photoOn=true;saveP();drawProfile();gsay('Foto dipakai')};
$('#pp-del').onclick=()=>{photo='';photoRev++;prof.photoOn=false;savePhoto();saveP();drawProfile();gsay('Foto dihapus')};
$('#cr-ok').onclick=()=>{photo=cResult();photoRev++;prof.photoOn=true;const ok=savePhoto();saveP();cClose();drawProfile();
 gsay(ok?'Foto profil disimpan':'Foto dipakai, tapi tidak bisa disimpan permanen di perangkat ini')};
$('#cr-no').onclick=cClose;$('#cr-x').onclick=cClose;$('#cr-rot').onclick=cRotate;
crR.addEventListener('input',()=>{cSetK(cMin*Math.pow(CMAX,crR.value/100));cDraw()});
/* geser & cubit (sentuh, mouse, pena) */
const ptr=new Map();
cst.addEventListener('pointerdown',e=>{try{cst.setPointerCapture(e.pointerId)}catch(_){}ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});cst.classList.add('drag')});
cst.addEventListener('pointermove',e=>{const p=ptr.get(e.pointerId);if(!p)return;
 if(ptr.size===1){cX+=e.clientX-p.x;cY+=e.clientY-p.y}
 else{const o=[...ptr].find(a=>a[0]!==e.pointerId)[1],d0=Math.hypot(p.x-o.x,p.y-o.y),d1=Math.hypot(e.clientX-o.x,e.clientY-o.y);if(d0>0)cSetK(cK*d1/d0);cX+=(e.clientX-p.x)/2;cY+=(e.clientY-p.y)/2}
 p.x=e.clientX;p.y=e.clientY;cDraw()});
const cUp=e=>{ptr.delete(e.pointerId);if(!ptr.size)cst.classList.remove('drag')};
cst.addEventListener('pointerup',cUp);cst.addEventListener('pointercancel',cUp);cst.addEventListener('lostpointercapture',cUp);
cst.addEventListener('wheel',e=>{e.preventDefault();cSetK(cK*Math.exp(-e.deltaY*.0015));cDraw()},{passive:false});
cst.addEventListener('keydown',e=>{const k=e.key,s=14;let h=true;
 if(k==='ArrowLeft')cX+=s;else if(k==='ArrowRight')cX-=s;else if(k==='ArrowUp')cY+=s;else if(k==='ArrowDown')cY-=s;
 else if(k==='+'||k==='=')cSetK(cK*1.1);else if(k==='-'||k==='_')cSetK(cK/1.1);else h=false;
 if(h){e.preventDefault();cDraw()}});
addEventListener('resize',()=>{if(crop.hidden)return;const r=cK/cMin;cMin=cC()/Math.min(cv.width,cv.height);cK=cMin*r;cDraw()});
crop.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const f=$$('button:not([disabled]),input,[tabindex="0"]',crop).filter(x=>x.offsetParent);if(!f.length)return;const a=f[0],z=f[f.length-1];
 if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}});
crop.addEventListener('click',e=>{if(e.target===crop)cClose()});

/* misi keluarga (tersimpan per hari di perangkat) */
const MK='dfp-missions',today=new Date().toISOString().slice(0,10);
let done=[];try{const s=JSON.parse(store.get(MK)||'{}');if(s.d===today)done=s.done||[]}catch(e){}
const ms=$$('#missions .m'),GOAL=6;
function paint(){
 let pts=0;ms.forEach((b,i)=>{const on=done.includes(i);b.setAttribute('aria-pressed',on);if(on)pts+=+b.dataset.s});
 $('#pval').textContent=pts+' / '+GOAL;$('#pfill').style.width=pts/GOAL*100+'%';
 const bar=$('#pbar');bar.setAttribute('aria-valuenow',pts);
 const r=$('#reward');r.classList.toggle('win',pts===GOAL);if(pts===GOAL&&wasWin===false)burst();wasWin=pts===GOAL;
 hist_(pts);
 $('#rtxt').textContent=pts===GOAL?'Hebat! Semua misi selesai — tim keluarga juara hari ini!':pts?'Bagus! Lanjutkan misi berikutnya.':'Selesaikan misi pertama untuk membuka bintang!';
}
let wasWin=null;
function burst(){const r=$('#reward');for(let i=0;i<16;i++){const s=document.createElement('i');s.className='cf';s.style.cssText='--x:'+((Math.random()*2-1)*150)+'px;--y:'+(-50-Math.random()*90)+'px;--d:'+(Math.random()*.2)+'s;--h:'+Math.floor(Math.random()*360);r.appendChild(s);setTimeout(()=>s.remove(),1200)}}
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
 if(!crop.hidden){if(k==='Escape'){e.preventDefault();cClose()}return}
 if(k==='Escape'||k==='Backspace'||k==='BrowserBack'||k==='GoBack'){
  if(!dn.hidden){e.preventDefault();closeDonate()}
  else if(!modal.hidden){e.preventDefault();close()}
  else if(nav.classList.contains('open')){shut()}
  else if(tv&&k!=='Backspace'){e.preventDefault();scrollTo(0,0);$('.btn.big').focus()}
  return}
 if(!/^Arrow(Left|Right|Up|Down)$/.test(k))return;
 if(!tv)return;
 if(!modal.hidden){e.preventDefault();return}
 const cur=document.activeElement,els=$$(sel,!dn.hidden?dn:document).filter(el=>el.offsetParent&&!el.closest('[hidden]'));
 if(!cur||cur===document.body){e.preventDefault();(els.find(x=>x.classList.contains('big'))||els[0]).focus();return}
 const r=cur.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let best,bs=1e9;
 for(const el of els){if(el===cur)continue;const q=el.getBoundingClientRect(),x=q.left+q.width/2-cx,y=q.top+q.height/2-cy;
  const ok=k==='ArrowRight'?x>8&&Math.abs(y)<=Math.abs(x)*1.2+r.height:k==='ArrowLeft'?x<-8&&Math.abs(y)<=Math.abs(x)*1.2+r.height:k==='ArrowDown'?y>8&&Math.abs(x)<=Math.abs(y)*1.2+r.width:y<-8&&Math.abs(x)<=Math.abs(y)*1.2+r.width;
  if(!ok)continue;const s=(k==='ArrowLeft'||k==='ArrowRight')?Math.abs(x)+Math.abs(y)*2.5:Math.abs(y)+Math.abs(x)*2.5;if(s<bs){bs=s;best=el}}
 if(best){e.preventDefault();best.focus();best.scrollIntoView({block:'center',inline:'center',behavior:'auto'})}
});

/* Instal PWA: tombol di header + kartu panduan per perangkat (tanpa jendela baru) */
const rootEl=document.documentElement;
const std=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
if(std)rootEl.classList.add('is-installed');
let dip=null;const stEl=$('#inst-st'),mainB=$('#inst-main');
const UA=navigator.userAgent;
const platOf=()=>rootEl.classList.contains('tv')?'tv':(/iPhone|iPad|iPod/.test(UA)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1))?'ios':/Android/.test(UA)?'and':'pc';
const itabs=$$('.itabs [role=tab]'),ipans=$$('.ipanel');
function pickInst(p){itabs.forEach(b=>{const on=b.dataset.p===p;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1});ipans.forEach(x=>x.hidden=x.dataset.p!==p)}
itabs.forEach((b,i)=>{b.onclick=()=>pickInst(b.dataset.p);b.onkeydown=e=>{if(/^Arrow(Left|Right)$/.test(e.key)){e.preventDefault();e.stopPropagation();const n=itabs[(i+(e.key==='ArrowRight'?1:itabs.length-1))%itabs.length];pickInst(n.dataset.p);n.focus()}}});
pickInst(platOf());
function instState(){if(stEl)stEl.textContent=dip?'Siap dipasang dengan satu ketukan.':'Ikuti langkah di bawah sesuai perangkatmu.'}
instState();
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e;instState()});
addEventListener('appinstalled',()=>{dip=null;rootEl.classList.add('is-installed');gsay('Terpasang! Cari ikon Dino di layar utama.')});
async function doInstall(e){
 if(dip){e&&e.preventDefault();const p=dip;dip=null;try{p.prompt();const r=await p.userChoice;if(r&&r.outcome==='accepted')gsay('Sedang memasang…');else{dip=p;}}catch(_){}instState();return}
 pickInst(platOf());
 if(e&&e.currentTarget===mainB){const pn=$('.ipanel:not([hidden])');if(pn){pn.classList.remove('flash');void pn.offsetWidth;pn.classList.add('flash');pn.scrollIntoView({block:'nearest',behavior:'smooth'})}gsay('Ikuti langkah untuk perangkatmu di bawah.')}
}
$$('[data-inst]').forEach(b=>b.addEventListener('click',doInstall));
const cp=$('#inst-copy');if(cp)cp.onclick=async()=>{const u=location.href.split('#')[0].split('?')[0];let ok=false;try{await navigator.clipboard.writeText(u);ok=true}catch(e){try{const t=document.createElement('textarea');t.value=u;t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();ok=document.execCommand('copy');t.remove()}catch(_){}}gsay(ok?'Tautan tersalin.':'Salin manual: '+u)};
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))addEventListener('load',()=>{navigator.serviceWorker.register('service-worker.js').catch(()=>{})});
})();
