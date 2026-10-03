import React from 'react';
import { Play, Square, SkipBack, SkipForward, Pause, RotateCcw, Trophy, Lock } from 'lucide-react';
import { EditMode, Language, ASTItem, StepDiff } from '../types/karel';

interface WorldControlsProps {
  lang: Language;
  isProgramLoaded: boolean;
  editMode: EditMode;
  time: number;
  history: StepDiff[];
  trace: ASTItem[];
  isPlaying: boolean;
  onSetEditMode: (mode: EditMode) => void;
  onResetWorld: () => void;
  onOpenChallenges?: () => void;
  onCompileAndRun: () => void;
  onStop: () => void;
  onBack: () => void;
  onForward: () => void;
  onTogglePlay: (playing: boolean) => void;
}

export const WorldControls: React.FC<WorldControlsProps> = ({
  lang,
  isProgramLoaded,
  editMode,
  time,
  history,
  trace,
  isPlaying,
  onSetEditMode,
  onResetWorld,
  onOpenChallenges,
  onCompileAndRun,
  onStop,
  onBack,
  onForward,
  onTogglePlay,
}) => {
  const isCs = lang === 'cs';

  return (
    <>
      {/* Edit Toolbar for World Objects */}
      <div className="flex flex-wrap items-center justify-between w-full gap-2 shrink-0 px-1">
        <div className="flex flex-wrap gap-1.5 text-xs bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => onSetEditMode('none')}
            disabled={isProgramLoaded}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all active:scale-95 ${
              editMode === 'none'
                ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700/80 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            } ${isProgramLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={
              isCs
                ? 'Uložit stav světa a zamknout mřížku (konec úprav, přechod na kódování)'
                : 'Save world state and lock grid (end editing, switch to coding)'
            }
          >
            <Lock className={`w-3.5 h-3.5 ${editMode === 'none' ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <span>{isCs ? (editMode === 'none' ? 'Uloženo / Zamčeno' : 'Uložit a zamknout') : (editMode === 'none' ? 'Saved & Locked' : 'Save & Lock')}</span>
          </button>
          <button
            onClick={() => onSetEditMode('beeper')}
            disabled={isProgramLoaded}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              editMode === 'beeper' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-zinc-400 hover:text-zinc-200'
            } ${isProgramLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isCs ? 'Značka' : 'Beeper'}
          </button>
          <button
            onClick={() => onSetEditMode('wall')}
            disabled={isProgramLoaded}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              editMode === 'wall' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-zinc-400 hover:text-zinc-200'
            } ${isProgramLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isCs ? 'Kliknutím blízko horní nebo pravé hrany vložíte/smažete zeď' : 'Click near top or right edge to add/remove wall'}
          >
            {isCs ? 'Zeď' : 'Wall'}
          </button>
          <button
            onClick={() => onSetEditMode('robot')}
            disabled={isProgramLoaded}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              editMode === 'robot' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'text-zinc-400 hover:text-zinc-200'
            } ${isProgramLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isCs ? 'Robot' : 'Robot'}
          </button>
        </div>

        {!isProgramLoaded && (
          <div className="flex items-center gap-1.5">
            {onOpenChallenges && (
              <button
                onClick={onOpenChallenges}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 hover:border-emerald-600/80 px-2.5 py-1 rounded-xl transition-all shadow-sm"
                title={isCs ? 'Otevřít katalog výzev' : 'Open Challenge Catalog'}
              >
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-semibold">{isCs ? 'Výzvy' : 'Challenges'}</span>
              </button>
            )}
            <button
              onClick={onResetWorld}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 bg-zinc-950 border border-zinc-800/80 px-2.5 py-1 rounded-xl transition-colors"
              title={isCs ? 'Vyčistit mřížku' : 'Reset World'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[11px]">{isCs ? 'Reset světa' : 'Clear'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Control Panel (Back, Stop, Forward, Run) */}
      <div className="flex items-center justify-center gap-3 w-full shrink-0 pb-1">
        {!isProgramLoaded ? (
          <button
            id="compile-btn"
            onClick={onCompileAndRun}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
          >
            <Play className="w-4 h-4 fill-zinc-950" />
            <span>{isCs ? 'Načíst a Spustit' : 'Load & Run'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            {/* Stop Button */}
            <button
              id="stop-btn"
              onClick={onStop}
              className="flex items-center justify-center bg-rose-950/60 hover:bg-rose-900 active:scale-95 text-rose-400 border border-rose-800/50 w-11 h-11 rounded-2xl transition-all shadow-sm"
              title={isCs ? 'Zastavit a resetovat (Stop)' : 'Stop and reset'}
            >
              <Square className="w-5 h-5 fill-rose-400" />
            </button>

            {/* Stepping controls group */}
            <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 p-1.5 rounded-2xl shadow-inner">
              {/* Step Back */}
              <button
                id="back-btn"
                onClick={onBack}
                disabled={time === 0}
                className="flex items-center justify-center text-zinc-300 hover:bg-zinc-800/80 active:scale-95 w-10 h-10 rounded-xl transition-all disabled:opacity-25 disabled:hover:bg-transparent"
                title={isCs ? 'Krok zpět (Back)' : 'Step Back'}
              >
                <SkipBack className="w-5 h-5 fill-zinc-400" />
              </button>

              {/* Play / Pause Auto-Run */}
              {!isPlaying ? (
                <button
                  id="play-btn"
                  onClick={() => onTogglePlay(true)}
                  disabled={trace.length === 0 && time >= history.length}
                  className="flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 w-11 h-11 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-40"
                  title={isCs ? 'Plynulý běh (Run)' : 'Play / Run'}
                >
                  <Play className="w-5 h-5 fill-zinc-950 ml-0.5" />
                </button>
              ) : (
                <button
                  id="pause-btn"
                  onClick={() => onTogglePlay(false)}
                  className="flex items-center justify-center bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 w-11 h-11 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  title={isCs ? 'Pozastavit (Pause)' : 'Pause'}
                >
                  <Pause className="w-5 h-5 fill-zinc-950" />
                </button>
              )}

              {/* Step Forward */}
              <button
                id="forward-btn"
                onClick={onForward}
                disabled={trace.length === 0 && time >= history.length}
                className="flex items-center justify-center text-zinc-300 hover:bg-zinc-800/80 active:scale-95 w-10 h-10 rounded-xl transition-all disabled:opacity-25 disabled:hover:bg-transparent"
                title={isCs ? 'Krok vpřed (Forward)' : 'Step Forward'}
              >
                <SkipForward className="w-5 h-5 fill-zinc-400" />
              </button>
            </div>

            {/* Step Counter Badge */}
            <div className="bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-xl text-center font-mono text-xs">
              <span className="text-zinc-500">{isCs ? 'Krok: ' : 'Step: '}</span>
              <span className="text-emerald-400 font-bold">{time}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
