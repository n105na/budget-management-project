import { Menu, Home, DollarSign, Medal, BarChart3, Settings, MapPin, Users, BadgeCheck, Search, Plus, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import { fetchWithAuth } from '../utils/fetchWithAuth';
import Personnels from '../../components/Personells';
import { useNavigate } from 'react-router-dom';

const MissionManager = () => {

  const navigate = useNavigate();
  const [selectedOption,setSelectedOption] = useState('Dashboard')
  const [user,setUser] = useState("")
  const accessToken = localStorage.getItem("access");
  const refreshToken = localStorage.getItem("refresh");
  const [missions, setMissions] = useState([]);

  const [personSearched,setPersonSearched] = useState('')

  const [personnels, setPersonnels] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;



  useEffect(() => {

    if (accessToken) {
      const loggedInUser = jwtDecode(accessToken);
      console.log("Decoded access token:", loggedInUser);
      setUser(loggedInUser)
      
    }

    console.log("accessToken",accessToken);
    console.log("refreshToken",refreshToken);

    /*const isExpired = loggedInUser.exp * 1000 < Date.now();
    if (isExpired) {
      console.log("Token expired!");
    }*/
  },[accessToken,refreshToken])

  //for disconnecting the user
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  //fetching all missions
  useEffect(() => {
    const fetchMissions = async () => {
      const res = await fetchWithAuth(`${API_URL}/api/mission/`,{
        method: "GET"
      }); 
      if (res.ok) {
        const data = await res.json();
        setMissions(data);
      }
      
    };

    fetchMissions();
  }, []);


  return (
    <div className="flex">
      
      <div className="bg-[#f6f8f9] w-[25%] h-screen text-[#2b3d50]">
        
        <div className="flex justify-between items-center font-semibold text-2xl py-8 px-4 cursor-pointer">
          <h1>Mission Manager</h1>
          <Menu className="w-6 h-6" />
        </div>
        <ul className="space-y-6 p-8 ">
          <li 
            onClick={() => setSelectedOption('Dashboard')}
            className={`flex items-center gap-8 text-lg hover:bg-[#870839] hover:text-white p-2 cursor-pointer rounded-[4px] ${selectedOption === "Dashboard" ? "bg-[#870839] text-white" : ""}`}>
            <Home className="w-6 h-6" />
            Dashboard
          </li>
          <li 
          onClick={() => setSelectedOption('Missions')}
          className={`flex items-center gap-8 text-lg hover:bg-[#870839] hover:text-white p-2 cursor-pointer rounded-[4px] ${selectedOption === "Missions" ? "bg-[#870839] text-white" : ""}`}>
            <Medal className="w-6 h-6" />
            Missions
          </li>
          <li 
          onClick={() => setSelectedOption('Personnels')}
          className={`flex items-center gap-8 text-lg hover:bg-[#870839] hover:text-white p-2 cursor-pointer rounded-[4px] ${selectedOption === "Personnels" ? "bg-[#870839] text-white" : ""}`}>
            <Users className="w-6 h-6" />
            Personnels
          </li>
          <li 
          onClick={() => setSelectedOption('Grades')}
          className={`flex items-center gap-8 text-lg hover:bg-[#870839] hover:text-white p-2 cursor-pointer rounded-[4px] ${selectedOption === "Grades" ? "bg-[#870839] text-white" : ""}`}>
            <BadgeCheck className="w-6 h-6" />
            Grades
          </li>
          <li 
          onClick={() => setSelectedOption('Grade Payments')}
          className={`flex items-center gap-8 text-lg hover:bg-[#870839] hover:text-white p-2 cursor-pointer rounded-[4px] ${selectedOption === "Grade Payments" ? "bg-[#870839] text-white" : ""}`}>
            <DollarSign className="w-6 h-6" />
            Grade Payments
          </li>
          <li 
          onClick={() => setSelectedOption('Reports')}
          className={`flex items-center gap-8 text-lg hover:bg-[#870839] hover:text-white p-2 cursor-pointer rounded-[4px] ${selectedOption === "Reports" ? "bg-[#870839] text-white" : ""}`}>
            <BarChart3 className="w-6 h-6" />
            Reports
          </li>
          <li 
          onClick={() => setSelectedOption('Wilaya')}
          className={`flex items-center gap-8 text-lg hover:bg-[#870839] hover:text-white p-2 cursor-pointer rounded-[4px] ${selectedOption === "Wilaya" ? "bg-[#870839] text-white" : ""}`}>
            <MapPin className="w-6 h-6" />
            Wilaya
          </li>
          <li
          onClick={() => setSelectedOption('Settings')}
          className={`flex items-center gap-8 text-lg hover:bg-[#870839] hover:text-white p-2 cursor-pointer rounded-[4px] ${selectedOption === "Settings" ? "bg-[#870839] text-white" : ""}`}>
            <Settings className="w-6 h-6" />
            Settings
          </li>
        </ul>
        
      </div>

      <div className="h-screen w-full">

        {selectedOption === "Dashboard" && 
        <>
        <div className='flex justify-between items-center pr-5'>
          <h1 className='text-3xl p-8 text-[#00064d]'>Welcome Back,<br/><span className='font-bold'>{user ? user.username : "sir"}</span></h1>
          <button 
          onClick={handleLogout}
            className="bg-red-500 text-white font-semibold flex px-4 py-2 rounded-lg justify-center items-center gap-4 text-xl hover:cursor-pointer transition-transform ease-in-out hover:scale-105"
          >
            <LogOut  color='white'/>
            Disconnect
          </button>
        </div>
         

         
          
         
        </>
        }

        {selectedOption === "Missions" && 
         <h1 className='text-3xl text-center'>{selectedOption}</h1>
        }

        {selectedOption === "Personnels" && 
         <Personnels userLoggedin = {user} />
        }

        {selectedOption === "Grades" && 
         <h1 className='text-3xl text-center'>{selectedOption}</h1>
        }
        {selectedOption === "Grade Payments" && 
         <h1 className='text-3xl text-center'>{selectedOption}</h1>
        }

        {selectedOption === "Reports" && 
         <h1 className='text-3xl text-center'>{selectedOption}</h1>
        }

        {selectedOption === "Wilaya" && 
         <h1 className='text-3xl text-center'>{selectedOption}</h1>
        }

        {selectedOption === "Settings" && 
         <h1 className='text-3xl text-center'>{selectedOption}</h1>
        }

      </div>
    </div>
  );
};

export default MissionManager;
