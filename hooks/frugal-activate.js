#!/usr/bin/env node
// SessionStart hook: inject the frugal ruleset (SKILL.md body) as context.
// Native Claude Code takes raw stdout for SessionStart.

const fs = require('fs');
const path = require('path');

const SKILL_PATH = path.join(__dirname, '..', 'skills', 'frugal', 'SKILL.md');

const FALLBACK =
  'FRUGAL MODE ACTIVE — cloud cost awareness\n\n' +
  'Metered cloud services (Vercel, Cloudflare, Neon, Railway, Fly.io, E2B, ' +
  'Browserbase, Codespaces, AWS/GCP/Azure, Supabase) bill by usage. ' +
  'First touch of one in a session: check or mention current usage. ' +
  'Before creating a paid resource: tell the user in one line. ' +
  'Kill sandboxes and delete test resources when done. ' +
  'Never silently make a spend decision for the user.\n';

try {
  const body = fs.readFileSync(SKILL_PATH, 'utf8').replace(/^---[\s\S]*?---\s*/, '');
  process.stdout.write('FRUGAL MODE ACTIVE — cloud cost awareness\n\n' + body);
} catch {
  process.stdout.write(FALLBACK);
}
