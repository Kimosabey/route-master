# RouteMaster
### Cost-optimized AI model router — sends each prompt to the cheapest model that can actually handle it.

![RouteMaster](./docs/assets/thumbnail.webp)

![Status](https://img.shields.io/badge/Status-Working-14B8A6?style=for-the-badge)
![Tests](https://img.shields.io/badge/Tests-9_passing-14B8A6?style=for-the-badge)
![Category](https://img.shields.io/badge/Category-Portfolio_Project-111?style=for-the-badge)

## 📖 Overview

![RouteMaster UI](./docs/assets/hero_main.webp)

Most LLM apps send every request to one expensive model. RouteMaster scores each prompt's reasoning
difficulty from cheap, explainable signals, then routes simple prompts to a **cheap/local** model and
hard ones to a **strong/cloud** model — measuring the cost saved against an all-strong baseline.

It's provider-agnostic: without an API key it runs a deterministic local/mock provider (so it — and its
tests — work fully offline); with `OPENAI_API_KEY` set it routes to real models.

> Part of my Senior Hybrid Engineer 2026 portfolio (`#16`). Antigravity model — logic runs locally, heavy
> reasoning is offloaded to the cloud only when the prompt actually needs it.

## 🚀 Quick Start
```bash
git clone https://github.com/Kimosabey/route-master.git
cd route-master

npm test          # 9 tests, zero dependencies (Node 22 runs the TS directly)
npm run demo      # route a sample batch, print the cost-savings summary
docker compose up # serve the HTTP API on :3000
```

### API
```bash
# route a prompt
curl -s localhost:3000/route -H 'content-type: application/json' \
  -d '{"prompt":"Design and analyze a fault-tolerant rate limiter; prove correctness step by step."}'
# -> {"decision":{"tier":"strong","complexity":0.52,...},"cost":0.00078,"model":"cloud-gpt",...}

curl -s localhost:3000/stats   # spend vs. all-strong baseline + per-tier counts
```

### Demo output
```
tier    complexity   cost      prompt
cheap        0.01   $0.00000  Translate "hello" to French.
strong       0.52   $0.00066  Explain step by step why quicksort is O(n log n)...
strong       0.72   $0.00069  Refactor this and debug the race condition: ```js...

Summary:  7 requests (cheap 4 / strong 3)  ·  cost saved 21% vs. all-strong
```

## ✨ Key Features

![RouteMaster Dashboard](./docs/assets/dashboard.webp)

- **Explainable complexity scoring** — length, reasoning keywords, code detection, question depth → a 0–1 score (every decision carries its `reason`).

![RouteMaster Workflow](./docs/assets/workflow.webp)

- **Tiered routing** with a configurable threshold (`THRESHOLD`, default 0.5).
- **Provider-agnostic** — one `ModelProvider` interface; `MockProvider` (offline) and `OpenAIProvider` (real) ship in the box.
- **Cross-tier fallback** — if the chosen provider errors, the request fails over to the other tier instead of dropping.
- **Measured savings** — a cost ledger reports spend vs. the all-strong baseline; savings are computed, not asserted.

## 🏗️ Architecture

![RouteMaster Architecture](./docs/assets/architecture.webp)

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#ffffff','lineColor':'#14B8A6','mainBkg':'#ffffff'}}}%%
graph LR
    A([Prompt]) --> B([Complexity Scorer])
    B --> C{Router}
    C -->|score < threshold| D([Cheap / Local])
    C -->|score >= threshold| E([Strong / Cloud])
    D --> F([Cost Ledger])
    E --> F
    F --> G([Response + Stats])
    style A fill:#eff6ff,stroke:#14B8A6,stroke-width:2px,color:#0f766e
    style C fill:#ccfbf1,stroke:#14B8A6,stroke-width:2px,color:#0f766e
    style F fill:#eff6ff,stroke:#14B8A6,stroke-width:2px,color:#0f766e
```
The hard part is making the routing decision *cheap and honest*: the score has to be trivial to compute
(no extra model call) yet accurate enough that quality holds while cost drops. See
[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## 🧰 Tech Stack
| Layer | Technology | Role |
| :--- | :--- | :--- |
| Runtime | Node.js 22 (TypeScript, no build step) | Type-stripped execution + built-in test runner |
| Transport | Node `http` | Zero-dependency HTTP API |
| Providers | OpenAI-compatible / mock | Pluggable model backends |
| Container | Docker + Compose | One-command run |

## 📚 Documentation
- [Architecture](./docs/ARCHITECTURE.md) — scoring model, routing, fallback, cost accounting
- [Getting Started](./docs/GETTING_STARTED.md) · [Failure Scenarios](./docs/FAILURE_SCENARIOS.md) · [Interview Q&A](./docs/INTERVIEW_QA.md)

## 🔭 Future Enhancements
- Learned routing thresholds from outcome feedback
- Latency-aware routing (not just cost)
- Semantic response caching in front of the router
- Per-tenant budget caps

## 📄 License
Released under the MIT License.

## 👤 Author

**Harshan Aiyappa**
Senior Full-Stack Hybrid AI Engineer
Voice AI • Distributed Systems • Infrastructure

[![Portfolio](https://img.shields.io/badge/Portfolio-kimo--nexus.vercel.app-00C7B7?style=flat&logo=vercel)](https://kimo-nexus.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Kimosabey-black?style=flat&logo=github)](https://github.com/Kimosabey)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Harshan_Aiyappa-blue?style=flat&logo=linkedin)](https://linkedin.com/in/harshan-aiyappa)
[![X](https://img.shields.io/badge/X-@HarshanAiyappa-black?style=flat&logo=x)](https://x.com/HarshanAiyappa)
