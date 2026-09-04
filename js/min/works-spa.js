// Works SPA (Single Page Application) with Hash Routing
// V3: Individual JSON files for each work

let worksData = {}; // Will be populated from JSON files
let worksOrder = []; // Display order
let worksIndex = []; // id/title/year/category straight from index.json
let lastWorkId = null; // which work the grid was left from, to restore focus to
let currentSwiper = null;
let navGen = 0; // bumped per hash navigation; stale async work checks it and bails
let directFromGrid = false; // the open detail was entered from the grid in this
                            // document (so history.back() lands on the list)
let gridShown = false; // list view is on screen. Tracked as state because a
                       // computed-style sample of a tile misreads filtered
                       // grids (filtered-out tiles sit at opacity 0).

// Hacker-style text animation
// Characters for glitch effect (binary + symbols)
const GLITCH_CHARS = '01@#$%&*[]{}01010101><~^+=?/\\|';

/**
 * Run a callback once the page is actually on screen (load-menu.js holds it
 * back past the page-transition crossfade). Falls back to running straight
 * away if that script is missing.
 */
function onPagePresented(callback) {
  if (typeof window.whenPagePresented === 'function') {
    window.whenPagePresented(callback);
  } else {
    callback();
  }
}

// Respect the user's motion preference (text effects and cascades are
// skipped; final content is shown immediately)
const PREFERS_REDUCED_MOTION = window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Animate text transition with hacker/glitch effect
 * Type 1: Binary/Glitch (random characters converging to target)
 * @param {HTMLElement} element - Target element
 * @param {string} targetText - Text to transition to
 * @param {number} duration - Animation duration in ms (default: 800)
 */
function animateTextGlitch(element, targetText, duration = 800) {
  if (!element) return;

  if (PREFERS_REDUCED_MOTION) {
    element.textContent = targetText;
    return;
  }

  const originalText = element.textContent || '';
  const maxLength = Math.max(originalText.length, targetText.length);
  const startTime = performance.now();

  // Generate random delays for each character position (staggered effect)
  const charDelays = Array.from({ length: maxLength }, () => Math.random() * 0.5);

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    let result = '';

    for (let i = 0; i < maxLength; i++) {
      const charProgress = Math.min(Math.max((progress - charDelays[i]) / 0.5, 0), 1);

      if (charProgress < 1) {
        // Still transitioning - show random glitch character
        if (Math.random() > charProgress) {
          result += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        } else {
          // Occasionally show the target character early
          result += targetText[i] || '';
        }
      } else {
        // Transition complete for this character
        result += targetText[i] || '';
      }
    }

    element.textContent = result;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      // Ensure final text is exact
      element.textContent = targetText;
    }
  }

  requestAnimationFrame(update);
}

/**
 * Animate text transition with typewriter effect
 * Type 2: Typewriter (no delete, just type from empty)
 * @param {HTMLElement} element - Target element
 * @param {string} targetText - Text to transition to (can include HTML)
 * @param {number} duration - Animation duration in ms (default: 800)
 * @param {boolean} preserveHTML - If true, preserve HTML tags; if false, strip to plain text
 */
function animateTextTypewriter(element, targetText, duration = 800, preserveHTML = false) {
  if (!element) return;

  if (PREFERS_REDUCED_MOTION) {
    if (preserveHTML) {
      element.innerHTML = targetText;
    } else {
      element.textContent = targetText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    return;
  }

  const startTime = performance.now();

  // If preserveHTML is false, strip HTML tags for plain text animation
  const textToAnimate = preserveHTML ? targetText : targetText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Calculate characters to show based on progress
    const charsToShow = Math.floor(textToAnimate.length * progress);

    if (preserveHTML) {
      // For HTML content, use innerHTML
      element.innerHTML = textToAnimate.substring(0, charsToShow) + (progress < 1 ? '<span class="typing-cursor">▌</span>' : '');
    } else {
      // For plain text, use textContent
      element.textContent = textToAnimate.substring(0, charsToShow) + (progress < 1 ? '▌' : '');
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      // Ensure final content is exact
      if (preserveHTML) {
        element.innerHTML = targetText; // Original HTML with tags
      } else {
        element.textContent = textToAnimate;
      }
    }
  }

  requestAnimationFrame(update);
}

/**
 * Main animation dispatcher
 * @param {HTMLElement} element - Target element
 * @param {string} targetText - Text to transition to
 * @param {string} animationType - 'glitch' or 'typewriter'
 * @param {number} duration - Animation duration in ms
 */
function animateTextTransition(element, targetText, animationType = 'glitch', duration = 800) {
  if (animationType === 'typewriter') {
    animateTextTypewriter(element, targetText, duration);
  } else {
    animateTextGlitch(element, targetText, duration);
  }
}

// Loading indicator helpers (hairline bar).
// Delay gate: the bar only appears if loading takes longer than 300ms,
// so fast loads show nothing at all instead of a flash
let loadingBarDelayTimer = null;

function showLoadingSpinner() {
  const bar = document.getElementById('loading-spinner');
  if (!bar) return;
  clearTimeout(loadingBarDelayTimer);
  loadingBarDelayTimer = setTimeout(() => {
    bar.style.display = 'block';
  }, 300);
}

