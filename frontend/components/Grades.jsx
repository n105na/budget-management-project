import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { fetchWithAuth } from "../src/utils/fetchWithAuth";

const Grades = (user) => {
  const [activeTab, setActiveTab] = useState("Grades")
  const API_URL = import.meta.env.VITE_API_URL;
  const hasPermission = user.userLoggedin.role === "Secretaire Generale" || user.userLoggedin.role === "Comptable";
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null)

  const [grades, setGrades] = useState([]);
  const [gradesPayments, setGradesPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [editingGradePayment, setEditingGradePayment] = useState(null);
  
  // Form data for grades
  const [gradeFormData, setGradeFormData] = useState({
    name: '',
    profession: ''
  });

  // Form data for grade payments
  const [gradePaymentFormData, setGradePaymentFormData] = useState({
    grade: '',
    lodging_payment_north: '',
    lodging_payment_south: '',
    meal_payment_north: '',
    meal_payment_south: ''
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

  const loadGradesPayments = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_URL}/api/grade-payment/`);
      if (response.ok) {
        setError(null)
        const data = await response.json();
        console.log("grade payment : ", data);
        setGradesPayments(data);
      }
    } catch (error) {
      setError("Error loading Grade Payments")
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Grade handlers
  const handleAddGrade = async (e) => {
    e.preventDefault();
    if (!gradeFormData.name || !gradeFormData.profession) {
      setError("Please fill all the fields")
      return;
    };
    
    try {
      const response = await fetchWithAuth(`${API_URL}/api/grades/`, {
        method: 'POST',
        body: JSON.stringify(gradeFormData)
      });
      
      if (response.ok) {
        const newGrade = await response.json();
        setError(null)
        setSuccess("Grade Added Successfully")
        console.log("grade : ", newGrade);
        setTimeout(() => {
          setSuccess(null)
        }, 2000);
        setGrades([...grades, newGrade]);
        setGradeFormData({ name: '', profession: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      setError('Error adding grade')
      console.error(error);
    }
  };

  const handleEditGrade = async () => {
    if (!gradeFormData.name || !gradeFormData.profession) return;
    
    try {
      const response = await fetchWithAuth(`${API_URL}/api/grades/${editingGrade.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(gradeFormData)
      });
      
      if (response.ok) {
        setError(null)
        setSuccess("Grade Updated Successfully")
        const updatedGrade = await response.json();
        setTimeout(() => {
          setSuccess(null)
        }, 2000);
        setGrades(grades.map(g => g.id === editingGrade.id ? updatedGrade : g));
        setEditingGrade(null);
        setGradeFormData({ name: '', profession: '' });
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
          setSuccess("Grade Deleted Successfully")
          setGrades(grades.filter(g => g.id !== id));
          setTimeout(() => {
            setSuccess(null);
          }, 2000);
        }
      } catch (error) {
        setError('Error deleting grade')
        console.error(error);
      }
    }
  };

  // Grade Payment handlers
  const handleAddGradePayment = async (e) => {
    e.preventDefault();
    if (!gradePaymentFormData.grade || !gradePaymentFormData.lodging_payment_north || 
        !gradePaymentFormData.lodging_payment_south || !gradePaymentFormData.meal_payment_north || 
        !gradePaymentFormData.meal_payment_south) {
      setError("Please fill all the fields")
      return;
    };
    
    try {
      const response = await fetchWithAuth(`${API_URL}/api/grade-payment/`, {
        method: 'POST',
        body: JSON.stringify(gradePaymentFormData)
      });
      
      if (response.ok) {
        const newGradePayment = await response.json();
        setError(null)
        setSuccess("Grade Payment Added Successfully")
        setTimeout(() => {
          setSuccess(null)
        }, 2000);
        setGradesPayments([...gradesPayments, newGradePayment]);
        setGradePaymentFormData({ grade: '', lodging_payment_north: '', lodging_payment_south: '', meal_payment_north: '', meal_payment_south: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      setError('Error adding grade payment')
      console.error(error);
    }
  };

  const handleEditGradePayment = async () => {
    if (!gradePaymentFormData.grade || !gradePaymentFormData.lodging_payment_north || 
        !gradePaymentFormData.lodging_payment_south || !gradePaymentFormData.meal_payment_north || 
        !gradePaymentFormData.meal_payment_south) return;
    
    try {
      const response = await fetchWithAuth(`${API_URL}/api/grade-payment/${editingGradePayment.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(gradePaymentFormData)
      });
      
      if (response.ok) {
        setError(null)
        setSuccess("Grade Payment Updated Successfully")
        const updatedGradePayment = await response.json();
        setTimeout(() => {
          setSuccess(null)
        }, 2000);
        setGradesPayments(gradesPayments.map(gp => gp.id === editingGradePayment.id ? updatedGradePayment : gp));
        setEditingGradePayment(null);
        setGradePaymentFormData({ grade: '', lodging_payment_north: '', lodging_payment_south: '', meal_payment_north: '', meal_payment_south: '' });
      }
    } catch (error) {
      setError('Error updating grade payment')
      console.error(error);
    }
  };

  const handleDeleteGradePayment = async (id) => {
    if (window.confirm('Are you sure you want to delete this grade payment?')) {
      try {
        const response = await fetchWithAuth(`${API_URL}/api/grade-payment/${id}/`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setError(null)
          setSuccess("Grade Payment Deleted Successfully")
          setGradesPayments(gradesPayments.filter(gp => gp.id !== id));
          setTimeout(() => {
            setSuccess(null);
          }, 2000);
        }
      } catch (error) {
        setError('Error deleting grade payment')
        console.error(error);
      }
    }
  };

  // Utility functions
  const startEditGrade = (grade) => {
    setEditingGrade(grade);
    setGradeFormData({
      name: grade.name,
      profession: grade.profession
    });
    setShowAddForm(false);
    setEditingGradePayment(null);
  };

  const startEditGradePayment = (gradePayment) => {
    setEditingGradePayment(gradePayment);
    setGradePaymentFormData({
      grade: gradePayment.grade,
      lodging_payment_north: gradePayment.lodging_payment_north,
      lodging_payment_south: gradePayment.lodging_payment_south,
      meal_payment_north: gradePayment.meal_payment_north,
      meal_payment_south: gradePayment.meal_payment_south
    });
    setShowAddForm(false);
    setEditingGrade(null);
  };

  const cancelEdit = () => {
    setEditingGrade(null);
    setEditingGradePayment(null);
    setGradeFormData({ name: '', profession: '' });
    setGradePaymentFormData({ grade: '', lodging_payment_north: '', lodging_payment_south: '', meal_payment_north: '', meal_payment_south: '' });
  };

  const startAdd = () => {
    setShowAddForm(true);
    setEditingGrade(null);
    setEditingGradePayment(null);
    setGradeFormData({ name: '', profession: '' });
    setGradePaymentFormData({ grade: '', lodging_payment_north: '', lodging_payment_south: '', meal_payment_north: '', meal_payment_south: '' });
  };

  useEffect(() => {
    loadGrades();
    loadGradesPayments();
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
      <div className="flex border-b border-gray-300 mb-6 mx-6">
        <button
          onClick={() => {
            setActiveTab("Grades");
            setShowAddForm(false);
            cancelEdit();
          }}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors hover:cursor-pointer ${
            activeTab === "Grades"
              ? "border-[#00064d] text-[#00064d] bg-blue-50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Grades
        </button>
        <button
          onClick={() => {
            setActiveTab("Grade Payment");
            setShowAddForm(false);
            cancelEdit();
          }}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors hover:cursor-pointer ${
            activeTab === "Grade Payment"
              ? "border-[#00064d] text-[#00064d] bg-blue-50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Grade Payment
        </button>
      </div>
      
      {activeTab === "Grades" ? (
        <div className="p-6 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <p className='text-3xl font-bold text-[#00064d]'>Grades Management</p>
              {hasPermission && (
                <button
                  onClick={startAdd}
                  className="mt-4 md:mt-0 flex items-center gap-3 bg-[#00064d] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-[#000a6b] cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
                >
                  <Plus size={20} />
                  Add Grade
                </button>
              )}
            </div>

            {/* Add/Edit Form for Grades */}
            {(showAddForm || editingGrade) && activeTab === "Grades" && (
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade Name</label>
                    <input
                      type="text"
                      value={gradeFormData.name}
                      onChange={(e) => setGradeFormData({ ...gradeFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter grade name"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                    <select
                      value={gradeFormData.profession}
                      onChange={(e) => setGradeFormData({ ...gradeFormData, profession: e.target.value })}
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

            {/* Grades Table */}
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
                    {hasPermission && 
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    }
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
                      {hasPermission &&
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => startEditGrade(grade)}
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
                      </td>}
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
      ) : (
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <p className='text-3xl font-bold text-[#00064d]'>Grade Payment Management</p>
              {hasPermission && (
                <button
                  onClick={startAdd}
                  className="mt-4 md:mt-0 flex items-center gap-3 bg-[#00064d] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-[#000a6b] cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
                >
                  <Plus size={20} />
                  Add Grade Payment
                </button>
              )}
            </div>

            {/* Add/Edit Form for Grade Payments */}
            {(showAddForm || editingGradePayment) && activeTab === "Grade Payment" && (
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                    <select
                      value={gradePaymentFormData.grade}
                      onChange={(e) => setGradePaymentFormData({ ...gradePaymentFormData, grade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select grade</option>
                      {grades.map((grade) => (
                        <option key={grade.id} value={grade.id}>
                          {grade.name} ({grade.profession})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lodging Payment North</label>
                    <input
                      type="number"
                      step="0.01"
                      value={gradePaymentFormData.lodging_payment_north}
                      onChange={(e) => setGradePaymentFormData({ ...gradePaymentFormData, lodging_payment_north: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lodging Payment South</label>
                    <input
                      type="number"
                      step="0.01"
                      value={gradePaymentFormData.lodging_payment_south}
                      onChange={(e) => setGradePaymentFormData({ ...gradePaymentFormData, lodging_payment_south: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meal Payment North</label>
                    <input
                      type="number"
                      step="0.01"
                      value={gradePaymentFormData.meal_payment_north}
                      onChange={(e) => setGradePaymentFormData({ ...gradePaymentFormData, meal_payment_north: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meal Payment South</label>
                    <input
                      type="number"
                      step="0.01"
                      value={gradePaymentFormData.meal_payment_south}
                      onChange={(e) => setGradePaymentFormData({ ...gradePaymentFormData, meal_payment_south: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editingGradePayment ? handleEditGradePayment : handleAddGradePayment}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    {editingGradePayment ? 'Update' : 'Add'}
                  </button>
                  <button
                    onClick={editingGradePayment ? cancelEdit : () => setShowAddForm(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Grade Payments Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lodging North
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lodging South
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Meal North
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Meal South
                    </th>
                    {hasPermission && 
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    }
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {gradesPayments.map((gradePayment) => (
                    <tr key={gradePayment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{gradePayment.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {gradePayment.grade_name} 
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {gradePayment.lodging_payment_north}DA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {gradePayment.lodging_payment_south}DA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {gradePayment.meal_payment_north}DA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {gradePayment.meal_payment_south}DA
                      </td>
                      {hasPermission &&
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => startEditGradePayment(gradePayment)}
                          className="text-blue-600 hover:text-white bg-white hover:bg-blue-600 p-1 rounded transition-colors hover:cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteGradePayment(gradePayment.id)}
                          className="text-red-600 hover:text-white bg-white  hover:bg-red-600 p-1 rounded transition-colors hover:cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {gradesPayments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No grade payments found. Click "Add Grade Payment" to get started.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Grades;