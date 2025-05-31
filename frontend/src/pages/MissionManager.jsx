import { Menu, Home, DollarSign, Medal,Settings, BarChart3, MapPin, Users, BadgeCheck, Search, Plus, LogOut, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import { fetchWithAuth } from '../utils/fetchWithAuth';
import Personnels from '../../components/Personells';
import { useNavigate } from 'react-router-dom';
import Missions from '../../components/Missions';
import Willaya from '../../components/Willaya';
import Grades from '../../components/Grades';
import Dashboard from '../../components/Dashboard';
import Settingss from '../../components/Settings';
import Reports from '../../components/Reports';


const MissionManager = () => {
  const [userTab,setUserTab] = useState(false)
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

  const handleLogout = async () => {
     
      try {
        const response = await fetchWithAuth(`${API_URL}/api/logout/`, {
          method: "POST",
          body: JSON.stringify({ refresh : refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          console.log("Logging out...");

          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          navigate(`/logout`)
          
        } else {
          throw new Error("Invalid credentials");
          
        }
        
      } catch (err) {
        console.error(err.message);
      }
  };
   useEffect(() => {
   console.log("user : ", user);
  },[user])
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
          onClick={() => setSelectedOption('Wilaya')}
          className={`flex items-center gap-8 text-lg hover:bg-[#870839] hover:text-white p-2 cursor-pointer rounded-[4px] ${selectedOption === "Wilaya" ? "bg-[#870839] text-white" : ""}`}>
            <MapPin className="w-6 h-6" />
            Wilaya
          </li>
          <li 
          onClick={() => setSelectedOption('Reports')}
          className={`flex items-center gap-8 text-lg hover:bg-[#870839] hover:text-white p-2 cursor-pointer rounded-[4px] ${selectedOption === "Reports" ? "bg-[#870839] text-white" : ""}`}>
            <BarChart3 className="w-6 h-6" />
            Reports
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
 
         {selectedOption  &&
          <div className='flex items-center justify-between  bg-white px-6 py-4 rounded-xl shadow-md mb-6 '>

            <p className='text-4xl font-extrabold text-[#00064d] mb-4 md:mb-0'>{selectedOption}</p>

            {/*selectedOption !== "Dashboard" ?
              <p className='text-4xl font-extrabold text-[#00064d] mb-4 md:mb-0'>{selectedOption}</p>
             :
             <p className='text-3xl  text-[#00064d]'>Welcome Back,<br/><span className='font-bold'>{user ? user.username : "sir"}</span></p>
            */}
 
            <div className='relative '>
              <div 
                onClick={() => setUserTab(!userTab)}
                className=' flex justify-center items-center rounded-full w-14 h-14 bg-[#00064d] hover:cursor-pointer'>
                <p className='font-bold text-2xl text-white'>{user.username?.charAt(0).toUpperCase()}</p>
              </div>
              
              {userTab && 
                <div className='absolute right-0 top-full mt-2 z-50 bg-[#00064d] shadow-xl p-6 rounded-lg w-64'>
                  <ul className='space-y-2'>
                    <li className="text-white font-semibold">{user.username}</li>
                    <li className="text-white font-semibold">{user.role}</li>
                    <li className="text-white font-semibold flex px-4 py-2 rounded-lg justify-center items-center gap-4 text-xl hover:cursor-pointer hover:bg-white hover:text-[#00064d]"
                    onClick={() => {navigate(`/profile/${user.user_id}`)} }
                    >
                      <User/>
                      Profile
                      </li>
                    <li 
                      onClick={handleLogout}
                      className="text-white font-semibold flex px-4 py-2 rounded-lg justify-center items-center gap-4 text-xl hover:cursor-pointer hover:bg-white hover:text-[#00064d]"
                    >
                      <LogOut />
                      Log Out
                    </li>
                  </ul>
                </div>
              }

            </div>
            

          </div>
         }
        {selectedOption === "Dashboard" && 
          <>
            <Dashboard userLoggedin = {user}/>
          </>
        }
        {selectedOption === "Missions" && 
         <Missions userLoggedin = {user} />
        }

        {selectedOption === "Personnels" && 
         <Personnels userLoggedin = {user} />
        }
        
        {selectedOption === "Grades" && 
         <Grades userLoggedin = {user} />
        }

        {selectedOption === "Reports" && 
         <Reports userLoggedin = {user} />
        }

        {selectedOption === "Wilaya" && 
         <Willaya userLoggedin = {user}/>
        }

        {selectedOption === "Settings" && 
         <Settingss userLoggedin = {user} />
        }

      </div>
    </div>
  );
};

export default MissionManager;
