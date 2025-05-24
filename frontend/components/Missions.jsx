import {Search, Plus, Edit, MapPin, X, Calendar, Clock, DollarSign, PlusIcon} from 'lucide-react'
import { fetchWithAuth } from '../src/utils/fetchWithAuth';
import { useEffect, useState, useMemo } from 'react';

const Missions = (user) => {

  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wilayas, setWilayas] = useState([]);
  const [personnels, setPersonnels] = useState([]);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const [activeTab, setActiveTab] = useState("list");
  const [selectedMission, setSelectedMission] = useState(null);
  const [formData, setFormData] = useState({
    destination_name: "",
    nights_stayed: "",
    meals_covered: "",
    date_arrival: "",
    date_departure: "",
    transport_type: "",
    time_departure: "",
    time_arrival: "",
    funding_type: "",
    mission_nature: "",
    //year: new Date().getFullYear(),
    destination_wilaya: "",
    personnel_detail: "",
    //transport_payment: "",
   // meal_payment: "",
   // lodging_payment: "",
  //  total_payment: ""
  });

  // Check if user has permission to modify missions
  const hasPermission = user.userLoggedin.role === "Secretaire Generale" || user.userLoggedin.role === "Comptable";

  // Get all wilayas
  useEffect(() => {
    const fetchWilayas = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${API_URL}/api/wilaya/`, {
          method: "GET"
        });
        if (res.ok) {
          const data = await res.json();
          setWilayas(data);
          setError(null);
        } else {
          throw new Error('Failed to fetch wilayas');
        }
      } catch (err) {
        setError("Failed to fetch wilayas");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWilayas()
  }, [])

  // Get all personnels
  useEffect(() => {
    const fetchPersonnels = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${API_URL}/api/personnel/`, {
          method: "GET"
        });
        if (res.ok) {
          const data = await res.json();
          setPersonnels(data);
          setError(null);
        } else {
          throw new Error('Failed to fetch personnel');
        }
      } catch (err) {
        setError("Failed to fetch personnel");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPersonnels()
  }, [])

  // Fetch all missions
  const fetchMissions = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/mission-personnel/`, {
        method: "GET"
      });
      if (res.ok) {
        const data = await res.json();
        setMissions(data);
        setError(null);
      } else {
        throw new Error('Failed to fetch missions');
      }
    } catch (err) {
      setError("Failed to load missions data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addMission = async () => {
    if (!hasPermission) return;

    try {
      const res = await fetchWithAuth(`${API_URL}/api/mission-personnel/`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess("Mission added successfully");
        setError(null);
        await fetchMissions();
        resetForm();
        setTimeout(() => {
          setSuccess(null);
          setActiveTab("list");
        }, 2000);
      } else {
        throw new Error('Failed to add mission');
      }
    } catch (err) {
      setError("Failed to add mission");
      console.error(err);
    }
  };

  function transformForPut(data) {
    return {
      destination_name: data.mission_detail?.destination_name || "",
      nights_stayed: data.mission_detail?.nights_stayed || "",
      meals_covered: data.mission_detail?.meals_covered || "",
      date_arrival: data.mission_detail?.date_arrival || "",
      date_departure: data.mission_detail?.date_departure || "",
      transport_type: data.mission_detail?.transport_type || "",
      time_departure: data.mission_detail?.time_departure || "",
      time_arrival: data.mission_detail?.time_arrival || "",
      funding_type: data.mission_detail?.funding_type || "",
      mission_nature: data.mission_detail?.mission_nature || "",
      year: data.mission_detail?.year || new Date().getFullYear(),
      destination_wilaya: data.mission_detail?.destination_wilaya || "",
      personnel_detail: data.personnel_detail?.id || "",
      transport_payment: data.transport_payment || "",
      meal_payment: data.meal_payment || "",
      lodging_payment: data.lodging_payment || "",
      total_payment: data.total_payment || ""
    };
  }

  const updateMission = async () => {
    if (!hasPermission || !selectedMission) return;

    try {
      const res = await fetchWithAuth(`${API_URL}/api/mission-personnel/${selectedMission.id}/`, {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess("Mission updated successfully");
        setError(null);
        await fetchMissions();
        setTimeout(() => {
          setSuccess(null);
          resetForm();
          setActiveTab("list");
          setSelectedMission(null);
        }, 2000);
      } else {
        throw new Error('Failed to update mission');
      }
    } catch (err) {
      setError("Failed to update mission");
      console.error(err);
    }
  };

  const deleteMission = async (id) => {
    if (!hasPermission) return;
    if (!confirm('Are you sure you want to delete this mission?')) return;

    try {
      const res = await fetchWithAuth(`${API_URL}/api/mission-personnel/${id}/`, {
        method: "DELETE"
      });

      if (res.ok) {
        setSuccess("Mission deleted successfully");
        setError(null);
        await fetchMissions();
        setTimeout(() => {
          setSuccess(null);
        }, 2000);
      } else {
        throw new Error('Failed to delete mission');
      }
    } catch (err) {
      setError("Failed to delete mission");
      console.error(err);
    }
  };

  // Handle edit button click
  const handleEdit = (missionId) => {
    if (!hasPermission) return;
    
    const mission = missions.find(m => m.id === missionId);
    const newMission = transformForPut(mission);
    if (mission) {
      setSelectedMission(mission);
      setFormData({...newMission});
      setActiveTab("edit");
    }
  };

  // Handle view details button click
  const handleViewDetails = (missionId) => {
    const mission = missions.find(m => m.id === missionId);
    if (mission) {
      setSelectedMission(mission);
      setActiveTab("view");
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      destination_name: "",
      nights_stayed: "",
      meals_covered: "",
      date_arrival: "",
      date_departure: "",
      transport_type: "",
      time_departure: "",
      time_arrival: "",
      funding_type: "",
      mission_nature: "",
      //year: new Date().getFullYear(),
      destination_wilaya: "",
      personnel_detail: "",
     // transport_payment: "",
     // meal_payment: "",
     // lodging_payment: "",
     // total_payment: ""
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "destination_wilaya.destination_name") {
        const [code, wilayaName] = value.split('-');
        setFormData(prevFormData => ({
            ...prevFormData,
            destination_wilaya: code,
            destination_name: wilayaName   
        }));
    } else {
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    }
};

  // Initial data fetch
  useEffect(() => {
    fetchMissions();
  }, []);

  
 
  return (
    <>
      

      {/* Add New Mission Button */}
      <div className='flex items-center justify-end mr-10'>
        <button
          onClick={() => {
            if (hasPermission) {
              setActiveTab("add");
              resetForm();
            }
          }}
          className={`mt-4 md:mt-0 flex items-center gap-3 bg-[#00064d] text-white px-6 py-3 rounded-full font-semibold shadow-lg
                      ${hasPermission ? "hover:bg-[#000a6b] cursor-pointer" : "opacity-60 cursor-not-allowed"}
                      transition-transform duration-300 ease-in-out hover:scale-105`}
        >
          <Plus className='w-5 h-5' />
          Add New Mission
        </button>
      </div>
      
      

      {/* Error message */}
      {error && (
        <div className="mx-10 mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mx-10 mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
          <p>{success}</p>
        </div>
      )}

      {/* Main content area - switches between list, view, add, edit */}
      {loading && activeTab === "list" ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00064d]"></div>
        </div>
      ) : (
        <>
          {/* List view */}
          {activeTab === "list" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-10">
              {missions.map(mission => (
                <div 
                  key={mission.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">{mission.personnel_detail?.name}</h3>
                      <div className="text-gray-600">
                        <MapPin className="w-5 h-5" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-gray-500">ID</div>
                      <div className="font-medium">#{mission.id}</div>
                      
                      <div className="text-gray-500">Destination</div>
                      <div className="font-medium">{mission.mission_detail?.destination_name || 'N/A'}</div>
                      
                      <div className="text-gray-500">Mission</div>
                      <div className="font-medium">{mission.mission_detail?.mission_nature || 'N/A'}</div>
                      
                      <div className="text-gray-500">Year</div>
                      <div className="font-medium">{mission.mission_detail?.year || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="flex px-4 py-3 bg-gray-50">
                    <button 
                      onClick={() => handleViewDetails(mission.id)}
                      className="bg-[#00064d] text-white px-6 py-2 rounded-lg text-base flex items-center justify-center mx-auto transition-transform duration-300 ease-in-out hover:scale-105 hover:cursor-pointer"
                    >
                      View Details
                    </button>

                    <button 
                      onClick={() => handleEdit(mission.id)}
                      className={`bg-[#870839] text-white px-6 py-2 rounded-lg text-sm flex items-center justify-center mx-auto ${hasPermission ? "hover:cursor-pointer" : "hover:cursor-not-allowed"} transition-transform duration-300 ease-in-out hover:scale-105`}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View details tab */}
          {activeTab === "view" && selectedMission && (
            <div className="mx-auto max-w-4xl p-6 bg-white rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#00064d]">Mission Details</h2>
                <button 
                  onClick={() => setActiveTab("list")}
                  className="text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Mission Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 block">Personnel</span>
                      <span className="font-medium">{selectedMission.personnel_detail?.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Destination</span>
                      <span className="font-medium">{selectedMission.mission_detail?.destination_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Mission Nature</span>
                      <span className="font-medium">{selectedMission.mission_detail?.mission_nature}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Year</span>
                      <span className="font-medium">{selectedMission.mission_detail?.year}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Transport Type</span>
                      <span className="font-medium">{selectedMission.mission_detail?.transport_type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Funding Type</span>
                      <span className="font-medium">{selectedMission.mission_detail?.funding_type}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Travel Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 block">Arrival Date</span>
                      <span className="font-medium">{selectedMission.mission_detail?.date_arrival}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Departure Date</span>
                      <span className="font-medium">{selectedMission.mission_detail?.date_departure}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Departure Time</span>
                      <span className="font-medium">{selectedMission.mission_detail?.time_departure}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Arrival Time</span>
                      <span className="font-medium">{selectedMission.mission_detail?.time_arrival}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Nights Stayed</span>
                      <span className="font-medium">{selectedMission.mission_detail?.nights_stayed}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Meals Covered</span>
                      <span className="font-medium">{selectedMission.mission_detail?.meals_covered}</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Personnels Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-500 block">Personel Name</span>
                      <span className="font-medium">{selectedMission.personnel_detail.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Profession</span>
                      <span className="font-medium">{selectedMission.personnel_detail.profession}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">grade</span>
                      <span className="font-medium">{selectedMission.personnel_detail.grade.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">address</span>
                      <span >{selectedMission.personnel_detail.address}</span>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Payment Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-500 block">Transport Payment</span>
                      <span className="font-medium">{selectedMission.transport_payment} DA</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Meal Payment</span>
                      <span className="font-medium">{selectedMission.meal_payment} DA</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Lodging Payment</span>
                      <span className="font-medium">{selectedMission.lodging_payment} DA</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Total Payment</span>
                      <span className="font-bold text-[#00064d]">{selectedMission.total_payment} DA</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button 
                  onClick={() => setActiveTab("list")}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:cursor-pointer"
                >
                  Back to List
                </button>
                
                {hasPermission && (
                  <>
                    <button 
                      onClick={() => handleEdit(selectedMission.id)}
                      className="px-4 py-2 bg-[#870839] text-white rounded-lg flex items-center hover:cursor-pointer"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    
                    <button 
                      onClick={() => {
                        deleteMission(selectedMission.id);
                        setActiveTab("list");
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:cursor-pointer"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Add new mission tab */}
          {activeTab === "add" && (
            <div className="mx-auto max-w-4xl p-6 bg-white rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#00064d]">Add New Mission</h2>
                <button 
                  onClick={() => setActiveTab("list")}
                  className="text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Personnel</label>
                    <select
                      name="personnel_detail"
                      value={formData.personnel_detail}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="">Select Personnel</option>
                      {personnels && personnels.map((personnel, key) => (
                        <option key={key} value={personnel.id}>{personnel.name}-{personnel.profession}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/*<div>
                    <label className="block text-gray-700 mb-1">Destination Name</label>
                    <input
                      type="text"
                      name="destination_name"
                      value={formData.destination_name}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>*/}
                  
                  <div>
                    <label className="block text-gray-700 mb-1">Destination Wilaya</label>
                    <select
                      name="destination_wilaya.destination_name"
                      value={`${formData.destination_wilaya}-${formData.destination_name}`}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="">Select Wilaya</option>
                      {wilayas && wilayas.map((wilaya, key) => (
                        <option key={key} value={`${wilaya.code}-${wilaya.name}`}>{wilaya.code}-{wilaya.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Mission Nature</label>
                    <input
                      type="text"
                      name="mission_nature"
                      value={formData.mission_nature}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Transport Type</label>
                    <select
                      name="transport_type"
                      value={formData.transport_type}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="">Select Transport</option>
                      <option value="Taxi">Taxi</option>
                      <option value="Bus">Bus</option>
                      <option value="Train">Train</option>
                      <option value="Plane">Plane</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Funding Type</label>
                    <input
                      type="text"
                      name="funding_type"
                      value={formData.funding_type}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                 

                  <div>
                    <label className="block text-gray-700 mb-1">Arrival Date</label>
                    <input
                      type="date"
                      name="date_arrival"
                      value={formData.date_arrival}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Departure Date</label>
                    <input
                      type="date"
                      name="date_departure"
                      value={formData.date_departure}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Departure Time</label>
                    <input
                      type="time"
                      name="time_departure"
                      value={formData.time_departure}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Arrival Time</label>
                    <input
                      type="time"
                      name="time_arrival"
                      value={formData.time_arrival}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Nights Stayed</label>
                    <input
                      type="number"
                      name="nights_stayed"
                      value={formData.nights_stayed}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                </div>

                <div className='space-y-4'>
                  <label className="block text-gray-700 mb-1">Meals Covered</label>
                  <input
                    type="text"
                    name="meals_covered"
                    value={formData.meals_covered}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              </div> 
              <div className="mt-8 flex justify-end gap-4">
                <button 
                  onClick={() => {
                    setActiveTab("list");
                    setSelectedMission(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:cursor-pointer"
                >
                  Cancel
                </button>
                {hasPermission && (
                  <button 
                    onClick={addMission}
                    className="px-4 py-2 bg-[#00064d] text-white rounded-lg flex items-center hover:cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Mission
                  </button>
                )}
              </div>
            </div>  
          )} 
          {activeTab === "edit" && selectedMission && (
            <div className="mx-auto max-w-4xl p-6 bg-white rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#00064d]">Edit Mission</h2>
                <button 
                  onClick={() => {
                    setActiveTab("list");
                    setSelectedMission(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Personnel</label>
                    <select
                      name="personnel_detail"
                      value={formData.personnel_detail}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                      disabled={!hasPermission}
                    >
                      <option value="">Select Personnel</option>
                      {personnels && personnels.map((personnel, key) => (
                        <option key={key} value={personnel.id}>{personnel.name}-{personnel.profession}</option>
                      ))}
                    </select>
                  </div>
                  
                 {/* <div>
                    <label className="block text-gray-700 mb-1">Destination Name</label>
                    <input
                      type="text"
                      name="destination_name"
                      value={formData.destination_name}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                      disabled={!hasPermission}
                    />
                  </div>*/}
                  
                  <div>
                    <label className="block text-gray-700 mb-1">Destination Wilaya</label>
                    <select
                      name="destination_wilaya.destination_name"
                      value={`${formData.destination_wilaya}-${formData.destination_name}`}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                      disabled={!hasPermission}
                    >
                      <option value="">Select Wilaya</option>
                      {wilayas && wilayas.map((wilaya, key) => (
                        <option key={key} value={`${wilaya.code}-${wilaya.name}`}>{wilaya.code}-{wilaya.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Mission Nature</label>
                    <input
                      type="text"
                      name="mission_nature"
                      value={formData.mission_nature}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                      disabled={!hasPermission}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Transport Type</label>
                    <select
                      name="transport_type"
                      value={formData.transport_type}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                      disabled={!hasPermission}
                    >
                      <option value="">Select Transport</option>
                      <option value="Taxi">Taxi</option>
                      <option value="Bus">Bus</option>
                      <option value="Train">Train</option>
                      <option value="Plane">Plane</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Funding Type</label>
                    <input
                      type="text"
                      name="funding_type"
                      value={formData.funding_type}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                      disabled={!hasPermission}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Arrival Date</label>
                    <input
                      type="date"
                      name="date_arrival"
                      value={formData.date_arrival}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                      disabled={!hasPermission}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Departure Date</label>
                    <input
                      type="date"
                      name="date_departure"
                      value={formData.date_departure}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                      disabled={!hasPermission}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Departure Time</label>
                    <input
                      type="time"
                      name="time_departure"
                      value={formData.time_departure}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                      disabled={!hasPermission}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Arrival Time</label>
                    <input
                      type="time"
                      name="time_arrival"
                      value={formData.time_arrival}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                      disabled={!hasPermission}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Nights Stayed</label>
                    <input
                      type="number"
                      name="nights_stayed"
                      value={formData.nights_stayed}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                      disabled={!hasPermission}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Meals Covered</label>
                    <input
                      type="text"
                      name="meals_covered"
                      value={formData.meals_covered}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                      disabled={!hasPermission}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Payment Information</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1">Transport Payment</label>
                      <input
                        type="number"
                        name="transport_payment"
                        value={formData.transport_payment}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-2"
                        disabled={!hasPermission}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Meal Payment</label>
                      <input
                        type="number"
                        name="meal_payment"
                        value={formData.meal_payment}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-2"
                        disabled={!hasPermission}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Lodging Payment</label>
                      <input
                        type="number"
                        name="lodging_payment"
                        value={formData.lodging_payment}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-2"
                        disabled={!hasPermission}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Total Payment</label>
                      <input
                        type="number"
                        name="total_payment"
                        value={formData.total_payment}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-2"
                        disabled={!hasPermission}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button 
                  onClick={() => {
                    setActiveTab("list");
                    setSelectedMission(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:cursor-pointer"
                >
                  Cancel
                </button>
                {hasPermission && (
                  <button 
                    onClick={updateMission}
                    className="px-4 py-2 bg-[#00064d] text-white rounded-lg flex items-center hover:cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Update Mission
                  </button>
                )}
              </div>
            </div>
          )}
        </>  
      )} 
    </>
  )
}
export default Missions        