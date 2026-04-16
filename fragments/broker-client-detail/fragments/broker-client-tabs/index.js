(function () {
  var namespace = fragmentNamespace;
  var tabsEl = fragmentElement.querySelector('#' + namespace + '-tabs');
  if (!tabsEl) return;

  function setTab(tabId) {
    tabsEl.querySelectorAll('.bct-tab').forEach(function (t) {
      t.className = 'bct-tab' + (t.getAttribute('data-tab') === tabId ? ' bct-tab--on' : '');
    });
    Liferay.fire('bp:tab-change', { tab: tabId });
  }

  tabsEl.querySelectorAll('.bct-tab').forEach(function (t) {
    t.addEventListener('click', function () {
      setTab(t.getAttribute('data-tab'));
    });
  });

  // Allow action buttons in other fragments to request a tab switch
  Liferay.on('bp:tab-request', function (event) {
    if (event && event.tab) setTab(event.tab);
  });

  // Default active tab
  setTab('billing');
})();