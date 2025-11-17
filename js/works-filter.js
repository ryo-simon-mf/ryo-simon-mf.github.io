/**
 * Works Page Filter Functionality
 *
 * Filters project thumbnails by category: All, Code, Object, Design
 * Vanilla JavaScript implementation (no jQuery dependency)
 */

document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const imgWraps = document.querySelectorAll('.img_wrap');

    // Filter button click handler
    filterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor behavior

            const filterValue = this.getAttribute('data-filter');

            // Update active state on filter buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Show/hide projects based on filter with fade animation
            imgWraps.forEach(item => {
                // Fade out
                item.style.opacity = '0';

                setTimeout(() => {
                    if (filterValue === 'all') {
                        // Show all projects
                        item.style.display = 'inline-block';
                        // Trigger reflow for animation
                        item.offsetHeight;
                        item.style.opacity = '1';
                    } else {
                        // Show only matching category
                        const itemCategory = item.getAttribute('data-category');
                        if (itemCategory === filterValue) {
                            item.style.display = 'inline-block';
                            // Trigger reflow for animation
                            item.offsetHeight;
                            item.style.opacity = '1';
                        } else {
                            item.style.display = 'none';
                        }
                    }
                }, 400);
            });
        });
    });

    // Set "All" as active by default
    const allButton = document.querySelector('.filter-btn[data-filter="all"]');
    if (allButton) {
        allButton.classList.add('active');
    }
});