function hideLoadingSpinner() {
  clearTimeout(loadingBarDelayTimer);
  loadingBarDelayTimer = null;
  const bar = document.getElementById('loading-spinner');
  if (bar) {
    bar.style.display = 'none';
  }
}

// SEO meta tag helpers
function updateMetaTags(work) {
  // Update page title
  document.title = `${work.title} - Ryo Simon`;

  // Update meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && work.description) {
    // Strip HTML tags and limit to 155 characters for SEO
    const plainText = work.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const shortDesc = plainText.substring(0, 155) + (plainText.length > 155 ? '...' : '');
    metaDescription.setAttribute('content', shortDesc);
  }

  // Update OGP title
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', `${work.title} - Ryo Simon`);
  }

  // Update OGP description
  let ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription && work.description) {
    const plainText = work.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const shortDesc = plainText.substring(0, 155) + (plainText.length > 155 ? '...' : '');
    ogDescription.setAttribute('content', shortDesc);
  }

  // Update OGP image
  let ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage && work.thumbnail) {
    // Convert relative path to absolute URL
    const baseUrl = 'https://ryo-simon-mf.github.io';
    const imagePath = work.thumbnail.startsWith('http') ? work.thumbnail : `${baseUrl}/works/${work.thumbnail}`;
    ogImage.setAttribute('content', imagePath);
  }

  // Update OGP URL
  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) {
    ogUrl.setAttribute('content', `https://ryo-simon-mf.github.io/works/works.html#${work.id}`);
  }

  // Add JSON-LD structured data
  addStructuredData(work);
}

function addStructuredData(work) {
  // Remove existing structured data if present
  removeStructuredData();

  // Create JSON-LD structured data for the work
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": work.title,
    "creator": {
      "@type": "Person",
      "name": "Ryo Simon",
      "alternateName": "Ryo Nishikado",
      "url": "https://ryo-simon-mf.github.io"
    },
    "dateCreated": work.year,
    "description": work.description ? work.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '',
    "image": work.thumbnail ? `https://ryo-simon-mf.github.io/works/${work.thumbnail}` : '',
    "url": `https://ryo-simon-mf.github.io/works/works.html#${work.id}`,
    "keywords": [work.category, "interactive art", "creative coding", "media art"],
    "genre": work.category
  };

  // Add tools if available
  if (work.tools) {
    structuredData.tool = work.tools.replace(/<[^>]*>/g, ' ').trim();
  }

  // Add award if available
  if (work.award) {
    structuredData.award = work.award.replace(/<[^>]*>/g, ' ').trim();
  }

  // Create script element and append to head
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'work-structured-data';
  script.text = JSON.stringify(structuredData, null, 2);
  document.head.appendChild(script);
}

function removeStructuredData() {
  // Remove existing structured data script
  const existing = document.getElementById('work-structured-data');
  if (existing) {
    existing.remove();
  }
}

function resetMetaTags() {
  // Reset to default values
  document.title = 'Works - Ryo Simon';

  // Remove structured data when returning to list view
  removeStructuredData();

  let metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', 'Works project by Ryo Simon.');
  }

  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', 'Works - Ryo Simon');
  }

  let ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', 'Works project by Ryo Simon.');
  }

  let ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) {
    ogImage.setAttribute('content', 'https://ryo-simon-mf.github.io/image/profile/2025_icon_basic.webp');
  }

  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) {
    ogUrl.setAttribute('content', 'https://ryo-simon-mf.github.io/works/works.html');
  }
}

