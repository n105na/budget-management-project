import { useState } from "react";
import { useEffect } from "react"
import { fetchWithAuth } from "../src/utils/fetchWithAuth";




const Missions = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [mission,setMissions] = useState([])
  useEffect(() => {
   // Fetch all personnel
      const fetchMissions = async () => {
       //setLoading(true);
       try {
         const res = await fetchWithAuth(`${API_URL}/api/mission/`, {
           method: "GET"
         });
         if (res.ok) {
           const data = await res.json();
           console.log("missions : ",data);
           setMissions(data);
           //setError(null);
         } else {
           throw new Error('Failed to fetch missions');
         }
       } catch (err) {
         //setError("Failed to load missions data");
         console.error(err);
       } finally {
         //setLoading(false);
       }
     };
   
   fetchMissions();
  },[])
  return(
    <>
     <h1 className="text-red-500">jeuuuuuuu</h1>
    </>
  )
}

export default Missions