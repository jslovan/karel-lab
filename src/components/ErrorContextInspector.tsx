import { useState } from 'react';
import { AlertTriangle, Compass, Eye, Copy, Check, ChevronDown, ChevronUp, Layers, ChevronRight, FolderTree } from 'lucide-react';
import { ASTItem } from './TraceView';

export interface PrologDiagnosticDetails {
  query?: string;
  rawAnswer?: string;
  astOut?: string;
  change?: string;
  codeAst?: string;
  defsAst?: string;
  exception?: string;
  tokens?: string[];
}

export interface ErrorContextInfo {
  type: 'data' | 'code';
  errorType?: 'syntax' | 'runtime' | 'unknown';
  message: string;
  breadcrumbs?: string[];
  step?: number;
  robot?: { x: number; y: number; dir: string };
  beeperCount?: number;
  failedInstruction?: ASTItem | string;
  traceSnapshot?: ASTItem[];
  obstacleInfo?: string;
  frontCoord?: { x: number; y: number; outOfBounds?: boolean };
  hasWallInFront?: boolean;
  hasBeeperHere?: boolean;
  rawError?: string;
  prologDetails?: PrologDiagnosticDetails;
}

interface ErrorContextInspectorProps {
  errorInfo: ErrorContextInfo | null;
  errorMessage?: string;
  lang: 'cs' | 'en';
  onDismiss?: () => void;
}

