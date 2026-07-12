// Model providers behind a single interface, so the router is decoupled from any
// specific vendor. A network-free MockProvider powers tests and offline demos; the
// OpenAIProvider is used only when an API key is present.

export type Tier = 'cheap' | 'strong';

export interface Usage {
  promptTokens: number;
  completionTokens: number;
}

export interface Completion {
  text: string;
  usage: Usage;
  model: string;
}

export interface ModelProvider {
  readonly name: string;
  readonly tier: Tier;
  /** blended USD per 1K tokens */
  readonly costPer1kTokens: number;
  complete(prompt: string): Promise<Completion>;
}

/** Deterministic, network-free provider — used for tests and the offline demo. */
export class MockProvider implements ModelProvider {
  readonly name: string;
  readonly tier: Tier;
  readonly costPer1kTokens: number;

  constructor(name: string, tier: Tier, costPer1kTokens: number) {
    this.name = name;
    this.tier = tier;
    this.costPer1kTokens = costPer1kTokens;
  }

  async complete(prompt: string): Promise<Completion> {
    const promptTokens = Math.ceil(prompt.length / 4);
    const completionTokens =
      this.tier === 'strong' ? Math.min(promptTokens * 2, 800) : Math.min(promptTokens, 200);
    return {
      text: `[${this.name}] handled ${promptTokens} prompt tokens`,
      usage: { promptTokens, completionTokens },
      model: this.name,
    };
  }
}

/** Real OpenAI-compatible provider. Constructed only when an API key exists. */
export class OpenAIProvider implements ModelProvider {
  readonly name: string;
  readonly tier: Tier;
  readonly costPer1kTokens: number;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    name: string,
    tier: Tier,
    costPer1kTokens: number,
    apiKey: string,
    baseUrl = 'https://api.openai.com/v1',
  ) {
    this.name = name;
    this.tier = tier;
    this.costPer1kTokens = costPer1kTokens;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async complete(prompt: string): Promise<Completion> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ model: this.name, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) throw new Error(`provider ${this.name} failed: HTTP ${res.status}`);
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    return {
      text: data.choices?.[0]?.message?.content ?? '',
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
      },
      model: this.name,
    };
  }
}
