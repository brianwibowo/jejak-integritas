import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Jejak Integritas Server Running!');
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Snakes & Ladders Config
const snakes = { 47: 26, 80: 59, 86: 67, 69: 49, 97: 78 };
const ladders = { 4: 23, 28: 47, 65: 95, 43: 62, 71: 92 };
const PLAYER_COLORS = ['#E74C3C', '#3498DB', '#2ECC71', '#111111'];

// Initialize 5 lobbies
const lobbies = {};
for (let i = 1; i <= 5; i++) {
  lobbies[i] = {
    id: i.toString(),
    name: `Lobby ${i}`,
    players: [], // { id, socketId, name, color, position, correctAnswers, wrongAnswers }
    status: 'waiting', // 'waiting' | 'playing'
    hostId: null,
    gameState: null
  };
}

// Helper to get clean lobby list for clients
function getLobbiesStatus() {
  return Object.values(lobbies).map(lobby => ({
    id: lobby.id,
    name: lobby.name,
    playerCount: lobby.players.length,
    status: lobby.status
  }));
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. Send initial lobbies status
  socket.emit('lobbies-list', getLobbiesStatus());

  // 2. Join Lobby
  socket.on('join-lobby', ({ lobbyId, playerName }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby) {
      return socket.emit('join-error', 'Lobby tidak ditemukan');
    }

    if (lobby.status === 'playing') {
      return socket.emit('join-error', 'Permainan di lobby ini sedang berjalan');
    }

    if (lobby.players.length >= 4) {
      return socket.emit('join-error', 'Lobby penuh (maksimal 4 pemain)');
    }

    // Check if player name already taken in this lobby
    const nameExists = lobby.players.some(p => p.name.toLowerCase() === playerName.toLowerCase());
    if (nameExists) {
      return socket.emit('join-error', 'Nama sudah digunakan di lobby ini');
    }

    const playerId = lobby.players.length;
    const playerColor = PLAYER_COLORS[playerId];

    const newPlayer = {
      id: playerId,
      socketId: socket.id,
      name: playerName,
      color: playerColor,
      position: 1,
      correctAnswers: 0,
      wrongAnswers: 0
    };

    lobby.players.push(newPlayer);
    if (!lobby.hostId) {
      lobby.hostId = socket.id;
    }

    socket.join(`room-${lobbyId}`);
    socket.emit('join-success', { lobbyId, myPlayer: newPlayer });
    
    // Broadcast updates
    io.to(`room-${lobbyId}`).emit('lobby-update', {
      players: lobby.players,
      hostId: lobby.hostId,
      status: lobby.status
    });
    io.emit('lobbies-list', getLobbiesStatus());
  });

  // 3. Start Game
  socket.on('start-game', ({ lobbyId, boardColors }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || lobby.hostId !== socket.id) return;

    lobby.status = 'playing';
    lobby.gameState = {
      phase: 'rolling',
      players: lobby.players.map(p => ({ ...p, position: 1, correctAnswers: 0, wrongAnswers: 0 })),
      currentPlayerIndex: 0,
      board: boardColors, // Passed from host generator
      diceValue: null,
      targetPosition: null,
      currentQuestion: null,
      selectedAnswer: null,
      answerCorrect: null,
      consequence: null,
      winner: null,
      usedQuestionIds: [],
      message: null
    };

    io.to(`room-${lobbyId}`).emit('game-state-update', lobby.gameState);
    io.emit('lobbies-list', getLobbiesStatus());
  });

  // 4. Roll Dice
  socket.on('roll-dice', ({ lobbyId }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || !lobby.gameState || lobby.gameState.phase !== 'rolling') return;

    // Verify turn
    const activePlayer = lobby.gameState.players[lobby.gameState.currentPlayerIndex];
    if (activePlayer.socketId !== socket.id) return;

    const diceValue = Math.floor(Math.random() * 6) + 1;
    const newPosition = activePlayer.position + diceValue;

    if (newPosition > 100) {
      lobby.gameState.diceValue = diceValue;
      lobby.gameState.phase = 'result';
      lobby.gameState.currentQuestion = null;
      lobby.gameState.consequence = 'overshoot';
      lobby.gameState.message = `Angka dadu (${diceValue}) melebihi sisa kotak! ${activePlayer.name} tetap di posisi ${activePlayer.position}.`;
    } else {
      lobby.gameState.diceValue = diceValue;
      lobby.gameState.targetPosition = newPosition;
      lobby.gameState.phase = 'walking';
      lobby.gameState.message = null;
    }

    io.to(`room-${lobbyId}`).emit('game-state-update', lobby.gameState);
  });

  // 5. Walk Step (Sincronized step triggers)
  socket.on('walk-step', ({ lobbyId }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || !lobby.gameState || lobby.gameState.phase !== 'walking') return;

    const activePlayer = lobby.gameState.players[lobby.gameState.currentPlayerIndex];
    if (activePlayer.socketId !== socket.id) return;

    lobby.gameState.players = lobby.gameState.players.map((p, idx) => 
      idx === lobby.gameState.currentPlayerIndex ? { ...p, position: p.position + 1 } : p
    );

    io.to(`room-${lobbyId}`).emit('game-state-update', lobby.gameState);
  });

  // 6. Finish Walk
  socket.on('finish-walk', ({ lobbyId }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || !lobby.gameState || lobby.gameState.phase !== 'walking') return;

    const activePlayer = lobby.gameState.players[lobby.gameState.currentPlayerIndex];
    if (activePlayer.socketId !== socket.id) return;

    const currentPos = activePlayer.position;

    if (currentPos === 100) {
      lobby.gameState.phase = 'finished';
      lobby.gameState.winner = { ...activePlayer };
      lobby.gameState.message = `🎉 ${activePlayer.name} mencapai kotak 100 dan MENANG!`;
    } else {
      const boxType = lobby.gameState.board[currentPos - 1];
      if (boxType === 'start' || boxType === 'finish') {
        lobby.gameState.phase = 'result';
        lobby.gameState.currentQuestion = null;
        lobby.gameState.consequence = 'neutral';
        lobby.gameState.message = `${activePlayer.name} mendarat di kotak ${currentPos}.`;
      } else {
        lobby.gameState.phase = 'pre_question';
        lobby.gameState.targetPosition = null;
      }
    }

    io.to(`room-${lobbyId}`).emit('game-state-update', lobby.gameState);
  });

  // 7. Trigger Question (Active client generated a random question and sent it to server)
  socket.on('trigger-question', ({ lobbyId, question }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || !lobby.gameState || lobby.gameState.phase !== 'pre_question') return;

    const activePlayer = lobby.gameState.players[lobby.gameState.currentPlayerIndex];
    if (activePlayer.socketId !== socket.id) return;

    lobby.gameState.phase = 'question';
    lobby.gameState.currentQuestion = question;
    lobby.gameState.selectedAnswer = null;
    lobby.gameState.answerCorrect = null;
    lobby.gameState.consequence = null;

    io.to(`room-${lobbyId}`).emit('game-state-update', lobby.gameState);
  });

  // 8. Select Option (Synchronizes active player choice live)
  socket.on('select-answer', ({ lobbyId, index }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || !lobby.gameState || lobby.gameState.phase !== 'question') return;

    const activePlayer = lobby.gameState.players[lobby.gameState.currentPlayerIndex];
    if (activePlayer.socketId !== socket.id) return;

    lobby.gameState.selectedAnswer = index;
    io.to(`room-${lobbyId}`).emit('game-state-update', lobby.gameState);
  });

  // 9. Submit Answer
  socket.on('submit-answer', ({ lobbyId }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || !lobby.gameState || lobby.gameState.phase !== 'question' || lobby.gameState.selectedAnswer === null || !lobby.gameState.currentQuestion) return;

    const activePlayer = lobby.gameState.players[lobby.gameState.currentPlayerIndex];
    if (activePlayer.socketId !== socket.id) return;

    const isCorrect = lobby.gameState.selectedAnswer === lobby.gameState.currentQuestion.answer;
    const currentPos = activePlayer.position;

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

    lobby.gameState.players = lobby.gameState.players.map((p, idx) =>
      idx === lobby.gameState.currentPlayerIndex
        ? {
            ...p,
            position: newPosition,
            correctAnswers: p.correctAnswers + (isCorrect ? 1 : 0),
            wrongAnswers: p.wrongAnswers + (isCorrect ? 0 : 1),
          }
        : p
    );

    let phase = 'result';
    let winner = lobby.gameState.winner;
    if (newPosition === 100) {
      phase = 'finished';
      winner = {
        ...activePlayer,
        position: 100,
        correctAnswers: activePlayer.correctAnswers + (isCorrect ? 1 : 0),
        wrongAnswers: activePlayer.wrongAnswers + (isCorrect ? 0 : 1)
      };
      consequence += ` 🎉 ${activePlayer.name} mencapai kotak 100 dan MENANG!`;
    }

    lobby.gameState.phase = phase;
    lobby.gameState.answerCorrect = isCorrect;
    lobby.gameState.consequence = consequence;
    lobby.gameState.winner = winner;
    lobby.gameState.usedQuestionIds = [...lobby.gameState.usedQuestionIds, lobby.gameState.currentQuestion.id];

    io.to(`room-${lobbyId}`).emit('game-state-update', lobby.gameState);
  });

  // 10. Next Turn
  socket.on('next-turn', ({ lobbyId }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || !lobby.gameState || lobby.gameState.phase !== 'result') return;

    const activePlayer = lobby.gameState.players[lobby.gameState.currentPlayerIndex];
    if (activePlayer.socketId !== socket.id) return;

    const nextIndex = (lobby.gameState.currentPlayerIndex + 1) % lobby.gameState.players.length;

    lobby.gameState.phase = 'rolling';
    lobby.gameState.currentPlayerIndex = nextIndex;
    lobby.gameState.diceValue = null;
    lobby.gameState.currentQuestion = null;
    lobby.gameState.selectedAnswer = null;
    lobby.gameState.answerCorrect = null;
    lobby.gameState.consequence = null;
    lobby.gameState.message = null;
    lobby.gameState.targetPosition = null;

    io.to(`room-${lobbyId}`).emit('game-state-update', lobby.gameState);
  });

  // 11. Quick Win
  socket.on('quick-win', ({ lobbyId }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || !lobby.gameState || lobby.hostId !== socket.id) return;

    const activePlayer = lobby.gameState.players[lobby.gameState.currentPlayerIndex];
    lobby.gameState.players = lobby.gameState.players.map((p, idx) => 
      idx === lobby.gameState.currentPlayerIndex ? { ...p, position: 100, correctAnswers: p.correctAnswers + 1 } : p
    );

    lobby.gameState.phase = 'finished';
    lobby.gameState.winner = {
      ...activePlayer,
      position: 100,
      correctAnswers: activePlayer.correctAnswers + 1
    };
    lobby.gameState.message = `🎉 ${activePlayer.name} melakukan Quick Win untuk testing!`;

    io.to(`room-${lobbyId}`).emit('game-state-update', lobby.gameState);
  });

  // 12. Quit / Reset Game (returns players to Lobby Waiting Screen)
  socket.on('quit-game', ({ lobbyId }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || lobby.hostId !== socket.id) return;

    lobby.status = 'waiting';
    lobby.gameState = null;
    lobby.players = lobby.players.map(p => ({ ...p, position: 1, correctAnswers: 0, wrongAnswers: 0 }));

    io.to(`room-${lobbyId}`).emit('lobby-update', {
      players: lobby.players,
      hostId: lobby.hostId,
      status: lobby.status
    });
    io.to(`room-${lobbyId}`).emit('game-terminated');
    io.emit('lobbies-list', getLobbiesStatus());
  });

  // 13. Leave Lobby / Connection Lost
  socket.on('leave-lobby', ({ lobbyId }) => {
    handleUserLeave(socket, lobbyId);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    Object.keys(lobbies).forEach(lobbyId => {
      handleUserLeave(socket, lobbyId);
    });
  });
});

