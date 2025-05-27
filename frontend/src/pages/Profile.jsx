import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { fetchWithAuth } from "../utils/fetchWithAuth"
import { ArrowBigLeft, ArrowLeft, ArrowLeftToLine } from "lucide-react";

const Profile = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  // Initialize user with default values to prevent undefined
  const [user, setUser] = useState({
    username: "",
    email: "",
    role: ""
  })
  
  const [passwordFormData, setPassFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  })

  const { id } = useParams()

  useEffect(() => {
    console.log("id : ", id);
  }, [])
  
  const loadUserData = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/users/${id}`);
      if (response.ok) {
        const data = await response.json();
        console.log("user data : ", data);
        setUser(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault(); // Prevent form submission
    try {
      const response = await fetchWithAuth(`${API_URL}/api/change-password/`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordFormData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data.message || 'Password updated successfully');
        setError('');
        setPassFormData({
          current_password: "",
          new_password: "",
          confirm_password: ""
        });
        setTimeout(() => {
          setSuccess('');
        }, 2000);
      } else {
        setError(data.message || 'Failed to update password');
        setSuccess('');
        setTimeout(() => {
          setError('');
        }, 2000);
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred while updating password');
      setTimeout(() => {
        setError('');
      }, 2000);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    console.log("password form : ", passwordFormData);
  }, [passwordFormData]);

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="">
          <div className="bg-white">
            <button 
              onClick={() => {navigate(`/missionManager`)}}
              className=" inline-flex items-center gap-2 px-4 py-2 text-[#00064d] hover:bg-blue-50 hover:cursor-pointer rounded-lg transition-colors duration-200 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
          <div className="bg-white p-10 rounded-b-2xl">
            <div className="mb-5">
              <p className="text-4xl font-semibold text-[#00064d]">Account Information</p>
              <hr className="w-32 border-2 border-[#00064d]" />
            </div>

            <div className="space-y-8">
              <div className="flex flex-col gap-2">
                <label className="text-lg font-semibold">Full Name</label>
                <input
                  type="text"
                  value={user.username}
                  name='username'
                  className="p-4 border rounded-xl"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-lg font-semibold">Email</label>
                <input
                  type="text"
                  value={user.email}
                  name='email'
                  className="p-4 border rounded-xl"
                  readOnly 
                />
              </div>
              <div>
                <label className="text-lg font-semibold">Role</label>
                <select
                  value={user.role}
                  className="w-full p-4 border rounded-md focus:outline-none"
                  disabled
                >
                  <option value="">Select Role</option>
                  <option value="Secretaire Generale">Secretaire Generale</option>
                  <option value="Comptable">Comptable</option>
                  <option value="Commission">Commission</option>
                  <option value="Doyen">Doyen</option>
                </select>
              </div>
            </div>

            <div className="mt-15">
              <div className="mb-5">
                <p className="text-2xl font-semibold">Password</p>
                <p className="text-lg font-semibold text-gray-400">Update your password to keep your account secure</p>
              </div>

              <form onSubmit={updatePassword} className="space-y-8">
                <div className="flex flex-col gap-2">
                  <label className="text-lg font-semibold">Current Password</label>
                  <input
                    type="password"
                    value={passwordFormData.current_password}
                    onChange={(e) => { setPassFormData({ ...passwordFormData, current_password: e.target.value }) }}
                    name='current_password'
                    className="p-4 border rounded-xl"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-lg font-semibold">New Password</label>
                  <input
                    type="password"
                    onChange={(e) => { setPassFormData({ ...passwordFormData, new_password: e.target.value }) }}
                    value={passwordFormData.new_password}
                    name='new_password'
                    className="p-4 border rounded-xl"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-lg font-semibold">Confirm New Password</label>
                  <input
                    type="password"
                    onChange={(e) => { setPassFormData({ ...passwordFormData, confirm_password: e.target.value }) }}
                    value={passwordFormData.confirm_password}
                    name='confirm_password'
                    className="p-4 border rounded-xl"
                    required
                  />
                </div>
                {success && <p className="text-lg font-semibold text-green-500">{success}</p>}
                {error && <p className="text-lg font-semibold text-red-500">{error}</p>}

                <div className="flex justify-end items-center gap-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 hover:cursor-pointer text-white px-4 py-2 rounded-md transition-colors">
                    Update Password
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPassFormData({
                      current_password: "",
                      new_password: "",
                      confirm_password: ""
                    })}
                    className="bg-gray-500 hover:bg-gray-600 hover:cursor-pointer text-white px-4 py-2 rounded-md transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile