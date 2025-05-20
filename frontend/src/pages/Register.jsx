import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";







export default function Register() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Doyen");

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({  
          password,
          username,
          email,
          role
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      //navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
   console.log("role : ",role);
  },[role])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f8f9] " >
      
      <div className="p-16 rounded-2xl shadow-lg w-full max-w-xl bg-white ">

        <h1 className="text-3xl font-bold mb-6 text-center ">Register</h1>

        <form onSubmit={handleRegister} className="space-y-4">

          <ul className="flex bg-[#00064d] text-white rounded-full items-center justify-center font-semibold gap-2 border-2 border-[#00064d]">

            <li onClick={(e) => setRole("Doyen")}
              className={role === "Doyen" ? "bg-white text-[#00064d] hover:cursor-pointer p-2" : "hover:cursor-pointer p-2  "}
            >Doyen</li>

            <li onClick={(e) => setRole("Comptable")}
              className={role === "Comptable" ? "bg-white text-[#00064d] hover:cursor-pointer p-2" : "hover:cursor-pointer p-2"}
            >Comptable</li>

            <li  onClick={(e) => setRole("Secretaire Generale")}
              className={role === "Secretaire Generale" ? "bg-white text-[#00064d] hover:cursor-pointer p-2" : "hover:cursor-pointer p-2"}
            >Secretaire</li>

            <li  onClick={(e) => setRole("Commission")}
              className={role === "Commission" ? "bg-white text-[#00064d] hover:cursor-pointer p-2" : "hover:cursor-pointer p-2"}
            >Commission</li>

          </ul>

          {error && <p className="text-red-500 mb-3 text-center">{error}</p>}

          <div className="mb-4">
            <label htmlFor="email" className="block text-lg font-semibold mb-1">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 text-[#2b3d50] border-[#2b3d50] border-1"
              placeholder="exemple@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

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
            Register
          </button>

        </form>

      </div>
    </div>
  );
}
  