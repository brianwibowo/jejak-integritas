'use client';

import { BoxType, snakes, ladders, Player } from '../gameData';

interface BoardProps {
  board: BoxType[];
  players: Player[];
}

/**
 * Convert visual grid position (row, col) to board position (1-100).
 * The board uses a zigzag pattern like a real snakes & ladders board:
 * - Row 9 (bottom): 1→10 left-to-right
 * - Row 8: 20→11 right-to-left
 * - Row 7: 21→30 left-to-right
 * - ... etc
 * - Row 0 (top): 100→91 right-to-left
 */
function getPosition(visualRow: number, col: number): number {
  const boardRow = 9 - visualRow;
  if (boardRow % 2 === 0) {
    // Even board rows: left to right
    return boardRow * 10 + col + 1;
  } else {
    // Odd board rows: right to left
    return boardRow * 10 + (9 - col) + 1;
  }
}

const PLAYER_PIONS = [
  '/red.png',
  '/blue.png',
  '/green.png',
  '/black.png',
];

// Offset positions so multiple pawns on the same cell don't fully overlap
const PION_OFFSETS: Record<number, { top: string; left: string }> = {
  0: { top: '8%', left: '12%' },
  1: { top: '8%', left: '52%' },
  2: { top: '48%', left: '12%' },
  3: { top: '48%', left: '52%' },
};

export default function Board({ board, players }: BoardProps) {
  const cells = [];

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const position = getPosition(row, col);
      const playersHere = players.filter((p) => p.position === position);

      cells.push(
        <div
          key={position}
          className="relative w-full h-full"
        >
          {/* Hover indicator */}
          <div className="absolute inset-0 hover:bg-black/5 rounded-sm transition-colors z-[1]" />

          {/* Player tokens (pion) — spread across the cell */}
          {playersHere.map((p, idx) => {
            const pionSrc = PLAYER_PIONS[p.id % PLAYER_PIONS.length];
            const offset = PION_OFFSETS[idx] || PION_OFFSETS[0];
            return (
              <img
                key={p.id}
                src={pionSrc}
                alt={p.name}
                className="absolute object-contain z-10 transition-all duration-500 ease-in-out hover:scale-[1.3] hover:z-20"
                style={{
                  width: '42%',
                  height: '42%',
                  top: offset.top,
                  left: offset.left,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
                }}
                title={`${p.name} — Kotak ${p.position}`}
              />
            );
          })}
        </div>
      );
    }
  }

  return (
    <div
      className="grid grid-cols-10 rounded-2xl overflow-hidden w-full h-full max-h-full relative"
      style={{
        backgroundImage: 'url(/papan.png)',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        aspectRatio: '4/3',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {cells}
    </div>
  );
}
