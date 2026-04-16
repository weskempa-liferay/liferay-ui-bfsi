(function () {
  var namespace = fragmentNamespace;
  var wrap = fragmentElement.querySelector('#' + namespace + '-open');

  function el(id) { return fragmentElement.querySelector('#' + namespace + '-' + id); }

  var DOT_ICONS = {
    done:    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 4" stroke="#1D9E75" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    active:  '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="2.5" fill="#378ADD"/></svg>',
    action:  '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="6" y1="3" x2="6" y2="6.5" stroke="#E24B4A" stroke-width="1.5" stroke-linecap="round"/><circle cx="6" cy="8.5" r="0.8" fill="#E24B4A"/></svg>',
    pending: ''
  };

  var state = {
    claims: [],
    selectedIdx: 0,
    policyId: null,
    loading: false
  };

  function getPolicyId() {
    try { return new URLSearchParams(window.location.search).get('policyId') || 'WC-2024-00391'; } catch(e) { return 'WC-2024-00391'; }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      var d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch(e) { return dateStr; }
  }

  var STATUS_ORDER = [
    'Claim reported',
    'Adjuster assigned',
    'Initial review completed',
    'Documentation needed',
    'Under review',
    'Resolved'
  ];

  function mapApiClaim(item) {
    var currentStatus = item.claimStatus || 'Claim reported';
    var currentIndex = STATUS_ORDER.indexOf(currentStatus);
    if (currentIndex === -1) currentIndex = 0;

    var statusMode = currentStatus === 'Documentation needed' ? 'action' : 'review';

    var timeline = STATUS_ORDER.map(function(statusName, index) {
      var state = 'pending';
      var desc = 'This step is pending.';
      
      if (index < currentIndex) {
        state = 'done';
        desc = 'This step has been completed.';
      } else if (index === currentIndex) {
        state = statusMode === 'action' ? 'action' : 'active';
        desc = 'This stage is currently in progress.';
      }

      // Contextual descriptions
      if (statusName === 'Claim reported') desc = 'Claim submitted via portal. Initial confirmation sent.';
      if (statusName === 'Adjuster assigned') desc = 'A dedicated claims adjuster has been assigned to your case.';
      if (statusName === 'Initial review completed') desc = 'Adjuster has completed the first pass of documentation review.';
      if (statusName === 'Documentation needed') desc = 'Additional evidence or forms are required to proceed.';
      if (statusName === 'Under review') desc = 'Everything is submitted. Your adjuster is finalizing the claim.';
      if (statusName === 'Resolved') desc = 'The claim has been finalized and closed.';

      return {
        state: state,
        label: statusName,
        date: index <= currentIndex ? formatDate(item.dateCreated) : 'Future step',
        desc: desc
      };
    });

    return {
      id: item.name || item.externalReferenceCode || 'CLM-PENDING',
      title: (item.shortDescription || 'Claim') + ' \u2014 ' + (item.injuredWorker || 'Worker'),
      filed: formatDate(item.dateCreated),
      incurred: '$14,200',
      status: statusMode === 'action' ? 'action' : (currentStatus === 'Resolved' ? 'none' : 'review'),
      statusLabel: currentStatus,
      injuredWorker: item.injuredWorker || '—',
      dateOfInjury: formatDate(item.injuryDate),
      injuryType: item.shortDescription || 'Injury',
      adjuster: { name: 'Maria Torres', phone: '(916) 555-0144', email: 'm.torres@statefund.ca.gov', initials: 'MT' },
      bannerTitle: currentStatus === 'Documentation needed' ? 'Action required \u2014 missing document' : null,
      bannerBody: currentStatus === 'Documentation needed' ? 'Your adjuster needs a completed DWC-1 claim form to continue processing.' : null,
      uploadLabel: currentStatus === 'Documentation needed' ? 'Upload DWC-1 claim form' : null,
      timeline: timeline,
      docs: [
        { name: 'Injury report',   meta: 'Submitted ' + formatDate(item.dateCreated),  state: 'view'    },
        { name: 'Medical records', meta: 'Pending \u2014 provider', state: 'pending' }
      ]
    };
  }

  function fetchClaims(policyId) {
    state.loading = true;
    state.policyId = policyId;
    
    fetch('/o/c/claims/', {
      headers: {
        'x-csrf-token': Liferay.authToken || ''
      }
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      state.claims = (data.items || [])
        .filter(function(item) {
          // Filter out Resolved claims for the "Open claims" view
          return (item.claimStatus || '') !== 'Resolved';
        })
        .map(mapApiClaim);
      state.loading = false;
      render();
    })
    .catch(function(err) {
      console.error('Error fetching claims:', err);
      state.loading = false;
      render();
    });
  }

  function renderClaim(claim) {
    if (!claim) return;
    el('detail-title').textContent = 'Claim status \u2014 ' + claim.id;

    var banner = el('action-banner');
    if (claim.bannerTitle && banner) {
      banner.className = 'phco-action-banner';
      el('banner-title').textContent = claim.bannerTitle;
      el('banner-body').textContent = claim.bannerBody;
    } else if (banner) {
      banner.className = 'phco-action-banner phco-action-banner--hidden';
    }

    var timelineEl = el('timeline');
    if (timelineEl) {
      timelineEl.innerHTML = claim.timeline.map(function (step) {
        return '<div class="phco-tl-item">' +
          '<div class="phco-tl-dot phco-tl-dot--' + step.state + '">' + (DOT_ICONS[step.state] || '') + '</div>' +
          '<div>' +
            '<div class="phco-tl-label phco-tl-label--' + step.state + '">' + step.label + '</div>' +
            '<div class="phco-tl-date">' + step.date + '</div>' +
            '<div class="phco-tl-desc">' + step.desc + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    var uploadZone = el('upload-zone');
    var uploadSuccess = el('upload-success');
    if (uploadSuccess) uploadSuccess.className = 'phco-upload-success';

    if (claim.uploadLabel && uploadZone) {
      uploadZone.className = 'phco-upload-zone';
      el('upload-title').textContent = claim.uploadLabel;
      el('upload-sub').textContent = 'Click to select PDF or image \u00b7 Max 10 MB';
      uploadZone.onclick = function () {
        uploadZone.className = 'phco-upload-zone phco-upload-zone--has-file';
        el('upload-title').textContent = 'DWC-1_claim_form.pdf';
        el('upload-sub').textContent = '284 KB \u00b7 Ready to submit';
      };
      el('upload-btn').onclick = function (e) {
        e.stopPropagation();
        uploadZone.className = 'phco-upload-zone phco-upload-zone--hidden';
        if (uploadSuccess) {
          uploadSuccess.className = 'phco-upload-success phco-upload-success--visible';
          uploadSuccess.innerHTML = '<strong>Document submitted.</strong> Your adjuster will be notified and will resume review within 1 business day.';
        }
      };
    } else if (uploadZone) {
      uploadZone.className = 'phco-upload-zone phco-upload-zone--hidden';
    }

    var adj = claim.adjuster;
    el('adj-avatar').textContent = adj.initials;
    el('adj-name').textContent = adj.name;
    el('adj-phone').textContent = adj.phone;
    el('adj-email').textContent = adj.email;

    var detailsEl = el('claim-details');
    if (detailsEl) {
      detailsEl.innerHTML = [
        ['Claim number',   '<span style="font-family:monospace;font-size:11px">' + claim.id + '</span>'],
        ['Injured worker', claim.injuredWorker],
        ['Date of injury', claim.dateOfInjury],
        ['Injury type',    claim.injuryType],
        ['Est. incurred',  '<span style="color:#854F0B;font-weight:500">' + claim.incurred + '</span>'],
        ['Status',         '<span class="phco-tag phco-tag--' + (claim.status || 'review') + '">' + claim.statusLabel + '</span>']
      ].map(function (r) {
        return '<div class="phco-detail-row"><span class="phco-detail-label">' + r[0] + '</span><span>' + r[1] + '</span></div>';
      }).join('');
    }

    var docsEl = el('claim-docs');
    if (docsEl) {
      docsEl.innerHTML = claim.docs.map(function (d) {
        var btnLabel = d.state === 'upload' ? 'Upload' : (d.state === 'pending' ? 'Pending' : 'View');
        return '<div class="phco-doc-row">' +
          '<div><div class="phco-doc-name">' + d.name + '</div><div class="phco-doc-meta">' + d.meta + '</div></div>' +
          '<button class="phco-doc-btn">' + btnLabel + '</button>' +
        '</div>';
      }).join('');
    }
  }

  function render() {
    var claims = state.claims;

    var countTag = el('open-count-tag');
    if (countTag) {
      countTag.textContent = claims.length === 0 ? '0 open' : claims.length + (claims.some(function(c){ return c.status==='action'; }) ? ' \u2014 action required' : ' open');
      countTag.className = 'phco-tag ' + (claims.length === 0 ? 'phco-tag--none' : (claims.some(function(c){ return c.status==='action'; }) ? 'phco-tag--action' : 'phco-tag--review'));
    }

    var externalCount = document.getElementById('ckji-open-count');
    if (externalCount) {
      externalCount.textContent = claims.length;
    }

    var listEl = el('claims-list');
    var detailCard = el('detail-card');
    var emptyCard  = el('empty-card');
    var sidebarEl  = el('sidebar');

    if (claims.length === 0 && !state.loading) {
      if (listEl) listEl.innerHTML = '';
      if (detailCard) detailCard.style.display = 'none';
      if (emptyCard)  emptyCard.className = 'phco-card phco-card--empty visible';
      if (sidebarEl)  sidebarEl.style.display = 'none';
      return;
    }

    if (detailCard) detailCard.style.display = '';
    if (emptyCard)  emptyCard.className = 'phco-card phco-card--empty';
    if (sidebarEl)  sidebarEl.style.display = '';

    if (listEl) {
      if (state.loading) {
        listEl.innerHTML = '<div style="padding:20px;text-align:center;color:#6b7280;font-size:13px">Loading claims...</div>';
      } else {
        listEl.innerHTML = claims.map(function (c, i) {
          var selectedClass = i === state.selectedIdx ? ' phco-claim-item--selected' : '';
          return '<div class="phco-claim-item' + selectedClass + '" data-idx="' + i + '">' +
            '<div class="phco-claim-item__top">' +
              '<div><div class="phco-claim-item__id">' + c.id + '</div><div class="phco-claim-item__title">' + c.title + '</div></div>' +
              '<span class="phco-tag phco-tag--' + (c.status || 'review') + '">' + c.statusLabel + '</span>' +
            '</div>' +
            '<div class="phco-claim-item__meta">Filed ' + c.filed + ' \u00b7 Est. incurred: ' + c.incurred + '</div>' +
          '</div>';
        }).join('');
      }
    }

    renderClaim(claims[state.selectedIdx]);
  }

  // Event Delegation for Claim Clicks
  if (fragmentElement) {
    fragmentElement.addEventListener('click', function(e) {
      var item = e.target.closest('.phco-claim-item');
      if (item) {
        var idx = parseInt(item.getAttribute('data-idx'));
        state.selectedIdx = idx;
        render();
      }
    });
  }

  function show() { if (wrap) wrap.className = 'phco-wrap phco-wrap--visible'; }
  function hide() { if (wrap) wrap.className = 'phco-wrap'; }

  Liferay.on('ph:tab-change',     function (e) { e && e.tab === 'open' ? show() : hide(); });
  Liferay.on('ph:claims-context', function (e) { if (e && e.policyId) fetchClaims(e.policyId); });

  fetchClaims(getPolicyId());
  show();
})();