function handleUserLeave(socket, lobbyId) {
  const lobby = lobbies[lobbyId];
  if (!lobby) return;

  const playerIndex = lobby.players.findIndex(p => p.socketId === socket.id);
  if (playerIndex !== -1) {
    lobby.players.splice(playerIndex, 1);
    socket.leave(`room-${lobbyId}`);

    // If lobby becomes empty
    if (lobby.players.length === 0) {
      lobby.status = 'waiting';
      lobby.hostId = null;
      lobby.gameState = null;
    } else {
      // Reassign host if leaving player was host
      if (lobby.hostId === socket.id) {
        lobby.hostId = lobby.players[0].socketId;
      }
      
      // If currently playing, reset game since a player left
      if (lobby.status === 'playing') {
        lobby.status = 'waiting';
        lobby.gameState = null;
        lobby.players = lobby.players.map((p, idx) => ({ ...p, id: idx, position: 1, correctAnswers: 0, wrongAnswers: 0 }));
        io.to(`room-${lobbyId}`).emit('game-terminated');
      }

      // Re-assign IDs (0 to players.length - 1) for turn tracking consistency
      lobby.players = lobby.players.map((p, idx) => ({ ...p, id: idx }));

      io.to(`room-${lobbyId}`).emit('lobby-update', {
        players: lobby.players,
        hostId: lobby.hostId,
        status: lobby.status
      });
    }

    io.emit('lobbies-list', getLobbiesStatus());
  }
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});