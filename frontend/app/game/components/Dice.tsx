'use client';

interface DiceProps {
  value: number | null;
  onRoll: () => void;
  disabled: boolean;
}

const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function Dice({ value, onRoll, disabled }: DiceProps) {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="text-5xl select-none filter drop-shadow-[0_2px_4px_rgba(255,255,255,0.1)] text-white">
        {value !== null ? diceFaces[value - 1] : '🎲'}
      </div>
      {value !== null && (
        <div className="text-[10px] font-bold text-yellow-200 tracking-wider">
          HASIL: {value}
        </div>
      )}
      <button
        onClick={onRoll}
        disabled={disabled}
        className="w-full py-2 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white rounded-xl font-black text-xs transition-all shadow-md border border-amber-800 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-900 disabled:cursor-not-allowed cursor-pointer tracking-wider uppercase"
      >
        🎲 Lempar Dadu
      </button>
    </div>
  );
}
