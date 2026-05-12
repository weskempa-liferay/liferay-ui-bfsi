if (fragmentElement) {
    const titleElement = fragmentElement.querySelector('.pf-cc-option__title');

    if (titleElement) {
        const updateCardState = () => {
            const title = titleElement.innerText.toLowerCase();
            let iconType = 'basic';

            // Reset special states
            fragmentElement.classList.remove('pf-cc-option--premium-glow');

            if (title.includes('student')) {
                iconType = 'student';
            } else if (title.includes('reward')) {
                iconType = 'rewards';
                fragmentElement.classList.add('pf-cc-option--premium-glow');
            }

            fragmentElement.setAttribute('data-icon-type', iconType);
        };

        // Initial check
        updateCardState();

        // Observe changes for live editing
        const observer = new MutationObserver(updateCardState);
        observer.observe(titleElement, { characterData: true, childList: true, subtree: true });
    }
}
