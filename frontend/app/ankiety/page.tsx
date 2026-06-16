"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Ankieta {
  id: number;
  tytul: string;
  opis: string;
  kategoria: string;
  data_zakonczenia: string | null;
}

export default function AnkietyPage() {
  const [ankiety, setAnkiety] = useState<Ankieta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8902/api/surveys/ankiety/")
      .then((r) => r.json())
      .then((data) => { setAnkiety(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gray-100 text-black">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Aktywne ankiety</h1>
        {loading && <p>Ładowanie...</p>}
        {!loading && ankiety.length === 0 && <p>Brak aktywnych ankiet.</p>}
        <div className="flex flex-col gap-4">
          {ankiety.map((a) => (
            <Link key={a.id} href={`/ankiety/${a.id}`}>
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition cursor-pointer">
                <span className="text-xs uppercase text-blue-500 font-semibold">{a.kategoria}</span>
                <h2 className="text-xl font-bold mt-1">{a.tytul}</h2>
                <p className="text-gray-600 mt-1">{a.opis}</p>
                {a.data_zakonczenia && (
                  <p className="text-sm text-gray-400 mt-2">
                    Kończy się: {new Date(a.data_zakonczenia).toLocaleDateString("pl-PL")}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
