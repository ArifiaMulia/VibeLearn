/* Loaded synchronously in <head>, BEFORE the gateway-injected SSO widget (which is deferred).
 * 1. Suppresses the redundant bottom/top account chooser widget after explicit sign-out.
 * 2. Synchronously clears stale host-only logout cookies and bootstraps `virtuenet_sso_jwt` from
 *    `?sso_token=` / `?token=` BEFORE React or any sub-request (/api/config, /assets/pwa-sw.js) runs.
 * 3. Purges legacy Service Worker caches (e.g., promptara-shell-v3.6.x) that served stale bundles. */
window.__VN_SSO_WIDGET_LOADED__ = true;

(function () {
  try {
    var path = (window.location.pathname || '/').toLowerCase();
    var params = new URLSearchParams(window.location.search || '');
    var ssoToken = params.get('sso_token') || params.get('token');
    var isHttps = window.location.protocol === 'https:';
    var secAttr = isHttps ? '; Secure' : '';
    var expired = 'Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/;';

    if (path !== '/logout' && path !== '/auth/logout' && params.get('logged_out') !== '1') {
      var poisonNames = ['virtuenet_sso_logged_out', 'vl_logged_out'];
      for (var i = 0; i < poisonNames.length; i++) {
        var cname = poisonNames[i];
        document.cookie = cname + '=; ' + expired;
        document.cookie = cname + '=; ' + expired + ' SameSite=Lax' + secAttr + ';';
        document.cookie = cname + '=; ' + expired + ' Domain=.virtuenet.space;';
        document.cookie = cname + '=; ' + expired + ' Domain=.virtuenet.space; SameSite=Lax' + secAttr + ';';
      }
    }

    if (ssoToken) {
      var encoded = encodeURIComponent(ssoToken);
      document.cookie = 'virtuenet_sso_jwt=' + encoded + '; Path=/; Max-Age=2592000; SameSite=Lax' + secAttr;
      document.cookie = 'virtuenet_sso_jwt=' + encoded + '; Domain=.virtuenet.space; Path=/; Max-Age=2592000; SameSite=Lax' + secAttr;
      try {
        window.localStorage.removeItem('vl_explicit_logout');
        window.localStorage.setItem('vl_last_active', String(Date.now()));
      } catch (e) {}
    }

    if (typeof window.caches !== 'undefined' && typeof window.caches.keys === 'function') {
      window.caches.keys().then(function (keys) {
        keys.forEach(function (k) {
          if (k !== 'promptara-shell-v3.7.2' && k.indexOf('promptara') === 0) {
            window.caches.delete(k).catch(function () {});
          }
        });
      }).catch(function () {});
    }

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && typeof navigator.serviceWorker.getRegistrations === 'function') {
      navigator.serviceWorker.getRegistrations().then(function (regs) {
        regs.forEach(function (reg) {
          if (reg && typeof reg.update === 'function') {
            reg.update().catch(function () {});
          }
        });
      }).catch(function () {});
    }
  } catch (err) {}
})();
