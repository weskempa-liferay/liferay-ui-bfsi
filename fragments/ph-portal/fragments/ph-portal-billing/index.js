(function () {
  var namespace = fragmentNamespace;
  var wrap = fragmentElement.querySelector('#' + namespace + '-billing');
  function el(id) { return fragmentElement.querySelector('#' + namespace + '-' + id); }

  var PH_MOCK_BILLING = {
    'WC-2024-00391': {
      balance: '$1,200.00', balDue: 'Due April 10, 2025', balStatus: 'overdue',
      schedule: [ ['Frequency','Monthly'], ['Installment','$1,200.00'], ['Installments paid','3 of 12'], ['Total paid','$3,600.00'], ['Remaining','$10,800.00'] ],
      pct: 60, progressLabel: '60% of annual premium paid',
      payNote: '$1,200.00 is currently due. Click below to go to the secure payment portal.',
      transactions: [
        { date:'Apr 1, 2025',  desc:'Monthly installment due',  amount:'$1,200.00',  credit:false, status:'overdue', balance:'$1,200.00' },
        { date:'Mar 3, 2025',  desc:'Payment received \u2014 ACH', amount:'\u2212$1,200.00', credit:true,  status:'paid',    balance:'$0.00'     },
        { date:'Mar 1, 2025',  desc:'Monthly installment due',  amount:'$1,200.00',  credit:false, status:'paid',    balance:'$1,200.00' },
        { date:'Feb 3, 2025',  desc:'Payment received \u2014 ACH', amount:'\u2212$1,200.00', credit:true,  status:'paid',    balance:'$0.00'     },
        { date:'Feb 1, 2025',  desc:'Monthly installment due',  amount:'$1,200.00',  credit:false, status:'paid',    balance:'$1,200.00' },
        { date:'Jan 2, 2025',  desc:'Payment received \u2014 ACH', amount:'\u2212$1,200.00', credit:true,  status:'paid',    balance:'$0.00'     },
        { date:'Jan 1, 2025',  desc:'Monthly installment due',  amount:'$1,200.00',  credit:false, status:'paid',    balance:'$1,200.00' }
      ]
    },
    'WC-2024-00841': {
      balance: '$0.00', balDue: 'Next payment due Apr 10', balStatus: 'ok',
      schedule: [ ['Frequency','Monthly'], ['Installment','$816.67'], ['Installments paid','3 of 12'], ['Total paid','$3,600.00'], ['Remaining','$10,800.00'] ],
      pct: 58, progressLabel: '58% of annual premium paid',
      payNote: 'No balance currently due. Your next payment is $816.67 on April 15.',
      transactions: [
        { date:'Apr 1, 2025',  desc:'Monthly installment due',     amount:'$816.67',  credit:false, status:'pending', balance:'$816.67' },
        { date:'Mar 3, 2025',  desc:'Payment received \u2014 ACH',  amount:'\u2212$816.67', credit:true,  status:'paid',    balance:'$0.00'   },
        { date:'Mar 1, 2025',  desc:'Monthly installment due',     amount:'$816.67',  credit:false, status:'paid',    balance:'$816.67' }
      ]
    },
    'WC-2023-00991': {
      balance: '$940.00', balDue: 'Due April 1, 2025 \u2014 9 days overdue', balStatus: 'overdue',
      schedule: [ ['Frequency','Monthly'], ['Installment','$940.00'], ['Installments paid','6 of 18'], ['Total paid','$5,640.00'], ['Remaining','$11,400.00'] ],
      pct: 33, progressLabel: '33% of annual premium paid',
      payNote: '$940.00 is overdue. Click to pay now and avoid a coverage lapse.',
      transactions: [
        { date:'Apr 1, 2025',  desc:'Monthly installment due',     amount:'$940.00',  credit:false, status:'overdue', balance:'$940.00' },
        { date:'Mar 1, 2025',  desc:'Monthly installment due',     amount:'$940.00',  credit:false, status:'overdue', balance:'$940.00' },
        { date:'Feb 14, 2025', desc:'Payment received \u2014 check', amount:'\u2212$940.00', credit:true,  status:'paid',    balance:'$0.00'   },
        { date:'Feb 1, 2025',  desc:'Monthly installment due',     amount:'$940.00',  credit:false, status:'paid',    balance:'$940.00' }
      ]
    }
  };

  function getPolicyId() {
    try { return new URLSearchParams(window.location.search).get('policyId') || 'WC-2024-00391'; } catch(e) { return 'WC-2024-00391'; }
  }

  function render(policyId) {
    var d = PH_MOCK_BILLING[policyId] || PH_MOCK_BILLING['WC-2024-00391'];
    var callout = el('balance-callout');
    if (callout) callout.className = 'phpb-balance-callout' + (d.balStatus === 'ok' ? ' phpb-balance-callout--ok' : '');
    if (el('balance-amount')) el('balance-amount').textContent = d.balance;
    if (el('balance-due'))    el('balance-due').textContent    = d.balDue;

    var schedEl = el('schedule-rows');
    if (schedEl) {
      schedEl.innerHTML = d.schedule.map(function (r, i) {
        var last = i === d.schedule.length - 1 ? ' phpb-sched-row--last' : '';
        return '<div class="phpb-sched-row' + last + '"><span class="phpb-sched-label">' + r[0] + '</span><span style="font-weight:500">' + r[1] + '</span></div>';
      }).join('');
    }

    var fill = el('progress-fill');
    if (fill) fill.style.width = d.pct + '%';
    if (el('progress-label')) el('progress-label').textContent = d.progressLabel;
    if (el('pay-note'))       el('pay-note').textContent       = d.payNote;

    var tbody = el('tx-tbody');
    if (tbody) {
      tbody.innerHTML = d.transactions.map(function (tx) {
        var amtClass = tx.credit ? 'phpb-tx-credit' : (tx.status === 'overdue' ? 'phpb-tx-overdue' : 'phpb-tx-debit');
        var badge    = '<span class="phpb-badge phpb-badge--' + tx.status + '">' + tx.status.charAt(0).toUpperCase() + tx.status.slice(1) + '</span>';
        return '<tr><td>' + tx.date + '</td><td>' + tx.desc + '</td><td class="' + amtClass + '">' + tx.amount + '</td><td>' + tx.balance + '</td></tr>';
      }).join('');
    }
  }

  var payBtn = el('pay-btn');
  var payConfirm = el('pay-confirm');
  if (payBtn) {
    payBtn.addEventListener('click', function () {
      if (payConfirm) {
        payConfirm.className = 'phpb-pay-confirm phpb-pay-confirm--visible';
        setTimeout(function () { payConfirm.className = 'phpb-pay-confirm'; }, 5000);
      }
      Liferay.fire('php:payment-initiated', { policyId: getPolicyId() });
    });
  }

  function show() { if (wrap) wrap.className = 'phpb-wrap phpb-wrap--visible'; }
  function hide() { if (wrap) wrap.className = 'phpb-wrap'; }

  Liferay.on('php:tab-change',    function (e) { e && e.tab === 'billing' ? show() : hide(); });
  Liferay.on('php:policy-loaded', function (e) { if (e && e.policy) render(e.policy.policy || getPolicyId()); });

  render(getPolicyId());
  hide();
})();