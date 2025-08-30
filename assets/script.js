
document.addEventListener('DOMContentLoaded', function(){
  const toggle = document.getElementById('nav-toggle');
  const label = document.querySelector('label[for="nav-toggle"]');
  const bar = document.getElementById('order-now-bar');

  function syncNav(){
    if(!toggle || !label) return;
    const ex = toggle.checked;
    toggle.setAttribute('aria-expanded', String(ex));
    label.setAttribute('aria-expanded', String(ex));
  }
  if(toggle){ toggle.addEventListener('change', syncNav); syncNav(); }

  function onScroll(){
    if(!bar) return;
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    if(isMobile && window.scrollY > 120){
      bar.classList.add('show');
      document.body.classList.add('orderbar-visible');
    } else {
      bar.classList.remove('show');
      document.body.classList.remove('orderbar-visible');
    }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  onScroll();
});
