import { HelpCircle, ChevronRight, X } from 'lucide-react';

interface InstructionGuideProps {
  onClose?: () => void;
  lang?: 'cs' | 'en';
}

export default function InstructionGuide({ onClose, lang = 'cs' }: InstructionGuideProps) {
  const isCs = lang === 'cs';

  return (
    <div id="instruction-guide" className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl font-sans relative">
      <div className="flex items-center justify-between mb-3 text-zinc-200 font-semibold border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-xs uppercase tracking-wider text-emerald-400">
            {isCs ? '// Příručka jazyka Karel' : '// Karel Language Reference'}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-400">
        <div>
          <h4 className="font-bold text-zinc-300 uppercase tracking-wider mb-2 text-[10px] font-mono text-emerald-400">
            {isCs ? '// Příkazy' : '// Commands'}
          </h4>
          <ul className="space-y-1.5 font-mono text-[11px]">
            <li className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-emerald-500 shrink-0" />
              <code className="text-emerald-300 font-bold bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                {isCs ? 'krok' : 'step'}
              </code>
              <span className="text-zinc-400 font-sans text-xs">{isCs ? 'Posun vpřed' : 'Move forward'}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-emerald-500 shrink-0" />
              <code className="text-emerald-300 font-bold bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                {isCs ? 'vlevo' : 'left'}
              </code>
              <span className="text-zinc-400 font-sans text-xs">{isCs ? 'Otočení doleva' : 'Turn left'}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-emerald-500 shrink-0" />
              <code className="text-emerald-300 font-bold bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                {isCs ? 'poloz' : 'put'}
              </code>
              <span className="text-zinc-400 font-sans text-xs">{isCs ? 'Položit značku' : 'Put beeper'}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-emerald-500 shrink-0" />
              <code className="text-emerald-300 font-bold bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                {isCs ? 'zvedni' : 'pick'}
              </code>
              <span className="text-zinc-400 font-sans text-xs">{isCs ? 'Zvednout značku' : 'Pick beeper'}</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-zinc-300 uppercase tracking-wider mb-2 text-[10px] font-mono text-emerald-400">
            {isCs ? '// Řízení toku' : '// Flow Control'}
          </h4>
          <div className="space-y-1.5 font-mono bg-zinc-900/70 p-2.5 border border-zinc-800 rounded-xl text-[10px] leading-relaxed text-zinc-300">
            <div>
              <span className="text-indigo-400 font-bold">{isCs ? 'definuj' : 'define'}</span> <span className="text-zinc-100">{isCs ? 'vpravo' : 'right'}</span> [ {isCs ? 'vlevo vlevo vlevo' : 'left left left'} ]
            </div>
            <div>
              <span className="text-emerald-400 font-bold">{isCs ? 'opakuj' : 'repeat'}</span> <span className="text-amber-400 font-bold">4</span> [ {isCs ? 'krok vlevo' : 'step left'} ]
            </div>
            <div>
              <span className="text-sky-400 font-bold">{isCs ? 'dokud' : 'while'}</span> <span className="text-sky-300">{isCs ? 'neni zed' : 'not wall'}</span> [ {isCs ? 'krok' : 'step'} ]
            </div>
            <div>
              <span className="text-amber-400 font-bold">{isCs ? 'kdyz' : 'if'}</span> <span className="text-sky-300">{isCs ? 'je znacka' : 'is beeper'}</span> [ {isCs ? 'zvedni' : 'pick'} ] <span className="text-amber-400 font-bold">{isCs ? 'jinak' : 'else'}</span> [ {isCs ? 'poloz' : 'put'} ]
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-zinc-300 uppercase tracking-wider mb-2 text-[10px] font-mono text-emerald-400">
            {isCs ? '// Podmínky & Senzory' : '// Sensors & Conditions'}
          </h4>
          <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
            <div className="bg-zinc-900/60 border border-zinc-800 px-2 py-1 rounded text-center">
              <span className="text-sky-300">{isCs ? 'je zed' : 'is wall'}</span>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 px-2 py-1 rounded text-center">
              <span className="text-sky-300">{isCs ? 'neni zed' : 'not wall'}</span>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 px-2 py-1 rounded text-center">
              <span className="text-amber-300">{isCs ? 'je znacka' : 'is beeper'}</span>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 px-2 py-1 rounded text-center">
              <span className="text-amber-300">{isCs ? 'neni znacka' : 'not beeper'}</span>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 px-2 py-1 rounded text-center col-span-2">
              <span className="text-emerald-300">{isCs ? 'je na sever | jih | vychod | zapad' : 'is facing north | south | east | west'}</span>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 px-2 py-1 rounded text-center col-span-2">
              <span className="text-emerald-300">{isCs ? 'neni na sever | jih | vychod | zapad' : 'not facing north | south | east | west'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
