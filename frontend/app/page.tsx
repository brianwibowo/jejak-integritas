import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-6">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-blue-800 mb-3">
          🎲 Jejak Integritas
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Permainan Ular Tangga Edukatif
        </p>
        <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
          Media pembelajaran berbasis digital dengan nilai-nilai integritas,
          dilema moral, dan kearifan lokal untuk pendidikan anti korupsi.
        </p>
        <Link
          href="/game"
          className="inline-block px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-xl hover:bg-blue-700 transition-colors shadow-lg"
        >
          Mulai Bermain 🎮
        </Link>
      </div>
    </div>
  );
}
