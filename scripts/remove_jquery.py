#!/usr/bin/env python3
"""
Remove jQuery dependency from all HTML files.

This script removes:
1. jQuery CDN script tag
2. sample.js script tag (empty jQuery wrapper)

Since jQuery is no longer used in the codebase, removing it saves ~90KB.
"""

import os
import re
from pathlib import Path

def remove_jquery_from_file(filepath):
    """Remove jQuery script tags from a single HTML file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Pattern 1: jQuery CDN script tag (with possible variations)
    jquery_cdn_pattern = r'\s*<!-- jQuery -->\s*\n\s*<script src="https://ajax\.googleapis\.com/ajax/libs/jquery/[^"]+"></script>\s*\n'
    content = re.sub(jquery_cdn_pattern, '', content)

    # Pattern 2: sample.js script tag
    sample_js_pattern = r'\s*<script type="text/javascript" src="\.\.\/js\/sample\.js"></script>\s*\n'
    content = re.sub(sample_js_pattern, '', content)

    # Also handle case without ../ prefix (for files in root or different structure)
    sample_js_pattern_alt = r'\s*<script type="text/javascript" src="js\/sample\.js"></script>\s*\n'
    content = re.sub(sample_js_pattern_alt, '', content)

    # Write back only if changes were made
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    # Get project root (parent of scripts/ directory)
    project_root = Path(__file__).parent.parent

    # Find all HTML files
    html_files = list(project_root.glob('**/*.html'))

    # Exclude node_modules and other unnecessary directories
    excluded_dirs = {'node_modules', '.git', 'Conversation_Summary'}
    html_files = [f for f in html_files if not any(ex in f.parts for ex in excluded_dirs)]

    modified_count = 0

    print(f"Found {len(html_files)} HTML files to process")
    print()

    for filepath in html_files:
        if remove_jquery_from_file(filepath):
            modified_count += 1
            # Get relative path for cleaner output
            rel_path = filepath.relative_to(project_root)
            print(f"✓ Modified: {rel_path}")

    print()
    print(f"Summary: Modified {modified_count} files")
    print(f"Estimated bundle size reduction: ~90KB (jQuery removed)")

if __name__ == '__main__':
    main()
