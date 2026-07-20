# Interview Q&A — RouteMaster

### "Tell me about this project."
RouteMaster is a cost-optimized LLM router. Instead of sending every prompt to one expensive model, it
scores each prompt's reasoning difficulty from cheap, explainable signals and routes simple prompts to a
cheap/local model and hard ones to a strong/cloud model — then measures the money saved against an
all-strong baseline. On the demo batch it cut cost ~21% while keeping hard prompts on the capable model.

### "What was the hardest / most interesting part?"
Making the routing decision **cheap and honest**. The classifier can't itself cost a model call, so it's a
weighted heuristic (reasoning keywords, length, code detection, question depth) that I tuned so genuinely
hard prompts cross the threshold. Every decision carries a human-readable `reason`, so routing is auditable.

### "Why this design?"
- **Provider interface, not a hard vendor dependency** — a `MockProvider` makes the whole thing testable
  and runnable offline; an `OpenAIProvider` swaps in when a key is present.
- **Cross-tier fallback** — if the chosen provider fails, the request fails over to the other tier, so a
  provider outage degrades cost/latency, never availability.
- **Zero runtime dependencies** — Node 22 runs the TypeScript directly and the built-in test runner covers
  it (9 tests), keeping the router small and auditable.

### "How do you prove the savings are real?"
A cost ledger records every request and reports spend vs. the all-strong baseline on the same token
volume (a deliberately conservative baseline). `/stats` exposes it live — the number is measured, not asserted.

### "How does it fit your portfolio?"
It's an AI-engineering / cost-optimization piece under my local-first model — local logic, cloud
reasoning only when the prompt earns it (`#16`).
