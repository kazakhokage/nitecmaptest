#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Nitec Maps Plugin Integration...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Test 1: Check if build outputs exist
test('Build outputs exist', () => {
  assert(fs.existsSync(path.join(__dirname, '../lib/index.js')), 'lib/index.js not found - run npm run build');
  assert(fs.existsSync(path.join(__dirname, '../esm/index.js')), 'esm/index.js not found - run npm run build');
  assert(fs.existsSync(path.join(__dirname, '../lib/index.d.ts')), 'TypeScript definitions not found');
});

// Test 2: Check package.json configuration
test('Package.json is correctly configured', () => {
  const pkg = require('../package.json');
  assert(pkg.name === '@superset-ui/plugin-chart-nitec-maps', 'Package name incorrect');
  assert(pkg.main === 'lib/index.js', 'Main entry point incorrect');
  assert(pkg.module === 'esm/index.js', 'Module entry point incorrect');
  assert(pkg.dependencies.ol, 'OpenLayers dependency missing');
  assert(pkg.dependencies['ol-ext'], 'ol-ext dependency missing');
});

// Test 3: Check VizType registration
test('VizType enum includes NitecMaps', () => {
  const vizTypePath = path.join(__dirname, '../../../packages/superset-ui-core/src/chart/types/VizType.ts');
  const vizTypeContent = fs.readFileSync(vizTypePath, 'utf8');
  assert(vizTypeContent.includes("NitecMaps = 'nitec_maps'"), 'VizType.NitecMaps not found');
});

// Test 4: Check MainPreset registration
test('MainPreset imports and registers plugin', () => {
  const mainPresetPath = path.join(__dirname, '../../../src/visualizations/presets/MainPreset.js');
  const mainPresetContent = fs.readFileSync(mainPresetPath, 'utf8');
  
  assert(mainPresetContent.includes('plugin-nitec-maps'), 'Plugin import not found');
  assert(mainPresetContent.includes('VizType.NitecMaps'), 'Plugin registration not found');
});

// Test 5: Check plugin export structure
test('Plugin exports correct structure', () => {
  const PluginClass = require('../lib/index.js').default;
  assert(typeof PluginClass === 'function', 'Plugin should export a class/function');
  
  const plugin = new PluginClass();
  assert(plugin.metadata, 'Plugin should have metadata');
  assert(plugin.buildQuery, 'Plugin should have buildQuery method');
  assert(plugin.transformProps, 'Plugin should have transformProps method');
  assert(plugin.controlPanel, 'Plugin should have controlPanel');
});

// Test summary
console.log('\n📊 Summary:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Total: ${passed + failed}`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! The plugin is properly integrated.');
  console.log('\n🚀 Next steps:');
  console.log('1. Restart Superset dev server if running');
  console.log('2. Navigate to Charts → + Chart');
  console.log('3. Search for "Nitec Maps"');
} else {
  console.log('\n⚠️  Some tests failed. Please check the errors above.');
  console.log('\n🔧 To fix:');
  console.log('1. Run: npm run build');
  console.log('2. Ensure all files are saved');
  console.log('3. Restart Superset dev server');
}

console.log('\n📝 Manual verification in browser console:');
console.log("require('@superset-ui/core').VizType.NitecMaps");
console.log("// Should return: 'nitec_maps'");

process.exit(failed > 0 ? 1 : 0);