export default function ErrorContextInspector({
  errorInfo,
  errorMessage,
  lang,
}: ErrorContextInspectorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const isCs = lang === 'cs';

  if (!errorInfo && !errorMessage) return null;

  const info: ErrorContextInfo = errorInfo || {
    type: errorMessage?.includes('BUM') || errorMessage?.includes('znacka') || errorMessage?.includes('krok') || errorMessage?.includes('CRASH') ? 'data' : 'code',
    message: errorMessage || 'Neznámá chyba',
  };

  const isDataError = info.type === 'data';
  const hasBreadcrumbs = info.breadcrumbs && info.breadcrumbs.length > 0;
  const hasDetails = isDataError && (!!info.robot || (!!info.traceSnapshot && info.traceSnapshot.length > 0));

  const handleCopyDiagnostics = () => {
    const diagText = JSON.stringify({
      errorClassification: isDataError ? 'DATA-RELEVANT (Runtime/Environment)' : 'CODE-RELEVANT (Syntax/Parser)',
      errorType: info.errorType || (isDataError ? 'runtime' : 'syntax'),
      breadcrumbs: info.breadcrumbs,
      message: info.message,
      step: info.step,
      robotPosition: info.robot ? `[${info.robot.x}, ${info.robot.y}]` : undefined,
      robotDirection: info.robot?.dir,
      failedInstruction: info.failedInstruction,
      obstacleInfo: info.obstacleInfo,
      frontCoordinates: info.frontCoord,
      wallInFront: info.hasWallInFront,
      beeperCountAtCell: info.beeperCount,
      traceQueueLength: info.traceSnapshot?.length,
      rawError: info.rawError
    }, null, 2);

    navigator.clipboard?.writeText(diagText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="error-context-inspector"
      className="bg-zinc-950 border-t border-rose-800/80 text-rose-200 text-xs font-mono shrink-0 shadow-2xl transition-all duration-200"
    >
      {/* Header bar with classification badge */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-rose-950/80 border-b border-rose-800/50">
        <div className="flex items-center gap-2 flex-wrap">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
          <span className="font-bold text-rose-100 text-xs tracking-tight">
            {isDataError ? (isCs ? 'Chyba běhu (Data)' : 'Runtime Error (Data)') : (isCs ? 'Chyba syntaxe (Kód)' : 'Syntax Error (Code)')}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isDataError
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            {isDataError ? (isCs ? 'Data-relevantní' : 'Data-relevant') : (isCs ? 'Kód-relevantní' : 'Code-relevant')}
          </span>
          {info.step !== undefined && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-rose-800/50 text-rose-300 font-semibold">
              {isCs ? `Krok #${info.step}` : `Step #${info.step}`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyDiagnostics}
            className="flex items-center gap-1 px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-rose-300 hover:text-rose-100 border border-rose-800/60 rounded-lg text-[10px] transition-colors shadow-sm"
            title={isCs ? 'Kopírovat kontext chyby' : 'Copy error context'}
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? (isCs ? 'Zkopírováno' : 'Copied') : (isCs ? 'Kopírovat kontext' : 'Copy Context')}</span>
          </button>

          {hasDetails && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-rose-900/60 rounded-lg text-rose-300 hover:text-rose-100 transition-colors"
              title={isExpanded ? 'Sbalit' : 'Rozbalit'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Context Breadcrumbs navigation (RTL/LTR browser friendly flexbox) */}
      {hasBreadcrumbs && (
        <div className="px-3.5 py-1.5 bg-rose-950/40 border-b border-rose-900/40 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <div className="flex items-center gap-1 text-rose-400/80 font-bold shrink-0">
            <FolderTree className="w-3.5 h-3.5" />
            <span>{isCs ? 'Kontext:' : 'Context:'}</span>
          </div>
          <nav aria-label="Error Context Hierarchy" className="flex items-center gap-1 flex-wrap">
            {info.breadcrumbs!.map((crumb, idx) => {
              const isLast = idx === info.breadcrumbs!.length - 1;
              return (
                <div key={idx} className="inline-flex items-center gap-1">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition-colors ${
                      isLast
                        ? 'bg-rose-900/60 border-rose-600/80 text-rose-100 font-bold shadow-sm'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    {crumb}
                  </span>
                  {!isLast && (
                    <ChevronRight className="w-3 h-3 text-rose-400/60 rtl:rotate-180 shrink-0" />
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Error Message banner */}
      <div className="px-3.5 py-2.5 text-rose-100 font-semibold bg-rose-950/95 flex items-start gap-2.5">
        <span className="text-rose-400 font-bold shrink-0 mt-0.5">▶</span>
        <div className="flex-1 text-xs leading-relaxed break-words font-mono text-rose-100">
          {info.message}
        </div>
      </div>

      {/* Expanded Context & Condition Inspector for Data/Runtime errors */}
      {hasDetails && isExpanded && (
        <div className="p-3.5 space-y-3 bg-zinc-950 border-t border-rose-900/50 max-h-72 overflow-y-auto divide-y divide-zinc-900">
          {info.robot && (
            <div className="grid grid-cols-2 gap-2 text-[11px] pb-2">
              {/* Robot State Box */}
              <div className="bg-zinc-900/90 border border-zinc-800/80 p-2.5 rounded-xl flex flex-col gap-1.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-[10px] uppercase">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isCs ? 'Stav Robota' : 'Robot State'}</span>
                </div>
                <div className="text-zinc-200">
                  {isCs ? 'Pozice:' : 'Position:'}{' '}
                  <span className="text-emerald-400 font-bold">[{info.robot.x}, {info.robot.y}]</span>
                </div>
                <div className="text-zinc-200">
                  {isCs ? 'Směr:' : 'Direction:'}{' '}
                  <span className="text-emerald-300 font-bold uppercase">{info.robot.dir}</span>
                </div>
                <div className="text-zinc-200">
                  {isCs ? 'Značek pod robotem:' : 'Beepers under robot:'}{' '}
                  <span className="text-amber-400 font-bold">{info.beeperCount ?? 0}</span>
                </div>
              </div>

              {/* World & Collision Conditions Box */}
              <div className="bg-zinc-900/90 border border-zinc-800/80 p-2.5 rounded-xl flex flex-col gap-1.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-[10px] uppercase">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isCs ? 'Podmínky v Místě' : 'Local Conditions'}</span>
                </div>
                <div className="text-zinc-200 flex items-center justify-between">
                  <span>{isCs ? 'Zeď přímo před robotem:' : 'Wall ahead:'}</span>
                  <span className={`px-1.5 py-0.5 rounded font-bold ${info.hasWallInFront ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                    {info.hasWallInFront ? (isCs ? 'ANO' : 'YES') : (isCs ? 'NE' : 'NO')}
                  </span>
                </div>
                {info.frontCoord && (
                  <div className="text-zinc-400 text-[10px]">
                    {isCs ? 'Cílové pole:' : 'Target cell:'}{' '}
                    <span className={info.frontCoord.outOfBounds ? 'text-rose-400 font-bold' : 'text-zinc-200'}>
                      [{info.frontCoord.x}, {info.frontCoord.y}] {info.frontCoord.outOfBounds && (isCs ? '(Mimo mřížku!)' : '(Out of grid!)')}
                    </span>
                  </div>
                )}
                {info.obstacleInfo && (
                  <div className="text-amber-300 text-[10px] bg-amber-500/10 border border-amber-500/30 p-1.5 rounded">
                    {info.obstacleInfo}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trace Queue Snapshot */}
          {info.traceSnapshot && info.traceSnapshot.length > 0 && (
            <div className="pt-2">
              <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-xl">
                <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-[10px] uppercase mb-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isCs ? 'Kontext zásobníku při selhání' : 'Trace stack at failure'}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {info.traceSnapshot.slice(0, 5).map((item, idx) => (
                    <div
                      key={idx}
                      className={`px-2 py-0.5 rounded border text-[10px] font-mono ${
                        idx === 0
                          ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {idx === 0 && '💥 '}
                      {item.label || item.name || item.internal || item.type}
                    </div>
                  ))}
                  {info.traceSnapshot.length > 5 && (
                    <span className="text-zinc-500 text-[10px] self-center">
                      +{info.traceSnapshot.length - 5} {isCs ? 'dalších' : 'more'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

