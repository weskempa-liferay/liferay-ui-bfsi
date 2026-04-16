(function () {
  var namespace = fragmentNamespace;

  var MOCK_STATS = {
    activePolicies: 247,
    clientCount: 198,
    premiumUnderMgmt: '$3.06M',
    renewals30Days: 23,
    attentionRequired: 3
  };

  function render(stats) {
    var polEl = fragmentElement.querySelector(`#${namespace}-stat-policies`);
    var preEl = fragmentElement.querySelector(`#${namespace}-stat-premium`);
    var renEl = fragmentElement.querySelector(`#${namespace}-stat-renewals`);
    var attEl = fragmentElement.querySelector(`#${namespace}-stat-attention`);

    if (polEl) polEl.textContent = stats.activePolicies;
    if (preEl) preEl.textContent = stats.premiumUnderMgmt;
    if (renEl) renEl.textContent = stats.renewals30Days;
    if (attEl) attEl.textContent = stats.attentionRequired;
  }

  render(MOCK_STATS);

  Liferay.fire('bp:stats-loaded', { stats: MOCK_STATS });
})();