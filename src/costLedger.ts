// Records every routed request and reports spend vs. the "always-strong" baseline,
// so cost savings are measured, not asserted.

import type { Tier } from './providers.ts';

export interface RouteRecord {
  model: string;
  tier: Tier;
  complexity: number;
  promptTokens: number;
  completionTokens: number;
  /** actual USD charged for this request */
  cost: number;
  /** USD this request would have cost on the strong model (baseline) */
  strongCost: number;
}

export interface LedgerSummary {
  requests: number;
  totalCost: number;
  baselineCost: number;
  savingsPct: number;
  byTier: Record<Tier, number>;
}

export class CostLedger {
  private records: RouteRecord[] = [];

  add(r: RouteRecord): void {
    this.records.push(r);
  }

  get count(): number {
    return this.records.length;
  }

  get totalCost(): number {
    return this.records.reduce((a, r) => a + r.cost, 0);
  }

  /** what everything would have cost sent straight to the strong model */
  get baselineCost(): number {
    return this.records.reduce((a, r) => a + r.strongCost, 0);
  }

  get savings(): number {
    const b = this.baselineCost;
    return b === 0 ? 0 : (b - this.totalCost) / b;
  }

  byTier(): Record<Tier, number> {
    const out: Record<Tier, number> = { cheap: 0, strong: 0 };
    for (const r of this.records) out[r.tier]++;
    return out;
  }

  summary(): LedgerSummary {
    return {
      requests: this.count,
      totalCost: round(this.totalCost),
      baselineCost: round(this.baselineCost),
      savingsPct: Math.round(this.savings * 100),
      byTier: this.byTier(),
    };
  }
}

function round(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}
