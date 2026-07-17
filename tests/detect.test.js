const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { detectProviders, formatReminder, PROVIDERS } = require('../hooks/providers');
const { normalizeMode, filterBodyForMode } = (() => {
  const config = require('../hooks/frugal-config');
  const instr = require('../hooks/frugal-instructions');
  return { normalizeMode: config.normalizeMode, filterBodyForMode: instr.filterBodyForMode };
})();

const names = (cmd, input) => detectProviders(cmd, input || { cwd: os.tmpdir() }).map((p) => p.name);

test('detects provider CLIs at command position', () => {
  assert.deepStrictEqual(names('vercel deploy --prod'), ['Vercel']);
  assert.deepStrictEqual(names('npx vercel'), ['Vercel']);
  assert.deepStrictEqual(names('git pull && wrangler deploy'), ['Cloudflare']);
  assert.deepStrictEqual(names('terraform apply -auto-approve'), ['IaC provisioning']);
  assert.deepStrictEqual(names('gh codespace create'), ['GitHub Codespaces']);
  assert.deepStrictEqual(names('pnpm dlx neonctl projects list'), ['Neon']);
  assert.deepStrictEqual(names('fly deploy'), ['Fly.io']);
});

test('sub-service hit suppresses its base provider', () => {
  assert.deepStrictEqual(names('wrangler r2 object put bkt/k --file f'), ['Cloudflare R2']);
  assert.deepStrictEqual(names('wrangler kv key put --binding=S k v'), ['Cloudflare KV']);
  assert.deepStrictEqual(names('wrangler d1 execute db --command "..."'), ['Cloudflare D1']);
  assert.deepStrictEqual(names('wrangler deploy'), ['Cloudflare']);
  assert.deepStrictEqual(names('gh workflow run deploy.yml'), ['GitHub Actions']);
  assert.deepStrictEqual(names('gh run watch'), ['GitHub Actions']);
});

test('git push triggers Actions reminder only when workflows exist', () => {
  const withWf = fs.mkdtempSync(path.join(os.tmpdir(), 'frugal-wf-'));
  fs.mkdirSync(path.join(withWf, '.github', 'workflows'), { recursive: true });
  assert.deepStrictEqual(names('git push origin main', { cwd: withWf }), ['GitHub Actions']);
  assert.deepStrictEqual(names('git push origin main', { cwd: os.tmpdir() }), []);
  fs.rmSync(withWf, { recursive: true, force: true });
});

test('detects cross-provider tripwires from pitfall mining', () => {
  assert.deepStrictEqual(names('firebase deploy --only functions'), ['Firebase']);
  assert.deepStrictEqual(names('twilio api:core:messages:create --to +1555'), ['Twilio']);
  assert.deepStrictEqual(names('runpodctl get pod'), ['RunPod']);
  assert.deepStrictEqual(names('modal app list'), ['Modal']);
  assert.deepStrictEqual(names('vastai show instances'), ['Vast.ai']);
  assert.deepStrictEqual(names('aws logs create-log-group --log-group-name x'), ['Observability/logs', 'AWS']);
});

test('agent CLI dual-rail fires only when an API key env is set', () => {
  const saved = { a: process.env.ANTHROPIC_API_KEY, o: process.env.OPENAI_API_KEY };
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.OPENAI_API_KEY;
  assert.deepStrictEqual(names('claude -p "hi"'), []);
  process.env.ANTHROPIC_API_KEY = 'test';
  assert.deepStrictEqual(names('claude -p "hi"'), ['Agent CLI on API billing']);
  delete process.env.ANTHROPIC_API_KEY;
  if (saved.a) process.env.ANTHROPIC_API_KEY = saved.a;
  if (saved.o) process.env.OPENAI_API_KEY = saved.o;
});

test('detects round-2 indie services', () => {
  assert.deepStrictEqual(names('heroku addons:create heroku-postgresql'), ['Heroku']);
  assert.deepStrictEqual(names('render deploys create'), ['Render']);
  assert.deepStrictEqual(names('netlify deploy --prod'), ['Netlify']);
  assert.deepStrictEqual(names('doctl compute droplet list'), ['DigitalOcean']);
  assert.deepStrictEqual(names('atlas clusters list'), ['MongoDB Atlas']);
  assert.deepStrictEqual(names('resend emails send'), ['Email API']);
  assert.deepStrictEqual(names('sentry-cli releases new v1'), ['Observability/logs']);
  assert.deepStrictEqual(names('auth0 apps list'), ['Auth provider']);
  assert.deepStrictEqual(names('cld admin usage'), ['Media/vector store']);
});

