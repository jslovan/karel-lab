import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  X,
  Play,
  Compass,
  Repeat,
  Zap,
  Ruler,
  Layers,
  Cpu,
} from 'lucide-react';
import { Language } from '../types/karel';
import { Challenge, ChallengeCategory } from '../challenges/types';
import { getChallenges, CATEGORY_LABELS } from '../challenges';

interface ChallengeBrowserProps {
  lang: Language;
  isOpen: boolean;
  activeChallengeId?: string | null;
  onClose: () => void;
  onSelectChallenge: (challenge: Challenge) => void;
}

const ALL_CATEGORIES: ChallengeCategory[] = [
  'basics',
  'loops',
  'automata',
  'geometry',
  'recursion',
  'theory',
];

export const ChallengeBrowser: React.FC<ChallengeBrowserProps> = ({
  lang,
  isOpen,
  activeChallengeId,
  onClose,
  onSelectChallenge,
}) => {
  const isCs = lang === 'cs';
  const challenges = getChallenges(lang);

  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | 'all'>('all');

  const filteredChallenges =
    selectedCategory === 'all'
      ? challenges
      : challenges.filter((c) => c.category === selectedCategory);

  const renderStars = (diff: number) => {
    return (
      <div className="flex items-center gap-0.5" title={`${diff}/3`}>
        {[1, 2, 3].map((star) => (
          <span
            key={star}
            className={`text-xs ${
              star <= diff ? 'text-amber-400' : 'text-zinc-700'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const getCategoryIcon = (category: ChallengeCategory) => {
    switch (category) {
      case 'basics':
        return <Compass className="w-3.5 h-3.5 text-emerald-400" />;
      case 'loops':
        return <Repeat className="w-3.5 h-3.5 text-sky-400" />;
      case 'automata':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'geometry':
        return <Ruler className="w-3.5 h-3.5 text-rose-400" />;
      case 'recursion':
        return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      case 'theory':
        return <Cpu className="w-3.5 h-3.5 text-teal-400" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        className="absolute inset-0 z-30 flex flex-col bg-zinc-950/95 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/30 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/90 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Trophy className="w-4 h-4 text-zinc-950" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                {isCs ? 'Katalog výzev' : 'Challenge Catalog'}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800/60 text-emerald-400">
                  {challenges.length} {isCs ? 'výzev' : 'challenges'}
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                {isCs
                  ? 'Vyber si úkol k vyřešení — svět i kód se automaticky připraví!'
                  : 'Pick a puzzle to solve — the world & starter code will load automatically!'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-xl hover:bg-zinc-800/70 border border-zinc-800 transition-colors"
            title={isCs ? 'Zavřít výzvy' : 'Close challenges'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 py-3 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isCs ? 'Všechny výzvy' : 'All Challenges'}
          </button>

          {ALL_CATEGORIES.map((cat) => {
            const meta = CATEGORY_LABELS[cat];
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{isCs ? meta.cs : meta.en}</span>
              </button>
            );
          })}
        </div>

        {/* Challenge Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
          {filteredChallenges.map((challenge) => {
            const catMeta = CATEGORY_LABELS[challenge.category];
            const beeperCount = Object.values(challenge.world.beepers).reduce(
              (a, b) => a + b,
              0
            );
            const wallCount = challenge.world.walls.length;
            const isActive = activeChallengeId === challenge.id;

            return (
              <div
                key={challenge.id}
                className={`group relative bg-zinc-900/80 hover:bg-zinc-900 border rounded-2xl p-3 transition-all shadow-sm hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isActive
                    ? 'border-emerald-500/80 bg-zinc-900 shadow-emerald-950/20'
                    : 'border-zinc-800/80 hover:border-emerald-500/50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-400">
                      {getCategoryIcon(challenge.category)}
                      {isCs ? catMeta.cs : catMeta.en}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-semibold">
                        {isCs ? 'Aktivní' : 'Active'}
                      </span>
                    )}
                    {renderStars(challenge.difficulty)}
                  </div>

                  <h3 className="text-sm font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                    {challenge.title}
                  </h3>

                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                    {challenge.summary}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-zinc-500">
                    <span>
                      {isCs ? 'Pozice robota:' : 'Robot:'}{' '}
                      <strong className="text-zinc-300">
                        ({challenge.world.robot.x}, {challenge.world.robot.y})
                      </strong>
                    </span>
                    <span>
                      {isCs ? 'Značek:' : 'Beepers:'}{' '}
                      <strong className="text-amber-400">{beeperCount}</strong>
                    </span>
                    {wallCount > 0 && (
                      <span>
                        {isCs ? 'Překážky' : 'Walls'}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectChallenge(challenge);
                    onClose();
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-zinc-950" />
                  <span>{isCs ? 'Spustit výzvu' : 'Start Challenge'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
