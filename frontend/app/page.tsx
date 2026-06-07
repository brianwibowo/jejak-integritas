'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 font-sans relative overflow-hidden">
      {/* Background Glow Decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl opacity-60 animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl opacity-60 animate-pulse pointer-events-none" />

      <div className="text-center max-w-xl w-full z-10">
        {/* Floating Game Icon */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-blue-500 rounded-full filter blur-xl opacity-30 animate-pulse" />
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center text-5xl shadow-2xl border border-blue-400/30 animate-bounce mx-auto">
            🎲
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent tracking-wide mb-3">
          JEJAK INTEGRITAS
        </h1>
        
        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-6">
          Game Ular Tangga Edukatif Anti Korupsi
        </p>

        <p className="text-sm sm:text-base text-slate-300 mb-10 leading-relaxed max-w-md mx-auto">
          Media pembelajaran digital berbasis permainan ular tangga interaktif dengan nilai-nilai integritas, dilema moral, dan kearifan lokal untuk menanamkan jiwa anti korupsi.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/game"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95 text-center"
          >
            Mulai Bermain 🎮
          </Link>

          <button
            onClick={() => setIsTutorialOpen(true)}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800/80 text-slate-300 hover:text-white rounded-xl font-bold text-lg transition-all shadow-lg active:scale-95"
          >
            Panduan Bermain 📖
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <p className="text-xs text-slate-600 font-semibold tracking-wider uppercase">
          Edukasi Integritas & Anti Korupsi © 2026
        </p>
      </div>

      {/* TUTORIAL MODAL POPUP */}
      {isTutorialOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-filter backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 animate-slide-up text-left">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-blue-400 flex items-center gap-2">
                📖 PANDUAN BERMAIN
              </h2>
              <button
                onClick={() => setIsTutorialOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed">
              <section>
                <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
                  🎯 1. Tujuan Permainan
                </h3>
                <p>
                  Pemain bersaing untuk menjadi yang pertama mencapai **Kotak 100 (FINISH)**. Dalam perjalanan, pemain harus menjawab pertanyaan integritas untuk memanjat tangga atau menghindari gigitan ular.
                </p>
              </section>

              <section>
                <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
                  🟦 2. Makna Kotak Warna-Warni
                </h3>
                <p className="mb-3">
                  Papan memiliki 5 jenis kotak edukatif yang memiliki pertanyaan dengan tema yang berbeda:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-950/40 border border-blue-900/30 rounded-xl">
                    <span className="font-extrabold text-blue-400">🔵 Kotak Nilai</span>
                    <p className="text-xs text-slate-400 mt-1">Mengukur pengetahuan tentang prinsip dasar integritas (jujur, disiplin, dll).</p>
                  </div>
                  <div className="p-3 bg-red-950/40 border border-red-900/30 rounded-xl">
                    <span className="font-extrabold text-red-400">🔴 Kotak Pelanggaran</span>
                    <p className="text-xs text-slate-400 mt-1">Menganalisis kasus-kasus korupsi dan konsekuensi buruknya di masyarakat.</p>
                  </div>
                  <div className="p-3 bg-yellow-950/40 border border-yellow-900/30 rounded-xl">
                    <span className="font-extrabold text-yellow-400">🟡 Kotak Dilema Moral</span>
                    <p className="text-xs text-slate-400 mt-1">Menantang pemain mengambil keputusan moral dari pilihan dilematis yang dihadapi.</p>
                  </div>
                  <div className="p-3 bg-green-950/40 border border-green-900/30 rounded-xl">
                    <span className="font-extrabold text-green-400">🟢 Kotak Kearifan Lokal</span>
                    <p className="text-xs text-slate-400 mt-1">Nilai-nilai integritas yang bersumber dari norma adat, peribahasa, dan kearifan lokal.</p>
                  </div>
                  <div className="p-3 bg-purple-950/40 border border-purple-900/30 rounded-xl sm:col-span-2">
                    <span className="font-extrabold text-purple-400">🟣 Kotak Aksi</span>
                    <p className="text-xs text-slate-400 mt-1">Aksi konkret dan tindakan preventif anti korupsi dalam kehidupan sehari-hari.</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
                  🪜 3. Aturan Tangga & Ular
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Jika mendarat di **Tangga 🪜**, Anda harus menjawab pertanyaan. Jika jawaban **BENAR**, Anda langsung memanjat tangga tersebut. Jika **SALAH**, Anda tetap berada di bawah tangga.</li>
                  <li>Jika mendarat di **Ular 🐍**, Anda juga harus menjawab pertanyaan. Jika jawaban **BENAR**, Anda berhasil menghindari gigitan ular dan tetap aman di kotak tersebut. Jika **SALAH**, Anda digigit dan merosot turun ke ekor ular.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
                  ⚡ 4. Mode Permainan
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>**Offline (1 Device)**: Bermain bersama teman-teman (2-4 orang) bergiliran di satu HP/komputer yang sama.</li>
                  <li>**Online (Lobby)**: Setiap orang bergabung ke dalam lobby room menggunakan HP/device masing-masing dan bermain secara real-time!</li>
                </ul>
              </section>
            </div>

            {/* Bottom Button */}
            <div className="mt-8 border-t border-slate-800 pt-6 flex justify-end">
              <button
                onClick={() => setIsTutorialOpen(false)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
              >
                Saya Mengerti, Mulai Main! 🎮
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
