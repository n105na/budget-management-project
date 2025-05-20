import { Menu, Home, DollarSign, Medal, BarChart3, Settings, MapPin, Users, BadgeCheck } from 'lucide-react';
import { useState } from 'react';

const MissionManager = () => {

  const [selectedOption,setSelectedOption] = useState('Dashboard')
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
          onClick={() => setSelectedOption('Personnel')}
          className={`flex items-center gap-8 text-lg hover:bg-[#870839] hover:text-white p-2 cursor-pointer rounded-[4px] ${selectedOption === "Personnel" ? "bg-[#870839] text-white" : ""}`}>
            <Users className="w-6 h-6" />
            Personnel
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

      <div className=" h-screen w-full">

        {selectedOption === "Dashboard" && 
         <h1 className='text-3xl text-center'>{selectedOption}</h1>
        }

        {selectedOption === "Missions" && 
         <h1 className='text-3xl text-center'>{selectedOption}</h1>
        }

        {selectedOption === "Personnel" && 
         <h1 className='text-3xl text-center'>{selectedOption}</h1>
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
