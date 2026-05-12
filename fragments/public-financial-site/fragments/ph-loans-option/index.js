if (fragmentElement) {
    const titleElement = fragmentElement.querySelector('.ph-loan-option__title');

    if (titleElement) {
        const updateIcon = () => {
            const title = titleElement.innerText.toLowerCase();
            let iconType = 'personal';

            if (title.includes('auto') || title.includes('car')) {
                iconType = 'auto';
            } else if (title.includes('home') || title.includes('house') || title.includes('mortgage')) {
                iconType = 'home';
            }

            fragmentElement.setAttribute('data-icon-type', iconType);
        };

        // Initial check
        updateIcon();

        // Observe changes for live editing
        const observer = new MutationObserver(updateIcon);
        observer.observe(titleElement, { characterData: true, childList: true, subtree: true });
    }
}
