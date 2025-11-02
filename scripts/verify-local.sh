#!/bin/bash

set -e

echo "🔍 Verifying local setup..."
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install --silent

echo ""
echo "🔤 Type checking..."
npx tsc --noEmit

echo ""
echo "🔍 Linting..."
npm run lint

echo ""
echo "🧪 Running unit tests..."
npm run test

echo ""
echo "🏗️  Building..."
npm run build

echo ""
echo "📂 Verifying output files..."
FILES=(
    "dist/index.html"
    "dist/assets"
    "public/data/items.json"
    "public/data/markers.json"
    "public/control-panel.html"
    "public/examples/leaflet.html"
)

for file in "${FILES[@]}"; do
    if [ ! -e "$file" ]; then
        echo "❌ Missing: $file"
        exit 1
    else
        echo "✅ Found: $file"
    fi
done

echo ""
echo "📏 Checking file sizes..."
MARKERS_SIZE=$(stat -f%z "public/data/markers.json" 2>/dev/null || stat -c%s "public/data/markers.json")
ITEMS_SIZE=$(stat -f%z "public/data/items.json" 2>/dev/null || stat -c%s "public/data/items.json")

echo "  markers.json: $(echo "scale=2; $MARKERS_SIZE/1024/1024" | bc)MB"
echo "  items.json: $(echo "scale=2; $ITEMS_SIZE/1024" | bc)KB"

echo ""
echo "🎯 Checking dist paths..."
if grep -q 'href="/niskayuniverse/' dist/index.html; then
    echo "✅ Using GitHub Pages paths (/niskayuniverse/)"
elif grep -q 'href="/' dist/index.html; then
    echo "⚠️  Using root paths - may not work on GitHub Pages"
else
    echo "✅ Using relative paths"
fi

echo ""
echo "✅ All verifications passed!"
echo ""
echo "Next steps:"
echo "  1. Run: npm run preview"
echo "  2. Test at: http://localhost:4173"
echo "  3. Push to deploy: git push origin main"