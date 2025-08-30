import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; 

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const full_name: string | undefined = body.full_name;

  // upsert into public.profiles (make sure you've created this table & RLS)
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, full_name }, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
