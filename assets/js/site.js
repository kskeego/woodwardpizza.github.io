// Accessible enhancements (no frameworks)
(function() {
  // Mark current nav link based on location
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('header nav a').forEach(function(a){
    var href = a.getAttribute('href');
    if (!href) return;
    var dest = href.split('/').pop();
    if (dest === here) a.setAttribute('aria-current', 'page');
  });
})();
