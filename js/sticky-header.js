/**
 * Sticky Header Implementation
 *
 * Makes the page header stick to the top when scrolling.
 * Uses scroll event listener to toggle between static and fixed positioning.
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        const header = document.querySelector('.page-header');
        if (!header) {
            console.log('[Sticky Header] No .page-header found');
            return;
        }

        const content = document.getElementById('content');
        if (!content) {
            console.log('[Sticky Header] No #content found');
            return;
        }

        // Get initial position
        const headerOriginalTop = header.offsetTop;
        let isSticky = false;

        // Create placeholder to prevent content jump
        const placeholder = document.createElement('div');
        placeholder.className = 'page-header-placeholder';
        placeholder.style.display = 'none';
        header.parentNode.insertBefore(placeholder, header);

        // Get computed styles to include margins
        function getFullHeight(element) {
            const styles = window.getComputedStyle(element);
            const marginTop = parseFloat(styles.marginTop);
            const marginBottom = parseFloat(styles.marginBottom);
            return element.offsetHeight + marginTop + marginBottom;
        }

        // Handle scroll
        function handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > headerOriginalTop && !isSticky) {
                // Make sticky
                isSticky = true;

                // Set placeholder height to prevent jump (include margins)
                const fullHeight = getFullHeight(header);
                placeholder.style.height = fullHeight + 'px';
                placeholder.style.display = 'block';

                // Apply fixed positioning
                header.style.position = 'fixed';
                header.style.top = '0';
                header.style.left = content.offsetLeft + 'px';
                header.style.width = content.offsetWidth + 'px';
                header.style.zIndex = '9';
                header.classList.add('is-stuck');

            } else if (scrollTop <= headerOriginalTop && isSticky) {
                // Remove sticky
                isSticky = false;

                // Hide placeholder
                placeholder.style.display = 'none';

                // Remove fixed positioning
                header.style.position = '';
                header.style.top = '';
                header.style.left = '';
                header.style.width = '';
                header.style.zIndex = '';
                header.classList.remove('is-stuck');
            }
        }

        // Listen to scroll with throttle
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                if (isSticky) {
                    // Update width and left position on resize
                    header.style.left = content.offsetLeft + 'px';
                    header.style.width = content.offsetWidth + 'px';
                }
            }, 150);
        });

        console.log('[Sticky Header] Initialized');
    }
})();
