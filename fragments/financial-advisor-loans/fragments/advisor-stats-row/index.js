(function () {
  const namespace = fragmentNamespace;
  const root = fragmentElement;

  function el(id) { return root.querySelector('#' + namespace + '-' + id); }

  function formatCompact(num) {
    if (num >= 1000000) return '$' + (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return '$' + (num / 1000).toFixed(1) + 'K';
    return '$' + num;
  }

  function fetchStats() {
    fetch('https://webserver-lctpillarportal-prd.lfr.cloud/o/c/loanapps/', {
      headers: {
        'x-csrf-token': Liferay.authToken || '',
        'accept': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      const items = data.items || [];
      
      const activeCount = items.filter(i => i.applicationStatus === 'Active').length;
      const totalVolume = items.reduce((sum, i) => sum + (i.requestedAmount || 0), 0);
      const pendingCount = items.filter(i => i.applicationStatus === 'Underwriting').length;
      const priorityCount = items.filter(i => i.applicationStatus === 'Documentation Needed' || i.applicationStatus === 'Denied').length;

      if (el('stat-active')) el('stat-active').textContent = activeCount;
      if (el('stat-volume')) el('stat-volume').textContent = formatCompact(totalVolume);
      if (el('stat-pending')) el('stat-pending').textContent = pendingCount;
      if (el('stat-priority')) el('stat-priority').textContent = priorityCount;
    })
    .catch(err => console.error('Advisor Stats Error:', err));
  }

  fetchStats();
})();
