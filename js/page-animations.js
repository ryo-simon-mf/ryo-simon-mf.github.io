/**
 * Common Page Animations
 *
 * Provides text and image animations for page load transitions
 * - Glitch text effect (hacker-style binary/random character transitions)
 * - Typewriter effect (character-by-character typing)
 * - Cascade reveal (sequential element fade-in)
 * - Image fade-in
 */

// Animation timing scale (in milliseconds)
const ANIMATION_DURATION = {
  FAST: 400,    // Quick transitions
  NORMAL: 600,  // Standard animations
  SLOW: 800     // Longer, emphasized animations
};

// Glitch characters for random text effect
const GLITCH_CHARS = '01@#$%&*[]{}01010101><~^+=?/\\|';

/**
 * Animate text with glitch effect
 * Random characters converge to target text
 * @param {HTMLElement} element - Element containing text to animate
 * @param {string} targetText - Final text to display
 * @param {number} duration - Animation duration in ms
 */
function animateTextGlitch(element, targetText, duration = ANIMATION_DURATION.SLOW) {
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
function animateTextTypewriter(element, targetText, duration = ANIMATION_DURATION.SLOW) {
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
 * Fallback function - show all content immediately without animations
 * Used when animations fail or aren't supported
 */
function showAllContentImmediately() {
  const content = document.getElementById('content');
  if (!content) return;

  console.log('[Page Animations] Showing all content immediately (fallback mode)');

  // Make all hidden elements visible
  const hiddenElements = content.querySelectorAll('[style*="opacity: 0"]');
  hiddenElements.forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.transition = 'none';
  });

  // Show swiper
  const swiper = content.querySelector('.swiper-container');
  if (swiper) {
    swiper.style.opacity = '1';
  }

  // Show all hrs
  const hrs = content.querySelectorAll('hr');
  hrs.forEach(hr => {
    hr.style.opacity = '1';
  });

  // Show all content sections
  const contentSections = content.querySelectorAll('#content_in');
  contentSections.forEach(section => {
    section.style.opacity = '1';
    section.style.transform = 'none';
    Array.from(section.children).forEach(child => {
      child.style.opacity = '1';
      child.style.transform = 'none';
    });
  });

  // Show all h2, h3, h4 elements
  ['h2', 'h3', 'h4'].forEach(tag => {
    const elements = content.querySelectorAll(tag);
    elements.forEach(el => {
      el.style.opacity = '1';
    });
  });
}

/**
 * Initialize page animations on DOMContentLoaded
 * Applies to h1, h2, h3, images, and content sections
 */
