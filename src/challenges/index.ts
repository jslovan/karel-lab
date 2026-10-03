import { Language, Wall } from '../types/karel';
import { createBoundaryWalls } from '../services/storageService';
import {
  Challenge,
  RawChallengeWorld,
  ChallengeLocaleCatalog,
  ChallengeCategory,
} from './types';

// Locales
import csCatalog from './locales/cs/challenges.json';
import enCatalog from './locales/en/challenges.json';

// P0: Zero-touch Vite glob imports - auto-loads any *.json file added to worlds/
const worldModules = import.meta.glob<RawChallengeWorld>('./worlds/*.json', {
  eager: true,
  import: 'default',
});

// Explicit canonical ordering for progressive pedagogical learning flow
const CHALLENGE_ORDER: string[] = [
  'first_steps',
  'basics_01_monkey',
  'basics_02_house',
  'basics_03_architect',
  'basics_04_stairs',
  'beeper_harvest',
  'basics_05_vacuum',
  'basics_06_minefield',
  'automata_07_right_hand',
  'automata_08_island_trap',
  'automata_09_visited_marks',
  'geometry_10_ping_pong',
  'geometry_11_golden_ratio',
  'geometry_12_chessboard',
  'recursion_13_yoyo',
  'recursion_14_harvest',
  'recursion_15_tremaux',
  'recursion_16_fractal_tree',
  'cs_17_counter',
  'cs_18_binary_printer',
  'cs_19_binary_adder',
  'cs_20_integral',
  'cs_21_sorting',
  'cs_22_spiral',
  'cs_23_binary_search',
  'cs_24_sieve',
  'cs_25_gcd',
  'cs_26_rle_compress',
  'cs_27_viterbi',
  'cs_28_cellular_automata',
  'cs_29_self_modifying',
];

const RAW_WORLDS: RawChallengeWorld[] = (
  Object.values(worldModules) as RawChallengeWorld[]
).sort((a, b) => {
  const indexA = CHALLENGE_ORDER.indexOf(a.id);
  const indexB = CHALLENGE_ORDER.indexOf(b.id);
  if (indexA !== -1 && indexB !== -1) return indexA - indexB;
  if (indexA !== -1) return -1;
  if (indexB !== -1) return 1;
  return a.id.localeCompare(b.id);
});

const LOCALES: Record<Language, ChallengeLocaleCatalog> = {
  cs: csCatalog as ChallengeLocaleCatalog,
  en: enCatalog as ChallengeLocaleCatalog,
};

export function getChallenges(lang: Language): Challenge[] {
  const catalog = LOCALES[lang] || LOCALES.cs;
  const boundaryWalls = createBoundaryWalls();

  return RAW_WORLDS.map((rw) => {
    const customWalls: Wall[] = rw.walls || [];
    const allWalls: Wall[] = [...boundaryWalls, ...customWalls];
    const loc = catalog[rw.id] || LOCALES.en[rw.id] || {
      title: rw.id,
      summary: '',
      code: '',
    };

    return {
      id: rw.id,
      category: rw.category,
      difficulty: rw.difficulty,
      world: {
        robot: rw.robot,
        beepers: rw.beepers,
        walls: allWalls,
      },
      title: loc.title,
      summary: loc.summary,
      code: loc.code,
    };
  });
}

export function getChallengeById(id: string, lang: Language): Challenge | undefined {
  const challenges = getChallenges(lang);
  return challenges.find((c) => c.id === id);
}

export const CATEGORY_LABELS: Record<
  ChallengeCategory,
  { cs: string; en: string; icon: string }
> = {
  basics: {
    cs: 'Základy',
    en: 'Basics',
    icon: '🧭',
  },
  loops: {
    cs: 'Cykly',
    en: 'Loops',
    icon: '🔄',
  },
  automata: {
    cs: 'Automaty a bludiště',
    en: 'Automata & Mazes',
    icon: '⚡',
  },
  geometry: {
    cs: 'Geometrie a paměť',
    en: 'Geometry & Memory',
    icon: '📐',
  },
  recursion: {
    cs: 'Zásobník a rekurze',
    en: 'Stacks & Recursion',
    icon: '🪞',
  },
  theory: {
    cs: 'Teorie a algoritmy',
    en: 'CS Theory & Algorithms',
    icon: '🧠',
  },
};
