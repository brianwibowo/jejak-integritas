'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { playHomeLobbyMusic, playClickSound } from './game/audioHelper';

export default function Home() {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [videoMuted, setVideoMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // === LOBBY BGM SYNC ===
  useEffect(() => {
    // Start music if intro is skipped or ended
    if (!showIntro) {
      playHomeLobbyMusic();
    }
  }, [showIntro]);

  // === INTRO VIDEO AUTOPLAY FALLBACK ===
  useEffect(() => {
    if (showIntro && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log("Autoplay with sound blocked. Falling back to muted autoplay.", err);
          setVideoMuted(true);
          // Retry playing muted
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch((e) => console.log("Muted autoplay failed:", e));
          }
        });
      }
    }
  }, [showIntro]);

  // === GLOBAL CLICK SOUND EFFECTS ===
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      let current: HTMLElement | null = target;
      let isClickable = false;
      for (let i = 0; i < 4 && current; i++) {
        if (
          current.tagName === 'BUTTON' ||
          current.tagName === 'A' ||
          current.getAttribute('role') === 'button' ||
          current.classList.contains('cursor-pointer')
        ) {
          isClickable = true;
          break;
        }
        current = current.parentElement;
      }
      if (isClickable) {
        playClickSound();
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  return (
    <>
      {/* INTRO VIDEO OVERLAY */}
      {showIntro && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50 animate-fade-in">
          <video
            ref={videoRef}
            src="/opening_jejak integritas.mp4"
            autoPlay
            playsInline
            muted={videoMuted}
            onEnded={() => setShowIntro(false)}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div
        className="flex flex-col items-center justify-center min-h-screen p-6 font-sans relative overflow-hidden bg-slate-100"
        style={{
          backgroundImage: "url('/background_home.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Semi-transparent Overlay backdrop for screen readability */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] pointer-events-none" />

        {/* Main card */}
        <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-8 sm:p-10 shadow-2xl max-w-xl w-full text-center z-10">
          {/* Floating Game Icon */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-indigo-500 rounded-full filter blur-xl opacity-20 animate-pulse" />
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-3xl flex items-center justify-center text-4xl shadow-lg border border-white/40 animate-bounce mx-auto">
              🎲
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-indigo-950 tracking-wide mb-2">
            JEJAK INTEGRITAS
          </h1>

          <p className="text-[10px] sm:text-xs text-slate-500 font-extrabold uppercase tracking-widest mb-6">
            Game Ular Tangga Edukatif Anti Korupsi
          </p>

          <p className="text-sm sm:text-base text-slate-650 mb-8 leading-relaxed max-w-md mx-auto font-semibold">
            Media pembelajaran digital berbasis permainan ular tangga interaktif dengan nilai-nilai integritas, dilema moral, dan kearifan lokal untuk menanamkan jiwa anti korupsi sejak dini.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/game"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold text-base transition-all shadow-md shadow-indigo-600/10 active:scale-95 text-center cursor-pointer"
            >
              Mulai Bermain 🎮
            </Link>

            <button
              onClick={() => setIsTutorialOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200/80 hover:bg-slate-50/80 text-slate-700 hover:text-slate-900 rounded-xl font-extrabold text-base transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Panduan Bermain 📖
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="absolute bottom-6 left-0 right-0 text-center z-10">
          <p className="text-[10px] text-slate-600 font-bold tracking-wider uppercase">
            Edukasi Integritas & Anti Korupsi © 2026
          </p>
        </div>

        {/* TUTORIAL MODAL POPUP */}
        {isTutorialOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 animate-slide-up text-left text-slate-700 font-sans">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-200/80 pb-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-indigo-905 flex items-center gap-2">
                  📖 PANDUAN BERMAIN
                </h2>
                <button
                  onClick={() => setIsTutorialOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6 text-slate-650 text-sm sm:text-base leading-relaxed font-semibold">
                <section>
                  <h3 className="text-indigo-950 font-extrabold text-base mb-1.5 flex items-center gap-2">
                    🎯 1. Tujuan Permainan
                  </h3>
                  <p className="font-medium">
                    Pemain bersaing mengumpulkan skor tertinggi dengan menjawab pertanyaan kuis integritas sembari melangkah ke <span className="text-indigo-600 font-extrabold">Kotak 52 (FINISH)</span>. Juara ditentukan berdasarkan akumulasi total poin terbanyak di akhir permainan, bukan hanya siapa yang sampai paling awal.
                  </p>
                </section>

                <section>
                  <h3 className="text-indigo-950 font-extrabold text-base mb-2.5 flex items-center gap-2">
                    🟦 2. Makna Kotak Warna-Warni
                  </h3>
                  <p className="mb-3 font-medium">
                    Setiap warna petak mewakili kategori pertanyaan kuis edukasi antikorupsi:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                      <span className="font-extrabold text-blue-800 text-xs sm:text-sm">🔵 Kotak Nilai PAK</span>
                      <p className="text-[11px] text-slate-500 mt-1 font-semibold">Menguji pemahaman tentang prinsip dasar nilai integritas (Jujur, Disiplin, Tanggung Jawab).</p>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                      <span className="font-extrabold text-red-800 text-xs sm:text-sm">🔴 Kotak Pelanggaran</span>
                      <p className="text-[11px] text-slate-500 mt-1 font-semibold">Menganalisis skenario pelanggaran integritas dan dampak korupsi di masyarakat.</p>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                      <span className="font-extrabold text-yellow-800 text-xs sm:text-sm">🟡 Kotak Dilema Moral</span>
                      <p className="text-[11px] text-slate-500 mt-1 font-semibold">Menantang pemain mengambil keputusan atas dilema moral yang sering dijumpai sehari-hari.</p>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
                      <span className="font-extrabold text-green-800 text-xs sm:text-sm">🟢 Kotak Kearifan Lokal</span>
                      <p className="text-[11px] text-slate-500 mt-1 font-semibold">Nilai-nilai kebaikan yang diadaptasi dari norma budaya adat, peribahasa, dan cerita rakyat.</p>
                    </div>
                    <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl sm:col-span-2">
                      <span className="font-extrabold text-purple-800 text-xs sm:text-sm">🟣 Kotak Aksi</span>
                      <p className="text-[11px] text-slate-500 mt-1 font-semibold">Tindakan nyata dan langkah pencegahan antikorupsi di lingkungan sekolah dan sosial.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-indigo-950 font-extrabold text-base mb-1.5 flex items-center gap-2">
                    🪜 3. Aturan Tangga & Ular
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium">
                    <li>
                      Jika mendarat di petak **Tangga 🪜**: Anda mendapat kuis. Jika jawaban <span className="text-emerald-600 font-extrabold">BENAR</span>, Anda langsung memanjat tangga. Jika <span className="text-rose-500 font-extrabold">SALAH</span>, Anda tetap di bawah.
                    </li>
                    <li>
                      Jika mendarat di petak **Ular 🐍**: Anda mendapat kuis. Jika jawaban <span className="text-emerald-600 font-extrabold">BENAR</span>, Anda aman di tempat. Jika <span className="text-rose-500 font-extrabold">SALAH</span>, Anda tergelincir turun ke ekor ular.
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-indigo-950 font-extrabold text-base mb-1.5 flex items-center gap-2">
                    👥 4. Mode Multiplayer Online
                  </h3>
                  <p className="font-medium">
                    Bergabunglah dengan teman-teman Anda secara real-time via online lobby room menggunakan handphone atau device masing-masing. Sinkronisasi giliran, lemparan dadu, dan papan berjalan otomatis untuk semua device!
                  </p>
                </section>
              </div>

              {/* Bottom Button */}
              <div className="mt-8 border-t border-slate-200 pb-2 pt-6 flex justify-end">
                <button
                  onClick={() => setIsTutorialOpen(false)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-sm sm:text-base"
                >
                  Saya Mengerti, Mulai Main! 🎮
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
