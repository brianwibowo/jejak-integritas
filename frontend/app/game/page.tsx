'use client';

import { useGameState } from './gameLogic';
import Board from './components/Board';
import PlayerPanel from './components/PlayerPanel';
import QuestionModal from './components/QuestionModal';
import SetupScreen from './components/SetupScreen';

export default function GamePage() {
  const { state, actions } = useGameState();

  // === SETUP PHASE ===
  if (state.phase === 'setup') {
    return <SetupScreen onStart={actions.startGame} />;
  }

  // === FINISHED PHASE ===
  if (state.phase === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-yellow-50 to-yellow-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-yellow-700 mb-2">
            Selamat!
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            <span
              className="font-bold"
              style={{ color: state.winner?.color }}
            >
              {state.winner?.name}
            </span>{' '}
            memenangkan permainan!
          </p>

          {/* Final positions */}
          <div className="mb-6 text-left">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">
              Posisi Akhir:
            </h3>
            {state.players
              .sort((a, b) => b.position - a.position)
              .map((player, i) => (
                <div
                  key={player.id}
                  className="flex items-center gap-2 py-1.5"
                >
                  <span className="text-sm font-bold text-gray-400 w-5">
                    {i + 1}.
                  </span>
                  <div
                    className="w-4 h-4 rounded-full border border-white shadow"
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="text-sm text-gray-700 flex-1">
                    {player.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    Kotak {player.position}
                  </span>
                </div>
              ))}
          </div>

          <button
            onClick={actions.resetGame}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md"
          >
            Main Lagi 🔄
          </button>
        </div>
      </div>
    );
  }

  // === GAME PHASE (rolling, question, result) ===
  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-4">
      {/* Header */}
      <h1 className="text-xl sm:text-2xl font-bold text-center mb-3 text-blue-800">
        🎲 Jejak Integritas
      </h1>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-4 justify-center items-start max-w-[900px] mx-auto">
        {/* Board */}
        <div className="flex-1 flex justify-center w-full">
          <Board board={state.board} players={state.players} />
        </div>

        {/* Side panel */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <PlayerPanel
            players={state.players}
            currentPlayerIndex={state.currentPlayerIndex}
            diceValue={state.diceValue}
            onRollDice={actions.rollDice}
            phase={state.phase}
            message={state.message}
            onNextTurn={actions.nextTurn}
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
    </div>
  );
}
