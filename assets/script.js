document.addEventListener('DOMContentLoaded', function(){
  const menuBtn = document.querySelector('button.hamburger[aria-controls]');
  const menu = menuBtn ? document.getElementById(menuBtn.getAttribute('aria-controls')) : null;
  const bar = document.getElementById('order-now-bar');

  function setMenu(expanded){
    if(!menuBtn || !menu) return;
    menuBtn.setAttribute('aria-expanded', String(expanded));
    if(expanded){ menu.removeAttribute('hidden'); } else { menu.setAttribute('hidden',''); }
  }
  if(menuBtn){
    setMenu(menuBtn.getAttribute('aria-expanded') === 'true');
    menuBtn.addEventListener('click', ()=> setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ setMenu(false); menuBtn.focus(); } });
  }

  // rAF-throttled scroll handler to avoid forced reflow
  let lastY = 0, ticking = false, state = false;
  const mql = window.matchMedia('(max-width: 900px)');
  function updateBar(){
    const show = mql.matches && lastY > 120;
    if(bar && show !== state){
      state = show;
      if(show){ bar.classList.add('show'); document.body.classList.add('orderbar-visible'); }
      else{ bar.classList.remove('show'); document.body.classList.remove('orderbar-visible'); }
    }
    ticking = false;
  }
  function onScroll(){
    lastY = window.scrollY || window.pageYOffset;
    if(!ticking){
      window.requestAnimationFrame(updateBar);
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', ()=> { lastY = window.scrollY || 0; onScroll(); });
  onScroll();
});