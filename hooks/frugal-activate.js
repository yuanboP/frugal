#!/usr/bin/env node
// SessionStart hook: inject the frugal ruleset. Host-specific output shape
// is handled by frugal-runtime.

const { writeHookOutput } = require('./frugal-runtime');
const { getFrugalInstructions } = require('./frugal-instructions');

writeHookOutput('SessionStart', getFrugalInstructions());
