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

    const prefersReducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Apply filter with FLIP animation:
    // - non-matching items fade out (matching ones never disappear)
    // - staying items slide from their old grid position to the new one
    // - newly appearing items fade in afterwards
    function applyFilter(filterValue) {
        const matches = item => filterValue === 'all' ||
            item.getAttribute('data-category') === filterValue;

        if (prefersReducedMotion) {
            imgWraps.forEach(item => {
                item.style.transition = 'none';
                item.style.transform = '';
                item.style.display = matches(item) ? 'inline-block' : 'none';
                item.style.opacity = '1';
            });
            if (window.reinitLazyLoad) window.reinitLazyLoad();
            return;
        }

        // Neutralize any in-flight transforms so measurements are clean
        imgWraps.forEach(item => {
            item.style.transition = 'none';
            item.style.transform = '';
        });

        // FIRST: record current positions of visible items
        const oldRects = new Map();
        const leaving = [], staying = [], entering = [];
        imgWraps.forEach(item => {
            const visible = item.style.display !== 'none';
            if (visible) oldRects.set(item, item.getBoundingClientRect());
            if (matches(item)) {
                (visible ? staying : entering).push(item);
            } else if (visible) {
                leaving.push(item);
            }
        });

        // Fade out only the non-matching items
        leaving.forEach(item => {
            item.style.transition = 'opacity 0.25s ease';
            item.style.opacity = '0';
        });

        setTimeout(() => {
            leaving.forEach(item => { item.style.display = 'none'; });
            entering.forEach(item => {
                item.style.display = 'inline-block';
                item.style.transition = 'none';
                item.style.opacity = '0';
            });

            if (window.reinitLazyLoad) window.reinitLazyLoad();

            // LAST + INVERT: offset staying items back to their old position
            staying.forEach(item => {
                const oldRect = oldRects.get(item);
                const newRect = item.getBoundingClientRect();
                const dx = oldRect.left - newRect.left;
                const dy = oldRect.top - newRect.top;
                if (dx || dy) {
                    item.style.transition = 'none';
                    item.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
                }
            });

            // PLAY: release transforms so items glide to their new spot
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    staying.forEach(item => {
                        item.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)';
                        item.style.transform = '';
                    });
                    entering.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.transition = 'opacity 0.3s ease';
                            item.style.opacity = '1';
                        }, 150 + index * 30);
                    });
                });
            });
        }, 260);
    }

    // Filter button click handler
    filterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor behavior

            const filterValue = this.getAttribute('data-filter');

            // Update active state on filter buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            applyFilter(filterValue);

            // Update count display
            updateFilterCount(filterValue);
        });
    });

    // Initialize count display with "All" filter
    updateFilterCount('all');
});
