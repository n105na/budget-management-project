import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background)", color: "var(--text)" }}>
<div className="p-16 rounded-2xl shadow-lg w-full max-w-lg" style={{ backgroundColor: "white", color: "var(--text)" }}>
<h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
<form onSubmit={handleLogin} className="space-y-4">

          {error && <p className="text-red-500 mb-3 text-center">{error}</p>}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              type="username"
              id="username"
              className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2"
              placeholder="you@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ borderColor: "var(--text)", backgroundColor: "var(--background)", color: "var(--text)" }}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ borderColor: "var(--text)", backgroundColor: "var(--background)", color: "var(--text)" }}
            />
          </div>
          <button type="submit" className="w-full py-2 rounded-md font-semibold transition" style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}>
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
