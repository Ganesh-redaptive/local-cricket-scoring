import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Cricket Scorer</h1>
      <Link
        href="/new-match"
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg"
      >
        Create New Match
      </Link>
    </div>
  );
}
