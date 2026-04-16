(function () {
  var namespace = fragmentNamespace;

  var PH_MOCK = {
    'WC-2024-00391': { name: 'Acme Construction LLC',  expires: 'Jun 15, 2025' },
    'WC-2024-00841': { name: 'Vega Roofing LLC',        expires: 'Apr 15, 2025' },
    'WC-2023-00991': { name: 'Harbor Transit LLC',      expires: 'Jul 10, 2025' }
  };

  function getPolicyId() {
    try { return new URLSearchParams(window.location.search).get('policyId') || 'WC-2024-00391'; } catch(e) { return 'WC-2024-00391'; }
  }

  function el(id) { return fragmentElement.querySelector('#' + namespace + '-' + id); }

  function render(policyId) {
    var p = PH_MOCK[policyId] || PH_MOCK['WC-2024-00391'];

    var nameEl  = el('name');
    var metaEl  = el('meta');
    
    if (nameEl) nameEl.textContent = p.name;
    if (metaEl) metaEl.textContent = 'Policy ' + policyId + ' \u00b7 Coverage active through ' + p.expires;

    fetchCount();
    
    Liferay.fire('ph:claims-context', { policyId: policyId, policy: p });
  }

  function fetchCount() {
    var countEl = el('open-count');
    var subEl   = el('open-sub');

    // Fetch all open claims (not resolved) to count and check status
    fetch('/o/c/claims/?filter=claimStatus%20ne%20%27Resolved%27&pageSize=20', {
      headers: {
        'x-csrf-token': Liferay.authToken || ''
      }
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var count = data.totalCount || 0;
      var hasActionRequired = (data.items || []).some(function(item) {
        return item.claimStatus === 'Documentation needed';
      });

      if (countEl) {
        countEl.textContent = count;
        countEl.className = 'phch-hero__stat-val' + (count === 0 ? ' phch-hero__stat-val--none' : '');
      }
      if (subEl) {
        subEl.textContent = count === 0 ? 'No open claims' : (hasActionRequired ? 'Action required' : 'In review');
        subEl.className = 'phch-hero__stat-sub ' + (count === 0 ? 'phch-hero__stat-sub--clear' : 'phch-hero__stat-sub--action');
      }
    })
    .catch(function(err) {
      console.error('Error fetching count:', err);
      if (countEl) countEl.textContent = '—';
    });
  }

  render(getPolicyId());
})();