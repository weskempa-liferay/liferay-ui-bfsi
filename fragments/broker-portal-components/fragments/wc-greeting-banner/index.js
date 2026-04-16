(function () {
	var ns = `${fragmentEntryLinkNamespace}`;

	function getGreeting() {
		var hour = new Date().getHours();
		if (hour < 12) return 'Good morning';
		if (hour < 17) return 'Good afternoon';
		return 'Good evening';
	}

	function formatDate() {
		var d = new Date();
		var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		return days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
	}

	function renderGreeting() {
		var titleEl = fragmentElement.querySelector('#' + ns + '-title');
		var dateEl  = fragmentElement.querySelector('#' + ns + '-date');

		var fullName = (Liferay.ThemeDisplay.getUserName && Liferay.ThemeDisplay.getUserName()) || '';
		var firstName = fullName ? fullName.trim().split(' ')[0] : '';
		var greeting = getGreeting();

		if (titleEl) {
			titleEl.textContent = firstName ? greeting + ', ' + firstName : greeting;
		}

		if (dateEl) {
			dateEl.textContent = formatDate();
		}
	}

	function bindExport() {
		var btn = fragmentElement.querySelector('#' + ns + '-export');
		if (!btn) return;
		btn.addEventListener('click', function () {
			Liferay.fire('wc:exportDashboard');
		});
	}

	renderGreeting();
	bindExport();
})();