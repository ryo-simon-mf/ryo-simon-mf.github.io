// Works SPA (Single Page Application) with Hash Routing
// V3: Individual JSON files for each work

let worksData = {}; // Will be populated from JSON files
let worksOrder = []; // Display order
let currentSwiper = null;

// Hacker-style text animation
// Characters for glitch effect (binary + symbols)
const GLITCH_CHARS = '01@#$%&*[]{}01010101><~^+=?/\\|';

/**
 * Animate text transition with hacker/glitch effect
 * Type 1: Binary/Glitch (random characters converging to target)
 * @param {HTMLElement} element - Target element
 * @param {string} targetText - Text to transition to
 * @param {number} duration - Animation duration in ms (default: 800)
 */
function animateTextGlitch(element, targetText, duration = 800) {
  if (!element) return;

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

// Loading spinner helpers
function showLoadingSpinner() {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) {
    spinner.style.display = 'block';
  }
}

function hideLoadingSpinner() {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) {
    spinner.style.display = 'none';
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
    ogImage.setAttribute('content', 'https://ryo-simon-mf.github.io/image/2024_icon_basic.png');
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
    const indexData = await indexResponse.json();

    // Handle both old and new index.json formats
    if (indexData.works) {
      // New format with metadata
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

    // Handle initial load
    await handleHashChange();

    // Intercept thumbnail clicks
    document.querySelectorAll('.img_wrap a').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        const workId = extractWorkId(href);
        window.location.hash = workId;
      });
    });
  } catch (error) {
    console.error('Failed to initialize Works SPA:', error);
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
async function loadWork(workId) {
  // Return cached data if already loaded
  if (worksData[workId]) {
    return worksData[workId];
  }

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
  }
}

// Extract work ID from filename
function extractWorkId(href) {
  // Mapping from HTML filename to work ID
  const filenameToId = {
    'toki-shirube.html': 'toki-shirube',
    'inochinokodou.html': 'inochinokodou',
    'muses_ex_echoes.html': 'muses-ex-echoes',
    'improvise_chain.html': 'improvise-chain',
    'theplot_echo_mv.html': 'theplot-echo-mv',
    'VariableFlavorRemix.html': 'variable-flavor-remix',
    'AdaptiveYantra.html': 'adaptive-yantra',
    'HapticGuidingSuite.html': 'haptic-guiding-suite',
    'AiTellYouDjing.html': 'ai-tell-you-djing',
    'Morse_Code.html': 'morse-code',
    'mutek_jp_2020.html': 'mutek-jp-2020',
    'playingtokyo_vol11.html': 'playingtokyo-vol11',
    'solgasa_nextup_animation.html': 'solgasa-nextup-animation',
    'tSA.html': 't-s-a',
    'xMusicOnline0418.html': 'x-music-online0418',
    'onlineb2b_proto.html': 'onlineb2b-proto',
    'SequencingOfFutureConversation.html': 'sequencing-of-future-conversation',
    'Text2Sequence.html': 'text2-sequence',
    'ZigSow.html': 'zig-sow',
    'Motion-Crossfader.html': 'motion-crossfader',
    'shikael.html': 'shikael',
    'OriginalLogo.html': 'original-logo',
    'sanskritlogo.html': 'sanskritlogo',
    'Toilecher.html': 'toilecher',
    'rfont.html': 'rfont',
    'randb.html': 'randb',
    'cfv.html': 'cfv',
    'jpdd.html': 'jpdd',
    'eyehaveyou.html': 'eyehaveyou',
    'pourwater.html': 'pourwater',
    'colorboxes.html': 'colorboxes'
  };

  const filename = href.replace('./', '');
  return filenameToId[filename] || filename.replace('.html', '');
}

// Handle hash change events (async to support lazy loading)
async function handleHashChange() {
  const hash = window.location.hash.slice(1); // Remove #

  if (hash) {
    // Show loading spinner while fetching data
    showLoadingSpinner();

    // Lazy load work data if not already cached
    const workData = await loadWork(hash);

    // Hide spinner after data is loaded
    hideLoadingSpinner();

    if (workData) {
      showWorkDetail(hash);
    } else {
      // Work not found, show list
      showWorksList();
    }
  } else {
    showWorksList();
  }
}

// Show works list (grid view)
function showWorksList() {
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

    // Wait for fade out, then show list
    setTimeout(() => {
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

    // Animate h1 back to "Works" with glitch effect
    const h1 = contentDiv.querySelector('h1');
    if (h1) {
      animateTextTransition(h1, 'Works', 'glitch', 600);
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
        setTimeout(() => {
          animateTextGlitch(btn, targetText, 400);
        }, 100 + index * 50);
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
      }, 100 + index * 30); // 30ms delay between each thumbnail
    });

    // Destroy swiper if exists
    if (currentSwiper) {
      currentSwiper.destroy(true, true);
      currentSwiper = null;
    }
  }
}

// Show work detail view
function showWorkDetail(workId) {
  const work = worksData[workId];
  const contentDiv = document.getElementById('content');
  const centerContainer = document.querySelector('.center-container');

  // Update meta tags for SEO
  updateMetaTags(work);

  // Fade out all thumbnails first
  const thumbnails = document.querySelectorAll('.img_wrap');
  thumbnails.forEach(item => {
    item.style.transition = 'opacity 0.4s ease';
    item.style.opacity = '0';
  });

  // Wait for fade out animation to complete
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
  }, 400);
}

