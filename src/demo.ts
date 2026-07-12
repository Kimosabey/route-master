// Offline demo: run a mixed batch of prompts through the router and print the
// per-request routing decision plus the measured cost savings. `npm run demo`.

import { Router } from './router.ts';
import { MockProvider } from './providers.ts';

const prompts = [
  'What time is it in Tokyo?',
  'Translate "hello" to French.',
  'Summarize this sentence in five words.',
  'List three fruits.',
  'Explain step by step why quicksort is O(n log n) on average and analyze the worst case.',
  'Design a fault-tolerant distributed rate limiter and compare trade-offs between Redis and a local token bucket.',
  'Refactor this and debug the race condition: ```js\nlet c=0; async function inc(){ c++ }\n```',
];

const router = new Router({
  cheap: new MockProvider('local-llama', 'cheap', 0.0002),
  strong: new MockProvider('cloud-gpt', 'strong', 0.01),
});

console.log('tier    complexity   cost      prompt');
console.log('-----------------------------------------------------------------');
for (const p of prompts) {
  const r = await router.route(p);
  console.log(
    `${r.decision.tier.padEnd(7)} ${r.decision.complexity.toFixed(2).padStart(9)}   $${r.cost.toFixed(5)}  ${p.replace(/\n/g, ' ').slice(0, 52)}`,
  );
}

const s = router.ledger.summary();
console.log('\nSummary');
console.log(`  requests      ${s.requests}  (cheap ${s.byTier.cheap} / strong ${s.byTier.strong})`);
console.log(`  spend         $${s.totalCost.toFixed(5)}`);
console.log(`  baseline      $${s.baselineCost.toFixed(5)}  (all-strong)`);
console.log(`  cost saved    ${s.savingsPct}%`);
