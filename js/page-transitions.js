/**
 * Page Transition Script
 * Adds smooth fade-out effect to #content when clicking internal links
 * Menu (#menu) remains static for better UX
 * Uses overlay to prevent white flicker during page transitions
 */

(function() {
    'use strict';

    let overlay;

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // Create overlay element
        overlay = document.createElement('div');
        overlay.id = 'page-transition-overlay';
        document.body.appendChild(overlay);

        // Get #content element
        const contentElement = document.getElementById('content');
        if (!contentElement) {
            // If no #content element, skip (e.g., on special pages)
            return;
        }

        // Get all internal links (excluding external links, anchors, and special links)
        const links = document.querySelectorAll('a[href]');

        links.forEach(function(link) {
            // Skip if:
            // - External link (starts with http:// or https:// but not our domain)
            // - Anchor link (starts with #)
            // - JavaScript link (starts with javascript:)
            // - Download link (has download attribute)
            // - Opens in new tab/window (has target="_blank")
            // - Filter links (data-filter attribute for Works page filters)
            const href = link.getAttribute('href');

            if (!href ||
                href.startsWith('#') ||
                href.startsWith('javascript:') ||
                link.hasAttribute('download') ||
                link.hasAttribute('data-filter') ||
                link.getAttribute('target') === '_blank' ||
                (href.startsWith('http') && !href.includes(window.location.hostname))) {
                return;
            }

            // Add click handler for internal navigation
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const destination = this.href;

                // Add fade-out class to #content
                contentElement.classList.add('fade-out');

                // Show overlay slightly after content starts fading (150ms)
                setTimeout(function() {
                    overlay.classList.add('active');
                }, 150);

                // Navigate after content fade completes (300ms total)
                setTimeout(function() {
                    window.location.href = destination;
                }, 300);
            });
        });
    }

    // Handle browser back/forward buttons
    window.addEventListener('pageshow', function(event) {
        // Remove fade-out class and hide overlay if user navigates back
        const contentElement = document.getElementById('content');
        if (contentElement) {
            contentElement.classList.remove('fade-out');
        }
        if (overlay) {
            overlay.classList.remove('active');
        }
    });

    // Hide overlay when page is fully loaded
    window.addEventListener('load', function() {
        if (overlay) {
            // Delay slightly to let content fade-in start
            setTimeout(function() {
                overlay.classList.remove('active');
            }, 100);
        }
    });
})();
