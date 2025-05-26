import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const accessToken = localStorage.getItem("access");

  return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
