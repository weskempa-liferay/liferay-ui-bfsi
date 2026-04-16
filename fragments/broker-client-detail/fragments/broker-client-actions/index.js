(function () {
  var namespace = fragmentNamespace;
  var el = function (id) { return fragmentElement.querySelector('#' + namespace + '-' + id); };

  var BP_MOCK_CONTACTS = {
    'WC-2024-00391': { contactName: 'David McAuley',  contactTitle: 'Owner',              contactPhone: '(310) 555-0188', contactEmail: 'dave@acmeconstruction.com', contactPreference: 'Phone', underwriter: 'M. Torres', underwriterEmail: 'm.torres@statefund.ca.gov' },
    'WC-2024-00841': { contactName: 'Marco Vega',  contactTitle: 'Owner',              contactPhone: '(323) 555-0211', contactEmail: 'm.vega@vegaroofing.com',      contactPreference: 'Email', underwriter: 'J. Kim',    underwriterEmail: 'j.kim@statefund.ca.gov'    },
    'WC-2023-00991': { contactName: 'Rita Souza',  contactTitle: 'Operations Manager', contactPhone: '(562) 555-0177', contactEmail: 'r.souza@harbortransit.com',   contactPreference: 'Email', underwriter: 'M. Torres', underwriterEmail: 'm.torres@statefund.ca.gov' }
  };

  var currentContact = null;

  function initials(name) {
    return name.split(' ').map(function (p) { return p.charAt(0).toUpperCase(); }).slice(0, 2).join('');
  }

  function getPolicyId() {
    try { return new URLSearchParams(window.location.search).get('policyId') || 'WC-2024-00391'; } catch(e) { return 'WC-2024-00391'; }
  }

  function render(policyId) {
    var c = BP_MOCK_CONTACTS[policyId] || BP_MOCK_CONTACTS['WC-2024-00391'];
    currentContact = c;

    var avatarEl = el('contact-avatar');
    if (avatarEl) avatarEl.textContent = initials(c.contactName);

    var nameEl = el('contact-name');
    if (nameEl) nameEl.textContent = c.contactName;

    var roleEl = el('contact-role');
    if (roleEl) roleEl.textContent = c.contactTitle;

    var phoneEl = el('contact-phone');
    if (phoneEl) phoneEl.textContent = c.contactPhone;

    var emailEl = el('contact-email');
    if (emailEl) emailEl.textContent = c.contactEmail;

    var prefEl = el('contact-pref');
    if (prefEl) prefEl.textContent = 'Preferred contact: ' + c.contactPreference;

    var uwAvatarEl = el('uw-avatar');
    if (uwAvatarEl) uwAvatarEl.textContent = initials(c.underwriter);

    var uwNameEl = el('uw-name');
    if (uwNameEl) uwNameEl.textContent = c.underwriter;

    var uwEmailEl = el('uw-email');
    if (uwEmailEl) uwEmailEl.textContent = c.underwriterEmail;
  }

  // ── Action buttons ─────────────────────────────────────────────────────────

  var reminderBtn = el('btn-reminder');
  var reminderConfirm = el('reminder-confirm');
  var reminderName = el('reminder-name');

  if (reminderBtn) {
    reminderBtn.addEventListener('click', function () {
      var name = currentContact ? currentContact.contactName : 'client';
      if (reminderName) reminderName.textContent = name;
      if (reminderConfirm) {
        reminderConfirm.className = 'bca-confirm bca-confirm--visible';
        setTimeout(function () { reminderConfirm.className = 'bca-confirm'; }, 4000);
      }
      Liferay.fire('bp:reminder-sent', { contactName: name });
    });
  }

  var coiBtn = el('btn-coi');
  if (coiBtn) {
    coiBtn.addEventListener('click', function () {
      Liferay.fire('bp:tab-request', { tab: 'policy' });
    });
  }

  var quoteBtn = el('btn-quote');
  if (quoteBtn) {
    quoteBtn.addEventListener('click', function () {
      Liferay.fire('bp:quote-requested', { policyId: getPolicyId() });
    });
  }

  var noteBtn = el('btn-note');
  if (noteBtn) {
    noteBtn.addEventListener('click', function () {
      Liferay.fire('bp:tab-request', { tab: 'notes' });
    });
  }

  // ── Listen for policy changes ───────────────────────────────────────────────
  Liferay.on('bp:client-loaded', function (e) {
    if (e && e.policy) render(e.policy.id);
  });

  render(getPolicyId());
})();