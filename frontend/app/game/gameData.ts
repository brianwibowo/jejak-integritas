// ============================================================
// JEJAK INTEGRITAS — Game Data
// All 90 questions, board config, snakes & ladders
// ============================================================

// --- Types ---

export type BoxType = 'biru' | 'merah' | 'kuning' | 'hijau' | 'ungu' | 'start' | 'finish';
export type ColoredBoxType = 'biru' | 'merah' | 'kuning' | 'hijau' | 'ungu';
export type Theme =
  | 'jujur'
  | 'disiplin'
  | 'tanggung_jawab'
  | 'kerja_keras'
  | 'sederhana'
  | 'mandiri'
  | 'adil'
  | 'berani'
  | 'peduli';

export interface Question {
  id: number;
  theme: Theme;
  boxType: ColoredBoxType;
  question: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface Player {
  id: number;
  name: string;
  position: number; // 1 = START, 52 = FINISH
  color: string;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  isFinished?: boolean;
  finishRank?: number;
  socketId?: string; // Optional for online socket mapping
}

export type GamePhase = 'setup' | 'rolling' | 'walking' | 'pre_question' | 'question' | 'result' | 'finished';


// --- Box Type Display Info ---

export const boxTypeInfo: Record<ColoredBoxType, { label: string; color: string }> = {
  biru: { label: 'Kotak Nilai PAK', color: '#3B82F6' },
  merah: { label: 'Kotak Pelanggaran', color: '#EF4444' },
  kuning: { label: 'Kotak Dilema Moral', color: '#EAB308' },
  hijau: { label: 'Kotak Kearifan Lokal', color: '#22C55E' },
  ungu: { label: 'Kotak Aksi', color: '#A855F7' },
};

export const themeLabels: Record<Theme, string> = {
  jujur: 'Jujur',
  disiplin: 'Disiplin',
  tanggung_jawab: 'Tanggung Jawab',
  kerja_keras: 'Kerja Keras',
  sederhana: 'Sederhana',
  mandiri: 'Mandiri',
  adil: 'Adil',
  berani: 'Berani',
  peduli: 'Peduli',
};

// --- Board Configuration ---

export const BOARD_SIZE = 52;

// Snakes: head → tail (player goes DOWN if answer is wrong)
export const snakes: Record<number, number> = {
  48: 27,
  44: 20,
  40: 16,
  36: 10,
};

// Ladders: bottom → top (player goes UP if answer is correct)
export const ladders: Record<number, number> = {
  15: 26,
  19: 38,
  23: 45,
  33: 49,
};

/**
 * Generate board layout: position 1 = START, position 52 = FINISH.
 * Positions 2–51 (50 boxes) are distributed evenly among 5 colors.
 * Uses seeded PRNG for deterministic but shuffled distribution.
 */
export function generateBoard(seed: number = 42): BoxType[] {
  const colors: ColoredBoxType[] = ['biru', 'merah', 'kuning', 'hijau', 'ungu'];

  // Create pool: 10 of each color = 50 gameplay squares for positions 2-51
  const pool: ColoredBoxType[] = [];
  for (let c = 0; c < colors.length; c++) {
    for (let j = 0; j < 10; j++) {
      pool.push(colors[c]);
    }
  }

  // Seeded Fisher-Yates shuffle
  let s = seed;
  for (let i = pool.length - 1; i > 0; i--) {
    s = Math.abs((s * 16807 + 1) % 2147483647);
    const j = s % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // board[0] = position 1 (start), board[51] = position 52 (finish)
  const board: BoxType[] = ['start', ...pool, 'finish'];
  return board;
}

// --- Helper Functions ---

/**
 * Get a random question matching the given box type,
 * avoiding already-used question IDs.
 */
export function getRandomQuestion(
  boxType: ColoredBoxType,
  usedIds: number[]
): Question | null {
  const available = questions.filter(
    (q) => q.boxType === boxType && !usedIds.includes(q.id)
  );

  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }

  // Fallback: if all questions of this type are used, allow repeats
  const allOfType = questions.filter((q) => q.boxType === boxType);
  if (allOfType.length === 0) return null;
  return allOfType[Math.floor(Math.random() * allOfType.length)];
}

// ============================================================
// BANK SOAL — 90 Questions (9 themes × 10 questions)
// ============================================================

export const questions: Question[] = [
  // ===================== JUJUR (ID 1–10) =====================
  {
    id: 1,
    theme: 'jujur',
    boxType: 'biru',
    question: 'Mengatakan hal yang sesuai dengan kenyataan disebut…',
    options: ['Disiplin', 'Tanggung jawab', 'Jujur', 'Peduli'],
    answer: 2,

    explanation: '-',
  },
  {
    id: 2,
    theme: 'jujur',
    boxType: 'merah',
    question:
      'Budi lupa mengerjakan PR karena bermain game. Ketika ditanya guru, sikap terbuka yang benar adalah…',
    options: [
      'Berbohong agar tidak dihukum',
      'Mengaku sakit',
      'Mengakui kesalahan dengan jujur',
      'Menyalahkan teman',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 3,
    theme: 'jujur',
    boxType: 'kuning',
    question:
      'Rina menemukan dompet di halaman sekolah. Tidak ada orang yang melihatnya. Sikap yang mencerminkan kejujuran adalah…',
    options: [
      'Mengambil uangnya saja',
      'Menyimpan dompet tersebut',
      'Mengembalikan kepada guru atau pemiliknya',
      'Membiarkannya di tempat',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 4,
    theme: 'jujur',
    boxType: 'hijau',
    question:
      'Dalam budaya Jawa dikenal nilai eling lan waspada, yaitu selalu sadar diri dan berani bertanggung jawab atas perbuatan sendiri. Sikap terbuka dalam kehidupan sehari-hari sesuai dengan nilai tersebut adalah…',
    options: [
      'Menyembunyikan kesalahan agar tidak dimarahi',
      'Mengakui kesalahan yang dilakukan dengan jujur',
      'Menutupi fakta agar terlihat baik',
      'Menghindari masalah dan tidak mau bertanggung jawab',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 5,
    theme: 'jujur',
    boxType: 'ungu',
    question:
      'Siswa yang tidak mencontek saat ujian meskipun teman-temannya melakukannya menunjukkan sikap…',
    options: [
      'Takut ketahuan',
      'Menghargai diri sendiri dan jujur',
      'Tidak peduli teman',
      'Ingin terlihat berbeda',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 6,
    theme: 'jujur',
    boxType: 'biru',
    question: 'Sikap jujur sangat penting karena…',
    options: [
      'Membuat kita disukai semua orang',
      'Menghindarkan dari hukuman saja',
      'Membentuk pribadi berintegritas',
      'Membuat kita terkenal',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 7,
    theme: 'jujur',
    boxType: 'merah',
    question: 'Perilaku tidak jujur seperti korupsi dapat merugikan…',
    options: ['Diri sendiri saja', 'Teman saja', 'Masyarakat luas', 'Guru saja'],
    answer: 2,

    explanation: '-',
  },
  {
    id: 8,
    theme: 'jujur',
    boxType: 'kuning',
    question:
      'Saat guru bertanya siapa yang memecahkan kaca kelas, Andi sebenarnya tahu pelakunya adalah dirinya sendiri. Sikap jujur yang seharusnya dilakukan Andi adalah…',
    options: [
      'Diam agar tidak dimarahi',
      'Menyalahkan teman lain',
      'Mengakui perbuatannya kepada guru',
      'Menunggu sampai guru mengetahui sendiri',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 9,
    theme: 'jujur',
    boxType: 'hijau',
    question:
      'Dalam budaya Jawa dikenal nilai isin. Mengapa kita harus tetap jujur meskipun tidak ada yang melihat?',
    options: [
      'Agar dipuji orang lain',
      'Karena takut dihukum',
      'Karena menghargai diri sendiri dan memiliki rasa malu',
      'Agar terlihat baik di depan orang lain',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 10,
    theme: 'jujur',
    boxType: 'ungu',
    question: 'Contoh tindakan jujur di sekolah adalah…',
    options: [
      'Titip absen kepada teman',
      'Mencontek saat ujian',
      'Mengumpulkan tugas hasil kerja sendiri',
      'Menyalin pekerjaan teman',
    ],
    answer: 2,

    explanation: '-',
  },

  // ===================== DISIPLIN (ID 11–20) =====================
  {
    id: 11,
    theme: 'disiplin',
    boxType: 'biru',
    question: 'Sikap disiplin dapat mencegah perilaku korupsi karena…',
    options: [
      'Membuat kita terkenal',
      'Membiasakan taat aturan dan tanggung jawab',
      'Membuat kita disukai teman',
      'Menghindari hukuman saja',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 12,
    theme: 'disiplin',
    boxType: 'merah',
    question:
      'Sinta sering datang terlambat ke sekolah dan beralasan macet, padahal ia bangun kesiangan. Apa sikap disiplin yang seharusnya dilakukan?',
    options: [
      'Terus menggunakan alasan',
      'Datang sesuka hati',
      'Bangun lebih awal agar tepat waktu',
      'Menyalahkan keadaan',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 13,
    theme: 'disiplin',
    boxType: 'kuning',
    question:
      'Raka berjanji akan mengerjakan tugas kelompok. Namun, ia lebih memilih bermain game dan berharap temannya menyelesaikan tugas tersebut. Apa yang seharusnya dilakukan Raka?',
    options: [
      'Membiarkan teman mengerjakan',
      'Mengerjakan sebagian saja',
      'Menepati janji dan ikut bertanggung jawab',
      'Tidak ikut terlibat',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 14,
    theme: 'disiplin',
    boxType: 'hijau',
    question:
      'Dalam pepatah Jawa Jer basuki mawa beya (keberhasilan membutuhkan usaha), Roni merasa tugas IPS sulit dan ingin menyalin dari temannya. Apa yang seharusnya dilakukan Roni?',
    options: [
      'Menyalin agar cepat selesai',
      'Membiarkan tugas tidak dikerjakan',
      'Berusaha mengerjakan sendiri meskipun sulit',
      'Menunggu jawaban dari teman',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 15,
    theme: 'disiplin',
    boxType: 'ungu',
    question:
      'Rafi berjanji kepada guru untuk mengumpulkan tugas tepat waktu. Meskipun sedang malas, ia tetap mengerjakan tugasnya. Sikap Rafi menunjukkan…',
    options: ['Ketakutan', 'Komitmen', 'Kepedulian', 'Keberanian'],
    answer: 1,

    explanation: '-',
  },
  {
    id: 16,
    theme: 'disiplin',
    boxType: 'biru',
    question:
      'Siswa yang tidak mencontek saat ujian meskipun tidak diawasi menunjukkan sikap…',
    options: ['Takut', 'Taat aturan', 'Ingin dipuji', 'Terpaksa'],
    answer: 1,

    explanation: '-',
  },
  {
    id: 17,
    theme: 'disiplin',
    boxType: 'merah',
    question:
      'Saat ujian mendekat, kamu belum belajar. Temanmu menawarkan jawaban saat ujian nanti. Apa yang seharusnya kamu lakukan?',
    options: [
      'Menerima bantuan',
      'Mengandalkan teman',
      'Belajar meskipun waktunya sedikit',
      'Tidak peduli',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 18,
    theme: 'disiplin',
    boxType: 'kuning',
    question:
      'Saat ujian, Andi tergoda melihat jawaban temannya karena tidak fokus belajar sebelumnya. Apa tindakan yang menunjukkan disiplin?',
    options: [
      'Mencontek',
      'Bertanya pada teman',
      'Mengerjakan sesuai kemampuan sendiri',
      'Menyerah',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 19,
    theme: 'disiplin',
    boxType: 'hijau',
    question:
      'Filosofi Jawa ajining diri saka lathi berarti harga diri dilihat dari ucapan dan perilaku. Rina sering berkata akan belajar setiap hari, tetapi tidak pernah melakukannya. Apa sikap yang benar?',
    options: [
      'Tetap berjanji tanpa melakukan',
      'Mengabaikan',
      'Menepati ucapan dengan tindakan yang konsisten',
      'Menyalahkan keadaan',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 20,
    theme: 'disiplin',
    boxType: 'ungu',
    question:
      'Andi membuat jadwal belajar agar semua tugasnya selesai tepat waktu. Hal tersebut menunjukkan sikap…',
    options: [
      'Malas',
      'Disiplin dalam perencanaan',
      'Terpaksa',
      'Tidak percaya diri',
    ],
    answer: 1,

    explanation: '-',
  },

  // ===================== TANGGUNG JAWAB (ID 21–30) =====================
  {
    id: 21,
    theme: 'tanggung_jawab',
    boxType: 'biru',
    question:
      'Seorang siswa diberi tanggung jawab mengatur kegiatan kelas. Ia menghadapi banyak kendala dan tekanan dari teman. Apa sikap yang mencerminkan tanggung jawab sejati?',
    options: [
      'Menghindari tugas',
      'Menyalahkan orang lain',
      'Tetap menjalankan tugas dengan jujur dan berani',
      'Menyerah',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 22,
    theme: 'tanggung_jawab',
    boxType: 'merah',
    question:
      'Raka tanpa sengaja menjatuhkan alat praktikum hingga rusak. Tidak ada yang melihat kejadian tersebut. Ia khawatir jika mengaku akan dimarahi dan diminta mengganti. Apa tindakan paling bertanggung jawab?',
    options: [
      'Diam saja agar tidak mendapat masalah',
      'Menyalahkan teman lain',
      'Mengakui perbuatannya meskipun harus menanggung konsekuensi',
      'Membiarkan guru mencari tahu sendiri',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 23,
    theme: 'tanggung_jawab',
    boxType: 'kuning',
    question:
      'Rafi menjadi ketua kelompok, tetapi beberapa anggota tidak bekerja dengan baik. Ia bingung antara membiarkan atau memperbaiki keadaan. Apa sikap yang mencerminkan tanggung jawab?',
    options: [
      'Membiarkan anggota lain',
      'Mengerjakan sendiri tanpa komunikasi',
      'Mengajak anggota bekerja dan memastikan tugas selesai',
      'Menyerah',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 24,
    theme: 'tanggung_jawab',
    boxType: 'hijau',
    question:
      'Di kelas, kamu ditunjuk sebagai bendahara untuk menyimpan uang kas. Temanmu meminta meminjam uang kas untuk keperluan pribadi dan berjanji akan mengembalikannya. Dalam budaya Jawa dikenal nilai tepo seliro (tenggang rasa). Apa yang sebaiknya kamu lakukan?',
    options: [
      'Memberikan uang kas karena kasihan pada teman',
      'Menolak dengan sopan karena uang tersebut adalah amanah bersama',
      'Memberikan sebagian saja agar tidak mengecewakan',
      'Membiarkan teman mengambil sendiri uang kas',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 25,
    theme: 'tanggung_jawab',
    boxType: 'ungu',
    question:
      'Sinta dipercaya menjadi bendahara kelas. Ia menemukan selisih uang kas, tetapi jika dilaporkan, ia takut dianggap tidak becus. Apa yang seharusnya dilakukan Sinta?',
    options: [
      'Menutupinya agar tidak disalahkan',
      'Menggunakan uang lain untuk menutupi tanpa laporan',
      'Melaporkan secara jujur dan mencari solusi bersama',
      'Mengabaikan masalah tersebut',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 26,
    theme: 'tanggung_jawab',
    boxType: 'biru',
    question:
      'Saat ujian, kamu melihat kesalahan pada lembar jawabanmu yang bisa diperbaiki jika mencontek. Tidak ada pengawas. Apa tindakan terbaik?',
    options: [
      'Mencontek',
      'Membiarkan saja',
      'Tetap jujur meskipun nilainya kecil',
      'Mengikuti teman',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 27,
    theme: 'tanggung_jawab',
    boxType: 'merah',
    question:
      'Dina ketahuan tidak mengerjakan tugas karena lalai. Ia punya kesempatan untuk berbohong agar tidak dihukum. Apa keputusan yang paling tepat?',
    options: [
      'Berbohong agar aman',
      'Menghindar dari guru',
      'Jujur dan menerima konsekuensi',
      'Menyalahkan keadaan',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 28,
    theme: 'tanggung_jawab',
    boxType: 'kuning',
    question:
      'Seorang siswa mengetahui temannya melakukan kecurangan dalam lomba. Jika melapor, ia takut dijauhi teman. Apa tindakan yang paling bertanggung jawab?',
    options: [
      'Diam saja',
      'Ikut menutupi',
      'Menyampaikan dengan cara yang tepat',
      'Menghindari masalah',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 29,
    theme: 'tanggung_jawab',
    boxType: 'hijau',
    question:
      'Kamu mendapat tugas kelompok, tetapi tidak mengerjakan bagianmu. Saat presentasi, kelompokmu mendapat nilai rendah. Dalam budaya Jawa dikenal nilai nrimo ing pandum (menerima dengan lapang dada). Apa sikap yang tepat?',
    options: [
      'Menyalahkan anggota lain',
      'Mengelak dan mencari alasan',
      'Mengakui kesalahan dan berjanji memperbaiki',
      'Diam saja tanpa peduli',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 30,
    theme: 'tanggung_jawab',
    boxType: 'ungu',
    question:
      'Dalam kerja kelompok, tugas belum selesai karena Andi tidak mengerjakan bagiannya. Saat guru bertanya, Andi ingin beralasan agar tidak disalahkan. Apa sikap yang benar?',
    options: [
      'Menyalahkan anggota lain',
      'Beralasan agar tidak dimarahi',
      'Mengakui kesalahan dan siap memperbaiki',
      'Diam saja',
    ],
    answer: 2,

    explanation: '-',
  },

  // ===================== KERJA KERAS (ID 31–40) =====================
  {
    id: 31,
    theme: 'kerja_keras',
    boxType: 'biru',
    question:
      'Kelompok Dina mendapat tugas membuat proyek IPS yang cukup sulit. Apa yang sebaiknya dilakukan Dina?',
    options: [
      'Menunggu teman lain mengerjakan',
      'Menyalin dari internet tanpa memahami',
      'Mengerjakan secara bertahap dengan tekun',
      'Tidak ikut terlibat',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 32,
    theme: 'kerja_keras',
    boxType: 'merah',
    question:
      'Kelompokmu belum menyelesaikan proyek. Salah satu anggota mengusulkan menyalin dari internet agar cepat selesai. Apa keputusan terbaik jika mempertimbangkan kerja keras dan integritas?',
    options: [
      'Menyalin agar tugas selesai tepat waktu',
      'Menunda pengumpulan tugas',
      'Tetap mengerjakan sendiri meskipun sederhana',
      'Membiarkan satu orang mengerjakan semuanya',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 33,
    theme: 'kerja_keras',
    boxType: 'kuning',
    question:
      'Rafi mengikuti lomba karya tulis. Ia sudah berusaha keras, tetapi hasilnya belum maksimal. Temannya menawarkan karya jadi dari internet yang bisa langsung dikumpulkan agar menang. Apa keputusan terbaik yang mencerminkan kerja keras dan integritas?',
    options: [
      'Menggunakan karya tersebut agar menang lomba',
      'Menggabungkan sedikit hasil sendiri dengan karya dari internet',
      'Tetap menggunakan hasil sendiri dan memperbaikinya semampunya',
      'Tidak jadi ikut lomba karena merasa kalah',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 34,
    theme: 'kerja_keras',
    boxType: 'hijau',
    question:
      'Dalam pepatah Jawa "Jer Basuki Mawa Beya" (keberhasilan membutuhkan usaha), Ardi sedang mengikuti lomba IPS. Ia merasa lelah dan ingin mengambil jalan pintas dengan menyalin karya orang lain. Apa keputusan yang paling tepat?',
    options: [
      'Menyalin karya agar cepat selesai',
      'Menggabungkan sedikit karya sendiri dengan milik orang lain',
      'Tetap berusaha menyelesaikan sendiri meskipun sulit',
      'Mengundurkan diri dari lomba',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 35,
    theme: 'kerja_keras',
    boxType: 'ungu',
    question:
      'Doni sudah belajar keras untuk ujian, tetapi nilainya masih di bawah teman yang menyontek. Apa sikap paling tepat?',
    options: [
      'Ikut menyontek di ujian berikutnya',
      'Protes keras kepada guru',
      'Tetap belajar dan memperbaiki cara belajar',
      'Menyalahkan sistem ujian',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 36,
    theme: 'kerja_keras',
    boxType: 'biru',
    question:
      'Nilai tugasmu rendah padahal kamu merasa sudah belajar. Apa langkah paling tepat?',
    options: [
      'Menyalahkan guru',
      'Menyalin tugas di kesempatan berikutnya',
      'Mengevaluasi cara belajar dan mencoba strategi baru',
      'Mengabaikan nilai tersebut',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 37,
    theme: 'kerja_keras',
    boxType: 'merah',
    question:
      'Dalam kerja kelompok, dua anggota tidak bekerja. Kamu bisa melaporkan mereka atau diam saja agar tidak terjadi konflik. Apa tindakan terbaik?',
    options: [
      'Diam agar kelompok tetap aman',
      'Mengerjakan semuanya sendiri',
      'Mengajak mereka berdiskusi dan membagi tugas secara adil',
      'Mengeluarkan mereka dari kelompok tanpa bicara',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 38,
    theme: 'kerja_keras',
    boxType: 'kuning',
    question:
      'Seorang siswa memiliki dua pilihan: (1) Belajar dengan sungguh-sungguh tetapi hasil belum pasti, (2) Menggunakan cara curang dengan hasil tinggi. Jika ia memilih kerja keras, apa prinsip utama yang dipegang?',
    options: [
      'Hasil lebih penting daripada proses',
      'Proses jujur lebih bernilai daripada hasil instan',
      'Semua cara boleh dilakukan',
      'Nilai tinggi adalah tujuan utama',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 39,
    theme: 'kerja_keras',
    boxType: 'hijau',
    question:
      'Pepatah "Sapa temen bakal tinemu" berarti siapa yang bersungguh-sungguh akan berhasil. Rina kesulitan memahami materi IPS dan tergoda menyontek saat ujian. Apa sikap yang sesuai dengan nilai tersebut?',
    options: [
      'Menyontek agar nilainya baik',
      'Berusaha belajar dan mengerjakan sendiri',
      'Meminta jawaban dari teman',
      'Tidak mengerjakan soal',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 40,
    theme: 'kerja_keras',
    boxType: 'ungu',
    question:
      'Teman-temanmu menganggap belajar terlalu serius itu "tidak keren" dan mengajakmu untuk santai saja menjelang ujian. Apa sikap terbaik?',
    options: [
      'Mengikuti mereka agar tidak dikucilkan',
      'Belajar diam-diam tetapi tetap ikut malas-malasan',
      'Tetap fokus belajar meskipun berbeda dari teman',
      'Tidak belajar sama sekali',
    ],
    answer: 2,

    explanation: '-',
  },

  // ===================== SEDERHANA (ID 41–50) =====================
  {
    id: 41,
    theme: 'sederhana',
    boxType: 'merah',
    question:
      'Reno ingin mengikuti lomba sekolah. Ia melihat temannya menggunakan perlengkapan mahal agar terlihat lebih hebat, padahal Reno memiliki perlengkapan sederhana yang masih layak. Apa sikap yang paling tepat?',
    options: [
      'Membeli perlengkapan mahal agar terlihat setara',
      'Menggunakan perlengkapan sederhana dan fokus pada kemampuan',
      'Meminjam barang mahal dari teman agar terlihat bagus',
      'Tidak jadi ikut lomba',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 42,
    theme: 'sederhana',
    boxType: 'merah',
    question:
      'Setelah berhasil menjadi juara kelas, Dinda sering memamerkan prestasinya kepada teman-teman. Apa sikap yang mencerminkan kesederhanaan?',
    options: [
      'Terus menunjukkan prestasi agar dihargai',
      'Bersikap biasa saja dan tetap rendah hati',
      'Membandingkan diri dengan teman lain',
      'Menganggap diri paling hebat',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 43,
    theme: 'sederhana',
    boxType: 'kuning',
    question:
      'Teman-temanmu sering membawa barang mahal ke sekolah. Kamu merasa tidak percaya diri dengan barang sederhana yang kamu miliki. Apa keputusan yang paling tepat?',
    options: [
      'Memaksa orang tua membeli barang mahal',
      'Meminjam barang teman agar terlihat sama',
      'Tetap menggunakan barang yang ada dengan percaya diri',
      'Tidak mau bergaul dengan teman',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 44,
    theme: 'sederhana',
    boxType: 'hijau',
    question:
      'Kelompokmu diminta membuat presentasi. Ada usulan untuk menambahkan data yang dilebih-lebihkan agar terlihat lebih bagus. Apa sikap terbaik?',
    options: [
      'Menyetujui agar presentasi menarik',
      'Menambahkan sedikit saja agar bagus',
      'Menolak dan tetap menyajikan data apa adanya',
      'Membiarkan anggota lain memutuskan',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 45,
    theme: 'sederhana',
    boxType: 'ungu',
    question:
      'Dalam laporan kegiatan, kelompokmu diminta melaporkan penggunaan dana. Ada sisa uang yang cukup banyak. Apa yang sebaiknya dilakukan?',
    options: [
      'Mengubah laporan agar terlihat habis',
      'Membagi sisa uang di antara anggota',
      'Melaporkan sesuai kenyataan apa adanya',
      'Menyembunyikan sisa uang agar tidak ketahuan',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 46,
    theme: 'sederhana',
    boxType: 'biru',
    question:
      'Sekolah memberikan dana untuk membuat proyek kelompok. Ketua kelompok ingin membeli bahan yang mahal agar terlihat lebih menarik, padahal ada alternatif lebih sederhana. Apa keputusan terbaik?',
    options: [
      'Menggunakan semua dana agar hasil terlihat mewah',
      'Menggunakan bahan sesuai kebutuhan dan efisien',
      'Menyimpan sisa dana untuk kepentingan pribadi',
      'Membeli bahan mahal agar mendapat pujian',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 47,
    theme: 'sederhana',
    boxType: 'kuning',
    question:
      '"Ojo Dumeh" Jangan merasa sombong. Sekolahmu mengadakan pameran proyek. Beberapa kelompok sengaja menghias stan secara berlebihan agar terlihat paling menarik, bahkan menggunakan dana di luar kebutuhan. Kelompokmu memiliki pilihan untuk melakukan hal yang sama. Apa keputusan yang paling tepat?',
    options: [
      'Menghias semewah mungkin agar terlihat unggul',
      'Mengikuti kelompok lain agar tidak kalah',
      'Menampilkan hasil sederhana namun sesuai isi dan usaha',
      'Mengurangi isi proyek agar fokus pada tampilan',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 48,
    theme: 'sederhana',
    boxType: 'hijau',
    question:
      '"Andhap Asor" memiliki nilai rendah hati, tidak sombong, dan menghargai orang lain. Setelah presentasi, kelompokmu mendapat pujian dari guru. Teman kelompok lain terlihat kurang percaya diri. Apa sikap yang paling tepat?',
    options: [
      'Membanggakan diri di depan teman',
      'Membandingkan hasil dengan kelompok lain',
      'Tetap rendah hati dan menghargai usaha kelompok lain',
      'Mengabaikan kelompok lain',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 49,
    theme: 'sederhana',
    boxType: 'biru',
    question:
      'Kamu mendapat uang saku lebih dari orang tua untuk keperluan sekolah, tetapi tidak semuanya terpakai. Apa yang sebaiknya kamu lakukan?',
    options: [
      'Menghabiskan semuanya agar tidak terlihat sisa',
      'Menggunakan untuk hal yang tidak perlu',
      'Menyimpan atau mengembalikan sisa dengan jujur',
      'Memberikan kepada teman tanpa alasan jelas',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 50,
    theme: 'sederhana',
    boxType: 'ungu',
    question:
      'Kamu mendapat pujian dari guru karena hasil tugasmu yang sangat baik. Sikap apa yang mencerminkan kesederhanaan?',
    options: [
      'Menunjukkan bahwa kelompokmu lebih unggul',
      'Menganggap diri paling pintar',
      'Menerima pujian dengan rendah hati dan tetap belajar',
      'Meremehkan teman lain',
    ],
    answer: 2,

    explanation: '-',
  },

  // ===================== MANDIRI (ID 51–60) =====================
  {
    id: 51,
    theme: 'mandiri',
    boxType: 'biru',
    question:
      'Perilaku tidak mandiri dalam belajar dapat berhubungan dengan perilaku koruptif karena...',
    options: [
      'Kemampuan belajarnya meningkat',
      'Membiasakan ketergantungan dan mencari jalan instan',
      'Tidak berpengaruh pada karakter',
      'Hanya terjadi di sekolah',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 52,
    theme: 'mandiri',
    boxType: 'merah',
    question:
      'Seorang siswa terbiasa menyalin pekerjaan teman setiap kali mendapat tugas. Kemungkinan akibat dari kebiasaan tersebut adalah...',
    options: [
      'Membuat siswa lebih cepat berhasil',
      'Ia menjadi lebih mandiri',
      'Ia kesulitan saat menghadapi tugas individu',
      'Nilainya selalu stabil',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 53,
    theme: 'mandiri',
    boxType: 'kuning',
    question:
      'Seorang siswa menggunakan jasa orang lain untuk membuat tugasnya. Ia mendapatkan nilai tinggi tetapi tidak memahami materi. Keputusan tersebut dapat dinilai sebagai...',
    options: [
      'Tepat karena hasilnya bagus',
      'Kurang tepat karena menghambat kemandirian belajar',
      'Wajar karena semua siswa melakukannya',
      'Tidak masalah selama nilainya tinggi',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 54,
    theme: 'mandiri',
    boxType: 'hijau',
    question:
      'Dalam budaya Jawa dikenal prinsip "ora gumantung marang wong liya" (tidak bergantung pada orang lain). Doni selalu meminta temannya mengerjakan tugas karena merasa lebih cepat selesai. Jika dilihat dari nilai tersebut, sikap Doni menunjukkan...',
    options: [
      'Kerja sama yang baik',
      'Efisiensi dalam belajar',
      'Ketergantungan dan kurang mandiri',
      'Sikap saling membantu',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 55,
    theme: 'mandiri',
    boxType: 'ungu',
    question:
      'Dua siswa memiliki cara berbeda dalam mengerjakan tugas: Siswa A selalu mengerjakan sendiri meskipun hasilnya belum sempurna, sedangkan Siswa B sering meminta orang lain mengerjakan agar hasilnya bagus. Dampak jangka panjang yang paling mungkin terjadi adalah...',
    options: [
      'Keduanya memiliki kemampuan yang sama',
      'Siswa B lebih berkembang karena hasilnya bagus',
      'Siswa A lebih berkembang karena terbiasa mandiri',
      'Tidak ada perbedaan',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 56,
    theme: 'mandiri',
    boxType: 'biru',
    question:
      'Seorang siswa selalu merasa tidak mampu sehingga terus bergantung pada bantuan orang lain. Sikap yang perlu dikembangkan agar lebih mandiri adalah...',
    options: [
      'Rasa takut gagal',
      'Ketergantungan',
      'Percaya diri',
      'Menghindari tantangan',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 57,
    theme: 'mandiri',
    boxType: 'merah',
    question: 'Perilaku berikut yang paling menunjukkan sikap tidak mandiri adalah...',
    options: [
      'Bertanya kepada guru saat tidak paham',
      'Belajar sendiri sebelum ujian',
      'Menyalin seluruh tugas dari teman',
      'Mencoba mengerjakan meskipun sulit',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 58,
    theme: 'mandiri',
    boxType: 'kuning',
    question:
      'Dalam ujian, kamu ragu dengan jawaban sendiri. Temanmu memberikan kode jawaban yang tampak benar. Jika kamu ingin melatih kemandirian, pilihan terbaik adalah...',
    options: [
      'Mengikuti jawaban teman',
      'Menggabungkan jawaban sendiri dan teman',
      'Tetap menggunakan jawaban sendiri',
      'Mengosongkan jawaban',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 59,
    theme: 'mandiri',
    boxType: 'hijau',
    question:
      'Pepatah "ajining diri saka lathi lan tumindak" mengajarkan bahwa harga diri dilihat dari ucapan dan tindakan. Saat presentasi, Sinta memilih meminta temannya menggantikan karena tidak percaya diri. Jika dikaitkan dengan nilai mandiri, tindakan yang seharusnya dilakukan adalah...',
    options: [
      'Membiarkan teman menggantikan',
      'Menunda presentasi',
      'Mencoba presentasi sendiri dengan percaya diri',
      'Tidak mengikuti presentasi',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 60,
    theme: 'mandiri',
    boxType: 'ungu',
    question:
      'Seorang siswa dihadapkan pada dua pilihan: (1) Nilai tinggi dengan bantuan orang lain, (2) Nilai cukup dengan usaha sendiri. Jika dilihat dari nilai mandiri, pilihan yang lebih tepat adalah...',
    options: [
      'Nilai tinggi lebih penting',
      'Usaha sendiri lebih penting',
      'Keduanya sama saja',
      'Tergantung situasi',
    ],
    answer: 1,

    explanation: '-',
  },

  // ===================== ADIL (ID 61–70) =====================
  {
    id: 61,
    theme: 'adil',
    boxType: 'biru',
    question:
      'Dalam lomba kelas, juri memberikan nilai lebih tinggi kepada siswa yang dikenal dekat dengannya. Keputusan juri tersebut menunjukkan bahwa ia...',
    options: [
      'Bersikap objektif',
      'Bersikap adil',
      'Tidak memihak',
      'Bersikap pilih kasih',
    ],
    answer: 3,

    explanation: '-',
  },
  {
    id: 62,
    theme: 'adil',
    boxType: 'merah',
    question: 'Perilaku berikut yang paling mencerminkan sikap objektif adalah...',
    options: [
      'Memberi nilai berdasarkan kedekatan',
      'Menilai berdasarkan perasaan',
      'Menilai berdasarkan kriteria yang jelas',
      'Mengikuti pendapat mayoritas',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 63,
    theme: 'adil',
    boxType: 'kuning',
    question:
      'Seorang ketua kelas membagi tugas kelompok sebagai berikut: Siswa yang aktif mendapat tugas lebih banyak, sedangkan siswa yang kurang aktif mendapat tugas lebih sedikit. Keputusan ini dapat dinilai...',
    options: [
      'Tidak adil karena tugas tidak sama',
      'Adil karena sesuai kemampuan masing-masing',
      'Tidak tepat karena semua harus sama',
      'Kurang tepat karena membebani siswa aktif',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 64,
    theme: 'adil',
    boxType: 'hijau',
    question:
      'Seorang guru memberi nilai lebih tinggi kepada siswa yang mengalami kesulitan, meskipun hasilnya tidak sesuai kriteria. Keputusan ini dapat dianalisis sebagai...',
    options: [
      'Adil karena penuh kasih sayang',
      'Tidak adil karena tidak objektif',
      'Tepat karena membantu siswa',
      'Wajar karena kondisi tertentu',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 65,
    theme: 'adil',
    boxType: 'ungu',
    question:
      'Seorang guru mengetahui bahwa salah satu siswa gagal ujian karena kondisi keluarga yang sulit. Guru tersebut mempertimbangkan untuk menaikkan nilainya agar tidak tertinggal. Keputusan yang paling mencerminkan keadilan adalah...',
    options: [
      'Menaikkan nilai karena rasa kasihan',
      'Membiarkan nilai apa adanya tanpa solusi',
      'Memberi nilai sesuai hasil, tetapi memberikan kesempatan remedial',
      'Menyamakan nilai dengan siswa lain',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 66,
    theme: 'adil',
    boxType: 'biru',
    question:
      'Dalam pembagian bantuan kelas, semua siswa ingin mendapatkan bagian yang sama. Namun, ada beberapa siswa yang lebih membutuhkan. Apa keputusan yang paling adil?',
    options: [
      'Membagi sama rata agar semua puas',
      'Memberikan lebih kepada yang lebih membutuhkan',
      'Memberikan hanya kepada yang aktif',
      'Tidak membagikan sama sekali',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 67,
    theme: 'adil',
    boxType: 'merah',
    question:
      'Nilai "ojo dumeh" mengajarkan agar tidak menyalahgunakan kekuasaan. Seorang panitia lomba memberikan keuntungan kepada temannya. Perilaku ini menunjukkan...',
    options: [
      'Sikap membantu',
      'Empati',
      'Penyalahgunaan wewenang',
      'Kerja sama',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 68,
    theme: 'adil',
    boxType: 'kuning',
    question:
      'Tepa selira merupakan perasaan yang sama dengan orang lain. Seorang anggota kelompok tidak bekerja karena alasan pribadi. Anggota lain meminta agar nilainya dibedakan. Jika mempertimbangkan tepa selira (tenggang rasa) dan keadilan, keputusan terbaik adalah...',
    options: [
      'Memberi nilai sama karena kasihan',
      'Memberi nilai berbeda sesuai kontribusi',
      'Mengabaikan masalah',
      'Mengikuti keputusan mayoritas',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 69,
    theme: 'adil',
    boxType: 'hijau',
    question:
      'Dalam pembagian bantuan, seorang ketua mempertimbangkan kondisi ekonomi, jumlah anggota keluarga, dan kebutuhan masing-masing. Keputusan ini menunjukkan bahwa ia...',
    options: [
      'Tidak adil karena tidak sama',
      'Bersikap objektif dan penuh pertimbangan',
      'Memihak kelompok tertentu',
      'Tidak konsisten',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 70,
    theme: 'adil',
    boxType: 'ungu',
    question:
      'Seorang pemimpin harus memilih: Keputusan yang menyenangkan semua orang atau keputusan yang adil tetapi tidak disukai sebagian orang. Jika dilihat dari nilai keadilan, pilihan yang paling tepat adalah…',
    options: [
      'Mengutamakan perasaan semua orang',
      'Menghindari konflik',
      'Mengambil keputusan yang adil',
      'Menunda keputusan',
    ],
    answer: 2,

    explanation: '-',
  },

  // ===================== BERANI (ID 71–80) =====================
  {
    id: 71,
    theme: 'berani',
    boxType: 'biru',
    question: 'Perilaku berikut yang paling menunjukkan keberanian adalah...',
    options: [
      'Mengikuti keputusan mayoritas tanpa berpikir',
      'Menyampaikan pendapat dengan yakin meskipun berbeda',
      'Diam agar tidak salah',
      'Menunggu orang lain bertindak',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 72,
    theme: 'berani',
    boxType: 'biru',
    question:
      'Seorang siswa ragu untuk menolak ajakan menyontek karena takut dijauhi teman. Jika dilihat dari nilai berani, keputusan menolak ajakan tersebut menunjukkan bahwa ia...',
    options: [
      'Menghindari masalah',
      'Tidak menghargai teman',
      'Tidak gentar dalam mempertahankan kebenaran',
      'Tidak peduli dengan lingkungan',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 73,
    theme: 'berani',
    boxType: 'merah',
    question: 'Siswa yang tidak berani biasanya lebih mudah...',
    options: [
      'Memimpin kelompok',
      'Mengambil keputusan sendiri',
      'Terpengaruh ajakan negatif',
      'Menjadi percaya diri',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 74,
    theme: 'berani',
    boxType: 'merah',
    question: 'Keberanian dalam menolak kecurangan penting karena...',
    options: [
      'Membuat siswa terlihat berbeda',
      'Menghindari konflik',
      'Mencegah berkembangnya perilaku koruptif',
      'Mempercepat pekerjaan',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 75,
    theme: 'berani',
    boxType: 'kuning',
    question:
      'Seorang ketua kelompok mengetahui ada anggota yang tidak jujur dalam laporan. Jika ia menegur, suasana kelompok bisa menjadi tidak nyaman. Pilihan yang paling mencerminkan keberanian adalah...',
    options: [
      'Membiarkan agar suasana tetap tenang',
      'Menegur secara bijak meskipun berisiko konflik',
      'Mengabaikan masalah',
      'Menyerahkan kepada orang lain',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 76,
    theme: 'berani',
    boxType: 'kuning',
    question:
      'Seorang siswa tetap mempertahankan kejujuran meskipun sering diejek oleh teman. Sikap ini menunjukkan bahwa ia...',
    options: [
      'Tidak peduli lingkungan',
      'Tegar dalam menghadapi tekanan',
      'Tidak memiliki teman',
      'Bersikap keras',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 77,
    theme: 'berani',
    boxType: 'hijau',
    question:
      'Dalam pepatah Jawa "wani amarga bener" (berani karena benar), seorang siswa mengetahui adanya kecurangan saat ujian. Jika ia ingin menerapkan nilai tersebut, sikap yang paling tepat adalah...',
    options: [
      'Diam agar tidak dimusuhi teman',
      'Mengikuti kecurangan agar aman',
      'Melaporkan atau menolak kecurangan karena itu salah',
      'Menghindari situasi',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 78,
    theme: 'berani',
    boxType: 'hijau',
    question:
      'Pepatah "ajining diri saka tumindak" menunjukkan bahwa tindakan mencerminkan harga diri. Seorang siswa memilih diam ketika melihat ketidakjujuran karena takut terlibat. Sikap tersebut menunjukkan bahwa ia...',
    options: [
      'Menjaga hubungan sosial',
      'Menghindari konflik',
      'Belum menunjukkan keberanian dalam menjaga harga diri',
      'Bersikap bijaksana',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 79,
    theme: 'berani',
    boxType: 'ungu',
    question:
      'Seorang siswa sudah memulai proyek dengan jujur, tetapi melihat kelompok lain menggunakan cara curang dan mendapatkan hasil lebih cepat. Jika ia tetap melanjutkan dengan cara jujur, sikap tersebut menunjukkan...',
    options: [
      'Ketidakefisienan',
      'Kelemahan',
      'Sikap pantang mundur dari prinsip',
      'Kurang kerja sama',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 80,
    theme: 'berani',
    boxType: 'ungu',
    question:
      'Seorang siswa harus memilih antara mengikuti kelompok agar aman atau berdiri sendiri mempertahankan kejujuran. Pilihan yang paling mencerminkan nilai berani adalah...',
    options: [
      'Mengikuti kelompok',
      'Menunda keputusan',
      'Mempertahankan prinsip meskipun sendiri',
      'Menghindari situasi',
    ],
    answer: 2,

    explanation: '-',
  },

  // ===================== PEDULI (ID 81–90) =====================
  {
    id: 81,
    theme: 'peduli',
    boxType: 'biru',
    question:
      'Kurangnya kepedulian terhadap orang lain dapat mendorong perilaku koruptif karena...',
    options: [
      'Membuat pekerjaan lebih cepat',
      'Mengabaikan dampak tindakan terhadap orang lain',
      'Mengurangi konflik',
      'Meningkatkan efisiensi',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 82,
    theme: 'peduli',
    boxType: 'biru',
    question:
      'Perhatikan dua tindakan: (1) Membantu teman memahami pelajaran, (2) Mengerjakan tugas teman tanpa sepengetahuannya. Tindakan yang benar-benar mencerminkan empati adalah...',
    options: ['1 saja', '2 saja', 'Keduanya', 'Tidak keduanya'],
    answer: 0,

    explanation: '-',
  },
  {
    id: 83,
    theme: 'peduli',
    boxType: 'merah',
    question:
      'Dalam kerja kelompok, seorang anggota tidak bekerja karena masalah pribadi. Anggota lain merasa tidak adil jika nilainya disamakan. Keputusan yang paling mencerminkan kepedulian sekaligus tetap adil adalah...',
    options: [
      'Memberi nilai sama karena kasihan',
      'Memberi nilai berbeda tanpa mempertimbangkan kondisi',
      'Memberi kesempatan memperbaiki dengan tanggung jawab tambahan',
      'Mengabaikan masalah',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 84,
    theme: 'peduli',
    boxType: 'merah',
    question:
      'Sikap kurang peduli terhadap orang lain dalam jangka panjang dapat menyebabkan...',
    options: [
      'Hubungan sosial semakin kuat',
      'Lingkungan menjadi lebih harmonis',
      'Menurunnya rasa saling percaya',
      'Meningkatnya kerja sama',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 85,
    theme: 'peduli',
    boxType: 'kuning',
    question:
      'Seorang siswa membantu temannya mengerjakan tugas agar cepat selesai, tetapi temannya menjadi tidak belajar apa-apa. Jika dianalisis, sikap tersebut...',
    options: [
      'Murni peduli',
      'Peduli tetapi kurang tepat',
      'Tidak peduli sama sekali',
      'Sangat membantu perkembangan',
    ],
    answer: 1,

    explanation: '-',
  },
  {
    id: 86,
    theme: 'peduli',
    boxType: 'kuning',
    question:
      'Seorang siswa harus memilih antara membantu temannya yang kesulitan meskipun membutuhkan waktu tambahan, atau fokus pada dirinya sendiri agar tugas cepat selesai. Jika dilihat dari nilai peduli, pilihan yang paling tepat adalah...',
    options: [
      'Mengutamakan diri sendiri',
      'Menghindari keterlibatan',
      'Membantu dengan tetap mengatur tanggung jawab pribadi',
      'Menunda semua pekerjaan',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 87,
    theme: 'peduli',
    boxType: 'hijau',
    question:
      'Nilai "gotong royong" mengajarkan saling membantu dalam kesulitan. Sikap yang paling tepat adalah...',
    options: [
      'Mengabaikan agar tugas cepat selesai',
      'Menggantikan semua pekerjaannya',
      'Membantu memahami agar bisa mengerjakan sendiri',
      'Melaporkan ke guru',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 88,
    theme: 'peduli',
    boxType: 'hijau',
    question:
      'Nilai "welas asih" berarti kasih sayang terhadap sesama. Seorang siswa melihat temannya kesulitan membawa banyak buku. Sikap yang paling tepat adalah...',
    options: [
      'Membiarkan karena bukan tanggung jawab',
      'Menertawakan',
      'Membantu dengan tulus',
      'Mengabaikan',
    ],
    answer: 2,

    explanation: '-',
  },
  {
    id: 89,
    theme: 'peduli',
    boxType: 'ungu',
    question:
      'Perhatikan dua sikap berikut: Siswa A merasa kasihan melihat temannya kesulitan memahami materi. Siswa B tidak hanya merasa kasihan, tetapi juga membantu mencari solusi. Sikap yang menunjukkan tingkat kepedulian lebih tinggi adalah...',
    options: ['Siswa A', 'Siswa B', 'Keduanya sama', 'Tidak keduanya'],
    answer: 1,

    explanation: '-',
  },
  {
    id: 90,
    theme: 'peduli',
    boxType: 'ungu',
    question:
      'Di kelas, beberapa siswa sering mengejek teman yang kurang mampu. Satu siswa memilih untuk membela temannya tersebut. Dampak dari sikap tersebut adalah...',
    options: [
      'Menimbulkan konflik tanpa manfaat',
      'Mengganggu suasana kelas',
      'Membangun solidaritas dan rasa aman',
      'Membuat dirinya dijauhi tanpa alasan',
    ],
    answer: 2,

    explanation: '-',
  },
];
