(function () {
	var ns = `${fragmentEntryLinkNamespace}`;

	function setText(id, value) {
		var el = fragmentElement.querySelector('#' + ns + '-' + id);
		if (el) el.textContent = value;
	}

	function formatCurrency(val) {
		if (val >= 1000000) return '$' + (val / 1000000).toFixed(2) + 'M';
		if (val >= 1000) return '$' + (val / 1000).toFixed(0) + 'K';
		return '$' + val;
	}

	function loadMetrics() {
		Liferay.Util.fetch('/o/wc-broker/v1/metrics', {
			method: 'GET',
			headers: { 'x-csrf-token': Liferay.authToken }
		})
		.then(function (res) { return res.json(); })
		.then(function (data) {
			if (data.activePolicies !== undefined) setText('val-policies', data.activePolicies);
			if (data.totalPremiumYTD !== undefined) setText('val-premium', formatCurrency(data.totalPremiumYTD));
			if (data.expiringCount !== undefined) setText('val-expiring', data.expiringCount);
			if (data.openClaims !== undefined) setText('val-claims', data.openClaims);
		})
		.catch(function () {
			// Silently keep static placeholder values on API failure
		});
	}

	loadMetrics();
})();