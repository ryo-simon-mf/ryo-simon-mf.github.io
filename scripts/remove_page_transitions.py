#!/usr/bin/env python3
"""
Remove page transition CSS and JavaScript references from all HTML files.
Cleans up WIP page transition implementation.
"""

import re
from pathlib import Path

def remove_page_transitions(html_content):
    """
    Remove page-transitions.css and page-transitions.js references.

    Args:
        html_content (str): HTML file content

    Returns:
        tuple: (modified_content, count_of_removals)
    """
    count = 0

    # Remove page-transitions.css link
    if 'page-transitions.css' in html_content:
        html_content = re.sub(r'\s*<link rel="stylesheet" href="[^"]*page-transitions\.css">\n?', '', html_content)
        count += 1

    # Remove page-transitions.js script
    if 'page-transitions.js' in html_content:
        html_content = re.sub(r'\s*<script src="[^"]*page-transitions\.js"></script>\n?', '', html_content)
        count += 1

    return html_content, count

def process_html_file(file_path):
    """
    Process a single HTML file to remove page transitions.

    Args:
        file_path (Path): Path to HTML file

    Returns:
        int: Number of references removed
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        modified_content, count = remove_page_transitions(content)

        if count > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(modified_content)
            print(f"✓ {file_path}: Removed {count} references")
        else:
            print(f"- {file_path}: No page transition references found")

        return count

    except Exception as e:
        print(f"✗ {file_path}: Error - {e}")
        return 0

def main():
    """Main function to process all HTML files."""
    print("Removing page transition references from HTML files...\n")

    # Get current directory
    root_dir = Path('.')

    # Find all HTML files
    html_files = list(root_dir.rglob('*.html'))

    # Exclude certain directories
    excluded_dirs = {'.git', 'node_modules', 'Conversation_Summary'}
    excluded_files = {'menu-content.html'}

    html_files = [
        f for f in html_files
        if not any(excluded in f.parts for excluded in excluded_dirs)
        and f.name not in excluded_files
    ]

    print(f"Found {len(html_files)} HTML files\n")

    total_removals = 0
    modified_files = 0

    for html_file in sorted(html_files):
        count = process_html_file(html_file)
        if count > 0:
            total_removals += count
            modified_files += 1

    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Total files processed: {len(html_files)}")
    print(f"  Files modified: {modified_files}")
    print(f"  Total references removed: {total_removals}")
    print(f"{'='*60}")

    print(f"\nPage transitions removed:")
    print(f"  - css/page-transitions.css (deleted)")
    print(f"  - js/page-transitions.js (deleted)")
    print(f"  - All HTML references cleaned up")

if __name__ == '__main__':
    main()
