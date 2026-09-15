import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import AppLayout from './components/layout/AppLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberDetail from './pages/MemberDetail';
import Packages from './pages/Packages';
import Memberships from './pages/Memberships';
import Attendance from './pages/Attendance';
import Trainers from './pages/Trainers';
import TrainerDashboard from './pages/TrainerDashboard';
import Payments from './pages/Payments';
import Leads from './pages/Leads';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Staff from './pages/Staff';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Sends the person to the right "home" screen for their role once logged in.
const HomeRedirect = () => {
  const { isTrainer } = useAuth();
  return <Navigate to={isTrainer ? '/trainer-dashboard' : '/dashboard'} replace />;
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomeRedirect />} />

          <Route element={<RoleRoute roles={['owner', 'manager']} />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="reports" element={<Reports />} />
            <Route path="packages" element={<Packages />} />
            <Route path="trainers" element={<Trainers />} />
            <Route path="trainers/:trainerId" element={<TrainerDashboard />} />
            <Route path="staff" element={<Staff />} />
          </Route>

          <Route element={<RoleRoute roles={['owner']} />}>
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route element={<RoleRoute roles={['trainer']} />}>
            <Route path="trainer-dashboard" element={<TrainerDashboard />} />
          </Route>

          <Route element={<RoleRoute roles={['owner', 'manager', 'receptionist']} />}>
            <Route path="memberships" element={<Memberships />} />
            <Route path="leads" element={<Leads />} />
          </Route>

          <Route element={<RoleRoute roles={['owner', 'manager', 'receptionist']} />}>
            <Route path="payments" element={<Payments />} />
          </Route>

          <Route path="members" element={<Members />} />
          <Route path="members/:id" element={<MemberDetail />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
