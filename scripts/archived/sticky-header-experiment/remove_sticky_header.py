#!/usr/bin/env python3
"""
Remove sticky header implementation from all HTML files.
- Remove .page-header wrapper divs
- Remove sticky-header.js script tags
"""
import os
import re
from pathlib import Path

# Project root
PROJECT_ROOT = Path("/Users/ryosimon/Documents/Homepage/ryo-simon-mf.github.io")
WORKS_DIR = PROJECT_ROOT / "works"
ABOUT_FILE = PROJECT_ROOT / "about" / "about.html"

def remove_sticky_header_html(file_path):
    """Remove .page-header wrapper and restore original structure."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Remove <!-- Sticky Header --> comment and opening div
    content = re.sub(
        r'\s*<!-- Sticky Header -->\s*\n\s*<div class="page-header">\s*\n',
        '\n',
        content
    )

    # For works.html: Remove closing </div> after filter paragraph
    # Pattern: </p>\n            </div>\n\n            <div class="center-container">
    content = re.sub(
        r'(</p>)\s*\n\s*</div>\s*\n\s*(<div class="center-container">)',
        r'\1\n\n            \2',
        content
    )

    # For other pages: Remove closing </div> after <hr>
    # Pattern: <hr>\n            </div>\n\n            <div
    content = re.sub(
        r'(<hr>)\s*\n\s*</div>\s*\n',
        r'\1\n',
        content
    )

    # Remove sticky-header.js script tag
    content = re.sub(
        r'\s*<!-- Sticky Header -->\s*\n\s*<script src="../js/sticky-header.js"></script>\s*\n',
        '',
        content
    )

    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, "Removed sticky header"
    else:
        return False, "No changes needed"

def main():
    print("Removing sticky header implementation...")
    print()

    # Process works.html
    works_file = WORKS_DIR / "works.html"
    success, msg = remove_sticky_header_html(works_file)
    print(f"{'✓' if success else '-'} works.html: {msg}")

    # Process about.html
    success, msg = remove_sticky_header_html(ABOUT_FILE)
    print(f"{'✓' if success else '-'} about.html: {msg}")

    # Process individual work pages
    work_files = [f for f in WORKS_DIR.glob("*.html") if f.name != "works.html"]
    print()
    print(f"Processing {len(work_files)} individual work pages...")

    success_count = 0
    for file_path in sorted(work_files):
        success, msg = remove_sticky_header_html(file_path)
        if success:
            success_count += 1

    print(f"✓ Modified {success_count} work pages")
    print()
    print(f"Total: {success_count + 2} files modified")

if __name__ == "__main__":
    main()
