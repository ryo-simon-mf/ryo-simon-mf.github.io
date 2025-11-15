#!/usr/bin/env python3
"""
Fix incorrect page-transitions paths in HTML files.
Remove old incorrect paths and add correct ones.
"""

import re
from pathlib import Path

def fix_paths(html_content, file_path):
    """Fix page transition paths."""

    # Remove any existing page-transitions references
    html_content = re.sub(r'\s*<link rel="stylesheet" href="[^"]*page-transitions\.css">\n?', '', html_content)
    html_content = re.sub(r'\s*<script src="[^"]*page-transitions\.js"></script>\n?', '', html_content)

    # Calculate correct path
    parts = file_path.parts
    depth = len(parts) - 1

    if depth == 0:
        prefix = ''
    else:
        prefix = '../' * depth

    css_link = f'    <link rel="stylesheet" href="{prefix}css/page-transitions.css">'
    js_script = f'    <script src="{prefix}js/page-transitions.js"></script>'

    # Add CSS before </head>
    if '</head>' in html_content:
        html_content = html_content.replace('</head>', f'{css_link}\n</head>')

    # Add JS before </body>
    if '</body>' in html_content:
        html_content = html_content.replace('</body>', f'{js_script}\n</body>')

    return html_content

def main():
    root_dir = Path('.')
    html_files = list(root_dir.rglob('*.html'))

    excluded_dirs = {'.git', 'node_modules', 'Conversation_Summary'}
    excluded_files = {'menu-content.html'}

    html_files = [
        f for f in html_files
        if not any(excluded in f.parts for excluded in excluded_dirs)
        and f.name not in excluded_files
    ]

    print(f"Fixing {len(html_files)} HTML files...\n")

    for html_file in sorted(html_files):
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()

        fixed_content = fix_paths(content, html_file)

        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(fixed_content)

        print(f"✓ {html_file}")

    print(f"\n✅ Done! All paths fixed.")

if __name__ == '__main__':
    main()
