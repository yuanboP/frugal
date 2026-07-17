#!/usr/bin/env node
// frugal mode: quiet | normal | strict | off
//
// Resolution (highest wins):
//   1. FRUGAL_MODE env
//   2. Session flag file (set by /frugal quiet|normal|strict)
//   3. ~/.config/frugal/config.json defaultMode
//   4. 'normal'

const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_MODE = 'normal';
const RUNTIME_MODES = ['off', 'quiet', 'normal', 'strict'];

function normalizeMode(mode) {
  if (typeof mode !== 'string') return null;
  const n = mode.trim().toLowerCase();
  return RUNTIME_MODES.includes(n) ? n : null;
}

function getConfigDir() {
  if (process.env.XDG_CONFIG_HOME) {
    return path.join(process.env.XDG_CONFIG_HOME, 'frugal');
  }
  if (process.platform === 'win32') {
    return path.join(
      process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
      'frugal'
    );
  }
  return path.join(os.homedir(), '.config', 'frugal');
}

function getConfigPath() {
  return path.join(getConfigDir(), 'config.json');
}

function sessionFlagPath() {
  // Prefer host plugin data so mode sticks for the agent install; fall back to tmp.
  const dir =
    process.env.COPILOT_PLUGIN_DATA ||
    process.env.PLUGIN_DATA ||
    (process.env.QODER_SESSION_ID ? path.join(os.homedir(), '.qoder') : null) ||
    os.tmpdir();
  return path.join(dir, '.frugal-mode');
}

function readSessionMode() {
  try {
    return normalizeMode(fs.readFileSync(sessionFlagPath(), 'utf8'));
  } catch {
    return null;
  }
}

function setSessionMode(mode) {
  const n = normalizeMode(mode);
  if (!n) return null;
  // 'off' is a real persisted state — deleting the flag would fall back to
  // the config default and silently re-enable frugal on the next hook.
  fs.mkdirSync(path.dirname(sessionFlagPath()), { recursive: true });
  fs.writeFileSync(sessionFlagPath(), n, 'utf8');
  return n;
}

function writeDefaultMode(mode) {
  const n = normalizeMode(mode);
  if (!n) return null;
  const configPath = getConfigPath();
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  let config = {};
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8').replace(/^\uFEFF/, ''));
    if (!config || typeof config !== 'object' || Array.isArray(config)) config = {};
  } catch {}
  config.defaultMode = n;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  return n;
}

function getDefaultMode() {
  const env = normalizeMode(process.env.FRUGAL_MODE);
  if (env) return env;

  const session = readSessionMode();
  if (session) return session;

  try {
    const config = JSON.parse(fs.readFileSync(getConfigPath(), 'utf8').replace(/^\uFEFF/, ''));
    const fromFile = normalizeMode(config && config.defaultMode);
    if (fromFile) return fromFile;
  } catch {}

  return DEFAULT_MODE;
}

module.exports = {
  DEFAULT_MODE,
  RUNTIME_MODES,
  normalizeMode,
  getConfigDir,
  getConfigPath,
  getDefaultMode,
  readSessionMode,
  setSessionMode,
  writeDefaultMode,
  sessionFlagPath,
};
