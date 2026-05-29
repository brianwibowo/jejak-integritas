'use client';

import { BoxType, snakes, ladders } from '../gameData';
import { Player } from '../gameLogic';

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

function getBoxStyle(boxType: BoxType): { bg: string; text: string } {
  switch (boxType) {
    case 'biru':
      return { bg: '#3B82F6', text: '#FFFFFF' };
    case 'merah':
      return { bg: '#EF4444', text: '#FFFFFF' };
    case 'kuning':
      return { bg: '#EAB308', text: '#1a1a1a' };
    case 'hijau':
      return { bg: '#22C55E', text: '#FFFFFF' };
    case 'ungu':
      return { bg: '#A855F7', text: '#FFFFFF' };
    case 'start':
      return { bg: '#E5E7EB', text: '#1a1a1a' };
    case 'finish':
      return { bg: '#FFD700', text: '#1a1a1a' };
    default:
      return { bg: '#F3F4F6', text: '#1a1a1a' };
  }
}

export default function Board({ board, players }: BoardProps) {
  const cells = [];

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const position = getPosition(row, col);
      const boxType = board[position - 1];
      const playersHere = players.filter((p) => p.position === position);
      const hasSnake = position in snakes;
      const hasLadder = position in ladders;
      const style = getBoxStyle(boxType);

      cells.push(
        <div
          key={position}
          className="relative flex flex-col items-center justify-center border border-gray-300/50"
          style={{
            backgroundColor: style.bg,
            color: style.text,
            aspectRatio: '1',
          }}
        >
          {/* Position number */}
          <span className="font-bold text-[10px] sm:text-xs leading-none">
            {position}
          </span>

          {/* Snake or Ladder indicator */}
          {hasSnake && (
            <span className="text-[10px] sm:text-sm leading-none" title={`Ular: ${position} → ${snakes[position]}`}>
              🐍
            </span>
          )}
          {hasLadder && (
            <span className="text-[10px] sm:text-sm leading-none" title={`Tangga: ${position} → ${ladders[position]}`}>
              🪜
            </span>
          )}

          {/* Special labels */}
          {boxType === 'start' && (
            <span className="text-[8px] font-bold leading-none">START</span>
          )}
          {boxType === 'finish' && (
            <span className="text-[8px] font-bold leading-none">FINISH</span>
          )}

          {/* Player tokens */}
          {playersHere.length > 0 && (
            <div className="flex gap-0.5 flex-wrap justify-center absolute bottom-0.5">
              {playersHere.map((p) => (
                <div
                  key={p.id}
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: p.color }}
                  title={p.name}
                />
              ))}
            </div>
          )}
        </div>
      );
    }
  }

  return (
    <div
      className="grid grid-cols-10 border-2 border-gray-400 rounded-lg overflow-hidden w-full"
      style={{ maxWidth: '560px' }}
    >
      {cells}
    </div>
  );
}
