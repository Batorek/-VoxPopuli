"use client";

import { useState } from "react";
import { sendContactMessage } from "@/lib/api";

export default function KontaktPage() {
  const [imie, setImie] = useState("");
  const [email, setEmail] = useState("");
  const [temat, setTemat] = useState("");
  const [tresc, setTresc] = useState("");
  const [status, setStatus] = useState("");

  const wyslijWiadomosc = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Wysylanie...");

    try {
      await sendContactMessage({ imie, email, temat, tresc });
      setStatus("Wiadomosc wyslana pomyslnie.");
      setImie("");
      setEmail("");
      setTemat("");
      setTresc("");
    } catch {
      setStatus("Nie mozna wyslac wiadomosci.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">
      <div className="mx-auto max-w-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold">Kontakt z urzedem</h1>
        <p className="mt-2 text-sm text-slate-600">
          Formularz jest dostepny takze dla gosci bez rejestracji.
        </p>

        {status && (
          <p aria-live="polite" className="mt-5 border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-800">
            {status}
          </p>
        )}

        <form onSubmit={wyslijWiadomosc} className="mt-6 grid gap-4">
          <Field label="Imie i nazwisko" value={imie} onChange={setImie} />
          <Field label="Adres e-mail" value={email} onChange={setEmail} type="email" />
          <Field label="Temat zgloszenia" value={temat} onChange={setTemat} />
          <div>
            <label htmlFor="tresc" className="mb-1 block text-sm font-semibold">Tresc wiadomosci</label>
            <textarea
              id="tresc"
              value={tresc}
              onChange={(e) => setTresc(e.target.value)}
              required
              className="h-36 w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="rounded bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800">
            Wyslij wiadomosc
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
