(() => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const tr = (ar, en) => state.lang === 'ar' ? ar : en;
  const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = (n, c = 'EGP') => `${Number(n || 0).toLocaleString(state.lang === 'ar' ? 'ar-EG' : 'en-US', { maximumFractionDigits: 2 })} ${c}`;
  const state = {
    lang: localStorage.getItem('u-lang') || 'ar',
    theme: localStorage.getItem('u-theme') || 'light',
    logo: localStorage.getItem('u-invoice-logo') || ''
  };

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1700);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const t = document.createElement('textarea');
      t.value = text;
      t.style.position = 'fixed';
      t.style.opacity = '0';
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    toast(tr('تم النسخ', 'Copied'));
  }

  function applyLogo() {
    const mark = $('.brand-mark');
    if (mark) {
      mark.textContent = '';
      mark.innerHTML = '<img src="icon.svg" alt="U" style="width:100%;height:100%;display:block;border-radius:14px">';
      mark.style.background = 'transparent';
      mark.style.transform = 'none';
    }
  }

  function applyLanguage() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
    $$('[data-ar][data-en]').forEach(el => el.textContent = el.dataset[state.lang]);
    $$('[data-placeholder-ar]').forEach(el => el.placeholder = state.lang === 'ar' ? el.dataset.placeholderAr : el.dataset.placeholderEn);
    $('#langBtn').textContent = state.lang === 'ar' ? 'EN' : 'AR';
    renderInvoicePreview();
    renderCompare();
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    $('#themeBtn').textContent = state.theme === 'dark' ? '☀' : '◐';
  }

  $('#langBtn').addEventListener('click', () => {
    state.lang = state.lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('u-lang', state.lang);
    applyLanguage();
  });

  $('#themeBtn').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('u-theme', state.theme);
    applyTheme();
  });

  $('#toolSearch').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    $$('.tool-card').forEach(card => {
      const hay = `${card.dataset.search || ''} ${card.textContent}`.toLowerCase();
      card.hidden = !!q && !hay.includes(q);
    });
  });

  const dialog = $('#toolDialog');
  const dialogTitle = $('#dialogTitle');
  const dialogBody = $('#dialogBody');
  $('#closeDialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  $$('.tool-card[data-tool]').forEach(card => card.addEventListener('click', () => openTool(card.dataset.tool)));

  function shell(html) { dialogBody.innerHTML = `<div class="tool-form">${html}</div>`; }
  function title(ar, en) { dialogTitle.textContent = tr(ar, en); }
  function openTool(type) {
    const map = { image:imageTool, password:passwordTool, uuid:uuidTool, json:jsonTool, base64:base64Tool, hash:hashTool, clean:cleanTool, counter:counterTool, url:urlTool, color:colorTool, timestamp:timestampTool, case:caseTool, percent:percentTool, datediff:dateDiffTool };
    if (!map[type]) return;
    map[type]();
    dialog.showModal();
  }

  function imageTool() {
    title('معمل الصور', 'Image Lab');
    shell(`
      <label><span>${tr('اختر صورة', 'Choose image')}</span><input id="imgFile" type="file" accept="image/*"></label>
      <div class="row">
        <label><span>${tr('أقصى عرض بالبكسل (0 = الأصلي)', 'Max width px (0 = original)')}</span><input id="imgWidth" type="number" min="0" value="1600"></label>
        <label><span>${tr('الجودة %', 'Quality %')}</span><input id="imgQuality" type="number" min="10" max="100" value="82"></label>
      </div>
      <label><span>${tr('الصيغة', 'Format')}</span><select id="imgFormat"><option value="image/webp">WebP</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG</option></select></label>
      <button class="primary-btn" id="imgRun" type="button">${tr('معالجة الصورة', 'Process image')}</button>
      <div id="imgOut" class="tool-result">${tr('يتم التحويل داخل المتصفح، وتُزال بيانات EXIF عند إعادة التصدير.', 'Processing stays in the browser; EXIF is stripped on re-export.')}</div>`);

    $('#imgRun', dialogBody).onclick = () => {
      const file = $('#imgFile', dialogBody).files[0];
      if (!file) return toast(tr('اختر صورة أولًا', 'Choose an image first'));
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = Number($('#imgWidth', dialogBody).value) || 0;
          const quality = Math.max(.1, Math.min(1, (Number($('#imgQuality', dialogBody).value) || 82) / 100));
          const scale = maxWidth && img.width > maxWidth ? maxWidth / img.width : 1;
          const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          const format = $('#imgFormat', dialogBody).value;
          canvas.toBlob(blob => {
            if (!blob) return toast(tr('تعذر إنشاء الصورة', 'Could not process image'));
            const url = URL.createObjectURL(blob);
            const ext = format.split('/')[1].replace('jpeg', 'jpg');
            const saved = Math.max(0, 100 - (blob.size / file.size * 100));
            $('#imgOut', dialogBody).innerHTML = `<div class="image-result"><img src="${url}" alt=""><div><b>${w}×${h}</b><p>${tr('الأصل','Original')}: ${(file.size/1024).toFixed(1)} KB<br>${tr('الجديد','New')}: ${(blob.size/1024).toFixed(1)} KB<br>${tr('التوفير','Saved')}: ${saved.toFixed(1)}%</p><a class="primary-btn" href="${url}" download="u-image.${ext}">${tr('تحميل','Download')}</a></div></div>`;
          }, format, format === 'image/png' ? undefined : quality);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    };
  }

  function passwordTool() {
    title('مولد كلمات مرور', 'Password Generator');
    shell(`
      <div class="row"><label><span>${tr('الطول','Length')}</span><input id="pwLen" type="number" min="6" max="128" value="20"></label><label><span>${tr('عدد النتائج','Count')}</span><input id="pwCount" type="number" min="1" max="20" value="4"></label></div>
      <div class="row"><label><input id="pwUpper" type="checkbox" checked> ${tr('حروف كبيرة','Uppercase')}</label><label><input id="pwLower" type="checkbox" checked> ${tr('حروف صغيرة','Lowercase')}</label><label><input id="pwNum" type="checkbox" checked> ${tr('أرقام','Numbers')}</label><label><input id="pwSym" type="checkbox" checked> ${tr('رموز','Symbols')}</label></div>
      <div class="strength"><span id="pwStrength"></span></div>
      <button class="primary-btn" id="pwRun" type="button">${tr('توليد','Generate')}</button>
      <div id="pwOut" class="tool-result"></div>`);
    const run = () => {
      let chars = '';
      if ($('#pwUpper',dialogBody).checked) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      if ($('#pwLower',dialogBody).checked) chars += 'abcdefghijkmnopqrstuvwxyz';
      if ($('#pwNum',dialogBody).checked) chars += '23456789';
      if ($('#pwSym',dialogBody).checked) chars += '!@#$%^&*_-+=?';
      if (!chars) return toast(tr('اختر نوع أحرف', 'Select character sets'));
      const len = Math.min(128, Math.max(6, +$('#pwLen',dialogBody).value || 20));
      const count = Math.min(20, Math.max(1, +$('#pwCount',dialogBody).value || 4));
      const out = [];
      for (let j=0;j<count;j++) {
        const bytes = new Uint32Array(len); crypto.getRandomValues(bytes);
        out.push([...bytes].map(n => chars[n % chars.length]).join(''));
      }
      $('#pwOut',dialogBody).innerHTML = out.map(p => `<div style="display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px solid var(--line)"><code>${esc(p)}</code><button class="ghost-btn pw-copy" data-v="${esc(p)}">${tr('نسخ','Copy')}</button></div>`).join('');
      $$('.pw-copy',dialogBody).forEach(b => b.onclick = () => copyText(b.dataset.v));
      const sets = [$('#pwUpper',dialogBody),$('#pwLower',dialogBody),$('#pwNum',dialogBody),$('#pwSym',dialogBody)].filter(x=>x.checked).length;
      $('#pwStrength',dialogBody).style.width = Math.min(100, (len/32*65)+(sets/4*35)) + '%';
    };
    $('#pwRun',dialogBody).onclick = run; run();
  }

  function uuidTool() {
    title('مولد UUID / GUID','UUID / GUID Generator');
    shell(`<div class="row"><label><span>${tr('العدد','Count')}</span><input id="uuidCount" type="number" min="1" max="50" value="8"></label><label><span>${tr('الحالة','Case')}</span><select id="uuidCase"><option value="lower">lowercase</option><option value="upper">UPPERCASE</option></select></label></div><div class="tool-actions"><button class="primary-btn" id="uuidRun">${tr('توليد','Generate')}</button><button class="secondary-btn" id="uuidCopy">${tr('نسخ الكل','Copy all')}</button></div><pre id="uuidOut" class="tool-result"></pre>`);
    const run = () => {
      const n = Math.min(50, Math.max(1, +$('#uuidCount',dialogBody).value || 8));
      const upper = $('#uuidCase',dialogBody).value === 'upper';
      $('#uuidOut',dialogBody).textContent = Array.from({length:n}, () => {
        const v = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c==='x'?r:(r&3|8);return v.toString(16)});
        return upper ? v.toUpperCase() : v;
      }).join('\n');
    };
    $('#uuidRun',dialogBody).onclick = run;
    $('#uuidCopy',dialogBody).onclick = () => copyText($('#uuidOut',dialogBody).textContent);
    run();
  }

  function jsonTool() {
    title('JSON Studio','JSON Studio');
    shell(`<label><span>JSON</span><textarea id="jsonIn" rows="11" placeholder='{"hello":"world"}'></textarea></label><div class="tool-actions"><button class="primary-btn" id="jsonFormat">${tr('تنسيق','Format')}</button><button class="secondary-btn" id="jsonMin">${tr('تصغير','Minify')}</button><button class="ghost-btn" id="jsonCopy">${tr('نسخ','Copy')}</button></div><div id="jsonStatus" class="tool-result"></div>`);
    const parse = () => JSON.parse($('#jsonIn',dialogBody).value);
    $('#jsonFormat',dialogBody).onclick = () => { try { $('#jsonIn',dialogBody).value = JSON.stringify(parse(),null,2); $('#jsonStatus',dialogBody).textContent = tr('✓ JSON صالح','✓ Valid JSON'); } catch(e) { $('#jsonStatus',dialogBody).textContent='✕ '+e.message; } };
    $('#jsonMin',dialogBody).onclick = () => { try { $('#jsonIn',dialogBody).value = JSON.stringify(parse()); $('#jsonStatus',dialogBody).textContent = tr('✓ تم التصغير','✓ Minified'); } catch(e) { $('#jsonStatus',dialogBody).textContent='✕ '+e.message; } };
    $('#jsonCopy',dialogBody).onclick = () => copyText($('#jsonIn',dialogBody).value);
  }

  function base64Tool() {
    title('Base64','Base64');
    shell(`<label><span>${tr('النص','Text')}</span><textarea id="b64In" rows="9"></textarea></label><div class="tool-actions"><button class="primary-btn" id="b64Enc">${tr('ترميز','Encode')}</button><button class="secondary-btn" id="b64Dec">${tr('فك الترميز','Decode')}</button><button class="ghost-btn" id="b64Copy">${tr('نسخ','Copy')}</button></div><div id="b64Out" class="tool-result"></div>`);
    const enc = s => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
    const dec = s => new TextDecoder().decode(Uint8Array.from(atob(s), c => c.charCodeAt(0)));
    $('#b64Enc',dialogBody).onclick = () => { try { $('#b64Out',dialogBody).textContent = enc($('#b64In',dialogBody).value); } catch(e) { toast(e.message); } };
    $('#b64Dec',dialogBody).onclick = () => { try { $('#b64Out',dialogBody).textContent = dec($('#b64In',dialogBody).value.trim()); } catch { toast(tr('Base64 غير صالح','Invalid Base64')); } };
    $('#b64Copy',dialogBody).onclick = () => copyText($('#b64Out',dialogBody).textContent);
  }

  function hashTool() {
    title('SHA‑256','SHA‑256');
    shell(`<label><span>${tr('النص','Text')}</span><textarea id="hashIn" rows="8"></textarea></label><button class="primary-btn" id="hashRun">${tr('إنشاء البصمة','Generate hash')}</button><div id="hashOut" class="tool-result"></div>`);
    $('#hashRun',dialogBody).onclick = async () => {
      const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode($('#hashIn',dialogBody).value));
      const h = [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
      $('#hashOut',dialogBody).innerHTML = `<code>${h}</code><br><button class="ghost-btn" id="hashCopy" style="margin-top:10px">${tr('نسخ','Copy')}</button>`;
      $('#hashCopy',dialogBody).onclick = () => copyText(h);
    };
  }

  function cleanTool() {
    title('منظف النص','Text Cleaner');
    shell(`<label><span>${tr('النص','Text')}</span><textarea id="cleanIn" rows="10"></textarea></label><div class="tool-actions"><button class="primary-btn" id="cleanSpaces">${tr('تنظيف شامل','Clean up')}</button><button class="secondary-btn" id="cleanBlank">${tr('حذف الأسطر الفارغة','Remove blank lines')}</button><button class="ghost-btn" id="cleanCopy">${tr('نسخ','Copy')}</button></div><div id="cleanStats" class="tool-result"></div>`);
    const stats = () => $('#cleanStats',dialogBody).textContent = `${tr('الحروف','Characters')}: ${$('#cleanIn',dialogBody).value.length}`;
    $('#cleanSpaces',dialogBody).onclick = () => { $('#cleanIn',dialogBody).value = $('#cleanIn',dialogBody).value.split('\n').map(x=>x.trim().replace(/[ \t]+/g,' ')).join('\n').replace(/\n{3,}/g,'\n\n'); stats(); };
    $('#cleanBlank',dialogBody).onclick = () => { $('#cleanIn',dialogBody).value = $('#cleanIn',dialogBody).value.split('\n').filter(x=>x.trim()).join('\n'); stats(); };
    $('#cleanCopy',dialogBody).onclick = () => copyText($('#cleanIn',dialogBody).value);
    $('#cleanIn',dialogBody).oninput = stats; stats();
  }

  function counterTool() {
    title('عداد النص','Text Counter');
    shell(`<label><span>${tr('الصق أو اكتب النص','Paste or type text')}</span><textarea id="countIn" rows="12"></textarea></label><div id="countOut" class="tool-result"></div>`);
    const run = () => {
      const s = $('#countIn',dialogBody).value;
      const words = s.trim() ? s.trim().split(/\s+/).length : 0;
      const chars = s.length, noSpaces = s.replace(/\s/g,'').length, lines = s ? s.split(/\r?\n/).length : 0;
      const mins = words ? Math.max(1,Math.ceil(words/200)) : 0;
      $('#countOut',dialogBody).innerHTML = `<b>${words}</b> ${tr('كلمة','words')} · <b>${chars}</b> ${tr('حرف','characters')} · <b>${noSpaces}</b> ${tr('بدون مسافات','no spaces')} · <b>${lines}</b> ${tr('سطر','lines')} · ≈ <b>${mins}</b> ${tr('دقيقة قراءة','min read')}`;
    };
    $('#countIn',dialogBody).oninput = run; run();
  }

  function urlTool() {
    title('URL Encode / Decode','URL Encode / Decode');
    shell(`<label><span>${tr('النص أو الرابط','Text or URL')}</span><textarea id="urlIn" rows="9"></textarea></label><div class="tool-actions"><button class="primary-btn" id="urlEnc">Encode</button><button class="secondary-btn" id="urlDec">Decode</button><button class="ghost-btn" id="urlCopy">${tr('نسخ','Copy')}</button></div><div id="urlOut" class="tool-result"></div>`);
    $('#urlEnc',dialogBody).onclick = () => $('#urlOut',dialogBody).textContent = encodeURIComponent($('#urlIn',dialogBody).value);
    $('#urlDec',dialogBody).onclick = () => { try { $('#urlOut',dialogBody).textContent = decodeURIComponent($('#urlIn',dialogBody).value); } catch { toast(tr('قيمة غير صالحة','Invalid value')); } };
    $('#urlCopy',dialogBody).onclick = () => copyText($('#urlOut',dialogBody).textContent);
  }

  function colorTool() {
    title('محول الألوان','Color Converter');
    shell(`<div class="row"><label><span>HEX</span><input id="hexIn" value="#1f7a5c"></label><label><span>RGB</span><input id="rgbOut" readonly></label></div><div id="swatch" class="color-swatch"></div><div class="tool-actions"><button class="primary-btn" id="colorRun">${tr('تحويل','Convert')}</button><button class="secondary-btn" id="colorCopy">${tr('نسخ RGB','Copy RGB')}</button></div>`);
    const run = () => {
      let h = $('#hexIn',dialogBody).value.trim().replace('#','');
      if (h.length===3) h = h.split('').map(c=>c+c).join('');
      if (!/^[0-9a-f]{6}$/i.test(h)) return toast(tr('HEX غير صالح','Invalid HEX'));
      const n=parseInt(h,16), r=n>>16, g=(n>>8)&255, b=n&255, rgb=`rgb(${r}, ${g}, ${b})`;
      $('#rgbOut',dialogBody).value = rgb; $('#swatch',dialogBody).style.background = '#'+h;
    };
    $('#colorRun',dialogBody).onclick=run; $('#colorCopy',dialogBody).onclick=()=>copyText($('#rgbOut',dialogBody).value); run();
  }

  function timestampTool() {
    title('Unix Timestamp','Unix Timestamp');
    shell(`<div class="tool-result" id="nowTs"></div><div class="row"><label><span>Unix timestamp</span><input id="tsIn" type="number"></label><label><span>${tr('التاريخ المحلي','Local date')}</span><input id="dateOut" readonly></label></div><div class="row"><label><span>${tr('اختر تاريخًا','Choose date')}</span><input id="dateIn" type="datetime-local"></label><label><span>Unix</span><input id="tsOut" readonly></label></div>`);
    $('#nowTs',dialogBody).textContent = `${tr('الآن','Now')}: ${Math.floor(Date.now()/1000)}`;
    $('#tsIn',dialogBody).oninput=e=>{const v=+e.target.value;$('#dateOut',dialogBody).value=v?new Date(v*1000).toLocaleString():'';};
    $('#dateIn',dialogBody).oninput=e=>$('#tsOut',dialogBody).value=e.target.value?Math.floor(new Date(e.target.value).getTime()/1000):'';
  }

  function caseTool() {
    title('تحويل حالة النص','Text Case');
    shell(`<label><span>${tr('النص','Text')}</span><textarea id="caseIn" rows="9"></textarea></label><div class="tool-actions"><button class="primary-btn" data-case="upper">UPPER</button><button class="secondary-btn" data-case="lower">lower</button><button class="secondary-btn" data-case="title">Title</button><button class="secondary-btn" data-case="sentence">Sentence</button></div>`);
    $$('[data-case]',dialogBody).forEach(b=>b.onclick=()=>{
      const el=$('#caseIn',dialogBody), s=el.value;
      if(b.dataset.case==='upper') el.value=s.toUpperCase();
      if(b.dataset.case==='lower') el.value=s.toLowerCase();
      if(b.dataset.case==='title') el.value=s.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
      if(b.dataset.case==='sentence') el.value=s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g,c=>c.toUpperCase());
    });
  }

  function percentTool() {
    title('حاسبة النسبة','Percentage Calculator');
    shell(`<div class="row"><label><span>${tr('النسبة %','Percent %')}</span><input id="pct" type="number" value="15"></label><label><span>${tr('من الرقم','Of number')}</span><input id="pctBase" type="number" value="1000"></label></div><div id="pctOut" class="tool-result"></div><div class="row"><label><span>${tr('القيمة القديمة','Old value')}</span><input id="oldVal" type="number" value="100"></label><label><span>${tr('القيمة الجديدة','New value')}</span><input id="newVal" type="number" value="125"></label></div><div id="changeOut" class="tool-result"></div>`);
    const run=()=>{const p=+$('#pct',dialogBody).value||0,b=+$('#pctBase',dialogBody).value||0,o=+$('#oldVal',dialogBody).value||0,n=+$('#newVal',dialogBody).value||0;$('#pctOut',dialogBody).innerHTML=`${p}% ${tr('من','of')} ${b} = <b>${(p*b/100).toLocaleString()}</b>`;$('#changeOut',dialogBody).innerHTML=o?`${tr('التغير النسبي','Percentage change')}: <b>${(((n-o)/o)*100).toFixed(2)}%</b>`:tr('القيمة القديمة لا يمكن أن تكون صفرًا','Old value cannot be zero');};
    $$('input',dialogBody).forEach(i=>i.oninput=run); run();
  }

  function dateDiffTool() {
    title('فرق التاريخ','Date Difference');
    const today=new Date().toISOString().slice(0,10);
    shell(`<div class="row"><label><span>${tr('من','From')}</span><input id="d1" type="date" value="${today}"></label><label><span>${tr('إلى','To')}</span><input id="d2" type="date" value="${today}"></label></div><div id="dateDiffOut" class="tool-result"></div>`);
    const run=()=>{const a=new Date($('#d1',dialogBody).value+'T00:00:00'),b=new Date($('#d2',dialogBody).value+'T00:00:00');if(isNaN(a)||isNaN(b))return;const days=Math.abs(Math.round((b-a)/86400000));$('#dateDiffOut',dialogBody).innerHTML=`<b>${days}</b> ${tr('يوم','days')} · <b>${(days/7).toFixed(2)}</b> ${tr('أسبوع','weeks')} · ≈ <b>${(days/30.4375).toFixed(2)}</b> ${tr('شهر','months')}`;};
    $$('input',dialogBody).forEach(i=>i.oninput=run); run();
  }

  const invIds=['docType','docNo','docDate','currency','companyName','clientName','companyDetails','clientDetails','taxRate','discount','extraFee','invoiceNotes'];

  function addInvoiceItem(item={desc:'',qty:1,price:0}) {
    const row=document.createElement('div'); row.className='item-row';
    row.innerHTML=`<input class="item-desc" placeholder="${tr('الوصف','Description')}" value="${esc(item.desc)}"><input class="item-qty" type="number" min="0" step="0.01" value="${item.qty ?? 1}"><input class="item-price" type="number" min="0" step="0.01" value="${item.price ?? 0}"><div class="item-total">0</div><button type="button" class="remove-btn">×</button>`;
    $('.remove-btn',row).onclick=()=>{row.remove();renderInvoicePreview();};
    $$('input',row).forEach(i=>i.oninput=renderInvoicePreview);
    $('#itemsEditor').appendChild(row); renderInvoicePreview();
  }

  function invoiceData() {
    const d={}; invIds.forEach(id=>d[id]=$('#'+id).value); d.logo=state.logo;
    d.items=$$('.item-row','#itemsEditor').map(r=>({desc:$('.item-desc',r).value,qty:+$('.item-qty',r).value||0,price:+$('.item-price',r).value||0}));
    return d;
  }

  function calcInvoice(d) {
    const subtotal=d.items.reduce((s,i)=>s+i.qty*i.price,0), discount=Math.max(0,+d.discount||0), extra=Math.max(0,+d.extraFee||0);
    const taxable=Math.max(0,subtotal-discount+extra), tax=taxable*(Math.max(0,+d.taxRate||0)/100);
    return {subtotal,discount,extra,tax,total:taxable+tax};
  }

  function invoiceHTML(d) {
    const c=calcInvoice(d), type=d.docType==='quote'?tr('عرض سعر','QUOTATION'):tr('فاتورة','INVOICE');
    return `<div class="doc-head"><div class="doc-brand">${d.logo?`<img class="doc-logo" src="${d.logo}" alt="logo">`:''}<h3>${esc(d.companyName||tr('اسم الشركة','Company name'))}</h3><p>${esc(d.companyDetails||'')}</p></div><div class="doc-meta"><h4>${type}</h4><small># ${esc(d.docNo||'')}</small><small>${esc(d.docDate||'')}</small></div></div><div class="doc-parties"><div><div class="doc-party-label">${tr('صادر من','FROM')}</div><div class="doc-client"><h4>${esc(d.companyName||'—')}</h4><p>${esc(d.companyDetails||'—')}</p></div></div><div><div class="doc-party-label">${tr('إلى','BILL TO')}</div><div class="doc-client"><h4>${esc(d.clientName||'—')}</h4><p>${esc(d.clientDetails||'—')}</p></div></div></div><table class="doc-table"><thead><tr><th>${tr('الوصف','Description')}</th><th>${tr('الكمية','Qty')}</th><th>${tr('السعر','Price')}</th><th>${tr('الإجمالي','Total')}</th></tr></thead><tbody>${d.items.map(i=>`<tr><td>${esc(i.desc||'—')}</td><td>${i.qty}</td><td>${money(i.price,d.currency)}</td><td>${money(i.qty*i.price,d.currency)}</td></tr>`).join('')}</tbody></table><div class="doc-totals"><div><span>${tr('الإجمالي الفرعي','Subtotal')}</span><b>${money(c.subtotal,d.currency)}</b></div>${c.discount?`<div><span>${tr('الخصم','Discount')}</span><b>- ${money(c.discount,d.currency)}</b></div>`:''}${c.extra?`<div><span>${tr('إضافات','Extra')}</span><b>${money(c.extra,d.currency)}</b></div>`:''}${+d.taxRate?`<div><span>${tr('الضريبة','Tax')} (${esc(d.taxRate)}%)</span><b>${money(c.tax,d.currency)}</b></div>`:''}<div class="grand"><span>${tr('الإجمالي','TOTAL')}</span><b>${money(c.total,d.currency)}</b></div></div>${d.invoiceNotes?`<div class="doc-notes"><b>${tr('ملاحظات وشروط','Notes & terms')}</b><br>${esc(d.invoiceNotes)}</div>`:''}<div class="doc-footer">Generated with U — Utility Studio · u.iegy.net</div>`;
  }

  function renderInvoicePreview() {
    if (!$('#invoicePreview')) return;
    const d=invoiceData();
    $$('.item-row','#itemsEditor').forEach((r,idx)=>{const i=d.items[idx];$('.item-total',r).textContent=money(i.qty*i.price,d.currency);});
    $('#invoicePreview').innerHTML=invoiceHTML(d);
  }

  function saveInvoice() {
    const d=invoiceData();
    try { localStorage.setItem('u-invoice-draft',JSON.stringify(d)); if(state.logo)localStorage.setItem('u-invoice-logo',state.logo); toast(tr('تم حفظ المسودة محليًا','Draft saved locally')); }
    catch { toast(tr('المسودة كبيرة جدًا للحفظ المحلي','Draft is too large for local storage')); }
  }

  function loadInvoice() {
    const raw=localStorage.getItem('u-invoice-draft');
    if (!raw) { addInvoiceItem({desc:tr('خدمة / منتج','Service / product'),qty:1,price:0}); return; }
    try {
      const d=JSON.parse(raw); invIds.forEach(id=>{if(d[id]!=null)$('#'+id).value=d[id];}); state.logo=d.logo||state.logo||'';
      $('#itemsEditor').innerHTML=''; (d.items?.length?d.items:[{}]).forEach(addInvoiceItem);
    } catch { addInvoiceItem({}); }
  }

  $('#addItemBtn').onclick=()=>addInvoiceItem({});
  invIds.forEach(id=>$('#'+id).addEventListener('input',renderInvoicePreview));
  $('#logoInput').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{state.logo=r.result;renderInvoicePreview();};r.readAsDataURL(f);};
  $('#saveInvoiceBtn').onclick=saveInvoice;
  $('#resetInvoiceBtn').onclick=()=>{if(!confirm(tr('مسح المسودة الحالية؟','Clear current draft?')))return;localStorage.removeItem('u-invoice-draft');localStorage.removeItem('u-invoice-logo');state.logo='';$('#invoiceForm').reset();$('#docDate').value=new Date().toISOString().slice(0,10);$('#itemsEditor').innerHTML='';addInvoiceItem({});};
  $('#printInvoiceBtn').onclick=()=>{$('#printArea').innerHTML=`<div class="document-preview">${invoiceHTML(invoiceData())}</div>`;window.print();};

  function addSupplier(s={name:'',base:0,shipping:0,tax:0,discount:0,days:7,rating:4}) {
    const row=document.createElement('div'); row.className='supplier-row';
    row.innerHTML=`<label><span>${tr('المورد','Supplier')}</span><input class="sup-name" value="${esc(s.name)}" placeholder="Supplier"></label><label><span>${tr('السعر','Price')}</span><input class="sup-base" type="number" min="0" step="0.01" value="${s.base}"></label><label><span>${tr('شحن','Shipping')}</span><input class="sup-ship" type="number" min="0" step="0.01" value="${s.shipping}"></label><label><span>${tr('ضريبة %','Tax %')}</span><input class="sup-tax" type="number" min="0" step="0.01" value="${s.tax}"></label><label><span>${tr('خصم','Discount')}</span><input class="sup-disc" type="number" min="0" step="0.01" value="${s.discount}"></label><label><span>${tr('أيام','Days')}</span><input class="sup-days" type="number" min="0" value="${s.days}"></label><button type="button" class="remove-btn">×</button><label><span>${tr('التقييم 1-5','Rating 1-5')}</span><input class="sup-rate" type="number" min="1" max="5" step="0.1" value="${s.rating}"></label>`;
    $('.remove-btn',row).onclick=()=>{row.remove();renderCompare();};
    $$('input',row).forEach(i=>i.oninput=renderCompare);
    $('#supplierEditor').appendChild(row); renderCompare();
  }

  function suppliersData() {
    return $$('.supplier-row','#supplierEditor').map(r=>{
      const s={name:$('.sup-name',r).value||tr('مورد بدون اسم','Unnamed supplier'),base:+$('.sup-base',r).value||0,shipping:+$('.sup-ship',r).value||0,tax:+$('.sup-tax',r).value||0,discount:+$('.sup-disc',r).value||0,days:+$('.sup-days',r).value||0,rating:Math.max(1,Math.min(5,+$('.sup-rate',r).value||1))};
      s.total=Math.max(0,(s.base+s.shipping-s.discount)*(1+s.tax/100)); return s;
    });
  }

  function rankedSuppliers() {
    const a=suppliersData(); if(!a.length)return[];
    const maxCost=Math.max(...a.map(x=>x.total),1), maxDays=Math.max(...a.map(x=>x.days),1);
    return a.map(s=>({ ...s, score: (1-s.total/maxCost)*55 + (1-s.days/maxDays)*20 + (s.rating/5)*25 })).sort((x,y)=>y.score-x.score);
  }

  function renderCompare() {
    if(!$('#comparePreview'))return;
    const rows=rankedSuppliers(), cur=$('#compareCurrency').value, project=$('#compareTitle').value.trim();
    if(!rows.length){$('#comparePreview').innerHTML=`<div class="tool-result">${tr('أضف عروض الموردين لبدء المقارنة.','Add supplier offers to start comparing.')}</div>`;return;}
    const best=rows[0];
    $('#comparePreview').innerHTML=`<div class="winner-card"><small>${tr('أفضل قيمة موزونة','BEST WEIGHTED VALUE')}</small><h3>${esc(best.name)}</h3><p>${money(best.total,cur)} · ${best.days} ${tr('يوم','days')} · ★ ${best.rating.toFixed(1)}</p></div><div class="compare-table-wrap"><table class="compare-table"><thead><tr><th>${tr('المورد','Supplier')}</th><th>${tr('السعر النهائي','Landed cost')}</th><th>${tr('المدة','Days')}</th><th>${tr('التقييم','Rating')}</th><th>${tr('النقاط','Score')}</th></tr></thead><tbody>${rows.map((s,i)=>`<tr class="${i===0?'best-row':''}"><td>${esc(s.name)}</td><td>${money(s.total,cur)}</td><td>${s.days}</td><td>${s.rating.toFixed(1)}</td><td>${s.score.toFixed(1)}</td></tr>`).join('')}</tbody></table></div><p class="score-note">${tr('الترتيب الاسترشادي يوازن بين التكلفة الإجمالية 55%، مدة التوريد 20%، وتقييم المورد 25%. يمكنك استخدام الجدول كدعم للقرار وليس بديلًا عن التقييم التجاري والفني.','Indicative ranking weights landed cost 55%, lead time 20%, and supplier rating 25%. Use it to support — not replace — commercial and technical judgment.')}${project?`<br><b>${esc(project)}</b>`:''}</p>`;
  }

  function compareCSV() {
    const cur=$('#compareCurrency').value, rows=rankedSuppliers();
    const data=[['Supplier','Base','Shipping','Tax %','Discount','Landed Cost','Days','Rating','Score','Currency'],...rows.map(s=>[s.name,s.base,s.shipping,s.tax,s.discount,s.total,s.days,s.rating,s.score.toFixed(2),cur])];
    return '\ufeff'+data.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  }

  function downloadText(name,text,type='text/plain;charset=utf-8') {
    const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);
  }

  $('#addSupplierBtn').onclick=()=>addSupplier({});
  $('#compareTitle').addEventListener('input',renderCompare); $('#compareCurrency').addEventListener('change',renderCompare);
  $('#exportCompareBtn').onclick=()=>downloadText('supplier-comparison.csv',compareCSV(),'text/csv;charset=utf-8');
  $('#printCompareBtn').onclick=()=>{const rows=rankedSuppliers(),cur=$('#compareCurrency').value;$('#printArea').innerHTML=`<div class="print-compare"><h1>${esc($('#compareTitle').value||tr('مقارنة عروض الموردين','Supplier comparison'))}</h1><table><thead><tr><th>${tr('المورد','Supplier')}</th><th>${tr('التكلفة','Cost')}</th><th>${tr('الأيام','Days')}</th><th>${tr('التقييم','Rating')}</th><th>${tr('النقاط','Score')}</th></tr></thead><tbody>${rows.map(s=>`<tr><td>${esc(s.name)}</td><td>${money(s.total,cur)}</td><td>${s.days}</td><td>${s.rating}</td><td>${s.score.toFixed(1)}</td></tr>`).join('')}</tbody></table></div>`;window.print();};
  $('#resetCompareBtn').onclick=()=>{if(!confirm(tr('مسح المقارنة الحالية؟','Clear current comparison?')))return;$('#compareTitle').value='';$('#supplierEditor').innerHTML='';addSupplier({name:tr('المورد أ','Supplier A'),base:0,days:7,rating:4});addSupplier({name:tr('المورد ب','Supplier B'),base:0,days:10,rating:4});};

  $('#docDate').value = $('#docDate').value || new Date().toISOString().slice(0,10);
  loadInvoice();
  if(!$('.supplier-row','#supplierEditor')) {
    addSupplier({name:'Supplier A',base:0,shipping:0,tax:0,discount:0,days:7,rating:4.5});
    addSupplier({name:'Supplier B',base:0,shipping:0,tax:0,discount:0,days:10,rating:4});
  }
  applyLogo(); applyTheme(); applyLanguage(); renderInvoicePreview(); renderCompare();

  if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
