(function () {
  var namespace = fragmentNamespace;
  var navEl = fragmentElement.querySelector('#' + namespace + '-nav');
  if (!navEl) return;

  function setTab(tabId) {
    navEl.querySelectorAll('.phcn-tab').forEach(function (t) {
      t.className = 'phcn-tab' + (t.getAttribute('data-tab') === tabId ? ' phcn-tab--on' : '');
    });
    Liferay.fire('ph:tab-change', { tab: tabId });
  }

  navEl.querySelectorAll('.phcn-tab').forEach(function (t) {
    t.addEventListener('click', function () { setTab(t.getAttribute('data-tab')); });
  });

  Liferay.on('ph:tab-request', function (e) { if (e && e.tab) setTab(e.tab); });

  setTab('open');
})();