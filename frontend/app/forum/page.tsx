"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiRequestError, createForumThread, fetchForumThreads } from "@/lib/api";
import type { ForumThread } from "@/lib/types";

export default function ForumPage() {
  const [watki, setWatki] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [nowyWatek, setNowyWatek] = useState(false);
  const [tytul, setTytul] = useState("");
  const [blad, setBlad] = useState("");

  const pobierzWatki = async () => {
    try {
      const data = await fetchForumThreads();
      setWatki(data);
    } catch {
      setBlad("Nie można pobrać wątków forum.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    pobierzWatki();
  }, []);

  const utworzWatek = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tytul.trim()) return;
    setBlad("");

    try {
      await createForumThread({ tytul });
      setTytul("");
      setNowyWatek(false);
      await pobierzWatki();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setBlad(error.message);
        return;
      }
      setBlad("Musisz być zalogowany, aby utworzyć wątek.");
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100 text-black">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Forum dyskusyjne</h1>
          <button
            onClick={() => setNowyWatek(!nowyWatek)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {nowyWatek ? "Anuluj" : "Nowy wątek"}
          </button>
        </div>

        {nowyWatek && (
          <form onSubmit={utworzWatek} className="bg-white p-6 rounded-xl shadow mb-6">
            <h2 className="text-lg font-bold mb-3">Nowy wątek</h2>
            <input
              type="text"
              placeholder="Tytuł wątku..."
              value={tytul}
              onChange={(e) => setTytul(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Utwórz wątek
            </button>
          </form>
        )}

        {blad && <p className="text-red-600 text-sm mb-4">{blad}</p>}
        {loading && <p>Ładowanie...</p>}
        {!loading && watki.length === 0 && (
          <p className="text-gray-500">Brak wątków. Bądź pierwszy.</p>
        )}

        <div className="flex flex-col gap-4">
          {watki.map((w) => (
            <Link key={w.id} href={`/forum/${w.id}`}>
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition cursor-pointer">
                <h2 className="text-xl font-bold">{w.tytul}</h2>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                  <span>{w.autor}</span>
                  <span>{w.liczba_komentarzy} komentarzy</span>
                  <span>{new Date(w.data_utworzenia).toLocaleDateString("pl-PL")}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
