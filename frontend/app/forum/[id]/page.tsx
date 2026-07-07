"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  analyzeForumSentiment,
  createForumComment,
  fetchForumThread,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { ForumSentimentSummary, ForumThreadDetail, Sentiment } from "@/lib/types";

const kolorSentymentu = (s: Sentiment) => {
  if (s === "pozytywny") return "text-green-700 bg-green-50 border-green-200";
  if (s === "negatywny") return "text-red-700 bg-red-50 border-red-200";
  return "text-gray-700 bg-gray-100 border-gray-200";
};

const aktualnyUserId = () => {
  try {
    const token = localStorage.getItem("vox_access_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id ?? null;
  } catch {
    return null;
  }
};

export default function WatekPage() {
  const params = useParams();
  const { user } = useAuth();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [watek, setWatek] = useState<ForumThreadDetail | null>(null);
  const [summary, setSummary] = useState<ForumSentimentSummary | null>(null);
  const [tresc, setTresc] = useState("");
  const [wysylanie, setWysylanie] = useState(false);
  const [analizowanie, setAnalizowanie] = useState(false);
  const [blad, setBlad] = useState("");
  const doLView = useRef<HTMLDivElement>(null);

  const pobierzWatek = useCallback(async () => {
    if (!id) return;
    try {
      const data = await fetchForumThread(id);
      setWatek(data);
    } catch {
      setBlad("Nie mozna pobrac watku.");
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    pobierzWatek();
    const interval = setInterval(pobierzWatek, 3000);
    return () => clearInterval(interval);
  }, [pobierzWatek]);

  useEffect(() => {
    doLView.current?.scrollIntoView({ behavior: "smooth" });
  }, [watek?.komentarze.length]);

  const wyslijKomentarz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !tresc.trim()) return;
    setWysylanie(true);
    setBlad("");

    try {
      await createForumComment(id, { tresc });
      setTresc("");
      setSummary(null);
      await pobierzWatek();
    } catch {
      setBlad("Musisz być zalogowany, aby komentować.");
    } finally {
      setWysylanie(false);
    }
  };

  const canAnalyze = user?.rola === "urzednik" || user?.rola === "admin" || user?.is_superuser;

  const pobierzAnalize = async () => {
    if (!id) return;
    setAnalizowanie(true);
    setBlad("");

    try {
      const data = await analyzeForumSentiment(id);
      setSummary(data);
      await pobierzWatek();
    } catch {
      setBlad("Analizę AI może wykonać tylko urzędnik lub administrator.");
    } finally {
      setAnalizowanie(false);
    }
  };

  if (!watek) return <p className="p-8 text-black">Ładowanie...</p>;

  const userId = aktualnyUserId();

  return (
    <main className="min-h-screen bg-gray-100 text-black flex flex-col">
      <div className="bg-white shadow px-6 py-4 flex items-center gap-4">
        <Link href="/forum" className="text-blue-600 hover:underline text-sm">
          Forum
        </Link>
        <div>
          <h1 className="text-xl font-bold">{watek.tytul}</h1>
          <p className="text-sm text-gray-500">
            {watek.autor} · {new Date(watek.data_utworzenia).toLocaleDateString("pl-PL")}
          </p>
        </div>
      </div>

      {canAnalyze && (
      <section className="max-w-2xl w-full mx-auto px-4 pt-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Analiza AI</h2>
              <p className="text-sm text-gray-500">Zbiorczy sentyment komentarzy w wątku.</p>
            </div>
            <button
              onClick={pobierzAnalize}
              disabled={analizowanie}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {analizowanie ? "Analizuje..." : "Analizuj"}
            </button>
          </div>
          {summary && (
            <div className="mt-3 text-sm text-gray-700">
              <p>{summary.summary}</p>
              <p className="mt-2 text-gray-500">
                Pozytywne: {summary.counts.pozytywny}, neutralne: {summary.counts.neutralny},
                negatywne: {summary.counts.negatywny}, sredni wynik: {summary.average_score}
              </p>
            </div>
          )}
        </div>
      </section>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl w-full mx-auto flex flex-col gap-3">
        {watek.komentarze.length === 0 && (
          <p className="text-center text-gray-400">Brak komentarzy. Napisz pierwszy.</p>
        )}

        {watek.komentarze.map((k) => {
          const jaMowie = k.id_usera !== null && k.id_usera === userId;
          const score = typeof k.wynik_sentymentu === "number" ? k.wynik_sentymentu.toFixed(2) : "0.00";

          return (
            <div
              key={k.id}
              className={`flex flex-col max-w-[80%] ${jaMowie ? "self-end items-end" : "self-start items-start"}`}
            >
              <span className="text-xs text-gray-400 mb-1">
                {jaMowie ? "Ty" : k.autor} ·{" "}
                {new Date(k.data_dodania).toLocaleTimeString("pl-PL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <div
                className={`px-4 py-2 rounded-2xl text-sm ${
                  jaMowie
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white text-black shadow rounded-bl-sm"
                }`}
              >
                {k.tresc}
              </div>
              {canAnalyze && k.sentyment && (
                <span className={`text-xs px-2 py-0.5 rounded-full border mt-1 ${kolorSentymentu(k.sentyment)}`}>
                  {k.sentyment} ({score})
                </span>
              )}
            </div>
          );
        })}
        <div ref={doLView} />
      </div>

      <div className="bg-white border-t px-4 py-3 max-w-2xl w-full mx-auto">
        {blad && <p className="text-red-500 text-sm mb-2">{blad}</p>}
        <form onSubmit={wyslijKomentarz} className="flex gap-2">
          <input
            type="text"
            placeholder="Napisz komentarz..."
            value={tresc}
            onChange={(e) => setTresc(e.target.value)}
            className="flex-1 border border-gray-300 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={wysylanie || !tresc.trim()}
            className="bg-blue-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {wysylanie ? "Wysyłanie..." : "Wyślij"}
          </button>
        </form>
      </div>
    </main>
  );
}
