<#if entries?has_content>
  <style>
    .pf-faq-list {
      list-style: none;
      padding: 0;
      margin: 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .pf-faq-item {
      border-top: 1px solid #f1f5f9;
      transition: background-color 0.3s ease;
    }

    .pf-faq-item:hover {
      background-color: #fafafa;
    }

    .pf-faq-header {
      padding: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .pf-faq-question {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
      transition: color 0.3s ease;
      line-height: 1.5;
    }

    .pf-faq-item.active .pf-faq-question {
      color: #0ea5e9;
    }

    .pf-faq-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      position: relative;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Animated Plus/Minus */
    .pf-faq-icon::before,
    .pf-faq-icon::after {
      content: '';
      position: absolute;
      background-color: #94a3b8;
      border-radius: 2px;
      transition: all 0.3s ease;
    }

    /* Horizontal line */
    .pf-faq-icon::before {
      width: 100%;
      height: 2px;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }

    /* Vertical line */
    .pf-faq-icon::after {
      width: 2px;
      height: 100%;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
    }

    .pf-faq-item.active .pf-faq-icon {
      transform: rotate(180deg);
    }

    .pf-faq-item.active .pf-faq-icon::after {
      transform: translateX(-50%) rotate(90deg);
      opacity: 0;
    }

    .pf-faq-item.active .pf-faq-icon::before {
      background-color: #0ea5e9;
    }

    .pf-faq-answer-wrapper {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .pf-faq-answer {
      padding: 0 24px 24px;
      font-size: 15px;
      line-height: 1.6;
      color: #64748b;
    }
  </style>

  <ul class="pf-faq-list" id="pf-faq-${template_id}">
    <#list entries as entry>
      <li class="pf-faq-item">
        <div class="pf-faq-header">
          <p class="pf-faq-question">${entry.getTitle(locale)}</p>
          <div class="pf-faq-icon"></div>
        </div>
        <div class="pf-faq-answer-wrapper">
          <div class="pf-faq-answer">
            ${entry.getDescription(locale)}
          </div>
        </div>
      </li>
    </#list>
  </ul>

  <script>
    (function() {
      const container = document.getElementById('pf-faq-${template_id}');
      if (!container) return;

      container.addEventListener('click', function(e) {
        const header = e.target.closest('.pf-faq-header');
        if (!header) return;

        const item = header.parentElement;
        const wrapper = item.querySelector('.pf-faq-answer-wrapper');
        const isActive = item.classList.contains('active');

        // Close other items (optional, but premium feel)
        container.querySelectorAll('.pf-faq-item').forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            otherItem.querySelector('.pf-faq-answer-wrapper').style.maxHeight = '0';
          }
        });

        if (isActive) {
          item.classList.remove('active');
          wrapper.style.maxHeight = '0';
        } else {
          item.classList.add('active');
          wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
        }
      });
    })();
  </script>
</#if>