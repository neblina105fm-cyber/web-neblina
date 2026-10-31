/* Neblina 105.5 FM · Kit web v3: reproductor anclado y ventana de nota */
(function(){
  var $=function(s,r){return (r||document).querySelector(s);},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function on(el,ev,fn){if(el)el.addEventListener(ev,fn);}
  /* contador y quitar anillos */
  var lab=$('#ringLab');
  function cnt(){var c=$('#ringCount');if(c&&lab)c.textContent=lab.querySelectorAll(':scope>.pr').length+' anillos';}
  if(lab){on($('#ringAdd'),'click',function(){setTimeout(cnt,0);});on($('#ringDel'),'click',function(){if(lab._rf)lab._rf.remove();cnt();});setTimeout(cnt,600);}
  /* reproductor anclado */
  var pl=$('#nbPlayer'),hero=$('#portada');
  if(pl&&!hero)pl.classList.add('show');if(pl&&hero){var io=new IntersectionObserver(function(e){pl.classList.toggle('show',!e[0].isIntersecting);},{threshold:.15});io.observe(hero);}
  $$('.nb-play').forEach(function(b){on(b,'click',function(){var o=!b.classList.contains('on');b.classList.toggle('on',o);b.setAttribute('aria-label',o?'Pausar':'Reproducir');
    var p=b.querySelector('path');if(p)p.setAttribute('d',o?'M7 5h4v14H7zM13 5h4v14h-4z':'M8 5v14l11-7z');
    var eq=b.closest('.nb-player')&&b.closest('.nb-player').querySelector('.nb-eq');if(eq)eq.classList.toggle('on',o);
    if(o&&b.animate&&!reduce){var e='linear(0, .218 2.1%, .85 6.5%, 1.118 10.8%, 1.18 13.2%, 1.168 15.8%, 1.009 25.1%, .976 28.9%, .982 35.4%, 1.002 45.6%, 1)';if(!(window.CSS&&CSS.supports('transition-timing-function',e)))e='cubic-bezier(.34,1.56,.64,1)';b.animate([{transform:'scale(.7)'},{transform:'scale(1)'}],{duration:900,easing:e});}});});
  $$('.nb-min').forEach(function(b){on(b,'click',function(){var p=b.closest('.nb-player');var m=p.classList.toggle('min');b.setAttribute('aria-label',m?'Expandir reproductor':'Minimizar reproductor');});});
  /* ventana de nota */
  var ov=$('#nbOverlay'),last=null;
  function openNote(c){if(!ov)return;last=c;['cat','title','date','by','body','grad','icon'].forEach(function(k){var v=c.getAttribute('data-'+k);if(v===null)return;
      if(k==='grad')$('.cover',ov).style.background=v;else if(k==='icon'){var u=$('.cover .cat use',ov);if(u)u.setAttribute('href','#i-'+v);}else{var t=$('[data-f="'+k+'"]',ov);if(t)t.textContent=v;}});
    ov.classList.add('open');ov.setAttribute('aria-hidden','false');document.documentElement.style.overflow='hidden';setTimeout(function(){$('.nb-close',ov).focus();},60);}
  function closeNote(){if(!ov||!ov.classList.contains('open'))return;ov.classList.remove('open');ov.setAttribute('aria-hidden','true');document.documentElement.style.overflow='';if(last)last.focus();}
  $$('[data-note]').forEach(function(c){on(c,'click',function(){openNote(c);});});
  on(ov,'click',function(e){if(e.target===ov||e.target.closest('.nb-close'))closeNote();});
  addEventListener('keydown',function(e){if(e.key==='Escape')closeNote();
    if(e.key==='Tab'&&ov&&ov.classList.contains('open')){var f=$$('button,a[href]',ov);if(!f.length)return;var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}});
})();
