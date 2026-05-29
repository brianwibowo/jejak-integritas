'use client';

import { Player, GamePhase } from '../gameLogic';
import Dice from './Dice';

interface PlayerPanelProps {
  players: Player[];
  currentPlayerIndex: number;
  diceValue: number | null;
  onRollDice: () => void;
  phase: GamePhase;
  message: string | null;
  onNextTurn: () => void;
}

export default function PlayerPanel({
  players,
  currentPlayerIndex,
  diceValue,
  onRollDice,
  phase,
  message,
  onNextTurn,
}: PlayerPanelProps) {
  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-xl shadow-lg w-full">
      {/* Title */}
      <h2 className="text-lg font-bold text-center text-gray-800">
        Pemain
      </h2>

      {/* Player list */}
      <div className="flex flex-col gap-2">
        {players.map((player, i) => (
          <div
            key={player.id}
            className="flex items-center gap-3 p-3 rounded-lg transition-colors"
            style={{
              backgroundColor:
                i === currentPlayerIndex ? '#EFF6FF' : '#F9FAFB',
              border:
                i === currentPlayerIndex
                  ? '2px solid #93C5FD'
                  : '2px solid transparent',
            }}
          >
            <div
              className="w-6 h-6 rounded-full border-2 border-white shadow flex-shrink-0"
              style={{ backgroundColor: player.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-gray-800 truncate">
                {player.name}
              </div>
              <div className="text-xs text-gray-500">
                Posisi: {player.position}
              </div>
            </div>
            {i === currentPlayerIndex && (
              <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">
                Giliran
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Current turn info */}
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-600 mb-3">
          Giliran:{' '}
          <span style={{ color: currentPlayer?.color }}>
            {currentPlayer?.name}
          </span>
        </div>
        <Dice
          value={diceValue}
          onRoll={onRollDice}
          disabled={phase !== 'rolling'}
        />
      </div>

      {/* Message (for overshoot, neutral, etc.) */}
      {message && (
        <div
          className="p-3 rounded-lg text-sm"
          style={{
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            color: '#92400E',
          }}
        >
          {message}
        </div>
      )}

      {/* Next Turn button (for overshoot / neutral — no question was shown) */}
      {phase === 'result' && (
        <button
          onClick={onNextTurn}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
        >
          Giliran Berikutnya →
        </button>
      )}
    </div>
  );
}
