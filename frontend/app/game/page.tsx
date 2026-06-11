'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import Board from './components/Board';
import PlayerPanel from './components/PlayerPanel';
import QuestionModal from './components/QuestionModal';
import { generateBoard, getRandomQuestion } from './gameData';
import { playHomeLobbyMusic, stopHomeLobbyMusic, setHomeLobbyMusicMute, playClickSound } from './audioHelper';

const PLAYER_PIONS = [
  '/red.png',
  '/blue.png',
  '/green.png',
  '/black.png',
];

const AVAILABLE_COLORS = [
  { name: 'Merah', value: '#E74C3C', pion: '/red.png' },
  { name: 'Biru', value: '#3498DB', pion: '/blue.png' },
  { name: 'Hijau', value: '#2ECC71', pion: '/green.png' },
  { name: 'Hitam', value: '#111111', pion: '/black.png' },
];

const getBackendUrl = () => {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) return process.env.NEXT_PUBLIC_BACKEND_URL;
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:5001`;
  }
  return 'http://localhost:5001';
};

export default function GamePage() {
  const gameMode = 'online';

  // === ONLINE / SOCKET STATE ===
  const [socketConnected, setSocketConnected] = useState(false);
  const [lobbies, setLobbies] = useState<any[]>([]);
  const [currentLobbyId, setCurrentLobbyId] = useState<string | null>(null);
  const [myPlayer, setMyPlayer] = useState<any | null>(null);
  const [roomPlayers, setRoomPlayers] = useState<any[]>([]);
  const [roomHostId, setRoomHostId] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [onlineGameState, setOnlineGameState] = useState<any | null>(null);
  const [onlineLobbyStatus, setOnlineLobbyStatus] = useState<'waiting' | 'playing'>('waiting');
  const [currentRoomName, setCurrentRoomName] = useState('');
  const [lobbyNameInput, setLobbyNameInput] = useState('');

  const socketRef = useRef<Socket | null>(null);

  // === AUDIO REFS ===
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const rollSoundRef = useRef<HTMLAudioElement | null>(null);
  const isRollPlayingRef = useRef(false);

  // === COMMON UI STATE ===
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<number | null>(null);

  // === GET ACTIVE GAME STATE ===
  const activeState = onlineGameState;

  // === AUDIO INITIALIZATION ===
  useEffect(() => {
    const audio = new Audio('/backsound-game.mp3');
    audio.loop = true;
    audio.volume = 0.25;
    bgMusicRef.current = audio;

    const rollAudio = new Audio('/roll.mp3');
    rollAudio.volume = 0.6;
    rollSoundRef.current = rollAudio;

    return () => {
      audio.pause();
    };
  }, []);

  // === SYNC MUTE STATE WITH AUDIO ===
  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.muted = isMuted;
    }
    setHomeLobbyMusicMute(isMuted);
  }, [isMuted]);

  // === LOBBY BGM SYNC ===
  useEffect(() => {
    if (onlineGameState === null) {
      playHomeLobbyMusic();
    } else {
      stopHomeLobbyMusic();
    }
    return () => {
      stopHomeLobbyMusic();
    };
  }, [onlineGameState]);

  // === GLOBAL CLICK SOUNDS ===
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      let current: HTMLElement | null = target;
      let isClickable = false;
      for (let i = 0; i < 4 && current; i++) {
        if (
          current.tagName === 'BUTTON' ||
          current.tagName === 'A' ||
          current.getAttribute('role') === 'button' ||
          current.classList.contains('cursor-pointer')
        ) {
          isClickable = true;
          break;
        }
        current = current.parentElement;
      }
      if (isClickable) {
        playClickSound();
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  // === WINNING & SOUND EFFECT TRIGGERS ===
  useEffect(() => {
    if (!activeState) return;
    if (activeState.phase === 'finished' && activeState.winner) {
      if (bgMusicRef.current) {
        bgMusicRef.current.volume = 0.08;
      }
      if (!isMuted) {
        const winAudio = new Audio('/winning.wav');
        winAudio.volume = 0.7;
        winAudio.play().catch(() => {});
      }
    } else {
      if (bgMusicRef.current) {
        bgMusicRef.current.volume = 0.25;
      }
    }
  }, [activeState?.phase, activeState?.winner, isMuted]);

  // === SOCKET CONNECTION AND LISTENERS ===
  const connectSocket = useCallback(() => {
    if (socketRef.current) return;

    const url = getBackendUrl();
    const socket = io(url);
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      setNicknameError('');
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
      // Reset state if disconnected
      setCurrentLobbyId(null);
      setMyPlayer(null);
      setOnlineGameState(null);
    });

    socket.on('lobbies-list', (list: any[]) => {
      setLobbies(list);
    });

    socket.on('join-success', ({ lobbyId, myPlayer }) => {
      setCurrentLobbyId(lobbyId);
      setMyPlayer(myPlayer);
      setNicknameError('');
    });

    socket.on('join-error', (msg: string) => {
      setNicknameError(msg);
    });

    socket.on('lobby-update', ({ players, hostId, status, name }) => {
      setRoomPlayers(players);
      setRoomHostId(hostId);
      setOnlineLobbyStatus(status);
      if (name) {
        setCurrentRoomName(name);
        setLobbyNameInput(name);
      }
      if (status === 'waiting') {
        setOnlineGameState(null);
      }
    });

    socket.on('kicked', () => {
      setCurrentLobbyId(null);
      setMyPlayer(null);
      setOnlineGameState(null);
      alert('Anda telah ditendang dari lobby oleh Host.');
    });

    socket.on('game-state-update', (state) => {
      setOnlineGameState(state);
    });

    socket.on('game-terminated', () => {
      setOnlineGameState(null);
      setIsPaused(false);
      alert('Permainan dihentikan karena host keluar atau pemain lain terputus.');
    });
  }, []);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocketConnected(false);
    setCurrentLobbyId(null);
    setMyPlayer(null);
    setOnlineGameState(null);
  }, []);

  // Connect socket automatically on mount
  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket]);


  // === LOADING SCREEN TIMER CONTROL ===
  useEffect(() => {
    if (loadingProgress === null) return;

    if (loadingProgress === 0 && bgMusicRef.current && !isMuted) {
      bgMusicRef.current.play().catch((err) => {
        console.log("Autoplay blocked or audio error:", err);
      });
    }

    if (loadingProgress < 100) {
      const timer = setTimeout(() => {
        setLoadingProgress((prev) => {
          if (prev === null) return null;
          const next = prev + Math.floor(Math.random() * 8) + 4;
          return next > 100 ? 100 : next;
        });
      }, 70 + Math.random() * 70);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setLoadingProgress(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loadingProgress, isMuted]);

  // === ANIMATION TIMEOUT: ONLINE WALKING (Active Player Only) ===
  useEffect(() => {
    if (!onlineGameState || onlineGameState.phase !== 'walking' || onlineGameState.targetPosition === null) return;

    const currentPlayer = onlineGameState.players[onlineGameState.currentPlayerIndex];
    if (!currentPlayer) return;

    const isMyTurn = myPlayer && currentPlayer.socketId === socketRef.current?.id;
    if (!isMyTurn) return;

    const targetPos = onlineGameState.targetPosition;

    const timeoutId = setTimeout(() => {
      if (currentPlayer.position < targetPos) {
        socketRef.current?.emit('walk-step', { lobbyId: currentLobbyId });
      } else {
        socketRef.current?.emit('finish-walk', { lobbyId: currentLobbyId });
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [onlineGameState?.phase, onlineGameState?.targetPosition, onlineGameState?.players, onlineGameState?.currentPlayerIndex, myPlayer, currentLobbyId]);

  // === DELAY: ONLINE PRE-QUESTION (Active Player Selects Question) ===
  useEffect(() => {
    if (!onlineGameState || onlineGameState.phase !== 'pre_question') return;

    const currentPlayer = onlineGameState.players[onlineGameState.currentPlayerIndex];
    if (!currentPlayer) return;

    const isMyTurn = myPlayer && currentPlayer.socketId === socketRef.current?.id;
    if (!isMyTurn) return;

    const currentPos = currentPlayer.position;
    let targetBoxType: 'biru' | 'merah' | 'kuning' | 'hijau' | 'ungu' = 'biru';
    if (currentPos <= 11) {
      targetBoxType = 'biru';      // 1 (Start) & 2-11 (Boxes 1-10)
    } else if (currentPos <= 21) {
      targetBoxType = 'merah';     // 12-21 (Boxes 11-20)
    } else if (currentPos <= 31) {
      targetBoxType = 'kuning';    // 22-31 (Boxes 21-30)
    } else if (currentPos <= 41) {
      targetBoxType = 'hijau';     // 32-41 (Boxes 31-40)
    } else {
      targetBoxType = 'ungu';      // 42-51 (Boxes 41-50) & 52 (Finish fallback)
    }

    const timeoutId = setTimeout(() => {
      const question = getRandomQuestion(targetBoxType, onlineGameState.usedQuestionIds);
      socketRef.current?.emit('trigger-question', { lobbyId: currentLobbyId, question });
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [onlineGameState?.phase, onlineGameState?.currentPlayerIndex, myPlayer, currentLobbyId]);

  // === ROLL DICE HANDLER ===
  const handleRollDice = useCallback(() => {
    if (!activeState || activeState.phase !== 'rolling') return;

    // Play sound locally
    if (!isRollPlayingRef.current && rollSoundRef.current && !isMuted) {
      isRollPlayingRef.current = true;
      const audio = rollSoundRef.current;
      audio.currentTime = 0;
      audio.play().catch(() => {});
      audio.onended = () => {
        isRollPlayingRef.current = false;
      };
    }

    socketRef.current?.emit('roll-dice', { lobbyId: currentLobbyId });
  }, [activeState?.phase, isMuted, currentLobbyId]);

  // === PAUSE HANDLERS ===
  const handlePause = useCallback(() => {
    setIsPaused(true);
    if (bgMusicRef.current && !isMuted) {
      bgMusicRef.current.volume = 0.08;
    }
  }, [isMuted]);

  const handleResume = useCallback(() => {
    setIsPaused(false);
    if (bgMusicRef.current && !isMuted) {
      bgMusicRef.current.volume = 0.25;
    }
  }, [isMuted]);

  const handleQuit = useCallback(() => {
    setIsPaused(false);
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
    }

    socketRef.current?.emit('quit-game', { lobbyId: currentLobbyId });
  }, [currentLobbyId]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // === LOBBY ACTIONS ===
  const handleJoinLobby = (lobbyId: string) => {
    if (!socketConnected || !socketRef.current) {
      setNicknameError('Gagal terhubung ke server. Pastikan backend sudah menyala.');
      return;
    }
    const trimmed = nickname.trim();
    if (!trimmed) {
      setNicknameError('Masukkan nama panggilan Anda terlebih dahulu');
      return;
    }
    setNicknameError('');
    socketRef.current.emit('join-lobby', { lobbyId, playerName: trimmed });
  };

  const handleLeaveLobby = () => {
    socketRef.current?.emit('leave-lobby', { lobbyId: currentLobbyId });
    setCurrentLobbyId(null);
    setMyPlayer(null);
    setOnlineGameState(null);
  };

  const handleStartOnlineGame = () => {
    if (roomPlayers.length < 2) {
      alert('Butuh minimal 2 pemain untuk memulai permainan!');
      return;
    }
    // Generate deterministic board colors
    const colorsList = generateBoard();
    setLoadingProgress(0);
    socketRef.current?.emit('start-game', { lobbyId: currentLobbyId, boardColors: colorsList });
  };

  const handleSelectColor = (color: string) => {
    socketRef.current?.emit('select-color', { lobbyId: currentLobbyId, color });
  };

  const isColorTaken = (color: string) => {
    return roomPlayers.some(p => p.socketId !== socketRef.current?.id && p.color === color);
  };

  const myCurrentColor = roomPlayers.find(p => p.socketId === socketRef.current?.id)?.color;

  const handleRenameLobby = () => {
    const trimmed = lobbyNameInput.trim();
    if (!trimmed) return;
    socketRef.current?.emit('rename-lobby', { lobbyId: currentLobbyId, name: trimmed });
  };

  const handleKickPlayer = (targetSocketId: string) => {
    socketRef.current?.emit('kick-player', { lobbyId: currentLobbyId, targetSocketId });
  };

  // ==========================================
  // UIs RENDER STATES
  // ==========================================


  // 2. ONLINE LOBBY SELECTION UI
  if (gameMode === 'online' && currentLobbyId === null) {
    const defaultLobbies = Array.from({ length: 5 }).map((_, i) => ({
      id: (i + 1).toString(),
      name: `Lobby ${i + 1}`,
      playerCount: 0,
      status: 'waiting'
    }));

    const displayLobbies = lobbies.length > 0 ? lobbies : defaultLobbies;

    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen p-6 font-sans relative overflow-hidden bg-slate-100"
        style={{
          backgroundImage: "url('/belajar.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Backdrop filter overlay for contrast */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] pointer-events-none" />

        <div className="max-w-xl w-full z-10 bg-white/85 backdrop-blur-md border border-white/60 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-2xl font-black text-center text-indigo-950 mb-1 tracking-wide flex items-center justify-center gap-2">
            🌐 ONLINE LOBBIES
          </h2>
          <p className="text-xs text-center text-slate-500 font-extrabold uppercase tracking-widest mb-6">
            Pilih lobby untuk bermain
          </p>

          {/* Nickname input */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-550 mb-2 text-left">
              Nama Pemain
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 12))}
              placeholder="Masukkan Nickname..."
              className="w-full px-4 py-3 bg-white/70 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm text-slate-800 focus:outline-none transition-colors font-semibold shadow-sm"
            />
            {nicknameError && (
              <p className="text-xs text-rose-500 font-semibold mt-1.5 flex items-center gap-1">
                ⚠️ {nicknameError}
              </p>
            )}
          </div>

          {/* Lobby List */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 text-left">
              Daftar Room (Maks. 5 Lobby)
            </div>
            
            {displayLobbies.map((lobby) => {
              const isFull = lobby.playerCount >= 4;
              const isPlaying = lobby.status === 'playing';
              const canJoin = !isFull && !isPlaying;

              return (
                <div
                  key={lobby.id}
                  className="flex justify-between items-center p-4 bg-white/95 border border-slate-150 rounded-2xl shadow-sm hover:border-slate-250 transition-colors text-left"
                >
                  <div>
                    <div className="font-extrabold text-sm text-slate-800">
                      {lobby.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 flex items-center gap-2">
                      <span>👥 {lobby.playerCount}/4 Pemain</span>
                      <span>•</span>
                      <span className={isPlaying ? 'text-indigo-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>
                        {isPlaying ? 'Sedang bermain 🎮' : 'Menunggu ⏳'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinLobby(lobby.id)}
                    disabled={!canJoin}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      canJoin
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md hover:shadow-indigo-500/10 active:scale-95'
                        : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isPlaying ? 'Dalam Game' : isFull ? 'Penuh' : 'Gabung'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center border-t border-slate-200 pt-6">
            <Link
              href="/"
              className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              ← Menu Utama
            </Link>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
              <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {socketConnected ? 'Server Terhubung' : 'Server Terputus'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 3. ONLINE LOBBY ROOM WAITING UI
  if (gameMode === 'online' && currentLobbyId !== null && onlineGameState === null) {
    const isHost = myPlayer && roomHostId === socketRef.current?.id;

    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen p-6 font-sans relative overflow-hidden bg-slate-100"
        style={{
          backgroundImage: "url('/menanam tanaman.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Backdrop overlay */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] pointer-events-none" />

        <div className="max-w-md w-full z-10 bg-white/85 backdrop-blur-md border border-white/60 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Static Lobby Name Header (No Rename Option) */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-black text-indigo-950 tracking-wide">
              🚪 {currentRoomName || `Lobby ${currentLobbyId}`}
            </h2>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 inline-block">
              Lobby {currentLobbyId} • Menunggu Pemain Lain
            </span>
          </div>

          {/* Players list */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 text-left">
              Pemain Tergabung ({roomPlayers.length}/4)
            </div>

            {Array.from({ length: 4 }).map((_, i) => {
              const player = roomPlayers[i];
              if (player) {
                const isMe = player.socketId === socketRef.current?.id;
                const isPlayerHost = player.socketId === roomHostId;
                const showKickButton = isHost && !isMe;

                return (
                  <div
                    key={player.socketId}
                    className="flex items-center gap-3 p-3 bg-white border border-slate-150 rounded-2xl shadow-sm text-left"
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: player.color }}
                    />
                    <span className="text-sm font-bold text-slate-700 flex-1 truncate">
                      {player.name} {isMe && <span className="text-xs font-medium text-slate-400">(Anda)</span>}
                    </span>
                    {isPlayerHost && (
                      <span className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-100/60 px-2 py-0.5 rounded-md font-bold uppercase mr-1">
                        👑 Host
                      </span>
                    )}
                    {showKickButton && (
                      <button
                        onClick={() => handleKickPlayer(player.socketId)}
                        className="text-[10px] text-rose-500 hover:text-white hover:bg-rose-600/10 border border-rose-200 hover:border-rose-500 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center"
                        title={`Kick ${player.name}`}
                      >
                        Kick
                      </button>
                    )}
                  </div>
                );
              } else {
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-white/40 border border-slate-200 border-dashed rounded-2xl text-left"
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-100 border border-slate-200 flex-shrink-0" />
                    <span className="text-sm font-bold text-slate-400 animate-pulse flex-1">
                      Menunggu pemain...
                    </span>
                  </div>
                );
              }
            })}
          </div>

          {/* Character selection */}
          <div className="mb-6 p-4 bg-white border border-slate-150 rounded-2xl shadow-sm text-left">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">
              PILIH PION / WARNA ANDA
            </div>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_COLORS.map((col) => {
                const isTaken = isColorTaken(col.value);
                const isMine = myCurrentColor === col.value;
                
                return (
                  <button
                    key={col.value}
                    disabled={isTaken && !isMine}
                    onClick={() => handleSelectColor(col.value)}
                    className={`relative p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isMine
                        ? 'bg-indigo-55/60 border-indigo-400 text-indigo-650 scale-105 shadow-sm'
                        : isTaken
                        ? 'bg-slate-100 border-slate-200 opacity-20 cursor-not-allowed'
                        : 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    <img src={col.pion} alt={col.name} className="w-7 h-7 object-contain mb-1" />
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-650">
                      {isMine ? 'Anda' : isTaken ? 'Penuh' : col.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-4 border-t border-slate-200 pt-6">
            {isHost ? (
              <button
                onClick={handleStartOnlineGame}
                disabled={roomPlayers.length < 2}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer shadow-indigo-600/10"
              >
                Mulai Permainan 🎮
              </button>
            ) : (
              <div className="w-full py-3 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl font-bold text-xs text-center animate-pulse">
                ⏳ Menunggu Host memulai permainan...
              </div>
            )}

            <button
              onClick={handleLeaveLobby}
              className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-rose-500 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              🚪 Keluar Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }


  // 5. RENDER LOADING SCREEN OVERLAY (both online & offline)
  if (loadingProgress !== null) {
    let loadingText = 'Mempersiapkan papan permainan...';
    if (loadingProgress > 75) {
      loadingText = 'Menyiapkan kartu pertanyaan & dadu...';
    } else if (loadingProgress > 50) {
      loadingText = 'Menyusun nilai-nilai integritas...';
    } else if (loadingProgress > 25) {
      loadingText = 'Memuat model dan aset permainan...';
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 font-sans">
        <div className="max-w-md w-full text-center flex flex-col items-center gap-6 animate-fade-in">
          {/* Glowing game logo/icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full filter blur-xl opacity-30 animate-pulse" />
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center text-4xl shadow-2xl border border-blue-400/30 animate-bounce">
              🎮
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent tracking-wide">
              JEJAK INTEGRITAS
            </h2>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest text-center">
              Game Edukasi Anti Korupsi
            </p>
          </div>

          {/* Progress bar container */}
          <div className="w-full bg-slate-900 border border-slate-800/80 rounded-full h-4 p-0.5 overflow-hidden shadow-inner relative">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 h-full rounded-full transition-all duration-150 ease-out shadow-lg relative"
              style={{ width: `${loadingProgress}%` }}
            >
              {/* Glowing tip */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full filter blur-sm animate-pulse" />
            </div>
          </div>

          {/* Percentage and loading status */}
          <div className="flex justify-between items-center w-full px-1">
            <span className="text-xs font-semibold text-slate-400 tracking-wide animate-pulse">
              {loadingText}
            </span>
            <span className="text-sm font-black text-blue-400 tabular-nums">
              {loadingProgress}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Check state consistency for game rendering
  if (!activeState || activeState.phase === 'setup') {
    return null;
  }

  const rankedPlayers = [...activeState.players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const activePlayer = activeState.players[activeState.currentPlayerIndex];
  const isMyTurn = !!(myPlayer && activePlayer && activePlayer.socketId === socketRef.current?.id);
  const isHost = !!(myPlayer && roomHostId === socketRef.current?.id);

  // 6. FINISHED GAME SCREEN (Now handled via overlay VictoryModal)


  // 7. MAIN GAME BOARD SCREEN
  return (
    <div className="h-screen bg-slate-950 p-0 flex items-center justify-center overflow-hidden">
      {/* 80:20 Main Layout Container */}
      <div className="flex flex-col lg:flex-row justify-center items-stretch w-full h-full">
        {/* Board Container — takes all remaining space to maximize board size */}
        <div className="flex-1 flex justify-center items-center h-full bg-slate-900/40">
          <div className="h-full max-h-full" style={{ aspectRatio: '4/3' }}>
            <Board board={activeState.board} players={activeState.players} />
          </div>
        </div>

        {/* Control & Dice & Leaderboard Panel (Fixed Width for perfect fit) */}
        <div className="w-full lg:w-[380px] flex-shrink-0 flex flex-col h-full p-3 sm:p-4">
          <PlayerPanel
            players={activeState.players}
            currentPlayerIndex={activeState.currentPlayerIndex}
            diceValue={activeState.diceValue}
            onRollDice={handleRollDice}
            phase={activeState.phase}
            message={activeState.message}
            onNextTurn={() => socketRef.current?.emit('next-turn', { lobbyId: currentLobbyId })}
            onPause={handlePause}
            isMyTurn={isMyTurn}
          />
        </div>
      </div>

      {/* Question Modal — shown when there's a question in 'question' or 'result' phase */}
      {activeState.currentQuestion &&
        (activeState.phase === 'question' || activeState.phase === 'result') && (
          <QuestionModal
            question={activeState.currentQuestion}
            selectedAnswer={activeState.selectedAnswer}
            onSelectAnswer={(index) => socketRef.current?.emit('select-answer', { lobbyId: currentLobbyId, index })}
            onSubmit={() => socketRef.current?.emit('submit-answer', { lobbyId: currentLobbyId })}
            answerCorrect={activeState.answerCorrect}
            consequence={activeState.consequence}
            onNext={() => socketRef.current?.emit('next-turn', { lobbyId: currentLobbyId })}
            showResult={activeState.phase === 'result'}
            isReadOnly={!isMyTurn}
          />
        )}

      {/* === PAUSE OVERLAY === */}
      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-menu">
            <h2>⏸ Game Paused</h2>

            <button className="pause-btn pause-btn-resume" onClick={handleResume}>
              ▶️ Resume Game
            </button>

            <button className="pause-btn pause-btn-sound" onClick={handleToggleMute}>
              {isMuted ? '🔇 Unmute Sound' : '🔊 Mute Sound'}
            </button>

            {/* Quick Win Button for testing (easy to remove, host only) */}
            {isHost && (
              <button
                className="pause-btn"
                style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
                onClick={() => {
                  socketRef.current?.emit('quick-win', { lobbyId: currentLobbyId });
                  setIsPaused(false);
                }}
              >
                ⚡️ Quick Win (Test)
              </button>
            )}

            {isHost ? (
              <button className="pause-btn pause-btn-quit" onClick={handleQuit}>
                🚪 Quit Game
              </button>
            ) : (
              <button
                className="pause-btn"
                style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                onClick={handleLeaveLobby}
              >
                🚪 Keluar Game
              </button>
            )}
          </div>
        </div>
      )}

      {/* === VICTORY MODAL === */}
      {activeState.phase === 'finished' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center border-4 border-yellow-400 max-h-[90vh] overflow-y-auto">
            <div className="text-6xl mb-3 animate-bounce">🏆</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-yellow-700 mb-1">
              Permainan Selesai!
            </h2>
            <p className="text-sm sm:text-base text-gray-700 mb-5 font-semibold">
              Selamat kepada juara kita,{" "}
              <span
                className="font-extrabold text-base sm:text-lg px-3 py-1 rounded-full bg-yellow-100 inline-block mr-1 animate-pulse"
                style={{ color: activeState.winner?.color }}
              >
                {activeState.winner?.name}
              </span>{" "}
              dengan skor tertinggi!
            </p>

            {/* Winner Board / Final Leaderboard */}
            <div className="mb-6 text-left bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">
                🏆 Papan Skor Akhir 🏆
              </h3>
              <div className="flex flex-col gap-2.5">
                {rankedPlayers.map((player, i) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl shadow-sm border border-gray-100/50"
                    style={{
                      borderLeft: i === 0 ? `6px solid ${player.color}` : `3px solid ${player.color}`,
                    }}
                  >
                    <span className="text-sm font-extrabold text-gray-400 w-6 text-center">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </span>
                    <img
                      src={PLAYER_PIONS[player.id % PLAYER_PIONS.length]}
                      alt={player.name}
                      className="w-7 h-7 object-contain"
                    />
                    <span className="text-xs sm:text-sm font-bold text-gray-700 flex-1 truncate font-sans">
                      {player.name}
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] sm:text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full font-sans">
                        ⭐ {player.score || 0} Pts
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 font-medium font-sans">
                        {player.isFinished ? `🏁 Selesai (Ke-${player.finishRank})` : `Kotak ${player.position - 1}`}
                      </span>
                      <span className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5 font-medium font-sans">
                        Benar: <span className="text-emerald-600 font-bold">{player.correctAnswers || 0}</span> • Salah: <span className="text-rose-500 font-bold">{player.wrongAnswers || 0}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isHost ? (
              <button
                onClick={handleQuit} // Host resets to setup screen/lobby room
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base transition-all shadow-lg transform active:scale-95 cursor-pointer font-sans"
              >
                Main Lagi 🔄
              </button>
            ) : (
              <div className="w-full py-3 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl font-bold text-xs text-center animate-pulse font-sans">
                ⏳ Menunggu Host mereset permainan...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

