// KnowEm — Level 3 content (Truth or Dare deck)
// Isolated, additive module: does not modify or import from Level 1/2 content.

// Cards 1–5: Chemistry
const CHEMISTRY = [
  "Biggest Turn-On?",
  "Instant Chemistry?",
  "Green Flag?",
  "Love Language?",
  "Flirting Style?",
];

// Cards 6–10: Teasing
const TEASING = [
  "Chase or Be Chased?",
  "Eye Contact?",
  "Dirty Talk?",
  "Tease or Direct?",
  "First Move?",
];

// Cards 11–20: Fantasy & Desire — pool of 15, 10 are sampled per session (no repeats within a session)
const FANTASY_POOL = [
  "Hidden Fantasy?",
  "Roleplay?",
  "Public Romance?",
  "Secret Desire?",
  "Power Dynamic?",
  "Bucket List?",
  "Risky Date?",
  "Dream Scenario?",
  "Control or Surrender?",
  "Morning or Midnight?",
  "Curious To Try?",
  "Romantic Obsession?",
  "Favorite Tension?",
  "Untold Desire?",
  "What If?",
];

export const LEVEL_3_GROUPS = {
  chemistry: { name: "Chemistry", emoji: "💫", prompts: CHEMISTRY },
  teasing: { name: "Teasing", emoji: "😈", prompts: TEASING },
  fantasy: { name: "Fantasy & Desire", emoji: "🔥", prompts: FANTASY_POOL },
};

export const LEVEL_3_DECK_SIZE = 20;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Builds one session's 20-card deck:
 * - Cards 1–5 from Chemistry (fixed pool of 5)
 * - Cards 6–10 from Teasing (fixed pool of 5)
 * - Cards 11–20: 10 randomly sampled (no repeats) from the 15-prompt Fantasy & Desire pool
 * Each card gets a randomized Truth/Dare type (~50/50).
 */
export function buildLevel3Deck() {
  const fantasyTen = shuffle(FANTASY_POOL).slice(0, 10);
  const prompts = [...CHEMISTRY, ...TEASING, ...fantasyTen];

  return prompts.map((prompt, i) => {
    const groupKey = i < 5 ? "chemistry" : i < 10 ? "teasing" : "fantasy";
    return {
      id: `l3-c${i + 1}`,
      prompt,
      groupKey,
      groupName: LEVEL_3_GROUPS[groupKey].name,
      groupEmoji: LEVEL_3_GROUPS[groupKey].emoji,
      type: Math.random() < 0.5 ? "truth" : "dare",
    };
  });
}
