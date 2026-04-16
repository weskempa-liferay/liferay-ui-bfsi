(function () {
  var namespace = fragmentNamespace;
  var wrap        = fragmentElement.querySelector('#' + namespace + '-notes');
  var listEl      = fragmentElement.querySelector('#' + namespace + '-activity-list');
  var noteInput   = fragmentElement.querySelector('#' + namespace + '-note-input');
  var noteSubmit  = fragmentElement.querySelector('#' + namespace + '-note-submit');
  var noteSaved   = fragmentElement.querySelector('#' + namespace + '-note-saved');

  var BP_MOCK_NOTES = {
    'WC-2024-00391': [
      { title: 'Renewal discussion \u2014 phone call', date: 'Mar 20, 2026', body: 'Spoke with David C. re: upcoming June renewal. Client confirmed intent to renew. Discussed X-Mod improvement. Follow up in May.', author: 'S. Rodriguez' },
      { title: 'COI requested and sent',               date: 'Feb 28, 2026', body: 'Client requested updated COI for new job site \u2014 Torrance city contract. Sent via portal documents.', author: 'S. Rodriguez' },
      { title: 'Policy inception',                     date: 'Feb 10, 2024', body: 'New policy bound. Annual premium $14,400, 12 monthly installments of $1,200. ACH payment enrolled.', author: 'System' }
    ],
    'WC-2024-00841': [
      { title: 'Renewal quote sent',     date: 'Apr 1, 2025',  body: 'Sent renewal quote for 2025\u20132026 term. Premium estimate $10,100 based on updated payroll audit. Awaiting client response.', author: 'S. Larson' },
      { title: 'Policy inception',       date: 'Apr 15, 2024', body: 'New policy bound. Annual premium $9,800. Monthly ACH enrolled.', author: 'System' }
    ],
    'WC-2023-00991': [
      { title: 'Open claim \u2014 driver injury', date: 'Feb 10, 2025', body: 'Driver reported back injury on Feb 8. Claim filed. Adjuster assigned. Monitor closely given X-Mod impact at renewal.', author: 'S. Larson' },
      { title: 'Late payment \u2014 follow up',   date: 'Feb 1, 2025',  body: 'Jan and Feb installments paid late again. Third late payment this term. Recommend payment plan discussion at renewal.', author: 'S. Larson' },
      { title: 'Policy renewal bound',            date: 'Jul 10, 2023', body: 'Policy renewed for second term. Premium adjusted to $11,280 reflecting updated payroll and X-Mod.', author: 'System' }
    ]
  };

  var currentPolicyId = null;

  function getPolicyId() {
    try { return new URLSearchParams(window.location.search).get('policyId') || 'WC-2024-00391'; } catch(e) { return 'WC-2024-00391'; }
  }

  function renderList(policyId) {
    currentPolicyId = policyId;
    var notes = BP_MOCK_NOTES[policyId] || BP_MOCK_NOTES['WC-2024-00391'];
    if (!listEl) return;
    listEl.innerHTML = notes.map(function (n) {
      return '<div class="bcn-note-item">' +
        '<div class="bcn-note-item__header">' +
          '<span class="bcn-note-item__title">' + n.title + '</span>' +
          '<span class="bcn-note-item__date">' + n.date + '</span>' +
        '</div>' +
        '<div class="bcn-note-item__body">' + n.body + '</div>' +
        '<div class="bcn-note-item__author">Logged by ' + n.author + '</div>' +
      '</div>';
    }).join('');
  }

  if (noteSubmit) {
    noteSubmit.addEventListener('click', function () {
      if (!noteInput || !noteInput.value.trim()) return;
      var newNote = {
        title: 'Broker note',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        body: noteInput.value.trim(),
        author: 'S. Larson'
      };
      var pid = currentPolicyId || getPolicyId();
      if (!BP_MOCK_NOTES[pid]) BP_MOCK_NOTES[pid] = [];
      BP_MOCK_NOTES[pid].unshift(newNote);
      noteInput.value = '';
      renderList(pid);
      if (noteSaved) {
        noteSaved.className = 'bcn-saved bcn-saved--visible';
        setTimeout(function () { noteSaved.className = 'bcn-saved'; }, 3000);
      }
      Liferay.fire('bp:note-added', { policyId: pid, note: newNote });
    });
  }

  function show() { if (wrap) wrap.className = 'bcn-wrap bcn-wrap--visible'; }
  function hide() { if (wrap) wrap.className = 'bcn-wrap'; }

  Liferay.on('bp:tab-change',    function (e) { e && e.tab === 'notes' ? show() : hide(); });
  Liferay.on('bp:client-loaded', function (e) { if (e && e.policy) renderList(e.policy.id); });

  renderList(getPolicyId());
  hide();
})();