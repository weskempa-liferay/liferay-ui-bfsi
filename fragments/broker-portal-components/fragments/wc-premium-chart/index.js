(function () {
	var ns = `${fragmentEntryLinkNamespace}`;

	var COLORS = ['#0071e3', '#6d4fc9', '#b45309', '#00875a', '#8892a8'];

	function formatK(val) {
		if (val >= 1000000) return '$' + (val / 1000000).toFixed(1) + 'M';
		if (val >= 1000) return '$' + Math.round(val / 1000) + 'K';
		return '$' + val;
	}

	function renderBars(industries) {
		var container = fragmentElement.querySelector('#' + ns + '-bar-chart');
		if (!container || !industries.length) return;
		var max = Math.max.apply(null, industries.map(function (i) { return i.premium; }));
		container.innerHTML = industries.map(function (ind, idx) {
			var pct = max > 0 ? Math.round((ind.premium / max) * 100) : 0;
			return '<div class="wc-bar__row">'
				+ '<div class="wc-bar__label">' + ind.name + '</div>'
				+ '<div class="wc-bar__track"><div class="wc-bar__fill" style="width:' + pct + '%;background:' + (COLORS[idx % COLORS.length]) + '"></div></div>'
				+ '<div class="wc-bar__value">' + formatK(ind.premium) + '</div>'
				+ '</div>';
		}).join('');
	}

	function loadPremiumData() {
		Liferay.Util.fetch('/o/wc-broker/v1/metrics/premium-by-industry', {
			method: 'GET',
			headers: { 'x-csrf-token': Liferay.authToken }
		})
		.then(function (res) { return res.json(); })
		.then(function (data) {
			if (data.items && data.items.length) renderBars(data.items);
		})
		.catch(function () {});
	}

	loadPremiumData();
})();