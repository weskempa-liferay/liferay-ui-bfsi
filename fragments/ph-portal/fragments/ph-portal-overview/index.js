(function () {
  var namespace = fragmentNamespace;
  var wrap = fragmentElement.querySelector('#' + namespace + '-overview');
  function el(id) { return fragmentElement.querySelector('#' + namespace + '-' + id); }

  var PH_MOCK = {
    'WC-2024-00391': { policyHolder: 'Acme Construction LLC', fein: '74-3821059', effectiveDate: 'Feb 10, 2024', expirationDate: 'Feb 10, 2027', state: 'California', broker: 'Sarah Rodriguez \u2014 Senior Insurance LLC', xmod: '0.88', nextPayment: 'Apr 10', nextAmount: '$1,200.00' },
    'WC-2024-00841': { policyHolder: 'Vega Roofing LLC',        fein: '82-1093847', effectiveDate: 'Apr 15, 2024', expirationDate: 'Apr 15, 2025', state: 'California', broker: 'Sarah Rodriguez \u2014 Senior Insurance LLC', xmod: '0.95', nextPayment: 'Apr 15', nextAmount: '$816.67' },
    'WC-2023-00991': { policyHolder: 'Harbor Transit LLC',      fein: '61-2847301', effectiveDate: 'Jul 10, 2023', expirationDate: 'Jul 10, 2025', state: 'California', broker: 'Sarah Rodriguez \u2014 Senior Insurance LLC', xmod: '1.12', nextPayment: 'Apr 1',  nextAmount: '$940.00'  }
  };

  function getPolicyId() {
    try { return new URLSearchParams(window.location.search).get('policyId') || 'WC-2024-00391'; } catch(e) { return 'WC-2024-00391'; }
  }

  function render(policyId) {
    var p = PH_MOCK[policyId] || PH_MOCK['WC-2024-00391'];
    var rowsEl = el('policy-rows');
    if (rowsEl) {
      var rows = [
        ['Policyholder',    p.policyHolder],
        ['FEIN',            '<span style="font-family:monospace;font-size:12px">' + p.fein + '</span>'],
        ['Policy number',   '<span style="font-family:monospace;font-size:12px">' + policyId + '</span>'],
        ['Effective date',  p.effectiveDate],
        ['Expiration date', '<span style="color:#854F0B;font-weight:500">' + p.expirationDate + '</span>'],
        ['State',           p.state],
        ['Assigned broker', p.broker],
        ['Experience mod (X-Mod)', p.xmod]
      ];
      rowsEl.innerHTML = rows.map(function (r, i) {
        var last = i === rows.length - 1 ? ' phpo-info-row--last' : '';
        return '<div class="phpo-info-row' + last + '"><span class="phpo-il">' + r[0] + '</span><span>' + r[1] + '</span></div>';
      }).join('');
    }
    if (el('next-payment')) el('next-payment').textContent = p.nextPayment;
    if (el('next-amount'))  el('next-amount').textContent  = p.nextAmount;
  }

  function show() { if (wrap) wrap.className = 'phpo-wrap phpo-wrap--visible'; }
  function hide() { if (wrap) wrap.className = 'phpo-wrap'; }

  [el('btn-pay'), el('sidebar-pay')].forEach(function (btn) {
    if (btn) btn.addEventListener('click', function () { Liferay.fire('php:tab-request', { tab: 'billing' }); });
  });
  var coiBtn = el('btn-coi');
  if (coiBtn) coiBtn.addEventListener('click', function () { Liferay.fire('php:tab-request', { tab: 'documents' }); });
  var covBtn = el('btn-coverage');
  if (covBtn) covBtn.addEventListener('click', function () { Liferay.fire('php:tab-request', { tab: 'coverage' }); });
  var claimsBtn = el('btn-claims');
  if (claimsBtn) claimsBtn.addEventListener('click', function () { window.location.href = '/web/policyholder/claims'; });

  Liferay.on('php:tab-change',    function (e) { e && e.tab === 'overview' ? show() : hide(); });
  Liferay.on('php:policy-loaded', function (e) { if (e && e.policy) render(e.policy.policy || getPolicyId()); });

  render(getPolicyId());
  show();
})();