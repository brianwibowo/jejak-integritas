'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import Board from './components/Board';
import PlayerPanel from './components/PlayerPanel';
import QuestionModal from './components/QuestionModal';
import DevBypass from './components/DevBypass';
import PortraitBlocker from './components/PortraitBlocker';
import { useDeviceTier } from './hooks/useDeviceTier';
import { generateBoard, getRandomQuestion } from './gameData';
import { playHomeLobbyMusic, stopHomeLobbyMusic, setHomeLobbyMusicMute, setHomeLobbyMusicVolume, playClickSound, setGlobalMuteState, playPopUpSound, playCorrectSound, playWrongSound, playMajuSound, playMundurSound, playWinSound, stopMajuSound, stopMundurSound } from './audioHelper';

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

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function GamePage() {
  const gameMode = 'online';
  const router = useRouter();
  const { tier, isPortrait, isMobile, isDesktop } = useDeviceTier();
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(1800); // default 30 mins

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

  // === TRANSITION CURTAIN STATE ===
  const [curtainActive, setCurtainActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurtainActive(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

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
    setGlobalMuteState(isMuted);
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

  // === SYNC BGM VOLUME WITH GAME STATUS ===
  useEffect(() => {
    const audio = bgMusicRef.current;
    if (!audio) return;

    if (isPaused) {
      audio.volume = 0.08;
    } else if (activeState && activeState.phase === 'finished') {
      audio.volume = 0.08; // Win screen volume
    } else if (activeState && activeState.phase === 'question') {
      audio.volume = 0.075; // Question screen volume (dikecilkan 70%)
    } else {
      audio.volume = 0.25; // Normal gameplay volume
    }
  }, [isPaused, activeState?.phase]);

  // === WINNING & SOUND EFFECT TRIGGERS ===
  useEffect(() => {
    if (!activeState) return;
    if (activeState.phase === 'finished' && activeState.winner) {
      playWinSound();
    }
  }, [activeState?.phase, activeState?.winner]);

  // === POPUP, CORRECT/WRONG ANSWER, AND WALK SOUND TRIGGERS ===
  const prevPhaseRef = useRef<string | null>(null);
  const prevQuestionTextRef = useRef<string | null>(null);
  const prevPlayersPositionsRef = useRef<Record<string, number>>({});
  const consequenceTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (!activeState) return;

    const currentPhase = activeState.phase;
    const prevPhase = prevPhaseRef.current;

    // 0. Stop walking/climbing/sliding SFX immediately when leaving walking or result phase, or entering rolling phase
    if (
      (prevPhase === 'walking' && currentPhase !== 'walking') ||
      (prevPhase === 'result' && currentPhase !== 'result') ||
      currentPhase === 'rolling'
    ) {
      if (consequenceTimeoutRef.current) {
        clearTimeout(consequenceTimeoutRef.current);
        consequenceTimeoutRef.current = null;
      }
      stopMajuSound();
      stopMundurSound();
    }

    // 1. Dim background music when entering pre_question/question/result flow
    if (
      (currentPhase === 'pre_question' || currentPhase === 'question' || currentPhase === 'result') &&
      prevPhase !== 'pre_question' && prevPhase !== 'question' && prevPhase !== 'result'
    ) {
      setHomeLobbyMusicVolume(0.3); // Reduce to 30% during Q&A flow
    }

    // Restore background music volume when leaving Q&A flow (entering rolling/walking)
    if (
      (prevPhase === 'pre_question' || prevPhase === 'question' || prevPhase === 'result') &&
      currentPhase !== 'pre_question' && currentPhase !== 'question' && currentPhase !== 'result'
    ) {
      setHomeLobbyMusicVolume(1.0); // Restore to 100%
    }

    // 2. Pop Up Pertanyaan SFX
    if (
      currentPhase === 'question' &&
      activeState.currentQuestion &&
      (prevPhase !== 'question' || prevQuestionTextRef.current !== activeState.currentQuestion.question)
    ) {
      playPopUpSound();
    }

    // 3. Jawaban Benar / Salah SFX
    if (currentPhase === 'result' && prevPhase !== 'result') {
      if (activeState.answerCorrect === true) {
        playCorrectSound();
      } else if (activeState.answerCorrect === false) {
        playWrongSound();
      }
    }

    // 4. Mundur/Maju SFX for snake/ladder consequence (stop after 1.5 seconds so it doesn't loop/play to end)
    if (currentPhase === 'result' && prevPhase !== 'result' && activeState.consequence) {
      if (consequenceTimeoutRef.current) {
        clearTimeout(consequenceTimeoutRef.current);
      }
      if (activeState.consequence.includes('🐍')) {
        playMundurSound();
        consequenceTimeoutRef.current = setTimeout(() => {
          stopMundurSound();
        }, 1500);
      } else if (activeState.consequence.includes('🪜')) {
        playMajuSound();
        consequenceTimeoutRef.current = setTimeout(() => {
          stopMajuSound();
        }, 1500);
      }
    }

    // Update refs for phase and question
    prevPhaseRef.current = currentPhase;
    if (activeState.currentQuestion) {
      prevQuestionTextRef.current = activeState.currentQuestion.question;
    } else {
      prevQuestionTextRef.current = null;
    }

    return () => {
      if (consequenceTimeoutRef.current) {
        clearTimeout(consequenceTimeoutRef.current);
      }
    };
  }, [activeState?.phase, activeState?.currentQuestion, activeState?.answerCorrect]);

  // === PER-STEP WALKING SFX (plays once per box, no overlap) ===
  useEffect(() => {
    if (!activeState || !activeState.players) return;

    const phase = activeState.phase;

    activeState.players.forEach((player: any) => {
      const prevPos = prevPlayersPositionsRef.current[player.socketId];
      if (prevPos !== undefined && phase === 'walking') {
        if (player.position > prevPos) {
          playMajuSound();
        } else if (player.position < prevPos) {
          playMundurSound();
        }
      }
      prevPlayersPositionsRef.current[player.socketId] = player.position;
    });
  }, [activeState?.players, activeState?.phase]);

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
      router.push('/');
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

  // Re-associate socket on reconnection
  useEffect(() => {
    if (socketConnected && socketRef.current && currentLobbyId && myPlayer && myPlayer.socketId !== socketRef.current.id) {
      socketRef.current.emit('reassociate-socket', {
        lobbyId: currentLobbyId,
        playerName: myPlayer.name
      });
    }
  }, [socketConnected, currentLobbyId, myPlayer]);

  // === INTERCEPT BROWSER NAVIGATION / BACK BUTTON ===
  useEffect(() => {
    const isGameActive = onlineGameState && onlineGameState.phase !== 'setup' && onlineGameState.phase !== 'finished';
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isGameActive) {
        e.preventDefault();
        e.returnValue = 'Apakah Anda yakin ingin keluar dari permainan?';
        return e.returnValue;
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (isGameActive) {
        window.history.pushState(null, '', window.location.href);
        setIsPaused(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    if (isGameActive) {
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onlineGameState?.phase]);
  // === LOADING SCREEN FOR NON-HOST (GAME START SYNC) ===
  useEffect(() => {
    if (onlineGameState) {
      if (onlineGameState.phase !== 'setup' && onlineGameState.phase !== 'finished') {
        const sessionKey = `loading_started_${onlineGameState.lobbyId || currentLobbyId}`;
        if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionKey)) {
          sessionStorage.setItem(sessionKey, 'true');
          if (loadingProgress === null) {
            setLoadingProgress(0);
          }
        }
      } else if (onlineGameState.phase === 'setup') {
        // Clear session key in lobby/setup, allowing loading triggers for next game starts
        const sessionKey = `loading_started_${onlineGameState.lobbyId || currentLobbyId}`;
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(sessionKey);
        }
      }
    } else {
      if (typeof window !== 'undefined' && currentLobbyId) {
        sessionStorage.removeItem(`loading_started_${currentLobbyId}`);
      }
    }
  }, [onlineGameState?.phase, onlineGameState?.lobbyId, currentLobbyId, loadingProgress]);

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
          const next = prev + Math.floor(Math.random() * 4) + 2; // +2% to +5% per step
          return next > 100 ? 100 : next;
        });
      }, 100 + Math.random() * 100); // 100ms - 200ms
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setLoadingProgress(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loadingProgress, isMuted]);  // === ANIMATION TIMEOUT: ONLINE WALKING (Active Player Only) ===
  useEffect(() => {
    if (!onlineGameState || onlineGameState.phase !== 'walking' || onlineGameState.targetPosition === null) return;
    if (isPaused) return;

    const currentPlayer = onlineGameState.players[onlineGameState.currentPlayerIndex];
    if (!currentPlayer) return;

    const isMyTurn = !!(myPlayer && currentPlayer.socketId && currentPlayer.socketId === myPlayer.socketId);
    const isFakePlayer = !!(currentPlayer.socketId && currentPlayer.socketId.startsWith('fake-'));
    const isHost = !!(myPlayer && roomHostId && myPlayer.socketId && roomHostId === myPlayer.socketId);
    const isDriver = isMyTurn || (isFakePlayer && isHost);
    if (!isDriver) return;

    const timeoutId = setTimeout(() => {
      const walkPath = onlineGameState.walkPath || [];
      if (walkPath.length > 0) {
        socketRef.current?.emit('walk-step', { lobbyId: currentLobbyId });
      } else {
        socketRef.current?.emit('finish-walk', { lobbyId: currentLobbyId });
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [onlineGameState?.phase, onlineGameState?.walkPath, onlineGameState?.players, onlineGameState?.currentPlayerIndex, myPlayer, currentLobbyId, roomHostId, isPaused]);

  // === DELAY: ONLINE PRE-QUESTION (Active Player Selects Question) ===
  useEffect(() => {
    if (!onlineGameState || onlineGameState.phase !== 'pre_question') return;
    if (isPaused) return;

    const currentPlayer = onlineGameState.players[onlineGameState.currentPlayerIndex];
    if (!currentPlayer) return;

    const isMyTurn = !!(myPlayer && currentPlayer.socketId && currentPlayer.socketId === myPlayer.socketId);
    const isFakePlayer = !!(currentPlayer.socketId && currentPlayer.socketId.startsWith('fake-'));
    const isHost = !!(myPlayer && roomHostId && myPlayer.socketId && roomHostId === myPlayer.socketId);
    const isDriver = isMyTurn || (isFakePlayer && isHost);
    if (!isDriver) return;

    const currentPos = currentPlayer.position;
    let targetBoxType: 'biru' | 'merah' | 'kuning' | 'hijau' | 'ungu' = 'biru';
    if (currentPos <= 10) {
      targetBoxType = 'biru';      // 1-10 (Row 5)
    } else if (currentPos <= 20) {
      targetBoxType = 'merah';     // 11-20 (Row 4)
    } else if (currentPos <= 30) {
      targetBoxType = 'kuning';    // 21-30 (Row 3)
    } else if (currentPos <= 40) {
      targetBoxType = 'hijau';     // 31-40 (Row 2)
    } else {
      targetBoxType = 'ungu';      // 41-50 (Row 1)
    }

    const timeoutId = setTimeout(() => {
      const question = getRandomQuestion(targetBoxType, onlineGameState.usedQuestionIds);
      socketRef.current?.emit('trigger-question', { lobbyId: currentLobbyId, question });
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [onlineGameState?.phase, onlineGameState?.currentPlayerIndex, myPlayer, currentLobbyId, roomHostId, isPaused]);

  // === ROLL DICE HANDLER ===
  const handleRollDice = useCallback(() => {
    if (!activeState || activeState.phase !== 'rolling') return;
    if (isPaused) return;

    // Cut off any previous climb/slide sound immediately
    stopMajuSound();
    stopMundurSound();

    // Play sound locally
    if (!isRollPlayingRef.current && rollSoundRef.current && !isMuted) {
      isRollPlayingRef.current = true;
      const audio = rollSoundRef.current;
      audio.currentTime = 0;
      audio.play().catch(() => { });
      audio.onended = () => {
        isRollPlayingRef.current = false;
      };
    }

    socketRef.current?.emit('roll-dice', { lobbyId: currentLobbyId });
  }, [activeState?.phase, isMuted, currentLobbyId, isPaused]);

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
    router.push('/');
  }, [currentLobbyId, router]);

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
    const wasPlaying = onlineGameState !== null;
    setCurrentLobbyId(null);
    setMyPlayer(null);
    setOnlineGameState(null);
    if (wasPlaying) {
      router.push('/');
    }
  };

  const handleStartOnlineGame = () => {
    if (roomPlayers.length < 2) {
      alert('Butuh minimal 2 pemain untuk memulai permainan!');
      return;
    }
    // Generate deterministic board colors
    const colorsList = generateBoard();
    setLoadingProgress(0);
    socketRef.current?.emit('start-game', { 
      lobbyId: currentLobbyId, 
      boardColors: colorsList,
      duration: selectedDuration 
    });
  };

  const handleSelectColor = (color: string) => {
    socketRef.current?.emit('select-color', { lobbyId: currentLobbyId, color });
  };

  const isColorTaken = (color: string) => {
    return roomPlayers.some(p => p.socketId !== myPlayer?.socketId && p.color === color);
  };

  const myCurrentColor = roomPlayers.find(p => p.socketId === myPlayer?.socketId)?.color;

  const handleRenameLobby = () => {
    const trimmed = lobbyNameInput.trim();
    if (!trimmed) return;
    socketRef.current?.emit('rename-lobby', { lobbyId: currentLobbyId, name: trimmed });
  };

  const handleKickPlayer = (targetSocketId: string, playerName: string) => {
    if (typeof window !== 'undefined' && window.confirm(`Apakah Anda yakin ingin mengeluarkan ${playerName} dari lobby?`)) {
      socketRef.current?.emit('kick-player', { lobbyId: currentLobbyId, targetSocketId });
    }
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
      <>
        {/* TRANSITION CURTAIN */}
        <div
          className="fixed inset-0 z-50 pointer-events-none bg-neutral-900/95 transition-transform duration-500 ease-in-out flex flex-col items-center justify-center p-8 gap-8"
          style={{
            transform: curtainActive ? 'translateX(0%)' : 'translateX(100%)',
            pointerEvents: curtainActive ? 'auto' : 'none',
          }}
        >
          <div className="text-center animate-pulse flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/20 animate-spin">
              🎲
            </div>
            <h2 className="text-xl font-black text-white tracking-widest mt-2 uppercase">
              MEMUAT PERMAINAN...
            </h2>
          </div>
        </div>

        <div
          className="flex flex-col items-center justify-center min-h-screen p-6 font-sans relative overflow-hidden bg-slate-100"
          style={{
            backgroundImage: "url('/belajar.webp')",
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
                        <span>{lobby.playerCount}/4 Pemain</span>
                        <span>•</span>
                        <span className={isPlaying ? 'text-indigo-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>
                          {isPlaying ? 'Sedang bermain 🎮' : 'Menunggu ⏳'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleJoinLobby(lobby.id)}
                      disabled={!canJoin}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${canJoin
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
      </>
    );
  }

  // 3. ONLINE LOBBY ROOM WAITING UI
  if (gameMode === 'online' && currentLobbyId !== null && onlineGameState === null) {
    const isHost = !!(myPlayer && roomHostId && myPlayer.socketId && roomHostId === myPlayer.socketId);

    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen p-6 font-sans relative overflow-hidden bg-slate-100"
        style={{
          backgroundImage: "url('/menanam tanaman.webp')",
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
              {currentRoomName || `Lobby ${currentLobbyId}`}
            </h2>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 inline-block">
              Lobby {currentLobbyId} • Menunggu Pemain Lain
            </span>
          </div>

          {/* Players list */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex justify-between items-center mb-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest text-left">
                Pemain Tergabung ({roomPlayers.length}/4)
              </div>
              {isHost && (
                <DevBypass socket={socketRef.current} lobbyId={currentLobbyId} />
              )}
            </div>

            {Array.from({ length: 4 }).map((_, i) => {
              const player = roomPlayers[i];
              if (player) {
                const isMe = !!(myPlayer && player.socketId === myPlayer.socketId);
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
                        Host
                      </span>
                    )}
                    {showKickButton && (
                      <button
                        onClick={() => handleKickPlayer(player.socketId, player.name)}
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
                    className={`relative p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${isMine
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
              <>
                <div className="mb-4 text-left">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    ⏱️ Durasi Waktu Permainan
                  </label>
                  <select
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/70 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm text-slate-800 focus:outline-none transition-colors font-semibold shadow-sm cursor-pointer"
                  >
                    <option value={600}>10 Menit</option>
                    <option value={1200}>20 Menit</option>
                    <option value={1800}>30 Menit (Bawaan)</option>
                    <option value={2400}>40 Menit</option>
                    <option value={3000}>50 Menit</option>
                    <option value={3600}>60 Menit</option>
                  </select>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleStartOnlineGame}
                    disabled={roomPlayers.length < 2}
                    className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer shadow-indigo-600/10"
                  >
                    Mulai Permainan 🎮
                  </button>
                  <button
                    onClick={handleLeaveLobby}
                    className="flex-1 py-3.5 bg-white border border-slate-200 hover:bg-rose-50/50 text-rose-500 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                  >
                    Keluar Lobby
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-3">
                <div className="flex-1 py-3.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl font-bold text-xs flex items-center justify-center text-center animate-pulse">
                  ⏳ Menunggu Host...
                </div>
                <button
                  onClick={handleLeaveLobby}
                  className="flex-1 py-3.5 bg-white border border-slate-200 hover:bg-rose-50/50 text-rose-500 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  Keluar Lobby
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }


  // Setup loading resources for preloading overlay
  const loadingImages = [
    { src: '/background_home_resmi.webp', label: 'Jejak Integritas' },
    { src: '/belajar.webp', label: 'Edukasi Karakter' },
    { src: '/menanam tanaman.webp', label: 'Aksi Nyata' },
    { src: '/background_orang.webp', label: 'Sosial & Moral' }
  ];

  const activeImageIndex = loadingProgress !== null ? Math.min(
    Math.floor((loadingProgress / 100) * loadingImages.length),
    loadingImages.length - 1
  ) : 0;
  const currentImg = loadingImages[activeImageIndex];

  let loadingText = 'Mempersiapkan papan permainan...';
  if (loadingProgress !== null) {
    if (loadingProgress > 75) {
      loadingText = 'Menyiapkan kartu pertanyaan & dadu...';
    } else if (loadingProgress > 50) {
      loadingText = 'Menyusun nilai-nilai integritas...';
    } else if (loadingProgress > 25) {
      loadingText = 'Memuat model dan aset permainan...';
    }
  }

  // Check state consistency for game rendering
  if (!activeState || activeState.phase === 'setup') {
    return null;
  }

  const rankedPlayers = [...activeState.players].sort((a, b) => {
    if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
    if ((b.correctAnswers || 0) !== (a.correctAnswers || 0)) return (b.correctAnswers || 0) - (a.correctAnswers || 0);
    return (b.position || 0) - (a.position || 0);
  });
  const activePlayer = activeState.players[activeState.currentPlayerIndex];
  const isMyTurn = !!(myPlayer && activePlayer && activePlayer.socketId && activePlayer.socketId === myPlayer.socketId);
  const isHost = !!(myPlayer && roomHostId && myPlayer.socketId && roomHostId === myPlayer.socketId);
  const isFakePlayer = !!(activePlayer && activePlayer.socketId && activePlayer.socketId.startsWith('fake-'));
  const isMyTurnOrDevDrive = isMyTurn || (isFakePlayer && isHost);

  // 6. FINISHED GAME SCREEN (Now handled via overlay VictoryModal)


  // 7. MAIN GAME BOARD SCREEN
  return (
    <div className="h-screen w-screen overflow-hidden relative select-none">
      {!socketConnected && (
        <div className="absolute top-4 right-4 z-[110] bg-rose-600/90 backdrop-blur-md border border-rose-500/30 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          <span className="text-xs font-black text-white uppercase tracking-wider font-sans">
            Menghubungkan Ulang...
          </span>
        </div>
      )}
      {/* === LAYER 0: Background fullscreen === */}
      <div
        className="w-full h-full relative"
        style={{
          backgroundImage: 'url(/BG_jejak_integritas.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* === LAYER 1: Board Area === */}
        <div 
          className="absolute top-0 h-full flex items-center justify-center" 
          style={{ 
            left: isMobile ? '0%' : '2%', 
            width: isMobile ? '100%' : '76%' 
          }}
        >
          {/* Sub-container papan — mempertahankan aspect ratio papan asli */}
          <div
            className="relative w-full h-full"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          >
            {/* Gambar papan transparan */}
            <img
              src="/papan_ular_jejak_integritas.webp"
              alt="Papan Ular Tangga"
              className="w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
            />

            {/* Pion pemain — koordinat relatif terhadap container papan ini */}
            <Board board={activeState.board} players={activeState.players} tier={tier} />
          </div>
        </div>

        {/* === LAYER 2: Scoreboard === */}
        {isMobile ? (
          <>
            {/* Mobile: Toggle button */}
            <button 
              className="scoreboard-toggle-btn"
              onClick={() => setShowScoreboard(!showScoreboard)}
            >
              {showScoreboard ? '✕' : '🏆'}
            </button>

            {/* Mobile: Scoreboard overlay */}
            {showScoreboard && (
              <>
                <div 
                  className="scoreboard-overlay-backdrop" 
                  onClick={() => setShowScoreboard(false)} 
                />
                <div className="scoreboard-overlay p-2">
                  <PlayerPanel
                    players={activeState.players}
                    currentPlayerIndex={activeState.currentPlayerIndex}
                    diceValue={activeState.diceValue}
                    onRollDice={handleRollDice}
                    phase={activeState.phase}
                    message={activeState.message}
                    onNextTurn={() => {
                      if (isPaused) return;
                      socketRef.current?.emit('next-turn', { lobbyId: currentLobbyId });
                    }}
                    onPause={handlePause}
                    isMyTurn={isMyTurnOrDevDrive && !isPaused}
                    tier={tier}
                  />
                </div>
              </>
            )}
          </>
        ) : (
          /* Desktop/Tablet: Side scoreboard */
          <div className="absolute right-0 top-0 w-[23%] h-full p-3 flex flex-col justify-center select-none">
            <PlayerPanel
              players={activeState.players}
              currentPlayerIndex={activeState.currentPlayerIndex}
              diceValue={activeState.diceValue}
              onRollDice={handleRollDice}
              phase={activeState.phase}
              message={activeState.message}
              onNextTurn={() => {
                if (isPaused) return;
                socketRef.current?.emit('next-turn', { lobbyId: currentLobbyId });
              }}
              onPause={handlePause}
              isMyTurn={isMyTurnOrDevDrive && !isPaused}
              tier={tier}
            />
          </div>
        )}
      </div>
      {/* Floating Game Timer */}
      {activeState.timeRemaining !== undefined && activeState.timeRemaining !== null && (
        <div className="absolute top-4 left-4 z-30 bg-black/60 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg select-none">
          <span className="text-base">⏱️</span>
          <span className="text-sm font-black text-white tabular-nums tracking-wide">
            SISA WAKTU: {formatTime(activeState.timeRemaining)}
          </span>
        </div>
      )}

      {/* Question Modal — shown when there's a question in 'question' or 'result' phase */}
      {activeState.currentQuestion &&
        (activeState.phase === 'question' || activeState.phase === 'result') &&
        !isPaused && (
          <QuestionModal
            question={activeState.currentQuestion}
            selectedAnswer={activeState.selectedAnswer}
            onSelectAnswer={(index) => socketRef.current?.emit('select-answer', { lobbyId: currentLobbyId, index })}
            onSubmit={() => socketRef.current?.emit('submit-answer', { lobbyId: currentLobbyId })}
            answerCorrect={activeState.answerCorrect}
            consequence={activeState.consequence}
            onNext={() => socketRef.current?.emit('next-turn', { lobbyId: currentLobbyId })}
            showResult={activeState.phase === 'result'}
            isReadOnly={!isMyTurnOrDevDrive}
            tier={tier}
            timeRemaining={activeState.questionTimeRemaining}
          />
        )}

      {/* === PAUSE OVERLAY === */}
      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-menu">
            <h2>⏸ Game Dihentikan</h2>

            <button className="pause-btn pause-btn-resume" onClick={handleResume}>
              ▶️ Lanjutkan Game
            </button>

            <button className="pause-btn pause-btn-sound" onClick={handleToggleMute}>
              {isMuted ? '🔇 Unmute Sound' : '🔊 Mute Sound'}
            </button>



            {isHost ? (
              <button className="pause-btn pause-btn-quit" onClick={handleQuit}>
                Keluar Game
              </button>
            ) : (
              <button
                className="pause-btn"
                style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                onClick={handleLeaveLobby}
              >
                Keluar Game
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
              Selamat kepada pemenang{" "}
              <span
                className="font-extrabold text-base sm:text-lg px-3 py-1 rounded-full bg-yellow-100 inline-block animate-pulse"
                style={{ color: activeState.winner?.color }}
              >
                {activeState.winner?.name}
              </span>
              !
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
                      <span className="text-xs sm:text-sm font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full font-sans">
                        ⭐ {player.score || 0} Pts
                      </span>
                      {player.isFinished && (
                        <span className="text-[10px] sm:text-[11px] text-amber-600 font-extrabold font-sans mt-0.5">
                          🏁 Finish Ke-{player.finishRank} (+{player.finishBonus || 0} Pts)
                        </span>
                      )}
                      <span className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 font-medium font-sans">
                        {player.position === 50 ? 'Selesai (FINISH)' : player.position === 0 ? 'Belum Mulai' : `Kotak ${player.position}`}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 font-medium font-sans">
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
                Kembali ke Lobby 🔄
              </button>
            ) : (
              <div className="w-full py-3 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl font-bold text-xs text-center animate-pulse font-sans">
                ⏳ Menunggu Host mereset permainan...
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. LOADING SCREEN OVERLAY (rendered as layered overlay) */}
      {loadingProgress !== null && (
        <div className="fixed inset-0 bg-neutral-950 text-white font-sans z-[100] select-none overflow-hidden animate-fade-in">
          {/* Full-screen Loading Artwork */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={currentImg.src}
              alt={currentImg.label}
              className="w-full h-full object-cover transition-all duration-700 ease-in-out"
              key={currentImg.src}
            />
            {/* Subtle bottom dark gradient to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          </div>

          {/* Bottom-Left Corner: Image / Concept Art Info */}
          <div className="absolute bottom-8 left-8 z-[101] flex flex-col gap-1 bg-black/60 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl">
            <span className="text-[10px] font-black text-emerald-450 uppercase tracking-widest">
              ASET PERMAINAN
            </span>
            <span className="text-base font-black text-white uppercase tracking-wider">
              {currentImg.label}
            </span>
          </div>

          {/* Bottom-Right Corner: Loading progress info & bar */}
          <div className="absolute bottom-8 right-8 z-[101] flex flex-col items-end gap-2 max-w-xs w-full animate-fade-in">
            {/* Status text and percentage count */}
            <div className="flex flex-col items-end text-right gap-1 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl w-full">
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider animate-pulse text-left pr-2 truncate">
                  {loadingText}
                </span>
                <span className="text-sm font-black text-emerald-400 tabular-nums ml-auto">
                  {loadingProgress}%
                </span>
              </div>
              {/* Progress bar container */}
              <div className="w-full bg-neutral-950 border border-white/5 rounded-full h-2.5 p-0.5 overflow-hidden shadow-inner relative mt-1">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 h-full rounded-full transition-all duration-150 ease-out shadow-lg relative"
                  style={{ width: `${loadingProgress}%` }}
                >
                  {/* Glowing tip */}
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full filter blur-sm animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === PORTRAIT BLOCKER === */}
      <PortraitBlocker isPortrait={isPortrait} isDesktop={isDesktop} />
    </div>
  );
}


