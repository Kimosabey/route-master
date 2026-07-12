# Failure Scenarios — RouteMaster

How the router behaves when a model backend misbehaves — availability must never depend on one provider.

## Fault Analysis
- **The chosen provider errors or times out.** `route()` catches the failure and **fails over to the other
  tier** (strong→cheap or cheap→strong) rather than dropping the request. The response carries `fellBack: true`
  so callers can see it happened. Covered by the test *"falls back to the other tier when a provider throws."*
- **Both providers are down.** The fallback also throws; the HTTP layer returns `500` with the error message.
  No partial state is left — the cost ledger only records a request that actually completed.
- **A malformed request (no prompt).** Rejected with `400` before any model call.
- **Cost drift.** Because savings are measured against the all-strong baseline on the same token volume,
  a mis-set `THRESHOLD` shows up immediately in `/stats` (savings drop), not silently.

## Recovery Strategy
- Stateless service — restarts cleanly; the only state is the in-memory ledger (rebuildable / non-critical).
- The routing decision is pure and deterministic, so the same prompt always routes the same way — easy to reason about after an incident.

## Verification
- Provider-failure fallback is unit-tested; the HTTP error paths return the documented status codes.
