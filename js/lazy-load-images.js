/**
 * True Lazy Loading with Intersection Observer
 * Only loads images when they enter the viewport
 * Prevents blocking during initial page load
 * Enhanced with async decoding and load throttling
 */

(function() {
  // Check if Intersection Observer is supported
  if (!('IntersectionObserver' in window)) {
    console.warn('Intersection Observer not supported, falling back to native lazy loading');
    return;
  }

  // Configuration
  const config = {
    rootMargin: '200px 0px', // Start loading earlier for smoother experience
    threshold: 0.01
  };

  // Throttling: limit concurrent image loads
  let loadingCount = 0;
  const MAX_CONCURRENT_LOADS = 3;
  const loadQueue = [];

  // Process load queue
  function processQueue() {
    while (loadingCount < MAX_CONCURRENT_LOADS && loadQueue.length > 0) {
      const img = loadQueue.shift();
      loadImage(img);
    }
  }

  // Load single image with async decoding
  function loadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src) return;

    loadingCount++;

    // Create new image for preloading with async decode
    const tempImg = new Image();
    tempImg.decoding = 'async'; // Async decode hint

    tempImg.onload = () => {
      // Use requestAnimationFrame to batch DOM updates
      requestAnimationFrame(() => {
        img.src = src;
        img.removeAttribute('data-src');
        img.classList.add('lazy-loaded');

        // Remove will-change after transition completes
        setTimeout(() => {
          img.style.willChange = 'auto';
        }, 400);

        loadingCount--;
        processQueue(); // Process next in queue
      });
    };

    tempImg.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      loadingCount--;
      processQueue();
    };

    tempImg.src = src;
  }

  // Create observer
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;

        // Add to queue instead of loading immediately
        if (img.getAttribute('data-src')) {
          loadQueue.push(img);
          observer.unobserve(img); // Stop observing
        }
      }
    });

    // Start processing queue
    processQueue();
  }, config);

  // Initialize lazy loading on DOM ready
  function initLazyLoad() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });

    console.log(`[Lazy Load] Initialized for ${lazyImages.length} images`);
  }

  // Run on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoad);
  } else {
    initLazyLoad();
  }

  // Expose re-initialization function for dynamic content (SPA)
  window.reinitLazyLoad = initLazyLoad;
})();
