// app/play/form/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type ServerOk =
  | {
      ok: true;
      data: { name: string; email: string; file: null | { name: string; size: number; type: string } };
      message: string;
    }
  | { ok: false; errors: { field?: string; message: string }[] };

export default function FormPlay() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [clientErrors, setClientErrors] = useState<{ name?: string; email?: string; avatar?: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isValidEmail = (val: string) => /\S+@\S+\.\S+/.test(val);

  useEffect(() => {
    if (!avatar) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(avatar);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [avatar]);

  function validateClient() {
    const errs: { name?: string; email?: string; avatar?: string } = {};
    if (name.trim().length < 2) errs.name = "At least 2 characters.";
    if (!email.trim()) errs.email = "Email is required.";
    else if (!isValidEmail(email)) errs.email = "Invalid email format.";

    if (avatar) {
      const maxSize = 2 * 1024 * 1024;
      if (!avatar.type.startsWith("image/")) errs.avatar = "Only image files allowed.";
      if (avatar.size > maxSize) errs.avatar = "Max file size is 2MB.";
    }

    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateClient()) return;

    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch("/api/form", { method: "POST", body: fd });
      const json = (await res.json()) as ServerOk;
      if (json.ok) {
        router.push("/success");
      } else {
        setClientErrors({ email: json.errors[0]?.message }); // example: handle error inline
      }
    } catch (err: unknown) {
      console.error(err);
      setClientErrors({ email: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (key: "name" | "email" | "avatar") =>
    `w-full rounded-xl border px-4 py-2 shadow-md 
     focus:outline-none focus:ring-2 focus:ring-indigo-400 
     ${clientErrors[key] ? "border-red-400 ring-red-200" : "border-gray-300 bg-white"}`;

  return (
    <main className="max-w-lg mx-auto p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-2xl">
      <h1 className="text-2xl font-bold text-gray-800 text-center">Form with File Upload</h1>

      <form onSubmit={onSubmit} className="space-y-4" encType="multipart/form-data">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            name="name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="Jane Doe"
            className={inputClass("name")}
          />
          {clientErrors.name && <p className="text-xs text-red-500 mt-1">{clientErrors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            name="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className={inputClass("email")}
          />
          {clientErrors.email && <p className="text-xs text-red-500 mt-1">{clientErrors.email}</p>}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Avatar (image ≤ 2MB)</label>
          <input
            name="avatar"
            type="file"
            accept="image/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAvatar(e.currentTarget.files?.[0] ?? null)}
            className={inputClass("avatar")}
          />
          {clientErrors.avatar && <p className="text-xs text-red-500 mt-1">{clientErrors.avatar}</p>}

          {avatar && previewUrl && (
            <div className="mt-3 p-3 rounded-xl border shadow-inner bg-white">
              <p className="text-xs text-gray-600">
                Selected: {avatar.name} ({Math.round(avatar.size / 1024)} KB)
              </p>
              <Image
                src={previewUrl}
                alt="Preview"
                width={160}
                height={160}
                className="mt-2 max-h-40 rounded-lg shadow-md"
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-indigo-500 text-white font-medium px-4 py-2 shadow-md 
                       hover:bg-indigo-600 transition disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Submit via Form"}
          </button>
        </div>
      </form>
    </main>
  );
}
