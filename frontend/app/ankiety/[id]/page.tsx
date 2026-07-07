"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getApiUrl } from "@/lib/api";

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
    fetch(`${getApiUrl()}/surveys/ankiety/${id}/`)
      .then((response) => response.json())
      .then(setAnkieta);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("vox_access_token");
    if (!token) {
      setStatus("Musisz byc zalogowany jako mieszkaniec, aby oddac glos.");
      return;
    }

    setStatus("Wysylanie...");

    try {
      for (const [pytanieId, tresc] of Object.entries(odpowiedzi)) {
        const response = await fetch(`${getApiUrl()}/surveys/ankiety/${id}/odpowiedzi/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pytanie: Number(pytanieId),
            tresc_odpowiedzi: tresc,
          }),
        });

        if (!response.ok) {
          throw new Error("Nie mozna zapisac odpowiedzi.");
        }
      }
      setStatus("Odpowiedzi wyslane. Dziekujemy!");
    } catch {
      setStatus("Nie mozna zapisac odpowiedzi. Sprawdz role konta albo czy juz glosowales.");
    }
  };

  if (!ankieta) return <p className="p-8">Ladowanie...</p>;

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="mx-auto max-w-2xl bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-bold">{ankieta.tytul}</h1>
        <p className="mb-6 text-gray-600">{ankieta.opis}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {ankieta.pytania.map((pytanie) => (
            <div key={pytanie.id}>
              <label className="mb-2 block font-medium">
                {pytanie.tresc} {pytanie.wymagane && <span className="text-red-500">*</span>}
              </label>
              {pytanie.typ === "tekst" && (
                <textarea
                  required={pytanie.wymagane}
                  className="h-24 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setOdpowiedzi({ ...odpowiedzi, [pytanie.id]: e.target.value })}
                />
              )}
              {pytanie.typ === "skala" && (
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setOdpowiedzi({ ...odpowiedzi, [pytanie.id]: String(value) })}
                      className={`h-10 w-10 rounded-full border font-bold transition ${
                        odpowiedzi[pytanie.id] === String(value)
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              )}
              {(pytanie.typ === "jednokrotny" || pytanie.typ === "wielokrotny") && (
                <input
                  type="text"
                  placeholder="Wpisz odpowiedz..."
                  required={pytanie.wymagane}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setOdpowiedzi({ ...odpowiedzi, [pytanie.id]: e.target.value })}
                />
              )}
            </div>
          ))}

          {status && <p className="font-semibold text-blue-600">{status}</p>}

          <button
            type="submit"
            className="rounded bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700"
          >
            Wyslij odpowiedzi
          </button>
        </form>
      </div>
    </main>
  );
}
