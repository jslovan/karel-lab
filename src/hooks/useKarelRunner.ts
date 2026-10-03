import { useState, useEffect, useRef, useCallback } from 'react';
import pl from 'tau-prolog';
import {
  Robot,
  Wall,
  Direction,
  BeeperMap,
  BeeperDiff,
  ASTItem,
  StepDiff,
  Language,
  EditMode,
} from '../types/karel';
import {
  loadSavedLang,
  saveSavedLang,
  loadSavedCode,
  saveSavedCode,
  loadSavedWorld,
  saveSavedWorld,
  loadSharedStateFromUrl,
  getChallengeIdFromUrl,
  generateShareUrl,
  DEFAULT_ROBOT,
  DEFAULT_BEEPERS,
  DEFAULT_WALLS,
  DEFAULT_CS_CODE,
  DEFAULT_EN_CODE,
} from '../services/storageService';
import {
  tokenizeKarel,
  termToPrologString,
  astItemToPrologString,
  parsePrologASTList,
  parsePrologErrorTerm,
} from '../core/prolog/astParser';
import {
  buildRuntimeErrorContext,
  buildSyntaxErrorContext,
} from '../core/prolog/errorDiagnostics';
import { createPrologSession } from '../core/prolog/prologEngine';
import { ErrorContextInfo } from '../components/ErrorContextInspector';
import { Challenge } from '../challenges/types';
import { getChallengeById } from '../challenges';

