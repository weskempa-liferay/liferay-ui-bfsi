(function () {
  var namespace = fragmentNamespace;

  var MOCK_POLICIES = [
    { name: 'Acme Construction',    policy: 'WC-2024-00391', status: 'overdue',  balance: '$1,200.00', renewal: 'Feb 10, 2026', lastpay: 'Mar 3, 2026', due: 'Apr 1, 2026', premium: '$14,400/yr' },
    { name: 'Vega Roofing LLC',     policy: 'WC-2024-00841', status: 'renewal',  balance: '$0.00',     renewal: 'Apr 15, 2026', lastpay: 'Apr 1, 2026',  due: 'Apr 15, 2026', premium: '$9,800/yr'  },
    { name: 'Coastline Plumbing',   policy: 'WC-2024-01122', status: 'renewal',  balance: '$0.00',     renewal: 'Apr 19, 2026', lastpay: 'Apr 2, 2026',  due: 'Apr 19, 2026', premium: '$7,200/yr'  },
    { name: 'Rivera Construction',  policy: 'WC-2024-00614', status: 'active',   balance: '$685.00',   renewal: 'Sep 1, 2026',  lastpay: 'Mar 3, 2026',  due: 'Apr 15, 2026', premium: '$8,220/yr'  },
    { name: 'Harbor Transit LLC',   policy: 'WC-2023-00991', status: 'overdue',  balance: '$940.00',   renewal: 'Jul 10, 2026', lastpay: 'Mar 1, 2026',  due: 'Apr 1, 2026',  premium: '$11,280/yr' },
    { name: 'Pacific Frame Co.',    policy: 'WC-2024-00709', status: 'active',   balance: '$0.00',     renewal: 'Apr 28, 2026', lastpay: 'Apr 1, 2026',  due: 'May 1, 2026',  premium: '$6,600/yr'  },
    { name: 'Bright Start Childcare', policy: 'WC-2023-00553', status: 'overdue', balance: '$520.00', renewal: 'Jun 1, 2026',  lastpay: 'Mar 5, 2026',  due: 'Apr 5, 2026',  premium: '$6,240/yr'  },
    { name: 'Mesa Landscaping',     policy: 'WC-2024-01388', status: 'active',   balance: '$0.00',     renewal: 'May 3, 2026',  lastpay: 'Apr 1, 2026',  due: 'May 1, 2026',  premium: '$5,400/yr'  },
    { name: 'Summit Concrete',      policy: 'WC-2024-00215', status: 'renewal',  balance: '$0.00',     renewal: 'Apr 22, 2026', lastpay: 'Apr 1, 2026',  due: 'Apr 22, 2026', premium: '$12,000/yr' },
    { name: 'Torrance Electric',    policy: 'WC-2024-01501', status: 'active',   balance: '$0.00',     renewal: 'May 9, 2026',  lastpay: 'Apr 1, 2026',  due: 'May 9, 2026',  premium: '$8,760/yr'  }
  ];

  var STATUS_LABEL = { active: 'Active', renewal: 'Up for renewal', overdue: 'Past due' };
  var currentFilter = 'all';
  var selectedPolicy = null;

  var tbody = fragmentElement.querySelector(`#${namespace}-tbody`);
  var detailPanel = fragmentElement.querySelector(`#${namespace}-detail`);
  var closeBtn = fragmentElement.querySelector(`#${namespace}-dp-close`);

  function getBadgeClass(status) {
    return 'bp-table__badge bp-table__badge--' + status;
  }

  function renderTable(data) {
    if (!tbody) return;
    tbody.innerHTML = data.map(function (p, i) {
      var isOverdue = p.status === 'overdue';
      var rowClass = 'bp-table__row--' + p.status + (p.policy === selectedPolicy ? ' bp-table__row--selected' : '');
      return `<tr class="${rowClass}" data-policy="${p.policy}">
        <td style="font-weight:500">${p.name}</td>
        <td class="bp-table__mono">${p.policy}</td>
        <td><span class="${getBadgeClass(p.status)}">${STATUS_LABEL[p.status]}</span></td>
        <td class="${isOverdue ? 'bp-table__bal--overdue' : ''}">${p.balance}</td>
        <td style="color:#6b7280">${p.renewal}</td>
        <td><a href="/web/scif-portal/client-details" class="bp-table__view-btn">View \u2192</a></td>
      </tr>`;
    }).join('');

    tbody.querySelectorAll('tr').forEach(function (row) {
      row.addEventListener('click', function () {
        var policyId = row.getAttribute('data-policy');
        var policy = MOCK_POLICIES.find(function (p) { return p.policy === policyId; });
        if (policy) openDetail(policy);
      });
    });
  }

  function openDetail(policy) {
    selectedPolicy = policy.policy;

    fragmentElement.querySelector(`#${namespace}-dp-name`).textContent = policy.name;
    fragmentElement.querySelector(`#${namespace}-dp-policy`).textContent = policy.policy;
    fragmentElement.querySelector(`#${namespace}-dp-policyid`).textContent = policy.policy;
    fragmentElement.querySelector(`#${namespace}-dp-status`).textContent = STATUS_LABEL[policy.status];
    fragmentElement.querySelector(`#${namespace}-dp-balance`).textContent = policy.balance;
    fragmentElement.querySelector(`#${namespace}-dp-lastpay`).textContent = policy.lastpay;
    fragmentElement.querySelector(`#${namespace}-dp-due`).textContent = policy.due;
    fragmentElement.querySelector(`#${namespace}-dp-premium`).textContent = policy.premium;
    fragmentElement.querySelector(`#${namespace}-dp-renewal`).textContent = policy.renewal;

    if (detailPanel) detailPanel.style.display = 'block';

    var filtered = currentFilter === 'all' ? MOCK_POLICIES : MOCK_POLICIES.filter(function (p) { return p.status === currentFilter; });
    renderTable(filtered);

    Liferay.fire('bp:policy-selected', { policy: policy });
  }

  function closeDetail() {
    selectedPolicy = null;
    if (detailPanel) detailPanel.style.display = 'none';
    var filtered = currentFilter === 'all' ? MOCK_POLICIES : MOCK_POLICIES.filter(function (p) { return p.status === currentFilter; });
    renderTable(filtered);
    Liferay.fire('bp:policy-deselected', {});
  }

  function setPaginationVisible(visible) {
    var pgEl = fragmentElement.querySelector(`#${namespace}-pagination`);
    if (pgEl) pgEl.style.display = visible ? '' : 'none';
  }

  function setFilter(filter) {
    currentFilter = filter;
    currentPage = 1;
    ['all', 'overdue', 'renewal'].forEach(function (f) {
      var chip = fragmentElement.querySelector(`#${namespace}-chip-${f}`);
      if (chip) chip.className = 'bp-table__chip' + (f === filter ? ' bp-table__chip--on' : '');
    });
    var filtered = filter === 'all' ? MOCK_POLICIES : MOCK_POLICIES.filter(function (p) { return p.status === filter; });
    renderTable(filtered);
    updatePaginationSummary(filter);
    setPaginationVisible(filter === 'all');
    closeDetail();
  }

  ['all', 'overdue', 'renewal'].forEach(function (f) {
    var chip = fragmentElement.querySelector(`#${namespace}-chip-${f}`);
    if (chip) {
      chip.addEventListener('click', function () { setFilter(f); });
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDetail);

  // Listen for attention-required fragment firing a selection
  Liferay.on('bp:attention-select', function (event) {
    var policyId = event && event.policyId;
    if (!policyId) return;
    var policy = MOCK_POLICIES.find(function (p) { return p.policy === policyId; });
    if (policy) {
      setFilter('all');
      openDetail(policy);
    }
  });

  // ── Pagination config ─────────────────────────────────────────────────────
  var TOTAL_CLIENTS = 247;
  var PAGE_SIZE = 10;
  var TOTAL_PAGES = Math.ceil(TOTAL_CLIENTS / PAGE_SIZE);
  var currentPage = 1;

  function updatePaginationSummary(filter) {
    var summaryEl = fragmentElement.querySelector(`#${namespace}-pg-summary`);
    if (!summaryEl) return;
    if (filter === 'all') {
      var start = (currentPage - 1) * PAGE_SIZE + 1;
      var end   = Math.min(currentPage * PAGE_SIZE, TOTAL_CLIENTS);
      summaryEl.textContent = 'Showing ' + start + '\u2013' + end + ' of ' + TOTAL_CLIENTS + ' clients';
    } else if (filter === 'overdue') {
      summaryEl.textContent = 'Showing 3 clients with past due balances';
    } else if (filter === 'renewal') {
      summaryEl.textContent = 'Showing 3 clients with upcoming renewals';
    }
  }

  function setPage(page) {
    if (page < 1 || page > TOTAL_PAGES) return;
    currentPage = page;

    var prevBtn = fragmentElement.querySelector(`#${namespace}-pg-prev`);
    var nextBtn = fragmentElement.querySelector(`#${namespace}-pg-next`);
    if (prevBtn) {
      prevBtn.disabled = currentPage === 1;
      prevBtn.className = 'bp-pagination__btn' + (currentPage === 1 ? ' bp-pagination__btn--disabled' : '');
    }
    if (nextBtn) {
      nextBtn.disabled = currentPage === TOTAL_PAGES;
      nextBtn.className = 'bp-pagination__btn' + (currentPage === TOTAL_PAGES ? ' bp-pagination__btn--disabled' : '');
    }

    fragmentElement.querySelectorAll('.bp-pagination__page').forEach(function (chip) {
      var chipPage = parseInt(chip.getAttribute('data-page'));
      chip.className = 'bp-pagination__page' + (chipPage === currentPage ? ' bp-pagination__page--on' : '');
    });

    updatePaginationSummary(currentFilter);
    // Always show the same 10 mock rows — in a real implementation
    // this would fetch the correct page from the API
    var filtered = currentFilter === 'all' ? MOCK_POLICIES : MOCK_POLICIES.filter(function (p) { return p.status === currentFilter; });
    renderTable(filtered);
    closeDetail();
  }

  var prevBtn = fragmentElement.querySelector(`#${namespace}-pg-prev`);
  var nextBtn = fragmentElement.querySelector(`#${namespace}-pg-next`);
  if (prevBtn) prevBtn.addEventListener('click', function () { setPage(currentPage - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { setPage(currentPage + 1); });

  fragmentElement.querySelectorAll('.bp-pagination__page').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var page = parseInt(chip.getAttribute('data-page'));
      if (!isNaN(page)) setPage(page);
    });
  });

  // ── Init ──────────────────────────────────────────────────────────────────
  renderTable(MOCK_POLICIES);
  updatePaginationSummary('all');
  setPaginationVisible(true);
})();
