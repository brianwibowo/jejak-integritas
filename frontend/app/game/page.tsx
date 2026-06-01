'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameState } from './gameLogic';
import Board from './components/Board';
import PlayerPanel from './components/PlayerPanel';
import QuestionModal from './components/QuestionModal';
import SetupScreen from './components/SetupScreen';

const PLAYER_PIONS = [
  '/red.png',
  '/blue.png',
  '/green.png',
  '/black.png',
];

export default function GamePage() {
  const { state, actions } = useGameState();

  // === AUDIO REFS (reuse instances, prevent multiple plays) ===
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const rollSoundRef = useRef<HTMLAudioElement | null>(null);
  const isRollPlayingRef = useRef(false);

  // === UI STATE ===
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<number | null>(null);

  // === BACKGROUND MUSIC INTEGRATION ===
  useEffect(() => {
    const audio = new Audio('/backsound-game.mp3');
    audio.loop = true;
    audio.volume = 0.25;
    bgMusicRef.current = audio;

    // Pre-load roll sound
    const rollAudio = new Audio('/roll.mp3');
    rollAudio.volume = 0.6;
    rollSoundRef.current = rollAudio;

    return () => {
      audio.pause();
    };
  }, []);

  // === LOADING / RENDER TRANSITION ===
  useEffect(() => {
    if (loadingProgress === null) return;

    // Play music when loading screen begins (guarantees interaction bypass)
    if (loadingProgress === 0 && bgMusicRef.current && !isMuted) {
      bgMusicRef.current.play().catch((err) => {
        console.log("Autoplay blocked or audio error:", err);
      });
    }

    if (loadingProgress < 100) {
      const timer = setTimeout(() => {
        setLoadingProgress((prev) => {
          if (prev === null) return null;
          const next = prev + Math.floor(Math.random() * 8) + 4; // increment randomly
          return next > 100 ? 100 : next;
        });
      }, 70 + Math.random() * 70); // realistic variable speed loading
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setLoadingProgress(null);
      }, 500); // sweet spot pause for polish
      return () => clearTimeout(timer);
    }
  }, [loadingProgress, isMuted]);

  // === SYNC MUTE STATE WITH AUDIO ===
  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // === WINNING & SOUND EFFECT TRIGGERS ===
  useEffect(() => {
    if (state.phase === 'finished' && state.winner) {
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
  }, [state.phase, state.winner, isMuted]);

  // === STEP-BY-STEP WALKING ANIMATION (slower: 800ms per step) ===
  useEffect(() => {
    if (state.phase !== 'walking' || state.targetPosition === null) return;

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer) return;

    const targetPos = state.targetPosition;

    const timeoutId = setTimeout(() => {
      if (currentPlayer.position < targetPos) {
        actions.walkStep();
      } else {
        actions.finishWalk();
      }
    }, 800); // 800ms per step — slower, more visible walk

    return () => clearTimeout(timeoutId);
  }, [state.phase, state.targetPosition, state.players, state.currentPlayerIndex, actions]);

  // === PRE-QUESTION DELAY (600ms buffer before question modal) ===
  useEffect(() => {
    if (state.phase !== 'pre_question') return;

    const timeoutId = setTimeout(() => {
      actions.showQuestion();
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [state.phase, actions]);

  // === DICE ROLL — single sound, no duplicates ===
  const handleRollDice = useCallback(() => {
    if (state.phase !== 'rolling') return;

    // Play roll sound only once
    if (!isRollPlayingRef.current && rollSoundRef.current && !isMuted) {
      isRollPlayingRef.current = true;
      const audio = rollSoundRef.current;
      audio.currentTime = 0;
      audio.play().catch(() => {});
      audio.onended = () => {
        isRollPlayingRef.current = false;
      };
    }

    actions.rollDice();
  }, [state.phase, actions, isMuted]);

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
    actions.resetGame();
  }, [actions]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // === SETUP PHASE ===
  const handleStartGame = useCallback((playerNames: string[]) => {
    setLoadingProgress(0);
    actions.startGame(playerNames);
  }, [actions]);

  if (state.phase === 'setup') {
    return <SetupScreen onStart={handleStartGame} />;
  }

  // === RENDER LOADING SCREEN OVERLAY ===
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

  // Sort players for leaderboard (rank by current position descending)
  const rankedPlayers = [...state.players].sort((a, b) => b.position - a.position);

  // === FINISHED PHASE ===
  if (state.phase === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-yellow-50 to-yellow-100">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-4 border-yellow-400">
          <div className="text-7xl mb-4 animate-bounce">🏆</div>
          <h2 className="text-3xl font-extrabold text-yellow-700 mb-2">
            Selamat!
          </h2>
          <p className="text-lg text-gray-700 mb-6 font-semibold">
            <span
              className="font-extrabold text-xl px-3 py-1 rounded-full bg-yellow-100 inline-block mr-1"
              style={{ color: state.winner?.color }}
            >
              {state.winner?.name}
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

          <button
            onClick={actions.resetGame}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg transform active:scale-95"
          >
            Main Lagi 🔄
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 p-0 flex items-center justify-center overflow-hidden">
      {/* 80:20 Main Layout Container */}
      <div className="flex flex-col lg:flex-row justify-center items-stretch w-full h-full">
        {/* Board Container — takes all remaining space to maximize board size */}
        <div className="flex-1 flex justify-center items-center h-full bg-slate-900/40">
          <div className="h-full max-h-full" style={{ aspectRatio: '4/3' }}>
            <Board board={state.board} players={state.players} />
          </div>
        </div>

        {/* Control & Dice & Leaderboard Panel (Fixed Width for perfect fit) */}
        <div className="w-full lg:w-[380px] flex-shrink-0 flex flex-col h-full p-3 sm:p-4">
          <PlayerPanel
            players={state.players}
            currentPlayerIndex={state.currentPlayerIndex}
            diceValue={state.diceValue}
            onRollDice={handleRollDice}
            phase={state.phase}
            message={state.message}
            onNextTurn={actions.nextTurn}
            onPause={handlePause}
          />
        </div>
      </div>

      {/* Question Modal — shown when there's a question in 'question' or 'result' phase */}
      {state.currentQuestion &&
        (state.phase === 'question' || state.phase === 'result') && (
          <QuestionModal
            question={state.currentQuestion}
            selectedAnswer={state.selectedAnswer}
            onSelectAnswer={actions.selectAnswer}
            onSubmit={actions.submitAnswer}
            answerCorrect={state.answerCorrect}
            consequence={state.consequence}
            onNext={actions.nextTurn}
            showResult={state.phase === 'result'}
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

            {/* Quick Win Button for testing (easy to remove) */}
            <button
              className="pause-btn"
              style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
              onClick={() => {
                actions.quickWin();
                setIsPaused(false);
              }}
            >
              ⚡️ Quick Win (Test)
            </button>

            <button className="pause-btn pause-btn-quit" onClick={handleQuit}>
              🚪 Quit Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
