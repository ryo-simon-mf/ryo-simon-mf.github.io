/**
 * Load shared menu content from external file
 * Automatically detects if page is at root or subdirectory level
 *
 * The fetched menu HTML is cached in sessionStorage so that on every
 * page after the first, the menu is injected synchronously BEFORE the
 * first paint - no empty-sidebar flash during page transitions.
 */
(function() {
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

    // Detect if we're at root level or in a subdirectory
    const isRootLevel = window.location.pathname === '/' ||
                       window.location.pathname.endsWith('/index.html') ||
                       !window.location.pathname.includes('/');

    // Determine current page for highlighting active menu item
    const path = window.location.pathname;
    let currentPage = 'index';

    if (path.includes('/about/')) currentPage = 'about';
    else if (path.includes('/works/')) currentPage = 'works';
    else if (path.includes('/Gallery/')) currentPage = 'gallery';
    else if (path.includes('/contact/')) currentPage = 'contact';
    else if (path.includes('/portfolio/')) currentPage = 'portfolio';
    else if (path.includes('/cv/')) currentPage = 'cv';

    // Bump the version suffix whenever includes/menu-content.html changes
    // so cached copies from earlier in the session are discarded
    const MENU_CACHE_KEY = 'menu-html-cache-v3';

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
