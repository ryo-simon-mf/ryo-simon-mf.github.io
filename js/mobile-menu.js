/**
 * Mobile Hamburger Menu
 * Handles menu toggle and overlay click for mobile devices
 */

(function() {
    'use strict';

    // Only run on mobile devices
    function isMobile() {
        return window.innerWidth <= 767;
    }

    // Create hamburger button and menu toggle
    function createMobileMenu() {
        if (!isMobile()) return;

        // Check if already created
        if (document.getElementById('menu-toggle')) return;

        // Create checkbox for menu toggle
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'menu-toggle';
        checkbox.setAttribute('aria-label', 'メニューを開閉');

        // Create hamburger button
        const hamburger = document.createElement('label');
        hamburger.className = 'hamburger-btn';
        hamburger.setAttribute('for', 'menu-toggle');
        hamburger.setAttribute('aria-label', 'メニューボタン');
        hamburger.innerHTML = '<span></span><span></span><span></span>';

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        overlay.setAttribute('aria-hidden', 'true');

        // Close menu when overlay is clicked
        overlay.addEventListener('click', function() {
            checkbox.checked = false;
        });

        // Insert elements at the beginning of body
        document.body.insertBefore(checkbox, document.body.firstChild);
        document.body.insertBefore(hamburger, document.body.firstChild.nextSibling);
        document.body.insertBefore(overlay, document.body.firstChild.nextSibling.nextSibling);

        // Close menu when menu link is clicked
        const menuLinks = document.querySelectorAll('#menu a');
        menuLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                checkbox.checked = false;
            });
        });

        // Prevent body scroll when menu is open
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }

    // Initialize on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createMobileMenu);
    } else {
        createMobileMenu();
    }

    // Re-check on window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Remove mobile menu elements if switched to desktop
            if (!isMobile()) {
                const toggle = document.getElementById('menu-toggle');
                const hamburger = document.querySelector('.hamburger-btn');
                const overlay = document.querySelector('.menu-overlay');

                if (toggle) toggle.remove();
                if (hamburger) hamburger.remove();
                if (overlay) overlay.remove();

                // Restore body scroll
                document.body.style.overflow = '';
            } else {
                createMobileMenu();
            }
        }, 250);
    });
})();
