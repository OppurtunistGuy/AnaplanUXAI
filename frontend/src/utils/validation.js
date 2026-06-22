export function validateGameState(state) {
  if (!state || typeof state !== 'object') {
    throw new Error('Invalid state: not an object');
  }

  // Ensure level3.answers is always an array
  if (!Array.isArray(state.level3?.answers)) {
    console.warn('Fixing corrupted level3.answers');
    state.level3.answers = [];
  }

  // Ensure level1.answers is always an array
  if (!Array.isArray(state.level1?.answers)) {
    console.warn('Fixing corrupted level1.answers');
    state.level1.answers = [];
  }

  // Ensure level2.answers is always an array
  if (!Array.isArray(state.level2?.answers)) {
    console.warn('Fixing corrupted level2.answers');
    state.level2.answers = [];
  }

  return state;
}