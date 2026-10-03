import React from 'react';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { ASTItem, Language } from '../types/karel';

export type { ASTItem };

interface TraceViewProps {
  code: ASTItem[];
  isPlaying?: boolean;
  lang?: Language;
}

function TraceViewComponent({ code, isPlaying = false, lang = 'cs' }: TraceViewProps) {
  const isCs = lang === 'cs';

  const renderInstruction = (instr: ASTItem, isFirst: boolean, index: number, nestedLevel = 0) => {
    const isPrimaryActive = isFirst && nestedLevel === 0;

    const activeClasses = isPrimaryActive
      ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-950 bg-emerald-500 text-zinc-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105"
      : "bg-zinc-900 border-zinc-800 text-zinc-300";

    if (!instr) return null;

    if (instr.type === 'builtin') {
      return (
        <div
          key={index}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-200
            ${activeClasses}
          `}
        >
          {isPrimaryActive && <Play className="w-3 h-3 text-zinc-950 fill-zinc-950 shrink-0" />}
          <span>{instr.label || instr.internal}</span>
        </div>
      );
    }

    if (instr.type === 'routine') {
      return (
        <div
          key={index}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-200
            ${isPrimaryActive ? activeClasses : 'bg-indigo-950/40 border-indigo-800/60 text-indigo-300'}
          `}
        >
          {isPrimaryActive && <Play className="w-3 h-3 text-zinc-950 fill-zinc-950 shrink-0" />}
          <span>{instr.name || instr.label}</span>
          <span className="text-[9px] px-1 bg-indigo-500/20 text-indigo-400 rounded font-semibold">{isCs ? 'procedura' : 'routine'}</span>
        </div>
      );
    }

    if (instr.type === 'opakuj') {
      return (
        <div
          key={index}
          className={`
            flex flex-col gap-1.5 p-2.5 rounded-lg border text-xs font-mono w-full transition-all duration-200
            ${isPrimaryActive ? 'ring-2 ring-emerald-500 bg-emerald-500/10 border-emerald-500/50' : 'bg-zinc-950/60 border-zinc-800'}
          `}
        >
          <div className="flex items-center gap-2">
            {isPrimaryActive && <Play className="w-3 h-3 text-emerald-400 fill-emerald-400 shrink-0" />}
            <span className="font-bold text-emerald-400">{instr.label || (isCs ? 'opakuj' : 'repeat')}</span>
            <span className="font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded text-[11px]">
              {instr.count}x
            </span>
            <span className="text-zinc-500 font-bold">[</span>
          </div>

          <div className="pl-3.5 border-l-2 border-zinc-800 flex flex-wrap gap-1.5 py-1">
            {Array.isArray(instr.body) && instr.body.length > 0 ? (
              instr.body.map((child, childIdx) =>
                renderInstruction(child, false, childIdx, nestedLevel + 1)
              )
            ) : (
              <span className="text-zinc-500 italic text-[10px]">{isCs ? 'prázdný blok' : 'empty block'}</span>
            )}
          </div>
          <div className="text-zinc-500 font-bold">]</div>
        </div>
      );
    }

    if (instr.type === 'dokud') {
      return (
        <div
          key={index}
          className={`
            flex flex-col gap-1.5 p-2.5 rounded-lg border text-xs font-mono w-full transition-all duration-200
            ${isPrimaryActive ? 'ring-2 ring-emerald-500 bg-emerald-500/10 border-emerald-500/50' : 'bg-zinc-950/60 border-zinc-800'}
          `}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {isPrimaryActive && <Play className="w-3 h-3 text-emerald-400 fill-emerald-400 shrink-0" />}
            <span className="font-bold text-emerald-400">{instr.label || (isCs ? 'dokud' : 'while')}</span>
            <span className="font-semibold text-sky-400 bg-sky-500/15 px-1.5 py-0.5 rounded border border-sky-500/30 text-[11px]">
              {instr.condition}
            </span>
            <span className="text-zinc-500 font-bold">[</span>
          </div>

          <div className="pl-3.5 border-l-2 border-zinc-800 flex flex-wrap gap-1.5 py-1">
            {Array.isArray(instr.body) && instr.body.length > 0 ? (
              instr.body.map((child, childIdx) =>
                renderInstruction(child, false, childIdx, nestedLevel + 1)
              )
            ) : (
              <span className="text-zinc-500 italic text-[10px]">{isCs ? 'prázdný blok' : 'empty block'}</span>
            )}
          </div>
          <div className="text-zinc-500 font-bold">]</div>
        </div>
      );
    }

    if (instr.type === 'kdyz') {
      const isEvaluated = instr.condition === 'TRUE' || instr.condition === 'FALSE';
      return (
        <div
          key={index}
          className={`
            flex flex-col gap-1.5 p-2.5 rounded-lg border text-xs font-mono w-full transition-all duration-200
            ${isPrimaryActive ? 'ring-2 ring-emerald-500 bg-emerald-500/10 border-emerald-500/50' : 'bg-zinc-950/60 border-zinc-800'}
          `}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {isPrimaryActive && <Play className="w-3 h-3 text-emerald-400 fill-emerald-400 shrink-0" />}
            <span className="font-bold text-emerald-400">{instr.label || (isCs ? 'kdyz' : 'if')}</span>
            <span className={`font-semibold px-1.5 py-0.5 rounded border text-[11px] ${
              isEvaluated 
                ? (instr.condition === 'TRUE' ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40' : 'text-rose-400 bg-rose-500/20 border-rose-500/40')
                : 'text-sky-400 bg-sky-500/15 border-sky-500/30'
            }`}>
              {instr.condition}
            </span>
            <span className="text-zinc-500 font-bold">[</span>
          </div>

          <div className="pl-3.5 border-l-2 border-zinc-800 flex flex-wrap gap-1.5 py-1">
            {Array.isArray(instr.then) && instr.then.length > 0 ? (
              instr.then.map((child, childIdx) =>
                renderInstruction(child, false, childIdx, nestedLevel + 1)
              )
            ) : (
              <span className="text-zinc-500 italic text-[10px]">{isCs ? 'prázdný blok' : 'empty block'}</span>
            )}
          </div>
          <div className="text-zinc-500 font-bold">]</div>

          {Array.isArray(instr.else) && instr.else.length > 0 && (
            <>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-emerald-400">{isCs ? 'jinak' : 'else'}</span>
                <span className="text-zinc-500 font-bold">[</span>
              </div>
              <div className="pl-3.5 border-l-2 border-zinc-800 flex flex-wrap gap-1.5 py-1">
                {instr.else.map((child, childIdx) =>
                  renderInstruction(child, false, childIdx, nestedLevel + 1)
                )}
              </div>
              <div className="text-zinc-500 font-bold">]</div>
            </>
          )}
        </div>
      );
    }

    return (
      <div key={index} className="inline-block px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono">
        {instr.rawStr || JSON.stringify(instr)}
      </div>
    );
  };

  return (
    <div id="trace-panel" className="flex flex-col h-full bg-zinc-950 overflow-hidden select-none">
      {/* Panel Header */}
      <div className="bg-zinc-900 border-b border-zinc-800/80 px-4 py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wide flex justify-between items-center shrink-0">
        <span className="font-mono text-[11px] text-zinc-300">
          {isCs ? 'Zásobník redukce (Trace)' : 'Reduction Stack (Trace)'}
        </span>
        {isPlaying ? (
          <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono text-[10px] flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>{isCs ? 'Běží (sync pozastaven)' : 'Running (sync paused)'}</span>
          </span>
        ) : (
          <span className="bg-zinc-800/70 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono text-[10px]">
            {code.length} {isCs ? (code.length === 1 ? 'instrukce' : code.length >= 2 && code.length <= 4 ? 'instrukce' : 'instrukcí') : (code.length === 1 ? 'instruction' : 'instructions')}
          </span>
        )}
      </div>

      {/* Code List Display Area */}
      <div className={`p-4 flex flex-col gap-2.5 overflow-y-auto flex-1 bg-zinc-950/50 ${isPlaying ? 'opacity-70' : ''}`}>
        {code.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 text-zinc-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2 stroke-[1.5]" />
            <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
              {isCs ? 'Zásobník je prázdný' : 'Stack is empty'}
            </span>
            <span className="text-zinc-500 font-mono text-[11px] mt-1 max-w-[220px]">
              {isCs ? 'Program byl úspěšně redukován a proveden do konce.' : 'Program was successfully reduced and executed.'}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 items-start w-full">
            {code.map((instr, idx) => {
              const isFirst = idx === 0;
              return (
                <div key={idx} className="w-full flex flex-col gap-1">
                  <div className="flex items-center gap-2 w-full">
                    {renderInstruction(instr, isFirst, idx)}
                  </div>
                  {idx < code.length - 1 && (
                    <div className="pl-3 py-0.5 text-zinc-600">
                      <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(TraceViewComponent);
