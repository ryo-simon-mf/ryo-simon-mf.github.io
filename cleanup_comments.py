#!/usr/bin/env python3
"""
Clean up unnecessary HTML comments from portfolio site.

Removes:
- Commented-out HTML code blocks
- Test comments
- Empty comment blocks

Preserves:
- Section labels (e.g., <!-- SEO Meta Tags -->)
- Script/library descriptions
- Functional comments
"""

import re
import os
from pathlib import Path

def should_keep_comment(comment_content):
    """
    Determine if a comment should be kept.

    Keep comments that are:
    - Section labels (short, descriptive)
    - Library/script descriptions
    - Functional explanations
    """
    # Strip whitespace for analysis
    content = comment_content.strip()

    # Keep short descriptive comments (section labels)
    short_descriptive = [
        'SEO Meta Tags', 'OGP Meta Tags', 'icon', 'jQuery', 'p5.js',
        'own sketch', 'swiper', 'title', 'content', 'menu',
        'Menu content loaded dynamically', 'Dynamic Menu Loader',
        'Heading', 'Subheading', 'Original Custom', 'ニュース',
        'Works Filter', 'Subtitle'
    ]

    for phrase in short_descriptive:
        if phrase.lower() in content.lower():
            return True

    # Remove test comments
    if content.lower() in ['test', 'testing']:
        return False

    # Remove empty or whitespace-only comments
    if not content or content.isspace():
        return False

    # Remove commented-out HTML code (contains < or >)
    # But preserve comments that just describe HTML sections
    if '<' in content and '>' in content:
        return False

    # Keep everything else (descriptive text)
    return True

def clean_html_file(filepath):
    """Clean unnecessary comments from a single HTML file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Find all HTML comments
    # Pattern: <!-- ... --> (non-greedy, multiline)
    pattern = r'<!--(.*?)-->'

    def replace_comment(match):
        comment_content = match.group(1)
        if should_keep_comment(comment_content):
            return match.group(0)  # Keep original comment
        else:
            # Check if comment is on its own line
            # If so, remove the entire line including leading whitespace
            full_match = match.group(0)
            return ''  # Remove comment

    # Replace comments
    cleaned_content = re.sub(pattern, replace_comment, content, flags=re.DOTALL)

    # Remove lines that contain only whitespace after comment removal
    lines = cleaned_content.split('\n')
    cleaned_lines = []

    for i, line in enumerate(lines):
        # If line has actual content, keep it
        if line.strip():
            cleaned_lines.append(line)
        # If line is blank, only keep it if previous line had content
        # This prevents multiple consecutive blank lines
        elif cleaned_lines and cleaned_lines[-1].strip():
            cleaned_lines.append(line)

    cleaned_content = '\n'.join(cleaned_lines)

    # Count removed comments
    original_count = len(re.findall(pattern, content, flags=re.DOTALL))
    cleaned_count = len(re.findall(pattern, cleaned_content, flags=re.DOTALL))
    removed_count = original_count - cleaned_count

    # Only write if changes were made
    if content != cleaned_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(cleaned_content)
        return removed_count, original_count

    return 0, original_count

def main():
    """Clean comments from all HTML files in the project."""
    base_dir = Path('.')
    html_files = list(base_dir.rglob('*.html'))

    # Exclude certain directories
    exclude_dirs = {'.git', 'node_modules', '.claude', 'Conversation_Summary'}
    html_files = [f for f in html_files if not any(ex in f.parts for ex in exclude_dirs)]

    total_removed = 0
    total_comments = 0
    files_modified = 0

    print(f"Found {len(html_files)} HTML files to process\n")

    for filepath in html_files:
        removed, original = clean_html_file(filepath)
        if removed > 0:
            files_modified += 1
            print(f"✓ {filepath}: removed {removed}/{original} comments")
        total_removed += removed
        total_comments += original

    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Files processed: {len(html_files)}")
    print(f"  Files modified: {files_modified}")
    print(f"  Total comments removed: {total_removed}/{total_comments}")
    print(f"  Comments kept: {total_comments - total_removed}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
