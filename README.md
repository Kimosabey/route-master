# RouteMaster
### Cost-optimized AI routing that sends each task to the cheapest model that can handle it.

![Status](https://img.shields.io/badge/Status-In_Development-blue?style=for-the-badge)
![Category](https://img.shields.io/badge/Category-Portfolio_Project-111?style=for-the-badge)

## 📖 Overview
RouteMaster analyzes each incoming task and routes it to a capable-but-cheap model — a local Llama model for simple work, a frontier cloud model only when the task genuinely needs it.

> Part of my Senior Hybrid Engineer 2026 portfolio (`#16`). Built on the "Antigravity" model — logic, state, and UI run locally in Docker while heavy reasoning is offloaded to cloud APIs, so the whole system runs on modest hardware.

## 🚀 Quick Start
```bash
# 1. Clone
git clone https://github.com/Kimosabey/route-master.git
cd route-master

# 2. Install
# (see docs/GETTING_STARTED.md for the full setup)

# 3. Run
docker compose up
```

## ✨ Key Features
- Cost/performance analyzer picks the right model per request
- Routes simple prompts local, hard prompts to the cloud
- Transparent fallback when a model declines or fails
- Per-route cost accounting

## 🏗️ Architecture
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

Classifying task difficulty cheaply and reliably enough that the routing decision itself does not cost more than it saves.

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the full HLD/LLD and design decisions.

## 🧰 Tech Stack
| Layer | Technology | Role |
| :--- | :--- | :--- |
| Node.js | `Node.js` | Application runtime / service layer |
| OpenAI | `OpenAI` | Cloud LLM reasoning |
| Ollama | `Ollama` | Local LLM runtime |

## 📚 Documentation
- [Architecture](./docs/ARCHITECTURE.md) — high- and low-level design, decision log
- [Getting Started](./docs/GETTING_STARTED.md) — prerequisites, setup, environment
- [Failure Scenarios](./docs/FAILURE_SCENARIOS.md) — fault analysis and recovery
- [Interview Q&A](./docs/INTERVIEW_QA.md) — deep-dive walkthrough

## 🔭 Future Enhancements
- Learned routing from outcome feedback
- Latency-aware routing
- Budget caps per tenant

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
