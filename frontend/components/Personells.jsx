import {Search, Plus} from 'lucide-react'
import { fetchWithAuth } from '../src/utils/fetchWithAuth';
import { useEffect, useState } from 'react';



const Personnels = (user) => {
  const [personSearched,setPersonSearched] = useState('')

  const [personnels, setPersonnels] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;


  
  //fetching all personnels
  useEffect(() => {
    const fetchPersonnels = async () => {
      const res = await fetchWithAuth(`${API_URL}/api/personnel/`,{
        method: "GET"
      }); 
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        setPersonnels(data);
      }
      
    };

    fetchPersonnels();
  }, []);

  //this will target the searchbar in personel page
  useEffect(() => {
    
  },[personSearched])

  return(
    <>
      <div className='flex gap-30  justify-center items-center '>
        <p className='text-3xl p-8 text-[#00064d]'>Personnels</p>

        <div className='bg-gray-300 rounded-2xl p-4 flex gap-4 w-lg'>
          <Search />
          <input type='text' placeholder='search by name' id='searchbar' value={personSearched} className='focus:outline-none' onChange={(e) => setPersonSearched(e.target.value)} 
          />
        </div>
        <div>
          <button  className={`flex gap-4 bg-[#00064d] text-white p-4 rounded-xl ${user.role === "Secretaire Generale" || user.role ==="Comptable"  ? "hover:cursor-pointer" : "hover:cursor-not-allowed"} transition-transform duration-300 ease-in-out hover:scale-105`}>
            <Plus/>
            Add New Personnel
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-10">
        {personnels.map(personnel => (
          <div 
            key={personnel.id}
            className={`bg-white rounded-lg shadow-md overflow-hidden `}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{personnel.name}</h3>
                <div className="text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-gray-500">ID</div>
                <div className="font-medium">#{personnel.id}</div>
                
                <div className="text-gray-500">Grade</div>
                <div className="font-medium">{personnel.profession}</div>
                
                <div className="text-gray-500">Wilaya</div>
                <div className="font-medium">{personnel.address || 'N/A'}</div>
                
                <div className="text-gray-500">Account</div>
                <div className="font-medium">
                  {personnel.is_ccp_account ? 'ccp' : ''} {personnel.account_number.substring(0, 6)}
                </div>
              </div>
            </div>
            
            <div className=" flex  px-4 py-3 bg-gray-50 ">

              <button 
                
                className={`bg-[#00064d] text-white px-6 py-2 rounded-lg text-base flex items-center justify-center mx-auto ${user.role === "Secretaire Generale" || user.role ==="Comptable"  ? "hover:cursor-pointer" : "hover:cursor-not-allowed"} transition-transform duration-300 ease-in-out hover:scale-105`}
              >
                View Details
              </button>

              <button 
                onClick={() => handleEdit(personnel.id)}
                className={`bg-[#870839] text-white px-6 py-2 rounded-lg text-sm flex items-center justify-center mx-auto ${user.role === "Secretaire Generale" || user.role ==="Comptable"  ? "hover:cursor-pointer" : "hover:cursor-not-allowed"} transition-transform duration-300 ease-in-out hover:scale-105`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>


    </>
  )
}

export default Personnels;