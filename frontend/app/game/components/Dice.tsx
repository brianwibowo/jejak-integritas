'use client';

interface DiceProps {
  value: number | null;
  onRoll: () => void;
  disabled: boolean;
}

const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function Dice({ value, onRoll, disabled }: DiceProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-5xl sm:text-6xl select-none">
        {value !== null ? diceFaces[value - 1] : '🎲'}
      </div>
      {value !== null && (
        <div className="text-sm font-semibold text-gray-600">
          Hasil: {value}
        </div>
      )}
      <button
        onClick={onRoll}
        disabled={disabled}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
      >
        🎲 Lempar Dadu
      </button>
    </div>
  );
}
