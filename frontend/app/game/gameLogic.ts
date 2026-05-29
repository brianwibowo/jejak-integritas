'use client';

import { useReducer, useCallback } from 'react';
import {
  BoxType,
  ColoredBoxType,
  Question,
  generateBoard,
  getRandomQuestion,
  snakes,
  ladders,
} from './gameData';

// --- Types ---

export interface Player {
  id: number;
  name: string;
  position: number; // 1 = START, 100 = FINISH
  color: string;
}

export type GamePhase = 'setup' | 'rolling' | 'question' | 'result' | 'finished';

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  board: BoxType[];
  diceValue: number | null;
  currentQuestion: Question | null;
  selectedAnswer: number | null;
  answerCorrect: boolean | null;
  consequence: string | null;
  winner: Player | null;
  usedQuestionIds: number[];
  message: string | null;
}

// --- Constants ---

const PLAYER_COLORS = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12'];

const initialState: GameState = {
  phase: 'setup',
  players: [],
  currentPlayerIndex: 0,
  board: [],
  diceValue: null,
  currentQuestion: null,
  selectedAnswer: null,
  answerCorrect: null,
  consequence: null,
  winner: null,
  usedQuestionIds: [],
  message: null,
};

// --- Actions ---

type GameAction =
  | { type: 'START_GAME'; playerNames: string[] }
  | { type: 'ROLL_DICE' }
  | { type: 'SELECT_ANSWER'; index: number }
  | { type: 'SUBMIT_ANSWER' }
  | { type: 'NEXT_TURN' }
  | { type: 'RESET' };

// --- Reducer ---

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const players: Player[] = action.playerNames.map((name, i) => ({
        id: i,
        name,
        position: 1, // All players start at position 1 (START)
        color: PLAYER_COLORS[i],
      }));
      const board = generateBoard();
      return {
        ...initialState,
        phase: 'rolling',
        players,
        board,
      };
    }

    case 'ROLL_DICE': {
      if (state.phase !== 'rolling') return state;

      const diceValue = Math.floor(Math.random() * 6) + 1;
      const currentPlayer = state.players[state.currentPlayerIndex];
      const newPosition = currentPlayer.position + diceValue;

      // --- Overshoot: can't move past 100 ---
      if (newPosition > 100) {
        return {
          ...state,
          diceValue,
          phase: 'result',
          currentQuestion: null,
          consequence: 'overshoot',
          message: `Angka dadu (${diceValue}) melebihi sisa kotak! ${currentPlayer.name} tetap di posisi ${currentPlayer.position}.`,
        };
      }

      // --- Exact finish: WIN ---
      if (newPosition === 100) {
        const updatedPlayers = state.players.map((p, i) =>
          i === state.currentPlayerIndex ? { ...p, position: 100 } : p
        );
        return {
          ...state,
          diceValue,
          players: updatedPlayers,
          phase: 'finished',
          winner: { ...currentPlayer, position: 100 },
          message: `🎉 ${currentPlayer.name} mencapai kotak 100 dan MENANG!`,
        };
      }

      // --- Normal move ---
      const updatedPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? { ...p, position: newPosition } : p
      );

      const boxType = state.board[newPosition - 1]; // board is 0-indexed

      // If landing on start (very unlikely) or finish (handled above)
      if (boxType === 'start' || boxType === 'finish') {
        return {
          ...state,
          diceValue,
          players: updatedPlayers,
          phase: 'result',
          currentQuestion: null,
          consequence: 'neutral',
          message: `${currentPlayer.name} mendarat di kotak ${newPosition}.`,
        };
      }

      // Get random question for this box type
      const question = getRandomQuestion(
        boxType as ColoredBoxType,
        state.usedQuestionIds
      );

      return {
        ...state,
        diceValue,
        players: updatedPlayers,
        phase: 'question',
        currentQuestion: question,
        selectedAnswer: null,
        answerCorrect: null,
        consequence: null,
        message: null,
      };
    }

    case 'SELECT_ANSWER': {
      if (state.phase !== 'question') return state;
      return { ...state, selectedAnswer: action.index };
    }

    case 'SUBMIT_ANSWER': {
      if (
        state.phase !== 'question' ||
        state.selectedAnswer === null ||
        !state.currentQuestion
      )
        return state;

      const isCorrect = state.selectedAnswer === state.currentQuestion.answer;
      const currentPlayer = state.players[state.currentPlayerIndex];
      const currentPos = currentPlayer.position;

      let newPosition = currentPos;
      let consequence = '';

      if (isCorrect) {
        if (ladders[currentPos]) {
          newPosition = ladders[currentPos];
          consequence = `Jawaban benar! ✅ Ada tangga! Naik dari kotak ${currentPos} ke kotak ${newPosition}! 🪜`;
        } else {
          consequence = `Jawaban benar! ✅ Tetap di posisi ${currentPos}.`;
        }
      } else {
        if (snakes[currentPos]) {
          newPosition = snakes[currentPos];
          consequence = `Jawaban salah! ❌ Ada ular! Turun dari kotak ${currentPos} ke kotak ${newPosition}! 🐍`;
        } else {
          consequence = `Jawaban salah! ❌ Tetap di posisi ${currentPos}.`;
        }
      }

      const updatedPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? { ...p, position: newPosition } : p
      );

      // Check win after ladder (e.g., ladder 80 → 100)
      let phase: GamePhase = 'result';
      let winner = state.winner;
      if (newPosition === 100) {
        phase = 'finished';
        winner = { ...currentPlayer, position: 100 };
        consequence += ` 🎉 ${currentPlayer.name} mencapai kotak 100 dan MENANG!`;
      }

      return {
        ...state,
        phase,
        players: updatedPlayers,
        answerCorrect: isCorrect,
        consequence,
        winner,
        usedQuestionIds: [...state.usedQuestionIds, state.currentQuestion.id],
      };
    }

    case 'NEXT_TURN': {
      if (state.phase !== 'result') return state;
      const nextIndex =
        (state.currentPlayerIndex + 1) % state.players.length;
      return {
        ...state,
        phase: 'rolling',
        currentPlayerIndex: nextIndex,
        diceValue: null,
        currentQuestion: null,
        selectedAnswer: null,
        answerCorrect: null,
        consequence: null,
        message: null,
      };
    }

    case 'RESET': {
      return initialState;
    }

    default:
      return state;
  }
}

// --- Hook ---

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startGame = useCallback((playerNames: string[]) => {
    dispatch({ type: 'START_GAME', playerNames });
  }, []);

  const rollDice = useCallback(() => {
    dispatch({ type: 'ROLL_DICE' });
  }, []);

  const selectAnswer = useCallback((index: number) => {
    dispatch({ type: 'SELECT_ANSWER', index });
  }, []);

  const submitAnswer = useCallback(() => {
    dispatch({ type: 'SUBMIT_ANSWER' });
  }, []);

  const nextTurn = useCallback(() => {
    dispatch({ type: 'NEXT_TURN' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    actions: {
      startGame,
      rollDice,
      selectAnswer,
      submitAnswer,
      nextTurn,
      resetGame,
    },
  };
}
