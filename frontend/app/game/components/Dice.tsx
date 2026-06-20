'use client';

import { DeviceTier } from '../hooks/useDeviceTier';

interface DiceProps {
  value: number | null;
  onRoll: () => void;
  disabled: boolean;
  tier?: DeviceTier;
}

const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function Dice({ value, onRoll, disabled, tier = 'desktop' }: DiceProps) {
  const faceSize = tier === 'mobile' ? 'text-3xl' : tier === 'tablet' ? 'text-4xl' : 'text-5xl';
  const resultSize = tier === 'mobile' ? 'text-[8px]' : 'text-[10px]';
  const btnPy = tier === 'mobile' ? 'py-1.5 text-[10px]' : 'py-2 text-xs';

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className={`${faceSize} select-none filter drop-shadow-[0_2px_4px_rgba(255,255,255,0.1)] text-white`}>
        {value !== null ? diceFaces[value - 1] : '🎲'}
      </div>
      {value !== null && (
        <div className={`${resultSize} font-bold text-yellow-200 tracking-wider`}>
          HASIL: {value}
        </div>
      )}
      <button
        onClick={onRoll}
        disabled={disabled}
        className={`w-full ${btnPy} bg-amber-600 hover:bg-amber-500 active:scale-95 text-white rounded-xl font-black transition-all shadow-md border border-amber-800 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-900 disabled:cursor-not-allowed cursor-pointer tracking-wider uppercase`}
      >
        🎲 Lempar Dadu
      </button>
    </div>
  );
}
