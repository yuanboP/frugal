#!/usr/bin/env node
// PreToolUse(Bash) hook: when a command touches a metered cloud provider,
// inject a one-line cost reminder. Once per provider per session. Never
// blocks the command, never hangs, fails silent.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { detectProviders } = require('./providers');
const { writeHookOutput } = require('./frugal-runtime');

function finish(context) {
  if (context) writeHookOutput('PreToolUse', context);
  process.exit(0);
}

let raw = '';
setTimeout(() => finish(), 1000).unref(); // stdin may never emit 'end' on some hosts
process.stdin.on('error', () => finish());
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw.replace(/^﻿/, ''));
  } catch {
    return finish();
  }
  const command = input && input.tool_input && input.tool_input.command;
  if (!command) return finish();

  const hits = detectProviders(command, input);
  if (!hits.length) return finish();

  // ponytail: throttle state lives in tmpdir keyed by session_id — the OS
  // cleans it up, zero cleanup code here.
  const sid = String(input.session_id || 'unknown').replace(/[^\w-]/g, '');
  const stateFile = path.join(os.tmpdir(), 'frugal-' + sid + '.json');
  let seen = [];
  try { seen = JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch {}
  if (!Array.isArray(seen)) seen = [];

  const fresh = hits.filter((h) => !seen.includes(h.name));
  if (!fresh.length) return finish();
  try { fs.writeFileSync(stateFile, JSON.stringify(seen.concat(fresh.map((h) => h.name)))); } catch {}

  const context =
    fresh.map((h) => `frugal: this command touches ${h.name} (metered billing — ${h.hint}).`).join('\n') +
    '\nBefore spending more: check current usage/spend if a read-only command or dashboard exists, ' +
    'tell the user in one line if this action incurs real cost, and tear down anything you provision for testing.';

  finish(context);
});
