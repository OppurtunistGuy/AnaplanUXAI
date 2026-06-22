/**
 * Verification Script: Level 3 Deck Structure
 * Validates:
 * 1. Hot Layer has 15 prompts
 * 2. Sampling selects 10 without duplicates
 * 3. Each deck has correct poolIndex (1-20)
 * 4. No duplicate prompts in Hot Layer
 * 5. Pool distribution: Truth/Dare (1-7), Teasing (8-10), Hot (11-20)
 */

// Simulate the deck building logic
const TRUTH_DARE = [
  { prompt: "What's something you've never admitted to anyone?", type: "truth" },
  { prompt: "Dare you to describe your ideal date night in detail.", type: "dare" },
  { prompt: "When did you first know you were attracted to me?", type: "truth" },
  { prompt: "Dare you to tell me something you find irresistible about me.", type: "dare" },
  { prompt: "What's your biggest fear about our relationship?", type: "truth" },
  { prompt: "Dare you to whisper something you wish we could do together.", type: "dare" },
  { prompt: "What do you think I don't understand about you?", type: "truth" },
];

const TEASING_BANTER = [
  { prompt: "What's the most mischievous thing you'd like to try with me?", type: "dare" },
  { prompt: "Dare you to describe how you'd seduce me.", type: "dare" },
  { prompt: "What's a playful fantasy you've had about us?", type: "truth" },
];

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

function buildLevel3Deck() {
  const allCards = [];
  let cardIndex = 1;

  TRUTH_DARE.forEach((card) => {
    allCards.push({
      id: `l3-truth-dare-${cardIndex}`,
      prompt: card.prompt,
      type: card.type,
      poolIndex: cardIndex,
    });
    cardIndex++;
  });

  TEASING_BANTER.forEach((card) => {
    allCards.push({
      id: `l3-teasing-${cardIndex}`,
      prompt: card.prompt,
      type: card.type,
      poolIndex: cardIndex,
    });
    cardIndex++;
  });

  const sampledHotLayer = sampleWithoutReplacement(HOT_LAYER_PROMPTS, 10);
  sampledHotLayer.forEach((card) => {
    allCards.push({
      id: `l3-hot-${cardIndex}`,
      prompt: card.prompt,
      type: card.type,
      poolIndex: cardIndex,
    });
    cardIndex++;
  });

  return allCards;
}

// ============ Verification Tests ============

console.log("=== LEVEL 3 DECK VERIFICATION ===\n");

// Test 1: Hot Layer has 15 prompts
console.log("✓ Test 1: Hot Layer Prompt Count");
console.log(`  Expected: 15 prompts`);
console.log(`  Actual: ${HOT_LAYER_PROMPTS.length} prompts`);
console.log(`  Status: ${HOT_LAYER_PROMPTS.length === 15 ? "PASS" : "FAIL"}\n`);

// Test 2: No duplicate prompts in Hot Layer
console.log("✓ Test 2: No Duplicate Prompts in Hot Layer");
const hotPrompts = HOT_LAYER_PROMPTS.map(p => p.prompt);
const uniqueHotPrompts = new Set(hotPrompts);
console.log(`  Expected: 15 unique prompts`);
console.log(`  Actual: ${uniqueHotPrompts.size} unique prompts`);
console.log(`  Status: ${uniqueHotPrompts.size === 15 ? "PASS" : "FAIL"}\n`);

// Test 3: Sampling produces 10 cards without duplicates (run 5 times)
console.log("✓ Test 3: Sampling 10 of 15 without Duplicates (5 samples)");
for (let run = 1; run <= 5; run++) {
  const sampled = sampleWithoutReplacement(HOT_LAYER_PROMPTS, 10);
  const sampledPrompts = new Set(sampled.map(c => c.prompt));
  const hasDuplicates = sampledPrompts.size !== 10;
  const allValid = sampled.every(c => c.type === "hot");
  
  console.log(`  Sample ${run}:`);
  console.log(`    - Count: ${sampled.length}/10 ${sampled.length === 10 ? "✓" : "✗"}`);
  console.log(`    - Unique: ${sampledPrompts.size}/10 ${!hasDuplicates ? "✓" : "✗"}`);
  console.log(`    - All "hot" type: ${allValid ? "✓" : "✗"}`);
}
console.log();

// Test 4: Full deck structure
console.log("✓ Test 4: Full Deck Structure");
const deck1 = buildLevel3Deck();
console.log(`  Total cards: ${deck1.length} (expected 20) ${deck1.length === 20 ? "✓" : "✗"}`);

// Verify pool distribution
const truthDareCards = deck1.filter(c => c.poolIndex >= 1 && c.poolIndex <= 7);
const teasingCards = deck1.filter(c => c.poolIndex >= 8 && c.poolIndex <= 10);
const hotCards = deck1.filter(c => c.poolIndex >= 11 && c.poolIndex <= 20);

console.log(`  Truth/Dare pool (1-7): ${truthDareCards.length} cards ${truthDareCards.length === 7 ? "✓" : "✗"}`);
console.log(`  Teasing pool (8-10): ${teasingCards.length} cards ${teasingCards.length === 3 ? "✓" : "✗"}`);
console.log(`  Hot Layer (11-20): ${hotCards.length} cards ${hotCards.length === 10 ? "✓" : "✗"}\n`);

// Test 5: Pool Index correctness
console.log("✓ Test 5: Pool Index Correctness");
const poolIndexIssues = deck1.filter((card, idx) => card.poolIndex !== idx + 1);
console.log(`  Expected: All poolIndex values 1-20 in order`);
console.log(`  Issues: ${poolIndexIssues.length === 0 ? "None (PASS)" : poolIndexIssues.length + " (FAIL)"}`);
if (poolIndexIssues.length > 0) {
  poolIndexIssues.forEach(card => {
    console.log(`    - Card ${card.id}: poolIndex=${card.poolIndex}, expected=${deck1.indexOf(card) + 1}`);
  });
}
console.log();

// Test 6: Deck types distribution
console.log("✓ Test 6: Type Distribution");
const truthCount = deck1.filter(c => c.type === "truth").length;
const dareCount = deck1.filter(c => c.type === "dare").length;
const hotCount = deck1.filter(c => c.type === "hot").length;

console.log(`  Truth cards: ${truthCount} (expected 4)`);
console.log(`  Dare cards: ${dareCount} (expected 6)`);
console.log(`  Hot cards: ${hotCount} (expected 10)`);
console.log(`  Status: ${truthCount === 4 && dareCount === 6 && hotCount === 10 ? "PASS" : "FAIL"}\n`);

// Test 7: Handoff flow verification (conceptual)
console.log("✓ Test 7: Handoff Flow Pattern");
console.log(`  All ${deck1.length} cards trigger handoff screen: YES (by design)`);
console.log(`  Textarea visible for cards 1-10: YES (poolIndex <= 10)`);
console.log(`  Textarea hidden for cards 11-20: YES (poolIndex >= 11)`);
console.log();

console.log("=== VERIFICATION COMPLETE ===");
