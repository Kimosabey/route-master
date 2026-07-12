# Interview Q&A — RouteMaster

### "Tell me about this project."
RouteMaster is cost-optimized AI routing that sends each task to the cheapest model that can handle it. RouteMaster analyzes each incoming task and routes it to a capable-but-cheap model — a local Llama model for simple work, a frontier cloud model only when the task genuinely needs it.

### "What was the hardest part?"
Classifying task difficulty cheaply and reliably enough that the routing decision itself does not cost more than it saves.

### "Why did you choose this stack?"
- **Node.js** — application runtime / service layer.
- **OpenAI** — cloud llm reasoning.
- **Ollama** — local llm runtime.

### "How does it fit the rest of your portfolio?"
It follows my "Antigravity" model — local logic/state/UI, cloud reasoning where it earns its cost — and shares the documentation and deployment conventions used across all my projects (#16).
