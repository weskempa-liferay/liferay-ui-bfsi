(function () {
	var ns = `${fragmentEntryLinkNamespace}`;
	var root = fragmentElement.querySelector('#' + ns + '-topbar');

	function renderDate() {
		var dateEl = fragmentElement.querySelector('#' + ns + '-topbar-date');
		if (!dateEl) return;
		var d = new Date();
		var opts = { month: 'short', day: 'numeric', year: 'numeric' };
		dateEl.textContent = d.toLocaleDateString('en-US', opts);
	}

	function renderAvatar() {
		var avatarEl = fragmentElement.querySelector('#' + ns + '-topbar-avatar');
		if (!avatarEl) return;
		var fullName = Liferay.ThemeDisplay.getUserName ? Liferay.ThemeDisplay.getUserName() : '';
		if (fullName) {
			var parts = fullName.trim().split(' ');
			var initials = parts.length >= 2
				? parts[0][0] + parts[parts.length - 1][0]
				: parts[0].substring(0, 2);
			avatarEl.textContent = initials.toUpperCase();
		}
	}

	renderDate();
	renderAvatar();
})();