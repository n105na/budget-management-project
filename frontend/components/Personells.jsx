import {Search, Plus, Edit, UserCircle, X} from 'lucide-react'
import { fetchWithAuth } from '../src/utils/fetchWithAuth';
import { useEffect, useState ,useMemo } from 'react';

const Personnels = (user) => {

  const [personSearched, setPersonSearched] = useState('')

  const [grades,setGrades] = useState('')

  const [personnels, setPersonnels] = useState([]);

  const [loading, setLoading] = useState(true);

  const [wilayas, setWilayas] = useState([]);

  const [filters, setFilters] = useState({
    name: '',
    profession: '',
    grade: ''
  });

  const [error, setError] = useState(null);
  const [sucess, setSucess] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const [activeTab, setActiveTab] = useState("list");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    grade_id: "",
    account_number: "",
    is_ccp_account: true,
    address: "",
    wilaya_id: ""
  });

  // Check if user has permission to modify personnel
  const hasPermission = user.userLoggedin.role === "Secretaire Generale" || user.userLoggedin.role === "Comptable";

  //get all grades
  useEffect(() => {
    const fetchGrades = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${API_URL}/api/grades/`, {
          method: "GET"
        });
        if (res.ok) {
          const data = await res.json();
          setGrades(data);
          //console.log("grades : ",data);
          setError(null);
        } else {
          throw new Error('Failed to fetch grades');
        }
      } catch (err) {
        setError("Failed to fetch grades");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades()
  },[])
  

  //get all wilayas
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
          //console.log("wilaya : ",data);
          setError(null);
        } else {
          throw new Error('Failed to fetch grades');
        }
      } catch (err) {
        setError("Failed to fetch grades");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWilayas()
  },[])

  // Fetch all personnel
  const fetchPersonnels = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/personnel/`, {
        method: "GET"
      });
      if (res.ok) {
        const data = await res.json();
        //console.log("personnels : ",data);
        setPersonnels(data);
        setError(null);
      } else {
        throw new Error('Failed to fetch personnel');
      }
    } catch (err) {
      setError("Failed to load personnel data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const addPersonnel = async () => {
    if (!hasPermission) return;

    try {
      const res = await fetchWithAuth(`${API_URL}/api/personnel/`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSucess("Personnel added successfully");
        setError(null);

        await fetchPersonnels();
        resetForm();
        setTimeout(() => {
          setSucess(null);
          setActiveTab("list");
        }, 2000);

      } else {
        throw new Error('Failed to add personnel');
      }

    } catch (err) {
      setError("Failed to add personnel");
      console.error(err);
    }
  };


  function transformForPut(data) {
      return {
        name: data.name || "",
        profession: data.profession || null,
        grade_id: data.grade?.id || null,
        account_number: data.account_number || "",
        is_ccp_account: data.is_ccp_account ?? false,
        address: data.address || "",
        wilaya_id: data.wilaya?.id || null,
    };
  }

  const updatePersonnel = async () => {
  if (!hasPermission || !selectedPerson) return;

  try {
    const res = await fetchWithAuth(`${API_URL}/api/personnel/${selectedPerson.id}/`, {
      method: "PATCH",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setSucess("Personnel updated successfully");
      setError(null);
      await fetchPersonnels();
      setTimeout(() => {
        setSucess(null);
        resetForm();
        setActiveTab("list");
        setSelectedPerson(null);
      }, 2000);

    } else {
      throw new Error('Failed to update personnel');
    }

  } catch (err) {
    setError("Failed to update personnel");
    console.error(err);
  }
};


  const deletePersonnel = async (id) => {
  if (!hasPermission) return;
  if (!confirm('Are you sure you want to delete this personnel?')) return;

  try {
    const res = await fetchWithAuth(`${API_URL}/api/personnel/${id}/`, {
      method: "DELETE"
    });

    if (res.ok) {
      setSucess("Personnel deleted successfully");
      setError(null);
      await fetchPersonnels();

      setTimeout(() => {
        setSucess(null);
      }, 2000);

    } else {
      throw new Error('Failed to delete personnel');
    }

  } catch (err) {
    setError("Failed to delete personnel");
    console.error(err);
  }
};


  // Handle edit button click
  const handleEdit = (personnelId) => {
    if (!hasPermission) return;
    
    const person = personnels.find(p => p.id === personnelId);
    const newPerson = transformForPut(person);
    if (person) {
      setSelectedPerson(person);
      setFormData({...newPerson});
      setActiveTab("edit");
    }
  };

  // Handle view details button click
  const handleViewDetails = (personnelId) => {
    const person = personnels.find(p => p.id === personnelId);
    if (person) {
      setSelectedPerson(person);
      setActiveTab("view");
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: "",
      profession: "",
      grade_id: "",
      account_number: "",
      is_ccp_account: true,
      address: "",
      wilaya_id:""
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchPersonnels();
  }, []);

  /* Filter personnel based on search
  const filteredPersonnel = personnels.filter(person => 
    person.name.toLowerCase().includes(personSearched.toLowerCase())
  );*/
//for filtratoin


  // Get unique values for filter dropdowns
  const uniqueProfessions = useMemo(() => {
    return [...new Set(personnels.map(person => person.profession))];
  }, [personnels]);

  const uniqueGrades = useMemo(() => {
    return [...new Set(personnels.map(person => person.grade.name))];
  }, [personnels]);

  // Filter personnel based on current filters
  const filteredPersonnel = useMemo(() => {
    return personnels.filter(person => {
      const nameMatch = person.name.toLowerCase().includes(filters.name.toLowerCase());
      const professionMatch = filters.profession === '' || person.profession === filters.profession;
      const gradeMatch = filters.grade === '' || `${person.grade?.profession}-${person.grade?.name}` === filters.grade;
      
      return nameMatch && professionMatch && gradeMatch;
    });
  }, [personnels, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      profession: '',
      grade: ''
    });
  };
  return(
    <>
      
    <div className='flex items-center justify-center gap-4 p-4 bg-white rounded-xl shadow-md mb-6'>
      

      <div className='flex  items-center gap-4'>
        {/* Search Bar */}
        <div className='relative flex items-center bg-gray-100 rounded-full px-4 py-2 w-full md:w-auto shadow-sm'>
          <Search className='w-5 h-5 text-gray-500 mr-2' />
          <input
            type='text'
            placeholder='Search by name...'
            id='searchbar'
            value={filters.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
            className='flex-grow bg-transparent focus:outline-none text-gray-700 placeholder-gray-500'
          />
        </div>

        {/* Profession Filter */}
        <select
          name="profession"
          value={filters.profession}
          onChange={(e) => handleFilterChange('profession', e.target.value)}
          className="bg-gray-100 rounded-full px-4 py-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00064d] transition-all duration-200 w-full md:w-auto"
        >
          <option value="">All Professions</option>
          <option value="Teacher">Teacher</option>
          <option value="Worker">Worker</option>
          <option value="Driver">Driver</option>
        </select>

        {/* Grade Filter */}
        <select
          name="grade"
          value={filters.grade}
          onChange={(e) => handleFilterChange('grade', e.target.value)}
          className="bg-gray-100 rounded-full px-4 py-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00064d] transition-all duration-200 w-full md:w-auto"
        >
          <option value="">All Grades</option>
          {grades && grades.map((grade, key) => (
            <option key={key} value={`${grade.profession}-${grade.name}`}>{grade.profession}-{grade.name}</option>
          ))}
        </select>

        {/* Clear Filters Button */}
        <button
          onClick={clearFilters}
          className="bg-red-500 text-white rounded-full px-5 py-2 font-semibold shadow-md
                    hover:bg-red-600 hover:cursor-pointer transition-all duration-300 transform hover:scale-105
                    focus:outline-none focus:ring-2 focus:ring-red-500 w-full md:w-auto"
        >
          Clear Filters
        </button>
      </div>

      {/* Add New Personnel Button */}
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
        Add New Personnel
      </button>
    </div>

      {/* Error message */}
      {error && (
        <div className="mx-10 mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      )}

      {/* sucess message */}
      {sucess && (
        <div className="mx-10 mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
          <p>{sucess}</p>
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
              {filteredPersonnel.map(personnel => (
                <div 
                  key={personnel.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">{personnel.name}</h3>
                      <div className="text-gray-600">
                        <UserCircle className="w-5 h-5" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-gray-500">ID</div>
                      <div className="font-medium">#{personnel.id}</div>
                      
                      <div className="text-gray-500">Grade</div>
                      <div className="font-medium">{personnel.grade.profession}-{personnel.grade.name}</div>
                      
                      <div className="text-gray-500">Wilaya</div>
                      <div className="font-medium">{personnel.wilaya?.name || personnel.address || 'N/A'}</div>
                      
                      <div className="text-gray-500">Account</div>
                      <div className="font-medium">
                        {personnel.is_ccp_account ? 'ccp' : ''} {personnel.account_number}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex px-4 py-3 bg-gray-50">
                    <button 
                      onClick={() => handleViewDetails(personnel.id)}
                      className="bg-[#00064d] text-white px-6 py-2 rounded-lg text-base flex items-center justify-center mx-auto transition-transform duration-300 ease-in-out hover:scale-105  hover:cursor-pointer"
                    >
                      View Details
                    </button>

                    <button 
                      onClick={() => handleEdit(personnel.id)}
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
          {activeTab === "view" && selectedPerson && (
            <div className="mx-auto max-w-3xl p-6 bg-white rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#00064d]">Personnel Details</h2>
                <button 
                  onClick={() => setActiveTab("list")}
                  className="text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 block">Full Name</span>
                      <span className="font-medium">{selectedPerson.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Profession</span>
                      <span className="font-medium">{selectedPerson.profession}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">ID</span>
                      <span className="font-medium">#{selectedPerson.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Address</span>
                      <span className="font-medium">{selectedPerson.address || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Work Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 block">Grade</span>
                      <span className="font-medium">{selectedPerson.grade?.name || selectedPerson.profession}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Wilaya</span>
                      <span className="font-medium">
                        {selectedPerson.wilaya?.name || 'Not specified'}
                        {selectedPerson.wilaya?.code && ` (Code: ${selectedPerson.wilaya.code})`}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Account Number</span>
                      <span className="font-medium">
                        {selectedPerson.is_ccp_account ? 'CCP' : ''} {selectedPerson.account_number}
                      </span>
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
                      onClick={() => handleEdit(selectedPerson.id)}
                      className="px-4 py-2 bg-[#870839] text-white rounded-lg flex items-center  hover:cursor-pointer"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    
                    <button 
                      onClick={() => {
                        deletePersonnel(selectedPerson.id);
                        setActiveTab("list");
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg  hover:cursor-pointer"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Add new personnel tab */}
          {activeTab === "add" && (
            <div className="mx-auto max-w-3xl p-6 bg-white rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#00064d]">Add New Personnel</h2>
                <button 
                  onClick={() => setActiveTab("list")}
                  className="text-gray-500 hover:text-gray-700  hover:cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1">Profession</label>
                    <select
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="">Select a profession</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Worker">Worker</option>
                      <option value="Driver">Driver</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Grade Name</label>
                    <select
                      name="grade_id"
                      value={formData.grade_id}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="">Select a Grade</option>
                      {grades && grades.map((grade,key) => {
                        return(
                          <option key={key} value={grade.id}>{grade.profession}-{grade.name}</option>
                        )
                      })} 
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1">Wilaya</label>
                    <select
                      name="wilaya_id"
                      value={formData.wilaya_id}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    >
                      {wilayas && wilayas.map((wilaya,key) => {
                        return(
                          <option key={key} value={wilaya.id} >
                            {wilaya.code}-{wilaya.name}
                          </option>
                        )
                      })} 
                    </select>
                    
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      name="account_number"
                      value={formData.account_number}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_ccp_account"
                      name="is_ccp_account"
                      checked={formData.is_ccp_account}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                    />
                    <label htmlFor="is_ccp_account">CCP Account</label>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button 
                  onClick={() => setActiveTab("list")}
                  className="px-4 py-2 border border-gray-300 rounded-lg  hover:cursor-pointer"
                >
                  Cancel
                </button>
                
                <button 
                  onClick={addPersonnel}
                  className="px-4 py-2 bg-[#00064d] text-white rounded-lg  hover:cursor-pointer"
                >
                  Add Personnel
                </button>
              </div>
            </div>
          )}

          {/* Edit personnel tab */}
          {activeTab === "edit" && selectedPerson && (
            <div className="mx-auto max-w-3xl p-6 bg-white rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#00064d]">Edit Personnel</h2>
                <button 
                  onClick={() => setActiveTab("list")}
                  className="text-gray-500 hover:text-gray-700  hover:cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1">Profession</label>
                    <select
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="Teacher">Teacher</option>
                      <option value="Worker">Worker</option>
                      <option value="Driver">Driver</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Grade Name</label>
                    <select
                      name="grade_id"
                      value={formData.grade_id}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    >
                      {grades && grades.map((grade,key) => {
                        return(
                          <option key={key} value={grade.id}>{grade.profession}-{grade.name}</option>
                        )
                      })} 
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1">Wilaya</label>
                    <select
                      name="wilaya_id"
                      value={formData.wilaya_id}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    >
                      {wilayas && wilayas.map((wilaya,key) => {
                        return(
                          <option key={key} value={wilaya.id} >
                            {wilaya.code}-{wilaya.name}
                          </option>
                        )
                      })} 
                    </select>
                    
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      name="account_number"
                      value={formData.account_number}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit_is_ccp_account"
                      name="is_ccp_account"
                      checked={formData.is_ccp_account}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                    />
                    <label htmlFor="edit_is_ccp_account">CCP Account</label>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button 
                  onClick={() => setActiveTab("list")}
                  className="px-4 py-2 border border-gray-300 rounded-lg  hover:cursor-pointer"
                >
                  Cancel
                </button>
                
                <button 
                  onClick={updatePersonnel}
                  className="px-4 py-2 bg-[#870839] text-white rounded-lg  hover:cursor-pointer"
                >
                  Update Personnel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Personnels;