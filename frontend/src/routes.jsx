import { Routes, Route } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute"; // adjust path if needed

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MissionManager from "./pages/MissionManager";
import LogOut from "./pages/Logout";
import Profile from "./pages/Profile";

const RoutesList = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<LogOut />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile/:id" element={<Profile />} />
      {/* Private Routes */}
      
        <Route path="/" element={<Home />} />
        <Route element={<PrivateRoute />}>
        <Route path="/missionManager" element={<MissionManager />} />
        
      </Route>
    </Routes>
  );
};

export default RoutesList;
