#!/usr/bin/env python3
"""
Remove deprecated HTML attributes (align, etc.) and replace with CSS classes.
Modernizes HTML to HTML5 standards.
"""

import os
import re
from pathlib import Path

def remove_align_attributes(html_content):
    """
    Remove align attributes from HTML tags.

    The align attribute is deprecated in HTML5. For <div align="center"> without
    other classes, we replace with class="center-container". For tags that already
    have classes (like img_wrap, img_pro), we just remove the align attribute.

    Args:
        html_content (str): HTML content

    Returns:
        tuple: (modified_content, count_of_changes)
    """
    count = 0

    # First, handle <div align="center"> that has no class attribute
    # Replace with <div class="center-container">
    def replace_div_align_no_class(match):
        nonlocal count
        count += 1
        return '<div class="center-container">'

    pattern1 = r'<div align=["\']center["\']>'
    modified_content = re.sub(pattern1, replace_div_align_no_class, html_content)

    # Then, remove align attributes from tags that already have classes
    # (like <div class="img_wrap" align="center">)
    def replace_align_with_class(match):
        nonlocal count
        count += 1
        return ''

    pattern2 = r'\s+align=["\'][^"\']*["\']'
    modified_content = re.sub(pattern2, replace_align_with_class, modified_content)

    return modified_content, count

def process_html_file(file_path):
    """
    Process a single HTML file to remove deprecated attributes.

    Args:
        file_path (Path): Path to HTML file

    Returns:
        int: Number of attributes removed
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        modified_content, count = remove_align_attributes(content)

        if count > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(modified_content)
            print(f"✓ {file_path}: Removed {count} align attributes")
        else:
            print(f"- {file_path}: No deprecated attributes found")

        return count

    except Exception as e:
        print(f"✗ {file_path}: Error - {e}")
        return 0

def main():
    """Main function to process all HTML files."""
    print("Removing deprecated HTML attributes...\n")

    # Get current directory
    root_dir = Path('.')

    # Find all HTML files
    html_files = list(root_dir.rglob('*.html'))

    # Exclude certain directories
    excluded_dirs = {'.git', 'node_modules', 'Conversation_Summary'}
    html_files = [
        f for f in html_files
        if not any(excluded in f.parts for excluded in excluded_dirs)
    ]

    print(f"Found {len(html_files)} HTML files\n")

    total_changes = 0
    modified_files = 0

    for html_file in sorted(html_files):
        count = process_html_file(html_file)
        if count > 0:
            total_changes += count
            modified_files += 1

    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Total files processed: {len(html_files)}")
    print(f"  Files modified: {modified_files}")
    print(f"  Total attributes removed: {total_changes}")
    print(f"{'='*60}")

    print(f"\nNote: Most align='center' attributes were redundant as:")
    print(f"  - .img_wrap already uses display: inline-block")
    print(f"  - Parent containers already handle centering")
    print(f"  - CSS text-align is inherited from parent divs")

if __name__ == '__main__':
    main()
