#!/usr/bin/env node
// UserPromptSubmit: handle /frugal quiet|normal|strict|off|default <mode>
// and re-inject level confirmation. Cheat-sheet requests leave mode alone.

const {
  getDefaultMode,
  normalizeMode,
  setSessionMode,
  writeDefaultMode,
} = require('./frugal-config');
const { getFrugalInstructions } = require('./frugal-instructions');
const { writeHookOutput } = require('./frugal-runtime');

let input = '';
let done = false;

function finish(context) {
  if (done) return;
  done = true;
  if (context) writeHookOutput('UserPromptSubmit', context);
  process.exit(0);
}

setTimeout(() => finish(), 1000).unref();
process.stdin.on('error', () => finish());
process.stdin.on('data', (d) => { input += d; });
process.stdin.on('end', () => {
  let data;
  try {
    data = JSON.parse(input.replace(/^\uFEFF/, ''));
  } catch {
    return finish();
  }

  const prompt = String(data.prompt || data.message || '').trim();
  const lower = prompt.toLowerCase();

  // Match slash/at/dollar command forms hosts may use.
  if (!/^[/@$]frugal\b/.test(lower) && !/^frugal\s+(quiet|normal|strict|off|default)\b/.test(lower)) {
    return finish();
  }

  const parts = lower.replace(/^[@$]/, '/').split(/\s+/);
  // /frugal or /plugin:frugal etc.
  const cmd = parts[0];
  if (!cmd.includes('frugal')) return finish();

  const arg = parts[1] || '';
  const arg2 = parts[2] || '';

  if (arg === 'default') {
    const dmode = normalizeMode(arg2);
    if (dmode) {
      writeDefaultMode(dmode);
      setSessionMode(dmode);
      return finish(
        'FRUGAL DEFAULT SET — new sessions start in ' + dmode + '.\n\n' +
        (dmode === 'off' ? 'FRUGAL MODE OFF\n' : getFrugalInstructions(dmode))
      );
    }
    return finish('FRUGAL: usage `/frugal default quiet|normal|strict|off`');
  }

  if (arg === '' || arg === 'help' || arg === 'status') {
    const mode = getDefaultMode();
    return finish('FRUGAL MODE ACTIVE — level: ' + mode +
      '. Switch: `/frugal quiet|normal|strict|off`. Cheat-sheet: invoke `/frugal` skill without a level.');
  }

  const mode = normalizeMode(arg);
  if (!mode) {
    // Not a level switch — leave alone so the /frugal skill/command can run.
    return finish();
  }

  setSessionMode(mode);
  if (mode === 'off') {
    return finish('FRUGAL MODE OFF');
  }
  return finish('FRUGAL MODE CHANGED — level: ' + mode + '\n\n' + getFrugalInstructions(mode));
});
