"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";

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
    fetch(`${getApiUrl()}/surveys/ankiety/`)
      .then((response) => response.json())
      .then((data) => {
        setAnkiety(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">Aktywne ankiety</h1>
        {loading && <p>Ladowanie...</p>}
        {!loading && ankiety.length === 0 && <p>Brak aktywnych ankiet.</p>}
        <div className="flex flex-col gap-4">
          {ankiety.map((ankieta) => (
            <Link key={ankieta.id} href={`/ankiety/${ankieta.id}`}>
              <div className="cursor-pointer bg-white p-6 shadow transition hover:shadow-md">
                <span className="text-xs font-semibold uppercase text-blue-500">
                  {ankieta.kategoria}
                </span>
                <h2 className="mt-1 text-xl font-bold">{ankieta.tytul}</h2>
                <p className="mt-1 text-gray-600">{ankieta.opis}</p>
                {ankieta.data_zakonczenia && (
                  <p className="mt-2 text-sm text-gray-400">
                    Konczy sie: {new Date(ankieta.data_zakonczenia).toLocaleDateString("pl-PL")}
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
