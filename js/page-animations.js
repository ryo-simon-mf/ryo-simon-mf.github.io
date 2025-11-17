/**
 * Common Page Animations
 *
 * Provides text and image animations for page load transitions
 * - Glitch text effect (hacker-style binary/random character transitions)
 * - Typewriter effect (character-by-character typing)
 * - Cascade reveal (sequential element fade-in)
 * - Image fade-in
 */

// Glitch characters for random text effect
const GLITCH_CHARS = '01@#$%&*[]{}01010101><~^+=?/\\|';

/**
 * Animate text with glitch effect
 * Random characters converge to target text
 * @param {HTMLElement} element - Element containing text to animate
 * @param {string} targetText - Final text to display
 * @param {number} duration - Animation duration in ms
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
 * Animate text with typewriter effect
 * @param {HTMLElement} element - Element to animate
 * @param {string} targetText - Text to type
 * @param {number} duration - Animation duration in ms
 */
function animateTextTypewriter(element, targetText, duration = 1000) {
  if (!element) return;

  element.textContent = '';
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const charsToShow = Math.floor(targetText.length * progress);

    if (progress < 1) {
      element.textContent = targetText.substring(0, charsToShow) + '▌';
      requestAnimationFrame(update);
    } else {
      element.textContent = targetText;
    }
  }

  requestAnimationFrame(update);
}

/**
 * Initialize page animations on DOMContentLoaded
 * Applies to h1, h2, h3, images, and content sections
 */