// Create detail view HTML - EXACT copy of original structure
function createDetailView(work, workId) {
  const contentDiv = document.getElementById('content');

  // Remove existing detail view
  const existingDetail = document.getElementById('work-detail-view');
  if (existingDetail) existingDetail.remove();

  // Create detail view container
  const detailView = document.createElement('div');
  detailView.id = 'work-detail-view';

  // Build images HTML for Swiper
  const swiperSlides = work.images.map(img => `
                    <div class="swiper-slide">
                        <div class="img_w2">
                            <img src="${img}" alt="" loading="lazy">
                        </div>
                    </div>`).join('');

  // EXACT structure from toki-shirube.html with back button added
  // Use DOMPurify to sanitize HTML and prevent XSS attacks
  // Initial values set to placeholder for animation (Works → work.title)
  detailView.innerHTML = DOMPurify.sanitize(`
            <!-- Fixed Header Area -->
            <div class="fixed-header-area">
                <br>
                <h1>
                    <!-- Heading　-->
                    <span class="work-title-animated">Works</span>
                    <a href="#" class="back-to-list">Back to Works</a>
                </h1>
                <hr>
                <p class="work-header-metadata">
                    <span class="list work-year-animated">----</span> | <span class="list work-category-animated">----</span>
                </p>
            </div>

            <div class="swiper-container" style="opacity: 0;">
                <div class="swiper-wrapper">
${swiperSlides}
                </div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
            </div>
            <hr>

            <!-- Subheading　-->
            <h3>
                ${work.title}
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
                ${work.related ? `<dt>Related</dt>
                <dd>
                    ${work.related}
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
            <hr class="final-hr-2" style="opacity: 0;">
            <br>
  `);

  contentDiv.appendChild(detailView);

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
    // Set initial state: invisible but layout is preserved
    contentInDiv.style.opacity = '0';
    if (h3Element) {
      h3Element.style.opacity = '0';
    }

    setTimeout(() => {
      // Fade in sections
      contentInDiv.style.transition = 'opacity 0.3s ease';
      contentInDiv.style.opacity = '1';

      // Get all elements to animate in order
      const descriptionP = contentInDiv.querySelector('p');
      const dlElement = contentInDiv.querySelector('dl');

      // Create array of elements (excluding h3 for now)
      const elementsToAnimate = [];

      if (descriptionP) elementsToAnimate.push({ element: descriptionP, type: 'p' });

      // Add dt/dd pairs in order
      if (dlElement) {
        const children = Array.from(dlElement.children);
        children.forEach(child => {
          if (child.tagName === 'DT' || child.tagName === 'DD') {
            elementsToAnimate.push({ element: child, type: child.tagName.toLowerCase() });
          }
        });
      }

      // === h3: Real typewriter animation (character by character) ===
      if (h3Element) {
        const h3Text = h3Element.textContent;
        h3Element.textContent = '';
        h3Element.style.opacity = '1'; // Make h3 visible immediately

        // Typewriter animation for h3
        const startTime = performance.now();
        const duration = 1000; // 1 second to type h3

        function typeH3(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const charsToShow = Math.floor(h3Text.length * progress);

          if (progress < 1) {
            h3Element.textContent = h3Text.substring(0, charsToShow) + '▌';
            requestAnimationFrame(typeH3);
          } else {
            h3Element.textContent = h3Text; // Complete
          }
        }

        requestAnimationFrame(typeH3);
      }

      // === Other elements: Cascade reveal with cursor effect ===
      // Hide all elements initially
      elementsToAnimate.forEach(({ element }) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        element.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      });

      // Reveal elements sequentially (starts at same time as h3 typewriter)
      elementsToAnimate.forEach(({ element, type }, index) => {
        setTimeout(() => {
          // Add typing cursor before reveal
          const cursor = document.createElement('span');
          cursor.className = 'typing-cursor-before';
          cursor.textContent = '▌';
          cursor.style.cssText = 'opacity: 0; margin-right: 5px; color: #006DD9; animation: blink 0.8s step-start infinite;';

          element.parentNode.insertBefore(cursor, element);

          // Fade in cursor
          setTimeout(() => {
            cursor.style.opacity = '1';
          }, 50);

          // Reveal element after brief cursor display
          setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';

            // Remove cursor after element is revealed
            setTimeout(() => {
              cursor.style.opacity = '0';
              setTimeout(() => cursor.remove(), 300);
            }, 400);
          }, 200);

        }, index * 150); // Stagger delay: 150ms between elements
      });

      // === Final HRs: Fade in after all animations complete ===
      const finalHr1 = detailView.querySelector('.final-hr-1');
      const finalHr2 = detailView.querySelector('.final-hr-2');

      if (finalHr1 && finalHr2) {
        // Hide initially
        finalHr1.style.opacity = '0';
        finalHr2.style.opacity = '0';
        finalHr1.style.transition = 'opacity 0.6s ease';
        finalHr2.style.transition = 'opacity 0.6s ease';

        // Calculate when all animations finish
        // h3 typewriter: 1000ms
        // Last cascade element: (elementsToAnimate.length - 1) * 150 + 200 (cursor) + 400 (reveal)
        const h3Duration = 1000;
        const lastCascadeDelay = elementsToAnimate.length > 0
          ? (elementsToAnimate.length - 1) * 150 + 600
          : 0;
        const totalAnimationTime = Math.max(h3Duration, lastCascadeDelay);

        // Fade in final HRs after all animations complete
        setTimeout(() => {
          finalHr1.style.opacity = '1';

          // Second HR appears slightly after first
          setTimeout(() => {
            finalHr2.style.opacity = '1';
          }, 200);
        }, totalAnimationTime + 300); // 300ms buffer after animations
      }

    }, 900); // Start after title/year/category animations
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
  }, 50);

  // Back button handler
  detailView.querySelector('.back-to-list').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = '';
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWorksSPA);
} else {
  initWorksSPA();
}
