(function () {
	var ns = `${fragmentEntryLinkNamespace}`;
	var SESSION_KEY = 'wc_sidebar_collapsed_' + ns;

	var wrap   = fragmentElement.querySelector('#' + ns + '-wrap');
	var toggle = fragmentElement.querySelector('#' + ns + '-toggle');

	// ── State helpers ─────────────────────────────────────────
	function isCollapsed() {
		try { return sessionStorage.getItem(SESSION_KEY) === 'true'; }
		catch (e) { return false; }
	}

	function applyState(collapsed, animate) {
		if (!animate) {
			var sidebar = wrap.querySelector('.wc-sidebar');
			sidebar.style.transition = 'none';
			void sidebar.offsetWidth;
		}

		if (collapsed) {
			wrap.classList.add('wc-sidebar-wrap--collapsed');
			toggle.setAttribute('aria-label', 'Expand navigation');
			toggle.setAttribute('aria-expanded', 'false');
			toggle.setAttribute('title', 'Expand navigation');
		} else {
			wrap.classList.remove('wc-sidebar-wrap--collapsed');
			toggle.setAttribute('aria-label', 'Collapse navigation');
			toggle.setAttribute('aria-expanded', 'true');
			toggle.setAttribute('title', 'Collapse navigation');
		}

		if (!animate) {
			requestAnimationFrame(function () {
				var sidebar = wrap.querySelector('.wc-sidebar');
				sidebar.style.transition = '';
			});
		}
	}

	function saveState(collapsed) {
		try { sessionStorage.setItem(SESSION_KEY, collapsed ? 'true' : 'false'); }
		catch (e) {}
	}

	// ── Toggle click ──────────────────────────────────────────
	toggle.addEventListener('click', function () {
		var nowCollapsed = !wrap.classList.contains('wc-sidebar-wrap--collapsed');
		applyState(nowCollapsed, true);
		saveState(nowCollapsed);
	});

	// ── Active item ───────────────────────────────────────────
	function setActiveItem() {
		var currentPath = window.location.pathname;
		fragmentElement.querySelectorAll('.wc-sidebar__item').forEach(function (item) {
			item.classList.remove('wc-sidebar__item--active');
			var href = item.getAttribute('href') || '';
			if (href && (currentPath === href || currentPath.startsWith(href + '/'))) {
				item.classList.add('wc-sidebar__item--active');
			}
		});
	}

	// ── Broker info ───────────────────────────────────────────
	function renderBrokerInfo() {
		var nameEl = fragmentElement.querySelector('#' + ns + '-broker-name');
		var avEl   = fragmentElement.querySelector('#' + ns + '-broker-av');
		var coEl   = fragmentElement.querySelector('#' + ns + '-broker-co');
		var fullName = (Liferay.ThemeDisplay.getUserName && Liferay.ThemeDisplay.getUserName()) || '';
		if (fullName && nameEl) {
			nameEl.textContent = fullName;
			if (avEl) {
				var parts = fullName.trim().split(' ');
				avEl.textContent = (parts.length >= 2
					? parts[0][0] + parts[parts.length - 1][0]
					: parts[0].substring(0, 2)).toUpperCase();
			}
		}
	}

	// ── Init ──────────────────────────────────────────────────
	applyState(isCollapsed(), false);
	setActiveItem();
	renderBrokerInfo();
})();