'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import { useGameState } from './gameLogic';
import Board from './components/Board';
import PlayerPanel from './components/PlayerPanel';
import QuestionModal from './components/QuestionModal';
import SetupScreen from './components/SetupScreen';
import { generateBoard, getRandomQuestion } from './gameData';

const PLAYER_PIONS = [
  '/red.png',
  '/blue.png',
  '/green.png',
  '/black.png',
];

const getBackendUrl = () => {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) return process.env.NEXT_PUBLIC_BACKEND_URL;
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return 'http://localhost:5000';
};

export default function GamePage() {
  // === DUAL MODE STATE ===
  const [gameMode, setGameMode] = useState<'select' | 'offline' | 'online'>('select');

  // === OFFLINE STATE & ACTIONS ===
  const { state: localState, actions: localActions } = useGameState();

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
  const activeState = gameMode === 'online' ? onlineGameState : localState;

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
  }, [isMuted]);

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

    socket.on('lobby-update', ({ players, hostId, status }) => {
      setRoomPlayers(players);
      setRoomHostId(hostId);
      setOnlineLobbyStatus(status);
      if (status === 'waiting') {
        setOnlineGameState(null);
      }
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

  // Handle mode switches
  const handleSelectOffline = () => {
    setGameMode('offline');
  };

  const handleSelectOnline = () => {
    setGameMode('online');
    connectSocket();
  };

  const handleBackToSelect = () => {
    setGameMode('select');
    disconnectSocket();
  };

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

  // === ANIMATION TIMEOUT: OFFLINE WALKING ===
  useEffect(() => {
    if (gameMode !== 'offline') return;
    if (localState.phase !== 'walking' || localState.targetPosition === null) return;

    const currentPlayer = localState.players[localState.currentPlayerIndex];
    if (!currentPlayer) return;

    const targetPos = localState.targetPosition;

    const timeoutId = setTimeout(() => {
      if (currentPlayer.position < targetPos) {
        localActions.walkStep();
      } else {
        localActions.finishWalk();
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [gameMode, localState.phase, localState.targetPosition, localState.players, localState.currentPlayerIndex, localActions]);

  // === ANIMATION TIMEOUT: ONLINE WALKING (Active Player Only) ===
  useEffect(() => {
    if (gameMode !== 'online' || !onlineGameState || onlineGameState.phase !== 'walking' || onlineGameState.targetPosition === null) return;

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
  }, [gameMode, onlineGameState?.phase, onlineGameState?.targetPosition, onlineGameState?.players, onlineGameState?.currentPlayerIndex, myPlayer, currentLobbyId]);

  // === DELAY: OFFLINE PRE-QUESTION ===
  useEffect(() => {
    if (gameMode !== 'offline') return;
    if (localState.phase !== 'pre_question') return;

    const timeoutId = setTimeout(() => {
      localActions.showQuestion();
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [gameMode, localState.phase, localActions]);

  // === DELAY: ONLINE PRE-QUESTION (Active Player Selects Question) ===
  useEffect(() => {
    if (gameMode !== 'online' || !onlineGameState || onlineGameState.phase !== 'pre_question') return;

    const currentPlayer = onlineGameState.players[onlineGameState.currentPlayerIndex];
    if (!currentPlayer) return;

    const isMyTurn = myPlayer && currentPlayer.socketId === socketRef.current?.id;
    if (!isMyTurn) return;

    const currentPos = currentPlayer.position;
    const boxType = onlineGameState.board[currentPos - 1];

    const timeoutId = setTimeout(() => {
      const question = getRandomQuestion(boxType, onlineGameState.usedQuestionIds);
      socketRef.current?.emit('trigger-question', { lobbyId: currentLobbyId, question });
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [gameMode, onlineGameState?.phase, onlineGameState?.currentPlayerIndex, myPlayer, currentLobbyId]);

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

    if (gameMode === 'offline') {
      localActions.rollDice();
    } else if (gameMode === 'online') {
      socketRef.current?.emit('roll-dice', { lobbyId: currentLobbyId });
    }
  }, [gameMode, activeState?.phase, localActions, isMuted, currentLobbyId]);

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

    if (gameMode === 'offline') {
      localActions.resetGame();
    } else if (gameMode === 'online') {
      socketRef.current?.emit('quit-game', { lobbyId: currentLobbyId });
    }
  }, [gameMode, localActions, currentLobbyId]);

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

  // ==========================================
  // UIs RENDER STATES
  // ==========================================

  // 1. MODE SELECTOR UI
  if (gameMode === 'select') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 font-sans relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="max-w-2xl w-full text-center z-10">
          <h2 className="text-3xl sm:text-4xl font-black mb-3 bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            PILIH MODE PERMAINAN
          </h2>
          <p className="text-sm text-slate-400 font-bold tracking-wider uppercase mb-12">
            Mulai Ular Tangga Jejak Integritas
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-left">
            {/* Card Offline */}
            <button
              onClick={handleSelectOffline}
              className="p-6 bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/40 rounded-3xl transition-all shadow-xl group hover:-translate-y-1 duration-200 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                👥
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Offline (1 Perangkat)</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Main bersama teman-teman bergantian secara manual pada satu layar komputer atau tablet yang sama.
              </p>
            </button>

            {/* Card Online */}
            <button
              onClick={handleSelectOnline}
              className="p-6 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/40 rounded-3xl transition-all shadow-xl group hover:-translate-y-1 duration-200 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                🌐
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Online (Multi-device)</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Bergabung ke lobby dan main dari HP/tablet masing-masing secara real-time. Maksimal 5 lobby room.
              </p>
            </button>
          </div>

          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-slate-900 border border-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-bold text-sm transition-all"
          >
            ← Kembali ke Menu Utama
          </Link>
        </div>
      </div>
    );
  }

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 font-sans relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-10 left-10 w-80 h-80 bg-indigo-900/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="max-w-xl w-full z-10 bg-slate-900 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-2xl font-black text-center text-indigo-400 mb-2 tracking-wide flex items-center justify-center gap-2">
            🌐 ONLINE LOBBIES
          </h2>
          <p className="text-xs text-center text-slate-500 font-bold uppercase tracking-widest mb-6">
            Pilih lobby untuk bermain
          </p>

          {/* Nickname input */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Nama Pemain
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 12))}
              placeholder="Masukkan Nickname..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-colors"
            />
            {nicknameError && (
              <p className="text-xs text-rose-500 font-semibold mt-1.5 flex items-center gap-1">
                ⚠️ {nicknameError}
              </p>
            )}
          </div>

          {/* Lobby List */}
          <div className="flex flex-col gap-3.5 mb-8">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
              Daftar Room (Maks. 5 Lobby)
            </div>
            
            {displayLobbies.map((lobby) => {
              const isFull = lobby.playerCount >= 4;
              const isPlaying = lobby.status === 'playing';
              const canJoin = !isFull && !isPlaying;

              return (
                <div
                  key={lobby.id}
                  className="flex justify-between items-center p-4 bg-slate-950 border border-slate-800/80 rounded-2xl hover:border-slate-800 transition-colors"
                >
                  <div>
                    <div className="font-extrabold text-sm text-slate-200">
                      {lobby.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 flex items-center gap-2">
                      <span>👥 {lobby.playerCount}/4 Pemain</span>
                      <span>•</span>
                      <span className={isPlaying ? 'text-indigo-400' : 'text-emerald-500'}>
                        {isPlaying ? 'Sedang bermain 🎮' : 'Menunggu ⏳'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinLobby(lobby.id)}
                    disabled={!canJoin}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      canJoin
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95 cursor-pointer'
                        : 'bg-slate-900 border border-slate-850 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {isPlaying ? 'Dalam Game' : isFull ? 'Penuh' : 'Gabung'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center border-t border-slate-800 pt-6">
            <button
              onClick={handleBackToSelect}
              className="text-xs font-bold text-slate-500 hover:text-white transition-colors"
            >
              ← Ganti Mode
            </button>
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 font-sans relative overflow-hidden">
        <div className="max-w-md w-full z-10 bg-slate-900 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-xl font-black text-center text-indigo-400 mb-2 tracking-wide">
            🚪 RUANG LOBBY {currentLobbyId}
          </h2>
          <p className="text-xs text-center text-slate-500 font-bold uppercase tracking-widest mb-6">
            Menunggu Pemain Lain
          </p>

          {/* Players list */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Pemain Tergabung ({roomPlayers.length}/4)
            </div>

            {Array.from({ length: 4 }).map((_, i) => {
              const player = roomPlayers[i];
              if (player) {
                const isMe = player.socketId === socketRef.current?.id;
                const isPlayerHost = player.socketId === roomHostId;

                return (
                  <div
                    key={player.socketId}
                    className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl"
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: player.color }}
                    />
                    <span className="text-sm font-bold text-slate-200 flex-1 truncate">
                      {player.name} {isMe && <span className="text-xs font-medium text-slate-500">(Anda)</span>}
                    </span>
                    {isPlayerHost && (
                      <span className="text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-900/60 px-2 py-0.5 rounded-md font-bold uppercase">
                        👑 Host
                      </span>
                    )}
                  </div>
                );
              } else {
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-slate-950/40 border border-slate-900/60 border-dashed rounded-xl"
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0" />
                    <span className="text-sm font-bold text-slate-600 animate-pulse flex-1">
                      Menunggu pemain...
                    </span>
                  </div>
                );
              }
            })}
          </div>

          {/* Action buttons */}
          <div className="space-y-4 border-t border-slate-800 pt-6">
            {isHost ? (
              <button
                onClick={handleStartOnlineGame}
                disabled={roomPlayers.length < 2}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
              >
                Mulai Permainan 🎮
              </button>
            ) : (
              <div className="w-full py-3 bg-slate-950 border border-slate-800/80 text-slate-500 rounded-xl font-bold text-xs text-center animate-pulse">
                ⏳ Menunggu Host memulai permainan...
              </div>
            )}

            <button
              onClick={handleLeaveLobby}
              className="w-full py-3 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-rose-500 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              🚪 Keluar Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. OFFLINE SETUP SCREEN
  if (gameMode === 'offline' && localState.phase === 'setup') {
    return <SetupScreen onStart={localActions.startGame} />;
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

  const rankedPlayers = [...activeState.players].sort((a, b) => b.position - a.position);
  const activePlayer = activeState.players[activeState.currentPlayerIndex];
  const isMyTurn = gameMode === 'offline' || (myPlayer && activePlayer && activePlayer.socketId === socketRef.current?.id);
  const isHost = gameMode === 'offline' || (myPlayer && roomHostId === socketRef.current?.id);

  // 6. FINISHED GAME SCREEN
  if (activeState.phase === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-yellow-50 to-yellow-100 font-sans">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-4 border-yellow-400">
          <div className="text-7xl mb-4 animate-bounce">🏆</div>
          <h2 className="text-3xl font-extrabold text-yellow-700 mb-2">
            Selamat!
          </h2>
          <p className="text-lg text-gray-700 mb-6 font-semibold">
            <span
              className="font-extrabold text-xl px-3 py-1 rounded-full bg-yellow-100 inline-block mr-1"
              style={{ color: activeState.winner?.color }}
            >
              {activeState.winner?.name}
            </span>{' '}
            memenangkan permainan!
          </p>

          {/* Winner Board / Final Leaderboard */}
          <div className="mb-8 text-left bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">
              🏆 Papan Peringkat Kemenangan 🏆
            </h3>
            <div className="flex flex-col gap-3">
              {rankedPlayers.map((player, i) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100/50"
                  style={{
                    borderLeft: i === 0 ? `6px solid ${player.color}` : `3px solid ${player.color}`,
                  }}
                >
                  <span className="text-base font-extrabold text-gray-400 w-8 text-center">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <img
                    src={PLAYER_PIONS[player.id % PLAYER_PIONS.length]}
                    alt={player.name}
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-sm font-bold text-gray-700 flex-1 truncate">
                    {player.name}
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-0.5 rounded-full">
                      Kotak {player.position}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
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
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg transform active:scale-95 cursor-pointer"
            >
              Main Lagi 🔄
            </button>
          ) : (
            <div className="w-full py-3 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl font-bold text-xs text-center animate-pulse">
              ⏳ Menunggu Host mereset permainan...
            </div>
          )}
        </div>
      </div>
    );
  }

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
            onNextTurn={
              gameMode === 'offline'
                ? localActions.nextTurn
                : () => socketRef.current?.emit('next-turn', { lobbyId: currentLobbyId })
            }
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
            onSelectAnswer={
              gameMode === 'offline'
                ? localActions.selectAnswer
                : (index) => socketRef.current?.emit('select-answer', { lobbyId: currentLobbyId, index })
            }
            onSubmit={
              gameMode === 'offline'
                ? localActions.submitAnswer
                : () => socketRef.current?.emit('submit-answer', { lobbyId: currentLobbyId })
            }
            answerCorrect={activeState.answerCorrect}
            consequence={activeState.consequence}
            onNext={
              gameMode === 'offline'
                ? localActions.nextTurn
                : () => socketRef.current?.emit('next-turn', { lobbyId: currentLobbyId })
            }
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
                  if (gameMode === 'offline') {
                    localActions.quickWin();
                  } else if (gameMode === 'online') {
                    socketRef.current?.emit('quick-win', { lobbyId: currentLobbyId });
                  }
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
    </div>
  );
}
