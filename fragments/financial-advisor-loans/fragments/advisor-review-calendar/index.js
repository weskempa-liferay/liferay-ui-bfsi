(function () {
  const namespace = fragmentNamespace;
  const root = fragmentElement;

  function el(id) { return root.querySelector('#' + namespace + '-' + id); }

  function formatDateSmall(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function fetchReviews() {
    fetch('https://webserver-lctpillarportal-prd.lfr.cloud/o/c/loanapps/', {
      headers: {
        'x-csrf-token': Liferay.authToken || '',
        'accept': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      const items = (data.items || []).slice(0, 5); // Just show top 5 for calendar
      renderCalendar(items);
    })
    .catch(err => console.error('Advisor Calendar Error:', err));
  }

  function renderCalendar(items) {
    const list = el('calendar-list');
    if (!list) return;

    if (items.length === 0) {
      list.innerHTML = '<div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px">No upcoming reviews.</div>';
      return;
    }

    list.innerHTML = items.map(item => `
      <div class="al-calendar__item">
        <div class="al-calendar__item-left">
          <div class="al-calendar__item-name">${item.applicantFullName || 'Valued Customer'}</div>
          <div class="al-calendar__item-sub">${item.loanType || 'Personal'} Review</div>
        </div>
        <div class="al-calendar__item-date">${formatDateSmall(item.dateCreated)}</div>
      </div>
    `).join('');
  }

  fetchReviews();
})();
