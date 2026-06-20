'use client';

import { useRef, useEffect, useState } from 'react';
import { BoxType, Player } from '../gameData';
import { DeviceTier } from '../hooks/useDeviceTier';

interface BoardProps {
  board: BoxType[];
  players: Player[];
  tier?: DeviceTier;
}

const PLAYER_PIONS = [
  '/red.png',
  '/blue.png',
  '/green.png',
  '/black.png',
];

const BOARD_ASPECT_RATIO = 4810 / 3608;

interface ContentBox {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export default function Board({ board, players, tier = 'desktop' }: BoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentBox, setContentBox] = useState<ContentBox>({
    offsetX: 0,
    offsetY: 0,
    width: 1,
    height: 1
  });

  useEffect(() => {
    const calculate = () => {
      const container = containerRef.current;
      if (!container) return;

      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const containerRatio = cw / ch;

      let renderW: number, renderH: number, offsetX: number, offsetY: number;

      if (containerRatio > BOARD_ASPECT_RATIO) {
        // Container is wider than the board -> fit by height, padding on sides
        renderH = ch;
        renderW = ch * BOARD_ASPECT_RATIO;
        offsetX = (cw - renderW) / 2;
        offsetY = 0;
      } else {
        // Container is taller than the board -> fit by width, padding top/bottom
        renderW = cw;
        renderH = cw / BOARD_ASPECT_RATIO;
        offsetX = 0;
        offsetY = (ch - renderH) / 2;
      }

      setContentBox({ offsetX, offsetY, width: renderW, height: renderH });
    };

    calculate();
    window.addEventListener('resize', calculate);

    // Fallback/observation timers for transition/render delays
    const timer = setTimeout(calculate, 100);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      observer = new ResizeObserver(calculate);
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', calculate);
      clearTimeout(timer);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Pion sizing per device tier
  const pionScale = tier === 'mobile' ? { w: 0.025, h: 0.06 }
    : tier === 'tablet' ? { w: 0.022, h: 0.055 }
      : { w: 0.020, h: 0.05 };

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-10">
      {players.map((p, idx) => {
        const pionWidth = contentBox.width * pionScale.w;
        const pionHeight = contentBox.height * pionScale.h;

        // Find how many players share this box and the relative index of this player among them
        const playersOnSameBox = p.position > 0
          ? players.filter(other => other.position === p.position)
          : [];
        const localIndex = playersOnSameBox.findIndex(other => other.id === p.id);
        const totalOnBox = playersOnSameBox.length;

        const coord = getPawnCoordinates(
          p.position,
          localIndex >= 0 ? localIndex : 0,
          totalOnBox || 1,
          idx,
          contentBox,
          pionWidth,
          pionHeight
        );
        const pionSrc = PLAYER_PIONS[idx % PLAYER_PIONS.length];

        return (
          <img
            key={p.id}
            src={pionSrc}
            alt={p.name}
            className="absolute object-contain transition-all duration-500 ease-in-out hover:scale-[1.3] hover:z-20 pointer-events-auto"
            style={{
              width: pionWidth,
              height: pionHeight,
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

// Custom coordinates for each box (1 to 50) as percentage [x, y] of board dimensions.
// You can edit any box's x (left-to-right from 0.0 to 1.0) and y (top-to-bottom from 0.0 to 1.0) directly.
// This is structured visually per row from bottom (Row 5) to top (Row 1) for easy customization.
const BOX_COORDINATES: Record<number, { x: number; y: number }> = {
  // === ROW 5 (Bottom Row: Boxes 1 to 10, Left to Right) ===
  1: { x: 0.100, y: 0.87 },
  2: { x: 0.205, y: 0.87 },
  3: { x: 0.320, y: 0.87 },
  4: { x: 0.430, y: 0.87 },
  5: { x: 0.515, y: 0.87 },
  6: { x: 0.605, y: 0.87 },
  7: { x: 0.680, y: 0.87 },
  8: { x: 0.770, y: 0.87 },
  9: { x: 0.850, y: 0.87 },
  10: { x: 0.915, y: 0.87 },

  // === ROW 4 (Boxes 11 to 20, Right to Left zigzag) ===
  11: { x: 0.895, y: 0.69 },
  12: { x: 0.820, y: 0.69 },
  13: { x: 0.750, y: 0.69 },
  14: { x: 0.655, y: 0.69 },
  15: { x: 0.585, y: 0.69 },
  16: { x: 0.475, y: 0.69 },
  17: { x: 0.360, y: 0.69 },
  18: { x: 0.290, y: 0.69 },
  19: { x: 0.180, y: 0.69 },
  20: { x: 0.100, y: 0.69 },

  // === ROW 3 (Boxes 21 to 30, Left to Right zigzag) ===
  21: { x: 0.060, y: 0.505 },
  22: { x: 0.140, y: 0.505 },
  23: { x: 0.265, y: 0.505 },
  24: { x: 0.370, y: 0.505 },
  25: { x: 0.470, y: 0.505 },
  26: { x: 0.560, y: 0.505 },
  27: { x: 0.660, y: 0.505 },
  28: { x: 0.760, y: 0.505 },
  29: { x: 0.830, y: 0.505 },
  30: { x: 0.910, y: 0.505 },

  // === ROW 2 (Boxes 31 to 40, Right to Left zigzag) ===
  31: { x: 0.900, y: 0.32 },
  32: { x: 0.815, y: 0.32 },
  33: { x: 0.685, y: 0.32 },
  34: { x: 0.600, y: 0.32 },
  35: { x: 0.525, y: 0.32 },
  36: { x: 0.440, y: 0.32 },
  37: { x: 0.365, y: 0.32 },
  38: { x: 0.250, y: 0.32 },
  39: { x: 0.160, y: 0.32 },
  40: { x: 0.070, y: 0.32 },

  // === ROW 1 (Top Row: Boxes 41 to 50, Left to Right zigzag) ===
  41: { x: 0.100, y: 0.14 },
  42: { x: 0.180, y: 0.14 },
  43: { x: 0.280, y: 0.14 },
  44: { x: 0.380, y: 0.14 },
  45: { x: 0.470, y: 0.14 },
  46: { x: 0.580, y: 0.14 },
  47: { x: 0.660, y: 0.14 },
  48: { x: 0.750, y: 0.14 },
  49: { x: 0.815, y: 0.14 },
  50: { x: 0.920, y: 0.14 },
};

function getPawnCoordinates(
  position: number,
  localIndex: number, // Index of the player among those on the same box (0 if alone)
  totalOnBox: number, // Total players sharing this box (1 if alone)
  playerIndex: number, // Original index (used for below-board alignment)
  box: ContentBox,
  pionWidth: number,
  pionHeight: number
) {
  if (position <= 0) {
    // Pawns not started -> Line up neatly below the board, centered directly under Box 1 (Start)
    const pctLeft = 0.12 + playerIndex * 0.04;
    const pctTop = 0.955;
    return {
      left: box.offsetX + box.width * pctLeft - pionWidth / 2,
      top: box.offsetY + box.height * pctTop - pionHeight / 2,
    };
  }

  // Look up direct coordinate mappings for the box number
  const coord = BOX_COORDINATES[position] || { x: 0.5, y: 0.5 };
  const centerX = coord.x;
  const centerY = coord.y;

  // Offsets within the cell to prevent overlapping based on how many players share this box.
  // When a player is alone on a box, they are perfectly centered horizontally (dx = 0)
  // and vertically (dy = 0.00) in the middle of the cell.
  let dx = 0;
  let dy = 0.00;

  if (totalOnBox === 2) {
    dx = localIndex === 0 ? -0.012 : 0.012;
    dy = 0.00;
  } else if (totalOnBox === 3) {
    if (localIndex === 0) {
      dx = -0.012;
      dy = -0.015;
    } else if (localIndex === 1) {
      dx = 0.012;
      dy = -0.015;
    } else {
      dx = 0;
      dy = 0.015;
    }
  } else if (totalOnBox >= 4) {
    if (localIndex === 0) {
      dx = -0.012;
      dy = -0.015;
    } else if (localIndex === 1) {
      dx = 0.012;
      dy = -0.015;
    } else if (localIndex === 2) {
      dx = -0.012;
      dy = 0.015;
    } else {
      dx = 0.012;
      dy = 0.015;
    }
  }

  // Translate to absolute pixel positions and center the pawn
  const left = box.offsetX + box.width * (centerX + dx) - pionWidth / 2;
  const top = box.offsetY + box.height * (centerY + dy) - pionHeight / 2;

  return { left, top };
}
