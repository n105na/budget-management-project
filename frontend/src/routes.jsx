// routes.jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MissionManager from './pages/MissionManager';
import LogOut from './pages/Logout';

const RoutesList = () => {
  return (
    <Routes>
      {/*<Route path="/" element={<MissionManager />} />*/}

      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<LogOut />} />
      <Route path="/register" element={<Register />} />
      <Route path="/missionManager" element={<MissionManager />} />
      
      {/*}
        <Route path="/missions" element={<Missions />} />
        <Route path="/engagement" element={<Engagement />} />
        <Route path="/mandatement" element={<Mandatement />} />
        <Route path="/reports" element={<Reports />} />  
        <Route path="*" element={<NotFound />} />
      */}
    </Routes>
  );
};

export default RoutesList;
