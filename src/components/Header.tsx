import React, { useState } from 'react';
import { BookOpen, Share2, Check, Trophy } from 'lucide-react';
import { Language } from '../types/karel';

interface HeaderProps {
  lang: Language;
  isProgramLoaded: boolean;
  showGuide: boolean;
  showChallenges?: boolean;
  onLanguageSwitch: (lang: Language) => void;
  onToggleGuide: () => void;
  onToggleChallenges?: () => void;
  onShare?: () => Promise<boolean> | void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  isProgramLoaded,
  showGuide,
  showChallenges,
  onLanguageSwitch,
  onToggleGuide,
  onToggleChallenges,
  onShare,
}) => {
  const isCs = lang === 'cs';
  const [copied, setCopied] = useState(false);

  const handleShareClick = async () => {
    if (onShare) {
      const ok = await onShare();
      if (ok !== false) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  return (
    <header className="flex justify-between items-center bg-zinc-900/90 border border-zinc-800/80 px-4 py-2.5 rounded-2xl shadow-sm shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-black text-sm">
          K
        </div>
        <div>
          <h1 className="text-sm font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            Karel the Robot
            <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-normal">
              Prolog DCG
            </span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Share Button */}
        {onShare && (
          <button
            onClick={handleShareClick}
            title={isCs ? 'Sdílet odkaz na program a svět' : 'Share link to program and world'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all ${
              copied
                ? 'bg-emerald-950/70 border-emerald-600/70 text-emerald-300 shadow-sm'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 animate-in fade-in zoom-in duration-150" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {copied ? (isCs ? 'Zkopírováno!' : 'Copied!') : (isCs ? 'Sdílet' : 'Share')}
            </span>
          </button>
        )}

        {/* Language Selector */}
        <div className="flex bg-zinc-950 border border-zinc-800 p-0.5 rounded-xl text-xs font-medium">
          <button
            onClick={() => onLanguageSwitch('cs')}
            disabled={isProgramLoaded}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              lang === 'cs'
                ? 'bg-emerald-600 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            } ${isProgramLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            CZ
          </button>
          <button
            onClick={() => onLanguageSwitch('en')}
            disabled={isProgramLoaded}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              lang === 'en'
                ? 'bg-emerald-600 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            } ${isProgramLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            EN
          </button>
        </div>

        {/* Challenges Button */}
        {onToggleChallenges && (
          <button
            onClick={onToggleChallenges}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all ${
              showChallenges
                ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-emerald-300 hover:border-emerald-700/60'
            }`}
            title={isCs ? 'Otevřít katalog výzev' : 'Open challenge catalog'}
          >
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline font-medium">
              {isCs ? 'Výzvy' : 'Challenges'}
            </span>
          </button>
        )}

        <button
          onClick={onToggleGuide}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all ${
            showGuide
              ? 'bg-indigo-950/60 border-indigo-700/60 text-indigo-300'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isCs ? 'Příručka' : 'Guide'}</span>
        </button>
      </div>
    </header>
  );
};
