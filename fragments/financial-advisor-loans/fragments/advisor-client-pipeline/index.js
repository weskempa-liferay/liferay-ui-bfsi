(function () {
  const namespace = fragmentNamespace;
  const root = fragmentElement;

  function el(id) { return root.querySelector('#' + namespace + '-' + id); }

  function formatCurrency(num) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num || 0);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getBadgeClass(status) {
    const s = (status || '').toLowerCase();
    if (s.includes('underwrit') || s.includes('analysis')) return 'amber';
    if (s.includes('active') || s.includes('approve')) return 'green';
    if (s.includes('denied') || s.includes('error')) return 'red';
    return 'blue';
  }

  function fetchLoans() {
    const tbody = el('tbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="padding:40px;text-align:center;color:#94a3b8">Loading pipeline...</td></tr>';

    fetch('https://webserver-lctpillarportal-prd.lfr.cloud/o/c/loanapps/', {
      headers: {
        'x-csrf-token': Liferay.authToken || '',
        'accept': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      const items = data.items || [];
      renderTable(items);
    })
    .catch(err => {
      console.error('Advisor Pipeline Error:', err);
      if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="padding:40px;text-align:center;color:#ef4444">Error loading data.</td></tr>';
    });
  }

  function renderTable(items) {
    const tbody = el('tbody');
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="padding:40px;text-align:center;color:#94a3b8">No applications in pipeline.</td></tr>';
      return;
    }

    tbody.innerHTML = items.map(item => {
      const status = item.applicationStatus || 'Submitted';
      return `
        <tr>
          <td>
            <div class="al-table__client-name">${item.applicantFullName || 'Valued Customer'}</div>
            <div class="al-table__client-sub">${item.loanType || 'Personal'}</div>
          </td>
          <td>LN-${item.id}</td>
          <td><span class="al-badge al-badge--${getBadgeClass(status)}">${status}</span></td>
          <td>${formatCurrency(item.requestedAmount)}</td>
          <td>${formatDate(item.dateCreated)}</td>
          <td class="text-right"><a href="#" class="al-table__view">View →</a></td>
        </tr>
      `;
    }).join('');
  }

  fetchLoans();
})();
