#!/usr/bin/env node
// All version-bearing manifests must share one semver.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const FILES = [
  '.claude-plugin/plugin.json',
  '.codex-plugin/plugin.json',
  '.devin-plugin/plugin.json',
  '.github/plugin/plugin.json',
  '.qoder-plugin/plugin.json',
  'gemini-extension.json',
  'package.json',
];

const versions = FILES.map((rel) => ({
  rel,
  version: JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')).version,
}));
const yaml = fs.readFileSync(path.join(root, 'plugin.yaml'), 'utf8').match(/^version:\s*(\S+)/m);
versions.push({ rel: 'plugin.yaml', version: yaml && yaml[1] });

const pinned = versions[0].version;
const bad = versions.filter((v) => v.version !== pinned);
if (bad.length) {
  console.error(`version mismatch (expected ${pinned}):`);
  for (const b of bad) console.error(`  ${b.rel}: ${b.version}`);
  process.exit(1);
}
console.log(`all ${versions.length} manifests at ${pinned}`);
