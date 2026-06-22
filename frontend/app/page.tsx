'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { playHomeLobbyMusic, playClickSound } from './game/audioHelper';
import { useDeviceTier } from './game/hooks/useDeviceTier';
import PortraitBlocker from './game/components/PortraitBlocker';

export default function Home() {
  const router = useRouter();
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [videoMuted, setVideoMuted] = useState(false);
  const [curtainActive, setCurtainActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { tier, isPortrait, isDesktop } = useDeviceTier();

  // Responsive styling configuration for Home page layout elements (Play, Info, Logo)
  const layoutConfig = {
    desktop: {
      playWidth: '15.6rem',
      playHeight: '5.0rem',
      playBottom: '3.4rem',
      infoWidth: '13.5rem',
      infoHeight: '4.5rem',
      infoTop: 'auto',
      infoBottom: '3.6rem',
      infoRight: '6.2rem',
      logoWidth: '12rem',
    },
    tablet: {
      playWidth: '13.0rem',
      playHeight: '4.2rem',
      playBottom: '2.5rem',
      infoWidth: '11.4rem',
      infoHeight: '3.8rem',
      infoTop: 'auto',
      infoBottom: '2.7rem',
      infoRight: '4.5rem',
      logoWidth: '10.5rem',
    },
    mobile: {
      playWidth: '9.6rem',
      playHeight: '3.1rem',
      playBottom: '1.5rem',
      infoWidth: '8.4rem',
      infoHeight: '2.8rem',
      infoTop: 'auto',
      infoBottom: '1.7rem',
      infoRight: '3.2rem',
      logoWidth: '9.0rem',
    },
  }[tier] || {
    playWidth: '15.6rem',
    playHeight: '5.0rem',
    playBottom: '3.4rem',
    infoWidth: '13.5rem',
    infoHeight: '4.5rem',
    infoTop: 'auto',
    infoBottom: '3.6rem',
    infoRight: '6.2rem',
    logoWidth: '12rem',
  };


  // === SESSION CHECK FOR INTRO WATCHED ===
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('introWatched') === 'true') {
      setShowIntro(false);
    }
  }, []);

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
      videoRef.current.muted = false;
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

  // === GLOBAL CLICK & AUDIO INITIALIZATION ===
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Retry starting BGM on any page click once intro is finished
      if (!showIntro) {
        playHomeLobbyMusic();
      }

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
  }, [showIntro]);

  return (
    <>
      {/* TRANSITION CURTAIN */}
      <div
        className="fixed inset-0 z-50 pointer-events-none bg-neutral-900/95 transition-transform duration-500 ease-in-out flex flex-col items-center justify-center p-8 gap-8"
        style={{
          transform: curtainActive ? 'translateX(0%)' : 'translateX(-100%)',
          pointerEvents: curtainActive ? 'auto' : 'none',
        }}
      >
        <div className="text-center animate-pulse flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/20 animate-spin">
            🎲
          </div>
          <h2 className="text-xl font-black text-white tracking-widest mt-2 uppercase">
            MEMUAT PERMAINAN...
          </h2>
        </div>
      </div>

      {/* INTRO VIDEO OVERLAY */}
      {showIntro && (
        <div
          onClick={() => {
            setShowIntro(false);
            sessionStorage.setItem('introWatched', 'true');
            playHomeLobbyMusic();
          }}
          className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 animate-fade-in text-white font-sans cursor-pointer"
        >
          <video
            ref={videoRef}
            src="/opening_jejak integritas.mp4"
            autoPlay
            playsInline
            muted={videoMuted}
            onEnded={() => {
              setShowIntro(false);
              sessionStorage.setItem('introWatched', 'true');
            }}
            onClick={(e) => {
              e.stopPropagation(); // Avoid double trigger with wrapper onClick
              setShowIntro(false);
              sessionStorage.setItem('introWatched', 'true');
              playHomeLobbyMusic();
            }}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div
        className="flex flex-col items-center justify-center min-h-screen p-6 font-sans relative overflow-hidden bg-slate-100"
      >
        {/* Background Video (Muted, Loop like a GIF) */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <video
            src="/home_jejak integritas.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 62%' }}
          />
          {/* Semi-transparent Overlay backdrop for screen readability */}
          <div className="absolute inset-0 bg-white/5 pointer-events-none" />
        </div>

        {/* Top Left: Logo */}
        <div
          className="absolute z-20"
          style={{ top: '1.31rem', left: '1.23rem' }}
        >
          <img
            src="/logo_jejak integritas-no-bg.webp"
            alt="Jejak Integritas Logo"
            style={{ width: layoutConfig.logoWidth }}
            className="h-auto object-contain"
          />
        </div>

        {/* Bottom Right / Top Right (Mobile): Info / Tutorial Button */}
        <button
          onClick={() => setIsTutorialOpen(true)}
          className="absolute z-20 hover:scale-105 active:scale-95 transition-all cursor-pointer bg-transparent border-0 p-0 outline-none focus:outline-none"
          style={{
            top: layoutConfig.infoTop,
            bottom: layoutConfig.infoBottom,
            right: layoutConfig.infoRight,
            width: layoutConfig.infoWidth,
            height: layoutConfig.infoHeight,
          }}
        >
          <img
            src="/tombol_info.webp"
            alt="Panduan Bermain"
            className="w-full h-full object-contain"
          />
        </button>

        {/* Center-Bottom: Play Button Graphic */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setCurtainActive(true);
            setTimeout(() => {
              router.push('/game');
            }, 600);
          }}
          className="absolute z-20 hover:scale-105 active:scale-95 transition-all cursor-pointer block bg-transparent border-0 p-0 outline-none focus:outline-none animate-breath"
          style={{
            bottom: layoutConfig.playBottom,
            left: '50%',
            transform: 'translateX(-50%)',
            width: layoutConfig.playWidth,
            height: layoutConfig.playHeight,
          }}
        >
          <img
            src="/tombol_play.png"
            alt="Mulai Bermain"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </button>



        {/* TUTORIAL MODAL POPUP */}
        {isTutorialOpen && (
          <div
            onClick={() => setIsTutorialOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[82vh] overflow-y-auto p-6 sm:p-10 animate-slide-up text-left text-slate-700 font-sans cursor-default"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b-2 border-slate-100 pb-5 mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 flex items-center gap-3">
                  📖 PANDUAN BERMAIN
                </h2>
                <button
                  onClick={() => setIsTutorialOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors text-xl font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="space-y-10 text-slate-650 text-sm sm:text-base leading-relaxed font-semibold">

                {/* Section 1: Tujuan */}
                <section className="space-y-3">
                  <h3 className="text-indigo-950 font-black text-lg sm:text-xl flex items-center gap-2">
                    1. Tujuan Permainan 🎯
                  </h3>
                  <p className="text-slate-650 text-sm sm:text-base leading-relaxed font-medium">
                    Tujuan utama permainan ini adalah mengumpulkan skor integritas tertinggi dengan menjawab pertanyaan kuis edukatif seputar antikorupsi di sepanjang papan permainan.
                  </p>
                  <div className="p-4 bg-indigo-50/50 border-l-4 border-indigo-500 rounded-r-xl space-y-2">
                    <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed">
                      💡 <span className="font-extrabold text-indigo-900">Catatan Penting:</span>
                    </p>
                    <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 font-medium space-y-1.5">
                      <li>Pemain pertama yang mencapai <span className="text-indigo-600 font-extrabold">Kotak 50 (FINISH)</span> akan mengakhiri permainan.</li>
                      <li>Namun, pemenang akhir bukanlah orang yang paling cepat sampai, melainkan <span className="text-indigo-600 font-extrabold">pemain dengan akumulasi skor tertinggi</span> di akhir permainan! Jadi, bermainlah secara bijak dan jawab setiap kuis dengan tepat.</li>
                    </ul>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* Section 2: Kotak Warna */}
                <section className="space-y-4">
                  <h3 className="text-indigo-950 font-black text-lg sm:text-xl flex items-center gap-2">
                    2. Makna Kotak Warna-Warni 🟦
                  </h3>
                  <p className="text-slate-650 text-sm sm:text-base leading-relaxed font-medium">
                    Setiap petak warna di papan mewakili kategori kuis edukasi antikorupsi yang berbeda. Mendarat di petak ini akan memicu kuis:
                  </p>
                  <div className="space-y-3.5">
                    {/* Blue */}
                    <div className="flex gap-4 p-4 bg-blue-50/50 border-l-4 border-blue-500 rounded-r-xl">
                      <span className="text-2xl select-none">🔵</span>
                      <div>
                        <h4 className="font-extrabold text-blue-900 text-sm sm:text-base">Kotak Nilai PAK</h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium leading-relaxed">
                          Menguji pemahaman tentang 9 nilai integritas dasar (Jujur, Peduli, Mandiri, Disiplin, Tanggung Jawab, Kerja Keras, Sederhana, Berani, Adil) dalam kehidupan akademik dan personal.
                        </p>
                      </div>
                    </div>

                    {/* Red */}
                    <div className="flex gap-4 p-4 bg-red-50/50 border-l-4 border-red-500 rounded-r-xl">
                      <span className="text-2xl select-none">🔴</span>
                      <div>
                        <h4 className="font-extrabold text-red-900 text-sm sm:text-base">Kotak Pelanggaran</h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium leading-relaxed">
                          Menganalisis skenario tindakan kecurangan, korupsi, kolusi, serta berbagai bentuk pelanggaran integritas lainnya di masyarakat.
                        </p>
                      </div>
                    </div>

                    {/* Yellow */}
                    <div className="flex gap-4 p-4 bg-yellow-50/60 border-l-4 border-yellow-500 rounded-r-xl">
                      <span className="text-2xl select-none">🟡</span>
                      <div>
                        <h4 className="font-extrabold text-yellow-900 text-sm sm:text-base">Kotak Dilema Moral</h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium leading-relaxed">
                          Menantang Anda mengambil keputusan moral yang berintegritas ketika dihadapkan pada situasi rumit sehari-hari.
                        </p>
                      </div>
                    </div>

                    {/* Green */}
                    <div className="flex gap-4 p-4 bg-green-50/50 border-l-4 border-green-500 rounded-r-xl">
                      <span className="text-2xl select-none">🟢</span>
                      <div>
                        <h4 className="font-extrabold text-green-900 text-sm sm:text-base">Kotak Kearifan Lokal</h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium leading-relaxed">
                          Menyelami nilai-nilai kebaikan, kearifan adat, peribahasa daerah, serta norma budaya tradisional di Indonesia.
                        </p>
                      </div>
                    </div>

                    {/* Purple */}
                    <div className="flex gap-4 p-4 bg-purple-50/50 border-l-4 border-purple-500 rounded-r-xl">
                      <span className="text-2xl select-none">🟣</span>
                      <div>
                        <h4 className="font-extrabold text-purple-900 text-sm sm:text-base">Kotak Aksi</h4>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium leading-relaxed">
                          Tindakan nyata dan langkah aktif pencegahan korupsi yang dapat diterapkan siswa dalam keseharian mereka di sekolah.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* Section 3: Tangga & Ular */}
                <section className="space-y-4">
                  <h3 className="text-indigo-950 font-black text-lg sm:text-xl flex items-center gap-2">
                    3. Aturan Tangga & Ular 🪜
                  </h3>
                  <p className="text-slate-650 text-sm sm:text-base leading-relaxed font-medium">
                    Papan permainan dilengkapi dengan petak Tangga dan Ular yang memengaruhi laju pion Anda:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-2">
                      <h4 className="font-extrabold text-emerald-900 text-sm sm:text-base flex items-center gap-2">
                        🪜 Tangga (Mendaki)
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                        Jika pion mendarat di bawah kaki tangga, kuis khusus akan diberikan. Jika jawaban <span className="text-emerald-700 font-extrabold">BENAR</span>, pion langsung memanjat ke atas. Jika <span className="text-rose-500 font-extrabold">SALAH</span>, pion tetap berada di bawah.
                      </p>
                    </div>
                    <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-2">
                      <h4 className="font-extrabold text-rose-900 text-sm sm:text-base flex items-center gap-2">
                        🐍 Ular (Meluncur)
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                        Jika pion mendarat di kepala ular, kuis khusus akan diberikan. Jika jawaban <span className="text-emerald-700 font-extrabold">BENAR</span>, pion aman dan tetap berada di tempat. Jika <span className="text-rose-600 font-extrabold">SALAH</span>, pion tergelincir turun ke ujung ekor ular.
                      </p>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* Section 4: Multiplayer */}
                <section className="space-y-3">
                  <h3 className="text-indigo-950 font-black text-lg sm:text-xl flex items-center gap-2">
                    4. Mode Multiplayer Online & Bot 👥
                  </h3>
                  <p className="text-slate-650 text-sm sm:text-base leading-relaxed font-medium">
                    Nikmati keseruan bermain bersama teman-teman secara interaktif atau berlatih secara mandiri:
                  </p>
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 font-medium text-xs sm:text-sm text-slate-600 leading-relaxed">
                    <div className="flex gap-3">
                      <span className="text-xl select-none">🔄</span>
                      <p>
                        <span className="font-extrabold text-slate-800">Sinkronisasi Real-time:</span> Giliran, posisi pion, pertanyaan kuis, dan papan skor akan tersinkronisasi otomatis untuk semua perangkat di ruang lobi yang sama.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-xl select-none">🤖</span>
                      <p>
                        <span className="font-extrabold text-slate-800">Simulasi Bot:</span> Anda dapat menambahkan pemain simulasi (bot) di ruang lobi dengan menekan tombol <span className="font-extrabold text-indigo-600">+</span> untuk melatih pemahaman kuis Anda secara mandiri.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Bottom Button */}
              <div className="mt-10 border-t-2 border-slate-100 pb-2 pt-6 flex justify-end">
                <button
                  onClick={() => setIsTutorialOpen(false)}
                  className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-sm sm:text-base"
                >
                  Saya Mengerti, Mulai Main! 🎮
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PORTRAIT BLOCKER */}
        <PortraitBlocker isPortrait={isPortrait} isDesktop={isDesktop} />
      </div>
    </>
  );
}
