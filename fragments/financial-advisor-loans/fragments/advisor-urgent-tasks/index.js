(function () {
  const namespace = fragmentNamespace;
  const root = fragmentElement;

  function el(id) { return root.querySelector('#' + namespace + '-' + id); }

  function formatCompact(num) {
    if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return '$' + (num / 1000).toFixed(0) + 'K';
    return '$' + num;
  }

  function fetchTasks() {
    fetch('https://webserver-lctpillarportal-prd.lfr.cloud/o/c/loanapps/', {
      headers: {
        'x-csrf-token': Liferay.authToken || '',
        'accept': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      const items = (data.items || []).filter(i => i.applicationStatus === 'Documentation Needed' || i.applicationStatus === 'Denied');
      renderTasks(items);
    })
    .catch(err => console.error('Advisor Tasks Error:', err));
  }

  function renderTasks(items) {
    const list = el('attn-list');
    const count = el('attn-count');
    if (!list) return;

    if (count) count.textContent = items.length + ' task' + (items.length === 1 ? '' : 's');

    if (items.length === 0) {
      list.innerHTML = '<div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px">All caught up!</div>';
      return;
    }

    list.innerHTML = items.map(item => `
      <div class="al-attn__item">
        <div class="al-attn__item-left">
          <div class="al-attn__item-name">${item.applicantFullName || 'Valued Customer'}</div>
          <div class="al-attn__item-sub">${item.applicationStatus === 'Denied' ? 'Rejection Review' : 'Missing Info'}</div>
        </div>
        <div class="al-attn__item-right">
          <div class="al-attn__item-val">${formatCompact(item.requestedAmount)}</div>
        </div>
      </div>
    `).join('');
  }

  fetchTasks();
})();
