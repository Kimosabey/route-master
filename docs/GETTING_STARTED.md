# Getting Started — RouteMaster

## Prerequisites
- **Node.js 22.6+** (runs the TypeScript directly via type-stripping — no build step). That's it for tests/demo.
- **Docker** (optional) to run the HTTP service.
- **An OpenAI API key** (optional) — without one, RouteMaster runs deterministic local/mock providers.

## Run it
```bash
git clone https://github.com/Kimosabey/route-master.git
cd route-master

npm test          # 9 tests, zero dependencies
npm run demo      # route a sample batch, print the cost-savings summary
docker compose up # serve the HTTP API on :3000
```

## Environment variables
| Key | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | HTTP port |
| `THRESHOLD` | `0.5` | complexity ≥ this routes to the strong model |
| `OPENAI_API_KEY` | _(unset)_ | if set, uses real models instead of the mock provider |
| `CHEAP_MODEL` | `gpt-4o-mini` | model id for the cheap tier (when a key is set) |
| `STRONG_MODEL` | `gpt-4o` | model id for the strong tier (when a key is set) |

Copy `.env.example` to `.env` to customize. With no key, everything works fully offline.

## Running tests
```bash
npm test          # node --test over test/**/*.test.ts
```
