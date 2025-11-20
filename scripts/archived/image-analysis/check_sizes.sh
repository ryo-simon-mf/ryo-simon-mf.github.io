#!/bin/bash
cd /Users/ryosimon/Documents/Homepage/ryo-simon-mf.github.io
grep -o 'data-src="../image/[^"]*"' works/works.html | sed 's/data-src="\.\.\/image\///' | sed 's/"//' | while read img; do
  if [ -f "image/$img" ]; then
    size=$(ls -lh "image/$img" | awk '{print $5}')
    echo "$size $img"
  fi
done | sort -hr
