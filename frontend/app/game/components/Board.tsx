'use client';

import { useRef, useEffect, useState } from 'react';
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

const BOARD_ASPECT_RATIO = 4810 / 3608;

interface ContentBox {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export default function Board({ board, players }: BoardProps) {
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

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-10">
      {players.map((p, idx) => {
        // Slightly smaller pawn dimensions (2.0% width, 5.0% height) for better fit
        const pionWidth = contentBox.width * 0.020;
        const pionHeight = contentBox.height * 0.05;
        const coord = getPawnCoordinates(p.position, idx, contentBox, pionWidth, pionHeight);
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

function getPawnCoordinates(
  position: number, 
  playerIndex: number, 
  box: ContentBox,
  pionWidth: number,
  pionHeight: number
) {
  // Exact manually calibrated column centers to fit the irregular drawn squares perfectly
  const columnCentersX = [
    0.14,   // Column 0 (Box 1, 20, 21, 40, 41)
    0.225,  // Column 1 (Box 2, 19, 22, 39, 42)
    0.315,  // Column 2 (Box 3, 18, 23, 38, 43)
    0.41,   // Column 3 (Box 4, 17, 24, 37, 44)
    0.50,   // Column 4 (Box 5, 16, 25, 36, 45)
    0.59,   // Column 5 (Box 6, 15, 26, 35, 46)
    0.675,  // Column 6 (Box 7, 14, 27, 34, 47)
    0.765,  // Column 7 (Box 8, 13, 28, 33, 48)
    0.855,  // Column 8 (Box 9, 12, 29, 32, 49)
    0.935,  // Column 9 (Box 10, 11, 30, 31, 50)
  ];

  if (position <= 0) {
    // Pawns not started -> Line up neatly below the board on the wooden desk
    const pctLeft = 0.14 + playerIndex * 0.05;
    const pctTop = 0.935;
    return {
      left: box.offsetX + box.width * pctLeft - pionWidth / 2,
      top: box.offsetY + box.height * pctTop - pionHeight / 2,
    };
  }

  // Grid 10 columns × 5 rows, zigzag
  const rowFromBottom = Math.floor((position - 1) / 10);
  const r = 4 - rowFromBottom; // 0 = top (41-50), 4 = bottom (1-10)
  const c = rowFromBottom % 2 === 0
    ? ((position - 1) % 10)
    : (9 - ((position - 1) % 10));

  // Tuned row center percentages (Y-axis) relative to board height
  const rowCentersY = [0.14, 0.32, 0.505, 0.69, 0.87];
  
  const centerX = columnCentersX[c];
  const centerY = rowCentersY[r];

  // Offsets within the cell to prevent overlapping (2x2 layout inside cell)
  const offsets = [
    { dx: -0.015, dy: -0.025 },
    { dx:  0.015, dy: -0.025 },
    { dx: -0.015, dy:  0.025 },
    { dx:  0.015, dy:  0.025 },
  ];
  const offset = offsets[playerIndex % 4];

  // Translate to absolute pixel positions and center the pawn
  const left = box.offsetX + box.width * (centerX + offset.dx) - pionWidth / 2;
  const top = box.offsetY + box.height * (centerY + offset.dy) - pionHeight / 2;

  return { left, top };
}
