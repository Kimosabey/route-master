# Architecture — RouteMaster

## High-Level Design (HLD)
RouteMaster analyzes each incoming task and routes it to a capable-but-cheap model — a local Llama model for simple work, a frontier cloud model only when the task genuinely needs it.

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#ffffff','lineColor':'#2563eb','mainBkg':'#ffffff'}}}%%
graph LR
    A([Task])
    B([Cost / Perf Analyzer])
    C([Local Llama or Cloud LLM])
    D([Response])
    A --> B
    B --> C
    C --> D
    style A fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e40af
    style B fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e40af
    style C fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e40af
    style D fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e40af
```

**Flow:** Task → Cost / Perf Analyzer → Local Llama or Cloud LLM → Response

## Low-Level Design (LLD)
- **`complexity.ts`** — `scoreComplexity(prompt) -> { score: 0..1, signals }`. Pure function; weighted heuristics: reasoning keywords (0.5), length/tokens (0.25), code detection (0.2), question depth (0.05).
- **`providers.ts`** — `interface ModelProvider { name; tier: 'cheap'|'strong'; costPer1kTokens; complete(prompt) }`. `MockProvider` (deterministic, offline), `OpenAIProvider` (real, key-gated).
- **`router.ts`** — `Router.decide(prompt)` (pure) and `Router.route(prompt)` (executes, with cross-tier fallback on provider error). Threshold-based tier selection.
- **`costLedger.ts`** — records each request; reports `totalCost`, `baselineCost` (all-strong), `savingsPct`, per-tier counts.
- **`server.ts`** — Node `http`: `POST /route`, `GET /stats`, `GET /health`.

## Decision Log
- **Zero runtime dependencies** — Node 22 runs the TypeScript directly (type-stripping) and the built-in test runner covers it. Keeps the router auditable and the image tiny.
- **Provider interface over a hard vendor dependency** — the router is testable offline via `MockProvider` and swaps to real models when a key is present.
- **Complexity heuristic, not a classifier model** — the routing decision must cost far less than it saves, so it uses cheap explainable signals rather than an extra model call.
- **Conservative baseline** — savings are measured against the all-strong cost on the *same* token volume, which understates rather than inflates the number.
- **Local-first constraint** — logic runs locally; heavy reasoning is offloaded to the cloud only when the prompt crosses the threshold.

## Concept Deep Dive
The hard part is classifying task difficulty cheaply and reliably enough that the routing decision itself
does not cost more than it saves — and doing it *explainably*, so every decision carries the `reason` it
was made. Fallback ensures a single provider outage degrades cost/latency, never availability.
