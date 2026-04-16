(function () {
  var namespace = fragmentNamespace;
  var wrap = fragmentElement.querySelector('#' + namespace + '-claims');
  var openTag = fragmentElement.querySelector('#' + namespace + '-open-tag');
  var openBody = fragmentElement.querySelector('#' + namespace + '-open-body');
  var histEl = fragmentElement.querySelector('#' + namespace + '-history');

  var state = {
    claims: [],
    loading: false
  };

  function fetchClaims() {
    state.loading = true;
    renderUI();

    fetch('/o/c/claims/', {
      headers: {
        'x-csrf-token': Liferay.authToken || ''
      }
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      state.claims = data.items || [];
      state.loading = false;
      renderUI();
    })
    .catch(function(err) {
      console.error('Error fetching broker client claims:', err);
      state.loading = false;
      renderUI();
    });
  }

  function getYearCount(claims, year) {
    return claims.filter(function(c) {
      return c.injuryDate && c.injuryDate.indexOf(year) === 0;
    }).length;
  }

  function renderUI() {
    var openClaims = state.claims.filter(function(c) { return c.claimStatus !== 'Resolved'; });
    var openCount = openClaims.length;

    if (openTag) {
      openTag.textContent = openCount === 0 ? '0 open' : openCount + ' open';
      openTag.className = 'bcc-tag ' + (openCount === 0 ? 'bcc-tag--zero' : 'bcc-tag--open');
    }

    if (openBody) {
      if (state.loading) {
        openBody.innerHTML = '<div class="bcc-empty">Loading claims data...</div>';
      } else if (openCount === 0) {
        openBody.innerHTML =
          '<div class="bcc-empty">' +
            '<div class="bcc-empty__icon">' +
              '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M9 2L16 16H2L9 2Z" stroke="#1D9E75" stroke-width="1.2" fill="none"/>' +
                '<line x1="9" y1="7" x2="9" y2="11" stroke="#1D9E75" stroke-width="1.2" stroke-linecap="round"/>' +
                '<circle cx="9" cy="13.5" r="0.7" fill="#1D9E75"/>' +
              '</svg>' +
            '</div>' +
            '<div class="bcc-empty__title">No open claims</div>' +
            '<div class="bcc-empty__sub">Clean active claims record</div>' +
          '</div>';
      } else {
        openBody.innerHTML = openClaims.map(function (item) {
          var title = (item.shortDescription || 'Claim') + ' \u2014 #' + (item.name || item.externalReferenceCode);
          var date = item.injuryDate ? new Date(item.injuryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
          return '<div class="bcc-open-item">' +
            '<div class="bcc-open-item__row">' +
              '<span class="bcc-open-item__title">' + title + '</span>' +
              '<span class="bcc-open-item__amount">$14,200.00 est.</span>' +
            '</div>' +
            '<div class="bcc-open-item__detail">Filed ' + date + ' \u00b7 ' + (item.claimStatus || 'In review') + '</div>' +
          '</div>';
        }).join('');
      }
    }

    if (histEl) {
      var years = [
        { year: '2026 (current policy year)', count: getYearCount(state.claims, '2026'), losses: '$14,200.00', status: 'Open' },
        { year: '2025', count: getYearCount(state.claims, '2025'), losses: '$0.00', status: 'None' },
        { year: '2024', count: getYearCount(state.claims, '2024'), losses: '$9,100.00', status: 'Closed' }
      ];

      histEl.innerHTML = years.map(function (y) {
        var isGood = y.count === 0;
        var statusBadge = '<span class="bcc-status-badge bcc-status-badge--' + y.status.toLowerCase() + '">' + y.status + '</span>';
        var rows =
          '<div class="bcc-hist-row"><span class="bcc-hist-label">Claims filed</span><span class="' + (isGood ? 'bcc-hist-val--good' : 'bcc-hist-val--warn') + '">' + y.count + '</span></div>' +
          '<div class="bcc-hist-row"><span class="bcc-hist-label">Total incurred losses</span><span class="' + (isGood ? 'bcc-hist-val--good' : 'bcc-hist-val--warn') + '">' + y.losses + '</span></div>' +
          '<div class="bcc-hist-row"><span class="bcc-hist-label">Status</span>' + statusBadge + '</div>';
        return '<div class="bcc-year-label">' + y.year + '</div>' + rows;
      }).join('');
    }
  }

  function show() { if (wrap) wrap.className = 'bcc-wrap bcc-wrap--visible'; }
  function hide() { if (wrap) wrap.className = 'bcc-wrap'; }

  Liferay.on('bp:tab-change', function (e) { e && e.tab === 'claims' ? show() : hide(); });
  Liferay.on('bp:client-loaded', function (e) { if (e && e.policy) fetchClaims(); });

  // Initial fetch for demo context
  fetchClaims();
})();