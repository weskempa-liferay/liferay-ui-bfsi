(function () {
  var namespace = fragmentNamespace;

  var MOCK_OVERDUE = [
    { name: 'Acme Construction',    policy: 'WC-2024-00391', balance: '$1,200.00', detail: 'Due Apr 1 \u00b7 15 days overdue' },
    { name: 'Harbor Transit LLC',   policy: 'WC-2023-00991', balance: '$940.00',   detail: 'Due Apr 1 \u00b7 9 days overdue'  },
    { name: 'Bright Start Childcare', policy: 'WC-2023-00553', balance: '$520.00', detail: 'Due Apr 5 \u00b7 5 days overdue'  }
  ];

  var list = fragmentElement.querySelector(`#${namespace}-attn-list`);
  var countEl = fragmentElement.querySelector(`#${namespace}-attn-count`);
  var selectedPolicy = null;

  if (countEl) countEl.textContent = MOCK_OVERDUE.length + ' past due';

  function renderList() {
    if (!list) return;
    list.innerHTML = MOCK_OVERDUE.map(function (item) {
      var isSelected = item.policy === selectedPolicy;
      return `<div class="bp-attn__item${isSelected ? ' bp-attn__item--selected' : ''}" data-policy="${item.policy}">
        <div class="bp-attn__item-row">
          <span class="bp-attn__item-name">${item.name}</span>
          <span class="bp-attn__item-bal">${item.balance}</span>
        </div>
        <div class="bp-attn__item-detail">${item.policy} \u00b7 ${item.detail}</div>
      </div>`;
    }).join('');

    list.querySelectorAll('.bp-attn__item').forEach(function (el) {
      el.addEventListener('click', function () {
        var policyId = el.getAttribute('data-policy');
        selectedPolicy = policyId;
        renderList();
        Liferay.fire('bp:attention-select', { policyId: policyId });
      });
    });
  }

  // When policy table clears its selection, deselect here too
  Liferay.on('bp:policy-deselected', function () {
    selectedPolicy = null;
    renderList();
  });

  // When policy table selects a policy (e.g. user clicked table row directly),
  // sync highlight if it's one of our overdue items
  Liferay.on('bp:policy-selected', function (event) {
    var policy = event && event.policy;
    if (!policy) return;
    var match = MOCK_OVERDUE.find(function (item) { return item.policy === policy.policy; });
    selectedPolicy = match ? policy.policy : null;
    renderList();
  });

  renderList();
})();