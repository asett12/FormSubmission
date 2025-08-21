import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return(
    <main className="min-h-screen grid place-items-center bg-slate-100">
      <button className="rounded-lg bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-500">
        Tailwind v4 works 🎉
      </button>
    </main>
  )
}
