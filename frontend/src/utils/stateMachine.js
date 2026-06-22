const VALID_TRANSITIONS = {
  'landing': ['mode-select'],
  'mode-select': ['setup', 'remote-setup'],
  'setup': ['l1-question'],
  'l1-question': ['l1-locked', 'inactivity-end'],
  'l1-locked': ['l1-handoff'],
  'l1-handoff': ['l1-question'],
  'l1-both': ['l1-both', 'l1-complete', 'l1-question'],
  'l1-both-final': ['l1-complete'],
  'l1-complete': ['l1-decline-prompt'],
  'l1-decline-prompt': ['l2-dice', 'closure'],
  'l2-dice': ['l2-category'],
  'l2-category': ['l2-cards'],
  'l2-cards': ['l2-card-flip'],
  'l2-card-flip': ['l2-question'],
  'l2-question': ['l2-locked'],
  'l2-locked': ['l2-handoff'],
  'l2-handoff': ['l2-question'],
  'l2-both': ['l2-both', 'l2-complete', 'l2-dice'],
  'l2-complete': ['insights', 'l2-dice'],
  'insights': ['l3-teaser', 'landing'],
  'l3-consent': ['l3-intro', 'closure'],
  'l3-intro': ['l3-how-it-works'],
  'l3-how-it-works': ['l3-category-select'],
  'l3-category-select': ['l3-card'],
  'l3-card': ['l3-question', 'l3-results'],
  'l3-question': ['l3-locked'],
  'l3-locked': ['l3-handoff'],
  'l3-handoff': ['l3-question'],
  'l3-both': ['l3-both', 'l3-reflection', 'l3-results'],
  'l3-reflection': ['l3-card', 'l3-results'],
  'l3-results': ['landing'],
  'l3-teaser': ['l3-consent', 'insights'],
  'inactivity-end': ['closure'],
  'closure': ['landing', 'insights'],
};

export function canTransition(from, to) {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    console.error(`Invalid transition: ${from} → ${to}`);
    // In development, throw; in production, redirect to safe state
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Invalid state transition: ${from} → ${to}`);
    }
    return false;
  }
  return true;
}