(function () {
	var ns = `${fragmentEntryLinkNamespace}`;

	var PAGE_SIZE = 5;
	var currentPage = 1;
	var currentFilter = 'all';
	var sortCol = 'expiration';
	var sortDir = 'asc';
	var allPolicies = [];

	// ── Static fallback data ──────────────────────────────────
	var STATIC = [
		{ employer: 'Pacific Builders Co.',    industry: 'Construction',    policyNum: 'CA-2024-8847', code: '5645', expDate: '2025-04-30', premium: 48200,  status: 'expiring' },
		{ employer: 'Sunrise Health Staffing', industry: 'Healthcare',      policyNum: 'CA-2024-7293', code: '8835', expDate: '2025-08-15', premium: 112500, status: 'active'   },
		{ employer: 'Mesa Logistics LLC',      industry: 'Trucking',        policyNum: 'CA-2024-6610', code: '7219', expDate: '2025-05-22', premium: 67800,  status: 'expiring' },
		{ employer: 'Golden Gate Catering',    industry: 'Food Service',    policyNum: 'CA-2025-0114', code: '9082', expDate: '2026-01-10', premium: 21400,  status: 'active'   },
		{ employer: 'Harbor Tech Services',    industry: 'IT / Technology', policyNum: 'CA-2025-0892', code: '8010', expDate: '2026-03-01', premium: 14900,  status: 'audit'    },
		{ employer: 'Valley Farms Co-op',      industry: 'Agriculture',     policyNum: 'CA-2024-5501', code: '0171', expDate: '2025-06-15', premium: 38600,  status: 'expiring' },
		{ employer: 'Bay Area Plumbing',       industry: 'Construction',    policyNum: 'CA-2025-1102', code: '5183', expDate: '2026-02-20', premium: 29100,  status: 'active'   },
		{ employer: 'Redwood Retail Group',    industry: 'Retail',          policyNum: 'CA-2025-0437', code: '8017', expDate: '2026-04-01', premium: 17800,  status: 'active'   }
	];

	// ── Helpers ───────────────────────────────────────────────
	function formatDate(iso) {
		var d = new Date(iso + 'T00:00:00');
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function daysUntil(iso) {
		return (new Date(iso + 'T00:00:00') - Date.now()) / 86400000;
	}

	function expClass(iso, status) {
		if (status === 'audit') return '';
		var d = daysUntil(iso);
		if (d <= 30) return 'wc-rp__exp-red';
		if (d <= 60) return 'wc-rp__exp-amber';
		return '';
	}

	function pillClass(status) {
		if (status === 'active')   return 'wc-rp__pill--green';
		if (status === 'expiring') return 'wc-rp__pill--red';
		if (status === 'audit')    return 'wc-rp__pill--amber';
		return 'wc-rp__pill--green';
	}

	function pillLabel(status) {
		if (status === 'expiring') return 'Expiring';
		if (status === 'audit')    return 'Audit';
		return 'Active';
	}

	function fmtPremium(val) {
		return '$' + Number(val).toLocaleString('en-US');
	}

	// ── Row builder ───────────────────────────────────────────
	function buildRow(p) {
		var ec = expClass(p.expDate, p.status);
		var pc = pillClass(p.status);
		var pl = pillLabel(p.status);
		var policyUrl = '/policies/' + encodeURIComponent(p.policyNum);

		return '<tr>'
			+ '<td>'
			+   '<div class="wc-rp__employer-name">' + p.employer + '</div>'
			+   '<div class="wc-rp__employer-ind">' + p.industry + '</div>'
			+ '</td>'
			+ '<td class="wc-rp__mono">' + p.policyNum + '</td>'
			+ '<td class="wc-rp__mono">' + p.code + '</td>'
			+ '<td class="' + ec + '">' + formatDate(p.expDate) + '</td>'
			+ '<td class="wc-rp__premium">' + fmtPremium(p.premium) + '</td>'
			+ '<td><span class="wc-rp__pill ' + pc + '"><span class="wc-rp__pill-dot"></span>' + pl + '</span></td>'
			+ '<td><div class="wc-rp__row-action"><a href="' + policyUrl + '" class="wc-rp__row-link">'
			+   '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><path d="M6 3l5 5-5 5"/></svg>'
			+ '</a></div></td>'
			+ '</tr>';
	}

	// ── Filter + sort + paginate ──────────────────────────────
	function getVisible() {
		var filtered = currentFilter === 'all'
			? allPolicies.slice()
			: allPolicies.filter(function (p) { return p.status === currentFilter; });

		filtered.sort(function (a, b) {
			var av, bv;
			if (sortCol === 'expiration') {
				av = new Date(a.expDate).getTime();
				bv = new Date(b.expDate).getTime();
			} else {
				av = a.premium;
				bv = b.premium;
			}
			return sortDir === 'asc' ? av - bv : bv - av;
		});

		return filtered;
	}

	function render() {
		var tbody    = fragmentElement.querySelector('#' + ns + '-tbody');
		var countEl  = fragmentElement.querySelector('#' + ns + '-count');
		var pageEl   = fragmentElement.querySelector('#' + ns + '-page-info');
		var prevBtn  = fragmentElement.querySelector('#' + ns + '-prev');
		var nextBtn  = fragmentElement.querySelector('#' + ns + '-next');

		var visible  = getVisible();
		var total    = visible.length;
		var totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
		currentPage  = Math.min(currentPage, totalPages);
		var start    = (currentPage - 1) * PAGE_SIZE;
		var page     = visible.slice(start, start + PAGE_SIZE);

		if (!tbody) return;

		if (page.length === 0) {
			tbody.innerHTML = '<tr><td colspan="7"><div class="wc-rp__empty">No policies match this filter.</div></td></tr>';
		} else {
			tbody.innerHTML = page.map(buildRow).join('');
		}

		if (countEl) {
			countEl.textContent = 'Showing ' + (start + 1) + '–' + Math.min(start + PAGE_SIZE, total) + ' of ' + total + ' ' + (currentFilter === 'all' ? '' : currentFilter + ' ') + 'polic' + (total === 1 ? 'y' : 'ies');
		}
		if (pageEl)  pageEl.textContent  = 'Page ' + currentPage + ' of ' + totalPages;
		if (prevBtn) prevBtn.disabled    = currentPage <= 1;
		if (nextBtn) nextBtn.disabled    = currentPage >= totalPages;
	}

	// ── Sort headers ──────────────────────────────────────────
	function bindSort() {
		['exp', 'prem'].forEach(function (key) {
			var col = key === 'exp' ? 'expiration' : 'premium';
			var btn = fragmentElement.querySelector('#' + ns + '-sort-' + key);
			if (!btn) return;
			btn.addEventListener('click', function () {
				if (sortCol === col) {
					sortDir = sortDir === 'asc' ? 'desc' : 'asc';
				} else {
					sortCol = col;
					sortDir = 'asc';
				}
				// Update icon classes
				fragmentElement.querySelectorAll('.wc-rp__sort').forEach(function (b) {
					b.classList.remove('wc-rp__sort--asc', 'wc-rp__sort--desc');
					b.querySelector('.wc-rp__sort-icon').classList.remove('wc-rp__sort-icon--active');
				});
				btn.classList.add('wc-rp__sort--' + sortDir);
				btn.querySelector('.wc-rp__sort-icon').classList.add('wc-rp__sort-icon--active');
				currentPage = 1;
				render();
			});
		});
	}

	// ── Filter buttons ────────────────────────────────────────
	function bindFilters() {
		var btns = fragmentElement.querySelectorAll('.wc-rp__filter');
		btns.forEach(function (btn) {
			btn.addEventListener('click', function () {
				btns.forEach(function (b) { b.classList.remove('wc-rp__filter--active'); });
				btn.classList.add('wc-rp__filter--active');
				currentFilter = btn.getAttribute('data-filter');
				currentPage = 1;
				render();
			});
		});
	}

	// ── Pagination buttons ────────────────────────────────────
	function bindPagination() {
		var prev = fragmentElement.querySelector('#' + ns + '-prev');
		var next = fragmentElement.querySelector('#' + ns + '-next');
		if (prev) prev.addEventListener('click', function () { if (currentPage > 1) { currentPage--; render(); } });
		if (next) next.addEventListener('click', function () { currentPage++; render(); });
	}

	// ── Data loading ──────────────────────────────────────────
	function normaliseItem(p) {
		var days = daysUntil(p.expirationDate ? p.expirationDate.substring(0, 10) : '');
		var status = (p.status || '').toLowerCase();
		if (status !== 'audit' && days <= 60) status = 'expiring';
		else if (!status || status === 'active') status = 'active';
		return {
			employer:  p.employerName  || '',
			industry:  p.industryName  || '',
			policyNum: p.policyNumber  || '',
			code:      p.classCode     || '',
			expDate:   p.expirationDate ? p.expirationDate.substring(0, 10) : '',
			premium:   Number(p.annualPremium || 0),
			status:    status
		};
	}

	function loadPolicies() {
		Liferay.Util.fetch('/o/wc-broker/v1/policies?pageSize=50&sort=expirationDate', {
			method: 'GET',
			headers: { 'x-csrf-token': Liferay.authToken }
		})
		.then(function (res) { return res.json(); })
		.then(function (data) {
			if (data.items && data.items.length) {
				allPolicies = data.items.map(normaliseItem);
			} else {
				allPolicies = STATIC;
			}
			render();
		})
		.catch(function () {
			allPolicies = STATIC;
			render();
		});
	}

	// ── Init ──────────────────────────────────────────────────
	bindSort();
	bindFilters();
	bindPagination();
	loadPolicies();
})();