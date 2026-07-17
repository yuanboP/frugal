#!/usr/bin/env node
// Shared instruction builder: every host injects the same text through here.
//
// Inject AGENTS.md (compact rules), NOT SKILL.md — quota tables stay on-demand.
// Intensity table rows are filtered to the active mode (ponytail-style).

const fs = require('fs');
const path = require('path');
const { DEFAULT_MODE, getDefaultMode, normalizeMode } = require('./frugal-config');

const RULES_PATH = path.join(__dirname, '..', 'AGENTS.md');
const HEADER = 'FRUGAL MODE ACTIVE — level: ';

const FALLBACK_BODY =
  'Metered cloud services bill by usage. First touch: one short line on how ' +
  'it bills. Optional dig if cheap. Escalate only for scary spend. Kill ' +
  'ephemeral resources in-session. Never silently spend for the user.\n';

function filterBodyForMode(body, mode) {
  const effective = normalizeMode(mode) || DEFAULT_MODE;
  return String(body || '')
    .split(/\r?\n/)
    .filter((line) => {
      const tableLabel = line.match(/^\|\s*\*\*(.+?)\*\*\s*\|/);
      if (tableLabel) {
        const labelMode = normalizeMode(tableLabel[1].trim());
        if (labelMode) return labelMode === effective;
      }
      return true;
    })
    .join('\n');
}

function getFrugalInstructions(mode) {
  const effective = normalizeMode(mode) || getDefaultMode() || DEFAULT_MODE;
  if (effective === 'off') {
    return 'FRUGAL MODE OFF\n';
  }

  try {
    const raw = fs.readFileSync(RULES_PATH, 'utf8').replace(/^# Frugal\s*/, '');
    const body = filterBodyForMode(raw, effective);
    return HEADER + effective + '\n\n' + body +
      '\nPer-provider reminders (mode-scaled) arrive when you use billable CLIs.\n';
  } catch {
    return HEADER + effective + '\n\n' + FALLBACK_BODY;
  }
}

module.exports = { getFrugalInstructions, filterBodyForMode };
