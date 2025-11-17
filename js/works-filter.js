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
    let currentCount = 0;

    // Count works by category
    function countWorksByCategory(category) {
        if (category === 'all') {
            return imgWraps.length;
        } else {
            let count = 0;
            imgWraps.forEach(item => {
                if (item.getAttribute('data-category') === category) {
                    count++;
                }
            });
            return count;
        }
    }

    // Animate count change
    function animateCount(startValue, endValue, duration = 400) {
        const startTime = performance.now();
        const difference = endValue - startValue;

        function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(startValue + (difference * easedProgress));

            if (filterCount) {
                const workText = currentValue === 1 ? 'work' : 'works';
                filterCount.textContent = ` [${currentValue} ${workText}]`;
            }

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                currentCount = endValue;
            }
        }

        requestAnimationFrame(updateCount);
    }

    // Update filter count display with animation
    function updateFilterCount(category) {
        const newCount = countWorksByCategory(category);
        animateCount(currentCount, newCount);
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

    // Initialize count display with "All" filter
    updateFilterCount('all');
});
