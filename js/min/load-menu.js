/**
 * Load shared menu content from external file
 * Automatically detects if page is at root or subdirectory level
 *
 * The fetched menu HTML is cached in sessionStorage so that on every
 * page after the first, the menu is injected synchronously BEFORE the
 * first paint - no empty-sidebar flash during page transitions.
 */
(function() {
    // ------------------------------------------------------------------
    // Transition fallback for browsers where cross-document View
    // Transitions do not actually run (e.g. Arc), despite Chromium UA.
    // Detection: the pagereveal event carries e.viewTransition when the
    // native transition activated - remember that per session.
    // Fallback: quick fade-out before menu navigation + fade-in on load,
    // so the unavoidable blank frame reads as an intentional fade.
    // ------------------------------------------------------------------
    var docEl = document.documentElement;
    var vtNative = false;
    try { vtNative = sessionStorage.getItem('vt-native') === '1'; } catch (e) {}

    // pageswap fires on the OLD page when leaving - by then this listener
    // is long registered (pagereveal on the new page can fire before
    // body-end scripts run, so it is unreliable for detection)
    function markNative(e) {
        if (e.viewTransition) {
            try { sessionStorage.setItem('vt-native', '1'); } catch (err) {}
        }
    }
    window.addEventListener('pageswap', markNative);
    window.addEventListener('pagereveal', markNative);

    // Always restore visibility (also covers bfcache back/forward restores)
    window.addEventListener('pageshow', function () {
        docEl.style.opacity = '1';
    });

    if (!vtNative) {
        // Enter fade
        docEl.style.opacity = '0';
        requestAnimationFrame(function () {
            docEl.style.transition = 'opacity 0.18s ease';
            docEl.style.opacity = '1';
            setTimeout(function () { docEl.style.transition = ''; }, 300);
        });

        // Exit fade on sidebar menu navigation (menu links only - the
        // works grid is handled by its own SPA router)
        document.addEventListener('click', function (e) {
            if (e.defaultPrevented || e.button !== 0 ||
                e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            var a = e.target && e.target.closest ? e.target.closest('#menu a[href]') : null;
            if (!a || a.origin !== window.location.origin) return;
            e.preventDefault();
            docEl.style.transition = 'opacity 0.15s ease';
            docEl.style.opacity = '0';
            setTimeout(function () { window.location.href = a.href; }, 160);
        });
    }

    // Prefetch same-site pages on link hover (Speculation Rules API)
    // so navigations start with the next page already loaded
    if (window.HTMLScriptElement && HTMLScriptElement.supports &&
        HTMLScriptElement.supports('speculationrules')) {
        const spec = document.createElement('script');
        spec.type = 'speculationrules';
        spec.textContent = JSON.stringify({
            prefetch: [{
                source: 'document',
                where: { href_matches: '/*' },
                eagerness: 'moderate'
            }]
        });
        document.head.appendChild(spec);
    }

    // Detect if we're at root level or in a subdirectory.
    // Must not use endsWith('/index.html'): that matched /<subdir>/index.html too,
    // so such a page fetched ./includes/menu-content.html and 404'd, losing the
    // whole sidebar. That is what happened to the (now removed) /cv/ page.
    const path_ = window.location.pathname;
    const isRootLevel = path_ === '/' || path_ === '/index.html' || !path_.includes('/');

    // Determine current page for highlighting active menu item
    const path = window.location.pathname;
    let currentPage = 'index';

    if (path.includes('/about/')) currentPage = 'about';
    else if (path.includes('/works/')) currentPage = 'works';
    else if (path.includes('/contact/')) currentPage = 'contact';
    else if (path.includes('/portfolio/')) currentPage = 'portfolio';

    // Bump the version suffix whenever includes/menu-content.html changes
    // so cached copies from earlier in the session are discarded
    const MENU_CACHE_KEY = 'menu-html-cache-v4';

    function renderMenu(html) {
        const menuDiv = document.getElementById('menu');
        if (!menuDiv) {
            console.error('Menu container (#menu) not found');
            return;
        }

        // Insert menu content
        const wrapper = document.createElement('div');
        menuDiv.appendChild(wrapper);
        wrapper.innerHTML = html;

        // Fix href attributes based on page level
        const links = menuDiv.querySelectorAll('[data-href-root], [data-href-sub]');
        links.forEach(link => {
            const href = isRootLevel ?
                link.getAttribute('data-href-root') :
                link.getAttribute('data-href-sub');

            if (href) {
                link.setAttribute('href', href);
            }
        });

        // Highlight current page (disable link, mark with .current + aria-current)
        const currentLink = menuDiv.querySelector(`[data-page="${currentPage}"]`);
        if (currentLink) {
            // Remove href to disable link
            currentLink.removeAttribute('href');
            currentLink.classList.add('current');
            currentLink.setAttribute('aria-current', 'page');
        }
    }

    // Cached menu: inject synchronously (before first paint, no flash)
    let cachedMenu = null;
    try {
        cachedMenu = sessionStorage.getItem(MENU_CACHE_KEY);
    } catch (e) {
        // sessionStorage unavailable - fall through to fetch
    }

    if (cachedMenu) {
        renderMenu(cachedMenu);
        return;
    }

    // First page of the session: fetch, render, and cache
    const menuPath = isRootLevel ? './includes/menu-content.html' : '../includes/menu-content.html';

    fetch(menuPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load menu: ' + response.status);
            }
            return response.text();
        })
        .then(html => {
            try {
                sessionStorage.setItem(MENU_CACHE_KEY, html);
            } catch (e) {
                // Cache failure is fine - menu still renders
            }
            renderMenu(html);
        })
        .catch(error => {
            console.error('Error loading menu:', error);
            // Fallback: show basic menu
            const menuDiv = document.getElementById('menu');
            if (menuDiv) {
                menuDiv.innerHTML = '<div><h1><a class="title" href="' +
                    (isRootLevel ? './' : '../') + 'index.html">Ryo Simon</a></h1>' +
                    '<p>Menu loading failed. Please refresh.</p></div>';
            }
        });
})();
