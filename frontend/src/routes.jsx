// routes.jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Budget from './pages/Budget';
import Missions from './pages/Missions';
import Engagement from './pages/Engagement';
import Mandatement from './pages/Mandatement';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

const RoutesList = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/budget" element={<Budget />} />
      <Route path="/missions" element={<Missions />} />
      <Route path="/engagement" element={<Engagement />} />
      <Route path="/mandatement" element={<Mandatement />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesList;
