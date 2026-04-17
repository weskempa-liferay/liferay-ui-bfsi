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

  const state = {
    items: [],
    page: 1,
    pageSize: 5
  };

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
      state.items = data.items || [];
      render();
    })
    .catch(err => {
      console.error('Advisor Pipeline Error:', err);
      if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="padding:40px;text-align:center;color:#ef4444">Error loading data.</td></tr>';
    });
  }

  function render() {
    const tbody = el('tbody');
    if (!tbody) return;

    const filtered = state.items;
    const totalPages = Math.ceil(filtered.length / state.pageSize) || 1;
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;

    const startIdx = (state.page - 1) * state.pageSize;
    const paged = filtered.slice(startIdx, startIdx + state.pageSize);

    // Update Summary
    const endCount = Math.min(startIdx + state.pageSize, filtered.length);
    if (el('pag-summary')) {
      el('pag-summary').textContent = `Showing ${filtered.length ? startIdx + 1 : 0}\u2013${endCount} of ${filtered.length} applications`;
    }
    
    // Update Prev/Next Buttons
    const prevBtn = el('pag-prev');
    const nextBtn = el('pag-next');
    if (prevBtn) {
       prevBtn.toggleAttribute('disabled', state.page === 1);
       prevBtn.style.opacity = state.page === 1 ? '0.3' : '1';
    }
    if (nextBtn) {
       nextBtn.toggleAttribute('disabled', state.page === totalPages);
       nextBtn.style.opacity = state.page === totalPages ? '0.3' : '1';
    }
    if (el('pag-info')) el('pag-info').textContent = `Page ${state.page} of ${totalPages}`;

    if (paged.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="padding:40px;text-align:center;color:#94a3b8">No applications in pipeline.</td></tr>';
      return;
    }

    tbody.innerHTML = paged.map(item => {
      const status = item.applicationStatus || 'Submitted';
      return `
        <tr>
          <td>
            <div class="al-table__client-name">${item.applicantFullName || 'Valued Customer'}</div>
            <div class="al-table__client-sub">${item.loanType || 'Personal'}</div>
          </td>
          <td>LN-${item.applicationNumber || item.id || '---'}</td>
          <td><span class="al-badge al-badge--${getBadgeClass(status)}">${status}</span></td>
          <td>${formatCurrency(item.requestedAmount)}</td>
          <td>${formatDate(item.dateCreated)}</td>
          <td class="text-right"><a href="#" class="al-table__view">View \u2192</a></td>
        </tr>
      `;
    }).join('');
  }

  // Event Listeners
  if (root) {
    root.addEventListener('click', (e) => {
      const prevBtn = e.target.closest('#' + namespace + '-pag-prev');
      const nextBtn = e.target.closest('#' + namespace + '-pag-next');
      
      if (prevBtn && state.page > 1) {
        state.page--;
        render();
      }
      if (nextBtn) {
        const totalPages = Math.ceil(state.items.length / state.pageSize);
        if (state.page < totalPages) {
          state.page++;
          render();
        }
      }
    });
  }

  fetchLoans();
})();