test('ignores prose mentions and non-command positions', () => {
  assert.deepStrictEqual(names('git commit -m "fix vercel deploy"'), []);
  assert.deepStrictEqual(names('grep neon file.txt'), []);
  assert.deepStrictEqual(names('echo fly'), []);
  assert.deepStrictEqual(names('gh pr view 12'), []);
  assert.deepStrictEqual(names('terraform plan'), []);
  assert.deepStrictEqual(names(''), []);
});

test('formatReminder scales by mode (quiet < normal ≤ strict)', () => {
  const vercel = PROVIDERS.find((p) => p.name === 'Vercel');
  const quiet = formatReminder(vercel, 'quiet');
  const normal = formatReminder(vercel, 'normal');
  const strict = formatReminder(vercel, 'strict');
  assert.ok(quiet.length < normal.length);
  assert.ok(normal.length <= strict.length);
  // brief always carries free-tier NUMBERS, not a vague "it bills"
  assert.match(quiet, /1M inv/);
  assert.match(quiet, /100 deploys/);
  assert.doesNotMatch(quiet, /\$46k/);
  assert.match(normal, /Spend Management/);
  assert.doesNotMatch(normal, /\$46k/);
  assert.match(strict, /\$46k/);
  // quiet is numbers-only: no dig suggestion; digs start at normal
  assert.doesNotMatch(quiet, /Optional:/);
  assert.match(normal, /Optional: `vercel usage`/);
  assert.equal(formatReminder(vercel, 'off'), null);
});

test('every provider brief has concrete numbers (not just shape words)', () => {
  for (const p of PROVIDERS) {
    assert.ok(p.brief && p.brief.length > 0, p.name + ' missing brief');
    assert.ok(p.brief.length <= 220, p.name + ' brief too long: ' + p.brief.length);
    // At least one digit — free-tier / rate / credit. IaC is the soft exception:
    // "no free-tier" still has no meter number, but the phrase is explicit.
    if (p.name !== 'IaC provisioning') {
      assert.match(p.brief, /\d/, p.name + ' brief has no numbers: ' + p.brief);
    }
  }
});

test('session mode off persists instead of falling back to default', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'frugal-mode-'));
  const saved = process.env.PLUGIN_DATA;
  const savedEnv = { FRUGAL_MODE: process.env.FRUGAL_MODE, COPILOT: process.env.COPILOT_PLUGIN_DATA };
  delete process.env.FRUGAL_MODE;
  delete process.env.COPILOT_PLUGIN_DATA;
  process.env.PLUGIN_DATA = dir;
  try {
    const config = require('../hooks/frugal-config');
    assert.equal(config.setSessionMode('off'), 'off');
    assert.equal(config.readSessionMode(), 'off');
    assert.equal(config.getDefaultMode(), 'off');
    assert.equal(config.setSessionMode('nope'), null);
    assert.equal(config.readSessionMode(), 'off');
    config.setSessionMode('normal');
    assert.equal(config.readSessionMode(), 'normal');
  } finally {
    if (saved === undefined) delete process.env.PLUGIN_DATA;
    else process.env.PLUGIN_DATA = saved;
    if (savedEnv.FRUGAL_MODE !== undefined) process.env.FRUGAL_MODE = savedEnv.FRUGAL_MODE;
    if (savedEnv.COPILOT !== undefined) process.env.COPILOT_PLUGIN_DATA = savedEnv.COPILOT;
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('normalizeMode accepts intensity levels', () => {
  assert.equal(normalizeMode('quiet'), 'quiet');
  assert.equal(normalizeMode('NORMAL'), 'normal');
  assert.equal(normalizeMode('nope'), null);
});

test('filterBodyForMode keeps only the active intensity row', () => {
  const body = [
    '## Intensity',
    '| Level | What changes |',
    '|-------|--------------|',
    '| **quiet** | brief only |',
    '| **normal** | brief + trap |',
    '| **strict** | all |',
    '',
    'Switch: /frugal',
  ].join('\n');
  const filtered = filterBodyForMode(body, 'quiet');
  assert.match(filtered, /\*\*quiet\*\*/);
  assert.doesNotMatch(filtered, /\*\*normal\*\*/);
  assert.doesNotMatch(filtered, /\*\*strict\*\*/);
  assert.match(filtered, /Switch/);
});
