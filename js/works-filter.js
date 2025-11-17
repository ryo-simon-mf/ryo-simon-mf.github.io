/**
 * Works Page Filter Functionality
 *
 * Filters project thumbnails by category: All, Code, Object, Design
 * Vanilla JavaScript implementation (no jQuery dependency)
 */

document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const imgWraps = document.querySelectorAll('.img_wrap');
    const filterCount = document.getElementById('filter-count');

    // Update filter count display
    function updateFilterCount(filterValue) {
        let visibleCount = 0;

        if (filterValue === 'all') {
            visibleCount = imgWraps.length;
        } else {
            imgWraps.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                if (itemCategory === filterValue) {
                    visibleCount++;
                }
            });
        }

        // Update count text
        if (filterCount) {
            if (visibleCount === 0) {
                filterCount.textContent = 'No works found';
                filterCount.style.color = '#999';
            } else {
                const workText = visibleCount === 1 ? 'work' : 'works';
                filterCount.textContent = `${visibleCount} ${workText}`;
                filterCount.style.color = '#333';
            }
        }
    }

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

            // Update count display
            updateFilterCount(filterValue);
        });
    });

    // Set "All" as active by default and show initial count
    const allButton = document.querySelector('.filter-btn[data-filter="all"]');
    if (allButton) {
        allButton.classList.add('active');
        updateFilterCount('all');
    }
});
