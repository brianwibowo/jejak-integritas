import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
let PORT = process.env.PORT || 5001;
if (PORT === '5000' || PORT === 5000) {
  PORT = 5001;
}

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
const snakes = { 48: 27, 44: 20, 40: 16, 36: 10 };
const ladders = { 15: 26, 19: 38, 23: 45, 33: 49 };
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

// Helper to calculate row points based on position (for 50 boxes board)
function getRowPoints(pos) {
  if (pos >= 50) return 25;
  return Math.max(0, Math.floor((pos - 1) / 10)) * 5;
}

// Helper to handle a player reaching the finish line (box 50)
function handlePlayerFinished(lobby, playerIdx) {
  const player = lobby.gameState.players[playerIdx];
  if (player.isFinished) return;

  const bonus = [20, 15, 10, 5][lobby.gameState.finishOrder.length] || 0;
  lobby.gameState.finishOrder.push(player.socketId);

  lobby.gameState.players = lobby.gameState.players.map((p, idx) => {
    if (idx === playerIdx) {
      const correctAnswers = p.correctAnswers;
      const baseScore = correctAnswers * 10;
      const rowPoints = 25; // Crossed all 5 rows to reach 50
      const score = baseScore + rowPoints + bonus;
      return {
        ...p,
        position: 50,
        isFinished: true,
        finishRank: lobby.gameState.finishOrder.length,
        score: score
      };
    }
    return p;
  });

  const allFinished = lobby.gameState.players.every(p => p.isFinished);
  if (allFinished) {
    lobby.gameState.phase = 'finished';
    // Sort players by score descending to find the overall winner
    const sorted = [...lobby.gameState.players].sort((a, b) => b.score - a.score);
    lobby.gameState.winner = sorted[0];
    lobby.gameState.message = `🎉 Permainan selesai! Juara pertama adalah ${sorted[0].name} dengan skor ${sorted[0].score}!`;
  } else {
    lobby.gameState.phase = 'result';
    lobby.gameState.message = `🎉 ${player.name} telah mencapai FINISH di posisi ke-${lobby.gameState.finishOrder.length}!`;
  }
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  const isDriver = (activePlayer, lobby) => {
    return activePlayer.socketId === socket.id || (activePlayer.socketId.startsWith('fake-') && socket.id === lobby.hostId);
  };

  // Dev Bypass: Add Fake Player
  socket.on('dev-add-fake-player', ({ lobbyId }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || lobby.status === 'playing' || lobby.players.length >= 4) return;

    const fakeNames = ['Budi 🤖', 'Siti 🤖', 'Agus 🤖', 'Dewi 🤖'];
    const fakeName = fakeNames.find(name => !lobby.players.some(p => p.name === name)) || `Tester-${lobby.players.length + 1} 🤖`;

    const playerId = lobby.players.length;
    const playerColor = PLAYER_COLORS.find(c => !lobby.players.some(p => p.color === c)) || PLAYER_COLORS[0];

    const fakePlayer = {
      id: playerId,
      socketId: `fake-socket-${Math.random().toString(36).substr(2, 9)}`,
      name: fakeName,
      color: playerColor,
      position: 0,
      correctAnswers: 0,
      wrongAnswers: 0
    };

    lobby.players.push(fakePlayer);

    io.to(`room-${lobbyId}`).emit('lobby-update', {
      players: lobby.players,
      hostId: lobby.hostId,
      status: lobby.status,
      name: lobby.name
    });
    io.emit('lobbies-list', getLobbiesStatus());
  });

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
    const playerColor = PLAYER_COLORS.find(c => !lobby.players.some(p => p.color === c)) || PLAYER_COLORS[0];

    const newPlayer = {
      id: playerId,
      socketId: socket.id,
      name: playerName,
      color: playerColor,
      position: 0,
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
      status: lobby.status,
      name: lobby.name
    });
    io.emit('lobbies-list', getLobbiesStatus());
  });

  // 2b. Select Color
  socket.on('select-color', ({ lobbyId, color }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || lobby.status === 'playing') return;

    // Find the player
    const player = lobby.players.find(p => p.socketId === socket.id);
    if (!player) return;

    // Verify if color is already taken by another player
    const colorTaken = lobby.players.some(p => p.socketId !== socket.id && p.color === color);
    if (colorTaken) {
      return socket.emit('color-error', 'Warna sudah dipilih pemain lain');
    }

    // Update player color
    player.color = color;

    // Broadcast updates
    io.to(`room-${lobbyId}`).emit('lobby-update', {
      players: lobby.players,
      hostId: lobby.hostId,
      status: lobby.status,
      name: lobby.name
    });
  });


  // 3. Start Game
  socket.on('start-game', ({ lobbyId, boardColors }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || lobby.hostId !== socket.id) return;

    lobby.status = 'playing';
    lobby.gameState = {
      phase: 'rolling',
      players: lobby.players.map(p => ({
        ...p,
        position: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        score: 0,
        isFinished: false,
        finishRank: null
      })),
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
      finishOrder: [], // Track order in which players reach box 52
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
    if (!isDriver(activePlayer, lobby)) return;

    const diceValue = Math.floor(Math.random() * 6) + 1;
    const newPosition = activePlayer.position + diceValue;

    if (newPosition > 50) {
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
    if (!isDriver(activePlayer, lobby)) return;

    lobby.gameState.players = lobby.gameState.players.map((p, idx) => 
      idx === lobby.gameState.currentPlayerIndex
        ? {
            ...p,
            position: p.position + 1,
            score: p.correctAnswers * 10 + getRowPoints(p.position + 1)
          }
        : p
    );

    io.to(`room-${lobbyId}`).emit('game-state-update', lobby.gameState);
  });

  // 6. Finish Walk
  socket.on('finish-walk', ({ lobbyId }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || !lobby.gameState || lobby.gameState.phase !== 'walking') return;

    const activePlayer = lobby.gameState.players[lobby.gameState.currentPlayerIndex];
    if (!isDriver(activePlayer, lobby)) return;

    const currentPos = activePlayer.position;

    if (currentPos === 50) {
      handlePlayerFinished(lobby, lobby.gameState.currentPlayerIndex);
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
    if (!isDriver(activePlayer, lobby)) return;

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
    if (!isDriver(activePlayer, lobby)) return;

    lobby.gameState.selectedAnswer = index;
    io.to(`room-${lobbyId}`).emit('game-state-update', lobby.gameState);
  });

  // 9. Submit Answer
  socket.on('submit-answer', ({ lobbyId }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || !lobby.gameState || lobby.gameState.phase !== 'question' || lobby.gameState.selectedAnswer === null || !lobby.gameState.currentQuestion) return;

    const activePlayer = lobby.gameState.players[lobby.gameState.currentPlayerIndex];
    if (!isDriver(activePlayer, lobby)) return;

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
            score: (p.correctAnswers + (isCorrect ? 1 : 0)) * 10 + getRowPoints(newPosition)
          }
        : p
    );

    lobby.gameState.answerCorrect = isCorrect;
    lobby.gameState.consequence = consequence;
    lobby.gameState.usedQuestionIds = [...lobby.gameState.usedQuestionIds, lobby.gameState.currentQuestion.id];

    if (newPosition === 50) {
      handlePlayerFinished(lobby, lobby.gameState.currentPlayerIndex);
    } else {
      lobby.gameState.phase = 'result';
    }

    io.to(`room-${lobbyId}`).emit('game-state-update', lobby.gameState);
  });

  // 10. Next Turn
  socket.on('next-turn', ({ lobbyId }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || !lobby.gameState || lobby.gameState.phase !== 'result') return;

    const activePlayer = lobby.gameState.players[lobby.gameState.currentPlayerIndex];
    if (!isDriver(activePlayer, lobby)) return;

    let nextIndex = (lobby.gameState.currentPlayerIndex + 1) % lobby.gameState.players.length;
    // Skip finished players
    let attempts = 0;
    while (lobby.gameState.players[nextIndex].isFinished && attempts < lobby.gameState.players.length) {
      nextIndex = (nextIndex + 1) % lobby.gameState.players.length;
      attempts++;
    }

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

    // Finish all players immediately to trigger the finished phase and victory modal
    lobby.gameState.players = lobby.gameState.players.map((p, idx) => {
      if (idx === lobby.gameState.currentPlayerIndex) {
        return {
          ...p,
          position: 50,
          correctAnswers: p.correctAnswers + 1,
          score: p.score + 25 + 20, // Add row points and finish bonus
          isFinished: true,
          finishRank: 1
        };
      } else {
        return {
          ...p,
          isFinished: true,
          finishRank: 2
        };
      }
    });

    lobby.gameState.finishOrder = lobby.gameState.players.map(p => p.socketId);
    lobby.gameState.phase = 'finished';

    // Sort players by score descending to find the overall winner
    const sorted = [...lobby.gameState.players].sort((a, b) => b.score - a.score);
    lobby.gameState.winner = sorted[0];
    lobby.gameState.message = `🎉 Permainan selesai! Juara pertama adalah ${sorted[0].name} dengan skor ${sorted[0].score}!`;

    io.to(`room-${lobbyId}`).emit('game-state-update', lobby.gameState);
  });

  // 12. Quit / Reset Game (returns players to Lobby Waiting Screen)
  socket.on('quit-game', ({ lobbyId }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || lobby.hostId !== socket.id) return;

    lobby.status = 'waiting';
    lobby.gameState = null;
    lobby.players = lobby.players.map(p => ({
      ...p,
      position: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      score: 0,
      isFinished: false,
      finishRank: null
    }));

    io.to(`room-${lobbyId}`).emit('lobby-update', {
      players: lobby.players,
      hostId: lobby.hostId,
      status: lobby.status
    });
    io.to(`room-${lobbyId}`).emit('game-terminated');
    io.emit('lobbies-list', getLobbiesStatus());
  });

  // 12b. Rename Lobby (Host only)
  socket.on('rename-lobby', ({ lobbyId, name }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || lobby.hostId !== socket.id || !name.trim()) return;

    lobby.name = name.trim();

    io.to(`room-${lobbyId}`).emit('lobby-update', {
      players: lobby.players,
      hostId: lobby.hostId,
      status: lobby.status,
      name: lobby.name
    });
    io.emit('lobbies-list', getLobbiesStatus());
  });

  // 12c. Kick Player (Host only)
  socket.on('kick-player', ({ lobbyId, targetSocketId }) => {
    const lobby = lobbies[lobbyId];
    if (!lobby || lobby.hostId !== socket.id || lobby.status === 'playing') return;

    const playerIdx = lobby.players.findIndex(p => p.socketId === targetSocketId);
    if (playerIdx === -1) return;

    lobby.players.splice(playerIdx, 1);

    const targetSocket = io.sockets.sockets.get(targetSocketId);
    if (targetSocket) {
      targetSocket.leave(`room-${lobbyId}`);
      targetSocket.emit('kicked');
    }

    io.to(`room-${lobbyId}`).emit('lobby-update', {
      players: lobby.players,
      hostId: lobby.hostId,
      status: lobby.status,
      name: lobby.name
    });
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

    // Dev Bypass clean up: If no real players remain in the lobby, clear it completely
    const realPlayers = lobby.players.filter(p => !p.socketId.startsWith('fake-'));
    if (realPlayers.length === 0) {
      lobby.players = [];
    }

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
        lobby.players = lobby.players.map((p, idx) => ({ ...p, id: idx, position: 0, correctAnswers: 0, wrongAnswers: 0 }));
        io.to(`room-${lobbyId}`).emit('game-terminated');
      }

      // Re-assign IDs (0 to players.length - 1) for turn tracking consistency
      lobby.players = lobby.players.map((p, idx) => ({ ...p, id: idx }));

      io.to(`room-${lobbyId}`).emit('lobby-update', {
        players: lobby.players,
        hostId: lobby.hostId,
        status: lobby.status,
        name: lobby.name
      });
    }

    io.emit('lobbies-list', getLobbiesStatus());
  }
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});