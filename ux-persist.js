(()=>{'use strict';const U=window.UX;if(!U)return;const {$,$$,tr,toast,copy}=U;

// Runtime compatibility shim for the original app helpers.
// app.js passes selector strings as query roots in a few invoice/comparison paths.
// Browsers do not normally expose querySelector/querySelectorAll on String, so the
// original initialization stopped before the document tools finished booting.
if(typeof String.prototype.querySelector!=='function')Object.defineProperty(String.prototype,'querySelector',{configurable:true,value:function(s){const r=document.querySelector(String(this));return r?r.querySelector(s):null}});
if(typeof String.prototype.querySelectorAll!=='function')Object.defineProperty(String.prototype,'querySelectorAll',{configurable:true,value:function(s){const r=document.querySelector(String(this));return r?r.querySelectorAll(s):[]}});

const storedLang=localStorage.getItem('u-lang')||'ar',storedTheme=localStorage.getItem('u-theme')||'light';
document.documentElement.lang=storedLang;document.documentElement.dir=storedLang==='ar'?'rtl':'ltr';document.documentElement.dataset.theme=storedTheme;
$$('[data-ar][data-en]').forEach(el=>el.textContent=storedLang==='ar'?el.dataset.ar:el.dataset.en);
$$('[data-placeholder-ar]').forEach(el=>el.placeholder=storedLang==='ar'?el.dataset.placeholderAr:el.dataset.placeholderEn);
if($('#langBtn'))$('#langBtn').textContent=storedLang==='ar'?'EN':'AR';if($('#themeBtn'))$('#themeBtn').textContent=storedTheme==='dark'?'☀':'◐';
const mark=$('.brand-mark');if(mark){mark.textContent='';mark.innerHTML='<img src="icon.svg" alt="U" style="width:100%;height:100%;display:block;border-radius:14px">';mark.style.background='transparent';mark.style.transform='none'}

// Recover invoice initialization if app.js stopped while building the first preview.
const recoverInvoice=()=>{const ed=$('#itemsEditor'),add=$('#addItemBtn');if(!ed||!add)return;let raw=localStorage.getItem('u-invoice-draft'),draft=null;try{draft=raw?JSON.parse(raw):null}catch{}
  if(draft?.items?.length){ed.innerHTML='';draft.items.slice(0,250).forEach(i=>{add.click();const row=$$('.item-row',ed).at(-1);if(!row)return;const d=$('.item-desc',row),q=$('.item-qty',row),p=$('.item-price',row);d.value=String(i?.desc??'');q.value=Number(i?.qty)||0;p.value=Number(i?.price)||0;d.dispatchEvent(new Event('input',{bubbles:true}))})}
  else if(!$('.item-row',ed))add.click();
  $('#docNo')?.dispatchEvent(new Event('input',{bubbles:true}));
};
try{recoverInvoice()}catch(e){console.error('U invoice recovery',e)}

// Supplier comparison: persist locally and do not rank incomplete zero-price offers.
const se=$('#supplierEditor');
const supplierRows=()=>se?$$('.supplier-row',se):[];
const comparisonComplete=()=>{const rows=supplierRows();return rows.length>=2&&rows.every(r=>(+$('.sup-base',r)?.value||0)>0)};
const guardComparison=()=>{if(!se||comparisonComplete())return;const p=$('#comparePreview');if(p)p.innerHTML=`<div class="tool-result"><b>${tr('أكمل أسعار الموردين أولًا','Complete supplier prices first')}</b><br>${tr('أدخل سعرًا أساسيًا أكبر من صفر لكل مورد حتى تكون المقارنة والترتيب عادلين.','Enter a base price greater than zero for every supplier so ranking is meaningful.')}</div>`};

if(se){
  const save=()=>{let d={title:$('#compareTitle')?.value||'',currency:$('#compareCurrency')?.value||'EGP',rows:supplierRows().map(r=>({name:$('.sup-name',r)?.value||'',base:+$('.sup-base',r)?.value||0,shipping:+$('.sup-ship',r)?.value||0,tax:+$('.sup-tax',r)?.value||0,discount:+$('.sup-disc',r)?.value||0,days:+$('.sup-days',r)?.value||0,rating:+$('.sup-rate',r)?.value||1}))};localStorage.setItem('u-supplier-compare',JSON.stringify(d))};
  let raw=localStorage.getItem('u-supplier-compare'),loaded=false;
  if(raw)try{let d=JSON.parse(raw);if(d.rows?.length){loaded=true;se.innerHTML='';$('#compareTitle').value=d.title||'';$('#compareCurrency').value=d.currency||'EGP';d.rows.forEach(x=>{$('#addSupplierBtn').click();let r=supplierRows().at(-1);[['.sup-name','name'],['.sup-base','base'],['.sup-ship','shipping'],['.sup-tax','tax'],['.sup-disc','discount'],['.sup-days','days'],['.sup-rate','rating']].forEach(([q,k])=>{let e=$(q,r);e.value=x[k]??'';e.dispatchEvent(new Event('input',{bubbles:true}))})})}}catch{}
  if(!loaded&&!supplierRows().length){$('#addSupplierBtn')?.click();$('#addSupplierBtn')?.click();const rows=supplierRows();if(rows[0]){$('.sup-name',rows[0]).value=tr('المورد أ','Supplier A')}if(rows[1]){$('.sup-name',rows[1]).value=tr('المورد ب','Supplier B')}}
  se.addEventListener('input',()=>{clearTimeout(save.t);save.t=setTimeout(save,250);setTimeout(guardComparison,0)});
  $('#compareTitle')?.addEventListener('input',save);$('#compareCurrency')?.addEventListener('change',save);
  new MutationObserver(()=>{clearTimeout(save.t);save.t=setTimeout(save,250);setTimeout(guardComparison,0)}).observe(se,{childList:true});
  setTimeout(guardComparison,0);
  document.addEventListener('click',e=>{if((e.target.closest?.('#exportCompareBtn')||e.target.closest?.('#printCompareBtn'))&&!comparisonComplete()){e.preventDefault();e.stopImmediatePropagation();toast(tr('أدخل سعرًا لكل مورد قبل التصدير أو الطباعة','Enter a price for every supplier before export or print'))}},true);
}

// SHA-256 implementation with Web Crypto first and a pure-JS fallback for browsers/
// contexts where crypto.subtle is unavailable. This powers both text and file hash tools.
const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
function shaFallback(bytes){let h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],len=bytes.length,bitLen=len*8,padded=((len+72)>>6)<<6,data=new Uint8Array(padded);data.set(bytes);data[len]=0x80;let dv=new DataView(data.buffer);dv.setUint32(padded-8,Math.floor(bitLen/0x100000000));dv.setUint32(padded-4,bitLen>>>0);const r=(x,n)=>(x>>>n)|(x<<(32-n));for(let off=0;off<padded;off+=64){let w=new Uint32Array(64);for(let i=0;i<16;i++)w[i]=dv.getUint32(off+i*4);for(let i=16;i<64;i++){let s0=r(w[i-15],7)^r(w[i-15],18)^(w[i-15]>>>3),s1=r(w[i-2],17)^r(w[i-2],19)^(w[i-2]>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)>>>0}let[a,b,c,d,e,f,g,hh]=h;for(let i=0;i<64;i++){let S1=r(e,6)^r(e,11)^r(e,25),ch=(e&f)^((~e)&g),t1=(hh+S1+ch+K[i]+w[i])>>>0,S0=r(a,2)^r(a,13)^r(a,22),maj=(a&b)^(a&c)^(b&c),t2=(S0+maj)>>>0;hh=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0}h=[(h[0]+a)>>>0,(h[1]+b)>>>0,(h[2]+c)>>>0,(h[3]+d)>>>0,(h[4]+e)>>>0,(h[5]+f)>>>0,(h[6]+g)>>>0,(h[7]+hh)>>>0]}return h.map(x=>x.toString(16).padStart(8,'0')).join('')}
async function sha256(bytes){try{if(globalThis.crypto?.subtle){const b=await crypto.subtle.digest('SHA-256',bytes);return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}}catch{}return shaFallback(bytes instanceof Uint8Array?bytes:new Uint8Array(bytes))}
window.UHash={sha256};
document.addEventListener('click',async e=>{const textBtn=e.target.closest?.('#hashRun'),fileBtn=e.target.closest?.('#hr');if(!textBtn&&!fileBtn)return;e.preventDefault();e.stopPropagation();try{if(textBtn){const out=$('#hashOut'),v=$('#hashIn')?.value||'';if(out)out.textContent=tr('جارٍ الحساب…','Calculating…');const h=await sha256(new TextEncoder().encode(v));if(out)out.innerHTML=`<code>${h}</code><br><button class="ghost-btn" id="hashCopyFixed" style="margin-top:10px">${tr('نسخ','Copy')}</button>`;$('#hashCopyFixed')?.addEventListener('click',()=>copy(h),{once:true})}else{const f=$('#hf')?.files?.[0],out=$('#ho');if(!f)return toast(tr('اختر ملفًا','Choose a file'));if(out)out.textContent=tr('جارٍ الحساب…','Calculating…');const h=await sha256(new Uint8Array(await f.arrayBuffer()));if(out)out.innerHTML=`<b>${U.esc(f.name)}</b><br><code>${h}</code><br><button class="ghost-btn" id="fileHashCopyFixed" style="margin-top:10px">${tr('نسخ','Copy')}</button>`;$('#fileHashCopyFixed')?.addEventListener('click',()=>copy(h),{once:true})}}catch(err){console.error(err);toast(tr('تعذر حساب البصمة','Could not calculate hash'))}},true);

// Invoice/quotation portable JSON backup. Import writes the same local draft schema used by app.js.
const invoiceActions=$('#saveInvoiceBtn')?.parentElement;
if(invoiceActions&&!$('#exportInvoiceDraftBtn')){
  const exportBtn=document.createElement('button');exportBtn.type='button';exportBtn.className='ghost-btn';exportBtn.id='exportInvoiceDraftBtn';exportBtn.textContent=tr('نسخة JSON','JSON backup');
  const importBtn=document.createElement('button');importBtn.type='button';importBtn.className='ghost-btn';importBtn.id='importInvoiceDraftBtn';importBtn.textContent=tr('استيراد','Import');
  const file=document.createElement('input');file.type='file';file.accept='.json,application/json';file.hidden=true;
  invoiceActions.append(exportBtn,importBtn,file);
  const download=(name,text)=>{const blob=new Blob([text],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500)};
  exportBtn.onclick=()=>{$('#saveInvoiceBtn')?.click();const raw=localStorage.getItem('u-invoice-draft');if(!raw)return toast(tr('لا توجد مسودة للتصدير','No draft to export'));let no=($('#docNo')?.value||'document').replace(/[^\w.-]+/g,'-');download(`u-${no}.json`,JSON.stringify({app:'U Utility Studio',version:1,exportedAt:new Date().toISOString(),draft:JSON.parse(raw)},null,2));toast(tr('تم إنشاء النسخة','Backup created'))};
  importBtn.onclick=()=>file.click();
  file.onchange=async()=>{const f=file.files?.[0];if(!f)return;if(f.size>5*1024*1024){file.value='';return toast(tr('الملف أكبر من الحد المسموح','File is too large'))}try{const parsed=JSON.parse(await f.text()),d=parsed?.draft||parsed;if(!d||typeof d!=='object'||!Array.isArray(d.items))throw Error('schema');d.items=d.items.slice(0,250).map(i=>({desc:String(i?.desc??'').slice(0,500),qty:Number(i?.qty)||0,price:Number(i?.price)||0}));if(d.logo&&(!String(d.logo).startsWith('data:image/')||String(d.logo).length>3_500_000))d.logo='';localStorage.setItem('u-invoice-draft',JSON.stringify(d));if(d.logo)localStorage.setItem('u-invoice-logo',d.logo);else localStorage.removeItem('u-invoice-logo');toast(tr('تم الاستيراد — جارٍ إعادة التحميل','Imported — reloading'));setTimeout(()=>location.reload(),350)}catch{toast(tr('ملف النسخة غير صالح','Invalid backup file'))}finally{file.value=''}};
}

// Fast keyboard access to the tool deck.
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();const s=$('#toolSearch');s?.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>s?.focus(),180)}});

// Install PWA affordance when the browser exposes the install event.
let deferred;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;if($('.install-app-btn'))return;let b=document.createElement('button');b.type='button';b.className='ghost-btn install-app-btn';b.textContent=tr('تثبيت التطبيق','Install app');$('.top-actions')?.prepend(b);b.onclick=async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;b.remove()}});
window.__U_RUNTIME_RECOVERED__=true;
})();