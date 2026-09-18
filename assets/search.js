(function(){
  var inp=document.getElementById('q'),out=document.getElementById('res'),meta=document.getElementById('meta');
  if(!inp||!out)return;
  var data=null;
  function norm(s){return (s||'').toString().toLowerCase()
    .replace(/[\u0617-\u061A\u064B-\u0652\u0670\u0640]/g,'')
    .replace(/[\u0623\u0625\u0622]/g,'\u0627').replace(/\u0649/g,'\u064A')
    .replace(/\u0629/g,'\u0647').replace(/\u0624/g,'\u0648').replace(/\u0626/g,'\u064A')
    .replace(/\s+/g,' ').trim();}
  function esc(s){return (s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function render(items,qs){
    if(!items.length){out.innerHTML='<p class="card">لا توجد نتائج مطابقة. جرّب كلمة أعم، أو تصفّح <a href="/sitemap.html">خريطة الموقع</a>.</p>';meta.textContent='';return;}
    var h='';for(var i=0;i<items.length;i++){var it=items[i];
      h+='<article class="card"><h2><a href="'+esc(it.u)+'">'+esc(it.t)+'</a></h2><p>'+esc(it.d)+'</p></article>';}
    out.innerHTML=h;meta.textContent='نتائج: '+items.length;
  }
  function run(){
    var q=norm(inp.value);
    if(!q){out.innerHTML='';meta.textContent='اكتب كلمة للبحث في '+data.length+' صفحة.';return;}
    var toks=q.split(' ').filter(Boolean),seen={},items=[];
    for(var i=0;i<data.length;i++){var it=data[i];var hay=norm(it.t+' '+it.k+' '+it.c+' '+it.d);var ok=true;
      for(var j=0;j<toks.length;j++){if(hay.indexOf(toks[j])<0){ok=false;break;}}
      if(ok&&!seen[it.u]){seen[it.u]=1;items.push(it);}
      if(items.length>=60)break;}
    render(items,q);
  }
  fetch('/assets/search-index.json').then(function(r){return r.json();}).then(function(j){data=j;meta.textContent='اكتب كلمة للبحث في '+data.length+' صفحة.';run();})
   .catch(function(){meta.textContent='تعذّر تحميل فهرس البحث. افتح الصفحة عبر خادم ويب.';});
  inp.addEventListener('input',function(){clearTimeout(window.__t);window.__t=setTimeout(run,120);});
  var f=document.getElementById('f');if(f){f.addEventListener('submit',function(e){e.preventDefault();run();});}
})();
