
/* Enhanced measurement: outbound links, file downloads, and order online clicks */
(function(){
  const KEY = 'wpz_consent_v1';
  function hasAnalyticsConsent(){
    try{ const s = JSON.parse(localStorage.getItem(KEY)||'null'); return s && s.analytics === true; }catch(e){ return false; }
  }
  function fire(eventName, params){
    if(!hasAnalyticsConsent()) return;
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    try{ gtag('event', eventName, params || {}); }catch(e){}
  }
  function isOutbound(url){
    try{{ const u = new URL(url, location.href); return u.hostname !== location.hostname; }}
    catch(e){{ return false; }}
  }
  const fileExt = ['pdf','doc','docx','xls','xlsx','ppt','pptx','zip','rar','7z','csv','txt','rtf','json'];
  function isDownload(url){
    try{{ const u = new URL(url, location.href); const path = u.pathname.toLowerCase(); const ext = path.split('.').pop(); return fileExt.includes(ext); }}
    catch(e){{ return false; }}
  }
  document.addEventListener('click', function(e){
    const a = e.target.closest('a[href]');
    if(!a) return;
    const href = a.getAttribute('href');
    const label = (a.getAttribute('aria-label') || a.textContent || '').trim();

    if(/order\.toasttab\.com\/online\/woodwardpizza/.test(href)){
      fire('order_online_click', {{ link_url: href, link_text: label, page_location: location.href, page_path: location.pathname }});
      return;
    }
    if(isOutbound(href)){
      fire('outbound_click', {{ link_url: href, link_text: label, page_location: location.href, page_path: location.pathname, transport_type:'beacon' }});
    }
    if(isDownload(href)){
      const parts = href.split('/'); const fname = parts[parts.length-1]; const ext = fname.split('.').pop().toLowerCase();
      fire('file_download', {{ file_name: fname, file_extension: ext, link_url: href, page_path: location.pathname }});
    }
  }, true);
})();