// Initialize SPA functionality
async function initWorksSPA() {
  try {
    // Load index.json to get work order and metadata
    const indexResponse = await fetch('../works-data/index.json');
    // A GitHub Pages 404 returns an HTML body and .json() throws a
    // useless SyntaxError - fail loudly instead
    if (!indexResponse.ok) {
      throw new Error('index.json HTTP ' + indexResponse.status);
    }
    const indexData = await indexResponse.json();

    // Handle both old and new index.json formats
    if (indexData.works) {
      // New format with metadata
      worksIndex = indexData.works;
      worksOrder = indexData.works.map(w => w.id);
      // Add year and category to thumbnails
      addMetadataToThumbnails(indexData.works);
    } else {
      // Old format (fallback)
      worksOrder = indexData.order;
    }

    // Note: JSON files are now loaded on-demand (lazy loading)
    // This reduces initial page load from 45KB to just index.json (~3KB)

    // Handle hash changes
    window.addEventListener('hashchange', handleHashChange);

    // A not-found notice is stale as soon as the visitor filters the grid
    document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', hideWorksNotice));

    // Handle initial load
    await handleHashChange();

    // Intercept thumbnail clicks
    document.querySelectorAll('.img_wrap a').forEach(link => {
      link.addEventListener('click', function(e) {
        // Let modifier-key clicks (new tab/window) fall through to the browser
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        const href = this.getAttribute('href');
        const workId = extractWorkId(href);
        window.location.hash = workId;
      });
    });

    // Warm the cache on intent: loadWork() caches into worksData, so a
    // hovered/focused thumbnail's JSON is already local when the click lands.
    // The 80ms dwell keeps a cursor sweep across the grid from firing a
    // fetch per tile it passes.
    document.querySelectorAll('.img_wrap a').forEach(link => {
      let warmTimer = null;
      const warm = () => {
        const id = extractWorkId(link.getAttribute('href'));
        if (id && worksOrder.includes(id)) loadWork(id);
      };
      link.addEventListener('pointerenter', () => {
        warmTimer = setTimeout(warm, 80);
      });
      link.addEventListener('pointerleave', () => clearTimeout(warmTimer));
      link.addEventListener('focus', warm);
    });

    // [ / ] step to the previous / next work while a detail is open
    // (arrow keys belong to Swiper's keyboard module)
    document.addEventListener('keydown', (e) => {
      if (e.repeat) return; // key-repeat would stack detail builds
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== '[' && e.key !== ']') return;
      const active = document.activeElement;
      const t = active && active.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA' || (active && active.isContentEditable)) return;
      // Single-character shortcuts stay scoped to the detail view (WCAG 2.1.4):
      // focus lands on its heading when a work opens and leaves when the
      // visitor tabs or clicks to the sidebar, so the keys cannot fire from
      // elsewhere on the page (speech input, stray key presses).
      const detail = document.getElementById('work-detail-view');
      if (!detail || !active || !detail.contains(active)) return;
      const id = window.location.hash.slice(1);
      const order = browseOrder(id);
      const i = order.indexOf(id);
      if (i === -1) return;
      const n = e.key === '[' ? i - 1 : i + 1;
      if (n >= 0 && n < order.length) window.location.hash = order[n];
    });
  } catch (error) {
    console.error('Failed to initialize Works SPA:', error);
    // Never leave the grid blank. Thumbnails ship with inline opacity:0
    // and are only revealed on SPA success; on any failure (offline, 404,
    // blocked fetch) reveal them so the page still degrades to plain links.
    document.querySelectorAll('.img_wrap').forEach(item => {
      item.style.opacity = '1';
    });
    gridShown = true;
    if (window.reinitLazyLoad) window.reinitLazyLoad();
  }
}

// Add year and category metadata to thumbnail elements
function addMetadataToThumbnails(worksMetadata) {
  worksMetadata.forEach(work => {
    // Find thumbnail by matching href
    const thumbnails = document.querySelectorAll('.img_wrap a');
    thumbnails.forEach(link => {
      const href = link.getAttribute('href');
      const workId = extractWorkId(href);
      if (workId === work.id) {
        const imgWrap = link.closest('.img_wrap');
        if (imgWrap) {
          imgWrap.setAttribute('data-year', work.year);
          imgWrap.setAttribute('data-title', work.title);
          // Category already exists, but ensure it matches
          imgWrap.setAttribute('data-category', work.category);
        }
      }
    });
  });
}

// Load a single work JSON file (lazy loading with cache)
const worksLoading = {}; // in-flight fetches, so hover-then-click shares one request

