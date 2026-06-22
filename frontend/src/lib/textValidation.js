// Text Input Validation Foundation
// Reusable, dependency-free validation for any user-editable text field
// (Setup player names today; Level 2/3 free-text answers and any future
// editable field can call the same functions).
//
// Scope intentionally kept simple and maintainable without adding a new
// library: a small blocklist + pattern checks, not a full profanity-detection
// service. Extend BLOCKED_TERMS as needed.

// Common abusive / offensive English terms and slurs (kept intentionally
// short and generic — extend this list as needed). Matching is
// case-insensitive and tolerant of simple leetspeak substitutions.
const BLOCKED_TERMS = [
  "fuck", "shit", "bitch", "asshole", "bastard", "cunt", "dick", "pussy",
  "nigger", "nigga", "faggot", "fag", "retard", "whore", "slut", "rape",
  "kill yourself", "kys",
];

// Normalize common leetspeak / separator tricks before matching
// (e.g. dotted, starred, or spaced-out letters) without being so
// aggressive it mangles legitimate names.
function normalizeForMatch(value) {
  return value
    .toLowerCase()
    .replace(/[\s._\-*]+/g, "") // collapse separators bad actors use to dodge filters
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t");
}

/**
 * Returns true if the text contains a blocked abusive/offensive term.
 */
export function containsBlockedLanguage(value) {
  if (!value) return false;
  const normalized = normalizeForMatch(value);
  return BLOCKED_TERMS.some((term) => normalized.includes(term.replace(/[\s.\-*]+/g, "")));
}

/**
 * Returns true if the text is mostly special-character / symbol spam
 * (e.g. "!!!!@@@@", "?#?#?#?#") rather than a real name or answer.
 * Allows normal punctuation in free-text answers (contractions, exclamation
 * marks, dashes, etc.) — this only flags strings with no real word content,
 * or long repeated runs of the same symbol.
 */
export function isSpecialCharacterSpam(value) {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;

  // A "word" here is 2+ consecutive letters/numbers from any language/script
  // (covers accents, CJK, Devanagari, etc.) — i.e. something that reads like
  // an actual word or number, not just scattered alphanumerics between symbols.
  const hasRealWord = /[\p{L}\p{N}]{2,}/u.test(trimmed);
  if (trimmed.length >= 4 && !hasRealWord) return true;

  // Long runs of the exact same non-word character (e.g. "!!!!!!!!", "######").
  if (/([^\p{L}\p{N}\s])\1{3,}/u.test(trimmed)) return true;

  // Very short strings (under the word-content check's length floor) made
  // entirely of punctuation/symbol characters with no letters/numbers at all
  // (e.g. "##", "!!"). Emoji are excluded — they're expressive content, not spam.
  const isPunctuationOnly = /^[!-/:-@[-`{-~]+$/.test(trimmed);
  if (trimmed.length < 4 && !hasRealWord && isPunctuationOnly) return true;

  return false;
}

/**
 * Single entry point for validating user-entered text across the app.
 * Returns { valid: boolean, reason: string|null } — reason is a short,
 * user-friendly message suitable for inline display, or null when valid.
 */
export function validateUserText(value) {
  if (containsBlockedLanguage(value)) {
    return { valid: false, reason: "Please keep it friendly — that word isn't allowed." };
  }
  if (isSpecialCharacterSpam(value)) {
    return { valid: false, reason: "Please use letters, not just symbols." };
  }
  return { valid: true, reason: null };
}
