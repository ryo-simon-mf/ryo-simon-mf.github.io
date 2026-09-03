/**
 * Works Page Filter Functionality
 *
 * Filters project thumbnails by category: All, Code, Object, Design
 * Vanilla JavaScript implementation (no jQuery dependency)
 *
 * Animation: concurrent cross choreography with strict stacking
 * - leaving items are lifted out of the flow (position:absolute at their
 *   current spot) and fade out in place, UNDER the live grid (z-index 1
 *   vs 2), so a cell that is re-occupied always shows its new tile on top
 * - staying items FLIP-glide axis-by-axis (horizontal leg, then vertical -
 *   never diagonally) at one fixed linear velocity: every leg's duration
 *   is its distance / MOVE_SPEED. Tiles may pass over each other while
 *   BOTH are in motion; a stationary tile is never covered
 * - entering items pop once the moves have essentially landed
 * - genre-to-genre switches route through the All arrangement first,
 *   chained on the real completion callback of the first leg
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

    function applyFilter(filterValue, onSettled) {
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
            if (onSettled) setTimeout(onSettled, 0);
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
            /* Under the live grid: when the reflowed grid puts another tile
               in this spot, the new image must win the cell */
            s.zIndex = '1';
        });

        // Entering items join the flow right away (hidden)
        entering.forEach(item => {
            resetItemStyles(item);
            item.dataset.state = 'in';
            item.style.display = 'inline-block';
            item.style.opacity = '0';
            item.style.zIndex = '2';
        });
        staying.forEach(item => {
            item.dataset.state = 'in';
            item.style.opacity = '1';
            item.style.zIndex = '2';
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
                movers.push({ item: item, dx: dx, dy: dy });
            }
        });
        entering.forEach(item => {
            item.style.transform = 'scale(0.86)';
        });

        // One fixed linear velocity for every leg of every move: a leg's
        // duration is its distance / MOVE_SPEED, so short hops are quick and
        // long hauls take proportionally longer - the switch's length varies
        // with the genre, the movement speed never does.
        const MOVE_SPEED = 7.2; // px per ms
        const LEG_GAP_MS = 30;  // beat at the corner of an L move
        const FADE_MS = 180;    // leaving fade
        const POP_MS = 220;     // entering pop
        const EASING_POP = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

        let maxMoveMs = 0;
        movers.forEach(move => {
            move.durX = move.dx ? Math.max(1, Math.round(Math.abs(move.dx) / MOVE_SPEED)) : 0;
            move.durY = move.dy ? Math.max(1, Math.round(Math.abs(move.dy) / MOVE_SPEED)) : 0;
            move.totalMs = move.durX + move.durY +
                (move.durX && move.durY ? LEG_GAP_MS : 0);
            maxMoveMs = Math.max(maxMoveMs, move.totalMs);
        });

        // Entrances begin just before the last mover lands
        const enterStart = movers.length ? Math.max(0, maxMoveMs - 80) : 40;
        const enterStagger = entering.length > 1
            ? Math.min(24, 200 / (entering.length - 1))
            : 0;
        const enterEnd = entering.length
            ? enterStart + (entering.length - 1) * enterStagger + POP_MS
            : enterStart;
        const settleMs = Math.max(FADE_MS, maxMoveMs, enterEnd);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (gen !== animGen) return; // superseded by a newer click

                // 1) Leaving items fade out in place, under the live grid
                leaveGeom.forEach(g => {
                    g.item.style.transition = 'opacity ' + FADE_MS + 'ms ease';
                    g.item.style.opacity = '0';
                });

                // 2) Staying items glide axis-by-axis: into the new column
                //    first, then into the new row - never diagonally
                movers.forEach(move => {
                    const runY = () => {
                        if (gen !== animGen) return;
                        if (move.item.dataset.state !== 'in') return;
                        move.item.style.transition = 'transform ' + move.durY + 'ms linear';
                        move.item.style.transform = '';
                    };
                    if (move.durX && move.durY) {
                        move.item.style.transition = 'transform ' + move.durX + 'ms linear';
                        move.item.style.transform = 'translate(0px, ' + move.dy + 'px)';
                        setTimeout(runY, move.durX + LEG_GAP_MS);
                    } else if (move.durX) {
                        move.item.style.transition = 'transform ' + move.durX + 'ms linear';
                        move.item.style.transform = '';
                    } else {
                        runY();
                    }
                });

                // 3) Entering items pop once the moves have essentially landed
                entering.forEach((item, index) => {
                    setTimeout(() => {
                        if (gen !== animGen) return;
                        if (item.dataset.state !== 'in') return;
                        item.style.transition = 'opacity ' + Math.round(POP_MS * 0.8) + 'ms ease, transform ' + POP_MS + 'ms ' + EASING_POP;
                        item.style.transform = '';
                        item.style.opacity = '1';
                    }, enterStart + index * enterStagger);
                });

                // 3.5) Tail rules fade back in once the new grid has settled,
                //      and the transient stacking is cleaned up
                tailFadeInTimer = setTimeout(() => {
                    if (gen !== animGen) return;
                    tailEls.forEach(el => {
                        el.style.transition = 'opacity 0.3s ease';
                        el.style.opacity = '1';
                    });
                    imgWraps.forEach(item => {
                        if (item.dataset.state === 'in') item.style.zIndex = '';
                    });
                }, settleMs + 60);

                // 4) Cleanup: actually hide leaving items once faded,
                //    unless a quicker filter switch brought them back
                setTimeout(() => {
                    if (gen !== animGen) return;
                    leaveGeom.forEach(g => {
                        if (g.item.dataset.state !== 'leaving') return;
                        resetItemStyles(g.item);
                        g.item.dataset.state = 'out';
                        g.item.style.display = 'none';
                        g.item.style.opacity = '0';
                    });
                }, FADE_MS + 80);

                // Real completion signal for the via-All sequencer
                if (onSettled) {
                    setTimeout(() => {
                        if (gen !== animGen) return;
                        onSettled();
                    }, settleMs + 20);
                }
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

    // Genre-to-genre switches share no tiles, so a direct switch reads as
    // "everything vanishes, everything pops". Route them through the All
    // arrangement instead: expand to All, a beat, then collapse into the
    // chosen genre. Chained on the real completion callback, never a timing
    // estimate, so the collapse cannot start mid-expansion.
    let currentFilter = 'all';
    let phase2Timer = null;
    const PHASE_HOLD_MS = 150;

    function transitionFilter(filterValue) {
        const from = currentFilter;
        currentFilter = filterValue;
        if (phase2Timer) {
            clearTimeout(phase2Timer);
            phase2Timer = null;
        }
        const viaAll = !prefersReducedMotion &&
            from !== 'all' && filterValue !== 'all' && from !== filterValue;
        if (!viaAll) {
            applyFilter(filterValue);
            return;
        }
        applyFilter('all', () => {
            if (currentFilter !== filterValue) return;
            phase2Timer = setTimeout(() => {
                phase2Timer = null;
                if (currentFilter !== filterValue) return;
                applyFilter(filterValue);
            }, PHASE_HOLD_MS);
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterValue = this.getAttribute('data-filter');
            setActiveButton(filterValue);
            transitionFilter(filterValue);
            updateFilterCount(filterValue);
            syncUrl(filterValue);
        });
    });

    // Restore a filter passed in the URL. Applied through the reduced-motion
    // path so the grid is simply in the right state on arrival, rather than
    // playing a switch animation against the page's own reveal cascade.
    const requested = new URLSearchParams(window.location.search).get('filter');
    if (requested && FILTERS.includes(requested) && requested !== 'all') {
        currentFilter = requested;
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