export function useKarelRunner() {
  const initialLang = loadSavedLang();
  const deepLinkedChallengeId = typeof window !== 'undefined' ? getChallengeIdFromUrl() : null;
  const deepLinkedChallenge = deepLinkedChallengeId ? getChallengeById(deepLinkedChallengeId, initialLang) : null;
  const sharedState = useRef(loadSharedStateFromUrl()).current;

  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(deepLinkedChallenge?.id ?? null);
  const [lang, setLang] = useState<Language>(() => sharedState?.lang ?? initialLang);
  const [session, setSession] = useState<any>(null);
  const [code, setCode] = useState(() => {
    if (deepLinkedChallenge) return deepLinkedChallenge.code;
    return sharedState?.code ?? loadSavedCode(sharedState?.lang ?? initialLang);
  });

  const [savedWorld] = useState(() => {
    if (deepLinkedChallenge) {
      return {
        robot: deepLinkedChallenge.world.robot,
        beepers: deepLinkedChallenge.world.beepers,
        walls: deepLinkedChallenge.world.walls,
      };
    }
    return sharedState?.world ?? loadSavedWorld();
  });
  const [robot, setRobot] = useState<Robot>(savedWorld.robot);
  const [beepers, setBeepers] = useState<BeeperMap>(savedWorld.beepers);
  const [walls, setWalls] = useState<Wall[]>(savedWorld.walls);

  const [initialState, setInitialState] = useState<{
    robot: Robot;
    beepers: BeeperMap;
    trace: ASTItem[];
  }>({
    robot: savedWorld.robot,
    beepers: savedWorld.beepers,
    trace: [],
  });

  const [defsStr, setDefsStr] = useState<string>('[]');
  const [trace, setTrace] = useState<ASTItem[]>([]);
  const [displayedTrace, setDisplayedTrace] = useState<ASTItem[]>([]);
  const [history, setHistory] = useState<StepDiff[]>([]);
  const [time, setTime] = useState(0);
  const [isProgramLoaded, setIsProgramLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [errorInfo, setErrorInfo] = useState<ErrorContextInfo | null>(null);
  const [statusMsg, setStatusMsg] = useState('');

  const [editMode, setEditMode] = useState<EditMode>('none');
  const [robotEditDir, setRobotEditDir] = useState<Direction>('sever');

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Synchronize displayed trace when execution is NOT autonomous (paused, finished, manual step, or loaded)
  useEffect(() => {
    if (!isPlaying) {
      setDisplayedTrace(trace);
    }
  }, [isPlaying, trace]);

  // Persist language to localStorage
  useEffect(() => {
    saveSavedLang(lang);
  }, [lang]);

  // Persist program code to localStorage
  useEffect(() => {
    saveSavedCode(code);
  }, [code]);

  // Persist world state (robot, beepers, walls) when in world edit mode
  useEffect(() => {
    if (!isProgramLoaded) {
      saveSavedWorld({ robot, beepers, walls });
    }
  }, [robot, beepers, walls, isProgramLoaded]);

  // Initialize or re-initialize Prolog session when language changes
  useEffect(() => {
    createPrologSession(
      lang,
      (s) => {
        setSession(s);
        setError('');
      },
      (err) => {
        console.error('Prolog Consult Error:', err);
        setError('Chyba při načítání modulu Prolog');
      }
    );
  }, [lang]);

  const handleLanguageSwitch = useCallback((newLang: Language) => {
    if (newLang === lang) return;
    setLang(newLang);
    if (!isProgramLoaded) {
      if (newLang === 'en' && code === DEFAULT_CS_CODE) {
        setCode(DEFAULT_EN_CODE);
      } else if (newLang === 'cs' && code === DEFAULT_EN_CODE) {
        setCode(DEFAULT_CS_CODE);
      }
    }
  }, [lang, isProgramLoaded, code]);

  const handleCellClick = useCallback((x: number, y: number, wallType?: 'sever' | 'vychod') => {
    if (isProgramLoaded) return;
    setError('');

    if (editMode === 'beeper') {
      setBeepers((prev) => {
        const val = (prev[`${x},${y}`] || 0) + 1;
        if (val > 9) {
          const { [`${x},${y}`]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [`${x},${y}`]: val };
      });
    } else if (editMode === 'wall' && wallType) {
      const exists = walls.some((w) => w.x === x && w.y === y && w.type === wallType);
      if (exists) {
        setWalls(walls.filter((w) => !(w.x === x && w.y === y && w.type === wallType)));
      } else {
        setWalls([...walls, { x, y, type: wallType }]);
      }
    } else if (editMode === 'robot') {
      if (robot.x === x && robot.y === y) {
        const dirs: Direction[] = ['sever', 'vychod', 'jih', 'zapad'];
        const nextDir = dirs[(dirs.indexOf(robot.dir) + 1) % 4];
        setRobot({ x, y, dir: nextDir });
        setRobotEditDir(nextDir);
      } else {
        setRobot({ x, y, dir: robotEditDir });
      }
    }
  }, [isProgramLoaded, editMode, walls, robot, robotEditDir]);

  const handleCompileAndRun = useCallback(() => {
    if (!session) return;
    setError('');
    setErrorInfo(null);
    setStatusMsg('');

    const tokens = tokenizeKarel(code);
    if (tokens.length === 0) {
      const msg = lang === 'cs' ? 'Zadejte nějaký kód programu.' : 'Please enter some program code.';
      setError(msg);
      setErrorInfo(buildSyntaxErrorContext(msg, lang));
      return;
    }

    const prologTokens = `[${tokens.map((t) => `'${t}'`).join(',')}]`;
    const query = `parse_source(${prologTokens}, Code, Defs).`;

    session.query(query, {
      success: () => {
        session.answer((ans: any) => {
          if (!ans || pl.type.is_error(ans)) {
            const rawAnsStr = ans
              ? typeof ans.toString === 'function'
                ? ans.toString()
                : String(ans)
              : 'false (klauzule selhala / unifikace nenalezena)';
            const parsedErr = parsePrologErrorTerm(ans);
            const errMsg =
              parsedErr.message ||
              (lang === 'cs' ? 'Syntaktická chyba v kódu!' : 'Syntax error in code!');
            setError(errMsg);
            setErrorInfo(
              buildSyntaxErrorContext(errMsg, lang, parsedErr.context, {
                query,
                rawAnswer: rawAnsStr,
                tokens,
              })
            );
            return;
          }

          const codeTerm = ans.lookup('Code');
          const defsTerm = ans.lookup('Defs');

          try {
            const initialAST = parsePrologASTList(codeTerm);
            const loadedDefsStr = termToPrologString(defsTerm);

            setInitialState({
              robot: { ...robot },
              beepers: { ...beepers },
              trace: initialAST,
            });

            setDefsStr(loadedDefsStr);
            setTrace(initialAST);
            setHistory([]);
            setTime(0);
            setIsProgramLoaded(true);
            setIsPlaying(false);
            setErrorInfo(null);
            setStatusMsg(
              lang === 'cs'
                ? 'Program načten a připraven ke spuštění'
                : 'Program loaded and ready'
            );
          } catch (e: any) {
            const msg =
              lang === 'cs'
                ? 'Chyba při zpracování AST výstupu'
                : 'Error processing AST output';
            setError(msg);
            setErrorInfo(
              buildSyntaxErrorContext(msg, lang, undefined, {
                query,
                rawAnswer: ans.toString(),
                codeAst: codeTerm?.toString(),
                defsAst: defsTerm?.toString(),
                exception: e?.message || String(e),
              })
            );
          }
        });
      },
      error: (err: any) => {
        const msg = lang === 'cs' ? 'Chyba při překladu programu' : 'Error compiling program';
        setError(msg);
        setErrorInfo(
          buildSyntaxErrorContext(msg, lang, undefined, {
            query,
            exception: typeof err === 'string' ? err : JSON.stringify(err),
            tokens,
          })
        );
        console.error(err);
      },
    });
  }, [session, code, lang, robot, beepers]);

  const computeStep = useCallback(() => {
    if (!session) return;
    setError('');
    setErrorInfo(null);

    // If replaying forward from computed history
    if (time < history.length) {
      const diff = history[time];
      const nextRobot = { ...diff.new.robot };
      const nextBeepers = { ...beepers };

      if (diff.new.beeper) {
        const key = `${diff.new.beeper.x},${diff.new.beeper.y}`;
        if (diff.new.beeper.count > 0) {
          nextBeepers[key] = diff.new.beeper.count;
        } else {
          delete nextBeepers[key];
        }
      }

      const restTrace = trace.slice(1);
      const nextTrace = [...diff.new.commands, ...restTrace];

      setTime(time + 1);
      setRobot(nextRobot);
      setBeepers(nextBeepers);
      setTrace(nextTrace);
      setError('');
      setErrorInfo(null);

      if (nextTrace.length === 0) {
        setIsPlaying(false);
        setStatusMsg(
          lang === 'cs'
            ? 'Program byl úspěšně dokončen!'
            : 'Program finished successfully!'
        );
      }
      return;
    }

    // Computing a new step using reduce_step
    if (trace.length === 0) {
      setIsPlaying(false);
      setStatusMsg(
        lang === 'cs'
          ? 'Program byl úspěšně dokončen!'
          : 'Program finished successfully!'
      );
      return;
    }

    const topCmd = trace[0];
    const topCmdProlog = astItemToPrologString(topCmd);

    // Full walls list for Prolog world state
    const wallList = walls.map((w) => `wall(${w.x}, ${w.y}, ${w.type})`).join(', ');

    const currCellBeeperCount = beepers[`${robot.x},${robot.y}`] || 0;
    const beeperList =
      currCellBeeperCount > 0
        ? `beeper(${robot.x}, ${robot.y}, ${currCellBeeperCount})`
        : '';

    const worldInStr = `world(karel(${robot.x}, ${robot.y}, ${robot.dir}), [${wallList}], [${beeperList}])`;
    const query = `reduce_step(${worldInStr}, ${topCmdProlog}, ${defsStr}, Change, Expansion).`;

    session.query(query, {
      success: () => {
        session.answer((ans: any) => {
          if (!ans || pl.type.is_error(ans)) {
            const rawAnsStr = ans
              ? typeof ans.toString === 'function'
                ? ans.toString()
                : String(ans)
              : 'false (redukce kroku selhala)';
            const parsedErr = parsePrologErrorTerm(ans);
            const errMsg =
              parsedErr.message ||
              (lang === 'cs' ? 'Chyba při kroku robota!' : 'Error executing step!');
            const context = buildRuntimeErrorContext(
              errMsg,
              robot,
              beepers,
              trace,
              walls,
              time,
              lang,
              parsedErr.context,
              {
                query,
                rawAnswer: rawAnsStr,
              }
            );
            setError(context.message);
            setErrorInfo(context);
            setIsPlaying(false);
            return;
          }

          const changeTerm = ans.lookup('Change');
          const expansionTerm = ans.lookup('Expansion');
          const rawChangeStr = changeTerm ? changeTerm.toString() : undefined;
          const rawExpansionStr = expansionTerm ? expansionTerm.toString() : undefined;

          try {
            let nextRobot = { ...robot };
            let oldBeeper: BeeperDiff | null = null;
            let newBeeper: BeeperDiff | null = null;

            if (changeTerm && changeTerm.id === 'world_change' && changeTerm.args) {
              const karelTerm = changeTerm.args[0];
              if (karelTerm && karelTerm.id === 'karel' && karelTerm.args) {
                const kx =
                  karelTerm.args[0].value !== undefined
                    ? karelTerm.args[0].value
                    : karelTerm.args[0];
                const ky =
                  karelTerm.args[1].value !== undefined
                    ? karelTerm.args[1].value
                    : karelTerm.args[1];
                const kdir = karelTerm.args[2].id || karelTerm.args[2];
                nextRobot = {
                  x: typeof kx === 'number' ? kx : parseInt(kx, 10),
                  y: typeof ky === 'number' ? ky : parseInt(ky, 10),
                  dir: kdir as Direction,
                };
              }

              const diffTerm = changeTerm.args[1];
              if (diffTerm && diffTerm.id === '.' && diffTerm.args && diffTerm.args.length === 2) {
                const beepOld = diffTerm.args[0];
                const rest = diffTerm.args[1];
                const beepNew = rest && rest.args ? rest.args[0] : null;

                let bx = robot.x;
                let by = robot.y;
                let oldCount = 0;
                let newCount = 0;

                if (beepOld && beepOld.id === 'beeper' && beepOld.args) {
                  const ox =
                    beepOld.args[0].value !== undefined
                      ? beepOld.args[0].value
                      : beepOld.args[0];
                  const oy =
                    beepOld.args[1].value !== undefined
                      ? beepOld.args[1].value
                      : beepOld.args[1];
                  const on =
                    beepOld.args[2].value !== undefined
                      ? beepOld.args[2].value
                      : beepOld.args[2];
                  bx = typeof ox === 'number' ? ox : parseInt(ox, 10);
                  by = typeof oy === 'number' ? oy : parseInt(oy, 10);
                  oldCount = typeof on === 'number' ? on : parseInt(on, 10);
                }

                if (beepNew && beepNew.id === 'beeper' && beepNew.args) {
                  const nx =
                    beepNew.args[0].value !== undefined
                      ? beepNew.args[0].value
                      : beepNew.args[0];
                  const ny =
                    beepNew.args[1].value !== undefined
                      ? beepNew.args[1].value
                      : beepNew.args[1];
                  const nn =
                    beepNew.args[2].value !== undefined
                      ? beepNew.args[2].value
                      : beepNew.args[2];
                  bx = typeof nx === 'number' ? nx : parseInt(nx, 10);
                  by = typeof ny === 'number' ? ny : parseInt(ny, 10);
                  newCount = typeof nn === 'number' ? nn : parseInt(nn, 10);
                } else if (beepNew && (beepNew.id === 'null' || beepNew === 'null')) {
                  newCount = 0;
                }

                oldBeeper = { x: bx, y: by, count: oldCount };
                newBeeper = { x: bx, y: by, count: newCount };
              }
            }

            const expansionList = parsePrologASTList(expansionTerm);

            const nextStepIndex = time + 1;
            const diff: StepDiff = {
              robot: nextRobot,
              old: {
                robot: { ...robot },
                beeper: oldBeeper,
                command: topCmd,
              },
              new: {
                robot: nextRobot,
                beeper: newBeeper,
                commands: expansionList,
              },
              actionMsg: lang === 'cs' ? `Krok ${nextStepIndex}` : `Step ${nextStepIndex}`,
            };

            const nextBeepers = { ...beepers };
            if (newBeeper) {
              const key = `${newBeeper.x},${newBeeper.y}`;
              if (newBeeper.count > 0) {
                nextBeepers[key] = newBeeper.count;
              } else {
                delete nextBeepers[key];
              }
            }

            const restTrace = trace.slice(1);
            const nextTrace = [...expansionList, ...restTrace];

            setHistory([...history, diff]);
            setTime(nextStepIndex);
            setRobot(nextRobot);
            setBeepers(nextBeepers);
            setTrace(nextTrace);
            setErrorInfo(null);

            if (nextTrace.length === 0) {
              setIsPlaying(false);
              setStatusMsg(
                lang === 'cs'
                  ? 'Program byl úspěšně dokončen!'
                  : 'Program finished successfully!'
              );
            }
          } catch (e: any) {
            const msg =
              lang === 'cs' ? 'Chyba při zpracování kroku' : 'Error processing step result';
            const context = buildRuntimeErrorContext(
              msg,
              robot,
              beepers,
              trace,
              walls,
              time,
              lang,
              undefined,
              {
                query,
                rawAnswer: ans.toString(),
                astOut: rawExpansionStr,
                change: rawChangeStr,
                exception: e?.message || String(e),
              }
            );
            setError(context.message);
            setErrorInfo(context);
            setIsPlaying(false);
          }
        });
      },
      error: (err: any) => {
        const msg =
          (lang === 'cs' ? 'Chyba při redukci kroku: ' : 'Error reducing step: ') +
          (typeof err === 'string' ? err : JSON.stringify(err));
        const context = buildRuntimeErrorContext(msg, robot, beepers, trace, walls, time, lang, undefined, {
          query,
          exception: typeof err === 'string' ? err : JSON.stringify(err),
        });
        setError(context.message);
        setErrorInfo(context);
        setIsPlaying(false);
        console.error(err);
      },
    });
  }, [session, time, history, beepers, trace, walls, robot, defsStr, lang]);

  const handleBack = useCallback(() => {
    if (time > 0) {
      const diff = history[time - 1];

      const prevRobot = { ...diff.old.robot };
      const prevBeepers = { ...beepers };
      if (diff.old.beeper) {
        const key = `${diff.old.beeper.x},${diff.old.beeper.y}`;
        if (diff.old.beeper.count > 0) {
          prevBeepers[key] = diff.old.beeper.count;
        } else {
          delete prevBeepers[key];
        }
      }

      const restTrace = trace.slice(diff.new.commands.length);
      const prevTrace = [diff.old.command, ...restTrace];

      setTime(time - 1);
      setRobot(prevRobot);
      setBeepers(prevBeepers);
      setTrace(prevTrace);
      setError('');
      setErrorInfo(null);
      setStatusMsg('');
    }
  }, [time, history, beepers, trace]);

  const handleStop = useCallback(() => {
    setIsProgramLoaded(false);
    setIsPlaying(false);
    setTime(0);
    setRobot(initialState.robot);
    setBeepers(initialState.beepers);
    setTrace([]);
    setHistory([]);
    setError('');
    setErrorInfo(null);
    setStatusMsg('');
  }, [initialState]);

  const handleResetWorld = useCallback(() => {
    if (isProgramLoaded) return;
    setRobot(DEFAULT_ROBOT);
    setBeepers(DEFAULT_BEEPERS);
    setWalls(DEFAULT_WALLS);
    setError('');
    setErrorInfo(null);
    setStatusMsg('');
  }, [isProgramLoaded]);

  const handleLoadChallenge = useCallback((challenge: Challenge) => {
    setActiveChallengeId(challenge.id);
    setIsProgramLoaded(false);
    setIsPlaying(false);
    setTime(0);
    setTrace([]);
    setDisplayedTrace([]);
    setHistory([]);
    setError('');
    setErrorInfo(null);
    setStatusMsg('');

    setRobot(challenge.world.robot);
    setBeepers(challenge.world.beepers);
    setWalls(challenge.world.walls);
    setCode(challenge.code);

    setInitialState({
      robot: challenge.world.robot,
      beepers: challenge.world.beepers,
      trace: [],
    });

    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      window.history.replaceState(null, '', `#challenge=${encodeURIComponent(challenge.id)}`);
    }
  }, []);

  // Share program and world state
  const handleShare = useCallback(async (): Promise<boolean> => {
    try {
      const shareUrl = generateShareUrl({
        lang,
        code,
        robot,
        beepers,
        walls,
        challengeId: activeChallengeId || undefined,
      });

      // Update current browser URL without full reload
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        window.history.replaceState(null, '', shareUrl);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Share error:', e);
      return false;
    }
  }, [lang, code, robot, beepers, walls, activeChallengeId]);

  // Automatic playback timer (speed up by ~4x for brisk execution)
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setTimeout(() => {
        computeStep();
      }, 85);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, time, computeStep]);

  return {
    lang,
    session,
    code,
    robot,
    beepers,
    walls,
    trace,
    displayedTrace,
    history,
    time,
    isProgramLoaded,
    isPlaying,
    error,
    errorInfo,
    statusMsg,
    editMode,
    robotEditDir,
    setCode,
    setEditMode,
    setRobotEditDir,
    setIsPlaying,
    handleLanguageSwitch,
    handleCellClick,
    handleCompileAndRun,
    computeStep,
    handleBack,
    handleStop,
    handleResetWorld,
    handleShare,
    handleLoadChallenge,
    activeChallengeId,
  };
}
