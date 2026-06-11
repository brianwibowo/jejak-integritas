'use client';

import React from 'react';
import { Socket } from 'socket.io-client';

interface DevBypassProps {
  socket: Socket | null;
  lobbyId: string | null;
}

export default function DevBypass({ socket, lobbyId }: DevBypassProps) {
  if (!socket || !lobbyId) return null;

  const handleAddFakePlayer = () => {
    socket.emit('dev-add-fake-player', { lobbyId });
  };

  return (
    <button
      onClick={handleAddFakePlayer}
      className="w-6 h-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer border-0 outline-none"
      title="Dev: Tambah Pemain Simulasi (+)"
    >
      +
    </button>
  );
}
