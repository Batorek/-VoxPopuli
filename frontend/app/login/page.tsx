"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const tokens = await login(username, password);
      localStorage.setItem("vox_access_token", tokens.access);
      if (tokens.refresh) {
        localStorage.setItem("vox_refresh_token", tokens.refresh);
      }
      router.push("/forum");
    } catch {
      setError("Nie mozna zalogowac uzytkownika.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Logowanie</h1>
        <input
          type="text"
          placeholder="Login"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 border rounded text-black"
        />
        <input
          type="password"
          placeholder="Haslo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded text-black"
        />
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <button className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700">
          Zaloguj
        </button>
      </form>
    </div>
  );
}
