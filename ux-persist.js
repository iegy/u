(()=>{'use strict';const U=window.UX;if(!U)return;const {$,$$,tr,toast}=U;

// Supplier comparison: persist locally and do not rank incomplete zero-price offers.
const se=$('#supplierEditor');
const supplierRows=()=>se?$$('.supplier-row',se):[];
const comparisonComplete=()=>{const rows=supplierRows();return rows.length>=2&&rows.every(r=>(+$('.sup-base',r)?.value||0)>0)};
const guardComparison=()=>{if(!se||comparisonComplete())return;const p=$('#comparePreview');if(p)p.innerHTML=`<div class="tool-result"><b>${tr('أكمل أسعار الموردين أولًا','Complete supplier prices first')}</b><br>${tr('أدخل سعرًا أساسيًا أكبر من صفر لكل مورد حتى تكون المقارنة والترتيب عادلين.','Enter a base price greater than zero for every supplier so ranking is meaningful.')}</div>`};

if(se){
  const save=()=>{let d={title:$('#compareTitle')?.value||'',currency:$('#compareCurrency')?.value||'EGP',rows:supplierRows().map(r=>({name:$('.sup-name',r)?.value||'',base:+$('.sup-base',r)?.value||0,shipping:+$('.sup-ship',r)?.value||0,tax:+$('.sup-tax',r)?.value||0,discount:+$('.sup-disc',r)?.value||0,days:+$('.sup-days',r)?.value||0,rating:+$('.sup-rate',r)?.value||1}))};localStorage.setItem('u-supplier-compare',JSON.stringify(d))};
  let raw=localStorage.getItem('u-supplier-compare');
  if(raw)try{let d=JSON.parse(raw);if(d.rows?.length){se.innerHTML='';$('#compareTitle').value=d.title||'';$('#compareCurrency').value=d.currency||'EGP';d.rows.forEach(x=>{$('#addSupplierBtn').click();let r=supplierRows().at(-1);[['.sup-name','name'],['.sup-base','base'],['.sup-ship','shipping'],['.sup-tax','tax'],['.sup-disc','discount'],['.sup-days','days'],['.sup-rate','rating']].forEach(([q,k])=>{let e=$(q,r);e.value=x[k]??'';e.dispatchEvent(new Event('input',{bubbles:true}))})})}}catch{}
  se.addEventListener('input',()=>{clearTimeout(save.t);save.t=setTimeout(save,250);setTimeout(guardComparison,0)});
  $('#compareTitle')?.addEventListener('input',save);$('#compareCurrency')?.addEventListener('change',save);
  new MutationObserver(()=>{clearTimeout(save.t);save.t=setTimeout(save,250);setTimeout(guardComparison,0)}).observe(se,{childList:true});
  setTimeout(guardComparison,0);
  document.addEventListener('click',e=>{if((e.target.closest?.('#exportCompareBtn')||e.target.closest?.('#printCompareBtn'))&&!comparisonComplete()){e.preventDefault();e.stopImmediatePropagation();toast(tr('أدخل سعرًا لكل مورد قبل التصدير أو الطباعة','Enter a price for every supplier before export or print'))}},true);
}

// Invoice/quotation portable JSON backup. Import writes the same local draft schema used by app.js.
const invoiceActions=$('#saveInvoiceBtn')?.parentElement;
if(invoiceActions){
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
let deferred;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;let b=document.createElement('button');b.type='button';b.className='ghost-btn install-app-btn';b.textContent=tr('تثبيت التطبيق','Install app');$('.top-actions')?.prepend(b);b.onclick=async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;b.remove()}});
})();