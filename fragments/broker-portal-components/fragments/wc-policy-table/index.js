(function () {
	var ns = `${fragmentEntryLinkNamespace}`;

	var STATIC_POLICIES = [
		{ employer: 'Pacific Builders Co.', industry: 'Construction', policyNum: 'CA-2024-8847', code: '5645', expDate: 'Apr 30, 2025', expClass: 'wc-table__exp-red', premium: '$48,200', status: 'Expiring', statusClass: 'wc-pill--red' },
		{ employer: 'Sunrise Health Staffing', industry: 'Healthcare', policyNum: 'CA-2024-7293', code: '8835', expDate: 'Aug 15, 2025', expClass: '', premium: '$112,500', status: 'Active', statusClass: 'wc-pill--green' },
		{ employer: 'Mesa Logistics LLC', industry: 'Trucking / Freight', policyNum: 'CA-2024-6610', code: '7219', expDate: 'May 22, 2025', expClass: 'wc-table__exp-amber', premium: '$67,800', status: 'Expiring', statusClass: 'wc-pill--red' },
		{ employer: 'Golden Gate Catering', industry: 'Food Service', policyNum: 'CA-2025-0114', code: '9082', expDate: 'Jan 10, 2026', expClass: '', premium: '$21,400', status: 'Active', statusClass: 'wc-pill--green' },
		{ employer: 'Harbor Tech Services', industry: 'IT / Technology', policyNum: 'CA-2025-0892', code: '8010', expDate: 'Mar 1, 2026', expClass: '', premium: '$14,900', status: 'Audit', statusClass: 'wc-pill--amber' }
	];

	function buildRow(p) {
		return '<tr>'
			+ '<td><div class="wc-table__employer-name">' + p.employer + '</div>'
			+ '<div class="wc-table__employer-ind">' + p.industry + '</div></td>'
			+ '<td class="wc-table__mono">' + p.policyNum + '</td>'
			+ '<td class="wc-table__mono">' + p.code + '</td>'
			+ '<td class="' + p.expClass + '">' + p.expDate + '</td>'
			+ '<td class="wc-table__premium">' + p.premium + '</td>'
			+ '<td><span class="wc-pill ' + p.statusClass + '"><span class="wc-pill__dot"></span>' + p.status + '</span></td>'
			+ '</tr>';
	}

	function renderPolicies(policies) {
		var tbody = fragmentElement.querySelector('#' + ns + '-tbody');
		if (!tbody) return;
		tbody.innerHTML = policies.map(buildRow).join('');
	}

	function formatDate(isoStr) {
		var d = new Date(isoStr);
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function classifyExpiry(isoStr, statusStr) {
		if (statusStr && statusStr.toLowerCase() === 'audit') return { label: 'Audit', cls: 'wc-pill--amber', expCls: '' };
		if (statusStr && statusStr.toLowerCase() === 'active') {
			var daysLeft = (new Date(isoStr) - Date.now()) / 86400000;
			if (daysLeft <= 30) return { label: 'Expiring', cls: 'wc-pill--red', expCls: 'wc-table__exp-red' };
			if (daysLeft <= 60) return { label: 'Expiring', cls: 'wc-pill--red', expCls: 'wc-table__exp-amber' };
			return { label: 'Active', cls: 'wc-pill--green', expCls: '' };
		}
		return { label: statusStr || 'Active', cls: 'wc-pill--green', expCls: '' };
	}

	function loadPolicies() {
		Liferay.Util.fetch('/o/wc-broker/v1/policies?pageSize=5&sort=expirationDate', {
			method: 'GET',
			headers: { 'x-csrf-token': Liferay.authToken }
		})
		.then(function (res) { return res.json(); })
		.then(function (data) {
			var items = (data.items || []).map(function (p) {
				var expInfo = classifyExpiry(p.expirationDate, p.status);
				return {
					employer: p.employerName || '',
					industry: p.industryName || '',
					policyNum: p.policyNumber || '',
					code: p.classCode || '',
					expDate: formatDate(p.expirationDate),
					expClass: expInfo.expCls,
					premium: '$' + Number(p.annualPremium || 0).toLocaleString(),
					status: expInfo.label,
					statusClass: expInfo.cls
				};
			});
			if (items.length) renderPolicies(items);
			else renderPolicies(STATIC_POLICIES);
		})
		.catch(function () {
			renderPolicies(STATIC_POLICIES);
		});
	}

	loadPolicies();
})();