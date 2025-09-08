/* LCP/CLS safe script: no forced reflow */
(() => {
  const header = document.querySelector('header');
  const hero = document.querySelector('.hero');

  // Toggle header class without layout thrash
  if (header && hero && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => {
      header.classList.toggle('is-scrolled', !e.isIntersecting);
    }, { rootMargin: '-80px 0px 0px 0px', threshold: 0 });
    io.observe(hero);
  }

  // Any scroll effects go through rAF and passive listeners
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY; // one READ
      if (header) header.classList.toggle('condensed', y > 10); // WRITE
      ticking = false;
    });
  }, { passive: true });
})();
