(function () {
	var ns = `{fragmentEntryLinkNamespace}`;

	var ICONS = {
		renewal: '<svg viewBox="0 0 16 16" fill="none" stroke="#991b1b" stroke-width="1.5" width="13" height="13"><circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 11v.5"/></svg>',
		audit:   '<svg viewBox="0 0 16 16" fill="none" stroke="#92400e" stroke-width="1.5" width="13" height="13"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M2 6h12"/></svg>',
		payment: '<svg viewBox="0 0 16 16" fill="none" stroke="#0060c4" stroke-width="1.5" width="13" height="13"><path d="M2 12L6 8l3 3 5-6"/></svg>',
		info:    '<svg viewBox="0 0 16 16" fill="none" stroke="#8892a8" stroke-width="1.5" width="13" height="13"><circle cx="8" cy="8" r="6"/><path d="M8 7v1M8 5v.5"/></svg>'
	};

	var ICON_CLASS = { renewal: 'wc-alerts__icon--red', audit: 'wc-alerts__icon--amber', payment: 'wc-alerts__icon--blue', info: 'wc-alerts__icon--gray' };

	function formatAge(isoStr) {
		var d = new Date(isoStr);
		var diff = (Date.now() - d) / 86400000;
		if (diff < 1) return 'Today';
		if (diff < 2) return 'Yesterday';
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	function buildItem(a) {
		var type = a.alertType || 'info';
		return '<div class="wc-alerts__item">'
			+ '<div class="wc-alerts__icon ' + (ICON_CLASS[type] || ICON_CLASS.info) + '">' + (ICONS[type] || ICONS.info) + '</div>'
			+ '<div class="wc-alerts__text"><p>' + a.title + '</p><span>' + (a.subtitle || '') + '</span></div>'
			+ '<div class="wc-alerts__age">' + formatAge(a.createdDate) + '</div>'
			+ '</div>';
	}

	function loadAlerts() {
		Liferay.Util.fetch('/o/wc-broker/v1/alerts?pageSize=5', {
			method: 'GET',
			headers: { 'x-csrf-token': Liferay.authToken }
		})
		.then(function (res) { return res.json(); })
		.then(function (data) {
			var list = fragmentElement.querySelector('#' + ns + '-alerts-list');
			if (!list || !data.items || !data.items.length) return;
			list.innerHTML = data.items.map(buildItem).join('');
		})
		.catch(function () {});
	}

	function bindMarkRead() {
		var btn = fragmentElement.querySelector('#' + ns + '-mark-read');
		if (!btn) return;
		btn.addEventListener('click', function () {
			var items = fragmentElement.querySelectorAll('.wc-alerts__item');
			items.forEach(function (el) { el.classList.add('wc-alerts__item--read'); });
			Liferay.Util.fetch('/o/wc-broker/v1/alerts/mark-read', {
				method: 'POST',
				headers: { 'x-csrf-token': Liferay.authToken }
			}).catch(function () {});
		});
	}

	loadAlerts();
	bindMarkRead();
})();