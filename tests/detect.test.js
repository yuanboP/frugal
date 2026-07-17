const test = require('node:test');
const assert = require('node:assert');
const { detectProviders } = require('../hooks/providers');

const names = (cmd) => detectProviders(cmd).map((p) => p.name);

test('detects provider CLIs at command position', () => {
  assert.deepStrictEqual(names('vercel deploy --prod'), ['Vercel']);
  assert.deepStrictEqual(names('npx vercel'), ['Vercel']);
  assert.deepStrictEqual(names('git pull && wrangler deploy'), ['Cloudflare']);
  assert.deepStrictEqual(names('terraform apply -auto-approve'), ['IaC provisioning']);
  assert.deepStrictEqual(names('gh codespace create'), ['GitHub Codespaces']);
  assert.deepStrictEqual(names('pnpm dlx neonctl projects list'), ['Neon']);
  assert.deepStrictEqual(names('fly deploy'), ['Fly.io']);
});

test('ignores prose mentions and non-command positions', () => {
  assert.deepStrictEqual(names('git commit -m "fix vercel deploy"'), []);
  assert.deepStrictEqual(names('grep neon file.txt'), []);
  assert.deepStrictEqual(names('echo fly'), []);
  assert.deepStrictEqual(names('gh pr view 12'), []);
  assert.deepStrictEqual(names('terraform plan'), []);
  assert.deepStrictEqual(names(''), []);
});
