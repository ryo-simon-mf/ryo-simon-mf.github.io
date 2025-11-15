#!/usr/bin/env python3
"""
Fix incorrect sample.js paths in HTML files.
Changes src="js/sample.js" to src="../js/sample.js" for files in subdirectories.
"""

from pathlib import Path

def fix_sample_js_path(html_content, file_path):
    """Fix sample.js path if file is in a subdirectory."""

    # Only fix if file is in a subdirectory (not root)
    parts = file_path.parts
    if len(parts) == 1:
        # File is in root directory, path is already correct
        return html_content, False

    # Replace incorrect path with correct path
    if 'src="js/sample.js"' in html_content:
        html_content = html_content.replace('src="js/sample.js"', 'src="../js/sample.js"')
        return html_content, True

    return html_content, False

def main():
    root_dir = Path('.')
    html_files = list(root_dir.rglob('*.html'))

    excluded_dirs = {'.git', 'node_modules', 'Conversation_Summary'}
    html_files = [
        f for f in html_files
        if not any(excluded in f.parts for excluded in excluded_dirs)
    ]

    print(f"Fixing sample.js paths in {len(html_files)} HTML files...\n")

    fixed_count = 0

    for html_file in sorted(html_files):
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()

        fixed_content, was_fixed = fix_sample_js_path(content, html_file)

        if was_fixed:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"✓ {html_file}")
            fixed_count += 1

    print(f"\n✅ Fixed {fixed_count} files")

if __name__ == '__main__':
    main()
