// Complexity scoring — the signal the router uses to decide cheap vs. strong.
// Deterministic and dependency-free so routing decisions are testable and explainable.

export interface ComplexitySignals {
  chars: number;
  estTokens: number;
  hasCode: boolean;
  reasoningHits: number;
  questionDepth: number;
}

export interface ComplexityResult {
  /** 0 (trivial) .. 1 (hard reasoning) */
  score: number;
  signals: ComplexitySignals;
}

const REASONING = [
  /\bwhy\b/i, /\bexplain\b/i, /\bprove\b/i, /\banaly[sz]e\b/i, /\bdesign\b/i,
  /\bcompare\b/i, /\btrade-?offs?\b/i, /\bstep[- ]by[- ]step\b/i, /\brefactor\b/i,
  /\barchitecture\b/i, /\bdebug\b/i, /\boptimi[sz]e\b/i, /\breason\b/i,
];

const CODE = /```|\bfunction\b|\bclass\b|=>|;\s*$|\b(def|import|const|let|SELECT|INSERT)\b/m;

/** Score a prompt's reasoning difficulty from a few cheap, explainable heuristics. */
export function scoreComplexity(prompt: string): ComplexityResult {
  const chars = prompt.length;
  const estTokens = Math.ceil(chars / 4);
  const hasCode = CODE.test(prompt);
  const reasoningHits = REASONING.reduce((n, re) => n + (re.test(prompt) ? 1 : 0), 0);
  const questionDepth = (prompt.match(/\?/g) ?? []).length;

  let score = 0;
  score += Math.min(reasoningHits / 2, 1) * 0.5; // explicit reasoning demand dominates
  score += Math.min(estTokens / 300, 1) * 0.25; // longer prompts need more capable models
  score += hasCode ? 0.2 : 0; // code tasks favour the strong model
  score += Math.min(questionDepth / 3, 1) * 0.05;

  return {
    score: clamp01(score),
    signals: { chars, estTokens, hasCode, reasoningHits, questionDepth },
  };
}

function clamp01(n: number): number {
  return Math.min(Math.max(n, 0), 1);
}
