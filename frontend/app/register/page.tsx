"use client";

import React, { useState } from "react";
import { ApiRequestError, register } from "@/lib/api";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [imie, setImie] = useState("");
  const [nazwisko, setNazwisko] = useState("");
  const [pesel, setPesel] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const result = await register(username, email, password, { imie, nazwisko, pesel });
      setMessage(result.message);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setMessage(error.message);
        return;
      }
      setMessage("Nie mozna utworzyc konta.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <form onSubmit={handleRegister} className="w-full max-w-md bg-white p-8 shadow">
        <h1 className="mb-4 text-2xl font-bold text-black">Rejestracja</h1>
        <p className="mb-5 text-sm leading-6 text-gray-600">
          Konto mieszkanca mozna utworzyc tylko dla osoby z fikcyjnej bazy PESEL.
          Testowe dane: Jan Kowalski 95010112345 albo Anna Nowak 92031554321.
        </p>
        <input
          type="text"
          placeholder="Login"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4 w-full rounded border p-2 text-black"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded border p-2 text-black"
          required
        />
        <input
          type="password"
          placeholder="Haslo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded border p-2 text-black"
          required
        />
        <input
          type="text"
          placeholder="Imie"
          value={imie}
          onChange={(e) => setImie(e.target.value)}
          className="mb-4 w-full rounded border p-2 text-black"
          required
        />
        <input
          type="text"
          placeholder="Nazwisko"
          value={nazwisko}
          onChange={(e) => setNazwisko(e.target.value)}
          className="mb-4 w-full rounded border p-2 text-black"
          required
        />
        <input
          type="text"
          placeholder="PESEL do weryfikacji mieszkanca"
          value={pesel}
          onChange={(e) => setPesel(e.target.value.replace(/\D/g, "").slice(0, 11))}
          className="mb-4 w-full rounded border p-2 text-black"
          inputMode="numeric"
          minLength={11}
          maxLength={11}
          required
        />
        {message && <p className="mb-4 text-sm font-semibold text-blue-700">{message}</p>}
        <button className="w-full rounded bg-green-600 p-2 font-bold text-white">
          Zarejestruj sie
        </button>
      </form>
    </div>
  );
}
