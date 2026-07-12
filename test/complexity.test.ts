import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreComplexity } from '../src/complexity.ts';

test('scores are bounded to 0..1', () => {
  for (const p of ['', 'hi', 'a'.repeat(5000), 'why '.repeat(50)]) {
    const { score } = scoreComplexity(p);
    assert.ok(score >= 0 && score <= 1, `score ${score} out of range for ${p.slice(0, 10)}`);
  }
});

test('a trivial prompt scores lower than a reasoning-heavy one', () => {
  const trivial = scoreComplexity('What time is it?').score;
  const hard = scoreComplexity(
    'Explain step by step and analyze the trade-offs of the design; prove why it is optimal.',
  ).score;
  assert.ok(hard > trivial, `expected hard(${hard}) > trivial(${trivial})`);
});

test('code is detected as a complexity signal', () => {
  const { signals } = scoreComplexity('```js\nfunction f(){ return 1 }\n```');
  assert.equal(signals.hasCode, true);
});

test('reasoning keywords are counted', () => {
  const { signals } = scoreComplexity('Please explain and analyze and compare these.');
  assert.ok(signals.reasoningHits >= 3);
});
