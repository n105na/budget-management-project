import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Settings } from 'lucide-react';
import { fetchWithAuth } from "../src/utils/fetchWithAuth";

const Willaya = (user) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [wilayas, setWilayas] = useState([]);
  const [distances, setDistances] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWilaya, setEditingWilaya] = useState(null);
  const [editingDistance, setEditingDistance] = useState(null);
  const [activeTab, setActiveTab] = useState("Willaya");
  
  // Form data for wilaya
  const [wilayaFormData, setWilayaFormData] = useState({
    code: '',
    name: '',
    is_south: false
  });

  // Form data for distance
  const [distanceFormData, setDistanceFormData] = useState({
    distance_km: '',
    wilaya_from: '',
    wilaya_to: ''
  });

  const hasPermission = user.userLoggedin.role === "Secretaire Generale" || user.userLoggedin.role === "Comptable";

  const loadWilayas = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_URL}/api/wilaya/`);
      if (response.ok) {
        setError(null);
        const data = await response.json();
        setWilayas(data);
      }
    } catch (error) {
      setError('Error loading wilayas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadDistance = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_URL}/api/distance/`);
      if (response.ok) {
        setError(null);
        const data = await response.json();
        console.log("distance ", data);
        setDistances(data);
      }
    } catch (error) {
      setError('Error loading distances');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWilayas();
    loadDistance();
  }, []);

  // Wilaya handlers
  const handleAddWilaya = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth(`${API_URL}/api/wilaya/`, {
        method: 'POST',
        body: JSON.stringify(wilayaFormData)
      });
      
      if (response.ok) {
        setError(null);
        setSuccess("Willaya Added Successfully");
        const newWilaya = await response.json();
        setTimeout(() => {
          setSuccess(null);
        }, 2000);
        setWilayas([...wilayas, newWilaya]);
        setWilayaFormData({code: '', name: '', is_south: false});
        setShowAddForm(false);
      } else {
        setError("Error Adding the Willaya");
      }
    } catch (error) {
      setError("Error Adding the Willaya");
      console.error(error);
    }
  };

  const handleEditWilaya = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth(`${API_URL}/api/wilaya/${editingWilaya.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(wilayaFormData)
      });
      
      if (response.ok) {
        setError(null);
        setSuccess("Willaya Updated Successfully");
        const updatedWilaya = await response.json();
        setTimeout(() => {
          setSuccess(null);
        }, 2000);
        setWilayas(wilayas.map(w => w.id === editingWilaya.id ? updatedWilaya : w));
        setEditingWilaya(null);
        setWilayaFormData({name: '', code: '', is_south: false});
      }
    } catch (error) {
      setError('Error updating wilaya');
      console.error(error);
    }
  };

  const handleDeleteWilaya = async (id) => {
    if (window.confirm('Are you sure you want to delete this wilaya?')) {
      try {
        const response = await fetchWithAuth(`${API_URL}/api/wilaya/${id}/`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setError(null);
          setSuccess("Willaya deleted Successfully");
          setWilayas(wilayas.filter(w => w.id !== id));
          setTimeout(() => {
            setSuccess(null);
          }, 2000);
        }
      } catch (error) {
        setError('Error deleting wilaya');
        console.error(error);
      }
    }
  };

  // Distance handlers
  const handleAddDistance = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth(`${API_URL}/api/distance/`, {
        method: 'POST',
        body: JSON.stringify(distanceFormData)
      });
      
      if (response.ok) {
        setError(null);
        setSuccess("Distance Added Successfully");
        const newDistance = await response.json();
        setTimeout(() => {
          setSuccess(null);
        }, 2000);
        setDistances([...distances, newDistance]);
        setDistanceFormData({distance_km: '', wilaya_from: '', wilaya_to: ''});
        setShowAddForm(false);
      } else {
        setError("Error Adding the Distance");
      }
    } catch (error) {
      setError("Error Adding the Distance");
      console.error(error);
    }
  };

  const handleEditDistance = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth(`${API_URL}/api/distance/${editingDistance.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(distanceFormData)
      });
      
      if (response.ok) {
        setError(null);
        setSuccess("Distance Updated Successfully");
        const updatedDistance = await response.json();
        setTimeout(() => {
          setSuccess(null);
        }, 2000);
        setDistances(distances.map(d => d.id === editingDistance.id ? updatedDistance : d));
        setEditingDistance(null);
        setDistanceFormData({distance_km: '', wilaya_from: '', wilaya_to: ''});
      }
    } catch (error) {
      setError('Error updating distance');
      console.error(error);
    }
  };

  const handleDeleteDistance = async (id) => {
    if (window.confirm('Are you sure you want to delete this distance?')) {
      try {
        const response = await fetchWithAuth(`${API_URL}/api/distance/${id}/`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setError(null);
          setSuccess("Distance deleted Successfully");
          setDistances(distances.filter(d => d.id !== id));
          setTimeout(() => {
            setSuccess(null);
          }, 2000);
        }
      } catch (error) {
        setError('Error deleting distance');
        console.error(error);
      }
    }
  };

  // Helper functions
  const startEditWilaya = (wilaya) => {
    setEditingWilaya(wilaya);
    setWilayaFormData({
      code: wilaya.code,
      name: wilaya.name,
      is_south: wilaya.is_south
    });
    setShowAddForm(false);
  };

  const startEditDistance = (distance) => {
    setEditingDistance(distance);
    setDistanceFormData({
      distance_km: distance.distance_km,
      wilaya_from: distance.wilaya_from,
      wilaya_to: distance.wilaya_to
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingWilaya(null);
    setEditingDistance(null);
    setWilayaFormData({code: '', name: '', is_south: false});
    setDistanceFormData({distance_km: '', wilaya_from: '', wilaya_to: ''});
  };

  const startAdd = () => {
    setShowAddForm(true);
    setEditingWilaya(null);
    setEditingDistance(null);
    if (activeTab === "Willaya") {
      setWilayaFormData({code: '', name: '', is_south: false});
    } else {
      setDistanceFormData({distance_km: '', wilaya_from: '', wilaya_to: ''});
    }
  };

  const getWilayaName = (wilayaId) => {
    const wilaya = wilayas.find(w => w.id === wilayaId);
    return wilaya ? wilaya.name : `Wilaya ${wilayaId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Success message */}
      {success && (
        <div className="mx-10 mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
          <p>{success}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mx-10 mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-300 mb-6 mx-6">
        <button
          onClick={() => {
            setActiveTab("Willaya");
            setShowAddForm(false);
            cancelEdit();
          }}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors hover:cursor-pointer ${
            activeTab === "Willaya"
              ? "border-[#00064d] text-[#00064d] bg-blue-50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Willaya Management
        </button>
        <button
          onClick={() => {
            setActiveTab("Distance");
            setShowAddForm(false);
            cancelEdit();
          }}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors hover:cursor-pointer ${
            activeTab === "Distance"
              ? "border-[#00064d] text-[#00064d] bg-blue-50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Distance Management
        </button>
      </div>

      {activeTab === "Willaya" ? (
        <div className="p-6 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <p className="text-3xl font-bold text-[#00064d]">Wilaya Management</p>
              {hasPermission && (
                <button
                  onClick={startAdd}
                  className="mt-4 md:mt-0 flex items-center gap-3 bg-[#00064d] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-[#000a6b] cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
                >
                  <Plus size={20} />
                  Add Wilaya
                </button>
              )}
            </div>

            {/* Add/Edit Form for Wilaya */}
            {(showAddForm || editingWilaya) && (
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <form onSubmit={editingWilaya ? handleEditWilaya : handleAddWilaya} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={wilayaFormData.name}
                      onChange={(e) => setWilayaFormData({ ...wilayaFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                    <input
                      type="number"
                      value={wilayaFormData.code}
                      onChange={(e) => setWilayaFormData({ ...wilayaFormData, code: parseInt(e.target.value) || '' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  {showAddForm && (
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <select
                        value={wilayaFormData.is_south ? "South" : "North"}
                        onChange={(e) => setWilayaFormData({ ...wilayaFormData, is_south: e.target.value === "South" })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Location</option>
                        <option value="South">South</option>
                        <option value="North">North</option>
                      </select>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      {editingWilaya ? 'Update' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={editingWilaya ? cancelEdit : () => setShowAddForm(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Wilaya Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wilaya
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    {hasPermission && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {wilayas.map((wilaya) => (
                    <tr key={wilaya.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{wilaya.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {wilaya.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          wilaya.is_south 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {wilaya.is_south ? 'South' : 'North'}
                        </span>
                      </td>
                      {hasPermission && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => startEditWilaya(wilaya)}
                            className="text-blue-600 hover:text-white bg-white hover:bg-blue-600 p-1 rounded transition-colors hover:cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteWilaya(wilaya.id)}
                            className="text-red-600 hover:text-white bg-white hover:bg-red-600 p-1 rounded transition-colors hover:cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {wilayas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No wilayas found. Click "Add Wilaya" to get started.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <p className="text-3xl font-bold text-[#00064d]">Distance Management</p>
              {hasPermission && (
                <button
                  onClick={startAdd}
                  className="mt-4 md:mt-0 flex items-center gap-3 bg-[#00064d] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-[#000a6b] cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
                >
                  <Plus size={20} />
                  Add Distance
                </button>
              )}
            </div>

            {/* Add/Edit Form for Distance */}
            {(showAddForm || editingDistance) && (
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <form onSubmit={editingDistance ? handleEditDistance : handleAddDistance} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Wilaya</label>
                    <select
                      value={distanceFormData.wilaya_from}
                      onChange={(e) => setDistanceFormData({ ...distanceFormData, wilaya_from: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select From Wilaya</option>
                      {wilayas.map((wilaya) => (
                        <option key={wilaya.id} value={wilaya.id}>
                          {wilaya.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Wilaya</label>
                    <select
                      value={distanceFormData.wilaya_to}
                      onChange={(e) => setDistanceFormData({ ...distanceFormData, wilaya_to: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select To Wilaya</option>
                      {wilayas.map((wilaya) => (
                        <option key={wilaya.id} value={wilaya.id}>
                          {wilaya.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Distance (KM)</label>
                    <input
                      type="number"
                      value={distanceFormData.distance_km}
                      onChange={(e) => setDistanceFormData({ ...distanceFormData, distance_km: parseInt(e.target.value) || '' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      {editingDistance ? 'Update' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={editingDistance ? cancelEdit : () => setShowAddForm(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Distance Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From Wilaya
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      To Wilaya
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distance (KM)
                    </th>
                    {hasPermission && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {distances.map((distance) => (
                    <tr key={distance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{distance.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getWilayaName(distance.wilaya_from)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getWilayaName(distance.wilaya_to)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {distance.distance_km} km
                        </span>
                      </td>
                      {hasPermission && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => startEditDistance(distance)}
                            className="text-blue-600 hover:text-white bg-white hover:bg-blue-600 p-1 rounded transition-colors hover:cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteDistance(distance.id)}
                            className="text-red-600 hover:text-white bg-white hover:bg-red-600 p-1 rounded transition-colors hover:cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {distances.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No distances found. Click "Add Distance" to get started.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Willaya;