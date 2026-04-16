if (fragmentElement) {
    const tabItems = fragmentElement.querySelectorAll('.tab-item');
    
    tabItems.forEach(item => {
        item.addEventListener('click', () => {
            tabItems.forEach(t => t.classList.remove('active'));
            item.classList.add('active');
            
            // Note: In a real Liferay environment, we might want to update
            // the main content area based on the selected tab using AJAX
            // or by showing/hiding different tab panes.
        });
    });
}