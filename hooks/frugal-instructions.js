#!/usr/bin/env node
// Shared instruction builder: every host (Claude hooks, Codex, Copilot,
// OpenCode, pi) injects the same SKILL.md body through this one function.

const fs = require('fs');
const path = require('path');

const SKILL_PATH = path.join(__dirname, '..', 'skills', 'frugal', 'SKILL.md');
const HEADER = 'FRUGAL MODE ACTIVE — cloud cost awareness\n\n';

const FALLBACK =
  HEADER +
  'Metered cloud services (Vercel, Cloudflare, Neon, Railway, Fly.io, E2B, ' +
  'Browserbase, GitHub Actions/Codespaces, AWS/GCP/Azure, Supabase) bill by usage. ' +
  'First touch of one in a session: check or mention current usage. ' +
  'Before creating a paid resource: tell the user in one line. ' +
  'Kill sandboxes and delete test resources when done. ' +
  'Never silently make a spend decision for the user.\n';

function getFrugalInstructions() {
  try {
    const body = fs.readFileSync(SKILL_PATH, 'utf8').replace(/^---[\s\S]*?---\s*/, '');
    return HEADER + body;
  } catch {
    return FALLBACK;
  }
}

module.exports = { getFrugalInstructions };
