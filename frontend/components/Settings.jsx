import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, UserPlus } from 'lucide-react';
import { fetchWithAuth } from "../src/utils/fetchWithAuth";
import { useNavigate } from 'react-router-dom';

const Settings = (user) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [users, setUsers] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [activeTab, setActiveTab] = useState("Users");
  
  // Form data for user editing
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    role: ''
  });

  // Form data for budget
  const [budgetFormData, setBudgetFormData] = useState({
    amount: ''
  });

  const hasPermission = user.userLoggedin.role === "Comptable";

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_URL}/api/users/`);
      if (response.ok) {
        setError(null);
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      setError('Error loading users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_URL}/api/budgets/`);
      if (response.ok) {
        setError(null);
        const data = await response.json();
        console.log("budget",data);
        
        setBudgets(data);
      }
    } catch (error) {
      setError('Error loading budgets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadBudgets();
  }, []);

  const handleDeleteUser = async (id) => {
      if(confirm("Are You sure you want to delete this user")){
        try {
          const response = await fetchWithAuth(`${API_URL}/api/delete_user/${id}/`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            setError(null);
            setSuccess("User Deleted Successfully");
            
            setTimeout(() => {
              setSuccess(null);
              loadUsers()
            }, 2000);
          }
        } catch (error) {
          setError('Error Deleting user');
          setTimeout(() => {
              setError(null);
            }, 2000);
          console.error(error);
        }
      }      
    };
  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth(`${API_URL}/api/update_user/${editingUser.id}/`, {
        method: 'PUT',
        body: JSON.stringify(userFormData)
      });
      
      if (response.ok) {
        setError(null);
        setSuccess("User Updated Successfully");
        const updatedUser = await response.json();
        setTimeout(() => {
          setSuccess(null);
        }, 2000);
        setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
        setEditingUser(null);
        setUserFormData({username: '', email: '', role: ''});
      }
    } catch (error) {
      setError('Error updating user');
      console.error(error);
    }
  };

  const handleAddUser = () => {
    navigate('/register');
  };

  // Budget handlers
  const handleAddBudget = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth(`${API_URL}/api/budgets/`, {
        method: 'POST',
        body: JSON.stringify(budgetFormData)
      });
      
      if (response.ok) {
        setError(null);
        setSuccess("Budget Added Successfully");
        const newBudget = await response.json();
        setTimeout(() => {
          setSuccess(null);
        }, 2000);
        setBudgets([...budgets, newBudget]);
        setBudgetFormData({amount: ''});
        setShowAddForm(false);
      } else {
        setError("Error Adding the Budget");
      }
    } catch (error) {
      setError("Error Adding the Budget");
      console.error(error);
    }
  };

  const handleEditBudget = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth(`${API_URL}/api/budgets/${editingBudget.id}/`, {
        method: 'PUT',
        body: JSON.stringify(budgetFormData)
      });
      
      if (response.ok) {
        setError(null);
        setSuccess("Budget Updated Successfully");
        const updatedBudget = await response.json();
        setTimeout(() => {
          setSuccess(null);
        }, 2000);
        setBudgets(budgets.map(b => b.id === editingBudget.id ? updatedBudget : b));
        setEditingBudget(null);
        setBudgetFormData({amount: ''});
      }
    } catch (error) {
      setError('Error updating budget');
      console.error(error);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        const response = await fetchWithAuth(`${API_URL}/api/budgets/${id}/`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setError(null);
          setSuccess("Budget deleted Successfully");
          setBudgets(budgets.filter(b => b.id !== id));
          setTimeout(() => {
            setSuccess(null);
          }, 2000);
        }
      } catch (error) {
        setError('Error deleting budget');
        console.error(error);
      }
    }
  };

  // Helper functions
  const startEditUser = (userToEdit) => {
    setEditingUser(userToEdit);
    setUserFormData({
      username: userToEdit.username,
      email: userToEdit.email,
      role: userToEdit.role
    });
    setShowAddForm(false);
  };

  const startEditBudget = (budget) => {
    setEditingBudget(budget);
    setBudgetFormData({
      amount: budget.amount
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditingBudget(null);
    setUserFormData({username: '', email: '', role: ''});
    setBudgetFormData({amount: ''});
  };

  const startAdd = () => {
    setShowAddForm(true);
    setEditingUser(null);
    setEditingBudget(null);
    if (activeTab === "Users") {
      setUserFormData({username: '', email: '', role: ''});
    } else {
      setBudgetFormData({amount: ''});
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Secretaire Generale':
        return 'bg-purple-100 text-purple-800';
      case 'Comptable':
        return 'bg-blue-100 text-blue-800';
      case 'Commission':
        return 'bg-green-100 text-green-800';
      case 'Dover':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            setActiveTab("Users");
            setShowAddForm(false);
            cancelEdit();
          }}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors hover:cursor-pointer ${
            activeTab === "Users"
              ? "border-[#00064d] text-[#00064d] bg-blue-50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          User Management
        </button>
        <button
          onClick={() => {
            setActiveTab("Budget");
            setShowAddForm(false);
            cancelEdit();
          }}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors hover:cursor-pointer ${
            activeTab === "Budget"
              ? "border-[#00064d] text-[#00064d] bg-blue-50"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Budget Management
        </button>
      </div>

      {activeTab === "Users" ? (
        <div className="bg-white rounded-lg shadow-lg w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <p className="text-3xl font-bold text-[#00064d]">User Management</p>
            {hasPermission && (
              <button
                onClick={handleAddUser}
                className="mt-4 md:mt-0 flex items-center gap-3 bg-[#00064d] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-[#000a6b] cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
              >
                <UserPlus size={20} />
                Add User
              </button>
            )}
          </div>

          {/* Edit Form */}
          {editingUser && (
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <form onSubmit={handleEditUser} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="Secretaire Generale">Secretaire Generale</option>
                    <option value="Comptable">Comptable</option>
                    <option value="Commission">Commission</option>
                    <option value="Doyen">Doyen</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  {hasPermission && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{userItem.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userItem.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userItem.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(userItem.role)}`}>
                        {userItem.role}
                      </span>
                    </td>
                    {hasPermission && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => startEditUser(userItem)}
                          className="text-blue-600 hover:text-white bg-white hover:bg-blue-600 p-1 rounded transition-colors hover:cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(userItem.id)}
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

          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found. Click "Add User" to get started.
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <p className="text-3xl font-bold text-[#00064d]">Budget Management</p>
              {hasPermission && (
                <button
                  onClick={startAdd}
                  className="mt-4 md:mt-0 flex items-center gap-3 bg-[#00064d] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-[#000a6b] cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
                >
                  <Plus size={20} />
                  Add Budget
                </button>
              )}
            </div>

            {/* Add/Edit Form for Budget */}
            {(showAddForm || editingBudget) && (
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <form onSubmit={editingBudget ? handleEditBudget : handleAddBudget} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={budgetFormData.amount}
                      onChange={(e) => setBudgetFormData({ ...budgetFormData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      {editingBudget ? 'Update' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={editingBudget ? cancelEdit : () => setShowAddForm(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Budget Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    {hasPermission && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {budgets.map((budget) => (
                    <tr key={budget.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{budget.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {parseFloat(budget.amount).toFixed(2)}DA
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {budget.added_on}
                      </td>
                      {hasPermission && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => startEditBudget(budget)}
                            className="text-blue-600 hover:text-white bg-white hover:bg-blue-600 p-1 rounded transition-colors hover:cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteBudget(budget.id)}
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

            {budgets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No budgets found. Click "Add Budget" to get started.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;