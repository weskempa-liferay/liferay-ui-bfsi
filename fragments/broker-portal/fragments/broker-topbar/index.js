(function () {
  var namespace = fragmentNamespace;
  var avatarEl = fragmentElement.querySelector(`#${namespace}-avatar`);

  if (avatarEl && Liferay && Liferay.ThemeDisplay) {
    var firstName = Liferay.ThemeDisplay.getUserName ? Liferay.ThemeDisplay.getUserName() : '';
    if (firstName) {
      var parts = firstName.split(' ');
      var initials = parts.map(function (p) { return p.charAt(0).toUpperCase(); }).slice(0, 2).join('');
      avatarEl.textContent = initials;
    }
  }
})();