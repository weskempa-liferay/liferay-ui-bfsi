(function () {
  var namespace = fragmentNamespace;
  var wrap = fragmentElement.querySelector('#' + namespace + '-open');

  function el(id) { return fragmentElement.querySelector('#' + namespace + '-' + id); }

  var DOT_ICONS = {
    done:    '<svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 4" stroke="#1D9E75" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    active:  '<svg width="14" height="14" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="3" fill="#3b82f6"/></svg>',
    action:  '<svg width="14" height="14" viewBox="0 0 12 12" fill="none"><line x1="6" y1="3" x2="6" y2="6.5" stroke="#e11d48" stroke-width="1.8" stroke-linecap="round"/><circle cx="6" cy="8.5" r="0.8" fill="#e11d48"/></svg>',
    pending: ''
  };

  var state = {
    loans: [],
    selectedIdx: -1,
    loading: false,
    searchQuery: '',
    statusFilter: 'all',
    page: 1,
    pageSize: 5
  };

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      var d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch(e) { return dateStr; }
  }

  function formatCurrency(num) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num || 0);
  }

  var STATUS_ORDER = [
    'Submitted',
    'Credit Analysis',
    'Underwriting',
    'Approved',
    'Denied',
    'Funding',
    'Active'
  ];

  function mapApiLoan(item) {
    var rawStatus = item.applicationStatus || (item.status && item.status.label) || 'Submitted';
    var currentIndex = STATUS_ORDER.indexOf(rawStatus);
    
    // Improved matching for specific variants
    if (currentIndex === -1) {
       var lowStatus = rawStatus.toLowerCase();
       if (lowStatus.includes('approved')) currentIndex = 3;
       else if (lowStatus.includes('denied')) currentIndex = 4;
       else if (lowStatus.includes('review') || lowStatus.includes('credit')) currentIndex = 1;
       else if (lowStatus.includes('underwrit')) currentIndex = 2;
       else if (lowStatus.includes('fund')) currentIndex = 5;
       else currentIndex = 0;
    }

    // Logic for banners/actions (simulated for demo)
    var statusMode = rawStatus === 'Documentation Needed' ? 'action' : 'review';
    if (rawStatus === 'Denied') statusMode = 'action'; // Mark denied as something needing attention/different style

    var timeline = STATUS_ORDER.map(function(statusName, index) {
      // Logic for mutually exclusive paths: Approved vs Denied
      if (rawStatus === 'Denied' && statusName === 'Approved') return null;
      if (rawStatus === 'Approved' && statusName === 'Denied') return null;
      
      // If we are past the decision point (Approved, Funding, Active), don't show Denied
      var currentStatusIdx = STATUS_ORDER.indexOf(rawStatus);
      if ((currentStatusIdx === 3 || currentStatusIdx > 4) && statusName === 'Denied') return null;
      
      // If we are Denied, don't show future steps
      if (rawStatus === 'Denied' && (statusName === 'Funding' || statusName === 'Active')) return null;
      
      var stepState = 'pending';
      var desc = 'This phase is scheduled.';
      
      if (index < currentStatusIdx) {
        stepState = 'done';
        desc = 'This step has been successfully completed.';
      } else if (index === currentStatusIdx) {
        stepState = statusMode === 'action' ? 'action' : 'active';
        desc = 'Our team is currently processing this stage.';
      }

      // Contextual descriptions
      if (statusName === 'Submitted') desc = 'Application received and initial validation completed.';
      if (statusName === 'Credit Analysis') desc = 'Reviewing credit history and financial standing.';
      if (statusName === 'Underwriting') desc = 'Final assessment of loan risk and terms.';
      if (statusName === 'Approved') desc = 'Loan has been green-lit. Final docs being prepared.';
      if (statusName === 'Denied') desc = 'Application was not approved based on current criteria. Check reviewer notes for details.';
      if (statusName === 'Funding') desc = 'Transferring funds to your designated account.';
      if (statusName === 'Active') desc = 'Loan is active and on repayment schedule.';

      return {
        state: stepState,
        label: statusName,
        date: index <= currentIndex ? formatDate(item.dateCreated) : 'Upcoming',
        desc: desc
      };
    }).filter(function(step) { return step !== null; }); // Remove skipped steps

    return {
      id: 'LN-' + (item.id || 'PENDING'),
      uid: String(item.id || Math.random().toString(36).substr(2, 9)), // Force string for comparison
      title: (item.loanType || 'Personal') + ' Loan Application',
      applicant: item.applicantFullName || 'Valued Customer',
      filed: formatDate(item.dateCreated),
      amount: formatCurrency(item.requestedAmount),
      status: rawStatus === 'Denied' ? 'action' : (rawStatus === 'Active' ? 'none' : 'review'),
      statusLabel: currentIndex !== -1 ? STATUS_ORDER[currentIndex] : rawStatus,
      loanType: item.loanType || 'Standard',
      annualIncome: formatCurrency(item.annualIncome),
      creditScore: item.creditScore || '—',
      term: (item.loanTermMonths || 12) + ' Months',
      interestRate: (item.interestRate || '0') + '%',
      officer: { name: 'Jordan Smith', phone: '(415) 555-0892', email: 'j.smith@pillarbank.com', initials: 'JS' },
      bannerTitle: rawStatus === 'Denied' ? 'Application Denied' : (statusMode === 'action' ? 'Action required \u2014 Proof of income' : null),
      bannerBody: rawStatus === 'Denied' ? 'We regret to inform you that we cannot approve your application at this time.' : (statusMode === 'action' ? 'Your loan officer needs a recent pay stub or W2.' : null),
      uploadLabel: statusMode === 'action' && rawStatus !== 'Denied' ? 'Upload Proof of Income' : null,
      timeline: timeline,
      docs: [
        { name: 'Loan Agreement',   meta: 'Ready for signature',  state: 'sign'    },
        { name: 'Application Copy', meta: 'Filed ' + formatDate(item.dateCreated), state: 'view' }
      ]
    };
  }

  function fetchLoans() {
    state.loading = true;
    render();
    
    fetch('https://webserver-lctpillarportal-prd.lfr.cloud/o/c/loanapps/', {
      headers: {
        'x-csrf-token': Liferay.authToken || '',
        'accept': 'application/json'
      }
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      state.loans = (data.items || []).map(mapApiLoan);
      state.loading = false;
      render();
    })
    .catch(function(err) {
      console.error('Error fetching loans:', err);
      state.loading = false;
      render();
    });
  }

  function renderLoan(loan) {
    if (!loan) return;
    el('detail-title').textContent = 'Application Status \u2014 ' + loan.id;

    var banner = el('action-banner');
    if (loan.bannerTitle && banner) {
      banner.className = 'fl-action-banner';
      el('banner-title').textContent = loan.bannerTitle;
      el('banner-body').textContent = loan.bannerBody;
    } else if (banner) {
      banner.className = 'fl-action-banner fl-action-banner--hidden';
    }

    var timelineEl = el('timeline');
    if (timelineEl) {
      timelineEl.innerHTML = loan.timeline.map(function (step) {
        return '<div class="fl-tl-item">' +
          '<div class="fl-tl-dot fl-tl-dot--' + step.state + '">' + (DOT_ICONS[step.state] || '') + '</div>' +
          '<div>' +
            '<div class="fl-tl-label fl-tl-label--' + step.state + '">' + step.label + '</div>' +
            '<div class="fl-tl-date">' + step.date + '</div>' +
            '<div class="fl-tl-desc">' + step.desc + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    var uploadZone = el('upload-zone');
    var uploadSuccess = el('upload-success');
    if (uploadSuccess) uploadSuccess.className = 'fl-upload-success';

    if (loan.uploadLabel && uploadZone) {
      uploadZone.className = 'fl-upload-zone';
      el('upload-title').textContent = loan.uploadLabel;
      el('upload-sub').textContent = 'Click to select PDF or image \u00b7 Max 10 MB';
      uploadZone.onclick = function () {
        uploadZone.className = 'fl-upload-zone fl-upload-zone--has-file';
        el('upload-title').textContent = 'Pay_Stub_2024.pdf';
        el('upload-sub').textContent = '412 KB \u00b7 Ready to submit';
      };
      el('upload-btn').onclick = function (e) {
        e.stopPropagation();
        uploadZone.className = 'fl-upload-zone fl-upload-zone--hidden';
        if (uploadSuccess) {
          uploadSuccess.className = 'fl-upload-success fl-upload-success--visible';
          uploadSuccess.innerHTML = '<strong>Documents submitted.</strong> Your senior loan officer will be notified and will resume review within 1 business day.';
        }
      };
    } else if (uploadZone) {
      uploadZone.className = 'fl-upload-zone fl-upload-zone--hidden';
    }

    var off = loan.officer;
    el('adj-avatar').textContent = off.initials;
    el('officer-name').textContent = off.name;
    el('officer-phone').textContent = off.phone;
    el('officer-email').textContent = off.email;

    var detailsEl = el('loan-details');
    if (detailsEl) {
      detailsEl.innerHTML = [
        ['Request Amount',   '<span style="font-weight:700;color:#0f172a">' + loan.amount + '</span>'],
        ['Loan Type',        loan.loanType],
        ['Applicant',        loan.applicant],
        ['Term',             loan.term],
        ['Interest Rate',    loan.interestRate],
        ['Annual Income',    loan.annualIncome],
        ['Credit Score',     '<span style="color:#0369a1;font-weight:600">' + loan.creditScore + '</span>'],
        ['Status',           '<span class="fl-tag fl-tag--' + (loan.status || 'review') + '">' + loan.statusLabel + '</span>']
      ].map(function (r) {
        return '<div class="fl-detail-row"><span class="fl-detail-label">' + r[0] + '</span><span>' + r[1] + '</span></div>';
      }).join('');
    }

    var docsEl = el('loan-docs');
    if (docsEl) {
      docsEl.innerHTML = loan.docs.map(function (d) {
        var btnLabel = d.state === 'sign' ? 'Sign' : 'View';
        return '<div class="fl-doc-row">' +
          '<div><div class="fl-doc-name">' + d.name + '</div><div class="fl-doc-meta">' + d.meta + '</div></div>' +
          '<button class="fl-doc-btn">' + btnLabel + '</button>' +
        '</div>';
      }).join('');
    }
  }

  function render() {
    var loans = state.loans;

    // 1. Filtering & Searching
    var filtered = loans.filter(function(l) {
      var matchesSearch = !state.searchQuery || 
        l.id.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
        l.title.toLowerCase().includes(state.searchQuery.toLowerCase());
      
      var matchesStatus = state.statusFilter === 'all' || l.statusLabel === state.statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // 2. Pagination
    var totalPages = Math.ceil(filtered.length / state.pageSize) || 1;
    if (state.page > totalPages) state.page = totalPages;
    
    var startIdx = (state.page - 1) * state.pageSize;
    var paged = filtered.slice(startIdx, startIdx + state.pageSize);

    // 3. UI Updates
    var countTag = el('open-count-tag');
    if (countTag) {
      countTag.textContent = filtered.length + ' match' + (filtered.length === 1 ? '' : 'es');
      countTag.className = 'fl-tag ' + (filtered.length === 0 ? 'fl-tag--none' : 'fl-tag--review');
    }

    var listEl = el('loans-list');
    var detailCard = el('detail-card');
    var emptyCard  = el('empty-card');
    var sidebarEl  = el('sidebar');
    var paginationEl = el('pagination');

    if (filtered.length === 0 && !state.loading) {
      if (listEl) listEl.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8;font-size:14px">No applications found matching your criteria.</div>';
      if (detailCard) detailCard.style.display = 'none';
      if (emptyCard)  emptyCard.className = 'fl-card fl-card--empty visible';
      if (sidebarEl)  sidebarEl.style.display = 'none';
      if (paginationEl) paginationEl.style.display = 'none';
      return;
    }

    // Hide details if no selection
    if (state.selectedIdx === -1) {
      if (detailCard) detailCard.style.display = 'none';
      if (sidebarEl)  sidebarEl.style.display = 'none';
    } else {
      if (detailCard) detailCard.style.display = '';
      if (sidebarEl)  sidebarEl.style.display = '';
    }

    if (emptyCard)  emptyCard.className = 'fl-card fl-card--empty';
    if (paginationEl) paginationEl.style.display = 'flex';

    if (listEl) {
      if (state.loading) {
        listEl.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8;font-size:14px"><div class="spinner-border spinner-border-sm mr-2" role="status"></div>Loading applications...</div>';
      } else {
        listEl.innerHTML = paged.map(function (c) {
          var selectedLoan = loans[state.selectedIdx];
          var isSelected = selectedLoan && (String(selectedLoan.uid) === String(c.uid));
          var selectedClass = isSelected ? ' fl-loan-item--selected' : '';
          return '<div class="fl-loan-item' + selectedClass + '" data-uid="' + c.uid + '">' +
            '<div class="fl-loan-item__top">' +
              '<div><div class="fl-loan-item__id">' + c.id + '</div><div class="fl-loan-item__title">' + c.title + '</div></div>' +
              '<span class="fl-tag fl-tag--' + (c.status || 'review') + '">' + c.statusLabel + '</span>' +
            '</div>' +
            '<div class="fl-loan-item__meta"><span>Submitted ' + c.filed + '</span> \u00b7 <span>' + c.amount + '</span></div>' +
          '</div>';
        }).join('');
      }
    }

    // Update Pagination UI
    el('pag-info').textContent = 'Page ' + state.page + ' of ' + totalPages;
    el('pag-prev').disabled = state.page === 1;
    el('pag-next').disabled = state.page === totalPages;

    if (state.selectedIdx !== -1) {
      renderLoan(loans[state.selectedIdx]);
    }
  }

  // Event Delegation for Loan Clicks
  if (fragmentElement) {
    fragmentElement.addEventListener('click', function(e) {
      // Loan item click
      var item = e.target.closest('.fl-loan-item');
      if (item) {
        var clickedUid = String(item.getAttribute('data-uid'));
        var foundIdx = state.loans.findIndex(function(l) { return String(l.uid) === clickedUid; });
        if (foundIdx !== -1) {
          state.selectedIdx = foundIdx;
          render();
        }
        return;
      }

      // Pagination clicks
      var prevBtn = e.target.closest('#' + namespace + '-pag-prev');
      if (prevBtn && !prevBtn.disabled) {
        state.page--;
        render();
        return;
      }
      var nextBtn = e.target.closest('#' + namespace + '-pag-next');
      if (nextBtn && !nextBtn.disabled) {
        state.page++;
        render();
        return;
      }
    });

    // Search and Filter Listeners
    var searchInput = el('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        state.searchQuery = e.target.value;
        state.page = 1; // Reset to first page on search
        state.selectedIdx = -1; // Reset selection on search
        render();
      });
    }

    var filterSelect = el('filter-select');
    if (filterSelect) {
      filterSelect.addEventListener('change', function(e) {
        state.statusFilter = e.target.value;
        state.page = 1; // Reset to first page on filter
        state.selectedIdx = -1; // Reset selection on filter
        render();
      });
    }
  }

  function show() { if (wrap) wrap.className = 'fl-wrap fl-wrap--visible'; }
  function hide() { if (wrap) wrap.className = 'fl-wrap'; }

  Liferay.on('fl:tab-change', function (e) { e && e.tab === 'open' ? show() : hide(); });

  fetchLoans();
  show();
})();
