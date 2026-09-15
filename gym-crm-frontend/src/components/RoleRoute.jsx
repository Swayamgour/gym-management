import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Wrap a route with an allowed-roles list; anyone else is bounced to a safe home.
const RoleRoute = ({ roles }) => {
  const { role } = useAuth();
  if (!roles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default RoleRoute;
