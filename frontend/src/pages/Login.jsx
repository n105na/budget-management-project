import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

export default function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [sucess, setSucess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    if(!username || !password){
      setError("Please fill all the fields")
      return
    }
      setError("");
      setLoading(true);

      try {
        const response = await fetch(`${API_URL}/api/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          throw new Error("Invalid credentials");
        }

        const data = await response.json();
        setSucess("You Are Logged In Succefully")
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        setLoading(false);
        setInterval(() => {
          navigate("/missionManager");
        }, 2000);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f8f9] " >
      
      <div className="p-16 rounded-2xl shadow-lg w-full max-w-lg bg-white ">

        <h1 className="text-3xl font-bold mb-6 text-center ">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && <p className="text-red-500 mb-3 text-center">{error}</p>}
          {sucess && <p className="text-green-500 mb-3 text-center">{sucess}</p>}
          <div className="mb-4">
            <label htmlFor="username" className="block text-lg font-semibold mb-1">User Name</label>
            <input
              type="username"
              id="username"
              className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 text-[#2b3d50] border-[#2b3d50] border-1"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-lg font-semibold mb-1">Password</label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 border-[#2b3d50] border-1 text-[#2b3d50]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full py-2 rounded-md font-semibold transition bg-[#00064d] text-[#f6f8f9] hover:cursor-pointer" >
            {loading ? "Loading..." : "Log In"}
          </button>
        </form>

      </div>
    </div>
  );
  }
