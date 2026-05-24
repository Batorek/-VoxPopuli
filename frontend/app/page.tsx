"use client";

import { useState } from "react";

export default function Home() {
  const [imie, setImie] = useState("");
  const [email, setEmail] = useState("");
  const [temat, setTemat] = useState("");
  const [tresc, setTresc] = useState("");
  const [status, setStatus] = useState("");

  const wyslijWiadomosc = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Wysyłanie...");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/contact/submit/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imie: imie,
          email: email,
          temat: temat,
          tresc: tresc,
        }),
      });

      if (response.ok) {
        setStatus("Wiadomość wysłana pomyślnie!");
        setImie(""); setEmail(""); setTemat(""); setTresc("");
      } else {
        setStatus("Wystąpił błąd.");
      }
    } catch (error) {
      setStatus("Błąd połączenia z serwerem.");
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100 text-black flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Napisz do nas</h1>
        
        
        {status && (
          <p aria-live="polite" className="mb-4 text-center text-blue-600 font-semibold">
            {status}
          </p>
        )}
        
        <form onSubmit={wyslijWiadomosc} className="flex flex-col gap-4">
          
          <div>
            <label htmlFor="imie" className="block text-sm font-medium mb-1">Imię i nazwisko</label>
            <input id="imie" type="text" value={imie} onChange={(e) => setImie(e.target.value)} required className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Adres e-mail</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          
          <div>
            <label htmlFor="temat" className="block text-sm font-medium mb-1">Temat zgłoszenia</label>
            <input id="temat" type="text" value={temat} onChange={(e) => setTemat(e.target.value)} required className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          
          <div>
            <label htmlFor="tresc" className="block text-sm font-medium mb-1">Treść wiadomości</label>
            <textarea id="tresc" value={tresc} onChange={(e) => setTresc(e.target.value)} required className="w-full border border-gray-300 px-3 py-2 rounded h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          
          <button type="submit" className="mt-2 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
            Wyślij wiadomość
          </button>
        </form>
      </div>
    </main>
  );
}