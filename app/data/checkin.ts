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
    label: 'Conexión',
    emoji: '💛',
    source: 'Gottman: Mapas del amor y "bids"',
    description: 'Qué tan visto, escuchado y cercano te sentiste esta semana.',
    conversationStarters: [
      `"¿Qué es lo que más ha ocupado tu cabeza esta semana y que quizás yo no sé?"`,
      `"¿Hay algo que has querido contarme pero no has encontrado el momento?"`,
      `"¿Qué es una cosa que yo podría hacer más para que te sientas cerca de mí?"`,
    ],
  },
  communication: {
    key: 'communication',
    label: 'Comunicación',
    emoji: '💬',
    source: 'Gottman: Los Cuatro Jinetes y sus antídotos',
    description: 'Cómo manejaron los desacuerdos, la tensión y la reparación esta semana.',
    conversationStarters: [
      '"¿Hubo un momento esta semana en que te sentiste ignorado o menospreciado — aunque fuera pequeño?"',
      '"Cuando saqué algo difícil a relucir, ¿cómo lo recibiste?"',
      '"¿Qué hubiera hecho mejor una conversación reciente que fue difícil?"',
    ],
  },
  patterns: {
    key: 'patterns',
    label: 'Patrones',
    emoji: '🌀',
    source: 'Terry Real: Adulto sabio / Niño adaptado',
    description: 'Si fuiste tu mejor versión o caíste en viejos hábitos reactivos.',
    conversationStarters: [
      '"¿Notaste que yo caí en algún patrón viejo esta semana? Está bien decirlo."',
      '"¿Cuándo parecí más mi mejor versión esta semana?"',
      '"¿Hay algo que hago cuando estoy estresado que te hace más difícil llegar a mí?"',
    ],
  },
  vision: {
    key: 'vision',
    label: 'Visión',
    emoji: '🌟',
    source: 'Gottman: Significado compartido y metas',
    description: 'Si te sientes alineado y emocionado con hacia dónde van juntos.',
    conversationStarters: [
      '"¿Qué es algo que tienes ganas de hacer juntos en los próximos meses?"',
      '"¿Sientes que yo sé lo que más te importa ahora mismo — tus metas, tus miedos?"',
      '"¿Hay algo sobre nuestro futuro juntos que se siente incierto o no dicho?"',
    ],
  },
};

export const questions: CheckInQuestion[] = [
  // Conexión
  { id: 1, category: 'connection', text: 'Esta semana me sentí verdaderamente visto/a por mi pareja' },
  { id: 2, category: 'connection', text: 'Cuando busqué conexión, respondió con calidez' },
  { id: 3, category: 'connection', text: 'Sé lo que ha tenido en mente últimamente — sus preocupaciones, esperanzas, el día a día' },
  { id: 4, category: 'connection', text: 'Tuvimos al menos una conversación real esta semana (no solo logística)' },

  // Comunicación
  { id: 5, category: 'communication', text: 'Cuando no estuvimos de acuerdo, me expresé sin atacar su carácter' },
  { id: 6, category: 'communication', text: 'Me sentí respetado/a incluso cuando no vimos las cosas igual' },
  { id: 7, category: 'communication', text: 'Cuando algo me molestó, lo saqué sin culpar' },
  { id: 8, category: 'communication', text: 'Pudimos reparar rápidamente después de cualquier tensión' },

  // Patrones
  { id: 9, category: 'patterns', text: 'Me noté cerrándome o enfriándome en lugar de hablar', reversed: true },
  { id: 10, category: 'patterns', text: 'Me mantuve curioso/a sobre su perspectiva en lugar de defenderme' },
  { id: 11, category: 'patterns', text: 'Estuve presente como mi mejor versión — sin detonantes, sin desconectarme' },
  { id: 12, category: 'patterns', text: 'Patrones reactivos viejos aparecieron esta semana (explotando, retirándome...)', reversed: true },

  // Visión
  { id: 13, category: 'vision', text: 'Estamos alineados en lo que más nos importa ahora mismo' },
  { id: 14, category: 'vision', text: 'Siento que estamos construyendo algo juntos, no solo conviviendo' },
  { id: 15, category: 'vision', text: 'Me emociona hacia dónde vamos como pareja' },
  { id: 16, category: 'vision', text: 'Siento que mi pareja conoce y apoya mis sueños personales' },
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
  { value: 1, emoji: '😕', label: 'Para nada' },
  { value: 2, emoji: '😐', label: 'Un poco' },
  { value: 3, emoji: '🙂', label: 'Algo sí' },
  { value: 4, emoji: '😊', label: 'Casi siempre' },
  { value: 5, emoji: '🥰', label: 'Totalmente' },
];
