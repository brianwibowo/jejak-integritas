'use client';

import { BoxType, Player } from '../gameData';

interface BoardProps {
  board: BoxType[];
  players: Player[];
}

const PLAYER_PIONS = [
  '/red.png',
  '/blue.png',
  '/green.png',
  '/black.png',
];

export default function Board({ board, players }: BoardProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {players.map((p, idx) => {
        const coord = getPawnCoordinates(p.position, idx);
        const pionSrc = PLAYER_PIONS[p.id % PLAYER_PIONS.length];
        
        return (
          <img
            key={p.id}
            src={pionSrc}
            alt={p.name}
            className="absolute object-contain transition-all duration-500 ease-in-out hover:scale-[1.3] hover:z-20 pointer-events-auto"
            style={{
              width: '2.5%',
              height: '6%',
              left: coord.left,
              top: coord.top,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
            }}
            title={`${p.name} — Kotak ${p.position}`}
          />
        );
      })}
    </div>
  );
}
function getPawnCoordinates(position: number, playerIndex: number) {
  if (position <= 0) {
    // Line up neatly below the board
    const left = 4.0 + playerIndex * 5.0;
    const top = 88.5;
    return { left: `${left}%`, top: `${top}%` };
  }

  // Calculate row and column
  const rowFromBottom = Math.floor((position - 1) / 10);
  const r = 4 - rowFromBottom; // 0 (top) to 4 (bottom)
  const c = rowFromBottom % 2 === 0 
    ? ((position - 1) % 10) 
    : (9 - ((position - 1) % 10)); // zigzag

  const rowCenters = [19.9, 36.0, 52.1, 68.2, 84.3];
  const centerY = rowCenters[r];

  // Offsets within the cell to prevent complete overlap (2x2 layout inside box)
  const offsets = [
    { dx: -1.1, dy: -2.0 },
    { dx: 1.1, dy: -2.0 },
    { dx: -1.1, dy: 2.0 },
    { dx: 1.1, dy: 2.0 },
  ];
  const offset = offsets[playerIndex % 4];

  const left = 6.52 + c * 6.77 + offset.dx;
  const top = centerY - 3.0 + offset.dy; // Center the 6% height pawn

  return { left: `${left}%`, top: `${top}%` };
}
