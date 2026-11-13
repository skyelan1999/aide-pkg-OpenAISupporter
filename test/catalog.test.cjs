'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'provider-support.json')));
const manifest = require('../manifest.json');

test('data-only entry never touches credentials or registers tools', () => {
  const entry = require('../index.js');
  assert.deepEqual(Object.keys(entry).sort(), ['apply', 'name']);
  assert.equal(entry.name, manifest.id);
  entry.apply(new Proxy({}, { get() { throw Error('unexpected host access'); } }));
  assert.deepEqual(manifest.providerSupport, { protocol: 1, catalog: 'provider-support.json' });
  assert.equal(manifest.license, 'MIT');
  assert.equal(manifest.version, require('../package.json').version);
  assert.equal(catalog.currency, 'USD');
  assert.deepEqual(catalog.balance, {auth:'browser-page',format:'page-balance',pageURL:'https://platform.openai.com/home',label:'Credit remaining',accountMarker:'Organization',refreshSeconds:300,identityLinkPrefix:'https://platform.openai.com/settings/proj_'});
  assert.equal(catalog.peak, undefined);
});

test('only the official API base and four verified exact model IDs are declared', () => {
  assert.deepEqual(catalog.providers, [{ host: 'api.openai.com', paths: ['/v1'] }]);
  assert.deepEqual(catalog.models.map(x => x.names), [
    ['gpt-6-astra'], ['gpt-6.1-sol'], ['gpt-6.1-terra'], ['gpt-6-luna']
  ]);
  assert(catalog.sources.every(source => new URL(source).protocol === 'https:'));
  assert(catalog.sources.every(source => new URL(source).hostname === 'developers.openai.com'));
});

test('published USD standard rates and long-context boundaries match reviewed sources', () => {
  const expected = [[10, 1, 50], [2, .1, 10], [1, .05, 5], [.1, .01, .5]];
  for (const [i, model] of catalog.models.entries()) {
    const [input, hit, output] = expected[i];
    assert.deepEqual(model.tiers, [
      { maxInput: 272000, priceIn: input, priceInCacheHit: hit, priceOut: output },
      { maxInput: 1050000, priceIn: input * 2, priceInCacheHit: hit * 2, priceOut: output * 1.5 }
    ]);
  }
  assert(Buffer.byteLength(JSON.stringify(catalog)) < 128 * 1024);
});
