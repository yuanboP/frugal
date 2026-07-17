#!/usr/bin/env node
// SessionStart hook: inject the frugal ruleset at the active intensity level.

const { writeHookOutput } = require('./frugal-runtime');
const { getFrugalInstructions } = require('./frugal-instructions');
const { getDefaultMode } = require('./frugal-config');

const mode = getDefaultMode();
if (mode === 'off') {
  writeHookOutput('SessionStart', '');
} else {
  writeHookOutput('SessionStart', getFrugalInstructions(mode));
}
