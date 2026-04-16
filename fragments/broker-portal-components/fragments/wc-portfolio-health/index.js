(function () {
	var ns = `${fragmentEntryLinkNamespace}`;

	function setText(id, value) {
		var el = fragmentElement.querySelector('#' + ns + '-' + id);
		if (el) el.textContent = value;
	}

	function updateDonutArc(arcClass, dashArray, dashOffset) {
		var arc = fragmentElement.querySelector('.' + arcClass);
		if (!arc) return;
		arc.setAttribute('stroke-dasharray', dashArray);
		arc.setAttribute('stroke-dashoffset', dashOffset || '0');
	}

	function renderHealth(data) {
		var total = (data.active || 0) + (data.renewing || 0) + (data.actionNeeded || 0);
		var circumference = 2 * Math.PI * 32;

		setText('donut-total', total);
		setText('legend-active', 'Active (' + data.active + ')');
		setText('legend-renewing', 'Renewing (' + data.renewing + ')');
		setText('legend-action', 'Action needed (' + data.actionNeeded + ')');

		if (total > 0) {
			var activeLen   = Math.round((data.active / total) * circumference);
			var renewingLen = Math.round((data.renewing / total) * circumference);
			var actionLen   = Math.round((data.actionNeeded / total) * circumference);
			var gap = circumference;

			updateDonutArc('wc-donut__arc--active',   activeLen + ' ' + (gap - activeLen), '0');
			updateDonutArc('wc-donut__arc--renewing',  renewingLen + ' ' + (gap - renewingLen), '-' + activeLen);
			updateDonutArc('wc-donut__arc--action',    actionLen + ' ' + (gap - actionLen), '-' + (activeLen + renewingLen));
		}

		if (data.lossRatio !== undefined) setText('loss-ratio', data.lossRatio.toFixed(1) + '%');
		if (data.retention !== undefined) setText('retention', data.retention + '%');
	}

	function loadHealth() {
		Liferay.Util.fetch('/o/wc-broker/v1/metrics/portfolio-health', {
			method: 'GET',
			headers: { 'x-csrf-token': Liferay.authToken }
		})
		.then(function (res) { return res.json(); })
		.then(function (data) {
			renderHealth(data);
		})
		.catch(function () {});
	}

	loadHealth();
})();