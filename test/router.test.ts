import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Router } from '../src/router.ts';
import { MockProvider, type ModelProvider, type Completion, type Tier } from '../src/providers.ts';

function mkRouter(threshold = 0.5) {
  return new Router({
    cheap: new MockProvider('local', 'cheap', 0.0002),
    strong: new MockProvider('cloud', 'strong', 0.01),
    threshold,
  });
}

test('rejects mismatched provider tiers', () => {
  assert.throws(
    () =>
      new Router({
        cheap: new MockProvider('x', 'strong', 1),
        strong: new MockProvider('y', 'strong', 1),
      }),
    /tiers?/i,
  );
});

test('simple prompt routes to cheap, complex prompt routes to strong', () => {
  const r = mkRouter();
  assert.equal(r.decide('hi there').tier, 'cheap');
  assert.equal(
    r.decide('Explain step by step and analyze the trade-offs; prove why quicksort is optimal.').tier,
    'strong',
  );
});

test('threshold controls the boundary', () => {
  const p = 'Explain the trade-offs here.';
  const low = new Router({
    cheap: new MockProvider('c', 'cheap', 1),
    strong: new MockProvider('s', 'strong', 1),
    threshold: 0.1,
  }).decide(p).tier;
  const high = new Router({
    cheap: new MockProvider('c', 'cheap', 1),
    strong: new MockProvider('s', 'strong', 1),
    threshold: 0.99,
  }).decide(p).tier;
  assert.equal(low, 'strong');
  assert.equal(high, 'cheap');
});

test('routing a request records cost and reduces spend vs. baseline', async () => {
  const r = mkRouter();
  await r.route('hi'); // cheap
  await r.route('Explain step by step and analyze and design and compare the architecture.'); // strong
  const s = r.ledger.summary();
  assert.equal(s.requests, 2);
  assert.equal(s.byTier.cheap, 1);
  assert.equal(s.byTier.strong, 1);
  assert.ok(s.totalCost < s.baselineCost, 'total should be below all-strong baseline');
  assert.ok(s.savingsPct > 0);
});

test('falls back to the other tier when a provider throws', async () => {
  class Failing implements ModelProvider {
    readonly name = 'flaky';
    readonly tier: Tier;
    readonly costPer1kTokens: number;
    constructor(tier: Tier, costPer1kTokens = 0.01) {
      this.tier = tier;
      this.costPer1kTokens = costPer1kTokens;
    }
    complete(): Promise<Completion> {
      throw new Error('provider down');
    }
  }
  const r = new Router({
    cheap: new MockProvider('local', 'cheap', 0.0002),
    strong: new Failing('strong'),
    threshold: 0.5,
  });
  const res = await r.route('Design and analyze a distributed system; prove correctness step by step.');
  assert.equal(res.decision.tier, 'strong'); // wanted strong
  assert.equal(res.fellBack, true); // but strong failed
  assert.equal(res.completion.model, 'local'); // served by cheap fallback
});
