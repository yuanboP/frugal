#!/usr/bin/env node
// Drift guard: every static rule copy must equal the AGENTS.md body after
// stripping host frontmatter. ponytail-style check, not a generator —
// regenerate with: see README "Static rule copies".

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const canonical = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8').trim();

const COPIES = [
  '.cursor/rules/frugal.mdc',
  '.windsurf/rules/frugal.md',
  '.clinerules/frugal.md',
  '.kiro/steering/frugal.md',
  '.qoder/rules/frugal.md',
  '.github/copilot-instructions.md',
  '.agents/rules/frugal.md',
];

let failed = false;
for (const rel of COPIES) {
  const body = fs.readFileSync(path.join(root, rel), 'utf8')
    .replace(/^---[\s\S]*?---\s*/, '')
    .trim();
  if (body !== canonical) {
    console.error(`DRIFT: ${rel} differs from AGENTS.md`);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log(`rule copies in sync (${COPIES.length} files)`);