function initPageAnimations() {
  try {
    const content = document.getElementById('content');
    if (!content) {
      console.warn('[Page Animations] Content element not found');
      return;
    }

    // Check if browser supports Intersection Observer
    if (!('IntersectionObserver' in window)) {
      console.warn('[Page Animations] IntersectionObserver not supported - using fallback');
      showAllContentImmediately();
      return;
    }

  // Check if user prefers reduced motion (accessibility)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Skip all animations - just show content immediately
    // Make all hidden elements visible
    const hiddenElements = content.querySelectorAll('[style*="opacity: 0"]');
    hiddenElements.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });

    // Show swiper and all hrs
    const swiper = content.querySelector('.swiper-container');
    if (swiper) swiper.style.opacity = '1';

    const hrs = content.querySelectorAll('hr');
    hrs.forEach(hr => hr.style.opacity = '1');

    // Show all content sections
    const contentSections = content.querySelectorAll('#content_in');
    contentSections.forEach(section => {
      section.style.opacity = '1';
      section.style.transform = 'none';
      Array.from(section.children).forEach(child => {
        child.style.opacity = '1';
        child.style.transform = 'none';
      });
    });

    return; // Exit early - no animations
  }

  // Variable to track which hr is after swiper (needs wider scope)
  let swiperHrElement = null;

  // Create Intersection Observer for scroll-based animations
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px', // Trigger slightly before element enters viewport
    threshold: 0.1
  };

  // More lenient observer for bottom elements (no negative bottom margin)
  const bottomObserverOptions = {
    root: null,
    rootMargin: '0px', // No offset - trigger as soon as any part is visible
    threshold: 0.01 // Very sensitive - trigger with 1% visibility
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';

        // Fade in the element
        if (entry.target.classList.contains('scroll-animate')) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      }
    });
  }, observerOptions);

  // Animate h1 with glitch effect (keep text visible from start)
  const h1 = content.querySelector('h1');
  if (h1) {
    const h1Text = h1.textContent.trim();
    // Don't clear text - animate from current text to same text
    setTimeout(() => {
      animateTextGlitch(h1, h1Text, ANIMATION_DURATION.SLOW);
    }, 100);
  }

  // Fade in Swiper container (profile images) and the hr after it
  const swiperContainer = content.querySelector('.swiper-container');

  if (swiperContainer) {
    swiperContainer.style.opacity = '0';
    swiperContainer.style.transition = 'opacity 0.8s ease';

    // Find the hr after swiper using explicit class
    swiperHrElement = content.querySelector('hr.swiper-divider');
    if (swiperHrElement) {
      swiperHrElement.style.opacity = '0';
      swiperHrElement.style.transition = 'opacity 0.8s ease';
    }

    // Fade in both at the same time
    setTimeout(() => {
      swiperContainer.style.opacity = '1';
      if (swiperHrElement) {
        swiperHrElement.style.opacity = '1';
      }
    }, 100);
  }

  // Wait for Swiper to finish fading in (900ms for pages with swiper, 100ms for others)
  // This allows pages without swiper (like Contact) to start animations immediately
  const swiperFadeComplete = swiperContainer ? 900 : 100;

  // Animate h2 with glitch effect using Intersection Observer
  const h2 = content.querySelector('h2');
  if (h2) {
    const h2Text = h2.textContent.trim();
    h2.style.opacity = '0';
    h2.style.transition = 'opacity 0.6s ease';

    const h2Observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          setTimeout(() => {
            entry.target.style.opacity = '1';
            animateTextGlitch(entry.target, h2Text, ANIMATION_DURATION.NORMAL);
          }, 100);
        }
      });
    }, observerOptions);

    h2Observer.observe(h2);
  }

  // Animate h4 with glitch effect using Intersection Observer
  const h4 = content.querySelector('h4');
  if (h4) {
    const h4Text = h4.textContent.trim();
    h4.style.opacity = '0';
    h4.style.transition = 'opacity 0.6s ease';

    const h4Observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          setTimeout(() => {
            entry.target.style.opacity = '1';
            animateTextGlitch(entry.target, h4Text, ANIMATION_DURATION.NORMAL);
          }, 100);
        }
      });
    }, observerOptions);

    h4Observer.observe(h4);
  }

  // Animate h3 elements with Intersection Observer
  const h3Elements = content.querySelectorAll('h3');

  // First h3 (Creative Technologist/Artist/Researcher) - glitch on each <a> tag
  if (h3Elements.length > 0) {
    const firstH3 = h3Elements[0];
    const aTags = firstH3.querySelectorAll('a');
    firstH3.style.opacity = '0';
    firstH3.style.transition = 'opacity 0.6s ease';

    const firstH3Observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          entry.target.style.opacity = '1';

          aTags.forEach((aTag, index) => {
            const text = aTag.textContent.trim();
            setTimeout(() => {
              animateTextGlitch(aTag, text, ANIMATION_DURATION.NORMAL);
            }, index * 100);
          });
        }
      });
    }, observerOptions);

    firstH3Observer.observe(firstH3);
  }

  // Other h3 section titles - typewriter effect with Intersection Observer
  for (let i = 1; i < h3Elements.length; i++) {
    const h3 = h3Elements[i];
    const h3Text = h3.textContent.trim();
    h3.style.opacity = '0';
    h3.style.transition = 'opacity 0.6s ease';

    const h3Observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.textContent = '';
            animateTextTypewriter(entry.target, h3Text, ANIMATION_DURATION.SLOW);
          }, 100);
        }
      });
    }, observerOptions);

    h3Observer.observe(h3);
  }

  // Cascade reveal for content sections with Intersection Observer
  const contentSections = content.querySelectorAll('#content_in');
  contentSections.forEach((section, sectionIndex) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';

          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';

            // Cascade reveal children - faster for sections with many elements
            const elements = Array.from(entry.target.children);
            elements.forEach((element, elemIndex) => {
              element.style.opacity = '0';
              element.style.transform = 'translateY(10px)';
              element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

              // Faster cascade: 30ms delay instead of 80ms
              setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
              }, elemIndex * 30);
            });
          }, 50);
        }
      });
    }, observerOptions);

    sectionObserver.observe(section);
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

  // Fade in hr elements with Intersection Observer
  const hrs = content.querySelectorAll('hr');
  const totalHrs = hrs.length;

  hrs.forEach((hr, index) => {
    // Skip first hr (the one right after h1) - keep visible from start
    if (index === 0) {
      hr.style.opacity = '1';
      return;
    }

    // Skip second hr if it's the one after swiper (already handled above)
    if (hr === swiperHrElement) {
      return;
    }

    // Other hrs fade in when scrolled into view
    hr.style.opacity = '0';
    hr.style.transition = 'opacity 0.8s ease';

    // Use more lenient observer for last 2 hrs (bottom elements)
    const isBottomElement = index >= totalHrs - 2;
    const options = isBottomElement ? bottomObserverOptions : observerOptions;

    const hrObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          entry.target.style.opacity = '1';
        }
      });
    }, options);

    hrObserver.observe(hr);
  });

  } catch (error) {
    // If any error occurs, show all content immediately
    console.error('[Page Animations] Animation initialization failed:', error);
    console.error('[Page Animations] Falling back to immediate content display');

    try {
      showAllContentImmediately();
    } catch (fallbackError) {
      console.error('[Page Animations] Fallback also failed:', fallbackError);
      // Last resort: remove all inline opacity styles
      document.querySelectorAll('[style*="opacity: 0"]').forEach(el => {
        el.style.opacity = '1';
      });
    }
  }
}

// Auto-initialize on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPageAnimations);
} else {
  // Document already loaded
  initPageAnimations();
}
