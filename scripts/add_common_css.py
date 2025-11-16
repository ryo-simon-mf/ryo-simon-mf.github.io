#!/usr/bin/env python3
"""
Add common.css to all HTML files that use style_2.css
"""

import os
import re
from pathlib import Path

def add_common_css_to_file(file_path):
    """Add common.css link before style_2.css in an HTML file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if the file uses style_2.css
    if 'style_2.css' not in content:
        return False, "Does not use style_2.css"

    # Check if common.css is already included
    if 'common.css' in content:
        return False, "Already has common.css"

    # Pattern to find style_2.css link and add common.css before it
    pattern = r'(<link rel="stylesheet" href="[^"]*style_2\.css"[^>]*>)'

    # Add common.css link before style_2.css
    replacement = r'<link rel="stylesheet" href="../css/common.css" type="text/css">\n    \1'

    new_content = re.sub(pattern, replacement, content)

    if new_content == content:
        return False, "Pattern not found"

    # Write the updated content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True, "Updated"

def main():
    base_dir = Path.cwd()

    # Find all HTML files (excluding index.html)
    html_files = []
    for root, dirs, files in os.walk(base_dir):
        # Skip certain directories
        if any(skip in root for skip in ['.git', 'node_modules', 'scripts', '.claude']):
            continue

        for file in files:
            if file.endswith('.html') and file != 'index.html':
                html_files.append(Path(root) / file)

    print(f"Found {len(html_files)} HTML files to process\n")

    updated_count = 0
    skipped_count = 0

    for file_path in html_files:
        success, message = add_common_css_to_file(file_path)
        relative_path = file_path.relative_to(base_dir)

        if success:
            print(f"✓ {relative_path}")
            updated_count += 1
        else:
            skipped_count += 1
            # Uncomment to see why files were skipped
            # print(f"- {relative_path}: {message}")

    print(f"\n{'='*50}")
    print(f"Updated: {updated_count} files")
    print(f"Skipped: {skipped_count} files")
    print(f"{'='*50}")

if __name__ == '__main__':
    main()
