#!/bin/bash
# Pre-compress all static assets for Nginx
# Run this after every build: npm run build && ./compress_assets.sh

set -e

STATIC_DIR="/home/png/bandoxanh/.next/static"

echo "Pre-compressing static assets..."

# Find and gzip all JS, CSS, and HTML files
find "$STATIC_DIR" -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.json" -o -name "*.svg" -o -name "*.txt" \) | while read file; do
    # Skip if .gz already exists and is newer
    if [ ! -f "$file.gz" ] || [ "$file" -nt "$file.gz" ]; then
        gzip -9 -k -f "$file"
        echo "Compressed: $file"
    fi
done

echo "Pre-compression complete!"
echo "Total .gz files: $(find "$STATIC_DIR" -name "*.gz" | wc -l)"
