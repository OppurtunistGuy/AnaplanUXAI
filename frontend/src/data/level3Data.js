// KnowEm — Level 3 content (20-card Tiered Deck)
// Isolated, additive module: does not modify or import from Level 1/2 content.
// Pool structure: Truth/Dare (1-7), Teasing/Banter (8-10), Hot Layer (11-20)

// Pool 1: Truth & Dare (Cards 1–7) — Free-text input required
const TRUTH_DARE = [
  { prompt: "What's something you've never admitted to anyone?", type: "truth" },
  { prompt: "Dare you to describe your ideal date night in detail.", type: "dare" },
  { prompt: "When did you first know you were attracted to me?", type: "truth" },
  { prompt: "Dare you to tell me something you find irresistible about me.", type: "dare" },
  { prompt: "What's your biggest fear about our relationship?", type: "truth" },
  { prompt: "Dare you to whisper something you wish we could do together.", type: "dare" },
  { prompt: "What do you think I don't understand about you?", type: "truth" },
];

// Pool 2: Teasing & Banter (Cards 8–10) — Free-text input required
const TEASING_BANTER = [
  { prompt: "What's the most mischievous thing you'd like to try with me?", type: "dare" },
  { prompt: "Dare you to describe how you'd seduce me.", type: "dare" },
  { prompt: "What's a playful fantasy you've had about us?", type: "truth" },
];

// Pool 3: Hot Layer (15 prompts, sampled 10 per session) — No input; reaction-based only
const HOT_LAYER_PROMPTS = [
  { prompt: "I want you right now.", type: "hot" },
  { prompt: "You're the most attractive person I know.", type: "hot" },
  { prompt: "I fantasize about you.", type: "hot" },
  { prompt: "I want to try something we've never done.", type: "hot" },
  { prompt: "I find your confidence irresistible.", type: "hot" },
  { prompt: "I want to feel your touch.", type: "hot" },
  { prompt: "You drive me crazy in the best way.", type: "hot" },
  { prompt: "I want to explore intimacy with you.", type: "hot" },
  { prompt: "You're all I think about.", type: "hot" },
  { prompt: "I desire you completely.", type: "hot" },
  { prompt: "Your presence alone excites me.", type: "hot" },
  { prompt: "I love the way you move.", type: "hot" },
  { prompt: "You make me feel alive.", type: "hot" },
  { prompt: "I crave your attention.", type: "hot" },
  { prompt: "You're my perfect match.", type: "hot" },
];

function sampleWithoutReplacement(arr, n) {
  const copy = [...arr];
  const result = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
}

// Category groups displayed on the Level 3 category selection screen.
// Each group has an emoji, display name, and accent color.
export const LEVEL_3_GROUPS = {
  "truth-dare": { emoji: "❤️", name: "Truth & Dare", color: "#FF3CAC" },
  "teasing": { emoji: "😏", name: "Teasing & Banter", color: "#6C3BFF" },
  "hot": { emoji: "🔥", name: "Hot Layer", color: "#E31C23" },
};

export const LEVEL_3_DECK_SIZE = 20;

/**
 * Builds one session's 20-card linear deck:
 * - Cards 1–7: Truth/Dare (free-text input)
 * - Cards 8–10: Teasing/Banter (free-text input)
 * - Cards 11–20: Hot Layer (10 of 15 prompts, sampled without replacement)
 * - Pool order is preserved; no shuffling between pools
 */
export function buildLevel3Deck() {
  const allCards = [];
  let cardIndex = 1;

  // Add Truth/Dare pool (1-7)
  TRUTH_DARE.forEach((card) => {
    allCards.push({
      id: `l3-truth-dare-${cardIndex}`,
      prompt: card.prompt,
      type: card.type,
      poolIndex: cardIndex,
      groupKey: "truth-dare",
      groupName: "Truth & Dare",
    });
    cardIndex++;
  });

  // Add Teasing/Banter pool (8-10)
  TEASING_BANTER.forEach((card) => {
    allCards.push({
      id: `l3-teasing-${cardIndex}`,
      prompt: card.prompt,
      type: card.type,
      poolIndex: cardIndex,
      groupKey: "teasing",
      groupName: "Teasing & Banter",
    });
    cardIndex++;
  });

  // Add Hot Layer (11-20): sample 10 of 15 prompts without replacement
  const sampledHotLayer = sampleWithoutReplacement(HOT_LAYER_PROMPTS, 10);
  sampledHotLayer.forEach((card) => {
    allCards.push({
      id: `l3-hot-${cardIndex}`,
      prompt: card.prompt,
      type: card.type,
      poolIndex: cardIndex,
      groupKey: "hot",
      groupName: "Hot Layer",
    });
    cardIndex++;
  });

  return allCards;
}
