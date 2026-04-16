(function () {
  var namespace = fragmentNamespace;
  var wrap = fragmentElement.querySelector('#' + namespace + '-report');

  function el(id) { return fragmentElement.querySelector('#' + namespace + '-' + id); }

  var PH_MOCK_BROKERS = {
    'WC-2024-00391': { name: 'Sarah Rodriguez', initials: 'SL', phone: '(310) 555-0199', email: 's.rodriguez@seniorinsure.com' },
    'WC-2024-00841': { name: 'Sarah Rodriguez', initials: 'SL', phone: '(310) 555-0199', email: 's.rodriguez@seniorinsure.com' },
    'WC-2023-00991': { name: 'Sarah Rodriguez', initials: 'SL', phone: '(310) 555-0199', email: 's.rodriguez@seniorinsure.com' }
  };

  function getPolicyId() {
    try { return new URLSearchParams(window.location.search).get('policyId') || 'WC-2024-00391'; } catch(e) { return 'WC-2024-00391'; }
  }

  function renderBroker(policyId) {
    var b = PH_MOCK_BROKERS[policyId] || PH_MOCK_BROKERS['WC-2024-00391'];
    var avatarEl = el('broker-avatar');
    var nameEl   = el('broker-name');
    var phoneEl  = el('broker-phone');
    var emailEl  = el('broker-email');
    if (avatarEl) avatarEl.textContent = b.initials;
    if (nameEl)   nameEl.textContent   = b.name;
    if (phoneEl)  phoneEl.textContent  = b.phone;
    if (emailEl)  emailEl.textContent  = b.email;
  }

  var submitBtn = el('submit');
  var successEl = el('success');

  if (submitBtn) {
    submitBtn.addEventListener('click', function () {
      var nameVal   = el('f-name')   ? el('f-name').value.trim()   : '';
      var dateVal   = el('f-date')   ? el('f-date').value           : '';
      var injuryVal = el('f-injury') ? el('f-injury').value.trim() : '';
      var descVal   = el('f-desc')   ? el('f-desc').value.trim()   : '';

      if (!nameVal || !dateVal || !injuryVal || !descVal) {
        submitBtn.style.outline = '2px solid #E24B4A';
        setTimeout(function () { submitBtn.style.outline = ''; }, 2000);
        return;
      }

      if (successEl) successEl.className = 'phcr-success phcr-success--visible';

      Liferay.fire('ph:claim-reported', {
        policyId: getPolicyId(),
        injuredWorker: nameVal,
        dateOfInjury: dateVal,
        injuryType: injuryVal,
        description: descVal
      });
    });
  }

  function show() { if (wrap) wrap.className = 'phcr-wrap phcr-wrap--visible'; }
  function hide() { if (wrap) wrap.className = 'phcr-wrap'; }

  Liferay.on('ph:tab-change',     function (e) { e && e.tab === 'report' ? show() : hide(); });
  Liferay.on('ph:claims-context', function (e) { if (e && e.policyId) renderBroker(e.policyId); });

  renderBroker(getPolicyId());
  hide();
})();