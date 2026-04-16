(function () {
  var namespace = fragmentNamespace;
  var wrap = fragmentElement.querySelector('#' + namespace + '-policy');

  var BP_MOCK_POLICIES = {"WC-2024-00391":{"id":"WC-2024-00391","name":"Acme Construction LLC","fein":"74-3821059","effectiveDate":"Feb 10, 2024","expirationDate":"Feb 10, 2027","state":"California","underwriter":"M. Torres","estimatedPayroll":"$680,000","employees":14,"xmod":"0.88","classifications":["5403 \u2014 Carpentry","5645 \u2014 Framing","5506 \u2014 Street paving","8742 \u2014 Clerical"]},"WC-2024-00841":{"id":"WC-2024-00841","name":"Vega Roofing LLC","fein":"82-1093847","effectiveDate":"Apr 15, 2024","expirationDate":"Apr 15, 2025","state":"California","underwriter":"J. Kim","estimatedPayroll":"$320,000","employees":8,"xmod":"0.95","classifications":["5551 \u2014 Roofing","8742 \u2014 Clerical"]},"WC-2023-00991":{"id":"WC-2023-00991","name":"Harbor Transit LLC","fein":"61-2847301","effectiveDate":"Jul 10, 2023","expirationDate":"Jul 10, 2025","state":"California","underwriter":"M. Torres","estimatedPayroll":"$880,000","employees":22,"xmod":"1.12","classifications":["7380 \u2014 Chauffeurs","8742 \u2014 Clerical"]}};

  function getPolicyId() {
    try { return new URLSearchParams(window.location.search).get('policyId') || 'WC-2024-00391'; } catch(e) { return 'WC-2024-00391'; }
  }

  function render(policyId) {
    var p = BP_MOCK_POLICIES[policyId] || BP_MOCK_POLICIES['WC-2024-00391'];

    var rowsEl = fragmentElement.querySelector('#' + namespace + '-policy-rows');
    if (rowsEl) {
      var rows = [
        ['Policyholder', p.name],
        ['FEIN', '<span style="font-family:monospace;font-size:12px">' + p.fein + '</span>'],
        ['Policy number', '<span style="font-family:monospace;font-size:12px">' + p.id + '</span>'],
        ['Effective date', p.effectiveDate],
        ['Expiration date', '<span style="color:#854F0B;font-weight:500">' + p.expirationDate + '</span>'],
        ['State', p.state],
        ['Assigned underwriter', p.underwriter],
        ['Estimated annual payroll', p.estimatedPayroll],
        ['Number of employees', p.employees]
      ];
      rowsEl.innerHTML = rows.map(function (r) {
        return '<div class="bcp-info-row"><span class="bcp-il">' + r[0] + '</span><span>' + r[1] + '</span></div>';
      }).join('');
    }

    var xv = parseFloat(p.xmod);
    var xmodCallout = fragmentElement.querySelector('#' + namespace + '-xmod-callout');
    var xmodVal = fragmentElement.querySelector('#' + namespace + '-xmod-val');
    var xmodText = fragmentElement.querySelector('#' + namespace + '-xmod-text');
    var isFav = xv < 1;
    if (xmodCallout) xmodCallout.className = 'bcp-xmod' + (isFav ? '' : ' bcp-xmod--warn');
    if (xmodVal) {
      xmodVal.textContent = p.xmod;
      xmodVal.className = 'bcp-xmod__val' + (isFav ? '' : ' bcp-xmod__val--warn');
    }
    if (xmodText) {
      xmodText.className = 'bcp-xmod__text' + (isFav ? '' : ' bcp-xmod__text--warn');
      xmodText.innerHTML = isFav
        ? '<strong>Favorable experience modifier.</strong> Below 1.0 means loss history is better than average \u2014 a strong renewal talking point.'
        : '<strong>Above-average experience modifier.</strong> Greater than 1.0 indicates higher-than-average losses. Discuss loss control strategies at renewal.';
    }

    var classEl = fragmentElement.querySelector('#' + namespace + '-classifications');
    if (classEl) {
      classEl.innerHTML = p.classifications.map(function (c) {
        return '<span class="bcp-class-tag">' + c + '</span>';
      }).join('');
    }

    var decMeta = fragmentElement.querySelector('#' + namespace + '-dec-meta');
    //if (decMeta) decMeta.textContent = p.id + ' \u00b7 ' + p.effectiveDate.split(' ').slice(1).join(' ');
    if (decMeta) decMeta.textContent = p.id + ' \u00b7 ' + p.expirationDate.split(' ').slice(0, 2).join(' ') + ' 2026';
  }

  function show() { if (wrap) wrap.className = 'bcp-wrap bcp-wrap--visible'; }
  function hide() { if (wrap) wrap.className = 'bcp-wrap'; }

  Liferay.on('bp:tab-change', function (e) { e && e.tab === 'policy' ? show() : hide(); });
  Liferay.on('bp:client-loaded', function (e) { if (e && e.policy) render(e.policy.id); });

  render(getPolicyId());
  hide();
})();