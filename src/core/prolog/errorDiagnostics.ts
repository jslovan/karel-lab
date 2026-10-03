import { Robot, Wall, ASTItem, Language, BeeperMap } from '../../types/karel';
import { ErrorContextInfo, PrologDiagnosticDetails } from '../../components/ErrorContextInspector';

/**
 * Builds rich runtime error context with collision or beeper obstacle details.
 */
export function buildRuntimeErrorContext(
  errorMsg: string,
  robot: Robot,
  beepers: BeeperMap,
  trace: ASTItem[],
  walls: Wall[],
  time: number,
  lang: Language,
  breadcrumbs?: string[],
  prologDetails?: PrologDiagnosticDetails
): ErrorContextInfo {
  const isCs = lang === 'cs';
  const rx = robot.x;
  const ry = robot.y;
  const dir = robot.dir;
  const beeperCount = beepers[`${rx},${ry}`] || 0;
  const activeInstr = trace[0];

  let fx = rx;
  let fy = ry;
  if (dir === 'sever') fy = ry + 1;
  else if (dir === 'vychod') fx = rx + 1;
  else if (dir === 'jih') fy = ry - 1;
  else if (dir === 'zapad') fx = rx - 1;

  const outOfBounds = fx < 1 || fx > 10 || fy < 1 || fy > 10;
  let hasWallInFront = false;
  let obstacleInfo = '';

  if (dir === 'sever') {
    hasWallInFront = walls.some(w => w.x === rx && w.y === ry && w.type === 'sever') || fy > 10;
    if (fy > 10) {
      obstacleInfo = isCs ? 'Severní okraj mřížky (Y > 10)' : 'North boundary of grid (Y > 10)';
    } else if (hasWallInFront) {
      obstacleInfo = isCs ? `Severní zeď na pozici [${rx}, ${ry}]` : `North wall at position [${rx}, ${ry}]`;
    }
  } else if (dir === 'vychod') {
    hasWallInFront = walls.some(w => w.x === rx && w.y === ry && w.type === 'vychod') || fx > 10;
    if (fx > 10) {
      obstacleInfo = isCs ? 'Východní okraj mřížky (X > 10)' : 'East boundary of grid (X > 10)';
    } else if (hasWallInFront) {
      obstacleInfo = isCs ? `Východní zeď na pozici [${rx}, ${ry}]` : `East wall at position [${rx}, ${ry}]`;
    }
  } else if (dir === 'jih') {
    hasWallInFront = walls.some(w => w.x === rx && w.y === fy && w.type === 'sever') || fy < 1;
    if (fy < 1) {
      obstacleInfo = isCs ? 'Jižní okraj mřížky (Y < 1)' : 'South boundary of grid (Y < 1)';
    } else if (hasWallInFront) {
      obstacleInfo = isCs ? `Jižní zeď (severní zeď na [${rx}, ${fy}])` : `South wall (north wall of [${rx}, ${fy}])`;
    }
  } else if (dir === 'zapad') {
    hasWallInFront = walls.some(w => w.x === fx && w.y === ry && w.type === 'vychod') || fx < 1;
    if (fx < 1) {
      obstacleInfo = isCs ? 'Západní okraj mřížky (X < 1)' : 'West boundary of grid (X < 1)';
    } else if (hasWallInFront) {
      obstacleInfo = isCs ? `Západní zeď (východní zeď na [${fx}, ${ry}])` : `West wall (east wall of [${fx}, ${ry}])`;
    }
  }

  let finalMsg = errorMsg;
  if (errorMsg.includes('BUM') || errorMsg.includes('zed') || errorMsg.includes('wall') || errorMsg.includes('CRASH')) {
    finalMsg = isCs
      ? `BUM! Karel narazil do překážky: ${obstacleInfo || 'zeď nebo okraj mřížky'}`
      : `CRASH! Karel collided with obstacle: ${obstacleInfo || 'wall or grid boundary'}`;
  } else if (errorMsg.includes('znacka') || errorMsg.includes('beeper') || errorMsg.includes('Zadna')) {
    finalMsg = isCs
      ? `Chyba zvednutí značky: Na pozici [${rx}, ${ry}] se nenachází žádná značka!`
      : `Pick beeper error: No beepers at position [${rx}, ${ry}]!`;
  }

  return {
    type: 'data',
    errorType: 'runtime',
    message: finalMsg,
    breadcrumbs: breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs : undefined,
    step: time,
    robot: { ...robot },
    beeperCount,
    failedInstruction: activeInstr,
    traceSnapshot: trace,
    obstacleInfo,
    frontCoord: { x: fx, y: fy, outOfBounds },
    hasWallInFront,
    hasBeeperHere: beeperCount > 0,
    rawError: errorMsg,
    prologDetails
  };
}

/**
 * Builds syntax error context with code tokens, breadcrumbs and diagnostics.
 */
export function buildSyntaxErrorContext(
  errorMsg: string,
  _lang: Language,
  breadcrumbs?: string[],
  prologDetails?: PrologDiagnosticDetails
): ErrorContextInfo {
  return {
    type: 'code',
    errorType: 'syntax',
    message: errorMsg,
    breadcrumbs: breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs : undefined,
    rawError: errorMsg,
    prologDetails
  };
}
