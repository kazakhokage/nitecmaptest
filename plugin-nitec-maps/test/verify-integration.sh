#!/bin/bash

echo "🔍 Verifying Nitec Maps Plugin Integration"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

passed=0
failed=0

# Function to test something
test_check() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        ((passed++))
    else
        echo -e "${RED}❌ $1${NC}"
        ((failed++))
    fi
}

# Test 1: Check if build outputs exist
echo -e "\n📦 Checking build outputs..."
[ -f "lib/index.js" ]
test_check "lib/index.js exists" $?

[ -f "esm/index.js" ]
test_check "esm/index.js exists" $?

[ -f "lib/index.d.ts" ]
test_check "TypeScript definitions exist" $?

# Test 2: Check VizType registration
echo -e "\n🔧 Checking VizType registration..."
grep -q "NitecMaps = 'nitec_maps'" ../../packages/superset-ui-core/src/chart/types/VizType.ts
test_check "VizType.NitecMaps is registered" $?

# Test 3: Check MainPreset import
echo -e "\n📋 Checking MainPreset integration..."
grep -q "@superset-ui/plugin-chart-nitec-maps" ../../src/visualizations/presets/MainPreset.js
test_check "Plugin is imported in MainPreset" $?

grep -q "VizType.NitecMaps" ../../src/visualizations/presets/MainPreset.js
test_check "Plugin is registered with VizType.NitecMaps" $?

# Test 4: Check package.json
echo -e "\n📄 Checking package.json..."
grep -q '"name": "@superset-ui/plugin-chart-nitec-maps"' package.json
test_check "Package name is correct" $?

grep -q '"ol":' package.json
test_check "OpenLayers dependency exists" $?

grep -q '"ol-ext":' package.json
test_check "ol-ext dependency exists" $?

# Test 5: Check source files
echo -e "\n📁 Checking source files..."
[ -f "src/index.ts" ]
test_check "src/index.ts exists" $?

[ -f "src/NitecMaps.tsx" ]
test_check "src/NitecMaps.tsx exists" $?

[ -f "src/plugin/controlPanel.tsx" ]
test_check "Control panel exists" $?

[ -f "src/plugin/buildQuery.ts" ]
test_check "buildQuery exists" $?

[ -f "src/plugin/transformProps.ts" ]
test_check "transformProps exists" $?

# Test 6: Check test organization
echo -e "\n🧪 Checking test organization..."
[ -d "test/unit" ]
test_check "Unit tests directory exists" $?

[ -d "test/integration" ]
test_check "Integration tests directory exists" $?

[ -d "test/e2e" ]
test_check "E2E tests directory exists" $?

# Summary
echo -e "\n=========================================="
echo "📊 Test Summary:"
echo -e "${GREEN}✅ Passed: $passed${NC}"
echo -e "${RED}❌ Failed: $failed${NC}"
echo "📈 Total: $((passed + failed))"

if [ $failed -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All checks passed! The plugin is properly integrated.${NC}"
    echo -e "\n📝 Next steps:"
    echo "1. Clear browser cache"
    echo "2. Restart Superset dev server if needed"
    echo "3. Go to Charts → + Chart → Search for 'Nitec Maps'"
    exit 0
else
    echo -e "\n${RED}⚠️  Some checks failed. Please review the errors above.${NC}"
    exit 1
fi