import { Robot, BeeperMap, Wall } from '../types/karel';

export type ChallengeCategory =
  | 'basics'
  | 'loops'
  | 'automata'
  | 'geometry'
  | 'recursion'
  | 'theory';

export interface RawChallengeWorld {
  id: string;
  category: ChallengeCategory;
  difficulty: 1 | 2 | 3;
  robot: Robot;
  beepers: BeeperMap;
  walls?: Wall[];
}

export interface ChallengeLocaleItem {
  title: string;
  summary: string;
  code: string;
}

export type ChallengeLocaleCatalog = Record<string, ChallengeLocaleItem>;

export interface Challenge {
  id: string;
  category: ChallengeCategory;
  difficulty: 1 | 2 | 3;
  world: {
    robot: Robot;
    beepers: BeeperMap;
    walls: Wall[];
  };
  title: string;
  summary: string;
  code: string;
}
