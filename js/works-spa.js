// Works SPA (Single Page Application) with Hash Routing
// V3: Individual JSON files for each work

let worksData = {}; // Will be populated from JSON files
let worksOrder = []; // Display order
let currentSwiper = null;

// Initialize SPA functionality
async function initWorksSPA() {
  try {
    // Load index.json to get work order
    const indexResponse = await fetch('../works-data/index.json');
    const indexData = await indexResponse.json();
    worksOrder = indexData.order;

    // Load all work data
    await loadAllWorks();

    // Handle hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Handle initial load
    handleHashChange();

    // Intercept thumbnail clicks
    document.querySelectorAll('.img_wrap a').forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        const workId = extractWorkId(href);

        if (worksData[workId]) {
          e.preventDefault();
          window.location.hash = workId;
        }
      });
    });
  } catch (error) {
    console.error('Failed to initialize Works SPA:', error);
  }
}

// Load all work JSON files
async function loadAllWorks() {
  const loadPromises = worksOrder.map(async (workId) => {
    try {
      const response = await fetch(`../works-data/${workId}.json`);
      const workData = await response.json();
      worksData[workId] = workData;
    } catch (error) {
      console.error(`Failed to load ${workId}.json:`, error);
    }
  });

  await Promise.all(loadPromises);
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

// Handle hash change events
function handleHashChange() {
  const hash = window.location.hash.slice(1); // Remove #

  if (hash && worksData[hash]) {
    showWorkDetail(hash);
  } else {
    showWorksList();
  }
}

// Show works list (grid view)
function showWorksList() {
  const centerContainer = document.querySelector('.center-container');
  const contentDiv = document.getElementById('content');

  // Remove detail view if exists
  const detailView = document.getElementById('work-detail-view');
  if (detailView) {
    detailView.remove();
  }

  // Show ALL original content elements
  const elementsToShow = contentDiv.querySelectorAll(':scope > br, :scope > h1, :scope > hr, :scope > p');
  elementsToShow.forEach(el => {
    el.style.display = 'block';
  });

  // Show center-container
  if (centerContainer) {
    centerContainer.style.display = 'block';
  }

  // Restore filter state - check which filter button is active
  const activeFilter = document.querySelector('.filter-btn.active');
  const filterValue = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';

  // Apply filter based on active button
  document.querySelectorAll('.img_wrap').forEach(item => {
    item.style.opacity = '1';

    if (filterValue === 'all') {
      // Show all thumbnails
      item.style.display = 'inline-block';
    } else {
      // Show only matching category
      const itemCategory = item.getAttribute('data-category');
      if (itemCategory === filterValue) {
        item.style.display = 'inline-block';
      } else {
        item.style.display = 'none';
      }
    }
  });

  // Destroy swiper if exists
  if (currentSwiper) {
    currentSwiper.destroy(true, true);
    currentSwiper = null;
  }
}

// Show work detail view
function showWorkDetail(workId) {
  const work = worksData[workId];
  const contentDiv = document.getElementById('content');
  const centerContainer = document.querySelector('.center-container');

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
  document.querySelectorAll('.img_wrap').forEach(item => {
    item.style.display = 'none';
  });

  // Create detail view immediately
  createDetailView(work, workId);
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
  detailView.innerHTML = `
            <br>
            <h1>
                <!-- Heading　-->
                ${work.title}
                <a href="#" class="back-to-list">Back to Works</a>
            </h1>
            <hr>
            <p>
                <span class="list">${work.year}</span> / <span class="list">${work.category.charAt(0).toUpperCase() + work.category.slice(1)}</span>
            </p>
            <div class="swiper-container">
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
            <div id="content_in">
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
            <hr>
            <hr>
            <br>
  `;

  contentDiv.appendChild(detailView);

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
