export type CategoryKey = 'connection' | 'communication' | 'patterns' | 'vision';

export interface CheckInQuestion {
  id: number;
  category: CategoryKey;
  text: string;
  reversed?: boolean; // if true, score is inverted (5 becomes 1, etc.)
}

export interface Category {
  key: CategoryKey;
  label: string;
  emoji: string;
  source: string;
  description: string;
  conversationStarters: string[];
}

export const categories: Record<CategoryKey, Category> = {
  connection: {
    key: 'connection',
    label: 'Connection',
    emoji: '💛',
    source: 'Gottman: Love Maps & Bids',
    description: 'How seen, heard, and close you felt to each other this week.',
    conversationStarters: [
      `"What's been taking up the most space in your head this week that I might not know about?"`,
      `"Is there something you've been wanting to tell me but haven't found the right moment?"`,
      `"What's one thing I could do more of that makes you feel close to me?"`,
    ],
  },
  communication: {
    key: 'communication',
    label: 'Communication',
    emoji: '💬',
    source: 'Gottman: Four Horsemen Antidotes',
    description: 'How you handled disagreement, tension, and repair this week.',
    conversationStarters: [
      '"Was there a moment this week where you felt unheard or dismissed — even a small one?"',
      '"When I brought something up that was hard, how did it land for you?"',
      '"What would have made a recent tough conversation go better?"',
    ],
  },
  patterns: {
    key: 'patterns',
    label: 'Patterns',
    emoji: '🌀',
    source: 'Terry Real: Wise Adult / Adaptive Child',
    description: 'Whether you showed up as your best self or fell into old reactive habits.',
    conversationStarters: [
      '"Did you notice me going into any old patterns this week? It\'s okay to say it."',
      '"When did I seem most like my best self this week?"',
      '"Is there something I do when I\'m stressed that makes it harder for you to reach me?"',
    ],
  },
  vision: {
    key: 'vision',
    label: 'Vision',
    emoji: '🌟',
    source: 'Gottman: Shared Meaning & Goals',
    description: 'Whether you feel aligned and excited about where you\'re going together.',
    conversationStarters: [
      '"What\'s something you\'re looking forward to doing together in the next few months?"',
      '"Do you feel like I know what matters most to you right now — your goals, your fears?"',
      '"Is there anything about our future together that feels uncertain or unspoken?"',
    ],
  },
};

export const questions: CheckInQuestion[] = [
  // Connection
  { id: 1, category: 'connection', text: 'This week I felt truly seen by my partner' },
  { id: 2, category: 'connection', text: 'When I reached out for connection, they responded warmly' },
  { id: 3, category: 'connection', text: 'I know what\'s been on their mind lately — their worries, hopes, day-to-day' },
  { id: 4, category: 'connection', text: 'We had at least one real conversation this week (not just logistics)' },

  // Communication
  { id: 5, category: 'communication', text: 'When we disagreed, I expressed myself without attacking their character' },
  { id: 6, category: 'communication', text: 'I felt respected even when we didn\'t see eye to eye' },
  { id: 7, category: 'communication', text: 'When something bothered me, I brought it up without blame' },
  { id: 8, category: 'communication', text: 'We were able to repair quickly after any tension' },

  // Patterns
  { id: 9, category: 'patterns', text: 'I noticed myself shutting down or going cold instead of talking', reversed: true },
  { id: 10, category: 'patterns', text: 'I stayed curious about their perspective instead of defending mine' },
  { id: 11, category: 'patterns', text: 'I showed up as my best self — present, not triggered, not checked out' },
  { id: 12, category: 'patterns', text: 'Old reactive patterns flared up for me this week (going big, withdrawing...)', reversed: true },

  // Vision
  { id: 13, category: 'vision', text: 'We\'re aligned on what matters most to us right now' },
  { id: 14, category: 'vision', text: 'I feel like we\'re building something together, not just coexisting' },
  { id: 15, category: 'vision', text: 'I\'m excited about where we\'re headed as a couple' },
  { id: 16, category: 'vision', text: 'I feel like my partner knows and supports my personal dreams' },
];

export interface CategoryScore {
  category: CategoryKey;
  score: number; // 0–100
  tier: 'thriving' | 'growing' | 'attention';
}

export interface CheckInResult {
  overall: number; // 0–100
  categories: CategoryScore[];
  focusArea: CategoryKey; // lowest scoring category
}

export function calculateResult(answers: Record<number, number>): CheckInResult {
  const categoryTotals: Record<CategoryKey, number> = {
    connection: 0,
    communication: 0,
    patterns: 0,
    vision: 0,
  };
  const categoryCounts: Record<CategoryKey, number> = {
    connection: 0,
    communication: 0,
    patterns: 0,
    vision: 0,
  };

  questions.forEach((q) => {
    const raw = answers[q.id];
    if (raw === undefined) return;
    const value = q.reversed ? 6 - raw : raw; // invert: 1→5, 2→4, etc.
    categoryTotals[q.category] += value;
    categoryCounts[q.category]++;
  });

  const categoryScores: CategoryScore[] = (Object.keys(categories) as CategoryKey[]).map((key) => {
    const count = categoryCounts[key];
    const total = categoryTotals[key];
    const maxPossible = count * 5;
    const minPossible = count * 1;
    const score = count > 0 ? Math.round(((total - minPossible) / (maxPossible - minPossible)) * 100) : 0;
    const tier: CategoryScore['tier'] = score >= 80 ? 'thriving' : score >= 55 ? 'growing' : 'attention';
    return { category: key, score, tier };
  });

  const overall = Math.round(
    categoryScores.reduce((s, c) => s + c.score, 0) / categoryScores.length
  );

  const focusArea = categoryScores.reduce((min, c) => (c.score < min.score ? c : min)).category;

  return { overall, categories: categoryScores, focusArea };
}

export function encodeScores(answers: Record<number, number>): string {
  const result = calculateResult(answers);
  const data = {
    o: result.overall,
    c: result.categories.map(c => c.score),
    f: result.focusArea,
  };
  return btoa(JSON.stringify(data));
}

export function decodeScores(encoded: string): { overall: number; categories: CategoryScore[]; focusArea: CategoryKey } | null {
  try {
    const data = JSON.parse(atob(encoded));
    const categoryKeys = Object.keys(categories) as CategoryKey[];
    return {
      overall: data.o,
      focusArea: data.f,
      categories: categoryKeys.map((key, i) => {
        const score = data.c[i];
        return {
          category: key,
          score,
          tier: score >= 80 ? 'thriving' : score >= 55 ? 'growing' : 'attention',
        };
      }),
    };
  } catch {
    return null;
  }
}

export const emojiScale = [
  { value: 1, emoji: '😕', label: 'Not at all' },
  { value: 2, emoji: '😐', label: 'A little' },
  { value: 3, emoji: '🙂', label: 'Somewhat' },
  { value: 4, emoji: '😊', label: 'Mostly yes' },
  { value: 5, emoji: '🥰', label: 'Absolutely' },
];
