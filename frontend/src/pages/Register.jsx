import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import { fetchWithAuth } from "../utils/fetchWithAuth";







export default function Register() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const [success, setSuccess] = useState("");
  const [formData,setFormData] = useState({
    password : "",
    username : "",
    email : "",
    role : "Doyen"
  })

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetchWithAuth(`${API_URL}/api/register/`, {
        method: "POST",
        body: JSON.stringify({formData}),
      });

      if (response.ok) {
        setSuccess("User Registered Successfully!")
        setTimeout(() => {
          setSuccess(null)
        }, 2000);
        const data = await response.json();
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        navigate("/dashboard");
      }else {
       setError("Error Registering the user")      
      }

      
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
   console.log("form : ",formData);
  },[formData])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f8f9] " >
      
      <div className="p-16 rounded-2xl shadow-lg w-full max-w-xl bg-white ">

        <h1 className="text-3xl font-bold mb-6 text-center ">Register</h1>

        <form onSubmit={handleRegister} className="space-y-4">

          <ul className="flex  text-[#00064d] rounded-full items-center justify-center font-semibold gap-2 ">

            <li onClick={(e) => setFormData({...formData,role : "Doyen"})}
              className={formData.role === "Doyen" ? "text-white bg-[#00064d] rounded-full hover:cursor-pointer p-2" : "hover:cursor-pointer p-2  "}
            >Doyen</li>

            <li onClick={(e) => setFormData({...formData,role : "Comptable"})}
              className={formData.role === "Comptable" ? "text-white bg-[#00064d] rounded-full hover:cursor-pointer p-2" : "hover:cursor-pointer p-2"}
            >Comptable</li>

            <li  onClick={(e) => setFormData({...formData,role : "Secretaire"})}
              className={formData.role === "Secretaire Generale" ? "text-white bg-[#00064d] rounded-full hover:cursor-pointer p-2" : "hover:cursor-pointer p-2"}
            >Secretaire</li>

            <li  onClick={(e) => setFormData({...formData,role : "Commission"})}
              className={formData.role === "Commission" ? "text-white bg-[#00064d] rounded-full hover:cursor-pointer p-2" : "hover:cursor-pointer p-2"}
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
              value={formData.email}
              onChange={(e) => setFormData({...formData, email : e.target.value})}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="username" className="block text-lg font-semibold mb-1">User Name</label>
            <input
              type="username"
              id="username"
              className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 text-[#2b3d50] border-[#2b3d50] border-1"
              placeholder="username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username : e.target.value})}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-lg font-semibold mb-1">Password</label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 border-[#2b3d50] border-1 text-[#2b3d50]"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password : e.target.value})}
            />
          </div>

          <button type="submit" className="w-full py-2 rounded-md font-semibold transition bg-[#00064d] text-[#f6f8f9] hover:cursor-pointer" >
            Register
          </button>
          {success && <p className="text-green-600 mb-3 text-center">{success}</p>}

        </form>

      </div>
    </div>
  );
}
  