async function loadWork(workId) {
  // Return cached data if already loaded
  if (worksData[workId]) {
    return worksData[workId];
  }
  if (worksLoading[workId]) {
    return worksLoading[workId];
  }

  worksLoading[workId] = (async () => {
    try {
      const response = await fetch(`../works-data/${workId}.json`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const workData = await response.json();
      worksData[workId] = workData; // Cache for future use
      return workData;
    } catch (error) {
      console.error(`Failed to load ${workId}.json:`, error);
      return null;
    } finally {
      delete worksLoading[workId];
    }
  })();
  return worksLoading[workId];
}

/**
 * Announce a view change to screen readers. Swapping the grid for a detail view
 * changes the whole page without a navigation, so nothing would otherwise be
 * read out. The region is clipped rather than display:none -- hidden regions are
 * not announced -- so it occupies no pixels.
 */
function announce(message) {
  let region = document.getElementById('spa-live-region');
  if (!region) {
    region = document.createElement('div');
    region.id = 'spa-live-region';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.style.cssText = 'position:absolute;width:1px;height:1px;margin:-1px;' +
      'padding:0;border:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap';
    document.body.appendChild(region);
  }
  region.textContent = message;
}

/**
 * Move focus without scrolling. preventScroll matters because the caller also
 * runs its own smooth scroll to the top, and the two would fight.
 */
function focusQuietly(el) {
  if (!el) return;
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

/**
 * Thumbnail URL for a work id, read out of the grid that is already in the DOM.
 * Avoids fetching each related work's JSON just to learn its thumbnail.
 */
function thumbnailForWork(workId) {
  for (const link of document.querySelectorAll('.img_wrap a')) {
    if (extractWorkId(link.getAttribute('href')) !== workId) continue;
    const img = link.querySelector('img');
    // Before lazy-load swaps it in, the real URL still lives on data-src.
    if (img) return img.dataset.src || img.getAttribute('src');
  }
  return null;
}

/**
 * Up to `limit` works to show in the Related band: the author's own
 * cross-references first, then same-category works to fill the row.
 */
function relatedWorksFor(work, limit = 3) {
  const picked = [];
  const take = (id) => {
    if (id === work.id || picked.some(w => w.id === id)) return;
    const meta = worksIndex.find(w => w.id === id);
    if (meta) picked.push(meta);
  };
  // The prev/next arrows sit directly above the band, so a neighbour appearing
  // as a card too just repeats itself. Author-written picks still win.
  const { prev, next } = neighboursOf(work.id);
  const isNeighbour = (id) => id === prev?.id || id === next?.id;

  // work.related is a list of work ids. Older data used an HTML string; ignore
  // that shape rather than injecting it into a thumbnail card.
  if (Array.isArray(work.related)) work.related.forEach(take);

  // Fill from the same category, nearest in display order first. Display order
  // is roughly chronological, so neighbours come from the same period — and each
  // work gets a different set, instead of every code work listing the same three.
  const here = worksOrder.indexOf(work.id);
  const sameCategory = worksIndex
    .filter(w => w.category === work.category && w.id !== work.id)
    .sort((a, b) => Math.abs(worksOrder.indexOf(a.id) - here) - Math.abs(worksOrder.indexOf(b.id) - here));
  for (const candidate of sameCategory) {
    if (picked.length >= limit) break;
    if (!isNeighbour(candidate.id)) take(candidate.id);
  }
  // If skipping neighbours left the row short (tiny categories), allow them back.
  for (const candidate of sameCategory) {
    if (picked.length >= limit) break;
    take(candidate.id);
  }
  return picked.slice(0, limit);
}

/**
 * Display order narrowed to the active filter, so Prev/Next and the [ ] keys
 * never step onto a work the grid is currently hiding. A work outside the
 * filter (deep link with a mismatched ?filter=) falls back to the full order.
 */
function browseOrder(workId) {
  const active = document.querySelector('.filter-btn.active');
  const filter = active ? active.getAttribute('data-filter') : 'all';
  if (!filter || filter === 'all') return worksOrder;
  const narrowed = worksOrder.filter(id => {
    const w = worksIndex.find(x => x.id === id);
    return w && w.category === filter;
  });
  return workId && !narrowed.includes(workId) ? worksOrder : narrowed;
}

/** Prev/next neighbours in display order. Ends of the list simply have none. */
function neighboursOf(workId) {
  const order = browseOrder(workId);
  const i = order.indexOf(workId);
  const at = (n) => (n >= 0 && n < order.length ? worksIndex.find(w => w.id === order[n]) : null);
  return { prev: i > 0 ? at(i - 1) : null, next: i >= 0 ? at(i + 1) : null };
}

/** Markup for the browse strip at the foot of a work: prev/next + Related band. */
function browseStripHtml(work) {
  const { prev, next } = neighboursOf(work.id);
  const related = relatedWorksFor(work);

  const arrow = (w, dir) => {
    if (!w) return '<span class="work-nav-slot"></span>';
    const label = dir === 'prev' ? `← ${w.title}` : `${w.title} →`;
    return `<a class="work-nav-link work-nav-${dir}" href="#${w.id}" data-work-id="${w.id}">
              <span class="work-nav-title">${label}</span>
              <span class="work-nav-year">${w.year}</span>
            </a>`;
  };

  const card = (w) => {
    const thumb = thumbnailForWork(w.id);
    return `<a class="related-card" href="#${w.id}" data-work-id="${w.id}">
              ${thumb ? `<img src="${thumb}" alt="${w.title}" loading="lazy">` : '<span class="related-card-noimg"></span>'}
              <span class="related-card-year">${w.year}</span>
              <span class="related-card-title">${w.title}</span>
            </a>`;
  };

  return `
            <nav class="work-nav" aria-label="Previous and next work">
                ${arrow(prev, 'prev')}
                ${arrow(next, 'next')}
            </nav>
            ${related.length ? `<section class="related-works" aria-label="Related works">
                <h2 class="related-works-heading">Related</h2>
                <div class="related-works-grid">
                    ${related.map(card).join('')}
                </div>
            </section>` : ''}`;
}

/**
 * Work id for a thumbnail href, resolved from the `filename` field in
 * index.json. Filenames and ids differ in inconsistent ways (tSA.html ->
 * t-s-a, muses_ex_echoes.html -> muses-ex-echoes), so the pairing has to be
 * declared somewhere; index.json keeps it next to the work it describes
 * instead of in a table here that had to be edited for every new work.
 */
function extractWorkId(href) {
  const filename = href.replace('./', '');
  const match = worksIndex.find(w => w.filename === filename);
  if (match) return match.id;
  // Before index.json resolves, or for a page not listed in it, fall back to
  // the filename stem. Correct whenever the two already agree.
  return filename.replace('.html', '');
}

// Handle hash change events (async to support lazy loading)
async function handleHashChange() {
  const gen = ++navGen;
  const hash = window.location.hash.slice(1); // Remove #

  // A fragment that is not a work id but IS a real element (e.g. the skip
  // link's #content) is a plain in-page anchor: leave the current view alone
  // instead of fetching works-data/<fragment>.json and resetting to the list.
  if (hash && !worksOrder.includes(hash) && document.getElementById(hash)) {
    return;
  }

  if (hash) {
    // Show loading spinner while fetching data
    showLoadingSpinner();

    // Lazy load work data if not already cached
    const workData = await loadWork(hash);

    // A newer navigation (rapid ] presses, Back/Forward) took over while this
    // fetch was in flight: it owns the spinner and the view now.
    if (gen !== navGen) return;

    // Hide spinner after data is loaded
    hideLoadingSpinner();

    if (workData) {
      hideWorksNotice();
      directFromGrid = gridShown;
      showWorkDetail(hash);
    } else {
      // Unknown id or a failed fetch. Say so instead of silently showing the
      // grid, and drop the dead fragment so reload/share/Back do not replay it.
      const message = worksOrder.includes(hash)
        ? `作品を読み込めませんでした: ${hash}`
        : `作品が見つかりません: ${hash}`;
      history.replaceState(null, '', window.location.pathname + window.location.search);
      showWorksList(message);
      showWorksNotice(message);
    }
  } else {
    hideWorksNotice();
    showWorksList();
  }
}

/** One-line notice above the grid (terminal prompt style). */
function showWorksNotice(message) {
  let el = document.getElementById('works-notice');
  if (!el) {
    const grid = document.querySelector('.center-container');
    if (!grid || !grid.parentNode) return;
    el = document.createElement('div');
    el.id = 'works-notice';
    el.className = 'works-notice';
    grid.parentNode.insertBefore(el, grid);
  }
  el.textContent = `> ${message}`;
  el.hidden = false;
}

function hideWorksNotice() {
  const el = document.getElementById('works-notice');
  if (el) el.hidden = true;
}

// Show works list (grid view). announceMessage overrides the default
// screen-reader text, e.g. when the list is shown because a work was not found.
function showWorksList(announceMessage) {
  const gen = navGen;
  const centerContainer = document.querySelector('.center-container');
  const contentDiv = document.getElementById('content');
  const detailView = document.getElementById('work-detail-view');

  // If detail view exists, fade out images and content only (keep title/year/genre visible)
  if (detailView) {
    const swiperContainer = detailView.querySelector('.swiper-container');
    const contentInDiv = detailView.querySelector('#content_in');
    const h3Element = detailView.querySelector('h3');
    const fixedHeaderArea = detailView.querySelector('.fixed-header-area');
    // Get hrs outside fixed header only
    const hrs = Array.from(detailView.querySelectorAll('hr')).filter(hr =>
      !fixedHeaderArea || !fixedHeaderArea.contains(hr)
    );

    // Fade out images, content, and h3
    if (swiperContainer) {
      swiperContainer.style.transition = 'opacity 0.4s ease';
      swiperContainer.style.opacity = '0';
    }
    if (contentInDiv) {
      contentInDiv.style.transition = 'opacity 0.4s ease';
      contentInDiv.style.opacity = '0';
    }
    if (h3Element) {
      h3Element.style.transition = 'opacity 0.4s ease';
      h3Element.style.opacity = '0';
    }
    hrs.forEach(hr => {
      hr.style.transition = 'opacity 0.4s ease';
      hr.style.opacity = '0';
    });

    // Wait for fade out, then show list - unless a newer navigation has
    // already replaced this view, in which case removing it would tear down
    // the detail that navigation just built.
    setTimeout(() => {
      if (gen !== navGen) return;
      showWorksListAfterFadeOut();
    }, 400);
  } else {
    // No detail view, show list immediately
    showWorksListAfterFadeOut();
  }

  function showWorksListAfterFadeOut() {
    // Reset meta tags to default
    resetMetaTags();

    // Remove detail view if exists
    if (detailView) {
      detailView.remove();
    }

    // Show ALL original content elements
    const elementsToShow = contentDiv.querySelectorAll(':scope > br, :scope > h1, :scope > hr, :scope > p');
    elementsToShow.forEach(el => {
      el.style.display = 'block';
    });

    // Animate h1 back to "Works" with glitch effect.
    // Held until the page is on screen: arriving from About or Contact, the
    // page-transition crossfade used to cover the whole scramble, so the
    // heading looked static. whenPagePresented resolves immediately once the
    // crossfade is over, so returning here from a work detail is unaffected.
    const h1 = contentDiv.querySelector('h1');
    if (h1) {
      onPagePresented(() => animateTextTransition(h1, 'Works', 'glitch', 600));
    }

    // Animate filter buttons with glitch effect
    const filterP = contentDiv.querySelector('p');
    if (filterP) {
      const filterButtons = filterP.querySelectorAll('.filter-btn');
      const filterTexts = ['All', 'Code', 'Object', 'Design'];

      filterButtons.forEach((btn, index) => {
        const targetText = filterTexts[index];

        // Set initial random glitch text to make animation visible
        const glitchChars = '01@#$%&*[]{}><~^+=?/\\|';
        let initialText = '';
        for (let i = 0; i < targetText.length; i++) {
          initialText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }
        btn.textContent = initialText;

        // Animate to target text with glitch effect
        onPagePresented(() => {
          setTimeout(() => {
            animateTextGlitch(btn, targetText, 400);
          }, 100 + index * 50);
        });
      });
    }

    // Animate filter count (with badge)
    const filterCount = contentDiv.querySelector('#filter-count');
    if (filterCount) {
      // Recalculate work count based on active filter
      const activeFilter = document.querySelector('.filter-btn.active');
      const filterValue = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
      const imgWraps = document.querySelectorAll('.img_wrap');

      let workCount = 0;
      if (filterValue === 'all') {
        workCount = imgWraps.length;
      } else {
        imgWraps.forEach(item => {
          if (item.getAttribute('data-category') === filterValue) {
            workCount++;
          }
        });
      }

      const workText = workCount === 1 ? 'work' : 'works';
      const targetText = ` [${workCount} ${workText}]`;

      // Set initial random glitch text
      const glitchChars = '01@#$%&*[]{}><~^+=?/\\|';
      let initialText = '';
      for (let i = 0; i < targetText.length; i++) {
        initialText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
      }
      filterCount.textContent = initialText;

      setTimeout(() => {
        animateTextTransition(filterCount, targetText, 'glitch', 400);
      }, 300);
    }

    // Show center-container
    if (centerContainer) {
      centerContainer.style.display = 'block';
    }

    // Restore filter state - check which filter button is active
    const activeFilter = document.querySelector('.filter-btn.active');
    const filterValue = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';

    // Apply filter based on active button
    const visibleItems = [];
    document.querySelectorAll('.img_wrap').forEach(item => {
      if (filterValue === 'all') {
        // Show all thumbnails
        item.style.display = 'inline-block';
        visibleItems.push(item);
      } else {
        // Show only matching category
        const itemCategory = item.getAttribute('data-category');
        if (itemCategory === filterValue) {
          item.style.display = 'inline-block';
          visibleItems.push(item);
        } else {
          item.style.display = 'none';
        }
      }

      // Prepare for fade in
      item.style.opacity = '0';
      item.style.transition = 'opacity 0.4s ease';
      item.style.willChange = 'opacity'; // Hint to browser for optimization
    });

    // Reinitialize lazy loading for visible images
    if (window.reinitLazyLoad) {
      window.reinitLazyLoad();
    }

    // Cascade fade in (staggered) to prevent main thread blocking
    visibleItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = '1';
        // Remove will-change after animation
        setTimeout(() => {
          item.style.willChange = 'auto';
        }, 400);
      }, PREFERS_REDUCED_MOTION ? 0 : 100 + index * 30); // 30ms delay between each thumbnail
    });

    // Destroy swiper if exists
    if (currentSwiper) {
      currentSwiper.destroy(true, true);
      currentSwiper = null;
    }

    // Put focus back on the thumbnail the visitor left from, so returning to the
    // grid resumes where they were rather than at the top of the document.
    const origin = lastWorkId && Array.from(document.querySelectorAll('.img_wrap a'))
      .find(a => extractWorkId(a.getAttribute('href')) === lastWorkId);
    if (origin) origin.focus({ preventScroll: true });
    lastWorkId = null;
    announce(announceMessage || '作品一覧に戻りました');
  }
  gridShown = true;
}

