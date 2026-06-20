'use client';

import { Player, GamePhase } from '../gameData';
import { DeviceTier } from '../hooks/useDeviceTier';

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

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

  // Sort players for leaderboard (rank by score descending, then correctAnswers descending, then by position descending)
  const rankedPlayers = [...players].sort((a, b) => {
    if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
    if ((b.correctAnswers || 0) !== (a.correctAnswers || 0)) return (b.correctAnswers || 0) - (a.correctAnswers || 0);
    return (b.position || 0) - (a.position || 0);
  });

  const currentOriginalIndex = players.findIndex(pl => pl.id === currentPlayer?.id);
  const currentPionIndex = currentOriginalIndex !== -1 ? currentOriginalIndex : currentPlayerIndex;

  // Responsive sizing classes
  const isMobile = tier === 'mobile';
  const isTablet = tier === 'tablet';
  const panelGap = isMobile ? 'gap-1.5' : 'gap-3';
  const panelPad = isMobile ? 'p-2' : isTablet ? 'p-3' : 'p-4';
  const panelHeight = isMobile ? 'flex-1 min-h-0' : 'h-[88%]';
  const turnTitleSize = isMobile ? 'text-[8px]' : 'text-[10px]';
  const nameSize = isMobile ? 'text-xs' : 'text-sm';
  const pionSize = isMobile ? 'w-6 h-6' : 'w-8 h-8';
  const leaderPionSize = isMobile ? 'w-5 h-5' : 'w-7 h-7';
  const leaderNameSize = isMobile ? 'text-[10px]' : 'text-xs';
  const statSize = isMobile ? 'text-[7px]' : 'text-[9px]';
  const sectionPad = isMobile ? 'p-2' : 'p-3';

  return (
    <div className={`relative flex flex-col ${panelGap} w-full ${panelHeight} bg-[#122c06] border-[6px] border-[#5c3208] rounded-3xl shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),0_10px_30px_rgba(0,0,0,0.5)] ${panelPad} font-sans text-slate-100 select-none overflow-hidden`}>

      {/* 1. COMPACT CURRENT TURN & DICE ROLL */}
      <div className={`flex items-center justify-between ${sectionPad} bg-black/30 border border-white/10 rounded-2xl gap-2`}>

        {/* Left Side: Current Player Info */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {currentPlayer && (
            <img
              src={PLAYER_PIONS[currentPionIndex % PLAYER_PIONS.length]}
              alt={currentPlayer.name}
              className={`${isMobile ? 'w-5 h-5' : 'w-7 h-7'} object-contain flex-shrink-0`}
            />
          )}
          <div className="flex flex-col min-w-0">
            {!isMobile && (
              <span className={`${turnTitleSize} font-bold text-emerald-300 uppercase tracking-wider pl-0.5`}>Giliran</span>
            )}
            <span className={`font-black ${nameSize} text-white truncate`}>
              {currentPlayer?.name}
            </span>
          </div>
        </div>

        {/* Right Side: Compact Dice, Roll Button, and Pause Icon */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className={`${isMobile ? 'text-xl' : 'text-2.5xl'} select-none text-white flex items-center justify-center`} title={diceValue !== null ? `Hasil: ${diceValue}` : 'Dadu'}>
            {diceValue !== null ? DICE_FACES[diceValue - 1] : '🎲'}
          </div>

          <button
            onClick={onRollDice}
            disabled={phase !== 'rolling' || !isMyTurn}
            className={`px-2.5 ${isMobile ? 'py-1 text-[9px]' : 'py-1.5 text-[10px]'} bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-black rounded-lg transition-all shadow border border-amber-800 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-900 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider`}
          >
            {phase === 'rolling' && isMyTurn ? 'Dadu' : diceValue !== null ? `Dadu: ${diceValue}` : 'Dadu'}
          </button>

          {/* Settings/Pause Gear Icon (Flex item, rightmost) */}
          <button
            onClick={onPause}
            className="hover:scale-110 active:scale-95 transition-all cursor-pointer bg-black/45 hover:bg-black/60 p-1 rounded-full border border-white/10 shadow-md flex-shrink-0"
            title="Jeda Permainan"
          >
            <img
              src="/gear_pause.png"
              alt="Pause"
              className={`${isMobile ? 'w-4 h-4' : 'w-5.5 h-5.5'} object-contain hover:rotate-90 transition-transform duration-500`}
            />
          </button>
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
                className={`flex flex-col gap-1.5 ${isMobile ? 'p-2' : 'p-2.5'} rounded-2xl transition-all border shadow-sm`}
                style={{
                  borderLeft: `5px solid ${borderCol}`,
                  backgroundColor: isCurrent ? 'rgba(254, 240, 138, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  borderColor: isCurrent ? 'rgba(254, 240, 138, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                  boxShadow: isCurrent ? '0 0 12px rgba(254, 240, 138, 0.1)' : 'none',
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
                  <span className={`font-extrabold ${leaderNameSize} text-white truncate flex-1 flex items-center gap-1`}>
                    <span>{player.name}</span>
                    {player.isOffline && (
                      <span className="text-[8px] bg-rose-950/60 border border-rose-800 text-rose-300 px-1.5 py-0.5 rounded-md font-extrabold uppercase animate-pulse">
                        Offline
                      </span>
                    )}
                  </span>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping flex-shrink-0" />
                  )}
                </div>

                {/* Bottom row: score + position + stats */}
                <div className="flex items-center justify-between gap-1 pl-1 flex-wrap">
                  {/* Poin */}
                  <span className={`text-amber-200 font-black ${statSize} bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-800/35 flex items-center gap-0.5 shadow-sm`}>
                    ⭐ {player.score || 0} Pts
                  </span>

                  {/* Posisi Papan */}
                  <span className={`${statSize} font-extrabold px-2 py-0.5 bg-sky-950/30 text-sky-200 border border-sky-800/25 rounded-full`}>
                    {player.isFinished
                      ? `🏁 Finis #${player.finishRank}`
                      : player.position === 0
                        ? '📍 Mulai'
                        : `📍 Kotak ${player.position}`}
                  </span>

                  {/* Akurasi Kuis */}
                  <div className={`flex items-center ${isMobile ? 'gap-0.5' : 'gap-1'} ${statSize} font-bold`}>
                    <span className="bg-emerald-950/30 text-emerald-300 border border-emerald-800/25 px-1.5 py-0.5 rounded-md" title="Benar">
                      ✓ {player.correctAnswers || 0}
                    </span>
                    <span className="bg-rose-950/30 text-rose-300 border border-rose-800/25 px-1.5 py-0.5 rounded-md" title="Salah">
                      ✗ {player.wrongAnswers || 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
