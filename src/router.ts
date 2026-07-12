// The router: score complexity, pick the cheapest capable tier, execute with a
// cross-tier fallback so a single provider outage never drops a request, and record cost.

import type { ModelProvider, Completion, Tier } from './providers.ts';
import { scoreComplexity } from './complexity.ts';
import { CostLedger } from './costLedger.ts';

export interface RouterOptions {
  cheap: ModelProvider;
  strong: ModelProvider;
  /** complexity >= threshold routes to the strong model. Default 0.5 */
  threshold?: number;
  ledger?: CostLedger;
}

export interface RouteDecision {
  tier: Tier;
  complexity: number;
  reason: string;
}

export interface RouteResult {
  decision: RouteDecision;
  completion: Completion;
  cost: number;
  fellBack: boolean;
}

export class Router {
  readonly threshold: number;
  readonly ledger: CostLedger;
  private readonly opts: RouterOptions;

  constructor(opts: RouterOptions) {
    if (opts.cheap.tier !== 'cheap' || opts.strong.tier !== 'strong') {
      throw new Error('RouterOptions: cheap must be tier "cheap" and strong must be tier "strong"');
    }
    this.opts = opts;
    this.threshold = opts.threshold ?? 0.5;
    this.ledger = opts.ledger ?? new CostLedger();
  }

  /** Pure decision — no I/O, so it is trivially testable. */
  decide(prompt: string): RouteDecision {
    const { score } = scoreComplexity(prompt);
    const strong = score >= this.threshold;
    const c = round2(score);
    return {
      tier: strong ? 'strong' : 'cheap',
      complexity: c,
      reason: strong
        ? `complexity ${c} >= ${this.threshold} -> strong`
        : `complexity ${c} < ${this.threshold} -> cheap`,
    };
  }

  async route(prompt: string): Promise<RouteResult> {
    const decision = this.decide(prompt);
    let provider = decision.tier === 'strong' ? this.opts.strong : this.opts.cheap;
    let fellBack = false;

    let completion: Completion;
    try {
      completion = await provider.complete(prompt);
    } catch {
      // Fail over to the other tier rather than dropping the request.
      provider = provider.tier === 'strong' ? this.opts.cheap : this.opts.strong;
      fellBack = true;
      completion = await provider.complete(prompt);
    }

    const tokens = completion.usage.promptTokens + completion.usage.completionTokens;
    const cost = costOf(provider, tokens);
    const strongCost = costOf(this.opts.strong, tokens); // conservative same-volume baseline

    this.ledger.add({
      model: completion.model,
      tier: provider.tier,
      complexity: decision.complexity,
      promptTokens: completion.usage.promptTokens,
      completionTokens: completion.usage.completionTokens,
      cost,
      strongCost,
    });

    return { decision, completion, cost, fellBack };
  }
}

function costOf(p: ModelProvider, tokens: number): number {
  return (tokens / 1000) * p.costPer1kTokens;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
