#!/usr/bin/env python3
"""
Add sticky-header.js script tag to all individual work pages.
"""
import os
import re
from pathlib import Path

# Project root
WORKS_DIR = Path("/Users/ryosimon/Documents/Homepage/ryo-simon-mf.github.io/works")

def add_sticky_script(file_path):
    """Add sticky-header.js script tag before </body>."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already has sticky-header.js
    if 'sticky-header.js' in content:
        return False, "Already has sticky-header.js"

    # Find </body> tag and insert script before it
    pattern = r'(</body>)'
    replacement = r'    <!-- Sticky Header -->\n    <script src="../js/sticky-header.js"></script>\n\1'

    new_content = re.sub(pattern, replacement, content, count=1)

    if new_content == content:
        return False, "No </body> tag found"

    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True, "Added sticky-header.js"

def main():
    # Get all HTML files except works.html
    work_files = [f for f in WORKS_DIR.glob("*.html") if f.name != "works.html"]

    print(f"Found {len(work_files)} individual work pages")
    print()

    success_count = 0
    skip_count = 0

    for file_path in sorted(work_files):
        success, message = add_sticky_script(file_path)
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
