#!/usr/bin/env python3
"""
Add loading="lazy" attribute to all <img> tags in HTML files.
Improves page load performance by deferring offscreen image loading.
"""

import os
import re
from pathlib import Path

def add_lazy_loading(html_content):
    """
    Add loading="lazy" to <img> tags that don't already have it.

    Args:
        html_content (str): HTML content

    Returns:
        tuple: (modified_content, count_of_changes)
    """
    count = 0

    # Pattern to match <img> tags without loading attribute
    # This regex matches <img tags and checks if they don't have loading= attribute
    def replace_img(match):
        nonlocal count
        img_tag = match.group(0)

        # Skip if already has loading attribute
        if 'loading=' in img_tag:
            return img_tag

        # Find the position to insert loading="lazy"
        # Insert before the closing > or />
        if img_tag.endswith('/>'):
            # Self-closing tag
            modified = img_tag[:-2] + ' loading="lazy"/>'
        elif img_tag.endswith('>'):
            # Regular tag
            modified = img_tag[:-1] + ' loading="lazy">'
        else:
            return img_tag

        count += 1
        return modified

    # Match <img tags (both self-closing and regular)
    pattern = r'<img[^>]*>'
    modified_content = re.sub(pattern, replace_img, html_content)

    return modified_content, count

def process_html_file(file_path):
    """
    Process a single HTML file to add lazy loading.

    Args:
        file_path (Path): Path to HTML file

    Returns:
        int: Number of img tags modified
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        modified_content, count = add_lazy_loading(content)

        if count > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(modified_content)
            print(f"✓ {file_path}: Added lazy loading to {count} images")
        else:
            print(f"- {file_path}: No changes needed")

        return count

    except Exception as e:
        print(f"✗ {file_path}: Error - {e}")
        return 0

def main():
    """Main function to process all HTML files."""
    print("Adding loading='lazy' to all <img> tags...\n")

    # Get current directory
    root_dir = Path('.')

    # Find all HTML files
    html_files = list(root_dir.rglob('*.html'))

    # Exclude certain directories if needed
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
    print(f"  Total img tags updated: {total_changes}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
