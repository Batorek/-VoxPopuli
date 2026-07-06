"use client";

import React, { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/accounts/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Zapisujemy token (jeśli backend go zwraca)
        localStorage.setItem('user', JSON.stringify(data));
        alert("Zalogowano pomyślnie!");
        window.location.href = '/dashboard'; 
      } else {
        alert(data.error || "Błąd logowania");
      }
    } catch (error) {
      alert("Nie można połączyć się z serwerem.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Logowanie</h1>
        <input 
          type="text" placeholder="Login" value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 border rounded text-black"
        />
        <input 
          type="password" placeholder="Hasło" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded text-black"
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700">
          Zaloguj
        </button>
      </form>
    </div>
  );
}