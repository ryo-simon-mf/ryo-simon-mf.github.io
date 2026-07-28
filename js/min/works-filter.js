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

    // Elements below the grid (the closing double rule): fade out during
    // a filter switch and fade back in once the new grid has settled
    const tailEls = [];
    if (container) {
        let sib = container.nextElementSibling;
        while (sib) {
            if (sib.tagName === 'HR') tailEls.push(sib);
            sib = sib.nextElementSibling;
        }
    }
    let tailFadeInTimer = null;

    // Animation generation counter: every applyFilter call bumps it, and
    // every delayed callback checks it - so timers scheduled by a previous
    // filter click can never overwrite the state of a newer one
    let animGen = 0;

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
        const gen = ++animGen;
        const matches = item => filterValue === 'all' ||
            item.getAttribute('data-category') === filterValue;

        if (prefersReducedMotion) {
            imgWraps.forEach(item => {
                resetItemStyles(item);
                item.dataset.state = matches(item) ? 'in' : 'out';
                item.style.display = matches(item) ? 'inline-block' : 'none';
                item.style.opacity = matches(item) ? '1' : '0';
            });
            if (tailFadeInTimer) clearTimeout(tailFadeInTimer);
            tailEls.forEach(el => {
                el.style.transition = 'none';
                el.style.transform = '';
                el.style.opacity = '1';
            });
            if (window.reinitLazyLoad) window.reinitLazyLoad();
            return;
        }

        // Neutralize any in-flight transforms so measurements are clean
        imgWraps.forEach(item => {
            item.style.transition = 'none';
            item.style.transform = '';
        });

        // Tail rules fade out for the duration of the switch
        if (tailFadeInTimer) clearTimeout(tailFadeInTimer);
        tailEls.forEach(el => {
            el.style.transform = '';
            el.style.transition = 'opacity 0.15s ease';
            el.style.opacity = '0';
        });

        // Classify. Items mid-departure (absolute) count as not visible.
        const leaving = [], staying = [], entering = [];
        const oldRects = new Map();
        imgWraps.forEach(item => {
            const inFlow = item.style.display !== 'none' &&
                item.style.position !== 'absolute';
            // An item still mid-entrance (opacity < 1) from a superseded
            // switch must re-enter, not be treated as already visible
            const fullyVisible = inFlow &&
                (item.style.opacity === '' || parseFloat(item.style.opacity) >= 1);
            if (inFlow) oldRects.set(item, item.getBoundingClientRect());
            if (matches(item)) {
                (fullyVisible ? staying : entering).push(item);
            } else if (inFlow) {
                leaving.push(item);
            } else {
                // Mid-departure from a superseded switch and still filtered
                // out: finalize the hide now (otherwise it would linger as
                // an invisible absolutely-positioned tile)
                resetItemStyles(item);
                item.dataset.state = 'out';
                item.style.display = 'none';
                item.style.opacity = '0';
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

        // Entering items join the flow right away (hidden)
        entering.forEach(item => {
            resetItemStyles(item);
            item.dataset.state = 'in';
            item.style.display = 'inline-block';
            item.style.opacity = '0';
        });
        staying.forEach(item => {
            item.dataset.state = 'in';
            item.style.opacity = '1';
        });

        if (window.reinitLazyLoad) window.reinitLazyLoad();

        // READ pass on the new layout: final rects of staying items
        const newRects = new Map();
        staying.forEach(item => { newRects.set(item, item.getBoundingClientRect()); });

        // WRITE pass: INVERT staying items back to their old position,
        // give entering items their slide-in offset
        const movers = [];
        staying.forEach(item => {
            const oldRect = oldRects.get(item);
            const newRect = newRects.get(item);
            const dx = oldRect.left - newRect.left;
            const dy = oldRect.top - newRect.top;
            if (dx || dy) {
                item.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
                movers.push({ item: item, dx: dx, dy: dy, oldRect: oldRect });
            }
        });
        entering.forEach(item => {
            item.style.transform = 'scale(0.86)';
        });


        const AXIS_MS = 150;      // duration of one axis move
        // Stagger between movers, capped so many movers don't stretch the
        // whole slide phase (entering items wait for it to finish)
        const STAGGER_MS = movers.length > 1
            ? Math.min(40, 140 / (movers.length - 1))
            : 0;
        // Kinetic easings: slides overshoot and snap into place,
        // entrances pop with a slight bounce, exits accelerate away
        const EASING_SNAP = 'cubic-bezier(0.3, 1.4, 0.4, 1)';
        const EASING_POP = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
        const EASING_EJECT = 'cubic-bezier(0.55, 0, 0.8, 0.2)';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (gen !== animGen) return; // superseded by a newer click

                // 1) Leaving items fade out in place (slight sink),
                //    concurrently with everything else
                leaveGeom.forEach((g, index) => {
                    setTimeout(() => {
                        if (gen !== animGen) return;
                        g.item.style.transition = 'opacity 0.22s ease, transform 0.22s ' + EASING_EJECT;
                        g.item.style.transform = 'translate(0px, 26px) scale(0.94)';
                        g.item.style.opacity = '0';
                    }, index * 15);
                });

                // 2) Staying items: axis-by-axis slide (horizontal into the
                //    new column, then vertical into the new row)
                movers.forEach((move, index) => {
                    setTimeout(() => {
                        if (gen !== animGen) return;
                        move.item.style.transition = 'transform ' + AXIS_MS + 'ms ' + EASING_SNAP;
                        if (move.dx && move.dy) {
                            move.item.style.transform = 'translate(0px, ' + move.dy + 'px)';
                            setTimeout(() => {
                                if (gen !== animGen) return;
                                move.item.style.transform = '';
                            }, AXIS_MS + 30);
                        } else {
                            move.item.style.transform = '';
                        }
                    }, index * STAGGER_MS);
                });

                // 3) Entering items: two-act structure. If tiles are sliding,
                //    wait until ALL slides have settled, then fill the empty
                //    cells one by one. With no sliding tiles (disjoint genre
                //    switch), enter right away alongside the outgoing fade.
                let slidesDone = 80;
                if (movers.length) {
                    slidesDone = 0;
                    movers.forEach((move, index) => {
                        const travel = (move.dx && move.dy) ? AXIS_MS * 2 + 30 : AXIS_MS;
                        slidesDone = Math.max(slidesDone, index * STAGGER_MS + travel);
                    });
                    // Soft crossfade between phases: entrances begin just
                    // before the last slides finish
                    slidesDone = Math.max(0, slidesDone - 130);
                }
                const enterStagger = entering.length > 1
                    ? Math.min(30, 250 / (entering.length - 1))
                    : 0;
                entering.forEach((item, index) => {
                    setTimeout(() => {
                        if (gen !== animGen) return;
                        item.style.transition = 'opacity 0.18s ease, transform 0.3s ' + EASING_POP;
                        item.style.transform = '';
                        item.style.opacity = '1';
                    }, slidesDone + index * enterStagger);
                });

                // 3.5) Tail rules fade back in once the new grid has settled
                const exitEnd = leaveGeom.length
                    ? (leaveGeom.length - 1) * 15 + 220
                    : 0;
                const enterEnd = entering.length
                    ? slidesDone + (entering.length - 1) * enterStagger + 250
                    : slidesDone;
                tailFadeInTimer = setTimeout(() => {
                    if (gen !== animGen) return;
                    tailEls.forEach(el => {
                        el.style.transition = 'opacity 0.3s ease';
                        el.style.opacity = '1';
                    });
                }, Math.max(exitEnd, enterEnd) + 60);

                // 4) Cleanup: actually hide leaving items once faded,
                //    unless a quicker filter switch brought them back
                const leaveDone = (leaveGeom.length ? (leaveGeom.length - 1) * 15 : 0) + 300;
                setTimeout(() => {
                    if (gen !== animGen) return;
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

    const FILTERS = ['all', 'code', 'object', 'design'];

    // Mark the chosen button both visually and for assistive tech. aria-pressed
    // describes a toggle's state, which is what these controls actually are.
    function setActiveButton(filterValue) {
        filterButtons.forEach(btn => {
            const on = btn.getAttribute('data-filter') === filterValue;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-pressed', String(on));
        });
    }

    // Reflect the filter in the URL so a reload or a shared link keeps it.
    // replaceState, not pushState: filtering is not a navigation, and pushing
    // would put an entry between the visitor and the page they arrived from.
    function syncUrl(filterValue) {
        if (!window.history || !history.replaceState) return;
        const url = new URL(window.location.href);
        if (filterValue === 'all') {
            url.searchParams.delete('filter');
        } else {
            url.searchParams.set('filter', filterValue);
        }
        history.replaceState(null, '', url.pathname + url.search + url.hash);
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterValue = this.getAttribute('data-filter');
            setActiveButton(filterValue);
            applyFilter(filterValue);
            updateFilterCount(filterValue);
            syncUrl(filterValue);
        });
    });

    // Restore a filter passed in the URL. Applied through the reduced-motion
    // path so the grid is simply in the right state on arrival, rather than
    // playing a switch animation against the page's own reveal cascade.
    const requested = new URLSearchParams(window.location.search).get('filter');
    if (requested && FILTERS.includes(requested) && requested !== 'all') {
        setActiveButton(requested);
        imgWraps.forEach(item => {
            const shown = item.getAttribute('data-category') === requested;
            item.dataset.state = shown ? 'in' : 'out';
            item.style.display = shown ? 'inline-block' : 'none';
        });
        if (window.reinitLazyLoad) window.reinitLazyLoad();
        updateFilterCount(requested);
    } else {
        updateFilterCount('all');
    }
});
