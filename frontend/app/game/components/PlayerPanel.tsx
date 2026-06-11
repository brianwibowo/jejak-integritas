'use client';

import { Player, GamePhase } from '../gameData';
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
  isMyTurn?: boolean;
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
  isMyTurn = true,
}: PlayerPanelProps) {
  const currentPlayer = players[currentPlayerIndex];

  // Sort players for leaderboard (rank by score descending, then by position descending)
  const rankedPlayers = [...players].sort((a, b) => {
    if (b.score !== a.score) return (b.score || 0) - (a.score || 0);
    return b.position - a.position;
  });

  return (
    <div className="flex flex-col gap-3 w-full h-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 p-4 font-sans text-slate-800 select-none">

      {/* 1. CURRENT TURN & DICE ROLL */}
      <div className="text-center p-3 bg-blue-50 border border-blue-100/50 rounded-2xl flex flex-col gap-2">
        <h3 className="text-[10px] font-black text-blue-800 uppercase tracking-widest">
          🎯 Giliran Saat Ini
        </h3>
        
        <div className="flex items-center justify-center gap-2">
          {currentPlayer && (
            <img
              src={PLAYER_PIONS[currentPlayer.id % PLAYER_PIONS.length]}
              alt={currentPlayer.name}
              className="w-8 h-8 object-contain animate-bounce"
            />
          )}
          <div className="font-black text-sm text-slate-800 truncate max-w-[150px]">
            {currentPlayer?.name}
          </div>
        </div>

        {/* Dice & Roll Button */}
        <div className="bg-white rounded-xl p-2 border border-blue-100/20 flex justify-center shadow-sm">
          <Dice
            value={diceValue}
            onRoll={onRollDice}
            disabled={phase !== 'rolling' || !isMyTurn}
          />
        </div>
      </div>

      {/* Message Banner (for overshoot, neutral, etc.) */}
      {message && (
        <div
          className="p-2.5 rounded-xl text-[10px] font-bold leading-relaxed text-center animate-pulse"
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
          disabled={!isMyTurn}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-550 active:scale-95 text-white font-black rounded-xl text-xs shadow-md transition-all tracking-wider uppercase border-0 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          {isMyTurn ? 'Giliran Berikutnya →' : 'Menunggu...'}
        </button>
      )}

      {/* Divider */}
      <div className="border-t border-slate-100 my-0.5" />

      {/* 2. LEADERBOARD (Consolidated inside PlayerPanel) */}
      <div className="flex flex-col gap-2 flex-1 min-h-0">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          🏆 Papan Skor
        </h2>

        <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 flex-1">
          {rankedPlayers.map((player, i) => {
            const isCurrent = player.id === currentPlayer?.id;
            return (
              <div
                key={player.id}
                className="flex flex-col gap-1.5 p-3 rounded-xl transition-all border shadow-sm"
                style={{
                  borderLeft: `4px solid ${player.color}`,
                  backgroundColor: isCurrent ? '#F0F9FF' : '#FFFFFF',
                  borderColor: isCurrent ? '#BAE6FD' : '#F1F5F9',
                }}
              >
                {/* Top row: rank + pion + name + active indicator */}
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-500 w-6 text-center flex-shrink-0">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <img
                    src={PLAYER_PIONS[player.id % PLAYER_PIONS.length]}
                    alt={player.name}
                    className="w-8 h-8 object-contain flex-shrink-0"
                  />
                  <span className="font-bold text-sm text-slate-800 truncate flex-1">{player.name}</span>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping flex-shrink-0" />
                  )}
                </div>

                {/* Bottom row: score + position + stats */}
                <div className="flex items-center justify-between gap-2 pl-1">
                  <span className="text-indigo-600 font-extrabold text-[11px] bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100/40">
                    ⭐ {player.score || 0} Pts
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {player.isFinished 
                      ? `🏁 Ke-${player.finishRank}` 
                      : player.position === 0 
                      ? 'Belum Mulai' 
                      : `Kotak ${player.position}`}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold flex gap-1.5">
                    <span>Benar: <span className="text-emerald-600 font-bold">{player.correctAnswers || 0}</span></span>
                    <span>•</span>
                    <span>Salah: <span className="text-rose-500 font-bold">{player.wrongAnswers || 0}</span></span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pause Button — below leaderboard */}
      <button
        onClick={onPause}
        className="w-full px-3 py-2 rounded-xl text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 border border-slate-200/40 cursor-pointer"
        title="Pause Game"
      >
        ⏸ Pause Game
      </button>
    </div>
  );
}
