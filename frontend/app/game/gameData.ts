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
  position: number; // 0 = OUTSIDE BOARD, 1 = START, 50 = FINISH
  color: string;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  isFinished?: boolean;
  finishRank?: number;
  finishBonus?: number;
  isOffline?: boolean;
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

export const BOARD_SIZE = 50;

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
 * Generate board layout: position 1 = START, position 50 = FINISH.
 * Positions 2–49 (48 boxes) are distributed evenly among 5 colors.
 * Uses seeded PRNG for deterministic but shuffled distribution.
 */
export function generateBoard(seed: number = 42): BoxType[] {
  const colors: ColoredBoxType[] = ['biru', 'merah', 'kuning', 'hijau', 'ungu'];

  // Create pool: 48 gameplay squares for positions 2-49
  const pool: ColoredBoxType[] = [];
  for (let i = 0; i < 48; i++) {
    pool.push(colors[i % colors.length]);
  }

  // Seeded Fisher-Yates shuffle
  let s = seed;
  for (let i = pool.length - 1; i > 0; i--) {
    s = Math.abs((s * 16807 + 1) % 2147483647);
    const j = s % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // board[0] = position 1 (start/blue), board[49] = position 50 (finish)
  const board: BoxType[] = ['biru', ...pool, 'finish'];
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
  {
    id: 1,
    theme: 'jujur',
    boxType: 'biru',
    question: 'Mengatakan hal yang sesuai dengan kenyataan disebut…',
    options: ['Disiplin', 'Tanggung jawab', 'Jujur', 'Peduli'],
    answer: 2,
    explanation:
      'Mengatakan hal yang sesuai dengan kenyataan berarti menyampaikan sesuatu apa adanya, tidak berbohong, dan tidak mengada-ada. Sikap ini disebut jujur.\n\nKejujuran penting karena dapat membuat orang lain percaya kepada kita. Misalnya, ketika siswa mengakui bahwa ia belum mengerjakan tugas, maka siswa tersebut sedang menunjukkan sikap jujur.\n\nAnalisis pilihan jawaban:\n• Disiplin: Berarti menaati aturan dan waktu.\n• Tanggung jawab: Berarti melaksanakan kewajiban dengan baik.\n• Jujur: Berarti berkata dan bertindak sesuai kenyataan.\n• Peduli: Berarti memperhatikan dan membantu orang lain.',
  },
  {
    id: 2,
    theme: 'jujur',
    boxType: 'merah',
    question: 'Budi lupa mengerjakan PR karena bermain game. Ketika ditanya guru, sikap terbuka yang benar adalah…',
    options: ['Berbohong agar tidak dihukum', 'Mengaku sakit', 'Menyalahkan teman', 'Mengakui kesalahan dengan jujur'],
    answer: 3,
    explanation:
      'Sikap terbuka berarti berani menyampaikan keadaan yang sebenarnya tanpa menutupi kesalahan. Dalam kasus tersebut, Budi lupa mengerjakan PR karena bermain game. Sikap yang tepat adalah mengakui kesalahan dengan jujur kepada guru.\n\nJawaban A, B, dan C tidak tepat karena menunjukkan perilaku tidak jujur, menghindari tanggung jawab, dan menyalahkan orang lain. Sikap seperti itu dapat merusak kepercayaan guru kepada siswa.\n\nJawaban yang benar: D. Mengakui kesalahan dengan jujur\nNilai yang ditanamkan: Kejujuran, tanggung jawab, dan keberanian mengakui kesalahan.',
  },
  {
    id: 3,
    theme: 'jujur',
    boxType: 'kuning',
    question: 'Rina menemukan dompet di halaman sekolah. Tidak ada orang yang melihatnya. Sikap yang mencerminkan kejujuran adalah…',
    options: ['Mengambil uangnya saja', 'Menyimpan dompet tersebut', 'Mengembalikan kepada guru atau pemiliknya', 'Membiarkannya di tempat'],
    answer: 2,
    explanation:
      'Sikap jujur adalah perilaku yang menunjukkan kebenaran, tidak mengambil hak orang lain, dan berani melakukan hal yang benar meskipun tidak ada orang yang melihat.\n\nPada soal tersebut, Rina menemukan dompet di halaman sekolah. Walaupun tidak ada orang yang melihatnya, Rina tetap harus bersikap jujur dengan tidak mengambil isi dompet tersebut. Tindakan yang paling tepat adalah mengembalikan dompet kepada guru atau pemiliknya agar dompet tersebut dapat kembali kepada orang yang berhak.\n\nJawaban yang benar: C. Mengembalikan kepada guru atau pemiliknya\n\nAnalisis pilihan jawaban:\n• Mengambil uangnya saja → Salah, karena mengambil uang milik orang lain termasuk perbuatan tidak jujur.\n• Menyimpan dompet tersebut → Salah, karena dompet tersebut bukan milik Rina.\n• Mengembalikan kepada guru atau pemiliknya → Benar, karena menunjukkan sikap jujur dan bertanggung jawab.\n• Membiarkannya di tempat → Kurang tepat, karena dompet bisa hilang atau diambil orang lain.',
  },
  {
    id: 4,
    theme: 'jujur',
    boxType: 'hijau',
    question: 'Dalam budaya Jawa dikenal nilai eling lan waspada, yaitu selalu sadar diri dan berani bertanggung jawab atas perbuatan sendiri. Sikap terbuka dalam kehidupan sehari-hari sesuai dengan nilai tersebut adalah…',
    options: ['Mengakui kesalahan yang dilakukan dengan jujur', 'Menyembunyikan kesalahan agar tidak dimarahi', 'Menutupi fakta agar terlihat baik', 'Menghindari masalah dan tidak mau bertanggung jawab'],
    answer: 0,
    explanation:
      'Nilai eling lan waspada dalam budaya Jawa berarti seseorang harus selalu ingat, sadar diri, berhati-hati dalam bertindak, serta berani bertanggung jawab atas perbuatan yang dilakukan. Nilai ini mengajarkan agar seseorang tidak lari dari kesalahan, tetapi mau bersikap jujur dan terbuka.\n\nSikap terbuka dalam kehidupan sehari-hari yang sesuai dengan nilai tersebut adalah mengakui kesalahan yang dilakukan dengan jujur. Dengan mengakui kesalahan, seseorang menunjukkan kesadaran diri, kejujuran, dan tanggung jawab.\n\nJawaban yang benar: A. Mengakui kesalahan yang dilakukan dengan jujur\n\nAnalisis pilihan jawaban:\n• A: Benar, karena mengakui kesalahan menunjukkan sikap jujur, terbuka, sadar diri, dan bertanggung jawab.\n• B: Salah, karena menyembunyikan kesalahan menunjukkan sikap tidak jujur dan tidak bertanggung jawab.\n• C: Salah, karena menutupi fakta berarti tidak terbuka dan hanya ingin terlihat baik di hadapan orang lain.\n• D: Salah, karena menghindari masalah dan tidak mau bertanggung jawab bertentangan dengan nilai eling lan waspada.\n\nKesimpulan: Sikap terbuka yang sesuai dengan nilai eling lan waspada adalah berani mengakui kesalahan secara jujur dan bertanggung jawab atas perbuatan sendiri.',
  },
  {
    id: 5,
    theme: 'jujur',
    boxType: 'ungu',
    question: 'Siswa yang tidak mencontek saat ujian meskipun teman-temannya melakukannya menunjukkan sikap…',
    options: ['Takut ketahuan', 'Menghargai diri sendiri dan jujur', 'Tidak peduli teman', 'Ingin terlihat berbeda'],
    answer: 1,
    explanation:
      'Siswa yang tidak mencontek saat ujian meskipun teman-temannya melakukannya menunjukkan bahwa ia memiliki sikap jujur dan mampu menghargai diri sendiri. Ia percaya pada kemampuan sendiri dan tidak ingin memperoleh nilai dengan cara yang curang.\n\nSikap tersebut termasuk nilai integritas karena siswa tetap melakukan hal yang benar, meskipun lingkungan sekitarnya melakukan tindakan yang salah.\n\nJawaban yang benar: B. Menghargai diri sendiri dan jujur\n\nAnalisis pilihan jawaban:\n• Takut ketahuan → Kurang tepat, karena tidak mencontek bukan hanya karena takut dihukum, tetapi karena memiliki kesadaran untuk bersikap jujur.\n• Menghargai diri sendiri dan jujur → Tepat, karena siswa menunjukkan kejujuran dan percaya pada kemampuan dirinya sendiri.\n• Tidak peduli teman → Kurang tepat, karena sikap jujur bukan berarti tidak peduli kepada teman.\n• Ingin terlihat berbeda → Kurang tepat, karena tujuan utama tidak mencontek adalah menjaga kejujuran, bukan mencari perhatian.',
  },
  {
    id: 6,
    theme: 'jujur',
    boxType: 'biru',
    question: 'Sikap jujur sangat penting karena…',
    options: ['Membuat kita disukai semua orang', 'Membentuk pribadi berintegritas', 'Menghindarkan dari hukuman saja', 'Membuat kita terkenal'],
    answer: 1,
    explanation:
      'Sikap jujur sangat penting karena kejujuran menjadi dasar terbentuknya pribadi yang berintegritas. Orang yang jujur akan berkata dan bertindak sesuai kebenaran, tidak menipu, tidak memalsukan sesuatu, serta dapat dipercaya oleh orang lain.\n\nJawaban yang tepat: B. Membentuk pribadi berintegritas\n\nPembahasan pilihan jawaban:\n• Membuat kita disukai semua orang: Kurang tepat, karena orang jujur belum tentu selalu disukai semua orang, terutama oleh orang yang tidak suka kebenaran.\n• Membentuk pribadi berintegritas: Tepat, karena kejujuran merupakan bagian penting dari integritas.\n• Menghindarkan dari hukuman saja: Kurang tepat, karena jujur bukan hanya untuk menghindari hukuman, tetapi sebagai sikap moral yang harus dibiasakan.\n• Membuat kita terkenal: Tidak tepat, karena tujuan utama bersikap jujur bukan untuk mencari popularitas.\n\nKesimpulan: Sikap jujur penting karena dapat membentuk seseorang menjadi pribadi yang berintegritas, dapat dipercaya, dan bertanggung jawab.',
  },
  {
    id: 7,
    theme: 'jujur',
    boxType: 'merah',
    question: 'Perilaku tidak jujur seperti korupsi dapat merugikan…',
    options: ['Diri sendiri saja', 'Teman saja', 'Masyarakat luas', 'Guru saja'],
    answer: 2,
    explanation:
      'Perilaku tidak jujur seperti korupsi bukan hanya merugikan satu orang saja, tetapi dapat berdampak pada banyak orang. Korupsi dapat menyebabkan dana atau fasilitas yang seharusnya digunakan untuk kepentingan bersama menjadi disalahgunakan.\n\nAkibatnya, masyarakat dapat mengalami kerugian, misalnya pembangunan terhambat, bantuan tidak tepat sasaran, pelayanan publik menjadi buruk, dan kepercayaan masyarakat menurun.\n\nAnalisis pilihan jawaban:\n• Diri sendiri saja → Kurang tepat, karena korupsi tidak hanya merugikan pelakunya.\n• Teman saja → Kurang tepat, karena dampaknya lebih luas daripada teman.\n• Masyarakat luas → Tepat, karena korupsi merugikan banyak orang dan kepentingan umum.\n• Guru saja → Kurang tepat, karena dampak korupsi tidak terbatas pada guru.\n\nJawaban yang benar: C. Masyarakat luas',
  },
  {
    id: 8,
    theme: 'jujur',
    boxType: 'kuning',
    question: 'Saat guru bertanya siapa yang memecahkan kaca kelas, Andi sebenarnya tahu pelakunya adalah dirinya sendiri. Sikap jujur yang seharusnya dilakukan Andi adalah…',
    options: ['Diam agar tidak dimarahi', 'Menyalahkan teman lain', 'Menunggu sampai guru mengetahui sendiri', 'Mengakui perbuatannya kepada guru'],
    answer: 3,
    explanation:
      'Soal tersebut menilai sikap jujur dalam kehidupan sehari-hari di sekolah. Andi mengetahui bahwa dirinya sendiri yang memecahkan kaca kelas. Sikap jujur berarti berani mengatakan kebenaran, tidak menutupi kesalahan, dan siap bertanggung jawab atas perbuatan yang dilakukan.\n\nAnalisis pilihan jawaban:\n• Pilihan A: Tidak tepat karena diam berarti menyembunyikan kebenaran.\n• Pilihan B: Tidak tepat karena menyalahkan teman lain merupakan tindakan tidak jujur dan dapat merugikan orang lain.\n• Pilihan C: Kurang tepat karena menunggu guru mengetahui sendiri menunjukkan Andi belum berani bertanggung jawab.\n• Pilihan D: Adalah jawaban yang tepat karena Andi mengakui perbuatannya kepada guru. Sikap ini mencerminkan kejujuran, keberanian, dan tanggung jawab.\n\nJawaban yang benar: D. Mengakui perbuatannya kepada guru.\n\nKesimpulan: Sikap jujur harus dilakukan meskipun kita melakukan kesalahan. Dengan mengakui kesalahan, Andi menunjukkan integritas dan tanggung jawab sebagai siswa.',
  },
  {
    id: 9,
    theme: 'jujur',
    boxType: 'hijau',
    question: 'Dalam budaya Jawa dikenal nilai Isin. Mengapa kita harus tetap jujur meskipun tidak ada yang melihat?',
    options: ['Agar dipuji orang lain', 'Karena takut dihukum', 'Karena menghargai diri sendiri dan memiliki rasa malu', 'Agar terlihat baik di depan orang lain'],
    answer: 2,
    explanation:
      'Dalam budaya Jawa, nilai isin berarti rasa malu yang mendorong seseorang untuk menjaga perilaku, ucapan, dan tindakan agar tetap baik. Nilai ini bukan hanya berkaitan dengan malu kepada orang lain, tetapi juga malu kepada diri sendiri jika melakukan perbuatan yang tidak benar.\n\nSikap jujur harus tetap dilakukan meskipun tidak ada yang melihat karena kejujuran merupakan bentuk penghargaan terhadap diri sendiri. Orang yang memiliki rasa isin akan merasa tidak pantas melakukan kecurangan, kebohongan, atau tindakan tidak jujur, walaupun tidak diketahui orang lain.\n\nPilihan A dan D kurang tepat karena kejujuran tidak seharusnya dilakukan hanya untuk mendapat pujian atau terlihat baik. Pilihan B juga kurang tepat karena jujur bukan semata-mata karena takut dihukum, melainkan karena kesadaran moral dari dalam diri.\n\nJawaban yang tepat: C. Karena menghargai diri sendiri dan memiliki rasa malu.\n\nKesimpulan: Nilai isin dalam budaya Jawa mengajarkan bahwa seseorang perlu bersikap jujur karena memiliki kesadaran diri, harga diri, dan rasa malu untuk melakukan perbuatan yang tidak benar.',
  },
  {
    id: 10,
    theme: 'jujur',
    boxType: 'ungu',
    question: 'Contoh tindakan jujur di sekolah adalah…',
    options: ['Titip absen kepada teman', 'Mencontek saat ujian', 'Mengumpulkan tugas hasil kerja sendiri', 'Menyalin pekerjaan teman'],
    answer: 2,
    explanation:
      'Sikap jujur berarti berkata dan bertindak sesuai dengan kenyataan, tidak berbohong, tidak curang, serta berani bertanggung jawab atas hasil kerja sendiri.\n\nPada soal tersebut, tindakan jujur di sekolah ditunjukkan oleh pilihan C: Mengumpulkan tugas hasil kerja sendiri. Jawaban ini benar karena siswa mengerjakan tugas dengan kemampuan sendiri tanpa menyalin atau mengambil hasil pekerjaan orang lain. Hal tersebut mencerminkan nilai kejujuran, tanggung jawab, dan integritas dalam lingkungan sekolah.\n\nPilihan lain tidak tepat karena:\n• A: Titip absen kepada teman termasuk tindakan tidak jujur karena memalsukan kehadiran.\n• B: Mencontek saat ujian merupakan bentuk kecurangan dan tidak mencerminkan kejujuran.\n• D: Menyalin pekerjaan teman juga termasuk perbuatan tidak jujur karena menggunakan hasil kerja orang lain seolah-olah milik sendiri.',
  },
  {
    id: 11,
    theme: 'disiplin',
    boxType: 'biru',
    question: 'Sikap disiplin dapat mencegah perilaku korupsi karena…',
    options: ['Membuat kita terkenal', 'Membiasakan taat aturan dan tanggung jawab', 'Membuat kita disukai teman', 'Menghindari hukuman saja'],
    answer: 1,
    explanation:
      'Sikap disiplin dapat mencegah perilaku korupsi karena disiplin membiasakan seseorang untuk taat pada aturan, menjalankan kewajiban dengan tepat, dan bertanggung jawab terhadap tugasnya. Orang yang disiplin tidak mudah melanggar aturan, tidak menyalahgunakan waktu, jabatan, atau kepercayaan yang diberikan.\n\nJawaban yang benar: B. Membiasakan taat aturan dan tanggung jawab\n\nPembahasan pilihan lain:\n• Membuat kita terkenal — Salah, karena disiplin bukan bertujuan untuk mencari popularitas.\n• Membuat kita disukai teman — Salah, karena meskipun disiplin bisa membuat orang dihargai, itu bukan alasan utama mencegah korupsi.\n• Menghindari hukuman saja — Salah, karena disiplin seharusnya muncul dari kesadaran diri, bukan hanya karena takut dihukum.\n\nKesimpulan: Sikap disiplin penting dalam pendidikan antikorupsi karena membentuk kebiasaan untuk taat aturan, bertanggung jawab, dan menjauhi perilaku curang.',
  },
  {
    id: 12,
    theme: 'disiplin',
    boxType: 'merah',
    question: 'Sinta sering datang terlambat ke sekolah dan beralasan macet, padahal ia bangun kesiangan. Apa sikap disiplin yang seharusnya dilakukan?',
    options: ['Terus menggunakan alasan', 'Datang sesuka hati', 'Bangun lebih awal agar tepat waktu', 'Menyalahkan keadaan'],
    answer: 2,
    explanation:
      'Sikap disiplin berarti mampu mengatur waktu, menaati aturan, dan bertanggung jawab terhadap kewajiban. Dalam kasus tersebut, Sinta sering datang terlambat bukan karena macet, tetapi karena bangun kesiangan. Sikap yang seharusnya dilakukan adalah bangun lebih awal agar dapat berangkat ke sekolah tepat waktu.\n\nJawaban yang benar: C. Bangun lebih awal agar tepat waktu\n\nAnalisis pilihan jawaban:\n• Pilihan A tidak tepat karena terus menggunakan alasan menunjukkan sikap tidak jujur dan tidak bertanggung jawab.\n• Pilihan B juga salah karena datang sesuka hati menunjukkan perilaku tidak disiplin.\n• Pilihan D tidak tepat karena menyalahkan keadaan berarti tidak mau mengakui kesalahan sendiri.',
  },
  {
    id: 13,
    theme: 'disiplin',
    boxType: 'kuning',
    question: 'Raka berjanji akan mengerjakan tugas kelompok. Namun, ia lebih memilih bermain game dan berharap temannya menyelesaikan tugas tersebut. Apa yang seharusnya dilakukan Raka?',
    options: ['Membiarkan teman mengerjakan', 'Mengerjakan sebagian saja', 'Menepati janji dan ikut bertanggung jawab', 'Tidak ikut terlibat'],
    answer: 2,
    explanation:
      'Raka sudah berjanji akan mengerjakan tugas kelompok. Ketika seseorang berjanji, ia memiliki kewajiban untuk menepatinya. Namun, Raka justru memilih bermain game dan berharap temannya menyelesaikan tugas tersebut. Sikap ini menunjukkan kurangnya rasa tanggung jawab, tidak disiplin, dan tidak menghargai kerja sama dalam kelompok.\n\nDalam kerja kelompok, setiap anggota harus ikut berperan sesuai tugasnya. Jika Raka tidak ikut mengerjakan, maka beban tugas akan menjadi tidak adil karena hanya dikerjakan oleh teman-temannya. Oleh karena itu, sikap yang seharusnya dilakukan Raka adalah menepati janji, ikut mengerjakan tugas, dan bertanggung jawab terhadap tugas kelompok.\n\nJawaban yang benar: C. Menepati janji dan ikut bertanggung jawab.',
  },
  {
    id: 14,
    theme: 'disiplin',
    boxType: 'hijau',
    question: 'Dalam pepatah Jawa “Jer basuki mawa beya” (keberhasilan membutuhkan usaha), Roni merasa tugas IPS sulit dan ingin menyalin dari temannya. Apa yang seharusnya dilakukan Roni?',
    options: ['Menyalin agar cepat selesai', 'Membiarkan tugas tidak dikerjakan', 'Menunggu jawaban dari teman', 'Berusaha mengerjakan sendiri meskipun sulit'],
    answer: 3,
    explanation:
      'Pepatah Jawa “Jer basuki mawa beya” berarti bahwa setiap keberhasilan membutuhkan usaha, kerja keras, dan pengorbanan. Dalam soal tersebut, Roni merasa tugas IPS sulit dan ingin menyalin jawaban dari temannya.\n\nSikap menyalin jawaban bukanlah perilaku yang baik karena menunjukkan ketidakjujuran dan tidak mencerminkan tanggung jawab sebagai siswa. Meskipun tugas terasa sulit, Roni seharusnya tetap berusaha mengerjakan sendiri. Jika mengalami kesulitan, Roni boleh bertanya kepada guru atau teman untuk memahami materi, bukan menyalin jawaban.\n\nDengan berusaha mengerjakan sendiri, Roni belajar menjadi pribadi yang jujur, mandiri, bertanggung jawab, dan bekerja keras. Sikap ini sesuai dengan makna pepatah “Jer basuki mawa beya”, yaitu keberhasilan hanya dapat dicapai melalui usaha.\n\nJawaban yang tepat adalah D. Berusaha mengerjakan sendiri meskipun sulit.',
  },
  {
    id: 15,
    theme: 'disiplin',
    boxType: 'ungu',
    question: 'Rafi berjanji kepada guru untuk mengumpulkan tugas tepat waktu. Meskipun sedang malas, ia tetap mengerjakan tugasnya. Sikap Rafi menunjukkan…',
    options: ['Ketakutan', 'Komitmen', 'Kepedulian', 'Keberanian'],
    answer: 1,
    explanation:
      'Rafi berjanji kepada guru untuk mengumpulkan tugas tepat waktu. Walaupun ia sedang merasa malas, Rafi tetap berusaha mengerjakan dan menyelesaikan tugasnya sesuai janji.\n\nSikap tersebut menunjukkan komitmen, yaitu kesungguhan seseorang untuk menepati janji, menjalankan tanggung jawab, dan tetap melakukan kewajiban meskipun menghadapi rasa malas atau hambatan.\n\nJawaban yang tepat: B. Komitmen\n\nAlasan pilihan lain kurang tepat:\n• Ketakutan: Tidak tepat, karena Rafi mengerjakan tugas bukan karena takut, tetapi karena ingin menepati janji.\n• Kepedulian: Kurang tepat, karena kepedulian lebih berkaitan dengan perhatian terhadap orang lain atau lingkungan.\n• Keberanian: Kurang tepat, karena keberanian biasanya berkaitan dengan sikap berani menghadapi risiko atau mengatakan kebenaran.',
  },
  {
    id: 16,
    theme: 'disiplin',
    boxType: 'biru',
    question: 'Siswa yang tidak mencontek saat ujian meskipun tidak diawasi menunjukkan sikap…',
    options: ['Takut', 'Ingin dipuji', 'Taat aturan', 'Terpaksa'],
    answer: 2,
    explanation:
      'Siswa yang tidak mencontek saat ujian meskipun tidak diawasi menunjukkan bahwa ia memiliki kesadaran untuk bersikap jujur dan mematuhi aturan ujian. Sikap tersebut bukan karena takut, ingin dipuji, atau terpaksa, melainkan karena memahami bahwa mencontek adalah perbuatan yang tidak benar.\n\nPerilaku ini mencerminkan sikap taat aturan, karena siswa tetap mengikuti peraturan ujian meskipun tidak ada guru yang mengawasi secara langsung.\n\nJawaban yang benar: C. Taat aturan\n\nAlasan pilihan lain kurang tepat:\n• Takut: Kurang tepat, karena siswa tidak mencontek bukan karena rasa takut, melainkan karena kesadaran diri.\n• Ingin dipuji: Kurang tepat, karena tindakannya dilakukan meskipun tidak ada yang melihat.\n• Terpaksa: Kurang tepat, karena siswa menunjukkan sikap patuh secara sukarela.',
  },
  {
    id: 17,
    theme: 'disiplin',
    boxType: 'merah',
    question: 'Saat ujian mendekat, kamu belum belajar. Temanmu menawarkan jawaban saat ujian nanti. Apa yang seharusnya kamu lakukan?',
    options: ['Menerima bantuan', 'Mengandalkan teman', 'Tidak peduli', 'Belajar meskipun waktunya sedikit'],
    answer: 3,
    explanation:
      'Saat ujian mendekat dan kamu belum belajar, pilihan yang paling tepat adalah tetap berusaha belajar meskipun waktunya sedikit. Sikap ini menunjukkan kejujuran, tanggung jawab, kerja keras, dan kemandirian.\n\nMenerima jawaban dari teman saat ujian termasuk tindakan tidak jujur karena sama dengan menyontek. Walaupun belum siap, siswa tetap harus berusaha dengan kemampuan sendiri.\n\nJawaban yang benar: D. Belajar meskipun waktunya sedikit\n\nAnalisis pilihan jawaban:\n• A. Menerima bantuan → Tidak tepat, karena bantuan berupa jawaban saat ujian termasuk menyontek.\n• B. Mengandalkan teman → Tidak tepat, karena menunjukkan sikap tidak mandiri dan tidak bertanggung jawab.\n• C. Tidak peduli → Tidak tepat, karena siswa seharusnya tetap berusaha menghadapi ujian dengan serius.\n• D. Belajar meskipun waktunya sedikit → Tepat, karena menunjukkan sikap jujur, bertanggung jawab, dan mau berusaha walaupun persiapan belum maksimal.',
  },
  {
    id: 18,
    theme: 'disiplin',
    boxType: 'kuning',
    question: 'Saat ujian, Andi tergoda melihat jawaban temannya karena tidak fokus belajar sebelumnya. Apa tindakan yang menunjukkan disiplin?',
    options: ['Mengerjakan sesuai kemampuan sendiri', 'Mencontek', 'Bertanya pada teman', 'Menyerah'],
    answer: 0,
    explanation:
      'Soal tersebut mengukur nilai disiplin dalam menghadapi situasi ujian. Disiplin berarti taat pada aturan, bertanggung jawab terhadap kewajiban, dan mampu mengendalikan diri meskipun berada dalam keadaan sulit.\n\nDalam situasi tersebut, Andi tidak fokus belajar sebelumnya sehingga merasa tergoda untuk melihat jawaban temannya. Namun, tindakan yang menunjukkan sikap disiplin adalah tetap mengerjakan ujian sesuai kemampuan sendiri. Dengan begitu, Andi tetap mematuhi aturan ujian dan tidak melakukan kecurangan.\n\nJawaban yang benar: A. Mengerjakan sesuai kemampuan sendiri\n\nAnalisis pilihan jawaban:\n• B. Mencontek → Tidak menunjukkan disiplin karena melanggar aturan ujian dan termasuk tindakan tidak jujur.\n• C. Bertanya pada teman → Tidak tepat karena saat ujian siswa harus mengerjakan secara mandiri, bukan meminta bantuan teman.\n• D. Menyerah → Tidak menunjukkan sikap disiplin karena Andi tidak berusaha menyelesaikan tanggung jawabnya.',
  },
  {
    id: 19,
    theme: 'disiplin',
    boxType: 'hijau',
    question: 'Filosofi Jawa ajining diri saka lathi berarti harga diri dilihat dari ucapan dan perilaku. Rina sering berkata akan belajar setiap hari, tetapi tidak pernah melakukannya. Apa sikap yang benar?',
    options: ['Tetap berjanji tanpa melakukan', 'Menepati ucapan dengan tindakan yang konsisten', 'Mengabaikan', 'Menyalahkan keadaan'],
    answer: 1,
    explanation:
      'Filosofi Jawa “ajining diri saka lathi” berarti bahwa harga diri, kehormatan, dan kepercayaan seseorang dapat dilihat dari ucapan serta perilakunya. Seseorang yang baik tidak hanya pandai berkata-kata, tetapi juga mampu membuktikan ucapannya melalui tindakan nyata.\n\nDalam soal, Rina sering mengatakan akan belajar setiap hari, tetapi ia tidak pernah melakukannya. Sikap tersebut menunjukkan bahwa Rina belum konsisten antara ucapan dan perbuatan. Padahal, agar dipercaya dan dihargai orang lain, seseorang harus mampu menepati janji dan bertanggung jawab atas ucapannya.\n\nJawaban yang benar adalah B. Menepati ucapan dengan tindakan yang konsisten.\n\nAnalisis pilihan jawaban:\n• A. Tetap berjanji tanpa melakukan → Tidak tepat karena menunjukkan sikap tidak bertanggung jawab.\n• C. Mengabaikan → Tidak tepat karena masalah ketidaksesuaian ucapan dan tindakan harus diperbaiki.\n• D. Menyalahkan keadaan → Tidak tepat karena seseorang harus berani bertanggung jawab atas janji dan tindakannya.',
  },
  {
    id: 20,
    theme: 'disiplin',
    boxType: 'ungu',
    question: 'Andi membuat jadwal belajar agar semua tugasnya selesai tepat waktu. Hal tersebut menunjukkan sikap…',
    options: ['Malas', 'Terpaksa', 'Disiplin dalam perencanaan', 'Tidak percaya diri'],
    answer: 2,
    explanation:
      'Andi membuat jadwal belajar agar semua tugasnya dapat selesai tepat waktu. Tindakan tersebut menunjukkan bahwa Andi mampu mengatur waktu, merencanakan kegiatan, dan memiliki tanggung jawab terhadap tugas-tugasnya. Sikap ini termasuk disiplin dalam perencanaan, karena Andi tidak menunda pekerjaan dan berusaha menyelesaikan tugas sesuai jadwal.\n\nJawaban yang tepat: C. Disiplin dalam perencanaan\n\nAnalisis pilihan jawaban:\n• A. Malas → Salah, karena Andi justru berusaha mengatur waktu belajar.\n• B. Terpaksa → Salah, karena soal tidak menunjukkan bahwa Andi dipaksa.\n• D. Tidak percaya diri → Salah, karena membuat jadwal bukan tanda tidak percaya diri, melainkan tanda tanggung jawab dan disiplin.',
  },
  {
    id: 21,
    theme: 'tanggung_jawab',
    boxType: 'biru',
    question: 'Seorang siswa diberi tanggung jawab mengatur kegiatan kelas. Ia menghadapi banyak kendala dan tekanan dari teman. Apa sikap yang mencerminkan tanggung jawab sejati?',
    options: ['Menghindari tugas', 'Menyalahkan orang lain', 'Tetap menjalankan tugas dengan jujur dan berani', 'Menyerah'],
    answer: 2,
    explanation:
      'Seorang siswa yang diberi tanggung jawab mengatur kegiatan kelas harus mampu menjalankan amanah dengan baik, meskipun menghadapi kendala dan tekanan dari teman-temannya. Sikap tanggung jawab sejati tidak hanya terlihat saat keadaan mudah, tetapi justru ketika seseorang tetap berusaha menyelesaikan tugas dengan jujur, berani, dan tidak lari dari kewajiban.\n\nJawaban yang benar adalah C. Tetap menjalankan tugas dengan jujur dan berani.\n\nPembahasan pilihan jawaban:\n• Menghindari tugas: Pilihan ini tidak tepat karena menghindari tugas menunjukkan sikap tidak bertanggung jawab.\n• Menyalahkan orang lain: Pilihan ini tidak tepat karena menyalahkan orang lain berarti tidak mau menerima tanggung jawab atas tugas yang diberikan.\n• Tetap menjalankan tugas dengan jujur dan berani: Pilihan ini tepat karena menunjukkan sikap bertanggung jawab, jujur, dan berani menghadapi tekanan.\n• Menyerah: Pilihan ini tidak tepat karena menyerah menunjukkan kurangnya ketekunan dan tanggung jawab dalam menyelesaikan tugas.',
  },
  {
    id: 22,
    theme: 'tanggung_jawab',
    boxType: 'merah',
    question: 'Raka tanpa sengaja menjatuhkan alat praktikum hingga rusak. Tidak ada yang melihat kejadian tersebut. Ia khawatir jika mengaku akan dimarahi dan diminta mengganti. Apa tindakan paling bertanggung jawab?',
    options: ['Diam saja agar tidak mendapat masalah', 'Menyalahkan teman lain', 'Membiarkan guru mencari tahu sendiri', 'Mengakui perbuatannya meskipun harus menanggung konsekuensi'],
    answer: 3,
    explanation:
      'Tindakan paling bertanggung jawab yang harus dilakukan Raka adalah mengakui perbuatannya meskipun harus menanggung konsekuensi.\n\nRaka memang tidak sengaja menjatuhkan alat praktikum hingga rusak. Namun, karena kerusakan itu terjadi akibat perbuatannya, ia tetap memiliki tanggung jawab untuk berkata jujur kepada guru. Sikap ini menunjukkan nilai tanggung jawab, kejujuran, dan keberanian.\n\nAnalisis Pilihan Jawaban:\n• Pilihan A tidak tepat karena diam saja berarti menghindari tanggung jawab.\n• Pilihan B tidak tepat karena menyalahkan teman lain adalah tindakan tidak jujur dan merugikan orang lain.\n• Pilihan C kurang tepat karena membiarkan guru mencari tahu sendiri menunjukkan Raka tidak berani bertanggung jawab atas perbuatannya.\n• Pilihan D paling tepat karena Raka berani backseat kesalahan dan siap menerima akibat dari tindakannya.',
  },
  {
    id: 23,
    theme: 'tanggung_jawab',
    boxType: 'kuning',
    question: 'Rafi menjadi ketua kelompok, tetapi beberapa anggota tidak bekerja dengan baik. Ia bingung antara membiarkan atau memperbaiki keadaan. Apa sikap yang mencerminkan tanggung jawab?',
    options: ['Membiarkan anggota lain', 'Mengerjakan sendiri tanpa komunikasi', 'Mengajak anggota bekerja dan memastikan tugas selesai', 'Menyerah'],
    answer: 2,
    explanation:
      'Pada soal tersebut, Rafi sebagai ketua kelompok menghadapi masalah karena ada beberapa anggota yang tidak bekerja dengan baik. Sikap yang mencerminkan tanggung jawab adalah tidak membiarkan masalah begitu saja, tetapi berusaha memperbaiki keadaan agar tugas kelompok tetap selesai dengan baik.\n\nSebagai ketua kelompok, Rafi perlu mengajak anggota lain untuk bekerja sama, membagi tugas, berkomunikasi dengan baik, dan memastikan semua anggota menjalankan tanggung jawabnya. Dengan begitu, Rafi tidak hanya menyelesaikan tugas, tetapi juga membantu kelompok bekerja secara adil dan tertib.\n\nAnalisis Pilihan Jawaban:\n• Pilihan A kurang tepat karena membiarkan anggota lain tidak bekerja menunjukkan sikap tidak peduli.\n• Pilihan B kurang tepat karena mengerjakan sendiri tanpa komunikasi dapat membuat kerja kelompok tidak berjalan baik.\n• Pilihan D juga tidak tepat karena menyerah bukan sikap bertanggung jawab.',
  },
  {
    id: 24,
    theme: 'tanggung_jawab',
    boxType: 'hijau',
    question: 'Di kelas, kamu ditunjuk sebagai bendahara untuk menyimpan uang kas. Temanmu meminta meminjam uang kas untuk keperluan pribadi dan berjanji akan mengembalikannya. Dalam budaya Jawa dikenal nilai tepo seliro (tenggang rasa). Apa yang sebaiknya kamu lakukan?',
    options: ['Memberikan uang kas karena kasihan pada teman', 'Menolak dengan sopan karena uang tersebut adalah amanah bersama', 'Memberikan sebagian saja agar tidak mengecewakan', 'Membiarkan teman mengambil sendiri uang kas'],
    answer: 1,
    explanation:
      'Soal ini berkaitan dengan sikap tanggung jawab, jujur, amanah, dan adil dalam mengelola uang kas kelas. Sebagai bendahara, uang kas bukan milik pribadi, melainkan milik bersama seluruh anggota kelas. Oleh karena itu, uang tersebut harus digunakan sesuai kesepakatan kelas, bukan untuk kepentingan pribadi seseorang.\n\nNilai budaya Jawa tepo seliro berarti tenggang rasa atau mampu memahami perasaan orang lain. Namun, tepo seliro tidak berarti membenarkan tindakan yang salah. Menolong teman tetap harus dilakukan dengan cara yang benar dan tidak merugikan orang lain. Dalam kasus ini, bendahara boleh menunjukkan empati kepada teman, tetapi tetap harus menjaga amanah uang kas.\n\nJawaban yang paling tepat adalah B. Menolak dengan sopan karena uang tersebut adalah amanah bersama.\n\nAnalisis Pilihan Jawaban:\n• A: Kurang tepat, karena uang kas bukan milik bendahara pribadi. Rasa kasihan tidak boleh menjadi alasan untuk menyalahgunakan amanah.\n• B: Tepat. Sikap ini menunjukkan tanggung jawab, amanah, dan tetap menerapkan tepo seliro dengan cara yang benar.\n• C: Kurang tepat, karena meskipun hanya sebagian, tetap termasuk menggunakan uang kas untuk kepentingan pribadi tanpa persetujuan bersama.\n• D: Salah, karena bendahara berarti lalai menjaga amanah dan membiarkan tindakan yang tidak bertanggung jawab.',
  },
  {
    id: 25,
    theme: 'tanggung_jawab',
    boxType: 'ungu',
    question: 'Sinta dipercaya menjadi bendahara kelas. Ia menemukan selisih uang kas, tetapi jika dilaporkan, ia takut dianggap tidak becus. Apa yang seharusnya dilakukan Sinta?',
    options: ['Menutupinya agar tidak disalahkan', 'Menggunakan uang lain untuk menutupi tanpa laporan', 'Melaporkan secara jujur dan mencari solusi bersama', 'Mengabaikan masalah tersebut'],
    answer: 2,
    explanation:
      'Sikap yang paling tepat dilakukan Sinta adalah melaporkan secara jujur adanya selisih uang kas dan mencari solusi bersama. Sebagai bendahara kelas, Sinta memiliki tanggung jawab untuk mengelola uang kas dengan transparan. Jika ada selisih uang, masalah tersebut tidak boleh ditutupi karena dapat menimbulkan kecurigaan dan memperbesar masalah.\n\nDengan melaporkan secara jujur, Sinta menunjukkan sikap jujur, bertanggung jawab, berani, dan amanah. Ia juga dapat mengajak wali kelas atau teman-teman untuk memeriksa kembali catatan pemasukan dan pengeluaran kas agar ditemukan penyebab selisih tersebut.\n\nPilihan A, B, dan D tidak tepat karena menunjukkan sikap tidak jujur, menghindari tanggung jawab, dan tidak menyelesaikan masalah.\n\nJawaban yang benar: C. Melaporkan secara jujur dan mencari solusi bersama.',
  },
  {
    id: 26,
    theme: 'tanggung_jawab',
    boxType: 'biru',
    question: 'Saat ujian, kamu melihat kesalahan pada lembar jawabanmu yang bisa diperbaiki jika mencontek. Tidak ada pengawas. Apa tindakan terbaik?',
    options: ['Tetap jujur meskipun nilainya kecil', 'Mencontek', 'Membiarkan saja', 'Mengikuti teman'],
    answer: 0,
    explanation:
      'Soal tersebut berkaitan dengan nilai kejujuran dalam menghadapi ujian. Saat ujian, peserta didik diuji bukan hanya kemampuan akademiknya, tetapi juga sikap integritasnya. Meskipun ada kesempatan untuk mencontek karena tidak ada pengawas, tindakan tersebut tetap tidak benar.\n\nTindakan terbaik adalah tetap jujur meskipun nilainya kecil, karena nilai yang diperoleh dengan usaha sendiri lebih bermakna daripada nilai tinggi yang didapat dengan cara tidak jujur.\n\nAnalisis Pilihan Jawaban:\n• A. Tetap jujur meskipun nilainya kecil → Benar. Sikap ini menunjukkan kejujuran, tanggung jawab, dan integritas dalam ujian.\n• B. Mencontek → Salah. Mencontek merupakan perilaku tidak jujur dan merugikan diri sendiri.\n• C. Membiarkan saja → Kurang tepat. Jika kesalahan tidak dapat diperbaiki tanpa mencontek, maka lebih baik menerima hasilnya dengan jujur.\n• D. Mengikuti teman → Salah. Mengikuti teman untuk berbuat tidak jujur tetap merupakan tindakan yang tidak bertanggung jawab.',
  },
  {
    id: 27,
    theme: 'tanggung_jawab',
    boxType: 'merah',
    question: 'Dina ketahuan tidak mengerjakan tugas karena lalai. Ia punya kesempatan untuk berbohong agar tidak dihukum. Apa keputusan yang paling tepat?',
    options: ['Berbohong agar aman', 'Menghindar dari guru', 'Jujur dan menerima konsekuensi', 'Menyalahkan keadaan'],
    answer: 2,
    explanation:
      'Dina ketahuan tidak mengerjakan tugas karena lalai. Dalam situasi ini, Dina memiliki pilihan untuk berbohong agar terhindar dari hukuman. Namun, tindakan berbohong bukanlah keputusan yang tepat karena menunjukkan sikap tidak jujur dan tidak bertanggung jawab.\n\nKeputusan yang paling tepat adalah jujur dan menerima konsekuensi. Dengan bersikap jujur, Dina menunjukkan keberanian untuk mengakui kesalahan serta tanggung jawab atas kelalaiannya. Meskipun mungkin mendapat teguran atau hukuman, sikap jujur akan membuat Dina belajar agar lebih disiplin dan tidak mengulangi kesalahan yang sama.\n\nAnalisis pilihan jawaban:\n• A. Berbohong agar aman → Salah, karena berbohong merupakan tindakan tidak jujur.\n• B. Menghindar dari guru → Salah, karena menghindar tidak menyelesaikan masalah.\n• D. Menyalahkan keadaan → Salah, karena tidak menunjukkan tanggung jawab atas kesalahan sendiri.',
  },
  {
    id: 28,
    theme: 'tanggung_jawab',
    boxType: 'kuning',
    question: 'Seorang siswa mengetahui temannya melakukan kecurangan dalam lomba. Jika melapor, ia takut dijauhi teman. Apa tindakan yang paling bertanggung jawab?',
    options: ['Diam saja', 'Menyampaikan dengan cara yang tepat', 'Ikut menutupi', 'Menghindari masalah'],
    answer: 1,
    explanation:
      'Soal tersebut menggambarkan sikap tanggung jawab, kejujuran, dan keberanian ketika melihat adanya kecurangan dalam lomba. Siswa yang mengetahui temannya berbuat curang tidak boleh diam atau ikut menutupi, karena kecurangan dapat merugikan peserta lain dan membuat lomba menjadi tidak adil.\n\nTindakan yang paling bertanggung jawab adalah menyampaikan kecurangan tersebut dengan cara yang tepat, misalnya melapor kepada guru, panitia, atau pihak yang berwenang secara sopan dan tidak mempermalukan teman di depan umum.\n\nAnalisis pilihan jawaban:\n• A. Diam saja → Tidak tepat, karena membiarkan kecurangan berarti membiarkan ketidakadilan.\n• B. Menyampaikan dengan cara yang tepat → Tepat, karena menunjukkan sikap jujur, berani, dan bertanggung jawab.\n• C. Ikut menutupi → Tidak tepat, karena berarti ikut mendukung perbuatan curang.\n• D. Menghindari masalah → Tidak tepat, karena sikap bertanggung jawab tidak boleh lari dari masalah.',
  },
  {
    id: 29,
    theme: 'tanggung_jawab',
    boxType: 'hijau',
    question: 'Kamu mendapat tugas kelompok, tetapi tidak mengerjakan bagianmu. Saat presentasi, kelompokmu mendapat nilai rendah. Dalam budaya Jawa dikenal nilai nrimo ing pandum (menerima dengan lapang dada). Apa sikap yang tepat?',
    options: ['Menyalahkan anggota lain', 'Mengelak dan mencari alasan', 'Mengakui kesalahan dan berjanji memperbaiki', 'Diam saja tanpa peduli'],
    answer: 2,
    explanation:
      'Soal tersebut menilai sikap tanggung jawab, jujur, dan berani mengakui kesalahan dalam kerja kelompok. Dalam kasus ini, siswa tidak mengerjakan bagian tugasnya sehingga kelompok mendapat nilai rendah. Sikap yang tepat bukan menyalahkan orang lain atau mencari alasan, tetapi mengakui kesalahan dan berusaha memperbaikinya.\n\nNilai budaya Jawa nrimo ing pandum bukan berarti pasrah tanpa usaha, tetapi menerima kenyataan dengan lapang dada sambil tetap bertanggung jawab atas akibat dari perbuatan sendiri. Oleh karena itu, siswa perlu menerima hasil nilai rendah tersebut sebagai konsekuensi, mengakui kesalahan, dan berkomitmen untuk memperbaiki sikapnya pada tugas berikutnya.\n\nAnalisis Pilihan Jawaban:\n• A. Menyalahkan anggota lain → Tidak tepat, karena sikap ini menunjukkan tidak bertanggung jawab dan tidak jujur terhadap kesalahan sendiri.\n• B. Mengelak dan mencari alasan → Tidak tepat, karena menghindari tanggung jawab dan tidak menunjukkan sikap berani mengakui kesalahan.\n• C. Mengakui kesalahan dan berjanji memperbaiki → Tepat, karena menunjukkan sikap jujur, tanggung jawab, berani, serta sesuai dengan makna nrimo ing pandum.\n• D. Diam saja tanpa peduli → Tidak tepat, karena menunjukkan sikap tidak peduli terhadap kelompok dan tidak bertanggung jawab.',
  },
  {
    id: 30,
    theme: 'tanggung_jawab',
    boxType: 'ungu',
    question: 'Dalam kerja kelompok, tugas belum selesai karena Andi tidak mengerjakan bagiannya. Saat guru bertanya, Andi ingin beralasan agar tidak disalahkan. Apa sikap yang benar?',
    options: ['Mengakui kesalahan dan siap memperbaiki', 'Menyalahkan anggota lain', 'Beralasan agar tidak dimarahi', 'Diam saja'],
    answer: 0,
    explanation:
      'Dalam kerja kelompok, setiap anggota memiliki tanggung jawab untuk menyelesaikan bagian tugasnya. Jika Andi tidak mengerjakan bagiannya, maka sikap yang benar adalah mengakui kesalahan dan bersedia memperbaiki. Mengakui kesalahan menunjukkan sikap jujur, bertanggung jawab, dan berani menerima konsekuensi.\n\nAnalisis Pilihan Jawaban:\n• A. Mengakui kesalahan dan siap memperbaiki → Benar. Sikap ini menunjukkan tanggung jawab, kejujuran, dan kemauan untuk memperbaiki kesalahan.\n• B. Menyalahkan anggota lain → Salah. Sikap ini tidak jujur dan dapat merugikan teman satu kelompok.\n• C. Beralasan agar tidak dimarahi → Salah. Memberi alasan untuk menghindari kesalahan menunjukkan sikap tidak bertanggung jawab.\n• D. Diam saja → Salah. Diam tidak menyelesaikan masalah dan membuat tugas kelompok tetap terbengkalai.',
  },
  {
    id: 31,
    theme: 'kerja_keras',
    boxType: 'biru',
    question: 'Kelompok Dina mendapat tugas membuat proyek IPS yang cukup sulit. Apa yang sebaiknya dilakukan Dina?',
    options: ['Menunggu teman lain mengerjakan', 'Menyalin dari internet tanpa memahami', 'Mengerjakan secara bertahap dengan tekun', 'Tidak ikut terlibat'],
    answer: 2,
    explanation:
      'Dalam mengerjakan proyek IPS yang sulit, Dina sebaiknya tidak mudah menyerah. Tugas yang sulit dapat diselesaikan jika dikerjakan secara bertahap, tekun, dan bekerja sama dengan anggota kelompok.\n\nAnalisis Pilihan Jawaban:\n• A. Menunggu teman lain mengerjakan → Salah. Sikap ini menunjukkan tidak bertanggung jawab dalam kerja kelompok.\n• B. Menyalin dari internet tanpa memahami → Salah. Sikap ini tidak jujur dan tidak membantu Dina memahami materi IPS.\n• C. Mengerjakan secara bertahap dengan tekun → Benar. Sikap ini menunjukkan kerja keras, ketekunan, dan tanggung jawab.\n• D. Tidak ikut terlibat → Salah. Sikap ini menunjukkan kurangnya kepedulian dan tanggung jawab terhadap kelompok.',
  },
  {
    id: 32,
    theme: 'kerja_keras',
    boxType: 'merah',
    question: 'Kelompokmu belum menyelesaikan proyek. Salah satu anggota mengusulkan menyalin dari internet agar cepat selesai. Apa keputusan terbaik jika mempertimbangkan kerja keras dan integritas?',
    options: ['Menyalin agar tugas selesai tepat waktu', 'Tetap mengerjakan sendiri meskipun sederhana', 'Menunda pengumpulan tugas', 'Membiarkan satu orang mengerjakan semuanya'],
    answer: 1,
    explanation:
      'Dalam kerja kelompok, menyelesaikan proyek memang penting. Namun, tugas harus dikerjakan dengan cara yang jujur, bertanggung jawab, dan menunjukkan kerja keras. Menyalin dari internet tanpa mengolah sendiri termasuk tindakan tidak berintegritas.\n\nKeputusan terbaik adalah tetap mengerjakan sendiri meskipun hasilnya sederhana. Hal ini menunjukkan bahwa kelompok mau berusaha, belajar dari proses, dan tidak mengambil jalan pintas yang tidak jujur.\n\nAnalisis Pilihan Jawaban:\n• A: Salah. Meskipun tugas cepat selesai, menyalin dari internet bukan sikap jujur.\n• B: Benar. Sikap ini menunjukkan kerja keras, kejujuran, tanggung jawab, dan integritas.\n• C: Salah. Menunda tugas bukan keputusan terbaik karena menunjukkan kurangnya kedisiplinan.\n• D: Salah. Kerja kelompok harus dilakukan bersama. Membebankan tugas kepada satu orang tidak adil.',
  },
  {
    id: 33,
    theme: 'kerja_keras',
    boxType: 'kuning',
    question: 'Rafi mengikuti lomba karya tulis. Ia sudah berusaha keras, tetapi hasilnya belum maksimal. Temannya menawarkan karya jadi dari internet yang bisa langsung dikumpulkan agar menang. Apa keputusan terbaik yang mencerminkan kerja keras dan integritas?',
    options: ['Menggunakan karya tersebut agar menang lomba', 'Menggabungkan sedikit hasil sendiri dengan karya dari internet', 'Tidak jadi ikut lomba karena merasa kalah', 'Tetap menggunakan hasil sendiri dan memperbaikinya semampunya'],
    answer: 3,
    explanation:
      'Dalam mengikuti lomba karya tulis, Rafi sudah menunjukkan sikap kerja keras karena ia berusaha membuat karya sendiri. Meskipun hasilnya belum maksimal, menggunakan karya jadi dari internet bukanlah keputusan yang benar karena termasuk tindakan tidak jujur.\n\nKeputusan terbaik adalah tetap menggunakan hasil karya sendiri, lalu memperbaikinya semampunya. Sikap ini menunjukkan bahwa Rafi menghargai proses, tidak mengambil jalan pintas, dan tetap bertanggung jawab terhadap usahanya sendiri.\n\nAnalisis Pilihan Jawaban:\n• A: Salah. Sikap ini tidak jujur karena menggunakan karya orang lain seolah-olah karya sendiri.\n• B: Salah. Menggunakan karya dari internet tanpa kejujuran tetap melanggar integritas.\n• C: Salah. Sikap ini menunjukkan mudah menyerah dan tidak mencerminkan kerja keras.\n• D: Benar. Sikap ini menunjukkan kerja keras, kejujuran, tanggung jawab, dan integritas.',
  },
  {
    id: 34,
    theme: 'kerja_keras',
    boxType: 'hijau',
    question: 'Dalam pepatah Jawa “Jer Basuki Mawa Beya” (keberhasilan membutuhkan usaha), Ardi sedang mengikuti lomba IPS. Ia merasa lelah dan ingin mengambil jalan pintas dengan menyalin karya orang lain. Apa keputusan yang paling tepat?',
    options: ['Menyalin karya agar cepat selesai', 'Menggabungkan sedikit karya sendiri dengan milik orang lain', 'Tetap berusaha menyelesaikan sendiri meskipun sulit', 'Mengundurkan diri dari lomba'],
    answer: 2,
    explanation:
      'Pepatah Jawa “Jer Basuki Mawa Beya” berarti bahwa setiap keberhasilan membutuhkan usaha, perjuangan, dan pengorbanan. Dalam soal tersebut, Ardi sedang mengikuti lomba IPS tetapi merasa lelah dan tergoda untuk menyalin karya orang lain.\n\nSikap yang paling tepat adalah tetap berusaha menyelesaikan karya sendiri meskipun sulit. Hal ini menunjukkan bahwa Ardi memiliki sikap kerja keras, jujur, mandiri, dan bertanggung jawab.\n\nAnalisis Pilihan Jawaban:\n• A: Salah. Sikap ini tidak jujur dan termasuk bentuk plagiarisme.\n• B: Salah. Mengambil karya orang lain tanpa izin atau sumber tetap tidak dibenarkan.\n• C: Benar. Sikap ini sesuai dengan makna pepatah, yaitu keberhasilan harus dicapai melalui usaha dan kerja keras.\n• D: Salah. Mengundurkan diri bukan pilihan terbaik jika Ardi masih bisa berusaha menyelesaikan tugasnya.',
  },
  {
    id: 35,
    theme: 'kerja_keras',
    boxType: 'ungu',
    question: 'Doni sudah belajar keras untuk ujian, tetapi nilainya masih di bawah teman yang menyontek. Apa sikap paling tepat?',
    options: ['Ikut menyontek di ujian berikutnya', 'Protes keras kepada guru', 'Menyalahkan sistem ujian', 'Tetap belajar dan memperbaiki cara belajar'],
    answer: 3,
    explanation:
      'Dalam situasi tersebut, Doni sudah menunjukkan sikap kerja keras karena ia telah belajar dengan sungguh-sungguh. Meskipun hasilnya belum sesuai harapan, Doni tidak boleh meniru perilaku teman yang menyontek.\n\nSikap paling tepat adalah tetap belajar dan memperbaiki cara belajar. Dengan begitu, Doni dapat meningkatkan kemampuannya secara jujur dan bertanggung jawab. Nilai yang diperoleh dari usaha sendiri lebih bermakna.\n\nAnalisis Pilihan Jawaban:\n• A: Salah. Menyontek adalah tindakan tidak jujur dan merugikan diri sendiri.\n• B: Salah. Protes keras bukan sikap yang tepat. Jika ada kecurangan, sampaikan dengan sopan.\n• C: Salah. Menyalahkan keadaan tidak membantu Doni memperbaiki diri.\n• D: Benar. Sikap ini menunjukkan kerja keras, kejujuran, kesabaran, dan tanggung jawab.',
  },
  {
    id: 36,
    theme: 'kerja_keras',
    boxType: 'biru',
    question: 'Nilai tugasmu rendah padahal kamu merasa sudah belajar. Apa langkah paling tepat?',
    options: ['Menyalahkan guru', 'Menyalin tugas dikesempatan berikutnya', 'Mengabaikan nilai tersebut', 'Mengevaluasi cara belajar dan mencoba strategi baru'],
    answer: 3,
    explanation:
      'Ketika nilai tugas rendah meskipun sudah belajar, langkah yang paling tepat adalah mengevaluasi cara belajar. Nilai rendah bukan berarti gagal, tetapi menjadi bahan untuk mengetahui bagian mana yang perlu diperbaiki.\n\nSiswa perlu mencari tahu penyebabnya, misalnya kurang memahami materi atau kurang latihan soal. Setelah itu, siswa dapat mencoba strategi baru agar hasil belajar berikutnya lebih baik.\n\nAnalisis Pilihan Jawaban:\n• A: Salah. Menyalahkan guru tidak menyelesaikan masalah.\n• B: Salah. Menyalin tugas termasuk perilaku tidak jujur.\n• C: Salah. Mengabaikan nilai membuat siswa kehilangan kesempatan memperbaiki diri.\n• D: Benar. Sikap ini menunjukkan tanggung jawab, kerja keras, dan kemauan untuk memperbaiki diri.',
  },
  {
    id: 37,
    theme: 'kerja_keras',
    boxType: 'merah',
    question: 'Dalam kerja kelompok, dua anggota tidak bekerja. Kamu bisa melaporkan mereka atau diam saja agar tidak terjadi konflik. Apa tindakan terbaik?',
    options: ['Diam agar kelompok tetap aman', 'Mengerjakan semuanya sendiri', 'Mengajak mereka berdiskusi dan membagi tugas secara adil', 'Mengeluarkan mereka dari kelompok tanpa bicara'],
    answer: 2,
    explanation:
      'Dalam kerja kelompok, setiap anggota seharusnya ikut berperan dan bertanggung jawab terhadap tugas yang diberikan. Jika ada dua anggota yang tidak bekerja, tindakan terbaik bukan langsung melaporkan atau diam, tetapi mengajak mereka berdiskusi.\n\nDengan berdiskusi, masalah dapat diselesaikan secara baik-baik tanpa menimbulkan konflik. Pembagian tugas secara adil juga membuat semua anggota merasa memiliki tanggung jawab yang sama.\n\nAnalisis Pilihan Jawaban:\n• A: Salah. Diam tidak menyelesaikan masalah. Anggota yang tidak bekerja tetap tidak bertanggung jawab.\n• B: Salah. Mengerjakan semuanya sendiri tidak adil bagi anggota yang sudah berkontribusi.\n• C: Benar. Sikap ini menunjukkan keadilan, tanggung jawab, kerja sama, dan kemampuan komunikasi.\n• D: Salah. Mengeluarkan tanpa bicara kurang bijak dan dapat menimbulkan konflik baru.',
  },
  {
    id: 38,
    theme: 'kerja_keras',
    boxType: 'kuning',
    question: 'Seorang siswa memiliki dua pilihan: Belajar dengan sungguh-sungguh tetapi hasil belum pasti, atau menggunakan cara curang dengan hasil tinggi. Jika ia memilih kerja keras, apa prinsip utama yang dipegang?',
    options: ['Semua cara boleh dilakukan', 'Hasil lebih penting daripada proses', 'Proses jujur lebih bernilai daripada hasil instan', 'Nilai tinggi adalah tujuan utama'],
    answer: 2,
    explanation:
      'Soal ini membahas pilihan antara belajar dengan sungguh-sungguh dan menggunakan cara curang untuk mendapatkan hasil tinggi. Jika siswa memilih kerja keras, berarti ia memegang prinsip bahwa keberhasilan harus dicapai melalui cara yang jujur, benar, dan bertanggung jawab.\n\nDalam pendidikan antikorupsi, nilai yang ditekankan bukan hanya hasil akhir, tetapi juga proses yang ditempuh. Nilai tinggi tidak bermakna baik apabila diperoleh dengan kecurangan.\n\nAnalisis Pilihan Jawaban:\n• A: Salah. Pilihan ini justru membenarkan cara curang.\n• B: Salah. Sikap ini dapat mendorong siswa melakukan kecurangan demi nilai tinggi.\n• C: Benar. Sikap ini menunjukkan bahwa siswa menghargai usaha, kejujuran, dan kerja keras.\n• D: Salah. Nilai tinggi memang baik, tetapi harus diperoleh melalui proses yang jujur.',
  },
  {
    id: 39,
    theme: 'kerja_keras',
    boxType: 'hijau',
    question: 'Pepatah “Sapa temen bakal tinemu” berarti siapa yang bersungguh-sungguh akan berhasil. Rina kesulitan memahami materi IPS dan tergoda menyontek saat ujian. Apa sikap yang sesuai dengan nilai tersebut?',
    options: ['Meminta jawaban dari teman', 'Menyontek agar nilainya baik', 'Berusaha belajar dan mengerjakan sendiri', 'Tidak mengerjakan soal'],
    answer: 2,
    explanation:
      'Pepatah “Sapa temen bakal tinemu” bermakna bahwa orang yang bersungguh-sungguh, tekun, dan berusaha keras akan memperoleh hasil yang baik.\n\nDalam soal, Rina mengalami kesulitan memahami materi IPS dan tergoda untuk menyontek. Sikap yang sesuai dengan pepatah tersebut adalah tetap berusaha belajar dan mengerjakan ujian sendiri, bukan mencari jalan pintas dengan menyontek.\n\nAnalisis Pilihan Jawaban:\n• A: Salah. Sikap ini tidak menunjukkan kesungguhan dan termasuk perilaku tidak jujur.\n• B: Salah. Menyontek bertentangan dengan nilai kejujuran dan kerja keras.\n• C: Benar. Sikap ini sesuai dengan pepatah karena menunjukkan kerja keras, kesungguhan, dan kemandirian.\n• D: Salah. Sikap ini menunjukkan mudah menyerah.',
  },
  {
    id: 40,
    theme: 'kerja_keras',
    boxType: 'ungu',
    question: 'Teman-temanmu menganggap belajar terlalu serius itu “tidak keren” dan mengajakmu untuk santai saja menjelang ujian. Apa sikap terbaik?',
    options: ['Mengikuti mereka agar tidak dikucilkan', 'Belajar diam-diam tetapi tetap ikut malas-malasan', 'Tetap fokus belajar meskipun berbeda dari teman', 'Tidak belajar sama sekali'],
    answer: 2,
    explanation:
      'Menjelang ujian, sikap yang tepat adalah tetap fokus belajar meskipun ada teman yang menganggap belajar serius itu “tidak keren”. Setiap siswa memiliki tanggung jawab terhadap hasil belajarnya sendiri.\n\nMengikuti ajakan teman untuk malas-malasan dapat merugikan diri sendiri. Sikap terbaik adalah tetap percaya diri, disiplin, dan tidak mudah terpengaruh oleh lingkungan yang kurang baik.\n\nAnalisis Pilihan Jawaban:\n• A: Salah. Sikap ini menunjukkan mudah terpengaruh dan tidak memiliki pendirian.\n• B: Salah. Sikap ini tidak konsisten dan kurang menunjukkan keberanian moral.\n• C: Benar. Sikap ini menunjukkan disiplin, mandiri, kerja keras, dan berani mengambil keputusan.\n• D: Salah. Sikap ini menunjukkan kurang tanggung jawab.',
  },
  {
    id: 41,
    theme: 'sederhana',
    boxType: 'biru',
    question: 'Reno ingin mengikuti lomba sekolah. Ia melihat temannya menggunakan perlengkapan mahal agar terlihat lebih hebat, padahal Reno memiliki perlengkapan sederhana yang masih layak. Apa sikap yang paling tepat?',
    options: ['Membeli perlengkapan mahal agar terlihat setara', 'Menggunakan perlengkapan sederhana dan fokus pada kemampuan', 'Meminjam barang mahal dari teman agar terlihat bagus', 'Tidak jadi ikut lomba'],
    answer: 1,
    explanation:
      'Dalam mengikuti lomba, hal yang paling penting bukanlah perlengkapan yang mahal, tetapi kemampuan, usaha, dan percaya diri. Reno sudah memiliki perlengkapan sederhana yang masih layak digunakan, sehingga ia tidak perlu memaksakan diri.\n\nSikap yang tepat adalah menggunakan perlengkapan yang ada dengan sebaik-baiknya dan fokus meningkatkan kemampuan. Hal ini menunjukkan sikap sederhana, mandiri, dan percaya diri.\n\nAnalisis Pilihan Jawaban:\n• A: Salah. Sikap ini mementingkan penampilan luar bukan kemampuan.\n• B: Benar. Sikap ini menunjukkan kesederhanaan, percaya diri, dan penolakan terhadap gaya hidup konsumtif.\n• C: Salah. Meminjam barang mewah hanya demi gengsi tidak mencerminkan integritas diri.\n• D: Salah. Tetap ikut berlomba dengan modal kesederhanaan dan kemampuan optimal.',
  },
  {
    id: 42,
    theme: 'sederhana',
    boxType: 'merah',
    question: 'Teman-temanmu sering membawa barang mahal ke sekolah. Kamu merasa tidak percaya diri dengan barang sederhana yang kamu miliki. Apa sikap yang tepat?',
    options: ['Memaksa orang tua membeli barang mahal', 'Meminjam barang teman agar terlihat sama', 'Tetap menggunakan barang yang ada dengan percaya diri', 'Tidak mau bergaul dengan teman'],
    answer: 2,
    explanation:
      'Dalam kehidupan sehari-hari, setiap orang memiliki kondisi ekonomi yang berbeda-beda. Ketika teman-teman membawa barang mahal ke sekolah, sikap yang tepat adalah tetap percaya diri dengan barang yang dimiliki.\n\nBarang sederhana bukan berarti buruk atau memalukan. Yang lebih penting adalah manfaat barang tersebut. Sikap ini menunjukkan nilai sederhana, percaya diri, dan rasa syukur.\n\nAnalisis Pilihan Jawaban:\n• A: Salah. Sikap ini tidak mencerminkan kesederhanaan dan membebani orang tua.\n• B: Salah. Menunjukkan kurang percaya diri dan sekadar ikut-ikutan penampilan.\n• C: Benar. Sikap ini menunjukkan rasa syukur, percaya diri, dan esensi kesederhanaan.\n• D: Salah. Perbedaan materi tidak boleh memutus tali pertemanan.',
  },
  {
    id: 43,
    theme: 'sederhana',
    boxType: 'kuning',
    question: 'Dalam laporan kegiatan, kelompokmu diminta melaporkan penggunaan dana. Ada sisa uang yang cukup banyak. Apa yang sebaiknya dilakukan?',
    options: ['Mengubah laporan agar terlihat habis', 'Membagi sisa uang di antara anggota', 'Melaporkan sesuai kenyataan apa adanya', 'Menyembunyikan sisa uang'],
    answer: 2,
    explanation:
      'Dalam laporan kegiatan, penggunaan dana harus disampaikan secara jujur, transparan, dan sesuai kenyataan. Jika ada sisa uang yang cukup banyak, kelompok tidak boleh mengubah laporan, membagi uang tanpa izin, atau menyembunyikannya.\n\nSikap yang benar adalah melaporkan sisa uang tersebut apa adanya kepada guru atau pihak yang berwenang. Dengan begitu, kelompok menunjukkan sikap bertanggung jawab dan dapat dipercaya.\n\nAnalisis Pilihan Jawaban:\n• A: Salah. Tindakan ini tidak jujur dan termasuk manipulasi laporan.\n• B: Salah. Sisa uang bukan milik pribadi anggota kelompok.\n• C: Benar. Sikap ini menunjukkan kejujuran, transparansi, dan tanggung jawab finansial.\n• D: Salah. Menyembunyikan uang menunjukkan indikasi awal tindakan koruptif.',
  },
  {
    id: 44,
    theme: 'sederhana',
    boxType: 'hijau',
    question: '“Ojo Dumeh” Jangan merasa sombong. Sekolahmu mengadakan pameran proyek. Beberapa kelompok sengaja menghias stan secara berlebihan agar terlihat paling menarik, bahkan menggunakan dana di luar kebutuhan. Kelompokmu memiliki pilihan untuk melakukan hal yang sama. Apa keputusan yang paling tepat?',
    options: ['Menampilkan hasil sederhana namun sesuai isi dan usaha', 'Menghias semewah mungkin agar terlihat unggul', 'Mengikuti kelompok lain agar tidak kalah', 'Mengurangi isi proyek agar fokus pada tampilan'],
    answer: 0,
    explanation:
      'Ungkapan “Ojo Dumeh” dalam budaya Jawa berarti jangan merasa sombong, jangan berlebihan, dan jangan menggunakan kelebihan untuk merendahkan orang lain. Dalam konteks pameran proyek sekolah, sikap yang tepat adalah menampilkan hasil kerja secara wajar dan sederhana.\n\nMenghias stan boleh dilakukan, tetapi tidak perlu berlebihan sampai memboroskan dana. Yang lebih penting dalam pameran proyek adalah isi, proses kerja, kejujuran, dan usaha kelompok.\n\nAnalisis Pilihan Jawaban:\n• A: Benar. Pilihan ini mencerminkan sikap sederhana, jujur, tidak sombong, dan tetap menghargai proses.\n• B: Salah. Bertentangan dengan nilai Ojo Dumeh karena terlalu jor-joran penampilan luar.\n• C: Salah. Keputusan yang baik tidak harus membebek tindakan berlebihan orang lain.\n• D: Salah. Isi materi proyek jauh lebih utama dibanding bungkus luar.',
  },
  {
    id: 45,
    theme: 'sederhana',
    boxType: 'ungu',
    question: 'Kamu mendapat uang saku lebih dari orang tua untuk keperluan sekolah, tetapi tidak semuanya terpakai. Apa yang sebaiknya kamu lakukan?',
    options: ['Menghabiskan semuanya agar tidak terlihat sisa', 'Menyimpan atau mengembalikan sisa dengan jujur', 'Menggunakan untuk hal yang tidak perlu', 'Memberikan kepada teman tanpa alasan jelas'],
    answer: 1,
    explanation:
      'Uang saku yang diberikan orang tua untuk keperluan sekolah harus digunakan sesuai kebutuhan. Jika uang tersebut masih tersisa, sikap yang baik adalah menyimpan atau mengembalikannya dengan jujur kepada orang tua.\n\nTindakan ini menunjukkan bahwa kita dapat dipercaya, tidak boros, dan mampu menggunakan uang dengan bertanggung jawab.\n\nAnalisis Pilihan Jawaban:\n• A: Salah. Menunjukkan perilaku boros dan konsumtif.\n• B: Benar. Menunjukkan kejujuran, hidup sederhana, dan amanah terhadap pemberian orang tua.\n• C: Salah. Membeli barang non-esensial mencerminkan perilaku boros.\n• D: Salah. Memberi kepada teman harus ada urgensi dan transparansi kepada orang tua.',
  },
  {
    id: 46,
    theme: 'sederhana',
    boxType: 'biru',
    question: 'Setelah berhasil menjadi juara kelas, Dinda sering memamerkan prestasinya kepada teman-teman. Apa sikap yang mencerminkan kesederhanaan?',
    options: ['Bersikap biasa saja dan tetap rendah hati', 'Terus menunjukkan prestasi agar dihargai', 'Membandingkan diri dengan teman lain', 'Menganggap diri paling hebat'],
    answer: 0,
    explanation:
      'Setelah menjadi juara kelas, Dinda sebaiknya tetap bersikap rendah hati dan tidak berlebihan dalam menunjukkan prestasinya. Prestasi memang boleh disyukuri, tetapi tidak perlu dipamerkan secara berlebihan.\n\nSikap sederhana ditunjukkan dengan cara bersikap biasa saja, tidak sombong, tidak merasa paling hebat, serta tetap menghargai teman lain.\n\nAnalisis Pilihan Jawaban:\n• A: Benar. Sikap ini mencerminkan nilai kesederhanaan karena Dinda tetap membumi.\n• B: Salah. Menunjukkan motivasi intrinsik yang haus akan pujian eksternal.\n• C: Salah. Membandingkan diri berpotensi memicu keretakan hubungan sosial.\n• D: Salah. Jatuh pada sifat sombong yang merusak nilai integritas diri.',
  },
  {
    id: 47,
    theme: 'sederhana',
    boxType: 'merah',
    question: 'Kelompokmu diminta membuat presentasi. Ada usulan untuk menambahkan data yang dilebih-lebihi agar terlihat lebih bagus. Apa sikap terbaik?',
    options: ['Menyetujui agar presentasi menarik', 'Menambahkan sedikit saja agar tidak ketahuan', 'Membiarkan anggota lain memutuskan', 'Menolak dan tetap menyajikan data apa adanya'],
    answer: 3,
    explanation:
      'Data yang disajikan dalam presentasi akademik harus jujur, benar, dan sesuai fakta lapangan. Melebih-lebihkan data demi tampilan visual atau impresi semata adalah bentuk ketidakjujuran akademik.\n\nJawaban yang paling tepat adalah D: Menolak dan tetap menyajikan data apa adanya. Sikap tersebut menunjukkan nilai kejujuran, tanggung jawab, dan integritas ilmiah dalam kerja kelompok.\n\nAnalisis pilihan jawaban:\n• A: Tidak tepat, karena estetika presentasi tidak boleh mengorbankan validitas data.\n• B: Tidak tepat, karena manipulasi sekecil apa pun tetap dikategorikan tidak jujur.\n• C: Kurang tepat, sebagai bagian dari kelompok kita berkewajiban menyuarakan kebenaran.',
  },
  {
    id: 48,
    theme: 'sederhana',
    boxType: 'kuning',
    question: 'Sekolah memberikan dana untuk membuat proyek kelompok. Ketua kelompok ingin membeli bahan yang mahal agar terlihat lebih menarik, padahal ada alternatif lebih sederhana. Apa keputusan terbaik?',
    options: ['Menggunakan semua dana agar hasil terlihat mewah', 'Menggunakan bahan sesuai kebutuhan dan efisien', 'Menyimpan sisa dana untuk kepentingan pribadi', 'Membeli bahan mahal agar mendapat pujian'],
    answer: 1,
    explanation:
      'Dalam penggunaan anggaran bersama atau dana sekolah, asas efisiensi, kebutuhan, dan transparansi harus diutamakan. Membeli barang mahal demi gengsi stan bertentangan dengan prinsip kesederhanaan.\n\nKeputusan terbaik adalah B: Menggunakan bahan sesuai kebutuhan dan efisien. Jika proyek bisa diselesaikan optimal dengan bahan yang lebih terjangkau, sisa dana harus dikembalikan secara utuh dan transparan.\n\nAnalisis Pilihan Jawaban:\n• A & D: Salah, berorientasi kemewahan kosmetik dan pujian subjektif.\n• C: Salah total, penyalahgunaan dana seperti ini termasuk tindakan koruptif skala kecil.',
  },
  {
    id: 49,
    theme: 'sederhana',
    boxType: 'hijau',
    question: 'Andhap Asor memiliki nilai rendah hati, tidak sombong, dan menghargai orang lain. Setelah presentasi, kelompokmu mendapat pujian dari guru. Teman kelompok lain terlihat kurang percaya diri. Apa sikap yang paling tepat?',
    options: ['Menunjukkan bahwa kelompokmu lebih unggul', 'Membandingkan hasil dengan kelompok lain', 'Tetap rendah hati dan menghargai usaha kelompok lain', 'Mengabaikan kelompok lain'],
    answer: 2,
    explanation:
      'Andhap asor mengajarkan kita bersikap membumi saat berada di puncak keberhasilan. Pujian dari guru harus disikapi sebagai bahan evaluasi internal, bukan alat validasi untuk menyombongkan diri.\n\nSikap yang paling tepat adalah C: Tetap rendah hati dan menghargai usaha kelompok lain. Hal ini menjaga keharmonisan kelas dan memotivasi rekan sejawat yang sedang jatuh mentalnya.\n\nAnalisis Pilihan Jawaban:\n• A & B: Salah, memicu persaingan tidak sehat dan menurunkan moral kawan.\n• D: Kurang tepat, karena minim empati sosial terhadap dinamika kelas.',
  },
  {
    id: 50,
    theme: 'sederhana',
    boxType: 'ungu',
    question: 'Kamu mendapat pujian dari guru karena hasil tugasmu bagus. Apa sikap yang mencerminkan kesederhanaan?',
    options: ['Membanggakan diri di depan teman', 'Menganggap diri paling pintar', 'Menerima pujian dengan rendah hati dan tetap belajar', 'Meremehkan teman lain'],
    answer: 2,
    explanation:
      'Sikap sederhana berarti proporsional dalam merespons pencapaian personal. Ketika mendapat apresiasi, seorang siswa berintegritas menjadikannya pecutan untuk mempertahankan konsistensi belajarnya.\n\nJawaban yang benar: C. Menerima pujian dengan rendah hati dan tetap belajar. Menjaga diri dari jebakan merasa paling hebat dan tetap menghormati proses belajar kawan-kawan kelas.',
  },
  {
    id: 51,
    theme: 'mandiri',
    boxType: 'biru',
    question: 'Perilaku tidak mandiri dalam belajar dapat berhubungan dengan perilaku koruptif karena…',
    options: ['Membuat siswa lebih cepat berhasil', 'Membiasakan ketergantungan dan mencari jalan instan', 'Tidak berpengaruh pada karakter', 'Hanya terjadi di sekolah'],
    answer: 1,
    explanation:
      'Ketergantungan kronis pada bantuan orang lain dalam ranah akademik (seperti selalu menyalin PR atau menyontek) mengikis mentalitas pejuang siswa. Siswa terbiasa memotong kompas demi hasil maksimal tanpa menghargai esensi proses belajar.\n\nMentalitas jalan pintas inilah yang menjadi akar psikologis dari tindakan korupsi di masa depan: ingin hasil atau keuntungan besar dengan memanipulasi usaha.\n\nJawaban yang tepat: B. Membiasakan ketergantungan dan mencari jalan instan.',
  },
  {
    id: 52,
    theme: 'mandiri',
    boxType: 'merah',
    question: 'Seorang siswa terbiasa menyalin pekerjaan teman setiap kali mendapat tugas. Kemungkinan akibat dari kebiasaan tersebut adalah…',
    options: ['Kemampuan belajarnya meningkat', 'Ia menjadi lebih mandiri', 'Ia kesulitan saat menghadapi tugas individu', 'Nilainya selalu stabil'],
    answer: 2,
    explanation:
      'Menyalin mentah-mentah hasil kerja kawan menidurkan sel-sel analisis mandiri siswa. Dampak langsungnya akan terasa saat siswa dihadapkan pada ujian tertutup atau tugas mandiri tanpa alat bantu eksternal.\n\nJawaban yang tepat adalah: C. Ia kesulitan saat menghadapi tugas individu. Kemampuan kognitif sejati hanya diperoleh lewat proses trial and error yang dikerjakan secara otentik.',
  },
  {
    id: 53,
    theme: 'mandiri',
    boxType: 'kuning',
    question: 'Seorang siswa menggunakan jasa orang lain untuk membuat tugasnya. Ia mendapatkan nilai tinggi tetapi tidak memahami materi. Keputusan tersebut dapat dinilai sebagai…',
    options: ['Tepat karena hasilnya bagus', 'Kurang tepat karena menghambat kemandirian belajar', 'Wajar karena semua siswa melakukannya', 'Tidak masalah selama nilainya tinggi'],
    answer: 1,
    explanation:
      'Menggunakan joki tugas adalah salah satu bentuk penipuan akademik yang melanggar nilai kemandirian dan kejujuran. Nilai numerik di atas kertas menjadi semu karena tidak merepresentasikan kapasitas intelektual riil mahasiswa/siswa.\n\nJawaban yang benar: B. Kurang tepat karena menghambat kemandirian belajar. Esensi penugasan adalah melatih problem-solving diri sendiri, bukan sekadar komodifikasi nilai.',
  },
  {
    id: 54,
    theme: 'mandiri',
    boxType: 'hijau',
    question: 'Dalam budaya Jawa dikenal prinsip “ora gumantung marang wong liya” (tidak bergantung pada orang lain). Doni selalu meminta temannya mengerjakan tugas karena merasa lebih cepat selesai. Jika dilihat dari nilai tersebut, sikap Doni menunjukkan…',
    options: ['Kerja sama yang baik', 'Efisiensi dalam belajar', 'Ketergantungan dan kurang mandiri', 'Sikap saling membantu'],
    answer: 2,
    explanation:
      'Falsafah “ora gumantung marang wong liya” menekankan kedaulatan diri atas tugas hidup individu. Memanfaatkan kebaikan kawan untuk melarikan diri dari pengerjaan tugas akademik adalah bentuk degradasi karakter mandiri.\n\nJawaban yang tepat adalah C. Ketergantungan dan kurang mandiri. Kolaborasi kelompok sah dilakukan, namun pendelegasian tugas individu secara mutlak kepada orang lain melanggar asas kemandirian.',
  },
  {
    id: 55,
    theme: 'mandiri',
    boxType: 'ungu',
    question: 'Dua siswa memiliki cara berbeda dalam mengerjakan tugas: Siswa A selalu mengerjakan sendiri meskipun hasilnya belum sempurna. Siswa B sering meminta orang lain mengerjakan agar hasilnya bagus. Dampak jangka panjang yang paling mungkin terjadi adalah…',
    options: ['Keduanya memiliki kemampuan yang sama', 'Siswa B lebih berkembang karena hasilnya bagus', 'Siswa A lebih berkembang karena terbiasa mandiri', 'Tidak ada perbedaan'],
    answer: 2,
    explanation:
      'Siswa A menginvestasikan energinya untuk pembentukan ketahanan mental dan pemahaman konsep fundamental secara organik. Kesalahan pengerjaan adalah bagian dari siklus belajar yang konstruktif.\n\nSebaliknya, siswa B membangun ilusi kompetensi yang rapuh. Dalam jangka panjang, siswa A akan jauh lebih kompeten di dunia kerja atau jenjang pendidikan lanjutan karena memiliki fondasi kemandirian kokoh.\n\nJawaban yang benar: C. Siswa A lebih berkembang karena terbiasa mandiri.',
  },
  {
    id: 56,
    theme: 'mandiri',
    boxType: 'biru',
    question: 'Seorang siswa selalu merasa tidak mampu sehingga terus bergantung pada bantuan orang lain. Sikap yang perlu dikembangkan agar lebih mandiri adalah…',
    options: ['Rasa takut gagal', 'Ketergantungan', 'Percaya diri', 'Menghindari tantangan'],
    answer: 2,
    explanation:
      'Akar dari perilaku dependen sering kali bersumber dari rendahnya self-efficacy atau keyakinan internal atas kemampuan diri. Untuk memutus lingkaran setan ketergantungan ini, siswa wajib memupuk rasa percaya diri lewat keberhasilan-keberhasilan kecil yang diraih secara mandiri.\n\nJawaban yang benar: C. Percaya diri. Menghalau rasa inferioritas kognitif dengan berani mencoba memecahkan masalah mandiri.',
  },
  {
    id: 57,
    theme: 'mandiri',
    boxType: 'merah',
    question: 'Perilaku berikut yang paling menunjukkan sikap tidak mandiri adalah…',
    options: ['Bertanya kepada guru saat tidak paham', 'Belajar sendiri sebelum ujian', 'Mencoba mengerjakan meskipun sulit', 'Menyalin seluruh tugas dari teman'],
    answer: 3,
    explanation:
      'Bertanya kepada pendidik saat mengalami jalan buntu kognitif adalah langkah akselerasi belajar yang sahih dan mandiri. Namun, menyerah total dan menyalin portofolio kawan tanpa proses berpikir adalah indikator mutlak hilangnya kemandirian.\n\nJawaban yang tepat: D. Menyalin seluruh tugas dari teman. Tindakan lepas tangan atas kewajiban pengembangan intelektual diri.',
  },
  {
    id: 58,
    theme: 'mandiri',
    boxType: 'kuning',
    question: 'Dalam ujian, kamu ragu dengan jawaban sendiri. Temanmu memberikan kode jawaban yang tampak benar. Jika kamu ingin melatih kemandirian, pilihan terbaik adalah…',
    options: ['Mengikuti jawaban teman', 'Menggabungkan jawaban sendiri dan teman', 'Tetap menggunakan jawaban sendiri', 'Mengosongkan jawaban'],
    answer: 2,
    explanation:
      'Ujian adalah parameter ukur valid untuk memotret peta pemahaman personal. Membuka celah kompromi terhadap kode jawaban kawan, sekalipun di tengah keraguan internal, mencederai fungsi evaluasi tersebut.\n\nJawaban terbaik: C. Tetap menggunakan jawaban sendiri. Lebih terhormat menuai hasil objektif dari keringat analisis sendiri dibanding mendapat skor tinggi artifisial dari hasil mencontek.',
  },
  {
    id: 59,
    theme: 'mandiri',
    boxType: 'hijau',
    question: 'Pepatah “ajining diri saka lathi lan tumindak” mengajarkan bahwa harga diri terlihat dari ucapan dan tindakan. Saat presentasi, Sinta memilih meminta temannya menggantikan karena tidak percaya diri. Jika dikaitkan dengan nilai mandiri, tindakan yang seharusnya dilakukan adalah…',
    options: ['Mencoba presentasi sendiri dengan percaya diri', 'Membiarkan teman menggantikan', 'Menunda presentasi', 'Tidak mengikuti presentasi'],
    answer: 0,
    explanation:
      'Falsafah ini menekankan keselarasan komitmen moral dengan aksi riil di lapangan. Melimpahkan porsi presentasi mandiri ke pundak kawan akibat demam panggung menunjukkan rapuhnya kedaulatan mental.\n\nJawaban yang benar adalah A. Mencoba presentasi sendiri dengan percaya diri. Menghadapi kecemasan berbicara di depan publik demi menuntaskan tanggung jawab personal secara mandiri.',
  },
  {
    id: 60,
    theme: 'mandiri',
    boxType: 'ungu',
    question: 'Seorang siswa dihadapkan pada dua pilihan: Nilai tinggi dengan bantuan orang lain, atau nilai cukup dengan usaha sendiri. Jika dilihat dari nilai mandiri, pilihan yang lebih tepat adalah…',
    options: ['Nilai tinggi lebih penting', 'Usaha sendiri lebih penting', 'Keduanya sama saja', 'Tergantung situasi'],
    answer: 1,
    explanation:
      'Kemandirian antikorupsi memprioritaskan orisinalitas proses di atas glorifikasi hasil akhir. Skor moderat yang diraih lewat integrasi usaha mandiri bernilai jauh lebih mulia dibanding indeks prestasi kumulatif tinggi hasil kecurangan struktural.\n\nJawaban yang benar: B. Usaha sendiri lebih penting. Karakter mandiri dibentuk dari penghargaan tinggi terhadap jerih payah autentik diri sendiri.',
  },
  {
    id: 61,
    theme: 'adil',
    boxType: 'biru',
    question: 'Dalam lomba kelas, juri memberikan nilai lebih tinggi kepada siswa yang dikenal dekat dengannya. Keputusan juri tersebut menunjukkan bahwa ia…',
    options: ['Bersikap objektif', 'Bersikap adil', 'Tidak memihak', 'Bersikap pilih kasih'],
    answer: 3,
    explanation:
      'Seorang evaluator atau juri terikat kontrak moral untuk menanggalkan sentimen personal, kedekatan primordial, maupun relasi kekerabatan saat menjalankan fungsi asesmen. Memanipulasi skor akibat kedekatan emosional melanggar asas keadilan universal.\n\nJawaban yang tepat: D. Bersikap pilih kasih. Jatuh pada bias subjektivitas yang merugikan hak kontestan lain yang tampil lebih baik.',
  },
  {
    id: 62,
    theme: 'adil',
    boxType: 'merah',
    question: 'Seorang ketua kelas membagi tugas kelompok sebagai berikut: Siswa yang aktif mendapat tugas lebih banyak, sedangkan siswa yang kurang aktif mendapat tugas lebih sedikit. Keputusan ini dapat dinilai…',
    options: ['Tidak adil karena tugas tidak sama', 'Adil karena sesuai kemampuan masing-masing', 'Tidak tepat karena semua harus sama', 'Kurang tepat karena membebani siswa aktif'],
    answer: 1,
    explanation:
      'Keadilan tidak selalu diejawantahkan dalam bentuk pembagian matematis sama rata (keadilan komutatif), melainkan proporsional sesuai porsi, kapasitas, kebutuhan, dan beban tanggung jawab (keadilan distributif).\n\nJawaban yang tepat: B. Adil karena sesuai kemampuan masing-masing. Namun, ketua kelas berkewajiban melakukan supervisi agar siswa kurang aktif lambat laun dinaikkan kapasitasnya agar distribusi tugas berimbang di masa depan.',
  },
  {
    id: 63,
    theme: 'adil',
    boxType: 'kuning',
    question: 'Seorang guru mengetahui bahwa salah satu siswa gagal ujian karena kondisi keluarga yang sulit. Guru tersebut mempertimbangkan untuk menaikkan nilainya agar tidak tertinggal. Keputusan yang paling mencerminkan keadilan adalah…',
    options: ['Menaikkan nilai karena rasa kasihan', 'Membiarkan nilai apa adanya tanpa solusi', 'Memberi nilai sesuai hasil, tetapi memberikan kesempatan remedial', 'Menyamakan nilai dengan siswa lain'],
    answer: 2,
    explanation:
      'Keadilan profesional menuntut pendidik menilai berdasarkan capaian kompetensi riil secara objektif (agar adil bagi siswa lain yang berjuang keras). Namun, nilai empati diakomodasi lewat pemberian instrumen pendukung, bukan manipulasi angka langsung.\n\nJawaban yang tepat: C. Memberi nilai sesuai hasil, tetapi memberikan kesempatan remedial. Memberikan ruang afirmasi yang legal bagi siswa tersebut untuk mengejar ketertinggalan lewat prosedur resmi.',
  },
  {
    id: 64,
    theme: 'adil',
    boxType: 'hijau',
    question: 'Nilai “ojo dumeh” mengajarkan agar tidak menyalahgunakan kekuasaan. Seorang panitia lomba memberikan keuntungan kepada temannya. Perilaku ini menunjukkan…',
    options: ['Penyalahgunaan wewenang', 'Sikap membantu', 'Empati', 'Kerja sama'],
    answer: 0,
    explanation:
      'Falsafah “ojo dumeh” memperingatkan pemegang kuasa agar tidak jemawa dan menggunakan otoritas jabatannya secara sewenang-wenang. Nepotisme skala kecil (menguntungkan kolega dalam kompetensi) adalah pelanggaran berat integritas.\n\nJawaban yang benar: A. Penyalahgunaan wewenang. Memanfaatkan hak kepanitiaan untuk merusak iklim kompetisi yang adil dan terbuka.',
  },
  {
    id: 65,
    theme: 'adil',
    boxType: 'ungu',
    question: 'Dalam pembagian bantuan, seorang ketua mempertimbangkan: kondisi ekonomi, jumlah anggota keluarga, dan kebutuhan masing-masing. Keputusan ini menunjukkan bahwa ia…',
    options: ['Tidak adil karena tidak sama', 'Bersikap objektif dan penuh pertimbangan', 'Memihak kelompok tertentu', 'Tidak konsisten'],
    answer: 1,
    explanation:
      'Pendekatan berbasis instrumen kebutuhan riil dalam penyaluran alokasi bantuan adalah manifestasi keadilan sosial yang tepat sasaran. Ketua tersebut menghindari pembagian sama rata buta yang justru berpotensi melanggengkan ketimpangan.\n\nJawaban yang tepat: B. Bersikap objektif dan penuh pertimbangan. Menakar keadilan lewat kacamata ekuitas (equity), bukan sekadar kesetaraan nominal kuantitatif.',
  },
  {
    id: 66,
    theme: 'adil',
    boxType: 'biru',
    question: 'Perilaku berikut yang paling mencerminkan sikap objektif adalah…',
    options: ['Memberi nilai berdasarkan kedekatan', 'Menilai berdasarkan perasaan', 'Menilai berdasarkan kriteria yang jelas', 'Mengikuti pendapat mayoritas'],
    answer: 2,
    explanation:
      'Objektivitas adalah pilar utama keadilan. Penilaian yang kredibel wajib mengacu pada standar operating procedure (SOP) atau rubrik penilaian baku yang telah disepakati sebelum proses evaluasi dimulai.\n\nJawaban yang tepat: C. Menilai berdasarkan kriteria yang jelas. Mengeliminasi interferensi emosi personal, tekanan massa, maupun faktor kedekatan nepotistik.',
  },
  {
    id: 67,
    theme: 'adil',
    boxType: 'merah',
    question: 'Seorang guru memberi nilai lebih tinggi kepada siswa yang mengalami kesulitan, meskipun hasilnya tidak sesuai kriteria. Keputusan ini dapat dianalisis sebagai…',
    options: ['Adil karena penuh kasih sayang', 'Tidak adil karena tidak objektif', 'Tepat karena membantu siswa', 'Wajar karena kondisi tertentu'],
    answer: 1,
    explanation:
      'Kasih sayang pendidik tidak boleh mengaburkan garis demarkasi standar penilaian objektif. Menaikkan nilai secara sepihak tanpa proses perbaikan kompetensi terstruktur justru mencederai prinsip keadilan bagi ekosistem kelas.\n\nJawaban yang benar: B. Tidak adil karena tidak objektif. Tindakan solutif yang benar adalah memberikan bimbingan klinis (remedial teaching) terlebih dahulu, baru mengevaluasi ulang.',
  },
  {
    id: 68,
    theme: 'adil',
    boxType: 'kuning',
    question: 'Dalam pembagian bantuan kelas, semua siswa ingin mendapatkan bagian yang sama. Namun, ada beberapa siswa yang lebih membutuhkan. Apa keputusan yang paling adil?',
    options: ['Membagi sama rata agar semua puas', 'Memberikan lebih kepada yang membutuhkan', 'Memberikan hanya kepada yang aktif', 'Tidak membagikan sama sekali'],
    answer: 1,
    explanation:
      'Menyamaratakan distribusi instrumen bantuan kepada pihak yang berkecukupan dan pihak yang prasejahtera adalah kekeliruan fatal penegakan keadilan. Otoritas pengambil kebijakan kelas harus berani memprioritaskan klaster rentan.\n\nJawaban yang tepat: B. Memberikan lebih kepada yang membutuhkan. Menegakkan keadilan substantif demi meringankan beban siswa yang paling membutuhkan bantuan.',
  },
  {
    id: 69,
    theme: 'adil',
    boxType: 'hijau',
    question: 'Tepa selira merupakan perasaan yang sama dengan orang lain. Seorang anggota kelompok tidak bekerja karena alasan pribadi. Anggota lain meminta agar nilainya dibedakan. Jika mempertimbangkan tepa selira (tenggang rasa) dan keadilan, keputusan terbaik adalah…',
    options: ['Memberi nilai sama karena kasihan', 'Memberi nilai berbeda sesuai kontribusi', 'Mengabaikan masalah', 'Mengikuti keputusan mayoritas'],
    answer: 1,
    explanation:
      'Tepa selira menuntut kita berempati terhadap kemalangan kawan, namun regulasi akademik menuntut akuntabilitas kontribusi. Menyamakan nilai kontributor aktif dengan anggota pasif dengan tameng tenggang rasa adalah bentuk ketidakadilan struktural kelompok.\n\nJawaban yang benar: B. Memberi nilai berbeda sesuai kontribusi. Pilihan ini adil bagi seluruh elemen kelompok. Langkah tepa selira diekspresikan dengan merangkul kawan tersebut untuk membantu tugas susulan secara terpisah.',
  },
  {
    id: 70,
    theme: 'adil',
    boxType: 'ungu',
    question: 'Seorang pemimpin harus memilih: Keputusan yang menyenangkan semua orang, atau keputusan yang adil tetapi tidak disukai sebagian orang. Jika dilihat dari nilai keadilan, pilihan yang paling tepat adalah…',
    options: ['Mengutamakan perasaan semua orang', 'Menghindari konflik', 'Mengambil keputusan yang adil', 'Menunda keputusan'],
    answer: 2,
    explanation:
      'Otoritas kepemimpinan bukan ajang pencarian popularitas (popularity contest). Kebijakan yang adil adakalanya terasa pahit dan memicu resistensi dari kelompok hegemonik yang terganggu zona nyamannya.\n\nJawaban yang benar: C. Mengambil keputusan yang adil. Pemimpin yang berintegritas kokoh pantang mundur menegakkan regulasi adil demi kemaslahatan jangka panjang organisasi/kelas.',
  },
  {
    id: 71,
    theme: 'berani',
    boxType: 'biru',
    question: 'Perilaku berikut yang paling menunjukkan keberanian adalah…',
    options: ['Mengikuti keputusan mayoritas tanpa berpikir', 'Menyampaikan pendapat dengan yakin meskipun berbeda', 'Diam agar tidak salah', 'Menunggu orang lain bertindak'],
    answer: 1,
    explanation:
      'Keberanian sipil (civil courage) diekspresikan lewat keteguhan menyuarakan perspektif alternatif yang berbasis kebenaran di tengah arus konformitas massa. Keberanian bukan sekadar aksi fisik, melainkan keteguhan prinsip mental.\n\nJawaban yang benar: B. Menyampaikan pendapat dengan yakin meskipun berbeda. Berani mendobrak status quo demi menyodorkan ide konstruktif secara elegan.',
  },
  {
    id: 72,
    theme: 'berani',
    boxType: 'merah',
    question: 'Siswa yang tidak berani biasanya lebih mudah…',
    options: ['Memimpin kelompok', 'Mengambil keputusan sendiri', 'Terpengaruh ajakan negatif', 'Menjadi percaya diri'],
    answer: 2,
    explanation:
      'Defisit keberanian moral (moral courage) berbanding lurus dengan tingginya kerentanan individu terperosok dalam tekanan teman sebaya (peer pressure) yang destruktif. Tanpa keberanian, individu sulit mengartikulasikan kata “tidak” pada ajakan menyimpang.\n\nJawaban yang benar: C. Terpengaruh ajakan negatif. Keberanian diperlukan sebagai perisai penolak infiltrasi kebiasaan buruk lingkungan sekitar.',
  },
  {
    id: 73,
    theme: 'berani',
    boxType: 'kuning',
    question: 'Seorang ketua kelompok mengetahui ada anggota yang tidak jujur dalam laporan. Jika ia menegur, suasana kelompok bisa menjadi tidak nyaman. Pilihan yang paling mencerminkan keberanian adalah…',
    options: ['Membiarkan agar suasana tetap tenang', 'Menegur secara bijak meskipun berisiko konflik', 'Mengabaikan masalah', 'Menyerahkan kepada orang lain'],
    answer: 1,
    explanation:
      'Menjaga harmonisasi semu dengan cara menyembunyikan koreng ketidakjujuran adalah bentuk kepemimpinan yang lemah. Keberanian menuntut kita melakukan konfrontasi terukur demi menegakkan kebenaran data.\n\nJawaban yang paling tepat: B. Menegur secara bijak meskipun berisiko konflik. Berani mengeksekusi tindakan korektif demi menyelamatkan marwah integritas laporan kolektif kelompok.',
  },
  {
    id: 74,
    theme: 'berani',
    boxType: 'hijau',
    question: 'Dalam pepatah Jawa “wani amarga bener” (berani karena benar), seorang siswa mengetahui adanya kecurangan saat ujian. Jika ia ingin menerapkan nilai tersebut, sikap yang paling tepat adalah…',
    options: ['Diam agar tidak dimusuhi teman', 'Mengikuti kecurangan agar aman', 'Melaporkan atau menolak kecurangan karena itu salah', 'Menghindari situasi'],
    answer: 2,
    explanation:
      'Aksioma “wani amarga bener, wedi amarga luput” meletakkan kebenaran objektif sebagai motor penggerak keberanian bertindak. Mengetahui kecurangan masif namun memilih bungkam demi keselamatan personal bertentangan dengan falsafah ini.\n\nSikap yang paling tepat: C. Melaporkan atau menolak kecurangan karena itu salah. Keberanian moral untuk menjadi pelapor pelanggaran (whistleblower) demi iklim ujian bersih.',
  },
  {
    id: 75,
    theme: 'berani',
    boxType: 'ungu',
    question: 'Seorang siswa sudah memulai proyek dengan jujur, tetapi melihat kelompok lain menggunakan cara curang dan mendapatkan hasil lebih cepat. Jika ia tetap melanjutkan dengan cara jujur, sikap tersebut menunjukkan…',
    options: ['Ketidakefisienan', 'Kelemahan', 'Sikap pantang mundur dari prinsip', 'Kurang kerja sama'],
    answer: 2,
    explanation:
      'Dilema etis jamak terjadi saat lingkungan sekitar menormalisasi kecurangan demi akselerasi capaian. Konsistensi untuk bertahan di jalur lurus di tengah gempuran jalan pintas kawan membutuhkan stamina integritas tingkat tinggi.\n\nJawaban yang benar: C. Sikap pantang mundur dari prinsip. Menunjukkan kekuatan karakter orisinal yang tidak mudah goyah oleh eksternalitas negatif.',
  },
  {
    id: 76,
    theme: 'berani',
    boxType: 'biru',
    question: 'Seorang siswa ragu untuk menolak ajakan menyontek karena takut dijauhi teman. Jika dilihat dari nilai berani, keputusan menolak ajakan tersebut menunjukkan bahwa ia…',
    options: ['Menghindari masalah', 'Tidak menghargai teman', 'Tidak gentar dalam mempertahankan kebenaran', 'Tidak peduli dengan lingkungan'],
    answer: 2,
    explanation:
      'Menolak kompromi fraud akademik di tengah ancaman sanksi sosial (dikucilkan geng) adalah bukti nyata ketangguhan nyali moral siswa. Ia memposisikan loyalitas pada prinsip kebenaran di atas loyalitas buta pertemanan.\n\nJawaban yang tepat: C. Tidak gentar dalam mempertahankan kebenaran. Ketahanan prinsip diri yang matang.',
  },
  {
    id: 77,
    theme: 'berani',
    boxType: 'merah',
    question: 'Keberanian dalam menolak kecurangan penting karena…',
    options: ['Membuat siswa terlihat berbeda', 'Menghindari konflik', 'Mencegah berkembangnya perilaku koruptif', 'Mempercepat pekerjaan'],
    answer: 2,
    explanation:
      'Korupsi sistemik makro selalu berakar dari toleransi atas pembiaran kecurangan-kecurangan mikro di level institusi pendidikan (seperti mencontek atau plagiarisme). Keberanian memotong mata rantai pembiaran ini bertindak sebagai tindakan preventif dini.\n\nJawaban yang tepat: C. Mencegah berkembangnya perilaku koruptif. Menolak normalisasi perilaku manipulatif sejak dini.',
  },
  {
    id: 78,
    theme: 'berani',
    boxType: 'kuning',
    question: 'Seorang siswa tetap mempertahankan kejujuran meskipun sering diejek oleh teman. Sikap ini menunjukkan bahwa ia…',
    options: ['Tidak peduli lingkungan', 'Tidak memiliki teman', 'Bersikap keras', 'Tegar dalam menghadapi tekanan'],
    answer: 3,
    explanation:
      'Ejekan sosial adalah ujian kelayakan bagi orisinalitas prinsip seseorang. Siswa yang bergeming dari komitmen kejujuran membuktikan dirinya memiliki poros internal karakter yang kokoh.\n\nJawaban yang benar: D. Tegar dalam menghadapi tekanan. Memiliki imunitas mental tinggi dari pengaruh destruktif *peer group*-nya.',
  },
  {
    id: 79,
    theme: 'berani',
    boxType: 'hijau',
    question: 'Pepatah “ajining diri saka tumindak” menunjukkan bahwa tindakan mencerminkan harga diri. Seorang siswa memilih diam ketika melihat ketidakjujuran karena takut terlibat. Sikap tersebut menunjukkan bahwa ia…',
    options: ['Belum menunjukkan keberanian dalam menjaga harga diri', 'Menjaga hubungan sosial', 'Menghindari konflik', 'Bersikap bijaksana'],
    answer: 0,
    explanation:
      'Bungkam melihat kejahatan/kecurangan karena kalkulasi ketakutan personal mencederai nilai harga diri yang sejati. Karakter ksatria mewajibkan intervensi aktif (melapor atau menegur) saat menyaksikan distorsi nilai di depannya.\n\nJawaban yang tepat: A. Belum menunjukkan keberanian dalam menjaga harga diri. Diamnya orang-orang baik adalah karpet merah bagi merajalelanya ketidakjujuran.',
  },
  {
    id: 80,
    theme: 'berani',
    boxType: 'ungu',
    question: 'Seorang siswa harus memilih: Mengikuti kelompok agar aman, atau berdiri sendiri mempertahankan kejujuran. Pilihan yang paling mencerminkan nilai berani adalah…',
    options: ['Mengikuti kelompok', 'Menunda keputusan', 'Menghindari situasi', 'Mempertahankan prinsip meskipun sendiri'],
    answer: 3,
    explanation:
      'Keberanian sejati diuji saat kita terisolasi dalam kebenaran, sementara mayoritas bersekutu dalam kenyamanan yang salah. Berdiri tegak mempertahankan integritas secara soliter adalah capaian tertinggi nilai berani.\n\nJawaban yang benar: D. Mempertahankan prinsip meskipun sendiri. Menolak larut dalam arus penyimpangan kolektif.',
  },
  {
    id: 81,
    theme: 'peduli',
    boxType: 'biru',
    question: 'Kurangnya kepedulian terhadap orang lain dapat mendorong perilaku koruptif karena…',
    options: ['Membuat pekerjaan lebih cepat', 'Mengabaikan dampak tindakan terhadap orang lain', 'Mengurangi konflik', 'Meningkatkan efisiensi'],
    answer: 1,
    explanation:
      'Perilaku koruptif bersumber dari egoisme akut yang mematikan radar empati sosial. Ketika rasa peduli mati, aktor korupsi tidak peduli jika tindakan manipulasinya merampas hak hidup, fasilitas pendidikan, atau kesejahteraan publik.\n\nJawaban yang benar: B. Mengabaikan dampak tindakan terhadap orang lain. Kepedulian sosial adalah jangkar moral penahan hasrat keserakahan personal.',
  },
  {
    id: 82,
    theme: 'peduli',
    boxType: 'merah',
    question: 'Dalam kerja kelompok, seorang anggota tidak bekerja karena masalah pribadi. Anggota lain merasa tidak adil jika nilainya disamakan. Keputusan yang paling mencerminkan kepedulian sekaligus tetap adil adalah…',
    options: ['Memberi nilai sama karena kasihan', 'Memberi nilai berbeda tanpa mempertimbangkan kondisi', 'Memberi kesempatan memperbaiki dengan tanggung jawab tambahan', 'Mengabaikan masalah'],
    answer: 2,
    explanation:
      'Solusi etis penanganan problem kelompok wajib mempertemukan aspek kemanusiaan (peduli) dengan aspek regulasi profesional (adil). Menghukum langsung tanpa tabayun merefleksikan minimnya kepedulian; sebaliknya memaklumi kemalasan total mencederai keadilan.\n\nJawaban yang paling tepat: C. Memberi kesempatan memperbaiki dengan tanggung jawab tambahan. Memvalidasi kesulitan personalnya sekaligus memberikan jalur legal pertanggungjawaban kontribusinya.',
  },
  {
    id: 83,
    theme: 'peduli',
    boxType: 'kuning',
    question: 'Seorang siswa membantu temannya mengerjakan tugas agar cepat selesai, tetapi temannya tidak belajar apa-apa. Jika dianalisis, sikap tersebut…',
    options: ['Murni peduli', 'Peduli tetapi kurang tepat', 'Tidak peduli sama sekali', 'Sangat membantu perkembangan'],
    answer: 1,
    explanation:
      'Membantu kawan dengan cara mengambil alih total beban tugasnya adalah bentuk *toxic altruism*. Niat awalnya berbasis empati, namun eksekusinya justru melumpuhkan kemandirian belajar objek yang ditolong.\n\nJawaban yang benar: B. Peduli tetapi kurang tepat. Pola bantuan yang mencerahkan adalah membimbing proses penalaran konsep, bukan menjadi mesin joki instan bagi tugasnya.',
  },
  {
    id: 84,
    theme: 'peduli',
    boxType: 'hijau',
    question: 'Nilai “gotong royong” mengajarkan saling membantu dalam kesulitan. Dalam kelompok, ada anggota yang kesulitan memahami materi. Sikap yang paling tepat adalah…',
    options: ['Mengabaikan agar tugas cepat selesai', 'Menggantikan semua pekerjaannya', 'Membantu memahami agar bisa mengerjakan sendiri', 'Melaporkan ke guru'],
    answer: 2,
    explanation:
      'Semangat gotong royong luhur menekankan aspek pemberdayaan (empowerment) antaranggota komunitas kelas. Kita maju bersama sebagai satu kesatuan ekosistem pembelajar.\n\nJawaban yang paling tepat: C. Membantu memahami agar bisa mengerjakan sendiri. Berbagi mentoring kognitif agar kawan yang tertinggal mampu mandiri menuntaskan porsi tanggung jawabnya.',
  },
  {
    id: 85,
    theme: 'peduli',
    boxType: 'ungu',
    question: 'Perhatikan dua sikap berikut: Siswa A merasa kasihan melihat temannya kesulitan. Siswa B tidak hanya merasa kasihan, tetapi juga membantu mencari solusi. Sikap yang menunjukkan tingkat kepedulian lebih tinggi adalah…',
    options: ['Siswa A', 'Siswa B', 'Keduanya sama', 'Tidak keduanya'],
    answer: 1,
    explanation:
      'Kepedulian sejati melampaui batas afeksi pasif (merasa iba di dalam hati). Kepedulian yang matang bertransformasi menjadi aksi altruistik riil yang meringankan beban penderitaan orang lain.\n\nJawaban yang tepat adalah B. Siswa B. Mengonversi getaran empati menjadi tindakan solutif nyata di lapangan.',
  },
  {
    id: 86,
    theme: 'peduli',
    boxType: 'biru',
    question: 'Perhatikan dua tindakan: (1) Membantu teman memahami pelajaran. (2) Mengerjakan tugas teman tanpa sepengetahuannya. Tindakan yang benar-benar mencerminkan empati adalah…',
    options: ['1 saja', '2 saja', 'Keduanya', 'Tidak keduanya'],
    answer: 0,
    explanation:
      'Empati fungsional selalu berorientasi pada kemaslahatan jangka panjang objek yang dibantu. Tindakan pertama mendidik karakter dan melatih otak kawan; tindakan kedua memupuk mentalitas pemalas dan manipulatif.\n\nJawaban yang benar: A. 1 saja. Menolong wajib dikawal dengan rambu-rambu regulasi kejujuran dan etika akademik.',
  },
  {
    id: 87,
    theme: 'peduli',
    boxType: 'merah',
    question: 'Sikap kurang peduli terhadap orang lain dalam jangka panjang dapat menyebabkan…',
    options: ['Hubungan sosial semakin kuat', 'Lingkungan menjadi lebih harmonis', 'Meningkatnya kerja sama', 'Menurunnya rasa saling percaya'],
    answer: 3,
    explanation:
      'Erosi kepedulian massal melahirkan masyarakat individualis egosentris yang dingin (atomistik). Saat semua orang sibuk mengamankan kepentingan pribadi tanpa memedulikan hak publik, kohesi sosial akan runtuh.\n\nJawaban yang tepat: D. Menurunnya rasa saling percaya. Krisis kepercayaan (trust crisis) melahirkan kecurigaan akut antarwarga komunitas.',
  },
  {
    id: 88,
    theme: 'peduli',
    boxType: 'kuning',
    question: 'Seorang siswa harus memilih: Membantu temannya yang kesulitan meskipun membutuhkan waktu tambahan, atau fokus pada dirinya sendiri agar tugas cepat selesai. Jika dilihat dari nilai peduli, pilihan yang paling tepat adalah…',
    options: ['Mengutamakan diri sendiri', 'Menghindari keterlibatan', 'Membantu dengan tetap mengatur tanggung jawab pribadi', 'Menunda semua pekerjaan'],
    answer: 2,
    explanation:
      'Solidaritas sosial tidak menuntut penumbangan total kewajiban domestik diri sendiri. Filantropi yang bijak dikerjakan lewat manajemen prioritas waktu yang matang.\n\nJawaban yang paling tepat: C. Membantu dengan tetap mengatur tanggung jawab pribadi. Menolong kawan tanpa mengorbankan kualitas capaian tugas personal yang menjadi amanah utama diri.',
  },
  {
    id: 89,
    theme: 'peduli',
    boxType: 'hijau',
    question: 'Nilai “welas asih” berarti kasih sayang terhadap sesama. Seorang siswa melihat temannya kesulitan membawa banyak buku. Sikap yang paling tepat adalah…',
    options: ['Membantu dengan tulus', 'Membiarkan karena bukan tanggung jawab', 'Menertawakan', 'Mengabaikan'],
    answer: 0,
    explanation:
      'Welas asih (compassion) adalah kepekaan menangkap sinyal distres atau kerepotan sesama, disertai dorongan kuat untuk mengintervensi situasi tersebut demi meringankan bebannya.\n\nJawaban yang benar: A. Membantu dengan tulus. Refleks moral spontan dari karakter pelajar yang beradab dan berbudaya.',
  },
  {
    id: 90,
    theme: 'peduli',
    boxType: 'ungu',
    question: 'Di kelas, beberapa siswa sering mengejek teman yang kurang mampu. Satu siswa memilih untuk membela temannya tersebut. Dampak dari sikap tersebut adalah…',
    options: ['Menimbulkan konflik tanpa manfaat', 'Mengganggu suasana kelas', 'Membuat dirinya dijauhi tanpa alasan', 'Membangun solidaritas dan rasa aman'],
    answer: 3,
    explanation:
      'Aksi pembelaan terhadap korban perundungan (bullying) adalah wujud nyata keberanian peduli (caring courage). Tindakan intervensi ini meruntuhkan dominasi iklim intimidasi di kelas.\n\nJawaban yang benar: D. Membangun solidaritas dan rasa aman. Memberikan sinyal psikologis kuat bahwa nilai keadilan dan perlindungan kemanusiaan tegak berdiri di ekosistem kelas tersebut.',
  },
];