// Show work detail view
function showWorkDetail(workId) {
  const work = worksData[workId];
  const contentDiv = document.getElementById('content');
  const centerContainer = document.querySelector('.center-container');

  // Update meta tags for SEO
  updateMetaTags(work);

  // Fade out all thumbnails first. On a deep link the grid was never
  // shown - there is nothing on screen to fade, so skip the wait entirely.
  const thumbnails = document.querySelectorAll('.img_wrap');
  const gridWasVisible = gridShown;
  gridShown = false;
  thumbnails.forEach(item => {
    item.style.transition = 'opacity 0.25s ease';
    item.style.opacity = '0';
  });

  setTimeout(() => {
    // Hide ALL original content elements
    const elementsToHide = contentDiv.querySelectorAll(':scope > br, :scope > h1, :scope > hr, :scope > p');
    elementsToHide.forEach(el => {
      el.style.display = 'none';
    });

    // Hide center-container
    if (centerContainer) {
      centerContainer.style.display = 'none';
    }

    // Hide all thumbnails
    thumbnails.forEach(item => {
      item.style.display = 'none';
    });

    // Create detail view after fade out
    createDetailView(work, workId);
  }, gridWasVisible ? 250 : 0);
}

// Create detail view HTML - EXACT copy of original structure
function createDetailView(work, workId) {
  const contentDiv = document.getElementById('content');

  // Work-to-work navigation (prev/next, [ ] keys) rebuilds the view without
  // passing through showWorksList, which was previously the only place the
  // old Swiper was destroyed - each hop leaked an instance with a live
  // document-level keyboard listener.
  if (currentSwiper) {
    currentSwiper.destroy(true, true);
    currentSwiper = null;
  }

  // Remove existing detail view
  const existingDetail = document.getElementById('work-detail-view');
  if (existingDetail) existingDetail.remove();

  // Create detail view container
  const detailView = document.createElement('div');
  detailView.id = 'work-detail-view';

  // Build images HTML for Swiper
  const swiperSlides = work.images.map((img, i) => `
                    <div class="swiper-slide">
                        <div class="img_w2">
                            <img src="${img}" alt="${work.title} ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}">
                        </div>
                    </div>`).join('');

  // EXACT structure from toki-shirube.html with back button added
  // Use DOMPurify to sanitize HTML and prevent XSS attacks
  // Initial values set to placeholder for animation (Works → work.title)
  detailView.innerHTML = DOMPurify.sanitize(`
            <!-- Fixed Header Area -->
            <div class="fixed-header-area">
                <h1>
                    <!-- Breadcrumb heading: Works / <title> -->
                    <a href="#" class="breadcrumb-works">Works</a><span class="breadcrumb-sep"> / </span><span class="work-title-animated"></span>
                </h1>
                <hr>
                <p class="work-header-metadata">
                    <span class="list work-year-animated">----</span> | <span class="list work-category-animated">----</span>
                </p>
            </div>

            <div class="swiper-container" style="opacity: 0;" role="region" aria-roledescription="carousel" aria-label="${work.title} images">
                <div class="swiper-wrapper">
${swiperSlides}
                </div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
            </div>
            <hr>

            <!-- Subheading　-->
            <h3>
                ${work.title}${work.reading ? ` [${work.reading}]` : ''}
            </h3>
            <div id="content_in" class="work-content-animated">
                ${work.description ? `<p>
                    ${work.description}
                </p>` : ''}

                <dl>
                ${work.performers ? `
                <dt>Performers</dt>
                <dd>
                    ${work.performers}
                </dd>
                <br>` : ''}
                ${work.credit ? `<dt>Credit</dt>
                <dd>
                    ${work.credit}
                </dd>
                <br>` : ''}
                ${work.tools ? `<dt>Tool</dt>
                <dd>
                    ${work.tools}
                </dd>
                <br>` : ''}
                ${work.exhibition ? `<dt>Exhibition</dt>
                <dd>
                    ${work.exhibition}
                </dd>
                <br>` : ''}
                ${work.award ? `<dt>Award</dt>
                <dd>
                    ${work.award}
                </dd>
                <br>` : ''}
                ${work.paper ? `<dt>Paper</dt>
                <dd>
                    ${work.paper}
                </dd>
                <br>` : ''}
                ${work.grants ? `<dt>Grants</dt>
                <dd>
                    ${work.grants}
                </dd>
                <br>` : ''}
                ${work.collaborators ? `<dt>Co-create with</dt>
                <dd>
                    ${work.collaborators}
                </dd>
                <br>` : ''}
                ${work.download ? `<dt>Download</dt>
                <dd>
                    ${work.download}
                </dd>
                <br>` : ''}
                ${work.citation ? `<dt>Citation</dt>
                <dd>
                    ${work.citation}
                </dd>
                <br>` : ''}
                ${work.link ? `<dt>Link</dt>
                <dd>
                    ${work.link}
                </dd>
                <br>` : ''}
                </dl>

            </div>
            <hr class="final-hr-1" style="opacity: 0;">
            ${browseStripHtml(work)}
            <hr class="final-hr-2" style="opacity: 0;">
            <br>
  `);

  contentDiv.appendChild(detailView);

  // fetchpriority is not in DOMPurify 3.0.6's default attribute allowlist,
  // so set it as a property after insertion instead.
  const firstSlideImg = detailView.querySelector('.swiper-slide img');
  if (firstSlideImg) firstSlideImg.fetchPriority = 'high';

  // Use glitch effect for all works (toki-shirube pattern)
  const animationType = 'glitch';

  // Animate text transitions: Works → work.title
  const titleSpan = detailView.querySelector('.work-title-animated');
  const yearSpan = detailView.querySelector('.work-year-animated');
  const categorySpan = detailView.querySelector('.work-category-animated');

  // Animate title: "Works" → work.title
  if (titleSpan) {
    setTimeout(() => {
      animateTextTransition(titleSpan, work.title, animationType, 800);
    }, 100);
  }

  // Animate year: "----" → work.year
  if (yearSpan) {
    setTimeout(() => {
      animateTextTransition(yearSpan, work.year, animationType, 600);
    }, 150);
  }

  // Animate category: "----" → work.category
  if (categorySpan) {
    const categoryText = work.category.charAt(0).toUpperCase() + work.category.slice(1);
    setTimeout(() => {
      animateTextTransition(categorySpan, categoryText, animationType, 600);
    }, 200);
  }

  // Fade in Swiper container (images) simultaneously with title animation
  const swiperContainer = detailView.querySelector('.swiper-container');
  if (swiperContainer) {
    swiperContainer.style.transition = 'opacity 0.8s ease';
    setTimeout(() => {
      swiperContainer.style.opacity = '1';
    }, 100);
  }

  // Animate content_in section: h3 with real typewriter, others with cascade reveal
  const contentInDiv = detailView.querySelector('.work-content-animated');
  const h3Element = detailView.querySelector('h3'); // h3 is outside content_in

  if (contentInDiv) {
    // Set initial state: invisible but layout is preserved. Every reveal below
    // is opacity/transform-only and the h3 reserves its typed height, so the
    // block occupies its final space from the first frame - no line is ever
    // added or removed while animating.
    contentInDiv.style.opacity = '0';
    if (h3Element) {
      h3Element.style.opacity = '0';
    }

    setTimeout(() => {
      // Collect the rows to cascade (description p, then dt/dd pairs)
      const descriptionP = contentInDiv.querySelector('p');
      const dlElement = contentInDiv.querySelector('dl');
      const elementsToAnimate = [];
      if (descriptionP) elementsToAnimate.push(descriptionP);
      if (dlElement) {
        Array.from(dlElement.children).forEach(child => {
          if (child.tagName === 'DT' || child.tagName === 'DD') {
            elementsToAnimate.push(child);
          }
        });
      }

      if (PREFERS_REDUCED_MOTION) {
        contentInDiv.style.opacity = '1';
        if (h3Element) h3Element.style.opacity = '1';
        elementsToAnimate.forEach(el => { el.style.opacity = '1'; });
      } else {
        // Hide the rows in the same tick the container fades in, so nothing
        // flashes. translateY is transform-only: it never reflows the page.
        elementsToAnimate.forEach(el => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(8px)';
          el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        });
        contentInDiv.style.transition = 'opacity 0.2s ease';
        contentInDiv.style.opacity = '1';

        // h3: real typewriter, with its fully-typed height reserved up front
        // so a title that wraps can never change the line count while typing
        if (h3Element) {
          const h3Text = h3Element.textContent;
          h3Element.style.minHeight = h3Element.offsetHeight + 'px';
          h3Element.style.opacity = '1';
          h3Element.textContent = '';
          const startTime = performance.now();
          const duration = 600;
          function typeH3(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const charsToShow = Math.floor(h3Text.length * progress);
            if (progress < 1) {
              h3Element.textContent = h3Text.substring(0, charsToShow) + '\u258c';
              requestAnimationFrame(typeH3);
            } else {
              h3Element.textContent = h3Text;
            }
          }
          requestAnimationFrame(typeH3);
        }

        // Cascade the rows. The blinking cursor rides along absolutely
        // positioned in the left padding, outside the text flow, so it can
        // never push a character or add a line (the old in-flow cursor did).
        elementsToAnimate.forEach((el, index) => {
          setTimeout(() => {
            el.style.position = 'relative';
            const cursor = document.createElement('span');
            cursor.className = 'typing-cursor-before';
            cursor.textContent = '\u258c';
            cursor.setAttribute('aria-hidden', 'true');
            cursor.style.cssText =
              'position:absolute; left:-1.1em; top:0; color:var(--color-accent, #006DD9); animation: blink 0.8s step-start infinite;';
            el.appendChild(cursor);
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            setTimeout(() => { cursor.remove(); }, 450);
          }, index * 90);
        });

        // Final HRs after the cascade settles
        const finalHr1 = detailView.querySelector('.final-hr-1');
        const finalHr2 = detailView.querySelector('.final-hr-2');
        if (finalHr1 && finalHr2) {
          finalHr1.style.transition = 'opacity 0.6s ease';
          finalHr2.style.transition = 'opacity 0.6s ease';
          const lastCascade = elementsToAnimate.length > 0
            ? (elementsToAnimate.length - 1) * 90 + 300
            : 0;
          const settle = Math.max(600, lastCascade);
          setTimeout(() => { finalHr1.style.opacity = '1'; }, settle + 100);
          setTimeout(() => { finalHr2.style.opacity = '1'; }, settle + 300);
        }
      }

      if (PREFERS_REDUCED_MOTION) {
        const finalHr1 = detailView.querySelector('.final-hr-1');
        const finalHr2 = detailView.querySelector('.final-hr-2');
        if (finalHr1) finalHr1.style.opacity = '1';
        if (finalHr2) finalHr2.style.opacity = '1';
      }
    }, PREFERS_REDUCED_MOTION ? 0 : 150);
  }

  // Initialize Swiper for detail view
  setTimeout(() => {
    currentSwiper = new Swiper('.swiper-container', {
      loop: work.images.length > 1,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      keyboard: {
        enabled: true,
      }
    });
    // loop:true clones the first/last slides; keep the copies out of the
    // accessibility tree so a two-image work is not read as four
    detailView.querySelectorAll('.swiper-slide-duplicate').forEach(s => s.setAttribute('aria-hidden', 'true'));
  }, 50);

  // Breadcrumb "Works" link returns to the grid. Entered from the grid in this
  // document: step back to that history entry rather than pushing "#" on top
  // of it, so Back afterwards leaves the page instead of reopening this work.
  // Otherwise (deep link, or a hop via Prev/Next/Related) swap the current
  // entry for the list URL in place.
  detailView.querySelector('.breadcrumb-works').addEventListener('click', (e) => {
    e.preventDefault();
    if (directFromGrid) {
      history.back();
      return;
    }
    history.replaceState(null, '', window.location.pathname + window.location.search);
    handleHashChange();
  });

  // Scroll to top
  // JS-requested smooth scrolling overrides the reduced-motion CSS reset
  window.scrollTo({ top: 0, behavior: PREFERS_REDUCED_MOTION ? 'auto' : 'smooth' });

  // Land keyboard focus on the heading of the view that just replaced the grid,
  // so tabbing continues from here instead of restarting at the top of the page.
  lastWorkId = workId;
  focusQuietly(detailView.querySelector('.fixed-header-area h1'));
  announce(`${work.title} の詳細を表示しました`);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWorksSPA);
} else {
  initWorksSPA();
}
