export default function SuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-green-50">
      <div className="max-w-md rounded-xl bg-white p-8 shadow-lg text-center">
        <h1 className="text-2xl font-bold text-green-700">✅ Submitted Successfully</h1>
        <p className="mt-3 text-gray-600">
          Thanks for your submission. We’ll get back to you soon.
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded-lg bg-green-600 px-4 py-2 font-medium text-white shadow hover:bg-green-700"
        >
          Go back home
        </a>
      </div>
    </main>
  );
}