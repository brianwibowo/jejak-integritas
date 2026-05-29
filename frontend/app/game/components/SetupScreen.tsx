'use client';

import { useState } from 'react';

interface SetupScreenProps {
  onStart: (playerNames: string[]) => void;
}

const PLAYER_COLORS = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12'];

export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState([
    'Pemain 1',
    'Pemain 2',
    'Pemain 3',
    'Pemain 4',
  ]);

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const handleStart = () => {
    const selectedNames = names
      .slice(0, playerCount)
      .map((n, i) => n.trim() || `Pemain ${i + 1}`);
    onStart(selectedNames);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-1 text-blue-800">
          🎲 Jejak Integritas
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          Permainan Ular Tangga Edukatif Anti Korupsi
        </p>

        {/* Player count */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Jumlah Pemain
          </label>
          <div className="flex gap-2">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setPlayerCount(n)}
                className="flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors"
                style={{
                  backgroundColor: playerCount === n ? '#2563EB' : '#F3F4F6',
                  color: playerCount === n ? '#FFFFFF' : '#4B5563',
                }}
              >
                {n} Pemain
              </button>
            ))}
          </div>
        </div>

        {/* Player names */}
        <div className="mb-6 flex flex-col gap-3">
          {Array.from({ length: playerCount }).map((_, i) => (
            <div key={i}>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: PLAYER_COLORS[i] }}
                />
                Pemain {i + 1}
              </label>
              <input
                type="text"
                value={names[i]}
                onChange={(e) => handleNameChange(i, e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder={`Nama Pemain ${i + 1}`}
              />
            </div>
          ))}
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          Mulai Bermain! 🎮
        </button>

        {/* Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
          <p>📋 Papan 100 kotak dengan 5 jenis kotak warna</p>
          <p>🐍 8 ular & 🪜 8 tangga</p>
          <p>❓ 90 soal dari 9 tema integritas</p>
        </div>
      </div>
    </div>
  );
}
