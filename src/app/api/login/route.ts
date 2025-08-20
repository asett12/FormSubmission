import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { username } = await request.json();
  const cookieStore = await cookies();       
  cookieStore.set("user", username);

  return Response.json({ message: `Logged in as ${username}` });
}
