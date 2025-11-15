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

**Last used:** 2025-11-15 (Session 07)
**Result:** Removed 41 deprecated align attributes from 6 HTML files

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
