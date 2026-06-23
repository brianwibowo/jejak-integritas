'use client';

import { Question, boxTypeInfo, ColoredBoxType, themeLabels } from '../gameData';
import { DeviceTier } from '../hooks/useDeviceTier';

interface QuestionModalProps {
  question: Question;
  selectedAnswer: number | null;
  onSelectAnswer: (index: number) => void;
  onSubmit: () => void;
  answerCorrect: boolean | null;
  consequence: string | null;
  onNext: () => void;
  showResult: boolean;
  isReadOnly?: boolean;
  tier?: DeviceTier;
  timeRemaining?: number | null;
}

const optionLabels = ['A', 'B', 'C', 'D'];

export default function QuestionModal({
  question,
  selectedAnswer,
  onSelectAnswer,
  onSubmit,
  answerCorrect,
  consequence,
  onNext,
  showResult,
  isReadOnly = false,
  tier = 'desktop',
  timeRemaining = null,
}: QuestionModalProps) {
  const info = boxTypeInfo[question.boxType as ColoredBoxType];
  const themeName = themeLabels[question.theme];
  const isMobile = tier === 'mobile';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div 
        className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${
          showResult 
            ? (isMobile ? 'max-w-[95vw] w-full max-h-[95vh]' : 'max-w-7xl w-[94vw] max-h-[92vh]')
            : (isMobile ? 'max-w-md w-[95vw] max-h-[95vh]' : 'max-w-4xl w-[92vw] max-h-[92vh]')
        }`}
      >
        {/* Header */}
        <div
          className={`text-white ${isMobile ? 'px-3 py-2' : 'px-5 py-3'} text-center flex-shrink-0`}
          style={{ backgroundColor: info.color }}
        >
          <div className={`font-bold ${isMobile ? 'text-sm' : 'text-base'}`}>{info.label}</div>
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} opacity-90`}>Tema: {themeName}</div>
        </div>

        {/* Time Remaining Progress Bar */}
        {timeRemaining !== undefined && timeRemaining !== null && !showResult && (
          <div className="w-full bg-slate-100 h-1.5 overflow-hidden relative flex-shrink-0">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                timeRemaining <= 5 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
              }`}
              style={{ width: `${(timeRemaining / 30) * 100}%` }}
            />
          </div>
        )}

        {/* Content Area */}
        <div className={`overflow-y-auto flex-1 ${isMobile ? 'p-3' : 'p-5'} ${showResult ? (isMobile ? 'flex flex-col gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-6') : 'flex flex-col'}`}>
          
          {/* Column 1: Question and Options */}
          <div className={`flex flex-col justify-between ${isMobile ? 'h-auto flex-shrink-0' : 'h-full'}`}>
            <div>
              {/* Question Timer Badge */}
              {timeRemaining !== undefined && timeRemaining !== null && !showResult && (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200/60 rounded-xl px-3 py-1.5 mb-3">
                  <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1 font-sans">
                    ⏱️ Waktu Menjawab
                  </span>
                  <span className="text-xs font-black text-amber-950 tabular-nums font-sans">
                    {timeRemaining} detik tersisa
                  </span>
                </div>
              )}

              {/* Question */}
              <p className={`text-gray-800 ${isMobile ? 'text-xs' : 'text-sm sm:text-base'} mb-3 sm:mb-5 leading-relaxed font-semibold whitespace-pre-line`}>
                {question.question}
              </p>

              {/* Options */}
              <div className={`flex flex-col ${isMobile ? 'gap-1.5 mb-3' : 'gap-2 mb-5'}`}>
                {question.options.map((option, i) => {
                  let borderColor = '#E5E7EB';
                  let bgColor = 'transparent';

                  if (showResult) {
                    if (i === question.answer) {
                      borderColor = '#22C55E';
                      bgColor = '#F0FDF4';
                    } else if (i === selectedAnswer && !answerCorrect) {
                      borderColor = '#EF4444';
                      bgColor = '#FEF2F2';
                    }
                  } else if (selectedAnswer === i) {
                    borderColor = '#3B82F6';
                    bgColor = '#EFF6FF';
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => !(showResult || isReadOnly) && onSelectAnswer(i)}
                      disabled={showResult || isReadOnly}
                      className={`text-left ${isMobile ? 'px-3 py-2' : 'px-4 py-3'} rounded-lg transition-all ${isMobile ? 'text-xs' : 'text-sm sm:text-base'} font-sans`}
                      style={{
                        border: `2px solid ${borderColor}`,
                        backgroundColor: bgColor,
                        cursor: (showResult || isReadOnly) ? 'default' : 'pointer',
                      }}
                    >
                      <span className="font-bold mr-2 text-gray-500">
                        {optionLabels[i]}.
                      </span>
                      <span className="text-gray-800">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Section (Submit / Waiting / Next Button) */}
            <div className="mt-auto">
              {isReadOnly ? (
                !showResult ? (
                  <div className="w-full py-3 bg-slate-100 text-slate-500 rounded-lg font-bold text-sm text-center animate-pulse border border-slate-200 font-sans">
                    ⏳ Menunggu pemain aktif menjawab...
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {/* Consequence message */}
                    <div
                      className="p-3 rounded-lg text-sm font-semibold text-center font-sans"
                      style={{
                        backgroundColor: answerCorrect ? '#F0FDF4' : '#FEF2F2',
                        color: answerCorrect ? '#166534' : '#991B1B',
                        border: `1px solid ${answerCorrect ? '#BBF7D0' : '#FECACA'}`,
                      }}
                    >
                      {consequence}
                    </div>

                    <div className="w-full py-3 bg-slate-100 text-slate-500 rounded-lg font-bold text-sm text-center animate-pulse border border-slate-200 font-sans">
                      ⏳ Menunggu giliran berikutnya...
                    </div>
                  </div>
                )
              ) : !showResult ? (
                <button
                  onClick={onSubmit}
                  disabled={selectedAnswer === null}
                  className={`w-full ${isMobile ? 'py-2 text-xs' : 'py-3 text-sm'} bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-sans cursor-pointer`}
                >
                  Jawab
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Consequence message */}
                  <div
                    className="p-3 rounded-lg text-sm font-semibold text-center font-sans"
                    style={{
                      backgroundColor: answerCorrect ? '#F0FDF4' : '#FEF2F2',
                      color: answerCorrect ? '#166534' : '#991B1B',
                      border: `1px solid ${answerCorrect ? '#BBF7D0' : '#FECACA'}`,
                    }}
                  >
                    {consequence}
                  </div>

                  <button
                    onClick={onNext}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors font-sans cursor-pointer"
                  >
                    Giliran Berikutnya →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Explanation (only shown when showResult is true) */}
          {showResult && question.explanation && (
            <div className={`flex flex-col ${isMobile ? 'h-auto flex-shrink-0' : 'h-full'} bg-blue-50/70 rounded-xl border border-blue-100 ${isMobile ? 'p-3' : 'p-4'} overflow-y-auto ${isMobile ? 'max-h-[40vh]' : 'max-h-[50vh] md:max-h-[70vh]'} shadow-inner text-left`}>
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-black text-blue-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 flex-shrink-0 font-sans`}>
                💡 Pembahasan Lengkap
              </div>
              <p className="text-xs sm:text-sm text-blue-950 leading-relaxed font-semibold whitespace-pre-line font-sans">
                {question.explanation}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
