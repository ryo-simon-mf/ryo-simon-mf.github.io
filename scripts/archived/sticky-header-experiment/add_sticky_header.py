#!/usr/bin/env python3
"""
Add sticky header to individual work pages.
Wraps h1 and hr elements in a .page-header div.
"""
import os
import re
from pathlib import Path

# Project root
WORKS_DIR = Path("/Users/ryosimon/Documents/Homepage/ryo-simon-mf.github.io/works")

def add_sticky_header(file_path):
    """Add sticky header wrapper to a single HTML file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already has page-header
    if 'class="page-header"' in content:
        return False, "Already has page-header"

    # Pattern to match:
    # <div id="content">
    #     <br>
    #     [optional whitespace/newlines]
    #     <h1>...</h1>
    #     [optional whitespace/newlines]
    #     <hr>

    # Strategy: Find <br> after <div id="content"> and insert sticky header wrapper
    # Then find <hr> and close the wrapper after it

    # Step 1: Add opening div after <br> (within content div)
    pattern1 = r'(<div id="content">[\s\S]*?<br>)'
    replacement1 = r'\1\n\n            <!-- Sticky Header -->\n            <div class="page-header">'
    content = re.sub(pattern1, replacement1, content, count=1)

    # Step 2: Find the first <hr> after page-header and add closing div after it
    pattern2 = r'(<div class="page-header">[\s\S]*?<hr>)'
    replacement2 = r'\1\n            </div>'
    content = re.sub(pattern2, replacement2, content, count=1)

    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    return True, "Added sticky header"

def main():
    # Get all HTML files except works.html
    work_files = [f for f in WORKS_DIR.glob("*.html") if f.name != "works.html"]

    print(f"Found {len(work_files)} individual work pages")
    print()

    success_count = 0
    skip_count = 0

    for file_path in sorted(work_files):
        success, message = add_sticky_header(file_path)
        if success:
            print(f"✓ {file_path.name}: {message}")
            success_count += 1
        else:
            print(f"- {file_path.name}: {message}")
            skip_count += 1

    print()
    print(f"Summary: {success_count} modified, {skip_count} skipped")

if __name__ == "__main__":
    main()
