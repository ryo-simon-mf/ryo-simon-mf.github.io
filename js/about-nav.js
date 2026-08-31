/**
 * About Page - section navigation behavior
 *
 * 1. Tags bare-year <dt> entries (e.g. "2024") with .year-marker so
 *    css/about-nav.css can style them. Adds a class only; the CV text
 *    itself is never touched.
 * 2. Highlights the flyout link of the section currently in view
 *    (rAF-throttled scroll handler).
 */
(function () {
    'use strict';

    document.querySelectorAll('#content dt').forEach(function (dt) {
        if (/^(19|20)\d\d$/.test(dt.textContent.trim())) {
            dt.classList.add('year-marker');
        }
    });

    var links = {};
    document.querySelectorAll('.about-flyout-list a').forEach(function (a) {
        links[a.getAttribute('href').slice(1)] = a;
    });
    var headings = Array.prototype.slice.call(
        document.querySelectorAll('#content h3[id]'));
    if (!headings.length) return;

    var current = null;
    function update() {
        var id = null;
        for (var i = 0; i < headings.length; i++) {
            if (headings[i].getBoundingClientRect().top <= 160) {
                id = headings[i].id;
            }
        }
        var next = id ? links[id] : null;
        if (next === current) return;
        if (current) current.classList.remove('current');
        if (next) next.classList.add('current');
        current = next;
    }
    window.addEventListener('scroll', function () {
        window.requestAnimationFrame(update);
    }, { passive: true });
    update();
})();
