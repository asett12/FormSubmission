// app/admin/page.tsx
import Link from "next/link";
import { getSupabaseAdmin } from "../../../lib/supabaseServer";
import Image from "next/image";

export const dynamic = "force-dynamic"; 

export default async function AdminPage() {
  // Fetch latest 50 submissions
  const { data, error } = await getSupabaseAdmin()
    .from("submissions")
    .select("id, name, email, avatar_url, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="rounded-xl bg-red-50 border border-red-200 p-6 max-w-lg text-red-800">
          <h1 className="text-xl font-semibold">Failed to load submissions</h1>
          <p className="mt-2">{error.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-800">Admin — Submissions</h1>

        <div className="mt-6 overflow-x-auto rounded-xl border bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Avatar</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {row.avatar_url ? (
                      <Image
                        width={40}
                        height={40}
                        src={
                          typeof row.avatar_url === "string" && row.avatar_url.trim()
                            ? row.avatar_url
                            : "/admin/profile.png"
                        }
                        alt="avatar"
                        className="h-10 w-10 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg border bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">{row.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}

              {(!data || data.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No submissions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-block rounded-lg bg-slate-700 px-4 py-2 text-white shadow hover:bg-slate-800"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
