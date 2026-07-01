'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { questions, generateBoard, boxTypeInfo, themeLabels, ColoredBoxType, Question } from '../game/gameData';
import { playClickSound, playCorrectSound, playWrongSound } from '../game/audioHelper';

const optionLabels = ['A', 'B', 'C', 'D'];

function ScanContent() {
  const searchParams = useSearchParams();
  const tParam = searchParams.get('t');
  const tileNumber = tParam ? parseInt(tParam, 10) : null;

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validate tile number and select a random question on mount
  useEffect(() => {
    if (tileNumber === null || isNaN(tileNumber)) {
      setErrorMessage('Nomor petak tidak ditemukan. Silakan pindai QR Code yang valid di papan permainan.');
      return;
    }

    if (tileNumber < 1 || tileNumber > 50) {
      setErrorMessage(`Nomor petak ${tileNumber} tidak valid. Nomor petak harus di antara 1 dan 50.`);
      return;
    }

    // Tile 50 is the finish square and has no question
    if (tileNumber === 50) {
      return;
    }

    const board = generateBoard(42);
    const boxType = board[tileNumber - 1] as ColoredBoxType;

    // Load used questions history from localStorage
    let storedUsed: number[] = [];
    const stored = localStorage.getItem('physical_used_questions');
    if (stored) {
      try {
        storedUsed = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse used questions history', e);
      }
    }

    // Filter questions of this category that haven't been used yet
    const available = questions.filter(
      (q) => q.boxType === boxType && !storedUsed.includes(q.id)
    );

    let selected: Question | null = null;
    if (available.length > 0) {
      selected = available[Math.floor(Math.random() * available.length)];
    } else {
      // Fallback: if all questions of this type have been answered, reset history for this category or allow repeat
      const allOfType = questions.filter((q) => q.boxType === boxType);
      if (allOfType.length > 0) {
        selected = allOfType[Math.floor(Math.random() * allOfType.length)];
      }
    }

    if (selected) {
      setCurrentQuestion(selected);
      // Save the picked question ID to history immediately to prevent duplicates on refresh
      const nextUsed = [...storedUsed, selected.id];
      localStorage.setItem('physical_used_questions', JSON.stringify(nextUsed));
    } else {
      setErrorMessage(`Tidak ada pertanyaan untuk kategori kotak: ${boxType}`);
    }
  }, [tileNumber]);

  // Answer handler
  const handleSelectAnswer = (index: number) => {
    if (showResult || !currentQuestion) return;
    
    setSelectedAnswer(index);
    const correct = index === currentQuestion.answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
  };

  // Render error screen
  if (errorMessage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-center font-sans">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full border border-slate-200">
          <span className="text-5xl mb-4 block">⚠️</span>
          <h1 className="text-xl font-black text-slate-800 mb-2">Terjadi Kesalahan</h1>
          <p className="text-slate-550 font-medium text-sm leading-relaxed">{errorMessage}</p>
        </div>
      </div>
    );
  }

  // Render petak 50 (Finish) screen
  if (tileNumber === 50) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-center font-sans">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full border-4 border-yellow-400">
          <span className="text-6xl mb-4 block animate-bounce">🏆</span>
          <h1 className="text-2xl font-black text-yellow-700 mb-2">Petak FINISH!</h1>
          <p className="text-slate-650 font-medium text-sm leading-relaxed">
            Selamat! Bidak Anda telah mencapai petak ke-50 (garis akhir) papan **Jejak Integritas**. Anda memenangkan permainan!
          </p>
        </div>
      </div>
    );
  }

  // Render loading screen
  if (!currentQuestion && !isDone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-center font-sans">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-slate-200 animate-spin" />
          <p className="text-slate-550 font-bold text-sm">Memuat Pertanyaan...</p>
        </div>
      </div>
    );
  }

  // Render done screen (after answering and clicking "Selesai")
  if (isDone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-center font-sans">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full border border-slate-150 animate-fade-in">
          <span className="text-5xl mb-4 block">✅</span>
          <h1 className="text-xl font-black text-slate-800 mb-2">Jawaban Tersimpan</h1>
          <p className="text-slate-550 font-semibold text-sm leading-relaxed mb-6">
            Pertanyaan selesai dijawab. Silakan ikuti aturan papan permainan (maju/mundur jika ada ular/tangga).
          </p>
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs font-bold text-indigo-700">
            👉 Serahkan handphone kepada pemain berikutnya!
          </div>
        </div>
      </div>
    );
  }

  // Render question card
  if (!currentQuestion) return null;

  const info = boxTypeInfo[currentQuestion.boxType];
  const themeName = themeLabels[currentQuestion.theme];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100 font-sans">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-lg w-full border border-slate-150 flex flex-col animate-fade-in">
        
        {/* Header */}
        <div
          className="text-white px-5 py-4 text-center flex-shrink-0"
          style={{ backgroundColor: info.color }}
        >
          <div className="font-black text-xs uppercase tracking-widest opacity-75 mb-0.5">
            Petak {tileNumber}
          </div>
          <div className="font-extrabold text-base">{info.label}</div>
          <div className="text-xs opacity-90 font-medium">Tema: {themeName}</div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Question Text */}
            <p className="text-slate-800 text-sm sm:text-base mb-5 leading-relaxed font-bold whitespace-pre-line text-left">
              {currentQuestion.question}
            </p>

            {/* Multiple Choice Options */}
            <div className="flex flex-col gap-3 mb-6">
              {currentQuestion.options.map((option, i) => {
                let borderColor = '#E2E8F0'; // border-slate-200
                let bgColor = 'transparent';
                let textColor = '#1E293B'; // text-slate-800

                if (showResult) {
                  if (i === currentQuestion.answer) {
                    borderColor = '#22C55E'; // green-500
                    bgColor = '#F0FDF4'; // green-50
                    textColor = '#15803D'; // green-700
                  } else if (i === selectedAnswer && !isCorrect) {
                    borderColor = '#EF4444'; // red-500
                    bgColor = '#FEF2F2'; // red-50
                    textColor = '#B91C1C'; // red-700
                  } else {
                    textColor = '#94A3B8'; // text-slate-400 (disabled/dimmed)
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={showResult}
                    onClick={() => {
                      playClickSound();
                      handleSelectAnswer(i);
                    }}
                    className="text-left px-4 py-3.5 rounded-2xl transition-all text-sm font-semibold border-2 cursor-pointer outline-none focus:outline-none"
                    style={{
                      borderColor: borderColor,
                      backgroundColor: bgColor,
                      color: textColor,
                    }}
                  >
                    <span className="font-extrabold mr-2 opacity-60">
                      {optionLabels[i]}.
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Answer Feedback / Explanation */}
          {showResult && (
            <div className="mt-2 border-t border-slate-100 pt-5 flex flex-col gap-4 animate-slide-up">
              {/* Correct/Incorrect Badge */}
              <div
                className="p-3.5 rounded-2xl text-sm font-extrabold text-center border"
                style={{
                  backgroundColor: isCorrect ? '#F0FDF4' : '#FEF2F2',
                  color: isCorrect ? '#166534' : '#991B1B',
                  borderColor: isCorrect ? '#BBF7D0' : '#FECACA',
                }}
              >
                {isCorrect ? '🎉 Jawaban Anda Benar!' : '❌ Jawaban Kurang Tepat'}
              </div>

              {/* Explanation Box */}
              <div className="bg-blue-50/70 rounded-2xl border border-blue-100 p-4 text-left shadow-inner">
                <div className="text-xs font-black text-blue-800 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  💡 Pembahasan Lengkap
                </div>
                <p className="text-xs sm:text-sm text-blue-950 leading-relaxed font-semibold whitespace-pre-line">
                  {currentQuestion.explanation}
                </p>
              </div>

              {/* Selesai Button */}
              <button
                onClick={() => {
                  playClickSound();
                  setIsDone(true);
                }}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Selesai & Lanjut Giliran
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-center font-sans">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-slate-200 animate-spin" />
          <p className="text-slate-550 font-bold text-sm">Mempersiapkan Halaman...</p>
        </div>
      </div>
    }>
      <ScanContent />
    </Suspense>
  );
}
