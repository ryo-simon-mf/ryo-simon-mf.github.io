#!/bin/bash
cd /Users/ryosimon/Documents/Homepage/ryo-simon-mf.github.io
TOTAL=0
grep -o 'data-src="../image/[^"]*"' works/works.html | sed 's/data-src="\.\.\/image\///' | sed 's/"//' | while read img; do
  if [ -f "image/$img" ]; then
    size=$(stat -f%z "image/$img")
    TOTAL=$((TOTAL + size))
    echo $TOTAL > /tmp/running_total.txt
  fi
done
cat /tmp/running_total.txt
