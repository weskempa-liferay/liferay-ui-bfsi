(function () {
  var namespace = fragmentNamespace;
  var wrap = fragmentElement.querySelector('#' + namespace + '-billing');
  var tbody = fragmentElement.querySelector('#' + namespace + '-tbody');
  var summaryText = fragmentElement.querySelector('#' + namespace + '-summary-text');
  var barFill = fragmentElement.querySelector('#' + namespace + '-bar-fill');
  var summaryNote = fragmentElement.querySelector('#' + namespace + '-summary-note');

  var BP_MOCK_BILLING = {"WC-2024-00391":{"onTime":"9 of 10","pct":90,"note":"Strong payment record \u2014 this month\u2019s missed payment is an anomaly","rows":[{"date":"Apr 1, 2025","desc":"Monthly installment due","amount":"$1,200.00","credit":false,"status":"overdue","balance":"$1,200.00"},{"date":"Mar 3, 2025","desc":"Payment received \u2014 ACH","amount":"\u2212$1,200.00","credit":true,"status":"paid","balance":"$0.00"},{"date":"Mar 1, 2025","desc":"Monthly installment due","amount":"$1,200.00","credit":false,"status":"paid","balance":"$1,200.00"},{"date":"Feb 3, 2025","desc":"Payment received \u2014 ACH","amount":"\u2212$1,200.00","credit":true,"status":"paid","balance":"$0.00"},{"date":"Feb 1, 2025","desc":"Monthly installment due","amount":"$1,200.00","credit":false,"status":"paid","balance":"$1,200.00"},{"date":"Jan 2, 2025","desc":"Payment received \u2014 ACH","amount":"\u2212$1,200.00","credit":true,"status":"paid","balance":"$0.00"},{"date":"Jan 1, 2025","desc":"Monthly installment due","amount":"$1,200.00","credit":false,"status":"paid","balance":"$1,200.00"},{"date":"Dec 2, 2024","desc":"Payment received \u2014 ACH","amount":"\u2212$1,200.00","credit":true,"status":"paid","balance":"$0.00"},{"date":"Dec 1, 2024","desc":"Monthly installment due","amount":"$1,200.00","credit":false,"status":"paid","balance":"$1,200.00"},{"date":"Nov 3, 2024","desc":"Payment received \u2014 ACH","amount":"\u2212$1,200.00","credit":true,"status":"paid","balance":"$0.00"},{"date":"Nov 1, 2024","desc":"Monthly installment due","amount":"$1,200.00","credit":false,"status":"paid","balance":"$1,200.00"},{"date":"Oct 2, 2024","desc":"Payment received \u2014 ACH","amount":"\u2212$1,200.00","credit":true,"status":"paid","balance":"$0.00"},{"date":"Oct 1, 2024","desc":"Policy inception \u2014 first installment","amount":"$1,200.00","credit":false,"status":"paid","balance":"$1,200.00"}]},"WC-2024-00841":{"onTime":"7 of 7","pct":100,"note":"Perfect payment record","rows":[{"date":"Apr 1, 2025","desc":"Monthly installment due","amount":"$816.67","credit":false,"status":"pending","balance":"$816.67"},{"date":"Mar 3, 2025","desc":"Payment received \u2014 ACH","amount":"\u2212$816.67","credit":true,"status":"paid","balance":"$0.00"},{"date":"Mar 1, 2025","desc":"Monthly installment due","amount":"$816.67","credit":false,"status":"paid","balance":"$816.67"},{"date":"Feb 2, 2025","desc":"Payment received \u2014 ACH","amount":"\u2212$816.67","credit":true,"status":"paid","balance":"$0.00"},{"date":"Feb 1, 2025","desc":"Monthly installment due","amount":"$816.67","credit":false,"status":"paid","balance":"$816.67"}]},"WC-2023-00991":{"onTime":"6 of 9","pct":67,"note":"Multiple late payments this term \u2014 flag for renewal discussion","rows":[{"date":"Apr 1, 2025","desc":"Monthly installment due","amount":"$940.00","credit":false,"status":"overdue","balance":"$940.00"},{"date":"Mar 1, 2025","desc":"Monthly installment due","amount":"$940.00","credit":false,"status":"overdue","balance":"$940.00"},{"date":"Feb 14, 2025","desc":"Payment received \u2014 check","amount":"\u2212$940.00","credit":true,"status":"paid","balance":"$0.00"},{"date":"Feb 1, 2025","desc":"Monthly installment due","amount":"$940.00","credit":false,"status":"paid","balance":"$940.00"},{"date":"Jan 2, 2025","desc":"Payment received \u2014 check","amount":"\u2212$940.00","credit":true,"status":"paid","balance":"$0.00"}]}};

  function getPolicyId() {
    try { return new URLSearchParams(window.location.search).get('policyId') || 'WC-2024-00391'; } catch(e) { return 'WC-2024-00391'; }
  }

  function render(policyId) {
    var data = BP_MOCK_BILLING[policyId] || BP_MOCK_BILLING['WC-2024-00391'];
    if (summaryText) summaryText.textContent = data.onTime + ' installments paid on time';
    if (barFill) barFill.style.width = data.pct + '%';
    if (summaryNote) summaryNote.textContent = data.note;
    if (!tbody) return;
    tbody.innerHTML = data.rows.map(function (r) {
      var rowClass = r.status === 'overdue' ? ' class="bcb-row--overdue"' : '';
      var amtClass = r.credit ? 'bcb-amount--credit' : (r.status === 'overdue' ? 'bcb-amount--overdue' : '');
      var badge = '<span class="bcb-badge bcb-badge--' + r.status + '">' + (r.status.charAt(0).toUpperCase() + r.status.slice(1)) + '</span>';
      return '<tr' + rowClass + '><td>' + r.date + '</td><td>' + r.desc + '</td><td class="' + amtClass + '">' + r.amount + '</td><td>' + badge + '</td><td>' + r.balance + '</td></tr>';
    }).join('');
  }

  function show() { if (wrap) wrap.className = 'bcb-wrap bcb-wrap--visible'; }
  function hide() { if (wrap) wrap.className = 'bcb-wrap'; }

  Liferay.on('bp:tab-change', function (e) { e && e.tab === 'billing' ? show() : hide(); });
  Liferay.on('bp:client-loaded', function (e) { if (e && e.policy) render(e.policy.id); });

  render(getPolicyId());
  show();
})();