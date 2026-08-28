(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],ar=()=>document.documentElement.lang!=='en',tr=(a,e)=>ar()?a:e,esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Business Documents Studio updates the invoice preview after app.js rerenders it.
// Only direct child changes need watching. A subtree observer would also observe
// the studio's own badge/text mutations and can create an endless microtask loop.
if(window.MutationObserver&&!window.__U_PREVIEW_OBSERVER_GUARD__){
  const NativeMutationObserver=window.MutationObserver;
  class UMutationObserver extends NativeMutationObserver{
    observe(target,options){
      if(target?.id==='invoicePreview'&&options?.childList&&options?.subtree){
        return super.observe(target,{...options,subtree:false});
      }
      return super.observe(target,options);
    }
  }
  window.MutationObserver=UMutationObserver;
  window.__U_PREVIEW_OBSERVER_GUARD__=true;
}

const dlg=$('#toolDialog'),body=$('#dialogBody'),ttl=$('#dialogTitle'),grid=$('#toolGrid');if(!dlg||!body||!ttl||!grid)return;
const toast=m=>{let e=$('#toast');if(!e)return;e.textContent=m;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),1600)};
const copy=async s=>{try{await navigator.clipboard.writeText(s)}catch{let t=document.createElement('textarea');t.value=s;document.body.append(t);t.select();document.execCommand('copy');t.remove()}toast(tr('تم النسخ','Copied'))};
const open=(a,e,h,fn)=>{ttl.textContent=tr(a,e);body.innerHTML=`<div class="tool-form enhanced-tool">${h}</div>`;fn?.(body);dlg.showModal()};
const handlers={};window.UX={$, $$, ar, tr, esc, toast, copy, open, handlers};
const cards=[
['units','↔','محول الوحدات','Unit Converter','طول • وزن • حرارة','Length • mass • temperature','CALC','unit convert length weight temperature وحدات'],
['vat','VAT','حاسبة الضريبة','VAT Calculator','إضافة أو استخراج الضريبة','Add or extract tax','MONEY','vat tax ضريبة'],
['margin','↗%','الربح والهامش','Profit & Margin','تكلفة • بيع • Margin • Markup','Cost • price • margin • markup','MONEY','profit margin markup ربح هامش'],
['loan','▥','حاسبة الأقساط','Installment Calculator','قسط شهري وفائدة وإجمالي','Monthly payment and interest','MONEY','loan installment emi قرض قسط'],
['age','⌛','حاسبة العمر','Age Calculator','العمر الدقيق حتى تاريخ تختاره','Exact age as of any date','TIME','age birthday عمر ميلاد'],
['random','⚄','اختيار عشوائي','Random Picker','اختيار عنصر أو خلط قائمة','Pick one item or shuffle a list','TEXT','random picker shuffle قرعة'],
['regex','.*','مختبر Regex','Regex Tester','اختبار التعبيرات المنتظمة مباشرة','Live regular-expression testing','DEV','regex tester regular expression'],
['jwt','JWT','قارئ JWT','JWT Decoder','عرض Header وPayload محليًا','Decode header and payload locally','DEV','jwt token payload'],
['csvjson','⇆','CSV ↔ JSON','CSV ↔ JSON','تحويل بيانات الجداول بين الصيغتين','Convert tabular data both ways','DATA','csv json convert بيانات'],
['lines','≡','أدوات الأسطر','Line Toolkit','ترتيب • حذف تكرار • عكس','Sort • dedupe • reverse','TEXT','lines sort dedupe أسطر'],
['filehash','#F','بصمة ملف','File Checksum','SHA‑256 لأي ملف بدون رفعه','SHA‑256 any file, no upload','SECURE','file hash checksum sha256 بصمة'],
['split','÷','تقسيم الفاتورة','Bill Splitter','إجمالي + بقشيش ÷ أشخاص','Total + tip ÷ people','MONEY','bill split tip فاتورة بقشيش']];
const pal=['accent-4','accent-5','accent-6','accent-1','accent-2','accent-3'];cards.forEach((c,i)=>{let b=document.createElement('button');b.type='button';b.className=`tool-card ${pal[i%6]} enhanced-card`;b.dataset.extra=c[0];b.dataset.category=c[6].toLowerCase();b.dataset.search=c[7];b.innerHTML=`<span class="tool-icon">${c[1]}</span><b data-ar="${esc(c[2])}" data-en="${esc(c[3])}">${esc(tr(c[2],c[3]))}</b><small data-ar="${esc(c[4])}" data-en="${esc(c[5])}">${esc(tr(c[4],c[5]))}</small><em>${c[6]}</em>`;grid.append(b)});
const cmap={image:'design',password:'secure',uuid:'dev',json:'dev',base64:'dev',hash:'secure',clean:'text',counter:'text',url:'web',color:'design',timestamp:'time',case:'text',percent:'calc',datediff:'time'};$$('.tool-card[data-tool]').forEach(c=>c.dataset.category=cmap[c.dataset.tool]||'other');$('.external-card')?.setAttribute('data-category','web');
const sw=$('.search-wrap');if(sw){let f=document.createElement('div');f.className='tool-filters';f.innerHTML=[['all','الكل','All'],['text','نصوص','Text'],['dev','مطور','Dev'],['money','ماليات','Money'],['calc','حسابات','Calc'],['time','وقت','Time'],['design','تصميم','Design'],['web','ويب','Web'],['secure','أمان','Secure'],['data','بيانات','Data']].map((x,i)=>`<button type="button" class="filter-chip ${i?'':'active'}" data-filter="${x[0]}" data-ar="${x[1]}" data-en="${x[2]}">${tr(x[1],x[2])}</button>`).join('');sw.parentElement.append(f);let active='all';const run=()=>{let q=($('#toolSearch')?.value||'').trim().toLowerCase();$$('.tool-card').forEach(c=>c.hidden=!((active==='all'||c.dataset.category===active)&&(!q||`${c.dataset.search||''} ${c.textContent}`.toLowerCase().includes(q))))};$$('.filter-chip',f).forEach(c=>c.onclick=()=>{active=c.dataset.filter;$$('.filter-chip',f).forEach(x=>x.classList.toggle('active',x===c));run()});$('#toolSearch')?.addEventListener('input',run)}
$$('.enhanced-card').forEach(c=>c.onclick=()=>window.UX.handlers[c.dataset.extra]?.());let stat=$('.mini-stats span:first-child b');if(stat)stat.textContent=`${$$('.tool-card').length}+`;
if('serviceWorker' in navigator){const reg=()=>navigator.serviceWorker.register('sw.js').catch(()=>{});if(document.readyState==='complete')reg();else window.addEventListener('load',reg,{once:true})}
const studio=document.createElement('script');studio.src='ux-studio.js?v=4';studio.async=true;studio.onload=()=>{const media=document.createElement('script');media.src='ux-media-hotfix.js?v=1';media.async=true;document.head.append(media)};document.head.append(studio);
})();