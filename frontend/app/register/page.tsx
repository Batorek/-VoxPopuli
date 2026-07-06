"use client";

import React, { useState } from 'react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {

      
      const res = await fetch('http://149.156.194.192:8902/api/accounts/register/', {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username, 
          email: email, 
          password: password 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Konto utworzone! Teraz możesz się zalogować.");
        window.location.href = '/login';
      } else {
    
        alert(data.error || "Błąd podczas rejestracji");
      }
    } catch (error) {
      alert("Nie można połączyć się z backendem. Sprawdź czy działa na porcie 8902.");
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-black">Rejestracja</h1>
        <input 
          type="text" placeholder="Login" value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 border rounded text-black"
        />
        <input 
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded text-black"
        />
        <input 
          type="password" placeholder="Hasło" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded text-black"
        />
        <button className="w-full bg-green-600 text-white p-2 rounded font-bold hover:bg-green-700">
          Zarejestruj się
        </button>
      </form>
    </div>
  );
}