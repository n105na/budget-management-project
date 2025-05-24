import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { fetchWithAuth } from "../src/utils/fetchWithAuth";

const Grades = (user) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const hasPermission = user.userLoggedin.role === "Secretaire Generale" || user.userLoggedin.role === "Comptable";
  const [sucess,setSucess] = useState(null);
  const [error,setError] = useState(null)
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    profession: ''
  });

 

  const loadGrades = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_URL}/api/grades/`);
      if (response.ok) {
        setError(null)
        const data = await response.json();
        setGrades(data);
      }
    } catch (error) {
      setError("Error loading Grades")
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.profession) {
      setError("Please fill all the fields")
      return;
    };
    
    try {
      const response = await fetchWithAuth(`${API_URL}/api/grades/`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const newGrade = await response.json();
        setError(null)
        setSucess("Grade Added Successfully")
        console.log("grade : ",newGrade);
        setTimeout(() => {
          setSucess(null)
        }, 2000);
        setGrades([...grades, newGrade]);
        setFormData({ name: '', profession: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      setError('Error adding grade')
      console.error(error);
    }
  };

  const handleEditGrade = async () => {
    if (!formData.name || !formData.profession) return;
    
    try {
      const response = await fetchWithAuth(`${API_URL}/api/grades/${editingGrade.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setError(null)
        setSucess("Grade Updated Successfully")
        const updatedGrade = await response.json();
        setTimeout(() => {
          setSucess(null)
        }, 2000);
        setGrades(grades.map(g => g.id === editingGrade.id ? updatedGrade : g));
        setEditingGrade(null);
        setFormData({ name: '', profession: '' });
      }
    } catch (error) {
      setError('Error updating grade')
      console.error(error);
    }
  };

  const handleDeleteGrade = async (id) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      try {
        const response = await fetchWithAuth(`${API_URL}/api/grades/${id}/`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setError(null)
          setSucess("Grade Deleted Successully")
          setGrades(grades.filter(g => g.id !== id));
          setTimeout(() => {
            setSucess(null);
          }, 2000);
        }
      } catch (error) {
        setError('Error deleting grade')
        console.error(error);
      }
    }
  };

  const startEdit = (grade) => {
    setEditingGrade(grade);
    setFormData({
      name: grade.name,
      profession: grade.profession
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingGrade(null);
    setFormData({ name: '', profession: '' });
  };

  const startAdd = () => {
    setShowAddForm(true);
    setEditingGrade(null);
    setFormData({ name: '', profession: '' });
  };

  useEffect(() => {
    loadGrades();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-600">Loading grades...</div>
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
          <p className='text-3xl font-bold text-[#00064d]'>Grades Management</p>
          <button
            onClick={startAdd}
            className={`mt-4 md:mt-0 flex items-center gap-3 bg-[#00064d] text-white px-6 py-3 rounded-full font-semibold shadow-lg
                    ${hasPermission ? "hover:bg-[#000a6b] cursor-pointer" : "opacity-60 cursor-not-allowed"}
                    transition-transform duration-300 ease-in-out hover:scale-105`}
          >
            <Plus size={20} />
            Add Grade
          </button>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingGrade) && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter grade name"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                <select
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select profession</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Worker">Worker</option>
                  <option value="Driver">Driver</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={editingGrade ? handleEditGrade : handleAddGrade}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  {editingGrade ? 'Update' : 'Add'}
                </button>
                <button
                  onClick={editingGrade ? cancelEdit : () => setShowAddForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
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
                  Profession
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grades.map((grade) => (
                <tr key={grade.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{grade.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      grade.profession === 'Teacher' 
                        ? 'bg-green-100 text-green-800' 
                        : grade.profession === 'Worker'
                        ? 'bg-blue-100 text-blue-800'
                        : grade.profession === 'Administrator'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {grade.profession}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {grade.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => startEdit(grade)}
                      className="text-blue-600 hover:text-white bg-white hover:bg-blue-600 p-1 rounded transition-colors hover:cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteGrade(grade.id)}
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

        {grades.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No grades found. Click "Add Grade" to get started.
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Grades;