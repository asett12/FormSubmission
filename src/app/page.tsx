// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl w-full grid gap-6 sm:grid-cols-2">
        <Link
          href="/play/form" // change to "/form" if you move the page
          className="group rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 hover:shadow-xl transition"
        >
          <div className="text-2xl">🙋‍♀️ User</div>
          <p className="mt-2 text-gray-600">Fill out the submission form.</p>
          <div className="mt-4 inline-block rounded-lg bg-indigo-500 px-4 py-2 text-white shadow group-hover:bg-indigo-600">
            Go to Form
          </div>
        </Link>

        <Link
          href="/admin"
          className="group rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 hover:shadow-xl transition"
        >
          <div className="text-2xl">🛡️ Admin</div>
          <p className="mt-2 text-gray-600">View recent submissions.</p>
          <div className="mt-4 inline-block rounded-lg bg-slate-700 px-4 py-2 text-white shadow group-hover:bg-slate-800">
            Review Submissions
          </div>
        </Link>
      </div>
    </main>
  );
}
