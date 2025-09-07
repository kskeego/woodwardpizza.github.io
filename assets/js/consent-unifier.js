// assets/js/consent-unifier.js
(function () {
  const KEY = 'consent_v1';
  const TTL_DAYS = 180;

  function injectBanner() {
    if (document.getElementById('cc-banner')) return;
    const style = document.createElement('style');
    style.textContent = `.cc-banner{position:fixed;inset:auto 1rem 1rem 1rem;max-width:680px;margin-inline:auto;background:#121212;color:#fff;border:1px solid #2a2a2a;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.35);z-index:9999;font:14px/1.5 system-ui,sans-serif}
.cc-inner{padding:1rem 1rem .75rem;position:relative}
.cc-groups{border:0;padding:0;margin:.75rem 0}
.cc-row{display:flex;gap:.5rem;align-items:flex-start;margin:.35rem 0}
.cc-row input{margin-top:.2rem}
.cc-actions{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.75rem}
.cc-btn{padding:.55rem .9rem;border-radius:8px;border:1px solid #3a3a3a;background:#1c1c1c;color:#fff;cursor:pointer}
.cc-btn.primary{background:#98001b;border-color:#98001b}
.cc-btn.outline{background:transparent}
.cc-close{position:absolute;top:.5rem;right:.5rem;background:transparent;border:0;color:#fff;font-size:1.25rem;cursor:pointer}`;
    document.head.appendChild(style);

    const div = document.createElement('div');
    div.id = "cc-banner";
    div.className = "cc-banner";
    div.setAttribute("role","dialog");
    div.setAttribute("aria-modal","true");
    div.setAttribute("aria-labelledby","cc-title");
    div.hidden = true;
    div.innerHTML = `<div class="cc-inner">
      <h2 id="cc-title">Your Privacy Choices</h2>
      <p>We use cookies to run this site, analyze traffic, and improve marketing.</p>
      <fieldset class="cc-groups">
        <label class="cc-row">
          <input type="checkbox" checked disabled>
          <span><strong>Essential</strong> — required for basic functionality.</span>
        </label>
        <label class="cc-row">
          <input type="checkbox" id="cc-analytics" checked>
          <span><strong>Analytics</strong> — traffic & usage insights.</span>
        </label>
        <label class="cc-row">
          <input type="checkbox" id="cc-marketing" checked>
          <span><strong>Marketing</strong> — personalization & ads.</span>
        </label>
      </fieldset>
      <div class="cc-actions">
        <button id="cc-accept-all" class="cc-btn primary" type="button">Accept All</button>
        <button id="cc-reject" class="cc-btn" type="button">Reject Non-Essential</button>
        <button id="cc-save" class="cc-btn outline" type="button">Save Preferences</button>
      </div>
      <button id="cc-close" class="cc-close" aria-label="Close">×</button>
    </div>`;
    document.body.appendChild(div);
  }

  function setCookie(name, value, days){
    const d = new Date(); d.setTime(d.getTime()+days*864e5);
    document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + d.toUTCString() + ";path=/;SameSite=Lax";
  }
  function getCookie(name){
    return document.cookie.split('; ').find(r=>r.startsWith(name+"="))?.split('=')[1];
  }
  function loadConsent(){
    try { return JSON.parse(decodeURIComponent(getCookie(KEY))) } catch { return null }
  }
  function saveConsent(state){ setCookie(KEY, JSON.stringify(state), TTL_DAYS) }

  function applyGate(state){
    document.querySelectorAll('script[type="text/plain"][data-consent]').forEach(node=>{
      const cat = node.getAttribute('data-consent');
      const allowed = (cat==='essential') ||
                      (cat==='analytics' && state.analytics) ||
                      (cat==='marketing' && state.marketing);
      if(!allowed) return;
      const s = document.createElement('script');
      [...node.attributes].forEach(a=>{ if(a.name!=='type') s.setAttribute(a.name,a.value) });
      s.type = 'text/javascript';
      if(!s.src && node.textContent) s.textContent = node.textContent;
      node.replaceWith(s);
    });
  }

  const adapters = {
    gcm: { present: () => true, apply: (s) => {
      if (typeof window.gtag === 'function') {
        window.gtag('consent','update',{
          ad_user_data: s.marketing ? 'granted':'denied',
          ad_personalization: s.marketing ? 'granted':'denied',
          ad_storage: s.marketing ? 'granted':'denied',
          analytics_storage: s.analytics ? 'granted':'denied',
          functionality_storage: 'granted',
          security_storage: 'granted'
        });
      } else {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event:'consent_update',
          ad_user_data: s.marketing ? 'granted':'denied',
          ad_personalization: s.marketing ? 'granted':'denied',
          ad_storage: s.marketing ? 'granted':'denied',
          analytics_storage: s.analytics ? 'granted':'denied',
          functionality_storage:'granted',
          security_storage:'granted'
        });
      }
    }},
    onetrust: { present: () => !!document.getElementById('onetrust-banner-sdk') || !!document.getElementById('onetrust-consent-sdk'),
      apply: (s) => {
        ['#onetrust-consent-sdk','#onetrust-banner-sdk','.otFloatingBtn','.ot-sdk-container']
          .forEach(sel => document.querySelectorAll(sel).forEach(el => el.style.display='none'));
        const acceptBtn = document.getElementById('onetrust-accept-btn-handler');
        const rejectBtn = document.getElementById('onetrust-reject-all-handler') || document.querySelector('#onetrust-pc-btn-handler + *');
        if (s.analytics && s.marketing && acceptBtn) acceptBtn.click();
        if (!s.analytics && !s.marketing && rejectBtn) rejectBtn.click();
      }},
    cookieyes: { present: () => !!document.querySelector('.cky-consent-container, #cookieyes'),
      apply: (s) => {
        document.querySelectorAll('.cky-consent-container, #cookieyes').forEach(el => el.style.display='none');
        const accept = document.querySelector('.cky-btn-accept, #cookieyes .accept-button');
        const reject = document.querySelector('.cky-btn-reject, #cookieyes .reject-button');
        if (s.analytics && s.marketing && accept) accept.click();
        if (!s.analytics && !s.marketing && reject) reject.click();
      }}
  };
  function forwardToVendors(state){
    Object.values(adapters).forEach(ad=>{ try{ if(ad.present()) ad.apply(state) }catch(e){} });
  }

  function bootUI(prev){
    const banner = document.getElementById('cc-banner');
    const elAn = document.getElementById('cc-analytics');
    const elMk = document.getElementById('cc-marketing');
    const btnAccept = document.getElementById('cc-accept-all');
    const btnReject = document.getElementById('cc-reject');
    const btnSave   = document.getElementById('cc-save');
    const btnClose  = document.getElementById('cc-close');

    function applyAndClose(state){
      saveConsent(state); applyGate(state); forwardToVendors(state); banner.hidden = true;
    }
    btnAccept?.addEventListener('click', () => { applyAndClose({ essential:true, analytics:true, marketing:true, ts:Date.now() }); });
    btnReject?.addEventListener('click', () => { applyAndClose({ essential:true, analytics:false, marketing:false, ts:Date.now() }); });
    btnSave?.addEventListener('click', () => { applyAndClose({ essential:true, analytics: !!elAn?.checked, marketing: !!elMk?.checked, ts:Date.now() }); });
    btnClose?.addEventListener('click', () => banner.hidden = true);

    if (prev){
      if (elAn) elAn.checked = !!prev.analytics;
      if (elMk) elMk.checked = !!prev.marketing;
      applyGate(prev); forwardToVendors(prev); banner.hidden = true;
    } else {
      const state = { essential:true, analytics:true, marketing:true, ts:Date.now() };
      saveConsent(state);
      if (elAn) elAn.checked = true;
      if (elMk) elMk.checked = true;
      applyGate(state);
      forwardToVendors(state);
      banner.hidden = true;
    }
  }

  function onReady(fn){ if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  onReady(() => { injectBanner(); const prev = loadConsent(); bootUI(prev); });
})();
