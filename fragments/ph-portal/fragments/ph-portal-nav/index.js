(function () {
  var namespace = fragmentNamespace;
  var wrap = fragmentElement.querySelector('#' + namespace + '-nav');
  if (!wrap) return;

  function setTab(tabId) {
    wrap.querySelectorAll('.phpn-tab').forEach(function (t) {
      t.className = 'phpn-tab' + (t.getAttribute('data-tab') === tabId ? ' phpn-tab--on' : '');
    });
    Liferay.fire('php:tab-change', { tab: tabId });
  }

  wrap.querySelectorAll('.phpn-tab').forEach(function (t) {
    t.addEventListener('click', function () { setTab(t.getAttribute('data-tab')); });
  });

  Liferay.on('php:tab-request', function (e) { if (e && e.tab) setTab(e.tab); });

  setTab('overview');
})();