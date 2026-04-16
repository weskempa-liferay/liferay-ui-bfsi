(function () {
  var namespace = fragmentNamespace;
  var el = function (id) { return fragmentElement.querySelector('#' + namespace + '-' + id); };

  // ── Shared mock data ──────────────────────────────────────────────────────
  var BP_MOCK_POLICIES = {"WC-2024-00391":{"id":"WC-2024-00391","name":"Acme Construction LLC","industry":"General contracting","employees":14,"payroll":"$680,000","status":"active","balanceStatus":"overdue","balance":"$1,200.00","balanceDue":"Apr 01, 2026","balanceDaysOverdue":15,"annualPremium":"$14,400","installment":"$1,200.00","xmod":"0.88","openClaims":0,"policyExpires":"Feb 10, 2027","onTimePayments":"9 of 10","fein":"74-3821059","effectiveDate":"Feb 10, 2024","expirationDate":"Feb 10, 2027","underwriter":"M. Torres","underwriterEmail":"m.torres@statefund.ca.gov","lastContact":"Mar 20, 2026","state":"California","estimatedPayroll":"$680,000","contactName":"David Chen","contactTitle":"Owner","contactPhone":"(310) 555-0188","contactEmail":"d.chen@acmeconstruction.com","contactPreference":"Phone","classifications":["5403 — Carpentry","5645 — Framing","5506 — Street paving","8742 — Clerical"]},"WC-2024-00841":{"id":"WC-2024-00841","name":"Vega Roofing LLC","industry":"Roofing contractor","employees":8,"payroll":"$320,000","status":"active","balanceStatus":"renewal","balance":"$0.00","balanceDue":"Apr 15, 2025","balanceDaysOverdue":0,"annualPremium":"$9,800","installment":"$816.67","xmod":"0.95","openClaims":0,"policyExpires":"Apr 15, 2025","onTimePayments":"7 of 7","fein":"82-1093847","effectiveDate":"Apr 15, 2024","expirationDate":"Apr 15, 2025","underwriter":"J. Kim","underwriterEmail":"j.kim@statefund.ca.gov","lastContact":"Apr 1, 2025","state":"California","estimatedPayroll":"$320,000","contactName":"Marco Vega","contactTitle":"Owner","contactPhone":"(323) 555-0211","contactEmail":"m.vega@vegaroofing.com","contactPreference":"Email","classifications":["5551 — Roofing","8742 — Clerical"]},"WC-2023-00991":{"id":"WC-2023-00991","name":"Harbor Transit LLC","industry":"Commercial transportation","employees":22,"payroll":"$880,000","status":"active","balanceStatus":"overdue","balance":"$940.00","balanceDue":"Apr 1, 2025","balanceDaysOverdue":9,"annualPremium":"$11,280","installment":"$940.00","xmod":"1.12","openClaims":1,"policyExpires":"Jul 10, 2025","onTimePayments":"6 of 9","fein":"61-2847301","effectiveDate":"Jul 10, 2023","expirationDate":"Jul 10, 2025","underwriter":"M. Torres","underwriterEmail":"m.torres@statefund.ca.gov","lastContact":"Mar 1, 2025","state":"California","estimatedPayroll":"$880,000","contactName":"Rita Souza","contactTitle":"Operations Manager","contactPhone":"(562) 555-0177","contactEmail":"r.souza@harbortransit.com","contactPreference":"Email","classifications":["7380 — Chauffeurs","8742 — Clerical"]}};

  function getPolicyId() {
    try { return new URLSearchParams(window.location.search).get('policyId') || 'WC-2024-00391'; } catch(e) { return 'WC-2024-00391'; }
  }

  function render(p) {
    var nameEl    = el('name');
    var metaEl    = el('meta');
    var policyEl  = el('policy');
    var badgesEl  = el('badges');
    var balEl     = el('balance');
    var balDueEl  = el('bal-due');
    var premEl    = el('premium');
    var xmodEl    = el('xmod');
    var claimsEl  = el('claims');
    var expiresEl = el('expires');
    var ontimeEl  = el('ontime');
    var bcNameEl  = el('bc-name');
    
		fetchClaimsCount();

    if (nameEl)    nameEl.textContent = p.name;
    if (bcNameEl)  bcNameEl.textContent = p.name;
    if (metaEl)    metaEl.textContent = p.industry + ' \u00b7 ' + p.employees + ' employees \u00b7 Est. payroll ' + p.estimatedPayroll;
    if (policyEl)  policyEl.textContent = 'Policy: ' + p.id + ' \u00b7 Underwriter: ' + p.underwriter + ' \u00b7 Last contact: ' + p.lastContact;

    if (badgesEl) {
      var b1 = '<span class="bch-hero__badge bch-hero__badge--active">Coverage active</span>';
      var b2 = '';
      if (p.balanceStatus === 'overdue') {
        b2 = '<span class="bch-hero__badge bch-hero__badge--overdue">Payment overdue</span>';
      } else if (p.balanceStatus === 'renewal') {
        b2 = '<span class="bch-hero__badge bch-hero__badge--renewal">Up for renewal</span>';
      }
      badgesEl.innerHTML = b1 + b2;
    }

    var isZero = p.balance === '$0.00';
    if (balEl) {
      balEl.textContent = p.balance;
      balEl.className = 'bch-hero__bal' + (isZero ? ' bch-hero__bal--zero' : '');
    }
    if (balDueEl) {
      if (p.balanceDaysOverdue > 0) {
        balDueEl.textContent = 'Due ' + p.balanceDue + ' \u00b7 ' + p.balanceDaysOverdue + ' days past due';
        balDueEl.className = 'bch-hero__bal-due';
      } else {
        balDueEl.textContent = 'Next due ' + p.balanceDue;
        balDueEl.className = 'bch-hero__bal-due bch-hero__bal-due--ok';
      }
    }

    if (premEl)    premEl.textContent = p.annualPremium;
    if (xmodEl) {
      xmodEl.textContent = p.xmod;
      var xv = parseFloat(p.xmod);
      xmodEl.className = 'bch-hs__val' + (xv < 1 ? ' bch-hs__val--green' : xv > 1.05 ? ' bch-hs__val--red' : ' bch-hs__val--amber');
    }
    if (claimsEl) {
      claimsEl.textContent = p.openClaims;
      claimsEl.className = 'bch-hs__val' + (p.openClaims === 0 ? ' bch-hs__val--green' : ' bch-hs__val--red');
    }
    if (expiresEl) expiresEl.textContent = p.policyExpires;
    if (ontimeEl)  ontimeEl.textContent = p.onTimePayments;

    // Broadcast so sibling fragments can also load this policy
    Liferay.fire('bp:client-loaded', { policy: p });
  }

  // Listen for cross-fragment navigation (e.g. clicking from command center)
  Liferay.on('bp:policy-selected', function (event) {
    var p = event && event.policy;
    if (!p || !p.id) return;
    var full = BP_MOCK_POLICIES[p.id];
    if (full) render(full);
  });

  function fetchClaimsCount() {
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
	
  var policyId = getPolicyId();
  var policy = BP_MOCK_POLICIES[policyId] || BP_MOCK_POLICIES['WC-2024-00391'];
  render(policy);
})();