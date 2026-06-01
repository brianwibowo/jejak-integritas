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
  onPause: () => void;
}

const PLAYER_PIONS = [
  '/red.png',
  '/blue.png',
  '/green.png',
  '/black.png',
];

export default function PlayerPanel({
  players,
  currentPlayerIndex,
  diceValue,
  onRollDice,
  phase,
  message,
  onNextTurn,
  onPause,
}: PlayerPanelProps) {
  const currentPlayer = players[currentPlayerIndex];

  // Sort players for leaderboard (rank by current position descending)
  const rankedPlayers = [...players].sort((a, b) => b.position - a.position);

  return (
    <div className="flex flex-col gap-4 p-5 bg-white rounded-2xl shadow-xl w-full h-full border border-gray-100/80">

      {/* 1. CURRENT TURN & DICE ROLL */}
      <div className="text-center p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex flex-col gap-3">
        <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider">
          🎯 Giliran Saat Ini
        </h3>
        
        <div className="flex flex-col items-center justify-center gap-1">
          {currentPlayer && (
            <img
              src={PLAYER_PIONS[currentPlayer.id % PLAYER_PIONS.length]}
              alt={currentPlayer.name}
              className="w-10 h-10 object-contain animate-bounce"
            />
          )}
          <div className="font-extrabold text-base text-gray-800">
            <span style={{ color: currentPlayer?.color }}>
              {currentPlayer?.name}
            </span>
          </div>
        </div>

        {/* Dice & Roll Button */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-blue-100/30">
          <Dice
            value={diceValue}
            onRoll={onRollDice}
            disabled={phase !== 'rolling'}
          />
        </div>
      </div>

      {/* Message Banner (for overshoot, neutral, etc.) */}
      {message && (
        <div
          className="p-3 rounded-xl text-xs font-semibold leading-relaxed text-center animate-pulse"
          style={{
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            color: '#92400E',
          }}
        >
          ⚠️ {message}
        </div>
      )}

      {/* Next Turn Button */}
      {phase === 'result' && (
        <button
          onClick={onNextTurn}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all transform active:scale-95"
        >
          Giliran Berikutnya →
        </button>
      )}

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* 2. LEADERBOARD (Consolidated inside PlayerPanel) */}
      <div className="flex flex-col gap-3 flex-1 min-h-0">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          🏆 Papan Peringkat
        </h2>

        <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1">
          {rankedPlayers.map((player, i) => {
            const isCurrent = player.id === currentPlayer?.id;
            return (
              <div
                key={player.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100 transition-all"
                style={{
                  borderLeft: `4px solid ${player.color}`,
                  backgroundColor: isCurrent ? '#F0F9FF' : '#F9FAFB',
                  borderColor: isCurrent ? '#BAE6FD' : '#F3F4F6',
                }}
              >
                {/* Rank medal/number */}
                <span className="text-sm font-bold text-gray-500 w-5 text-center flex-shrink-0">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                </span>

                {/* Custom player pion */}
                <img
                  src={PLAYER_PIONS[player.id % PLAYER_PIONS.length]}
                  alt={player.name}
                  className="w-6 h-6 object-contain flex-shrink-0"
                />

                {/* Player details */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-gray-800 truncate">
                    {player.name}
                  </div>
                  <div className="text-[10px] text-gray-500 font-semibold flex flex-wrap items-center justify-between gap-x-2">
                    <span>Kotak {player.position}</span>
                    <span className="text-[9px] text-slate-400">
                      Benar: <span className="text-emerald-600 font-bold">{player.correctAnswers || 0}</span> • Salah: <span className="text-rose-500 font-bold">{player.wrongAnswers || 0}</span>
                    </span>
                  </div>
                </div>

                {/* active status indicator inside leaderboard */}
                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pause Button — below leaderboard */}
      <button
        onClick={onPause}
        className="w-full px-3 py-2.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
        title="Pause Game"
      >
        ⏸ Pause
      </button>
    </div>
  );
}
