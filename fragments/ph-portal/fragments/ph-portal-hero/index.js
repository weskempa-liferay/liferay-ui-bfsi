(function () {
  var namespace = fragmentNamespace;
  function el(id) { return fragmentElement.querySelector('#' + namespace + '-' + id); }

  var PH_MOCK = {
    'WC-2024-00391': { name: 'Acme Construction LLC',  industry: 'General contracting', employees: 14, policy: 'WC-2024-00391', premium: '$14,400', expires: 'Feb 10, 2027', balance: '$1,200.00', balDue: 'Past Due \u2014 April 10, 2026', balanceStatus: 'overdue' },
    'WC-2024-00841': { name: 'Vega Roofing LLC',        industry: 'Roofing contractor',  employees: 8,  policy: 'WC-2024-00841', premium: '$9,800',  expires: 'Apr 15, 2025', balance: '$0.00',     balDue: 'No balance due',              balanceStatus: 'ok'      },
    'WC-2023-00991': { name: 'Harbor Transit LLC',      industry: 'Transportation',       employees: 22, policy: 'WC-2023-00991', premium: '$11,280', expires: 'Jul 10, 2025', balance: '$940.00',   balDue: 'Due April 1, 2025',           balanceStatus: 'overdue' }
  };

  function getPolicyId() {
    try { return new URLSearchParams(window.location.search).get('policyId') || 'WC-2024-00391'; } catch(e) { return 'WC-2024-00391'; }
  }

  function render(p) {
    if (el('name'))    el('name').textContent    = p.name;
    if (el('meta'))    el('meta').textContent    = p.industry + ' \u00b7 ' + p.employees + ' employees';
    if (el('policy'))  el('policy').textContent  = 'Policy: ' + p.policy;
    if (el('premium')) el('premium').textContent = p.premium;
    if (el('expires')) el('expires').textContent = p.expires;

    fetchCount();

    var balEl    = el('balance');
    var balDueEl = el('bal-due');
    var blockEl  = el('balance-block');
    if (balEl)    balEl.textContent    = p.balance;
    if (balDueEl) balDueEl.textContent = p.balDue;
    if (blockEl)  blockEl.className    = 'php-hero__balance-block' + (p.balanceStatus === 'ok' ? ' php-hero__balance-block--ok' : '');

    var badgeEl = el('status-badge');
    if (badgeEl) {
      if (p.balanceStatus === 'overdue') {
        badgeEl.classList.add('py-1');
				badgeEl.innerHTML = '<span class="php-hero__badge php-hero__badge--active">Coverage active</span>&nbsp;<span class="php-hero__badge php-hero__badge--overdue">Payment overdue</span>';
      } else {
        badgeEl.innerHTML = '<span class="php-hero__badge php-hero__badge--active">Coverage active</span>';
      }
    }

    Liferay.fire('php:policy-loaded', { policy: p });
  }

  function fetchCount() {
    var claimsEl = el('claims');
    if (!claimsEl) return;

    fetch('/o/c/claims/?filter=claimStatus%20ne%20%27Resolved%27&pageSize=1', {
      headers: {
        'x-csrf-token': Liferay.authToken || ''
      }
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var count = data.totalCount || 0;
      claimsEl.textContent = count;
      claimsEl.className = 'php-hero__stat-val' + (count === 0 ? ' php-hero__stat-val--green' : ' php-hero__stat-val--red');
    })
    .catch(function(err) {
      console.error('Error fetching claims count:', err);
      claimsEl.textContent = '—';
    });
  }

  var pid = getPolicyId();
  render(PH_MOCK[pid] || PH_MOCK['WC-2024-00391']);
})();