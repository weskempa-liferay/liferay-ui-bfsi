(function () {
  var namespace = fragmentNamespace;
  var wrap = fragmentElement.querySelector('#' + namespace + '-history');
  var listEl = fragmentElement.querySelector('#' + namespace + '-history-list');
  var filterContainer = fragmentElement.querySelector('#' + namespace + '-filters');
  var searchInput = fragmentElement.querySelector('#' + namespace + '-search');
  var paginationContainer = fragmentElement.querySelector('#' + namespace + '-pagination');

  var state = {
    claims: [],
    filter: 'all',
    search: '',
    page: 1,
    pageSize: 5,
    loading: false
  };

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      var d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch(e) { return dateStr; }
  }

  function mapApiClaim(item) {
    var isClosed = item.claimStatus === 'Resolved';
    return {
      id: item.name || item.externalReferenceCode || 'CLM-PENDING',
      title: (item.shortDescription || 'Claim') + ' \u2014 ' + (item.injuredWorker || 'Worker'),
      filed: formatDate(item.dateCreated),
      dateModified: formatDate(item.dateModified),
      status: isClosed ? 'closed' : 'open',
      statusLabel: isClosed ? 'Closed' : 'Open',
      claimStatus: item.claimStatus || 'Claim reported'
    };
  }

  function fetchHistory() {
    state.loading = true;
    render();

    fetch('/o/c/claims/', {
      headers: {
        'x-csrf-token': Liferay.authToken || ''
      }
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      state.claims = (data.items || []).map(mapApiClaim);
      state.loading = false;
      render();
    })
    .catch(function(err) {
      console.error('Error fetching history:', err);
      state.loading = false;
      render();
    });
  }

  function renderPagination(totalItems) {
    if (!paginationContainer) return;
    var totalPages = Math.ceil(totalItems / state.pageSize);
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    var html = '<button class="phhi-page-btn" data-page="prev" ' + (state.page === 1 ? 'disabled' : '') + '>Prev</button>';
    for (var i = 1; i <= totalPages; i++) {
       html += '<button class="phhi-page-btn' + (i === state.page ? ' phhi-page-btn--active' : '') + '" data-page="' + i + '">' + i + '</button>';
    }
    html += '<button class="phhi-page-btn" data-page="next" ' + (state.page === totalPages ? 'disabled' : '') + '>Next</button>';
    
    paginationContainer.innerHTML = html;
  }

  function render() {
    if (!listEl) return;

    if (state.loading) {
      listEl.innerHTML = '<div class="phhi-empty">Loading claim history...</div>';
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    // Filter and Search
    var query = state.search.toLowerCase();
    var filteredClaims = state.claims.filter(function(c) {
      var matchesFilter = state.filter === 'all' || c.status === state.filter;
      var matchesSearch = c.title.toLowerCase().indexOf(query) > -1 || c.id.toLowerCase().indexOf(query) > -1;
      return matchesFilter && matchesSearch;
    });

    // Pagination
    var totalItems = filteredClaims.length;
    var start = (state.page - 1) * state.pageSize;
    var pagedClaims = filteredClaims.slice(start, start + state.pageSize);

    if (totalItems === 0) {
      listEl.innerHTML = '<div class="phhi-empty">No claims found matching your criteria.</div>';
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    listEl.innerHTML = pagedClaims.map(function (r) {
      var dateStr = 'Filed ' + r.filed + (r.status === 'closed' ? ' \u00b7 Closed ' + r.dateModified : '');
      return '<div class="phhi-row">' +
        '<div><div class="phhi-row-id">' + r.id + '</div><div class="phhi-row-title">' + r.title + '</div><div class="phhi-row-date">' + dateStr + '</div></div>' +
        '<span class="phhi-tag phhi-tag--' + r.status + '">' + r.statusLabel + '</span>' +
      '</div>';
    }).join('');

    renderPagination(totalItems);
  }

  // Event Delegation for Filters
  if (filterContainer) {
    filterContainer.addEventListener('click', function(e) {
      var filterBtn = e.target.closest('.phhi-filter');
      if (filterBtn) {
        filterContainer.querySelectorAll('.phhi-filter').forEach(function(b) { b.classList.remove('phhi-filter--active'); });
        filterBtn.classList.add('phhi-filter--active');
        state.filter = filterBtn.getAttribute('data-status');
        state.page = 1;
        render();
      }
    });
  }

  // Search Input
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      state.search = e.target.value;
      state.page = 1;
      render();
    });
  }

  // Pagination Delegation
  if (paginationContainer) {
    paginationContainer.addEventListener('click', function(e) {
      var btn = e.target.closest('.phhi-page-btn');
      if (btn && !btn.disabled) {
        var p = btn.getAttribute('data-page');
        if (p === 'prev') state.page--;
        else if (p === 'next') state.page++;
        else state.page = parseInt(p);
        render();
        wrap.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  function show() { if (wrap) wrap.className = 'phhi-wrap phhi-wrap--visible'; }
  function hide() { if (wrap) wrap.className = 'phhi-wrap'; }

  Liferay.on('ph:tab-change', function (e) {
    if (e && e.tab === 'history') {
      show();
      fetchHistory();
    } else {
      hide();
    }
  });

  if (window.location.search.indexOf('tab=history') > -1) {
    show();
    fetchHistory();
  }
})();