(function () {
  var namespace = fragmentNamespace;

  var MOCK_RENEWALS = [
    { name: 'Vega Roofing LLC',   policy: 'WC-2024-00841', date: 'Apr 15', urgency: 'urgent' },
    { name: 'Coastline Plumbing', policy: 'WC-2024-01122', date: 'Apr 19', urgency: 'urgent' },
    { name: 'Summit Concrete',    policy: 'WC-2024-00215', date: 'Apr 22', urgency: 'urgent' },
    { name: 'Mesa Landscaping',   policy: 'WC-2024-01388', date: 'May 3',  urgency: 'soon'   },
    { name: 'Torrance Electric',  policy: 'WC-2024-01501', date: 'May 9',  urgency: 'soon'   }
  ];

  var list = fragmentElement.querySelector(`#${namespace}-renewals-list`);
  var selectedPolicy = null;

  function renderList() {
    if (!list) return;
    list.innerHTML = MOCK_RENEWALS.map(function (item) {
      var isSelected = item.policy === selectedPolicy;
      var dateClass = 'bp-renewals__item-date--' + item.urgency;
      return `<div class="bp-renewals__item${isSelected ? ' bp-renewals__item--selected' : ''}" data-policy="${item.policy}">
        <span class="bp-renewals__item-name">${item.name}</span>
        <span class="${dateClass}">${item.date}</span>
      </div>`;
    }).join('');

    list.querySelectorAll('.bp-renewals__item').forEach(function (el) {
      el.addEventListener('click', function () {
        var policyId = el.getAttribute('data-policy');
        selectedPolicy = policyId;
        renderList();
        Liferay.fire('bp:attention-select', { policyId: policyId });
      });
    });
  }

  Liferay.on('bp:policy-selected', function (event) {
    var policy = event && event.policy;
    if (!policy) return;
    var match = MOCK_RENEWALS.find(function (item) { return item.policy === policy.policy; });
    selectedPolicy = match ? policy.policy : null;
    renderList();
  });

  Liferay.on('bp:policy-deselected', function () {
    selectedPolicy = null;
    renderList();
  });

  renderList();
})();