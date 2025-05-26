import { CheckCircle, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LogOut = () => {
  const navigate = useNavigate()
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Logged Out Successfully
          </h2>
          
          <p className="text-gray-600 mb-8">
            You have been logged out successfully. Press the button below to login again.
          </p>
          
          <button
            onClick={() => navigate(`/login`) }
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Login Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogOut;