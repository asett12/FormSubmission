'use client'
import { useState } from "react";

export default function JsonPlay(){
    const [out, setOut] = useState<any>(null);

    async function send(){
        const res = await fetch("/api/echo", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({name:"Nann", age:21}),
        });
        setOut(await res.json());
    }

    return(
        <main className="p-6 space-y-4">
            <button onClick={send} className="rounded px-3 py-2 border">Send JSON</button>
            <pre>{JSON.stringify(out, null, 2)}</pre>
        </main>
    )
}