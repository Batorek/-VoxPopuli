"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Pytanie {
  id: number;
  tresc: string;
  typ: string;
  wymagane: boolean;
}

interface Ankieta {
  id: number;
  tytul: string;
  opis: string;
  pytania: Pytanie[];
}

export default function AnkietaPage() {
  const { id } = useParams();
  const [ankieta, setAnkieta] = useState<Ankieta | null>(null);
  const [odpowiedzi, setOdpowiedzi] = useState<Record<number, string>>({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch(`http://127.0.0.1:8902/api/surveys/ankiety/${id}/`)
      .then((r) => r.json())
      .then(setAnkieta);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Wysyłanie...");

    try {
      for (const [pytanieId, tresc] of Object.entries(odpowiedzi)) {
        await fetch(`http://127.0.0.1:8902/api/surveys/ankiety/${id}/odpowiedzi/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pytanie: Number(pytanieId), tresc_odpowiedzi: tresc }),
        });
      }
      setStatus("Odpowiedzi wysłane. Dziękujemy!");
    } catch {
      setStatus("Błąd połączenia.");
    }
  };

  if (!ankieta) return <p className="p-8">Ładowanie...</p>;

  return (
    <main className="min-h-screen p-8 bg-gray-100 text-black">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-2">{ankieta.tytul}</h1>
        <p className="text-gray-600 mb-6">{ankieta.opis}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {ankieta.pytania.map((p) => (
            <div key={p.id}>
              <label className="block font-medium mb-2">
                {p.tresc} {p.wymagane && <span className="text-red-500">*</span>}
              </label>
              {p.typ === "tekst" && (
                <textarea
                  required={p.wymagane}
                  className="w-full border border-gray-300 px-3 py-2 rounded h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setOdpowiedzi({ ...odpowiedzi, [p.id]: e.target.value })}
                />
              )}
              {p.typ === "skala" && (
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setOdpowiedzi({ ...odpowiedzi, [p.id]: String(n) })}
                      className={`w-10 h-10 rounded-full border font-bold transition ${
                        odpowiedzi[p.id] === String(n)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
              {(p.typ === "jednokrotny" || p.typ === "wielokrotny") && (
                <input
                  type="text"
                  placeholder="Wpisz odpowiedź..."
                  required={p.wymagane}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setOdpowiedzi({ ...odpowiedzi, [p.id]: e.target.value })}
                />
              )}
            </div>
          ))}

          {status && <p className="text-blue-600 font-semibold">{status}</p>}

          <button
            type="submit"
            className="bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Wyślij odpowiedzi
          </button>
        </form>
      </div>
    </main>
  );
}

