import { useAppSelector } from '../app/hooks';
import { selectCurrentUser } from '../features/auth/authSlice';

export const useAuth = () => {
  const user = useAppSelector(selectCurrentUser);
  return {
    user,
    isAuthenticated: Boolean(user),
    role: user?.role,
    isOwner: user?.role === 'owner',
    isManager: user?.role === 'manager',
    isTrainer: user?.role === 'trainer',
    isReceptionist: user?.role === 'receptionist',
    canManage: user?.role === 'owner' || user?.role === 'manager'
  };
};
