'use client';

import { Player, GamePhase } from '../gameData';
import Dice from './Dice';
import { DeviceTier } from '../hooks/useDeviceTier';

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
  tier?: DeviceTier;
}

const PLAYER_PIONS = [
  '/red.png',
  '/blue.png',
  '/green.png',
  '/black.png',
];

const PLAYER_COLORS = [
  '#E74C3C', // Red
  '#3498DB', // Blue
  '#2ECC71', // Green
  '#111111', // Black
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
  tier = 'desktop',
}: PlayerPanelProps) {
  const currentPlayer = players[currentPlayerIndex];

  // Sort players for leaderboard (rank by score descending, then by position descending)
  const rankedPlayers = [...players].sort((a, b) => {
    if (b.score !== a.score) return (b.score || 0) - (a.score || 0);
    return b.position - a.position;
  });

  const currentOriginalIndex = players.findIndex(pl => pl.id === currentPlayer?.id);
  const currentPionIndex = currentOriginalIndex !== -1 ? currentOriginalIndex : currentPlayerIndex;

  // Responsive sizing classes
  const isMobile = tier === 'mobile';
  const isTablet = tier === 'tablet';
  const panelGap = isMobile ? 'gap-1.5' : 'gap-3';
  const panelPad = isMobile ? 'p-2' : isTablet ? 'p-3' : 'p-4';
  const panelHeight = isMobile ? 'h-full' : 'h-[88%]';
  const turnTitleSize = isMobile ? 'text-[8px]' : 'text-[10px]';
  const nameSize = isMobile ? 'text-xs' : 'text-sm';
  const pionSize = isMobile ? 'w-6 h-6' : 'w-8 h-8';
  const leaderPionSize = isMobile ? 'w-5 h-5' : 'w-7 h-7';
  const leaderNameSize = isMobile ? 'text-[10px]' : 'text-xs';
  const statSize = isMobile ? 'text-[7px]' : 'text-[9px]';
  const sectionPad = isMobile ? 'p-2' : 'p-3';

  return (
    <div className={`flex flex-col ${panelGap} w-full ${panelHeight} bg-[#122c06] border-[6px] border-[#5c3208] rounded-3xl shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),0_10px_30px_rgba(0,0,0,0.5)] ${panelPad} font-sans text-slate-100 select-none`}>

      {/* 1. CURRENT TURN & DICE ROLL */}
      <div className={`text-center ${sectionPad} bg-black/25 border border-white/10 rounded-2xl flex flex-col gap-2`}>
        <h3 className={`${turnTitleSize} font-black text-emerald-200/95 uppercase tracking-widest`}>
          🎯 Giliran Saat Ini
        </h3>
        
        <div className="flex items-center justify-center gap-2">
          {currentPlayer && (
            <img
              src={PLAYER_PIONS[currentPionIndex % PLAYER_PIONS.length]}
              alt={currentPlayer.name}
              className={`${pionSize} object-contain animate-bounce`}
            />
          )}
          <div className={`font-extrabold ${nameSize} text-white truncate max-w-[155px]`}>
            {currentPlayer?.name}
          </div>
        </div>

        {/* Dice & Roll Button */}
        <div className={`bg-black/15 rounded-xl ${isMobile ? 'p-1.5' : 'p-2.5'} border border-white/5 flex justify-center shadow-inner`}>
          <Dice
            value={diceValue}
            onRoll={onRollDice}
            disabled={phase !== 'rolling' || !isMyTurn}
            tier={tier}
          />
        </div>
      </div>

      {/* Message Banner (for overshoot, neutral, etc.) */}
      {message && (
        <div
          className={`${isMobile ? 'p-1.5' : 'p-2.5'} rounded-xl ${isMobile ? 'text-[8px]' : 'text-[10px]'} font-extrabold leading-relaxed text-center animate-pulse shadow-sm`}
          style={{
            backgroundColor: '#78350f',
            border: '1px solid #92400e',
            color: '#fef3c7',
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
          className={`w-full ${isMobile ? 'py-1.5 text-[10px]' : 'py-2.5 text-xs'} bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-black rounded-xl shadow-md transition-all tracking-wider uppercase border border-amber-800 cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-900 disabled:cursor-not-allowed`}
        >
          {isMyTurn ? 'Giliran Berikutnya →' : 'Menunggu...'}
        </button>
      )}

      {/* Divider */}
      <div className="border-t border-white/10 my-0.5" />

      {/* 2. LEADERBOARD (Consolidated inside PlayerPanel) */}
      <div className="flex flex-col gap-2 flex-1 min-h-0">
        <h2 className={`${turnTitleSize} font-black text-emerald-200/90 uppercase tracking-widest flex items-center gap-1.5 pl-0.5`}>
          🏆 Papan Skor
        </h2>

        <div className={`flex flex-col ${isMobile ? 'gap-1' : 'gap-2'} overflow-y-auto pr-1 flex-1`}>
          {rankedPlayers.map((player, i) => {
            const isCurrent = player.id === currentPlayer?.id;
            const originalIndex = players.findIndex(pl => pl.id === player.id);
            const pionIndex = originalIndex !== -1 ? originalIndex : i;
            const borderCol = PLAYER_COLORS[pionIndex % PLAYER_COLORS.length];

            return (
              <div
                key={player.id}
                className={`flex flex-col gap-1 ${isMobile ? 'p-1.5' : 'p-2'} rounded-2xl transition-all border shadow-sm`}
                style={{
                  borderLeft: `5px solid ${borderCol}`,
                  backgroundColor: isCurrent ? 'rgba(254, 240, 138, 0.07)' : 'rgba(255, 255, 255, 0.03)',
                  borderColor: isCurrent ? 'rgba(254, 240, 138, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                  boxShadow: isCurrent ? '0 0 10px rgba(254, 240, 138, 0.08)' : 'none',
                }}
              >
                {/* Top row: rank + pion + name + active indicator */}
                <div className="flex items-center gap-1.5">
                  <span className={`${leaderNameSize} font-black text-slate-300 w-5 text-center flex-shrink-0`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <img
                    src={PLAYER_PIONS[pionIndex % PLAYER_PIONS.length]}
                    alt={player.name}
                    className={`${leaderPionSize} object-contain flex-shrink-0`}
                  />
                  <span className={`font-extrabold ${leaderNameSize} text-white truncate flex-1`}>{player.name}</span>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping flex-shrink-0" />
                  )}
                </div>

                {/* Bottom row: score + position + stats */}
                <div className="flex items-center justify-between gap-1 pl-1">
                  <span className={`text-yellow-200 font-black ${statSize} bg-yellow-950/40 px-2.5 py-0.5 rounded-full border border-yellow-800/35`}>
                    ⭐ {player.score || 0} Pts
                  </span>
                  <span className={`${statSize} text-slate-300 font-bold`}>
                    {player.isFinished 
                      ? `🏁 Ke-${player.finishRank}` 
                      : player.position === 0 
                      ? 'Belum Mulai' 
                      : `Kotak ${player.position}`}
                  </span>
                  <span className={`${statSize} text-slate-400 font-bold flex gap-1.5`}>
                    <span>B: <span className="text-emerald-300 font-black">{player.correctAnswers || 0}</span></span>
                    <span>•</span>
                    <span>S: <span className="text-rose-300 font-black">{player.wrongAnswers || 0}</span></span>
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
        className={`w-full px-3 ${isMobile ? 'py-1' : 'py-2'} rounded-xl ${turnTitleSize} font-black text-slate-300 bg-white/5 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer uppercase tracking-wider`}
        title="Pause Game"
      >
        ⏸ Pause
      </button>
    </div>
  );
}
