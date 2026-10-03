import { Navigation2 } from 'lucide-react';
import React, { useState } from 'react';

interface RobotState {
  x: number;
  y: number;
  dir: string;
}

interface Wall {
  x: number;
  y: number;
  type: 'sever' | 'vychod' | string;
}

interface KarelGridProps {
  robot: RobotState;
  beepers: Record<string, number>;
  walls: Wall[];
  editMode: 'beeper' | 'wall' | 'robot' | 'none';
  robotEditDir: string;
  onCellClick: (x: number, y: number, wallType?: 'sever' | 'vychod') => void;
  disabled: boolean;
}

interface WallTarget {
  x: number;
  y: number;
  type: 'sever' | 'vychod';
  edge: 'north' | 'east' | 'south' | 'west';
  cellX: number;
  cellY: number;
}

export default function KarelGrid({
  robot,
  beepers,
  walls,
  editMode,
  robotEditDir,
  onCellClick,
  disabled
}: KarelGridProps) {
  const GRID_SIZE = 10;

  // Track hover wall candidate
  const [hoverTarget, setHoverTarget] = useState<WallTarget | null>(null);

  // Generate y-coords from 10 down to 1
  const rows = Array.from({ length: GRID_SIZE }, (_, i) => GRID_SIZE - i);
  // Generate x-coords from 1 to 10
  const cols = Array.from({ length: GRID_SIZE }, (_, i) => i + 1);

  // Helper to check if a specific wall exists in state
  const hasWall = (x: number, y: number, type: 'sever' | 'vychod') => {
    return walls.some(w => w.x === x && w.y === y && (w.type === type || (type === 'sever' && w.type === 'N') || (type === 'vychod' && w.type === 'V')));
  };

  // Helper to calculate closest wall target (north, east, south, west) from relative mouse position in cell
  const getWallTargetFromEvent = (
    e: React.MouseEvent<HTMLDivElement>,
    cellX: number,
    cellY: number
  ): WallTarget => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;   // 0 (left) to 1 (right)
    const relY = (e.clientY - rect.top) / rect.height;  // 0 (top) to 1 (bottom)

    const distNorth = relY;
    const distEast = 1 - relX;
    const distSouth = 1 - relY;
    const distWest = relX;

    const minDist = Math.min(distNorth, distEast, distSouth, distWest);

    if (minDist === distNorth) {
      return { x: cellX, y: cellY, type: 'sever', edge: 'north', cellX, cellY };
    } else if (minDist === distEast) {
      return { x: cellX, y: cellY, type: 'vychod', edge: 'east', cellX, cellY };
    } else if (minDist === distSouth) {
      return { x: cellX, y: cellY - 1, type: 'sever', edge: 'south', cellX, cellY };
    } else {
      return { x: cellX - 1, y: cellY, type: 'vychod', edge: 'west', cellX, cellY };
    }
  };

  // Helper to get rotation degree for robot
  const getRotationAngle = (dir: string) => {
    const d = dir.toLowerCase();
    switch (d) {
      case 'sever':
      case 'north':
        return '0deg';
      case 'vychod':
      case 'east':
        return '90deg';
      case 'jih':
      case 'south':
        return '180deg';
      case 'zapad':
      case 'west':
        return '270deg';
      default:
        return '0deg';
    }
  };

  return (
    <div id="grid-container" className="flex flex-col items-center w-full h-full min-h-0 justify-center">
      {/* Grid Canvas Wrapper */}
      <div className="relative bg-zinc-950/90 p-2 sm:p-3 border border-zinc-800/80 rounded-2xl shadow-xl h-full max-h-full flex items-center justify-center min-h-0 aspect-square max-w-[500px]">
        {/* The Grid coordinates and cells */}
        <div className="flex h-full w-full">
          {/* Y Axis Labels */}
          <div className="flex flex-col justify-around pr-2 text-right text-[10px] sm:text-xs font-mono font-bold text-zinc-500 h-full py-[1%]">
            {rows.map(y => (
              <span key={y} className="flex items-center justify-end flex-1">{y}</span>
            ))}
          </div>

          <div className="flex flex-col h-full w-full flex-1">
            {/* The 10x10 Grid of cells */}
            <div
              id="grid"
              className="grid grid-cols-10 grid-rows-10 bg-zinc-900/50 shadow-inner select-none overflow-hidden flex-1 rounded-sm border border-zinc-800/80"
              style={{
                width: '100%',
                height: '100%',
              }}
              onMouseLeave={() => setHoverTarget(null)}
            >
              {rows.map(y => (
                cols.map(x => {
                  const isRobot = robot.x === x && robot.y === y;
                  const beeperKey = `${x},${y}`;
                  const beeperCount = beepers[beeperKey] || 0;

                  // Wall presence for all 4 edges of this cell
                  const northWall = hasWall(x, y, 'sever');
                  const eastWall = hasWall(x, y, 'vychod');
                  const southWall = hasWall(x, y - 1, 'sever');
                  const westWall = hasWall(x - 1, y, 'vychod');

                  // Hover checks
                  const isHoverNorth = !disabled && editMode === 'wall' && hoverTarget?.cellX === x && hoverTarget?.cellY === y && hoverTarget?.edge === 'north';
                  const isHoverEast = !disabled && editMode === 'wall' && hoverTarget?.cellX === x && hoverTarget?.cellY === y && hoverTarget?.edge === 'east';
                  const isHoverSouth = !disabled && editMode === 'wall' && hoverTarget?.cellX === x && hoverTarget?.cellY === y && hoverTarget?.edge === 'south';
                  const isHoverWest = !disabled && editMode === 'wall' && hoverTarget?.cellX === x && hoverTarget?.cellY === y && hoverTarget?.edge === 'west';

                  return (
                    <div
                      key={`${x}-${y}`}
                      id={`cell-${x}-${y}`}
                      onClick={(e) => {
                        if (disabled) return;
                        if (editMode === 'wall') {
                          const target = getWallTargetFromEvent(e, x, y);
                          onCellClick(target.x, target.y, target.type);
                        } else {
                          onCellClick(x, y);
                        }
                      }}
                      onMouseMove={(e) => {
                        if (!disabled && editMode === 'wall') {
                          const target = getWallTargetFromEvent(e, x, y);
                          setHoverTarget(target);
                        }
                      }}
                      className={`
                        relative flex items-center justify-center border-b border-r border-zinc-800/60 transition-all duration-150 group
                        ${disabled ? 'pointer-events-none' : editMode === 'none' ? 'cursor-default' : 'cursor-pointer hover:bg-emerald-500/10'}
                        ${northWall ? 'border-t-[3.5px] border-t-amber-400 z-10' : y === 10 ? 'border-t border-t-zinc-800/60' : ''}
                        ${eastWall ? 'border-r-[3.5px] border-r-amber-400 z-10' : ''}
                        ${southWall ? 'border-b-[3.5px] border-b-amber-400 z-10' : ''}
                        ${westWall ? 'border-l-[3.5px] border-l-amber-400 z-10' : x === 1 ? 'border-l border-l-zinc-800/60' : ''}
                      `}
                      title={`Pozice [${x}, ${y}]`}
                    >
                      {/* Beeper badge */}
                      {beeperCount > 0 && (
                        <div
                          id={`beeper-${x}-${y}`}
                          className="absolute w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 border border-amber-300 text-amber-950 font-black text-[10px] sm:text-xs rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.5)] z-0"
                        >
                          {beeperCount}
                        </div>
                      )}

                      {/* Robot avatar */}
                      {isRobot && (
                        <div
                          id="robot"
                          className="absolute z-10 w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500/20 border-2 border-emerald-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.6)] flex items-center justify-center text-emerald-400 transition-transform duration-75 transform"
                          style={{
                            transform: `rotate(${getRotationAngle(robot.dir)})`,
                          }}
                        >
                          <Navigation2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 fill-emerald-400/40" />
                        </div>
                      )}

                      {/* Grid dot indicator */}
                      {!isRobot && beeperCount === 0 && (
                        <div className="w-1 h-1 bg-zinc-700/60 rounded-full group-hover:scale-150 group-hover:bg-emerald-400/60 transition-transform"></div>
                      )}

                      {/* Tool Preview Placement */}
                      {!disabled && !isRobot && editMode === 'robot' && (
                        <div
                          className="absolute hidden group-hover:flex z-5 w-6 h-6 bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 rounded-full items-center justify-center opacity-70"
                          style={{ transform: `rotate(${getRotationAngle(robotEditDir)})` }}
                        >
                          <Navigation2 className="w-3.5 h-3.5 fill-emerald-400/40" />
                        </div>
                      )}

                      {!disabled && editMode === 'beeper' && beeperCount === 0 && (
                        <div className="absolute hidden group-hover:flex w-5 h-5 bg-amber-500/20 border border-amber-400/50 rounded-full items-center justify-center text-amber-400 text-[10px] font-bold opacity-70">
                          +
                        </div>
                      )}

                      {/* Dynamic Wall preview (North, East, South, West) */}
                      {isHoverNorth && (
                        <div className={`absolute top-0 left-0 right-0 h-1.5 z-20 transition-all ${
                          northWall ? 'bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                        }`} />
                      )}

                      {isHoverEast && (
                        <div className={`absolute right-0 top-0 bottom-0 w-1.5 z-20 transition-all ${
                          eastWall ? 'bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                        }`} />
                      )}

                      {isHoverSouth && (
                        <div className={`absolute bottom-0 left-0 right-0 h-1.5 z-20 transition-all ${
                          southWall ? 'bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                        }`} />
                      )}

                      {isHoverWest && (
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 z-20 transition-all ${
                          westWall ? 'bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                        }`} />
                      )}
                    </div>
                  );
                })
              ))}
            </div>

            {/* X Axis Labels */}
            <div className="flex justify-around pt-1.5 text-center text-[10px] sm:text-xs font-mono font-bold text-zinc-500 w-full">
              {cols.map(x => (
                <span key={x} className="flex-1">{x}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
