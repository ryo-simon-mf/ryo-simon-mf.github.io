/**
 * Load shared menu content from external file
 * Automatically detects if page is at root or subdirectory level
 */
(function() {
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

    // Load menu content
    const menuPath = isRootLevel ? './includes/menu-content.html' : '../includes/menu-content.html';

    fetch(menuPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load menu: ' + response.status);
            }
            return response.text();
        })
        .then(html => {
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

            // Highlight current page (disable link and wrap in <s> tag)
            const currentLink = menuDiv.querySelector(`[data-page="${currentPage}"]`);
            if (currentLink) {
                // Remove href to disable link
                currentLink.removeAttribute('href');

                // If not already wrapped in <s> tag, wrap it
                if (currentLink.parentElement.tagName !== 'S') {
                    const s = document.createElement('s');
                    currentLink.parentNode.insertBefore(s, currentLink);
                    s.appendChild(currentLink);
                }
            }
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
