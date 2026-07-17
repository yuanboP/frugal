const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { detectProviders } = require('../hooks/providers');

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

test('detects sub-services with their own hints', () => {
  assert.deepStrictEqual(names('wrangler r2 object put bkt/k --file f'), ['Cloudflare', 'Cloudflare R2']);
  assert.deepStrictEqual(names('wrangler kv key put --binding=S k v'), ['Cloudflare', 'Cloudflare KV']);
  assert.deepStrictEqual(names('wrangler d1 execute db --command "..."'), ['Cloudflare', 'Cloudflare D1']);
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

test('ignores prose mentions and non-command positions', () => {
  assert.deepStrictEqual(names('git commit -m "fix vercel deploy"'), []);
  assert.deepStrictEqual(names('grep neon file.txt'), []);
  assert.deepStrictEqual(names('echo fly'), []);
  assert.deepStrictEqual(names('gh pr view 12'), []);
  assert.deepStrictEqual(names('terraform plan'), []);
  assert.deepStrictEqual(names(''), []);
});
