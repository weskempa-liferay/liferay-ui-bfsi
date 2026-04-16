(function () {
  var namespace = fragmentNamespace;
  var greetingEl = fragmentElement.querySelector(`#${namespace}-greeting`);
  var subEl = fragmentElement.querySelector(`#${namespace}-sub`);

  var userName = 'Sarah';
  if (Liferay && Liferay.ThemeDisplay && Liferay.ThemeDisplay.getUserName) {
    var full = Liferay.ThemeDisplay.getUserName();
    if (full) userName = full.split(' ')[0];
  }

  if (greetingEl) {
    greetingEl.textContent = userName + '\u2019s broker command center';
  }

  if (subEl) {
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var now = new Date();
    subEl.textContent = days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear() + ' \u2014 all figures pulled live from policy & billing systems';
  }
})();