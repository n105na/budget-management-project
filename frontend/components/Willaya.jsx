import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Settings } from 'lucide-react';
import { fetchWithAuth } from "../src/utils/fetchWithAuth";

const Willaya = (user) => {
  const API_URL = import.meta.env.VITE_API_URL;
const [sucess,setSucess] = useState(null);
  const [error,setError] = useState(null)
  const [wilayas, setWilayas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWilaya, setEditingWilaya] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    is_south : false });
  const hasPermission = user.userLoggedin.role === "Secretaire Generale" || user.userLoggedin.role === "Comptable";

  const loadWilayas = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_URL}/api/wilaya/`);
      if (response.ok) {
        setError(null)
        const data = await response.json();
        setWilayas(data);
      }
    } catch (error) {
      setError('Error loading wilayas')
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
console.log(formData);

},[formData])

  const handleAddWilaya = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth(`${API_URL}/api/wilaya/`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setError(null)
        setSucess("Willaya Added Successfully")
        const newWilaya = await response.json();
        console.log("data returned : ",newWilaya);
        setTimeout(() => {
          setSucess(null)
        }, 2000);
        setWilayas([...wilayas, newWilaya]);
        setFormData({code:'' , name:'', is_south : false });
        setShowAddForm(false);
      } else {
        setError("Error Adding the Willaya")
      }
    } catch (error) {
      setError("Error Adding the Willaya")
      console.error(error);
    }
  };

  const handleEditWilaya = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth(`${API_URL}/api/wilaya/${editingWilaya.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setError(null)
        setSucess("Willaya Updated Successfully")
        const updatedWilaya = await response.json();
        setTimeout(() => {
          setSucess(null)
        }, 2000);
        setWilayas(wilayas.map(w => w.id === editingWilaya.id ? updatedWilaya : w));
        setEditingWilaya(null);
        setFormData({ name: '', code: '', is_south : false});
      }
    } catch (error) {
      setError('Error updating wilaya')
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
          setError(null)
          setSucess("Willaya deleted Successully")
          setWilayas(wilayas.filter(w => w.id !== id));
          setTimeout(() => {
            setSucess(null)
          }, 2000);
        }
      } catch (error) {
        setError('Error deleting wilaya')
        console.error(error);
      }
    }
  };

  const startEdit = (wilaya) => {
    setEditingWilaya(wilaya);
    setFormData({
      code: wilaya.code,
      name: wilaya.name,
      is_south : wilaya.is_south
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingWilaya(null);
    setFormData({code: '' , name: '' , is_south : false});
  };

  const startAdd = () => {
    setShowAddForm(true);
    setEditingWilaya(null);
    setFormData({ code: '' , name: '', is_south : false});
  };

  useEffect(() => {
    loadWilayas();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-600">Loading wilayas...</div>
      </div>
    );
  }

  return (
    <>
    {/* sucess message */}
        {sucess && (
          <div className="mx-10 mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
            <p>{sucess}</p>
          </div>
        )}
        {/* Error message */}
      {error && (
        <div className="mx-10 mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      )}
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <p className='text-3xl font-bold text-[#00064d]'>Wilaya Management</p>
          <button
            onClick={startAdd}
            className={`mt-4 md:mt-0 flex items-center gap-3 bg-[#00064d] text-white px-6 py-3 rounded-full font-semibold shadow-lg
                    ${hasPermission ? "hover:bg-[#000a6b] cursor-pointer" : "opacity-60 cursor-not-allowed"}
                    transition-transform duration-300 ease-in-out hover:scale-105`}
          >
            <Plus size={20} />
            Add Wilaya
          </button>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingWilaya) && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <form onSubmit={editingWilaya ? handleEditWilaya : handleAddWilaya} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  type="number"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: parseInt(e.target.value) || '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {showAddForm && 
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={formData.is_south ? "South" : "North"}
                  onChange={(e) => setFormData({ ...formData, is_south: e.target.value === "South" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Location</option>
                  <option value="South">South</option>
                  <option value="North">North</option>
                </select>
              </div>
              }
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

        {/* Table */}
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => startEdit(wilaya)}
                      className="text-blue-600 hover:text-white bg-white hover:bg-blue-600 p-1 rounded transition-colors hover:cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteWilaya(wilaya.id)}
                      className="text-red-600 hover:text-white bg-white  hover:bg-red-600 p-1 rounded transition-colors hover:cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
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
    </>
  );
};

export default Willaya;