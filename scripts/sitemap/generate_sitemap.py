#!/usr/bin/env python3
"""
Generate sitemap.xml for the portfolio website.

This script creates a comprehensive sitemap including:
- Homepage
- Main section pages (Works, About, Gallery, Contact, CV)
- Individual work detail pages (31 works)
"""

import json
from datetime import datetime
from pathlib import Path


def generate_sitemap():
    """Generate sitemap.xml from works-data and static pages."""
    project_root = Path(__file__).parent.parent
    index_file = project_root / 'works-data' / 'index.json'

    # Load works data
    with open(index_file, 'r', encoding='utf-8') as f:
        index_data = json.load(f)

    works = index_data['works']
    today = datetime.now().strftime('%Y-%m-%d')

    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    # Static pages configuration
    static_pages = [
        {
            'loc': 'https://ryo-simon-mf.github.io/',
            'priority': '1.0',
            'changefreq': 'weekly'
        },
        {
            'loc': 'https://ryo-simon-mf.github.io/works/works.html',
            'priority': '0.9',
            'changefreq': 'weekly'
        },
        {
            'loc': 'https://ryo-simon-mf.github.io/about/about.html',
            'priority': '0.8',
            'changefreq': 'monthly'
        },
        {
            'loc': 'https://ryo-simon-mf.github.io/Gallery/Gallery.html',
            'priority': '0.7',
            'changefreq': 'monthly'
        },
        {
            'loc': 'https://ryo-simon-mf.github.io/contact/contact.html',
            'priority': '0.6',
            'changefreq': 'yearly'
        },
        {
            'loc': 'https://ryo-simon-mf.github.io/cv/cv.html',
            'priority': '0.7',
            'changefreq': 'monthly'
        },
        {
            'loc': 'https://ryo-simon-mf.github.io/portfolio/portfolio.html',
            'priority': '0.6',
            'changefreq': 'yearly'
        }
    ]

    # Add static pages
    for page in static_pages:
        sitemap.append(f'''  <url>
    <loc>{page['loc']}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>{page['changefreq']}</changefreq>
    <priority>{page['priority']}</priority>
  </url>''')

    # Add individual works (SPA hash URLs)
    for work in works:
        sitemap.append(f'''  <url>
    <loc>https://ryo-simon-mf.github.io/works/works.html#{work['id']}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>''')

    sitemap.append('</urlset>')

    # Write sitemap.xml
    output_file = project_root / 'sitemap.xml'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sitemap))

    # Summary
    total_urls = len(static_pages) + len(works)
    print(f"✅ Generated sitemap.xml")
    print(f"   - {len(static_pages)} static pages")
    print(f"   - {len(works)} work detail pages")
    print(f"   - {total_urls} total URLs")
    print(f"   - File: {output_file}")
    print(f"   - Size: {output_file.stat().st_size} bytes")


if __name__ == '__main__':
    generate_sitemap()