function initPageAnimations() {
  const content = document.getElementById('content');
  if (!content) return;

  // Variable to track which hr is after swiper (needs wider scope)
  let swiperHrElement = null;

  // Animate h1 with glitch effect (keep text visible from start)
  const h1 = content.querySelector('h1');
  if (h1) {
    const h1Text = h1.textContent.trim();
    // Don't clear text - animate from current text to same text
    setTimeout(() => {
      animateTextGlitch(h1, h1Text, 800);
    }, 100);
  }

  // Fade in Swiper container (profile images) and the hr after it
  const swiperContainer = content.querySelector('.swiper-container');

  if (swiperContainer) {
    swiperContainer.style.opacity = '0';
    swiperContainer.style.transition = 'opacity 0.8s ease';

    // Find the hr after swiper (it's the second hr in content)
    const allHrs = content.querySelectorAll('hr');
    console.log('[Page Animations] Total hrs found:', allHrs.length);
    if (allHrs.length > 1) {
      swiperHrElement = allHrs[1]; // Second hr is after swiper
      console.log('[Page Animations] Setting swiperHrElement (index 1):', swiperHrElement);
      swiperHrElement.style.opacity = '0';
      swiperHrElement.style.transition = 'opacity 0.8s ease';
    }

    // Fade in both at the same time
    setTimeout(() => {
      swiperContainer.style.opacity = '1';
      if (swiperHrElement) {
        swiperHrElement.style.opacity = '1';
        console.log('[Page Animations] Fading in swiperHrElement');
      }
    }, 100);
  }

  // Wait for Swiper to finish fading in (900ms), then animate elements below
  const swiperFadeComplete = 900; // 100ms delay + 800ms fade

  // Animate h2 with glitch effect (after swiper fade completes)
  const h2 = content.querySelector('h2');
  if (h2) {
    const h2Text = h2.textContent.trim();
    // Already hidden in HTML with style="opacity: 0"
    setTimeout(() => {
      h2.style.opacity = '1';
      animateTextGlitch(h2, h2Text, 600);
    }, swiperFadeComplete);
  }

  // Animate h4 with glitch effect (after h2 starts)
  const h4 = content.querySelector('h4');
  if (h4) {
    const h4Text = h4.textContent.trim();
    // Already hidden in HTML with style="opacity: 0"
    setTimeout(() => {
      h4.style.opacity = '1';
      animateTextGlitch(h4, h4Text, 500);
    }, swiperFadeComplete + 300);
  }

  // Animate h3 elements
  const h3Elements = content.querySelectorAll('h3');

  // First h3 (Creative Technologist/Artist/Researcher with line breaks) - use glitch on each <a> tag
  if (h3Elements.length > 0) {
    const firstH3 = h3Elements[0];
    const aTags = firstH3.querySelectorAll('a');

    setTimeout(() => {
      firstH3.style.opacity = '1';

      // Apply glitch effect to each <a> tag independently
      aTags.forEach((aTag, index) => {
        const text = aTag.textContent.trim();
        setTimeout(() => {
          animateTextGlitch(aTag, text, 600);
        }, index * 100); // Stagger each line by 100ms
      });
    }, swiperFadeComplete + 400);
  }

  // Other h3 section titles (Education, Seminar, etc.) - use typewriter effect
  for (let i = 1; i < h3Elements.length; i++) {
    const h3 = h3Elements[i];
    const h3Text = h3.textContent.trim();
    // Already hidden in HTML with style="opacity: 0"
    // Start typewriter animation
    setTimeout(() => {
      h3.style.opacity = '1';
      h3.textContent = '';
      animateTextTypewriter(h3, h3Text, 800);
    }, swiperFadeComplete + 600 + (i - 1) * 200);
  }

  // Cascade reveal for content sections (after swiper completes)
  const contentSections = content.querySelectorAll('#content_in');
  contentSections.forEach((section, sectionIndex) => {
    // Already hidden in HTML with style="opacity: 0"
    section.style.transform = 'translateY(10px)';
    section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

    // Get all direct children elements
    const elements = Array.from(section.children);

    elements.forEach((element, elemIndex) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(10px)';
      element.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    });

    // Start revealing section (after swiper completes + some delay)
    setTimeout(() => {
      section.style.opacity = '1';
      section.style.transform = 'translateY(0)';

      // Cascade reveal children
      elements.forEach((element, elemIndex) => {
        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, elemIndex * 100);
      });
    }, swiperFadeComplete + 800 + sectionIndex * 300);
  });

  // Fade in all images with lazy loading
  const images = content.querySelectorAll('img');
  images.forEach((img, index) => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.6s ease';

    // Fade in after image loads or immediately if already loaded
    if (img.complete) {
      setTimeout(() => {
        img.style.opacity = '1';
      }, 300 + index * 50);
    } else {
      img.addEventListener('load', () => {
        setTimeout(() => {
          img.style.opacity = '1';
        }, 300 + index * 50);
      });
    }
  });

  // Fade in all iframes (for Gallery page)
  const iframes = content.querySelectorAll('iframe');
  iframes.forEach((iframe, index) => {
    iframe.style.opacity = '0';
    iframe.style.transition = 'opacity 0.6s ease';

    setTimeout(() => {
      iframe.style.opacity = '1';
    }, 400 + index * 100);
  });

  // Fade in hr elements (except first one after h1 and second one after swiper)
  const hrs = content.querySelectorAll('hr');

  hrs.forEach((hr, index) => {
    console.log(`[Page Animations] Processing hr index ${index}, is swiperHr:`, hr === swiperHrElement);

    // Skip first hr (the one right after h1)
    if (index === 0) {
      hr.style.opacity = '1'; // Keep visible from start
      console.log(`[Page Animations] hr ${index}: keeping visible (first hr)`);
      return;
    }

    // Skip second hr if it's the one after swiper (already handled above)
    if (hr === swiperHrElement) {
      console.log(`[Page Animations] hr ${index}: skipping (swiperHrElement, already handled)`);
      return;
    }

    // Other hrs fade in after swiper completes
    console.log(`[Page Animations] hr ${index}: will fade in at ${swiperFadeComplete + 600 + index * 100}ms`);
    hr.style.opacity = '0';
    hr.style.transition = 'opacity 0.4s ease';
    setTimeout(() => {
      hr.style.opacity = '1';
      console.log(`[Page Animations] hr ${index}: faded in`);
    }, swiperFadeComplete + 600 + index * 100);
  });
}

// Auto-initialize on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPageAnimations);
} else {
  // Document already loaded
  initPageAnimations();
}
