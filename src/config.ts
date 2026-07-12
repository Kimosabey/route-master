// Wires the router from the environment. Without OPENAI_API_KEY it runs deterministic
// local/mock providers, so the service (and its tests) work fully offline.

import { MockProvider, OpenAIProvider, type ModelProvider } from './providers.ts';
import { Router } from './router.ts';

export function buildRouterFromEnv(env: NodeJS.ProcessEnv = process.env): Router {
  const key = env.OPENAI_API_KEY?.trim();
  let cheap: ModelProvider;
  let strong: ModelProvider;

  if (key) {
    cheap = new OpenAIProvider(env.CHEAP_MODEL ?? 'gpt-4o-mini', 'cheap', 0.0006, key);
    strong = new OpenAIProvider(env.STRONG_MODEL ?? 'gpt-4o', 'strong', 0.01, key);
  } else {
    cheap = new MockProvider('local-llama', 'cheap', 0.0002);
    strong = new MockProvider('cloud-gpt', 'strong', 0.01);
  }

  return new Router({ cheap, strong, threshold: Number(env.THRESHOLD ?? 0.5) });
}
