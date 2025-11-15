#!/usr/bin/env python3
"""
Add page transition CSS and JavaScript to all HTML files.
Provides smooth fade animations when navigating between pages.
"""

import os
import re
from pathlib import Path

def add_page_transitions(html_content, file_path):
    """
    Add page transition CSS and JS to HTML file if not already present.

    Args:
        html_content (str): HTML content
        file_path (Path): Path to the HTML file (for determining relative paths)

    Returns:
        tuple: (modified_content, changes_made)
    """
    changes = []

    # Determine the correct relative path to css/ and js/ directories
    # Count how many directories deep the file is from the root
    # index.html is at root (depth 0): ./css/
    # about/about.html is 1 level deep: ../css/
    # works/works.html is 1 level deep: ../css/

    # Get relative path from file to root
    parts = file_path.parts
    # Find the index of the root (where we run the script from)
    # If file is "works/works.html", parts = ('works', 'works.html')
    # If file is "index.html", parts = ('index.html',)

    depth = len(parts) - 1  # Number of directories deep (exclude filename)

    if depth == 0:
        prefix = ''
    else:
        prefix = '../' * depth

    css_link = f'<link rel="stylesheet" href="{prefix}css/page-transitions.css">'
    js_script = f'<script src="{prefix}js/page-transitions.js"></script>'

    # Check if CSS link already exists
    if 'page-transitions.css' not in html_content:
        # Find </head> and insert CSS link before it
        if '</head>' in html_content:
            html_content = html_content.replace(
                '</head>',
                f'    {css_link}\n</head>'
            )
            changes.append('Added page-transitions.css')

    # Check if JS script already exists
    if 'page-transitions.js' not in html_content:
        # Find </body> and insert JS script before it
        if '</body>' in html_content:
            html_content = html_content.replace(
                '</body>',
                f'    {js_script}\n</body>'
            )
            changes.append('Added page-transitions.js')

    return html_content, changes

def process_html_file(file_path):
    """
    Process a single HTML file to add page transitions.

    Args:
        file_path (Path): Path to HTML file

    Returns:
        int: Number of changes made
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        modified_content, changes = add_page_transitions(content, file_path)

        if changes:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(modified_content)
            print(f"✓ {file_path}: {', '.join(changes)}")
            return len(changes)
        else:
            print(f"- {file_path}: Already has page transitions")
            return 0

    except Exception as e:
        print(f"✗ {file_path}: Error - {e}")
        return 0

def main():
    """Main function to process all HTML files."""
    print("Adding page transition CSS and JavaScript to all HTML files...\n")

    # Get current directory
    root_dir = Path('.')

    # Find all HTML files
    html_files = list(root_dir.rglob('*.html'))

    # Exclude certain directories and files
    excluded_dirs = {'.git', 'node_modules', 'Conversation_Summary'}
    excluded_files = {'menu-content.html'}  # Menu is loaded dynamically, skip it

    html_files = [
        f for f in html_files
        if not any(excluded in f.parts for excluded in excluded_dirs)
        and f.name not in excluded_files
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
    print(f"  Total changes: {total_changes}")
    print(f"{'='*60}")

    print(f"\nPage transitions added:")
    print(f"  - Fade-in effect on page load (0.5s)")
    print(f"  - Fade-out effect on link click (0.3s)")
    print(f"  - Smooth navigation between pages")

if __name__ == '__main__':
    main()
