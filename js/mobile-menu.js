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

        // Create hamburger button.
        // A <label for> is only operable by pointer: the checkbox it drives is
        // display:none so it cannot be focused, and a label answers to neither
        // Enter nor Space. Expose it as a button and drive it from the keyboard
        // below. The CSS keeps working off :checked, so nothing visual changes.
        const hamburger = document.createElement('label');
        hamburger.className = 'hamburger-btn';
        hamburger.setAttribute('for', 'menu-toggle');
        hamburger.setAttribute('aria-label', 'メニューボタン');
        hamburger.setAttribute('role', 'button');
        hamburger.setAttribute('tabindex', '0');
        hamburger.setAttribute('aria-controls', 'menu');
        hamburger.setAttribute('aria-expanded', 'false');
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

        // Close menu when a menu link is clicked. Delegated to #menu
        // because the menu content is injected asynchronously by
        // load-menu.js on the first page of a session - direct listeners
        // bound at DOMContentLoaded would find no links yet.
        const menuDiv = document.getElementById('menu');
        if (menuDiv && !menuDiv.dataset.closeBound) {
            menuDiv.dataset.closeBound = '1';
            menuDiv.addEventListener('click', function(e) {
                if (e.target && e.target.closest && e.target.closest('a')) {
                    const toggle = document.getElementById('menu-toggle');
                    if (toggle) toggle.checked = false;
                }
            });
        }

        // Prevent body scroll when menu is open, and keep aria-expanded honest
        // however the menu was toggled (pointer, keyboard, or link click).
        checkbox.addEventListener('change', function() {
            document.body.style.overflow = this.checked ? 'hidden' : '';
            hamburger.setAttribute('aria-expanded', String(this.checked));
        });

        function setOpen(open) {
            if (checkbox.checked === open) return;
            checkbox.checked = open;
            // Assigning .checked in script fires no event, so tell the listener.
            checkbox.dispatchEvent(new Event('change'));
        }

        // Enter and Space activate a button; preventDefault stops Space from
        // scrolling and stops any click the browser might synthesize on the
        // label, which would toggle a second time and cancel this one out.
        hamburger.addEventListener('keydown', function(e) {
            if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
            e.preventDefault();
            setOpen(!checkbox.checked);
        });

        document.addEventListener('keydown', function(e) {
            if (e.key !== 'Escape' || !checkbox.checked) return;
            setOpen(false);
            hamburger.focus(); // don't strand focus inside the hidden menu
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
