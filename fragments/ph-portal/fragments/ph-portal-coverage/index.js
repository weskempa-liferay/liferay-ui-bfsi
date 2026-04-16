(function () {
  var namespace = fragmentNamespace;
  var wrap = fragmentElement.querySelector('#' + namespace + '-coverage');
  function el(id) { return fragmentElement.querySelector('#' + namespace + '-' + id); }

  var PH_MOCK_COVERAGE = {
    'WC-2024-00391': {
      liabilityLines: [
        'Bodily injury by accident: <strong>$1,000,000</strong> each accident',
        'Bodily injury by disease: <strong>$1,000,000</strong> policy limit',
        'Bodily injury by disease: <strong>$1,000,000</strong> each employee'
      ],
      classifications: ['5403 \u2014 Carpentry', '5645 \u2014 Framing', '5506 \u2014 Street paving', '8742 \u2014 Clerical'],
      facts: [
        ['State',          'California'],
        ['X-Mod',          '0.88 (favorable)'],
        ['Est. payroll',   '$680,000'],
        ['No. employees',  '14'],
        ['Open claims',    '0'],
        ['Effective',      'Feb 10, 2024'],
        ['Expires',        'Feb 10, 2027']
      ]
    },
    'WC-2024-00841': {
      liabilityLines: [
        'Bodily injury by accident: <strong>$1,000,000</strong> each accident',
        'Bodily injury by disease: <strong>$1,000,000</strong> policy limit',
        'Bodily injury by disease: <strong>$1,000,000</strong> each employee'
      ],
      classifications: ['5551 \u2014 Roofing', '8742 \u2014 Clerical'],
      facts: [
        ['State',         'California'],
        ['X-Mod',         '0.95 (favorable)'],
        ['Est. payroll',  '$320,000'],
        ['No. employees', '8'],
        ['Open claims',   '0'],
        ['Effective',     'Apr 15, 2024'],
        ['Expires',       'Apr 15, 2025']
      ]
    },
    'WC-2023-00991': {
      liabilityLines: [
        'Bodily injury by accident: <strong>$1,000,000</strong> each accident',
        'Bodily injury by disease: <strong>$1,000,000</strong> policy limit',
        'Bodily injury by disease: <strong>$1,000,000</strong> each employee'
      ],
      classifications: ['7380 \u2014 Chauffeurs', '8742 \u2014 Clerical'],
      facts: [
        ['State',         'California'],
        ['X-Mod',         '1.12 (above avg)'],
        ['Est. payroll',  '$880,000'],
        ['No. employees', '22'],
        ['Open claims',   '1'],
        ['Effective',     'Jul 10, 2023'],
        ['Expires',       'Jul 10, 2025']
      ]
    }
  };

  function getPolicyId() {
    try { return new URLSearchParams(window.location.search).get('policyId') || 'WC-2024-00391'; } catch(e) { return 'WC-2024-00391'; }
  }

  function render(policyId) {
    var d = PH_MOCK_COVERAGE[policyId] || PH_MOCK_COVERAGE['WC-2024-00391'];

    var liabEl = el('employers-liability');
    if (liabEl) liabEl.innerHTML = d.liabilityLines.join('<br>');

    var classEl = el('classifications');
    if (classEl) {
      classEl.innerHTML = d.classifications.map(function (c) {
        return '<span class="phpc-class-tag">' + c + '</span>';
      }).join('');
    }

    var factsEl = el('facts-rows');
    if (factsEl) {
      factsEl.innerHTML = d.facts.map(function (r, i) {
        var last = i === d.facts.length - 1 ? ' style="border-bottom:none"' : '';
        return '<div class="phpc-fact-row"' + last + '><span class="phpc-fact-label">' + r[0] + '</span><span style="font-weight:500">' + r[1] + '</span></div>';
      }).join('');
    }
  }

  function show() { if (wrap) wrap.className = 'phpc-wrap phpc-wrap--visible'; }
  function hide() { if (wrap) wrap.className = 'phpc-wrap'; }

  Liferay.on('php:tab-change',    function (e) { e && e.tab === 'coverage' ? show() : hide(); });
  Liferay.on('php:policy-loaded', function (e) { if (e && e.policy) render(e.policy.policy || getPolicyId()); });

  render(getPolicyId());
  hide();
})();