# Maintenance Scripts

This directory contains Python automation scripts used for site maintenance and improvements.

## Available Scripts

### `add_lazy_loading.py`

Adds `loading="lazy"` attribute to all `<img>` tags across the site.

**Purpose:**
- Improves page load performance by deferring offscreen image loading
- Uses native browser lazy loading (no JavaScript required)

**Usage:**
```bash
python3 add_lazy_loading.py
```

**What it does:**
- Scans all HTML files in the repository
- Adds `loading="lazy"` to `<img>` tags that don't already have it
- Skips images that already have the loading attribute
- Reports number of changes made

**Last used:** 2025-11-15 (Session 07)
**Result:** Added lazy loading to 139 images across 42 HTML files

---

### `remove_deprecated_attrs.py`

Removes deprecated HTML attributes and replaces them with CSS classes.

**Purpose:**
- Modernizes HTML to HTML5 standards
- Removes deprecated `align` attributes
- Improves code quality and maintainability

**Usage:**
```bash
python3 remove_deprecated_attrs.py
```

**What it does:**
- Scans all HTML files in the repository
- Replaces `<div align="center">` with `<div class="center-container">`
- Removes `align` attributes from elements with existing classes
- Reports number of changes made

**Last used:** 2025-11-16 (Session 07)
**Result:** Removed 41 deprecated align attributes from 6 HTML files

---

### `add_page_transitions.py`

Adds page transition CSS and JavaScript to all HTML files.

**Purpose:**
- Provides smooth fade effects when navigating between pages
- Animations apply to content area only (menu remains static)

**Usage:**
```bash
python3 add_page_transitions.py
```

**What it does:**
- Scans all HTML files in the repository
- Adds `<link>` to page-transitions.css in `<head>`
- Adds `<script>` to page-transitions.js before `</body>`
- Calculates correct relative paths based on file location

**Last used:** 2025-11-16 (Session 07)
**Result:** Added transitions to 51 HTML files (101 changes total)
**Status:** WIP - white flicker issue unresolved

---

### `fix_page_transitions_paths.py`

Fixes incorrect page-transitions.css/js paths in HTML files.

**Purpose:**
- Corrects path calculation errors from initial script
- Ensures CSS/JS files load correctly from all subdirectories

**Usage:**
```bash
python3 fix_page_transitions_paths.py
```

**What it does:**
- Removes any existing page-transitions references
- Recalculates correct relative paths based on file depth
- Adds corrected `<link>` and `<script>` tags

**Last used:** 2025-11-16 (Session 07)
**Result:** Fixed paths in 51 HTML files

---

### `fix_sample_js_paths.py`

Fixes incorrect sample.js paths in HTML files in subdirectories.

**Purpose:**
- Corrects `src="js/sample.js"` to `src="../js/sample.js"`
- Ensures JavaScript loads correctly from subdirectory pages

**Usage:**
```bash
python3 fix_sample_js_paths.py
```

**What it does:**
- Scans all HTML files in subdirectories
- Replaces incorrect relative paths with correct ones
- Skips files in root directory (already correct)

**Last used:** 2025-11-16 (Session 07)
**Result:** Fixed 47 files with incorrect sample.js paths

---

### `add_css_standard_properties.py`

Adds standard CSS properties alongside -webkit- prefixed properties.

**Purpose:**
- Improves browser compatibility
- Ensures both prefixed and standard versions exist

**Usage:**
```bash
python3 add_css_standard_properties.py
```

**What it does:**
- Scans CSS files for -webkit- only properties
- Adds standard equivalents (e.g., `transform` after `-webkit-transform`)
- Maintains existing formatting and indentation

**Last used:** 2025-11-16 (Session 07)
**Result:** All properties already have standard versions (no changes needed)

---

## Requirements

- Python 3.x
- No external dependencies (uses only standard library)

## Notes

- All scripts create backups by design (through git version control)
- Run `git status` before and after to review changes
- Test changes locally before pushing to GitHub Pages
- Scripts are idempotent (safe to run multiple times)

## Future Scripts

Potential scripts for future maintenance:

- `optimize_images.py` - Convert images to WebP format
- `cleanup_css.py` - Remove duplicate CSS rules
- `add_meta_tags.py` - Standardize meta tags across pages
- `generate_sitemap.py` - Create XML sitemap
