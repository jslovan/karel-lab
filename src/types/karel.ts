export type Direction = 'sever' | 'jih' | 'vychod' | 'zapad';

export interface Robot {
  x: number;
  y: number;
  dir: Direction;
}

export interface Wall {
  x: number;
  y: number;
  type: 'sever' | 'vychod';
}

export type BeeperMap = Record<string, number>;

export interface BeeperDiff {
  x: number;
  y: number;
  count: number;
}

export interface ASTItem {
  type: 'builtin' | 'routine' | 'opakuj' | 'dokud' | 'kdyz' | 'raw';
  internal?: string;
  name?: string;
  label?: string;
  count?: number;
  condition?: string;
  predObj?: any;
  body?: ASTItem[];
  then?: ASTItem[];
  else?: ASTItem[];
  rawStr?: string;
  rawProlog?: string;
}

export interface StepDiff {
  robot: Robot; // snapshot of Karel after step
  old: {
    robot: Robot; // snapshot of Karel before step
    beeper: BeeperDiff | null; // beeper to be changed (before step), or null
    command: ASTItem; // command at the top of stack (to be removed)
  };
  new: {
    robot: Robot; // new robot state
    beeper: BeeperDiff | null; // new beeper info (only for field that changed), or null
    commands: ASTItem[]; // commands pushed to top (if reduced abstract command), or [] if builtin consumed
  };
  actionMsg?: string;
}

export type Language = 'cs' | 'en';
export type EditMode = 'beeper' | 'wall' | 'robot' | 'none';

export interface WorldState {
  robot: Robot;
  beepers: BeeperMap;
  walls: Wall[];
}
