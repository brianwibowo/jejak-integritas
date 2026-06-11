'use client';

import { Question, boxTypeInfo, ColoredBoxType, themeLabels } from '../gameData';

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
}: QuestionModalProps) {
  const info = boxTypeInfo[question.boxType as ColoredBoxType];
  const themeName = themeLabels[question.theme];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div 
        className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${
          showResult ? 'max-w-4xl w-full max-h-[90vh]' : 'max-w-lg w-full max-h-[90vh]'
        }`}
      >
        {/* Header */}
        <div
          className="text-white px-5 py-3 text-center flex-shrink-0"
          style={{ backgroundColor: info.color }}
        >
          <div className="font-bold text-base">{info.label}</div>
          <div className="text-sm opacity-90">Tema: {themeName}</div>
        </div>

        {/* Content Area */}
        <div className={`overflow-y-auto flex-1 p-5 ${showResult ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col'}`}>
          
          {/* Column 1: Question and Options */}
          <div className="flex flex-col justify-between h-full">
            <div>
              {/* Question */}
              <p className="text-gray-800 text-sm sm:text-base mb-5 leading-relaxed font-semibold">
                {question.question}
              </p>

              {/* Options */}
              <div className="flex flex-col gap-2 mb-5">
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
                      className="text-left px-4 py-3 rounded-lg transition-all text-sm sm:text-base font-sans"
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
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-sans cursor-pointer"
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
            <div className="flex flex-col h-full bg-blue-50/70 rounded-xl border border-blue-100 p-4 overflow-y-auto max-h-[50vh] md:max-h-[70vh] shadow-inner text-left">
              <div className="text-sm font-black text-blue-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 flex-shrink-0 font-sans">
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
