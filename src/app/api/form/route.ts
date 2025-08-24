// app/api/submissions/route.ts (adjust path if needed)
import { getSupabaseAdmin } from "../../../../lib/supabaseServer";

type ApiError = { field?: string; message: string };

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

function toPublicUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  return base
    ? `${base}/storage/v1/object/public/${key.replace(/^\/+/, "")}`
    : "";
}

export async function POST(request: Request) {
  const fd = await request.formData();

  const name = (fd.get("name") as string | null)?.trim() ?? "";
  const email = (fd.get("email") as string | null)?.trim() ?? "";
  const file = fd.get("avatar") as File | null;

  const errors: ApiError[] = [];

  if (!name) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (name.length < 2) {
    errors.push({ field: "name", message: "Name must have at least 2 characters" });
  }

  if (!email) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!validateEmail(email)) {
    errors.push({ field: "email", message: "Email format looks invalid" });
  }

  const hasFile = !!file && file instanceof File && file.size > 0;
  if (hasFile) {
    if (!file.type || !file.type.startsWith("image/")) {
      errors.push({ field: "avatar", message: "Only image files are allowed." });
    }
  }

  if (errors.length) {
    return Response.json({ ok: false, errors }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const FALLBACK_URL = "/admin/profile.png"; 

  let avatar_path: string | null = null; 
  let avatar_url: string = FALLBACK_URL; 

  // Handle upload if a valid image file was provided 
  if (hasFile && file!.type.startsWith("image/")) {
    // Derive a real extension (avoid .bin)
    const origExt = (file!.name.split(".").pop() || "").toLowerCase();
    const mimeExt = (file!.type.split("/").pop() || "").toLowerCase(); 
    const ext = origExt || mimeExt || "png";

    const filename = `${crypto.randomUUID()}.${ext}`;
    const key = `avatars/${filename}`;

    const { error: uploadErr, data: uploaded } = await supabase.storage
      .from("avatars")
      .upload(key, file!, {
        contentType: file!.type, 
        upsert: false,
      });

    if (uploadErr) {
      return Response.json(
        {
          ok: false,
          errors: [{ field: "avatar", message: `Upload failed: ${uploadErr.message}` }],
        },
        { status: 400 },
      );
    }

    avatar_path = uploaded?.path ?? key;

    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(avatar_path);
    avatar_url = pub.publicUrl || toPublicUrl(avatar_path) || FALLBACK_URL;
  }

  const { data: row, error: dbErr } = await supabase
    .from("submissions")
    .insert({
      name,
      email,
      avatar_path, 
      avatar_url, 
    })
    .select()
    .single();

  if (dbErr) {
    return Response.json(
      { ok: false, errors: [{ message: dbErr.message }] },
      { status: 500 },
    );
  }

  return Response.json({
    ok: true,
    data: row,
    message: `Thanks, ${name}! We'll contact you at ${email}.`,
  });
}

export async function DELETE(_request: Request) {
  return Response.json({ ok: false, message: "Not implemented" }, { status: 405 });
}
