import { cookies } from "next/headers";

export async function GET(){
    const store = await cookies()
    const user = store.get('user');
    if (!user){
        return Response.json({ message: "Not logged in" }, { status: 401 });
    }
    return Response.json({ message: `Welcome back, ${user.value}!` });
}