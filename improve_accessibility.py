#!/usr/bin/env python3
"""
Improve accessibility of HTML files.

1. Add alt attributes to images
2. Replace deprecated <s> tags with CSS classes
3. Add aria attributes where appropriate
"""

import re
import os
from pathlib import Path

def generate_alt_text(img_src):
    """Generate meaningful alt text from image source."""
    # Extract filename without extension
    filename = Path(img_src).stem

    # Clean up common patterns
    filename = filename.replace('_', ' ').replace('-', ' ')
    filename = filename.replace('  ', ' ').strip()

    # Capitalize first letter of each word
    alt_text = ' '.join(word.capitalize() for word in filename.split())

    return alt_text

def add_alt_attributes(content):
    """Add alt attributes to images that don't have them."""
    # Pattern: <img ... > without alt=
    pattern = r'<img\s+([^>]*?)(?<!alt=")>'

    def replace_img(match):
        attrs = match.group(1)

        # Check if alt attribute already exists
        if 'alt=' in attrs:
            return match.group(0)

        # Extract src for generating alt text
        src_match = re.search(r'src=["\']([^"\']+)["\']', attrs)
        if src_match:
            src = src_match.group(1)
            alt_text = generate_alt_text(src)
        else:
            alt_text = "Image"

        # Add alt attribute before closing >
        return f'<img {attrs.rstrip()} alt="{alt_text}">'

    return re.sub(pattern, replace_img, content)

def replace_s_tags(content):
    """Replace deprecated <s> tags with <span class='strikethrough'>."""
    # Replace opening tags
    content = re.sub(r'<s>', '<span class="strikethrough">', content)
    # Replace closing tags
    content = re.sub(r'</s>', '</span>', content)

    return content

def add_aria_labels(content):
    """Add aria labels to navigation elements."""
    # Add aria-label to navigation links if not present
    # This is a simple implementation - can be expanded

    # Add role="navigation" to menu divs
    content = re.sub(
        r'<div\s+id="menu"([^>]*)>',
        r'<div id="menu" role="navigation"\1>',
        content
    )

    return content

def process_html_file(filepath):
    """Process a single HTML file for accessibility improvements."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Apply improvements
    content = add_alt_attributes(content)
    content = replace_s_tags(content)
    content = add_aria_labels(content)

    # Track changes
    changes = []

    # Count added alt attributes
    original_imgs_no_alt = len(re.findall(r'<img\s+[^>]*?(?<!alt=")>', original_content))
    new_imgs_no_alt = len(re.findall(r'<img\s+[^>]*?(?<!alt=")>', content))
    alts_added = original_imgs_no_alt - new_imgs_no_alt
    if alts_added > 0:
        changes.append(f"{alts_added} alt attributes")

    # Count replaced <s> tags
    s_tags = original_content.count('<s>')
    if s_tags > 0:
        changes.append(f"{s_tags} <s> tags replaced")

    # Check if navigation role was added
    if 'role="navigation"' in content and 'role="navigation"' not in original_content:
        changes.append("navigation role added")

    # Only write if changes were made
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return changes

    return []

def main():
    """Process all HTML files for accessibility improvements."""
    base_dir = Path('.')
    html_files = list(base_dir.rglob('*.html'))

    # Exclude certain directories
    exclude_dirs = {'.git', 'node_modules', '.claude', 'Conversation_Summary'}
    html_files = [f for f in html_files if not any(ex in f.parts for ex in exclude_dirs)]

    total_alt_added = 0
    total_s_replaced = 0
    total_aria_added = 0
    files_modified = 0

    print(f"Processing {len(html_files)} HTML files for accessibility...\n")

    for filepath in html_files:
        changes = process_html_file(filepath)
        if changes:
            files_modified += 1
            print(f"✓ {filepath}: {', '.join(changes)}")

            for change in changes:
                if 'alt' in change:
                    total_alt_added += int(change.split()[0])
                if '<s>' in change:
                    total_s_replaced += int(change.split()[0])
                if 'navigation' in change:
                    total_aria_added += 1

    print(f"\n{'='*60}")
    print(f"Accessibility Improvements Summary:")
    print(f"  Files processed: {len(html_files)}")
    print(f"  Files modified: {files_modified}")
    print(f"  Alt attributes added: {total_alt_added}")
    print(f"  <s> tags replaced: {total_s_replaced}")
    print(f"  Navigation roles added: {total_aria_added}")
    print(f"{'='*60}")

    # Add CSS for strikethrough class
    print(f"\nNote: Add this CSS rule to style_2.css:")
    print(f"  .strikethrough {{ text-decoration: line-through; }}")

if __name__ == '__main__':
    main()
