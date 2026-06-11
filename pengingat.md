# PENGINGAT UNTUK DEPLOYMENT (PENTING)

Sebelum melakukan deployment produksi/rilis resmi, pastikan untuk menghapus file developer bypass dan memulihkan perubahan kode berikut:

## 1. File yang Harus Dihapus:
* `frontend/app/game/components/DevBypass.tsx`

## 2. Kode di Frontend (`frontend/app/game/page.tsx`):
* Hapus import `DevBypass` dari `./components/DevBypass`.
* Kembalikan logika check gilirannya (hapus `isFakePlayer` & `isMyTurnOrDevDrive`), kembalikan ke `isMyTurn` standard untuk `PlayerPanel` dan `QuestionModal`.
* Hapus rendering komponen `<DevBypass socket={socketRef.current} lobbyId={currentLobbyId} />` di sebelah kanan "Pemain Tergabung".

## 3. Kode di Backend (`backend/index.js`):
* Hapus socket listener `dev-add-fake-player`.
* Hapus fungsi `isDriver` dan kembalikan pemeriksaan giliran manual `if (activePlayer.socketId !== socket.id) return;` di semua event handler:
  - `roll-dice`
  - `walk-step`
  - `finish-walk`
  - `trigger-question`
  - `select-answer`
  - `submit-answer`
  - `next-turn`
