import { Robot, Wall, BeeperMap, Language, WorldState } from '../types/karel';

export function createBoundaryWalls(gridSize = 10): Wall[] {
  const walls: Wall[] = [];
  // North boundary (top edge of row 10): (1..10, 10, 'sever')
  for (let x = 1; x <= gridSize; x++) {
    walls.push({ x, y: gridSize, type: 'sever' });
  }
  // East boundary (right edge of col 10): (10, 1..10, 'vychod')
  for (let y = 1; y <= gridSize; y++) {
    walls.push({ x: gridSize, y, type: 'vychod' });
  }
  // South boundary (bottom edge of row 1): (1..10, 0, 'sever')
  for (let x = 1; x <= gridSize; x++) {
    walls.push({ x, y: 0, type: 'sever' });
  }
  // West boundary (left edge of col 1): (0, 1..10, 'vychod')
  for (let y = 1; y <= gridSize; y++) {
    walls.push({ x: 0, y, type: 'vychod' });
  }
  return walls;
}

export const DEFAULT_ROBOT: Robot = { x: 1, y: 1, dir: 'sever' };
export const DEFAULT_BEEPERS: BeeperMap = {};
export const DEFAULT_WALLS: Wall[] = createBoundaryWalls();

export const DEFAULT_CS_CODE = `// Definice otočení doprava
definuj vpravo [
  vlevo
  vlevo
  vlevo
]

// Hlavní program
opakuj 4 [
  krok
  poloz
  vpravo
]`;

export const DEFAULT_EN_CODE = `// Define turning right
define right [
  left
  left
  left
]

// Main program
repeat 4 [
  step
  put
  right
]`;

export const STORAGE_KEYS = {
  LANG: 'karel_last_lang',
  CODE: 'karel_last_code',
  WORLD: 'karel_last_world',
};

export function loadSavedLang(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    if (saved === 'cs' || saved === 'en') return saved;
  } catch (e) {
    console.warn('Could not read saved language from localStorage', e);
  }
  return 'cs';
}

export function saveSavedLang(lang: Language): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  } catch (e) {
    console.warn('Could not save language to localStorage', e);
  }
}

export function loadSavedCode(defaultLang: Language): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CODE);
    if (saved !== null && typeof saved === 'string' && saved.trim().length > 0) {
      return saved;
    }
  } catch (e) {
    console.warn('Could not read saved code from localStorage', e);
  }
  return defaultLang === 'en' ? DEFAULT_EN_CODE : DEFAULT_CS_CODE;
}

export function saveSavedCode(code: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CODE, code);
  } catch (e) {
    console.warn('Could not save code to localStorage', e);
  }
}

export function isBoundaryWall(w: Wall, gridSize = 10): boolean {
  if (w.type === 'sever' && (w.y === gridSize || w.y === 0)) return true;
  if (w.type === 'vychod' && (w.x === gridSize || w.x === 0)) return true;
  return false;
}

export interface SharePayload {
  v?: number;
  lang: Language;
  code: string;
  robot: Robot;
  beepers: BeeperMap;
  customWalls?: Wall[];
}

function toUrlSafeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromUrlSafeBase64(base64Str: string): string {
  let str = base64Str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function generateShareUrl(payload: {
  lang: Language;
  code: string;
  robot: Robot;
  beepers: BeeperMap;
  walls: Wall[];
  challengeId?: string;
}): string {
  const url = new URL(window.location.href);

  if (payload.challengeId) {
    url.hash = `challenge=${encodeURIComponent(payload.challengeId)}`;
    return url.toString();
  }

  const customWalls = (payload.walls || []).filter((w) => !isBoundaryWall(w));
  const data: SharePayload = {
    v: 1,
    lang: payload.lang,
    code: payload.code,
    robot: payload.robot,
    beepers: payload.beepers,
    customWalls: customWalls.length > 0 ? customWalls : undefined,
  };

  const jsonStr = JSON.stringify(data);
  const hashVal = toUrlSafeBase64(jsonStr);

  url.hash = `share=${hashVal}`;
  return url.toString();
}

export function getChallengeIdFromUrl(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash;
    if (hash.startsWith('#challenge=')) {
      return decodeURIComponent(hash.substring(11));
    }
    const params = new URLSearchParams(window.location.search);
    return params.get('challenge') || null;
  } catch (e) {
    console.warn('Could not parse challenge ID from URL', e);
    return null;
  }
}

export function loadSharedStateFromUrl(): {
  lang: Language;
  code: string;
  world: WorldState;
} | null {
  try {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash;
    let shareParam = '';

    if (hash.startsWith('#share=')) {
      shareParam = hash.substring(7);
    } else {
      const params = new URLSearchParams(window.location.search);
      shareParam = params.get('share') || '';
    }

    if (!shareParam) return null;

    const jsonStr = fromUrlSafeBase64(shareParam);
    const parsed: SharePayload = JSON.parse(jsonStr);

    if (!parsed || typeof parsed !== 'object') return null;

    const lang: Language = parsed.lang === 'en' ? 'en' : 'cs';
    const code = typeof parsed.code === 'string' && parsed.code.length > 0
      ? parsed.code
      : loadSavedCode(lang);

    const robot: Robot = parsed.robot && typeof parsed.robot.x === 'number' && typeof parsed.robot.y === 'number' && parsed.robot.dir
      ? parsed.robot
      : DEFAULT_ROBOT;

    const beepers: BeeperMap = parsed.beepers && typeof parsed.beepers === 'object' && !Array.isArray(parsed.beepers)
      ? parsed.beepers
      : DEFAULT_BEEPERS;

    const boundaryWalls = createBoundaryWalls();
    const customWalls = Array.isArray(parsed.customWalls) ? parsed.customWalls : [];
    const walls: Wall[] = [...boundaryWalls, ...customWalls];

    return {
      lang,
      code,
      world: { robot, beepers, walls },
    };
  } catch (e) {
    console.warn('Could not parse shared state from URL', e);
    return null;
  }
}

export function loadSavedWorld(): WorldState {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.WORLD);
    if (saved) {
      const parsed = JSON.parse(saved);
      const robot: Robot = parsed.robot && typeof parsed.robot.x === 'number' && typeof parsed.robot.y === 'number' && parsed.robot.dir
        ? { x: parsed.robot.x, y: parsed.robot.y, dir: parsed.robot.dir }
        : DEFAULT_ROBOT;
      const beepers: BeeperMap = parsed.beepers && typeof parsed.beepers === 'object' && !Array.isArray(parsed.beepers)
        ? parsed.beepers
        : DEFAULT_BEEPERS;
      const walls: Wall[] = Array.isArray(parsed.walls) && parsed.walls.length > 0
        ? parsed.walls
        : DEFAULT_WALLS;
      return { robot, beepers, walls };
    }
  } catch (e) {
    console.warn('Could not read saved world from localStorage', e);
  }
  return { robot: DEFAULT_ROBOT, beepers: DEFAULT_BEEPERS, walls: DEFAULT_WALLS };
}

export function saveSavedWorld(world: WorldState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORLD, JSON.stringify(world));
  } catch (e) {
    console.warn('Could not save world to localStorage', e);
  }
}
