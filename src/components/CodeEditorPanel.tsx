import React from 'react';
import { Edit3, Sparkles } from 'lucide-react';
import { Language, ASTItem } from '../types/karel';
import TraceView from './TraceView';
import ErrorContextInspector, { ErrorContextInfo } from './ErrorContextInspector';

interface CodeEditorPanelProps {
  lang: Language;
  code: string;
  isProgramLoaded: boolean;
  isPlaying?: boolean;
  trace: ASTItem[];
  displayedTrace?: ASTItem[];
  error: string;
  errorInfo: ErrorContextInfo | null;
  statusMsg: string;
  onCodeChange: (code: string) => void;
  onStop: () => void;
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  lang,
  code,
  isProgramLoaded,
  isPlaying = false,
  trace,
  displayedTrace,
  error,
  errorInfo,
  statusMsg,
  onCodeChange,
  onStop,
}) => {
  const isCs = lang === 'cs';

  return (
    <aside className="w-full md:w-[380px] lg:w-[420px] flex flex-col min-h-0 bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl shrink-0">
      {/* Panel Header Tabs */}
      <div className="flex border-b border-zinc-800 bg-zinc-950/60 shrink-0">
        <button
          onClick={() => {
            if (isProgramLoaded) onStop();
          }}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
            !isProgramLoaded
              ? 'text-emerald-400 border-b-2 border-emerald-400 bg-zinc-900/80'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isCs ? 'Editor Kódu' : 'Code Editor'}</span>
        </button>

        <button
          disabled={!isProgramLoaded}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
            isProgramLoaded
              ? 'text-emerald-400 border-b-2 border-emerald-400 bg-zinc-900/80'
              : 'text-zinc-600 cursor-not-allowed opacity-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isCs ? 'Zásobník (Trace)' : 'Trace Stack'}</span>
        </button>
      </div>

      {/* Panel Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {!isProgramLoaded ? (
          <div className="absolute inset-0 flex flex-col p-3.5 gap-2.5 bg-zinc-900">
            <div className="flex justify-between items-center shrink-0">
              <span className="text-zinc-500 text-xs font-mono">
                {isCs ? '// Kód programu pro robota' : '// Karel source code'}
              </span>
            </div>

            <textarea
              id="code-editor"
              className="flex-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 font-mono text-sm text-emerald-300 resize-none outline-none focus:ring-1 focus:ring-emerald-500/50 leading-relaxed shadow-inner"
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              spellCheck={false}
              placeholder={isCs ? 'Napište příkazy...' : 'Write Karel commands...'}
            />

            {(error || errorInfo) && (
              <div className="shrink-0 overflow-hidden rounded-xl border border-rose-800/60 shadow-lg">
                <ErrorContextInspector
                  errorInfo={errorInfo}
                  errorMessage={error}
                  lang={lang}
                />
              </div>
            )}
            {statusMsg && !error && !errorInfo && (
              <div className="bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs p-2.5 rounded-xl shrink-0 font-mono">
                ✓ {statusMsg}
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col bg-zinc-950 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-hidden">
              <TraceView code={displayedTrace || trace} isPlaying={isPlaying} lang={lang} />
            </div>
            {(error || errorInfo) && (
              <ErrorContextInspector
                errorInfo={errorInfo}
                errorMessage={error}
                lang={lang}
              />
            )}
            {statusMsg && !error && !errorInfo && (
              <div className="bg-emerald-950/50 border-t border-emerald-800/40 text-emerald-300 text-xs p-2.5 font-mono shrink-0">
                ✓ {statusMsg}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
