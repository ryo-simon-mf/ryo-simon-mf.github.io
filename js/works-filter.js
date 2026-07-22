/**
 * Works Page Filter Functionality
 *
 * Filters project thumbnails by category: All, Code, Object, Design
 * Vanilla JavaScript implementation (no jQuery dependency)
 *
 * Animation: concurrent cross choreography (Isotope-style)
 * - leaving items are lifted out of the flow (position:absolute at their
 *   current spot) and fade out in place
 * - at the same time, staying items FLIP-slide axis-by-axis to their new
 *   grid position and entering items slide in
 * - the screen is never empty during a switch
 */

document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const imgWraps = document.querySelectorAll('.img_wrap');
    const filterCount = document.getElementById('filter-count');
    const container = document.querySelector('.center-container');
    let currentCount = 0;

    if (container) {
        container.style.position = 'relative';
    }

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

    // Reset every animation-related inline style except display
    function resetItemStyles(item) {
        const s = item.style;
        s.transition = 'none';
        s.transform = '';
        s.position = '';
        s.left = '';
        s.top = '';
        s.width = '';
        s.height = '';
        s.margin = '';
        s.zIndex = '';
    }

    function applyFilter(filterValue) {
        const matches = item => filterValue === 'all' ||
            item.getAttribute('data-category') === filterValue;

        if (prefersReducedMotion) {
            imgWraps.forEach(item => {
                resetItemStyles(item);
                item.dataset.state = matches(item) ? 'in' : 'out';
                item.style.display = matches(item) ? 'inline-block' : 'none';
                item.style.opacity = matches(item) ? '1' : '0';
            });
            if (window.reinitLazyLoad) window.reinitLazyLoad();
            return;
        }

        // Neutralize any in-flight transforms so measurements are clean
        imgWraps.forEach(item => {
            item.style.transition = 'none';
            item.style.transform = '';
        });

        // Classify. Items mid-departure (absolute) count as not visible.
        const leaving = [], staying = [], entering = [];
        const oldRects = new Map();
        imgWraps.forEach(item => {
            const inFlow = item.style.display !== 'none' &&
                item.style.position !== 'absolute';
            if (inFlow) oldRects.set(item, item.getBoundingClientRect());
            if (matches(item)) {
                (inFlow ? staying : entering).push(item);
            } else if (inFlow) {
                leaving.push(item);
            }
        });

        // READ first: in-flow geometry of leaving items (before any writes,
        // so earlier absolutizations cannot shift later measurements)
        const leaveGeom = leaving.map(item => ({
            item: item,
            left: item.offsetLeft,
            top: item.offsetTop,
            width: item.offsetWidth,
            height: item.offsetHeight
        }));

        // WRITE: lift leaving items out of the flow at their exact spot -
        // the remaining grid reflows underneath them immediately
        leaveGeom.forEach(g => {
            const s = g.item.style;
            g.item.dataset.state = 'leaving';
            s.position = 'absolute';
            s.left = g.left + 'px';
            s.top = g.top + 'px';
            s.width = g.width + 'px';
            s.height = g.height + 'px';
            s.margin = '0';
            s.zIndex = '2';
        });

        // Entering items join the flow right away (hidden, slightly offset)
        entering.forEach(item => {
            resetItemStyles(item);
            item.dataset.state = 'in';
            item.style.display = 'inline-block';
            item.style.opacity = '0';
            item.style.transform = 'translate(-24px, 0px)';
        });
        staying.forEach(item => { item.dataset.state = 'in'; });

        if (window.reinitLazyLoad) window.reinitLazyLoad();

        // LAST + INVERT: offset staying items back to their old position
        const movers = [];
        staying.forEach(item => {
            const oldRect = oldRects.get(item);
            const newRect = item.getBoundingClientRect();
            const dx = oldRect.left - newRect.left;
            const dy = oldRect.top - newRect.top;
            if (dx || dy) {
                item.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
                movers.push({ item: item, dx: dx, dy: dy });
            }
        });

        const AXIS_MS = 220;      // duration of one axis move
        const STAGGER_MS = 40;    // delay between each mover starting
        const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // 1) Leaving items fade out in place (slight sink),
                //    concurrently with everything else
                leaveGeom.forEach((g, index) => {
                    setTimeout(() => {
                        g.item.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                        g.item.style.transform = 'translate(0px, 10px)';
                        g.item.style.opacity = '0';
                    }, index * 15);
                });

                // 2) Staying items: axis-by-axis slide (horizontal into the
                //    new column, then vertical into the new row)
                movers.forEach((move, index) => {
                    setTimeout(() => {
                        move.item.style.transition = 'transform ' + AXIS_MS + 'ms ' + EASING;
                        if (move.dx && move.dy) {
                            move.item.style.transform = 'translate(0px, ' + move.dy + 'px)';
                            setTimeout(() => {
                                move.item.style.transform = '';
                            }, AXIS_MS + 30);
                        } else {
                            move.item.style.transform = '';
                        }
                    }, index * STAGGER_MS);
                });

                // 3) Entering items slide in concurrently (small head start
                //    for the outgoing ones, so the cross reads clearly)
                const enterStagger = entering.length > 1
                    ? Math.min(35, 350 / (entering.length - 1))
                    : 0;
                entering.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.transition = 'opacity 0.25s ease, transform 0.25s ' + EASING;
                        item.style.transform = '';
                        item.style.opacity = '1';
                    }, 80 + index * enterStagger);
                });

                // 4) Cleanup: actually hide leaving items once faded,
                //    unless a quicker filter switch brought them back
                const leaveDone = (leaveGeom.length ? (leaveGeom.length - 1) * 15 : 0) + 300;
                setTimeout(() => {
                    leaveGeom.forEach(g => {
                        if (g.item.dataset.state !== 'leaving') return;
                        resetItemStyles(g.item);
                        g.item.dataset.state = 'out';
                        g.item.style.display = 'none';
                        g.item.style.opacity = '0';
                    });
                }, leaveDone);
            });
        });
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
