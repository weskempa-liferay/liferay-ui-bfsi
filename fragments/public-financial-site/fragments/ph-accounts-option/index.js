if (fragmentElement) {
    const titleElement = fragmentElement.querySelector('.ph-account-option__title');

    if (titleElement) {
        const updateIcon = () => {
            const title = titleElement.innerText.toLowerCase();
            let iconType = 'checking'; // Default

            if (title.includes('saving')) {
                iconType = 'savings';
            } else if (title.includes('rewards') || title.includes('invest') || title.includes('market') || title.includes('growth')) {
                iconType = 'investment';
            } else if (title.includes('basic') || title.includes('check') || title.includes('wallet')) {
                iconType = 'checking';
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
