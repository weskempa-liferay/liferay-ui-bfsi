(function () {
	var root = fragmentElement;

	function closeAll() {
		root.querySelectorAll('.wc-nav__item.open, .wc-icon-btn.open')
			.forEach(function (el) { el.classList.remove('open'); });
	}

	// Nav group labels — toggle on click
	root.querySelectorAll('.wc-nav__item').forEach(function (item) {
		item.querySelector('.wc-nav__label').addEventListener('click', function (e) {
			e.stopPropagation();
			var wasOpen = item.classList.contains('open');
			closeAll();
			if (!wasOpen) item.classList.add('open');
		});
	});

	// Icon buttons — toggle on click
	root.querySelectorAll('.wc-icon-btn').forEach(function (btn) {
		btn.addEventListener('click', function (e) {
			e.stopPropagation();
			var wasOpen = btn.classList.contains('open');
			closeAll();
			if (!wasOpen) btn.classList.add('open');
		});
	});

	// Close all on outside click
	document.addEventListener('click', function () { closeAll(); });
})();