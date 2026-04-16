(function () {
  var namespace = fragmentNamespace;
  var wrap = fragmentElement.querySelector('#' + namespace + '-documents');
  function el(id) { return fragmentElement.querySelector('#' + namespace + '-' + id); }

  var DOCS = [
    { name: 'Certificate of Insurance (COI)', meta: 'Updated Feb 1, 2026 \u00b7 142 KB',      icon: 'PDF', iconType: '',    btnLabel: 'Download', btnType: 'primary' },
    { name: 'Policy declarations page',       meta: 'WC-2024-00391 \u00b7 Feb 2026 \u00b7 318 KB', icon: 'PDF', iconType: '',    btnLabel: 'Download', btnType: '' },
    { name: 'Workers\u2019 comp policy (full)', meta: 'Dec 2025 \u00b7 1.2 MB',              icon: 'PDF', iconType: '',    btnLabel: 'View',     btnType: '' },
    { name: 'Annual loss run report',         meta: '2025 \u00b7 Generated Jan 15, 2026',    icon: 'PDF', iconType: '',    btnLabel: 'Download', btnType: '' },
    { name: 'Payroll audit worksheet',        meta: 'Due June 1, 2026 \u00b7 Not yet submitted', icon: 'XLS', iconType: 'xls', btnLabel: 'Upload',   btnType: '' }
  ];

  function render() {
    var listEl = el('doc-list');
    if (!listEl) return;
    listEl.innerHTML = DOCS.map(function (d) {
      var iconClass = 'phpd-doc-icon' + (d.iconType ? ' phpd-doc-icon--' + d.iconType : '');
      var btnClass  = 'phpd-doc-btn'  + (d.btnType  ? ' phpd-doc-btn--' + d.btnType  : '');
      return '<div class="phpd-doc-row">' +
        '<div class="' + iconClass + '">' + d.icon + '</div>' +
        '<div class="phpd-doc-info"><div class="phpd-doc-name">' + d.name + '</div><div class="phpd-doc-meta">' + d.meta + '</div></div>' +
        '<button class="' + btnClass + '">' + d.btnLabel + '</button>' +
      '</div>';
    }).join('');
  }

  var reqBtn     = el('request-btn');
  var reqConfirm = el('request-confirm');
  if (reqBtn) {
    reqBtn.addEventListener('click', function () {
      if (reqConfirm) {
        reqConfirm.className = 'phpd-request-confirm phpd-request-confirm--visible';
        setTimeout(function () { reqConfirm.className = 'phpd-request-confirm'; }, 4000);
      }
    });
  }

  function show() { if (wrap) wrap.className = 'phpd-wrap phpd-wrap--visible'; }
  function hide() { if (wrap) wrap.className = 'phpd-wrap'; }

  Liferay.on('php:tab-change', function (e) { e && e.tab === 'documents' ? show() : hide(); });

  render();
  hide();
})();